import React, { useEffect, useState, useCallback } from 'react';
import ReactFlow, { ReactFlowProvider, Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';
import { ToastContainer, useToast } from './Toast';
import { ellipticalFrameLayout, type LayoutOptions } from '@promptscape/core/utils/frameLayouts';

// Import CSS files needed for Epic1
import '@promptscape/core/components/epic1/Epic1GraphEditor.css';
import '@promptscape/core/components/epic1/nodes/BaseEditableNode.css';
import '@promptscape/core/components/epic1/nodes/NodeStyles.css';

interface Epic1EditorContainerProps {
  showPreview?: boolean;
  showAssetLibrary?: boolean;
  assetLibraryPosition?: 'left' | 'right';
  showMenuBar?: boolean;
  showOnboarding?: boolean;
}

// Simple fallback component
const FallbackEditor = () => {
  const initialNodes: Node[] = [
    {
      id: '1',
      type: 'default',
      position: { x: 250, y: 100 },
      data: { label: 'Epic1 Editor is loading...' }
    }
  ];

  return (
    <ReactFlow
      nodes={initialNodes}
      edges={[]}
      fitView
    />
  );
};

export const Epic1EditorContainer: React.FC<Epic1EditorContainerProps> = ({
  showPreview = true,
  showAssetLibrary = true,
  assetLibraryPosition = 'right', // Changed default to right per QA review
  showMenuBar = true,
  showOnboarding = true
}) => {
  const [EditorComponent, setEditorComponent] = useState<React.ComponentType<any> | null>(null);
  const [MenuBarComponent, setMenuBarComponent] = useState<React.ComponentType<any> | null>(null);
  const [OnboardingComponent, setOnboardingComponent] = useState<React.ComponentType<any> | null>(null);
  const [loadError, setLoadError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(() => {
    return localStorage.getItem('epic1-onboarding-seen') === 'true';
  });
  
  // Graph state management
  const [currentNodes, setCurrentNodes] = useState<Node[]>([]);
  const [currentEdges, setCurrentEdges] = useState<Edge[]>([]);
  
  // History for undo/redo - initialize with empty state
  const [history, setHistory] = useState<{ nodes: Node[], edges: Edge[] }[]>([{ nodes: [], edges: [] }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [clipboard, setClipboard] = useState<{ nodes: Node[], edges: Edge[] } | null>(null);

  // Menu bar handlers - MUST be defined before any conditional returns
  const handleNew = useCallback(() => {
    if (window.confirm('Create a new graph? Any unsaved changes will be lost.')) {
      // Reset to initial nodes and edges
      setCurrentNodes(initialNodes);
      setCurrentEdges(initialEdges);
      // Clear localStorage
      localStorage.removeItem('epic1-graph');
      localStorage.removeItem('epic1-autosave');
    }
  }, []);

  const handleOpen = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.psg';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          try {
            const data = JSON.parse(evt.target?.result as string);
            // Load the graph data into the editor
            if (data.nodes && data.edges) {
              setCurrentNodes(data.nodes);
              setCurrentEdges(data.edges);
              // Also save to localStorage for persistence
              localStorage.setItem('epic1-graph', JSON.stringify(data));
              alert('Graph loaded successfully!');
            } else {
              alert('Invalid graph file format');
            }
          } catch (err) {
            alert('Failed to load file: ' + err.message);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, []);

  const handleSave = useCallback(() => {
    // Get current graph state and save
    const graphData = {
      nodes: currentNodes.length > 0 ? currentNodes : initialNodes,
      edges: currentEdges.length > 0 ? currentEdges : initialEdges,
      version: '1.0',
      timestamp: new Date().toISOString()
    };
    
    // Save to localStorage
    localStorage.setItem('epic1-graph', JSON.stringify(graphData));
    
    // Create download
    const blob = new Blob([JSON.stringify(graphData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prompt-graph-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    alert('Graph saved successfully!');
  }, [currentNodes, currentEdges]);

  const handleOnboardingComplete = useCallback(() => {
    setHasSeenOnboarding(true);
    localStorage.setItem('epic1-onboarding-seen', 'true');
  }, []);
  
  // Add to history when graph changes
  const addToHistory = useCallback((nodes: Node[], edges: Edge[]) => {
    console.log('[Epic1EditorContainer] Adding to history:', nodes.length, 'nodes,', edges.length, 'edges');
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ 
      nodes: JSON.parse(JSON.stringify(nodes)), // Deep clone
      edges: JSON.parse(JSON.stringify(edges))  // Deep clone
    });
    // Limit history to 50 items
    if (newHistory.length > 50) {
      newHistory.shift();
    }
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);
  
  // Add state to force re-render of editor on undo/redo
  const [editorKey, setEditorKey] = useState(0);
  
  // Toast notifications
  const { toasts, showToast, dismissToast } = useToast();
  
  // Edit menu handlers
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const state = history[newIndex];
      setCurrentNodes([...state.nodes]);
      setCurrentEdges([...state.edges]);
      setHistoryIndex(newIndex);
      setEditorKey(prev => prev + 1); // Force editor re-render
    }
  }, [history, historyIndex]);
  
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const state = history[newIndex];
      setCurrentNodes([...state.nodes]);
      setCurrentEdges([...state.edges]);
      setHistoryIndex(newIndex);
      setEditorKey(prev => prev + 1); // Force editor re-render
    }
  }, [history, historyIndex]);
  
  const handleCut = useCallback(() => {
    const selectedNodes = currentNodes.filter(n => n.selected);
    const selectedNodeIds = selectedNodes.map(n => n.id);
    const selectedEdges = currentEdges.filter(e => 
      selectedNodeIds.includes(e.source) || selectedNodeIds.includes(e.target)
    );
    
    if (selectedNodes.length > 0) {
      setClipboard({ nodes: selectedNodes, edges: selectedEdges });
      // Remove cut nodes
      const newNodes = currentNodes.filter(n => !n.selected);
      const newEdges = currentEdges.filter(e => 
        !selectedNodeIds.includes(e.source) && !selectedNodeIds.includes(e.target)
      );
      setCurrentNodes(newNodes);
      setCurrentEdges(newEdges);
      setEditorKey(prev => prev + 1); // Force re-render
      // Add to history
      setTimeout(() => {
        addToHistory(newNodes, newEdges);
      }, 100);
      showToast(`Cut ${selectedNodes.length} node${selectedNodes.length !== 1 ? 's' : ''}`, 'success');
    } else {
      showToast('No nodes selected to cut', 'warning');
    }
  }, [currentNodes, currentEdges, addToHistory, showToast]);
  
  const handleCopy = useCallback(() => {
    const selectedNodes = currentNodes.filter(n => n.selected);
    const selectedNodeIds = selectedNodes.map(n => n.id);
    const selectedEdges = currentEdges.filter(e => 
      selectedNodeIds.includes(e.source) && selectedNodeIds.includes(e.target)
    );
    
    if (selectedNodes.length > 0) {
      console.log('[Epic1EditorContainer] Copying nodes:', selectedNodes.map(n => ({ id: n.id, type: n.type })));
      setClipboard({ 
        nodes: JSON.parse(JSON.stringify(selectedNodes)), 
        edges: JSON.parse(JSON.stringify(selectedEdges))
      });
      showToast(`Copied ${selectedNodes.length} node${selectedNodes.length !== 1 ? 's' : ''}`, 'success');
    } else {
      console.log('[Epic1EditorContainer] No nodes selected to copy');
      showToast('No nodes selected to copy', 'warning');
    }
  }, [currentNodes, currentEdges]);
  
  const handlePaste = useCallback(() => {
    if (!clipboard || !clipboard.nodes || clipboard.nodes.length === 0) {
      console.log('[Epic1EditorContainer] Nothing in clipboard to paste');
      showToast('Nothing to paste - copy some nodes first', 'warning');
      return;
    }
    
    const timestamp = Date.now();
    const offset = 50;
    
    console.log('[Epic1EditorContainer] Pasting from clipboard:', clipboard.nodes.length, 'nodes');
    
    // Create new nodes with new IDs and offset positions
    const idMap = new Map<string, string>();
    const pastedNodes = clipboard.nodes.map(node => {
      const newId = `${node.id}-paste-${timestamp}`;
      idMap.set(node.id, newId);
      return {
        ...node,
        id: newId,
        position: {
          x: (node.position?.x || 100) + offset,
          y: (node.position?.y || 100) + offset
        },
        selected: true
      };
    });
    
    // Create new edges with updated IDs
    const pastedEdges = clipboard.edges.map(edge => ({
      ...edge,
      id: `${edge.id}-paste-${timestamp}`,
      source: idMap.get(edge.source) || edge.source,
      target: idMap.get(edge.target) || edge.target
    })).filter(edge => 
      idMap.has(edge.source) && idMap.has(edge.target)
    );
    
    // Deselect existing nodes and add new ones
    const allNodes = [
      ...currentNodes.map(n => ({ ...n, selected: false })),
      ...pastedNodes
    ];
    const allEdges = [...currentEdges, ...pastedEdges];
    
    setCurrentNodes(allNodes);
    setCurrentEdges(allEdges);
    setEditorKey(prev => prev + 1); // Force re-render
    
    // Add to history
    setTimeout(() => {
      addToHistory(allNodes, allEdges);
    }, 100);
    
    showToast(`Pasted ${pastedNodes.length} node${pastedNodes.length !== 1 ? 's' : ''}`, 'success');
  }, [clipboard, currentNodes, currentEdges, addToHistory, showToast]);
  
  const handleSelectAll = useCallback(() => {
    const allSelected = currentNodes.map(n => ({ ...n, selected: true }));
    setCurrentNodes(allSelected);
    setEditorKey(prev => prev + 1); // Force re-render with selection
    showToast(`Selected all ${currentNodes.length} node${currentNodes.length !== 1 ? 's' : ''}`, 'info');
  }, [currentNodes, showToast]);
  
  const handleFind = useCallback(() => {
    // TODO: Implement find functionality
  }, []);
  
  const handlePreferences = useCallback(() => {
    // TODO: Implement preferences dialog
  }, []);

  // Add keyboard shortcuts for Edit menu
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }
      
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdKey = isMac ? event.metaKey : event.ctrlKey;
      
      if (cmdKey) {
        switch(event.key.toLowerCase()) {
          case 'z':
            if (event.shiftKey) {
              event.preventDefault();
              handleRedo();
            } else {
              event.preventDefault();
              handleUndo();
            }
            break;
          case 'y':
            event.preventDefault();
            handleRedo();
            break;
          case 'x':
            event.preventDefault();
            handleCut();
            break;
          case 'c':
            event.preventDefault();
            handleCopy();
            break;
          case 'v':
            event.preventDefault();
            handlePaste();
            break;
          case 'a':
            event.preventDefault();
            handleSelectAll();
            break;
          case 'f':
            event.preventDefault();
            handleFind();
            break;
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleUndo, handleRedo, handleCut, handleCopy, handlePaste, handleSelectAll, handleFind]);
  
  useEffect(() => {
    let mounted = true;

    const loadComponents = async () => {
      try {
        console.log('Starting Epic1 components load...');
        
        // Load all components in parallel for better performance
        const [nodesModule, epic1Module, menuBarModule, onboardingModule] = await Promise.all([
          import('@promptscape/core/components/epic1/nodes'),
          import('@promptscape/core/components/epic1'),
          showMenuBar ? import('@promptscape/core/components/MenuBar/ProfessionalMenuBar') : Promise.resolve(null),
          showOnboarding ? import('@promptscape/core/components/epic1/onboarding') : Promise.resolve(null)
        ]);

        if (!mounted) return;

        // Set editor component
        if (epic1Module.Epic1GraphEditorWithProvider) {
          setEditorComponent(() => epic1Module.Epic1GraphEditorWithProvider);
        } else {
          throw new Error('Epic1GraphEditorWithProvider not found');
        }

        // Set menu bar component
        if (menuBarModule?.ProfessionalMenuBar) {
          setMenuBarComponent(() => menuBarModule.ProfessionalMenuBar);
        }

        // Set onboarding component
        if (onboardingModule?.OnboardingIntegration) {
          setOnboardingComponent(() => onboardingModule.OnboardingIntegration);
        }

      } catch (err) {
        console.error('Load error:', err);
        if (mounted) {
          setLoadError(err.message || 'Failed to load Epic1 components');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadComponents();

    return () => {
      mounted = false;
    };
  }, [showMenuBar, showOnboarding]);

  if (loadError) {
    return (
      <div style={{ 
        width: '100%', 
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{ color: '#e53e3e', fontSize: '18px' }}>
          Failed to load Epic1 Editor
        </div>
        <div style={{ color: '#718096', fontSize: '14px' }}>
          {loadError}
        </div>
        <div style={{ padding: '20px', background: '#f7fafc', borderRadius: '8px' }}>
          <ReactFlowProvider>
            <FallbackEditor />
          </ReactFlowProvider>
        </div>
      </div>
    );
  }

  if (isLoading || !EditorComponent) {
    return (
      <div style={{ 
        width: '100%', 
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ color: '#718096', fontSize: '16px' }}>
          Loading Epic1 Editor components...
        </div>
      </div>
    );
  }

  // Medieval demo initial data - positioned at frame edges
  // Get approximate viewport dimensions (will be adjusted by ReactFlow)
  const viewportWidth = window.innerWidth - 400; // Account for side panels
  const viewportHeight = window.innerHeight - 100; // Account for menu bar
  
  // Layout options for frame positioning
  const layoutOptions: LayoutOptions = {
    viewportWidth,
    viewportHeight,
    nodeWidth: 220,
    nodeHeight: 120,
    padding: 100
  };
  
  const initialNodes = [
    {
      id: 'prompt-1',
      type: 'textBlock',
      position: ellipticalFrameLayout(0, 5, layoutOptions), // Top position
      data: {
        nodeType: 'textBlock',
        content: 'Generate a character for a',
        text: 'Generate a character for a',
        label: 'Prompt Start'
      }
    },
    {
      id: 'setting-1',
      type: 'weightedChoice',
      position: ellipticalFrameLayout(1, 5, layoutOptions), // Top-right position
      data: {
        nodeType: 'weightedChoice',
        options: [
          { text: 'medieval fantasy', weight: 40 },
          { text: 'dark medieval', weight: 30 },
          { text: 'high fantasy', weight: 30 }
        ],
        label: 'Setting'
      }
    },
    {
      id: 'prompt-2',
      type: 'textBlock',
      position: ellipticalFrameLayout(2, 5, layoutOptions), // Right position
      data: {
        nodeType: 'textBlock',
        content: 'story. They are a',
        text: 'story. They are a',
        label: 'Connector'
      }
    },
    {
      id: 'character-1',
      type: 'weightedChoice',
      position: ellipticalFrameLayout(3, 5, layoutOptions), // Bottom position
      data: {
        nodeType: 'weightedChoice',
        options: [
          { text: 'brave knight', weight: 25 },
          { text: 'cunning rogue', weight: 25 },
          { text: 'wise wizard', weight: 25 },
          { text: 'mysterious ranger', weight: 25 }
        ],
        label: 'Character Type'
      }
    },
    {
      id: 'output-1',
      type: 'output',
      position: ellipticalFrameLayout(4, 5, layoutOptions), // Left position
      data: {
        nodeType: 'output',
        outputName: 'character_prompt',
        label: 'Character Prompt'
      }
    }
  ];

  const initialEdges = [
    { id: 'e1', source: 'prompt-1', target: 'setting-1' },
    { id: 'e2', source: 'setting-1', target: 'prompt-2' },
    { id: 'e3', source: 'prompt-2', target: 'character-1' },
    { id: 'e4', source: 'character-1', target: 'output-1' }
  ];

  // Render the complete application
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Professional Menu Bar */}
      {showMenuBar && MenuBarComponent && (
        <MenuBarComponent
          // File menu
          onNew={handleNew}
          onOpen={handleOpen}
          onSave={handleSave}
          // Edit menu
          onUndo={handleUndo}
          onRedo={handleRedo}
          onCut={handleCut}
          onCopy={handleCopy}
          onPaste={handlePaste}
          onSelectAll={handleSelectAll}
          onFind={handleFind}
          onPreferences={handlePreferences}
          // State indicators
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
          hasSelection={currentNodes.some(n => n.selected)}
          // Help menu
          onDocumentation={() => window.open('/docs', '_blank')}
          onKeyboardShortcuts={() => setShowKeyboardShortcuts(true)}
          // Graph data
          nodes={currentNodes.length > 0 ? currentNodes : initialNodes}
          edges={currentEdges.length > 0 ? currentEdges : initialEdges}
        />
      )}
      
      {/* Main Editor */}
      <div style={{ flex: 1, position: 'relative' }}>
        <EditorComponent
          key={editorKey}
          initialNodes={currentNodes.length > 0 ? currentNodes : initialNodes}
          initialEdges={currentEdges.length > 0 ? currentEdges : initialEdges}
          showPreview={showPreview}
          showAssetLibrary={showAssetLibrary}
          assetLibraryPosition={assetLibraryPosition}
          onNodesChange={(nodes) => {
            const prevLength = currentNodes.length;
            
            // Don't update if nodes haven't actually changed (prevents loops)
            if (JSON.stringify(nodes) === JSON.stringify(currentNodes)) {
              return;
            }
            
            setCurrentNodes(nodes);
            
            // Add to history when nodes are added or deleted (not just moved)
            if (nodes.length !== prevLength) {
              // Small delay to batch changes
              clearTimeout(window.historyTimeout);
              window.historyTimeout = setTimeout(() => {
                addToHistory(nodes, currentEdges);
              }, 300);
            }
          }}
          onEdgesChange={(edges) => {
            // Don't update if edges haven't actually changed
            if (JSON.stringify(edges) === JSON.stringify(currentEdges)) {
              return;
            }
            
            setCurrentEdges(edges);
            
            // Add to history when edges are added or deleted
            if (edges.length !== currentEdges.length) {
              clearTimeout(window.historyTimeout);
              window.historyTimeout = setTimeout(() => {
                addToHistory(currentNodes, edges);
              }, 300);
            }
          }}
        />
        
        {/* Onboarding Overlay */}
        {showOnboarding && !hasSeenOnboarding && OnboardingComponent && (
          <OnboardingComponent
            onComplete={handleOnboardingComplete}
            onSkip={handleOnboardingComplete}
          />
        )}
      </div>
      
      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};