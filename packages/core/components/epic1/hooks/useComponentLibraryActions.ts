/**
 * Component library + region-fragment actions (C3b).
 * Extracted from Epic1GraphEditor — behavior preserved.
 */
import {
  useCallback,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction
} from 'react';
import type { Edge, Node, XYPosition } from 'reactflow';
import type { EditableNodeData } from '../nodes';
import {
  buildComponentDefinition,
  type ComponentDefinition,
  type ComponentInstance,
  type GraphReferenceEntry,
  type ReferenceBinding,
  normalizeReferenceNamespace
} from '../services/ComponentModel';
import { ComponentLibraryService } from '../services/ComponentLibraryService';
import { GraphReferenceService } from '../services/GraphReferenceService';
import { validateClosedComponentSelection } from '../services/ComponentValidationService';
import {
  buildRegionBoxFragment,
  createRegionFragmentFilename
} from '../services/RegionBoxFragmentExport';
import {
  getUserFragmentFolderFromCookie,
  saveLocalUserFragment,
  setUserFragmentFolderCookie
} from '../services/LocalUserFragmentStorage';
import type { ComponentSaveDraft } from '../ComponentSaveDialog';

export type ShowToast = (
  type: 'success' | 'error' | 'info' | 'warning',
  message: string
) => void;

export type UseComponentLibraryActionsArgs = {
  nodes: Node<EditableNodeData>[];
  edges: Edge[];
  setNodes: Dispatch<SetStateAction<Node<EditableNodeData>[]>>;
  selectedNodeId: string | null;
  createNode: (
    type: string,
    position: XYPosition,
    data?: Partial<EditableNodeData>
  ) => void;
  handleNodeEdit: (nodeId: string, newValue: string) => void;
  getCommandSpawnPosition: () => XYPosition;
  showToast: ShowToast;
};

export function useComponentLibraryActions({
  nodes,
  edges,
  setNodes,
  selectedNodeId,
  createNode,
  handleNodeEdit,
  getCommandSpawnPosition,
  showToast
}: UseComponentLibraryActionsArgs) {
  const [componentDefinitions, setComponentDefinitions] = useState<
    ComponentDefinition[]
  >(() => ComponentLibraryService.listDefinitions());
  const [componentInstances, setComponentInstances] = useState<
    ComponentInstance[]
  >([]);
  const [pendingComponentDraft, setPendingComponentDraft] =
    useState<ComponentSaveDraft | null>(null);
  const [pendingComponentSelection, setPendingComponentSelection] = useState<{
    nodeIds: string[];
    edgeIds: string[];
  } | null>(null);

  const graphReferences = useMemo<GraphReferenceEntry[]>(() => {
    return GraphReferenceService.listComponentReferences(
      componentInstances,
      componentDefinitions
    );
  }, [componentDefinitions, componentInstances]);

  const handleComponentInstanceNamespaceEdit = useCallback(
    (nodeId: string, nextNamespaceValue: string) => {
      const selectedNode = nodes.find((node: Node<EditableNodeData>) => node.id === nodeId);
      if (!selectedNode || selectedNode.type !== 'componentInstance') {
        handleNodeEdit(nodeId, nextNamespaceValue);
        return;
      }

      const instanceId = String(
        (selectedNode.data as Record<string, unknown>)?.instanceId ?? ''
      );
      const normalizedNamespace = normalizeReferenceNamespace(nextNamespaceValue);

      setNodes((currentNodes: Node<EditableNodeData>[]) =>
        currentNodes.map((node: Node<EditableNodeData>) =>
          node.id === nodeId
            ? {
                ...node,
                data: {
                  ...node.data,
                  value: normalizedNamespace,
                  namespace: normalizedNamespace
                }
              }
            : node
        )
      );

      if (instanceId) {
        setComponentInstances((current: ComponentInstance[]) =>
          current.map((instance: ComponentInstance) =>
            instance.instanceId === instanceId
              ? {
                  ...instance,
                  namespace: normalizedNamespace
                }
              : instance
          )
        );
      }
    },
    [handleNodeEdit, nodes, setNodes]
  );

  const handleGraphReferenceAwareNodeEdit = useCallback(
    (nodeId: string, newValue: string) => {
      const matchingReference = graphReferences.find(
        (reference: GraphReferenceEntry) => reference.readablePath === newValue
      );
      const referenceBinding = matchingReference
        ? GraphReferenceService.createBinding(matchingReference)
        : null;

      setNodes((currentNodes: Node<EditableNodeData>[]) =>
        currentNodes.map((node: Node<EditableNodeData>) =>
          node.id === nodeId
            ? {
                ...node,
                data: {
                  ...node.data,
                  value: newValue,
                  text: newValue,
                  variableName: newValue,
                  label: newValue,
                  referenceBinding: referenceBinding ?? undefined
                }
              }
            : node
        )
      );
    },
    [graphReferences, setNodes]
  );

  // Enhanced nodes with edit handlers
  const nodes = useMemo(() => {
    return nodes.map((node: Node<EditableNodeData>) => ({
      ...node,
      type: node.type || 'textBlock',
      position: node.position || { x: 0, y: 0 },
      data: (() => {
        const referenceBinding = (node.data?.referenceBinding as ReferenceBinding | undefined) ?? undefined;
        const referenceBindingStatus = referenceBinding
          ? GraphReferenceService.validateBinding(referenceBinding, graphReferences)
          : null;
        const latestComponentDefinition =
          node.type === 'componentInstance'
            ? componentDefinitions
                .filter(
                  (definition: ComponentDefinition) =>
                    definition.stableId === String((node.data as Record<string, unknown>)?.componentStableId ?? '')
                )
                .sort(
                  (left: ComponentDefinition, right: ComponentDefinition) =>
                    right.version - left.version
                )[0] ?? null
            : null;
        const componentVersion =
          node.type === 'componentInstance'
            ? Number((node.data as Record<string, unknown>)?.componentVersion ?? 0)
            : 0;
        const latestComponentVersion = latestComponentDefinition?.version ?? componentVersion;
        const versionDrift =
          node.type === 'componentInstance'
            ? Math.max(0, latestComponentVersion - componentVersion)
            : 0;

        return {
          ...node.data,
          value:
            node.type === 'componentInstance'
              ? String((node.data as Record<string, unknown>)?.namespace ?? node.data.value ?? '')
              : node.data.value,
          graphReferences:
            node.type === 'variable' || node.type === 'textBlock' || node.type === 'output'
              ? graphReferences
              : (node.data?.graphReferences as GraphReferenceEntry[] | undefined),
          referenceBinding,
          referenceBindingStatus,
          latestComponentVersion,
          versionDrift,
          onEdit: (newValue: string) =>
            node.type === 'componentInstance'
              ? handleComponentInstanceNamespaceEdit(node.id, newValue)
              : node.type === 'variable' || node.type === 'textBlock' || node.type === 'output'
                ? handleGraphReferenceAwareNodeEdit(node.id, newValue)
                : handleNodeEdit(node.id, newValue),
          onEditStart: () => {},
          onEditEnd: () => {}
        };
      })(),
      selected: node.selected || node.id === selectedNodeId,
      width: node.width || undefined,
      height: node.height || undefined
    }));
  }, [componentDefinitions, graphReferences, handleComponentInstanceNamespaceEdit, handleGraphReferenceAwareNodeEdit, nodes, selectedNodeId, handleNodeEdit]);

  // Notify parent of changes
  useEffect(() => {
    onNodesChangeProp?.(nodes);
  }, [nodes, onNodesChangeProp]);

  useEffect(() => {
    onEdgesChangeProp?.(edges);
  }, [edges, onEdgesChangeProp]);

  // Handle execute button
  const handleExecute = () => {
    void executePreview();
    onExecute?.(nodes, edges);
  };

  const saveSelectedRegionBoxAsUserFragment = useCallback(async () => {
    const selectedRegion =
      nodes.find(
        (node: Node<EditableNodeData>) =>
          node.selected && node.type === 'enhancedBoundingBox'
      ) ??
      (selectedNodeId
        ? nodes.find(
            (node: Node<EditableNodeData>) =>
              node.id === selectedNodeId && node.type === 'enhancedBoundingBox'
          )
        : null);

    if (!selectedRegion) {
      showToast('info', 'Select a Region Box to save as a fragment');
      return;
    }

    const selectedRegionData = selectedRegion.data as
      | (EditableNodeData & { title?: unknown })
      | undefined;
    const defaultName =
      typeof selectedRegionData?.title === 'string' &&
      selectedRegionData.title.trim().length > 0
        ? selectedRegionData.title.trim()
        : 'Region Fragment';

    // eslint-disable-next-line no-alert
    const requestedName = window.prompt('Name this fragment:', defaultName);
    if (requestedName === null) {
      return;
    }

    const fragmentName = requestedName.trim() || defaultName;
    let folderPath = getUserFragmentFolderFromCookie();

    if (!folderPath) {
      // eslint-disable-next-line no-alert
      const requestedFolder = window.prompt(
        'Enter the folder path to use as your Prompt Spaghetti documents folder. Fragments will be saved under a "fragments" subfolder.',
        ''
      );

      if (!requestedFolder?.trim()) {
        showToast('info', 'Choose a documents folder before saving fragments');
        return;
      }

      folderPath = requestedFolder.trim();
      setUserFragmentFolderCookie(folderPath);
    }

    try {
      const fragment = buildRegionBoxFragment({
        regionNodeId: selectedRegion.id,
        nodes: nodes,
        edges,
        name: fragmentName
      });
      const filename = createRegionFragmentFilename(fragmentName);
      const result = await saveLocalUserFragment({
        folderPath,
        filename,
        content: JSON.stringify(fragment, null, 2)
      });

      window.dispatchEvent(
        new CustomEvent('epic1:userFragmentsChanged', {
          detail: {
            folderPath,
            filename: result.filename,
            savedPath: result.savedPath
          }
        })
      );
      showToast('success', `Saved "${fragmentName}" to user fragments`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to save fragment';
      showToast('error', message);
    }
  }, [edges, nodes, selectedNodeId, showToast]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const win = window as typeof window & {
      __EPIC1_SAVE_SELECTED_REGION_AS_FRAGMENT__?:
        | (() => Promise<void>)
        | null;
    };
    win.__EPIC1_SAVE_SELECTED_REGION_AS_FRAGMENT__ =
      saveSelectedRegionBoxAsUserFragment;

    return () => {
      if (
        win.__EPIC1_SAVE_SELECTED_REGION_AS_FRAGMENT__ ===
        saveSelectedRegionBoxAsUserFragment
      ) {
        win.__EPIC1_SAVE_SELECTED_REGION_AS_FRAGMENT__ = null;
      }
    };
  }, [saveSelectedRegionBoxAsUserFragment]);

  const saveSelectionAsComponent = useCallback(() => {
    const selectedNodes = nodes.filter((node: Node<EditableNodeData>) => node.selected);
    if (selectedNodes.length === 0) {
      showToast('info', 'Select nodes to save as a component');
      return;
    }

    const selectedNodeIds = new Set(selectedNodes.map((node: Node<EditableNodeData>) => node.id));
    const selectedEdges = edges.filter(
      (edge: Edge) => selectedNodeIds.has(edge.source) && selectedNodeIds.has(edge.target)
    );
    const outputNodes = selectedNodes.filter((node: Node<EditableNodeData>) => node.type === 'output');

    if (outputNodes.length === 0) {
      showToast('info', 'Select at least one output node in the component');
      return;
    }

    const closureValidation = validateClosedComponentSelection(selectedNodes, edges);
    if (!closureValidation.isClosed) {
      const incomingCount = closureValidation.externalIncomingEdges.length;
      const outgoingCount = closureValidation.externalOutgoingEdges.length;
      showToast(
        'error',
        `Component save blocked: selection has ${incomingCount} incoming and ${outgoingCount} outgoing external connection${incomingCount + outgoingCount === 1 ? '' : 's'}`
      );
      return;
    }

    setPendingComponentSelection({
      nodeIds: selectedNodes.map((node: Node<EditableNodeData>) => node.id),
      edgeIds: selectedEdges.map((edge: Edge) => edge.id)
    });
    setPendingComponentDraft({
      name: `Component ${componentDefinitions.length + 1}`,
      description: '',
      outputs: outputNodes.map((node: Node<EditableNodeData>) => {
        const rawValue = String(node.data?.value || node.id);
        return {
          sourceNodeId: node.id,
          key: rawValue
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '') || node.id,
          label: rawValue
        };
      })
    });
  }, [componentDefinitions.length, edges, nodes, showToast]);

  const handleSaveComponentDraft = useCallback(
    (draft: ComponentSaveDraft) => {
      if (!pendingComponentSelection) {
        return;
      }

      const nextDefinition = buildComponentDefinition({
        name: draft.name,
        description: draft.description,
        graphId: 'epic1-local',
        nodeIds: pendingComponentSelection.nodeIds,
        edgeIds: pendingComponentSelection.edgeIds,
        outputs: draft.outputs.map(output => ({
          key: output.key,
          label: output.label,
          description: `Output from ${output.label}`,
          valueType: 'text',
          sourceNodeId: output.sourceNodeId,
          sourcePath: 'data.value'
        }))
      });

      ComponentLibraryService.saveDefinition(nextDefinition);
      setComponentDefinitions(ComponentLibraryService.listDefinitions());
      setPendingComponentDraft(null);
      setPendingComponentSelection(null);
      showToast('success', `Saved ${nextDefinition.name}`);
    },
    [pendingComponentSelection, showToast]
  );

  const insertComponentDefinition = useCallback(
    (definition: ComponentDefinition, position?: XYPosition) => {
      const instance = ComponentLibraryService.instantiateDefinition(definition);
      const references = ComponentLibraryService.buildReferences(instance, definition);

      setComponentInstances((current: ComponentInstance[]) => [...current, instance]);
      createNode(
        'componentInstance',
        position ?? getCommandSpawnPosition(),
        {
          nodeType: 'componentInstance',
          value: instance.namespace,
          readableLabel: definition.name,
          componentStableId: instance.componentStableId,
          componentDefinitionId: instance.componentDefinitionId,
          componentVersion: instance.componentVersion,
          instanceId: instance.instanceId,
          namespace: instance.namespace,
          mode: instance.mode,
          outputKeys: definition.outputs.map(output => output.key),
          referencePaths: references.map(reference => reference.readablePath)
        }
      );

      showToast('success', `Inserted ${definition.name}`);
    },
    [createNode, getCommandSpawnPosition, showToast]
  );

  const detachSelectedComponentInstance = useCallback(() => {
    const selectedComponentNode = nodes.find(
      (node: Node<EditableNodeData>) =>
        node.id === selectedNodeId && node.type === 'componentInstance'
    );

    if (!selectedComponentNode) {
      showToast('info', 'Select a component instance to detach');
      return;
    }

    setNodes((currentNodes: Node<EditableNodeData>[]) =>
      currentNodes.map((node: Node<EditableNodeData>) =>
        node.id === selectedComponentNode.id
          ? {
              ...node,
              data: {
                ...node.data,
                mode: 'detached'
              }
            }
          : node
      )
    );

    const instanceId = String(
      (selectedComponentNode.data as Record<string, unknown>)?.instanceId ?? ''
    );
    if (instanceId) {
      setComponentInstances((current: ComponentInstance[]) =>
        current.map((instance: ComponentInstance) =>
          instance.instanceId === instanceId
            ? {
                ...instance,
                mode: 'detached',
                provenance: {
                  ...instance.provenance,
                  detachedFromInstanceId:
                    instance.provenance.detachedFromInstanceId ?? instance.instanceId
                }
              }
            : instance
        )
      );
    }

    showToast('success', 'Detached component instance');
  }, [nodes, selectedNodeId, setNodes, showToast]);

  const refreshSelectedComponentInstance = useCallback(() => {
    const selectedComponentNode = nodes.find(
      (node: Node<EditableNodeData>) =>
        node.id === selectedNodeId && node.type === 'componentInstance'
    );

    if (!selectedComponentNode) {
      showToast('info', 'Select a linked component instance to refresh');
      return;
    }

    const nodeData = selectedComponentNode.data as Record<string, unknown>;
    const mode = String(nodeData.mode ?? 'linked');
    if (mode !== 'linked') {
      showToast('info', 'Only linked component instances can be refreshed');
      return;
    }

    const stableId = String(nodeData.componentStableId ?? '');
    const instanceId = String(nodeData.instanceId ?? '');
    if (!stableId || !instanceId) {
      showToast('error', 'Selected component instance is missing refresh metadata');
      return;
    }

    const latestDefinition = ComponentLibraryService.getLatestDefinitionByStableId(stableId);
    if (!latestDefinition) {
      showToast('error', 'Latest component definition could not be found');
      return;
    }

    const refreshedInstance = ComponentLibraryService.instantiateDefinition(
      latestDefinition,
      String(nodeData.namespace ?? '')
    );
    const syncedInstance: ComponentInstance = {
      ...refreshedInstance,
      instanceId,
      insertedAt: String(nodeData.insertedAt ?? refreshedInstance.insertedAt),
      mode: 'linked'
    };
    const references = ComponentLibraryService.buildReferences(syncedInstance, latestDefinition);

    setComponentInstances((current: ComponentInstance[]) =>
      current.map((instance: ComponentInstance) =>
        instance.instanceId === instanceId ? syncedInstance : instance
      )
    );

    setNodes((currentNodes: Node<EditableNodeData>[]) =>
      currentNodes.map((node: Node<EditableNodeData>) =>
        node.id === selectedComponentNode.id
          ? {
              ...node,
              data: {
                ...node.data,
                value: syncedInstance.namespace,
                readableLabel: latestDefinition.name,
                componentStableId: syncedInstance.componentStableId,
                componentDefinitionId: syncedInstance.componentDefinitionId,
                componentVersion: syncedInstance.componentVersion,
                namespace: syncedInstance.namespace,
                mode: syncedInstance.mode,
                outputKeys: latestDefinition.outputs.map(output => output.key),
                referencePaths: references.map(reference => reference.readablePath)
              }
            }
          : node
      )
    );

    showToast('success', `Refreshed ${latestDefinition.name}`);
  }, [nodes, selectedNodeId, setNodes, showToast]);

  const refreshOutdatedComponentInstances = useCallback(() => {
    const refreshEntries: Array<{
      nodeId: string;
      syncedInstance: ComponentInstance;
      latestDefinition: ComponentDefinition;
      referencePaths: string[];
    }> = [];

    for (const componentNode of nodes.filter(
      (node: Node<EditableNodeData>) => node.type === 'componentInstance'
    )) {
      const nodeData = componentNode.data as Record<string, unknown>;
      const mode = String(nodeData.mode ?? 'linked');
      if (mode !== 'linked') {
        continue;
      }

      const stableId = String(nodeData.componentStableId ?? '');
      const instanceId = String(nodeData.instanceId ?? '');
      if (!stableId || !instanceId) {
        continue;
      }

      const latestDefinition = ComponentLibraryService.getLatestDefinitionByStableId(stableId);
      if (!latestDefinition) {
        continue;
      }

      const currentVersion = Number(nodeData.componentVersion ?? 0);
      if (latestDefinition.version <= currentVersion) {
        continue;
      }

      const refreshedInstance = ComponentLibraryService.instantiateDefinition(
        latestDefinition,
        String(nodeData.namespace ?? '')
      );
      const syncedInstance: ComponentInstance = {
        ...refreshedInstance,
        instanceId,
        insertedAt: String(nodeData.insertedAt ?? refreshedInstance.insertedAt),
        mode: 'linked'
      };
      const references = ComponentLibraryService.buildReferences(syncedInstance, latestDefinition);

      refreshEntries.push({
        nodeId: componentNode.id,
        syncedInstance,
        latestDefinition,
        referencePaths: references.map(reference => reference.readablePath)
      });
    }

    if (refreshEntries.length === 0) {
      showToast('info', 'No outdated linked components found');
      return;
    }

    setComponentInstances((current: ComponentInstance[]) =>
      current.map((instance: ComponentInstance) => {
        for (const entry of refreshEntries) {
          if (entry.syncedInstance.instanceId === instance.instanceId) {
            return entry.syncedInstance;
          }
        }
        return instance;
      })
    );

    setNodes((currentNodes: Node<EditableNodeData>[]) =>
      currentNodes.map((node: Node<EditableNodeData>) => {
        let refreshData:
          | {
              nodeId: string;
              syncedInstance: ComponentInstance;
              latestDefinition: ComponentDefinition;
              referencePaths: string[];
            }
          | undefined;
        for (const entry of refreshEntries) {
          if (entry.nodeId === node.id) {
            refreshData = entry;
            break;
          }
        }
        if (!refreshData) {
          return node;
        }

        return {
          ...node,
          data: {
            ...node.data,
            value: refreshData.syncedInstance.namespace,
            readableLabel: refreshData.latestDefinition.name,
            componentStableId: refreshData.syncedInstance.componentStableId,
            componentDefinitionId: refreshData.syncedInstance.componentDefinitionId,
            componentVersion: refreshData.syncedInstance.componentVersion,
            namespace: refreshData.syncedInstance.namespace,
            mode: refreshData.syncedInstance.mode,
            outputKeys: refreshData.latestDefinition.outputs.map(
              (output: ComponentDefinition['outputs'][number]) => output.key
            ),
            referencePaths: refreshData.referencePaths
          }
        };
      })
    );

    showToast(
      'success',
      `Refreshed ${refreshEntries.length} outdated linked component instance${refreshEntries.length === 1 ? '' : 's'}`
    );
  }, [nodes, setNodes, showToast]);

  const copySelectedComponentReferences = useCallback(async () => {
    const selectedComponentNode = nodes.find(
      (node: Node<EditableNodeData>) =>
        node.id === selectedNodeId && node.type === 'componentInstance'
    );

    if (!selectedComponentNode) {
      showToast('info', 'Select a component instance to copy its references');
      return;
    }

    const namespace = String(
      (selectedComponentNode.data as Record<string, unknown>)?.namespace ?? ''
    );
    const matchingReferences = graphReferences.filter(
      reference => reference.namespace === namespace
    );

    if (matchingReferences.length === 0) {
      showToast('info', 'No references available for the selected component');
      return;
    }

    try {
      await navigator.clipboard.writeText(
        matchingReferences.map(reference => reference.readablePath).join('\n')
      );
      showToast('success', `Copied ${matchingReferences.length} reference path${matchingReferences.length === 1 ? '' : 's'}`);
    } catch (error) {
      console.error('[Epic1GraphEditor] Failed to copy component references', error);
      showToast('error', 'Failed to copy component references');
    }
  }, [graphReferences, nodes, selectedNodeId, showToast]);

  return {
    componentDefinitions,
    setComponentDefinitions,
    componentInstances,
    setComponentInstances,
    pendingComponentDraft,
    setPendingComponentDraft,
    pendingComponentSelection,
    setPendingComponentSelection,
    graphReferences,
    handleComponentInstanceNamespaceEdit,
    handleGraphReferenceAwareNodeEdit,
    saveSelectedRegionBoxAsUserFragment,
    saveSelectionAsComponent,
    handleSaveComponentDraft,
    insertComponentDefinition,
    detachSelectedComponentInstance,
    refreshSelectedComponentInstance,
    refreshOutdatedComponentInstances,
    copySelectedComponentReferences
  };
}

export type { ComponentSaveDraft, ComponentDefinition, GraphReferenceEntry };
