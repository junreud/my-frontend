'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import ReactGA from 'react-ga4';

interface AnalyticsContextType {
  trackEvent: (action: string, category: string, label?: string) => void;
  trackPageView: (page: string) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ children }) => {
  useEffect(() => {
    // Google Analytics 초기화
    if (process.env.NEXT_PUBLIC_GA_ID) {
      ReactGA.initialize(process.env.NEXT_PUBLIC_GA_ID);
    }
  }, []);

  const trackEvent = (action: string, category: string, label?: string) => {
    if (process.env.NEXT_PUBLIC_GA_ID) {
      ReactGA.event({
        action,
        category,
        label,
      });
    }
  };

  const trackPageView = (page: string) => {
    if (process.env.NEXT_PUBLIC_GA_ID) {
      ReactGA.send({ hitType: 'pageview', page });
    }
  };

  return (
    <AnalyticsContext.Provider value={{ trackEvent, trackPageView }}>
      {children}
      <Analytics />
      <SpeedInsights />
    </AnalyticsContext.Provider>
  );
};