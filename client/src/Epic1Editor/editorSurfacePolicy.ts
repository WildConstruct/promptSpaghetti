import type {
  MenuActionModel,
  MenuModel,
  MenuSectionModel
} from './components/SimpleMenuBar';
import type {
  SidePanelTabDefinition,
  SidePanelTabId
} from '@promptscape/core/components/epic1/TabbedSidePanel';

type EditorSurfaceId =
  | 'document.new'
  | 'document.open'
  | 'document.save'
  | 'document.saveAs'
  | 'document.localOpen'
  | 'document.exportPsg'
  | 'handoff.comfy'
  | 'advanced.sceneAssets'
  | 'advanced.localSandboxGeneration'
  | 'advanced.crowdExpansion'
  | 'tab.library'
  | 'tab.preview'
  | 'tab.linked'
  | 'tab.explore'
  | 'tab.graph';

type EditorSurfaceTier = 'core' | 'advanced';
type EditorSurfaceAvailability = 'available' | 'hosted_only' | 'disabled';

interface EditorSurfaceDefinition {
  id: EditorSurfaceId;
  label: string;
  helperText: string;
  tier: EditorSurfaceTier;
  availability: EditorSurfaceAvailability;
  group: 'document' | 'handoff' | 'advanced' | 'tab';
}

interface EditorSurfacePolicy {
  surfaces: Record<EditorSurfaceId, EditorSurfaceDefinition>;
  menuModel: MenuModel;
  tabDefinitions: SidePanelTabDefinition[];
}

interface EditorSurfacePolicyActions {
  onBackToLaunch?: () => void;
  onNew?: () => void;
  onOpen?: () => void;
  onSave?: () => void;
  onSaveAs?: () => void;
  onImport?: () => void;
  onExport?: () => void;
  onExportComfy?: () => void;
  onPsgSceneAssets?: () => void;
  onLocalSandboxGeneration?: () => void;
  onExpandCrowd?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onCopy?: () => void;
  onPaste?: () => void;
  onToggleAssetLibrary?: () => void;
  onOrganizeNodes?: () => void;
  onReportBug?: () => void;
  onChangelog?: () => void;
}

interface EditorSurfacePolicyArgs {
  canExportComfy: boolean;
  canUseLocalSandboxGeneration: boolean;
  canExpandCrowdHosted: boolean;
  showPreview: boolean;
  showAssetLibrary: boolean;
  actions: EditorSurfacePolicyActions;
}

const createSurface = (
  id: EditorSurfaceId,
  label: string,
  helperText: string,
  tier: EditorSurfaceTier,
  availability: EditorSurfaceAvailability,
  group: EditorSurfaceDefinition['group']
): EditorSurfaceDefinition => ({
  id,
  label,
  helperText,
  tier,
  availability,
  group
});

const pushAction = (
  items: MenuSectionModel['items'],
  action: MenuActionModel | null,
  dividerId?: string
) => {
  if (!action) {
    return;
  }
  if (dividerId && items.length > 0) {
    items.push({ type: 'divider', id: dividerId });
  }
  items.push(action);
};

const mapTab = (
  id: SidePanelTabId,
  surface: EditorSurfaceDefinition
): SidePanelTabDefinition => ({
  id,
  label: surface.label,
  title: surface.label,
  ariaLabel: surface.label,
  tier: surface.tier,
  availability: surface.availability,
  helperText: surface.helperText
});

export const buildEditorSurfacePolicy = ({
  canExportComfy,
  canUseLocalSandboxGeneration,
  canExpandCrowdHosted,
  showPreview,
  showAssetLibrary,
  actions
}: EditorSurfacePolicyArgs): EditorSurfacePolicy => {
  const surfaces: Record<EditorSurfaceId, EditorSurfaceDefinition> = {
    'document.new': createSurface(
      'document.new',
      'New Document',
      'Start a fresh PSG family graph.',
      'core',
      'available',
      'document'
    ),
    'document.open': createSurface(
      'document.open',
      'Open PSG...',
      'Load an existing PSG document.',
      'core',
      'available',
      'document'
    ),
    'document.save': createSurface(
      'document.save',
      'Save',
      'Save the active PSG document.',
      'core',
      'available',
      'document'
    ),
    'document.saveAs': createSurface(
      'document.saveAs',
      'Save PSG As...',
      'Save the active graph as a new PSG document.',
      'core',
      'available',
      'document'
    ),
    'document.localOpen': createSurface(
      'document.localOpen',
      'Open Local PSG...',
      'Import a PSG file from local storage.',
      'core',
      'available',
      'document'
    ),
    'document.exportPsg': createSurface(
      'document.exportPsg',
      'Export PSG...',
      'Export the current graph as a PSG document.',
      'core',
      'available',
      'document'
    ),
    'handoff.comfy': createSurface(
      'handoff.comfy',
      'Export For Comfy...',
      canExportComfy
        ? 'Primary downstream handoff for the current MVP wedge.'
        : 'Primary downstream handoff, currently unavailable in this runtime mode.',
      'core',
      canExportComfy ? 'available' : 'disabled',
      'handoff'
    ),
    'advanced.sceneAssets': createSurface(
      'advanced.sceneAssets',
      'Advanced PSG Scene Assets...',
      'Advanced scene-sidecar tooling that supports, but does not define, the MVP loop.',
      'advanced',
      'available',
      'advanced'
    ),
    'advanced.localSandboxGeneration': createSurface(
      'advanced.localSandboxGeneration',
      'Local Sandbox Generation (Local Only)...',
      canUseLocalSandboxGeneration
        ? 'Optional local-only Comfy-compatible execution lane for deterministic seed-driven image batches.'
        : 'Optional local-only Comfy-compatible execution lane. Visible now, but unavailable until a local runtime is configured.',
      'advanced',
      canUseLocalSandboxGeneration ? 'available' : 'disabled',
      'advanced'
    ),
    'advanced.crowdExpansion': createSurface(
      'advanced.crowdExpansion',
      'Hosted Crowd Expansion (Cloud Only)...',
      canExpandCrowdHosted
        ? 'Hosted-only crowd expansion on the cloud path.'
        : 'Hosted-only crowd expansion. Visible now, but not available in the current runtime mode.',
      'advanced',
      canExpandCrowdHosted ? 'available' : 'hosted_only',
      'advanced'
    ),
    'tab.library': createSurface(
      'tab.library',
      'Library',
      'Core MVP surface for reusable fragments and presets.',
      'core',
      showAssetLibrary ? 'available' : 'disabled',
      'tab'
    ),
    'tab.preview': createSurface(
      'tab.preview',
      'Preview',
      'Core MVP surface for deterministic output checks before handoff.',
      'core',
      showPreview ? 'available' : 'disabled',
      'tab'
    ),
    'tab.linked': createSurface(
      'tab.linked',
      'Linked',
      'Advanced linked-component tooling outside the primary MVP loop.',
      'advanced',
      'available',
      'tab'
    ),
    'tab.explore': createSurface(
      'tab.explore',
      'Explore',
      'Browse and open full PSG-document templates — the same examples as the launch screen — without leaving the editor.',
      'advanced',
      'available',
      'tab'
    ),
    'tab.graph': createSurface(
      'tab.graph',
      'Graph',
      'Outline of the current document — every node grouped by type; click one to jump to it on the canvas.',
      'advanced',
      'available',
      'tab'
    )
  };

  const fileItems: MenuSectionModel['items'] = [];
  if (actions.onBackToLaunch) {
    fileItems.push({
      type: 'action',
      id: 'backToLaunch',
      label: 'Back to Launch',
      onClick: actions.onBackToLaunch
    });
  }
  pushAction(
    fileItems,
    actions.onNew
      ? {
          type: 'action',
          id: 'new',
          label: surfaces['document.new'].label,
          onClick: actions.onNew
        }
      : null,
    'file-after-launch'
  );
  pushAction(
    fileItems,
    actions.onOpen
      ? {
          type: 'action',
          id: 'open',
          label: surfaces['document.open'].label,
          onClick: actions.onOpen
        }
      : null
  );
  pushAction(
    fileItems,
    actions.onSave
      ? {
          type: 'action',
          id: 'save',
          label: surfaces['document.save'].label,
          onClick: actions.onSave
        }
      : null,
    'file-before-save'
  );
  pushAction(
    fileItems,
    actions.onSaveAs
      ? {
          type: 'action',
          id: 'saveAs',
          label: surfaces['document.saveAs'].label,
          onClick: actions.onSaveAs
        }
      : null
  );
  pushAction(
    fileItems,
    actions.onImport
      ? {
          type: 'action',
          id: 'import',
          label: surfaces['document.localOpen'].label,
          onClick: actions.onImport
        }
      : null,
    'file-before-export'
  );
  pushAction(
    fileItems,
    actions.onExport
      ? {
          type: 'action',
          id: 'export',
          label: surfaces['document.exportPsg'].label,
          onClick: actions.onExport
        }
      : null
  );
  const hasHandoffOrAdvancedActions = Boolean(
    actions.onExportComfy ||
      actions.onPsgSceneAssets ||
      actions.onLocalSandboxGeneration ||
      actions.onExpandCrowd
  );

  if (hasHandoffOrAdvancedActions) {
    fileItems.push({ type: 'divider', id: 'file-before-handoff' });
    fileItems.push({
      type: 'label',
      id: 'handoff-label',
      label: 'Primary handoff',
      tone: 'core'
    });
    fileItems.push({
      type: 'action',
      id: 'exportComfy',
      label: surfaces['handoff.comfy'].label,
      onClick: canExportComfy ? actions.onExportComfy : undefined,
      disabled: !canExportComfy,
      tone: 'core',
      availability: surfaces['handoff.comfy'].availability,
      title: surfaces['handoff.comfy'].helperText
    });
    fileItems.push({
      type: 'label',
      id: 'advanced-label',
      label: 'Advanced / hosted',
      tone: 'advanced'
    });
    fileItems.push({
      type: 'action',
      id: 'psgSceneAssets',
      label: surfaces['advanced.sceneAssets'].label,
      onClick: actions.onPsgSceneAssets,
      disabled: !actions.onPsgSceneAssets,
      tone: 'advanced',
      title: surfaces['advanced.sceneAssets'].helperText
    });
    fileItems.push({
      type: 'action',
      id: 'localSandboxGeneration',
      label: surfaces['advanced.localSandboxGeneration'].label,
      onClick: canUseLocalSandboxGeneration
        ? actions.onLocalSandboxGeneration
        : undefined,
      disabled: !canUseLocalSandboxGeneration,
      tone: 'advanced',
      availability: surfaces['advanced.localSandboxGeneration'].availability,
      title: surfaces['advanced.localSandboxGeneration'].helperText
    });
    fileItems.push({
      type: 'action',
      id: 'expandCrowd',
      label: surfaces['advanced.crowdExpansion'].label,
      onClick: canExpandCrowdHosted ? actions.onExpandCrowd : undefined,
      disabled: !canExpandCrowdHosted,
      tone: 'advanced',
      availability: surfaces['advanced.crowdExpansion'].availability,
      title: surfaces['advanced.crowdExpansion'].helperText
    });
  }

  const editItems: MenuSectionModel['items'] = [];
  pushAction(
    editItems,
    actions.onUndo
      ? {
          type: 'action',
          id: 'undo',
          label: 'Undo',
          onClick: actions.onUndo
        }
      : null
  );
  pushAction(
    editItems,
    actions.onRedo
      ? {
          type: 'action',
          id: 'redo',
          label: 'Redo',
          onClick: actions.onRedo
        }
      : null
  );
  if ((actions.onCopy || actions.onPaste) && editItems.length > 0) {
    editItems.push({ type: 'divider', id: 'edit-before-clipboard' });
  }
  pushAction(
    editItems,
    actions.onCopy
      ? {
          type: 'action',
          id: 'copy',
          label: 'Copy',
          onClick: actions.onCopy
        }
      : null
  );
  pushAction(
    editItems,
    actions.onPaste
      ? {
          type: 'action',
          id: 'paste',
          label: 'Paste',
          onClick: actions.onPaste
        }
      : null
  );

  const viewItems: MenuSectionModel['items'] = [];
  pushAction(
    viewItems,
    actions.onOrganizeNodes
      ? {
          type: 'action',
          id: 'organizeNodes',
          label: 'Organize Nodes',
          onClick: actions.onOrganizeNodes
        }
      : null
  );
  pushAction(
    viewItems,
    actions.onToggleAssetLibrary
      ? {
          type: 'action',
          id: 'toggleAssetLibrary',
          label: 'Toggle Fragment Library',
          onClick: actions.onToggleAssetLibrary
        }
      : null,
    'view-before-library'
  );

  const helpItems: MenuSectionModel['items'] = [];
  pushAction(
    helpItems,
    actions.onReportBug
      ? {
          type: 'action',
          id: 'reportBug',
          label: 'Report a Bug...',
          onClick: actions.onReportBug
        }
      : null
  );
  pushAction(
    helpItems,
    actions.onChangelog
      ? {
          type: 'action',
          id: 'changelog',
          label: "What's New",
          onClick: actions.onChangelog
        }
      : null
  );

  const menuModel: MenuModel = {
    sections: [
      { id: 'file', title: 'File', items: fileItems },
      { id: 'edit', title: 'Edit', items: editItems },
      { id: 'view', title: 'View', items: viewItems },
      { id: 'help', title: 'Help', items: helpItems }
    ].filter(section => section.items.some(item => item.type === 'action'))
  };

  const tabDefinitions: SidePanelTabDefinition[] = [];
  if (showAssetLibrary) {
    tabDefinitions.push(mapTab('assets', surfaces['tab.library']));
  }
  tabDefinitions.push(mapTab('components', surfaces['tab.linked']));
  tabDefinitions.push(mapTab('search', surfaces['tab.explore']));
  tabDefinitions.push(mapTab('relationships', surfaces['tab.graph']));

  return {
    surfaces,
    menuModel,
    tabDefinitions
  };
};
