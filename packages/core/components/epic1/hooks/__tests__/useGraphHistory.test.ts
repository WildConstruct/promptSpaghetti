import { renderHook, act } from '@testing-library/react';
import type { Edge, Node } from 'reactflow';
import { useGraphHistory } from '../useGraphHistory';

function n(id: string): Node {
  return { id, position: { x: 0, y: 0 }, data: {}, type: 'textBlock' };
}
const lastIds = (setNodes: jest.Mock) =>
  (setNodes.mock.calls.at(-1)?.[0] as Node[]).map(node => node.id);

describe('useGraphHistory', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  function setup() {
    const setNodes = jest.fn();
    const setEdges = jest.fn();
    const { result } = renderHook(() =>
      useGraphHistory([n('A')], [] as Edge[], setNodes, setEdges, {
        debounceMs: 100
      })
    );
    // Record the initial snapshot pushed by the mount effect.
    act(() => {
      jest.advanceTimersByTime(150);
    });
    // Drive subsequent snapshots directly (decoupled from React-Flow's nodes
    // prop) through the debounced pushSnapshot the auto-snapshot effect uses.
    const push = (nodes: Node[]) =>
      act(() => {
        result.current.pushSnapshot(nodes, []);
        jest.advanceTimersByTime(150);
      });
    const flush = () =>
      act(() => {
        jest.advanceTimersByTime(1);
      });
    return { result, setNodes, push, flush };
  }

  it('undo then redo navigate the snapshot stack (redo is not a no-op)', () => {
    const { result, setNodes, push, flush } = setup();
    expect(result.current.currentIndex).toBe(0);
    expect(result.current.canUndo).toBe(false);

    push([n('A'), n('B')]);
    push([n('A'), n('B'), n('C')]);
    expect(result.current.currentIndex).toBe(2);
    expect(result.current.canRedo).toBe(false);

    act(() => result.current.undo());
    flush();
    expect(result.current.currentIndex).toBe(1);
    expect(lastIds(setNodes)).toEqual(['A', 'B']);
    expect(result.current.canRedo).toBe(true);

    // Regression guard: redo must restore the next state, not no-op.
    act(() => result.current.redo());
    flush();
    expect(result.current.currentIndex).toBe(2);
    expect(lastIds(setNodes)).toEqual(['A', 'B', 'C']);
    expect(result.current.canRedo).toBe(false);
  });

  it('supports multi-step undo and redo', () => {
    const { result, setNodes, push, flush } = setup();
    push([n('A'), n('B')]);
    push([n('A'), n('B'), n('C')]);

    act(() => result.current.undo());
    flush();
    act(() => result.current.undo());
    flush();
    expect(result.current.currentIndex).toBe(0);
    expect(lastIds(setNodes)).toEqual(['A']);
    expect(result.current.canUndo).toBe(false);

    act(() => result.current.redo());
    flush();
    act(() => result.current.redo());
    flush();
    expect(result.current.currentIndex).toBe(2);
    expect(lastIds(setNodes)).toEqual(['A', 'B', 'C']);
  });

  it('exportHistory / importHistory round-trip for per-document stacks', () => {
    const { result, push, flush } = setup();
    push([n('A'), n('B')]);
    push([n('A'), n('B'), n('C')]);
    act(() => result.current.undo());
    flush();

    const snap = result.current.exportHistory();
    expect(snap.entries).toHaveLength(3);
    expect(snap.index).toBe(1);

    act(() => result.current.clearHistory());
    expect(result.current.historySize).toBe(0);

    act(() => result.current.importHistory(snap));
    expect(result.current.historySize).toBe(3);
    expect(result.current.currentIndex).toBe(1);
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(true);
  });

  it('suppressSnapshotsFor blocks debounced pushes', () => {
    const { result, push } = setup();
    act(() => result.current.suppressSnapshotsFor(10_000));
    push([n('A'), n('Z')]);
    // Still only the initial mount snapshot
    expect(result.current.historySize).toBe(1);
    expect(result.current.currentIndex).toBe(0);
  });

  it('truncates the redo stack when a new change follows an undo', () => {
    const { result, push, flush } = setup();
    push([n('A'), n('B')]);
    push([n('A'), n('B'), n('C')]);

    act(() => result.current.undo());
    flush();
    expect(result.current.canRedo).toBe(true);

    push([n('A'), n('B'), n('X')]); // diverge
    expect(result.current.canRedo).toBe(false);
    expect(result.current.currentIndex).toBe(2);
  });

  it('ignores a snapshot identical to the current entry', () => {
    const { result, push } = setup();
    push([n('A'), n('B')]);
    const idx = result.current.currentIndex;
    push([n('A'), n('B')]); // identical -> no new entry
    expect(result.current.currentIndex).toBe(idx);
  });
});
