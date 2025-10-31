import React from 'react';
import { render, act, waitFor } from '@testing-library/react';
import { useMetadataExtraction } from '../../hooks/useMetadataExtraction';
import type { SegmentMetadata } from '../../services/llm/MetadataExtractor';

const mockExtract = jest.fn();
const mockExtractBatch = jest.fn();
const mockClearCache = jest.fn();

jest.mock('../../services/llm/MetadataExtractor', () => ({
  MetadataExtractor: jest.fn().mockImplementation(() => ({
    extract: mockExtract,
    extractBatch: mockExtractBatch,
    extractInBackground: jest.fn(),
    clearCache: mockClearCache,
    parseSearchQuery: jest.fn(),
    calculateRelevance: jest.fn()
  }))
}));

type HookRef = ReturnType<typeof useMetadataExtraction>;

const HookHarness: React.FC<{
  options?: Parameters<typeof useMetadataExtraction>[0];
  onReady: (ref: HookRef) => void;
}> = ({ options, onReady }) => {
  const ref = useMetadataExtraction(options);

  React.useEffect(() => {
    onReady(ref);
  }, [ref, onReady]);

  return null;
};

async function flushDebounce() {
  await act(async () => {
    jest.runOnlyPendingTimers();
    await Promise.resolve();
  });
}

function getHookRef(ref: { current: HookRef | null }): HookRef {
  const instance = ref.current;
  if (!instance) {
    throw new Error('Hook reference not initialized');
  }
  return instance;
}

describe('useMetadataExtraction', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockExtract.mockReset();
    mockExtractBatch.mockReset();
    mockClearCache.mockReset();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('debounces extraction and stores metadata', async () => {
    const onMetadataExtracted = jest.fn();
    const hookRef: { current: HookRef | null } = { current: null };

    const metadata: SegmentMetadata = {
      subject: 'hero',
      tags: ['hero', 'courage']
    };

    mockExtract.mockResolvedValue({
      metadata,
      extractionTime: 12,
      fromCache: false
    });

    render(
      <HookHarness
        options={{ debounceMs: 5, onMetadataExtracted }}
        onReady={ref => {
          hookRef.current = ref;
        }}
      />
    );

    await waitFor(() => expect(hookRef.current).not.toBeNull());

    await act(async () => {
      getHookRef(hookRef).extractMetadata('node-1', 'Hero enters the arena.');
    });

    await flushDebounce();

    expect(mockExtract).toHaveBeenCalledWith('Hero enters the arena.');
    expect(onMetadataExtracted).toHaveBeenCalledWith('node-1', metadata);
    expect(hookRef.current?.getNodeMetadata('node-1')).toEqual(metadata);
    expect(hookRef.current?.isExtracting('node-1')).toBe(false);
  });

  it('skips duplicate extractions within sixty seconds', async () => {
    const hookRef: { current: HookRef | null } = { current: null };

    mockExtract.mockResolvedValue({
      metadata: { tags: ['first'] },
      extractionTime: 5,
      fromCache: false
    });

    render(
      <HookHarness
        options={{ debounceMs: 5 }}
        onReady={ref => {
          hookRef.current = ref;
        }}
      />
    );

    await waitFor(() => expect(hookRef.current).not.toBeNull());

    await act(async () => {
      getHookRef(hookRef).extractMetadata('node-2', 'Repeat content.');
    });
    await flushDebounce();

    mockExtract.mockClear();

    await act(async () => {
      getHookRef(hookRef).extractMetadata('node-2', 'Repeat content.');
    });
    await flushDebounce();

    expect(mockExtract).not.toHaveBeenCalled();
  });

  it('recovers from extraction failures', async () => {
    const hookRef: { current: HookRef | null } = { current: null };

    mockExtract.mockRejectedValueOnce(new Error('offline'));

    render(
      <HookHarness
        options={{ debounceMs: 5 }}
        onReady={ref => {
          hookRef.current = ref;
        }}
      />
    );

    await waitFor(() => expect(hookRef.current).not.toBeNull());

    await act(async () => {
      getHookRef(hookRef).extractMetadata('node-3', 'Fails once.');
    });

    await flushDebounce();

    expect(hookRef.current?.isExtracting('node-3')).toBe(false);
    expect(hookRef.current?.getNodeMetadata('node-3')).toBeUndefined();
  });

  it('supports immediate extraction bypassing debounce', async () => {
    const hookRef: { current: HookRef | null } = { current: null };

    mockExtract.mockResolvedValue({
      metadata: { tags: ['quick'] },
      extractionTime: 2,
      fromCache: false
    });

    render(
      <HookHarness
        options={{ onMetadataExtracted: jest.fn() }}
        onReady={ref => {
          hookRef.current = ref;
        }}
      />
    );

    await waitFor(() => expect(hookRef.current).not.toBeNull());

    let result: SegmentMetadata | null = null;
    await act(async () => {
      result = await getHookRef(hookRef).extractNow('node-4', 'Immediate');
    });

    expect(result).toEqual({ tags: ['quick'] });
    await waitFor(() =>
      expect(hookRef.current?.getNodeMetadata('node-4')).toEqual({
        tags: ['quick']
      })
    );
  });

  it('handles batch extraction and clearing state', async () => {
    const hookRef: { current: HookRef | null } = { current: null };

    mockExtractBatch.mockResolvedValue([
      { metadata: { tags: ['first'] } },
      { metadata: { tags: ['second'] } }
    ]);

    render(
      <HookHarness
        options={{ enabled: true }}
        onReady={ref => {
          hookRef.current = ref;
        }}
      />
    );

    await waitFor(() => expect(hookRef.current).not.toBeNull());

    await act(async () => {
      await getHookRef(hookRef).extractBatch([
        { nodeId: 'a', text: 'First' },
        { nodeId: 'b', text: 'Second' }
      ]);
    });

    expect(hookRef.current?.getNodeMetadata('a')).toEqual({ tags: ['first'] });
    expect(hookRef.current?.getNodeMetadata('b')).toEqual({ tags: ['second'] });

    act(() => {
      getHookRef(hookRef).clearNodeMetadata('a');
    });
    expect(hookRef.current?.getNodeMetadata('a')).toBeUndefined();

    act(() => {
      getHookRef(hookRef).clearAll();
    });
    expect(mockClearCache).toHaveBeenCalled();
    expect(hookRef.current?.getNodeMetadata('b')).toBeUndefined();
  });
});
