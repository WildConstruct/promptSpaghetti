/**
 * Citation Manager Component Tests
 * Epic 28.3 - Legal & Regulatory Toolkit
 * 
 * Unit tests for the CitationManager component including
 * citation CRUD operations, formatting, and validation.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { CitationManager } from '../CitationManager';
import { Citation } from '../types';

// Mock data
const mockCitations: Citation[] = [
  {
    id: '1',
    type: 'bluebook',
    shortForm: 'Brown v. Board',
    longForm: 'Brown v. Board of Education, 347 U.S. 483 (1954)',
    court: 'U.S. Supreme Court',
    date: '1954',
    volume: '347',
    reporter: 'U.S.',
    page: '483'
  },
  {
    id: '2',
    type: 'alwd',
    shortForm: 'Miranda Rights',
    longForm: 'Miranda v. Arizona, 384 U.S. 436 (1966)',
    court: 'U.S. Supreme Court',
    date: '1966',
    url: 'https://example.com/miranda'
  }
];


describe('CitationManager Component', () => {
  const mockOnCitationAdd = jest.fn<unknown[], unknown>();
  const mockOnCitationEdit = jest.fn<unknown[], unknown>();
  const mockOnCitationDelete = jest.fn<unknown[], unknown>();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Rendering', () => {
    it('renders citation manager interface', () => {
      render(
        <CitationManager
          citations={[]}
          onCitationAdd={mockOnCitationAdd}
          onCitationEdit={mockOnCitationEdit}
          onCitationDelete={mockOnCitationDelete}
          citationStyle="bluebook"
        />
      );

      expect(screen.getByText(/Citation Management/i)).toBeInTheDocument();
      expect(screen.getByText(/Add New Citation/i)).toBeInTheDocument();
    });

    it('displays existing citations', () => {
      render(
        <CitationManager
          citations={mockCitations}
          onCitationAdd={mockOnCitationAdd}
          onCitationEdit={mockOnCitationEdit}
          onCitationDelete={mockOnCitationDelete}
          citationStyle="bluebook"
        />
      );

      expect(screen.getByText('Brown v. Board')).toBeInTheDocument();
      expect(screen.getByText('Miranda Rights')).toBeInTheDocument();
      expect(screen.getByText(/2 Citations/i)).toBeInTheDocument();
    });

    it('shows empty state when no citations exist', () => {
      render(
        <CitationManager
          citations={[]}
          onCitationAdd={mockOnCitationAdd}
          onCitationEdit={mockOnCitationEdit}
          onCitationDelete={mockOnCitationDelete}
          citationStyle="bluebook"
        />
      );

      expect(screen.getByText(/No citations added yet/i)).toBeInTheDocument();
      expect(screen.getByText(/Add your first citation/i)).toBeInTheDocument();
    });
  });

  describe('Citation Display', () => {
    it('displays citation details correctly', () => {
      render(
        <CitationManager
          citations={mockCitations}
          onCitationAdd={mockOnCitationAdd}
          onCitationEdit={mockOnCitationEdit}
          onCitationDelete={mockOnCitationDelete}
          citationStyle="bluebook"
        />
      );

      // Check first citation details
      expect(screen.getByText('Brown v. Board')).toBeInTheDocument();
      expect(screen.getByText('Brown v. Board of Education, 347 U.S. 483 (1954)')).toBeInTheDocument();
      expect(screen.getByText('U.S. Supreme Court')).toBeInTheDocument();
      expect(screen.getByText('1954')).toBeInTheDocument();
    });

    it('shows different citation styles correctly', () => {
      const { rerender } = render(
        <CitationManager
          citations={mockCitations}
          onCitationAdd={mockOnCitationAdd}
          onCitationEdit={mockOnCitationEdit}
          onCitationDelete={mockOnCitationDelete}
          citationStyle="bluebook"
        />
      );

      expect(screen.getByText(/Bluebook Style/i)).toBeInTheDocument();

      rerender(
        <CitationManager
          citations={mockCitations}
          onCitationAdd={mockOnCitationAdd}
          onCitationEdit={mockOnCitationEdit}
          onCitationDelete={mockOnCitationDelete}
          citationStyle="alwd"
        />
      );

      expect(screen.getByText(/ALWD Style/i)).toBeInTheDocument();
    });

    it('displays URLs when available', () => {
      render(
        <CitationManager
          citations={mockCitations}
          onCitationAdd={mockOnCitationAdd}
          onCitationEdit={mockOnCitationEdit}
          onCitationDelete={mockOnCitationDelete}
          citationStyle="bluebook"
        />
      );

      const urlLink = screen.getByText('https://example.com/miranda');
      expect(urlLink).toBeInTheDocument();
      expect(urlLink).toHaveAttribute('href', 'https://example.com/miranda');
    });
  });

  describe('Adding Citations', () => {
    it('opens add citation form when Add New Citation is clicked', async () => {
      const user = userEvent.setup();
      render(
        <CitationManager
          citations={[]}
          onCitationAdd={mockOnCitationAdd}
          onCitationEdit={mockOnCitationEdit}
          onCitationDelete={mockOnCitationDelete}
          citationStyle="bluebook"
        />
      );

      const addButton = screen.getByText(/Add New Citation/i);
      await user.click(addButton);

      expect(screen.getByLabelText(/Short Form/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Long Form/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Court/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Date/i)).toBeInTheDocument();
    });

    it('fills and submits add citation form', async () => {
      const user = userEvent.setup();
      render(
        <CitationManager
          citations={[]}
          onCitationAdd={mockOnCitationAdd}
          onCitationEdit={mockOnCitationEdit}
          onCitationDelete={mockOnCitationDelete}
          citationStyle="bluebook"
        />
      );

      // Open add form
      const addButton = screen.getByText(/Add New Citation/i);
      await user.click(addButton);

      // Fill form
      await user.type(screen.getByLabelText(/Short Form/i), 'Roe v. Wade');
      await user.type(screen.getByLabelText(/Long Form/i), 'Roe v. Wade, 410 U.S. 113 (1973)');
      await user.type(screen.getByLabelText(/Court/i), 'U.S. Supreme Court');
      await user.type(screen.getByLabelText(/Date/i), '1973');

      // Submit form
      const saveButton = screen.getByText(/Save Citation/i);
      await user.click(saveButton);

      expect(mockOnCitationAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'bluebook',
          shortForm: 'Roe v. Wade',
          longForm: 'Roe v. Wade, 410 U.S. 113 (1973)',
          court: 'U.S. Supreme Court',
          date: '1973'
        })
      );
    });

    it('validates required fields before submission', async () => {
      const user = userEvent.setup();
      render(
        <CitationManager
          citations={[]}
          onCitationAdd={mockOnCitationAdd}
          onCitationEdit={mockOnCitationEdit}
          onCitationDelete={mockOnCitationDelete}
          citationStyle="bluebook"
        />
      );

      const addButton = screen.getByText(/Add New Citation/i);
      await user.click(addButton);

      // Try to submit without filling required fields
      const saveButton = screen.getByText(/Save Citation/i);
      await user.click(saveButton);

      expect(screen.getByText(/Short form is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Long form is required/i)).toBeInTheDocument();
      expect(mockOnCitationAdd).not.toHaveBeenCalled();
    });

    it('cancels add citation form', async () => {
      const user = userEvent.setup();
      render(
        <CitationManager
          citations={[]}
          onCitationAdd={mockOnCitationAdd}
          onCitationEdit={mockOnCitationEdit}
          onCitationDelete={mockOnCitationDelete}
          citationStyle="bluebook"
        />
      );

      const addButton = screen.getByText(/Add New Citation/i);
      await user.click(addButton);

      const cancelButton = screen.getByText(/Cancel/i);
      await user.click(cancelButton);

      expect(screen.queryByLabelText(/Short Form/i)).not.toBeInTheDocument();
      expect(mockOnCitationAdd).not.toHaveBeenCalled();
    });
  });

  describe('Editing Citations', () => {
    it('opens edit form when edit button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <CitationManager
          citations={mockCitations}
          onCitationAdd={mockOnCitationAdd}
          onCitationEdit={mockOnCitationEdit}
          onCitationDelete={mockOnCitationDelete}
          citationStyle="bluebook"
        />
      );

      const editButtons = screen.getAllByLabelText(/Edit citation/i);
      await user.click(editButtons[0]);

      expect(screen.getByDisplayValue('Brown v. Board')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Brown v. Board of Education, 347 U.S. 483 (1954)')).toBeInTheDocument();
    });

    it('saves edited citation', async () => {
      const user = userEvent.setup();
      render(
        <CitationManager
          citations={mockCitations}
          onCitationAdd={mockOnCitationAdd}
          onCitationEdit={mockOnCitationEdit}
          onCitationDelete={mockOnCitationDelete}
          citationStyle="bluebook"
        />
      );

      const editButtons = screen.getAllByLabelText(/Edit citation/i);
      await user.click(editButtons[0]);

      // Edit the short form
      const shortFormInput = screen.getByDisplayValue('Brown v. Board');
      await user.clear(shortFormInput);
      await user.type(shortFormInput, 'Brown v. Board (Updated)');

      const saveButton = screen.getByText(/Save Citation/i);
      await user.click(saveButton);

      expect(mockOnCitationEdit).toHaveBeenCalledWith('1', expect.objectContaining({
        shortForm: 'Brown v. Board (Updated)'
      }));
    });

    it('cancels edit without saving changes', async () => {
      const user = userEvent.setup();
      render(
        <CitationManager
          citations={mockCitations}
          onCitationAdd={mockOnCitationAdd}
          onCitationEdit={mockOnCitationEdit}
          onCitationDelete={mockOnCitationDelete}
          citationStyle="bluebook"
        />
      );

      const editButtons = screen.getAllByLabelText(/Edit citation/i);
      await user.click(editButtons[0]);

      // Make changes
      const shortFormInput = screen.getByDisplayValue('Brown v. Board');
      await user.clear(shortFormInput);
      await user.type(shortFormInput, 'Changed Title');

      // Cancel without saving
      const cancelButton = screen.getByText(/Cancel/i);
      await user.click(cancelButton);

      expect(mockOnCitationEdit).not.toHaveBeenCalled();
      expect(screen.getByText('Brown v. Board')).toBeInTheDocument();
    });
  });

  describe('Deleting Citations', () => {
    it('shows delete confirmation dialog', async () => {
      const user = userEvent.setup();
      render(
        <CitationManager
          citations={mockCitations}
          onCitationAdd={mockOnCitationAdd}
          onCitationEdit={mockOnCitationEdit}
          onCitationDelete={mockOnCitationDelete}
          citationStyle="bluebook"
        />
      );

      const deleteButtons = screen.getAllByLabelText(/Delete citation/i);
      await user.click(deleteButtons[0]);

      expect(screen.getByText(/Are you sure you want to delete this citation/i)).toBeInTheDocument();
      expect(screen.getByText(/This action cannot be undone/i)).toBeInTheDocument();
    });

    it('deletes citation when confirmed', async () => {
      const user = userEvent.setup();
      render(
        <CitationManager
          citations={mockCitations}
          onCitationAdd={mockOnCitationAdd}
          onCitationEdit={mockOnCitationEdit}
          onCitationDelete={mockOnCitationDelete}
          citationStyle="bluebook"
        />
      );

      const deleteButtons = screen.getAllByLabelText(/Delete citation/i);
      await user.click(deleteButtons[0]);

      const confirmButton = screen.getByText(/Delete/i);
      await user.click(confirmButton);

      expect(mockOnCitationDelete).toHaveBeenCalledWith('1');
    });

    it('cancels deletion', async () => {
      const user = userEvent.setup();
      render(
        <CitationManager
          citations={mockCitations}
          onCitationAdd={mockOnCitationAdd}
          onCitationEdit={mockOnCitationEdit}
          onCitationDelete={mockOnCitationDelete}
          citationStyle="bluebook"
        />
      );

      const deleteButtons = screen.getAllByLabelText(/Delete citation/i);
      await user.click(deleteButtons[0]);

      const cancelButton = screen.getByText(/Cancel/i);
      await user.click(cancelButton);

      expect(mockOnCitationDelete).not.toHaveBeenCalled();
      expect(screen.queryByText(/Are you sure you want to delete/i)).not.toBeInTheDocument();
    });
  });

  describe('Citation Formatting', () => {
    it('formats citations according to selected style', () => {
      render(
        <CitationManager
          citations={mockCitations}
          onCitationAdd={mockOnCitationAdd}
          onCitationEdit={mockOnCitationEdit}
          onCitationDelete={mockOnCitationDelete}
          citationStyle="bluebook"
        />
      );

      // Bluebook style should show specific formatting
      expect(screen.getByText('Brown v. Board of Education, 347 U.S. 483 (1954)')).toBeInTheDocument();
    });

    it('displays pinpoint citations when available', () => {
      const citationWithPinpoint: Citation[] = [{
        ...mockCitations[0],
        pinpoint: 'at 495'
      }];

      render(
        <CitationManager
          citations={citationWithPinpoint}
          onCitationAdd={mockOnCitationAdd}
          onCitationEdit={mockOnCitationEdit}
          onCitationDelete={mockOnCitationDelete}
          citationStyle="bluebook"
        />
      );

      expect(screen.getByText(/at 495/)).toBeInTheDocument();
    });
  });

  describe('Search and Filtering', () => {
    it('filters citations by search term', async () => {
      const user = userEvent.setup();
      render(
        <CitationManager
          citations={mockCitations}
          onCitationAdd={mockOnCitationAdd}
          onCitationEdit={mockOnCitationEdit}
          onCitationDelete={mockOnCitationDelete}
          citationStyle="bluebook"
        />
      );

      const searchInput = screen.getByPlaceholderText(/Search citations/i);
      await user.type(searchInput, 'Brown');

      expect(screen.getByText('Brown v. Board')).toBeInTheDocument();
      expect(screen.queryByText('Miranda Rights')).not.toBeInTheDocument();
    });

    it('shows all citations when search is cleared', async () => {
      const user = userEvent.setup();
      render(
        <CitationManager
          citations={mockCitations}
          onCitationAdd={mockOnCitationAdd}
          onCitationEdit={mockOnCitationEdit}
          onCitationDelete={mockOnCitationDelete}
          citationStyle="bluebook"
        />
      );

      const searchInput = screen.getByPlaceholderText(/Search citations/i);
      await user.type(searchInput, 'Brown');
      await user.clear(searchInput);

      expect(screen.getByText('Brown v. Board')).toBeInTheDocument();
      expect(screen.getByText('Miranda Rights')).toBeInTheDocument();
    });

    it('shows no results message when search yields no matches', async () => {
      const user = userEvent.setup();
      render(
        <CitationManager
          citations={mockCitations}
          onCitationAdd={mockOnCitationAdd}
          onCitationEdit={mockOnCitationEdit}
          onCitationDelete={mockOnCitationDelete}
          citationStyle="bluebook"
        />
      );

      const searchInput = screen.getByPlaceholderText(/Search citations/i);
      await user.type(searchInput, 'NonexistentCase');

      expect(screen.getByText(/No citations found matching/i)).toBeInTheDocument();
    });
  });

  describe('Sorting', () => {
    it('sorts citations by date', async () => {
      const user = userEvent.setup();
      render(
        <CitationManager
          citations={mockCitations}
          onCitationAdd={mockOnCitationAdd}
          onCitationEdit={mockOnCitationEdit}
          onCitationDelete={mockOnCitationDelete}
          citationStyle="bluebook"
        />
      );

      const sortSelect = screen.getByLabelText(/Sort by/i);
      await user.selectOptions(sortSelect, 'date');

      // Citations should be reordered by date
      const citationElements = screen.getAllByTestId(/citation-item/i);
      expect(citationElements[0]).toHaveTextContent('Brown v. Board'); // 1954 comes before 1966
      expect(citationElements[1]).toHaveTextContent('Miranda Rights');
    });

    it('sorts citations alphabetically', async () => {
      const user = userEvent.setup();
      render(
        <CitationManager
          citations={mockCitations}
          onCitationAdd={mockOnCitationAdd}
          onCitationEdit={mockOnCitationEdit}
          onCitationDelete={mockOnCitationDelete}
          citationStyle="bluebook"
        />
      );

      const sortSelect = screen.getByLabelText(/Sort by/i);
      await user.selectOptions(sortSelect, 'title');

      // Citations should be ordered alphabetically
      const citationElements = screen.getAllByTestId(/citation-item/i);
      expect(citationElements[0]).toHaveTextContent('Brown v. Board');
      expect(citationElements[1]).toHaveTextContent('Miranda Rights');
    });
  });

  describe('Export Functionality', () => {
    it('exports citations in selected format', async () => {
      const user = userEvent.setup();
      render(
        <CitationManager
          citations={mockCitations}
          onCitationAdd={mockOnCitationAdd}
          onCitationEdit={mockOnCitationEdit}
          onCitationDelete={mockOnCitationDelete}
          citationStyle="bluebook"
        />
      );

      const exportButton = screen.getByText(/Export Citations/i);
      await user.click(exportButton);

      const exportMenu = screen.getByText(/Export as BibTeX/i);
      expect(exportMenu).toBeInTheDocument();
      expect(screen.getByText(/Export as JSON/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('provides proper ARIA labels', () => {
      render(
        <CitationManager
          citations={mockCitations}
          onCitationAdd={mockOnCitationAdd}
          onCitationEdit={mockOnCitationEdit}
          onCitationDelete={mockOnCitationDelete}
          citationStyle="bluebook"
        />
      );

      expect(screen.getByLabelText(/Search citations/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Sort by/i)).toBeInTheDocument();
      expect(screen.getAllByLabelText(/Edit citation/i)).toHaveLength(2);
      expect(screen.getAllByLabelText(/Delete citation/i)).toHaveLength(2);
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      render(
        <CitationManager
          citations={mockCitations}
          onCitationAdd={mockOnCitationAdd}
          onCitationEdit={mockOnCitationEdit}
          onCitationDelete={mockOnCitationDelete}
          citationStyle="bluebook"
        />
      );

      // Tab through interactive elements
      await user.tab();
      expect(screen.getByPlaceholderText(/Search citations/i)).toHaveFocus();

      await user.tab();
      expect(screen.getByLabelText(/Sort by/i)).toHaveFocus();
    });

    it('announces changes to screen readers', async () => {
      const user = userEvent.setup();
      render(
        <CitationManager
          citations={[]}
          onCitationAdd={mockOnCitationAdd}
          onCitationEdit={mockOnCitationEdit}
          onCitationDelete={mockOnCitationDelete}
          citationStyle="bluebook"
        />
      );

      const addButton = screen.getByText(/Add New Citation/i);
      await user.click(addButton);

      expect(screen.getByRole('dialog', { name: /Add New Citation/i })).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles invalid citation data gracefully', () => {
      const invalidCitation: Citation = {
        id: 'invalid',
        type: 'bluebook',
        shortForm: '',
        longForm: '',
      } as Citation;

      render(
        <CitationManager
          citations={[invalidCitation]}
          onCitationAdd={mockOnCitationAdd}
          onCitationEdit={mockOnCitationEdit}
          onCitationDelete={mockOnCitationDelete}
          citationStyle="bluebook"
        />
      );

      expect(screen.getByText(/Invalid citation data/i)).toBeInTheDocument();
    });

    it('handles callback errors gracefully', async () => {
      const errorCallback = jest.fn(() => {
        throw new Error('Callback error');
      });
      
      const user = userEvent.setup();
      render(
        <CitationManager
          citations={[]}
          onCitationAdd={errorCallback}
          onCitationEdit={mockOnCitationEdit}
          onCitationDelete={mockOnCitationDelete}
          citationStyle="bluebook"
        />
      );

      const addButton = screen.getByText(/Add New Citation/i);
      await user.click(addButton);

      // Fill and submit form
      await user.type(screen.getByLabelText(/Short Form/i), 'Test');
      await user.type(screen.getByLabelText(/Long Form/i), 'Test Citation');

      const saveButton = screen.getByText(/Save Citation/i);
      await user.click(saveButton);

      expect(screen.getByText(/Error saving citation/i)).toBeInTheDocument();
    });
  });

  describe('Custom Class Names', () => {
    it('applies custom className correctly', () => {
      const { container } = render(
        <CitationManager
          citations={mockCitations}
          onCitationAdd={mockOnCitationAdd}
          onCitationEdit={mockOnCitationEdit}
          onCitationDelete={mockOnCitationDelete}
          citationStyle="bluebook"
          className="custom-citation-manager"
        />
      );

      const managerDiv = container.querySelector('.citation-manager');
      expect(managerDiv).toHaveClass('citation-manager', 'custom-citation-manager');
    });
  });
});