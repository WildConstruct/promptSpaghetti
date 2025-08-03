import React from 'react';
import { Epic1EditorContainerFixed } from './Epic1EditorContainerFixed';
import './App.css';

function App() {
  console.log('App component rendering with Epic 1 Editor...');
  
  // Always render the real Epic1GraphEditor
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