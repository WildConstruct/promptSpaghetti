import React, { useEffect, useRef } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@promptscape/core/utils/supabaseClient';

export type AuthTab = 'login' | 'signup' | 'reset';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: User) => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      setTimeout(() => modalRef.current?.focus(), 50);
    } else {
      previousFocusRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000
      }}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        style={{
          backgroundColor: '#1a1a1a',
          borderRadius: 12,
          width: '90%',
          maxWidth: 440,
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
          border: '1px solid #333'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #333' }}>
          <h2 id="auth-modal-title" style={{ margin: 0, color: '#e0e0e0', fontSize: 20 }}>Sign in</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ background: 'none', border: 'none', color: '#999', fontSize: 22, cursor: 'pointer' }}
          >
            ×
          </button>
        </div>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            onClick={async () => {
              try {
                // eslint-disable-next-line no-console
                console.log('[Client.AuthModal] Google clicked');
                if (!supabase) {
                  // eslint-disable-next-line no-alert
                  window.alert('Supabase is not configured. Set VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, and VITE_FEATURE_SUPABASE=1.');
                  return;
                }
                const { data, error } = await supabase.auth.signInWithOAuth({
                  provider: 'google',
                  options: { redirectTo: window.location.origin, skipBrowserRedirect: true }
                });
                if (error) {
                  // eslint-disable-next-line no-console
                  console.error('[Client.AuthModal] Google OAuth error', error);
                  // eslint-disable-next-line no-alert
                  window.alert('Failed to start Google sign-in.');
                } else if (data?.url) {
                  window.location.assign(data.url);
                }
              } catch (e) {
                // eslint-disable-next-line no-console
                console.error('[Client.AuthModal] Google OAuth exception', e);
              }
            }}
            className="auth-button"
            style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid rgba(103,126,234,0.3)', background: 'linear-gradient(135deg, rgba(103,126,234,0.15), rgba(103,126,234,0.25))', color: '#e0e0e0', cursor: 'pointer' }}
          >
            Continue with Google
          </button>
          <button
            onClick={async () => {
              try {
                // eslint-disable-next-line no-console
                console.log('[Client.AuthModal] Discord clicked');
                if (!supabase) {
                  // eslint-disable-next-line no-alert
                  window.alert('Supabase is not configured. Set VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, and VITE_FEATURE_SUPABASE=1.');
                  return;
                }
                const { data, error } = await supabase.auth.signInWithOAuth({
                  provider: 'discord',
                  options: { redirectTo: window.location.origin, skipBrowserRedirect: true }
                });
                if (error) {
                  // eslint-disable-next-line no-console
                  console.error('[Client.AuthModal] Discord OAuth error', error);
                  // eslint-disable-next-line no-alert
                  window.alert('Failed to start Discord sign-in.');
                } else if (data?.url) {
                  window.location.assign(data.url);
                }
              } catch (e) {
                // eslint-disable-next-line no-console
                console.error('[Client.AuthModal] Discord OAuth exception', e);
              }
            }}
            className="auth-button"
            style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid rgba(103,126,234,0.3)', background: 'linear-gradient(135deg, rgba(103,126,234,0.15), rgba(103,126,234,0.25))', color: '#e0e0e0', cursor: 'pointer' }}
          >
            Continue with Discord
          </button>
          <button
            onClick={async () => {
              try {
                // eslint-disable-next-line no-console
                console.log('[Client.AuthModal] Magic link clicked');
                if (!supabase) {
                  // eslint-disable-next-line no-alert
                  window.alert('Supabase is not configured. Set VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, and VITE_FEATURE_SUPABASE=1.');
                  return;
                }
                const email = window.prompt('Enter your email to receive a magic login link:');
                if (!email) return;
                const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } });
                if (error) {
                  // eslint-disable-next-line no-console
                  console.error('[Client.AuthModal] Magic link error', error);
                  // eslint-disable-next-line no-alert
                  window.alert('Failed to send magic link.');
                } else {
                  // eslint-disable-next-line no-alert
                  window.alert('Check your email for a magic login link.');
                }
              } catch (e) {
                // eslint-disable-next-line no-console
                console.error('[Client.AuthModal] Magic link exception', e);
              }
            }}
            className="auth-button"
            style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid rgba(103,126,234,0.3)', background: 'linear-gradient(135deg, rgba(103,126,234,0.15), rgba(103,126,234,0.25))', color: '#e0e0e0', cursor: 'pointer' }}
          >
            Continue with Email (Magic Link)
          </button>
        </div>
      </div>
    </div>
  );
}
