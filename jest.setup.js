require('@testing-library/jest-dom');
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock reactflow components for JSDOM tests
jest.mock('reactflow', () => {
  const React = require('react');
  return {
    __esModule: true,
    ReactFlowProvider: (props) => React.createElement('div', null, props.children),
    ReactFlow: (props) => {
      const { children, onDrop, onDragOver, nodes = [], onNodeClick } = props;
      return React.createElement(
        'div',
        { 'data-testid': 'react-flow-canvas', onDrop, onDragOver },
        [
          ...(Array.isArray(nodes) ? nodes.map((n) => React.createElement('div', {
            key: n.id,
            'data-testid': `node-${n.id}`,
            onClick: (e) => onNodeClick && onNodeClick(e, n)
          }, n.data?.label || n.id)) : []),
          children,
        ]
      );
    },
    Handle: () => null,
    Position: {},
    Background: () => null,
    Controls: () => null,
    MiniMap: () => null,
    Panel: () => null,
    useNodesState: () => [[], () => {}, () => {}],
    useEdgesState: () => [[], () => {}, () => {}],
  };
});

// Lightweight stub for @testing-library/user-event to satisfy tests without external package
jest.mock('@testing-library/user-event', () => ({
  __esModule: true,
  default: {
    click: async (el) => el.dispatchEvent(new MouseEvent('click', { bubbles: true })),
    type: async (el, text) => {
      el.value = (el.value || '') + text;
      el.dispatchEvent(new Event('input', { bubbles: true }));
    },
    clear: async (el) => {
      el.value = '';
      el.dispatchEvent(new Event('input', { bubbles: true }));
    },
  },
}), { virtual: true });

// Mock URL.createObjectURL / revokeObjectURL to silence JSDOM navigation warnings
if (!global.URL.createObjectURL) {
  global.URL.createObjectURL = () => 'blob:mock-url';
  global.URL.revokeObjectURL = () => {};
}
