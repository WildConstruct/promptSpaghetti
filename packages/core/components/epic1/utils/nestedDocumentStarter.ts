/**
 * Default child graph for a newly authored nested PSG composition.
 * Minimal Text → Output so preview and SubPSG return something immediately.
 */
import type { Edge, Node } from 'reactflow';
import type { EditableNodeData } from '../nodes';

export function buildNestedDocumentStarter(
  compositionName = 'New Composition'
): {
  nodes: Node<EditableNodeData>[];
  edges: Edge[];
} {
  const stamp = Date.now().toString(36);
  const textId = `nested-text-${stamp}`;
  const outId = `nested-out-${stamp}`;
  const edgeId = `nested-e-${stamp}`;

  const nodes: Node<EditableNodeData>[] = [
    {
      id: textId,
      type: 'textBlock',
      position: { x: 140, y: 120 },
      data: {
        nodeType: 'textBlock',
        label: 'Content',
        text: `${compositionName} content`,
        value: `${compositionName} content`,
        content: `${compositionName} content`
      }
    },
    {
      id: outId,
      type: 'output',
      position: { x: 520, y: 120 },
      data: {
        nodeType: 'output',
        label: 'Output',
        outputName: 'nested_output'
      }
    }
  ];

  const edges: Edge[] = [
    {
      id: edgeId,
      source: textId,
      target: outId,
      sourceHandle: 'source',
      targetHandle: 'target',
      type: 'smoothstep'
    }
  ];

  return { nodes, edges };
}
