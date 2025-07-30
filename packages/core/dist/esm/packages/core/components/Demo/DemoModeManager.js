import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Demo Mode Manager
 * Epic 8.1: Task 5 - Demo-Ready Polish for presentation environments
 *
 * Manages presentation modes, screenshot mode, and demo optimizations
 */
import { useState, useEffect, useCallback } from 'react';
import { ProfessionalSpinner } from '../LoadingStates/ProfessionalSpinner';
export const DemoModeManager = ({
    children,
    onModeChange,
    initialConfig = {}
});
{
    const [config, setConfig] = useState({});
    DEFAULT_CONFIG,
    ;
    initialConfig;
}
;
const [isTransitioning, setIsTransitioning] = useState(false);
// Auto-detect screen resolution and apply appropriate scaling
useEffect(() => {
    const detectScreenMode = () => {
        const width = window.screen.width;
        const height = window.screen.height;
        const pixelRatio = window.devicePixelRatio || 1;
        // Apply demo scaling for presentation screens
        if (width === 1920 && height === 1080) {
            document.documentElement.className += ' presentation-1080p';
        }
        else if (width >= 3840 && height >= 2160) {
            document.documentElement.className += ' presentation-4k';
        }
        else if (width >= 2560) {
            document.documentElement.className += ' presentation-ultrawide';
            // Apply high-DPI optimizations
            if (pixelRatio >= 2) {
                document.documentElement.className += ' presentation-hidpi';
            }
            ;
            detectScreenMode();
            window.addEventListener('resize', detectScreenMode);
            return () => window.removeEventListener('resize', detectScreenMode);
        }
        [];
    };
});
// Apply CSS classes based on config - memoized for performance
useEffect(() => {
    const classes = [];
    if (config.screenshotMode)
        classes.push('demo-screenshot-mode');
    if (config.presentationFocus)
        classes.push('presentation-focus');
    if (config.performanceMode)
        classes.push('demo-performance-mode');
    if (config.accessibilityMode)
        classes.push('presentation-a11y');
    if (config.debugElementsHidden)
        classes.push('hide-debug-elements');
    // Always add demo mode class
    classes.push('demo-mode', 'presentation-typography');
    // Apply classes to document body more efficiently
    const currentClasses = document.body.className.split(' ');
    const filteredClasses = currentClasses.filter(cls => );
});
!cls.startsWith('demo-') && !cls.startsWith('presentation-');
;
document.body.className = [...filteredClasses, ...classes].join(' ');
onModeChange?.(config);
[config, onModeChange];
;
const updateConfig = useCallback((updates) => {
    setIsTransitioning(true);
    setTimeout(() => {
        setConfig(prev => ({ ...prev, ...updates }));
        setIsTransitioning(false);
    }, 150); // Brief transition for smooth mode changes
}, []);
// Keyboard shortcuts for demo control
useEffect(() => {
    const handleKeyPress = (e) => {
        // Only handle if Alt + Shift are pressed (presenter shortcut)
        if (!e.altKey || !e.shiftKey)
            return;
        switch (e.key) {
            case 'S':
                // Alt+Shift+S: Toggle screenshot mode
                e.preventDefault();
                updateConfig({ screenshotMode: !config.screenshotMode });
                break;
            case 'F':
                // Alt+Shift+F: Toggle presentation focus
                e.preventDefault();
                updateConfig({ presentationFocus: !config.presentationFocus });
                break;
            case 'P':
                // Alt+Shift+P: Toggle performance mode
                e.preventDefault();
                updateConfig({ performanceMode: !config.performanceMode });
                break;
            case 'A':
                // Alt+Shift+A: Toggle accessibility mode
                e.preventDefault();
                updateConfig({ accessibilityMode: !config.accessibilityMode });
                break;
            case 'D':
                // Alt+Shift+D: Toggle debug elements
                e.preventDefault();
                updateConfig({ debugElementsHidden: !config.debugElementsHidden });
                break;
        }
        ;
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [config, updateConfig];
});
return;
_jsxs(_Fragment, { children: [children, config.brandingVisible && !config.screenshotMode && ()
            < div, " className=\"demo-branding\" data-demo-safe=\"true\">", _jsx("div", { style: { fontSize: '12px', fontWeight: 600, marginBottom: 2 }, children: "\uD83C\uDFAC PromptScape Studio" }), _jsx("div", { style: { fontSize: '10px', opacity: 0.8 }, children: "Professional Prompt Generation" })] });
div >
;
{ /* Demo mode transition overlay */ }
{
    isTransitioning && ()
        < div;
    style = {};
    {
        position: 'fixed',
            top;
        0,
            left;
        0,
            right;
        0,
            bottom;
        0,
            background;
        'rgba(0, 0, 0, 0.3)',
            backdropFilter;
        'blur(4px)',
            display;
        'flex',
            alignItems;
        'center',
            justifyContent;
        'center',
            zIndex;
        9999,
            pointerEvents;
        'none',
        ;
    }
}
    >
        _jsx(ProfessionalSpinner, { size: "medium", variant: "cinema4d", type: "pulse", message: "Switching demo mode..." });
div >
;
{ /* Demo control panel (hidden in screenshot mode) */ }
{
    !config.screenshotMode && process.env.NODE_ENV === 'development' && ()
        < DemoControlPanel;
    config = { config };
    onConfigChange = { updateConfig } /  >
    ;
}
 >
;
;
;
 >
;
;
;
export default DemoModeManager;
