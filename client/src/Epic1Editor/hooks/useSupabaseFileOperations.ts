import { useCallback, useState, useEffect } from 'react';
import { Node, Edge } from 'reactflow';
import { useToast } from '../../Toast';
import { getSupabase } from '@promptscape/core/utils/supabaseClient';
import { readPsg, type PSGFile } from '@promptscape/core';
import type {
  GraphNode as PSGGraphNode,
  GraphEdge as PSGGraphEdge
} from '@promptscape/core';

// Resolve Supabase client lazily at call sites to avoid capturing null

interface FileOperationsConfig {
  onNodesChange: (nodes: Node[]) => void;
  onEdgesChange: (edges: Edge[]) => void;
  onEditorKeyChange: (updater: (prev: number) => number) => void;
  showToast: ReturnType<typeof useToast>['showToast'];
}

interface SupabaseGraph {
  id: string;
  name: string;
  nodes: Node[];
  edges: Edge[];
  created_at: string;
  updated_at: string;
  user_id?: string;
  is_public: boolean;
  tags?: string[];
  description?: string;
}

export const useSupabaseFileOperations = ({
  onNodesChange,
  onEdgesChange,
  onEditorKeyChange,
  showToast
}: FileOperationsConfig) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [savedGraphs, setSavedGraphs] = useState<SupabaseGraph[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showOpenDialog, setShowOpenDialog] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showNewDocumentModal, setShowNewDocumentModal] = useState(false);
  const [pendingNewDocument, setPendingNewDocument] = useState<{
    nodes: Node[];
    edges: Edge[];
  } | null>(null);

  // Check authentication status
  useEffect(() => {
    const sb = getSupabase();
    if (!sb) { return; }

    sb.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    const { data: authListener } = sb.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Fetch saved graphs from Supabase
  const fetchSavedGraphs = useCallback(async () => {
    const sb = getSupabase();
    if (!sb) {
      showToast('Supabase not configured', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      const {
        data: { user }
      } = await sb.auth.getUser();

      let query = sb
        .from('graphs')
        .select('*')
        .order('updated_at', { ascending: false });

      // If authenticated, get user's graphs and public graphs
      if (user) {
        query = query.or(`user_id.eq.${user.id},is_public.eq.true`);
      } else {
        // If not authenticated, only get public graphs
        query = query.eq('is_public', true);
      }

      const { data, error } = await query;

      if (error) { throw error; }
      setSavedGraphs(data || []);
    } catch (error) {
      console.error('Error fetching graphs:', error);
      showToast('Failed to load saved graphs', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  // Handle opening from Supabase
  const handleSupabaseOpen = useCallback(async () => {
    await fetchSavedGraphs();
    setShowOpenDialog(true);
  }, [fetchSavedGraphs]);

  // Load a specific graph
  const loadGraph = useCallback(
    (graph: SupabaseGraph) => {
      onNodesChange(graph.nodes);
      onEdgesChange(graph.edges);
      onEditorKeyChange(prev => prev + 1);
      localStorage.setItem(
        'epic1-graph',
        JSON.stringify({
          nodes: graph.nodes,
          edges: graph.edges,
          supabase_id: graph.id
        })
      );
      showToast(`Loaded "${graph.name}"`, 'success');
      setShowOpenDialog(false);
    },
    [onNodesChange, onEdgesChange, onEditorKeyChange, showToast]
  );

  // Save to Supabase
  const handleSupabaseSave = useCallback(
    async (
      currentNodes: Node[],
      currentEdges: Edge[],
      name?: string,
      description?: string,
      isPublic: boolean = false,
      tags: string[] = []
    ) => {
      const sb = getSupabase();
      if (!sb) {
        showToast('Supabase not configured - saving locally', 'warning');
        // Fall back to local save
        const blob = new Blob(
          [
            JSON.stringify(
              { nodes: currentNodes, edges: currentEdges },
              null,
              2
            )
          ],
          { type: 'application/json' }
        );
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `graph-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        return;
      }

      setIsLoading(true);
      try {
        const {
          data: { user }
        } = await sb.auth.getUser();

        const graphData = {
          name: name || `Graph ${new Date().toLocaleDateString()}`,
          description: description || '',
          nodes: currentNodes,
          edges: currentEdges,
          user_id: user?.id,
          is_public: isPublic,
          tags,
          updated_at: new Date().toISOString()
        };

        // Check if we're updating an existing graph
        const savedData = localStorage.getItem('epic1-graph');
        let existingId: string | null = null;
        if (savedData) {
          try {
            const parsed = JSON.parse(savedData);
            existingId = parsed.supabase_id || null;
          } catch {
            // Ignore malformed legacy cache entries
          }
        }

        let result;
        if (existingId && user) {
          // Update existing graph
          result = await sb
            .from('graphs')
            .update(graphData)
            .eq('id', existingId)
            .eq('user_id', user.id)
            .select()
            .single();
        } else {
          // Create new graph
          result = await sb
            .from('graphs')
            .insert(graphData)
            .select()
            .single();
        }

        if (result.error) {throw result.error;}

        // Update local storage with the Supabase ID
        localStorage.setItem(
          'epic1-graph',
          JSON.stringify({
            nodes: currentNodes,
            edges: currentEdges,
            supabase_id: result.data.id
          })
        );

        showToast(`Saved "${graphData.name}" to cloud`, 'success');
        setShowSaveDialog(false);
      } catch (error) {
        console.error('Error saving to Supabase:', error);
        showToast('Failed to save to cloud - saving locally instead', 'error');

        // Fall back to local save
        const blob = new Blob(
          [
            JSON.stringify(
              { nodes: currentNodes, edges: currentEdges },
              null,
              2
            )
          ],
          { type: 'application/json' }
        );
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `graph-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } finally {
        setIsLoading(false);
      }
    },
    [showToast]
  );

  // Delete a graph
  const deleteGraph = useCallback(
    async (graphId: string) => {
      const sb = getSupabase();
      if (!sb) { return; }

      // eslint-disable-next-line no-alert
      if (!window.confirm('Are you sure you want to delete this graph?'))
        {return;}

      setIsLoading(true);
      try {
        const {
          data: { user }
        } = await sb.auth.getUser();

        if (!user) {
          showToast('Must be logged in to delete graphs', 'error');
          return;
        }

        const { error } = await sb
          .from('graphs')
          .delete()
          .eq('id', graphId)
          .eq('user_id', user.id);

        if (error) {throw error;}

        showToast('Graph deleted', 'success');
        await fetchSavedGraphs();
      } catch (error) {
        console.error('Error deleting graph:', error);
        showToast('Failed to delete graph', 'error');
      } finally {
        setIsLoading(false);
      }
    },
    [showToast, fetchSavedGraphs]
  );

  // Convert a PSG file to React Flow nodes/edges with sensible defaults
  const convertPsgToReactFlow = useCallback(
    (psg: PSGFile): { nodes: Node[]; edges: Edge[] } => {
      const layout = psg.graph.layout as Record<string, unknown> | undefined;
      const positionsUnknown =
        layout && (layout as Record<string, unknown>).positions;
      const isPositionsMap = (
        val: unknown
      ): val is Record<string, { x: number; y: number }> => {
        if (!val || typeof val !== 'object') {return false;}
        // shallow check for at least one entry with numeric x/y
        for (const v of Object.values(val as Record<string, unknown>)) {
          if (
            v &&
            typeof v === 'object' &&
            typeof (v as Record<string, unknown>).x === 'number' &&
            typeof (v as Record<string, unknown>).y === 'number'
          ) {
            return true;
          }
        }
        return true; // treat empty object as valid
      };
      const positions: Record<string, { x: number; y: number }> =
        isPositionsMap(positionsUnknown)
          ? (positionsUnknown as Record<string, { x: number; y: number }>)
          : {};

      const xSpacing = 300;
      const ySpacing = 160;
      const cols = 3;

      const nodes: Node[] = (psg.graph.nodes as PSGGraphNode[]).map(
        (gn: PSGGraphNode, index: number) => {
          const pos = positions[gn.id] || {
            x: (index % cols) * xSpacing + 200,
            y: Math.floor(index / cols) * ySpacing + 120
          };
          const type = gn.type || 'textBlock';
          const dataRaw = (gn.data || {}) as Record<string, unknown>;
          const labelFromData =
            typeof dataRaw['label'] === 'string'
              ? (dataRaw['label'] as string)
              : undefined;
          const label = gn.label || labelFromData || gn.id;

          // Normalize data shape expected by Epic1 editor nodes
          let data: Record<string, unknown> = { label };
          switch (type) {
            case 'textBlock': {
              const contentVal = dataRaw['content'];
              const textVal = dataRaw['text'];
              const valueVal = dataRaw['value'];
              const content =
                typeof contentVal === 'string'
                  ? contentVal
                  : typeof textVal === 'string'
                    ? textVal
                    : label;
              const value = typeof valueVal === 'string' ? valueVal : content;
              data = {
                nodeType: 'textBlock',
                content,
                text: content,
                value,
                label
              };
              break;
            }
            case 'weightedChoice': {
              const optionsVal = dataRaw['options'];
              const options = Array.isArray(optionsVal) ? optionsVal : [];
              data = {
                nodeType: 'weightedChoice',
                options,
                label: label || 'Choice'
              };
              break;
            }
            case 'output': {
              const outVal = dataRaw['outputName'];
              const outputName = typeof outVal === 'string' ? outVal : 'output';
              data = { nodeType: 'output', outputName, label: 'Output' };
              break;
            }
            default: {
              data = { label };
            }
          }

          return {
            id: gn.id,
            type,
            position: pos,
            data
          } as Node;
        }
      );

      const edges: Edge[] = (psg.graph.edges as PSGGraphEdge[]).map(
        (ge: PSGGraphEdge) => ({
          id: ge.id,
          source: ge.source,
          target: ge.target,
          type: 'smoothstep',
          sourceHandle: 'source',
          targetHandle: 'target'
        })
      );

      return { nodes, edges };
    },
    []
  );

  // Programmatically load PSG content (as string) into the editor
  const loadFromPsgContent = useCallback(
    (psgText: string) => {
      try {
        const psg = readPsg(psgText, { strictValidation: true });
        const { nodes, edges } = convertPsgToReactFlow(psg);
        onNodesChange(nodes);
        onEdgesChange(edges);
        onEditorKeyChange(prev => prev + 1);
        localStorage.setItem('epic1-graph', JSON.stringify({ nodes, edges }));
        showToast('Graph loaded from PSG', 'success');
      } catch (err) {
        console.error('Failed to parse PSG content:', err);
        showToast('Failed to load PSG content', 'error');
      }
    },
    [
      convertPsgToReactFlow,
      onNodesChange,
      onEdgesChange,
      onEditorKeyChange,
      showToast
    ]
  );

  // Handle opening from local file (fallback)
  const handleLocalOpen = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.psg';
    input.onchange = e => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = evt => {
          try {
            const text = String(evt.target?.result || '');
            const name = file.name.toLowerCase();
            if (name.endsWith('.psg')) {
              const psg = readPsg(text, { strictValidation: true });
              const { nodes, edges } = convertPsgToReactFlow(psg);
              onNodesChange(nodes);
              onEdgesChange(edges);
              onEditorKeyChange(prev => prev + 1);
              localStorage.setItem(
                'epic1-graph',
                JSON.stringify({ nodes, edges })
              );
              showToast('Graph loaded from PSG file', 'success');
              return;
            }

            // Try JSON; if it looks like PSG, parse accordingly
            const data = JSON.parse(text);
            if (data && data.kind === 'graph' && data.version && data.graph) {
              const psg = readPsg(text, { strictValidation: false });
              const { nodes, edges } = convertPsgToReactFlow(psg);
              onNodesChange(nodes);
              onEdgesChange(edges);
              onEditorKeyChange(prev => prev + 1);
              localStorage.setItem(
                'epic1-graph',
                JSON.stringify({ nodes, edges })
              );
              showToast('Graph loaded from PSG file', 'success');
              return;
            }

            if (data.nodes && data.edges) {
              onNodesChange(data.nodes);
              onEdgesChange(data.edges);
              onEditorKeyChange(prev => prev + 1);
              localStorage.setItem('epic1-graph', JSON.stringify(data));
              showToast('Graph loaded from JSON file', 'success');
              return;
            }

            throw new Error('Unrecognized file format');
          } catch (error) {
            console.error('Failed to load file:', error);
            showToast('Failed to load file', 'error');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, [
    onNodesChange,
    onEdgesChange,
    onEditorKeyChange,
    showToast,
    convertPsgToReactFlow
  ]);

  return {
    isAuthenticated,
    savedGraphs,
    isLoading,
    showOpenDialog,
    showSaveDialog,
    setShowOpenDialog,
    setShowSaveDialog,
    handleSupabaseOpen,
    handleSupabaseSave,
    handleLocalOpen,
    loadGraph,
    deleteGraph,
    fetchSavedGraphs,
    // Keep the original interface for compatibility
    handleOpen: getSupabase() ? handleSupabaseOpen : handleLocalOpen,
    handleSave: (nodes: Node[], edges: Edge[]) => {
      if (getSupabase()) {
        setShowSaveDialog(true);
      } else {
        // Fall back to local save
        const blob = new Blob([JSON.stringify({ nodes, edges }, null, 2)], {
          type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `graph-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('Graph saved locally', 'success');
      }
    },
    handleSaveAs: () => {
      setShowSaveDialog(true);
    },
    handleNew: (demoNodes: Node[], demoEdges: Edge[]) => {
      setPendingNewDocument({ nodes: demoNodes, edges: demoEdges });
      setShowNewDocumentModal(true);
    },
    confirmNewDocument: () => {
      if (pendingNewDocument) {
        onNodesChange(pendingNewDocument.nodes);
        onEdgesChange(pendingNewDocument.edges);
        onEditorKeyChange(prev => prev + 1);
        localStorage.removeItem('epic1-graph');
        localStorage.removeItem('promptgraph:state:v1'); // Clear persisted state
        showToast('New graph created', 'success');
        setShowNewDocumentModal(false);
        setPendingNewDocument(null);
      }
    },
    cancelNewDocument: () => {
      setShowNewDocumentModal(false);
      setPendingNewDocument(null);
    },
    showNewDocumentModal,
    handleQuit: (currentNodes: Node[], currentEdges: Edge[]) => {
      const graphData = { nodes: currentNodes, edges: currentEdges };
      localStorage.setItem('epic1-graph-autosave', JSON.stringify(graphData));

      if (
        // eslint-disable-next-line no-alert
        window.confirm(
          'Are you sure you want to quit? Any unsaved changes will be auto-saved.'
        )
      ) {
        window.close();

        setTimeout(() => {
          document.body.innerHTML = `
            <div style="
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              font-family: system-ui, -apple-system, sans-serif;
              flex-direction: column;
              gap: 20px;
              background: #1a1a1a;
              color: #e0e0e0;
            ">
              <h2>Thank you for using Prompt Spaghetti!</h2>
              <p>You can now safely close this tab.</p>
              <p style="color: #888; font-size: 14px;">Your work has been auto-saved.</p>
            </div>
          `;
        }, 100);
      }
    },
    // New: programmatically open PSG text
    loadFromPsgContent
  };
};
