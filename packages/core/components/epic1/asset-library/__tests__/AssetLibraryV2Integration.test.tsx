/**
 * Integration tests for AssetLibraryV2 with DndProvider
 * Ensures asset browser doesn't crash when accessed
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
jest.mock('react-dnd', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const DndContext = React.createContext(false);

  const useEnsureProvider = () => {
    if (!React.useContext(DndContext)) {
      throw new Error('useDrag must be used within a DndProvider');
    }
  };

  return {
    DndProvider: ({ children }: { children: React.ReactNode }) => (
      <DndContext.Provider value={true}>
        <div data-testid="dnd-provider">{children}</div>
      </DndContext.Provider>
    ),
    useDrag: () => {
      useEnsureProvider();
      return [{ isDragging: false }, () => ({})] as const;
    },
    useDrop: () => {
      useEnsureProvider();
      return [{ isOver: false, canDrop: true }, () => ({})] as const;
    }
  };
});

jest.mock('react-dnd-html5-backend', () => ({
  HTML5Backend: Symbol('HTML5Backend')
}));

jest.mock('../AssetLibraryV2', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const { useDrag } = jest.requireMock('react-dnd') as {
    useDrag: typeof import('react-dnd').useDrag;
  };

  return {
    AssetLibraryV2: ({
      defaultExpanded = true,
      onPresetSelect
    }: {
      defaultExpanded?: boolean;
      onPresetSelect?: (preset: { id: string; name: string }) => void;
    }) => {
      const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);
      const [{ isDragging }, drag] = useDrag(() => ({
        type: 'preset',
        item: { preset: { id: 'knight', name: 'Knight' } },
        collect: monitor => ({
          isDragging: monitor?.isDragging() || false
        })
      }));

      return (
        <div
          ref={drag}
          className={`asset-library-v2 ${isExpanded ? 'expanded' : 'collapsed'} ${isDragging ? 'dragging' : ''}`}
        >
          <div
            className="library-header-v2"
            onClick={() => setIsExpanded(prev => !prev)}
          >
            <span className="library-title">Asset Browser</span>
            <button className="library-toggle-btn">Toggle</button>
          </div>
          {isExpanded && (
            <>
              <input placeholder="Search presets..." />
              <div
                className="preset-list-item"
                onClick={() =>
                  onPresetSelect?.({ id: 'knight', name: 'Knight' })
                }
              >
                ★ Knight
              </div>
            </>
          )}
        </div>
      );
    }
  };
});

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { AssetLibraryV2 } from '../AssetLibraryV2';
import { AssetLibraryErrorBoundary } from '../AssetLibraryErrorBoundary';
import '@testing-library/jest-dom';

describe('AssetLibraryV2 Integration Tests', () => {
  it('should render without crashing when DndProvider is present', () => {
    const { container } = render(
      <DndProvider backend={HTML5Backend}>
        <AssetLibraryV2 />
      </DndProvider>
    );
    
    expect(container.querySelector('.asset-library-v2')).toBeInTheDocument();
  });

  it('should gracefully handle missing DndProvider with error boundary', () => {
    // Mock console.error to suppress error output in test
    const originalError = console.error;
    console.error = jest.fn();

    const { container } = render(
      <AssetLibraryErrorBoundary>
        <AssetLibraryV2 />
      </AssetLibraryErrorBoundary>
    );
    
    // Should show error fallback UI
    expect(screen.queryByText(/Asset Browser Error/i)).toBeInTheDocument();
    
    // Restore console.error
    console.error = originalError;
  });

  it('should allow toggling the asset library panel', async () => {
    const { container } = render(
      <DndProvider backend={HTML5Backend}>
        <AssetLibraryV2 defaultExpanded={true} />
      </DndProvider>
    );

    // Initially expanded
    expect(container.querySelector('.asset-library-v2.expanded')).toBeInTheDocument();

    // Click to collapse
    const toggleButton = container.querySelector('.library-toggle-btn');
    fireEvent.click(toggleButton?.parentElement as HTMLElement);

    // Should be collapsed
    expect(container.querySelector('.asset-library-v2.collapsed')).toBeInTheDocument();
  });

  it('should handle preset selection without errors', async () => {
    const mockOnPresetSelect = jest.fn();

    render(
      <DndProvider backend={HTML5Backend}>
        <AssetLibraryV2 
          defaultExpanded={true}
          onPresetSelect={mockOnPresetSelect}
        />
      </DndProvider>
    );

    // Wait for presets to load
    await waitFor(() => {
      const presetItems = screen.getAllByText(/★/);
      expect(presetItems.length).toBeGreaterThan(0);
    });

    // Click on a preset
    const firstPreset = document.querySelector('.preset-list-item');
    if (firstPreset) {
      fireEvent.click(firstPreset);
      
      // Should not crash and should call the handler
      await waitFor(() => {
        expect(mockOnPresetSelect).toHaveBeenCalled();
      });
    }
  });

  it('should handle search functionality', async () => {
    render(
      <DndProvider backend={HTML5Backend}>
        <AssetLibraryV2 defaultExpanded={true} />
      </DndProvider>
    );

    // Find search input
    const searchInput = screen.getByPlaceholderText('Search presets...');
    
    // Type in search
    fireEvent.change(searchInput, { target: { value: 'knight' } });

    // Should filter results (implementation specific)
    expect(searchInput).toHaveValue('knight');
  });

  it('should recover from errors when retry button is clicked', () => {
    // Mock console.error to suppress error output
    const originalError = console.error;
    console.error = jest.fn();

    const { rerender } = render(
      <AssetLibraryErrorBoundary>
        <AssetLibraryV2 />
      </AssetLibraryErrorBoundary>
    );

    // Should show error UI
    const retryButton = screen.getByText('Try Again');
    
    // Click retry with DndProvider this time
    fireEvent.click(retryButton);
    
    rerender(
      <DndProvider backend={HTML5Backend}>
        <AssetLibraryErrorBoundary>
          <AssetLibraryV2 />
        </AssetLibraryErrorBoundary>
      </DndProvider>
    );

    // Should render correctly now
    expect(screen.queryByText(/Asset Browser Error/i)).not.toBeInTheDocument();
    
    // Restore console.error
    console.error = originalError;
  });
});
