import { renderHook, act } from '@testing-library/react';
import type { Node } from 'reactflow';

import { useAutoLayout } from '../../../../../../components/epic1/nodes/EnhancedBoundingBox/hooks/useAutoLayout';
import { PerformanceMonitor } from '../../../../../../utils/performance/PerformanceMonitor';

jest.mock('../../../../../../utils/performance/PerformanceMonitor', () => ({
  PerformanceMonitor: {
    getInstance: jest.fn(() => ({
      record: jest.fn()
    }))
  }
}));

const mockSetNodes = jest.fn<(updater: (nodes: Node[]) => Node[]) => void>();
const mockGetNodes = jest.fn<() => Node[]>();

jest.mock('reactflow', () => ({
  useReactFlow: () => ({
    getNodes: mockGetNodes,
    setNodes: mockSetNodes
  })
}));

describe('useAutoLayout', () => {
  const perfMonitorMock = {
    record: jest.fn()
  };

  let nodesState: Node[];
  const boundingBoxNode: Node = {
    id: 'box-1',
    type: 'enhancedBoundingBox',
    position: { x: 100, y: 200 },
    width: 400,
    height: 300,
    data: {}
  };
  const childNodes: Node[] = [
    {
      id: 'child-1',
      type: 'default',
      position: { x: 0, y: 0 },
      width: 120,
      height: 80,
      data: {}
    },
    {
      id: 'child-2',
      type: 'default',
      position: { x: 0, y: 0 },
      width: 120,
      height: 80,
      data: {}
    },
    {
      id: 'child-3',
      type: 'default',
      position: { x: 0, y: 0 },
      width: 120,
      height: 80,
      data: {}
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
    nodesState = [boundingBoxNode, ...childNodes.map(node => ({ ...node }))];
    mockSetNodes.mockImplementation(updater => {
      nodesState = updater(nodesState);
    });
    mockGetNodes.mockImplementation(() => nodesState);
    (PerformanceMonitor.getInstance as jest.Mock).mockReturnValue(
      perfMonitorMock
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('applies grid layout and clears transition styles after animation', () => {
    jest.useFakeTimers();

    const { result } = renderHook(() =>
      useAutoLayout('box-1', childNodes, true)
    );

    act(() => {
      result.current.applyLayout();
    });

    expect(result.current.isLayouting).toBe(true);
    expect(mockSetNodes).toHaveBeenCalled();

    const getChild = (id: string) =>
      nodesState.find(node => node.id === id) as Node;

    expect(getChild('child-1').position).toEqual({ x: 120, y: 260 });
    expect(getChild('child-2').position).toEqual({ x: 270, y: 260 });
    expect(getChild('child-3').position).toEqual({ x: 120, y: 370 });
    [1, 2, 3].forEach(i =>
      expect(getChild(`child-${i}`).style?.transition).toBe('all 0.3s ease-out')
    );

    expect(perfMonitorMock.record).toHaveBeenCalledWith(
      'boundingBox.autoLayout',
      expect.any(Number)
    );
    expect(perfMonitorMock.record).toHaveBeenCalledWith(
      'boundingBox.autoLayoutNodes',
      childNodes.length
    );

    act(() => {
      jest.advanceTimersByTime(300);
    });

    [1, 2, 3].forEach(i =>
      expect(getChild(`child-${i}`).style?.transition).toBeUndefined()
    );
    expect(result.current.isLayouting).toBe(false);
  });

  it('does nothing when auto layout is disabled or no contained nodes', () => {
    const { result: disabledResult } = renderHook(() =>
      useAutoLayout('box-1', childNodes, false)
    );
    act(() => {
      disabledResult.current.applyLayout();
    });
    expect(mockSetNodes).not.toHaveBeenCalled();

    mockSetNodes.mockClear();
    const { result: emptyResult } = renderHook(() =>
      useAutoLayout('box-1', [], true)
    );
    act(() => {
      emptyResult.current.applyLayout();
    });
    expect(mockSetNodes).not.toHaveBeenCalled();
  });
});
