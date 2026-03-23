import { useState, useEffect, useCallback } from 'react';
import { settingsApi } from './api';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface DatathonEntry {
  id: string;           // unique string id (e.g. uuid or timestamp)
  title: string;
  date: string;
  description: string;
  imageKey: string;     // site_image key (e.g. 'datathon.angnal')
  latest: boolean;
  participants?: string;
  achievement?: string;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────
export const DEFAULT_DATATHONS: DatathonEntry[] = [
  {
    id: '1',
    title: '앵날다쏘 (중앙대 DArt-B x 서강대 Parrot)',
    date: '2024.11',
    description: '중앙대학교 DArt-B와 서강대학교 Parrot이 함께하는 연합 해커톤으로, 실제 기업 데이터를 활용한 과제를 해결합니다.',
    imageKey: 'datathon.angnal',
    latest: true,
    participants: '15개 팀',
    achievement: 'DArt-B 팀 성과: 우수상 수상',
  },
  {
    id: '2',
    title: '아러다 (중앙대 DArt-B x 중앙대 CUAI)',
    date: '2024.08',
    description: '중앙대학교 데이터 분석 학회 DArt-B와 인공지능 학회 CUAI가 진행하는 해커톤으로, 데이터 분석과 AI 기술의 융합을 경험합니다.',
    imageKey: 'datathon.aruda',
    latest: false,
    participants: '15개 팀',
    achievement: 'DArt-B 팀 성과: 우수상 수상',
  },
  {
    id: '3',
    title: '쿠쿠다트 (중앙대 DArt-B x 경희대 KHUDA)',
    date: '2024.05',
    description: '중앙대학교와 경희대학교의 데이터톤으로, 두 대학의 데이터 분석 학회가 함께하여 다양한 분야의 데이터 분석 경험을 제공합니다.',
    imageKey: 'datathon.kukudart',
    latest: false,
    participants: '15개 팀',
    achievement: 'DArt-B 팀 성과: 우수상 수상',
  },
];

const SETTING_KEY = 'datathon.entries';
const CACHE_KEY = 'datathon_entries_cache';
const CACHE_TTL = 5 * 60 * 1000;

interface CachedData { entries: DatathonEntry[]; timestamp: number; }

const loadFromCache = (): DatathonEntry[] | null => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      const { entries, timestamp }: CachedData = JSON.parse(raw);
      if (Date.now() - timestamp < CACHE_TTL) return entries;
    }
  } catch { /* ignore */ }
  return null;
};

const saveToCache = (entries: DatathonEntry[]) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ entries, timestamp: Date.now() }));
  } catch { /* ignore */ }
};

export const invalidateDatathonCache = () => localStorage.removeItem(CACHE_KEY);

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useDatathons() {
  const [entries, setEntries] = useState<DatathonEntry[]>(DEFAULT_DATATHONS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (useCache = true) => {
    setIsLoading(true);
    setError(null);
    try {
      if (useCache) {
        const cached = loadFromCache();
        if (cached) { setEntries(cached); setIsLoading(false); return; }
      }
      const res = await settingsApi.getSetting(SETTING_KEY);
      if (res.data?.value) {
        const parsed: DatathonEntry[] = JSON.parse(res.data.value);
        setEntries(parsed);
        saveToCache(parsed);
      } else {
        // Not in DB yet — use defaults (will be seeded on backend restart)
        setEntries(DEFAULT_DATATHONS);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const refresh = useCallback(async () => {
    invalidateDatathonCache();
    await load(false);
  }, [load]);

  /** Persist updated entries list to backend */
  const save = useCallback(async (updated: DatathonEntry[]): Promise<string | null> => {
    const res = await settingsApi.updateSetting(SETTING_KEY, JSON.stringify(updated));
    if (res.error) return res.error;
    setEntries(updated);
    saveToCache(updated);
    return null;
  }, []);

  return { entries, isLoading, error, refresh, save };
}
