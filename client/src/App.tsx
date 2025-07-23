import React, { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { ReactFlowProvider } from 'reactflow';
import { GraphEditor, RandomizerPanel } from './core';
import EpicDashboard from './components/EpicDashboard';
import 'reactflow/dist/style.css';
import './randomizer.css';

/**
 * Main application interface with tab navigation.
 * Handles graph editor and LLM randomizer functionality.
 */
function MainApp() {
  const location = useLocation();
  const navigate = useNavigate();
  const [generatedGraph, setGeneratedGraph] = useState<unknown>(null);

  // Determine active tab based on current route (simplified, no auth)
  const activeTab = location.pathname === '/randomizer' ? 'randomizer' : 
    location.pathname === '/epic-status' ? 'epic-status' : 'editor';

  const handleTabChange = useCallback((tab: 'editor' | 'randomizer' | 'epic-status') => {
    const paths = {
      editor: '/',
      randomizer: '/randomizer',
      'epic-status': '/epic-status'
    };
    navigate(paths[tab] || '/');
  }, [navigate]);

  const handleGraphGenerated = useCallback((graph: unknown) => {
    setGeneratedGraph(graph);
    navigate('/'); // Navigate to editor tab
  }, [navigate]);

  const handleRandomizerError = useCallback((error: Error) => {
    console.error('Randomizer error:', error);
    alert(`Generation failed: ${error.message}`);
  }, []);

  return (
    <ReactFlowProvider>
      <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header with Tab Navigation (Auth disabled) */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          borderBottom: '1px solid #ccc', 
          backgroundColor: '#f5f5f5',
          padding: '0'
        }}>
          <div style={{ display: 'flex' }}>
            <button
              onClick={() => handleTabChange('editor')}
              style={{
                padding: '10px 20px',
                border: 'none',
                backgroundColor: activeTab === 'editor' ? '#fff' : 'transparent',
                borderBottom: activeTab === 'editor' ? '2px solid #007bff' : '2px solid transparent',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: activeTab === 'editor' ? 'bold' : 'normal'
              }}
            >
              Graph Editor
            </button>
            <button
              onClick={() => handleTabChange('randomizer')}
              style={{
                padding: '10px 20px',
                border: 'none',
                backgroundColor: activeTab === 'randomizer' ? '#fff' : 'transparent',
                borderBottom: activeTab === 'randomizer' ? '2px solid #007bff' : '2px solid transparent',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: activeTab === 'randomizer' ? 'bold' : 'normal'
              }}
            >
              LLM Randomizer
            </button>
            <button
              onClick={() => handleTabChange('epic-status')}
              style={{
                padding: '10px 20px',
                border: 'none',
                backgroundColor: activeTab === 'epic-status' ? '#fff' : 'transparent',
                borderBottom: activeTab === 'epic-status' ? '2px solid #007bff' : '2px solid transparent',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: activeTab === 'epic-status' ? 'bold' : 'normal'
              }}
            >
              Epic Status
            </button>
          </div>
          
          {/* Status indicator */}
          <div style={{ display: 'flex', alignItems: 'center', paddingRight: '20px', color: '#666', fontSize: '14px' }}>
            Authentication Disabled (Dev Mode)
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {activeTab === 'editor' ? (
            <GraphEditor 
              initialNodes={generatedGraph?.nodes || []}
              initialEdges={generatedGraph?.edges || []}
            />
          ) : activeTab === 'randomizer' ? (
            <div style={{ 
              padding: '20px', 
              height: '100%', 
              overflow: 'auto',
              backgroundColor: '#f8f9fa'
            }}>
              <RandomizerPanel
                onGraphGenerated={handleGraphGenerated}
                onError={handleRandomizerError}
                className="randomizer-main"
              />
            </div>
          ) : (
            <EpicDashboard />
          )}
        </div>
      </div>
    </ReactFlowProvider>
  );
}

/**
 * Root App component with routing.
 * Simplified version with authentication disabled.
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main routes (no authentication) */}
        <Route path="/" element={<MainApp />} />
        <Route path="/randomizer" element={<MainApp />} />
        <Route path="/epic-status" element={<MainApp />} />
        
        {/* Catch-all redirect to main app */}
        <Route path="*" element={<MainApp />} />
      </Routes>
    </BrowserRouter>
  );
}