import React, { useState } from 'react';
import { Epic1EditorContainer } from './Epic1Editor';
import { LaunchScreen } from './components/LaunchScreen/LaunchScreen';
import type { PromptAnalysis } from '../../packages/core/runtime/nodes/epic1/PromptParser';
import './App.css';

function App() {
  const [showLaunchScreen, setShowLaunchScreen] = useState(true);
  const [initialAnalysis, setInitialAnalysis] = useState<PromptAnalysis | undefined>();

  const handleLaunch = (analysis?: PromptAnalysis) => {
    setInitialAnalysis(analysis);
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
      />
    </div>
  );
}

export default App;