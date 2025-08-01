/**
 * Demo: Smooth Animations for Edit Transitions
 * Shows all animation effects in Epic 1
 */

import React, { useState } from 'react';
import { Epic1GraphEditorWithProvider } from '../Epic1GraphEditor';
import { Node, Edge } from 'reactflow';
import { EditableNodeData } from '../nodes';
import { MicroInteraction, useMicroInteractions } from '../animations/MicroInteractions';

// Initial demo nodes to showcase animations
const initialNodes: Node<EditableNodeData>[] = [
  {
    id: '1',
    type: 'textBlock',
    position: { x: 100, y: 100 },
    data: {
      value: 'Double-click to see smooth edit transitions',
      text: 'Double-click to see smooth edit transitions',
      nodeType: 'textBlock',
    },
  },
  {
    id: '2',
    type: 'weightedChoice',
    position: { x: 100, y: 250 },
    data: {
      value: JSON.stringify([
        { text: 'Watch the animation', weight: 50 },
        { text: 'Feel the smoothness', weight: 50 },
      ]),
      options: [
        { text: 'Watch the animation', weight: 50 },
        { text: 'Feel the smoothness', weight: 50 },
      ],
      nodeType: 'weightedChoice',
    },
  },
  {
    id: '3',
    type: 'variable',
    position: { x: 400, y: 100 },
    data: {
      value: 'animationState',
      variableName: 'animationState',
      operation: 'set',
      variableValue: 'smooth',
      nodeType: 'setVariable',
    },
  },
  {
    id: '4',
    type: 'concat',
    position: { x: 400, y: 250 },
    data: {
      value: ' → ',
      separator: ' → ',
      nodeType: 'concat',
    },
  },
  {
    id: '5',
    type: 'output',
    position: { x: 600, y: 175 },
    data: {
      value: 'Animated Output',
      label: 'Animated Output',
      nodeType: 'output',
    },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-4', source: '1', target: '4' },
  { id: 'e2-4', source: '2', target: '4' },
  { id: 'e3-4', source: '3', target: '4' },
  { id: 'e4-5', source: '4', target: '5' },
];

export const AnimationsDemo: React.FC = () => {
  const [showGuide, setShowGuide] = useState(true);
  const { interactions, trigger } = useMicroInteractions();

  const handleInteraction = (type: 'hover' | 'click' | 'save' | 'error') => {
    const x = Math.random() * 400 + 100;
    const y = Math.random() * 300 + 100;
    trigger(type, x, y, type === 'error' ? 'Example error' : undefined);
  };

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <div style={{ padding: 20, background: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
        <h1 style={{ margin: 0, fontSize: 24 }}>Epic 1 Animations Demo</h1>
        <p style={{ margin: '10px 0 0 0', color: '#666' }}>
          Experience smooth edit transitions and micro-interactions
        </p>
      </div>

      {showGuide && (
        <div style={{
          position: 'absolute',
          top: 100,
          right: 20,
          width: 300,
          background: 'white',
          padding: 20,
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          zIndex: 100
        }}>
          <h3 style={{ margin: '0 0 15px 0' }}>Animation Guide</h3>
          
          <div style={{ marginBottom: 15 }}>
            <h4 style={{ margin: '0 0 5px 0', fontSize: 14 }}>Edit Transitions:</h4>
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: '#666' }}>
              <li>Double-click any node to edit</li>
              <li>Watch the smooth scale animation</li>
              <li>Notice the focus ring effect</li>
              <li>Press Enter/Escape for confirmation animations</li>
            </ul>
          </div>

          <div style={{ marginBottom: 15 }}>
            <h4 style={{ margin: '0 0 5px 0', fontSize: 14 }}>Micro-interactions:</h4>
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: '#666' }}>
              <li>Hover over nodes for subtle glow</li>
              <li>Click for ripple effects</li>
              <li>Tab navigation shows focus animations</li>
              <li>Save shows success checkmark</li>
            </ul>
          </div>

          <div style={{ marginBottom: 15 }}>
            <h4 style={{ margin: '0 0 5px 0', fontSize: 14 }}>Test Interactions:</h4>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button 
                onClick={() => handleInteraction('hover')}
                style={{
                  padding: '6px 12px',
                  fontSize: 12,
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  background: 'white',
                  cursor: 'pointer'
                }}
              >
                Hover Effect
              </button>
              <button 
                onClick={() => handleInteraction('click')}
                style={{
                  padding: '6px 12px',
                  fontSize: 12,
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  background: 'white',
                  cursor: 'pointer'
                }}
              >
                Click Ripple
              </button>
              <button 
                onClick={() => handleInteraction('save')}
                style={{
                  padding: '6px 12px',
                  fontSize: 12,
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  background: 'white',
                  cursor: 'pointer'
                }}
              >
                Save Success
              </button>
              <button 
                onClick={() => handleInteraction('error')}
                style={{
                  padding: '6px 12px',
                  fontSize: 12,
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  background: 'white',
                  cursor: 'pointer'
                }}
              >
                Error Shake
              </button>
            </div>
          </div>

          <button
            onClick={() => setShowGuide(false)}
            style={{
              width: '100%',
              padding: '8px',
              background: '#007acc',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 14
            }}
          >
            Hide Guide
          </button>
        </div>
      )}

      <div style={{ height: 'calc(100% - 80px)', position: 'relative' }}>
        <Epic1GraphEditorWithProvider
          initialNodes={initialNodes}
          initialEdges={initialEdges}
          showAssetLibrary={false}
          showPreview={true}
          previewPosition="bottom"
          previewWidth="200px"
        />

        {/* Render micro-interactions */}
        {interactions.map(({ id, type, x, y, message }) => (
          <MicroInteraction
            key={id}
            trigger={type}
            x={x}
            y={y}
            message={message}
          />
        ))}
      </div>

      {!showGuide && (
        <button
          onClick={() => setShowGuide(true)}
          style={{
            position: 'absolute',
            top: 100,
            right: 20,
            padding: '8px 16px',
            background: 'white',
            border: '1px solid #ddd',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: 13
          }}
        >
          Show Guide
        </button>
      )}
    </div>
  );
};