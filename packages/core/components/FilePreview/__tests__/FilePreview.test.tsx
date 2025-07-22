/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import FilePreview from '../FilePreview';
import { projectManager } from '../../../projectManager';

// Mock the projectManager
jest.mock('../../../projectManager', () => ({
  projectManager: {
    generateThumbnail: jest.fn(),
    getMockFile: jest.fn(),
  },
}));

const mockProjectManager = projectManager as jest.Mocked<typeof projectManager>;

describe('FilePreview Component', () => {
  const mockFile = {
    id: 'test-file-1',
    name: 'test-graph.psg',
    path: '/projects/test/test-graph.psg',
    size: 1024,
    lastModified: new Date('2025-01-15T10:00:00Z'),
    nodeCount: 15,
    metadata: {
      title: 'Test Graph',
      description: 'A test graph for unit testing',
      tags: ['test', 'graph'],
      author: 'Test User',
      version: '1.0.0',
      created: new Date('2025-01-10T10:00:00Z'),
      thumbnail: 'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4='
    },
    isFavorite: false
  };

  const mockThumbnail = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjgwIj48L3N2Zz4=';

  beforeEach(() => {
    jest.clearAllMocks();
    mockProjectManager.generateThumbnail.mockResolvedValue(mockThumbnail);
  });

  describe('Compact Mode', () => {
    it('renders file preview in compact mode', () => {
      render(<FilePreview file={mockFile} mode="compact" />);
      
      expect(screen.getByText('test-graph.psg')).toBeInTheDocument();
      expect(screen.getByText('15 nodes')).toBeInTheDocument();
      expect(screen.getByText('1.00 KB')).toBeInTheDocument();
    });

    it('displays formatted file size correctly', () => {
      const largeFile = { ...mockFile, size: 1048576 }; // 1MB
      render(<FilePreview file={largeFile} mode="compact" />);
      
      expect(screen.getByText('1.00 MB')).toBeInTheDocument();
    });

    it('shows last modified date in compact mode', () => {
      render(<FilePreview file={mockFile} mode="compact" />);
      
      expect(screen.getByText('1/15/2025, 10:00:00 AM')).toBeInTheDocument();
    });

    it('handles onClick event in compact mode', () => {
      const handleClick = jest.fn();
      render(<FilePreview file={mockFile} mode="compact" onClick={handleClick} />);
      
      const fileItem = screen.getByRole('button');
      fireEvent.click(fileItem);
      
      expect(handleClick).toHaveBeenCalledWith(mockFile);
    });
  });

  describe('Full Mode', () => {
    it('renders file preview in full mode with all metadata', () => {
      render(<FilePreview file={mockFile} mode="full" />);
      
      expect(screen.getByText('Test Graph')).toBeInTheDocument();
      expect(screen.getByText('A test graph for unit testing')).toBeInTheDocument();
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('test')).toBeInTheDocument();
      expect(screen.getByText('graph')).toBeInTheDocument();
    });

    it('shows version information in full mode', () => {
      render(<FilePreview file={mockFile} mode="full" />);
      
      expect(screen.getByText('v1.0.0')).toBeInTheDocument();
    });

    it('displays creation date in full mode', () => {
      render(<FilePreview file={mockFile} mode="full" />);
      
      expect(screen.getByText('Created: 1/10/2025')).toBeInTheDocument();
    });
  });

  describe('Thumbnail Generation', () => {
    it('generates and displays thumbnail', async () => {
      render(<FilePreview file={mockFile} mode="full" />);
      
      await waitFor(() => {
        expect(mockProjectManager.generateThumbnail).toHaveBeenCalledWith(mockFile);
      });

      const thumbnail = screen.getByAltText('test-graph.psg preview');
      expect(thumbnail).toHaveAttribute('src', mockThumbnail);
    });

    it('uses cached thumbnail if available', () => {
      const fileWithThumbnail = {
        ...mockFile,
        metadata: { ...mockFile.metadata, thumbnail: mockThumbnail }
      };
      
      render(<FilePreview file={fileWithThumbnail} mode="full" />);
      
      expect(mockProjectManager.generateThumbnail).not.toHaveBeenCalled();
      const thumbnail = screen.getByAltText('test-graph.psg preview');
      expect(thumbnail).toHaveAttribute('src', mockThumbnail);
    });

    it('handles thumbnail generation error gracefully', async () => {
      mockProjectManager.generateThumbnail.mockRejectedValue(new Error('Thumbnail generation failed'));
      
      render(<FilePreview file={mockFile} mode="full" />);
      
      await waitFor(() => {
        expect(mockProjectManager.generateThumbnail).toHaveBeenCalledWith(mockFile);
      });

      // Should still render without throwing error
      expect(screen.getByText('Test Graph')).toBeInTheDocument();
    });
  });

  describe('Favorite Status', () => {
    it('shows favorite star when file is favorite', () => {
      const favoriteFile = { ...mockFile, isFavorite: true };
      render(<FilePreview file={favoriteFile} mode="compact" />);
      
      expect(screen.getByText('⭐')).toBeInTheDocument();
    });

    it('does not show favorite star when file is not favorite', () => {
      render(<FilePreview file={mockFile} mode="compact" />);
      
      expect(screen.queryByText('⭐')).not.toBeInTheDocument();
    });
  });

  describe('File Size Formatting', () => {
    it('formats bytes correctly', () => {
      const smallFile = { ...mockFile, size: 512 };
      render(<FilePreview file={smallFile} mode="compact" />);
      
      expect(screen.getByText('512 B')).toBeInTheDocument();
    });

    it('formats kilobytes correctly', () => {
      const mediumFile = { ...mockFile, size: 2048 };
      render(<FilePreview file={mediumFile} mode="compact" />);
      
      expect(screen.getByText('2.00 KB')).toBeInTheDocument();
    });

    it('formats megabytes correctly', () => {
      const largeFile = { ...mockFile, size: 5242880 };
      render(<FilePreview file={largeFile} mode="compact" />);
      
      expect(screen.getByText('5.00 MB')).toBeInTheDocument();
    });

    it('handles zero size', () => {
      const emptyFile = { ...mockFile, size: 0 };
      render(<FilePreview file={emptyFile} mode="compact" />);
      
      expect(screen.getByText('0 B')).toBeInTheDocument();
    });
  });

  describe('Missing Metadata Handling', () => {
    it('handles missing title gracefully', () => {
      const fileWithoutTitle = {
        ...mockFile,
        metadata: { ...mockFile.metadata, title: undefined }
      };
      
      render(<FilePreview file={fileWithoutTitle} mode="full" />);
      
      // Should use filename when title is missing
      expect(screen.getByText('test-graph.psg')).toBeInTheDocument();
    });

    it('handles empty tags array', () => {
      const fileWithoutTags = {
        ...mockFile,
        metadata: { ...mockFile.metadata, tags: [] }
      };
      
      render(<FilePreview file={fileWithoutTags} mode="full" />);
      
      // Should not crash and still render other metadata
      expect(screen.getByText('Test Graph')).toBeInTheDocument();
    });

    it('handles missing description', () => {
      const fileWithoutDescription = {
        ...mockFile,
        metadata: { ...mockFile.metadata, description: undefined }
      };
      
      render(<FilePreview file={fileWithoutDescription} mode="full" />);
      
      expect(screen.getByText('Test Graph')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('memoizes component to prevent unnecessary re-renders', () => {
      const { rerender } = render(<FilePreview file={mockFile} mode="compact" />);
      
      // Spy on thumbnail generation to ensure it's not called again
      const generateThumbnailSpy = jest.spyOn(mockProjectManager, 'generateThumbnail');
      
      // Re-render with same props
      rerender(<FilePreview file={mockFile} mode="compact" />);
      
      expect(generateThumbnailSpy).toHaveBeenCalledTimes(0); // Should use memoized result
    });

    it('regenerates thumbnail only when file changes', async () => {
      const { rerender } = render(<FilePreview file={mockFile} mode="full" />);
      
      await waitFor(() => {
        expect(mockProjectManager.generateThumbnail).toHaveBeenCalledTimes(1);
      });

      const newFile = { ...mockFile, id: 'different-file' };
      rerender(<FilePreview file={newFile} mode="full" />);
      
      await waitFor(() => {
        expect(mockProjectManager.generateThumbnail).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<FilePreview file={mockFile} mode="compact" onClick={() => {}} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', expect.stringContaining('test-graph.psg'));
    });

    it('has proper alt text for thumbnail', () => {
      render(<FilePreview file={mockFile} mode="full" />);
      
      const thumbnail = screen.getByAltText('test-graph.psg preview');
      expect(thumbnail).toBeInTheDocument();
    });

    it('supports keyboard navigation when clickable', () => {
      const handleClick = jest.fn();
      render(<FilePreview file={mockFile} mode="compact" onClick={handleClick} />);
      
      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: 'Enter' });
      
      expect(handleClick).toHaveBeenCalledWith(mockFile);
    });
  });

  describe('Error Boundaries', () => {
    it('handles invalid date objects', () => {
      const fileWithInvalidDate = {
        ...mockFile,
        lastModified: new Date('invalid-date')
      };
      
      expect(() => {
        render(<FilePreview file={fileWithInvalidDate} mode="compact" />);
      }).not.toThrow();
    });

    it('handles missing metadata object', () => {
      const fileWithoutMetadata = {
        ...mockFile,
        metadata: undefined as any
      };
      
      expect(() => {
        render(<FilePreview file={fileWithoutMetadata} mode="full" />);
      }).not.toThrow();
    });
  });
});