/**
 * Shared node-creation helpers for the Epic 1 editor.
 *
 * Consolidates logic that previously lived as divergent copies inside
 * useNodeOperations and useGraphDragDrop (see forensic cleanup ledger).
 */

/**
 * Default `data` payload for a freshly created node of the given type.
 * Superset of the two former copies — also covers set/getVariable and the
 * enhancedBoundingBox region container.
 */
export function getDefaultNodeData(type: string): Record<string, unknown> {
  switch (type) {
    case 'textBlock':
      return { text: 'New text block', variations: [] };
    case 'weightedChoice':
      return {
        options: [
          { id: 'option-1', text: 'Option 1', weight: 1, hasBranch: false }
        ]
      };
    case 'concat':
      return { separator: ' ' };
    case 'output':
      return { label: 'Output' };
    case 'variable':
    case 'setVariable':
    case 'getVariable':
      return { variableName: 'myVariable', value: '' };
    case 'enhancedBoundingBox':
      return {
        title: 'Region',
        description: '',
        backgroundColor: '#1a202c',
        opacity: 0.1,
        borderColor: '#22d3ee',
        borderStyle: 'solid',
        borderWidth: 2,
        locked: false,
        isCollapsed: false,
        width: 400,
        height: 300
      };
    default:
      return {};
  }
}

/**
 * Generate a unique node id. Pass a type to prefix it (e.g. `weightedChoice-…`);
 * otherwise the id is prefixed with `node-`. Multiple entropy sources keep ids
 * unique even when created in a tight loop.
 */
export function createNodeId(type?: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 11);
  const counter = Math.floor(Math.random() * 10000);
  return `${type ?? 'node'}-${timestamp}-${random}-${counter}`;
}
