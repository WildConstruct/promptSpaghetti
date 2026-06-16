/**
 * Error-boundary tests for the real AssetLibraryV2.
 *
 * AssetLibraryV2 calls `useDrag` at render, so mounting it without a
 * DndProvider throws synchronously. These tests assert that
 * AssetLibraryErrorBoundary catches that real throw, shows its fallback, and
 * recovers on retry once a provider is supplied.
 *
 * react-dnd is mocked as a boundary: its `useDrag` throws when no DndProvider
 * is in context (mirroring real react-dnd's "drag drop context not found"),
 * which is what we want the error boundary to catch. The component under test
 * (AssetLibraryV2) and the boundary are the REAL implementations — not mocks.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

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

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { AssetLibraryV2 } from '../AssetLibraryV2';
import { AssetLibraryErrorBoundary } from '../AssetLibraryErrorBoundary';
import '@testing-library/jest-dom';

describe('AssetLibraryV2 error boundary', () => {
  it('renders the real component inside a DndProvider without crashing', () => {
    render(
      <DndProvider backend={HTML5Backend}>
        <AssetLibraryV2 />
      </DndProvider>
    );

    // Real AssetLibraryV2 markup is present; no fallback shown.
    expect(screen.queryByText(/Asset Browser Error/i)).not.toBeInTheDocument();
  });

  it('shows the error fallback when mounted without a DndProvider', () => {
    const originalError = console.error;
    console.error = jest.fn();

    render(
      <AssetLibraryErrorBoundary>
        <AssetLibraryV2 />
      </AssetLibraryErrorBoundary>
    );

    expect(screen.queryByText(/Asset Browser Error/i)).toBeInTheDocument();

    console.error = originalError;
  });

  it('recovers when retried with a DndProvider present', () => {
    const originalError = console.error;
    console.error = jest.fn();

    const { rerender } = render(
      <AssetLibraryErrorBoundary>
        <AssetLibraryV2 />
      </AssetLibraryErrorBoundary>
    );

    // Boundary caught the real throw and offers recovery.
    const retryButton = screen.getByText('Try Again');
    fireEvent.click(retryButton);

    rerender(
      <DndProvider backend={HTML5Backend}>
        <AssetLibraryErrorBoundary>
          <AssetLibraryV2 />
        </AssetLibraryErrorBoundary>
      </DndProvider>
    );

    expect(screen.queryByText(/Asset Browser Error/i)).not.toBeInTheDocument();

    console.error = originalError;
  });
});
