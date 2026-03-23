import { useState, useCallback, useEffect } from 'react';
import { settingsApi } from './api';

// ─── Generic item (each list stores items as JSON in a Setting key) ───────────
export interface DynamicItem {
  id: string;
  [key: string]: string | boolean | number | undefined;
}

const CACHE_PREFIX = 'dynamic_list_';
const CACHE_TTL = 5 * 60 * 1000;

const loadFromCache = <T>(key: string): T[] | null => {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (raw) {
      const { items, timestamp } = JSON.parse(raw);
      if (Date.now() - timestamp < CACHE_TTL) return items as T[];
    }
  } catch { /* ignore */ }
  return null;
};

const saveToCache = <T>(key: string, items: T[]) => {
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ items, timestamp: Date.now() }));
  } catch { /* ignore */ }
};

export const invalidateDynamicListCache = (key: string) =>
  localStorage.removeItem(CACHE_PREFIX + key);

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useDynamicList<T extends DynamicItem>(
  settingKey: string,
  defaults: T[],
) {
  const [items, setItems] = useState<T[]>(defaults);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (useCache = true) => {
    setIsLoading(true);
    setError(null);
    try {
      if (useCache) {
        const cached = loadFromCache<T>(settingKey);
        if (cached) { setItems(cached); setIsLoading(false); return; }
      }
      const res = await settingsApi.getSetting(settingKey);
      if (res.data?.value) {
        const parsed: T[] = JSON.parse(res.data.value);
        setItems(parsed);
        saveToCache(settingKey, parsed);
      } else {
        setItems(defaults);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [settingKey]); // eslint-disable-line

  useEffect(() => { load(); }, [load]);

  const refresh = useCallback(async () => {
    invalidateDynamicListCache(settingKey);
    await load(false);
  }, [settingKey, load]);

  const save = useCallback(async (updated: T[]): Promise<string | null> => {
    const res = await settingsApi.updateSetting(settingKey, JSON.stringify(updated));
    if (res.error) return res.error;
    setItems(updated);
    saveToCache(settingKey, updated);
    return null;
  }, [settingKey]);

  return { items, isLoading, error, refresh, save };
}
