import React, { useState } from 'react';
import { Epic1EditorContainer } from './Epic1Editor';
import { LaunchScreen } from './components/LaunchScreen/LaunchScreen';
import type { LaunchPayload } from './components/LaunchScreen/LaunchScreen';
import type { Node, Edge } from 'reactflow';
import type { PromptAnalysis } from './lib/simplePromptParser';
import './App.css';

// Version: 2025-01-10-20:10 - Fixed hyphenated API paths for Vercel
function App() {
  const [showLaunchScreen, setShowLaunchScreen] = useState(true);
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
    setShowLaunchScreen(false);
  };

  if (showLaunchScreen) {
    return <LaunchScreen onLaunch={handleLaunch} />;
  }

  return (
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
      />
    </div>
  );
}

export default App;
