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
import { ComfyExportDialog } from './components/ComfyExportDialog';
import { PsgSceneAssetsDialog } from './components/PsgSceneAssetsDialog';
import { PsgCrowdExpansionDialog } from './components/PsgCrowdExpansionDialog';
import { BugReportDialog } from './components/BugReportDialog';
import ChangelogModal from '@promptscape/core/components/ChangelogModal/ChangelogModal';
import { useRuntimeMode } from '@promptscape/core/hooks/useRuntimeMode';
import type {
  PsgAssetRef,
  PsgSceneAssemblyPlan
} from '@promptscape/core/services/psg';
import { exportGraphToPSG } from '@promptscape/core/fileFormats/psg';

interface Epic1EditorContainerProps {
  showPreview?: boolean;
  showAssetLibrary?: boolean;
  assetLibraryPosition?: 'left' | 'right';
  showMenuBar?: boolean;
  showOnboarding?: boolean;
  initialAnalysis?: PromptAnalysis;
  initialGraph?: { nodes: Node[]; edges: Edge[] };
  startWithTutorial?: boolean;
  onBackToLaunch?: () => void;
}

export const Epic1EditorContainer: React.FC<Epic1EditorContainerProps> = ({
  showPreview = false,
  showAssetLibrary = true,
  assetLibraryPosition = 'left',
  showMenuBar = true,
  showOnboarding = false,
  initialAnalysis,
  initialGraph,
  startWithTutorial = false,
  onBackToLaunch
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
  const [showBugReportDialog, setShowBugReportDialog] = useState(false);
  const [showComfyExportDialog, setShowComfyExportDialog] = useState(false);
  const [showPsgSceneAssetsDialog, setShowPsgSceneAssetsDialog] = useState(false);
  const [showPsgCrowdExpansionDialog, setShowPsgCrowdExpansionDialog] =
    useState(false);
  const [psgAssets, setPsgAssets] = useState<PsgAssetRef[]>([]);
  const [psgScene, setPsgScene] = useState<PsgSceneAssemblyPlan | null>(null);
  const noop = useCallback(() => undefined, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('epic1-psg-scene-manifest');
      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw) as {
        assets?: PsgAssetRef[];
        scene?: PsgSceneAssemblyPlan | null;
      };
      setPsgAssets(Array.isArray(parsed.assets) ? parsed.assets : []);
      setPsgScene(parsed.scene || null);
    } catch (error) {
      console.warn('Failed to restore PSG scene manifest draft', error);
    }
  }, []);

  const persistPsgSceneManifest = useCallback(
    (nextAssets: PsgAssetRef[], nextScene: PsgSceneAssemblyPlan | null) => {
      setPsgAssets(nextAssets);
      setPsgScene(nextScene);
      localStorage.setItem(
        'epic1-psg-scene-manifest',
        JSON.stringify({
          assets: nextAssets,
          scene: nextScene
        })
      );
    },
    []
  );

  // Custom hooks
  const {
    showRecoveryDialog,
    recoveryData,
    handleRecoveryAccept,
    handleRecoveryDecline,
    handleRecoveryDismiss,
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
    buildComfyBridge,
    downloadComfyBridge,
    loadGraph,
    deleteGraph,
    handleQuit
  } = fileOps;
  const runtimeMode = useRuntimeMode({
    subscriptionActive: isAuthenticated
  });
  const canExportComfy = runtimeMode.psg.operations.includes('export-comfy');
  const canExpandCrowdHosted =
    runtimeMode.psg.accessMode === 'cloud' &&
    runtimeMode.psg.hostedUpgradeOperations.includes('expand-crowd');
  const sceneAssetSummary = {
    totalAssets: psgAssets.length,
    derivedAssets: psgAssets.filter(
      asset => asset.provenance.source === 'derived'
    ).length,
    placements: psgScene?.placements.length || 0,
    crowdMembers: psgScene?.crowdMembers.length || 0
  };

  const buildBugReportPayload = useCallback(
    ({
      title,
      details,
      includePsg
    }: {
      title: string;
      details: string;
      includePsg: boolean;
    }) => {
      const lines = [
        `Title: ${title.trim()}`,
        '',
        'Details:',
        details.trim() || '(not provided)',
        '',
        'Environment:',
        `- URL: ${window.location.href}`,
        `- User Agent: ${window.navigator.userAgent}`,
        `- Build Version: ${import.meta.env.VITE_BUILD_VERSION || 'dev'}`,
        `- Build Timestamp: ${import.meta.env.VITE_BUILD_TIMESTAMP || 'unknown'}`
      ];

      if (includePsg) {
        const psg = exportGraphToPSG(
          currentNodes as Parameters<typeof exportGraphToPSG>[0],
          currentEdges as Parameters<typeof exportGraphToPSG>[1],
          { name: 'bug-report-graph' }
        );
        lines.push('', 'PSG:', '```json', JSON.stringify(psg, null, 2), '```');
      }

      return lines.join('\n');
    },
    [currentEdges, currentNodes]
  );

  const handleCopyBugReport = useCallback(
    async ({
      title,
      details,
      includePsg
    }: {
      title: string;
      details: string;
      includePsg: boolean;
    }) => {
      try {
        await navigator.clipboard.writeText(
          buildBugReportPayload({ title, details, includePsg })
        );
        showToast('Copied bug report payload', 'success');
        return true;
      } catch (error) {
        console.error('Failed to copy bug report payload', error);
        showToast('Failed to copy bug report payload', 'error');
        return false;
      }
    },
    [buildBugReportPayload, showToast]
  );

  const handleOpenBugIssue = useCallback(
    async ({
      title,
      details,
      includePsg
    }: {
      title: string;
      details: string;
      includePsg: boolean;
    }) => {
      const copied = await handleCopyBugReport({ title, details, includePsg });
      const issueBody = [
        copied
          ? 'A full bug report payload has been copied to the clipboard. Paste it below.'
          : 'Describe the bug below.',
        '',
        details.trim() || '(see copied payload for more detail)',
        '',
        includePsg
          ? 'PSG requested: paste the copied payload, including the PSG block.'
          : 'PSG not included.'
      ].join('\n');

      const issueUrl = new URL(
        'https://github.com/WildConstruct/promptSpaghetti/issues/new'
      );
      issueUrl.searchParams.set('title', title.trim());
      issueUrl.searchParams.set('body', issueBody);
      window.open(issueUrl.toString(), '_blank', 'noopener,noreferrer');
      showToast('Opened GitHub issue form', 'success');
    },
    [handleCopyBugReport, showToast]
  );

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
            onBackToLaunch={onBackToLaunch}
            onNew={handleCreateNew}
            onOpen={handleOpen}
            onSave={() => handleSave(currentNodes, currentEdges)}
            onSaveAs={() => handleSaveAs(currentNodes, currentEdges)}
            onImport={handleLocalOpen}
            onExportComfy={
              canExportComfy
                ? () => setShowComfyExportDialog(true)
                : undefined
            }
            onPsgSceneAssets={() => setShowPsgSceneAssetsDialog(true)}
            onExpandCrowd={
              canExpandCrowdHosted
                ? () => setShowPsgCrowdExpansionDialog(true)
                : undefined
            }
            onUndo={handleUndo}
            onRedo={handleRedo}
            onCopy={handleCopy}
            onPaste={handlePaste}
            onToggleAssetLibrary={() => setAssetLibraryVisible(prev => !prev)}
            onReportBug={() => setShowBugReportDialog(true)}
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
            onRecover={handleRecoveryAccept}
            onStartFresh={handleRecoveryDecline}
            onDismiss={handleRecoveryDismiss}
          />
        )}

        {showChangelog && (
          <ChangelogModal
            isOpen={showChangelog}
            onClose={() => setShowChangelog(false)}
          />
        )}

        <BugReportDialog
          isOpen={showBugReportDialog}
          onClose={() => setShowBugReportDialog(false)}
          onCopyReport={handleCopyBugReport}
          onOpenIssue={handleOpenBugIssue}
        />

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

        <ComfyExportDialog
          isOpen={showComfyExportDialog}
          onClose={() => setShowComfyExportDialog(false)}
          buildComfyBridge={(nodes, edges, options) =>
            buildComfyBridge(nodes, edges, options, {
              assets: psgAssets,
              scene: psgScene
            })
          }
          onDownload={downloadComfyBridge}
          currentNodes={currentNodes}
          currentEdges={currentEdges}
          runtimeMode={runtimeMode.mode}
          psgAccessMode={runtimeMode.psg.accessMode}
          subscriptionState={runtimeMode.subscription.state}
          psgCloudAvailable={runtimeMode.psg.cloudAvailable}
          psgLocalAvailable={runtimeMode.psg.localAvailable}
          localOperations={runtimeMode.psg.localOperations}
          hostedUpgradeOperations={runtimeMode.psg.hostedUpgradeOperations}
          sceneAssetSummary={sceneAssetSummary}
        />

        <PsgSceneAssetsDialog
          isOpen={showPsgSceneAssetsDialog}
          onClose={() => setShowPsgSceneAssetsDialog(false)}
          assets={psgAssets}
          scene={psgScene}
          cloudAssetReady={runtimeMode.mode === 'cloud' && runtimeMode.supabase.cloudSyncAvailable}
          onSave={({ assets, scene }) => persistPsgSceneManifest(assets, scene)}
          onExportManifest={() => {
            const document = fileOps.buildPsgSceneManifest(
              currentNodes,
              currentEdges,
              {},
              {
                assets: psgAssets,
                scene: psgScene
              }
            );
            fileOps.downloadPsgSceneManifest(document, document.metadata.name);
          }}
          onAssembleScene={() =>
            fileOps.assembleScenePreview(currentNodes, currentEdges, {}, {
              assets: psgAssets,
              scene: psgScene
            })
          }
          onDownloadAssembly={(response, filenameBase) =>
            fileOps.downloadSceneAssembly(response, filenameBase)
          }
        />

        <PsgCrowdExpansionDialog
          isOpen={showPsgCrowdExpansionDialog}
          onClose={() => setShowPsgCrowdExpansionDialog(false)}
          psgAccessMode={runtimeMode.psg.accessMode}
          hostedUpgradeOperations={runtimeMode.psg.hostedUpgradeOperations}
          existingScene={psgScene}
          onApply={({ crowdMembers }) => {
            persistPsgSceneManifest(psgAssets, {
              ...(psgScene || {
                stillAssetIds: [],
                motionAssetIds: [],
                placements: [],
                crowdMembers: [],
                renderTargets: []
              }),
              crowdMembers
            });
          }}
        />

        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </div>
    </IntelligenceProvider>
  );
};
