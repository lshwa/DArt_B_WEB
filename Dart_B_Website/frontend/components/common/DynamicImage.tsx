import React from 'react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { useSiteImageContext } from '../../src/SiteImageContext';

interface DynamicImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  /** 이미지 키 (예: home.hero.background) */
  imageKey: string;
  /** 폴백 이미지 URL (선택) */
  fallback?: string;
}

/**
 * 동적 이미지 컴포넌트
 * - imageKey를 통해 사이트 이미지 맵에서 URL을 가져옴
 * - Admin에서 업로드한 이미지가 있으면 해당 이미지 표시
 * - 없으면 fallback 또는 기본 이미지 표시
 */
export function DynamicImage({ imageKey, fallback, alt, className, style, ...rest }: DynamicImageProps) {
  const { getImage, isLoading } = useSiteImageContext();

  const src = getImage(imageKey) || fallback || '';

  // 로딩 중일 때 스켈레톤 표시
  if (isLoading && !src) {
    return (
      <div
        className={`bg-gray-200 animate-pulse ${className || ''}`}
        style={style}
      />
    );
  }

  return (
    <ImageWithFallback
      src={src}
      alt={alt || imageKey}
      className={className}
      style={style}
      {...rest}
    />
  );
}
