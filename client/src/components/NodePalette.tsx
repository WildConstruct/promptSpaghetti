import React from 'react';
import './NodePalette.css';

const NODE_TYPES = [
  'WeightedChoice',
  'Concat',
  'Output',
  'Include',
  'SetVariable',
  'GetVariable',
];

function onDragStart(event: React.DragEvent, nodeType: string) {
  event.dataTransfer.setData('application/reactflow', nodeType);
  event.dataTransfer.effectAllowed = 'move';
}

export default function NodePalette() {
  return (
    <aside className="node-palette">
      <h4>Node Library</h4>
      {NODE_TYPES.map((type) => (
        <button
          key={type}
          className="palette-item"
          onDragStart={(event) => onDragStart(event, type)}
          draggable
          title={type}
          role="button"
          tabIndex={0}
          aria-label={`Add ${type} node`}
          style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: 0 }}
        >
          {type}
        </button>
      ))}
    </aside>
  );
}
