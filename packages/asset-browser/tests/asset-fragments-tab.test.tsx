import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from './utils/renderWithProviders';
import { AssetFragmentsTab } from '../src/components/AssetFragmentsTab';
import {
  loadAssetFragments,
  loadUserAssetFragments
} from '../src/services/AssetFragmentLoader';

jest.mock('../src/services/AssetFragmentLoader', () => ({
  loadAssetFragments: jest.fn(),
  loadUserAssetFragments: jest.fn()
}));

const mockLoadAssetFragments =
  loadAssetFragments as jest.MockedFunction<typeof loadAssetFragments>;
const mockLoadUserAssetFragments =
  loadUserAssetFragments as jest.MockedFunction<typeof loadUserAssetFragments>;

const manifest = {
  categories: {
    utilities: {
      name: 'Utilities',
      icon: '🛠',
      path: '/fragments/utilities/',
      fragments: [
        {
          id: 'util-1',
          name: 'Simple Timer',
          type: 'SIMPLE',
          file: 'timer.psg',
          nodes: 5
        }
      ]
    },
    narrative: {
      name: 'Narrative',
      icon: '📖',
      path: '/fragments/narrative/',
      fragments: [
        {
          id: 'nar-1',
          name: 'Contextual Choice',
          type: 'CONTEXTUAL',
          file: 'choice.psg',
          nodes: 12,
          options: 3
        }
      ]
    }
  },
  statistics: {
    total_fragments: 2,
    total_nodes: 17,
    total_options: 3
  }
};

describe('AssetFragmentsTab', () => {
beforeEach(() => {
  jest.resetAllMocks();
  document.cookie = 'psg_user_documents_folder=; Max-Age=0; path=/';
  mockLoadUserAssetFragments.mockResolvedValue([]);
});

  it('renders fragments and supports category/search filtering', async () => {
    mockLoadAssetFragments.mockResolvedValueOnce(manifest as any);
    renderWithProviders(<AssetFragmentsTab />);
    expect(
      screen.getByText('Loading asset fragments...')
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(mockLoadAssetFragments).toHaveBeenCalledTimes(1)
    );

    expect(
      await screen.findByText('Asset Fragments', { selector: 'h3' })
    ).toBeInTheDocument();

    // Search narrows to contextual fragment
    fireEvent.change(screen.getByPlaceholderText('Search fragments...'), {
      target: { value: 'contextual' }
    });

    expect(
      await screen.findByText('Contextual Choice', { exact: false })
    ).toBeInTheDocument();
    expect(screen.queryByText('Simple Timer')).not.toBeInTheDocument();

    // Reset search and filter by category
    fireEvent.change(screen.getByPlaceholderText('Search fragments...'), {
      target: { value: '' }
    });
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'utilities' }
    });

    expect(await screen.findByText('Simple Timer')).toBeInTheDocument();
    expect(screen.queryByText('Contextual Choice')).not.toBeInTheDocument();
  });

  it('shows loading then error UI with retry', async () => {
    mockLoadAssetFragments.mockRejectedValueOnce(
      new Error('Manifest unreachable')
    );
    mockLoadAssetFragments.mockResolvedValueOnce(manifest as any);

    renderWithProviders(<AssetFragmentsTab />);
    expect(
      screen.getByText('Loading asset fragments...')
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(mockLoadAssetFragments).toHaveBeenCalledTimes(1)
    );

    expect(
      await screen.findByText('Manifest unreachable')
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /retry/i }));
    await waitFor(() =>
      expect(mockLoadAssetFragments).toHaveBeenCalledTimes(2)
    );
  });

  it('renders empty state when manifest has no fragments', async () => {
    mockLoadAssetFragments.mockResolvedValueOnce({
      categories: {},
      statistics: {
        total_fragments: 0,
        total_nodes: 0,
      total_options: 0
      }
    } as any);
    renderWithProviders(<AssetFragmentsTab />);
    await waitFor(() =>
      expect(mockLoadAssetFragments).toHaveBeenCalledTimes(1)
    );

    expect(
      await screen.findByText('No Asset Fragments')
    ).toBeInTheDocument();
    expect(
      screen.getByText(/No asset fragments are available/i)
    ).toBeInTheDocument();
  });

  it('adds saved local fragments under a User Fragments category', async () => {
    document.cookie =
      'psg_user_documents_folder=C%3A%2FUsers%2Fexample%2FDocuments%2FPSG; path=/';
    mockLoadAssetFragments.mockResolvedValueOnce(manifest as any);
    mockLoadUserAssetFragments.mockResolvedValueOnce([
      {
        id: 'user-family-dna',
        name: 'Family DNA',
        type: 'MULTI-ASPECT',
        file: 'family-dna.psg',
        nodes: 2,
        region: 'User Fragments',
        collapsible: true,
        content: '{"name":"Family DNA"}'
      }
    ] as any);

    renderWithProviders(<AssetFragmentsTab />);

    expect(await screen.findByText('Family DNA')).toBeInTheDocument();
    expect(mockLoadUserAssetFragments).toHaveBeenCalledWith(
      'C:/Users/example/Documents/PSG'
    );

    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'user' }
    });

    expect(await screen.findByText('Family DNA')).toBeInTheDocument();
    expect(screen.queryByText('Simple Timer')).not.toBeInTheDocument();
  });
});
