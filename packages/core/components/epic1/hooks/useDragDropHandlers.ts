import { useCallback, useRef } from 'react';
import { Node, ReactFlowInstance } from 'reactflow';
import type { EditableNodeData } from '../nodes';
import { validatePreset, insertPreset } from '../../../runtime/presetInsertion';
import { layoutNewNodes } from '../../../utils/layoutAlgorithms';

interface UseDragDropHandlersProps {
  setNodes: (
    nodes:
      | Node<EditableNodeData>[]
      | ((nodes: Node<EditableNodeData>[]) => Node<EditableNodeData>[])
  ) => void;
  setEdges: (edges: any[] | ((edges: any[]) => any[])) => void;
  reactFlowInstance: ReactFlowInstance | null;
  showToast: (type: 'success' | 'error' | 'info', message: string) => void;
  addNodeWithBounce?: (node: Node) => void;
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
        if (manifestCacheRef.current) return manifestCacheRef.current;
        if (manifestLoadPromiseRef.current)
          return manifestLoadPromiseRef.current;
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
                if (!res.ok) continue;
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
        if (!manifest) return null;
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
    if (!path) return path;
    if (/^https?:\/\//i.test(path) || path.startsWith('/')) return path;
    const base = manifestBaseRef.current || '/presets';
    if (path.startsWith('./')) return `${base}/${path.slice(2)}`;
    if (path.startsWith('presets/')) return `/${path}`;
    if (
      path.startsWith('asset-browser/presets/') ||
      path.startsWith('/asset-browser/presets/')
    ) {
      return path.startsWith('/') ? path : `/${path}`;
    }
    return `${base}/${path}`;
  }, []);

  // Shared insertion routine for both drop and explicit insert actions
  const insertPresetByMeta = useCallback(
    async (meta: any, position: { x: number; y: number }) => {
      try {
        let content: string | null = null;

        // Prefer inline PSG content if provided
        if (meta?.psglib || meta?.content) {
          content = String(meta.psglib ?? meta.content);
          console.log('[DragDrop] Using inline preset content');
        } else {
          // Resolve path from payload or manifest by ID
          let presetPath: string | null =
            (typeof meta?.path === 'string' && meta.path) ||
            (typeof meta?.file === 'string' && meta.file) ||
            (typeof (meta as any)?.metadata?.file === 'string'
              ? (meta as any).metadata.file
              : null);

          if (!presetPath && meta?.id) {
            presetPath = await resolvePresetPathById(meta.id);
          }

          if (!presetPath) {
            throw new Error('Unable to resolve preset path.');
          }

          const normalized = normalizePresetPath(presetPath);
          const resp = await fetch(normalized, { cache: 'no-cache' });
          if (!resp.ok) {
            throw new Error(
              `Failed to load preset: ${resp.status} ${resp.statusText}`
            );
          }
          content = await resp.text();
          console.log('[DragDrop] Loaded preset from path:', normalized);
        }

        if (!content) throw new Error('Preset content is empty.');

        // Validate before inserting
        const validation = validatePreset(content);
        if (!validation.valid) {
          throw new Error(validation.error || 'Preset failed validation');
        }

        // Check if this is a fragment (has regions) to preserve positions
        let shouldPreservePositions = false;
        try {
          const data = JSON.parse(content);
          // Check for regions (fragments) or enhancedBoundingBox
          if (
            data.regions ||
            data.graph?.nodes?.some(
              (n: any) => n.type === 'enhancedBoundingBox'
            )
          ) {
            shouldPreservePositions = true;
            console.log('[DragDrop] Fragment detected, preserving positions');
          }
        } catch (e) {
          // Not JSON or can't parse, use default
        }

        const result = await insertPreset(content, {
          position,
          preservePositions: shouldPreservePositions, // Preserve for fragments
          snapToGrid: true,
          selectAfterInsert: true
        });

        // Check if result has nodes
        if (!result || !result.nodes) {
          throw new Error('Preset insertion returned no nodes');
        }

        // Apply auto-layout if multiple nodes (but not for fragments with preserved positions)
        let nodesToAdd = result.nodes as Node[];
        if (nodesToAdd && nodesToAdd.length > 1 && !shouldPreservePositions) {
          console.log(
            '[DragDrop] Applying auto-layout to',
            nodesToAdd.length,
            'nodes'
          );
          // Get existing nodes for layout context
          const existingNodes = [] as Node[]; // We don't need existing nodes for new layout
          const layoutedNodes = layoutNewNodes(
            existingNodes,
            nodesToAdd,
            position,
            result.edges || []
          );

          // Only use layouted nodes if the layout succeeded
          if (layoutedNodes && layoutedNodes.length > 0) {
            nodesToAdd = layoutedNodes;
            console.log('[DragDrop] Layout applied successfully');
          } else {
            console.warn('[DragDrop] Layout failed, using original positions');
          }
        } else if (shouldPreservePositions) {
          console.log(
            '[DragDrop] Skipping auto-layout for fragment with preserved positions'
          );
        }

        // Debug logging for edges
        console.log('[DragDrop] Adding nodes:', nodesToAdd.length, 'nodes');
        console.log(
          '[DragDrop] Adding edges:',
          result.edges?.length || 0,
          'edges'
        );
        if (result.edges && result.edges.length > 0) {
          console.log('[DragDrop] Edge details:', result.edges);
        }

        setNodes(nds => nds.concat(nodesToAdd as any));
        setEdges(eds => {
          const newEdges = (result.edges || []) as any;
          console.log(
            '[DragDrop] Current edges:',
            eds.length,
            'New edges to add:',
            newEdges.length
          );
          return eds.concat(newEdges);
        });

        // Optional: bounce first node for feedback
        try {
          if (addNodeWithBounce && result.nodes?.[0]) {
            addNodeWithBounce(result.nodes[0] as any);
          }
        } catch {
          // non-fatal
        }

        const name = meta?.name ? ` "${meta.name}"` : '';
        const count =
          (validation.nodeCount ?? 0) > 0
            ? ` (${validation.nodeCount} nodes)`
            : '';
        showToast('success', `Inserted preset${name}${count}`);
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
      setNodes,
      setEdges,
      showToast,
      normalizePresetPath,
      resolvePresetPathById
    ]
  );

  // Handle node drop from toolbar
  const handleNodeDrop = useCallback(
    (nodeType: string, position: { x: number; y: number }) => {
      const validPosition = {
        x: typeof position?.x === 'number' ? position.x : 250,
        y: typeof position?.y === 'number' ? position.y : 250
      };

      const newNode: Node<EditableNodeData> = {
        id: createNodeId(),
        type: nodeType || 'textBlock',
        position: validPosition,
        data: {
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
          })
        }
      };

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
    [createNodeId, setNodes, addNodeWithBounce, showToast]
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

      // First: check for Asset Browser preset payload
      let presetPayload = '';
      try {
        presetPayload = event.dataTransfer.getData('application/x-preset');
      } catch {
        // ignore
      }

      if (presetPayload) {
        try {
          const meta = JSON.parse(presetPayload);
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
