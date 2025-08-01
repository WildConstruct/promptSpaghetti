/**
 * Terminology Validator Component Tests
 * Epic 28.3 - Legal & Regulatory Toolkit
 * 
 * Unit tests for the TerminologyValidator component including
 * legal term validation, suggestions, and terminology management.
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { TerminologyValidator } from '../TerminologyValidator';
import { TermValidationResult, LegalTerminology } from '../types';

// Mock data
const mockText = 'This contract establishes consideration for services provided. The parties agree to indemnify each other against claims. Force majeure events shall excuse non-performance. This agreement is governed by jurisdiction laws.';
        definition: 'To compensate for harm or loss; to provide security against legal responsibility',
        context: 'liability',
        jurisdiction: 'US',
        source: 'Legal Dictionary'],
    confidence: 92,
    context: 'liability';

  { term: 'force majeure' }
    position: { start: 115, end: 128 },
    isValid: false,
    suggestions: [
      { term: 'force majeure',
  definition: 'Superior or irresistible force; unforeseeable circumstances',
  context: 'contract performance',
  jurisdiction: 'US',
  source: 'Black\'s Law Dictionary',
  alternatives: ['act of God', 'unforeseeable circumstances', 'superior force']],
  confidence: 88,
  context: 'contract performance' }

  { term: 'jurisdiction' }
    position: { start: 200, end: 212 },
    isValid: true,
    suggestions: [
      { term: 'jurisdiction',
  definition: 'The power and authority of a court to hear and determine a case',
  context: 'legal authority',
  jurisdiction: 'US',
  source: 'Black\'s Law Dictionary'],
  confidence: 97 }
  context: 'legal authority'];
  describe('TerminologyValidator Component', () => { const mockOnValidationResults = jest.fn<unknown, unknown>();
  beforeEach(() => {
  jest.clearAllMocks() });
  describe('Initial Rendering', () => {
    it('renders terminology validator interface', () => {
      render();
        <TerminologyValidator
          text={mockText}
          onValidationResults={mockOnValidationResults}
        />
      );
      expect(screen.getByText(/Legal Terminology Validation/i)).toBeInTheDocument();
      expect(screen.getByText(/Validate Terms/i)).toBeInTheDocument();
      expect(screen.getByText(/Text to validate:/i)).toBeInTheDocument();
    });
    it('displays text content correctly', () => {
      render();
        <TerminologyValidator
          text={mockText}
          onValidationResults={mockOnValidationResults}
        />
      );
      expect(screen.getByText(/This contract establishes consideration/)).toBeInTheDocument();
    });
    it('shows jurisdiction when provided', () => {
      render();
        <TerminologyValidator
          text={mockText}
          onValidationResults={mockOnValidationResults}
          jurisdiction="US-CA"
        />
      );
      expect(screen.getByText(/Jurisdiction: US-CA/i)).toBeInTheDocument();
    });
    it('shows practice area when provided', () => {
      render();
        <TerminologyValidator
          text={mockText}
          onValidationResults={mockOnValidationResults}
          practiceArea="contract law"
        />
      );
      expect(screen.getByText(/Practice Area: contract law/i)).toBeInTheDocument();
    });
    it('starts auto-validation when enabled', () => {
      render();
        <TerminologyValidator
          text={mockText}
          onValidationResults={mockOnValidationResults}
          autoValidate={true}
        />
      );
      expect(screen.getByText(/Validating terminology/i)).toBeInTheDocument();
    });
  });
  describe('Validation Process', () => {
    it('starts validation when button is clicked', async () => {
      const user = userEvent.setup();
      render();
        <TerminologyValidator
          text={mockText}
          onValidationResults={mockOnValidationResults}
        />
      );
      const validateButton = screen.getByText(/Validate Terms/i);
      await user.click(validateButton);
      expect(screen.getByText(/Validating terminology/i)).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
    it('shows progress during validation', async () => {
      const user = userEvent.setup();
      render();
        <TerminologyValidator
          text={mockText}
          onValidationResults={mockOnValidationResults}
        />
      );
      const validateButton = screen.getByText(/Validate Terms/i);
      await user.click(validateButton);
      expect(screen.getByText(/Analyzing legal terms/i)).toBeInTheDocument();
      await waitFor(() => { expect(screen.getByText(/Checking definitions/i)).toBeInTheDocument() });
    });
    it('calls onValidationResults when validation completes', async () => {
      const user = userEvent.setup();
      render();
        <TerminologyValidator
          text={mockText}
          onValidationResults={mockOnValidationResults}
        />
      );
      const validateButton = screen.getByText(/Validate Terms/i);
      await user.click(validateButton);
      await waitFor(() => { expect(mockOnValidationResults).toHaveBeenCalledWith()
  expect.arrayContaining([)
  expect.objectContaining({)
  term: expect.any(String)
  position: expect.objectContaining({)
  start: expect.any(Number)
  end: expect.any(Number) }
})
              isValid: expect.any(Boolean)
              suggestions: expect.any(Array)
              confidence: expect.any(Number)
              context: expect.any(String);

          ])
        );
      }, { timeout: 5000 });
    });
    it('performs auto-validation on component mount', async () => {
      render();
        <TerminologyValidator
          text={mockText}
          onValidationResults={mockOnValidationResults}
          autoValidate={true}
        />
      );
      await waitFor(() => { expect(mockOnValidationResults).toHaveBeenCalled() }, { timeout: 3000 });
    });
  });
  describe('Results Display', () => {
    it('displays validation results', async () => {
      const user = userEvent.setup();
      render();
        <TerminologyValidator
          text={mockText}
          onValidationResults={mockOnValidationResults}
        />
      );
      const validateButton = screen.getByText(/Validate Terms/i);
      await user.click(validateButton);
      await waitFor(() => { expect(screen.getByText(/Validation Results/i)).toBeInTheDocument();
        expect(screen.getByText(/consideration/i)).toBeInTheDocument();
        expect(screen.getByText(/indemnify/i)).toBeInTheDocument();
        expect(screen.getByText(/force majeure/i)).toBeInTheDocument();
        expect(screen.getByText(/jurisdiction/i)).toBeInTheDocument() }, { timeout: 5000 });
    });
    it('highlights terms in text', async () => {
      const user = userEvent.setup();
      render();
        <TerminologyValidator
          text={mockText}
          onValidationResults={mockOnValidationResults}
        />
      );
      const validateButton = screen.getByText(/Validate Terms/i);
      await user.click(validateButton);
      await waitFor(() => { const highlightedTerms = screen.getAllByTestId(/highlighted-term/i);
        expect(highlightedTerms.length).toBeGreaterThan(0);
        expect(screen.getByText('consideration')).toHaveClass('valid-term');
        expect(screen.getByText('force majeure')).toHaveClass('invalid-term') }, { timeout: 5000 });
    });
    it('shows validation status with appropriate styling', async () => {
      const user = userEvent.setup();
      render();
        <TerminologyValidator
          text={mockText}
          onValidationResults={mockOnValidationResults}
        />
      );
      const validateButton = screen.getByText(/Validate Terms/i);
      await user.click(validateButton);
      await waitFor(() => { const validTerms = screen.getAllByTestId(/valid-term/i);
        const invalidTerms = screen.getAllByTestId(/invalid-term/i);
        expect(validTerms.length).toBe(3); // consideration, indemnify, jurisdiction
        expect(invalidTerms.length).toBe(1); // force majeure
        validTerms.forEach(term => {)
  expect(term).toHaveClass('valid') });
        invalidTerms.forEach(term => { )
  expect(term).toHaveClass('invalid') });
      }, { timeout: 5000 });
    });
    it('displays confidence scores', async () => {
      const user = userEvent.setup();
      render();
        <TerminologyValidator
          text={mockText}
          onValidationResults={mockOnValidationResults}
        />
      );
      const validateButton = screen.getByText(/Validate Terms/i);
      await user.click(validateButton);
      await waitFor(() => {
        expect(screen.getByText(/95%/)).toBeInTheDocument(); // consideration confidence
        expect(screen.getByText(/92%/)).toBeInTheDocument(); // indemnify confidence
        expect(screen.getByText(/88%/)).toBeInTheDocument(); // force majeure confidence
        expect(screen.getByText(/97%/)).toBeInTheDocument(); // jurisdiction confidence
      }, { timeout: 5000 });
    });
  });
  describe('Term Details and Suggestions', () => {
    it('shows term definitions when clicked', async () => {
      const user = userEvent.setup();
      render();
        <TerminologyValidator
          text={mockText}
          onValidationResults={mockOnValidationResults}
        />
      );
      const validateButton = screen.getByText(/Validate Terms/i);
      await user.click(validateButton);
      await waitFor(async () => { const considerationTerm = screen.getByTestId(/term-consideration/i);
        await user.click(considerationTerm);
        expect(screen.getByText(/Something of value exchanged between parties/i)).toBeInTheDocument();
        expect(screen.getByText(/Black's Law Dictionary/i)).toBeInTheDocument();
        expect(screen.getByText(/contract formation/i)).toBeInTheDocument() }, { timeout: 5000 });
    });
    it('displays alternative suggestions for invalid terms', async () => {
      const user = userEvent.setup();
      render();
        <TerminologyValidator
          text={mockText}
          onValidationResults={mockOnValidationResults}
        />
      );
      const validateButton = screen.getByText(/Validate Terms/i);
      await user.click(validateButton);
      await waitFor(async () => { const forceMajeureTerm = screen.getByTestId(/term-force-majeure/i);
  await user.click(forceMajeureTerm);
  expect(screen.getByText(/Alternatives:/i)).toBeInTheDocument();
  expect(screen.getByText(/act of God/i)).toBeInTheDocument();
  expect(screen.getByText(/unforeseeable circumstances/i)).toBeInTheDocument();
  expect(screen.getByText(/superior force/i)).toBeInTheDocument() }, { timeout: 5000 });
    });
    it('allows copying correct term suggestions', async () => {
      const user = userEvent.setup();
      render();
        <TerminologyValidator
          text={mockText}
          onValidationResults={mockOnValidationResults}
        />
      );
      const validateButton = screen.getByText(/Validate Terms/i);
      await user.click(validateButton);
      await waitFor(async () => { const forceMajeureTerm = screen.getByTestId(/term-force-majeure/i);
        await user.click(forceMajeureTerm);
        const copyButton = screen.getByText(/Copy "act of God"/i);
        await user.click(copyButton);
        expect(screen.getByText(/Copied to clipboard/i)).toBeInTheDocument() }, { timeout: 5000 });
    });
    it('shows contextual information', async () => {
      const user = userEvent.setup();
      render();
        <TerminologyValidator
          text={mockText}
          onValidationResults={mockOnValidationResults}
        />
      );
      const validateButton = screen.getByText(/Validate Terms/i);
      await user.click(validateButton);
      await waitFor(async () => { const indemnifyTerm = screen.getByTestId(/term-indemnify/i);
  await user.click(indemnifyTerm);
  expect(screen.getByText(/Context: liability/i)).toBeInTheDocument();
  expect(screen.getByText(/Jurisdiction: US/i)).toBeInTheDocument() }, { timeout: 5000 });
    });
  });
  describe('Filtering and Search', () => {
    it('filters terms by validity status', async () => {
      const user = userEvent.setup();
      render();
        <TerminologyValidator
          text={mockText}
          onValidationResults={mockOnValidationResults}
        />
      );
      const validateButton = screen.getByText(/Validate Terms/i);
      await user.click(validateButton);
      await waitFor(async () => { const filterSelect = screen.getByLabelText(/Filter by status/i);
        await user.selectOptions(filterSelect, 'invalid');
        expect(screen.getByText(/force majeure/i)).toBeInTheDocument();
        expect(screen.queryByText(/consideration/i)).not.toBeInTheDocument() }, { timeout: 5000 });
    });
    it('filters terms by context', async () => {
      const user = userEvent.setup();
      render();
        <TerminologyValidator
          text={mockText}
          onValidationResults={mockOnValidationResults}
        />
      );
      const validateButton = screen.getByText(/Validate Terms/i);
      await user.click(validateButton);
      await waitFor(async () => { const filterSelect = screen.getByLabelText(/Filter by context/i);
        await user.selectOptions(filterSelect, 'contract formation');
        expect(screen.getByText(/consideration/i)).toBeInTheDocument();
        expect(screen.queryByText(/indemnify/i)).not.toBeInTheDocument() }, { timeout: 5000 });
    });
    it('searches terms by name', async () => {
      const user = userEvent.setup();
      render();
        <TerminologyValidator
          text={mockText}
          onValidationResults={mockOnValidationResults}
        />
      );
      const validateButton = screen.getByText(/Validate Terms/i);
      await user.click(validateButton);
      await waitFor(async () => { const searchInput = screen.getByPlaceholderText(/Search terms/i);
        await user.type(searchInput, 'force');
        expect(screen.getByText(/force majeure/i)).toBeInTheDocument();
        expect(screen.queryByText(/consideration/i)).not.toBeInTheDocument() }, { timeout: 5000 });
    });
    it('sorts terms by confidence', async () => {
      const user = userEvent.setup();
      render();
        <TerminologyValidator
          text={mockText}
          onValidationResults={mockOnValidationResults}
        />
      );
      const validateButton = screen.getByText(/Validate Terms/i);
      await user.click(validateButton);
      await waitFor(async () => {
        const sortSelect = screen.getByLabelText(/Sort by/i);
        await user.selectOptions(sortSelect, 'confidence');
        const termItems = screen.getAllByTestId(/term-item/i);
        expect(termItems[0]).toHaveTextContent('jurisdiction'); // 97% confidence
        expect(termItems[1]).toHaveTextContent('consideration'); // 95% confidence
        expect(termItems[2]).toHaveTextContent('indemnify'); // 92% confidence
        expect(termItems[3]).toHaveTextContent('force majeure'); // 88% confidence
      }, { timeout: 5000 });
    });
  });
  describe('Text Editing and Re-validation', () => {
    it('allows editing text and re-validating', async () => {
      const user = userEvent.setup();
      render();
        <TerminologyValidator
          text={mockText}
          onValidationResults={mockOnValidationResults}
        />
      );
      const editButton = screen.getByText(/Edit Text/i);
      await user.click(editButton);
      const textArea = screen.getByRole('textbox');
      await user.clear(textArea);
      await user.type(textArea, 'New contract with consideration and liability clauses.');
      const validateButton = screen.getByText(/Validate Terms/i);
      await user.click(validateButton);
      await waitFor(() => { expect(mockOnValidationResults).toHaveBeenCalled() }, { timeout: 3000 });
    });
    it('updates validation when text changes', async () => {
      const user = userEvent.setup();
      const { rerender } = render()
        <TerminologyValidator
          text={mockText}
          onValidationResults={mockOnValidationResults}
          autoValidate={true}
        />
      );
      await waitFor(() => { expect(mockOnValidationResults).toHaveBeenCalled() });
      mockOnValidationResults.mockClear();
      rerender();
        <TerminologyValidator
          text="Different text with new legal terms like estoppel."
          onValidationResults={mockOnValidationResults}
          autoValidate={true}
        />
      );
      await waitFor(() => { expect(mockOnValidationResults).toHaveBeenCalled() });
    });
  });
  describe('Export and Reporting', () => {
    it('allows exporting validation results', async () => {
      const user = userEvent.setup();
      render();
        <TerminologyValidator
          text={mockText}
          onValidationResults={mockOnValidationResults}
        />
      );
      const validateButton = screen.getByText(/Validate Terms/i);
      await user.click(validateButton);
      await waitFor(async () => { const exportButton = screen.getByText(/Export Results/i);
        expect(exportButton).toBeInTheDocument();
        await user.click(exportButton);
        expect(screen.getByText(/Export as CSV/i)).toBeInTheDocument();
        expect(screen.getByText(/Export as JSON/i)).toBeInTheDocument() }, { timeout: 5000 });
    });
    it('generates terminology report', async () => {
      const user = userEvent.setup();
      render();
        <TerminologyValidator
          text={mockText}
          onValidationResults={mockOnValidationResults}
        />
      );
      const validateButton = screen.getByText(/Validate Terms/i);
      await user.click(validateButton);
      await waitFor(() => {
        expect(screen.getByText(/Validation Summary/i)).toBeInTheDocument();
        expect(screen.getByText(/4 Terms Analyzed/i)).toBeInTheDocument();
        expect(screen.getByText(/3 Valid Terms/i)).toBeInTheDocument();
        expect(screen.getByText(/1 Invalid Term/i)).toBeInTheDocument();
        expect(screen.getByText(/75% Accuracy/i)).toBeInTheDocument(); // 3/4 valid
      }, { timeout: 5000 });
    });
  });
  describe('Error Handling', () => {
    it('handles validation errors gracefully', async () => {
      const user = userEvent.setup();
      render();
        <TerminologyValidator
          text=""
          onValidationResults={mockOnValidationResults}
        />
      );
      const validateButton = screen.getByText(/Validate Terms/i);
      await user.click(validateButton);
      await waitFor(() => { expect(screen.getByText(/Error validating terms/i)).toBeInTheDocument();
        expect(screen.getByText(/Text is empty or too short/i)).toBeInTheDocument() });
    });
    it('handles network errors during validation', async () => {
      const user = userEvent.setup();
      // Simulate network error by providing invalid text
      render();
        <TerminologyValidator
          text="[NETWORK_ERROR]"
          onValidationResults={mockOnValidationResults}
        />
      );
      const validateButton = screen.getByText(/Validate Terms/i);
      await user.click(validateButton);
      await waitFor(() => { expect(screen.getByText(/Network error/i)).toBeInTheDocument();
        expect(screen.getByText(/Retry Validation/i)).toBeInTheDocument() });
    });
    it('shows retry option on validation failure', async () => {
      const user = userEvent.setup();
      render();
        <TerminologyValidator
          text=""
          onValidationResults={mockOnValidationResults}
        />
      );
      const validateButton = screen.getByText(/Validate Terms/i);
      await user.click(validateButton);
      await waitFor(async () => { const retryButton = screen.getByText(/Retry Validation/i);
        expect(retryButton).toBeInTheDocument();
        await user.click(retryButton);
        expect(screen.getByText(/Validating terminology/i)).toBeInTheDocument() });
    });
  });
  describe('Accessibility', () => {
    it('provides proper ARIA labels', () => {
      render();
        <TerminologyValidator
          text={mockText}
          onValidationResults={mockOnValidationResults}
        />
      );
      expect(screen.getByLabelText(/Text to validate/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Validate Terms/i })).toBeInTheDocument();
    });
    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      render();
        <TerminologyValidator
          text={mockText}
          onValidationResults={mockOnValidationResults}
        />
      );
      await user.tab();
      expect(screen.getByRole('button', { name: /Validate Terms/i })).toHaveFocus();
      await user.tab();
      expect(screen.getByText(/Edit Text/i)).toHaveFocus();
    });
    it('announces validation progress to screen readers', async () => {
      const user = userEvent.setup();
      render();
        <TerminologyValidator
          text={mockText}
          onValidationResults={mockOnValidationResults}
        />
      );
      const validateButton = screen.getByText(/Validate Terms/i);
      await user.click(validateButton);
      expect(screen.getByRole('status')).toHaveTextContent(/Validating terminology/i);
    });
    it('provides keyboard shortcuts for common actions', async () => {
      const user = userEvent.setup();
      render();
        <TerminologyValidator
          text={mockText}
          onValidationResults={mockOnValidationResults}
        />
      );
      // Test Ctrl+Enter to validate
      await user.keyboard('{Control>}{Enter}{/Control}');
      expect(screen.getByText(/Validating terminology/i)).toBeInTheDocument();
    });
  });
  describe('Custom Class Names', () => {
    it('applies custom className correctly', () => {
      const { container } = render()
        <TerminologyValidator
          text={mockText}
          onValidationResults={mockOnValidationResults}
          className="custom-terminology-validator"
        />
      );
      const validatorDiv = container.querySelector('.terminology-validator');
      expect(validatorDiv).toHaveClass('terminology-validator', 'custom-terminology-validator');
    });
  });
});