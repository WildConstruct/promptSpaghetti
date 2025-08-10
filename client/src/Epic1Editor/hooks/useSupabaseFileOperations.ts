import { useCallback, useState, useEffect } from 'react';
import { Node, Edge } from 'reactflow';
import { useToast } from '../../Toast';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

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

  // Check authentication status
  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setIsAuthenticated(!!session);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Fetch saved graphs from Supabase
  const fetchSavedGraphs = useCallback(async () => {
    if (!supabase) {
      showToast('Supabase not configured', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      let query = supabase
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

      if (error) throw error;
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
      isPublic: boolean = false
    ) => {
      if (!supabase) {
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
        } = await supabase.auth.getUser();

        const graphData = {
          name: name || `Graph ${new Date().toLocaleDateString()}`,
          description: description || '',
          nodes: currentNodes,
          edges: currentEdges,
          user_id: user?.id,
          is_public: isPublic,
          updated_at: new Date().toISOString()
        };

        // Check if we're updating an existing graph
        const savedData = localStorage.getItem('epic1-graph');
        let existingId: string | null = null;
        if (savedData) {
          try {
            const parsed = JSON.parse(savedData);
            existingId = parsed.supabase_id || null;
          } catch {}
        }

        let result;
        if (existingId && user) {
          // Update existing graph
          result = await supabase
            .from('graphs')
            .update(graphData)
            .eq('id', existingId)
            .eq('user_id', user.id)
            .select()
            .single();
        } else {
          // Create new graph
          result = await supabase
            .from('graphs')
            .insert(graphData)
            .select()
            .single();
        }

        if (result.error) throw result.error;

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
      if (!supabase) return;

      if (!window.confirm('Are you sure you want to delete this graph?'))
        return;

      setIsLoading(true);
      try {
        const {
          data: { user }
        } = await supabase.auth.getUser();

        if (!user) {
          showToast('Must be logged in to delete graphs', 'error');
          return;
        }

        const { error } = await supabase
          .from('graphs')
          .delete()
          .eq('id', graphId)
          .eq('user_id', user.id);

        if (error) throw error;

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
            const data = JSON.parse(evt.target?.result as string);
            if (data.nodes && data.edges) {
              onNodesChange(data.nodes);
              onEdgesChange(data.edges);
              onEditorKeyChange(prev => prev + 1);
              localStorage.setItem('epic1-graph', JSON.stringify(data));
              showToast('Graph loaded from file', 'success');
            }
          } catch (err) {
            showToast('Failed to load file', 'error');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, [onNodesChange, onEdgesChange, onEditorKeyChange, showToast]);

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
    handleOpen: supabase ? handleSupabaseOpen : handleLocalOpen,
    handleSave: (nodes: Node[], edges: Edge[]) => {
      if (supabase) {
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
    handleSaveAs: (nodes: Node[], edges: Edge[]) => {
      setShowSaveDialog(true);
    },
    handleNew: (demoNodes: Node[], demoEdges: Edge[]) => {
      if (
        window.confirm('Create a new graph? Any unsaved changes will be lost.')
      ) {
        onNodesChange(demoNodes);
        onEdgesChange(demoEdges);
        onEditorKeyChange(prev => prev + 1);
        localStorage.removeItem('epic1-graph');
        showToast('New graph created', 'success');
      }
    },
    handleQuit: (currentNodes: Node[], currentEdges: Edge[]) => {
      const graphData = { nodes: currentNodes, edges: currentEdges };
      localStorage.setItem('epic1-graph-autosave', JSON.stringify(graphData));

      if (
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
    }
  };
};
