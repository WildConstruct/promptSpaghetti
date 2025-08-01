import React from 'react';
import { GraphEditor } from '@promptscape/core/GraphEditor';
import { ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';
import './App.css';

function App() {
  return (
    <div className="App">
      <ReactFlowProvider>
        <div className="graph-editor-container">
          <GraphEditor />
        </div>
      </ReactFlowProvider>
    </div>
  );
}

export default App;