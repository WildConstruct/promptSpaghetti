import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Upgrade prompt components for encouraging authentication
 */
import { useState } from 'react';
export function InlineUpgradePrompt({ feature, benefits, onUpgrade }) {
    return (_jsxs("div", { style: {
            padding: '16px',
            backgroundColor: '#f0f9ff',
            border: '1px solid #0284c7',
            borderRadius: '8px',
            margin: '16px 0'
        }, children: [_jsxs("div", { style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '12px'
                }, children: [_jsx("span", { style: { fontSize: '20px' }, children: "\uD83D\uDD12" }), _jsxs("h4", { style: {
                            margin: 0,
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#0c4a6e'
                        }, children: ["Sign in to enable ", feature] })] }), _jsx("ul", { style: {
                    margin: '0 0 16px 0',
                    paddingLeft: '24px',
                    color: '#075985'
                }, children: benefits.map((benefit, index) => (_jsx("li", { style: { marginBottom: '4px' }, children: benefit }, index))) }), _jsx("button", { onClick: onUpgrade, style: {
                    padding: '8px 16px',
                    backgroundColor: '#0284c7',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                }, onMouseEnter: (e) => {
                    e.currentTarget.style.backgroundColor = '#0369a1';
                }, onMouseLeave: (e) => {
                    e.currentTarget.style.backgroundColor = '#0284c7';
                }, children: "Sign In to Unlock" })] }));
}
export function UpgradeModal({ title, benefits, onSignUp, onSignIn, onDismiss, dismissDuration = 7 }) {
    const handleDismiss = () => {
        // Store dismiss timestamp
        const dismissUntil = Date.now() + (dismissDuration * 24 * 60 * 60 * 1000);
        localStorage.setItem('upgrade_prompt_dismissed', dismissUntil.toString());
        onDismiss();
    };
    return (_jsxs(_Fragment, { children: [_jsx("div", { style: {
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    zIndex: 9998,
                    animation: 'fadeIn 0.2s ease'
                }, onClick: handleDismiss }), _jsxs("div", { style: {
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '32px',
                    maxWidth: '480px',
                    width: '90%',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
                    zIndex: 9999,
                    animation: 'slideUp 0.3s ease'
                }, children: [_jsx("button", { onClick: handleDismiss, style: {
                            position: 'absolute',
                            top: '16px',
                            right: '16px',
                            background: 'none',
                            border: 'none',
                            fontSize: '24px',
                            color: '#6b7280',
                            cursor: 'pointer',
                            padding: '4px',
                            lineHeight: 1
                        }, "aria-label": "Close", children: "\u00D7" }), _jsx("div", { style: {
                            fontSize: '48px',
                            textAlign: 'center',
                            marginBottom: '16px'
                        }, children: "\u2601\uFE0F" }), _jsx("h2", { style: {
                            margin: '0 0 16px 0',
                            fontSize: '24px',
                            fontWeight: '600',
                            textAlign: 'center',
                            color: '#111827'
                        }, children: title }), _jsxs("div", { style: {
                            backgroundColor: '#f9fafb',
                            borderRadius: '8px',
                            padding: '16px',
                            marginBottom: '24px'
                        }, children: [_jsx("h3", { style: {
                                    margin: '0 0 12px 0',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#374151',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }, children: "Benefits" }), _jsx("ul", { style: {
                                    margin: 0,
                                    paddingLeft: '20px',
                                    color: '#4b5563'
                                }, children: benefits.map((benefit, index) => (_jsx("li", { style: { marginBottom: '8px' }, children: benefit }, index))) })] }), _jsxs("div", { style: {
                            display: 'flex',
                            gap: '12px',
                            marginBottom: '16px'
                        }, children: [_jsx("button", { onClick: onSignUp, style: {
                                    flex: 1,
                                    padding: '12px 24px',
                                    backgroundColor: '#0284c7',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s'
                                }, onMouseEnter: (e) => {
                                    e.currentTarget.style.backgroundColor = '#0369a1';
                                }, onMouseLeave: (e) => {
                                    e.currentTarget.style.backgroundColor = '#0284c7';
                                }, children: "Sign Up Free" }), _jsx("button", { onClick: onSignIn, style: {
                                    flex: 1,
                                    padding: '12px 24px',
                                    backgroundColor: 'white',
                                    color: '#0284c7',
                                    border: '2px solid #0284c7',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }, onMouseEnter: (e) => {
                                    e.currentTarget.style.backgroundColor = '#f0f9ff';
                                }, onMouseLeave: (e) => {
                                    e.currentTarget.style.backgroundColor = 'white';
                                }, children: "Sign In" })] }), _jsx("div", { style: { textAlign: 'center' }, children: _jsx("button", { onClick: handleDismiss, style: {
                                background: 'none',
                                border: 'none',
                                color: '#6b7280',
                                fontSize: '14px',
                                cursor: 'pointer',
                                textDecoration: 'underline'
                            }, children: "Continue without account" }) })] }), _jsx("style", { children: `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translate(-50%, -40%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }
      ` })] }));
}
export function FeatureTooltip({ content, children }) {
    const [showTooltip, setShowTooltip] = useState(false);
    return (_jsxs("div", { style: { position: 'relative', display: 'inline-block' }, onMouseEnter: () => setShowTooltip(true), onMouseLeave: () => setShowTooltip(false), children: [children, showTooltip && (_jsxs("div", { style: {
                    position: 'absolute',
                    bottom: 'calc(100% + 8px)',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: '#1f2937',
                    color: 'white',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    whiteSpace: 'nowrap',
                    zIndex: 1000,
                    pointerEvents: 'none',
                    animation: 'tooltipFade 0.2s ease'
                }, children: [content, _jsx("div", { style: {
                            position: 'absolute',
                            top: '100%',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: 0,
                            height: 0,
                            borderLeft: '6px solid transparent',
                            borderRight: '6px solid transparent',
                            borderTop: '6px solid #1f2937'
                        } })] })), _jsx("style", { children: `
        @keyframes tooltipFade {
          from { opacity: 0; transform: translateX(-50%) translateY(4px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      ` })] }));
}
export function PremiumBadge({ size = 'small' }) {
    const sizes = {
        small: { fontSize: '10px', padding: '2px 6px' },
        medium: { fontSize: '12px', padding: '3px 8px' },
        large: { fontSize: '14px', padding: '4px 10px' }
    };
    return (_jsx("span", { style: {
            ...sizes[size],
            backgroundColor: '#fbbf24',
            color: '#78350f',
            borderRadius: '4px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            display: 'inline-block',
            marginLeft: '8px'
        }, children: "Pro" }));
}
