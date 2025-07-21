/**
 * Legal Toolkit Component Tests
 * Epic 28.3 - Legal & Regulatory Toolkit
 * 
 * Comprehensive unit tests for the main LegalToolkit component
 * including workflow management, navigation, and integration tests.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { LegalToolkit } from '../LegalToolkit';
import { 
  LegalDocument, 
  ContractAnalysis, 
  ComplianceCheck, 
  Citation,
  TermValidationResult 
} from '../types';

// Mock child components
jest.mock('../LegalDocumentParser', () => ({
  LegalDocumentParser: ({ onDocumentParsed, supportedTypes }: unknown) => (
    <div data-testid="legal-document-parser">
      <button 
        onClick={() => onDocumentParsed(mockDocument)}
        data-testid="parse-document-btn"
      >
        Parse Document
      </button>
      <span data-testid="supported-types">{supportedTypes.join(',')}</span>
    </div>
  )
}));

jest.mock('../ContractAnalyzer', () => ({
  ContractAnalyzer: ({ document, onAnalysisComplete }: unknown) => (
    <div data-testid="contract-analyzer">
      <button 
        onClick={() => onAnalysisComplete(mockAnalysis)}
        data-testid="complete-analysis-btn"
      >
        Complete Analysis
      </button>
      <span data-testid="document-id">{document.id}</span>
    </div>
  )
}));

jest.mock('../ComplianceChecker', () => ({
  ComplianceChecker: ({ document, regulations, onComplianceResults }: unknown) => (
    <div data-testid="compliance-checker">
      <button 
        onClick={() => onComplianceResults(mockComplianceResults)}
        data-testid="check-compliance-btn"
      >
        Check Compliance
      </button>
      <span data-testid="regulations">{regulations.join(',')}</span>
    </div>
  )
}));

jest.mock('../CitationManager', () => ({
  CitationManager: ({ citations, onCitationAdd, onCitationEdit, onCitationDelete }: unknown) => (
    <div data-testid="citation-manager">
      <button 
        onClick={() => onCitationAdd(mockCitation)}
        data-testid="add-citation-btn"
      >
        Add Citation
      </button>
      <button 
        onClick={() => onCitationEdit('1', { ...mockCitation, shortForm: 'Updated' })}
        data-testid="edit-citation-btn"
      >
        Edit Citation
      </button>
      <button 
        onClick={() => onCitationDelete('1')}
        data-testid="delete-citation-btn"
      >
        Delete Citation
      </button>
      <span data-testid="citation-count">{citations.length}</span>
    </div>
  )
}));

jest.mock('../TerminologyValidator', () => ({
  TerminologyValidator: ({ text, onValidationResults }: unknown) => (
    <div data-testid="terminology-validator">
      <button 
        onClick={() => onValidationResults(mockTerminologyResults)}
        data-testid="validate-terms-btn"
      >
        Validate Terms
      </button>
      <span data-testid="text-length">{text.length}</span>
    </div>
  )
}));

// Mock data
const mockDocument: LegalDocument = {
  id: 'doc-123',
  title: 'Test Contract',
  type: 'contract',
  content: 'This is a test contract content for legal analysis.',
  metadata: {
    jurisdiction: 'US-CA',
    practiceArea: ['contract law', 'commercial law'],
    parties: ['Party A', 'Party B'],
    references: [],
    tags: ['commercial', 'b2b'],
    confidentialityLevel: 'confidential'
  },
  status: 'draft',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-02'),
  version: '1.0'
};

const mockAnalysis: ContractAnalysis = {
  documentId: 'doc-123',
  clauses: [{
    id: 'clause-1',
    type: 'termination',
    title: 'Termination Clause',
    content: 'Either party may terminate...',
    category: 'termination',
    riskLevel: 'medium',
    standardCompliance: true,
    position: { start: 0, end: 100 }
  }],
  riskAssessment: {
    overallRisk: 'medium',
    riskFactors: [{
      type: 'termination',
      description: 'Termination clause risks',
      impact: 'medium',
      likelihood: 'low',
      mitigation: ['Review termination terms']
    }],
    mitigation: ['Review all clauses'],
    score: 65
  },
  complianceChecks: [],
  recommendations: ['Review termination clause'],
  confidence: 85,
  processingTime: 1500
};

const mockComplianceResults: ComplianceCheck[] = [{
  id: 'comp-1',
  regulation: 'GDPR',
  requirement: 'Data Protection',
  status: 'compliant',
  severity: 'info',
  description: 'Document complies with GDPR data protection requirements',
  affectedSections: [1, 2]
}];

const mockCitation: Citation = {
  id: '1',
  type: 'bluebook',
  shortForm: 'Test Citation',
  longForm: 'Test Citation v. Example, 123 F.3d 456 (2023)',
  court: 'Supreme Court',
  date: '2023'
};

const mockTerminologyResults: TermValidationResult[] = [{
  term: 'consideration',
  position: { start: 10, end: 22 },
  isValid: true,
  suggestions: [{
    term: 'consideration',
    definition: 'Something of value exchanged in a contract',
    context: 'contract law',
    jurisdiction: 'US',
    source: 'Black\'s Law Dictionary'
  }],
  confidence: 90,
  context: 'contract formation'
}];

describe('LegalToolkit Component', () => {
  const mockOnWorkflowComplete = jest.fn<unknown[], unknown>();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Rendering', () => {
    it('renders main toolkit interface correctly', () => {
      render(<LegalToolkit />);
      
      expect(screen.getByText('Legal & Regulatory Toolkit')).toBeInTheDocument();
      expect(screen.getByText(/Comprehensive document analysis/)).toBeInTheDocument();
      expect(screen.getByText('Workflow Progress')).toBeInTheDocument();
      expect(screen.getByText('0%')).toBeInTheDocument(); // Initial progress
    });

    it('renders all navigation tabs', () => {
      render(<LegalToolkit />);
      
      expect(screen.getByText('Upload Document')).toBeInTheDocument();
      expect(screen.getByText('Analyze Contract')).toBeInTheDocument();
      expect(screen.getByText('Check Compliance')).toBeInTheDocument();
      expect(screen.getByText('Manage Citations')).toBeInTheDocument();
      expect(screen.getByText('Validate Terminology')).toBeInTheDocument();
      expect(screen.getByText('Review Summary')).toBeInTheDocument();
    });

    it('starts with upload view active', () => {
      render(<LegalToolkit />);
      
      const uploadTab = screen.getByText('Upload Document').closest('button');
      expect(uploadTab).toHaveClass('active');
      expect(screen.getByTestId('legal-document-parser')).toBeInTheDocument();
    });

    it('initializes with correct initial document when provided', () => {
      render(<LegalToolkit initialDocument={mockDocument} />);
      
      const analyzeTab = screen.getByText('Analyze Contract').closest('button');
      expect(analyzeTab).toHaveClass('active');
      expect(screen.getByTestId('contract-analyzer')).toBeInTheDocument();
    });
  });

  describe('Navigation and View Management', () => {
    it('enables/disables navigation tabs correctly', () => {
      render(<LegalToolkit />);
      
      const analyzeTab = screen.getByText('Analyze Contract').closest('button');
      const complianceTab = screen.getByText('Check Compliance').closest('button');
      const terminologyTab = screen.getByText('Validate Terminology').closest('button');
      const summaryTab = screen.getByText('Review Summary').closest('button');
      const citationsTab = screen.getByText('Manage Citations').closest('button');
      
      // Without document, these should be disabled
      expect(analyzeTab).toHaveClass('disabled');
      expect(complianceTab).toHaveClass('disabled');
      expect(terminologyTab).toHaveClass('disabled');
      expect(summaryTab).toHaveClass('disabled');
      
      // Citations should always be enabled
      expect(citationsTab).not.toHaveClass('disabled');
    });

    it('navigates between views when tabs are clicked', async () => {
      const user = userEvent.setup();
      render(<LegalToolkit />);
      
      // Parse a document first to enable other tabs
      const parseBtn = screen.getByTestId('parse-document-btn');
      await user.click(parseBtn);
      
      await waitFor(() => {
        expect(screen.getByTestId('contract-analyzer')).toBeInTheDocument();
      });
      
      // Navigate to citations
      const citationsTab = screen.getByText('Manage Citations');
      await user.click(citationsTab);
      
      await waitFor(() => {
        expect(screen.getByTestId('citation-manager')).toBeInTheDocument();
      });
    });

    it('prevents navigation to disabled views', async () => {
      const user = userEvent.setup();
      render(<LegalToolkit />);
      
      const analyzeTab = screen.getByText('Analyze Contract').closest('button') as HTMLButtonElement;
      expect(analyzeTab.disabled).toBe(true);
      
      await user.click(analyzeTab);
      
      // Should still show document parser (upload view)
      expect(screen.getByTestId('legal-document-parser')).toBeInTheDocument();
    });
  });

  describe('Document Upload Workflow', () => {
    it('handles document parsing correctly', async () => {
      const user = userEvent.setup();
      render(<LegalToolkit />);
      
      const parseBtn = screen.getByTestId('parse-document-btn');
      await user.click(parseBtn);
      
      await waitFor(() => {
        expect(screen.getByTestId('contract-analyzer')).toBeInTheDocument();
        expect(screen.getByTestId('document-id')).toHaveTextContent('doc-123');
      });
    });

    it('updates progress after document upload', async () => {
      const user = userEvent.setup();
      render(<LegalToolkit />);
      
      const parseBtn = screen.getByTestId('parse-document-btn');
      await user.click(parseBtn);
      
      await waitFor(() => {
        expect(screen.getByText('20%')).toBeInTheDocument(); // 1/5 steps completed
      });
    });

    it('passes correct supported types to document parser', () => {
      render(<LegalToolkit />);
      
      const supportedTypesSpan = screen.getByTestId('supported-types');
      expect(supportedTypesSpan).toHaveTextContent('contract,policy,regulation,agreement,statute');
    });
  });

  describe('Contract Analysis Workflow', () => {
    it('performs contract analysis after document upload', async () => {
      const user = userEvent.setup();
      render(<LegalToolkit />);
      
      // Upload document first
      const parseBtn = screen.getByTestId('parse-document-btn');
      await user.click(parseBtn);
      
      await waitFor(() => {
        const analysisBtn = screen.getByTestId('complete-analysis-btn');
        return user.click(analysisBtn);
      });
      
      await waitFor(() => {
        expect(screen.getByText('40%')).toBeInTheDocument(); // 2/5 steps completed
      });
    });

    it('displays contract analyzer with correct document', async () => {
      const user = userEvent.setup();
      render(<LegalToolkit />);
      
      const parseBtn = screen.getByTestId('parse-document-btn');
      await user.click(parseBtn);
      
      await waitFor(() => {
        expect(screen.getByTestId('document-id')).toHaveTextContent('doc-123');
      });
    });
  });

  describe('Compliance Checking Workflow', () => {
    it('performs compliance checking', async () => {
      const user = userEvent.setup();
      render(<LegalToolkit />);
      
      // Upload document and navigate to compliance
      const parseBtn = screen.getByTestId('parse-document-btn');
      await user.click(parseBtn);
      
      await waitFor(async () => {
        const complianceTab = screen.getByText('Check Compliance');
        await user.click(complianceTab);
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('compliance-checker')).toBeInTheDocument();
      });
      
      const checkBtn = screen.getByTestId('check-compliance-btn');
      await user.click(checkBtn);
      
      await waitFor(() => {
        expect(screen.getByText('60%')).toBeInTheDocument(); // 3/5 steps completed
      });
    });

    it('passes correct regulations to compliance checker', async () => {
      const user = userEvent.setup();
      render(<LegalToolkit />);
      
      const parseBtn = screen.getByTestId('parse-document-btn');
      await user.click(parseBtn);
      
      await waitFor(async () => {
        const complianceTab = screen.getByText('Check Compliance');
        await user.click(complianceTab);
      });
      
      await waitFor(() => {
        const regulationsSpan = screen.getByTestId('regulations');
        expect(regulationsSpan).toHaveTextContent('gdpr,ccpa');
      });
    });
  });

  describe('Citation Management Workflow', () => {
    it('manages citations correctly', async () => {
      const user = userEvent.setup();
      render(<LegalToolkit />);
      
      const citationsTab = screen.getByText('Manage Citations');
      await user.click(citationsTab);
      
      await waitFor(() => {
        expect(screen.getByTestId('citation-manager')).toBeInTheDocument();
      });
      
      const addBtn = screen.getByTestId('add-citation-btn');
      await user.click(addBtn);
      
      await waitFor(() => {
        expect(screen.getByTestId('citation-count')).toHaveTextContent('1');
        expect(screen.getByText('80%')).toBeInTheDocument(); // 4/5 steps completed
      });
    });

    it('handles citation editing', async () => {
      const user = userEvent.setup();
      render(<LegalToolkit />);
      
      const citationsTab = screen.getByText('Manage Citations');
      await user.click(citationsTab);
      
      // Add a citation first
      const addBtn = screen.getByTestId('add-citation-btn');
      await user.click(addBtn);
      
      // Edit the citation
      const editBtn = screen.getByTestId('edit-citation-btn');
      await user.click(editBtn);
      
      // Citation should still be there (edited, not deleted)
      await waitFor(() => {
        expect(screen.getByTestId('citation-count')).toHaveTextContent('1');
      });
    });

    it('handles citation deletion', async () => {
      const user = userEvent.setup();
      render(<LegalToolkit />);
      
      const citationsTab = screen.getByText('Manage Citations');
      await user.click(citationsTab);
      
      // Add a citation first
      const addBtn = screen.getByTestId('add-citation-btn');
      await user.click(addBtn);
      
      // Delete the citation
      const deleteBtn = screen.getByTestId('delete-citation-btn');
      await user.click(deleteBtn);
      
      await waitFor(() => {
        expect(screen.getByTestId('citation-count')).toHaveTextContent('0');
      });
    });
  });

  describe('Terminology Validation Workflow', () => {
    it('validates terminology correctly', async () => {
      const user = userEvent.setup();
      render(<LegalToolkit />);
      
      // Upload document first
      const parseBtn = screen.getByTestId('parse-document-btn');
      await user.click(parseBtn);
      
      await waitFor(async () => {
        const terminologyTab = screen.getByText('Validate Terminology');
        await user.click(terminologyTab);
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('terminology-validator')).toBeInTheDocument();
      });
      
      const validateBtn = screen.getByTestId('validate-terms-btn');
      await user.click(validateBtn);
      
      await waitFor(() => {
        expect(screen.getByText('100%')).toBeInTheDocument(); // 5/5 steps completed
      });
    });

    it('passes document content to terminology validator', async () => {
      const user = userEvent.setup();
      render(<LegalToolkit />);
      
      const parseBtn = screen.getByTestId('parse-document-btn');
      await user.click(parseBtn);
      
      await waitFor(async () => {
        const terminologyTab = screen.getByText('Validate Terminology');
        await user.click(terminologyTab);
      });
      
      await waitFor(() => {
        const textLengthSpan = screen.getByTestId('text-length');
        expect(textLengthSpan).toHaveTextContent(mockDocument.content.length.toString());
      });
    });
  });

  describe('Summary View', () => {
    it('displays complete summary after full workflow', async () => {
      const user = userEvent.setup();
      render(<LegalToolkit />);
      
      // Complete full workflow
      const parseBtn = screen.getByTestId('parse-document-btn');
      await user.click(parseBtn);
      
      await waitFor(async () => {
        const analysisBtn = screen.getByTestId('complete-analysis-btn');
        await user.click(analysisBtn);
      });
      
      await waitFor(async () => {
        const complianceTab = screen.getByText('Check Compliance');
        await user.click(complianceTab);
      });
      
      await waitFor(async () => {
        const checkBtn = screen.getByTestId('check-compliance-btn');
        await user.click(checkBtn);
      });
      
      await waitFor(async () => {
        const citationsTab = screen.getByText('Manage Citations');
        await user.click(citationsTab);
      });
      
      await waitFor(async () => {
        const addBtn = screen.getByTestId('add-citation-btn');
        await user.click(addBtn);
      });
      
      await waitFor(async () => {
        const terminologyTab = screen.getByText('Validate Terminology');
        await user.click(terminologyTab);
      });
      
      await waitFor(async () => {
        const validateBtn = screen.getByTestId('validate-terms-btn');
        await user.click(validateBtn);
      });
      
      // Navigate to summary
      await waitFor(async () => {
        const summaryTab = screen.getByText('Review Summary');
        await user.click(summaryTab);
      });
      
      await waitFor(() => {
        expect(screen.getByText('📄 Document Summary')).toBeInTheDocument();
        expect(screen.getByText('🔍 Analysis Results')).toBeInTheDocument();
        expect(screen.getByText('✅ Compliance Status')).toBeInTheDocument();
        expect(screen.getByText('📚 Citations & Terminology')).toBeInTheDocument();
      });
    });

    it('shows document information in summary', async () => {
      const user = userEvent.setup();
      render(<LegalToolkit initialDocument={mockDocument} />);
      
      // Navigate to summary (enabled with initial document)
      const summaryTab = screen.getByText('Review Summary');
      await user.click(summaryTab);
      
      await waitFor(() => {
        expect(screen.getByText('contract')).toBeInTheDocument();
        expect(screen.getByText('US-CA')).toBeInTheDocument();
        expect(screen.getByText('contract law, commercial law')).toBeInTheDocument();
        expect(screen.getByText('draft')).toBeInTheDocument();
      });
    });
  });

  describe('Workflow Completion', () => {
    it('calls onWorkflowComplete when Export Results is clicked', async () => {
      const user = userEvent.setup();
      render(<LegalToolkit onWorkflowComplete={mockOnWorkflowComplete} />);
      
      // Complete minimal workflow to enable export
      const parseBtn = screen.getByTestId('parse-document-btn');
      await user.click(parseBtn);
      
      // Add some analysis data
      await waitFor(async () => {
        const analysisBtn = screen.getByTestId('complete-analysis-btn');
        await user.click(analysisBtn);
      });
      
      // Add citations
      await waitFor(async () => {
        const citationsTab = screen.getByText('Manage Citations');
        await user.click(citationsTab);
      });
      
      await waitFor(async () => {
        const addBtn = screen.getByTestId('add-citation-btn');
        await user.click(addBtn);
      });
      
      // Complete terminology validation to reach 100%
      await waitFor(async () => {
        const terminologyTab = screen.getByText('Validate Terminology');
        await user.click(terminologyTab);
      });
      
      await waitFor(async () => {
        const validateBtn = screen.getByTestId('validate-terms-btn');
        await user.click(validateBtn);
      });
      
      await waitFor(() => {
        const exportBtn = screen.getByText('Export Results');
        return user.click(exportBtn);
      });
      
      await waitFor(() => {
        expect(mockOnWorkflowComplete).toHaveBeenCalledWith({
          document: mockDocument,
          analysis: mockAnalysis,
          complianceResults: undefined,
          citations: [mockCitation],
          terminologyResults: mockTerminologyResults
        });
      });
    });

    it('enables export button only when workflow is complete', async () => {
      const user = userEvent.setup();
      render(<LegalToolkit />);
      
      // Initially no export button
      expect(screen.queryByText('Export Results')).not.toBeInTheDocument();
      
      // After partial completion, still no export button
      const parseBtn = screen.getByTestId('parse-document-btn');
      await user.click(parseBtn);
      
      await waitFor(() => {
        expect(screen.queryByText('Export Results')).not.toBeInTheDocument();
      });
    });

    it('allows starting new document workflow', async () => {
      const user = userEvent.setup();
      render(<LegalToolkit />);
      
      const newDocBtn = screen.getByText('Start New Document');
      await user.click(newDocBtn);
      
      await waitFor(() => {
        expect(screen.getByTestId('legal-document-parser')).toBeInTheDocument();
        const uploadTab = screen.getByText('Upload Document').closest('button');
        expect(uploadTab).toHaveClass('active');
      });
    });
  });

  describe('Progress Calculation', () => {
    it('calculates progress correctly based on completed steps', async () => {
      const user = userEvent.setup();
      render(<LegalToolkit />);
      
      // Start with 0%
      expect(screen.getByText('0%')).toBeInTheDocument();
      
      // Upload document: 20%
      const parseBtn = screen.getByTestId('parse-document-btn');
      await user.click(parseBtn);
      
      await waitFor(() => {
        expect(screen.getByText('20%')).toBeInTheDocument();
      });
      
      // Complete analysis: 40%
      const analysisBtn = screen.getByTestId('complete-analysis-btn');
      await user.click(analysisBtn);
      
      await waitFor(() => {
        expect(screen.getByText('40%')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('handles missing document gracefully', () => {
      render(<LegalToolkit />);
      
      const analyzeTab = screen.getByText('Analyze Contract').closest('button');
      expect(analyzeTab).toHaveClass('disabled');
      expect(analyzeTab).toHaveAttribute('disabled');
    });

    it('handles empty citations list', () => {
      render(<LegalToolkit />);
      
      const citationsTab = screen.getByText('Manage Citations');
      fireEvent.click(citationsTab);
      
      expect(screen.getByTestId('citation-count')).toHaveTextContent('0');
    });

    it('handles empty terminology results', async () => {
      const user = userEvent.setup();
      render(<LegalToolkit initialDocument={mockDocument} />);
      
      const summaryTab = screen.getByText('Review Summary');
      await user.click(summaryTab);
      
      await waitFor(() => {
        expect(screen.getByText('0')).toBeInTheDocument(); // Terms validated count
        expect(screen.getByText('0%')).toBeInTheDocument(); // Term accuracy
      });
    });
  });

  describe('Accessibility', () => {
    it('provides proper ARIA labels and roles', () => {
      render(<LegalToolkit />);
      
      const uploadTab = screen.getByText('Upload Document').closest('button');
      expect(uploadTab).toHaveAttribute('type', 'button');
      
      const progressBar = document.querySelector('.progress-bar');
      expect(progressBar).toBeInTheDocument();
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<LegalToolkit />);
      
      // Tab to navigation buttons
      await user.tab();
      const uploadTab = screen.getByText('Upload Document').closest('button');
      expect(uploadTab).toHaveFocus();
    });
  });

  describe('Responsive Design', () => {
    it('renders correctly on mobile viewports', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      });
      
      render(<LegalToolkit />);
      
      expect(screen.getByText('Legal & Regulatory Toolkit')).toBeInTheDocument();
      expect(screen.getByText('Upload Document')).toBeInTheDocument();
    });
  });

  describe('Custom Class Names', () => {
    it('applies custom className correctly', () => {
      const { container } = render(<LegalToolkit className="custom-toolkit" />);
      
      const toolkitDiv = container.querySelector('.legal-toolkit');
      expect(toolkitDiv).toHaveClass('legal-toolkit', 'custom-toolkit');
    });
  });
});