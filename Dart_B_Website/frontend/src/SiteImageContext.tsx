import React, { createContext, useContext, ReactNode } from 'react';
import { useSiteImages } from './useSiteImages';
import { SiteImageMap } from './api';

interface SiteImageContextType {
  images: SiteImageMap;
  isLoading: boolean;
  error: string | null;
  getImage: (key: string) => string;
  refresh: () => Promise<void>;
}

const SiteImageContext = createContext<SiteImageContextType | null>(null);

interface SiteImageProviderProps {
  children: ReactNode;
}

export function SiteImageProvider({ children }: SiteImageProviderProps) {
  const value = useSiteImages();
  return (
    <SiteImageContext.Provider value={value}>
      {children}
    </SiteImageContext.Provider>
  );
}

export function useSiteImageContext() {
  const context = useContext(SiteImageContext);
  if (!context) {
    throw new Error('useSiteImageContext must be used within SiteImageProvider');
  }
  return context;
}
