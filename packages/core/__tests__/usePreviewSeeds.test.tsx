import React from "react";
import { renderHook, act } from "@testing-library/react";
import { usePreviewSeeds } from "../usePreviewSeeds";

jest.useFakeTimers();

/**
 * Basic sanity tests for usePreviewSeeds hook:
 * 1. runPreview produces 5 result items when execution settles.
 * 2. Loading state toggles correctly.
 * 3. cancelPreview aborts early and results stay empty.
 */

describe("usePreviewSeeds", () => {
  it("returns 5 results for a stable graph", async () => {
    const { result } = renderHook(() => usePreviewSeeds());

    act(() => {
      result.current.runPreview({ nodes: [], edges: [] });
    });

    // pending => loading should be true
    expect(result.current.loading).toBe(true);

    // Fast-forward all timers (max delay 600ms) and flush promises
    act(() => {
      jest.advanceTimersByTime(700);
    });

    // wait for state update microtasks
    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.results.length).toBe(5);
    // Each result should have seed defined
    result.current.results.forEach((r) => {
      expect(r.seed).toBeDefined();
    });
  });

  it("cancelPreview aborts in-flight fetch", async () => {
    const { result } = renderHook(() => usePreviewSeeds());

    act(() => {
      result.current.runPreview({ nodes: [], edges: [] });
    });

    // Immediately cancel
    act(() => {
      result.current.cancelPreview();
    });

    // Advance timers – underlying promises will reject with AbortError
    act(() => {
      jest.advanceTimersByTime(700);
    });

    await act(async () => {
      await Promise.resolve();
    });

    // loading should be false and we expect 0 results because all were aborted
    expect(result.current.loading).toBe(false);
    expect(result.current.results.length).toBe(0);
  });
});
