import React from 'react';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface PageBannerProps {
  title: string;
  backgroundImage?: string;
}

export function PageBanner({ title, backgroundImage }: PageBannerProps) {
  const defaultImage = "https://images.unsplash.com/photo-1702737832079-ed5864397f92?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwY2FtcHVzJTIwa29yZWF8ZW58MXx8fHwxNzU5NTcyOTY1fDA&ixlib=rb-4.1.0&q=80&w=1080";
  
  return (
    <div className="relative pt-20 h-80 bg-[#0B2447] flex items-center justify-center">
      {/* Background Image */}
      <div className="absolute inset-0 opacity-30">
        <ImageWithFallback
          src={backgroundImage || defaultImage}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10 text-center">
        <h1 className="text-4xl font-bold text-white">{title}</h1>
      </div>
    </div>
  );
}