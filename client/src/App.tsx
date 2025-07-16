import React from "react";
import { ReactFlowProvider } from "reactflow";
import { GraphEditor } from "./core";
import "reactflow/dist/style.css";

/**
 * Main client application component.
 * Uses the refactored GraphEditor from the core package with integrated Inspector system.
 */
export default function App() {
  return (
    <ReactFlowProvider>
      <div style={{ width: "100vw", height: "100vh" }}>
        <GraphEditor 
          initialNodes={[]}
          initialEdges={[]}
        />
      </div>
    </ReactFlowProvider>
  );
}