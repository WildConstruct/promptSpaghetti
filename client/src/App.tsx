import React from 'react';
import { Epic1EditorContainer } from './Epic1Editor';
import './App.css';

function App() {
  return (
    <div className="App" style={{ width: '100vw', height: '100vh' }}>
      <Epic1EditorContainer 
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