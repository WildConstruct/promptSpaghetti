/**
 * Platform-specific performance optimizations
 */

import React, { useEffect, useRef, useState, useCallback, memo } from 'react';
import { deviceDetector } from '../responsive/device-detection';

/**
 * Platform performance configuration
 */
export const platformPerformanceConfig = {
  ios: {
    // iOS Safari optimizations
    usePassiveListeners: true,
    use3DTransforms: true, // Hardware acceleration
    useWillChange: true,
    useMomentumScrolling: true,
    maxImageSize: 2048, // Max texture size
    lazyLoadThreshold: '50px',
    useIntersectionObserver: true,
    debounceDelay: 16, // 60fps
    throttleDelay: 16,
    maxConcurrentAnimations: 3
  },
  
  android: {
    // Android Chrome optimizations
    usePassiveListeners: true,
    use3DTransforms: false, // Can cause issues on some devices
    useWillChange: false, // Performance issues on some devices
    useMomentumScrolling: false,
    maxImageSize: 1024, // Lower for older devices
    lazyLoadThreshold: '100px',
    useIntersectionObserver: true,
    debounceDelay: 32, // 30fps for lower-end devices
    throttleDelay: 32,
    maxConcurrentAnimations: 2
  },
  
  desktop: {
    // Desktop optimizations
    usePassiveListeners: true,
    use3DTransforms: true,
    useWillChange: true,
    useMomentumScrolling: false,
    maxImageSize: 4096,
    lazyLoadThreshold: '200px',
    useIntersectionObserver: true,
    debounceDelay: 8, // 120fps capable
    throttleDelay: 16,
    maxConcurrentAnimations: 5
  }
};

/**
 * Get platform-specific performance config
 */
export function getPlatformPerformanceConfig() {
  const platform = deviceDetector.getPlatform();
  const os = deviceDetector.getOS();
  
  if (platform === 'mobile') {
    return os === 'iOS' ? platformPerformanceConfig.ios : platformPerformanceConfig.android;
  }
  
  return platformPerformanceConfig.desktop;
}

/**
 * Platform-optimized image component
 */
export interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  lazy?: boolean;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

export const OptimizedImage = memo<OptimizedImageProps>(({
  src,
  alt,
  width,
  height,
  lazy = true,
  priority = false,
  onLoad,
  onError
}) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(!lazy || priority);
  const config = getPlatformPerformanceConfig();
  
  useEffect(() => {
    if (!lazy || priority || !config.useIntersectionObserver) {
      setIsInView(true);
      return;
    }
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: config.lazyLoadThreshold
      }
    );
    
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    
    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [lazy, priority, config]);
  
  // Platform-specific image optimization
  const getOptimizedSrc = () => {
    const maxSize = config.maxImageSize;
    
    // Add image service parameters based on platform
    if (src.includes('?')) {
      return `${src}&w=${width || maxSize}&q=${deviceDetector.getPlatform() === 'mobile' ? 75 : 90}`;
    }
    
    return src;
  };
  
  return (
    <div
      ref={imgRef}
      style={{
        position: 'relative',
        width: width || '100%',
        height: height || 'auto',
        backgroundColor: isLoaded ? 'transparent' : 'var(--color-skeleton)',
        overflow: 'hidden'
      }}
    >
      {isInView && (
        <img
          src={getOptimizedSrc()}
          alt={alt}
          width={width}
          height={height}
          loading={lazy && !priority ? 'lazy' : 'eager'}
          decoding={priority ? 'sync' : 'async'}
          onLoad={() => {
            setIsLoaded(true);
            onLoad?.();
          }}
          onError={onError}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease'
          }}
        />
      )}
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

/**
 * Platform-optimized scroll container
 */
export interface OptimizedScrollProps {
  children: React.ReactNode;
  onScroll?: (event: { scrollTop: number; scrollLeft: number }) => void;
  horizontal?: boolean;
  showScrollbar?: boolean;
}

export const OptimizedScroll: React.FC<OptimizedScrollProps> = ({
  children,
  onScroll,
  horizontal = false,
  showScrollbar = true
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const config = getPlatformPerformanceConfig();
  const platform = deviceDetector.getPlatform();
  const os = deviceDetector.getOS();
  
  // Debounced scroll handler
  const scrollTimer = useRef<NodeJS.Timeout>();
  const handleScroll = useCallback(() => {
    if (scrollTimer.current) {
      clearTimeout(scrollTimer.current);
    }
    
    scrollTimer.current = setTimeout(() => {
      if (scrollRef.current) {
        onScroll?.({
          scrollTop: scrollRef.current.scrollTop,
          scrollLeft: scrollRef.current.scrollLeft
        });
      }
    }, config.debounceDelay);
  }, [onScroll, config.debounceDelay]);
  
  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;
    
    // Platform-specific optimizations
    if (os === 'iOS' && config.useMomentumScrolling) {
      element.style.webkitOverflowScrolling = 'touch';
    }
    
    // Use passive listeners for better scroll performance
    if (config.usePassiveListeners) {
      element.addEventListener('scroll', handleScroll, { passive: true });
    } else {
      element.addEventListener('scroll', handleScroll);
    }
    
    return () => {
      element.removeEventListener('scroll', handleScroll);
      if (scrollTimer.current) {
        clearTimeout(scrollTimer.current);
      }
    };
  }, [handleScroll, config, os]);
  
  return (
    <div
      ref={scrollRef}
      className={`optimized-scroll ${platform} ${!showScrollbar ? 'hide-scrollbar' : ''}`}
      style={{
        overflow: horizontal ? 'auto hidden' : 'hidden auto',
        width: '100%',
        height: '100%',
        position: 'relative'
      }}
    >
      {children}
    </div>
  );
};

/**
 * Platform-optimized animation wrapper
 */
export interface OptimizedAnimationProps {
  children: React.ReactNode;
  type: 'slide' | 'fade' | 'scale' | 'rotate';
  duration?: number;
  delay?: number;
  trigger?: boolean;
}

export const OptimizedAnimation: React.FC<OptimizedAnimationProps> = ({
  children,
  type,
  duration = 300,
  delay = 0,
  trigger = true
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const config = getPlatformPerformanceConfig();
  const [isAnimating, setIsAnimating] = useState(false);
  
  useEffect(() => {
    if (!elementRef.current || !trigger) return;
    
    const element = elementRef.current;
    
    // Use hardware acceleration on supported platforms
    if (config.use3DTransforms) {
      element.style.transform = 'translateZ(0)';
    }
    
    // Use will-change for optimization
    if (config.useWillChange) {
      element.style.willChange = type === 'slide' ? 'transform' : 
                                type === 'fade' ? 'opacity' : 
                                type === 'scale' ? 'transform' : 'transform';
    }
    
    // Start animation
    setIsAnimating(true);
    
    const animationTimer = setTimeout(() => {
      setIsAnimating(false);
      
      // Clean up will-change
      if (config.useWillChange) {
        element.style.willChange = 'auto';
      }
    }, duration + delay);
    
    return () => {
      clearTimeout(animationTimer);
    };
  }, [trigger, type, duration, delay, config]);
  
  const getAnimationStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      transition: `all ${duration}ms ease`,
      transitionDelay: `${delay}ms`
    };
    
    if (!trigger || !isAnimating) {
      return baseStyles;
    }
    
    switch (type) {
      case 'slide':
        return {
          ...baseStyles,
          transform: config.use3DTransforms ? 'translate3d(0, 0, 0)' : 'translateY(0)',
          opacity: 1
        };
      case 'fade':
        return {
          ...baseStyles,
          opacity: 1
        };
      case 'scale':
        return {
          ...baseStyles,
          transform: config.use3DTransforms ? 'scale3d(1, 1, 1)' : 'scale(1)',
          opacity: 1
        };
      case 'rotate':
        return {
          ...baseStyles,
          transform: config.use3DTransforms ? 'rotate3d(0, 0, 1, 0deg)' : 'rotate(0deg)',
          opacity: 1
        };
      default:
        return baseStyles;
    }
  };
  
  return (
    <div
      ref={elementRef}
      style={getAnimationStyles()}
    >
      {children}
    </div>
  );
};

/**
 * Platform-specific render optimization hook
 */
export function usePlatformOptimization() {
  const config = getPlatformPerformanceConfig();
  const platform = deviceDetector.getPlatform();
  
  // Debounce hook
  const debounce = useCallback((func: Function, wait?: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait || config.debounceDelay);
    };
  }, [config.debounceDelay]);
  
  // Throttle hook
  const throttle = useCallback((func: Function, wait?: number) => {
    let lastCall = 0;
    return (...args: any[]) => {
      const now = Date.now();
      if (now - lastCall >= (wait || config.throttleDelay)) {
        lastCall = now;
        func(...args);
      }
    };
  }, [config.throttleDelay]);
  
  // Request animation frame hook
  const rafCallback = useCallback((callback: Function) => {
    let rafId: number;
    
    const animate = () => {
      callback();
      rafId = requestAnimationFrame(animate);
    };
    
    rafId = requestAnimationFrame(animate);
    
    return () => cancelAnimationFrame(rafId);
  }, []);
  
  return {
    config,
    platform,
    debounce,
    throttle,
    rafCallback
  };
}

/**
 * Platform optimization styles
 */
export const platformOptimizationStyles = `
  /* Hide scrollbars on mobile */
  .optimized-scroll.mobile.hide-scrollbar {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  
  .optimized-scroll.mobile.hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
  
  /* iOS momentum scrolling */
  .optimized-scroll.ios {
    -webkit-overflow-scrolling: touch;
  }
  
  /* Hardware acceleration for animations */
  .hardware-accelerated {
    transform: translateZ(0);
    will-change: transform;
  }
  
  /* Reduce motion for accessibility */
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
  
  /* Platform-specific font rendering */
  .ios {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  .android {
    text-rendering: optimizeLegibility;
  }
  
  .desktop {
    -webkit-font-smoothing: subpixel-antialiased;
    -moz-osx-font-smoothing: auto;
  }
  
  /* Optimize touch targets on mobile */
  @media (pointer: coarse) {
    button, a, input, select, textarea {
      min-height: 44px;
      min-width: 44px;
    }
  }
`;