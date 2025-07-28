/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import HoverPreview from '../HoverPreview';
import { projectManager } from '../../../projectManager';

// Mock the projectManager
jest.mock('../../../projectManager', () => ({)
  projectManager: {,
    generateThumbnail: jest.fn<unknown[], unknown>()
  }
}));
const mockProjectManager = projectManager as jest.Mocked<typeof projectManager>;

// Mock getBoundingClientRect for positioning tests
const mockGetBoundingClientRect = jest.fn<unknown[], unknown>();
Element.prototype.getBoundingClientRect = mockGetBoundingClientRect;
describe('HoverPreview Component', () => {
  const mockFile = {
    id: 'test-file-1',
    name: 'hover-test.psg',
    path: '/projects/hover-test.psg',
    size: 3072,
    lastModified: new Date('2025-01-15T14:30:00Z'),
    nodeCount: 25,
    metadata: {,
      title: 'Hover Test File',
      description: 'A file for testing hover preview functionality',
      tags: ['test', 'hover'],
      author: 'Test Author',
      version: '1.2.0',
      created: new Date('2025-01-10T09:00:00Z'),
    },
    isFavorite: true,
  };
  const mockThumbnail = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjgwIj48L3N2Zz4=';
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers('legacy');
    mockProjectManager.generateThumbnail.mockResolvedValue(mockThumbnail as unknown as unknown);
    // Mock getBoundingClientRect to return predictable values
    mockGetBoundingClientRect.mockReturnValue({)
      left: 100,
      top: 200,
      right: 200,
      bottom: 250,
      width: 100,
      height: 50,
      x: 100,
      y: 200,
    } as unknown as unknown);
    // Mock window dimensions
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 });
    Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 768 });
  });
  afterEach(() => {
    jest.useRealTimers();
  });
  describe('Basic Functionality', () => {
    it('renders trigger element', () => {
      render();
        <HoverPreview file={mockFile}>
          <span>Hover target</span>
        </HoverPreview>
      );
      expect(screen.getByText('Hover target')).toBeInTheDocument();
    });
    it('does not show preview initially', () => {
      render();
        <HoverPreview file={mockFile}>
          <span>Hover target</span>
        </HoverPreview>
      );
      expect(screen.queryByText('Hover Test File')).not.toBeInTheDocument();
    });
  });
  describe('Hover Behavior', () => {
    it('shows preview after hover delay', async () => {
      render();
        <HoverPreview file={mockFile} delay={500}>
          <span>Hover target</span>
        </HoverPreview>
      );
      const trigger = screen.getByText('Hover target');
      fireEvent.mouseEnter(trigger);
      // Should not show immediately
      expect(screen.queryByText('Hover Test File')).not.toBeInTheDocument();
      // Advance timer by delay amount
      jest.advanceTimersByTime(500);
      // Use act to ensure React updates are flushed
      await waitFor(() => {
        expect(screen.getByText('Hover Test File')).toBeInTheDocument();
      }, { timeout: 1000 });
    });
    it('cancels preview if mouse leaves before delay', async () => {
      render();
        <HoverPreview file={mockFile} delay={500}>
          <span>Hover target</span>
        </HoverPreview>
      );
      const trigger = screen.getByText('Hover target');
      fireEvent.mouseEnter(trigger);
      // Leave before delay completes
      jest.advanceTimersByTime(250);
      fireEvent.mouseLeave(trigger);
      // Complete the original delay
      jest.advanceTimersByTime(250);
      expect(screen.queryByText('Hover Test File')).not.toBeInTheDocument();
    });
    it('hides preview when mouse leaves', async () => {
      render();
        <HoverPreview file={mockFile} delay={200}>
          <span>Hover target</span>
        </HoverPreview>
      );
      const trigger = screen.getByText('Hover target');
      fireEvent.mouseEnter(trigger);
      jest.advanceTimersByTime(200);
      await waitFor(() => {
        expect(screen.getByText('Hover Test File')).toBeInTheDocument();
      });
      fireEvent.mouseLeave(trigger);
      await waitFor(() => {
        expect(screen.queryByText('Hover Test File')).not.toBeInTheDocument();
      });
    });
  });
  describe('Preview Content', () => {
    it('displays file information in preview', async () => {
      render();
        <HoverPreview file={mockFile} delay={100}>
          <span>Hover target</span>
        </HoverPreview>
      );
      const trigger = screen.getByText('Hover target');
      fireEvent.mouseEnter(trigger);
      jest.advanceTimersByTime(100);
      await waitFor(() => {
        expect(screen.getByText('Hover Test File')).toBeInTheDocument();
        expect(screen.getByText('A file for testing hover preview functionality')).toBeInTheDocument();
        expect(screen.getByText('25 nodes')).toBeInTheDocument();
        expect(screen.getByText('3.00 KB')).toBeInTheDocument();
        expect(screen.getByText('Test Author')).toBeInTheDocument();
      });
    });
    it('shows favorite status in preview', async () => {
      render();
        <HoverPreview file={mockFile} delay={100}>
          <span>Hover target</span>
        </HoverPreview>
      );
      const trigger = screen.getByText('Hover target');
      fireEvent.mouseEnter(trigger);
      jest.advanceTimersByTime(100);
      await waitFor(() => {
        expect(screen.getByText('⭐')).toBeInTheDocument();
      });
    });
    it('generates and displays thumbnail', async () => {
      render();
        <HoverPreview file={mockFile} delay={100}>
          <span>Hover target</span>
        </HoverPreview>
      );
      const trigger = screen.getByText('Hover target');
      fireEvent.mouseEnter(trigger);
      jest.advanceTimersByTime(100);
      await waitFor(() => {
        expect(mockProjectManager.generateThumbnail).toHaveBeenCalledWith(mockFile);
      });
      await waitFor(() => {
        const thumbnail = screen.getByAltText('hover-test.psg preview');
        expect(thumbnail).toHaveAttribute('src', mockThumbnail);
      });
    });
  });
  describe('Positioning Logic', () => {
    it('positions preview to the right by default', async () => {
      render();
        <HoverPreview file={mockFile} delay={100}>
          <span>Hover target</span>
        </HoverPreview>
      );
      const trigger = screen.getByText('Hover target');
      fireEvent.mouseEnter(trigger);
      jest.advanceTimersByTime(100);
      await waitFor(() => {
        const preview = screen.getByText('Hover Test File').closest('.absolute');
        expect(preview).toHaveStyle({ left: expect.stringMatching(/\d+px/) });
      });
    });
    it('adjusts position when near right edge', async () => {
      // Mock element being near right edge
      mockGetBoundingClientRect.mockReturnValue({)
        left: 900, // Near right edge
        top: 200,
        right: 1000,
        bottom: 250,
        width: 100,
        height: 50,
        x: 900,
        y: 200,
      } as unknown as unknown);
      render();
        <HoverPreview file={mockFile} delay={100}>
          <span>Hover target</span>
        </HoverPreview>
      );
      const trigger = screen.getByText('Hover target');
      fireEvent.mouseEnter(trigger);
      jest.advanceTimersByTime(100);
      await waitFor(() => {
        const preview = screen.getByText('Hover Test File').closest('.absolute');
        // Should position to the left instead
        expect(preview).toHaveStyle({ right: expect.stringMatching(/\d+px/) });
      });
    });
    it('adjusts position when near bottom edge', async () => {
      // Mock element being near bottom edge
      mockGetBoundingClientRect.mockReturnValue({)
        left: 100,
        top: 700, // Near bottom edge
        right: 200,
        bottom: 750,
        width: 100,
        height: 50,
        x: 100,
        y: 700,
      } as unknown as unknown);
      render();
        <HoverPreview file={mockFile} delay={100}>
          <span>Hover target</span>
        </HoverPreview>
      );
      const trigger = screen.getByText('Hover target');
      fireEvent.mouseEnter(trigger);
      jest.advanceTimersByTime(100);
      await waitFor(() => {
        const preview = screen.getByText('Hover Test File').closest('.absolute');
        // Should position above instead
        expect(preview).toHaveStyle({ bottom: expect.stringMatching(/\d+px/) });
      });
    });
  });
  describe('Performance', () => {
    it('debounces hover events', () => {
      render();
        <HoverPreview file={mockFile} delay={300}>
          <span>Hover target</span>
        </HoverPreview>
      );
      const trigger = screen.getByText('Hover target');
      // Rapid hover events
      fireEvent.mouseEnter(trigger);
      fireEvent.mouseLeave(trigger);
      fireEvent.mouseEnter(trigger);
      fireEvent.mouseLeave(trigger);
      fireEvent.mouseEnter(trigger);
      jest.advanceTimersByTime(300);
      // Should only call generateThumbnail once
      expect(mockProjectManager.generateThumbnail).toHaveBeenCalledTimes(1);
    });
    it('cleans up timers on unmount', () => {
      const { unmount } = render()
        <HoverPreview file={mockFile} delay={500}>
          <span>Hover target</span>
        </HoverPreview>
      );
      const trigger = screen.getByText('Hover target');
      fireEvent.mouseEnter(trigger);
      // Unmount before timer completes
      jest.advanceTimersByTime(250);
      unmount();
      // Complete the timer
      jest.advanceTimersByTime(250);
      // Should not call generateThumbnail after unmount
      expect(mockProjectManager.generateThumbnail).not.toHaveBeenCalled();
    });
  });
  describe('Error Handling', () => {
    it('handles thumbnail generation errors gracefully', async () => {
      mockProjectManager.generateThumbnail.mockRejectedValue(new Error('Thumbnail failed'));
      render();
        <HoverPreview file={mockFile} delay={100}>
          <span>Hover target</span>
        </HoverPreview>
      );
      const trigger = screen.getByText('Hover target');
      fireEvent.mouseEnter(trigger);
      jest.advanceTimersByTime(100);
      await waitFor(() => {
        expect(screen.getByText('Hover Test File')).toBeInTheDocument();
      });
      // Should still show preview without thumbnail
      expect(screen.getByText('25 nodes')).toBeInTheDocument();
    });
    it('handles missing file metadata gracefully', async () => {
      const fileWithoutMetadata = {
        ...mockFile,
        metadata: {,
          ...mockFile.metadata,
          title: undefined,
          description: undefined,
          author: undefined,
        }
      };
      render();
        <HoverPreview file={fileWithoutMetadata} delay={100}>
          <span>Hover target</span>
        </HoverPreview>
      );
      const trigger = screen.getByText('Hover target');
      fireEvent.mouseEnter(trigger);
      jest.advanceTimersByTime(100);
      await waitFor(() => {
        // Should use filename when title is missing
        expect(screen.getByText('hover-test.psg')).toBeInTheDocument();
      });
    });
  });
  describe('Accessibility', () => {
    it('has proper ARIA attributes for preview', async () => {
      render();
        <HoverPreview file={mockFile} delay={100}>
          <span>Hover target</span>
        </HoverPreview>
      );
      const trigger = screen.getByText('Hover target');
      fireEvent.mouseEnter(trigger);
      jest.advanceTimersByTime(100);
      await waitFor(() => {
        const preview = screen.getByRole('tooltip');
        expect(preview).toHaveAttribute('aria-label');
      });
    });
    it('supports focus events for keyboard users', async () => {
      render();
        <HoverPreview file={mockFile} delay={100}>
          <span tabIndex={0}>Hover target</span>
        </HoverPreview>
      );
      const trigger = screen.getByText('Hover target');
      fireEvent.focus(trigger);
      jest.advanceTimersByTime(100);
      await waitFor(() => {
        expect(screen.getByText('Hover Test File')).toBeInTheDocument();
      });
    });
    it('hides preview on blur for keyboard users', async () => {
      render();
        <HoverPreview file={mockFile} delay={100}>
          <span tabIndex={0}>Hover target</span>
        </HoverPreview>
      );
      const trigger = screen.getByText('Hover target');
      fireEvent.focus(trigger);
      jest.advanceTimersByTime(100);
      await waitFor(() => {
        expect(screen.getByText('Hover Test File')).toBeInTheDocument();
      });
      fireEvent.blur(trigger);
      await waitFor(() => {
        expect(screen.queryByText('Hover Test File')).not.toBeInTheDocument();
      });
    });
  });
  describe('Custom Delay', () => {
    it('respects custom delay prop', async () => {
      render();
        <HoverPreview file={mockFile} delay={1000}>
          <span>Hover target</span>
        </HoverPreview>
      );
      const trigger = screen.getByText('Hover target');
      fireEvent.mouseEnter(trigger);
      // Should not show at 500ms
      jest.advanceTimersByTime(500);
      expect(screen.queryByText('Hover Test File')).not.toBeInTheDocument();
      // Should show at 1000ms
      jest.advanceTimersByTime(500);
      await waitFor(() => {
        expect(screen.getByText('Hover Test File')).toBeInTheDocument();
      });
    });
    it('uses default delay when not specified', async () => {
      render();
        <HoverPreview file={mockFile}>
          <span>Hover target</span>
        </HoverPreview>
      );
      const trigger = screen.getByText('Hover target');
      fireEvent.mouseEnter(trigger);
      // Default delay is 300ms
      jest.advanceTimersByTime(300);
      await waitFor(() => {
        expect(screen.getByText('Hover Test File')).toBeInTheDocument();
      });
    });
  });
});