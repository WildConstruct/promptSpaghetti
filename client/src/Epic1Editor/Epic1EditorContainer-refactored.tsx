import React, { useEffect, useState, useCallback } from 'react';
import { Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';
import { ToastContainer, useToast } from '../Toast';
import { useSupabaseFileOperations } from './hooks/useSupabaseFileOperations';
import { useEditOperations } from './hooks/useEditOperations';
import { useWorkspaceRecovery } from './hooks/useWorkspaceRecovery';
import { usePromptParsing } from './hooks/usePromptParsing';
import type { PromptAnalysis } from '../lib/simplePromptParser';
import '@promptscape/core/components/epic1/Epic1GraphEditor.css';
import '@promptscape/core/components/epic1/nodes/BaseEditableNode.css';
import '@promptscape/core/components/epic1/nodes/NodeStyles.css';
import '../Epic1ReactFlowFix.css';
import './styles/about-modal.css';
import './styles/theme-variables.css';
import { SimpleMenuBar } from './components/SimpleMenuBar';
import { IntelligenceProvider } from '@promptscape/core/components/epic1/contexts/IntelligenceContext';
import Epic1GraphEditor from '@promptscape/core/components/epic1/Epic1GraphEditor';
import { PromptDissector } from '../components/LaunchScreen/PromptDissector';
import { WorkspaceRecoveryDialog } from '@promptscape/core/components/WorkspaceRecoveryDialog';
import { SupabaseOpenDialog } from './components/SupabaseOpenDialog';
import { SupabaseSaveDialog } from './components/SupabaseSaveDialog';
import { NewDocumentModal } from './components/NewDocumentModal';
import ChangelogModal from '@promptscape/core/components/ChangelogModal/ChangelogModal';

interface Epic1EditorContainerProps {
  showPreview?: boolean;
  showAssetLibrary?: boolean;
  assetLibraryPosition?: 'left' | 'right';
  showMenuBar?: boolean;
  showOnboarding?: boolean;
  initialAnalysis?: PromptAnalysis;
  initialGraph?: { nodes: Node[]; edges: Edge[] };
  startWithTutorial?: boolean;
}

export const Epic1EditorContainer: React.FC<Epic1EditorContainerProps> = ({
  showPreview = false,
  showAssetLibrary = true,
  assetLibraryPosition = 'left',
  showMenuBar = true,
  showOnboarding = false,
  initialAnalysis,
  initialGraph,
  startWithTutorial = false
}) => {
  // Component loading state (simplified - using static imports now)
  const [assetLibraryVisible, setAssetLibraryVisible] =
    useState(showAssetLibrary);

  // Trigger tutorial when requested
  useEffect(() => {
    if (startWithTutorial) {
      // Dispatch event after a short delay to ensure components are mounted
      const timer = setTimeout(() => {
        window.dispatchEvent(new CustomEvent('epic1:startTutorial'));
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [startWithTutorial]);

  useEffect(() => {
    if (showOnboarding) {
      window.dispatchEvent(new CustomEvent('epic1:showOnboarding'));
    }
  }, [showOnboarding]);

  const hasInitialInput = Boolean(
    (initialGraph && initialGraph.nodes && initialGraph.edges) ||
      (initialAnalysis && initialAnalysis.nodes)
  );
  const [editorReady, setEditorReady] = useState<boolean>(!hasInitialInput);

  // Set editor ready after mount
  useEffect(() => {
    if (!editorReady && hasInitialInput) {
      // Small delay to ensure components are mounted
      const timer = setTimeout(() => {
        setEditorReady(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [editorReady, hasInitialInput]);

  // State for current graph
  const [currentNodes, setCurrentNodes] = useState<Node[]>([]);
  const [currentEdges, setCurrentEdges] = useState<Edge[]>([]);

  const [showChangelog, setShowChangelog] = useState(false);
  const noop = useCallback(() => undefined, []);

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
    nodeCreationMode,
    handlePromptAnalysisComplete,
    openPromptDissector,
    processExistingAnalysis
  } = usePromptParsing({
    initialAnalysis,
    onNodesCreated: (newNodes, newEdges) => {
      console.log(
        '[Epic1EditorContainer] onNodesCreated called with:',
        newNodes.length,
        'nodes'
      );
      if (nodeCreationMode === 'new-project') {
        setCurrentNodes(newNodes);
        setCurrentEdges(newEdges);
        // Force a re-render of the graph editor with new nodes
        setEditorKey(prev => prev + 1);
      } else {
        setCurrentNodes(prev => [...prev, ...newNodes]);
        setCurrentEdges(prev => [...prev, ...newEdges]);
      }
    }
  });

  // Toast notifications
  const { toasts, showToast, dismissToast } = useToast();

  // Editor key for force refresh
  const [editorKey, setEditorKey] = useState(0);

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

  // File operations (now with proper handlers)
  const fileOps = useSupabaseFileOperations({
    onNodesChange: handleNodesChange,
    onEdgesChange: handleEdgesChange,
    onEditorKeyChange: setEditorKey,
    showToast
  });
  const {
    isAuthenticated,
    savedGraphs,
    isLoading: isFileLoading,
    showOpenDialog,
    showSaveDialog,
    showNewDocumentModal,
    setShowOpenDialog,
    setShowSaveDialog,
    handleOpen,
    handleSave,
    handleSaveAs,
    handleLocalOpen,
    handleNew,
    confirmNewDocument,
    cancelNewDocument,
    handleSupabaseSave,
    loadGraph,
    deleteGraph,
    handleQuit
  } = fileOps;

  // Edit operations with proper configuration
  const editOps = useEditOperations({
    currentNodes,
    currentEdges,
    onNodesChange: handleNodesChange,
    onEdgesChange: handleEdgesChange,
    onEditorKeyChange: setEditorKey,
    showToast
  });
  const { handleUndo, handleRedo, handleCopy, handlePaste } = editOps;

  // Components are now statically imported at the top of the file
  const handleCreateNew = useCallback(() => {
    handleNew([], []);
  }, [handleNew]);

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

  return (
    <IntelligenceProvider>
      <div
        style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}
      >
        {showMenuBar && (
          <SimpleMenuBar
            onNew={handleCreateNew}
            onOpen={handleOpen}
            onSave={() => handleSave(currentNodes, currentEdges)}
            onSaveAs={() => handleSaveAs(currentNodes, currentEdges)}
            onImport={handleLocalOpen}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onCopy={handleCopy}
            onPaste={handlePaste}
            onToggleAssetLibrary={() => setAssetLibraryVisible(prev => !prev)}
            onChangelog={() => setShowChangelog(true)}
          />
        )}

        <Epic1GraphEditor
          key={editorKey}
          initialNodes={currentNodes}
          initialEdges={currentEdges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          showPreview={showPreview}
          showAssetLibrary={assetLibraryVisible}
          assetLibraryPosition={assetLibraryPosition}
        />

        {/* Modals */}
        {showPromptDissector && (
          <PromptDissector
            value=""
            onChange={noop}
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

        <SupabaseOpenDialog
          isOpen={showOpenDialog}
          onClose={() => setShowOpenDialog(false)}
          graphs={savedGraphs}
          currentUserId={fileOps.currentUserId}
          onLoad={graph => {
            loadGraph(graph);
            setShowOpenDialog(false);
          }}
          onDelete={isAuthenticated ? deleteGraph : undefined}
          isLoading={isFileLoading}
          isAuthenticated={isAuthenticated}
          onLocalOpen={() => {
            setShowOpenDialog(false);
            handleLocalOpen();
          }}
        />

        <SupabaseSaveDialog
          isOpen={showSaveDialog}
          onClose={() => setShowSaveDialog(false)}
          onSave={(name, description, isPublic, tags) =>
            handleSupabaseSave(
              currentNodes,
              currentEdges,
              name,
              description,
              isPublic,
              tags
            )
          }
          isLoading={isFileLoading}
          isAuthenticated={isAuthenticated}
          currentNodes={currentNodes}
          currentEdges={currentEdges}
        />

        <NewDocumentModal
          isOpen={showNewDocumentModal}
          onConfirm={confirmNewDocument}
          onCancel={cancelNewDocument}
        />

        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </div>
    </IntelligenceProvider>
  );
};
