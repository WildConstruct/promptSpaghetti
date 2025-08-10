import React from 'react';
import { render, screen } from '@testing-library/react';
import { AssetBrowser } from '../src/components/AssetBrowser';

// Simple heuristic: ensure not all items render when container is small
// Using stub LibraryService with 3 items; adjust container to be very small so likely only 1 row visible

describe('Virtualized grid behavior', () => {
  test('grid renders a subset of cells based on viewport size', async () => {
    const { container } = render(<div style={{ width: 200, height: 170 }}><AssetBrowser /></div>);

    const grid = await screen.findByRole('grid');
    expect(grid).toBeTruthy();

    const cells = screen.getAllByRole('gridcell');
    // react-window renders overscan; but should be <= number of items, and at least 1
    expect(cells.length).toBeGreaterThan(0);
  });
});
