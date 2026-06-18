import { renderHook, act } from '@testing-library/react';
import type { Edge, Node } from 'reactflow';
import { useNodeOperations } from '../useNodeOperations';

function n(id: string, selected = false): Node {
  return {
    id,
    type: 'textBlock',
    position: { x: 0, y: 0 },
    data: {},
    selected
  };
}

function e(id: string, source: string, target: string): Edge {
  return { id, source, target };
}

describe('useNodeOperations.disconnectNodes', () => {
  function setup(nodes: Node[], edges: Edge[]) {
    let currentEdges = edges;
    const setEdges = jest.fn((updater: unknown) => {
      currentEdges =
        typeof updater === 'function'
          ? (updater as (eds: Edge[]) => Edge[])(currentEdges)
          : (updater as Edge[]);
    });
    const setNodes = jest.fn();
    const onEdgeDelete = jest.fn();
    const showToast = jest.fn();

    const { result } = renderHook(() =>
      useNodeOperations(nodes, edges, setNodes, setEdges, null, {
        onEdgeDelete,
        showToast
      })
    );

    return {
      result,
      getEdges: () => currentEdges,
      onEdgeDelete,
      showToast
    };
  }

  it('removes every edge touching the given node, keeping the rest', () => {
    // A->B, B->C, C->A. Disconnect A => drop AB and CA, keep BC.
    const nodes = [n('A'), n('B'), n('C')];
    const edges = [e('AB', 'A', 'B'), e('BC', 'B', 'C'), e('CA', 'C', 'A')];
    const { result, getEdges, onEdgeDelete } = setup(nodes, edges);

    act(() => {
      result.current.disconnectNodes(['A']);
    });

    expect(getEdges().map(x => x.id)).toEqual(['BC']);
    expect(onEdgeDelete).toHaveBeenCalledWith(
      expect.arrayContaining(['AB', 'CA'])
    );
  });

  it('falls back to the current selection when no ids are passed', () => {
    const nodes = [n('A', true), n('B'), n('C')];
    const edges = [e('AB', 'A', 'B'), e('BC', 'B', 'C')];
    const { result, getEdges } = setup(nodes, edges);

    act(() => {
      result.current.disconnectNodes();
    });

    expect(getEdges().map(x => x.id)).toEqual(['BC']);
  });

  it('does nothing and warns when there is no target', () => {
    const nodes = [n('A'), n('B')];
    const edges = [e('AB', 'A', 'B')];
    const { result, getEdges, showToast } = setup(nodes, edges);

    act(() => {
      result.current.disconnectNodes(); // nothing selected, no ids
    });

    expect(getEdges().map(x => x.id)).toEqual(['AB']);
    expect(showToast).toHaveBeenCalledWith(
      'info',
      'Select a node to disconnect'
    );
  });
});
