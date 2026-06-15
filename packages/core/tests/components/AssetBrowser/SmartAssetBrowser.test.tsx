import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '../../utils/userEvent';
import { toggleCheckbox } from '../../utils/toggleCheckbox';
import { SmartAssetBrowser, type Asset } from '../../../components/AssetBrowser/SmartAssetBrowser';

const baseAssets: Asset[] = [
  {
    id: 'asset-1',
    name: 'Urban Streets',
    type: 'image',
    path: '/assets/urban.png',
    tags: ['urban', 'street'],
    metadata: {
      subject: 'city',
      tags: ['urban', 'movement']
    }
  },
  {
    id: 'asset-2',
    name: 'Medieval Castle',
    type: 'image',
    path: '/assets/castle.png',
    tags: ['castle', 'medieval'],
    metadata: {
      subject: 'castle',
      tags: ['stone']
    }
  }
];

describe('SmartAssetBrowser', () => {
  it('filters assets by text search when smart match disabled', async () => {
    render(
      <SmartAssetBrowser
        assets={baseAssets}
        onAssetSelect={jest.fn()}
      />
    );

    const searchInput = screen.getByPlaceholderText(
      /Search assets/
    ) as HTMLInputElement;

    await userEvent.type(searchInput, 'urban');

    expect(screen.getByText('Urban Streets')).toBeInTheDocument();
    expect(screen.queryByText('Medieval Castle')).not.toBeInTheDocument();
  });

  it('enables smart matching and shows relevance badge', async () => {
    const calculateRelevance = jest
      .fn()
      .mockImplementation((assetMetadata: Asset['metadata']) =>
        assetMetadata?.subject === 'city' ? 0.9 : 0
      );
    const metadataExtractor = {
      parseSearchQuery: jest.fn().mockReturnValue({ filters: {}, keywords: [] }),
      calculateRelevance,
      extractInBackground: jest.fn()
    };

    render(
      <SmartAssetBrowser
        assets={baseAssets}
        currentSegmentMetadata={{ subject: 'city', tags: ['urban'] }}
        onAssetSelect={jest.fn()}
        metadataExtractor={metadataExtractor as any}
      />
    );

    const smartMatchToggle = screen.getByLabelText('Smart Match');
    toggleCheckbox(smartMatchToggle);

    await waitFor(() => expect(calculateRelevance).toHaveBeenCalled());
    expect(await screen.findByText(/1 matches/)).toBeInTheDocument();
    expect(screen.getByText('Urban Streets')).toBeInTheDocument();
    expect(screen.queryByText('Medieval Castle')).not.toBeInTheDocument();
  });

  it('extracts metadata in background for assets missing metadata', async () => {
    const onAssetSelect = jest.fn();
    const extractInBackground = jest.fn();
    const metadataExtractor = {
      parseSearchQuery: jest.fn().mockReturnValue({ filters: {}, keywords: [] }),
      calculateRelevance: jest.fn().mockReturnValue(0.5),
      extractInBackground
    };

    const assets: Asset[] = [
      {
        id: 'asset-3',
        name: 'Lonely Road',
        type: 'image',
        path: '/assets/road.png',
        tags: ['road', 'lonely']
      },
      baseAssets[0]
    ];

    render(
      <SmartAssetBrowser
        assets={assets}
        currentSegmentMetadata={{ tags: ['road'] }}
        onAssetSelect={onAssetSelect}
        metadataExtractor={metadataExtractor as any}
      />
    );

    toggleCheckbox(screen.getByLabelText('Smart Match'));

    await waitFor(() =>
      expect(extractInBackground).toHaveBeenCalledWith('Lonely Road')
    );

    await userEvent.click(screen.getByText('Lonely Road'));
    expect(onAssetSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'asset-3' })
    );
    expect(screen.getByRole('heading', { name: 'Lonely Road' })).toBeInTheDocument();
  });
});
