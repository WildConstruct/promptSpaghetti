import React, { useCallback, useEffect, useState } from 'react';
import { Node, Edge } from 'reactflow';

// Dynamic import to handle potential build issues
let TabbedAssetBrowser: any = null;
let UserProvider: any = null;

interface AssetLibraryPanelProps {
  onClose?: () => void;
  position?: 'left' | 'right';
  onNodesChange?: (nodes: Node[]) => void;
  onEdgesChange?: (edges: Edge[]) => void;
  currentNodes?: Node[];
  currentEdges?: Edge[];
}

export const AssetLibraryPanel: React.FC<AssetLibraryPanelProps> = ({ 
  onClose,
  position = 'right',
  onNodesChange,
  onEdgesChange,
  currentNodes = [],
  currentEdges = []
}) => {
  const [componentsLoaded, setComponentsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string>('');

  useEffect(() => {
    // Dynamically import the asset browser components
    import('@prompt/asset-browser')
      .then((module) => {
        TabbedAssetBrowser = module.TabbedAssetBrowser;
        UserProvider = module.UserProvider;
        setComponentsLoaded(true);
      })
      .catch((error) => {
        console.warn('Failed to load asset browser:', error);
        setLoadError('Asset browser module not available');
      });
  }, []);

  const handleInsertPreset = useCallback((preset: any) => {
    if (!onNodesChange || !onEdgesChange) return;
    
    // Convert preset to nodes and insert into graph
    if (preset?.data && preset.data.nodes) {
      // Generate unique IDs for the new nodes
      const timestamp = Date.now();
      const idMap = new Map<string, string>();
      
      const newNodes = preset.data.nodes.map((node: any, index: number) => {
        const newId = `${node.id}_${timestamp}_${index}`;
        idMap.set(node.id, newId);
        
        return {
          ...node,
          id: newId,
          position: {
            x: 300 + (index * 150),
            y: 200 + (index * 80)
          }
        };
      });

      const newEdges = preset.data.edges?.map((edge: any, idx: number) => ({
        ...edge,
        id: `${edge.id}_${timestamp}_${idx}`,
        source: idMap.get(edge.source) || edge.source,
        target: idMap.get(edge.target) || edge.target
      })) || [];

      // Add to existing graph
      onNodesChange([...currentNodes, ...newNodes]);
      onEdgesChange([...currentEdges, ...newEdges]);
    }
  }, [currentNodes, currentEdges, onNodesChange, onEdgesChange]);

  return (
    <div 
      className={`asset-library-panel ${position}`}
      style={{
        position: 'absolute',
        top: 0,
        [position]: 0,
        bottom: 0,
        width: '320px',
        background: 'var(--bg-primary, #1a1a1a)',
        borderLeft: position === 'right' ? '1px solid var(--border-color, #333)' : undefined,
        borderRight: position === 'left' ? '1px solid var(--border-color, #333)' : undefined,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 10
      }}
    >
      {/* Header */}
      <div 
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--border-color, #333)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>
          Asset Library
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary, #999)',
              cursor: 'pointer',
              padding: '4px',
              fontSize: '18px'
            }}
            aria-label="Close asset library"
          >
            ×
          </button>
        )}
      </div>

      {/* Asset Browser */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {componentsLoaded && TabbedAssetBrowser && UserProvider ? (
          <UserProvider>
            <TabbedAssetBrowser onInsert={handleInsertPreset} />
          </UserProvider>
        ) : loadError ? (
          <div style={{ 
            padding: '16px', 
            color: 'var(--text-secondary, #999)',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '12px' }}>{loadError}</p>
          </div>
        ) : (
          // Placeholder while loading
          <div style={{ 
            flex: 1, 
            overflow: 'auto',
            padding: '16px',
            color: 'var(--text-secondary, #999)'
          }}>
            <div style={{
              textAlign: 'center',
              marginTop: '32px'
            }}>
              <p style={{ marginBottom: '16px' }}>🎨 Loading Asset Library...</p>
              <p style={{ fontSize: '12px', opacity: 0.7 }}>
                Browse and insert presets, templates, and saved graphs.
              </p>
              <div style={{
                marginTop: '32px',
                padding: '12px',
                background: 'var(--bg-secondary, #2a2a2a)',
                borderRadius: '4px'
              }}>
                <p style={{ fontSize: '11px', marginBottom: '8px' }}>Available Features:</p>
                <ul style={{ 
                  listStyle: 'none', 
                  padding: 0, 
                  margin: 0,
                  fontSize: '11px',
                  textAlign: 'left'
                }}>
                  <li>• Character name generators</li>
                  <li>• Story templates</li>
                  <li>• Dialogue patterns</li>
                  <li>• Saved graphs</li>
                  <li>• Community presets</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};