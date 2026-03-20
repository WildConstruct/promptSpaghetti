import React, { useEffect, useMemo, useState } from 'react';
import { Epic1EditorContainer } from './Epic1Editor';
import { LaunchScreen } from './components/LaunchScreen/LaunchScreen';
import type { LaunchPayload } from './components/LaunchScreen/LaunchScreen';
import {
  LegalPage,
  type LegalDocumentKey
} from './components/LegalPage/LegalPage';
import type { Node, Edge } from 'reactflow';
import type { PromptAnalysis } from './lib/simplePromptParser';
import { ThemeProvider } from './ThemeProvider';
import { readScenePreviewV1Flag } from './utils/featureFlags';
import { readInitialEditorSeedFromStorage } from './utils/initialEditorSeed';
import './App.css';

function getLegalDocumentFromHash(hash: string): LegalDocumentKey | null {
  const normalized = hash.replace(/^#/, '').toLowerCase();

  if (normalized === 'legal/terms') {
    return 'terms';
  }

  if (normalized === 'legal/privacy') {
    return 'privacy';
  }

  if (normalized === 'legal/acceptable-use') {
    return 'acceptable-use';
  }

  return null;
}

// Version: 2025-01-10-20:10 - Fixed hyphenated API paths for Vercel
function App() {
  const [legalDocument, setLegalDocument] = useState<LegalDocumentKey | null>(
    () => {
      if (typeof window === 'undefined') {
        return null;
      }

      return getLegalDocumentFromHash(window.location.hash);
    }
  );
  const [showLaunchScreen, setShowLaunchScreen] = useState<boolean>(() => {
    try {
      return typeof window !== 'undefined' &&
        window.localStorage.getItem('psg:last-view') === 'editor'
        ? false
        : true;
    } catch {
      return true;
    }
  });
  const [initialAnalysis, setInitialAnalysis] = useState<
    PromptAnalysis | undefined
  >();
  const [initialGraph, setInitialGraph] = useState<
    { nodes: Node[]; edges: Edge[] } | undefined
  >(() => {
    try {
      if (typeof window === 'undefined') {
        return undefined;
      }

      return readInitialEditorSeedFromStorage(window.localStorage);
    } catch {
      return undefined;
    }
  });
  const [startWithTutorial, setStartWithTutorial] = useState(false);
  const [scenePreviewV1Enabled] = useState<boolean>(() => {
    try {
      if (typeof window === 'undefined') {
        return false;
      }

      return readScenePreviewV1Flag(window.localStorage);
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleHashChange = () => {
      setLegalDocument(getLegalDocumentFromHash(window.location.hash));
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const legalPage = useMemo(() => {
    if (!legalDocument) {
      return null;
    }

    return (
      <ThemeProvider>
        <LegalPage
          documentKey={legalDocument}
          onBack={() => {
            if (typeof window === 'undefined') {
              return;
            }

            window.history.replaceState(
              null,
              '',
              window.location.pathname + window.location.search
            );
            setLegalDocument(null);
          }}
        />
      </ThemeProvider>
    );
  }, [legalDocument]);

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
    } catch {
      return;
    }
    setShowLaunchScreen(false);
  };

  const handleBackToLaunch = () => {
    setInitialAnalysis(undefined);
    setInitialGraph(undefined);
    setStartWithTutorial(false);
    try {
      window.localStorage.setItem('psg:last-view', 'launch');
    } catch {
      return;
    }
    setShowLaunchScreen(true);
  };

  if (legalPage) {
    return legalPage;
  }

  if (showLaunchScreen) {
    return (
      <ThemeProvider>
        <LaunchScreen onLaunch={handleLaunch} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <div className="App" style={{ width: '100vw', height: '100vh' }}>
        <Epic1EditorContainer
          showPreview={true}
          showAssetLibrary={true}
          assetLibraryPosition="right"
          showMenuBar={true}
          showOnboarding={false}
          initialAnalysis={initialAnalysis}
          initialGraph={initialGraph}
          scenePreviewV1Enabled={scenePreviewV1Enabled}
          startWithTutorial={startWithTutorial}
          onBackToLaunch={handleBackToLaunch}
        />
      </div>
    </ThemeProvider>
  );
}

export default App;
