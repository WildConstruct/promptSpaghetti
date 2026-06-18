import React, {
  Suspense,
  lazy,
  useEffect,
  useState,
  useCallback,
  useMemo
} from 'react';
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
import { buildEditorSurfacePolicy } from './editorSurfacePolicy';
import {
  buildLocalSandboxCapturePayload
} from './localSandboxAssetCapture';
import {
  deriveLocalSandboxRequestFromGraph,
  LOCAL_SANDBOX_TREE_PROMPT
} from './localSandboxPromptDerivation';
import { IntelligenceProvider } from '@promptscape/core/components/epic1/contexts/IntelligenceContext';
import Epic1GraphEditor from '@promptscape/core/components/epic1/Epic1GraphEditor';
import { useRuntimeMode } from '@promptscape/core/hooks/useRuntimeMode';
import type { LocalImageBatchResponse } from '@promptscape/core/services/localImage';
import type {
  PsgAssetRef,
  PsgSceneAssemblyPlan
} from '@promptscape/core/services/psg';
import { exportGraphToPSG } from '@promptscape/core/fileFormats/psg';
import {
  TEMPLATE_CATALOG,
  TEMPLATE_CATEGORY_LABELS
} from '../templates/templateCatalog';
import { quickStartTemplates } from '../templates/quickStartTemplates';

const PromptDissector = lazy(async () => {
  const module = await import('../components/LaunchScreen/PromptDissector');
  return { default: module.PromptDissector };
});

const WorkspaceRecoveryDialog = lazy(async () => {
  const module = await import(
    '@promptscape/core/components/WorkspaceRecoveryDialog'
  );
  return { default: module.WorkspaceRecoveryDialog };
});

const SupabaseOpenDialog = lazy(async () => {
  const module = await import('./components/SupabaseOpenDialog');
  return { default: module.SupabaseOpenDialog };
});

const SupabaseSaveDialog = lazy(async () => {
  const module = await import('./components/SupabaseSaveDialog');
  return { default: module.SupabaseSaveDialog };
});

const NewDocumentModal = lazy(async () => {
  const module = await import('./components/NewDocumentModal');
  return { default: module.NewDocumentModal };
});

const ComfyExportDialog = lazy(async () => {
  const module = await import('./components/ComfyExportDialog');
  return { default: module.ComfyExportDialog };
});

const PsgSceneAssetsDialog = lazy(async () => {
  const module = await import('./components/PsgSceneAssetsDialog');
  return { default: module.default ?? module.PsgSceneAssetsDialog };
});

const PsgCrowdExpansionDialog = lazy(async () => {
  const module = await import('./components/PsgCrowdExpansionDialog');
  return { default: module.PsgCrowdExpansionDialog };
});

const LocalSandboxGenerationDialog = lazy(async () => {
  const module = await import('./components/LocalSandboxGenerationDialog');
  return { default: module.LocalSandboxGenerationDialog };
});

const BugReportDialog = lazy(async () => {
  const module = await import('./components/BugReportDialog');
  return { default: module.default ?? module.BugReportDialog };
});

const ChangelogModal = lazy(
  () => import('@promptscape/core/components/ChangelogModal/ChangelogModal')
);

const GuideModal = lazy(async () => {
  const module = await import('./components/GuideModal');
  return { default: module.GuideModal };
});

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
  const [showGuide, setShowGuide] = useState(false);
  const [guideTab, setGuideTab] = useState<'getting-started' | 'user-guide'>('getting-started');
  const [showBugReportDialog, setShowBugReportDialog] = useState(false);
  const [showComfyExportDialog, setShowComfyExportDialog] = useState(false);
  const [showPsgSceneAssetsDialog, setShowPsgSceneAssetsDialog] = useState(false);
  const [showPsgCrowdExpansionDialog, setShowPsgCrowdExpansionDialog] =
    useState(false);
  const [showLocalSandboxGenerationDialog, setShowLocalSandboxGenerationDialog] =
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
    handleExportPsg,
    handleNew,
    confirmNewDocument,
    cancelNewDocument,
    handleSupabaseSave,
    buildComfyBridge,
    downloadComfyBridge,
    loadGraph,
    deleteGraph
  } = fileOps;
  const runtimeMode = useRuntimeMode({
    subscriptionActive: isAuthenticated
  });
  const canExportComfy = runtimeMode.psg.operations.includes('export-comfy');
  const canUseLocalSandboxGeneration = runtimeMode.localImage.available;
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
  const localSandboxDerivedRequest = useMemo(
    () =>
      deriveLocalSandboxRequestFromGraph({
        nodes: currentNodes,
        edges: currentEdges,
        fallbackPrompt: LOCAL_SANDBOX_TREE_PROMPT
      }),
    [currentEdges, currentNodes]
  );

  const handleCaptureLocalSandboxBatch = useCallback(
    (result: LocalImageBatchResponse) => {
      const capture = buildLocalSandboxCapturePayload({
        result,
        runtimeStatus: runtimeMode.localImageStatus,
        derivedRequest: localSandboxDerivedRequest,
        existingScene: psgScene
      });

      const existingAssets = new Map(psgAssets.map(asset => [asset.id, asset]));
      capture.assets.forEach(asset => {
        existingAssets.set(asset.id, asset);
      });

      persistPsgSceneManifest(Array.from(existingAssets.values()), capture.scene);
      showToast(
        `Captured ${capture.assets.length} local renders into PSG Scene Assets`,
        'success'
      );
    },
    [
      localSandboxDerivedRequest,
      persistPsgSceneManifest,
      psgAssets,
      psgScene,
      runtimeMode.localImageStatus,
      showToast
    ]
  );

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

  // Explore tab: full PSG-document templates (the same catalog as the splash
  // launcher), surfaced inside the editor so a document can be opened without
  // going back to the launch screen.
  const exploreDocuments = useMemo(
    () =>
      TEMPLATE_CATALOG.map(entry => ({
        id: entry.id,
        title: entry.title,
        description: entry.description,
        category: entry.category,
        categoryLabel: TEMPLATE_CATEGORY_LABELS[entry.category],
        branching: entry.branching,
        nodeCount: quickStartTemplates[entry.id]?.nodes.length
      })),
    []
  );

  const handleOpenDocument = useCallback(
    (id: string) => {
      const tmpl = quickStartTemplates[id];
      if (!tmpl) {
        showToast('That document is unavailable', 'error');
        return;
      }
      const title =
        TEMPLATE_CATALOG.find(entry => entry.id === id)?.title ?? 'document';

      const load = () => {
        handleNodesChange(tmpl.nodes as Node[]);
        handleEdgesChange(tmpl.edges as Edge[]);
        setEditorKey(prev => prev + 1);
        showToast(`Opened “${title}”`, 'success');
      };

      // Nothing on the canvas — nothing to lose, open straight away.
      if (currentNodes.length === 0) {
        load();
        return;
      }

      // Otherwise offer to save the current work before it's replaced.
      // (A three-way Save / Discard / Cancel modal — unlike the old binary
      // window.confirm, both Save and Discard open the document, so the common
      // case never silently fails; Cancel is the only abort.)
      const overlay = document.createElement('div');
      overlay.className = 'confirm-modal-overlay';
      overlay.style.cssText =
        'position:fixed;inset:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:10001;';
      const dialog = document.createElement('div');
      dialog.style.cssText =
        'background:#1b1e24;border:1px solid rgba(255,255,255,0.12);border-radius:10px;padding:22px;min-width:420px;max-width:90vw;box-shadow:0 16px 40px rgba(0,0,0,0.55);color:#e8edf4;';
      dialog.innerHTML = `
        <h3 style="margin:0 0 10px;font-size:17px;color:#f1f6f9;">Open &ldquo;${title}&rdquo;?</h3>
        <p style="margin:0 0 20px;font-size:13.5px;line-height:1.5;color:#c1cad3;">This replaces the current graph. Save your current work first, or discard it &mdash; it&rsquo;s kept for recovery either way.</p>
        <div style="display:flex;gap:10px;justify-content:flex-end;">
          <button data-act="cancel" style="padding:8px 14px;background:transparent;border:1px solid rgba(255,255,255,0.16);color:#c9d2db;border-radius:7px;cursor:pointer;font-size:13px;">Cancel</button>
          <button data-act="discard" style="padding:8px 14px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.16);color:#e8edf4;border-radius:7px;cursor:pointer;font-size:13px;">Discard &amp; open</button>
          <button data-act="save" style="padding:8px 14px;background:#e6a23c;border:none;color:#1a1206;border-radius:7px;cursor:pointer;font-size:13px;font-weight:600;">Save &amp; open</button>
        </div>`;
      overlay.appendChild(dialog);
      document.body.appendChild(overlay);
      (dialog.querySelector('[data-act="save"]') as HTMLButtonElement)?.focus();

      const close = () => {
        document.removeEventListener('keydown', onKey);
        if (overlay.parentNode) {
          document.body.removeChild(overlay);
        }
      };
      const choose = (act: string | undefined) => {
        close();
        if (act === 'cancel' || !act) {
          return;
        }
        if (act === 'save') {
          void handleSave(currentNodes, currentEdges);
        } else {
          void saveForRecovery(currentNodes, currentEdges);
        }
        load();
      };
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          choose('cancel');
        } else if (e.key === 'Enter') {
          choose('save');
        }
      };
      document.addEventListener('keydown', onKey);
      overlay.addEventListener('click', e => {
        if (e.target === overlay) {
          choose('cancel');
        }
      });
      dialog.querySelectorAll('button').forEach(btn =>
        btn.addEventListener('click', () =>
          choose((btn as HTMLElement).dataset.act)
        )
      );
    },
    [
      currentNodes,
      currentEdges,
      saveForRecovery,
      handleSave,
      handleNodesChange,
      handleEdgesChange,
      showToast
    ]
  );

  const editorSurfacePolicy = useMemo(
    () =>
      buildEditorSurfacePolicy({
        canExportComfy,
        canUseLocalSandboxGeneration,
        canExpandCrowdHosted,
        showPreview,
        showAssetLibrary: assetLibraryVisible,
        actions: {
          onBackToLaunch,
          onNew: handleCreateNew,
          onOpen: handleOpen,
          onSave: () => handleSave(currentNodes, currentEdges),
          onSaveAs: () => handleSaveAs(currentNodes, currentEdges),
          onSaveRegionFragment: () => {
            const saveRegionFragment = (
              window as typeof window & {
                __EPIC1_SAVE_SELECTED_REGION_AS_FRAGMENT__?:
                  | (() => Promise<void>)
                  | null;
              }
            ).__EPIC1_SAVE_SELECTED_REGION_AS_FRAGMENT__;

            if (!saveRegionFragment) {
              showToast('Select a Region Box to save as a fragment', 'info');
              return;
            }

            void saveRegionFragment();
          },
          onImport: handleLocalOpen,
          onExport: () => handleExportPsg(currentNodes, currentEdges),
          onExportComfy: () => setShowComfyExportDialog(true),
          onPsgSceneAssets: () => setShowPsgSceneAssetsDialog(true),
          onLocalSandboxGeneration: () =>
            setShowLocalSandboxGenerationDialog(true),
          onExpandCrowd: () => setShowPsgCrowdExpansionDialog(true),
          onUndo: handleUndo,
          onRedo: handleRedo,
          onCopy: handleCopy,
          onPaste: handlePaste,
          onToggleAssetLibrary: () =>
            setAssetLibraryVisible(prev => !prev),
          onOrganizeNodes: () =>
            (
              window as typeof window & {
                __EPIC1_ORGANIZE_NODES__?: (() => void) | null;
              }
            ).__EPIC1_ORGANIZE_NODES__?.(),
          onReportBug: () => setShowBugReportDialog(true),
          onChangelog: () => setShowChangelog(true),
          onGettingStarted: () => {
            setGuideTab('getting-started');
            setShowGuide(true);
          },
          onAdvancedTutorial: () => {
            window.dispatchEvent(
              new CustomEvent('epic1:startTutorial', {
                detail: { sequenceId: 'advanced' }
              })
            );
          },
          onUserGuide: () => {
            setGuideTab('user-guide');
            setShowGuide(true);
          }
        }
      }),
    [
      assetLibraryVisible,
      canExpandCrowdHosted,
      canExportComfy,
      canUseLocalSandboxGeneration,
      currentEdges,
      currentNodes,
      handleCopy,
      handleCreateNew,
      handleExportPsg,
      handleLocalOpen,
      handleOpen,
      handlePaste,
      handleRedo,
      handleSave,
      handleSaveAs,
      handleUndo,
      onBackToLaunch,
      setGuideTab,
      setShowGuide,
      showToast,
      showPreview
    ]
  );

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

  const renderDeferredSurface = useCallback(
    (children: React.ReactNode) => (
      <Suspense fallback={null}>{children}</Suspense>
    ),
    []
  );

  return (
    <IntelligenceProvider>
      <div
        style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}
      >
        {showMenuBar && (
          <SimpleMenuBar
            menuModel={editorSurfacePolicy.menuModel}
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
          sidePanelTabDefinitions={editorSurfacePolicy.tabDefinitions}
          exploreDocuments={exploreDocuments}
          onOpenDocument={handleOpenDocument}
        />

        {/* Modals */}
        {showPromptDissector &&
          renderDeferredSurface(
            <PromptDissector
              value=""
              onChange={noop}
              onAnalysisComplete={handlePromptAnalysisComplete}
              placeholder="Enter your prompt to generate nodes..."
            />
          )}

        {showRecoveryDialog &&
          recoveryData &&
          renderDeferredSurface(
            <WorkspaceRecoveryDialog
              onRecover={handleRecoveryAccept}
              onStartFresh={handleRecoveryDecline}
              onDismiss={handleRecoveryDismiss}
            />
          )}

        {showChangelog &&
          renderDeferredSurface(
            <ChangelogModal
              isOpen={showChangelog}
              onClose={() => setShowChangelog(false)}
            />
          )}

        {showGuide &&
          renderDeferredSurface(
            <GuideModal
              isOpen={showGuide}
              onClose={() => setShowGuide(false)}
              initial={guideTab}
            />
          )}

        {showBugReportDialog &&
          renderDeferredSurface(
            <BugReportDialog
              isOpen={showBugReportDialog}
              onClose={() => setShowBugReportDialog(false)}
              onCopyReport={handleCopyBugReport}
              onOpenIssue={handleOpenBugIssue}
            />
          )}

        {showOpenDialog &&
          renderDeferredSurface(
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
          )}

        {showSaveDialog &&
          renderDeferredSurface(
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
          )}

        {showNewDocumentModal &&
          renderDeferredSurface(
            <NewDocumentModal
              isOpen={showNewDocumentModal}
              onConfirm={confirmNewDocument}
              onCancel={cancelNewDocument}
            />
          )}

        {showComfyExportDialog &&
          renderDeferredSurface(
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
          )}

        {showPsgSceneAssetsDialog &&
          renderDeferredSurface(
            <PsgSceneAssetsDialog
              isOpen={showPsgSceneAssetsDialog}
              onClose={() => setShowPsgSceneAssetsDialog(false)}
              assets={psgAssets}
              scene={psgScene}
              cloudAssetReady={
                runtimeMode.mode === 'cloud' &&
                runtimeMode.supabase.cloudSyncAvailable
              }
              onSave={({ assets, scene }) =>
                persistPsgSceneManifest(assets, scene)
              }
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
                fileOps.downloadPsgSceneManifest(
                  document,
                  document.metadata.name
                );
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
          )}

        {showPsgCrowdExpansionDialog &&
          renderDeferredSurface(
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
          )}

        {showLocalSandboxGenerationDialog &&
          renderDeferredSurface(
            <LocalSandboxGenerationDialog
              isOpen={showLocalSandboxGenerationDialog}
              onClose={() => setShowLocalSandboxGenerationDialog(false)}
              runtimeStatus={runtimeMode.localImageStatus}
              derivedRequest={localSandboxDerivedRequest}
              onCaptureBatch={handleCaptureLocalSandboxBatch}
              onOpenSceneAssets={() => setShowPsgSceneAssetsDialog(true)}
            />
          )}

        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </div>
    </IntelligenceProvider>
  );
};
