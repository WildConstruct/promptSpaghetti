/**
 * Tests for Asset Library Component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { AssetLibrary } from '../AssetLibrary';
import { medievalPresetCategories } from '../medievalPresets';

// Wrapper component for DnD context
const DndWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <DndProvider backend={HTML5Backend}>
    {children}
  </DndProvider>
);

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

    const header = screen.getByText('Asset Library').closest('.library-header');
    expect(header).toBeInTheDocument();

    // Should be expanded by default
    expect(screen.getByPlaceholderText('Search presets...')).toBeInTheDocument();

    // Click to collapse
    fireEvent.click(header!);
    expect(screen.queryByPlaceholderText('Search presets...')).not.toBeInTheDocument();

    // Click to expand again
    fireEvent.click(header!);
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

    const categoryHeader = screen.getByText('Character Occupations').closest('.category-header');
    expect(categoryHeader).toBeInTheDocument();

    // Should show presets in expanded category
    expect(screen.getByText('Merchant')).toBeInTheDocument();
    expect(screen.getByText('Knight')).toBeInTheDocument();

    // Click to collapse
    fireEvent.click(categoryHeader!);
    expect(screen.queryByText('Merchant')).not.toBeInTheDocument();

    // Click to expand again
    fireEvent.click(categoryHeader!);
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

    // Type search query
    await user.type(searchInput, 'knight');

    // Should show matching preset
    expect(screen.getByText('Knight')).toBeInTheDocument();
    
    // Should hide non-matching presets
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

    const merchantPreset = screen.getByText('Merchant').closest('.preset-item');
    expect(merchantPreset).toBeInTheDocument();

    // Hover over preset
    await user.hover(merchantPreset!);

    // Should show preview
    await waitFor(() => {
      expect(screen.getByText('A trader of goods and wares')).toBeInTheDocument();
    });

    // Unhover
    await user.unhover(merchantPreset!);

    // Preview should disappear
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

    // Check for textBlock type
    const merchantPreset = screen.getByText('Merchant').closest('.preset-item');
    expect(merchantPreset).toHaveTextContent('textBlock');

    // Check for weightedChoice type
    const randomOccupation = screen.getByText('Random Occupation').closest('.preset-item');
    expect(randomOccupation).toHaveTextContent('weightedChoice');
  });

  it('shows total preset count', () => {
    render(
      <DndWrapper>
        <AssetLibrary />
      </DndWrapper>
    );

    const totalCount = medievalPresetCategories.reduce((sum, cat) => sum + cat.presets.length, 0);
    expect(screen.getByText(totalCount.toString())).toBeInTheDocument();
  });

  it('shows category preset counts', () => {
    render(
      <DndWrapper>
        <AssetLibrary />
      </DndWrapper>
    );

    medievalPresetCategories.forEach(category => {
      const categoryElement = screen.getByText(category.name).closest('.category-section');
      expect(categoryElement).toHaveTextContent(category.presets.length.toString());
    });
  });

  it('supports position prop', () => {
    const { rerender } = render(
      <DndWrapper>
        <AssetLibrary position="left" />
      </DndWrapper>
    );

    let libraryElement = screen.getByText('Asset Library').closest('.asset-library');
    expect(libraryElement).toHaveClass('left');

    rerender(
      <DndWrapper>
        <AssetLibrary position="right" />
      </DndWrapper>
    );

    libraryElement = screen.getByText('Asset Library').closest('.asset-library');
    expect(libraryElement).toHaveClass('right');
  });

  it('searches by tags', async () => {
    const user = userEvent.setup();
    render(
      <DndWrapper>
        <AssetLibrary />
      </DndWrapper>
    );

    const searchInput = screen.getByPlaceholderText('Search presets...');

    // Search by tag
    await user.type(searchInput, 'warrior');

    // Should show knight (has 'warrior' tag)
    expect(screen.getByText('Knight')).toBeInTheDocument();
    
    // Should hide others
    expect(screen.queryByText('Merchant')).not.toBeInTheDocument();
  });

  it('handles empty search results gracefully', async () => {
    const user = userEvent.setup();
    render(
      <DndWrapper>
        <AssetLibrary />
      </DndWrapper>
    );

    const searchInput = screen.getByPlaceholderText('Search presets...');

    // Type non-matching search
    await user.type(searchInput, 'xyz123');

    // Categories with no matches should be hidden
    medievalPresetCategories.forEach(category => {
      const categoryElement = screen.queryByText(category.name);
      if (categoryElement) {
        const categorySection = categoryElement.closest('.category-section');
        const presetsContainer = categorySection?.querySelector('.category-presets');
        expect(presetsContainer?.children.length || 0).toBe(0);
      }
    });
  });

  it('displays category icons', () => {
    render(
      <DndWrapper>
        <AssetLibrary />
      </DndWrapper>
    );

    // Check for some category icons
    expect(screen.getByText('👤')).toBeInTheDocument(); // Character Occupations
    expect(screen.getByText('⚔️')).toBeInTheDocument(); // Items & Props
    expect(screen.getByText('🏰')).toBeInTheDocument(); // Settings & Locations
  });

  it('maintains expanded categories across searches', async () => {
    const user = userEvent.setup();
    render(
      <DndWrapper>
        <AssetLibrary />
      </DndWrapper>
    );

    // Expand a specific category
    const itemsCategory = screen.getByText('Items & Props').closest('.category-header');
    fireEvent.click(itemsCategory!);
    expect(screen.getByText('Ancient Scroll')).toBeInTheDocument();

    // Search for something
    const searchInput = screen.getByPlaceholderText('Search presets...');
    await user.type(searchInput, 'sword');

    // Should still show the expanded category with matching results
    expect(screen.getByText('Longsword')).toBeInTheDocument();

    // Clear search
    await user.clear(searchInput);

    // Category should still be expanded
    expect(screen.getByText('Ancient Scroll')).toBeInTheDocument();
  });
});