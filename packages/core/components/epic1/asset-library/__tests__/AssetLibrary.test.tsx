/**
 * Tests for Asset Library Component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '../../../../tests/utils/userEvent';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { AssetLibrary } from '../AssetLibrary';
import { medievalPresetCategories } from '../medievalPresets';

const DndWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <DndProvider backend={HTML5Backend}>{children}</DndProvider>
);

const requireElement = <T extends Element>(element: T | null, message: string): T => {
  if (!element) {
    throw new Error(message);
  }
  return element;
};

describe('AssetLibrary', () => {
  it('renders the asset library with default state', () => {
    render(
      <DndWrapper>
        <AssetLibrary />
      </DndWrapper>
    );

    expect(screen.getByText('Asset Library')).toBeInTheDocument();
    expect(screen.getByText('📚')).toBeInTheDocument();
  });

  it('toggles expanded/collapsed state', () => {
    render(
      <DndWrapper>
        <AssetLibrary />
      </DndWrapper>
    );

    const header = requireElement(
      screen.getByText('Asset Library').closest('.library-header'),
      'Expected library header to be present'
    );

    expect(screen.getByPlaceholderText('Search presets...')).toBeInTheDocument();

    fireEvent.click(header);
    expect(screen.queryByPlaceholderText('Search presets...')).not.toBeInTheDocument();

    fireEvent.click(header);
    expect(screen.getByPlaceholderText('Search presets...')).toBeInTheDocument();
  });

  it('displays all preset categories', () => {
    render(
      <DndWrapper>
        <AssetLibrary />
      </DndWrapper>
    );

    medievalPresetCategories.forEach(category => {
      expect(screen.getByText(category.name)).toBeInTheDocument();
    });
  });

  it('expands and collapses categories', () => {
    render(
      <DndWrapper>
        <AssetLibrary />
      </DndWrapper>
    );

    const categoryHeader = requireElement(
      screen.getByText('Character Occupations').closest('.category-header'),
      'Expected character category header to exist'
    );

    expect(screen.getByText('Merchant')).toBeInTheDocument();
    expect(screen.getByText('Knight')).toBeInTheDocument();

    fireEvent.click(categoryHeader);
    expect(screen.queryByText('Merchant')).not.toBeInTheDocument();

    fireEvent.click(categoryHeader);
    expect(screen.getByText('Merchant')).toBeInTheDocument();
  });

  it('filters presets based on search query', async () => {
    const user = userEvent.setup();
    render(
      <DndWrapper>
        <AssetLibrary />
      </DndWrapper>
    );

    const searchInput = screen.getByPlaceholderText('Search presets...');
    await user.type(searchInput, 'knight');

    expect(screen.getByText('Knight')).toBeInTheDocument();
    expect(screen.queryByText('Merchant')).not.toBeInTheDocument();
    expect(screen.queryByText('Peasant')).not.toBeInTheDocument();
  });

  it('shows preset preview on hover', async () => {
    const user = userEvent.setup();
    render(
      <DndWrapper>
        <AssetLibrary />
      </DndWrapper>
    );

    const merchantPreset = requireElement(
      screen.getByText('Merchant').closest('.preset-item'),
      'Expected Merchant preset item'
    );

    await user.hover(merchantPreset);

    await waitFor(() => {
      expect(screen.getByText('A trader of goods and wares')).toBeInTheDocument();
    });

    await user.unhover(merchantPreset);

    await waitFor(() => {
      expect(screen.queryByText('A trader of goods and wares')).not.toBeInTheDocument();
    });
  });

  it('displays preset type badges', () => {
    render(
      <DndWrapper>
        <AssetLibrary />
      </DndWrapper>
    );

    const merchantPreset = requireElement(
      screen.getByText('Merchant').closest('.preset-item'),
      'Expected Merchant preset item'
    );
    expect(merchantPreset).toHaveTextContent('textBlock');

    const randomOccupation = requireElement(
      screen.getByText('Random Occupation').closest('.preset-item'),
      'Expected Random Occupation preset item'
    );
    expect(randomOccupation).toHaveTextContent('weightedChoice');
  });

  it('shows total preset count', () => {
    render(
      <DndWrapper>
        <AssetLibrary />
      </DndWrapper>
    );

    const total = medievalPresetCategories.reduce(
      (sum, category) => sum + category.presets.length,
      0
    );
    expect(screen.getByText(String(total))).toBeInTheDocument();
  });
});
