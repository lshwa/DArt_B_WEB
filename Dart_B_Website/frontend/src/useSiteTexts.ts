import { useState, useEffect, useCallback } from 'react';
import { settingsApi } from './api';

// ─── Default text values (fallback when DB has no entry yet) ───────────────
export const DEFAULT_TEXTS: Record<string, string> = {
  // Home banner
  'home.hero.title': 'DArt-B',
  'home.hero.subtitle': 'Data Analysis road to Business',
  'home.hero.description':
    'A community for data-driven insights and decision-making in a dynamic and diversified business environment',

  // About Us
  'about.intro':
    'DArt-B는 다변화된 비즈니스 환경에서 데이터에 기반하여 INSIGHT를 도출하고 의사결정을 하고자 하는 사람들의 모임입니다.',
  'about.body1':
    'DArt-B(Data Analysis road to Business)는 중앙대학교 경영학부에서 활동하는 데이터 분석 학회입니다.',
  'about.body2':
    '우리는 데이터를 통해 비즈니스 인사이트를 도출하고, 실무에 적용할 수 있는 역량을 기르는 것을 목표로 합니다. 이론과 실습을 균형있게 배우며, 다양한 프로젝트와 대회 참여를 통해 실전 경험을 쌓아갑니다.',
  'about.body3':
    '매 학기 정규 세션, 스터디, 프로젝트, 그리고 네트워킹 이벤트를 통해 학회원들이 함께 성장할 수 있는 환경을 만들어가고 있습니다.',

  // Preface
  'preface.heading': '안녕하세요, DArt-B 지도교수\n중앙대학교 경영학과 서용원 교수입니다.',
  'preface.body1':
    '데이터 분석은 이제 모든 분야에서 필수적인 역량이 되었습니다. 특히 비즈니스 환경에서는 데이터를 통해 인사이트를 발견하고, 이를 바탕으로 전략적 의사결정을 내리는 능력이 무엇보다 중요합니다.',
  'preface.body2':
    'DArt-B는 단순히 데이터 분석 기법을 배우는 것을 넘어서, 비즈니스 맥락에서 데이터를 이해하고 활용할 수 있는 실무진을 양성하는 것을 목표로 합니다. 이론과 실습을 균형있게 배우며, 실제 프로젝트를 통해 경험을 쌓아가는 과정에서 여러분들이 데이터 분석 전문가로 성장할 수 있을 것입니다.',
  'preface.body3':
    '학회 활동을 통해 동료들과 함께 배우고 성장하며, 데이터 분석에 대한 열정을 키워나가시기 바랍니다. 앞으로의 여정에서 큰 성과를 거두시길 응원합니다.',

  // Networking
  'networking.title': 'DArt-B의 밤',
  'networking.intro':
    '학회원들 간의 친목을 도모하고 네트워킹을 강화하는 DArt-B만의 특별한 이벤트입니다. 학술적 교류를 넘어 진정한 공동체 문화를 만들어갑니다.',
  'networking.section1.title': '따뜻한 만남의 시간',
  'networking.section1.body':
    'DArt-B의 밤은 학기마다 개최되는 네트워킹 이벤트로, 학회원들이 학업과 프로젝트를 넘어 개인적인 관계를 형성할 수 있는 소중한 시간입니다. 편안한 분위기에서 선배와 후배, 동기들과 깊이 있는 대화를 나누며 진정한 공동체를 만들어갑니다.',
  'networking.section2.title': '다양한 활동과 교류',
  'networking.section2.body':
    '다양한 게임과 활동을 통해 서로를 더 잘 알아가는 시간을 가집니다. 팀 빌딩 활동, 퀴즈 대회, 토크 세션 등을 통해 자연스럽게 소통하며, 학회 생활에서 얻기 힘든 특별한 추억을 만들어갑니다.',
  'networking.section3.title': '지속적인 유대 관계',
  'networking.section3.body':
    'DArt-B의 밤을 통해 형성된 인맥과 관계는 학회 활동을 넘어 평생의 자산이 됩니다. 데이터 분석이라는 공통 관심사를 가진 동료들과의 깊은 유대는 향후 커리어에도 큰 도움이 되며, 서로의 성장을 응원하는 든든한 네트워크가 됩니다.',
  'networking.highlight.title': '6기부터 시작된 새로운 전통',
  'networking.highlight.body':
    'DArt-B의 밤은 6기 운영진이 기획하고 시작한 특별한 이벤트입니다. 학회의 새로운 전통으로 자리잡으며, 앞으로도 계속해서 발전시켜 나갈 예정입니다.',

  // Recruiting (process overview texts stay; individual FAQs moved to dynamic list)
  'recruiting.process.title': 'PROCESS OVERVIEW',
};

// ─── Cache helpers ────────────────────────────────────────────────────────────
const CACHE_KEY = 'site_texts_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CachedTexts {
  texts: Record<string, string>;
  timestamp: number;
}

const loadFromCache = (): Record<string, string> | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { texts, timestamp }: CachedTexts = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TTL) return texts;
    }
  } catch (e) {
    console.error('Site text cache load error:', e);
  }
  return null;
};

const saveToCache = (texts: Record<string, string>) => {
  try {
    const data: CachedTexts = { texts, timestamp: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Site text cache save error:', e);
  }
};

export const invalidateSiteTextCache = () => {
  localStorage.removeItem(CACHE_KEY);
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useSiteTexts() {
  const [texts, setTexts] = useState<Record<string, string>>(DEFAULT_TEXTS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTexts = useCallback(async (useCache = true) => {
    try {
      setIsLoading(true);
      setError(null);

      if (useCache) {
        const cached = loadFromCache();
        if (cached) {
          setTexts({ ...DEFAULT_TEXTS, ...cached });
          setIsLoading(false);
          return;
        }
      }

      // Fetch all text keys from the backend in parallel
      const keys = Object.keys(DEFAULT_TEXTS);
      const results = await Promise.allSettled(
        keys.map((key) => settingsApi.getSetting(`site_text.${key}`)),
      );

      const fetched: Record<string, string> = {};
      results.forEach((result, idx) => {
        if (result.status === 'fulfilled' && result.value.data) {
          fetched[keys[idx]] = result.value.data.value;
        }
      });

      const merged = { ...DEFAULT_TEXTS, ...fetched };
      setTexts(merged);
      saveToCache(fetched); // only save what came from the server
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTexts();
  }, [loadTexts]);

  /** Get a text value by short key (e.g. 'home.hero.title') */
  const getText = useCallback(
    (key: string): string => texts[key] ?? DEFAULT_TEXTS[key] ?? '',
    [texts],
  );

  const refresh = useCallback(async () => {
    invalidateSiteTextCache();
    await loadTexts(false);
  }, [loadTexts]);

  return { texts, isLoading, error, getText, refresh };
}
