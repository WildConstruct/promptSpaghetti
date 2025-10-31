// Integration test for Asset Browser ↔ Metadata connection
// Tests the MetadataAssetBridge component integration

import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { MetadataAssetBridge } from '../../components/AssetBrowser/MetadataAssetBridge';
import { Asset } from '../../components/AssetBrowser/SmartAssetBrowser';

describe('Asset Browser ↔ Metadata Integration', () => {
  const mockAssets: Asset[] = [
    {
      id: 'asset-1',
      name: 'Fantasy Character',
      type: 'fragment',
      path: '/assets/fantasy-char.psg',
      metadata: {
        themes: [{ name: 'Fantasy', confidence: 0.9 }],
        entities: [{ name: 'Warrior', type: 'character', confidence: 0.8 }],
        style: ['medieval', 'heroic']
      }
    }
  ];

  afterEach(() => {
    cleanup();
  });

  it('should render without crashing', () => {
    const handleAssetSelect = jest.fn();

    render(
      <MetadataAssetBridge
        assets={mockAssets}
        onAssetSelect={handleAssetSelect}
      />
    );

    expect(screen.getByTestId('smart-asset-browser')).toBeInTheDocument();
  });

  it('should render with LLM service without crashing', () => {
    const handleAssetSelect = jest.fn();
    const mockLLMService = {
      complete: jest.fn(),
      extractMetadata: jest.fn().mockResolvedValue({}),
      metadata: jest.fn(),
      isReady: jest.fn().mockReturnValue(true)
    } as any;

    render(
      <MetadataAssetBridge
        assets={mockAssets}
        onAssetSelect={handleAssetSelect}
        currentSegmentId="test-segment"
        currentSegmentContent="Test content"
        llmService={mockLLMService}
        debounceMs={0}
      />
    );

    // Just check it renders - don't wait for anything
    expect(screen.getByTestId('smart-asset-browser')).toBeInTheDocument();
  });
});
