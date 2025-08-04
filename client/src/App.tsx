import React from 'react';
import { Epic1EditorContainerFixed } from './Epic1EditorContainerFixed';
import { FrameEdgeNodes } from './FrameEdgeNodes';
import './App.css';

function App() {
  console.log('App component rendering with Frame Edge Nodes test...');
  
  // Switch back to Epic1 editor with fixed positioning
  const testFrameEdges = false;
  
  if (testFrameEdges) {
    return <FrameEdgeNodes />;
  }
  
  return (
    <div className="App" style={{ width: '100vw', height: '100vh' }}>
      <Epic1EditorContainerFixed 
        showPreview={true}
        showAssetLibrary={true}
        assetLibraryPosition="right"
        showMenuBar={true}
        showOnboarding={false}
      />
    </div>
  );
}

export default App;