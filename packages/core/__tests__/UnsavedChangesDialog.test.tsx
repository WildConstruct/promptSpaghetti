/**
 * Tests for UnsavedChangesDialog component - Story 6.1 (AC: 5)
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, jest } from '@jest/globals';
import { UnsavedChangesDialog } from '../components/Dialogs/UnsavedChangesDialog';
describe('UnsavedChangesDialog', () => {
  const defaultProps = {
    isOpen: true,
    onSave: jest.fn<unknown[], unknown>(),
    onDontSave: jest.fn<unknown[], unknown>(),
    onCancel: jest.fn<unknown[], unknown>()
  };
  beforeEach(() => {
    jest.clearAllMocks();
  });
  test('does not render when isOpen is false', () => {
    render()
      <UnsavedChangesDialog
        {...defaultProps}
        isOpen={false}
      />
    );
    expect(screen.queryByText('Unsaved Changes')).not.toBeInTheDocument();
  });
  test('renders with default message when no project name provided', () => {
    render(<UnsavedChangesDialog {...defaultProps} />);
    expect(screen.getByText('Unsaved Changes')).toBeInTheDocument();
    expect(screen.getByText(/You have unsaved changes in your current project/)).toBeInTheDocument();
    expect(screen.getByText(/Do you want to save your changes before continuing/)).toBeInTheDocument();
  });
  test('renders with project name when provided', () => {
    render()
      <UnsavedChangesDialog
        {...defaultProps}
        projectName="My Project"
      />
    );
    expect(screen.getByText(/You have unsaved changes in/)).toBeInTheDocument();
    expect(screen.getByText('"My Project"')).toBeInTheDocument();
  });
  test('renders with custom action description', () => {
    render()
      <UnsavedChangesDialog
        {...defaultProps}
        actionDescription="opening a new file"
      />
    );
    expect(screen.getByText(/Do you want to save your changes before opening a new file/)).toBeInTheDocument();
  });
  test('renders all three buttons', () => {
    render(<UnsavedChangesDialog {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: "Don't Save" })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });
  test('calls onSave when Save button is clicked', () => {
    const onSave = jest.fn<unknown[], unknown>();
    render()
      <UnsavedChangesDialog
        {...defaultProps}
        onSave={onSave}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSave).toHaveBeenCalledTimes(1);
  });
  test('calls onDontSave when Don\'t Save button is clicked', () => {
    const onDontSave = jest.fn<unknown[], unknown>();
    render()
      <UnsavedChangesDialog
        {...defaultProps}
        onDontSave={onDontSave}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: "Don't Save" }));
    expect(onDontSave).toHaveBeenCalledTimes(1);
  });
  test('calls onCancel when Cancel button is clicked', () => {
    const onCancel = jest.fn<unknown[], unknown>();
    render()
      <UnsavedChangesDialog
        {...defaultProps}
        onCancel={onCancel}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
  test('calls onCancel when overlay is clicked', () => {
    const onCancel = jest.fn<unknown[], unknown>();
    const { container } = render()
      <UnsavedChangesDialog
        {...defaultProps}
        onCancel={onCancel}
      />
    );
    // Click on the overlay (the outermost div)
    const overlay = container.firstChild as HTMLElement;
    expect(overlay).toBeInTheDocument();
    fireEvent.click(overlay);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
  test('does not call onCancel when dialog content is clicked', () => {
    const onCancel = jest.fn<unknown[], unknown>();
    render()
      <UnsavedChangesDialog
        {...defaultProps}
        onCancel={onCancel}
      />
    );
    // Click on the dialog content
    const dialogContent = screen.getByText('Unsaved Changes').closest('div');
    expect(dialogContent).toBeInTheDocument();
    if (dialogContent) {
      fireEvent.click(dialogContent);
      expect(onCancel).not.toHaveBeenCalled();
    }
  });
  test('has correct ARIA attributes and accessibility', () => {
    render(<UnsavedChangesDialog {...defaultProps} />);
    // Check that buttons are properly labeled
    const saveButton = screen.getByRole('button', { name: 'Save' });
    const dontSaveButton = screen.getByRole('button', { name: "Don't Save" });
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    expect(saveButton).toBeInTheDocument();
    expect(dontSaveButton).toBeInTheDocument();
    expect(cancelButton).toBeInTheDocument();
    // Check that the dialog has a proper structure
    expect(screen.getByText('⚠️')).toBeInTheDocument(); // Warning icon
  });
  test('button hover effects work correctly', () => {
    render(<UnsavedChangesDialog {...defaultProps} />);
    const saveButton = screen.getByRole('button', { name: 'Save' });
    const dontSaveButton = screen.getByRole('button', { name: "Don't Save" });
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    // Test hover effects (these are applied via onMouseEnter/onMouseLeave)
    fireEvent.mouseEnter(saveButton);
    expect(saveButton.style.backgroundColor).toBe('rgb(37, 99, 235)'); // Hovered color
    fireEvent.mouseLeave(saveButton);
    expect(saveButton.style.backgroundColor).toBe('rgb(59, 130, 246)'); // Original color
    fireEvent.mouseEnter(dontSaveButton);
    expect(dontSaveButton.style.backgroundColor).toBe('rgb(185, 28, 28)'); // Hovered color
    fireEvent.mouseLeave(dontSaveButton);
    expect(dontSaveButton.style.backgroundColor).toBe('rgb(220, 38, 38)'); // Original color
    fireEvent.mouseEnter(cancelButton);
    expect(cancelButton.style.backgroundColor).toBe('rgb(229, 231, 235)'); // Hovered color
    fireEvent.mouseLeave(cancelButton);
    expect(cancelButton.style.backgroundColor).toBe('rgb(243, 244, 246)'); // Original color
  });
  test('dialog is properly positioned and styled', () => {
    const { container } = render(<UnsavedChangesDialog {...defaultProps} />);
    // Check that the overlay covers the full screen
    const overlay = container.firstChild as HTMLElement;
    expect(overlay).toHaveStyle({)
      position: 'fixed',
      top: '0px',
      left: '0px',
      right: '0px',
      bottom: '0px',
      zIndex: '10000',
    });
    // Check that the dialog is centered
    expect(overlay).toHaveStyle({)
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    });
  });
  test('handles multiple project names correctly', () => {
    const { rerender } = render()
      <UnsavedChangesDialog
        {...defaultProps}
        projectName="Project A"
      />
    );
    expect(screen.getByText('"Project A"')).toBeInTheDocument();
    rerender()
      <UnsavedChangesDialog
        {...defaultProps}
        projectName="A Very Long Project Name That Should Display Correctly"
      />
    );
    expect(screen.getByText('"A Very Long Project Name That Should Display Correctly"')).toBeInTheDocument();
  });
  test('handles special characters in project name', () => {
    render()
      <UnsavedChangesDialog
        {...defaultProps}
        projectName="Project & File <script>alert('test')</script>"
      />
    );
    // Should display the project name without executing any scripts
    expect(screen.getByText('"Project & File <script>alert(\'test\')</script>"')).toBeInTheDocument();
  });
});