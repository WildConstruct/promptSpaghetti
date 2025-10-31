import { renderHook, act } from '@testing-library/react';
import type { Node } from 'reactflow';

import { useGroupMovement } from '../../../../../../components/epic1/nodes/EnhancedBoundingBox/hooks/useGroupMovement';
import { PerformanceMonitor } from '../../../../../../utils/performance/PerformanceMonitor';

jest.mock('../../../../../../utils/performance/PerformanceMonitor', () => ({
  PerformanceMonitor: {
    getInstance: jest.fn(() => ({
      record: jest.fn()
    }))
  }
}));

const setNodesMock = jest.fn<(updater: (nodes: Node[]) => Node[]) => void>();

jest.mock('reactflow', () => ({
  useReactFlow: () => ({
    setNodes: setNodesMock
  })
}));

describe('useGroupMovement', () => {
  const perfMonitorMock = {
    record: jest.fn()
  };
  let nodesState: Node[];
  let containedNodes: Node[];
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    nodesState = [
      {
        id: 'child-1',
        type: 'default',
        position: { x: 100, y: 100 },
        data: {}
      },
      {
        id: 'child-2',
        type: 'default',
        position: { x: 150, y: 180 },
        data: {}
      },
      {
        id: 'outside',
        type: 'default',
        position: { x: 400, y: 400 },
        data: {}
      }
    ] as Node[];
    containedNodes = nodesState.slice(0, 2);

    setNodesMock.mockImplementation(updater => {
      nodesState = updater(nodesState);
    });
    (PerformanceMonitor.getInstance as jest.Mock).mockReturnValue(
      perfMonitorMock
    );
    consoleSpy = jest
      .spyOn(console, 'debug')
      .mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('moves contained nodes together while locked and dragging', async () => {
    const { result, rerender } = renderHook(
      ({ position, dragging, locked }) =>
        useGroupMovement(
          'box-1',
          locked,
          dragging,
          position,
          containedNodes
        ),
      {
        initialProps: {
          locked: true,
          dragging: false,
          position: { x: 0, y: 0 }
        }
      }
    );

    expect(result.current.isMoving).toBe(false);

    await act(async () => {
      rerender({
        locked: true,
        dragging: true,
        position: { x: 15, y: 10 }
      });
    });

    expect(setNodesMock).toHaveBeenCalledTimes(1);
    expect(nodesState[0].position).toEqual({ x: 115, y: 110 });
    expect(nodesState[1].position).toEqual({ x: 165, y: 190 });
    expect(nodesState[2].position).toEqual({ x: 400, y: 400 });
    expect(perfMonitorMock.record).toHaveBeenCalledWith(
      'boundingBox.groupMove',
      expect.any(Number)
    );
    expect(perfMonitorMock.record).toHaveBeenCalledWith(
      'boundingBox.nodesMovedCount',
      containedNodes.length
    );

    act(() => {
      result.current.handleGroupMove(5, -5);
    });

    expect(nodesState[0].position).toEqual({ x: 120, y: 105 });
    expect(nodesState[1].position).toEqual({ x: 170, y: 185 });
    expect(perfMonitorMock.record).toHaveBeenCalledWith(
      'boundingBox.manualGroupMove',
      expect.any(Number)
    );

    setNodesMock.mockClear();
    await act(async () => {
      rerender({
        locked: false,
        dragging: false,
        position: { x: 15, y: 10 }
      });
    });

    act(() => {
      result.current.handleGroupMove(10, 10);
    });
    expect(setNodesMock).not.toHaveBeenCalled();
  });
});
