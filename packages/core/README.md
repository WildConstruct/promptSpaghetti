# GraphEditor Component

A React component for editing and validating node graphs, built with [ReactFlow](https://reactflow.dev/). Implements edge drag, validation, and error UI as described in Story 2.2 of Epic 2 in the PRD.

## Features

- **Edge Drag:** Connect nodes by dragging from output to input handles.
- **Validation:** Customizable validation logic for edges; invalid edges are highlighted in red.
- **Error UI:** Status bar shows error count; hover to see error messages.
- **Pluggable:** Accepts initial nodes, edges, and a validation function as props.

## Usage

```tsx
import React from 'react';
import { GraphEditor } from './GraphEditor';

const nodes = [
  { id: '1', data: { label: 'A' }, position: { x: 0, y: 0 }, type: 'default' },
  { id: '2', data: { label: 'B' }, position: { x: 100, y: 0 }, type: 'default' },
];
const edges = [{ id: 'e1-2', source: '1', target: '2' }];

// Example validation: mark all edges as valid
const validateConnection = (edges, nodes) => [];

export default function App() {
  return <GraphEditor initialNodes={nodes} initialEdges={edges} validateConnection={validateConnection} />;
}
```

## Props

| Prop                 | Type                                                  | Description                           |
| -------------------- | ----------------------------------------------------- | ------------------------------------- |
| `initialNodes`       | `Node[]`                                              | Array of node objects                 |
| `initialEdges`       | `Edge[]`                                              | Array of edge objects                 |
| `validateConnection` | `(edges: Edge[], nodes: Node[]) => ValidationError[]` | Custom validation function (optional) |

### Types

- **Node**: `{ id: string, type: string, data: Record<string, unknown>, position: { x: number, y: number } }`
- **Edge**: `{ id: string, source: string, target: string, type?: string }`
- **ValidationError**: `{ edgeId: string, message: string }`

## Error UI

- Invalid edges are highlighted in red.
- Status bar at the bottom shows the number of errors (e.g., "1 error").
- Hovering over the error count displays error messages for each invalid edge.

## Testing

- Tests are provided in `__tests__/GraphEditor.test.tsx`.
- Run tests with `pnpm test --testPathPattern=packages/core/` from the project root.

## Requirements

- React 18+
- ReactFlow 11+

## License

MIT
