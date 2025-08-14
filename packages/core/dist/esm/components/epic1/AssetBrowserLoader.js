import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Asset Browser Loader Component
 * Conditionally loads the new asset browser or falls back to AssetLibraryV2
 */
import React, { lazy, Suspense } from 'react';
import { AssetLibraryErrorBoundary } from './asset-library/AssetLibraryErrorBoundary';
// Try to lazy load the integrated asset browser
const AssetBrowserIntegrated = lazy(() => import('./AssetBrowserIntegrated')
    .then(module => {
    console.log('[AssetBrowserLoader] Successfully loaded asset browser module:', module);
    return { default: module.AssetBrowserIntegrated };
})
    .catch((error) => {
    console.error('[AssetBrowserLoader] Failed to load integrated asset browser:', error);
    // Return a component that renders the fallback
    return {
        default: () => null
    };
}));
export const AssetBrowserLoader = ({ onPresetDrag, onPresetSelect, onInsert }) => {
    const [loadFailed, setLoadFailed] = React.useState(false);
    const LoadingPlaceholder = () => (_jsx("div", { style: { padding: 12, color: '#9ca3af' }, children: "Loading Asset Browser\u2026" }));
    React.useEffect(() => {
        // Check if the component actually loaded
        import('./AssetBrowserIntegrated')
            .then(() => {
            console.log('[AssetBrowserLoader] Asset browser module is available');
        })
            .catch(() => {
            console.log('[AssetBrowserLoader] Asset browser module not available, using fallback');
            setLoadFailed(true);
        });
    }, []);
    // If load failed, use fallback directly
    if (loadFailed) {
        return (_jsxs("div", { style: { padding: 12 }, children: [_jsx("div", { style: { marginBottom: 6, fontWeight: 600 }, children: "Asset Browser failed to load" }), _jsx("div", { style: { color: '#6b7280', marginBottom: 8 }, children: "Please reload the page or try again." }), _jsx("button", { onClick: () => {
                        setLoadFailed(false);
                        // Re-trigger dynamic import check
                        import('./AssetBrowserIntegrated').catch(() => setLoadFailed(true));
                    }, children: "Retry" })] }));
    }
    return (_jsx(AssetLibraryErrorBoundary, { children: _jsx(Suspense, { fallback: _jsx(LoadingPlaceholder, {}), children: _jsx(AssetBrowserIntegrated, { onInsert: (preset) => {
                    // Forward insert event directly to upstream without guards (AC7)
                    // Just call onInsert(preset) directly as per story requirements
                    console.log('[AssetBrowserLoader] Forwarding preset insert:', preset);
                    onInsert?.(preset);
                } }) }) }));
};
