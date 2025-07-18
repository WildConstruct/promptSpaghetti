/**
 * Responsive design hook
 */

import { useState, useEffect } from 'react';
import { getBreakpoint, getViewportSize } from '../platform';

export interface ResponsiveState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  breakpoint: 'mobile' | 'tablet' | 'desktop';
  width: number;
  height: number;
}

export function useResponsive(): ResponsiveState {
  const [responsiveState, setResponsiveState] = useState<ResponsiveState>(() => {
    const { width, height } = getViewportSize();
    const breakpoint = getBreakpoint(width);
    
    return {
      isMobile: breakpoint === 'mobile',
      isTablet: breakpoint === 'tablet',
      isDesktop: breakpoint === 'desktop',
      breakpoint,
      width,
      height
    };
  });

  useEffect(() => {
    const updateResponsiveState = () => {
      const { width, height } = getViewportSize();
      const breakpoint = getBreakpoint(width);
      
      setResponsiveState({
        isMobile: breakpoint === 'mobile',
        isTablet: breakpoint === 'tablet',
        isDesktop: breakpoint === 'desktop',
        breakpoint,
        width,
        height
      });
    };

    // Update on window resize
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', updateResponsiveState);
      
      // Also listen for orientation change on mobile
      window.addEventListener('orientationchange', () => {
        // Small delay to allow viewport to update
        setTimeout(updateResponsiveState, 100);
      });

      return () => {
        window.removeEventListener('resize', updateResponsiveState);
        window.removeEventListener('orientationchange', updateResponsiveState);
      };
    }
  }, []);

  return responsiveState;
}

// Hook for specific breakpoint queries
export function useBreakpoint(breakpoint: 'mobile' | 'tablet' | 'desktop'): boolean {
  const { breakpoint: currentBreakpoint } = useResponsive();
  return currentBreakpoint === breakpoint;
}

// Hook for media queries
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    const updateMatches = () => setMatches(mediaQuery.matches);
    
    updateMatches();
    mediaQuery.addEventListener('change', updateMatches);

    return () => mediaQuery.removeEventListener('change', updateMatches);
  }, [query]);

  return matches;
}