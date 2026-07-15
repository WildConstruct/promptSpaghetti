/**
 * Graph commander command list builder (C3d).
 * Extracted from Epic1GraphEditor — behavior preserved.
 */
import type { GraphCommanderCommand } from '../GraphCommander';
import { buildGraphCommands } from '../services/GraphCommandRegistry';
import type { ComponentDefinition } from '../services/ComponentModel';
import type { XYPosition } from 'reactflow';
import type { EditableNodeData } from '../nodes';

export type CommandPaletteContext = {
  alignNodes: (direction: 'horizontal' | 'vertical') => void;
  componentDefinitions: ComponentDefinition[];
  createNode: (
    type: string,
    position: XYPosition,
    data?: Partial<EditableNodeData>
  ) => void;
  copySelectedComponentReferences: () => void | Promise<void>;
  deleteSelectedNodes: () => void;
  deselectAll: () => void;
  detachSelectedComponentInstance: () => void;
  distributeNodes: (direction: 'horizontal' | 'vertical') => void;
  duplicateNodes: () => void;
  exportGraph: () => void;
  exportSelected: () => void;
  fitView: () => void;
  getCommandSpawnPosition: () => XYPosition;
  handleExecute: () => void;
  invertSelection: () => void;
  insertComponentDefinition: (
    definition: ComponentDefinition,
    position?: XYPosition
  ) => void;
  neatenAll: () => void;
  cleanupAll: () => void;
  saveSelectionAsComponent: () => void;
  saveSelectedRegionBoxAsUserFragment: () => void | Promise<void>;
  pasteFromClipboard: () => void;
  previewTrayIsOpen: boolean;
  refreshOutdatedComponentInstances: () => void;
  refreshSelectedComponentInstance: () => void;
  resetZoom: () => void;
  selectAll: () => void;
  selectConnectedNodes: (nodeId: string) => void;
  selectedNodeId: string | null;
  showToast: (
    type: 'success' | 'error' | 'info' | 'warning',
    message: string
  ) => void;
  startTutorial: () => void;
  togglePreview: () => void;
  triggerImport: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  setCanvasTipsForceKey: (
    value: number | ((key: number) => number)
  ) => void;
};

export function buildCommandPaletteCommands(
  ctx: CommandPaletteContext
): GraphCommanderCommand[] {
  const {
    alignNodes,
    componentDefinitions,
    createNode,
    copySelectedComponentReferences,
    deleteSelectedNodes,
    deselectAll,
    detachSelectedComponentInstance,
    distributeNodes,
    duplicateNodes,
    exportGraph,
    exportSelected,
    fitView,
    getCommandSpawnPosition,
    handleExecute,
    invertSelection,
    insertComponentDefinition,
    neatenAll,
    cleanupAll,
    saveSelectionAsComponent,
    saveSelectedRegionBoxAsUserFragment,
    pasteFromClipboard,
    previewTrayIsOpen,
    refreshOutdatedComponentInstances,
    refreshSelectedComponentInstance,
    resetZoom,
    selectAll,
    selectConnectedNodes,
    selectedNodeId,
    showToast,
    startTutorial,
    togglePreview,
    triggerImport,
    zoomIn,
    zoomOut,
    setCanvasTipsForceKey
  } = ctx;

    const spawnPosition = getCommandSpawnPosition();
    const registryCommands = buildGraphCommands({
      createNode,
      openCanvasTips: () => setCanvasTipsForceKey(key => key + 1),
      spawnPosition,
      startTutorial
    });

    return [
      {
        id: 'file.export_graph',
        label: 'Export Graph',
        aliases: ['export', 'json', 'download'],
        category: 'File',
        shortcut: '⌘S',
        description: 'Download the current graph as JSON',
        execute: () => exportGraph()
      },
      {
        id: 'file.export_selection',
        label: 'Export Selection',
        aliases: ['export selected', 'selection json'],
        category: 'File',
        shortcut: '⌘E',
        description: 'Export the current selection',
        execute: () => exportSelected()
      },
      {
        id: 'file.import_graph',
        label: 'Open Graph',
        aliases: ['import', 'open', 'load'],
        category: 'File',
        shortcut: '⌘O',
        description: 'Import a graph file',
        execute: () => triggerImport()
      },
      {
        id: 'edit.paste',
        label: 'Paste',
        aliases: ['paste from clipboard', 'clipboard'],
        category: 'Edit',
        shortcut: '⌘V',
        description: 'Paste graph content from the clipboard',
        execute: () => pasteFromClipboard()
      },
      {
        id: 'edit.select_all',
        label: 'Select All',
        aliases: ['select everything'],
        category: 'Edit',
        shortcut: '⌘A',
        description: 'Select all nodes and edges',
        execute: () => selectAll()
      },
      {
        id: 'edit.clear_selection',
        label: 'Clear Selection',
        aliases: ['deselect', 'clear'],
        category: 'Edit',
        shortcut: 'Esc',
        description: 'Clear the current selection',
        execute: () => deselectAll()
      },
      {
        id: 'edit.invert_selection',
        label: 'Invert Selection',
        aliases: ['invert'],
        category: 'Edit',
        description: 'Invert the current node and edge selection',
        execute: () => invertSelection()
      },
      {
        id: 'edit.select_connected',
        label: 'Select Connected Nodes',
        aliases: ['connected', 'neighbors'],
        category: 'Edit',
        description: 'Select nodes connected to the current selection',
        execute: () => {
          if (!selectedNodeId) {
            showToast('info', 'Select a node to expand the connected selection');
            return;
          }
          selectConnectedNodes(selectedNodeId);
        }
      },
      {
        id: 'edit.duplicate',
        label: 'Duplicate Selection',
        aliases: ['duplicate node', 'copy selected'],
        category: 'Edit',
        shortcut: '⌘D',
        description: 'Duplicate the selected nodes',
        execute: () => duplicateNodes()
      },
      {
        id: 'edit.delete',
        label: 'Delete Selection',
        aliases: ['delete node', 'remove'],
        category: 'Edit',
        shortcut: 'Del',
        description: 'Delete the selected nodes',
        execute: () => deleteSelectedNodes()
      },
      ...registryCommands,
      {
        id: 'layout.align_horizontal',
        label: 'Align Horizontal',
        aliases: ['align row'],
        category: 'Layout',
        description: 'Align selected nodes horizontally',
        execute: () => alignNodes('horizontal')
      },
      {
        id: 'layout.align_vertical',
        label: 'Align Vertical',
        aliases: ['align column'],
        category: 'Layout',
        description: 'Align selected nodes vertically',
        execute: () => alignNodes('vertical')
      },
      {
        id: 'layout.distribute_horizontal',
        label: 'Distribute Horizontal',
        aliases: ['space evenly row'],
        category: 'Layout',
        description: 'Distribute selected nodes horizontally',
        execute: () => distributeNodes('horizontal')
      },
      {
        id: 'layout.distribute_vertical',
        label: 'Distribute Vertical',
        aliases: ['space evenly column'],
        category: 'Layout',
        description: 'Distribute selected nodes vertically',
        execute: () => distributeNodes('vertical')
      },
      {
        id: 'layout.neaten_all',
        label: 'Neaten All',
        aliases: ['auto layout', 'arrange'],
        category: 'Layout',
        description: 'Run the global neaten operation',
        execute: () => neatenAll()
      },
      {
        id: 'layout.cleanup_all',
        label: 'Cleanup All',
        aliases: ['cleanup', 'tidy graph'],
        category: 'Layout',
        description: 'Run the global cleanup operation',
        execute: () => cleanupAll()
      },
      {
        id: 'view.fit_view',
        label: 'Fit View',
        aliases: ['fit', 'center view'],
        category: 'View',
        shortcut: '⌘0',
        description: 'Fit the current graph in view',
        execute: () => fitView()
      },
      {
        id: 'view.zoom_in',
        label: 'Zoom In',
        aliases: ['zoom'],
        category: 'View',
        shortcut: '⌘+',
        description: 'Increase the graph zoom level',
        execute: () => zoomIn()
      },
      {
        id: 'view.zoom_out',
        label: 'Zoom Out',
        aliases: ['unzoom'],
        category: 'View',
        shortcut: '⌘-',
        description: 'Decrease the graph zoom level',
        execute: () => zoomOut()
      },
      {
        id: 'view.reset_zoom',
        label: 'Reset Zoom',
        aliases: ['reset view', '100%'],
        category: 'View',
        description: 'Reset the graph zoom level',
        execute: () => resetZoom()
      },
      {
        id: 'view.toggle_preview',
        label: 'Toggle Preview',
        aliases: ['preview tray', 'show preview', 'hide preview'],
        category: 'View',
        description: previewTrayIsOpen ? 'Hide the preview tray' : 'Show the preview tray',
        execute: () => togglePreview()
      },
      {
        id: 'graph.execute',
        label: 'Execute Graph',
        aliases: ['run graph', 'preview render'],
        category: 'Graph',
        description: 'Run the current graph',
        execute: () => handleExecute()
      },
      {
        id: 'components.save_selection',
        label: 'Save Selection as Component',
        aliases: ['save component', 'component from selection'],
        category: 'Components',
        description: 'Save the selected graph cluster as a reusable component',
        execute: () => saveSelectionAsComponent()
      },
      {
        id: 'fragments.save_selected_region',
        label: 'Save Region Box as Fragment',
        aliases: ['save region fragment', 'region to fragment', 'user fragment'],
        category: 'Fragments',
        description: 'Save the selected Region Box and enclosed nodes to the local user fragment library',
        execute: () => {
          void saveSelectedRegionBoxAsUserFragment();
        }
      },
      {
        id: 'components.insert_latest',
        label: 'Insert Latest Component',
        aliases: ['insert component', 'component library'],
        category: 'Components',
        description: 'Insert the most recently saved component',
        execute: () => {
          const latest = [...componentDefinitions].sort((left, right) =>
            right.metadata.updatedAt.localeCompare(left.metadata.updatedAt)
          )[0];
          if (!latest) {
            showToast('info', 'No components saved yet');
            return;
          }
          insertComponentDefinition(latest);
        }
      },
      {
        id: 'components.detach_selected',
        label: 'Detach Selected Component',
        aliases: ['detach component', 'unlink component'],
        category: 'Components',
        description: 'Convert the selected component instance into a detached local copy state',
        execute: () => detachSelectedComponentInstance()
      },
      {
        id: 'components.refresh_selected_component',
        label: 'Refresh Selected Component',
        aliases: ['refresh component', 'update linked component', 'resync component'],
        category: 'Components',
        description: 'Resync the selected linked component instance from the latest saved definition',
        execute: () => refreshSelectedComponentInstance()
      },
      {
        id: 'components.refresh_outdated_components',
        label: 'Refresh Outdated Linked Components',
        aliases: ['refresh all linked components', 'update outdated components', 'resync all linked components'],
        category: 'Components',
        description: 'Resync every outdated linked component instance from the latest saved definitions',
        execute: () => refreshOutdatedComponentInstances()
      },
      {
        id: 'components.copy_selected_references',
        label: 'Copy Selected Component References',
        aliases: ['copy component references', 'copy component outputs'],
        category: 'Components',
        description: 'Copy all surfaced readable paths for the selected component instance',
        execute: () => {
          void copySelectedComponentReferences();
        }
      }
    ];
}
