import React, { useEffect, useState, useCallback } from 'react';
import { Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';
import { ToastContainer, useToast } from '../Toast';
import { useFileOperations } from './hooks/useFileOperations';
import { useEditOperations } from './hooks/useEditOperations';
import { 
  calculateViewportDimensions, 
  calculateNodePositions, 
  createDemoNodes,
  enforceFrameEdgePositions 
} from './utils/nodePositioning';
import { validateGraph, formatValidationMessage } from './utils/graphValidation';
import { Epic1GraphEditorProps, ProfessionalMenuBarProps } from './types';
import { stylePresets, getConsoleStyle } from './utils/styleUtils';
import '@promptscape/core/components/epic1/Epic1GraphEditor.css';
import '@promptscape/core/components/epic1/nodes/BaseEditableNode.css';
import '@promptscape/core/components/epic1/nodes/NodeStyles.css';
import '../Epic1ReactFlowFix.css';
import './styles/about-modal.css';

interface Epic1EditorContainerProps {
  showPreview?: boolean;
  showAssetLibrary?: boolean;
  assetLibraryPosition?: 'left' | 'right';
  showMenuBar?: boolean;
  showOnboarding?: boolean;
}

export const Epic1EditorContainer: React.FC<Epic1EditorContainerProps> = ({
  showPreview = true,
  showAssetLibrary = true,
  assetLibraryPosition = 'right',
  showMenuBar = true,
  showOnboarding = false
}) => {
  // Component loading state
  const [EditorComponent, setEditorComponent] = useState<React.ComponentType<Epic1GraphEditorProps> | null>(null);
  const [MenuBarComponent, setMenuBarComponent] = useState<React.ComponentType<ProfessionalMenuBarProps> | null>(null);
  const [loadError, setLoadError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Calculate viewport and node positions
  const viewport = calculateViewportDimensions();
  const nodePositions = calculateNodePositions(viewport);
  const demoNodes = createDemoNodes(nodePositions);
  const demoEdges: Edge[] = [
    { id: 'e1', source: 'prompt-1', sourceHandle: 'source', target: 'setting-1', targetHandle: 'target' },
    { id: 'e2', source: 'setting-1', sourceHandle: 'source', target: 'prompt-2', targetHandle: 'target' },
    { id: 'e3', source: 'prompt-2', sourceHandle: 'source', target: 'character-1', targetHandle: 'target' },
    { id: 'e4', source: 'character-1', sourceHandle: 'source', target: 'output-1', targetHandle: 'target' }
  ];
  
  // Graph state
  const [currentNodes, setCurrentNodes] = useState<Node[]>(demoNodes);
  const [currentEdges, setCurrentEdges] = useState<Edge[]>(demoEdges);
  const [editorKey, setEditorKey] = useState(0);
  
  // Toast notifications
  const { toasts, showToast, dismissToast } = useToast();
  
  // File operations hook
  const {
    handleNew,
    handleOpen,
    handleSave,
    handleSaveAs,
    handleQuit
  } = useFileOperations({
    onNodesChange: setCurrentNodes,
    onEdgesChange: setCurrentEdges,
    onEditorKeyChange: setEditorKey,
    showToast
  });
  
  // Edit operations hook
  const {
    addToHistory,
    handleUndo,
    handleRedo,
    handleCopy,
    handlePaste,
    canUndo,
    canRedo,
    hasSelection
  } = useEditOperations({
    currentNodes,
    currentEdges,
    onNodesChange: setCurrentNodes,
    onEdgesChange: setCurrentEdges,
    onEditorKeyChange: setEditorKey,
    showToast
  });
  
  // Validation handlers
  const handleValidateGraph = useCallback(() => {
    const issues = validateGraph(currentNodes, currentEdges);
    const message = formatValidationMessage(issues);
    const type = issues.some(i => i.type === 'error') ? 'error' : 
                  issues.length > 0 ? 'warning' : 'success';
    showToast(message, type);
  }, [currentNodes, currentEdges, showToast]);
  
  const handleConsoleToggle = useCallback(() => {
    console.log('%c=== Prompt Spaghetti Debug Console ===', getConsoleStyle());
    console.log('Graph Nodes:', currentNodes);
    console.log('Graph Edges:', currentEdges);
    console.log('Viewport:', viewport);
    showToast('Debug info logged to console (F12 to open)', 'info');
  }, [currentNodes, currentEdges, viewport, showToast]);
  
  const handleAbout = useCallback(() => {
    const aboutDiv = document.createElement('div');
    aboutDiv.innerHTML = `
      <div class="about-modal-container">
        <h2 class="about-modal-heading">Prompt Spaghetti</h2>
        <p class="about-modal-text">Version 1.0.0</p>
        <p class="about-modal-description">
          A professional node-based editor for creating dynamic prompts with weighted choices, 
          variables, and conditional logic.
        </p>
        <div class="about-modal-footer">
          <p class="about-modal-footer-text">
            Built with React Flow, TypeScript, and ❤️
          </p>
          <p class="about-modal-footer-text">
            © 2025 Prompt Spaghetti Team
          </p>
        </div>
        <button class="about-modal-button" onclick="this.parentElement.parentElement.remove()">Close</button>
      </div>
      <div class="about-modal-overlay" onclick="this.remove()"></div>
    `;
    document.body.appendChild(aboutDiv);
  }, []);
  
  // Handle node changes with frame edge enforcement
  const handleNodesChange = useCallback((nodes: Node[]) => {
    const fixedNodes = enforceFrameEdgePositions(nodes, demoNodes);
    
    if (JSON.stringify(fixedNodes) !== JSON.stringify(currentNodes)) {
      setCurrentNodes(fixedNodes);
      if (nodes.length !== currentNodes.length) {
        setTimeout(() => addToHistory(fixedNodes, currentEdges), 300);
      }
    }
  }, [currentNodes, currentEdges, demoNodes, addToHistory]);
  
  // Handle edge changes
  const handleEdgesChange = useCallback((edges: Edge[]) => {
    if (JSON.stringify(edges) !== JSON.stringify(currentEdges)) {
      setCurrentEdges(edges);
      if (edges.length !== currentEdges.length) {
        setTimeout(() => addToHistory(currentNodes, edges), 300);
      }
    }
  }, [currentNodes, currentEdges, addToHistory]);
  
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
          setLoadError((err as Error).message || 'Failed to load components');
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
    return <div className="error-message">Error: {loadError}</div>;
  }
  
  if (isLoading || !EditorComponent) {
    return <div className="loading-message">Loading...</div>;
  }
  
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {showMenuBar && MenuBarComponent && (
        <MenuBarComponent
          onNew={() => handleNew(demoNodes, demoEdges)}
          onOpen={handleOpen}
          onSave={() => handleSave(currentNodes, currentEdges)}
          onSaveAs={() => handleSaveAs(currentNodes, currentEdges)}
          onQuit={() => handleQuit(currentNodes, currentEdges)}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onCopy={handleCopy}
          onPaste={handlePaste}
          onAbout={handleAbout}
          onValidateGraph={handleValidateGraph}
          onConsoleToggle={handleConsoleToggle}
          canUndo={canUndo}
          canRedo={canRedo}
          hasSelection={hasSelection}
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
          showAssetLibrary={false}
          assetLibraryPosition={assetLibraryPosition}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
        />
      </div>
      
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};