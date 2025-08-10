import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Authentication modal with login/signup tabs
 */
import { useState, useEffect, useRef } from 'react';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { PasswordReset } from './PasswordReset';
export function AuthModal({ isOpen, onClose, initialTab = 'login', onSuccess }) {
    const [activeTab, setActiveTab] = useState(initialTab);
    const modalRef = useRef(null);
    const previousFocusRef = useRef(null);
    // Focus management
    useEffect(() => {
        if (isOpen) {
            // Store current focus
            previousFocusRef.current = document.activeElement;
            // Focus modal
            setTimeout(() => {
                modalRef.current?.focus();
            }, 100);
        }
        else {
            // Restore focus when closing
            previousFocusRef.current?.focus();
        }
    }, [isOpen]);
    // Trap focus within modal
    useEffect(() => {
        if (!isOpen)
            return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
                return;
            }
            if (e.key === 'Tab' && modalRef.current) {
                const focusableElements = modalRef.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];
                if (e.shiftKey && document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement?.focus();
                }
                else if (!e.shiftKey && document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement?.focus();
                }
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);
    if (!isOpen)
        return null;
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };
    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };
    const handleAuthSuccess = (user) => {
        onSuccess?.(user);
        onClose();
    };
    const handleForgotPassword = () => {
        setActiveTab('reset');
    };
    const handleBackToLogin = () => {
        setActiveTab('login');
    };
    return (_jsxs("div", { style: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            animation: 'fadeIn 0.2s ease'
        }, onClick: handleBackdropClick, role: "dialog", "aria-modal": "true", "aria-labelledby": "auth-modal-title", children: [_jsxs("div", { ref: modalRef, tabIndex: -1, style: {
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    width: '90%',
                    maxWidth: '440px',
                    maxHeight: '90vh',
                    overflow: 'auto',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
                    animation: 'slideUp 0.3s ease'
                }, onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { style: {
                            padding: '24px 24px 0',
                            borderBottom: activeTab !== 'reset' ? '1px solid #e9ecef' : 'none'
                        }, children: [_jsxs("div", { style: {
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: activeTab !== 'reset' ? '20px' : '0'
                                }, children: [_jsx("h2", { id: "auth-modal-title", style: {
                                            margin: 0,
                                            fontSize: '24px',
                                            fontWeight: '600',
                                            color: '#212529'
                                        }, children: activeTab === 'reset' ? 'Reset Password' : 'Welcome' }), _jsx("button", { onClick: onClose, style: {
                                            background: 'none',
                                            border: 'none',
                                            fontSize: '24px',
                                            color: '#6c757d',
                                            cursor: 'pointer',
                                            padding: '4px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '4px',
                                            transition: 'background-color 0.2s'
                                        }, onMouseEnter: (e) => {
                                            e.currentTarget.style.backgroundColor = '#f8f9fa';
                                        }, onMouseLeave: (e) => {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                        }, "aria-label": "Close modal", children: "\u00D7" })] }), activeTab !== 'reset' && (_jsxs("div", { style: {
                                    display: 'flex',
                                    gap: '0',
                                    marginBottom: '-1px'
                                }, role: "tablist", children: [_jsx("button", { onClick: () => handleTabChange('login'), style: {
                                            flex: 1,
                                            padding: '12px',
                                            background: 'none',
                                            border: 'none',
                                            borderBottom: `2px solid ${activeTab === 'login' ? '#007bff' : 'transparent'}`,
                                            color: activeTab === 'login' ? '#007bff' : '#6c757d',
                                            fontSize: '16px',
                                            fontWeight: activeTab === 'login' ? '600' : '400',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }, role: "tab", "aria-selected": activeTab === 'login', "aria-controls": "login-panel", children: "Log In" }), _jsx("button", { onClick: () => handleTabChange('signup'), style: {
                                            flex: 1,
                                            padding: '12px',
                                            background: 'none',
                                            border: 'none',
                                            borderBottom: `2px solid ${activeTab === 'signup' ? '#007bff' : 'transparent'}`,
                                            color: activeTab === 'signup' ? '#007bff' : '#6c757d',
                                            fontSize: '16px',
                                            fontWeight: activeTab === 'signup' ? '600' : '400',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }, role: "tab", "aria-selected": activeTab === 'signup', "aria-controls": "signup-panel", children: "Sign Up" })] }))] }), _jsxs("div", { style: { padding: '24px' }, children: [activeTab === 'login' && (_jsx("div", { id: "login-panel", role: "tabpanel", children: _jsx(LoginForm, { onSuccess: handleAuthSuccess, onForgotPassword: handleForgotPassword }) })), activeTab === 'signup' && (_jsx("div", { id: "signup-panel", role: "tabpanel", children: _jsx(SignupForm, { onSuccess: handleAuthSuccess }) })), activeTab === 'reset' && (_jsx(PasswordReset, { onBack: handleBackToLogin }))] }), _jsx("div", { style: {
                            padding: '16px 24px',
                            borderTop: '1px solid #e9ecef',
                            backgroundColor: '#f8f9fa',
                            borderRadius: '0 0 12px 12px',
                            fontSize: '13px',
                            color: '#6c757d',
                            textAlign: 'center'
                        }, children: activeTab === 'login' ? (_jsxs("span", { children: ["Don't have an account?", ' ', _jsx("button", { onClick: () => handleTabChange('signup'), style: {
                                        background: 'none',
                                        border: 'none',
                                        color: '#007bff',
                                        cursor: 'pointer',
                                        textDecoration: 'underline',
                                        padding: 0,
                                        font: 'inherit'
                                    }, children: "Sign up" })] })) : activeTab === 'signup' ? (_jsxs("span", { children: ["Already have an account?", ' ', _jsx("button", { onClick: () => handleTabChange('login'), style: {
                                        background: 'none',
                                        border: 'none',
                                        color: '#007bff',
                                        cursor: 'pointer',
                                        textDecoration: 'underline',
                                        padding: 0,
                                        font: 'inherit'
                                    }, children: "Log in" })] })) : (_jsxs("span", { children: ["Remember your password?", ' ', _jsx("button", { onClick: handleBackToLogin, style: {
                                        background: 'none',
                                        border: 'none',
                                        color: '#007bff',
                                        cursor: 'pointer',
                                        textDecoration: 'underline',
                                        padding: 0,
                                        font: 'inherit'
                                    }, children: "Back to login" })] })) })] }), _jsx("style", { children: `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      ` })] }));
}
