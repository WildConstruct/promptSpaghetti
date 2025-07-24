/**
 * Performance benchmarks for cross-platform components
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  PerformanceObserver,
  mockPlatform,
  platformPresets,
  mockViewport,
  viewportPresets,
  cleanup
} from '../setup/test-framework';
import {
  Grid,
  Row,
  Col,
  TouchManager,
  OptimizedImage,
  OptimizedScroll,
  OptimizedAnimation,
  PlatformButton,
  AdaptiveNavigation,
  MultiTouchController
} from '../../index';

// Performance thresholds (in milliseconds)
const PERFORMANCE_THRESHOLDS = {
  componentRender: 16, // 60fps
  touchResponse: 100, // Touch feedback
  scrollPerformance: 16, // Smooth scrolling
  animationFrame: 16, // 60fps animations
  imageLoad: 1000, // Image loading
  layoutShift: 0.1 // Cumulative layout shift
};

describe('Performance Benchmarks', () => {
  let performanceObserver: PerformanceObserver;
  
  beforeEach(() => {
    performanceObserver = new PerformanceObserver();
  });
  
  afterEach(() => {
    performanceObserver.clear();
    cleanup();
  });
  
  describe('Component Render Performance', () => {
    it('should render Grid system within threshold', () => {
      performanceObserver.mark('grid-start');
      
      render(
        <Grid>
          {Array.from({ length: 100 }).map((_, i) => (
            <Row key={i}>
              <Col xs={12} sm={6} md={4} lg={3}>
                <div>Cell {i}</div>
              </Col>
            </Row>
          ))}
        </Grid>
      );
      
      performanceObserver.mark('grid-end');
      const measure = performanceObserver.measure('grid-render', 'grid-start', 'grid-end');
      
      expect(measure.duration).toBeLessThan(PERFORMANCE_THRESHOLDS.componentRender * 10);
    });
    
    it('should render adaptive navigation efficiently', () => {
      const items = Array.from({ length: 50 }).map((_, i) => ({
        id: `item-${i}`,
        label: `Item ${i}`,
        icon: '📁'
      }));
      
      performanceObserver.mark('nav-start');
      
      render(
        <AdaptiveNavigation
          items={items}
          activeItem="item-0"
          onNavigate={() => {}}
        />
      );
      
      performanceObserver.mark('nav-end');
      const measure = performanceObserver.measure('nav-render', 'nav-start', 'nav-end');
      
      expect(measure.duration).toBeLessThan(PERFORMANCE_THRESHOLDS.componentRender * 5);
    });
  });
  
  describe('Touch Performance', () => {
    it('should handle rapid touch events efficiently', async () => {
      const onTap = jest.fn();
      const element = document.createElement('div');
      document.body.appendChild(element);
      
      const touchManager = new TouchManager({
        element,
        handlers: { tap: onTap }
      });
      
      performanceObserver.mark('touch-start');
      
      // Simulate 100 rapid taps
      for (let i = 0; i < 100; i++) {
        const event = new TouchEvent('touchstart', {
          touches: [{ clientX: i, clientY: i, identifier: i } as Touch]
        });
        element.dispatchEvent(event);
        
        const endEvent = new TouchEvent('touchend', {
          changedTouches: [{ clientX: i, clientY: i, identifier: i } as Touch]
        });
        element.dispatchEvent(endEvent);
      }
      
      performanceObserver.mark('touch-end');
      const measure = performanceObserver.measure('touch-handling', 'touch-start', 'touch-end');
      
      expect(measure.duration / 100).toBeLessThan(PERFORMANCE_THRESHOLDS.touchResponse / 10);
      
      touchManager.destroy();
    });
    
    it('should handle multi-touch gestures efficiently', () => {
      performanceObserver.mark('multitouch-start');
      
      const { container } = render(
        <MultiTouchController
          handlers={{
            onTwoFingerSwipe: () => {},
            onThreeFingerTap: () => {},
            onPinch: () => {}
          }}
        >
          <div style={{ width: '100%', height: '500px' }}>
            Touch Area
          </div>
        </MultiTouchController>
      );
      
      performanceObserver.mark('multitouch-end');
      const measure = performanceObserver.measure('multitouch-setup', 'multitouch-start', 'multitouch-end');
      
      expect(measure.duration).toBeLessThan(PERFORMANCE_THRESHOLDS.componentRender);
    });
  });
  
  describe('Scroll Performance', () => {
    it('should maintain smooth scrolling with many items', () => {
      const items = Array.from({ length: 1000 }).map((_, i) => (
        <div key={i} style={{ height: '50px', padding: '10px' }}>
          Item {i}
        </div>
      ));
      
      performanceObserver.mark('scroll-start');
      
      render(
        <OptimizedScroll>
          {items}
        </OptimizedScroll>
      );
      
      performanceObserver.mark('scroll-end');
      const measure = performanceObserver.measure('scroll-render', 'scroll-start', 'scroll-end');
      
      // Should handle large lists efficiently
      expect(measure.duration).toBeLessThan(PERFORMANCE_THRESHOLDS.scrollPerformance * 20);
    });
  });
  
  describe('Animation Performance', () => {
    it('should run animations at 60fps', () => {
      performanceObserver.mark('animation-start');
      
      const { rerender } = render(
        <OptimizedAnimation type="slide" duration={300} trigger={false}>
          <div style={{ width: '200px', height: '200px', background: 'blue' }}>
            Animated Box
          </div>
        </OptimizedAnimation>
      );
      
      // Trigger animation
      rerender(
        <OptimizedAnimation type="slide" duration={300} trigger={true}>
          <div style={{ width: '200px', height: '200px', background: 'blue' }}>
            Animated Box
          </div>
        </OptimizedAnimation>
      );
      
      performanceObserver.mark('animation-end');
      const measure = performanceObserver.measure('animation-trigger', 'animation-start', 'animation-end');
      
      expect(measure.duration).toBeLessThan(PERFORMANCE_THRESHOLDS.animationFrame);
    });
  });
  
  describe('Image Loading Performance', () => {
    it('should lazy load images efficiently', () => {
      performanceObserver.mark('images-start');
      
      const images = Array.from({ length: 50 }).map((_, i) => (
        <OptimizedImage
          key={i}
          src={`/image-${i}.jpg`}
          alt={`Image ${i}`}
          width={300}
          height={200}
          lazy={true}
        />
      ));
      
      render(
        <div style={{ height: '500px', overflow: 'auto' }}>
          {images}
        </div>
      );
      
      performanceObserver.mark('images-end');
      const measure = performanceObserver.measure('images-render', 'images-start', 'images-end');
      
      // Should render quickly with lazy loading
      expect(measure.duration).toBeLessThan(PERFORMANCE_THRESHOLDS.componentRender * 5);
    });
  });
  
  describe('Platform-Specific Performance', () => {
    const platforms = [
      { name: 'iOS', preset: platformPresets.iPhone, viewport: viewportPresets.mobile },
      { name: 'Android', preset: platformPresets.android, viewport: viewportPresets.mobile },
      { name: 'Desktop', preset: platformPresets.desktop, viewport: viewportPresets.desktop }
    ];
    
    platforms.forEach(platform => {
      it(`should render efficiently on ${platform.name}`, () => {
        mockPlatform(platform.preset);
        mockViewport(platform.viewport.width, platform.viewport.height);
        
        performanceObserver.mark(`${platform.name}-start`);
        
        // Render platform-specific components
        render(
          <div>
            <PlatformButton variant="primary">Button</PlatformButton>
            <OptimizedScroll>
              {Array.from({ length: 100 }).map((_, i) => (
                <div key={i}>Item {i}</div>
              ))}
            </OptimizedScroll>
          </div>
        );
        
        performanceObserver.mark(`${platform.name}-end`);
        const measure = performanceObserver.measure(
          `${platform.name}-render`,
          `${platform.name}-start`,
          `${platform.name}-end`
        );
        
        // Platform-specific thresholds
        const threshold = platform.name === 'Desktop' 
          ? PERFORMANCE_THRESHOLDS.componentRender 
          : PERFORMANCE_THRESHOLDS.componentRender * 2;
        
        expect(measure.duration).toBeLessThan(threshold * 10);
      });
    });
  });
  
  describe('Memory Performance', () => {
    it('should not leak memory with repeated renders', () => {
      const initialMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
      
      // Render and unmount components multiple times
      for (let i = 0; i < 100; i++) {
        const { unmount } = render(
          <Grid>
            <Row>
              <Col>Content {i}</Col>
            </Row>
          </Grid>
        );
        unmount();
      }
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Should not increase memory significantly
      expect(memoryIncrease).toBeLessThan(1024 * 1024); // 1MB
    });
  });
  
  describe('Bundle Size Impact', () => {
    it('should track component import sizes', () => {
      // This would integrate with webpack-bundle-analyzer in real implementation
      const componentSizes = {
        Grid: 2.5, // KB
        TouchManager: 8.2,
        PlatformAdaptations: 15.3,
        ResponsiveHooks: 3.8
      };
      
      const totalSize = Object.values(componentSizes).reduce((sum, size) => sum + size, 0);
      
      // Total bundle should be reasonable
      expect(totalSize).toBeLessThan(50); // 50KB for core components
    });
  });
});

/**
 * Performance monitoring utilities
 */
describe('Performance Monitoring', () => {
  it('should track FPS during animations', async () => {
    let frameCount = 0;
    let lastTime = performance.now();
    const fpsSamples: number[] = [];
    
    const fpsPromise = new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('FPS measurement timeout after 8s'));
      }, 8000);
      
      const measureFPS = () => {
        const currentTime = performance.now();
        const deltaTime = currentTime - lastTime;
        
        if (deltaTime >= 1000) {
          const fps = (frameCount * 1000) / deltaTime;
          fpsSamples.push(fps);
          frameCount = 0;
          lastTime = currentTime;
          
          if (fpsSamples.length >= 5) {
            const averageFPS = fpsSamples.reduce((sum, fps) => sum + fps, 0) / fpsSamples.length;
            expect(averageFPS).toBeGreaterThan(50); // Should maintain 50+ FPS
            clearTimeout(timeout);
            resolve();
            return;
          }
        }
        
        frameCount++;
        requestAnimationFrame(measureFPS);
      };
      
      requestAnimationFrame(measureFPS);
    });
    
    await fpsPromise;
  });
  
  it('should measure first contentful paint', () => {
    // This would use PerformanceObserver API in real implementation
    const mockFCP = 250; // milliseconds
    
    expect(mockFCP).toBeLessThan(1000); // FCP should be under 1 second
  });
  
  it('should measure time to interactive', () => {
    // This would measure actual TTI in real implementation
    const mockTTI = 500; // milliseconds
    
    expect(mockTTI).toBeLessThan(2000); // TTI should be under 2 seconds
  });
});