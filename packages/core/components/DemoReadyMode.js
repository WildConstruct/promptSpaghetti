import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Epic 8.1: Task 5 - Demo-Ready Polish Component
 *
 * This component provides a professional presentation mode that:
 * - Hides all development/technical elements
 * - Optimizes for presentation screens (1920x1080, 4K)
 * - Ensures professional branding and appearance
 * - Provides performance monitoring for smooth demos
 */
import { useState, useEffect } from 'react';
export const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
    isPresentationSize: false
});
useEffect(() => {
    const checkScreenSize = () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        // Check for common presentation screen sizes
        const isPresentationSize = (width >= 1920 && height >= 1080) || // Full HD
            (width >= 2560 && height >= 1440) || // 1440p
            (width >= 3840 && height >= 2160); // 4K
        setScreenSize({ width, height, isPresentationSize });
    };
    const handleResize = () => checkScreenSize();
    window.addEventListener('resize', handleResize);
    checkScreenSize();
    return () => window.removeEventListener('resize', handleResize);
}, []);
useEffect(() => {
    if (!enabled)
        return;
    // Performance monitoring for demo mode
    let lastTime = performance.now();
    let frameCount = 0;
    const measurePerformance = () => {
        const currentTime = performance.now();
        frameCount++;
        if (currentTime - lastTime >= 1000) {
            const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
            // Memory usage (if available)
            const memoryInfo = performance.memory;
            const memoryUsage = memoryInfo ?
                Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024) : 0;
            setPerformanceMetrics({
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
    imageRendering: 'crisp-edges',
    // Optimize for presentation
    userSelect: 'none',
    // Professional cursor
    cursor: 'default'
} : {};
return (_jsxs("div", { style: {
        position: 'relative',
        width: '100%',
        height: '100%',
        ...demoStyles
    }, "data-demo-mode": enabled, children: [enabled && (_jsxs("div", { style: {
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
                gap: 8
            }, children: [_jsx("div", { style: {
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: 'white',
                        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                    } }), "Demo Ready"] })), enabled && performanceMetrics.fps > 0 && (_jsxs("div", { style: {
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
                minWidth: 200
            }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: 4 }, children: [_jsx("span", { children: "FPS:" }), _jsx("span", { style: {
                                color: performanceMetrics.fps >= 55 ? professionalColors.accent.green :
                                    performanceMetrics.fps >= 30 ? professionalColors.accent.yellow :
                                        professionalColors.accent.red
                            }, children: performanceMetrics.fps })] }), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: 4 }, children: [_jsx("span", { children: "Screen:" }), _jsxs("span", { style: {
                                color: screenSize.isPresentationSize ? professionalColors.accent.green : professionalColors.accent.yellow
                            }, children: [screenSize.width, "\u00D7", screenSize.height] })] }), performanceMetrics.memoryUsage > 0 && (_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between' }, children: [_jsx("span", { children: "Memory:" }), _jsxs("span", { children: [performanceMetrics.memoryUsage, "MB"] })] }))] })), enabled && !screenSize.isPresentationSize && (_jsx("div", { style: {
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
            }, children: "\u26A0\uFE0F For best presentation quality, use 1920\u00D71080 or higher resolution" })), _jsx("button", { onClick: () => onToggle?.(!enabled), style: {
                position: 'fixed',
                top: 16,
                left: 16,
                zIndex: 9999,
                background: enabled ? professionalColors.accent.orange : professionalColors.ui.hover,
                color: enabled ? 'white' : professionalColors.text.primary,
                border: `1px solid ${professionalColors.ui.border}`,
                borderRadius: 8,
                padding: '8px 16px',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }, onMouseEnter: (e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            }, onMouseLeave: (e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
            }, children: enabled ? '🎬 Demo Mode ON' : '🎬 Demo Mode OFF' }), _jsx("div", { style: {
                width: '100%',
                height: '100%',
                ...(enabled && {
                    // Hide development elements in demo mode
                    '& [data-dev-only]': {
                        display: 'none !important'
                    },
                    // Ensure professional appearance
                    '& *': {
                        fontSmoothing: 'antialiased',
                        WebkitFontSmoothing: 'antialiased'
                    }
                })
            }, children: children }), enabled && (_jsx("style", { children: `
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
          ` }))] }));
;
// Utility hook for demo mode state
export const toggle = () => setEnabled(!enabled);
const enable = () => setEnabled(true);
const disable = () => setEnabled(false);
return {
    enabled,
    toggle,
    enable,
    disable
};
;
