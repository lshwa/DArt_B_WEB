import { useState, useEffect, useCallback } from 'react';
import { siteImagesApi, SiteImageMap, getImageUrl } from './api';

// 기본 이미지 맵 (폴백용) - Unsplash 이미지
const DEFAULT_IMAGES: Record<string, string> = {
  'home.hero.background': 'https://images.unsplash.com/photo-1702737832079-ed5864397f92?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3MDQ3MTF8MHwxfHNlYXJjaHw4fHx1bml2ZXJzaXR5JTIwY2FtcHVzfGVufDB8fHx8MTczMjc1NzIzNnww&ixlib=rb-4.0.3&q=85',
  'home.curriculum.session': 'https://images.unsplash.com/photo-1758691736764-2a88e313b1f2?w=600&auto=format&fit=crop&q=60',
  'home.curriculum.project': 'https://images.unsplash.com/photo-1758691736804-4e88c52ad58b?w=600&auto=format&fit=crop&q=60',
  'networking.event': 'https://images.unsplash.com/photo-1702737832079-ed5864397f92?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3MDQ3MTF8MHwxfHNlYXJjaHw4fHx1bml2ZXJzaXR5JTIwY2FtcHVzfGVufDB8fHx8MTczMjc1NzIzNnww&ixlib=rb-4.0.3&q=85',
  'networking.activity': 'https://images.unsplash.com/photo-1758691736764-2a88e313b1f2?w=600&auto=format&fit=crop&q=60',
  'networking.group': 'https://images.unsplash.com/photo-1758691736804-4e88c52ad58b?w=600&auto=format&fit=crop&q=60',
  'datathon.angnal': 'https://images.unsplash.com/photo-1758691736804-4e88c52ad58b?w=600&auto=format&fit=crop&q=60',
  'datathon.aruda': 'https://images.unsplash.com/photo-1758691736764-2a88e313b1f2?w=600&auto=format&fit=crop&q=60',
  'datathon.kukudart': 'https://images.unsplash.com/photo-1587116987928-21e47bd76cd2?w=600&auto=format&fit=crop&q=60',
  'curriculum.assignment': 'https://images.unsplash.com/photo-1589380905297-abf6a0a8e450?w=600&auto=format&fit=crop&q=60',
  'curriculum.study': 'https://images.unsplash.com/photo-1538688423619-a81d3f23454b?w=600&auto=format&fit=crop&q=60',
};

// 캐시 관련 상수
const CACHE_KEY = 'site_images_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5분

interface CachedData {
  images: SiteImageMap;
  timestamp: number;
}

// 캐시에서 로드
const loadFromCache = (): SiteImageMap | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { images, timestamp }: CachedData = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TTL) {
        return images;
      }
    }
  } catch (e) {
    console.error('Site image cache load error:', e);
  }
  return null;
};

// 캐시에 저장
const saveToCache = (images: SiteImageMap) => {
  try {
    const data: CachedData = { images, timestamp: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Site image cache save error:', e);
  }
};

// 캐시 무효화 (이미지 업데이트 후 호출)
export const invalidateSiteImageCache = () => {
  localStorage.removeItem(CACHE_KEY);
};

export function useSiteImages() {
  const [images, setImages] = useState<SiteImageMap>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadImages = useCallback(async (useCache = true) => {
    try {
      setIsLoading(true);
      setError(null);

      // 캐시 확인
      if (useCache) {
        const cached = loadFromCache();
        if (cached) {
          setImages(cached);
          setIsLoading(false);
          return;
        }
      }

      // API 호출
      const response = await siteImagesApi.getAll();
      if (response.data) {
        setImages(response.data);
        saveToCache(response.data);
      } else {
        setError(response.error || 'Failed to load images');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  // 이미지 URL 가져오기 (폴백 지원)
  const getImage = useCallback((key: string): string => {
    const image = images[key];
    if (image?.url) {
      // 상대 경로면 전체 URL로 변환
      return image.url.startsWith('/uploads/')
        ? getImageUrl(image.url)
        : image.url;
    }
    // 폴백: 기본 이미지
    return DEFAULT_IMAGES[key] || '';
  }, [images]);

  // 강제 새로고침 (캐시 무시)
  const refresh = useCallback(async () => {
    invalidateSiteImageCache();
    await loadImages(false);
  }, [loadImages]);

  return {
    images,
    isLoading,
    error,
    getImage,
    refresh,
  };
}
