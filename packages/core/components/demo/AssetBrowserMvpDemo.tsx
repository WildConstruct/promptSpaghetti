import React, { useCallback, useMemo, useState } from 'react';
import {
  ReactFlowProvider,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type Connection,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge
} from 'reactflow';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { GraphCanvas } from '../epic1/components/GraphCanvas';
import { CanvasDropArea } from '../Canvas/CanvasDropArea';
import type { DraggedAsset } from '../AssetBrowser/DragDropHandler';

type DemoNodeData = {
  label: string;
  options?: Array<{ text: string; weight: number }>;
};

const noop = () => undefined;

export const AssetBrowserMvpDemo: React.FC = () => {
  const [nodes, setNodes] = useState<Node<DemoNodeData>[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  const assets: DraggedAsset[] = useMemo(
    () =>
      [
        {
          id: 'preset-city-props',
          name: 'City Props',
          type: 'psglib',
          content: '{"graph":{}}',
          metadata: { setting: 'urban' }
        },
        {
          id: 'preset-character-template',
          name: 'Character Template',
          type: 'psglib',
          content: '{"graph":{}}',
          metadata: { theme: 'character' }
        }
      ],
    []
  );

  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes(nds => applyNodeChanges(changes, nds));
  }, []);

  const handleEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges(eds => applyEdgeChanges(changes, eds));
  }, []);

  const handleConnect = useCallback((connection: Connection) => {
    setEdges(eds => addEdge(connection, eds));
  }, []);

  return (
    <ReactFlowProvider>
      <DndProvider backend={HTML5Backend}>
        <div
          style={{
            height: 480,
            border: '1px solid #333',
            position: 'relative'
          }}
        >
          <CanvasDropArea
            nodes={nodes.map(n => ({
              id: n.id,
              type: String(n.type),
              label: String(n.data?.label || n.id)
            }))}
            edges={edges}
            onCreateFromAsset={(asset, position) => {
              setNodes(nds =>
                nds.concat({
                  id: `n-${Date.now()}`,
                  type: 'textBlock',
                  position,
                  data: { label: asset.name }
                })
              );
            }}
            onReplaceNode={(targetId, asset) => {
              setNodes(nds =>
                nds.map(n =>
                  n.id === targetId
                    ? { ...n, data: { ...n.data, label: asset.name } }
                    : n
                )
              );
            }}
            onQuickAddChoice={(nodeId, asset, weight = 5) => {
              setNodes(nds =>
                nds.map(n =>
                  n.id === nodeId
                    ? {
                        ...n,
                        data: {
                          ...n.data,
                          options: [
                          ...(n.data?.options || []),
                          { text: asset.name, weight }
                        ]
                      }
                    }
                    : n
                )
              );
            }}
          >
            <GraphCanvas
              nodes={nodes}
              edges={edges}
              nodeTypes={{}}
              edgeTypes={{}}
              onNodesChange={handleNodesChange}
              onEdgesChange={handleEdgesChange}
              onConnect={handleConnect}
              onPaneClick={noop}
              onNodeClick={noop}
              onEdgeClick={noop}
              onSelectionStart={noop}
              onSelectionEnd={noop}
              onInit={noop}
              isValidConnection={() => true}
              activatedEdges={new Set()}
              showMinimap={false}
            />
          </CanvasDropArea>
        </div>
        <div style={{ marginTop: 12 }}>
          <strong>Demo assets (drag using your Asset Browser)</strong>
          <ul>
            {assets.map(a => (
              <li key={a.id}>{a.name}</li>
            ))}
          </ul>
        </div>
      </DndProvider>
    </ReactFlowProvider>
  );
};

export default AssetBrowserMvpDemo;
