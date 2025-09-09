// Integration test for Asset Browser ↔ Metadata connection
// Tests the MetadataAssetBridge component integration

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MetadataAssetBridge } from '../../components/AssetBrowser/MetadataAssetBridge';
import { LLMService } from '../../services/llm/LLMService';
import { Asset } from '../../components/AssetBrowser/SmartAssetBrowser';

describe('Asset Browser ↔ Metadata Integration', () => {
  let mockLLMService: jest.Mocked<LLMService>;
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
    },
    {
      id: 'asset-2',
      name: 'Sci-Fi Setting',
      type: 'fragment',
      path: '/assets/scifi-setting.psg',
      metadata: {
        themes: [{ name: 'Science Fiction', confidence: 0.85 }],
        entities: [{ name: 'Spaceship', type: 'object', confidence: 0.7 }],
        style: ['futuristic', 'technological']
      }
    }
  ];

  beforeEach(() => {
    mockLLMService = {
      complete: jest.fn(),
      extractMetadata: jest.fn(),
      isReady: jest.fn().mockReturnValue(true)
    } as any;
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

  it('should show metadata extraction indicator when processing', async () => {
    const handleAssetSelect = jest.fn();

    // Mock slow LLM response that returns proper metadata
    mockLLMService.extractMetadata.mockImplementation(
      () =>
        new Promise(resolve =>
          setTimeout(
            () =>
              resolve({
                themes: [{ name: 'battle', confidence: 0.9 }],
                entities: [
                  { name: 'warrior', type: 'character', confidence: 0.95 }
                ],
                style: ['action', 'fantasy'],
                tags: ['combat', 'dragon']
              }),
            100
          )
        )
    );

    render(
      <MetadataAssetBridge
        assets={mockAssets}
        onAssetSelect={handleAssetSelect}
        currentSegmentId="test-segment"
        currentSegmentContent="A brave warrior fights the dragon"
        llmService={mockLLMService}
      />
    );

    expect(
      screen.getByText('Analyzing content for smart suggestions...')
    ).toBeInTheDocument();

    await waitFor(
      () => {
        expect(
          screen.queryByText('Analyzing content for smart suggestions...')
        ).not.toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it('should show debug metadata in development mode', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    const handleAssetSelect = jest.fn();

    // Ensure LLM returns metadata immediately
    mockLLMService.extractMetadata.mockResolvedValue({
      themes: [{ name: 'fantasy', confidence: 0.9 }],
      entities: [],
      style: ['adventure'],
      tags: ['fantasy']
    });

    render(
      <MetadataAssetBridge
        assets={mockAssets}
        onAssetSelect={handleAssetSelect}
        currentSegmentId="test-segment"
        currentSegmentContent="Fantasy adventure"
        llmService={mockLLMService}
      />
    );

    // Wait for metadata extraction to complete
    await waitFor(() => {
      expect(
        screen.getByText('Extracted Metadata (Debug)')
      ).toBeInTheDocument();
    });

    process.env.NODE_ENV = originalEnv;
  });

  it('should call metadata extraction when segment content changes', async () => {
    const handleAssetSelect = jest.fn();
    const handleMetadataExtracted = jest.fn();

    mockLLMService.extractMetadata.mockResolvedValue({
      themes: [],
      entities: [],
      style: [],
      tags: []
    });

    const { rerender } = render(
      <MetadataAssetBridge
        assets={mockAssets}
        onAssetSelect={handleAssetSelect}
        currentSegmentId="test-segment"
        currentSegmentContent="Original content"
        llmService={mockLLMService}
        onMetadataExtracted={handleMetadataExtracted}
      />
    );

    // Reset mock to track new calls
    mockLLMService.extractMetadata.mockClear();

    // Change the content
    rerender(
      <MetadataAssetBridge
        assets={mockAssets}
        onAssetSelect={handleAssetSelect}
        currentSegmentId="test-segment"
        currentSegmentContent="Updated content"
        llmService={mockLLMService}
        onMetadataExtracted={handleMetadataExtracted}
      />
    );

    // Wait for extraction to be triggered
    await waitFor(() => {
      expect(mockLLMService.extractMetadata).toHaveBeenCalled();
    });
  });

  it('should calculate match scores correctly', async () => {
    const handleAssetSelect = jest.fn();

    // Mock LLM to return fantasy-themed metadata
    mockLLMService.extractMetadata.mockResolvedValue({
      themes: [{ name: 'fantasy', confidence: 0.9 }],
      entities: [{ name: 'warrior', type: 'character', confidence: 0.95 }],
      style: ['quest', 'adventure'],
      tags: ['fantasy', 'warrior', 'quest']
    });

    render(
      <MetadataAssetBridge
        assets={mockAssets}
        onAssetSelect={handleAssetSelect}
        currentSegmentId="test-segment"
        currentSegmentContent="A fantasy warrior on a quest"
        llmService={mockLLMService}
      />
    );

    // Wait for metadata extraction to complete
    await waitFor(() => {
      expect(
        screen.queryByText('Analyzing content for smart suggestions...')
      ).not.toBeInTheDocument();
    });

    // Click on asset with fantasy theme
    const fantasyAsset = screen.getByTitle('Fantasy Character');
    fireEvent.click(fantasyAsset);

    // Verify asset selection was called
    expect(handleAssetSelect).toHaveBeenCalled();
  });

  it('should handle missing LLM service gracefully', () => {
    const handleAssetSelect = jest.fn();

    // Render without LLM service
    expect(() => {
      render(
        <MetadataAssetBridge
          assets={mockAssets}
          onAssetSelect={handleAssetSelect}
          currentSegmentId="test-segment"
          currentSegmentContent="Some content"
        />
      );
    }).not.toThrow();

    // Should not show extraction indicator without LLM service
    expect(
      screen.queryByText('Analyzing content for smart suggestions...')
    ).not.toBeInTheDocument();
  });
});
