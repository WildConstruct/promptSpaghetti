import React, { Suspense, lazy, useEffect, useState } from 'react';
import { LaunchScreen } from './components/LaunchScreen/LaunchScreen';
import type { LaunchPayload } from './components/LaunchScreen/LaunchScreen';
import type { Node, Edge } from 'reactflow';
import type { PromptAnalysis } from './lib/simplePromptParser';
import { ThemeProvider } from './ThemeProvider';
import './App.css';

const Epic1EditorContainer = lazy(async () => {
  const module = await import('./Epic1Editor');
  return { default: module.Epic1EditorContainer };
});

const CardNormalizationScreen = lazy(async () => {
  const module = await import('./CardNormalization');
  return { default: module.CardNormalizationScreen };
});

const CARD_NORM_HASH = '#/card-normalization';
const isCardNormHash = () =>
  typeof window !== 'undefined' && window.location.hash === CARD_NORM_HASH;

// Version: 2025-01-10-20:10 - Fixed hyphenated API paths for Vercel
function App() {
  const [showLaunchScreen, setShowLaunchScreen] = useState<boolean>(() => {
    try {
      return !(
        typeof window !== 'undefined' &&
        window.localStorage.getItem('psg:last-view') === 'editor'
      );
    } catch {
      return true;
    }
  });
  const [initialAnalysis, setInitialAnalysis] = useState<
    PromptAnalysis | undefined
  >();
  const [initialGraph, setInitialGraph] = useState<
    { nodes: Node[]; edges: Edge[] } | undefined
  >();
  const [startWithTutorial, setStartWithTutorial] = useState(false);
  const [cardNormView, setCardNormView] = useState<boolean>(isCardNormHash);

  useEffect(() => {
    const onHash = () => setCardNormView(isCardNormHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const openCardNorm = () => {
    window.location.hash = CARD_NORM_HASH;
    setCardNormView(true);
  };
  const exitCardNorm = () => {
    if (window.location.hash === CARD_NORM_HASH) {
      window.location.hash = '';
    }
    setCardNormView(false);
  };

  const handleLaunch = (payload: LaunchPayload) => {
    if (payload.kind === 'analysis') {
      setInitialAnalysis(payload.analysis);
      setInitialGraph(undefined);
      setStartWithTutorial(false);
    } else if (payload.kind === 'template') {
      setInitialGraph(payload.graph);
      setInitialAnalysis(undefined);
      setStartWithTutorial(false);
    } else if (payload.kind === 'tutorial') {
      setInitialGraph(undefined);
      setInitialAnalysis(undefined);
      setStartWithTutorial(true);
    } else {
      setInitialGraph(undefined);
      setInitialAnalysis(undefined);
      setStartWithTutorial(false);
    }
    try {
      window.localStorage.setItem('psg:last-view', 'editor');
    } catch (error) {
      console.warn('[App] Failed to persist last view', error);
    }
    setShowLaunchScreen(false);
  };

  const handleBackToLaunch = () => {
    setInitialAnalysis(undefined);
    setInitialGraph(undefined);
    setStartWithTutorial(false);
    try {
      window.localStorage.setItem('psg:last-view', 'launch');
    } catch (error) {
      console.warn('[App] Failed to persist last view', error);
    }
    setShowLaunchScreen(true);
  };

  if (cardNormView) {
    return (
      <ThemeProvider>
        <Suspense
          fallback={
            <div
              style={{
                width: '100vw',
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#14161b',
                color: '#9aa1ad'
              }}
            >
              <div role="status" aria-live="polite">Loading card normalization…</div>
            </div>
          }
        >
          <CardNormalizationScreen onBack={exitCardNorm} />
        </Suspense>
      </ThemeProvider>
    );
  }

  if (showLaunchScreen) {
    return (
      <ThemeProvider>
        <LaunchScreen onLaunch={handleLaunch} />
        <button
          type="button"
          onClick={openCardNorm}
          style={{
            position: 'fixed',
            right: 16,
            bottom: 16,
            zIndex: 50,
            padding: '8px 12px',
            borderRadius: 8,
            border: '0.5px solid rgba(245,200,74,0.5)',
            background: 'rgba(31,35,42,0.92)',
            color: '#f5c84a',
            fontSize: 12,
            cursor: 'pointer'
          }}
        >
          Card normalization demo →
        </button>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <Suspense
        fallback={
          <div
            className="App"
            style={{
              width: '100vw',
              height: '100vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div role="status" aria-live="polite">
              Loading editor...
            </div>
          </div>
        }
      >
        <div className="App" style={{ width: '100vw', height: '100vh' }}>
          <Epic1EditorContainer
            showPreview={true}
            showAssetLibrary={true}
            assetLibraryPosition="right"
            showMenuBar={true}
            showOnboarding={false}
            initialAnalysis={initialAnalysis}
            initialGraph={initialGraph}
            startWithTutorial={startWithTutorial}
            onBackToLaunch={handleBackToLaunch}
          />
        </div>
      </Suspense>
    </ThemeProvider>
  );
}

export default App;
