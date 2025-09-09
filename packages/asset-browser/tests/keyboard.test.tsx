import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AssetBrowser } from '../src/components/AssetBrowser';

function getActiveGridcell() {
  const cells = screen.queryAllByRole('gridcell');
  return cells.find(el => el.getAttribute('aria-selected') === 'true') || null;
}

describe('Keyboard navigation and drawer', () => {
  test('roving focus moves from sidebar to grid and within grid; Enter/Esc toggles drawer', async () => {
    render(<AssetBrowser />);

    // Ensure focus is within the AssetBrowser so KeyboardNavigatorProvider will handle key events
    const search = screen.getByLabelText('Search presets');
    search.focus();

    // Initially, focus is in sidebar index 0; move to grid with ArrowRight
    fireEvent.keyDown(window, { key: 'ArrowRight' });

    // Active grid cell should be index 0
    let active = getActiveGridcell();
    expect(active).toBeTruthy();
    expect(active?.getAttribute('data-grid-index')).toBe('0');

    // Move right within grid
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    active = getActiveGridcell();
    expect(active?.getAttribute('data-grid-index')).toBe('1');

    // Open drawer with Enter
    fireEvent.keyDown(window, { key: 'Enter' });
    const drawer = await screen.findByLabelText('Details Drawer');
    expect(drawer.getAttribute('aria-hidden')).toBe('false');

    // Close with Escape
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(drawer.getAttribute('aria-hidden')).toBe('true');
  });
});
