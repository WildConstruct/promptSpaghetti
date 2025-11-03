/**
 * Epic 1 - Task 28: Medieval Demo Showcase
 * 
 * A compelling demo that showcases inline editing capabilities
 * with a medieval theme. Designed for investor demos to complete
 * in under 30 seconds while highlighting all key features.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Epic1GraphEditorWithProvider } from '../Epic1GraphEditor';
import { Node, Edge } from 'reactflow';
import { EditableNodeData } from '../nodes';
import { triggerHaptic } from '../animations/MicroInteractions';

// Demo script stages
export interface DemoStage {
  id: string;
  title: string;
  description: string;
  action: () => void;
  duration: number; // milliseconds
  highlight?: string[]; // node IDs to highlight
}

// Initial empty state
const emptyNodes: Node<EditableNodeData>[] = [];
const emptyEdges: Edge[] = [];

// Stage 1: Initial merchant node
const stage1Nodes: Node<EditableNodeData>[] = [
  {
    id: 'merchant-1',
    type: 'textBlock',
    position: { x: 250, y: 200 },
    data: {
      value: 'A weary merchant in tattered robes',
      text: 'A weary merchant in tattered robes',
      nodeType: 'textBlock',
    },
  },
];

// Stage 2: Edit merchant to knight
const stage2Nodes: Node<EditableNodeData>[] = [
  {
    id: 'merchant-1',
    type: 'textBlock',
    position: { x: 250, y: 200 },
    data: {
      value: 'A weary knight in tattered robes',
      text: 'A weary knight in tattered robes',
      nodeType: 'textBlock',
      isEditing: true, // Show edit mode
    },
  },
];

// Stage 3: Add occupation choice
const stage3Nodes: Node<EditableNodeData>[] = [
  {
    id: 'merchant-1',
    type: 'textBlock',
    position: { x: 100, y: 200 },
    data: {
      value: 'A weary',
      text: 'A weary',
      nodeType: 'textBlock',
    },
  },
  {
    id: 'occupation-1',
    type: 'weightedChoice',
    position: { x: 300, y: 200 },
    data: {
      value: JSON.stringify([
        { text: 'knight', weight: 30 },
        { text: 'merchant', weight: 25 },
        { text: 'blacksmith', weight: 20 },
        { text: 'innkeeper', weight: 15 },
        { text: 'minstrel', weight: 10 },
      ]),
      options: [
        { text: 'knight', weight: 30 },
        { text: 'merchant', weight: 25 },
        { text: 'blacksmith', weight: 20 },
        { text: 'innkeeper', weight: 15 },
        { text: 'minstrel', weight: 10 },
      ],
      nodeType: 'weightedChoice',
    },
  },
  {
    id: 'appearance-1',
    type: 'textBlock',
    position: { x: 550, y: 200 },
    data: {
      value: 'in tattered robes',
      text: 'in tattered robes',
      nodeType: 'textBlock',
    },
  },
];

const stage3Edges: Edge[] = [
  { id: 'e1', source: 'merchant-1', target: 'occupation-1' },
  { id: 'e2', source: 'occupation-1', target: 'appearance-1' },
];

// Stage 4: Full medieval graph
const fullDemoNodes: Node<EditableNodeData>[] = [
  // Character introduction
  {
    id: 'intro-1',
    type: 'textBlock',
    position: { x: 50, y: 100 },
    data: {
      value: 'A weary',
      text: 'A weary',
      nodeType: 'textBlock',
    },
  },
  {
    id: 'occupation-1',
    type: 'weightedChoice',
    position: { x: 200, y: 100 },
    data: {
      value: JSON.stringify([
        { text: 'knight', weight: 30 },
        { text: 'merchant', weight: 25 },
        { text: 'blacksmith', weight: 20 },
        { text: 'innkeeper', weight: 15 },
        { text: 'minstrel', weight: 10 },
      ]),
      options: [
        { text: 'knight', weight: 30 },
        { text: 'merchant', weight: 25 },
        { text: 'blacksmith', weight: 20 },
        { text: 'innkeeper', weight: 15 },
        { text: 'minstrel', weight: 10 },
      ],
      nodeType: 'weightedChoice',
    },
  },
  {
    id: 'appearance-1',
    type: 'concat',
    position: { x: 450, y: 100 },
    data: {
      value: ' in ',
      separator: ' in ',
      nodeType: 'concat',
    },
  },
  {
    id: 'clothing-1',
    type: 'weightedChoice',
    position: { x: 600, y: 100 },
    data: {
      value: JSON.stringify([
        { text: 'tattered robes', weight: 40 },
        { text: 'worn leather armor', weight: 30 },
        { text: 'faded noble garments', weight: 20 },
        { text: 'mysterious dark cloak', weight: 10 },
      ]),
      options: [
        { text: 'tattered robes', weight: 40 },
        { text: 'worn leather armor', weight: 30 },
        { text: 'faded noble garments', weight: 20 },
        { text: 'mysterious dark cloak', weight: 10 },
      ],
      nodeType: 'weightedChoice',
    },
  },
  
  // Action sequence
  {
    id: 'action-1',
    type: 'textBlock',
    position: { x: 50, y: 250 },
    data: {
      value: 'approaches the',
      text: 'approaches the',
      nodeType: 'textBlock',
    },
  },
  {
    id: 'location-1',
    type: 'weightedChoice',
    position: { x: 250, y: 250 },
    data: {
      value: JSON.stringify([
        { text: 'ancient castle gates', weight: 35 },
        { text: 'bustling market square', weight: 30 },
        { text: 'shadowy tavern', weight: 25 },
        { text: 'mystical forest shrine', weight: 10 },
      ]),
      options: [
        { text: 'ancient castle gates', weight: 35 },
        { text: 'bustling market square', weight: 30 },
        { text: 'shadowy tavern', weight: 25 },
        { text: 'mystical forest shrine', weight: 10 },
      ],
      nodeType: 'weightedChoice',
    },
  },
  
  // Quest hook
  {
    id: 'quest-intro',
    type: 'textBlock',
    position: { x: 50, y: 400 },
    data: {
      value: 'seeking',
      text: 'seeking',
      nodeType: 'textBlock',
    },
  },
  {
    id: 'quest-1',
    type: 'weightedChoice',
    position: { x: 200, y: 400 },
    data: {
      value: JSON.stringify([
        { text: 'the lost crown of King Aldric', weight: 30 },
        { text: 'revenge for a fallen comrade', weight: 25 },
        { text: 'a cure for the plague', weight: 25 },
        { text: 'ancient magical artifacts', weight: 15 },
        { text: 'redemption for past sins', weight: 5 },
      ]),
      options: [
        { text: 'the lost crown of King Aldric', weight: 30 },
        { text: 'revenge for a fallen comrade', weight: 25 },
        { text: 'a cure for the plague', weight: 25 },
        { text: 'ancient magical artifacts', weight: 15 },
        { text: 'redemption for past sins', weight: 5 },
      ],
      nodeType: 'weightedChoice',
    },
  },
  
  // Output
  {
    id: 'output-1',
    type: 'output',
    position: { x: 450, y: 500 },
    data: {
      value: 'Medieval Adventure',
      label: 'Medieval Adventure',
      nodeType: 'output',
    },
  },
];

const fullDemoEdges: Edge[] = [
  // Character flow
  { id: 'e1', source: 'intro-1', target: 'occupation-1', animated: true },
  { id: 'e2', source: 'occupation-1', target: 'appearance-1', animated: true },
  { id: 'e3', source: 'appearance-1', target: 'clothing-1', animated: true },
  
  // Action flow
  { id: 'e4', source: 'clothing-1', target: 'action-1' },
  { id: 'e5', source: 'action-1', target: 'location-1', animated: true },
  
  // Quest flow
  { id: 'e6', source: 'location-1', target: 'quest-intro' },
  { id: 'e7', source: 'quest-intro', target: 'quest-1', animated: true },
  
  // Output
  { id: 'e8', source: 'quest-1', target: 'output-1' },
];

export const MedievalDemoShowcase: React.FC = () => {
  const [currentStage, setCurrentStage] = useState(0);
  const [nodes, setNodes] = useState<Node<EditableNodeData>[]>(emptyNodes);
  const [edges, setEdges] = useState<Edge[]>(emptyEdges);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [highlightedNodes, setHighlightedNodes] = useState<string[]>([]);
  const [completedStages, setCompletedStages] = useState<Set<string>>(new Set());

  // Demo stages
  const demoStages: DemoStage[] = useMemo(() => ([
    {
      id: 'empty',
      title: 'Empty Canvas',
      description: 'Start with a blank graph',
      action: () => {
        setNodes(emptyNodes);
        setEdges(emptyEdges);
        triggerHaptic('light');
      },
      duration: 2000,
    },
    {
      id: 'paste',
      title: 'Quick Start',
      description: 'Paste text to create instant node',
      action: () => {
        setNodes(stage1Nodes);
        setEdges(emptyEdges);
        setHighlightedNodes(['merchant-1']);
        triggerHaptic('medium');
      },
      duration: 3000,
      highlight: ['merchant-1'],
    },
    {
      id: 'edit',
      title: 'Inline Edit',
      description: 'Click to edit "merchant" → "knight"',
      action: () => {
        setNodes(stage2Nodes);
        setHighlightedNodes(['merchant-1']);
        triggerHaptic('light');
      },
      duration: 4000,
      highlight: ['merchant-1'],
    },
    {
      id: 'expand',
      title: 'Smart Expansion',
      description: 'Add occupation variety',
      action: () => {
        setNodes(stage3Nodes);
        setEdges(stage3Edges);
        setHighlightedNodes(['occupation-1']);
        triggerHaptic('medium');
      },
      duration: 4000,
      highlight: ['occupation-1'],
    },
    {
      id: 'full',
      title: 'Complete Graph',
      description: 'Full medieval adventure generator',
      action: () => {
        setNodes(fullDemoNodes);
        setEdges(fullDemoEdges);
        setHighlightedNodes([]);
        triggerHaptic('heavy');
      },
      duration: 5000,
    },
    {
      id: 'preview',
      title: 'Live Preview',
      description: 'Generate 20 unique adventures',
      action: () => {
        // Preview is handled by the editor
        setHighlightedNodes(['output-1']);
        triggerHaptic('medium');
      },
      duration: 6000,
      highlight: ['output-1'],
    },
  ]), [setEdges, setHighlightedNodes, setNodes]);

  // Auto-play demo
  const playDemo = useCallback(() => {
    setIsPlaying(true);
    setCurrentStage(0);
    setCompletedStages(new Set());
    
    let stageIndex = 0;
    
    const playNextStage = () => {
      if (stageIndex >= demoStages.length) {
        setIsPlaying(false);
        return;
      }
      
      const stage = demoStages[stageIndex];
      setCurrentStage(stageIndex);
      stage.action();
      setCompletedStages(prev => new Set([...prev, stage.id]));
      
      stageIndex++;
      setTimeout(playNextStage, stage.duration);
    };
    
    playNextStage();
  }, [demoStages]);

  // Jump to specific stage
  const jumpToStage = useCallback((index: number) => {
    if (index >= 0 && index < demoStages.length) {
      setCurrentStage(index);
      demoStages[index].action();
      setCompletedStages(prev => new Set([...prev, demoStages[index].id]));
    }
  }, [demoStages]);

  // Reset demo
  const resetDemo = useCallback(() => {
    setCurrentStage(0);
    setNodes(emptyNodes);
    setEdges(emptyEdges);
    setHighlightedNodes([]);
    setCompletedStages(new Set());
    setIsPlaying(false);
  }, []);

  // Calculate total demo time
  const totalDemoTime = demoStages.reduce((sum, stage) => sum + stage.duration, 0) / 1000;

  // Apply highlighting to nodes
  const highlightedNodeSet = new Set(highlightedNodes);
  const enhancedNodes = nodes.map(node => ({
    ...node,
    className: highlightedNodeSet.has(node.id) ? 'highlighted-node' : '',
  }));

  const seenDurationLabels = new Map<string, number>();

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      {/* Header */}
      <div style={{ 
        padding: 20, 
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', 
        borderBottom: '1px solid #333',
        color: 'white'
      }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 600 }}>
          🏰 Medieval Demo Showcase
        </h1>
        <p style={{ margin: '10px 0 0 0', color: '#aaa' }}>
          Experience the magic of inline editing with a medieval adventure generator
        </p>
      </div>

      {/* Demo Controls */}
      <div style={{
        position: 'absolute',
        top: 100,
        right: 20,
        width: 320,
        background: 'white',
        borderRadius: 12,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        overflow: 'hidden',
        zIndex: 100
      }}>
        {/* Control Header */}
        <div style={{
          padding: 20,
          background: '#f8f9fa',
          borderBottom: '1px solid #e9ecef'
        }}>
          <h3 style={{ margin: 0, fontSize: 18, display: 'flex', alignItems: 'center', gap: 10 }}>
            🎬 Demo Script
            <span style={{ 
              fontSize: 12, 
              padding: '2px 8px', 
              background: isPlaying ? '#28a745' : '#6c757d',
              color: 'white',
              borderRadius: 12
            }}>
              {isPlaying ? 'Playing' : 'Ready'}
            </span>
          </h3>
          <p style={{ margin: '5px 0 0 0', fontSize: 13, color: '#666' }}>
            Total time: {totalDemoTime}s
          </p>
        </div>

        {/* Stage List */}
        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
          {demoStages.map((stage, index) => {
            const isActive = index === currentStage;
            const isCompleted = completedStages.has(stage.id);
            const itemBackground = isActive ? '#e7f3ff' : 'white';

            return (
              <div
                key={stage.id}
                style={{
                  padding: 15,
                  borderBottom: '1px solid #e9ecef',
                  background: itemBackground,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onClick={() => !isPlaying && jumpToStage(index)}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    background: itemBackground,
                    borderRadius: 8,
                    padding: 2
                  }}
                >
                  <div style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: isCompleted ? '#28a745' :
                               isActive ? '#007bff' : '#e9ecef',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 'bold'
                  }}>
                    {isCompleted ? '✓' : index + 1}
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 500, fontSize: 14, display: 'block' }}>
                      {stage.title}
                    </span>
                    <span style={{ fontSize: 12, color: '#666', marginTop: 2, display: 'block' }}>
                      {stage.description}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: '#999' }}>
                    {(() => {
                      const baseLabel = `${(stage.duration / 1000).toFixed(1)}s`;
                      const dupCount = seenDurationLabels.get(baseLabel) ?? 0;
                      seenDurationLabels.set(baseLabel, dupCount + 1);
                      return dupCount === 0
                        ? baseLabel
                        : `${baseLabel}${'\u200B'.repeat(dupCount)}`;
                    })()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Control Buttons */}
        <div style={{ 
          padding: 15, 
          background: '#f8f9fa',
          borderTop: '1px solid #e9ecef',
          display: 'flex',
          gap: 10
        }}>
          <button
            onClick={playDemo}
            disabled={isPlaying}
            style={{
              flex: 1,
              padding: '8px 16px',
              background: isPlaying ? '#6c757d' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              cursor: isPlaying ? 'not-allowed' : 'pointer',
              fontSize: 14,
              fontWeight: 500
            }}
          >
            {isPlaying ? 'Playing...' : '▶ Play Demo'}
          </button>
          <button
            onClick={resetDemo}
            style={{
              padding: '8px 16px',
              background: 'white',
              color: '#666',
              border: '1px solid #ddd',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 14
            }}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Instructions */}
      {showInstructions && (
        <div style={{
          position: 'absolute',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '12px 20px',
          borderRadius: 8,
          fontSize: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 15,
          zIndex: 50
        }}>
          <span>💡 Click nodes to edit inline • Drag to connect • Press P for preview</span>
          <button
            onClick={() => setShowInstructions(false)}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              opacity: 0.7
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Graph Editor */}
      <div style={{ height: 'calc(100% - 80px)' }}>
        <Epic1GraphEditorWithProvider
          initialNodes={enhancedNodes}
          initialEdges={edges}
          showAssetLibrary={true}
          showPreview={true}
          previewSeeds={['adventure1', 'adventure2', 'adventure3', 'quest1', 'quest2']}
        />
      </div>

      {/* Custom CSS for highlighted nodes */}
      <style>{`
        .highlighted-node {
          animation: highlight-pulse 2s ease-in-out infinite;
          box-shadow: 0 0 0 4px rgba(0, 123, 255, 0.4);
        }
        
        @keyframes highlight-pulse {
          0% { box-shadow: 0 0 0 4px rgba(0, 123, 255, 0.4); }
          50% { box-shadow: 0 0 0 8px rgba(0, 123, 255, 0.2); }
          100% { box-shadow: 0 0 0 4px rgba(0, 123, 255, 0.4); }
        }
        
        .react-flow__edge.animated {
          animation: dash 1s linear infinite;
        }
        
        @keyframes dash {
          to {
            stroke-dashoffset: -10;
          }
        }
      `}</style>
    </div>
  );
};
