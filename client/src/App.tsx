import React, { useState } from 'react';
import { Epic1EditorContainer } from './Epic1Editor';
import { LaunchScreen } from './components/LaunchScreen/LaunchScreen';
import type { LaunchPayload } from './components/LaunchScreen/LaunchScreen';
import type { Node, Edge } from 'reactflow';
import type { PromptAnalysis } from './lib/simplePromptParser';
import { ThemeProvider } from './ThemeProvider';
import './App.css';

// Version: 2025-01-10-20:10 - Fixed hyphenated API paths for Vercel
function App() {
  const [showLaunchScreen, setShowLaunchScreen] = useState<boolean>(() => {
    try {
      return (typeof window !== 'undefined' && window.localStorage.getItem('psg:last-view') === 'editor') ? false : true;
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
    try { window.localStorage.setItem('psg:last-view', 'editor'); } catch {}
    setShowLaunchScreen(false);
  };

  const handleBackToLaunch = () => {
    setInitialAnalysis(undefined);
    setInitialGraph(undefined);
    setStartWithTutorial(false);
    try {
      window.localStorage.setItem('psg:last-view', 'launch');
    } catch {}
    setShowLaunchScreen(true);
  };

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
          startWithTutorial={startWithTutorial}
          onBackToLaunch={handleBackToLaunch}
        />
      </div>
    </ThemeProvider>
  );
}

export default App;
