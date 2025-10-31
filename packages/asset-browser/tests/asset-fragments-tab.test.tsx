import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from './utils/renderWithProviders';
import { AssetFragmentsTab } from '../src/components/AssetFragmentsTab';
import { loadAssetFragments } from '../src/services/AssetFragmentLoader';

jest.mock('../src/services/AssetFragmentLoader', () => ({
  loadAssetFragments: jest.fn()
}));

const mockLoadAssetFragments =
  loadAssetFragments as jest.MockedFunction<typeof loadAssetFragments>;

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
});

  it('renders fragments and supports category/search filtering', async () => {
    mockLoadAssetFragments.mockResolvedValueOnce(manifest as any);
    const user = userEvent.setup();
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
    await user.type(
      screen.getByPlaceholderText('Search fragments...'),
      'contextual'
    );

    expect(
      await screen.findByText('Contextual Choice', { exact: false })
    ).toBeInTheDocument();
    expect(screen.queryByText('Simple Timer')).not.toBeInTheDocument();

    // Reset search and filter by category
    await user.clear(screen.getByPlaceholderText('Search fragments...'));
    await user.selectOptions(screen.getByRole('combobox'), 'utilities');

    expect(await screen.findByText('Simple Timer')).toBeInTheDocument();
    expect(screen.queryByText('Contextual Choice')).not.toBeInTheDocument();
  });

  it('shows loading then error UI with retry', async () => {
    mockLoadAssetFragments.mockRejectedValueOnce(
      new Error('Manifest unreachable')
    );
    mockLoadAssetFragments.mockResolvedValueOnce(manifest as any);

    const user = userEvent.setup();
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

    await user.click(screen.getByRole('button', { name: /retry/i }));
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
      screen.getByText(/No asset fragments found/i)
    ).toBeInTheDocument();
  });
});
