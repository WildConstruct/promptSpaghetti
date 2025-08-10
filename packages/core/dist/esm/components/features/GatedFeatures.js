import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useFeatureGate, useFeatureAvailability } from '../../hooks/useFeatureGate';
import { InlineUpgradePrompt, FeatureTooltip, PremiumBadge } from '../upgrade/UpgradePrompt';
/**
 * Cloud save button with auth gate
 */
export function CloudSaveButton({ onClick, disabled, children }) {
    const { isEnabled, Gate, isAuthenticated } = useFeatureGate({
        requireAuth: true,
        requireSupabase: true
    });
    return (_jsx(Gate, { fallback: _jsx(FeatureTooltip, { content: "Sign in to save to cloud", children: _jsxs("button", { disabled: true, style: {
                    padding: '10px 20px',
                    backgroundColor: '#e5e7eb',
                    color: '#9ca3af',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'not-allowed',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px'
                }, children: ["\u2601\uFE0F ", children, _jsx(PremiumBadge, {})] }) }), children: _jsxs("button", { onClick: onClick, disabled: disabled, style: {
                padding: '10px 20px',
                backgroundColor: disabled ? '#e5e7eb' : '#0284c7',
                color: disabled ? '#9ca3af' : 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
            }, onMouseEnter: (e) => {
                if (!disabled) {
                    e.currentTarget.style.backgroundColor = '#0369a1';
                }
            }, onMouseLeave: (e) => {
                if (!disabled) {
                    e.currentTarget.style.backgroundColor = '#0284c7';
                }
            }, children: ["\u2601\uFE0F ", children] }) }));
}
/**
 * Cloud load button with auth gate
 */
export function CloudLoadButton({ onClick, disabled, children }) {
    const { isEnabled, Gate } = useFeatureGate({
        requireAuth: true,
        requireSupabase: true
    });
    return (_jsx(Gate, { fallback: _jsx(FeatureTooltip, { content: "Sign in to load from cloud", children: _jsxs("button", { disabled: true, style: {
                    padding: '10px 20px',
                    backgroundColor: '#e5e7eb',
                    color: '#9ca3af',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'not-allowed',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px'
                }, children: ["\u2601\uFE0F ", children, _jsx(PremiumBadge, {})] }) }), children: _jsxs("button", { onClick: onClick, disabled: disabled, style: {
                padding: '10px 20px',
                backgroundColor: 'white',
                color: disabled ? '#9ca3af' : '#0284c7',
                border: `1px solid ${disabled ? '#d1d5db' : '#0284c7'}`,
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
            }, onMouseEnter: (e) => {
                if (!disabled) {
                    e.currentTarget.style.backgroundColor = '#f0f9ff';
                }
            }, onMouseLeave: (e) => {
                if (!disabled) {
                    e.currentTarget.style.backgroundColor = 'white';
                }
            }, children: ["\u2601\uFE0F ", children] }) }));
}
/**
 * Local save button (always available)
 */
export function LocalSaveButton({ onClick, disabled, children }) {
    return (_jsxs("button", { onClick: onClick, disabled: disabled, style: {
            padding: '10px 20px',
            backgroundColor: 'white',
            color: disabled ? '#9ca3af' : '#374151',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
        }, onMouseEnter: (e) => {
            if (!disabled) {
                e.currentTarget.style.backgroundColor = '#f9fafb';
            }
        }, onMouseLeave: (e) => {
            if (!disabled) {
                e.currentTarget.style.backgroundColor = 'white';
            }
        }, children: ["\uD83D\uDCBE ", children] }));
}
export function FeatureAvailabilityIndicator({ showPremium = true }) {
    const cloudSaveAvailable = useFeatureAvailability('premium.cloudSaveLoad');
    const crossDeviceAvailable = useFeatureAvailability('premium.crossDeviceSync');
    const features = [
        { name: 'Create & Edit Graphs', available: true },
        { name: 'Local Save/Load', available: true },
        { name: 'Export/Import', available: true },
        { name: 'Cloud Storage', available: cloudSaveAvailable, premium: true },
        { name: 'Cross-Device Sync', available: crossDeviceAvailable, premium: true }
    ];
    if (!showPremium) {
        return null;
    }
    return (_jsxs("div", { style: {
            padding: '16px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            fontSize: '13px'
        }, children: [_jsx("h4", { style: {
                    margin: '0 0 12px 0',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#111827'
                }, children: "Feature Availability" }), _jsx("ul", { style: {
                    margin: 0,
                    padding: 0,
                    listStyle: 'none'
                }, children: features.map((feature, index) => (_jsxs("li", { style: {
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 0',
                        borderBottom: index < features.length - 1 ? '1px solid #e5e7eb' : 'none'
                    }, children: [_jsxs("span", { style: { color: feature.available ? '#374151' : '#9ca3af' }, children: [feature.available ? '✅' : '🔒', " ", feature.name] }), feature.premium && !feature.available && _jsx(PremiumBadge, { size: "small" })] }, index))) })] }));
}
export function GatedSection({ feature, benefits, onUpgrade, children }) {
    const { isEnabled, Gate } = useFeatureGate({
        requireAuth: true,
        requireSupabase: true
    });
    return (_jsx(Gate, { fallback: _jsx(InlineUpgradePrompt, { feature: feature, benefits: benefits, onUpgrade: onUpgrade }), children: children }));
}
