import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface SwipeBannerProps {
  onNavigate: (page: string) => void;
}

export function SwipeBanner({ onNavigate }: SwipeBannerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const banners = [
    {
      id: 1,
      title: '다트비의 밤',
      description: '학술적 교류를 넘어 진정한 공동체 문화를 만들어갑니다',
      image: 'https://images.unsplash.com/photo-1641385988508-460767e2b71a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXJ0eSUyMGNlbGVicmF0aW9uJTIwbmlnaHQlMjBldmVudHxlbnwxfHx8fDE3NTk1NzY4MzR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      page: 'networking'
    },
    {
      id: 2,
      title: 'DArt-B Webzine',
      description: '다트비의 학술활동을 담은 웹진',
      image: 'https://images.unsplash.com/photo-1710799885122-428e63eff691?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWIlMjBtYWdhemluZSUyMGRlc2lnbnxlbnwxfHx8fDE3NTk1NzUyNjd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      page: 'webzin'
    },
    {
      id: 3,
      title: 'DArt-B DATA-THON',
      description: '다트비의 데이터톤을 소개한 기록',
      image: 'https://images.unsplash.com/photo-1610563166150-b34df4f3bcd6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXRhJTIwaGFja2F0aG9uJTIwY29tcGV0aXRpb258ZW58MXx8fHwxNzU5NTc1MjcxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      page: 'data-thon'
    }
  ];

  const handlePageChange = (direction: 'next' | 'prev') => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    
    if (direction === 'next') {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    } else {
      setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
    }
    
    setTimeout(() => setIsTransitioning(false), 800);
  };

  const getPageStyle = (index: number) => {
    const diff = index - currentSlide;
    
    const baseStyle = {
      position: 'absolute' as const,
      top: '50%',
      width: '700px',
      height: '450px',
      transformOrigin: 'center center',
      transition: 'all 0.8s cubic-bezier(0.4, 0.0, 0.2, 1)',
      border: '3px solid #e5e7eb',
      borderRadius: '12px',
      overflow: 'hidden',
      cursor: 'pointer',
    };

    if (diff === 0) {
      // Current page (center)
      return {
        ...baseStyle,
        left: '50%',
        transform: 'translateX(-50%) translateY(-50%) scale(1)',
        zIndex: 3,
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
        filter: 'grayscale(0%) brightness(1)',
      };
    } else if (diff === 1 || diff === -2) {
      // Next page (right) - handle circular navigation
      return {
        ...baseStyle,
        left: '72%',
        transform: 'translateX(-50%) translateY(-50%) scale(0.8)',
        zIndex: 2,
        boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
        filter: 'grayscale(60%) brightness(0.8)',
      };
    } else if (diff === -1 || diff === 2) {
      // Previous page (left) - handle circular navigation
      return {
        ...baseStyle,
        left: '28%',
        transform: 'translateX(-50%) translateY(-50%) scale(0.8)',
        zIndex: 2,
        boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
        filter: 'grayscale(60%) brightness(0.8)',
      };
    } else {
      // Hidden pages
      return {
        ...baseStyle,
        display: 'none',
      };
    }
  };

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-[#0B2447] mb-4">DArt-B 활동 소개</h2>
          <p className="text-lg text-gray-600">데이터 분석 학회의 다양한 활동들을 확인해보세요</p>
        </div>
        
        <div className="relative h-[600px] overflow-hidden">
          {/* Cards Container */}
          <div className="relative w-full h-full">
            {banners.map((banner, index) => {
              const diff = index - currentSlide;
              const isClickable = Math.abs(diff) <= 1 || Math.abs(diff) === 2;
              
              return (
                <div
                  key={banner.id}
                  className="group"
                  style={getPageStyle(index)}
                  onClick={() => {
                    if (diff === 0) {
                      onNavigate(banner.page);
                    } else if (diff === 1 || diff === -2) {
                      handlePageChange('next');
                    } else if (diff === -1 || diff === 2) {
                      handlePageChange('prev');
                    }
                  }}
                >
                  {/* Card Content */}
                  <div className="relative w-full h-full bg-white">
                    <ImageWithFallback
                      src={banner.image}
                      alt={banner.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/10 to-blue-900/40" />
                    
                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <h3 className={`font-bold mb-2 transition-all duration-300 ${
                        diff === 0 
                          ? 'text-xl group-hover:text-yellow-300' 
                          : 'text-lg text-gray-200'
                      }`}>
                        {banner.title}
                      </h3>
                      <p className={`opacity-90 leading-relaxed transition-all duration-300 ${
                        diff === 0 ? 'text-sm' : 'text-xs'
                      }`}>
                        {banner.description}
                      </p>
                    </div>
                    
                    {/* Selection indicator for center card */}
                    {diff === 0 && (
                      <div className="absolute top-4 right-4 w-3 h-3 bg-yellow-400 rounded-full shadow-lg animate-pulse" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={() => handlePageChange('prev')}
            disabled={isTransitioning}
            className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white/95 hover:bg-white disabled:opacity-50 rounded-full p-3 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110 z-10"
          >
            <ChevronLeft className="w-5 h-5 text-[#0B2447]" />
          </button>
          <button
            onClick={() => handlePageChange('next')}
            disabled={isTransitioning}
            className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white/95 hover:bg-white disabled:opacity-50 rounded-full p-3 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110 z-10"
          >
            <ChevronRight className="w-5 h-5 text-[#0B2447]" />
          </button>

          {/* Page Indicators */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-10">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  if (!isTransitioning) {
                    setIsTransitioning(true);
                    setCurrentSlide(index);
                    setTimeout(() => setIsTransitioning(false), 800);
                  }
                }}
                disabled={isTransitioning}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? 'bg-[#0B2447] scale-125 shadow-lg' 
                    : 'bg-gray-400 hover:bg-gray-600 hover:scale-110'
                }`}
              />
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}