import React, { useEffect, useState, useCallback } from 'react';
import ReactFlow, { ReactFlowProvider, Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';
import { ToastContainer, useToast } from './Toast';
import { ellipticalFrameLayout, type LayoutOptions } from '@promptscape/core/utils/frameLayouts';
import '@promptscape/core/components/epic1/Epic1GraphEditor.css';
import '@promptscape/core/components/epic1/nodes/BaseEditableNode.css';
import '@promptscape/core/components/epic1/nodes/NodeStyles.css';

interface Epic1EditorContainerFixedProps {
  showPreview?: boolean;
  showAssetLibrary?: boolean;
  assetLibraryPosition?: 'left' | 'right';
  showMenuBar?: boolean;
  showOnboarding?: boolean;
}

export const Epic1EditorContainerFixed: React.FC<Epic1EditorContainerFixedProps> = ({
  showPreview = true,
  showAssetLibrary = true,
  assetLibraryPosition = 'right',
  showMenuBar = true,
  showOnboarding = false
}) => {
  const [EditorComponent, setEditorComponent] = useState<React.ComponentType<any> | null>(null);
  const [MenuBarComponent, setMenuBarComponent] = useState<React.ComponentType<any> | null>(null);
  const [loadError, setLoadError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Calculate viewport dimensions for frame positioning
  // Use the full viewport minus only the actual UI elements
  const viewportWidth = window.innerWidth - 300; // Account for right preview panel
  const viewportHeight = window.innerHeight - 50; // Account for menu bar
  
  // Layout options for frame positioning with minimal padding
  const layoutOptions: LayoutOptions = {
    viewportWidth,
    viewportHeight,
    nodeWidth: 280,
    nodeHeight: 140,
    padding: 20  // Very small padding to keep nodes just inside viewport edges
  };
  
  // Demo initial data - positioned at frame edges
  const demoNodes: Node[] = [
    {
      id: 'prompt-1',
      type: 'textBlock',
      position: ellipticalFrameLayout(0, 5, layoutOptions), // Top edge
      data: {
        nodeType: 'textBlock',
        content: 'Generate a character for a',
        text: 'Generate a character for a',
        label: 'Prompt Start',
        // Add visual indicator for edge connection
        showEdgeConnection: true
      }
    },
    {
      id: 'setting-1',
      type: 'weightedChoice',
      position: ellipticalFrameLayout(1, 5, layoutOptions), // Right edge
      data: {
        nodeType: 'weightedChoice',
        options: [
          { text: 'medieval fantasy', weight: 40 },
          { text: 'dark medieval', weight: 30 },
          { text: 'high fantasy', weight: 30 }
        ],
        label: 'Setting',
        showEdgeConnection: true
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
      position: ellipticalFrameLayout(3, 5, layoutOptions), // Bottom edge
      data: {
        nodeType: 'weightedChoice',
        options: [
          { text: 'brave knight', weight: 25 },
          { text: 'cunning rogue', weight: 25 },
          { text: 'wise wizard', weight: 25 },
          { text: 'mysterious ranger', weight: 25 }
        ],
        label: 'Character Type',
        showEdgeConnection: true
      }
    },
    {
      id: 'output-1',
      type: 'output',
      position: ellipticalFrameLayout(4, 5, layoutOptions), // Left edge
      data: {
        nodeType: 'output',
        outputName: 'character_prompt',
        label: 'Character Prompt',
        showEdgeConnection: true
      }
    }
  ];

  const demoEdges: Edge[] = [
    { id: 'e1', source: 'prompt-1', target: 'setting-1', animated: true },
    { id: 'e2', source: 'setting-1', target: 'prompt-2', animated: true },
    { id: 'e3', source: 'prompt-2', target: 'character-1', animated: true },
    { id: 'e4', source: 'character-1', target: 'output-1', animated: true }
  ];
  
  // Graph state - start with demo nodes at frame edges
  const [currentNodes, setCurrentNodes] = useState<Node[]>(demoNodes);
  const [currentEdges, setCurrentEdges] = useState<Edge[]>(demoEdges);
  
  // History for undo/redo
  const [history, setHistory] = useState<{ nodes: Node[], edges: Edge[] }[]>([{ nodes: [], edges: [] }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [clipboard, setClipboard] = useState<{ nodes: Node[], edges: Edge[] } | null>(null);
  const [editorKey, setEditorKey] = useState(0);
  
  // Toast notifications
  const { toasts, showToast, dismissToast } = useToast();
  
  // Add to history
  const addToHistory = useCallback((nodes: Node[], edges: Edge[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ 
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges))
    });
    if (newHistory.length > 50) {
      newHistory.shift();
    }
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);
  
  // File menu handlers
  const handleNew = useCallback(() => {
    if (window.confirm('Create a new graph? Any unsaved changes will be lost.')) {
      setCurrentNodes(demoNodes);
      setCurrentEdges(demoEdges);
      setHistory([{ nodes: demoNodes, edges: demoEdges }]);
      setHistoryIndex(0);
      setEditorKey(prev => prev + 1);
      localStorage.removeItem('epic1-graph');
      showToast('New graph created', 'success');
    }
  }, [showToast]);
  
  const handleOpen = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          try {
            const data = JSON.parse(evt.target?.result as string);
            if (data.nodes && data.edges) {
              setCurrentNodes(data.nodes);
              setCurrentEdges(data.edges);
              setEditorKey(prev => prev + 1);
              localStorage.setItem('epic1-graph', JSON.stringify(data));
              showToast('Graph loaded successfully', 'success');
            }
          } catch (err) {
            showToast('Failed to load file', 'error');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, [showToast]);
  
  const handleSave = useCallback(() => {
    const graphData = {
      nodes: currentNodes,
      edges: currentEdges,
      version: '1.0',
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('epic1-graph', JSON.stringify(graphData));
    
    const blob = new Blob([JSON.stringify(graphData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `graph-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast('Graph saved', 'success');
  }, [currentNodes, currentEdges, showToast]);
  
  const handleSaveAs = useCallback(() => {
    const name = prompt('Enter a name for this graph:');
    if (name) {
      const graphData = {
        name,
        nodes: currentNodes,
        edges: currentEdges,
        version: '1.0',
        timestamp: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(graphData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${name.replace(/[^a-z0-9]/gi, '_')}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      showToast(`Graph saved as "${name}"`, 'success');
    }
  }, [currentNodes, currentEdges, showToast]);
  
  const handleQuit = useCallback(() => {
    // Save current work to localStorage before quitting
    const graphData = { nodes: currentNodes, edges: currentEdges };
    localStorage.setItem('epic1-graph-autosave', JSON.stringify(graphData));
    
    // Try to close the window/tab
    if (window.confirm('Are you sure you want to quit? Any unsaved changes will be auto-saved.')) {
      // Try to close the window
      window.close();
      
      // If window.close() doesn't work (common in browsers), redirect to a blank page
      // or show a message
      setTimeout(() => {
        // If we're still here, window.close() didn't work
        document.body.innerHTML = `
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            font-family: system-ui, -apple-system, sans-serif;
            flex-direction: column;
            gap: 20px;
            background: #1a1a1a;
            color: #e0e0e0;
          ">
            <h2>Thank you for using Prompt Spaghetti!</h2>
            <p>You can now safely close this tab.</p>
            <p style="color: #888; font-size: 14px;">Your work has been auto-saved.</p>
          </div>
        `;
      }, 100);
    }
  }, [currentNodes, currentEdges]);
  
  const handleAbout = useCallback(() => {
    showToast(
      `Prompt Spaghetti v1.0.0\n\nA professional node-based prompt editor\nBuilt with React Flow and TypeScript`,
      'info'
    );
    
    // Optionally show a more detailed about dialog
    const aboutHtml = `
      <div style="
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #1a1a1a;
        border: 2px solid #333;
        border-radius: 12px;
        padding: 30px;
        z-index: 10000;
        box-shadow: 0 10px 50px rgba(0,0,0,0.8);
        max-width: 400px;
        color: #e0e0e0;
        font-family: system-ui, -apple-system, sans-serif;
      ">
        <h2 style="margin: 0 0 20px 0; color: #ff7c00;">Prompt Spaghetti</h2>
        <p style="margin: 10px 0; line-height: 1.6;">Version 1.0.0</p>
        <p style="margin: 10px 0; line-height: 1.6; color: #b8b8b8;">
          A professional node-based editor for creating dynamic prompts with weighted choices, 
          variables, and conditional logic.
        </p>
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #333;">
          <p style="margin: 5px 0; font-size: 14px; color: #888;">
            Built with React Flow, TypeScript, and ❤️
          </p>
          <p style="margin: 5px 0; font-size: 14px; color: #888;">
            © 2025 Prompt Spaghetti Team
          </p>
        </div>
        <button onclick="this.parentElement.remove()" style="
          margin-top: 20px;
          padding: 10px 20px;
          background: #ff7c00;
          border: none;
          border-radius: 6px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          font-size: 14px;
        ">Close</button>
      </div>
      <div onclick="this.remove()" style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        z-index: 9999;
      "></div>
    `;
    
    const aboutDiv = document.createElement('div');
    aboutDiv.innerHTML = aboutHtml;
    document.body.appendChild(aboutDiv);
  }, [showToast]);
  
  const handleValidateGraph = useCallback(() => {
    // Basic graph validation
    const issues = [];
    
    // Check for disconnected nodes
    const nodesWithoutEdges = currentNodes.filter(node => {
      const hasIncoming = currentEdges.some(edge => edge.target === node.id);
      const hasOutgoing = currentEdges.some(edge => edge.source === node.id);
      return !hasIncoming && !hasOutgoing;
    });
    
    if (nodesWithoutEdges.length > 0) {
      issues.push(`${nodesWithoutEdges.length} disconnected node(s)`);
    }
    
    // Check for output nodes
    const outputNodes = currentNodes.filter(node => node.type === 'output');
    if (outputNodes.length === 0) {
      issues.push('No output node found');
    }
    
    // Check for cycles (simple detection)
    const hasCycle = detectCycle(currentNodes, currentEdges);
    if (hasCycle) {
      issues.push('Graph contains cycles');
    }
    
    if (issues.length === 0) {
      showToast('✅ Graph validation passed!', 'success');
    } else {
      showToast(`⚠️ Graph validation issues:\n${issues.join('\n')}`, 'warning');
    }
  }, [currentNodes, currentEdges, showToast]);
  
  const handleConsoleToggle = useCallback(() => {
    // Toggle browser dev console
    const isOpen = window.console && window.console._isOpen;
    
    if (!isOpen) {
      console.log('%c=== Prompt Spaghetti Debug Console ===', 'color: #ff7c00; font-size: 16px; font-weight: bold');
      console.log('Graph Nodes:', currentNodes);
      console.log('Graph Edges:', currentEdges);
      console.log('History:', history);
      console.log('Current History Index:', historyIndex);
      showToast('Debug info logged to console (F12 to open)', 'info');
    }
  }, [currentNodes, currentEdges, history, historyIndex, showToast]);
  
  // Helper function to detect cycles
  const detectCycle = (nodes: Node[], edges: Edge[]): boolean => {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    
    const hasCycleDFS = (nodeId: string): boolean => {
      visited.add(nodeId);
      recursionStack.add(nodeId);
      
      const neighbors = edges.filter(e => e.source === nodeId).map(e => e.target);
      
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (hasCycleDFS(neighbor)) return true;
        } else if (recursionStack.has(neighbor)) {
          return true;
        }
      }
      
      recursionStack.delete(nodeId);
      return false;
    };
    
    for (const node of nodes) {
      if (!visited.has(node.id)) {
        if (hasCycleDFS(node.id)) return true;
      }
    }
    
    return false;
  };
  
  // Edit menu handlers
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const state = history[newIndex];
      setCurrentNodes([...state.nodes]);
      setCurrentEdges([...state.edges]);
      setHistoryIndex(newIndex);
      setEditorKey(prev => prev + 1);
    }
  }, [history, historyIndex]);
  
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const state = history[newIndex];
      setCurrentNodes([...state.nodes]);
      setCurrentEdges([...state.edges]);
      setHistoryIndex(newIndex);
      setEditorKey(prev => prev + 1);
    }
  }, [history, historyIndex]);
  
  const handleCopy = useCallback(() => {
    const selectedNodes = currentNodes.filter(n => n.selected);
    const selectedNodeIds = selectedNodes.map(n => n.id);
    const selectedEdges = currentEdges.filter(e => 
      selectedNodeIds.includes(e.source) && selectedNodeIds.includes(e.target)
    );
    
    if (selectedNodes.length > 0) {
      setClipboard({ 
        nodes: JSON.parse(JSON.stringify(selectedNodes)), 
        edges: JSON.parse(JSON.stringify(selectedEdges))
      });
      showToast(`Copied ${selectedNodes.length} node${selectedNodes.length !== 1 ? 's' : ''}`, 'success');
    } else {
      showToast('No nodes selected', 'warning');
    }
  }, [currentNodes, currentEdges, showToast]);
  
  const handlePaste = useCallback(() => {
    if (!clipboard || !clipboard.nodes || clipboard.nodes.length === 0) {
      showToast('Nothing to paste', 'warning');
      return;
    }
    
    const timestamp = Date.now();
    const offset = 50;
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
    
    const pastedEdges = clipboard.edges.map(edge => ({
      ...edge,
      id: `${edge.id}-paste-${timestamp}`,
      source: idMap.get(edge.source) || edge.source,
      target: idMap.get(edge.target) || edge.target
    })).filter(edge => 
      idMap.has(edge.source) && idMap.has(edge.target)
    );
    
    const allNodes = [
      ...currentNodes.map(n => ({ ...n, selected: false })),
      ...pastedNodes
    ];
    const allEdges = [...currentEdges, ...pastedEdges];
    
    setCurrentNodes(allNodes);
    setCurrentEdges(allEdges);
    setEditorKey(prev => prev + 1);
    
    setTimeout(() => {
      addToHistory(allNodes, allEdges);
    }, 100);
    
    showToast(`Pasted ${pastedNodes.length} node${pastedNodes.length !== 1 ? 's' : ''}`, 'success');
  }, [clipboard, currentNodes, currentEdges, addToHistory, showToast]);
  
  // Load components
  useEffect(() => {
    let mounted = true;
    
    const loadComponents = async () => {
      try {
        const [epic1Module, menuBarModule] = await Promise.all([
          import('@promptscape/core/components/epic1'),
          showMenuBar ? import('@promptscape/core/components/MenuBar/ProfessionalMenuBar') : Promise.resolve(null)
        ]);
        
        if (!mounted) return;
        
        if (epic1Module.Epic1GraphEditorWithProvider) {
          setEditorComponent(() => epic1Module.Epic1GraphEditorWithProvider);
        }
        
        if (menuBarModule?.ProfessionalMenuBar) {
          setMenuBarComponent(() => menuBarModule.ProfessionalMenuBar);
        }
      } catch (err) {
        if (mounted) {
          setLoadError(err.message || 'Failed to load components');
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
  }, [showMenuBar]);
  
  if (loadError) {
    return <div style={{ padding: '20px', color: 'red' }}>Error: {loadError}</div>;
  }
  
  if (isLoading || !EditorComponent) {
    return <div style={{ padding: '20px' }}>Loading...</div>;
  }
  
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {showMenuBar && MenuBarComponent && (
        <MenuBarComponent
          onNew={handleNew}
          onOpen={handleOpen}
          onSave={handleSave}
          onSaveAs={handleSaveAs}
          onQuit={handleQuit}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onCopy={handleCopy}
          onPaste={handlePaste}
          onAbout={handleAbout}
          onValidateGraph={handleValidateGraph}
          onConsoleToggle={handleConsoleToggle}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
          hasSelection={currentNodes.some(n => n.selected)}
          nodes={currentNodes}
          edges={currentEdges}
        />
      )}
      
      <div style={{ flex: 1, position: 'relative' }}>
        <EditorComponent
          key={editorKey}
          initialNodes={currentNodes}
          initialEdges={currentEdges}
          showPreview={showPreview}
          showAssetLibrary={false} // Hide left palette
          assetLibraryPosition={assetLibraryPosition}
          onNodesChange={(nodes) => {
            if (JSON.stringify(nodes) !== JSON.stringify(currentNodes)) {
              setCurrentNodes(nodes);
              if (nodes.length !== currentNodes.length) {
                setTimeout(() => addToHistory(nodes, currentEdges), 300);
              }
            }
          }}
          onEdgesChange={(edges) => {
            if (JSON.stringify(edges) !== JSON.stringify(currentEdges)) {
              setCurrentEdges(edges);
              if (edges.length !== currentEdges.length) {
                setTimeout(() => addToHistory(currentNodes, edges), 300);
              }
            }
          }}
        />
      </div>
      
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};