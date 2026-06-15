import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '../../utils/userEvent';
import { MetadataAssetBridge } from '../../../components/AssetBrowser/MetadataAssetBridge';
import { useMetadataExtraction } from '../../../hooks/useMetadataExtraction';
import type { Asset } from '../../../components/AssetBrowser/SmartAssetBrowser';

jest.mock('../../../hooks/useMetadataExtraction', () => ({
  useMetadataExtraction: jest.fn()
}));

const mockUseMetadataExtraction = useMetadataExtraction as jest.MockedFunction<
  typeof useMetadataExtraction
>;

const baseAssets: Asset[] = [
  {
    id: 'asset-1',
    name: 'Hero Portrait',
    type: 'image',
    path: '/assets/hero.png',
    metadata: {
      subject: 'hero',
      tags: ['hero', 'portrait'],
      themes: [{ name: 'Courage', confidence: 0.9 }],
      entities: [{ name: 'Hero', type: 'character', confidence: 0.85 }],
      style: ['illustration', 'fantasy']
    }
  }
];

function setupHookReturn(overrides: Partial<Record<string, unknown>> = {}) {
  const extractMetadata = jest.fn();
  const getNodeMetadata = jest.fn().mockReturnValue(undefined);
  const isExtracting = jest.fn().mockReturnValue(false);

  mockUseMetadataExtraction.mockReturnValue({
    extractMetadata,
    getNodeMetadata,
    isExtracting,
    metadataState: {},
    parseSearchQuery: jest.fn(),
    calculateRelevance: jest.fn(),
    extractor: undefined,
    clearAll: jest.fn(),
    clearNodeMetadata: jest.fn(),
    extractBatch: jest.fn(),
    extractNow: jest.fn(),
    ...overrides
  });

  return {
    extractMetadata,
    getNodeMetadata,
    isExtracting,
    ...overrides
  };
}

describe('MetadataAssetBridge', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows extraction indicator when metadata is pending', async () => {
    const extractMetadata = jest.fn();
    const isExtracting = jest.fn().mockReturnValue(true);

    setupHookReturn({
      extractMetadata,
      isExtracting,
      getNodeMetadata: jest.fn().mockReturnValue(undefined)
    });

    render(
      <MetadataAssetBridge
        assets={baseAssets}
        onAssetSelect={jest.fn()}
        currentSegmentId="segment-1"
        currentSegmentContent="Brave hero enters the arena."
        llmService={{} as any}
      />
    );

    await waitFor(() => {
      expect(extractMetadata).toHaveBeenCalledWith(
        'segment-1',
        'Brave hero enters the arena.'
      );
    });

    expect(
      screen.getByTestId('metadata-extraction-indicator')
    ).toBeInTheDocument();
  });

  it('renders debug metadata panel in development mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    setupHookReturn({
      getNodeMetadata: jest.fn().mockReturnValue({
        subject: 'hero',
        tags: ['hero'],
        summary: 'A brave hero'
      }),
      isExtracting: jest.fn().mockReturnValue(false)
    });

    render(
      <MetadataAssetBridge
        assets={baseAssets}
        onAssetSelect={jest.fn()}
        currentSegmentId="segment-2"
        currentSegmentContent=""
      />
    );

    expect(
      screen.getByTestId('metadata-debug-info')
    ).toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it('passes metadata context when selecting an asset', async () => {
    const onAssetSelect = jest.fn();
    const consoleSpy = jest
      .spyOn(console, 'debug')
      .mockImplementation(() => undefined);

    setupHookReturn({
      getNodeMetadata: jest.fn().mockReturnValue({
        subject: 'hero',
        tags: ['hero'],
        themes: [{ name: 'Courage', confidence: 0.9 }],
        entities: [{ name: 'Hero', type: 'character', confidence: 0.85 }],
        style: ['Illustration', 'Fantasy']
      }),
      isExtracting: jest.fn().mockReturnValue(false)
    });

    render(
      <MetadataAssetBridge
        assets={baseAssets}
        onAssetSelect={onAssetSelect}
        currentSegmentId='segment-3'
        currentSegmentContent='A courageous hero stands tall.'
        llmService={{} as any}
      />
    );

    await act(async () => {
      await userEvent.click(screen.getByText('Hero Portrait'));
    });

    expect(onAssetSelect).toHaveBeenCalledWith(baseAssets[0]);
    expect(consoleSpy).toHaveBeenCalledWith(
      'Asset selected with metadata context:',
      expect.objectContaining({
        segmentId: 'segment-3',
        assetId: 'asset-1',
        metadata: expect.objectContaining({ subject: 'hero' })
      })
    );

    consoleSpy.mockRestore();
  });
});
