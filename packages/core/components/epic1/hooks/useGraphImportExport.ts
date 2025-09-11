import { useCallback, useRef } from 'react';
import { Node, Edge } from 'reactflow';

interface UseGraphImportExportOptions {
  showToast?: (type: 'success' | 'error' | 'info', message: string) => void;
  onImport?: (nodes: Node[], edges: Edge[]) => void;
  onExport?: (data: { nodes: Node[]; edges: Edge[] }) => void;
  validateGraph?: (nodes: Node[], edges: Edge[]) => boolean;
}

/**
 * Custom hook for managing graph import/export operations
 */
export function useGraphImportExport<NodeData = unknown>(
  nodes: Node<NodeData>[],
  edges: Edge[],
  setNodes: React.Dispatch<React.SetStateAction<Node<NodeData>[]>>,
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>,
  options: UseGraphImportExportOptions = {}
) {
  const { showToast, onImport, onExport, validateGraph } = options;

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Export graph as JSON
  const exportGraph = useCallback(
    (filename?: string) => {
      const graphData = { nodes, edges };
      const blob = new Blob([JSON.stringify(graphData, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || `graph-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);

      onExport?.(graphData);
      showToast?.('success', 'Graph exported successfully');
    },
    [nodes, edges, onExport, showToast]
  );

  // Export selected nodes only
  const exportSelected = useCallback(
    (filename?: string) => {
      const selectedNodes = nodes.filter(n => n.selected);
      if (selectedNodes.length === 0) {
        showToast?.('info', 'No nodes selected to export');
        return;
      }

      const selectedNodeIds = new Set(selectedNodes.map(n => n.id));
      const relevantEdges = edges.filter(
        e => selectedNodeIds.has(e.source) && selectedNodeIds.has(e.target)
      );

      const graphData = { nodes: selectedNodes, edges: relevantEdges };
      const blob = new Blob([JSON.stringify(graphData, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || `graph-selection-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);

      showToast?.('success', `Exported ${selectedNodes.length} nodes`);
    },
    [nodes, edges, showToast]
  );

  // Import graph from JSON file
  const importGraph = useCallback(
    (file: File, replace = false) => {
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const content = e.target?.result;
          if (typeof content !== 'string') {
            throw new Error('Invalid file content');
          }

          const graphData = JSON.parse(content);
          if (!graphData.nodes || !graphData.edges) {
            throw new Error('Invalid graph format');
          }

          // Validate if validator provided
          if (
            validateGraph &&
            !validateGraph(graphData.nodes, graphData.edges)
          ) {
            throw new Error('Graph validation failed');
          }

          if (replace) {
            // Replace entire graph
            setNodes(graphData.nodes);
            setEdges(graphData.edges);
            showToast?.('success', 'Graph imported successfully');
          } else {
            // Merge with existing graph
            const existingIds = new Set(nodes.map(n => n.id));

            // Generate new IDs for conflicting nodes
            const idMap = new Map<string, string>();
            const processedNodes = graphData.nodes.map((node: Node) => {
              if (existingIds.has(node.id)) {
                const newId = `${node.id}-imported-${Date.now()}`;
                idMap.set(node.id, newId);
                return { ...node, id: newId };
              }
              return node;
            });

            // Update edge references
            const processedEdges = graphData.edges.map((edge: Edge) => {
              const newSource = idMap.get(edge.source) || edge.source;
              const newTarget = idMap.get(edge.target) || edge.target;
              return {
                ...edge,
                id: `${newSource}-${newTarget}-${Date.now()}`,
                source: newSource,
                target: newTarget
              };
            });

            setNodes(nds => [...nds, ...processedNodes]);
            setEdges(eds => [...eds, ...processedEdges]);
            showToast?.('success', `Imported ${processedNodes.length} nodes`);
          }

          onImport?.(graphData.nodes, graphData.edges);
        } catch (error) {
          console.error('Import failed:', error);
          showToast?.('error', `Import failed: ${(error as Error).message}`);
        }
      };

      reader.readAsText(file);
    },
    [nodes, setNodes, setEdges, validateGraph, onImport, showToast]
  );

  // Trigger file import dialog
  const triggerImport = useCallback(
    (replace = false) => {
      if (!fileInputRef.current) {
        // Create hidden file input
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,application/json';
        input.style.display = 'none';
        document.body.appendChild(input);
        fileInputRef.current = input;
      }

      fileInputRef.current.onchange = e => {
        const target = e.target as HTMLInputElement;
        const file = target.files?.[0];
        if (file) {
          importGraph(file, replace);
        }
        // Reset input
        target.value = '';
      };

      fileInputRef.current.click();
    },
    [importGraph]
  );

  // Copy graph to clipboard
  const copyToClipboard = useCallback(
    async (selectedOnly = false) => {
      try {
        let graphData;
        if (selectedOnly) {
          const selectedNodes = nodes.filter(n => n.selected);
          if (selectedNodes.length === 0) {
            showToast?.('info', 'No nodes selected to copy');
            return;
          }

          const selectedNodeIds = new Set(selectedNodes.map(n => n.id));
          const relevantEdges = edges.filter(
            e => selectedNodeIds.has(e.source) && selectedNodeIds.has(e.target)
          );

          graphData = { nodes: selectedNodes, edges: relevantEdges };
        } else {
          graphData = { nodes, edges };
        }

        await navigator.clipboard.writeText(JSON.stringify(graphData, null, 2));
        showToast?.('success', 'Graph copied to clipboard');
      } catch (error) {
        console.error('Copy failed:', error);
        showToast?.('error', 'Failed to copy to clipboard');
      }
    },
    [nodes, edges, showToast]
  );

  // Paste graph from clipboard
  const pasteFromClipboard = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      const graphData = JSON.parse(text);

      if (!graphData.nodes || !graphData.edges) {
        throw new Error('Invalid graph format in clipboard');
      }

      // Generate new IDs to avoid conflicts
      const idMap = new Map<string, string>();
      const pastedNodes = graphData.nodes.map((node: Node) => {
        const newId = `${node.id}-pasted-${Date.now()}`;
        idMap.set(node.id, newId);
        return {
          ...node,
          id: newId,
          position: {
            x: node.position.x + 50,
            y: node.position.y + 50
          },
          selected: true
        };
      });

      // Update edge references
      const pastedEdges = graphData.edges.map((edge: Edge) => {
        const newSource = idMap.get(edge.source) || edge.source;
        const newTarget = idMap.get(edge.target) || edge.target;
        return {
          ...edge,
          id: `${newSource}-${newTarget}-${Date.now()}`,
          source: newSource,
          target: newTarget
        };
      });

      // Deselect existing nodes
      setNodes(nds => [
        ...nds.map(n => ({ ...n, selected: false })),
        ...pastedNodes
      ]);
      setEdges(eds => [...eds, ...pastedEdges]);

      showToast?.('success', `Pasted ${pastedNodes.length} nodes`);
    } catch (error) {
      console.error('Paste failed:', error);
      showToast?.('error', 'Failed to paste from clipboard');
    }
  }, [setNodes, setEdges, showToast]);

  // Cleanup
  const cleanup = useCallback(() => {
    if (fileInputRef.current && fileInputRef.current.parentNode) {
      fileInputRef.current.parentNode.removeChild(fileInputRef.current);
      fileInputRef.current = null;
    }
  }, []);

  return {
    exportGraph,
    exportSelected,
    importGraph,
    triggerImport,
    copyToClipboard,
    pasteFromClipboard,
    cleanup
  };
}
