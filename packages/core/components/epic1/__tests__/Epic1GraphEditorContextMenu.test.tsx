import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { Epic1GraphEditor } from '../Epic1GraphEditor';

jest.mock('d3-force', () => ({
  forceCenter: jest.fn(() => ({})),
  forceCollide: jest.fn(() => ({})),
  forceLink: jest.fn(() => ({ id: jest.fn().mockReturnThis() })),
  forceManyBody: jest.fn(() => ({})),
  forceSimulation: jest.fn(() => ({
    force: jest.fn().mockReturnThis(),
    stop: jest.fn().mockReturnThis(),
    tick: jest.fn().mockReturnThis()
  }))
}));

jest.mock('../hooks/useAutoLayout', () => ({
  useAutoLayout: () => ({
    cleanupNodes: jest.fn(),
    cleanupSelection: jest.fn(),
    cleanupAll: jest.fn(),
    neatenSelection: jest.fn(),
    neatenAll: jest.fn(),
    layoutDroppedNodes: jest.fn((nodes: unknown[]) => nodes),
    isLayouting: false
  })
}));

jest.mock('../components/GraphModals', () => ({
  GraphModals: () => null
}));

jest.mock(
  '@prompt/asset-browser',
  () => ({
    AgentFragmentRetrievalService: {
      suggestFragmentsForSelection: jest.fn(async () => [])
    }
  }),
  { virtual: true }
);

const initialNodes = [
  {
    id: 'node-1',
    type: 'textBlock',
    position: { x: 100, y: 100 },
    data: { label: 'First node', nodeType: 'textBlock', text: 'First node' }
  },
  {
    id: 'node-2',
    type: 'textBlock',
    position: { x: 260, y: 100 },
    data: { label: 'Second node', nodeType: 'textBlock', text: 'Second node' }
  }
];

describe('Epic1GraphEditor context menu', () => {
  it('opens node layout actions from a node right-click', async () => {
    render(
      <Epic1GraphEditor
        initialNodes={initialNodes}
        initialEdges={[]}
        showPreview={false}
        showAssetLibrary={false}
      />
    );

    fireEvent.contextMenu(screen.getByTestId('node-node-1'), {
      clientX: 180,
      clientY: 200
    });

    expect(
      await screen.findByRole('menu', { name: 'Graph context menu' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Neaten Selection' })).toBeEnabled();
    expect(
      screen.getByRole('button', { name: 'Align Horizontal (2+ nodes)' })
    ).toBeDisabled();
  });

  it('opens canvas cleanup actions from a pane right-click', async () => {
    render(
      <Epic1GraphEditor
        initialNodes={initialNodes}
        initialEdges={[]}
        showPreview={false}
        showAssetLibrary={false}
      />
    );

    fireEvent.contextMenu(screen.getByTestId('react-flow-pane'), {
      clientX: 220,
      clientY: 240
    });

    expect(
      await screen.findByRole('menu', { name: 'Graph context menu' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Clean Up All' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Fit View' })).toBeEnabled();
  });
});
