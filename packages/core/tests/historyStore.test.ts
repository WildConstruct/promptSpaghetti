/**
 * @jest-environment jsdom
 */
import { act } from '@testing-library/react';
import { useHistoryStore } from '../stores/historyStore';

function snap(nc: number, ec: number) {
  return {
    nodes: Array.from({ length: nc }, (_, i) => ({ id: `n${i}` })),
    edges: Array.from({ length: ec }, (_, i) => ({ id: `e${i}` }))
  };
}

describe('useHistoryStore ring buffer', () => {
  beforeEach(() => {
    const { clear } = useHistoryStore.getState();
    clear();
  });

  it('pushes snapshots and caps at 50', () => {
    act(() => {
      for (let i = 0; i < 55; i++) {
        useHistoryStore.getState().push(snap(1, i));
      }
    });
    const { entries, index, capacity } = useHistoryStore.getState();
    expect(entries.length).toBe(capacity);
    expect(index).toBe(capacity - 1);
  });

  it('undo/redo navigates correctly', () => {
    act(() => {
      useHistoryStore.getState().push(snap(1, 1)); // 0
      useHistoryStore.getState().push(snap(2, 2)); // 1
      useHistoryStore.getState().push(snap(3, 3)); // 2
    });

    let st = useHistoryStore.getState();
    expect(st.index).toBe(2);
    const afterUndo1 = act(() => useHistoryStore.getState().undo());
    st = useHistoryStore.getState();
    expect(st.index).toBe(1);
    const afterUndo2 = act(() => useHistoryStore.getState().undo());
    st = useHistoryStore.getState();
    expect(st.index).toBe(0);
    const noMore = act(() => useHistoryStore.getState().undo());
    expect(useHistoryStore.getState().index).toBe(0);

    act(() => useHistoryStore.getState().redo());
    expect(useHistoryStore.getState().index).toBe(1);
    act(() => useHistoryStore.getState().redo());
    expect(useHistoryStore.getState().index).toBe(2);
    const noRedo = act(() => useHistoryStore.getState().redo());
    expect(useHistoryStore.getState().index).toBe(2);
  });

  it('select jumps to an index', () => {
    act(() => {
      useHistoryStore.getState().push(snap(1, 1)); // 0
      useHistoryStore.getState().push(snap(2, 2)); // 1
      useHistoryStore.getState().push(snap(3, 3)); // 2
    });
    act(() => useHistoryStore.getState().select(1));
    expect(useHistoryStore.getState().index).toBe(1);
  });

  it('push after undo truncates forward history', () => {
    act(() => {
      useHistoryStore.getState().push(snap(1, 1)); // 0
      useHistoryStore.getState().push(snap(2, 2)); // 1
      useHistoryStore.getState().push(snap(3, 3)); // 2
    });
    act(() => useHistoryStore.getState().undo()); // to 1
    expect(useHistoryStore.getState().index).toBe(1);
    act(() => useHistoryStore.getState().push(snap(9, 9))); // should drop previous index 2
    const st = useHistoryStore.getState();
    expect(st.index).toBe(2);
    expect(st.entries.length).toBe(3);
  });
});
