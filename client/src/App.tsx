import React from 'react';
import { MinimalGraphEditor } from './components/MinimalGraphEditor';
import { ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';
import './App.css';

function App() {
  return (
    <ReactFlowProvider>
      <div className="App">
        <MinimalGraphEditor />
      </div>
    </ReactFlowProvider>
  );
}

export default App;