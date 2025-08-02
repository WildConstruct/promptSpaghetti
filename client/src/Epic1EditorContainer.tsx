import React, { useEffect, useState } from 'react';
import ReactFlow, { ReactFlowProvider, Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';

// Import CSS files needed for Epic1
import '@promptscape/core/components/epic1/Epic1GraphEditor.css';
import '@promptscape/core/components/epic1/nodes/BaseEditableNode.css';
import '@promptscape/core/components/epic1/nodes/NodeStyles.css';

interface Epic1EditorContainerProps {
  showPreview?: boolean;
  showAssetLibrary?: boolean;
}

// Simple fallback component
const FallbackEditor = () => {
  const initialNodes: Node[] = [
    {
      id: '1',
      type: 'default',
      position: { x: 250, y: 100 },
      data: { label: 'Epic1 Editor is loading...' }
    }
  ];

  return (
    <ReactFlow
      nodes={initialNodes}
      edges={[]}
      fitView
    />
  );
};

export const Epic1EditorContainer: React.FC<Epic1EditorContainerProps> = (props) => {
  const [EditorComponent, setEditorComponent] = useState<React.ComponentType<any> | null>(null);
  const [loadError, setLoadError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadEpic1 = async () => {
      try {
        console.log('Starting Epic1 load...');
        
        // First ensure nodes are properly loaded
        const nodesModule = await import('@promptscape/core/components/epic1/nodes');
        console.log('Nodes loaded:', {
          TextBlockNode: !!nodesModule.TextBlockNode,
          epic1NodeTypes: !!nodesModule.epic1NodeTypes,
          nodeTypeKeys: Object.keys(nodesModule.epic1NodeTypes || {})
        });

        // Load the main Epic1 module
        const epic1Module = await import('@promptscape/core/components/epic1');
        console.log('Epic1 module loaded:', {
          hasEditor: !!epic1Module.Epic1GraphEditor,
          hasProvider: !!epic1Module.Epic1GraphEditorWithProvider
        });

        if (!mounted) return;

        // Get the editor component WITH provider to ensure ReactFlow context
        if (epic1Module.Epic1GraphEditorWithProvider) {
          setEditorComponent(() => epic1Module.Epic1GraphEditorWithProvider);
        } else if (epic1Module.Epic1GraphEditor) {
          // Fallback to basic editor if provider version not available
          console.warn('Using Epic1GraphEditor without provider - this may cause issues');
          setEditorComponent(() => epic1Module.Epic1GraphEditor);
        } else {
          throw new Error('Epic1GraphEditor not found in module');
        }
      } catch (err) {
        console.error('Load error:', err);
        if (mounted) {
          setLoadError(err.message || 'Failed to load Epic1 Editor');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadEpic1();

    return () => {
      mounted = false;
    };
  }, []);

  if (loadError) {
    return (
      <div style={{ 
        width: '100%', 
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{ color: '#e53e3e', fontSize: '18px' }}>
          Failed to load Epic1 Editor
        </div>
        <div style={{ color: '#718096', fontSize: '14px' }}>
          {loadError}
        </div>
        <div style={{ padding: '20px', background: '#f7fafc', borderRadius: '8px' }}>
          <ReactFlowProvider>
            <FallbackEditor />
          </ReactFlowProvider>
        </div>
      </div>
    );
  }

  if (isLoading || !EditorComponent) {
    return (
      <div style={{ 
        width: '100%', 
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ color: '#718096', fontSize: '16px' }}>
          Loading Epic1 Editor components...
        </div>
      </div>
    );
  }

  // Safe initial data
  const initialNodes = [
    {
      id: 'node-1',
      type: 'textBlock',
      position: { x: 300, y: 100 },
      data: {
        nodeType: 'textBlock',
        value: 'Welcome to Epic 1!',
        text: 'Welcome to Epic 1!',
        label: 'Welcome Node'
      }
    },
    {
      id: 'node-2',
      type: 'textBlock',
      position: { x: 300, y: 250 },
      data: {
        nodeType: 'textBlock',
        value: 'Double-click any node to edit',
        text: 'Double-click any node to edit',
        label: 'Instructions'
      }
    }
  ];

  const initialEdges = [
    {
      id: 'edge-1',
      source: 'node-1',
      target: 'node-2'
    }
  ];

  // Render the editor - it has its own provider
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <EditorComponent
        initialNodes={initialNodes}
        initialEdges={initialEdges}
        {...props}
      />
    </div>
  );
};