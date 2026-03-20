import React, { useEffect, useState, useCallback, useRef } from 'react';
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
import { PsgImageBootstrapDialog } from './components/PsgImageBootstrapDialog';
import { ImageBootstrapSelectionPanel } from './components/ImageBootstrapSelectionPanel';
import {
  ScenePreviewV1Panel,
  type ScenePreviewV1State
} from './components/ScenePreviewV1Panel';
import { BugReportDialog } from './components/BugReportDialog';
import ChangelogModal from '@promptscape/core/components/ChangelogModal/ChangelogModal';
import { useRuntimeMode } from '@promptscape/core/hooks/useRuntimeMode';
import { useAuth } from '@promptscape/core/providers/AuthUserProvider';
import type {
  PsgDocument,
  PsgImagePreviewResponse,
  PsgAssetRef,
  PsgSceneAssemblyPlan,
  PsgPreviewBackend
} from '@promptscape/core/services/psg';
import { ApiPsgClient } from '@promptscape/core/services/psg';
import { exportGraphToPSG } from '@promptscape/core/fileFormats/psg';
import {
  mergeDraftIntoGraph,
  replaceBootstrapGroupInGraph,
  type BootstrapInsertionTarget
} from './utils/imageBootstrapInsertion';
import { getImageBootstrapSelectionSummary } from './utils/imageBootstrapSelection';
import { applyImageBootstrapSignalsToAssets } from './utils/imageBootstrapAssetSignals';
import { toAssetRegistryAssets } from './utils/imageBootstrapAssetRegistry';
import { getSurfaceBiasedComparableLabel } from './utils/scenePreviewComparables';
import {
  readBootstrapRefinementSeedFromStorage,
  writeBootstrapRefinementSeedToStorage
} from './utils/bootstrapRefinementSeedStorage';
import {
  readScenePreviewStateMapFromStorage,
  writeScenePreviewStateMapToStorage
} from './utils/scenePreviewStateStorage';
import {
  readPreviewPreferencesFromStorage,
  writePreviewPreferencesToStorage
} from './utils/previewPreferencesStorage';

interface Epic1EditorContainerProps {
  showPreview?: boolean;
  showAssetLibrary?: boolean;
  assetLibraryPosition?: 'left' | 'right';
  showMenuBar?: boolean;
  showOnboarding?: boolean;
  initialAnalysis?: PromptAnalysis;
  initialGraph?: { nodes: Node[]; edges: Edge[] };
  scenePreviewV1Enabled?: boolean;
  startWithTutorial?: boolean;
  onBackToLaunch?: () => void;
}

const MAX_BOOTSTRAP_PREVIEW_CACHE_GROUPS = 6;

type SelectionPreviewMeta = {
  updatedAt: number;
  state: 'fresh' | 'cached';
};

function getSupportedPreviewModels(backend: PsgPreviewBackend | null): string[] {
  if (!backend) {
    return [];
  }

  return backend.supportedModels?.length
    ? backend.supportedModels
    : backend.model
      ? [backend.model]
      : [];
}

function pickPreviewBackendForProfile(
  backends: PsgPreviewBackend[],
  preferredId: string | null,
  profile: 'bootstrap' | 'scene'
): PsgPreviewBackend | null {
  const explicit = backends.find(backend => backend.id === preferredId);
  if (explicit) {
    return explicit;
  }

  return (
    backends.find(backend => backend.profile === profile) ||
    backends[0] ||
    null
  );
}

function getSelectedInsertionTarget(
  nodes: Node[]
): BootstrapInsertionTarget | undefined {
  const selectedNodes = nodes.filter(node => node.selected);
  if (selectedNodes.length === 0) {
    return undefined;
  }

  const selectedRegion = selectedNodes.find(
    node => node.type === 'enhancedBoundingBox'
  );
  if (selectedRegion) {
    return {
      container: {
        id: selectedRegion.id,
        type: selectedRegion.type,
        position: selectedRegion.position
      }
    };
  }

  const maxX = selectedNodes.reduce(
    (max, node) =>
      Math.max(max, (node.position?.x ?? 0) + (node.width ?? 180)),
    Number.NEGATIVE_INFINITY
  );
  const minY = selectedNodes.reduce(
    (min, node) => Math.min(min, node.position?.y ?? 0),
    Number.POSITIVE_INFINITY
  );

  return {
    anchor: {
      x: maxX + 120,
      y: minY
    }
  };
}

export const Epic1EditorContainer: React.FC<Epic1EditorContainerProps> = ({
  showPreview = false,
  showAssetLibrary = true,
  assetLibraryPosition = 'left',
  showMenuBar = true,
  showOnboarding = false,
  initialAnalysis,
  initialGraph,
  scenePreviewV1Enabled = false,
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
  const [showPsgImageBootstrapDialog, setShowPsgImageBootstrapDialog] =
    useState(false);
  const [showPsgCrowdExpansionDialog, setShowPsgCrowdExpansionDialog] =
    useState(false);
  const [psgAssets, setPsgAssets] = useState<PsgAssetRef[]>([]);
  const [psgScene, setPsgScene] = useState<PsgSceneAssemblyPlan | null>(null);
  const [bootstrapRefinementSeed, setBootstrapRefinementSeed] =
    useState<ImageBootstrapSelectionSummary | null>(() => {
      try {
        return readBootstrapRefinementSeedFromStorage(window.localStorage);
      } catch {
        return null;
      }
    });
  const [selectionPreviewResponsesByGroup, setSelectionPreviewResponsesByGroup] =
    useState<Record<string, PsgImagePreviewResponse>>({});
  const [selectionPreviewErrorsByGroup, setSelectionPreviewErrorsByGroup] =
    useState<Record<string, string | null>>({});
  const [isSelectionPreviewing, setIsSelectionPreviewing] = useState(false);
  const [
    promotedSelectionPreviewResultIdsByGroup,
    setPromotedSelectionPreviewResultIdsByGroup
  ] = useState<Record<string, string | null>>({});
  const [selectionPreviewMetaByGroup, setSelectionPreviewMetaByGroup] =
    useState<Record<string, SelectionPreviewMeta>>({});
  const [selectionPreviewGroupOrder, setSelectionPreviewGroupOrder] = useState<
    string[]
  >([]);
  const [scenePreviewStateByGroup, setScenePreviewStateByGroup] = useState<
    Record<string, ScenePreviewV1State>
  >(() => {
    try {
      return readScenePreviewStateMapFromStorage(window.localStorage);
    } catch {
      return {};
    }
  });
  const [highlightScenePreview, setHighlightScenePreview] = useState(false);
  const initialPreviewPreferences =
    typeof window !== 'undefined'
      ? readPreviewPreferencesFromStorage(window.localStorage)
      : {
          bootstrap: { backendId: null, model: null },
          scene: { backendId: null, model: null }
        };
  const [previewBackends, setPreviewBackends] = useState<PsgPreviewBackend[]>([]);
  const [selectedBootstrapPreviewBackendId, setSelectedBootstrapPreviewBackendId] =
    useState<string | null>(initialPreviewPreferences.bootstrap.backendId);
  const [selectedBootstrapPreviewModel, setSelectedBootstrapPreviewModel] =
    useState<string | null>(initialPreviewPreferences.bootstrap.model);
  const [selectedScenePreviewBackendId, setSelectedScenePreviewBackendId] =
    useState<string | null>(initialPreviewPreferences.scene.backendId);
  const [selectedScenePreviewModel, setSelectedScenePreviewModel] = useState<
    string | null
  >(initialPreviewPreferences.scene.model);
  const [highlightSceneBiasSurface, setHighlightSceneBiasSurface] = useState<
    'wall' | 'floor' | 'both' | null
  >(null);
  const [scenePreviewPopulateRequest, setScenePreviewPopulateRequest] = useState<{
    surface: 'wall' | 'floor';
    requestId: number;
  } | null>(null);
  const previousBootstrapGroupIdRef = useRef<string | null>(null);
  const noop = useCallback(() => undefined, []);
  const bootstrapSelectionSummary = getImageBootstrapSelectionSummary(currentNodes);
  const effectiveBootstrapSelectionSummary =
    bootstrapRefinementSeed && bootstrapSelectionSummary
      ? {
          ...bootstrapSelectionSummary,
          ...bootstrapRefinementSeed
        }
      : bootstrapSelectionSummary;
  const currentBootstrapGroupId =
    effectiveBootstrapSelectionSummary?.bootstrapGroupId ?? null;
  const selectionPreviewResponse = currentBootstrapGroupId
    ? selectionPreviewResponsesByGroup[currentBootstrapGroupId] || null
    : null;
  const selectionPreviewError = currentBootstrapGroupId
    ? selectionPreviewErrorsByGroup[currentBootstrapGroupId] || null
    : null;
  const promotedSelectionPreviewResultId = currentBootstrapGroupId
    ? promotedSelectionPreviewResultIdsByGroup[currentBootstrapGroupId] || null
    : null;
  const selectionPreviewMeta = currentBootstrapGroupId
    ? selectionPreviewMetaByGroup[currentBootstrapGroupId] || null
    : null;
  const scenePreviewState = currentBootstrapGroupId
    ? scenePreviewStateByGroup[currentBootstrapGroupId] || null
    : null;
  const previousSceneBiasRef = useRef<{
    groupId: string | null;
    wall: string | undefined;
    floor: string | undefined;
  }>({
    groupId: null,
    wall: undefined,
    floor: undefined
  });

  useEffect(() => {
    if (!highlightScenePreview) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setHighlightScenePreview(false);
    }, 1800);

    return () => window.clearTimeout(timeoutId);
  }, [highlightScenePreview]);

  useEffect(() => {
    if (!effectiveBootstrapSelectionSummary) {
      previousSceneBiasRef.current = {
        groupId: null,
        wall: undefined,
        floor: undefined
      };
      setHighlightSceneBiasSurface(null);
      return;
    }

    const nextWall = getSurfaceBiasedComparableLabel(
      effectiveBootstrapSelectionSummary,
      'wall',
      0
    );
    const nextFloor = getSurfaceBiasedComparableLabel(
      effectiveBootstrapSelectionSummary,
      'floor',
      0
    );
    const previous = previousSceneBiasRef.current;

    if (previous.groupId === effectiveBootstrapSelectionSummary.bootstrapGroupId) {
      const wallChanged = previous.wall !== nextWall;
      const floorChanged = previous.floor !== nextFloor;
      if (wallChanged || floorChanged) {
        setHighlightSceneBiasSurface(
          wallChanged && floorChanged
            ? 'both'
            : wallChanged
              ? 'wall'
              : 'floor'
        );
        const timeoutId = window.setTimeout(() => {
          setHighlightSceneBiasSurface(null);
        }, 1800);
        previousSceneBiasRef.current = {
          groupId: effectiveBootstrapSelectionSummary.bootstrapGroupId,
          wall: nextWall,
          floor: nextFloor
        };
        return () => window.clearTimeout(timeoutId);
      }
    }

    previousSceneBiasRef.current = {
      groupId: effectiveBootstrapSelectionSummary.bootstrapGroupId,
      wall: nextWall,
      floor: nextFloor
    };
  }, [effectiveBootstrapSelectionSummary]);

  useEffect(() => {
    if (!bootstrapRefinementSeed) {
      return;
    }

    // Initial graph hydration happens after mount; avoid clearing a persisted
    // seed before the selected bootstrap has been restored into editor state.
    if (currentNodes.length === 0) {
      return;
    }

    if (
      !bootstrapSelectionSummary ||
      bootstrapRefinementSeed?.bootstrapGroupId !==
        bootstrapSelectionSummary.bootstrapGroupId
    ) {
      setBootstrapRefinementSeed(null);
    }
  }, [
    bootstrapRefinementSeed,
    bootstrapSelectionSummary,
    currentNodes.length
  ]);

  useEffect(() => {
    try {
      writeBootstrapRefinementSeedToStorage(
        window.localStorage,
        bootstrapRefinementSeed
      );
    } catch {
      return;
    }
  }, [bootstrapRefinementSeed]);

  useEffect(() => {
    try {
      writeScenePreviewStateMapToStorage(
        window.localStorage,
        scenePreviewStateByGroup
      );
    } catch {
      // Ignore storage failures; scene preview durability is a best-effort enhancement.
    }
  }, [scenePreviewStateByGroup]);

  useEffect(() => {
    const previousGroupId = previousBootstrapGroupIdRef.current;
    previousBootstrapGroupIdRef.current = currentBootstrapGroupId;

    if (
      currentBootstrapGroupId &&
      currentBootstrapGroupId !== previousGroupId &&
      selectionPreviewResponsesByGroup[currentBootstrapGroupId] &&
      selectionPreviewMetaByGroup[currentBootstrapGroupId]
    ) {
      setSelectionPreviewMetaByGroup(current => ({
        ...current,
        [currentBootstrapGroupId]: {
          ...current[currentBootstrapGroupId],
          state: 'cached'
        }
      }));
    }
  }, [
    currentBootstrapGroupId,
    selectionPreviewMetaByGroup,
    selectionPreviewResponsesByGroup
  ]);

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

  useEffect(() => {
    const registryAssets = toAssetRegistryAssets(psgAssets);
    window.dispatchEvent(
      new CustomEvent('assetRegistry:update', {
        detail: {
          assets: registryAssets
        }
      })
    );
  }, [psgAssets]);

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
    handleNew,
    confirmNewDocument,
    cancelNewDocument,
    handleSupabaseSave,
    buildComfyBridge,
    downloadComfyBridge,
    loadGraph,
    deleteGraph
  } = fileOps;
  const { user } = useAuth();
  
  const isSubscriptionActive = 
    user?.user_metadata?.subscriptionState === 'active' || 
    user?.app_metadata?.subscriptionState === 'active';

  const runtimeMode = useRuntimeMode({
    subscriptionActive: isAuthenticated && isSubscriptionActive
  });
  const canExportComfy = runtimeMode.psg.operations.includes('export-comfy');
  const canExpandCrowdHosted =
    runtimeMode.psg.accessMode === 'cloud' &&
    runtimeMode.psg.hostedUpgradeOperations.includes('expand-crowd');
  const canUseImageBootstrapHosted =
    runtimeMode.psg.accessMode === 'cloud' &&
    runtimeMode.psg.hostedUpgradeOperations.includes('images-analyze') &&
    runtimeMode.psg.hostedUpgradeOperations.includes('images-review') &&
    runtimeMode.psg.hostedUpgradeOperations.includes('images-draft-graph');
  const canUseHostedPreview =
    runtimeMode.psg.accessMode === 'cloud' &&
    runtimeMode.psg.hostedUpgradeOperations.includes('images-preview');
  const selectedBootstrapPreviewBackend = pickPreviewBackendForProfile(
    previewBackends,
    selectedBootstrapPreviewBackendId,
    'bootstrap'
  );
  const selectedScenePreviewBackend = pickPreviewBackendForProfile(
    previewBackends,
    selectedScenePreviewBackendId,
    'scene'
  );
  const availableBootstrapPreviewModels = getSupportedPreviewModels(
    selectedBootstrapPreviewBackend
  );
  const availableScenePreviewModels = getSupportedPreviewModels(
    selectedScenePreviewBackend
  );
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

  useEffect(() => {
    let cancelled = false;

    if (!canUseHostedPreview) {
      setPreviewBackends([]);
      setSelectedBootstrapPreviewBackendId(null);
      setSelectedBootstrapPreviewModel(null);
      setSelectedScenePreviewBackendId(null);
      setSelectedScenePreviewModel(null);
      return;
    }

    const loadCapabilities = async () => {
      try {
        const client = new ApiPsgClient();
        const capabilities = await client.getCapabilities();
        if (cancelled) {
          return;
        }
        const nextBackends = capabilities.previewBackends || [];
        setPreviewBackends(nextBackends);
        setSelectedBootstrapPreviewBackendId(current =>
          pickPreviewBackendForProfile(nextBackends, current, 'bootstrap')?.id ||
          null
        );
        setSelectedScenePreviewBackendId(current =>
          pickPreviewBackendForProfile(nextBackends, current, 'scene')?.id || null
        );
      } catch (error) {
        if (cancelled) {
          return;
        }
        console.error('Failed to load PSG preview capabilities', error);
        setPreviewBackends([]);
        setSelectedBootstrapPreviewBackendId(null);
        setSelectedBootstrapPreviewModel(null);
        setSelectedScenePreviewBackendId(null);
        setSelectedScenePreviewModel(null);
      }
    };

    void loadCapabilities();

    return () => {
      cancelled = true;
    };
  }, [canUseHostedPreview]);

  useEffect(() => {
    if (!selectedBootstrapPreviewBackend) {
      setSelectedBootstrapPreviewModel(null);
      return;
    }

    setSelectedBootstrapPreviewModel(current =>
      current && availableBootstrapPreviewModels.includes(current)
        ? current
        : (availableBootstrapPreviewModels[0] ?? null)
    );
  }, [availableBootstrapPreviewModels, selectedBootstrapPreviewBackend]);

  useEffect(() => {
    if (!selectedScenePreviewBackend) {
      setSelectedScenePreviewModel(null);
      return;
    }

    setSelectedScenePreviewModel(current =>
      current && availableScenePreviewModels.includes(current)
        ? current
        : (availableScenePreviewModels[0] ?? null)
    );
  }, [availableScenePreviewModels, selectedScenePreviewBackend]);

  useEffect(() => {
    try {
      writePreviewPreferencesToStorage(window.localStorage, {
        bootstrap: {
          backendId: selectedBootstrapPreviewBackendId,
          model: selectedBootstrapPreviewModel
        },
        scene: {
          backendId: selectedScenePreviewBackendId,
          model: selectedScenePreviewModel
        }
      });
    } catch {
      // Ignore storage failures for non-critical preferences.
    }
  }, [
    selectedBootstrapPreviewBackendId,
    selectedBootstrapPreviewModel,
    selectedScenePreviewBackendId,
    selectedScenePreviewModel
  ]);

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

  const handleManageSubscription = async () => {
    try {
      showToast('Preparing checkout...', 'info');
      const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
      const apiUrl = `${origin}/api/stripe/create-checkout-session`;

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: 'price_123', // Placeholder, configure in dashboard
          successUrl: window.location.href,
          cancelUrl: window.location.href,
          userEmail: user?.email,
          userId: user?.id,
        })
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'No checkout URL returned');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to start checkout session', 'error');
    }
  };

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

  const touchSelectionPreviewGroup = useCallback((groupId: string) => {
    setSelectionPreviewGroupOrder(current => {
      const next = [groupId, ...current.filter(id => id !== groupId)];
      if (next.length <= MAX_BOOTSTRAP_PREVIEW_CACHE_GROUPS) {
        return next;
      }

      const pruned = next.slice(0, MAX_BOOTSTRAP_PREVIEW_CACHE_GROUPS);
      const removedIds = next.slice(MAX_BOOTSTRAP_PREVIEW_CACHE_GROUPS);

      if (removedIds.length > 0) {
        setSelectionPreviewResponsesByGroup(currentResponses => {
          const updated = { ...currentResponses };
          removedIds.forEach(id => {
            delete updated[id];
          });
          return updated;
        });
        setSelectionPreviewErrorsByGroup(currentErrors => {
          const updated = { ...currentErrors };
          removedIds.forEach(id => {
            delete updated[id];
          });
          return updated;
        });
        setSelectionPreviewMetaByGroup(currentMeta => {
          const updated = { ...currentMeta };
          removedIds.forEach(id => {
            delete updated[id];
          });
          return updated;
        });
        setPromotedSelectionPreviewResultIdsByGroup(currentPromoted => {
          const updated = { ...currentPromoted };
          removedIds.forEach(id => {
            delete updated[id];
          });
          return updated;
        });
      }

      return pruned;
    });
  }, []);

  const buildWorkingBootstrapDocument = useCallback((): PsgDocument => {
    return {
      version: 'psg/1',
      kind: 'fragment',
      metadata: {
        name: 'Image Bootstrap Working Graph'
      },
      fragment: exportGraphToPSG(
        currentNodes as Parameters<typeof exportGraphToPSG>[0],
        currentEdges as Parameters<typeof exportGraphToPSG>[1],
        { name: 'image-bootstrap-working-graph' }
      ),
      assets: psgAssets,
      scene: psgScene || undefined
    };
  }, [currentEdges, currentNodes, psgAssets, psgScene]);

  const handlePreviewSelectedBootstrap = useCallback(async () => {
    if (
      !effectiveBootstrapSelectionSummary?.reviewCheckpoint ||
      !currentBootstrapGroupId
    ) {
      if (currentBootstrapGroupId) {
        setSelectionPreviewErrorsByGroup(current => ({
          ...current,
          [currentBootstrapGroupId]:
            'No reviewed checkpoint is attached to this bootstrap yet.'
        }));
      }
      return;
    }
    if (!canUseHostedPreview) {
      setSelectionPreviewErrorsByGroup(current => ({
        ...current,
        [currentBootstrapGroupId]:
          'Hosted image preview is not available in this runtime mode.'
      }));
      return;
    }

    setIsSelectionPreviewing(true);
    setSelectionPreviewErrorsByGroup(current => ({
      ...current,
      [currentBootstrapGroupId]: null
    }));
    try {
      const client = new ApiPsgClient();
      const preview = await client.previewImages(
        buildWorkingBootstrapDocument(),
        effectiveBootstrapSelectionSummary.reviewCheckpoint,
        {
          count:
            selectedBootstrapPreviewBackend?.profile === 'scene'
              ? 4
              : 3,
          backendId: selectedBootstrapPreviewBackend?.id || undefined,
          model: selectedBootstrapPreviewModel || undefined,
          includePromptBlueprint: true
        }
      );
      setSelectionPreviewResponsesByGroup(current => ({
        ...current,
        [currentBootstrapGroupId]: preview
      }));
      setSelectionPreviewMetaByGroup(current => ({
        ...current,
        [currentBootstrapGroupId]: {
          updatedAt: Date.now(),
          state: 'fresh'
        }
      }));
      setPromotedSelectionPreviewResultIdsByGroup(current => ({
        ...current,
        [currentBootstrapGroupId]: null
      }));
      touchSelectionPreviewGroup(currentBootstrapGroupId);
    } catch (error) {
      setSelectionPreviewErrorsByGroup(current => ({
        ...current,
        [currentBootstrapGroupId]:
          error instanceof Error
            ? error.message
            : 'Failed to preview selected bootstrap'
      }));
    } finally {
      setIsSelectionPreviewing(false);
    }
  }, [
    buildWorkingBootstrapDocument,
    canUseHostedPreview,
    currentBootstrapGroupId,
    effectiveBootstrapSelectionSummary,
    selectedBootstrapPreviewBackend,
    selectedBootstrapPreviewModel
  ]);

  const handleRerollSelectionPreviewResult = useCallback(
    async (resultId: string) => {
      if (
        !effectiveBootstrapSelectionSummary?.reviewCheckpoint ||
        !selectionPreviewResponse ||
        !currentBootstrapGroupId
      ) {
        return;
      }

      const targetIndex = selectionPreviewResponse.preview.results.findIndex(
        result => result.id === resultId
      );
      if (targetIndex < 0) {
        return;
      }

      const currentResult = selectionPreviewResponse.preview.results[targetIndex];
      setIsSelectionPreviewing(true);
      setSelectionPreviewErrorsByGroup(current => ({
        ...current,
        [currentBootstrapGroupId]: null
      }));
      try {
        const client = new ApiPsgClient();
        const rerolled = await client.previewImages(
          buildWorkingBootstrapDocument(),
          effectiveBootstrapSelectionSummary.reviewCheckpoint,
          {
            count: 1,
            seed: currentResult.seed + 1,
            backendId: selectedBootstrapPreviewBackend?.id || undefined,
            model: selectedBootstrapPreviewModel || undefined,
            includePromptBlueprint: true
          }
        );
        const nextResult = rerolled.preview.results[0];
        if (!nextResult) {
          throw new Error('No preview result returned for reroll.');
        }
        setSelectionPreviewResponsesByGroup(current => ({
          ...current,
          [currentBootstrapGroupId]: {
            ...selectionPreviewResponse,
            preview: {
              ...selectionPreviewResponse.preview,
              seed: rerolled.preview.seed,
              promptBlueprint:
                rerolled.preview.promptBlueprint ||
                selectionPreviewResponse.preview.promptBlueprint,
              results: selectionPreviewResponse.preview.results.map((result, index) =>
                index === targetIndex ? nextResult : result
              )
            }
          }
        }));
        setSelectionPreviewMetaByGroup(current => ({
          ...current,
          [currentBootstrapGroupId]: {
            updatedAt: Date.now(),
            state: 'fresh'
          }
        }));
        setPromotedSelectionPreviewResultIdsByGroup(current => ({
          ...current,
          [currentBootstrapGroupId]: null
        }));
        touchSelectionPreviewGroup(currentBootstrapGroupId);
      } catch (error) {
        setSelectionPreviewErrorsByGroup(current => ({
          ...current,
          [currentBootstrapGroupId]:
            error instanceof Error
              ? error.message
              : 'Failed to reroll preview result'
        }));
      } finally {
        setIsSelectionPreviewing(false);
      }
    },
    [
      buildWorkingBootstrapDocument,
      currentBootstrapGroupId,
      effectiveBootstrapSelectionSummary,
      selectedBootstrapPreviewBackend,
      selectedBootstrapPreviewModel,
      selectionPreviewResponse,
      touchSelectionPreviewGroup
    ]
  );

  const handlePromoteSelectionPreviewResult = useCallback(
    (result: PsgImagePreviewResponse['preview']['results'][number]) => {
      if (!bootstrapSelectionSummary) {
        return;
      }

      const preferredLabel = result.metadata.preferredComparableLabels[0];
      const existingComparable = preferredLabel
        ? bootstrapSelectionSummary.preferredComparableRefs.find(
            ref => ref.label === preferredLabel
          )
        : undefined;
      const promotedComparable = existingComparable
        ? existingComparable
        : preferredLabel
          ? {
              id: `preview-promoted:${preferredLabel}`,
              label: preferredLabel
            }
          : undefined;

      const nextPreferredComparableRefs = [
        ...(promotedComparable ? [promotedComparable] : []),
        ...bootstrapSelectionSummary.preferredComparableRefs.filter(
          ref => ref.id !== promotedComparable?.id
        )
      ];

      setBootstrapRefinementSeed({
        ...bootstrapSelectionSummary,
        preferredComparableRefs: nextPreferredComparableRefs,
        lockedTraitKeys: Array.from(
          new Set([
            ...bootstrapSelectionSummary.lockedTraitKeys,
            ...result.metadata.lockedTraitKeys
          ])
        ),
        forceSynthesisKeys: Array.from(
          new Set([
            ...bootstrapSelectionSummary.forceSynthesisKeys,
            ...result.metadata.variableTraitKeys
          ])
        ),
        notes: preferredLabel
          ? `Scene preview promoted family: ${preferredLabel}`
          : bootstrapSelectionSummary.notes
      });
      if (currentBootstrapGroupId) {
        setPromotedSelectionPreviewResultIdsByGroup(current => ({
          ...current,
          [currentBootstrapGroupId]: result.id
        }));
        touchSelectionPreviewGroup(currentBootstrapGroupId);
      }
    },
    [bootstrapSelectionSummary, currentBootstrapGroupId, touchSelectionPreviewGroup]
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
            onImageBootstrap={
              canUseImageBootstrapHosted
                ? () => setShowPsgImageBootstrapDialog(true)
                : undefined
            }
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
            onPresets={() => setAssetLibraryVisible(prev => !prev)}
            presetsActive={assetLibraryVisible}
            onReportBug={() => setShowBugReportDialog(true)}
            onChangelog={() => setShowChangelog(true)}
            onManageSubscription={isAuthenticated ? handleManageSubscription : undefined}
            isSubscriptionActive={isSubscriptionActive}
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

        {effectiveBootstrapSelectionSummary ? (
          <>
            <ImageBootstrapSelectionPanel
              summary={effectiveBootstrapSelectionSummary}
              previewBackends={previewBackends}
              selectedPreviewBackendId={
                selectedBootstrapPreviewBackend?.id || null
              }
              selectedPreviewModel={selectedBootstrapPreviewModel}
              onChangePreviewBackend={backendId => {
                setSelectedBootstrapPreviewBackendId(backendId);
              }}
              onChangePreviewModel={model => {
                setSelectedBootstrapPreviewModel(model);
              }}
              scenePreviewPlacementCount={scenePreviewState?.placements.length || 0}
              scenePreviewMode={scenePreviewState?.mode || null}
              onChangeScenePreviewMode={mode => {
                if (!currentBootstrapGroupId) {
                  return;
                }
                setScenePreviewStateByGroup(current => ({
                  ...current,
                  [currentBootstrapGroupId]: {
                    placements: current[currentBootstrapGroupId]?.placements || [],
                    usedCachedPreviewResultIds:
                      current[currentBootstrapGroupId]?.usedCachedPreviewResultIds || [],
                    mode
                  }
                }));
              }}
              highlightSceneBiasSurface={highlightSceneBiasSurface}
              onOpenScenePreview={
                scenePreviewState?.placements.length
                  ? () => setHighlightScenePreview(true)
                  : undefined
              }
              onPopulateSceneSurface={surface => {
                setHighlightScenePreview(true);
                setScenePreviewPopulateRequest({
                  surface,
                  requestId: Date.now()
                });
              }}
              onClearSavedScenePreview={
                currentBootstrapGroupId && scenePreviewState?.placements.length
                  ? () => {
                      setScenePreviewStateByGroup(current => {
                        const next = { ...current };
                        delete next[currentBootstrapGroupId];
                        return next;
                      });
                    }
                  : undefined
              }
              onClearQueuedRefinement={
                effectiveBootstrapSelectionSummary.notes?.startsWith(
                  'Scene preview promoted'
                )
                  ? () => {
                      setBootstrapRefinementSeed(null);
                      if (currentBootstrapGroupId) {
                        setPromotedSelectionPreviewResultIdsByGroup(current => ({
                          ...current,
                          [currentBootstrapGroupId]: null
                        }));
                      }
                    }
                  : undefined
              }
              onPreview={handlePreviewSelectedBootstrap}
              onRefreshPreview={
                selectionPreviewResponse ? handlePreviewSelectedBootstrap : undefined
              }
              onRerollPreviewResult={handleRerollSelectionPreviewResult}
              onPromotePreviewResult={handlePromoteSelectionPreviewResult}
              canPreview={
                canUseHostedPreview &&
                Boolean(effectiveBootstrapSelectionSummary.reviewCheckpoint)
              }
              isPreviewing={isSelectionPreviewing}
              promotedPreviewResultId={promotedSelectionPreviewResultId}
              previewMeta={selectionPreviewMeta}
              previewResponse={selectionPreviewResponse}
              previewError={selectionPreviewError}
              onRefine={() => setShowPsgImageBootstrapDialog(true)}
            />
            {scenePreviewV1Enabled ? (
              <ScenePreviewV1Panel
                summary={effectiveBootstrapSelectionSummary}
                document={buildWorkingBootstrapDocument()}
                psgAccessMode={runtimeMode.psg.accessMode}
                hostedUpgradeOperations={runtimeMode.psg.hostedUpgradeOperations}
                previewBackendId={selectedScenePreviewBackend?.id || undefined}
                previewModel={selectedScenePreviewModel || undefined}
                cachedPreviewResponse={selectionPreviewResponse}
                persistedState={scenePreviewState}
                isHighlighted={highlightScenePreview}
                highlightBiasSurface={highlightSceneBiasSurface}
                externalPopulateRequest={scenePreviewPopulateRequest}
                onPersistedStateChange={state => {
                  if (!currentBootstrapGroupId) {
                    return;
                  }

                  setScenePreviewStateByGroup(current => ({
                    ...current,
                    [currentBootstrapGroupId]: state
                  }));
                }}
                onPromotePlacement={payload => {
                  if (!bootstrapSelectionSummary) {
                    return;
                  }

                  const promotedRef = payload.preferredComparableRefId
                    ? bootstrapSelectionSummary.preferredComparableRefs.find(
                        ref => ref.id === payload.preferredComparableRefId
                      )
                    : bootstrapSelectionSummary.preferredComparableRefs.find(
                        ref => ref.label === payload.preferredComparableLabel
                      );

                  const nextPreferredComparableRefs = [
                    ...(promotedRef ? [promotedRef] : []),
                    ...bootstrapSelectionSummary.preferredComparableRefs.filter(
                      ref => ref.id !== promotedRef?.id
                    )
                  ];

                  setBootstrapRefinementSeed({
                    ...bootstrapSelectionSummary,
                    preferredComparableRefs: nextPreferredComparableRefs,
                    lockedTraitKeys: Array.from(
                      new Set([
                        ...bootstrapSelectionSummary.lockedTraitKeys,
                        ...payload.lockedTraitKeys
                      ])
                    ),
                    forceSynthesisKeys: Array.from(
                      new Set([
                        ...bootstrapSelectionSummary.forceSynthesisKeys,
                        ...payload.forceSynthesisKeys
                      ])
                    ),
                    notes: payload.note || bootstrapSelectionSummary.notes
                  });
                  setShowPsgImageBootstrapDialog(true);
                }}
              />
            ) : null}
          </>
        ) : null}

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

        <PsgImageBootstrapDialog
          isOpen={showPsgImageBootstrapDialog}
          onClose={() => setShowPsgImageBootstrapDialog(false)}
          document={buildWorkingBootstrapDocument()}
          assets={psgAssets}
          psgAccessMode={runtimeMode.psg.accessMode}
          hostedUpgradeOperations={runtimeMode.psg.hostedUpgradeOperations}
          previewBackends={previewBackends}
          selectedPreviewBackendId={selectedBootstrapPreviewBackend?.id || null}
          selectedPreviewModel={selectedBootstrapPreviewModel}
          onChangePreviewBackend={backendId => {
            setSelectedBootstrapPreviewBackendId(backendId);
          }}
          onChangePreviewModel={model => {
            setSelectedBootstrapPreviewModel(model);
          }}
          initialSelectionSummary={effectiveBootstrapSelectionSummary}
          onApplyDraft={({ nodes, edges, checkpoint }) => {
            const nodesWithCheckpoint = nodes.map(node => ({
              ...node,
              data: {
                ...(typeof node.data === 'object' && node.data !== null ? node.data : {}),
                reviewCheckpoint: checkpoint
              }
            }));
            const merged = effectiveBootstrapSelectionSummary
              ? replaceBootstrapGroupInGraph(
                  currentNodes,
                  currentEdges,
                  nodesWithCheckpoint,
                  edges,
                  effectiveBootstrapSelectionSummary.bootstrapGroupId,
                  Date.now()
                )
              : mergeDraftIntoGraph(
                  currentNodes,
                  currentEdges,
                  nodesWithCheckpoint,
                  edges,
                  Date.now(),
                  getSelectedInsertionTarget(currentNodes)
                );
            const nextAssets = applyImageBootstrapSignalsToAssets(
              psgAssets,
              checkpoint
            );
            setCurrentNodes(merged.nodes);
            setCurrentEdges(merged.edges);
            persistPsgSceneManifest(nextAssets, psgScene);
            setBootstrapRefinementSeed(null);
            setEditorKey(prev => prev + 1);
            showToast(
              effectiveBootstrapSelectionSummary
                ? 'Refined image bootstrap draft in place and updated asset reuse signals'
                : 'Inserted image bootstrap draft and updated asset reuse signals',
              'success'
            );
          }}
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
