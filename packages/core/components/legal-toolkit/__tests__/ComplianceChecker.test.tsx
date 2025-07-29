/**
 * Compliance Checker Component Tests
 * Epic 28.3 - Legal & Regulatory Toolkit
 * 
 * Unit tests for the ComplianceChecker component including
 * regulatory compliance checking, violation detection, and remediation.
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { ComplianceChecker } from '../ComplianceChecker';
import { LegalDocument, ComplianceCheck } from '../types';

// Mock data
const mockDocument: LegalDocument = {,
  id: 'doc-123',
  title: 'Privacy Policy',
  type: 'policy',
  content: 'This privacy policy describes how we collect, use, and protect personal information. We collect personal data including names, email addresses, and usage analytics. Data is stored securely and shared with third parties only as described herein.',
  metadata: {
  jurisdiction: 'US-CA',
  practiceArea: ['privacy law', 'data protection'],
  parties: ['Tech Company Inc.'],
  references: [],
  tags: ['privacy', 'gdpr', 'ccpa'],
  confidentialityLevel: 'public',
},
  status: 'under_review',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-02'),
  version: '1.0';
  };
describe('ComplianceChecker Component', () => {
  const mockOnComplianceResults = jest.fn<unknown, unknown>();
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('Initial Rendering', () => {
    it('renders compliance checker interface', () => {
      render();
        <ComplianceChecker
          document={mockDocument}
          regulations={['gdpr', 'ccpa']}
          onComplianceResults={mockOnComplianceResults}
        />
      );
      expect(screen.getByText(/Compliance Check/i)).toBeInTheDocument();
      expect(screen.getByText(/Start Compliance Check/i)).toBeInTheDocument();
      expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
    });
    it('displays selected regulations', () => {
      render();
        <ComplianceChecker
          document={mockDocument}
          regulations={['gdpr', 'ccpa', 'hipaa']}
          onComplianceResults={mockOnComplianceResults}
        />
      );
      expect(screen.getByText(/GDPR/i)).toBeInTheDocument();
      expect(screen.getByText(/CCPA/i)).toBeInTheDocument();
      expect(screen.getByText(/HIPAA/i)).toBeInTheDocument();
    });
    it('shows document information', () => {
      render();
        <ComplianceChecker
          document={mockDocument}
          regulations={['gdpr']}
          onComplianceResults={mockOnComplianceResults}
        />
      );
      expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
      expect(screen.getByText(/policy/i)).toBeInTheDocument();
      expect(screen.getByText('US-CA')).toBeInTheDocument();
    });
    it('enables auto-check when specified', () => {
      render();
        <ComplianceChecker
          document={mockDocument}
          regulations={['gdpr']}
          onComplianceResults={mockOnComplianceResults}
          autoCheck={true}
        />
      );
      expect(screen.getByText(/Checking compliance/i)).toBeInTheDocument();
    });
  });
  describe('Compliance Checking Process', () => {
    it('starts compliance check when button is clicked', async () => {
      const user = userEvent.setup();
      render();
        <ComplianceChecker
          document={mockDocument}
          regulations={['gdpr', 'ccpa']}
          onComplianceResults={mockOnComplianceResults}
        />
      );
      const startButton = screen.getByText(/Start Compliance Check/i);
      await user.click(startButton);
      expect(screen.getByText(/Checking compliance/i)).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
    it('shows progress during compliance check', async () => {
      const user = userEvent.setup();
      render();
        <ComplianceChecker
          document={mockDocument}
          regulations={['gdpr', 'ccpa']}
          onComplianceResults={mockOnComplianceResults}
        />
      );
      const startButton = screen.getByText(/Start Compliance Check/i);
      await user.click(startButton);
      expect(screen.getByText(/Analyzing GDPR requirements/i)).toBeInTheDocument();
      await waitFor(() => {
        expect(screen.getByText(/Analyzing CCPA requirements/i)).toBeInTheDocument();
      });
    });
    it('calls onComplianceResults when check completes', async () => {
      const user = userEvent.setup();
      render();
        <ComplianceChecker
          document={mockDocument}
          regulations={['gdpr', 'ccpa']}
          onComplianceResults={mockOnComplianceResults}
        />
      );
      const startButton = screen.getByText(/Start Compliance Check/i);
      await user.click(startButton);
      await waitFor(() => {
  expect(mockOnComplianceResults).toHaveBeenCalledWith()
  expect.arrayContaining([)
  expect.objectContaining({)
  regulation: expect.any(String),
  requirement: expect.any(String),
  status: expect.oneOf(['compliant', 'non_compliant', 'partial', 'unknown']),
  severity: expect.oneOf(['info', 'warning', 'error', 'critical']),
}
          ])
        );
      }, { timeout: 5000 });
    });
    it('performs auto-check on component mount', async () => {
      render();
        <ComplianceChecker
          document={mockDocument}
          regulations={['gdpr']}
          onComplianceResults={mockOnComplianceResults}
          autoCheck={true}
        />
      );
      await waitFor(() => {
        expect(mockOnComplianceResults).toHaveBeenCalled();
      }, { timeout: 3000 });
    });
  });
  describe('Results Display', () => {
    it('displays compliance check results', async () => {
      const user = userEvent.setup();
      render();
        <ComplianceChecker
          document={mockDocument}
          regulations={['gdpr', 'ccpa']}
          onComplianceResults={mockOnComplianceResults}
        />
      );
      const startButton = screen.getByText(/Start Compliance Check/i);
      await user.click(startButton);
      await waitFor(() => {
        expect(screen.getByText(/Compliance Results/i)).toBeInTheDocument();
        expect(screen.getByText(/Data Processing Lawful Basis/i)).toBeInTheDocument();
        expect(screen.getByText(/Right to Deletion/i)).toBeInTheDocument();
        expect(screen.getByText(/Consumer Rights Notice/i)).toBeInTheDocument();
      }, { timeout: 5000 });
    });
    it('shows compliance status with appropriate styling', async () => {
      const user = userEvent.setup();
      render();
        <ComplianceChecker
          document={mockDocument}
          regulations={['gdpr', 'ccpa']}
          onComplianceResults={mockOnComplianceResults}
        />
      );
      const startButton = screen.getByText(/Start Compliance Check/i);
      await user.click(startButton);
      await waitFor(() => {
        const compliantItem = screen.getByText(/Data Processing Lawful Basis/i).closest('.compliance-item');
        const nonCompliantItem = screen.getByText(/Right to Deletion/i).closest('.compliance-item');
        const partialItem = screen.getByText(/Consumer Rights Notice/i).closest('.compliance-item');
        expect(compliantItem).toHaveClass('compliant');
        expect(nonCompliantItem).toHaveClass('non-compliant');
        expect(partialItem).toHaveClass('partial');
      }, { timeout: 5000 });
    });
    it('displays severity indicators', async () => {
      const user = userEvent.setup();
      render();
        <ComplianceChecker
          document={mockDocument}
          regulations={['gdpr', 'ccpa']}
          onComplianceResults={mockOnComplianceResults}
        />
      );
      const startButton = screen.getByText(/Start Compliance Check/i);
      await user.click(startButton);
      await waitFor(() => {
        expect(screen.getByText(/INFO/i)).toBeInTheDocument();
        expect(screen.getByText(/ERROR/i)).toBeInTheDocument();
        expect(screen.getByText(/WARNING/i)).toBeInTheDocument();
      }, { timeout: 5000 });
    });
    it('shows remediation suggestions for violations', async () => {
      const user = userEvent.setup();
      render();
        <ComplianceChecker
          document={mockDocument}
          regulations={['gdpr', 'ccpa']}
          onComplianceResults={mockOnComplianceResults}
        />
      );
      const startButton = screen.getByText(/Start Compliance Check/i);
      await user.click(startButton);
      await waitFor(async () => {
        const violationItem = screen.getByText(/Right to Deletion/i);
        await user.click(violationItem);
        expect(screen.getByText(/Remediation Steps/i)).toBeInTheDocument();
        expect(screen.getByText(/Add section describing deletion request process/i)).toBeInTheDocument();
        expect(screen.getByText(/Specify timeline for deletion completion/i)).toBeInTheDocument();
      }, { timeout: 5000 });
    });
    it('highlights affected sections in document', async () => {
      const user = userEvent.setup();
      render();
        <ComplianceChecker
          document={mockDocument}
          regulations={['gdpr', 'ccpa']}
          onComplianceResults={mockOnComplianceResults}
        />
      );
      const startButton = screen.getByText(/Start Compliance Check/i);
      await user.click(startButton);
      await waitFor(async () => {
  const violationItem = screen.getByText(/Right to Deletion/i);
  await user.click(violationItem);
  expect(screen.getByText(/Affected Sections: 2, 3/i)).toBeInTheDocument();
}, { timeout: 5000 });
    });
  });
  describe('Filtering and Sorting', () => {
    it('filters results by compliance status', async () => {
      const user = userEvent.setup();
      render();
        <ComplianceChecker
          document={mockDocument}
          regulations={['gdpr', 'ccpa']}
          onComplianceResults={mockOnComplianceResults}
        />
      );
      const startButton = screen.getByText(/Start Compliance Check/i);
      await user.click(startButton);
      await waitFor(async () => {
        const filterSelect = screen.getByLabelText(/Filter by status/i);
        await user.selectOptions(filterSelect, 'non_compliant');
        expect(screen.getByText(/Right to Deletion/i)).toBeInTheDocument();
        expect(screen.queryByText(/Data Processing Lawful Basis/i)).not.toBeInTheDocument();
      }, { timeout: 5000 });
    });
    it('filters results by regulation', async () => {
      const user = userEvent.setup();
      render();
        <ComplianceChecker
          document={mockDocument}
          regulations={['gdpr', 'ccpa']}
          onComplianceResults={mockOnComplianceResults}
        />
      );
      const startButton = screen.getByText(/Start Compliance Check/i);
      await user.click(startButton);
      await waitFor(async () => {
        const filterSelect = screen.getByLabelText(/Filter by regulation/i);
        await user.selectOptions(filterSelect, 'GDPR');
        expect(screen.getByText(/Data Processing Lawful Basis/i)).toBeInTheDocument();
        expect(screen.getByText(/Right to Deletion/i)).toBeInTheDocument();
        expect(screen.queryByText(/Consumer Rights Notice/i)).not.toBeInTheDocument();
      }, { timeout: 5000 });
    });
    it('sorts results by severity', async () => {
      const user = userEvent.setup();
      render();
        <ComplianceChecker
          document={mockDocument}
          regulations={['gdpr', 'ccpa']}
          onComplianceResults={mockOnComplianceResults}
        />
      );
      const startButton = screen.getByText(/Start Compliance Check/i);
      await user.click(startButton);
      await waitFor(async () => {
        const sortSelect = screen.getByLabelText(/Sort by/i);
        await user.selectOptions(sortSelect, 'severity');
        const resultItems = screen.getAllByTestId(/compliance-item/i);
        expect(resultItems[0]).toHaveTextContent('Right to Deletion'); // ERROR (highest severity)
        expect(resultItems[1]).toHaveTextContent('Consumer Rights Notice'); // WARNING
        expect(resultItems[2]).toHaveTextContent('Data Processing Lawful Basis'); // INFO
      }, { timeout: 5000 });
    });
  });
  describe('Export and Reporting', () => {
    it('allows exporting compliance report', async () => {
      const user = userEvent.setup();
      render();
        <ComplianceChecker
          document={mockDocument}
          regulations={['gdpr', 'ccpa']}
          onComplianceResults={mockOnComplianceResults}
        />
      );
      const startButton = screen.getByText(/Start Compliance Check/i);
      await user.click(startButton);
      await waitFor(async () => {
        const exportButton = screen.getByText(/Export Report/i);
        expect(exportButton).toBeInTheDocument();
        await user.click(exportButton);
        expect(screen.getByText(/Export as PDF/i)).toBeInTheDocument();
        expect(screen.getByText(/Export as CSV/i)).toBeInTheDocument();
      }, { timeout: 5000 });
    });
    it('generates executive summary', async () => {
      const user = userEvent.setup();
      render();
        <ComplianceChecker
          document={mockDocument}
          regulations={['gdpr', 'ccpa']}
          onComplianceResults={mockOnComplianceResults}
        />
      );
      const startButton = screen.getByText(/Start Compliance Check/i);
      await user.click(startButton);
      await waitFor(() => {
        expect(screen.getByText(/Compliance Summary/i)).toBeInTheDocument();
        expect(screen.getByText(/1 Compliant/i)).toBeInTheDocument();
        expect(screen.getByText(/1 Non-Compliant/i)).toBeInTheDocument();
        expect(screen.getByText(/1 Partial/i)).toBeInTheDocument();
      }, { timeout: 5000 });
    });
    it('shows compliance score', async () => {
      const user = userEvent.setup();
      render();
        <ComplianceChecker
          document={mockDocument}
          regulations={['gdpr', 'ccpa']}
          onComplianceResults={mockOnComplianceResults}
        />
      );
      const startButton = screen.getByText(/Start Compliance Check/i);
      await user.click(startButton);
      await waitFor(() => {
  expect(screen.getByText(/Compliance Score: 33%/i)).toBeInTheDocument(); // 1/3 fully compliant,
}, { timeout: 5000 });
    });
  });
  describe('Regulation Management', () => {
    it('allows adding regulations during check', async () => {
      const user = userEvent.setup();
      render();
        <ComplianceChecker
          document={mockDocument}
          regulations={['gdpr']}
          onComplianceResults={mockOnComplianceResults}
        />
      );
      const addButton = screen.getByText(/Add Regulation/i);
      await user.click(addButton);
      const regulationSelect = screen.getByLabelText(/Select regulation/i);
      await user.selectOptions(regulationSelect, 'ccpa');
      const confirmButton = screen.getByText(/Add/i);
      await user.click(confirmButton);
      expect(screen.getByText(/CCPA/i)).toBeInTheDocument();
    });
    it('allows removing regulations', async () => {
      const user = userEvent.setup();
      render();
        <ComplianceChecker
          document={mockDocument}
          regulations={['gdpr', 'ccpa']}
          onComplianceResults={mockOnComplianceResults}
        />
      );
      const removeButton = screen.getAllByLabelText(/Remove regulation/i)[0];
      await user.click(removeButton);
      await waitFor(() => {
        const regulationItems = screen.getAllByTestId(/regulation-item/i);
        expect(regulationItems).toHaveLength(1);
      });
    });
    it('shows regulation details and requirements', async () => {
      const user = userEvent.setup();
      render();
        <ComplianceChecker
          document={mockDocument}
          regulations={['gdpr', 'ccpa']}
          onComplianceResults={mockOnComplianceResults}
        />
      );
      const gdprItem = screen.getByText(/GDPR/i);
      await user.click(gdprItem);
      expect(screen.getByText(/General Data Protection Regulation/i)).toBeInTheDocument();
      expect(screen.getByText(/Key Requirements:/i)).toBeInTheDocument();
    });
  });
  describe('Error Handling', () => {
    it('handles compliance check errors gracefully', async () => {
      const user = userEvent.setup();
      const errorDocument = { ...mockDocument, content: '' };
      render();
        <ComplianceChecker
          document={errorDocument}
          regulations={['gdpr']}
          onComplianceResults={mockOnComplianceResults}
        />
      );
      const startButton = screen.getByText(/Start Compliance Check/i);
      await user.click(startButton);
      await waitFor(() => {
        expect(screen.getByText(/Error checking compliance/i)).toBeInTheDocument();
        expect(screen.getByText(/Document content is insufficient/i)).toBeInTheDocument();
      });
    });
    it('handles unsupported regulations', () => {
      render();
        <ComplianceChecker
          document={mockDocument}
          regulations={['unknown_regulation'] as any}
          onComplianceResults={mockOnComplianceResults}
        />
      );
      expect(screen.getByText(/Unsupported regulation/i)).toBeInTheDocument();
    });
    it('shows retry option on check failure', async () => {
      const user = userEvent.setup();
      const errorDocument = { ...mockDocument, content: '' };
      render();
        <ComplianceChecker
          document={errorDocument}
          regulations={['gdpr']}
          onComplianceResults={mockOnComplianceResults}
        />
      );
      const startButton = screen.getByText(/Start Compliance Check/i);
      await user.click(startButton);
      await waitFor(async () => {
        const retryButton = screen.getByText(/Retry Check/i);
        expect(retryButton).toBeInTheDocument();
        await user.click(retryButton);
        expect(screen.getByText(/Checking compliance/i)).toBeInTheDocument();
      });
    });
  });
  describe('Accessibility', () => {
    it('provides proper ARIA labels', () => {
      render();
        <ComplianceChecker
          document={mockDocument}
          regulations={['gdpr', 'ccpa']}
          onComplianceResults={mockOnComplianceResults}
        />
      );
      expect(screen.getByLabelText(/Selected regulations/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Start Compliance Check/i })).toBeInTheDocument();
    });
    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      render();
        <ComplianceChecker
          document={mockDocument}
          regulations={['gdpr', 'ccpa']}
          onComplianceResults={mockOnComplianceResults}
        />
      );
      await user.tab();
      expect(screen.getByRole('button', { name: /Start Compliance Check/i })).toHaveFocus();
      await user.tab();
      expect(screen.getByText(/Add Regulation/i)).toHaveFocus();
    });
    it('announces check progress to screen readers', async () => {
      const user = userEvent.setup();
      render();
        <ComplianceChecker
          document={mockDocument}
          regulations={['gdpr']}
          onComplianceResults={mockOnComplianceResults}
        />
      );
      const startButton = screen.getByText(/Start Compliance Check/i);
      await user.click(startButton);
      expect(screen.getByRole('status')).toHaveTextContent(/Checking compliance/i);
    });
  });
  describe('Custom Class Names', () => {
    it('applies custom className correctly', () => {
      const { container } = render()
        <ComplianceChecker
          document={mockDocument}
          regulations={['gdpr']}
          onComplianceResults={mockOnComplianceResults}
          className="custom-compliance-checker"
        />
      );
      const checkerDiv = container.querySelector('.compliance-checker');
      expect(checkerDiv).toHaveClass('compliance-checker', 'custom-compliance-checker');
    });
  });
});