import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';
import { ToastContainer, useToast } from '../Toast';
import { useSupabaseFileOperations } from './hooks/useSupabaseFileOperations';
import { useEditOperations } from './hooks/useEditOperations';
import { useWorkspaceRecovery } from './hooks/useWorkspaceRecovery';
import { usePromptParsing } from './hooks/usePromptParsing';
import { SupabaseOpenDialog } from './components/SupabaseOpenDialog';
import { SupabaseSaveDialog } from './components/SupabaseSaveDialog';
import { NewDocumentModal } from './components/NewDocumentModal';
import { testSupabaseConnection } from './hooks/testSupabase';
import { GraphEditorWithTray } from './GraphEditorWithTray';
import {
  validateGraph,
  formatValidationMessage
} from './utils/graphValidation';
import { Epic1GraphEditorProps, NodeData } from './types';
import type { PromptAnalysis } from '../lib/simplePromptParser';
import { stylePresets, getConsoleStyle } from './utils/styleUtils';
import '@promptscape/core/components/epic1/Epic1GraphEditor.css';
import '@promptscape/core/components/epic1/nodes/BaseEditableNode.css';
import '@promptscape/core/components/epic1/nodes/NodeStyles.css';
import '../Epic1ReactFlowFix.css';
import './styles/about-modal.css';
import './styles/theme-variables.css';
import { fromLegacyGraph, writePsg } from '@promptscape/core';
import type { GraphNode, GraphEdge, Graph } from '@promptscape/core';
import { SimpleMenuBar } from './components/SimpleMenuBar';
import { IntelligenceProvider } from '@promptscape/core/components/epic1/contexts/IntelligenceContext';
import { PromptDissector } from '../components/LaunchScreen/PromptDissector';
import { WorkspaceRecoveryDialog } from '@promptscape/core/components/WorkspaceRecoveryDialog';
import { ChangelogModal } from '@promptscape/core/components/ChangelogModal/ChangelogModal';

interface Epic1EditorContainerProps {
  showPreview?: boolean;
  showAssetLibrary?: boolean;
  assetLibraryPosition?: 'left' | 'right';
  showMenuBar?: boolean;
  showOnboarding?: boolean;
  initialAnalysis?: PromptAnalysis;
  initialGraph?: { nodes: Node[]; edges: Edge[] };
}

export const Epic1EditorContainer: React.FC<Epic1EditorContainerProps> = ({
  showPreview = false,
  showAssetLibrary = true,
  assetLibraryPosition = 'left',
  showMenuBar = true,
  showOnboarding = false,
  initialAnalysis,
  initialGraph
}) => {
  // Component loading state
  const [EditorComponent, setEditorComponent] =
    useState<React.ComponentType<Epic1GraphEditorProps> | null>(null);
  const [MenuBarComponent, setMenuBarComponent] =
    useState<React.ComponentType<any> | null>(null);
  const [loadError, setLoadError] = useState<string>('');
  const [isComponentsLoading, setIsComponentsLoading] = useState(true);
  const [assetLibraryVisible, setAssetLibraryVisible] =
    useState(showAssetLibrary);
  const hasInitialInput = Boolean(
    (initialGraph && initialGraph.nodes && initialGraph.edges) ||
      (initialAnalysis && initialAnalysis.nodes)
  );
  const [editorReady, setEditorReady] = useState<boolean>(!hasInitialInput);

  // State for current graph
  const [currentNodes, setCurrentNodes] = useState<Node[]>([]);
  const [currentEdges, setCurrentEdges] = useState<Edge[]>([]);

  // Changelog modal state
  const [showChangelog, setShowChangelog] = useState(false);

  // Custom hooks
  const {
    showRecoveryDialog,
    recoveryData,
    handleRecoveryAccept,
    handleRecoveryDecline,
    saveForRecovery
  } = useWorkspaceRecovery({
    onRecover: (nodes, edges) => {
      setCurrentNodes(nodes);
      setCurrentEdges(edges);
    }
  });

  const {
    showPromptDissector,
    promptAnalysis,
    nodeCreationMode,
    handlePromptAnalysisComplete,
    openPromptDissector,
    closePromptDissector,
    processExistingAnalysis
  } = usePromptParsing({
    initialAnalysis,
    onNodesCreated: (newNodes, newEdges) => {
      if (nodeCreationMode === 'new-project') {
        setCurrentNodes(newNodes);
        setCurrentEdges(newEdges);
      } else {
        setCurrentNodes(prev => [...prev, ...newNodes]);
        setCurrentEdges(prev => [...prev, ...newEdges]);
      }
    }
  });

  // File operations (already extracted)
  const fileOps = useSupabaseFileOperations();
  const editOps = useEditOperations();

  // Load components dynamically
  useEffect(() => {
    const loadComponents = async () => {
      try {
        const [editorModule, menuModule] = await Promise.all([
          import('@promptscape/core/components/epic1/Epic1GraphEditor'),
          showMenuBar
            ? import('./components/SimpleMenuBar')
            : Promise.resolve(null)
        ]);

        setEditorComponent(() => editorModule.Epic1GraphEditor);
        if (menuModule) {
          setMenuBarComponent(() => menuModule.SimpleMenuBar);
        }
        setIsComponentsLoading(false);
      } catch (error) {
        console.error('Failed to load components:', error);
        setLoadError('Failed to load editor components');
        setIsComponentsLoading(false);
      }
    };

    loadComponents();
  }, [showMenuBar]);

  // Process initial graph/analysis
  useEffect(() => {
    if (editorReady) {
      if (initialGraph) {
        setCurrentNodes(initialGraph.nodes);
        setCurrentEdges(initialGraph.edges);
      } else if (initialAnalysis) {
        processExistingAnalysis(initialAnalysis, 'new-project');
      }
    }
  }, [editorReady, initialGraph, initialAnalysis, processExistingAnalysis]);

  // Handle editor state changes
  const handleNodesChange = useCallback(
    (nodes: Node[]) => {
      setCurrentNodes(nodes);
      saveForRecovery(nodes, currentEdges);
    },
    [currentEdges, saveForRecovery]
  );

  const handleEdgesChange = useCallback(
    (edges: Edge[]) => {
      setCurrentEdges(edges);
      saveForRecovery(currentNodes, edges);
    },
    [currentNodes, saveForRecovery]
  );

  // Render loading or error state
  if (isComponentsLoading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          backgroundColor: '#0a0a0a',
          color: '#fff'
        }}
      >
        <div>Loading editor components...</div>
      </div>
    );
  }

  if (loadError || !EditorComponent) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          backgroundColor: '#0a0a0a',
          color: '#ff6b6b'
        }}
      >
        <div>{loadError || 'Failed to load editor'}</div>
      </div>
    );
  }

  return (
    <IntelligenceProvider>
      <div
        style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}
      >
        {showMenuBar && MenuBarComponent && (
          <MenuBarComponent
            onNewProject={() => openPromptDissector('new-project')}
            onAddNodes={() => openPromptDissector('add-to-existing')}
            onShowChangelog={() => setShowChangelog(true)}
            onToggleAssetLibrary={() =>
              setAssetLibraryVisible(!assetLibraryVisible)
            }
          />
        )}

        <GraphEditorWithTray
          showPreview={showPreview}
          showAssetLibrary={assetLibraryVisible}
          assetLibraryPosition={assetLibraryPosition}
        >
          <EditorComponent
            initialNodes={currentNodes}
            initialEdges={currentEdges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            showOnboarding={showOnboarding}
          />
        </GraphEditorWithTray>

        {/* Modals */}
        {showPromptDissector && (
          <PromptDissector
            value=""
            onChange={() => {}}
            onAnalysisComplete={handlePromptAnalysisComplete}
            placeholder="Enter your prompt to generate nodes..."
          />
        )}

        {showRecoveryDialog && recoveryData && (
          <WorkspaceRecoveryDialog
            isOpen={showRecoveryDialog}
            onAccept={handleRecoveryAccept}
            onDecline={handleRecoveryDecline}
            timestamp={recoveryData.timestamp}
          />
        )}

        {showChangelog && (
          <ChangelogModal
            isOpen={showChangelog}
            onClose={() => setShowChangelog(false)}
          />
        )}

        <ToastContainer />
      </div>
    </IntelligenceProvider>
  );
};
