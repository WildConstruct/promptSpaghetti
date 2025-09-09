import { useCallback } from 'react';
import { mapAssetToNodeType, mapReactFlowTypeToCompat, canConnect } from '../services/assetTypeMapping';

export function useReplacementActions({ nodes, edges, setNodes, setEdges, notify }:{
  nodes: any[];
  edges: any[];
  setNodes: (fn: (prev: any[]) => any[]) => void;
  setEdges: (fn: (prev: any[]) => any[]) => void;
  notify: (type: 'success' | 'info' | 'error', msg: string) => void;
}) {
  const mergeChoices = useCallback((targetNodeId: string, asset: { name: string }) => {
    setNodes(nds => nds.map(n => {
      if (n.id !== targetNodeId) return n;
      const options = Array.isArray((n.data as any)?.options) ? (n.data as any).options : [];
      const exists = options.some((o: any) => String(o.text).toLowerCase() === String(asset.name).toLowerCase());
      const newOptions = exists ? options : options.concat({ text: asset.name, weight: 5, hasBranch: false });
      return { ...n, data: { ...n.data, options: newOptions } } as any;
    }));
    notify('success', 'Merged choices');
  }, [setNodes, notify]);

  const createVariant = useCallback((targetNodeId: string) => {
    const src = nodes.find(n => n.id === targetNodeId);
    if (!src) return;
    const newId = `variant-${Date.now()}`;
    const pos = (src as any).position || { x: 0, y: 0 };
    const newNode = { ...src, id: newId, data: { ...src.data, label: `${(src.data as any)?.label || src.id} (variant)` }, position: { x: pos.x + 80, y: pos.y + 40 } } as any;
    setNodes(nds => nds.concat(newNode));
    const incoming = edges.filter((e: any) => e.target === targetNodeId).map((e: any) => ({ ...e, id: `${e.id || ''}-${newId}`, target: newId }));
    const outgoing = edges.filter((e: any) => e.source === targetNodeId).map((e: any) => ({ ...e, id: `${e.id || ''}-${newId}`, source: newId }));
    setEdges(eds => eds.concat(incoming as any).concat(outgoing as any));
    notify('success', 'Created variant branch');
  }, [nodes, edges, setNodes, setEdges, notify]);

  const smartSwap = useCallback((targetNodeId: string, asset: { name: string }) => {
    const mapped = mapAssetToNodeType(asset as any);
    setNodes(nds => nds.map(n => n.id === targetNodeId ? ({ ...n, type: mapped.reactFlowType, data: { ...n.data, type: mapped.reactFlowType, label: asset.name } }) : n));
    setEdges(eds => eds.filter(e => {
      if (e.source !== targetNodeId && e.target !== targetNodeId) return true;
      const isOutgoing = e.source === targetNodeId;
      const neighborId = isOutgoing ? e.target : e.source;
      const neighbor = nodes.find(n => n.id === neighborId);
      const neighborCompat = mapReactFlowTypeToCompat(String((neighbor?.data as any)?.type || neighbor?.type));
      const newCompat = mapped.compatType;
      return isOutgoing ? canConnect(newCompat, neighborCompat) : canConnect(neighborCompat, newCompat);
    }));
    notify('info', 'Smart swap applied');
  }, [nodes, setNodes, setEdges, notify]);

  const replaceAllSimilar = useCallback((targetNodeId: string, asset: { name: string }) => {
    const target = nodes.find(n => n.id === targetNodeId);
    if (!target) return;
    const targetCompat = mapReactFlowTypeToCompat(String((target.data as any)?.type || target.type));
    const mapped = mapAssetToNodeType(asset as any);
    const toReplace = nodes.filter(n => mapReactFlowTypeToCompat(String((n.data as any)?.type || n.type)) === targetCompat);
    toReplace.forEach(n => {
      setNodes(nds => nds.map(x => x.id === n.id ? ({ ...x, type: mapped.reactFlowType, data: { ...x.data, type: mapped.reactFlowType, label: asset.name } }) : x));
      setEdges(eds => eds.filter(e => {
        if (e.source !== n.id && e.target !== n.id) return true;
        const isOutgoing = e.source === n.id;
        const neighborId = isOutgoing ? e.target : e.source;
        const neighbor = nodes.find(nn => nn.id === neighborId);
        const neighborCompat = mapReactFlowTypeToCompat(String((neighbor?.data as any)?.type || neighbor?.type));
        return isOutgoing ? canConnect(mapped.compatType, neighborCompat) : canConnect(neighborCompat, mapped.compatType);
      }));
    });
    notify('info', `Replaced ${toReplace.length} similar nodes`);
  }, [nodes, setNodes, setEdges, notify]);

  return { mergeChoices, createVariant, smartSwap, replaceAllSimilar };
}

