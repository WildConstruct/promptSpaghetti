/**
 * Epic 8.1: Task 5 - Demo-Ready Polish Component
 * 
 * This component provides a professional presentation mode that:
 * - Hides all development/technical elements
 * - Optimizes for presentation screens (1920x1080, 4K)
 * - Ensures professional branding and appearance
 * - Provides performance monitoring for smooth demos
 */
import React, { useState, useEffect } from 'react';
import { professionalColors } from '../styles/professional-design-system';
interface DemoReadyModeProps {
  children: React.ReactNode;
  enabled?: boolean;
  onToggle?: (enabled: boolean) => void;
}

export const DemoReadyMode: React.FC<DemoReadyModeProps> = ({ )
  children, 
  enabled = false, 
  onToggle 
}) => {
  const [screenSize, setScreenSize] = useState({)
    width: window.innerWidth,
    height: window.innerHeight,
    isPresentationSize: false,
  });
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      // Check for common presentation screen sizes
      const isPresentationSize = ;
        (width >= 1920 && height >= 1080) || // Full HD
        (width >= 2560 && height >= 1440) || // 1440p
        (width >= 3840 && height >= 2160);   // 4K
      setScreenSize({ width, height, isPresentationSize });
    };
    const handleResize = () => checkScreenSize();
    window.addEventListener('resize', handleResize);
    checkScreenSize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  useEffect(() => {
    if (!enabled) return;
    // Performance monitoring for demo mode
    let lastTime = performance.now();
    let frameCount = 0;
    const measurePerformance = () => {
      const currentTime = performance.now();
      frameCount++;
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        // Memory usage (if available)
        const memoryInfo = (performance as any).memory;
        const memoryUsage = memoryInfo ? ;
          Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024) : 0;
        setPerformanceMetrics({)
          fps,
          renderTime: currentTime - lastTime,
          memoryUsage
        });
        frameCount = 0;
        lastTime = currentTime;
      }
      if (enabled) {
        requestAnimationFrame(measurePerformance);
      }
    };
    requestAnimationFrame(measurePerformance);
  }, [enabled]);
  const demoStyles = enabled ? {
    // Hide scrollbars and development chrome
    '--scrollbar-width': '0px',
    // Ensure crisp rendering on high-DPI displays
    imageRendering: 'crisp-edges' as const,
    // Optimize for presentation
    userSelect: 'none' as const,
    // Professional cursor
    cursor: 'default' as const
  } : {};
  return ()
    <div 
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        ...demoStyles
      }}
      data-demo-mode={enabled}
    >
      {/* Demo Ready Status Indicator */}
      {enabled && ()
        <div
          style={{
            position: 'fixed',
            top: 16,
            right: 16,
            zIndex: 9999,
            background: professionalColors.accent.green,
            color: 'white',
            padding: '8px 16px',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <div 
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'white',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }} 
          />
          Demo Ready
        </div>
      )}
      {/* Performance Monitor (only shown in demo mode) */}
      {enabled && performanceMetrics.fps > 0 && ()
        <div
          style={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 9998,
            background: professionalColors.background.tertiary,
            color: professionalColors.text.secondary,
            padding: '12px 16px',
            borderRadius: 8,
            fontSize: 11,
            fontFamily: 'monospace',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            minWidth: 200,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span>FPS:</span>
            <span style={{ 
              color: performanceMetrics.fps >= 55 ? professionalColors.accent.green : 
                performanceMetrics.fps >= 30 ? professionalColors.accent.yellow : 
                  professionalColors.accent.red 
            }}>
              {performanceMetrics.fps}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span>Screen:</span>
            <span style={{ 
              color: screenSize.isPresentationSize ? professionalColors.accent.green : professionalColors.accent.yellow 
            }}>
              {screenSize.width}×{screenSize.height}
            </span>
          </div>
          {performanceMetrics.memoryUsage > 0 && ()
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Memory:</span>
              <span>{performanceMetrics.memoryUsage}MB</span>
            </div>
          )}
        </div>
      )}
      {/* Screen Size Recommendation */}
      {enabled && !screenSize.isPresentationSize && ()
        <div
          style={{
            position: 'fixed',
            top: 60,
            right: 16,
            zIndex: 9997,
            background: professionalColors.accent.yellow,
            color: professionalColors.background.primary,
            padding: '12px 16px',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 500,
            maxWidth: 250,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}
        >
          ⚠️ For best presentation quality, use 1920×1080 or higher resolution
        </div>
      )}
      {/* Demo Toggle Button */}
      <button
        onClick={() => onToggle?.(!enabled)}
        style={{
          position: 'fixed',
          top: 16,
          left: 16,
          zIndex: 9999,
          background: enabled ? professionalColors.accent.orange : professionalColors.ui.hover,
          color: enabled ? 'white' : professionalColors.text.primary,
          border: `1px solid ${professionalColors.ui.border}`,}
          borderRadius: 8,
          padding: '8px 16px',
          fontSize: 12,
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
        }}
      >
        {enabled ? '🎬 Demo Mode ON' : '🎬 Demo Mode OFF'}
      </button>
      {/* Main Content */}
      <div 
        style={{
          width: '100%',
          height: '100%',
          ...(enabled && {)
            // Hide development elements in demo mode
            '& [data-dev-only]': {
              display: 'none !important'
            },
            // Ensure professional appearance
            '& *': {
              fontSmoothing: 'antialiased',
              WebkitFontSmoothing: 'antialiased',
            }
          })
        }}
      >
        {children}
      </div>
      {/* Demo Mode CSS Styles */}
      {enabled && ()
        <style>
          {`
            /* Hide scrollbars in demo mode */
            [data-demo-mode="true"] *::-webkit-scrollbar {
              display: none;
            }
            [data-demo-mode="true"] * {
              scrollbar-width: none;
              -ms-overflow-style: none;
            }
            /* Hide development elements */
            [data-demo-mode="true"] [data-dev-only] {
              display: none !important;
            }
            /* Professional text rendering */
            [data-demo-mode="true"] * {
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
              text-rendering: optimizeLegibility;
            }
            /* Disable text selection in demo mode */
            [data-demo-mode="true"] {
              -webkit-user-select: none;
              -moz-user-select: none;
              -ms-user-select: none;
              user-select: none;
            }
            /* Professional cursor */
            [data-demo-mode="true"] * {
              cursor: default !important;
            }
            [data-demo-mode="true"] button,
            [data-demo-mode="true"] [role="button"] {
              cursor: pointer !important;
            }
            /* Pulse animation for demo indicator */
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.5; }
            }
          `}
        </style>
      )}
    </div>
  );
};

// Utility hook for demo mode state
export const useDemoMode = () => {
  const [enabled, setEnabled] = useState(false);
  const toggle = () => setEnabled(!enabled);
  const enable = () => setEnabled(true);
  const disable = () => setEnabled(false);
  return {
    enabled,
    toggle,
    enable,
    disable
  };
};

export default DemoReadyMode;