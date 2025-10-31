import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AssetBrowser } from '../src/components/AssetBrowser';

function openDrawer() {
  // Move focus to grid and open with Enter
  // Ensure focus is within the AssetBrowser so KeyboardNavigatorProvider will handle key events
  const search = screen.getByLabelText('Search presets');
  search.focus();
  fireEvent.keyDown(window, { key: 'ArrowRight' });
  fireEvent.keyDown(window, { key: 'Enter' });
}

describe('Details Drawer previews', () => {
  test('simulate button triggers loading and shows results', async () => {
    render(<AssetBrowser />);
    openDrawer();

    const drawer = await screen.findByLabelText('Details Drawer');
    expect(drawer).toHaveAttribute('aria-hidden', 'false');

    const simulateBtn = await screen.findByRole('button', {
      name: /simulate/i
    });
    fireEvent.click(simulateBtn);

    // Expect results to appear (we render 3 seeds)
    const samples = await screen.findAllByText(/Sample for/i);
    expect(samples.length).toBeGreaterThanOrEqual(1);
  });

  test('branch viz toggle shows svg', async () => {
    render(<AssetBrowser />);
    openDrawer();

    const toggleBtn = await screen.findByRole('button', {
      name: /toggle branch visualization/i
    });
    fireEvent.click(toggleBtn);

    // SVG aria-label Branch visualization should appear
    const svg = await screen.findByRole('img', {
      name: /branch visualization/i
    });
    expect(svg).toBeInTheDocument();
  });
});
