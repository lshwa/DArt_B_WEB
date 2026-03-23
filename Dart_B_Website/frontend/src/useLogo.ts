import { useState, useEffect } from 'react';
import { settingsApi, getImageUrl } from './api';

const DEFAULT_LOGO = '/assets/images/logo-white.png';

export function useLogo() {
  const [logoUrl, setLogoUrl] = useState<string>(DEFAULT_LOGO);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLogo();
  }, []);

  const loadLogo = async () => {
    try {
      const response = await settingsApi.getSetting('logo_white');
      if (response.data) {
        const url = response.data.value;
        // 업로드된 로고인 경우 전체 URL로 변환
        setLogoUrl(url.startsWith('/uploads/') ? getImageUrl(url) : url);
      }
    } catch (error) {
      console.error('Failed to load logo:', error);
      // 기본 로고 사용
      setLogoUrl(DEFAULT_LOGO);
    } finally {
      setIsLoading(false);
    }
  };

  return { logoUrl, isLoading, refreshLogo: loadLogo };
}

