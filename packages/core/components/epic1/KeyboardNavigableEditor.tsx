/**
 * Keyboard-navigable editor component for Epic 1
 * Provides Tab/Shift+Tab navigation and auto-focus for inline editable nodes
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Node, Edge, ReactFlow, ReactFlowProvider, Controls, Background, useReactFlow } from 'reactflow';
import { useKeyboardNavigation } from './hooks/useKeyboardNavigation';
import { VisualRangeIndicator } from './VisualRangeIndicator';
import { PromptAnalysis } from '../../runtime/nodes/epic1/PromptParser';
import 'reactflow/dist/style.css';

export interface KeyboardNavigableEditorProps {
  promptAnalysis?: PromptAnalysis;
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onNodesChange?: (nodes: Node[]) => void;
  onEdgesChange?: (edges: Edge[]) => void;
  onCanvasClick?: () => void;
  onEscapePress?: () => void;
  className?: string;
  showVisualIndicators?: boolean;
}

function KeyboardNavigableEditorInternal({
  promptAnalysis,
  initialNodes = [],
  initialEdges = [],
  onNodesChange,
  onEdgesChange,
  onCanvasClick,
  onEscapePress,
  className = '',
  showVisualIndicators = true
}: KeyboardNavigableEditorProps) {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [hoveredTextRange, setHoveredTextRange] = useState<{ start: number; end: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const { getNodes, setNodes: setFlowNodes } = useReactFlow();

  // Handle node selection
  const handleNodeSelect = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);
    
    // Update node selection state
    setNodes(currentNodes => 
      currentNodes.map(node => ({
        ...node,
        selected: node.id === nodeId
      }))
    );
  }, []);

  // Handle escape key - cancel current edit
  const handleEditCancel = useCallback((nodeId: string) => {
    setNodes(currentNodes => 
      currentNodes.map(node => {
        if (node.id === nodeId) {
          // Restore original value and exit edit mode
          return {
            ...node,
            data: {
              ...node.data,
              isEditing: false,
              // Restore from backup if available
              value: node.data.originalValue || node.data.value
            }
          };
        }
        return node;
      })
    );
    
    setSelectedNodeId(null);
  }, []);

  // Handle escape press at editor level
  const handleEscapePress = useCallback(() => {
    // Exit all edit modes
    setNodes(currentNodes => 
      currentNodes.map(node => ({
        ...node,
        data: {
          ...node.data,
          isEditing: false
        }
      }))
    );
    
    setSelectedNodeId(null);
    
    if (onEscapePress) {
      onEscapePress();
    }
  }, [onEscapePress]);

  // Set up keyboard navigation
  const { autoFocusFirstNode } = useKeyboardNavigation({
    nodes,
    selectedNodeId,
    onNodeSelect: handleNodeSelect,
    onEscapePress: handleEscapePress,
    onEditCancel: handleEditCancel,
    enabled: true
  });

  // Handle canvas click - confirm all edits
  const handleCanvasClick = useCallback((event: React.MouseEvent) => {
    // Check if click is on empty canvas area
    const target = event.target as HTMLElement;
    if (target.classList.contains('react-flow__pane') || 
        target.classList.contains('react-flow__background')) {
      
      // Confirm all edits
      setNodes(currentNodes => 
        currentNodes.map(node => ({
          ...node,
          data: {
            ...node.data,
            isEditing: false,
            originalValue: undefined // Clear backup
          }
        }))
      );
      
      setSelectedNodeId(null);
      
      if (onCanvasClick) {
        onCanvasClick();
      }
    }
  }, [onCanvasClick]);

  // Handle node changes from React Flow
  const handleNodesChange = useCallback((changes: any[]) => {
    setNodes(currentNodes => {
      let updatedNodes = [...currentNodes];
      
      changes.forEach(change => {
        if (change.type === 'position') {
          const nodeIndex = updatedNodes.findIndex(n => n.id === change.id);
          if (nodeIndex !== -1) {
            updatedNodes[nodeIndex] = {
              ...updatedNodes[nodeIndex],
              position: change.position
            };
          }
        }
        // Handle other change types as needed
      });
      
      return updatedNodes;
    });
  }, []);

  // Handle edge changes from React Flow
  const handleEdgesChange = useCallback((changes: any[]) => {
    setEdges(currentEdges => {
      let updatedEdges = [...currentEdges];
      // Handle edge changes
      return updatedEdges;
    });
  }, []);

  // Update parent when nodes change
  useEffect(() => {
    if (onNodesChange) {
      onNodesChange(nodes);
    }
  }, [nodes, onNodesChange]);

  // Update parent when edges change  
  useEffect(() => {
    if (onEdgesChange) {
      onEdgesChange(edges);
    }
  }, [edges, onEdgesChange]);

  // Generate nodes from prompt analysis if provided
  useEffect(() => {
    if (promptAnalysis && promptAnalysis.nodes.length > 0) {
      const generatedNodes = promptAnalysis.nodes.map((genNode, index) => {
        const node = genNode.node;
        const mapping = promptAnalysis.mappings.find(m => m.nodeId === node.serialize().id);
        
        return {
          id: node.serialize().id,
          type: 'default',
          position: { 
            x: 100 + (index % 3) * 250, 
            y: 100 + Math.floor(index / 3) * 150 
          },
          data: {
            ...node.serialize(),
            isEditing: true, // Start in edit mode
            originalValue: node.serialize().value, // Backup for cancel
            label: node.getNodeType(),
            sourceRange: mapping ? { start: mapping.startIndex, end: mapping.endIndex } : undefined
          }
        };
      });
      
      setNodes(generatedNodes);
      
      // Auto-connect nodes in sequence
      const generatedEdges = generatedNodes.slice(0, -1).map((node, index) => ({
        id: `e${node.id}-${generatedNodes[index + 1].id}`,
        source: node.id,
        target: generatedNodes[index + 1].id,
        type: 'default'
      }));
      
      setEdges(generatedEdges);
    }
  }, [promptAnalysis]);

  // Custom node component with edit support
  const nodeTypes = React.useMemo(() => ({
    default: (props: any) => {
      const { data, selected } = props;
      const isHovered = hoveredNodeId === props.id;
      
      return (
        <div 
          data-node-id={props.id}
          className={`
            border-2 rounded-lg p-4 bg-white shadow-lg transition-all
            ${selected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'}
            ${isHovered ? 'scale-105 shadow-xl' : ''}
            ${data.isEditing ? 'ring-2 ring-green-400' : ''}
          `}
          onMouseEnter={() => setHoveredNodeId(props.id)}
          onMouseLeave={() => setHoveredNodeId(null)}
        >
          <div className="font-semibold text-sm text-gray-600 mb-2">
            {data.label || data.type}
          </div>
          
          {data.isEditing ? (
            <div className="space-y-2">
              {data.type === 'TextBlock' && (
                <textarea
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={data.value || ''}
                  onChange={(e) => {
                    setNodes(nodes => 
                      nodes.map(node => 
                        node.id === props.id 
                          ? { ...node, data: { ...node.data, value: e.target.value } }
                          : node
                      )
                    );
                  }}
                  autoFocus={selected}
                  placeholder="Enter text..."
                  rows={2}
                />
              )}
              
              {data.type === 'WeightedChoice' && (
                <div className="space-y-1">
                  {(data.value || []).map((choice: any, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        className="flex-1 p-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={choice.text || ''}
                        onChange={(e) => {
                          const newChoices = [...(data.value || [])];
                          newChoices[index] = { ...newChoices[index], text: e.target.value };
                          setNodes(nodes => 
                            nodes.map(node => 
                              node.id === props.id 
                                ? { ...node, data: { ...node.data, value: newChoices } }
                                : node
                            )
                          );
                        }}
                        placeholder={`Option ${index + 1}`}
                      />
                      <input
                        type="number"
                        className="w-16 p-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={choice.weight || 0}
                        onChange={(e) => {
                          const newChoices = [...(data.value || [])];
                          newChoices[index] = { ...newChoices[index], weight: parseInt(e.target.value) || 0 };
                          setNodes(nodes => 
                            nodes.map(node => 
                              node.id === props.id 
                                ? { ...node, data: { ...node.data, value: newChoices } }
                                : node
                            )
                          );
                        }}
                        min="0"
                        max="100"
                      />
                      <span className="text-xs text-gray-500">%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm">
              {data.type === 'TextBlock' && <div className="text-gray-700">{data.value}</div>}
              {data.type === 'WeightedChoice' && (
                <div className="space-y-1">
                  {(data.value || []).map((choice: any, index: number) => (
                    <div key={index} className="text-xs text-gray-600">
                      • {choice.text} ({choice.weight}%)
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {data.sourceRange && (
            <div className="text-xs text-gray-400 mt-2">
              [{data.sourceRange.start}-{data.sourceRange.end}]
            </div>
          )}
        </div>
      );
    }
  }), [nodes, hoveredNodeId]);

  return (
    <div className={`relative h-full ${className}`}>
      {showVisualIndicators && promptAnalysis && (
        <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-white/90 backdrop-blur border-b">
          <VisualRangeIndicator
            promptAnalysis={promptAnalysis}
            onNodeHover={setHoveredNodeId}
            onTextHover={setHoveredTextRange}
            hoveredNodeId={hoveredNodeId}
            showConnectionLines={true}
          />
        </div>
      )}
      
      <div 
        ref={canvasRef}
        className="h-full"
        onClick={handleCanvasClick}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          className="bg-gray-50"
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
      
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur p-3 rounded-lg shadow-lg text-sm">
        <div className="font-semibold mb-1">Keyboard Shortcuts</div>
        <div className="space-y-1 text-xs text-gray-600">
          <div><kbd className="px-1 py-0.5 bg-gray-100 rounded">Tab</kbd> / <kbd className="px-1 py-0.5 bg-gray-100 rounded">Shift+Tab</kbd> - Navigate between nodes</div>
          <div><kbd className="px-1 py-0.5 bg-gray-100 rounded">Enter</kbd> - Confirm & next</div>
          <div><kbd className="px-1 py-0.5 bg-gray-100 rounded">Escape</kbd> - Cancel edit</div>
          <div>Click canvas - Confirm all edits</div>
        </div>
      </div>
    </div>
  );
}

// Export wrapped component
export function KeyboardNavigableEditor(props: KeyboardNavigableEditorProps) {
  return (
    <ReactFlowProvider>
      <KeyboardNavigableEditorInternal {...props} />
    </ReactFlowProvider>
  );
}