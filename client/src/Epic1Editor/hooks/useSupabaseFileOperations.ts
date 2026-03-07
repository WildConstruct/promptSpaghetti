import { useCallback, useState, useEffect } from 'react';
import { Node, Edge } from 'reactflow';
import { useToast } from '../../Toast';
import { getSupabase } from '@promptscape/core/utils/supabaseClient';
import { looksLikeLegacyGraphWrapper } from '@promptscape/core/utils/psgCodec';
import { exportGraphToPSG } from '@promptscape/core/fileFormats/psg';
import { loadReactFlowFromPsgContent } from '../utils/psgDocument';
import { validateEditorGraphPayload } from '../utils/graphValidation';

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

function sanitizeFilenameSegment(value: string): string {
  const trimmed = value.trim();
  const normalized = trimmed.length > 0 ? trimmed : 'prompt-spaghetti-graph';
  return normalized
    .replace(/[^a-z0-9._-]+/gi, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase();
}

function downloadTextFile(
  filename: string,
  content: string,
  mimeType = 'application/json'
) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function createPsgDocument(
  nodes: Node[],
  edges: Edge[],
  options: {
    name?: string;
    description?: string;
    tags?: string[];
  } = {}
) {
  return exportGraphToPSG(nodes, edges, {
    name: options.name || 'Prompt Spaghetti Graph',
    description: options.description,
    metadata:
      options.tags && options.tags.length > 0
        ? { tags: options.tags }
        : undefined
  });
}

function exportGraphAsPsg(
  nodes: Node[],
  edges: Edge[],
  options: {
    name?: string;
    description?: string;
    tags?: string[];
  } = {}
) {
  const psg = createPsgDocument(nodes, edges, options);
  const content = JSON.stringify(psg, null, 2);
  const baseName = sanitizeFilenameSegment(options.name || psg.name);
  downloadTextFile(
    `${baseName}.psg`,
    content,
    'application/x-promptspaghetti-graph'
  );
  return psg;
}

function exportGraphLocallyWithToast(
  showToast: ReturnType<typeof useToast>['showToast'],
  nodes: Node[],
  edges: Edge[],
  options: {
    name?: string;
    description?: string;
    tags?: string[];
  },
  message: string,
  level: Parameters<ReturnType<typeof useToast>['showToast']>[1]
) {
  exportGraphAsPsg(nodes, edges, options);
  showToast(message, level);
}

export const useSupabaseFileOperations = ({
  onNodesChange,
  onEdgesChange,
  onEditorKeyChange,
  showToast
}: FileOperationsConfig) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
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
    if (!sb) {
      return;
    }

    sb.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      setCurrentUserId(session?.user?.id ?? null);
    });

    const { data: authListener } = sb.auth.onAuthStateChange(
      (_event, session) => {
        setIsAuthenticated(!!session);
        setCurrentUserId(session?.user?.id ?? null);
      }
    );

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

      if (error) {
        throw error;
      }
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
      const validated = validateEditorGraphPayload(graph);
      if (!validated.ok) {
        showToast(`Failed to load graph: ${validated.error}`, 'error');
        return;
      }
      onNodesChange(validated.data.nodes);
      onEdgesChange(validated.data.edges);
      onEditorKeyChange(prev => prev + 1);
      localStorage.setItem(
        'epic1-graph',
        JSON.stringify({
          nodes: validated.data.nodes,
          edges: validated.data.edges,
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
        exportGraphLocallyWithToast(
          showToast,
          currentNodes,
          currentEdges,
          {
            name,
            description,
            tags
          },
          'Supabase not configured - exported PSG locally',
          'warning'
        );
        return;
      }

      setIsLoading(true);
      try {
        const {
          data: { user }
        } = await sb.auth.getUser();

        if (!user) {
          exportGraphLocallyWithToast(
            showToast,
            currentNodes,
            currentEdges,
            {
              name,
              description,
              tags
            },
            'Sign in required for cloud save - exported PSG locally instead',
            'warning'
          );
          setShowSaveDialog(false);
          return;
        }

        const graphData = {
          name: name || `Graph ${new Date().toLocaleDateString()}`,
          description: description || '',
          nodes: currentNodes,
          edges: currentEdges,
          user_id: user.id,
          is_public: isPublic,
          tags,
          updated_at: new Date().toISOString()
        };

        // Client filters are not authorization. Cloud graph ownership must be
        // enforced by Supabase RLS for insert/update/delete operations.
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
        if (existingId) {
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
          result = await sb.from('graphs').insert(graphData).select().single();
        }

        if (result.error) {
          throw result.error;
        }

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
        exportGraphLocallyWithToast(
          showToast,
          currentNodes,
          currentEdges,
          {
            name,
            description,
            tags
          },
          'Failed to save to cloud - exported PSG locally instead',
          'error'
        );
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
      if (!sb) {
        return;
      }

      // eslint-disable-next-line no-alert
      if (!window.confirm('Are you sure you want to delete this graph?')) {
        return;
      }

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

        if (error) {
          throw error;
        }

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

  const loadFromPsgContent = useCallback(
    (psgText: string, strictValidation = true) => {
      try {
        const { nodes, edges } = loadReactFlowFromPsgContent(
          psgText,
          strictValidation
        );
        onNodesChange(nodes);
        onEdgesChange(edges);
        onEditorKeyChange(prev => prev + 1);
        localStorage.setItem('epic1-graph', JSON.stringify({ nodes, edges }));
        showToast('PSG document loaded successfully', 'success');
      } catch (error) {
        console.error('Failed to parse PSG content:', error);
        showToast('Failed to load PSG content', 'error');
      }
    },
    [onNodesChange, onEdgesChange, onEditorKeyChange, showToast]
  );

  // Handle opening from local file (fallback)
  const handleLocalOpen = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.psg';
    input.onchange = event => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) {
        return;
      }

      const reader = new FileReader();
      reader.onload = loadEvent => {
        try {
          const text = String(loadEvent.target?.result || '');
          const name = file.name.toLowerCase();

          if (name.endsWith('.psg')) {
            loadFromPsgContent(text);
            return;
          }

          const data = JSON.parse(text);
          if (looksLikeLegacyGraphWrapper(data)) {
            loadFromPsgContent(text, false);
            return;
          }

          if (data.nodes && data.edges) {
            const validated = validateEditorGraphPayload(data);
            if (!validated.ok) {
              throw new Error(validated.error);
            }
            onNodesChange(validated.data.nodes);
            onEdgesChange(validated.data.edges);
            onEditorKeyChange(prev => prev + 1);
            localStorage.setItem('epic1-graph', JSON.stringify(validated.data));
            showToast(
              'Legacy JSON graph loaded via compatibility path',
              'success'
            );
            return;
          }

          throw new Error('Unrecognized file format');
        } catch (error) {
          console.error('Failed to load file:', error);
          showToast('Failed to load file', 'error');
        }
      };

      reader.readAsText(file);
    };

    input.click();
  }, [
    loadFromPsgContent,
    onNodesChange,
    onEdgesChange,
    onEditorKeyChange,
    showToast
  ]);

  return {
    isAuthenticated,
    savedGraphs,
    currentUserId,
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
        const psg = exportGraphAsPsg(nodes, edges);
        localStorage.setItem('epic1-graph', JSON.stringify({ nodes, edges }));
        showToast(`Exported "${psg.name}" as PSG`, 'success');
      }
    },
    handleSaveAs: (nodes?: Node[], edges?: Edge[]) => {
      if (getSupabase()) {
        setShowSaveDialog(true);
        return;
      }

      const name =
        // eslint-disable-next-line no-alert
        window.prompt(
          'Enter a name for this PSG document:',
          'Prompt Spaghetti Graph'
        ) || 'Prompt Spaghetti Graph';
      const nextNodes = nodes || [];
      const nextEdges = edges || [];
      const psg = exportGraphAsPsg(nextNodes, nextEdges, { name });
      localStorage.setItem(
        'epic1-graph',
        JSON.stringify({ nodes: nextNodes, edges: nextEdges })
      );
      showToast(`Exported "${psg.name}" as PSG`, 'success');
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
