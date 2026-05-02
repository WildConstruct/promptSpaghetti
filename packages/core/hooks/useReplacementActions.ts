import { useCallback } from 'react';
import type { Edge, Node } from 'reactflow';
import {
  mapAssetToNodeType,
  mapReactFlowTypeToCompat,
  canConnect
} from '../services/assetTypeMapping';

type ReplacementAsset = {
  name: string;
  metadata?: { keywords?: unknown };
};

type WeightedOption = {
  text: string;
  weight?: number;
  hasBranch?: boolean;
};

type ReplacementNodeData = Record<string, unknown> & {
  label?: string;
  type?: string;
  options?: WeightedOption[];
};

type ReplacementNode = Node<ReplacementNodeData>;
type ReplacementEdge = Edge;

function getNodeData(node: ReplacementNode): ReplacementNodeData {
  return node.data ?? {};
}

function getNodeCompatType(node: ReplacementNode | undefined): string {
  const data = node ? getNodeData(node) : undefined;
  return String(data?.type || node?.type);
}

export function useReplacementActions({
  nodes,
  edges,
  setNodes,
  setEdges,
  notify
}: {
  nodes: ReplacementNode[];
  edges: ReplacementEdge[];
  setNodes: (fn: (prev: ReplacementNode[]) => ReplacementNode[]) => void;
  setEdges: (fn: (prev: ReplacementEdge[]) => ReplacementEdge[]) => void;
  notify: (type: 'success' | 'info' | 'error', msg: string) => void;
}) {
  const mergeChoices = useCallback(
    (targetNodeId: string, asset: ReplacementAsset) => {
      setNodes(nds =>
        nds.map(n => {
          if (n.id !== targetNodeId) return n;
          const data = getNodeData(n);
          const options = Array.isArray(data.options)
            ? data.options
            : [];
          const exists = options.some(
            option =>
              option.text.toLowerCase() === asset.name.toLowerCase()
          );
          const newOptions = exists
            ? options
            : options.concat({ text: asset.name, weight: 5, hasBranch: false });
          return { ...n, data: { ...data, options: newOptions } };
        })
      );
      notify('success', 'Merged choices');
    },
    [setNodes, notify]
  );

  const createVariant = useCallback(
    (targetNodeId: string) => {
      const src = nodes.find(n => n.id === targetNodeId);
      if (!src) return;
      const newId = `variant-${Date.now()}`;
      const pos = src.position || { x: 0, y: 0 };
      const data = getNodeData(src);
      const newNode = {
        ...src,
        id: newId,
        data: {
          ...data,
          label: `${data.label || src.id} (variant)`
        },
        position: { x: pos.x + 80, y: pos.y + 40 }
      };
      setNodes(nds => nds.concat(newNode));
      const incoming = edges
        .filter(e => e.target === targetNodeId)
        .map(e => ({
          ...e,
          id: `${e.id || ''}-${newId}`,
          target: newId
        }));
      const outgoing = edges
        .filter(e => e.source === targetNodeId)
        .map(e => ({
          ...e,
          id: `${e.id || ''}-${newId}`,
          source: newId
        }));
      setEdges(eds => eds.concat(incoming).concat(outgoing));
      notify('success', 'Created variant branch');
    },
    [nodes, edges, setNodes, setEdges, notify]
  );

  const smartSwap = useCallback(
    (targetNodeId: string, asset: ReplacementAsset) => {
      const mapped = mapAssetToNodeType(asset);
      setNodes(nds =>
        nds.map(n =>
          n.id === targetNodeId
            ? {
                ...n,
                type: mapped.reactFlowType,
                data: {
                  ...getNodeData(n),
                  type: mapped.reactFlowType,
                  label: asset.name
                }
              }
            : n
        )
      );
      setEdges(eds =>
        eds.filter(e => {
          if (e.source !== targetNodeId && e.target !== targetNodeId)
            return true;
          const isOutgoing = e.source === targetNodeId;
          const neighborId = isOutgoing ? e.target : e.source;
          const neighbor = nodes.find(n => n.id === neighborId);
          const neighborCompat = mapReactFlowTypeToCompat(
            getNodeCompatType(neighbor)
          );
          const newCompat = mapped.compatType;
          return isOutgoing
            ? canConnect(newCompat, neighborCompat)
            : canConnect(neighborCompat, newCompat);
        })
      );
      notify('info', 'Smart swap applied');
    },
    [nodes, setNodes, setEdges, notify]
  );

  const replaceAllSimilar = useCallback(
    (targetNodeId: string, asset: ReplacementAsset) => {
      const target = nodes.find(n => n.id === targetNodeId);
      if (!target) return;
      const targetCompat = mapReactFlowTypeToCompat(
        getNodeCompatType(target)
      );
      const mapped = mapAssetToNodeType(asset);
      const toReplace = nodes.filter(
        n =>
          mapReactFlowTypeToCompat(getNodeCompatType(n)) ===
          targetCompat
      );
      toReplace.forEach(n => {
        setNodes(nds =>
          nds.map(x =>
            x.id === n.id
              ? {
                  ...x,
                  type: mapped.reactFlowType,
                  data: {
                    ...getNodeData(x),
                    type: mapped.reactFlowType,
                    label: asset.name
                  }
                }
              : x
          )
        );
        setEdges(eds =>
          eds.filter(e => {
            if (e.source !== n.id && e.target !== n.id) return true;
            const isOutgoing = e.source === n.id;
            const neighborId = isOutgoing ? e.target : e.source;
            const neighbor = nodes.find(nn => nn.id === neighborId);
            const neighborCompat = mapReactFlowTypeToCompat(
              getNodeCompatType(neighbor)
            );
            return isOutgoing
              ? canConnect(mapped.compatType, neighborCompat)
              : canConnect(neighborCompat, mapped.compatType);
          })
        );
      });
      notify('info', `Replaced ${toReplace.length} similar nodes`);
    },
    [nodes, setNodes, setEdges, notify]
  );

  return { mergeChoices, createVariant, smartSwap, replaceAllSimilar };
}
