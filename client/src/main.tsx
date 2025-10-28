import React from 'react';
import './sentry';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './Epic1ReactFlowFix.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element with id "root" not found');
}

ReactDOM.createRoot(rootElement).render(<App />);
