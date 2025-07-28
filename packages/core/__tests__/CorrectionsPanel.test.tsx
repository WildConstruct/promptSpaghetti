import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// import userEvent from '@testing-library/user-event'; // Using mock from jest.setup.js
import { CorrectionsPanel } from '../CorrectionsPanel';
import { useCorrectionsStore } from '../correctionsStore';

// Mock the corrections store
jest.mock('../correctionsStore', () => ({)
  useCorrectionsStore: jest.fn<unknown, unknown>(),
  useCorrectionsEnabled: jest.fn(() => true),
  DEFAULT_CORRECTION_RULES: [,
  {
  name: 'Fix Double Spaces',
  description: 'Remove double spaces',
  findPattern: '  +',
  replaceWith: ' ',
  isRegex: true,
  isActive: true,
  priority: 1];
  }));
const mockStore = {
  rules: [] as any,
  addRule: jest.fn<unknown, unknown>(),
  updateRule: jest.fn<unknown, unknown>(),
  deleteRule: jest.fn<unknown, unknown>(),
  toggleRule: jest.fn<unknown, unknown>(),
  reorderRules: jest.fn<unknown, unknown>(),
  clearAllRules: jest.fn<unknown, unknown>(),
  applyCorrections: jest.fn((text) => text),
};
beforeEach(() => {
  // Reset mock calls but keep the functions
  Object.values(mockStore).forEach(fn => {)
  if (jest.isMockFunction(fn)) {
      fn.mockClear();
  });
  (useCorrectionsStore as unknown as jest.Mock).mockReturnValue(mockStore as unknown as unknown as unknown as unknown);
});
describe('CorrectionsPanel', () => {
  it('should not render when closed', () => {
    render(<CorrectionsPanel isOpen={false} onClose={() => {}} />);
    expect(screen.queryByTestId('corrections-panel')).not.toBeInTheDocument();
  });
  it('should render when open', () => {
    render(<CorrectionsPanel isOpen={true} onClose={() => {}} />);
    expect(screen.getByTestId('corrections-panel')).toBeInTheDocument();
    expect(screen.getByText('Corrections Manager')).toBeInTheDocument();
  });
  it('should call onClose when close button is clicked', () => {
    const mockOnClose = jest.fn<unknown, unknown>();
    render(<CorrectionsPanel isOpen={true} onClose={mockOnClose} />);
    fireEvent.click(screen.getByLabelText('Close corrections panel'));
    expect(mockOnClose).toHaveBeenCalled();
  });
  it('should display test corrections section', () => {
    render(<CorrectionsPanel isOpen={true} onClose={() => {}} />);
    expect(screen.getByText('Test Corrections')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter text to test corrections...')).toBeInTheDocument();
  });
  it('should apply corrections to test text', async () => {
    mockStore.applyCorrections = jest.fn((text) => text.replace('test', 'TEST'));
    render(<CorrectionsPanel isOpen={true} onClose={() => {}} />);
    const testTextarea = screen.getByPlaceholderText('Enter text to test corrections...');
    fireEvent.change(testTextarea, { target: { value: 'This is a test' } });
    await waitFor(() => {
      expect(screen.getByText('This is a TEST')).toBeInTheDocument();
    });
  });
  it('should display rules count', () => {
    mockStore.rules = [
      {
        id: '1',
        name: 'Test Rule',
        findPattern: 'test',
        replaceWith: 'TEST',
        isRegex: false,
        isActive: true,
        priority: 1,
        createdAt: new Date(),
        updatedAt: new Date()];
    render(<CorrectionsPanel isOpen={true} onClose={() => {}} />);
    expect(screen.getByText('Correction Rules (1)')).toBeInTheDocument();
  });
  it('should render rule items', () => {
    mockStore.rules = [
      {
        id: '1',
        name: 'Test Rule',
        description: 'Test description',
        findPattern: 'test',
        replaceWith: 'TEST',
        isRegex: false,
        isActive: true,
        priority: 1,
        createdAt: new Date(),
        updatedAt: new Date()];
    render(<CorrectionsPanel isOpen={true} onClose={() => {}} />);
    expect(screen.getByText('Test Rule')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
    expect(screen.getByText('test')).toBeInTheDocument();
    expect(screen.getByText('TEST')).toBeInTheDocument();
  });
  it('should display regex badge for regex rules', () => {
    mockStore.rules = [
      {
        id: '1',
        name: 'Regex Rule',
        findPattern: '\\s+',
        replaceWith: ' ',
        isRegex: true,
        isActive: true,
        priority: 1,
        createdAt: new Date(),
        updatedAt: new Date()];
    render(<CorrectionsPanel isOpen={true} onClose={() => {}} />);
    expect(screen.getByText('REGEX')).toBeInTheDocument();
  });
  it('should toggle rule when checkbox is clicked', async () => {
    // Explicitly set rules in mockStore
    mockStore.rules = [
      {
        id: '1',
        name: 'Test Rule',
        findPattern: 'test',
        replaceWith: 'TEST',
        isRegex: false,
        isActive: true,
        priority: 1,
        createdAt: new Date(),
        updatedAt: new Date()];
    // Debug to see if the component is rendering properly
    render(<CorrectionsPanel isOpen={true} onClose={() => {}} />);
    // Verify that the rule name appears (to ensure the component is rendering the rule)
    expect(screen.getByText('Test Rule')).toBeInTheDocument();
    // Find the checkbox within the rule's container by using the rule name as a landmark
    const ruleSection = screen.getByText('Test Rule').closest('div');
    const checkboxes = screen.getAllByRole('checkbox');
    const ruleCheckbox = checkboxes.find(checkbox => ;);
      ruleSection?.contains(checkbox)
    );
    expect(ruleCheckbox).toBeDefined();
    expect(ruleCheckbox).toBeChecked(); // Should be checked since isActive is true
    // Clear any previous mock calls
    if (jest.isMockFunction(mockStore.toggleRule)) {
      mockStore.toggleRule.mockClear();
    // Click the checkbox - try both click and change events
    fireEvent.click(ruleCheckbox!);
    fireEvent.change(ruleCheckbox!, { target: { checked: false } });
    // Wait for any async operations
    await waitFor(() => {
      expect(mockStore.toggleRule).toHaveBeenCalled();
    });
    // Verify the store method was called with the correct rule ID
    expect(mockStore.toggleRule).toHaveBeenCalledWith('1');
  });
  it('should allow adding new rules', () => {
    render(<CorrectionsPanel isOpen={true} onClose={() => {}} />);
    fireEvent.change(screen.getByPlaceholderText('Rule name'), {
      target: { value: 'New Rule' }
    });
    fireEvent.change(screen.getByPlaceholderText('Description (optional)'), {
      target: { value: 'New description' }
    });
    fireEvent.change(screen.getByPlaceholderText('Find pattern'), {
      target: { value: 'find' }
    });
    fireEvent.change(screen.getByPlaceholderText('Replace with'), {
      target: { value: 'replace' }
    });
    fireEvent.click(screen.getByText('Add Rule'));
    expect(mockStore.addRule).toHaveBeenCalledWith({)
  name: 'New Rule',
  description: 'New description',
  findPattern: 'find',
  replaceWith: 'replace',
  isRegex: false,
  isActive: true,
  priority: 1,
});
  });
  it('should disable add button when required fields are missing', () => {
    render(<CorrectionsPanel isOpen={true} onClose={() => {}} />);
    const addButton = screen.getByText('Add Rule');
    expect(addButton).toBeDisabled();
    fireEvent.change(screen.getByPlaceholderText('Rule name'), {
      target: { value: 'New Rule' }
    });
    expect(addButton).toBeDisabled();
    fireEvent.change(screen.getByPlaceholderText('Find pattern'), {
      target: { value: 'find' }
    });
    expect(addButton).not.toBeDisabled();
  });
  it('should allow editing rules', () => {
    mockStore.rules = [
      {
        id: '1',
        name: 'Test Rule',
        findPattern: 'test',
        replaceWith: 'TEST',
        isRegex: false,
        isActive: true,
        priority: 1,
        createdAt: new Date(),
        updatedAt: new Date()];
    render(<CorrectionsPanel isOpen={true} onClose={() => {}} />);
    fireEvent.click(screen.getByText('Edit'));
    expect(screen.getByText('Edit Rule')).toBeInTheDocument();
  });
  it('should allow deleting rules with confirmation', () => {
    // Mock window.confirm
    const originalConfirm = window.confirm;
    window.confirm = jest.fn(() => true);
    mockStore.rules = [
      {
        id: '1',
        name: 'Test Rule',
        findPattern: 'test',
        replaceWith: 'TEST',
        isRegex: false,
        isActive: true,
        priority: 1,
        createdAt: new Date(),
        updatedAt: new Date()];
    render(<CorrectionsPanel isOpen={true} onClose={() => {}} />);
    fireEvent.click(screen.getByText('Delete'));
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this correction rule?');
    expect(mockStore.deleteRule).toHaveBeenCalledWith('1');
    window.confirm = originalConfirm;
  });
  it('should load default rules when button is clicked', () => {
    // Mock window.confirm
    const originalConfirm = window.confirm;
    window.confirm = jest.fn(() => true);
    render(<CorrectionsPanel isOpen={true} onClose={() => {}} />);
    fireEvent.click(screen.getByText('Load Defaults'));
    expect(window.confirm).toHaveBeenCalledWith('This will add default correction rules. Continue?');
    expect(mockStore.addRule).toHaveBeenCalled();
    window.confirm = originalConfirm;
  });
  it('should clear all rules when button is clicked', () => {
    render(<CorrectionsPanel isOpen={true} onClose={() => {}} />);
    fireEvent.click(screen.getByText('Clear All'));
    expect(mockStore.clearAllRules).toHaveBeenCalled();
  });
  it('should update rule in edit modal', () => {
    mockStore.rules = [
      {
        id: '1',
        name: 'Test Rule',
        findPattern: 'test',
        replaceWith: 'TEST',
        isRegex: false,
        isActive: true,
        priority: 1,
        createdAt: new Date(),
        updatedAt: new Date()];
    render(<CorrectionsPanel isOpen={true} onClose={() => {}} />);
    fireEvent.click(screen.getByText('Edit'));
    const nameInput = screen.getByDisplayValue('Test Rule');
    fireEvent.change(nameInput, { target: { value: 'Updated Rule' } });
    fireEvent.click(screen.getByText('Save'));
    expect(mockStore.updateRule).toHaveBeenCalledWith('1', expect.objectContaining({)
  name: 'Updated Rule',
}));
  });
  it('should cancel edit modal', () => {
    mockStore.rules = [
      {
        id: '1',
        name: 'Test Rule',
        findPattern: 'test',
        replaceWith: 'TEST',
        isRegex: false,
        isActive: true,
        priority: 1,
        createdAt: new Date(),
        updatedAt: new Date()];
    render(<CorrectionsPanel isOpen={true} onClose={() => {}} />);
    fireEvent.click(screen.getByText('Edit'));
    expect(screen.getByText('Edit Rule')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByText('Edit Rule')).not.toBeInTheDocument();
  });
});