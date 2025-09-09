import React, { useState } from 'react';
import { Epic1EditorContainer } from './Epic1Editor';
import { LaunchScreen } from './components/LaunchScreen/LaunchScreen';
import type { LaunchPayload } from './components/LaunchScreen/LaunchScreen';
import type { Node, Edge } from 'reactflow';
import type { PromptAnalysis } from './lib/simplePromptParser';
import './App.css';

function App() {
  const [showLaunchScreen, setShowLaunchScreen] = useState(true);
  const [initialAnalysis, setInitialAnalysis] = useState<
    PromptAnalysis | undefined
  >();
  const [initialGraph, setInitialGraph] = useState<
    { nodes: Node[]; edges: Edge[] } | undefined
  >();

  const handleLaunch = (payload: LaunchPayload) => {
    if (payload.kind === 'analysis') {
      setInitialAnalysis(payload.analysis);
      setInitialGraph(undefined);
    } else if (payload.kind === 'template') {
      setInitialGraph(payload.graph);
      setInitialAnalysis(undefined);
    } else {
      setInitialGraph(undefined);
      setInitialAnalysis(undefined);
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
      />
    </div>
  );
}

export default App;
