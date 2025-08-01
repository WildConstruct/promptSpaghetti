import React from 'react';
import { Epic1GraphEditorWithProvider } from '@promptscape/core/components/epic1';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import 'reactflow/dist/style.css';
import './App.css';

function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="App" style={{ width: '100vw', height: '100vh' }}>
        <Epic1GraphEditorWithProvider 
          showPreview={true}
          showAssetLibrary={true}
          previewPosition="right"
          assetLibraryPosition="left"
        />
      </div>
    </DndProvider>
  );
}

export default App;