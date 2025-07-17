import React, { useState, useCallback } from "react";
import { ReactFlowProvider } from "reactflow";
import { GraphEditor, RandomizerPanel } from "./core";
import "reactflow/dist/style.css";
import "./randomizer.css";

/**
 * Main client application component.
 * Includes both regular graph editor and LLM randomizer functionality.
 */
export default function App() {
  const [activeTab, setActiveTab] = useState<'editor' | 'randomizer'>('editor');
  const [generatedGraph, setGeneratedGraph] = useState<any>(null);

  const handleGraphGenerated = useCallback((graph: any) => {
    setGeneratedGraph(graph);
    setActiveTab('editor');
  }, []);

  const handleRandomizerError = useCallback((error: Error) => {
    console.error('Randomizer error:', error);
    alert(`Generation failed: ${error.message}`);
  }, []);

  return (
    <ReactFlowProvider>
      <div style={{ width: "100vw", height: "100vh", display: "flex", flexDirection: "column" }}>
        {/* Tab Navigation */}
        <div style={{ 
          display: "flex", 
          borderBottom: "1px solid #ccc", 
          backgroundColor: "#f5f5f5",
          padding: "0"
        }}>
          <button
            onClick={() => setActiveTab('editor')}
            style={{
              padding: "10px 20px",
              border: "none",
              backgroundColor: activeTab === 'editor' ? '#fff' : 'transparent',
              borderBottom: activeTab === 'editor' ? '2px solid #007bff' : '2px solid transparent',
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: activeTab === 'editor' ? 'bold' : 'normal'
            }}
          >
            Graph Editor
          </button>
          <button
            onClick={() => setActiveTab('randomizer')}
            style={{
              padding: "10px 20px",
              border: "none",
              backgroundColor: activeTab === 'randomizer' ? '#fff' : 'transparent',
              borderBottom: activeTab === 'randomizer' ? '2px solid #007bff' : '2px solid transparent',
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: activeTab === 'randomizer' ? 'bold' : 'normal'
            }}
          >
            LLM Randomizer
          </button>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, overflow: "hidden" }}>
          {activeTab === 'editor' ? (
            <GraphEditor 
              initialNodes={generatedGraph?.nodes || []}
              initialEdges={generatedGraph?.edges || []}
            />
          ) : (
            <div style={{ 
              padding: "20px", 
              height: "100%", 
              overflow: "auto",
              backgroundColor: "#f8f9fa"
            }}>
              <RandomizerPanel
                onGraphGenerated={handleGraphGenerated}
                onError={handleRandomizerError}
                className="randomizer-main"
              />
            </div>
          )}
        </div>
      </div>
    </ReactFlowProvider>
  );
}