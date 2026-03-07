import { useCallback, useRef } from 'react';
import { Node, ReactFlowInstance, Edge } from 'reactflow';
import type { EditableNodeData } from '../nodes';
import { validatePreset, insertPreset } from '../../../runtime/presetInsertion';
import {
  getImportedFragmentWrapperPolicy,
  prepareImportedGraphBatch
} from '../../../runtime/importGraphNormalization';
import { layoutNewNodes } from '../../../utils/layoutAlgorithms';
import {
  attachNodesToContainerNodes,
  findContainerAtPosition
} from './dragDropContainerUtils';
import { debugLogEpic1 } from '../../../utils/debug';
import {
  getInlinePresetDocument,
  isSafePresetSourcePath
} from './presetSourcePolicy';

type FlowNode = Node<EditableNodeData>;
type FlowEdge = Edge<EditableNodeData>;

export interface PresetDropMetadata {
  file?: string;
  [key: string]: unknown;
}

export interface PresetDropPayload {
  id?: string;
  path?: string;
  file?: string;
  psglib?: string;
  content?: unknown;
  name?: string;
  metadata?: PresetDropMetadata;
  [key: string]: unknown;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isFlowNode = (node: unknown): node is FlowNode =>
  isRecord(node) && typeof node.id === 'string' && isRecord(node.data);

const isFlowEdge = (edge: unknown): edge is FlowEdge =>
  isRecord(edge) &&
  typeof edge.id === 'string' &&
  typeof edge.source === 'string' &&
  typeof edge.target === 'string';

const toFlowNodes = (nodes: unknown): FlowNode[] =>
  Array.isArray(nodes)
    ? nodes.filter(isFlowNode).map(node => ({
        ...node,
        data: node.data as EditableNodeData
      }))
    : [];

const toFlowEdges = (edges: unknown): FlowEdge[] =>
  Array.isArray(edges) ? edges.filter(isFlowEdge) : [];

const getNodeWidth = (node: FlowNode): number =>
  typeof node.width === 'number'
    ? node.width
    : typeof (node.data as Record<string, unknown>)?.width === 'number'
      ? ((node.data as Record<string, unknown>).width as number)
      : 400;

const getNodeHeight = (node: FlowNode): number =>
  (() => {
    const explicitHeight =
      typeof node.height === 'number'
        ? node.height
        : typeof (node.data as Record<string, unknown>)?.height === 'number'
          ? ((node.data as Record<string, unknown>).height as number)
          : undefined;

    const data = (node.data ?? {}) as Record<string, unknown>;
    const isWeightedChoice =
      node.type === 'weightedChoice' || data.nodeType === 'weightedChoice';
    if (!isWeightedChoice) {
      return explicitHeight ?? 300;
    }

    let options = Array.isArray(data.options)
      ? (data.options as unknown[])
      : [];
    if (!options.length && typeof data.value === 'string') {
      try {
        const parsed = JSON.parse(data.value);
        if (Array.isArray(parsed)) {
          options = parsed;
        }
      } catch {
        // ignore invalid JSON and fall back to default estimate
      }
    }
    // WeightedChoice editor grows substantially with option count and control rows.
    const estimatedHeight = Math.max(340, 170 + options.length * 42);
    return Math.max(explicitHeight ?? 0, estimatedHeight);
  })();

interface UseDragDropHandlersProps {
  setNodes: (nodes: FlowNode[] | ((nodes: FlowNode[]) => FlowNode[])) => void;
  setEdges: (edges: FlowEdge[] | ((edges: FlowEdge[]) => FlowEdge[])) => void;
  reactFlowInstance: ReactFlowInstance | null;
  showToast: (type: 'success' | 'error' | 'info', message: string) => void;
  addNodeWithBounce?: (node: FlowNode) => void;
}

export function useDragDropHandlers({
  setNodes,
  setEdges,
  reactFlowInstance,
  showToast,
  addNodeWithBounce
}: UseDragDropHandlersProps) {
  // Manifest cache and base resolution for preset assets
  const manifestCacheRef = useRef<unknown | null>(null);
  const manifestBaseRef = useRef<string>('/presets');
  const manifestLoadPromiseRef = useRef<Promise<unknown> | null>(null);

  // Create unique ID for new nodes
  const createNodeId = useCallback(() => {
    // Use high precision timestamp and random to ensure uniqueness
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    const counter = Math.floor(Math.random() * 10000);
    return `node-${timestamp}-${random}-${counter}`;
  }, []);

  // Resolve preset path by ID using the published manifest
  const resolvePresetPathById = useCallback(
    async (presetId: string): Promise<string | null> => {
      type Manifest = { presets?: Array<{ id?: string; path?: string }> };
      const getManifest = async (): Promise<unknown | null> => {
        if (manifestCacheRef.current) {
          return manifestCacheRef.current;
        }
        if (manifestLoadPromiseRef.current) {
          return manifestLoadPromiseRef.current;
        }
        const loader = (async () => {
          try {
            const baseUrl =
              (import.meta as unknown as { env?: { BASE_URL?: string } })?.env
                ?.BASE_URL || '/';
            const base = String(baseUrl).replace(/\/$/, '');
            const candidates = [
              `${base}/presets/manifest.json`,
              '/presets/manifest.json',
              '/asset-browser/presets/manifest.json'
            ];
            for (const url of candidates) {
              try {
                const res = await fetch(url, { cache: 'no-cache' });
                if (!res.ok) {
                  continue;
                }
                const text = await res.text();
                const trimmed = text.trim().toLowerCase();
                if (
                  trimmed.startsWith('<!doctype') ||
                  trimmed.startsWith('<html')
                ) {
                  continue; // HTML, not JSON
                }
                const json = JSON.parse(text);
                manifestCacheRef.current = json;
                manifestBaseRef.current = url.includes('/asset-browser/')
                  ? '/asset-browser/presets'
                  : '/presets';
                return json;
              } catch {
                // try next
              }
            }
          } finally {
            manifestLoadPromiseRef.current = null;
          }
          return null;
        })();
        manifestLoadPromiseRef.current = loader;
        return loader;
      };

      try {
        const manifest = (await getManifest()) as Manifest | null;
        if (!manifest) {
          return null;
        }
        const entry = Array.isArray(manifest.presets)
          ? manifest.presets.find(p => p.id === presetId)
          : null;
        return entry?.path || null;
      } catch (err) {
        console.warn('[DragDrop] Error reading presets manifest', err);
        return null;
      }
    },
    []
  );

  const normalizePresetPath = useCallback((path: string): string => {
    if (!path) {
      return path;
    }
    if (/^https?:\/\//i.test(path) || path.startsWith('/')) {
      return path;
    }
    // Asset fragments live under /assets/library; normalize relative PSG paths there
    if (path.endsWith('.psg')) {
      if (path.startsWith('./')) {
        return `/assets/library/${path.slice(2)}`;
      }
      if (path.startsWith('assets/library/')) {
        return `/${path}`;
      }
      if (path.startsWith('asset-browser/assets/library/')) {
        return `/${path}`;
      }
      // Default for bare PSG file names
      return `/assets/library/${path.replace(/^\.?\/*/, '')}`;
    }
    const base = manifestBaseRef.current || '/presets';
    if (path.startsWith('./')) {
      return `${base}/${path.slice(2)}`;
    }
    if (path.startsWith('presets/')) {
      return `/${path}`;
    }
    if (
      path.startsWith('asset-browser/presets/') ||
      path.startsWith('/asset-browser/presets/')
    ) {
      return path.startsWith('/') ? path : `/${path}`;
    }
    return `${base}/${path}`;
  }, []);

  const resolveSafePresetPath = useCallback(
    async (meta: PresetDropPayload): Promise<string | null> => {
      const explicitPath =
        (typeof meta?.path === 'string' && meta.path) ||
        (typeof meta?.file === 'string' && meta.file) ||
        null;
      const metadataFile =
        typeof meta?.metadata?.file === 'string' ? meta.metadata.file : null;

      const ensureSafePath = (candidate: string, source: string): string => {
        const normalized = normalizePresetPath(candidate);
        if (!isSafePresetSourcePath(normalized)) {
          throw new Error(`Rejected unsafe preset ${source}.`);
        }
        return normalized;
      };

      if (explicitPath) {
        return ensureSafePath(explicitPath, 'path');
      }

      if (meta?.id) {
        const resolvedById = await resolvePresetPathById(meta.id);
        if (resolvedById) {
          return ensureSafePath(resolvedById, 'manifest path');
        }
      }

      if (metadataFile) {
        return ensureSafePath(metadataFile, 'metadata file path');
      }

      return null;
    },
    [normalizePresetPath, resolvePresetPathById]
  );

  const getContainerAtPosition = useCallback(
    (position: { x: number; y: number }) => {
      if (!reactFlowInstance) {
        return null;
      }
      const nodes = reactFlowInstance
        .getNodes()
        .filter(isFlowNode) as FlowNode[];
      return findContainerAtPosition(nodes, position);
    },
    [reactFlowInstance]
  );

  const attachNodesToContainer = useCallback(
    (
      nodes: FlowNode[],
      container: Node<Record<string, unknown>>
    ): FlowNode[] => {
      const containerNode = container as FlowNode;
      return attachNodesToContainerNodes(nodes, containerNode);
    },
    []
  );

  // Shared insertion routine for both drop and explicit insert actions
  const insertPresetByMeta = useCallback(
    async (meta: PresetDropPayload, position: { x: number; y: number }) => {
      try {
        debugLogEpic1('[DragDrop] insertPresetByMeta start', {
          id: meta?.id,
          name: meta?.name,
          path: meta?.path,
          file: meta?.file,
          metadataFile: meta?.metadata?.file
        });
        let content: string | null = null;
        const inlineDocument = getInlinePresetDocument(meta);
        const rawInlineContent =
          meta?.psglib ??
          (typeof meta?.content === 'string' ? meta.content : null);
        const presetPath = await resolveSafePresetPath(meta);

        if (presetPath) {
          debugLogEpic1('[DragDrop] Fetching preset path:', presetPath);
          const resp = await fetch(presetPath, { cache: 'no-cache' });
          if (!resp.ok) {
            throw new Error(
              `Failed to load preset: ${resp.status} ${resp.statusText}`
            );
          }
          content = await resp.text();
          debugLogEpic1('[DragDrop] Loaded preset from path:', presetPath);
        } else if (inlineDocument) {
          content = inlineDocument;
          debugLogEpic1('[DragDrop] Using inline preset content');
        } else if (rawInlineContent) {
          throw new Error(
            'Preset payload contained non-document inline content and no safe file path.'
          );
        } else {
          throw new Error('Unable to resolve preset path.');
        }

        if (!content) {
          throw new Error('Preset content is empty.');
        }

        debugLogEpic1('[DragDrop] Validating preset content', {
          id: meta?.id,
          name: meta?.name,
          presetPath
        });

        // Validate before inserting
        const validation = validatePreset(content, {
          // Content validation does not prove source provenance; source paths are
          // restricted separately before fetch.
          preferCanonicalPsg:
            typeof presetPath === 'string' &&
            presetPath.startsWith('/assets/library/')
        });
        if (!validation.valid) {
          console.error('[DragDrop] Preset validation failed', {
            presetId: meta?.id,
            presetName: meta?.name,
            presetPath,
            hasInlineContent: Boolean(inlineDocument),
            contentPreview: content.slice(0, 400)
          });
          throw new Error(validation.error || 'Preset failed validation');
        }

        debugLogEpic1('[DragDrop] Preset validated', {
          id: meta?.id,
          name: meta?.name,
          presetPath,
          nodeCount: validation.nodeCount,
          edgeCount: validation.edgeCount
        });

        let parsedPresetData: unknown;
        let shouldPreservePositions = false;
        try {
          parsedPresetData = JSON.parse(content);
          const importPolicy = getImportedFragmentWrapperPolicy<FlowNode>({
            presetData: parsedPresetData
          });
          shouldPreservePositions = importPolicy.shouldPreservePositions;
          if (shouldPreservePositions) {
            debugLogEpic1('[DragDrop] Fragment detected, preserving positions');
          }
        } catch {
          // Not JSON or can't parse, use default
        }

        const result = await insertPreset(content, {
          position,
          preservePositions: shouldPreservePositions,
          snapToGrid: true,
          selectAfterInsert: true
        });

        if (!result || !result.nodes) {
          throw new Error('Preset insertion returned no nodes');
        }

        const resultNodes = toFlowNodes(result.nodes);
        const resultEdges = toFlowEdges(result.edges);
        const existingNodes =
          (reactFlowInstance?.getNodes?.() as FlowNode[] | undefined) ?? [];
        const containerNode = getContainerAtPosition(position);
        const preparedBatch = prepareImportedGraphBatch<FlowNode, FlowEdge>({
          presetData: parsedPresetData,
          nodes: resultNodes,
          edges: resultEdges,
          preservePositionsRequested: shouldPreservePositions,
          existingNodes,
          getNodeWidth,
          getNodeHeight,
          containerNode: (containerNode as FlowNode | null) ?? null,
          attachNodesToContainer,
          layoutNodes: (nodes, edges) => {
            debugLogEpic1(
              '[DragDrop] Applying auto-layout to',
              nodes.length,
              'nodes'
            );
            const layoutedNodes = layoutNewNodes([], nodes, position, edges);
            if (layoutedNodes && layoutedNodes.length > 0) {
              debugLogEpic1('[DragDrop] Layout applied successfully');
              return layoutedNodes as FlowNode[];
            }
            console.warn('[DragDrop] Layout failed, using original positions');
            return nodes;
          }
        });

        const nodesToAdd: FlowNode[] = preparedBatch.nodes;
        const edgesToAdd: FlowEdge[] = preparedBatch.edges;

        if (preparedBatch.policy.shouldSkipAutoLayout) {
          debugLogEpic1(
            '[DragDrop] Skipping auto-layout for fragment with preserved positions'
          );
        }

        const importedBoxes = nodesToAdd.filter(
          node => node.type === 'enhancedBoundingBox'
        );
        if (
          importedBoxes.length > 0 &&
          preparedBatch.policy.shouldSkipParentRepair
        ) {
          debugLogEpic1(
            '[DragDrop] Preserving imported fragment wrapper geometry without repair pass'
          );
        }

        debugLogEpic1('[DragDrop] Adding nodes:', nodesToAdd.length, 'nodes');
        debugLogEpic1('[DragDrop] Adding edges:', edgesToAdd.length, 'edges');
        if (edgesToAdd.length > 0) {
          debugLogEpic1('[DragDrop] Edge details:', edgesToAdd);
        }

        setNodes(nds => nds.concat(nodesToAdd));
        setEdges(eds => {
          debugLogEpic1(
            '[DragDrop] Current edges:',
            eds.length,
            'New edges to add:',
            edgesToAdd.length
          );
          return eds.concat(edgesToAdd);
        });

        try {
          if (addNodeWithBounce && nodesToAdd[0]) {
            addNodeWithBounce(nodesToAdd[0]);
          }
        } catch (bounceError) {
          console.warn('Bounce animation failed:', bounceError);
        }

        showToast(
          'success',
          `Inserted preset "${meta?.name || meta?.id || 'Preset'}"`
        );
        debugLogEpic1('[DragDrop] Preset inserted successfully', {
          id: meta?.id,
          name: meta?.name,
          presetPath,
          addedNodes: nodesToAdd.length,
          addedEdges: edgesToAdd.length
        });
      } catch (error) {
        console.error('[DragDrop] Preset insertion failed:', error);
        showToast(
          'error',
          error instanceof Error ? error.message : 'Failed to insert preset'
        );
      }
    },
    [
      addNodeWithBounce,
      attachNodesToContainer,
      getContainerAtPosition,
      reactFlowInstance,
      resolveSafePresetPath,
      setEdges,
      setNodes,
      showToast
    ]
  );

  const handleNodeDrop = useCallback(
    (nodeType: string, position: { x: number; y: number }) => {
      const validPosition = {
        x: typeof position?.x === 'number' ? position.x : 250,
        y: typeof position?.y === 'number' ? position.y : 250
      };

      let newNode: FlowNode = {
        id: createNodeId(),
        type: nodeType || 'textBlock',
        position: validPosition,
        data: {
          value: '',
          nodeType: nodeType,
          ...(nodeType === 'textBlock' && {
            value: 'New text block',
            text: 'New text block'
          }),
          ...(nodeType === 'weightedChoice' && {
            value: JSON.stringify(
              [
                {
                  id: 'option-1',
                  text: 'Option 1',
                  weight: 50,
                  hasBranch: false
                },
                {
                  id: 'option-2',
                  text: 'Option 2',
                  weight: 50,
                  hasBranch: false
                }
              ],
              null,
              2
            ),
            options: [
              {
                id: 'option-1',
                text: 'Option 1',
                weight: 50,
                hasBranch: false
              },
              { id: 'option-2', text: 'Option 2', weight: 50, hasBranch: false }
            ]
          }),
          ...(nodeType === 'concat' && {
            value: ' ',
            separator: ' '
          }),
          ...((nodeType === 'variable' ||
            nodeType === 'setVariable' ||
            nodeType === 'getVariable') && {
            value: 'myVariable',
            variableName: 'myVariable',
            mode:
              nodeType === 'setVariable'
                ? 'set'
                : nodeType === 'getVariable'
                  ? 'get'
                  : 'both'
          }),
          ...(nodeType === 'output' && {
            value: 'output',
            label: 'output'
          }),
          ...(nodeType === 'enhancedBoundingBox' && {
            title: 'Region',
            description: '',
            backgroundColor: '#1a202c',
            opacity: 0.1,
            borderColor: '#22d3ee',
            borderStyle: 'solid',
            borderWidth: 2,
            locked: false,
            isCollapsed: false,
            width: 400,
            height: 300
          })
        }
      };

      if (nodeType === 'enhancedBoundingBox') {
        newNode = {
          ...newNode,
          width: 400,
          height: 300,
          style: {
            ...(newNode.style ?? {}),
            width: 400,
            height: 300
          }
        };
      }

      const containerNode = getContainerAtPosition(validPosition);
      if (containerNode) {
        const [attachedNode] = attachNodesToContainer([newNode], containerNode);
        if (attachedNode) {
          newNode = attachedNode;
        }
      }

      setNodes(nds => nds.concat(newNode));

      try {
        if (addNodeWithBounce) {
          addNodeWithBounce(newNode);
        }
      } catch (bounceError) {
        console.warn('Bounce animation failed:', bounceError);
      }

      showToast('success', `Added ${nodeType} node`);
    },
    [
      createNodeId,
      setNodes,
      addNodeWithBounce,
      showToast,
      getContainerAtPosition,
      attachNodesToContainer
    ]
  );

  // Handle drag over for new nodes
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }, []);

  // Handle drop for new nodes
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();

      // First: check for Asset Browser preset payloads
      const presetPayloads: string[] = [];
      try {
        const xpreset = event.dataTransfer.getData('application/x-preset');
        if (xpreset) {
          presetPayloads.push(xpreset);
        }
      } catch {
        // ignore
      }
      try {
        const jsonPayload = event.dataTransfer.getData('application/json');
        if (jsonPayload) {
          presetPayloads.push(jsonPayload);
        }
      } catch {
        // ignore
      }

      for (const raw of presetPayloads) {
        if (!raw) {
          continue;
        }
        try {
          const parsed = JSON.parse(raw);
          if (!isRecord(parsed)) {
            throw new Error('Preset payload must be an object');
          }
          const meta = parsed as PresetDropPayload;
          const pos = reactFlowInstance
            ? reactFlowInstance.screenToFlowPosition({
                x: event.clientX,
                y: event.clientY
              })
            : { x: 250, y: 250 };
          void insertPresetByMeta(meta, pos);
          return;
        } catch (e) {
          console.error('[DragDrop] Invalid preset drop payload:', e);
          showToast('error', 'Invalid preset drop payload');
          return;
        }
      }

      // Try multiple data types for compatibility
      let nodeType = event.dataTransfer.getData('application/reactflow');
      if (!nodeType) {
        nodeType = event.dataTransfer.getData('application/node-type');
      }
      if (!nodeType) {
        // If we somehow get here with a JSON fragment payload, try routing it
        // through preset insertion so asset fragments still work.
        try {
          const jsonPayload = event.dataTransfer.getData('application/json');
          if (jsonPayload) {
            const parsed = JSON.parse(jsonPayload);
            const parsedPath =
              isRecord(parsed) && typeof parsed.path === 'string'
                ? parsed.path
                : null;
            if (parsedPath) {
              const pos = reactFlowInstance
                ? reactFlowInstance.screenToFlowPosition({
                    x: event.clientX,
                    y: event.clientY
                  })
                : { x: 250, y: 250 };
              void insertPresetByMeta(parsed as PresetDropPayload, pos);
              return;
            }
          }
        } catch {
          // fall back to regular handling
        }
      }
      if (!nodeType) {
        nodeType = event.dataTransfer.getData('text/plain');
      }
      if (!nodeType) {
        nodeType = event.dataTransfer.getData('text');
      }

      if (!nodeType) {
        console.error(
          'Drop failed: no nodeType found in any data transfer format'
        );
        return;
      }

      let position;
      if (reactFlowInstance) {
        position = reactFlowInstance.screenToFlowPosition({
          x: event.clientX,
          y: event.clientY
        });
      } else {
        position = { x: 250, y: 250 };
        console.warn('ReactFlow instance not ready, using default position');
      }

      handleNodeDrop(nodeType, position);
    },
    [reactFlowInstance, handleNodeDrop, insertPresetByMeta, showToast]
  );

  return {
    onDragOver,
    onDrop,
    handleNodeDrop,
    insertPresetByMeta,
    createNodeId
  };
}
