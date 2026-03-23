import React, { createContext, useContext, ReactNode } from 'react';
import { useSiteTexts } from './useSiteTexts';

interface SiteTextContextType {
  texts: Record<string, string>;
  isLoading: boolean;
  error: string | null;
  getText: (key: string) => string;
  refresh: () => Promise<void>;
}

const SiteTextContext = createContext<SiteTextContextType | null>(null);

interface SiteTextProviderProps {
  children: ReactNode;
}

export function SiteTextProvider({ children }: SiteTextProviderProps) {
  const value = useSiteTexts();
  return (
    <SiteTextContext.Provider value={value}>
      {children}
    </SiteTextContext.Provider>
  );
}

export function useSiteTextContext() {
  const context = useContext(SiteTextContext);
  if (!context) {
    throw new Error('useSiteTextContext must be used within SiteTextProvider');
  }
  return context;
}
