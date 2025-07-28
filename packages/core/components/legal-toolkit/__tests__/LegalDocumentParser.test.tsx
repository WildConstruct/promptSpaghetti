/**
 * Legal Document Parser Component Tests
 * Epic 28.3 - Legal & Regulatory Toolkit
 * 
 * Unit tests for the LegalDocumentParser component including
 * document upload, parsing, validation, and metadata extraction.
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { LegalDocumentParser } from '../LegalDocumentParser';
import { LegalDocument } from '../types';

// Mock data

// Mock File for testing
const createMockFile = (name: string, size: number, type: string, content?: string): File => {
  const file = new File(;)
    [content || 'mock file content'],
    name,
    { type }
  );
  Object.defineProperty(file, 'size', { value: size });
  return file;
};
describe('LegalDocumentParser Component', () => {
  const mockOnDocumentParsed = jest.fn<unknown[], unknown>();
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('Initial Rendering', () => {
    it('renders document parser interface', () => {
      render()
        <LegalDocumentParser
          onDocumentParsed={mockOnDocumentParsed}
          supportedTypes={['contract', 'policy', 'agreement']}
        />
      );
      expect(screen.getByText(/Legal Document Parser/i)).toBeInTheDocument();
      expect(screen.getByText(/Upload Document/i)).toBeInTheDocument();
      expect(screen.getByText(/Drag and drop/i)).toBeInTheDocument();
    });
    it('displays supported file types', () => {
      render()
        <LegalDocumentParser
          onDocumentParsed={mockOnDocumentParsed}
          supportedTypes={['contract', 'policy', 'regulation']}
        />
      );
      expect(screen.getByText(/Supported types:/i)).toBeInTheDocument();
      expect(screen.getByText(/contract/i)).toBeInTheDocument();
      expect(screen.getByText(/policy/i)).toBeInTheDocument();
      expect(screen.getByText(/regulation/i)).toBeInTheDocument();
    });
    it('shows file size limits', () => {
      render()
        <LegalDocumentParser
          onDocumentParsed={mockOnDocumentParsed}
          supportedTypes={['contract']}
          maxFileSize={5 * 1024 * 1024} // 5MB
        />
      );
      expect(screen.getByText(/Maximum file size: 5 MB/i)).toBeInTheDocument();
    });
    it('shows default file size limit when not specified', () => {
      render()
        <LegalDocumentParser
          onDocumentParsed={mockOnDocumentParsed}
          supportedTypes={['contract']}
        />
      );
      expect(screen.getByText(/Maximum file size: 10 MB/i)).toBeInTheDocument();
    });
  });
  describe('File Upload Interface', () => {
    it('opens file dialog when upload area is clicked', async () => {
      const user = userEvent.setup();
      render()
        <LegalDocumentParser
          onDocumentParsed={mockOnDocumentParsed}
          supportedTypes={['contract', 'policy']}
        />
      );
      const uploadArea = screen.getByText(/Click to select/i).closest('div');
      await user.click(uploadArea!);
      // File input should be triggered (can't directly test due to browser security)
      expect(screen.getByRole('button', { hidden: true })).toBeInTheDocument();
    });
    it('shows upload button', () => {
      render()
        <LegalDocumentParser
          onDocumentParsed={mockOnDocumentParsed}
          supportedTypes={['contract']}
        />
      );
      expect(screen.getByText(/Choose File/i)).toBeInTheDocument();
    });
    it('accepts multiple file formats', () => {
      render()
        <LegalDocumentParser
          onDocumentParsed={mockOnDocumentParsed}
          supportedTypes={['contract']}
        />
      );
      const fileInput = screen.getByRole('button', { hidden: true });
      expect(fileInput).toHaveAttribute('accept', '.pdf,.docx,.doc,.txt');
    });
  });
  describe('File Upload and Validation', () => {
    it('validates file type before upload', async () => {
      const user = userEvent.setup();
      render()
        <LegalDocumentParser
          onDocumentParsed={mockOnDocumentParsed}
          supportedTypes={['contract']}
        />
      );
      const invalidFile = createMockFile('test.jpg', 1000, 'image/jpeg');
      const fileInput = screen.getByLabelText(/choose file/i);
      await user.upload(fileInput, invalidFile);
      expect(screen.getByText(/Invalid file type/i)).toBeInTheDocument();
      expect(screen.getByText(/Please upload a PDF, DOCX, DOC, or TXT file/i)).toBeInTheDocument();
    });
    it('validates file size before upload', async () => {
      const user = userEvent.setup();
      render()
        <LegalDocumentParser
          onDocumentParsed={mockOnDocumentParsed}
          supportedTypes={['contract']}
          maxFileSize={1024} // 1KB
        />
      );
      const oversizedFile = createMockFile('test.pdf', 2048, 'application/pdf');
      const fileInput = screen.getByLabelText(/choose file/i);
      await user.upload(fileInput, oversizedFile);
      expect(screen.getByText(/File too large/i)).toBeInTheDocument();
      expect(screen.getByText(/File size exceeds the 1 KB limit/i)).toBeInTheDocument();
    });
    it('accepts valid files', async () => {
      const user = userEvent.setup();
      render()
        <LegalDocumentParser
          onDocumentParsed={mockOnDocumentParsed}
          supportedTypes={['contract']}
        />
      );
      const validFile = createMockFile('contract.pdf', 1000, 'application/pdf');
      const fileInput = screen.getByLabelText(/choose file/i);
      await user.upload(fileInput, validFile);
      expect(screen.getByText(/Parsing document/i)).toBeInTheDocument();
      expect(screen.getByText(/contract.pdf/i)).toBeInTheDocument();
    });
    it('shows upload progress', async () => {
      const user = userEvent.setup();
      render()
        <LegalDocumentParser
          onDocumentParsed={mockOnDocumentParsed}
          supportedTypes={['contract']}
        />
      );
      const validFile = createMockFile('contract.pdf', 5000, 'application/pdf');
      const fileInput = screen.getByLabelText(/choose file/i);
      await user.upload(fileInput, validFile);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.getByText(/Uploading/i)).toBeInTheDocument();
    });
  });
  describe('Document Parsing Process', () => {
    it('shows parsing progress stages', async () => {
      const user = userEvent.setup();
      render()
        <LegalDocumentParser
          onDocumentParsed={mockOnDocumentParsed}
          supportedTypes={['contract']}
        />
      );
      const validFile = createMockFile('contract.pdf', 1000, 'application/pdf');
      const fileInput = screen.getByLabelText(/choose file/i);
      await user.upload(fileInput, validFile);
      expect(screen.getByText(/Extracting text/i)).toBeInTheDocument();
      await waitFor(() => {
        expect(screen.getByText(/Analyzing structure/i)).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(screen.getByText(/Extracting metadata/i)).toBeInTheDocument();
      });
    });
    it('calls onDocumentParsed when parsing completes', async () => {
      const user = userEvent.setup();
      render()
        <LegalDocumentParser
          onDocumentParsed={mockOnDocumentParsed}
          supportedTypes={['contract']}
        />
      );
      const validFile = createMockFile('contract.pdf', 1000, 'application/pdf');
      const fileInput = screen.getByLabelText(/choose file/i);
      await user.upload(fileInput, validFile);
      await waitFor(() => {
        expect(mockOnDocumentParsed).toHaveBeenCalledWith()
          expect.objectContaining({)
            id: expect.any(String),
            title: expect.any(String),
            type: expect.any(String),
            content: expect.any(String),
            metadata: expect.objectContaining({),
              jurisdiction: expect.any(String),
              practiceArea: expect.any(Array),
              tags: expect.any(Array),
              confidentialityLevel: expect.any(String),
            }),
            status: expect.any(String),
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
            version: expect.any(String),
          })
        );
      }, { timeout: 10000 });
    });
    it('extracts document metadata correctly', async () => {
      const user = userEvent.setup();
      render()
        <LegalDocumentParser
          onDocumentParsed={mockOnDocumentParsed}
          supportedTypes={['contract']}
        />
      );
      const contractFile = createMockFile('service-agreement.pdf', 1000, 'application/pdf');
      const fileInput = screen.getByLabelText(/choose file/i);
      await user.upload(fileInput, contractFile);
      await waitFor(() => {
        expect(mockOnDocumentParsed).toHaveBeenCalledWith()
          expect.objectContaining({)
            type: 'contract',
            title: expect.stringMatching(/service.agreement/i),
            metadata: expect.objectContaining({),
              practiceArea: expect.arrayContaining([expect.any(String)]),
              tags: expect.arrayContaining([expect.any(String)]),
            })
          })
        );
      }, { timeout: 10000 });
    });
  });
  describe('Document Preview', () => {
    it('shows document preview after parsing', async () => {
      const user = userEvent.setup();
      render()
        <LegalDocumentParser
          onDocumentParsed={mockOnDocumentParsed}
          supportedTypes={['contract']}
        />
      );
      const validFile = createMockFile('contract.pdf', 1000, 'application/pdf');
      const fileInput = screen.getByLabelText(/choose file/i);
      await user.upload(fileInput, validFile);
      await waitFor(() => {
        expect(screen.getByText(/Document Preview/i)).toBeInTheDocument();
        expect(screen.getByText(/Document Information/i)).toBeInTheDocument();
      }, { timeout: 10000 });
    });
    it('displays document metadata in preview', async () => {
      const user = userEvent.setup();
      render()
        <LegalDocumentParser
          onDocumentParsed={mockOnDocumentParsed}
          supportedTypes={['contract']}
        />
      );
      const validFile = createMockFile('contract.pdf', 1000, 'application/pdf');
      const fileInput = screen.getByLabelText(/choose file/i);
      await user.upload(fileInput, validFile);
      await waitFor(() => {
        expect(screen.getByText(/Document Type:/i)).toBeInTheDocument();
        expect(screen.getByText(/Jurisdiction:/i)).toBeInTheDocument();
        expect(screen.getByText(/Practice Areas:/i)).toBeInTheDocument();
        expect(screen.getByText(/Parties:/i)).toBeInTheDocument();
      }, { timeout: 10000 });
    });
    it('shows extracted content preview', async () => {
      const user = userEvent.setup();
      render()
        <LegalDocumentParser
          onDocumentParsed={mockOnDocumentParsed}
          supportedTypes={['contract']}
        />
      );
      const validFile = createMockFile('contract.pdf', 1000, 'application/pdf');
      const fileInput = screen.getByLabelText(/choose file/i);
      await user.upload(fileInput, validFile);
      await waitFor(() => {
        expect(screen.getByText(/Content Preview/i)).toBeInTheDocument();
        expect(screen.getByText(/This is a comprehensive/i)).toBeInTheDocument();
      }, { timeout: 10000 });
    });
    it('allows editing document metadata', async () => {
      const user = userEvent.setup();
      render()
        <LegalDocumentParser
          onDocumentParsed={mockOnDocumentParsed}
          supportedTypes={['contract']}
        />
      );
      const validFile = createMockFile('contract.pdf', 1000, 'application/pdf');
      const fileInput = screen.getByLabelText(/choose file/i);
      await user.upload(fileInput, validFile);
      await waitFor(async () => {
        const editButton = screen.getByText(/Edit Metadata/i);
        await user.click(editButton);
        expect(screen.getByLabelText(/Document Title/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Document Type/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Jurisdiction/i)).toBeInTheDocument();
      }, { timeout: 10000 });
    });
  });
  describe('Document Type Detection', () => {
    it('detects contract documents', async () => {
      const user = userEvent.setup();
      render()
        <LegalDocumentParser
          onDocumentParsed={mockOnDocumentParsed}
          supportedTypes={['contract', 'policy']}
        />
      );
      const contractFile = createMockFile(;)
        'service-contract.pdf', 
        1000, 
        'application/pdf', 
        'This agreement establishes terms between parties for services'
      );
      const fileInput = screen.getByLabelText(/choose file/i);
      await user.upload(fileInput, contractFile);
      await waitFor(() => {
        expect(mockOnDocumentParsed).toHaveBeenCalledWith()
          expect.objectContaining({)
            type: 'contract',
          })
        );
      }, { timeout: 10000 });
    });
    it('detects policy documents', async () => {
      const user = userEvent.setup();
      render()
        <LegalDocumentParser
          onDocumentParsed={mockOnDocumentParsed}
          supportedTypes={['contract', 'policy']}
        />
      );
      const policyFile = createMockFile(;)
        'privacy-policy.pdf', 
        1000, 
        'application/pdf', 
        'This privacy policy describes data collection and usage'
      );
      const fileInput = screen.getByLabelText(/choose file/i);
      await user.upload(fileInput, policyFile);
      await waitFor(() => {
        expect(mockOnDocumentParsed).toHaveBeenCalledWith()
          expect.objectContaining({)
            type: 'policy',
          })
        );
      }, { timeout: 10000 });
    });
    it('falls back to generic type when detection fails', async () => {
      const user = userEvent.setup();
      render()
        <LegalDocumentParser
          onDocumentParsed={mockOnDocumentParsed}
          supportedTypes={['contract', 'policy']}
        />
      );
      const unknownFile = createMockFile(;)
        'unknown.pdf', 
        1000, 
        'application/pdf', 
        'Some generic legal text without clear type indicators'
      );
      const fileInput = screen.getByLabelText(/choose file/i);
      await user.upload(fileInput, unknownFile);
      await waitFor(() => {
        expect(mockOnDocumentParsed).toHaveBeenCalledWith()
          expect.objectContaining({)
            type: expect.oneOf(['contract', 'policy']) // Should default to first supported type
          })
        );
      }, { timeout: 10000 });
    });
  });
  describe('Error Handling', () => {
    it('handles parsing errors gracefully', async () => {
      const user = userEvent.setup();
      render()
        <LegalDocumentParser
          onDocumentParsed={mockOnDocumentParsed}
          supportedTypes={['contract']}
        />
      );
      const corruptFile = createMockFile('corrupt.pdf', 1000, 'application/pdf', '[CORRUPT]');
      const fileInput = screen.getByLabelText(/choose file/i);
      await user.upload(fileInput, corruptFile);
      await waitFor(() => {
        expect(screen.getByText(/Error parsing document/i)).toBeInTheDocument();
        expect(screen.getByText(/Unable to extract content/i)).toBeInTheDocument();
        expect(screen.getByText(/Try Again/i)).toBeInTheDocument();
      });
    });
    it('handles unsupported file formats', async () => {
      const user = userEvent.setup();
      render()
        <LegalDocumentParser
          onDocumentParsed={mockOnDocumentParsed}
          supportedTypes={['contract']}
        />
      );
      const unsupportedFile = createMockFile('test.rtf', 1000, 'application/rtf');
      const fileInput = screen.getByLabelText(/choose file/i);
      await user.upload(fileInput, unsupportedFile);
      expect(screen.getByText(/Invalid file type/i)).toBeInTheDocument();
    });
    it('shows retry option on parsing failure', async () => {
      const user = userEvent.setup();
      render()
        <LegalDocumentParser
          onDocumentParsed={mockOnDocumentParsed}
          supportedTypes={['contract']}
        />
      );
      const corruptFile = createMockFile('corrupt.pdf', 1000, 'application/pdf', '[CORRUPT]');
      const fileInput = screen.getByLabelText(/choose file/i);
      await user.upload(fileInput, corruptFile);
      await waitFor(async () => {
        const retryButton = screen.getByText(/Try Again/i);
        expect(retryButton).toBeInTheDocument();
        await user.click(retryButton);
        expect(screen.getByText(/Upload Document/i)).toBeInTheDocument();
      });
    });
    it('clears error state when new file is uploaded', async () => {
      const user = userEvent.setup();
      render()
        <LegalDocumentParser
          onDocumentParsed={mockOnDocumentParsed}
          supportedTypes={['contract']}
        />
      );
      // Upload corrupt file first
      const corruptFile = createMockFile('corrupt.pdf', 1000, 'application/pdf', '[CORRUPT]');
      const fileInput = screen.getByLabelText(/choose file/i);
      await user.upload(fileInput, corruptFile);
      await waitFor(() => {
        expect(screen.getByText(/Error parsing document/i)).toBeInTheDocument();
      });
      // Upload valid file
      const validFile = createMockFile('contract.pdf', 1000, 'application/pdf');
      await user.upload(fileInput, validFile);
      expect(screen.queryByText(/Error parsing document/i)).not.toBeInTheDocument();
      expect(screen.getByText(/Parsing document/i)).toBeInTheDocument();
    });
  });
  describe('Drag and Drop Support', () => {
    it('handles drag over events', async () => {
      render()
        <LegalDocumentParser
          onDocumentParsed={mockOnDocumentParsed}
          supportedTypes={['contract']}
        />
      );
      const dropZone = screen.getByTestId('upload-dropzone');
      fireEvent.dragOver(dropZone, {)
        dataTransfer: {,
          types: ['Files'],
        }
      });
      expect(dropZone).toHaveClass('drag-over');
    });
    it('handles file drop events', async () => {
      render()
        <LegalDocumentParser
          onDocumentParsed={mockOnDocumentParsed}
          supportedTypes={['contract']}
        />
      );
      const dropZone = screen.getByTestId('upload-dropzone');
      const validFile = createMockFile('contract.pdf', 1000, 'application/pdf');
      fireEvent.drop(dropZone, {)
        dataTransfer: {,
          files: [validFile],
        }
      });
      await waitFor(() => {
        expect(screen.getByText(/Parsing document/i)).toBeInTheDocument();
      });
    });
    it('provides visual feedback during drag operations', async () => {
      render()
        <LegalDocumentParser
          onDocumentParsed={mockOnDocumentParsed}
          supportedTypes={['contract']}
        />
      );
      const dropZone = screen.getByTestId('upload-dropzone');
      fireEvent.dragEnter(dropZone);
      expect(dropZone).toHaveClass('drag-active');
      fireEvent.dragLeave(dropZone);
      expect(dropZone).not.toHaveClass('drag-active');
    });
  });
  describe('Accessibility', () => {
    it('provides proper ARIA labels', () => {
      render()
        <LegalDocumentParser
          onDocumentParsed={mockOnDocumentParsed}
          supportedTypes={['contract']}
        />
      );
      expect(screen.getByLabelText(/Choose file/i)).toBeInTheDocument();
      expect(screen.getByRole('region', { name: /upload area/i })).toBeInTheDocument();
    });
    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      render()
        <LegalDocumentParser
          onDocumentParsed={mockOnDocumentParsed}
          supportedTypes={['contract']}
        />
      );
      await user.tab();
      expect(screen.getByLabelText(/Choose file/i)).toHaveFocus();
    });
    it('announces upload progress to screen readers', async () => {
      const user = userEvent.setup();
      render()
        <LegalDocumentParser
          onDocumentParsed={mockOnDocumentParsed}
          supportedTypes={['contract']}
        />
      );
      const validFile = createMockFile('contract.pdf', 1000, 'application/pdf');
      const fileInput = screen.getByLabelText(/choose file/i);
      await user.upload(fileInput, validFile);
      expect(screen.getByRole('status')).toHaveTextContent(/Parsing document/i);
    });
  });
  describe('Custom Class Names', () => {
    it('applies custom className correctly', () => {
      const { container } = render()
        <LegalDocumentParser
          onDocumentParsed={mockOnDocumentParsed}
          supportedTypes={['contract']}
          className="custom-document-parser"
        />
      );
      const parserDiv = container.querySelector('.legal-document-parser');
      expect(parserDiv).toHaveClass('legal-document-parser', 'custom-document-parser');
    });
  });
});