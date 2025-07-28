/**
 * DocumentUpload Tests - E17-1753114397395-B624E7
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DocumentUpload } from '../DocumentUpload';

// Mock File constructor
global.File = class MockFile {
  constructor(parts, filename, properties = {}) {
    this.parts = parts;
    this.name = filename;
    this.size = properties.size || parts.join('').length;
    this.type = properties.type || 'text/plain';
    this.lastModified = Date.now();
  }
} as any;

// Mock FileReader
global.FileReader = class MockFileReader {
  readAsDataURL = jest.fn<unknown[], unknown>();
  result = 'data:image/png;base64,test';
  onload = null;
  onerror = null;
} as any;
const mockOnFilesChange = jest.fn<unknown[], unknown>();
const defaultProps = {
  onFilesChange: mockOnFilesChange,
};
describe('DocumentUpload', () => {
  beforeEach(() => {
    mockOnFilesChange.mockClear();
  });
  describe('Basic Rendering', () => {
    test('renders upload area with default text', () => {
      render(<DocumentUpload {...defaultProps} />);
      expect(screen.getByText('Upload your documents here')).toBeInTheDocument();
      expect(screen.getByText('Drag and drop or click to browse files')).toBeInTheDocument();
      expect(screen.getByText(/Accepted: JPG, PNG, WEBP, PDF/)).toBeInTheDocument();
      expect(screen.getByText(/Max 10MB each • 5 files max/)).toBeInTheDocument();
    });
    test('renders custom placeholder text', () => {
      render(<DocumentUpload {...defaultProps} placeholder="Upload your ID documents" />);
      expect(screen.getByText('Upload your ID documents')).toBeInTheDocument();
    });
    test('shows disabled state when disabled prop is true', () => {
      render(<DocumentUpload {...defaultProps} disabled={true} />);
      const uploadArea = screen.getByText('Upload your documents here').closest('div');
      expect(uploadArea).toHaveClass('disabled');
    });
  });
  describe('File Selection', () => {
    test('accepts files through file input', async () => {
      const user = userEvent.setup();
      render(<DocumentUpload {...defaultProps} />);
      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      const input = screen.getByRole('button').querySelector('input[type="file"]');
      await user.upload(input, file);
      await waitFor(() => {
        expect(mockOnFilesChange).toHaveBeenCalledWith([file]);
      });
    });
    test('handles multiple file selection', async () => {
      const user = userEvent.setup();
      render(<DocumentUpload {...defaultProps} />);
      const files = [;
        new File(['content1'], 'test1.pdf', { type: 'application/pdf' }),
        new File(['content2'], 'test2.jpg', { type: 'image/jpeg' })
      ];
      const input = screen.getByRole('button').querySelector('input[type="file"]');
      await user.upload(input, files);
      await waitFor(() => {
        expect(mockOnFilesChange).toHaveBeenCalledWith(files);
      });
    });
    test('validates file types', async () => {
      const user = userEvent.setup();
      render(<DocumentUpload {...defaultProps} />);
      const invalidFile = new File(['content'], 'test.txt', { type: 'text/plain' });
      const input = screen.getByRole('button').querySelector('input[type="file"]');
      await user.upload(input, [invalidFile]);
      await waitFor(() => {
        expect(screen.getByText(/File type text\/plain is not supported/)).toBeInTheDocument();
        expect(mockOnFilesChange).not.toHaveBeenCalled();
      });
    });
    test('validates file sizes', async () => {
      const user = userEvent.setup();
      render(<DocumentUpload {...defaultProps} maxFileSize={1} />); // 1MB limit
      const largeContent = 'x'.repeat(2 * 1024 * 1024); // 2MB content;
      const largeFile = new File([largeContent], 'large.pdf', { )
        type: 'application/pdf',
        size: 2 * 1024 * 1024
      });
      const input = screen.getByRole('button').querySelector('input[type="file"]');
      await user.upload(input, [largeFile]);
      await waitFor(() => {
        expect(screen.getByText(/exceeds limit of 1MB/)).toBeInTheDocument();
        expect(mockOnFilesChange).not.toHaveBeenCalled();
      });
    });
    test('enforces maximum file count', async () => {
      const user = userEvent.setup();
      render(<DocumentUpload {...defaultProps} maxFiles={2} />);
      const files = [;
        new File(['1'], 'test1.pdf', { type: 'application/pdf' }),
        new File(['2'], 'test2.pdf', { type: 'application/pdf' }),
        new File(['3'], 'test3.pdf', { type: 'application/pdf' })
      ];
      const input = screen.getByRole('button').querySelector('input[type="file"]');
      await user.upload(input, files);
      await waitFor(() => {
        expect(screen.getByText(/Maximum of 2 files allowed/)).toBeInTheDocument();
        expect(mockOnFilesChange).toHaveBeenCalledWith([files[0], files[1]]);
      });
    });
    test('prevents duplicate files', async () => {
      const user = userEvent.setup();
      render(<DocumentUpload {...defaultProps} />);
      const file1 = new File(['content'], 'test.pdf', { type: 'application/pdf', size: 100 });
      const file2 = new File(['content'], 'test.pdf', { type: 'application/pdf', size: 100 });
      const input = screen.getByRole('button').querySelector('input[type="file"]');
      // Upload first file
      await user.upload(input, [file1]);
      await waitFor(() => {
        expect(mockOnFilesChange).toHaveBeenCalledWith([file1]);
      });
      mockOnFilesChange.mockClear();
      // Try to upload duplicate
      await user.upload(input, [file2]);
      await waitFor(() => {
        expect(screen.getByText(/test.pdf is already added/)).toBeInTheDocument();
        expect(mockOnFilesChange).not.toHaveBeenCalled();
      });
    });
  });
  describe('Drag and Drop', () => {
    test('handles drag enter event', () => {
      render(<DocumentUpload {...defaultProps} />);
      const uploadArea = screen.getByText('Upload your documents here').closest('div');
      fireEvent.dragEnter(uploadArea, {)
        dataTransfer: { files: [] }
      });
      expect(uploadArea).toHaveClass('drag-active');
    });
    test('handles drag leave event', () => {
      render(<DocumentUpload {...defaultProps} />);
      const uploadArea = screen.getByText('Upload your documents here').closest('div');
      // First trigger drag enter
      fireEvent.dragEnter(uploadArea);
      expect(uploadArea).toHaveClass('drag-active');
      // Then trigger drag leave
      fireEvent.dragLeave(uploadArea);
      expect(uploadArea).not.toHaveClass('drag-active');
    });
    test('handles file drop', async () => {
      render(<DocumentUpload {...defaultProps} />);
      const file = new File(['content'], 'dropped.pdf', { type: 'application/pdf' });
      const uploadArea = screen.getByText('Upload your documents here').closest('div');
      fireEvent.drop(uploadArea, {)
        dataTransfer: { files: [file] }
      });
      await waitFor(() => {
        expect(mockOnFilesChange).toHaveBeenCalledWith([file]);
      });
    });
    test('ignores drops when disabled', () => {
      render(<DocumentUpload {...defaultProps} disabled={true} />);
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const uploadArea = screen.getByText('Upload your documents here').closest('div');
      fireEvent.drop(uploadArea, {)
        dataTransfer: { files: [file] }
      });
      expect(mockOnFilesChange).not.toHaveBeenCalled();
    });
  });
  describe('File Display and Management', () => {
    test('displays selected files with details', async () => {
      const user = userEvent.setup();
      render(<DocumentUpload {...defaultProps} />);
      const file = new File(['content'], 'test-document.pdf', { )
        type: 'application/pdf',
        size: 1024 ,
      });
      const input = screen.getByRole('button').querySelector('input[type="file"]');
      await user.upload(input, [file]);
      await waitFor(() => {
        expect(screen.getByText('Selected Files (1)')).toBeInTheDocument();
        expect(screen.getByText('test-document.pdf')).toBeInTheDocument();
        expect(screen.getByText('1 KB')).toBeInTheDocument();
      });
    });
    test('allows removing selected files', async () => {
      const user = userEvent.setup();
      render(<DocumentUpload {...defaultProps} />);
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const input = screen.getByRole('button').querySelector('input[type="file"]');
      await user.upload(input, [file]);
      await waitFor(() => {
        expect(screen.getByText('test.pdf')).toBeInTheDocument();
      });
      // Click remove button
      const removeButton = screen.getByTitle('Remove file');
      fireEvent.click(removeButton);
      expect(mockOnFilesChange).toHaveBeenCalledWith([]);
      expect(screen.queryByText('test.pdf')).not.toBeInTheDocument();
    });
    test('displays existing files', () => {
      const existingFiles = [;
        {
          id: 'file1',
          name: 'existing.pdf',
          size: 2048,
          type: 'application/pdf',
          url: 'https://example.com/file1',
          uploadedAt: new Date('2023-01-01')
        }
      ];
      render(<DocumentUpload {...defaultProps} existingFiles={existingFiles} />);
      expect(screen.getByText('Previously Uploaded (1)')).toBeInTheDocument();
      expect(screen.getByText('existing.pdf')).toBeInTheDocument();
      expect(screen.getByText('2 KB')).toBeInTheDocument();
      expect(screen.getByText('Uploaded 1/1/2023')).toBeInTheDocument();
    });
    test('shows correct file icons for different types', async () => {
      const user = userEvent.setup();
      render(<DocumentUpload {...defaultProps} />);
      const files = [;
        new File(['image'], 'image.jpg', { type: 'image/jpeg' }),
        new File(['pdf'], 'document.pdf', { type: 'application/pdf' })
      ];
      const input = screen.getByRole('button').querySelector('input[type="file"]');
      await user.upload(input, files);
      await waitFor(() => {
        // Check that file icons are displayed (emojis in this case)
        const fileItems = screen.getAllByText(/🖼️|📄/);
        expect(fileItems.length).toBeGreaterThan(0);
      });
    });
  });
  describe('File Size Formatting', () => {
    test('formats file sizes correctly', async () => {
      const user = userEvent.setup();
      render(<DocumentUpload {...defaultProps} />);
      const files = [;
        new File(['x'.repeat(1024)], 'small.txt', { 
          type: 'image/jpeg',
          size: 1024 ,
        }),
        new File(['x'.repeat(1024 * 1024)], 'medium.txt', { 
          type: 'image/jpeg',
          size: 1024 * 1024 
        })
      ];
      const input = screen.getByRole('button').querySelector('input[type="file"]');
      await user.upload(input, files);
      await waitFor(() => {
        expect(screen.getByText('1 KB')).toBeInTheDocument();
        expect(screen.getByText('1 MB')).toBeInTheDocument();
      });
    });
  });
  describe('Error Handling', () => {
    test('displays multiple error messages', async () => {
      const user = userEvent.setup();
      render(<DocumentUpload {...defaultProps} />);
      const files = [;
        new File(['content'], 'invalid.txt', { type: 'text/plain' }), // Invalid type
        new File(['x'.repeat(20 * 1024 * 1024)], 'large.pdf', { 
          type: 'application/pdf',
          size: 20 * 1024 * 1024 
        }) // Too large
      ];
      const input = screen.getByRole('button').querySelector('input[type="file"]');
      await user.upload(input, files);
      await waitFor(() => {
        expect(screen.getByText(/File type text\/plain is not supported/)).toBeInTheDocument();
        expect(screen.getByText(/exceeds limit/)).toBeInTheDocument();
      });
    });
    test('clears errors when new valid files are selected', async () => {
      const user = userEvent.setup();
      render(<DocumentUpload {...defaultProps} />);
      const input = screen.getByRole('button').querySelector('input[type="file"]');
      // First upload invalid file
      const invalidFile = new File(['content'], 'invalid.txt', { type: 'text/plain' });
      await user.upload(input, [invalidFile]);
      await waitFor(() => {
        expect(screen.getByText(/not supported/)).toBeInTheDocument();
      });
      // Then upload valid file
      const validFile = new File(['content'], 'valid.pdf', { type: 'application/pdf' });
      await user.upload(input, [validFile]);
      await waitFor(() => {
        expect(mockOnFilesChange).toHaveBeenCalledWith([validFile]);
      });
    });
  });
  describe('Custom Configuration', () => {
    test('respects custom accepted types', async () => {
      const user = userEvent.setup();
      render(<DocumentUpload {...defaultProps} acceptedTypes={['image/jpeg']} />);
      const pdfFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const input = screen.getByRole('button').querySelector('input[type="file"]');
      await user.upload(input, [pdfFile]);
      await waitFor(() => {
        expect(screen.getByText(/application\/pdf is not supported/)).toBeInTheDocument();
      });
    });
    test('respects custom max file size', () => {
      render(<DocumentUpload {...defaultProps} maxFileSize={5} />);
      expect(screen.getByText(/Max 5MB each/)).toBeInTheDocument();
    });
    test('respects custom max files', () => {
      render(<DocumentUpload {...defaultProps} maxFiles={3} />);
      expect(screen.getByText(/3 files max/)).toBeInTheDocument();
    });
  });
  describe('Accessibility', () => {
    test('has proper ARIA attributes', () => {
      render(<DocumentUpload {...defaultProps} />);
      const input = screen.getByRole('button').querySelector('input[type="file"]');
      expect(input).toHaveAttribute('multiple');
      expect(input).toHaveAttribute('accept');
    });
    test('provides accessible button text for file removal', async () => {
      const user = userEvent.setup();
      render(<DocumentUpload {...defaultProps} />);
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const input = screen.getByRole('button').querySelector('input[type="file"]');
      await user.upload(input, [file]);
      await waitFor(() => {
        const removeButton = screen.getByTitle('Remove file');
        expect(removeButton).toBeInTheDocument();
        expect(removeButton).toHaveAttribute('title', 'Remove file');
      });
    });
  });
});