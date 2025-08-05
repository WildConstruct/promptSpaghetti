import { useCallback } from 'react';
import { Node, Edge } from 'reactflow';
import { useToast } from '../../Toast';

interface FileOperationsConfig {
  onNodesChange: (nodes: Node[]) => void;
  onEdgesChange: (edges: Edge[]) => void;
  onEditorKeyChange: (updater: (prev: number) => number) => void;
  showToast: ReturnType<typeof useToast>['showToast'];
}

export const useFileOperations = ({
  onNodesChange,
  onEdgesChange,
  onEditorKeyChange,
  showToast
}: FileOperationsConfig) => {
  
  const handleNew = useCallback((demoNodes: Node[], demoEdges: Edge[]) => {
    if (window.confirm('Create a new graph? Any unsaved changes will be lost.')) {
      onNodesChange(demoNodes);
      onEdgesChange(demoEdges);
      onEditorKeyChange(prev => prev + 1);
      localStorage.removeItem('epic1-graph');
      showToast('New graph created', 'success');
    }
  }, [onNodesChange, onEdgesChange, onEditorKeyChange, showToast]);

  const handleOpen = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          try {
            const data = JSON.parse(evt.target?.result as string);
            if (data.nodes && data.edges) {
              onNodesChange(data.nodes);
              onEdgesChange(data.edges);
              onEditorKeyChange(prev => prev + 1);
              localStorage.setItem('epic1-graph', JSON.stringify(data));
              showToast('Graph loaded successfully', 'success');
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

  const handleSave = useCallback((currentNodes: Node[], currentEdges: Edge[]) => {
    const graphData = {
      nodes: currentNodes,
      edges: currentEdges,
      version: '1.0',
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('epic1-graph', JSON.stringify(graphData));
    
    const blob = new Blob([JSON.stringify(graphData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `graph-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast('Graph saved', 'success');
  }, [showToast]);

  const handleSaveAs = useCallback((currentNodes: Node[], currentEdges: Edge[]) => {
    const name = prompt('Enter a name for this graph:');
    if (name) {
      const graphData = {
        name,
        nodes: currentNodes,
        edges: currentEdges,
        version: '1.0',
        timestamp: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(graphData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${name.replace(/[^a-z0-9]/gi, '_')}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      showToast(`Graph saved as "${name}"`, 'success');
    }
  }, [showToast]);

  const handleQuit = useCallback((currentNodes: Node[], currentEdges: Edge[]) => {
    const graphData = { nodes: currentNodes, edges: currentEdges };
    localStorage.setItem('epic1-graph-autosave', JSON.stringify(graphData));
    
    if (window.confirm('Are you sure you want to quit? Any unsaved changes will be auto-saved.')) {
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
  }, []);

  return {
    handleNew,
    handleOpen,
    handleSave,
    handleSaveAs,
    handleQuit
  };
};