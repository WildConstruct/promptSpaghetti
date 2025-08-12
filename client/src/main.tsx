import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './Epic1ReactFlowFix.css';

declare global {
  interface Window {
    React?: typeof React;
  }
}

// Debug: Set React on window for debugging multiple React instances
if (typeof window !== 'undefined') {
  window.React = React;
  console.log('[Main] React version:', React.version);
}

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
