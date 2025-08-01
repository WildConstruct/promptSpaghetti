/**
 * Demo: Micro-interactions and Haptic Feedback
 * Shows all the new micro-interactions from Task 27
 */

import React, { useState } from 'react';
import { Epic1GraphEditorWithProvider } from '../Epic1GraphEditor';
import { Node, Edge } from 'reactflow';
import { EditableNodeData } from '../nodes';
import { triggerHaptic } from '../animations/MicroInteractions';

// Initial demo nodes
const initialNodes: Node<EditableNodeData>[] = [
  {
    id: '1',
    type: 'textBlock',
    position: { x: 100, y: 100 },
    data: {
      value: 'Drag me closer to another node to feel magnetic snap!',
      text: 'Drag me closer to another node to feel magnetic snap!',
      nodeType: 'textBlock',
    },
  },
  {
    id: '2',
    type: 'weightedChoice',
    position: { x: 400, y: 100 },
    data: {
      value: JSON.stringify([
        { text: 'Feel the snap', weight: 50 },
        { text: 'Magnetic connection', weight: 50 },
      ]),
      options: [
        { text: 'Feel the snap', weight: 50 },
        { text: 'Magnetic connection', weight: 50 },
      ],
      nodeType: 'weightedChoice',
    },
  },
  {
    id: '3',
    type: 'variable',
    position: { x: 250, y: 250 },
    data: {
      value: 'hapticState',
      variableName: 'hapticState',
      operation: 'set',
      variableValue: 'active',
      nodeType: 'setVariable',
    },
  },
];

const initialEdges: Edge[] = [];

export const MicroInteractionsDemo: React.FC = () => {
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [showGuide, setShowGuide] = useState(true);

  const testHaptic = (type: 'light' | 'medium' | 'heavy' | 'error') => {
    triggerHaptic(type);
  };

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <div style={{ padding: 20, background: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
        <h1 style={{ margin: 0, fontSize: 24 }}>Epic 1 Micro-interactions Demo</h1>
        <p style={{ margin: '10px 0 0 0', color: '#666' }}>
          Experience magnetic snap, node bounce, and haptic feedback
        </p>
      </div>

      {showGuide && (
        <div style={{
          position: 'absolute',
          top: 100,
          right: 20,
          width: 320,
          background: 'white',
          padding: 20,
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          zIndex: 100
        }}>
          <h3 style={{ margin: '0 0 15px 0' }}>Micro-interactions Guide</h3>
          
          <div style={{ marginBottom: 15 }}>
            <h4 style={{ margin: '0 0 5px 0', fontSize: 14 }}>🧲 Magnetic Snap:</h4>
            <p style={{ margin: 0, fontSize: 13, color: '#666' }}>
              Drag nodes close to each other to feel the magnetic attraction.
              Connections will snap when within 30px.
            </p>
          </div>

          <div style={{ marginBottom: 15 }}>
            <h4 style={{ margin: '0 0 5px 0', fontSize: 14 }}>🎾 Node Bounce:</h4>
            <p style={{ margin: 0, fontSize: 13, color: '#666' }}>
              Duplicate a node (Cmd+D) to see the bounce animation.
              New nodes appear with a satisfying bounce effect.
            </p>
          </div>

          <div style={{ marginBottom: 15 }}>
            <h4 style={{ margin: '0 0 5px 0', fontSize: 14 }}>✨ Hover Effects:</h4>
            <p style={{ margin: 0, fontSize: 13, color: '#666' }}>
              Hover over nodes to see subtle glow effects.
              Click for ripple animations and haptic feedback.
            </p>
          </div>

          <div style={{ marginBottom: 15 }}>
            <h4 style={{ margin: '0 0 5px 0', fontSize: 14 }}>📳 Haptic Feedback:</h4>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
              <button 
                onClick={() => testHaptic('light')}
                style={{
                  padding: '6px 12px',
                  fontSize: 12,
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  background: 'white',
                  cursor: 'pointer'
                }}
              >
                Light Tap
              </button>
              <button 
                onClick={() => testHaptic('medium')}
                style={{
                  padding: '6px 12px',
                  fontSize: 12,
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  background: 'white',
                  cursor: 'pointer'
                }}
              >
                Medium Tap
              </button>
              <button 
                onClick={() => testHaptic('heavy')}
                style={{
                  padding: '6px 12px',
                  fontSize: 12,
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  background: 'white',
                  cursor: 'pointer'
                }}
              >
                Heavy Tap
              </button>
              <button 
                onClick={() => testHaptic('error')}
                style={{
                  padding: '6px 12px',
                  fontSize: 12,
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  background: 'white',
                  cursor: 'pointer'
                }}
              >
                Error Buzz
              </button>
            </div>
            <p style={{ margin: '8px 0 0 0', fontSize: 11, color: '#999' }}>
              {hapticEnabled ? '✅ Haptic feedback enabled' : '❌ Haptic feedback disabled'}
              {!('vibrate' in navigator) && ' (Not supported on this device)'}
            </p>
          </div>

          <div style={{ marginBottom: 15 }}>
            <h4 style={{ margin: '0 0 5px 0', fontSize: 14 }}>🎯 Try These Actions:</h4>
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: '#666' }}>
              <li>Create a connection - feel the snap</li>
              <li>Duplicate nodes - see the bounce</li>
              <li>Hover and click - subtle feedback</li>
              <li>Multi-select - combined haptics</li>
              <li>Drag nodes - see trail effects</li>
            </ul>
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

      <div style={{ height: 'calc(100% - 80px)' }}>
        <Epic1GraphEditorWithProvider
          initialNodes={initialNodes}
          initialEdges={initialEdges}
          showAssetLibrary={true}
          showPreview={false}
        />
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

      <div style={{
        position: 'absolute',
        bottom: 20,
        right: 20,
        display: 'flex',
        gap: 10
      }}>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          background: 'white',
          padding: '8px 12px',
          borderRadius: 4,
          border: '1px solid #ddd',
          fontSize: 13
        }}>
          <input
            type="checkbox"
            checked={hapticEnabled}
            onChange={(e) => setHapticEnabled(e.target.checked)}
          />
          Haptic Feedback
        </label>
      </div>
    </div>
  );
};