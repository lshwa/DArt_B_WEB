import React from 'react';

interface PageBannerProps {
  title: string;
  backgroundImage?: string;
}

export function PageBanner({ title, backgroundImage }: PageBannerProps) {
  return (
    <div className="relative pt-20 h-80 bg-white flex items-center justify-center border-b border-gray-200">
      {/* Content */}
      <div className="relative z-10 text-center">
        <h1 className="text-4xl font-bold text-[#0B2447]">{title}</h1>
      </div>
    </div>
  );
}