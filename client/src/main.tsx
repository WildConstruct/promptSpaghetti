import './env-shim';
import React from 'react';
import './sentry';
import ReactDOM from 'react-dom/client';
import { getSupabase } from '@promptscape/core/utils/supabaseClient';
import App from './App';
import './index.css';
import './Epic1ReactFlowFix.css';

// Eagerly initialize Supabase so it can process OAuth URL hash (#access_token)
try {
  const sb = getSupabase();
  if (sb) {
    // Trigger session resolution; then clean up the URL hash
    sb.auth.getSession().finally(() => {
      if (
        typeof window !== 'undefined' &&
        window.location.hash &&
        (window.location.hash.includes('access_token') ||
          window.location.hash.includes('error_description'))
      ) {
        window.history.replaceState(
          null,
          '',
          window.location.origin + window.location.pathname + window.location.search
        );
      }
    });
  }
} catch {
  void 0;
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element with id "root" not found');
}

ReactDOM.createRoot(rootElement).render(<App />);
