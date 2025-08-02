import React, { useEffect, useState } from 'react';

interface SafeEpic1WrapperProps {
  showPreview?: boolean;
  showAssetLibrary?: boolean;
}

export const SafeEpic1Wrapper: React.FC<SafeEpic1WrapperProps> = (props) => {
  const [Editor, setEditor] = useState<React.ComponentType<any> | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    let mounted = true;
    
    const loadEditor = async () => {
      try {
        // Load the Epic1 module
        const epic1Module = await import('@promptscape/core/components/epic1');
        
        if (!mounted) return;
        
        if (epic1Module.Epic1GraphEditorWithProvider) {
          // Load CSS files
          try {
            await import('@promptscape/core/components/epic1/Epic1GraphEditor.css');
            await import('@promptscape/core/components/epic1/nodes/BaseEditableNode.css');
            await import('@promptscape/core/components/epic1/nodes/NodeStyles.css');
          } catch (cssErr) {
            console.warn('CSS loading error:', cssErr);
          }
          
          setEditor(() => epic1Module.Epic1GraphEditorWithProvider);
        } else {
          throw new Error('Epic1GraphEditorWithProvider not found');
        }
      } catch (err) {
        console.error('Failed to load Epic1 Editor:', err);
        setError(err.message || 'Failed to load editor');
      }
    };
    
    loadEditor();
    
    return () => {
      mounted = false;
    };
  }, []);

  if (error) {
    return (
      <div style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#e53e3e',
        fontSize: '16px'
      }}>
        Error: {error}
      </div>
    );
  }

  if (!Editor) {
    return (
      <div style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#718096',
        fontSize: '16px'
      }}>
        Loading Epic 1 Editor...
      </div>
    );
  }

  // Provide safe initial data
  const initialNodes = [
    {
      id: 'welcome-node',
      type: 'textBlock',
      position: { x: 250, y: 100 },
      data: {
        nodeType: 'textBlock',
        value: 'Welcome to Epic 1 Graph Editor!',
        text: 'Welcome to Epic 1 Graph Editor!',
        label: 'Welcome'
      }
    },
    {
      id: 'demo-node',
      type: 'textBlock',
      position: { x: 250, y: 250 },
      data: {
        nodeType: 'textBlock',
        value: 'Double-click to edit nodes',
        text: 'Double-click to edit nodes',
        label: 'Instructions'
      }
    }
  ];

  const initialEdges = [
    {
      id: 'e1-2',
      source: 'welcome-node',
      target: 'demo-node',
      type: 'default'
    }
  ];

  return (
    <Editor 
      initialNodes={initialNodes}
      initialEdges={initialEdges}
      {...props}
    />
  );
};