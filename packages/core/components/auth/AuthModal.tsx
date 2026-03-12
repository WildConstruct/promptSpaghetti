/**
 * Authentication modal with login/signup tabs
 */

import React, { useState, useEffect, useRef } from 'react';
import type { User } from '@supabase/supabase-js';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { PasswordReset } from './PasswordReset';
import { getSupabase } from '../../utils/supabaseClient';

export type AuthTab = 'login' | 'signup' | 'reset';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: AuthTab;
  onSuccess?: (user: User) => void;
}

export function AuthModal({
  isOpen,
  onClose,
  initialTab = 'login',
  onSuccess
}: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<AuthTab>(initialTab);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Store current focus
      previousFocusRef.current = document.activeElement as HTMLElement;

      // Focus modal
      setTimeout(() => {
        modalRef.current?.focus();
      }, 100);
    } else {
      // Restore focus when closing
      previousFocusRef.current?.focus();
    }
  }, [isOpen]);

  // Trap focus within modal
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[
          focusableElements.length - 1
        ] as HTMLElement;

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleTabChange = (tab: AuthTab) => {
    setActiveTab(tab);
  };

  const handleAuthSuccess = (user: User) => {
    onSuccess?.(user);
    onClose();
  };

  const handleForgotPassword = () => {
    setActiveTab('reset');
  };

  const handleBackToLogin = () => {
    setActiveTab('login');
  };

  return (
    <div
      style={{
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
      }}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        style={{
          backgroundColor: '#1a1a1a',
          borderRadius: '12px',
          width: '90%',
          maxWidth: '440px',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
          animation: 'slideUp 0.3s ease',
          border: '1px solid #333'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '24px 24px 0',
            borderBottom: activeTab !== 'reset' ? '1px solid #333' : 'none'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: activeTab !== 'reset' ? '20px' : '0'
            }}
          >
            <h2
              id="auth-modal-title"
              style={{
                margin: 0,
                fontSize: '24px',
                fontWeight: '600',
                color: '#e0e0e0'
              }}
            >
              {activeTab === 'reset' ? 'Reset Password' : 'Welcome'}
            </h2>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                color: '#999',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '4px',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = '#333';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              aria-label="Close modal"
            >
              ×
            </button>
          </div>

          {/* Tab Navigation */}
          {activeTab !== 'reset' && (
            <div
              style={{
                display: 'flex',
                gap: '0',
                marginBottom: '-1px'
              }}
              role="tablist"
            >
              <button
                onClick={() => handleTabChange('login')}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'none',
                  border: 'none',
                  borderBottom: `2px solid ${activeTab === 'login' ? '#2563eb' : 'transparent'}`,
                  color: activeTab === 'login' ? '#60a5fa' : '#666',
                  fontSize: '16px',
                  fontWeight: activeTab === 'login' ? '600' : '400',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                role="tab"
                aria-selected={activeTab === 'login'}
                aria-controls="login-panel"
              >
                Log In
              </button>
              <button
                onClick={() => handleTabChange('signup')}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'none',
                  border: 'none',
                  borderBottom: `2px solid ${activeTab === 'signup' ? '#2563eb' : 'transparent'}`,
                  color: activeTab === 'signup' ? '#60a5fa' : '#666',
                  fontSize: '16px',
                  fontWeight: activeTab === 'signup' ? '600' : '400',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                role="tab"
                aria-selected={activeTab === 'signup'}
                aria-controls="signup-panel"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            <button
              onClick={async () => {
                try {
                  // eslint-disable-next-line no-console
                  console.log('[AuthModal] Google clicked');
                  const supabase = getSupabase();
                  if (!supabase) {
                    // eslint-disable-next-line no-alert
                    window.alert('Supabase is not configured. Set VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, and VITE_FEATURE_SUPABASE=1.');
                    return;
                  }
                  const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin, skipBrowserRedirect: true } });
                  if (error) {
                    // eslint-disable-next-line no-console
                    console.error('[AuthModal] Google OAuth error', error);
                    // eslint-disable-next-line no-alert
                    window.alert('Failed to start Google sign-in.');
                  } else if (data?.url) {
                    window.location.assign(data.url);
                  }
                } catch (e) {
                  // eslint-disable-next-line no-console
                  console.error('[AuthModal] Google OAuth exception', e);
                }
              }}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid rgba(103, 126, 234, 0.3)',
                background: 'linear-gradient(135deg, rgba(103, 126, 234, 0.15) 0%, rgba(103, 126, 234, 0.25) 100%)',
                color: '#e0e0e0',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500
              }}
            >
              Continue with Google
            </button>
            <button
              onClick={async () => {
                try {
                  // eslint-disable-next-line no-console
                  console.log('[AuthModal] Discord clicked');
                  const supabase = getSupabase();
                  if (!supabase) {
                    // eslint-disable-next-line no-alert
                    window.alert('Supabase is not configured. Set VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, and VITE_FEATURE_SUPABASE=1.');
                    return;
                  }
                  const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'discord', options: { redirectTo: window.location.origin, skipBrowserRedirect: true } });
                  if (error) {
                    // eslint-disable-next-line no-console
                    console.error('[AuthModal] Discord OAuth error', error);
                    // eslint-disable-next-line no-alert
                    window.alert('Failed to start Discord sign-in.');
                  } else if (data?.url) {
                    window.location.assign(data.url);
                  }
                } catch (e) {
                  // eslint-disable-next-line no-console
                  console.error('[AuthModal] Discord OAuth exception', e);
                }
              }}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid rgba(103, 126, 234, 0.3)',
                background: 'linear-gradient(135deg, rgba(103, 126, 234, 0.15) 0%, rgba(103, 126, 234, 0.25) 100%)',
                color: '#e0e0e0',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500
              }}
            >
              Continue with Discord
            </button>
            <button
              onClick={async () => {
                try {
                  // eslint-disable-next-line no-console
                  console.log('[AuthModal] Magic link clicked');
                  const supabase = getSupabase();
                  if (!supabase) {
                    // eslint-disable-next-line no-alert
                    window.alert('Supabase is not configured. Set VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, and VITE_FEATURE_SUPABASE=1.');
                    return;
                  }
                  // eslint-disable-next-line no-alert
                  const email = window.prompt('Enter your email to receive a magic login link:');
                  if (!email) { return; }
                  const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } });
                  if (error) {
                    // eslint-disable-next-line no-console
                    console.error('[AuthModal] Magic link error', error);
                    // eslint-disable-next-line no-alert
                    window.alert('Failed to send magic link.');
                  } else {
                    // eslint-disable-next-line no-alert
                    window.alert('Check your email for a magic login link.');
                  }
                } catch (e) {
                  // eslint-disable-next-line no-console
                  console.error('[AuthModal] Magic link exception', e);
                }
              }}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid rgba(103, 126, 234, 0.3)',
                background: 'linear-gradient(135deg, rgba(103, 126, 234, 0.15) 0%, rgba(103, 126, 234, 0.25) 100%)',
                color: '#e0e0e0',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500
              }}
            >
              Continue with Email (Magic Link)
            </button>
          </div>
          {activeTab === 'login' && (
            <div id="login-panel" role="tabpanel">
              <LoginForm
                onSuccess={handleAuthSuccess}
                onForgotPassword={handleForgotPassword}
              />
            </div>
          )}

          {activeTab === 'signup' && (
            <div id="signup-panel" role="tabpanel">
              <SignupForm onSuccess={handleAuthSuccess} />
            </div>
          )}

          {activeTab === 'reset' && (
            <PasswordReset onBack={handleBackToLogin} />
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid #333',
            backgroundColor: '#222',
            borderRadius: '0 0 12px 12px',
            fontSize: '13px',
            color: '#999',
            textAlign: 'center'
          }}
        >
          {activeTab === 'login' ? (
            <span>
              Don&apos;t have an account?{' '}
              <button
                onClick={() => handleTabChange('signup')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#60a5fa',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: 0,
                  font: 'inherit'
                }}
              >
                Sign up
              </button>
            </span>
          ) : activeTab === 'signup' ? (
            <span>
              Already have an account?{' '}
              <button
                onClick={() => handleTabChange('login')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#60a5fa',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: 0,
                  font: 'inherit'
                }}
              >
                Log in
              </button>
            </span>
          ) : (
            <span>
              Remember your password?{' '}
              <button
                onClick={handleBackToLogin}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#60a5fa',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: 0,
                  font: 'inherit'
                }}
              >
                Back to login
              </button>
            </span>
          )}
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
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
      `}</style>
    </div>
  );
}
