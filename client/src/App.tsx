import React, { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import 'reactflow/dist/style.css';
import './randomizer.css';
import './professional-theme.css';

import EnhancedGraphEditor from './components/EnhancedGraphEditor';

interface GraphEditorProps {
  initialNodes?: unknown[];
  initialEdges?: unknown[];
}

interface RandomizerPanelProps {
  onGraphGenerated?: (graph: unknown) => void;
  onError?: (error: Error) => void;
  className?: string;
}

// Enhanced import approach - try full core, fallback to enhanced editor with professional features
let GraphEditor: React.ComponentType<GraphEditorProps> = EnhancedGraphEditor;
let RandomizerPanel: React.ComponentType<RandomizerPanelProps>;
let isEnhancedMode = false;

try {
  // Try to import full core components (works in development)
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const coreModule = require('./core');
  if (coreModule.GraphEditor && coreModule.RandomizerPanel) {
    GraphEditor = coreModule.GraphEditor;
    RandomizerPanel = coreModule.RandomizerPanel;
    isEnhancedMode = true;
  } else {
    throw new Error('Core components not fully available');
  }
} catch {
  console.warn('⚠️ Using enhanced components with professional features for deployment compatibility');
  
  // Use EnhancedGraphEditor which includes professional features
  GraphEditor = EnhancedGraphEditor;
  
  // Browser-safe RandomizerPanel for deployment
  const BrowserSafeRandomizerPanel: React.FC<RandomizerPanelProps> = () => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      backgroundColor: 'var(--color-bg-primary, #1e1e1e)',
      flexDirection: 'column',
      padding: '40px'
    }}>
      <div style={{
        fontSize: '32px',
        fontWeight: 'bold',
        marginBottom: '20px',
        color: 'var(--color-text-primary, #e8e8e8)'
      }}>
        🎲 Professional Graph Editor
      </div>
      <div style={{
        fontSize: '18px',
        color: 'var(--color-text-secondary, #b8b8b8)',
        textAlign: 'center',
        maxWidth: '600px',
        lineHeight: 1.6,
        marginBottom: '20px'
      }}>
        The professional-grade nodal prompt randomizer with Cinema 4D-inspired design.
        Full professional features are available in the Graph Editor.
      </div>
      <div style={{
        fontSize: '14px',
        color: 'var(--color-text-secondary, #b8b8b8)',
        textAlign: 'center',
        fontStyle: 'italic'
      }}>
        Command palette, undo/redo, multi-selection, and keyboard shortcuts included.
      </div>
    </div>
  );
  
  RandomizerPanel = BrowserSafeRandomizerPanel;
}

/**
 * Main application interface with tab navigation.
 * Handles graph editor and LLM randomizer functionality.
 */
function MainApp(): React.ReactElement {
  const location = useLocation();
  const navigate = useNavigate();
  const [generatedGraph, setGeneratedGraph] = useState<unknown>(null);

  // Determine active tab based on current route (simplified, no auth)
  const getActiveTab = (): string => {
    if (location.pathname === '/randomizer') return 'randomizer';
    if (location.pathname === '/files') return 'files';
    return 'editor';
  };
  const activeTab = getActiveTab();

  const handleTabChange = useCallback((tab: 'editor' | 'randomizer' | 'files') => {
    const paths = {
      editor: '/',
      randomizer: '/randomizer',
      files: '/files'
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
        </div>
          
          {/* Status indicator */}
          <div style={{ display: 'flex', alignItems: 'center', paddingRight: '20px', color: 'var(
            --color-text-secondary,
            #666
          )', fontSize: '14px' }}>
            {isEnhancedMode ? '🚀 Core Enhanced' : '🎨 Professional Mode'} | Cinema 4D Design
          </div>
        </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {activeTab === 'editor' ? (
          <GraphEditor 
            initialNodes={(generatedGraph as { nodes?: unknown[] })?.nodes || []}
            initialEdges={(generatedGraph as { edges?: unknown[] })?.edges || []}
          />
        ) : (
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
        )}
      </div>
    </div>
  );
}

/**
 * Root App component with routing.
 * Simplified version with authentication disabled.
 */
export default function App(): React.ReactElement {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main routes (no authentication) */}
        <Route path="/" element={<MainApp />} />
        <Route path="/randomizer" element={<MainApp />} />
        
        {/* Catch-all redirect to main app */}
        <Route path="*" element={<MainApp />} />
      </Routes>
    </BrowserRouter>
  );
}