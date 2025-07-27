import React, { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import 'reactflow/dist/style.css';
import './randomizer.css';
import './professional-theme.css';

import EnhancedGraphEditor from './components/EnhancedGraphEditor';
import { NodePrototypePage } from './components/NodePrototype';

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
    if (location.pathname === '/prototype') return 'prototype';
    return 'editor';
  };
  const activeTab = getActiveTab();

  const handleTabChange = useCallback((tab: 'editor' | 'randomizer' | 'files' | 'prototype') => {
    const paths = {
      editor: '/',
      randomizer: '/randomizer',
      files: '/files',
      prototype: '/prototype'
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
        borderBottom: '1px solid var(--color-ui-border, #404040)', 
        backgroundColor: 'var(--color-bg-secondary, #2a2a2a)',
        padding: '0'
      }}>
        <div style={{ display: 'flex' }}>
          <button
            onClick={() => handleTabChange('editor')}
            style={{
              padding: '10px 20px',
              border: 'none',
              backgroundColor: activeTab === 'editor' ? 'var(--color-bg-primary, #1e1e1e)' : 'transparent',
              borderBottom: activeTab === 'editor' ? '2px solid var(--color-accent-orange, #ff7c00)' : '2px solid transparent',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: activeTab === 'editor' ? 'bold' : 'normal',
              color: 'var(--color-text-primary, #e8e8e8)'
            }}
          >
            Graph Editor
          </button>
          <button
            onClick={() => handleTabChange('randomizer')}
            style={{
              padding: '10px 20px',
              border: 'none',
              backgroundColor: activeTab === 'randomizer' ? 'var(--color-bg-primary, #1e1e1e)' : 'transparent',
              borderBottom: activeTab === 'randomizer' ? '2px solid var(--color-accent-orange, #ff7c00)' : '2px solid transparent',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: activeTab === 'randomizer' ? 'bold' : 'normal',
              color: 'var(--color-text-primary, #e8e8e8)'
            }}
          >
            LLM Randomizer
          </button>
          <button
            onClick={() => handleTabChange('files')}
            style={{
              padding: '10px 20px',
              border: 'none',
              backgroundColor: activeTab === 'files' ? 'var(--color-bg-primary, #1e1e1e)' : 'transparent',
              borderBottom: activeTab === 'files' ? '2px solid var(--color-accent-orange, #ff7c00)' : '2px solid transparent',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: activeTab === 'files' ? 'bold' : 'normal',
              color: 'var(--color-text-primary, #e8e8e8)'
            }}
          >
            Files
          </button>
          <button
            onClick={() => handleTabChange('prototype')}
            style={{
              padding: '10px 20px',
              border: 'none',
              backgroundColor: activeTab === 'prototype' ? 'var(--color-bg-primary, #1e1e1e)' : 'transparent',
              borderBottom: activeTab === 'prototype' ? '2px solid var(--color-accent-orange, #ff7c00)' : '2px solid transparent',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: activeTab === 'prototype' ? 'bold' : 'normal',
              color: 'var(--color-text-primary, #e8e8e8)'
            }}
          >
            Prototype
          </button>
        </div>
          
          {/* Status indicator */}
          <div style={{ display: 'flex', alignItems: 'center', paddingRight: '20px', color: 'var(--color-text-secondary, #666)', fontSize: '14px' }}>
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
        ) : activeTab === 'randomizer' ? (
          <div style={{ 
            padding: '20px', 
            height: '100%', 
            overflow: 'auto',
            backgroundColor: 'var(--color-bg-primary, #1e1e1e)'
          }}>
            <RandomizerPanel
              onGraphGenerated={handleGraphGenerated}
              onError={handleRandomizerError}
              className="randomizer-main"
            />
          </div>
        ) : activeTab === 'prototype' ? (
          <NodePrototypePage />
        ) : (
          <div style={{ 
            padding: '20px', 
            height: '100%', 
            overflow: 'auto',
            backgroundColor: 'var(--color-bg-primary, #1e1e1e)',
            color: 'var(--color-text-primary, #e8e8e8)'
          }}>
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold',
              marginBottom: '20px',
              color: 'var(--color-text-primary, #e8e8e8)'
            }}>
              📁 File Browser
            </div>
            <div style={{
              fontSize: '16px',
              color: 'var(--color-text-secondary, #b8b8b8)',
              marginBottom: '30px'
            }}>
              Manage your saved graphs and project files
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '16px',
              marginBottom: '30px'
            }}>
              <div style={{
                background: 'var(--color-bg-secondary, #2a2a2a)',
                border: '1px solid var(--color-ui-border, #404040)',
                borderRadius: '8px',
                padding: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}>
                <div style={{ fontSize: '18px', marginBottom: '8px' }}>📊 Recent Graphs</div>
                <div style={{ fontSize: '14px', color: 'var(--color-text-secondary, #b8b8b8)' }}>
                  View and load recently saved graphs
                </div>
              </div>
              
              <div style={{
                background: 'var(--color-bg-secondary, #2a2a2a)',
                border: '1px solid var(--color-ui-border, #404040)',
                borderRadius: '8px',
                padding: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}>
                <div style={{ fontSize: '18px', marginBottom: '8px' }}>📂 Project Templates</div>
                <div style={{ fontSize: '14px', color: 'var(--color-text-secondary, #b8b8b8)' }}>
                  Browse pre-built graph templates
                </div>
              </div>
              
              <div style={{
                background: 'var(--color-bg-secondary, #2a2a2a)',
                border: '1px solid var(--color-ui-border, #404040)',
                borderRadius: '8px',
                padding: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}>
                <div style={{ fontSize: '18px', marginBottom: '8px' }}>💾 Export/Import</div>
                <div style={{ fontSize: '14px', color: 'var(--color-text-secondary, #b8b8b8)' }}>
                  Manage file imports and exports
                </div>
              </div>
            </div>
            
            <div style={{
              fontSize: '14px',
              color: 'var(--color-text-secondary, #b8b8b8)',
              fontStyle: 'italic',
              textAlign: 'center',
              padding: '20px'
            }}>
              Professional file management coming soon - use save/load in the Graph Editor for now
            </div>
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
        <Route path="/files" element={<MainApp />} />
        <Route path="/prototype" element={<MainApp />} />
        
        {/* Catch-all redirect to main app */}
        <Route path="*" element={<MainApp />} />
      </Routes>
    </BrowserRouter>
  );
}