import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act
} from '@testing-library/react';
import '@testing-library/jest-dom';
import { AssetBrowser } from '../src/components/AssetBrowser';
import { useAssetBrowserStore } from '../src/stores/assetBrowserStore';

const minimal = { presets: [] };

describe('Scan UI states', () => {
  test('shows empty state when scan done with no presets', async () => {
    render(<AssetBrowser />);
    await act(async () => {
      await useAssetBrowserStore.getState().scan([minimal]);
    });

    await waitFor(() => {
      const statuses = screen.getAllByRole('status');
      expect(
        statuses.some(s => /No presets found/i.test(s.textContent || ''))
      ).toBe(true);
    });
  });

  test('shows error state on scan error', async () => {
    render(<AssetBrowser />);
    const bad = { presets: [{ path: './missing.psglib' }] } as any;
    await act(async () => {
      await useAssetBrowserStore.getState().scan([bad]);
    });

    await waitFor(() => {
      const alerts = screen.getAllByRole('alert');
      expect(
        alerts.some(a => /Failed to scan libraries/i.test(a.textContent || ''))
      ).toBe(true);
    });
  });

  test('tag filtering works after scan', async () => {
    render(<AssetBrowser />);
    const ok = {
      presets: [
        { id: 'a', path: 'a.psglib', tags: ['x'] },
        { id: 'b', path: 'b.psglib', tags: ['y'] }
      ]
    };
    await act(async () => {
      await useAssetBrowserStore.getState().scan([ok]);
    });

    // Click tag 'x' in Sidebar to filter
    const tagBtn = await screen.findByRole('button', { name: /x/i });
    fireEvent.click(tagBtn);

    // Only preset with tag x should be visible in grid
    const grid = await screen.findByLabelText('Preset Grid');
    expect(grid).toBeInTheDocument();
    // We expect the other item to be filtered out; assert by absence of its name in cards
    const missing = screen.queryByText(/b/i);
    expect(missing).toBeNull();
  });
});
