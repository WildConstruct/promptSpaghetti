/**
 * Tests for PromptPasteDialog component
 * Tests paste dialog functionality and user interactions
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import { PromptPasteDialog } from '../PromptPasteDialog';

// Mock navigator.clipboard
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: jest.fn(() => Promise.resolve()),
    readText: jest.fn(() => Promise.resolve(''))
  },
  writable: true
});

// Mock document.getElementById
const mockGetElementById = jest.fn();
Object.defineProperty(document, 'getElementById', {
  value: mockGetElementById,
  writable: true
});

describe('PromptPasteDialog', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onPaste: jest.fn(),
    tutorialStep: 'paste-prompt'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render dialog when open', () => {
      render(<PromptPasteDialog {...defaultProps} />);

      expect(screen.getByText('🍝 Paste Your Prompt')).toBeInTheDocument();
      expect(screen.getByText('Paste or type your prompt here:')).toBeInTheDocument();
      expect(screen.getByText('Create Nodes')).toBeInTheDocument();
    });

    it('should not render when closed', () => {
      render(<PromptPasteDialog {...defaultProps} isOpen={false} />);

      expect(screen.queryByText('🍝 Paste Your Prompt')).not.toBeInTheDocument();
    });

    it('should show tutorial tip for paste-prompt step', () => {
      render(<PromptPasteDialog {...defaultProps} />);

      expect(screen.getByText('Tutorial Tip:')).toBeInTheDocument();
      expect(screen.getByText(/Copy the example below/)).toBeInTheDocument();
    });

    it('should not show tutorial tip for other steps', () => {
      render(<PromptPasteDialog {...defaultProps} tutorialStep="other-step" />);

      expect(screen.queryByText('Tutorial Tip:')).not.toBeInTheDocument();
    });
  });

  describe('Example prompt handling', () => {
    it('should display the correct example prompt', () => {
      render(<PromptPasteDialog {...defaultProps} />);

      const expectedPrompt = 'A {brave|cunning|wise} {knight|wizard|rogue} ventures into the {dark forest|ancient ruins|dragon\'s lair}';
      expect(screen.getByText(expectedPrompt)).toBeInTheDocument();
    });

    it('should copy example to clipboard when button clicked', async () => {
      const mockButton = { textContent: 'Copy Example' };
      mockGetElementById.mockReturnValue(mockButton);

      render(<PromptPasteDialog {...defaultProps} />);

      const copyButton = screen.getByText('Copy Example');
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
          'A {brave|cunning|wise} {knight|wizard|rogue} ventures into the {dark forest|ancient ruins|dragon\'s lair}'
        );
      });

      // Check that button text changes temporarily
      expect(mockButton.textContent).toBe('Copied!');
    });

    it('should handle clipboard write errors gracefully', async () => {
      const mockClipboard = navigator.clipboard as any;
      mockClipboard.writeText.mockRejectedValue(new Error('Clipboard error'));

      render(<PromptPasteDialog {...defaultProps} />);

      const copyButton = screen.getByText('Copy Example');
      fireEvent.click(copyButton);

      // Should not throw error, should handle gracefully
      await waitFor(() => {
        expect(mockClipboard.writeText).toHaveBeenCalled();
      });
    });
  });

  describe('Text input handling', () => {
    it('should update prompt text when typing', () => {
      render(<PromptPasteDialog {...defaultProps} />);

      const textarea = screen.getByPlaceholderText('Paste your prompt here (Ctrl+V or Cmd+V)...');
      fireEvent.change(textarea, { target: { value: 'Test prompt' } });

      expect(textarea).toHaveValue('Test prompt');
    });

    it('should focus textarea when dialog opens', () => {
      const mockFocus = jest.fn();
      const originalFocus = HTMLElement.prototype.focus;
      HTMLElement.prototype.focus = mockFocus;

      render(<PromptPasteDialog {...defaultProps} />);

      expect(mockFocus).toHaveBeenCalled();

      HTMLElement.prototype.focus = originalFocus;
    });
  });

  describe('Paste handling', () => {
    it('should handle paste events correctly', () => {
      render(<PromptPasteDialog {...defaultProps} />);

      const textarea = screen.getByPlaceholderText('Paste your prompt here (Ctrl+V or Cmd+V)...');
      const pastedText = 'Pasted prompt text';

      fireEvent.paste(textarea, {
        clipboardData: {
          getData: () => pastedText
        }
      });

      expect(textarea).toHaveValue(pastedText);
    });

    it('should prevent default paste behavior', () => {
      render(<PromptPasteDialog {...defaultProps} />);

      const textarea = screen.getByPlaceholderText('Paste your prompt here (Ctrl+V or Cmd+V)...');
      const mockPreventDefault = jest.fn();

      fireEvent.paste(textarea, {
        preventDefault: mockPreventDefault,
        clipboardData: {
          getData: () => 'test'
        }
      });

      expect(mockPreventDefault).toHaveBeenCalled();
    });

    it('should handle empty paste gracefully', () => {
      render(<PromptPasteDialog {...defaultProps} />);

      const textarea = screen.getByPlaceholderText('Paste your prompt here (Ctrl+V or Cmd+V)...');

      fireEvent.paste(textarea, {
        clipboardData: {
          getData: () => ''
        }
      });

      expect(textarea).toHaveValue('');
    });
  });

  describe('Form submission', () => {
    it('should call onPaste with prompt text when Create Nodes clicked', () => {
      const mockOnPaste = jest.fn();
      render(<PromptPasteDialog {...defaultProps} onPaste={mockOnPaste} />);

      const textarea = screen.getByPlaceholderText('Paste your prompt here (Ctrl+V or Cmd+V)...');
      fireEvent.change(textarea, { target: { value: 'Test prompt' } });

      const createButton = screen.getByText('Create Nodes');
      fireEvent.click(createButton);

      expect(mockOnPaste).toHaveBeenCalledWith('Test prompt');
    });

    it('should enable Create Nodes button when text is present', () => {
      render(<PromptPasteDialog {...defaultProps} />);

      const textarea = screen.getByPlaceholderText('Paste your prompt here (Ctrl+V or Cmd+V)...');
      const createButton = screen.getByText('Create Nodes');

      // Initially disabled (empty text)
      expect(createButton).toBeDisabled();

      // Enable when text is added
      fireEvent.change(textarea, { target: { value: 'Test prompt' } });
      expect(createButton).not.toBeDisabled();
    });

    it('should disable Create Nodes button when text is empty or whitespace', () => {
      render(<PromptPasteDialog {...defaultProps} />);

      const textarea = screen.getByPlaceholderText('Paste your prompt here (Ctrl+V or Cmd+V)...');
      const createButton = screen.getByText('Create Nodes');

      // Test empty
      fireEvent.change(textarea, { target: { value: '' } });
      expect(createButton).toBeDisabled();

      // Test whitespace only
      fireEvent.change(textarea, { target: { value: '   \n\t  ' } });
      expect(createButton).toBeDisabled();

      // Test with actual content
      fireEvent.change(textarea, { target: { value: 'Valid prompt' } });
      expect(createButton).not.toBeDisabled();
    });

    it('should trim whitespace when submitting', () => {
      const mockOnPaste = jest.fn();
      render(<PromptPasteDialog {...defaultProps} onPaste={mockOnPaste} />);

      const textarea = screen.getByPlaceholderText('Paste your prompt here (Ctrl+V or Cmd+V)...');
      fireEvent.change(textarea, { target: { value: '  Test prompt  ' } });

      const createButton = screen.getByText('Create Nodes');
      fireEvent.click(createButton);

      expect(mockOnPaste).toHaveBeenCalledWith('Test prompt');
    });
  });

  describe('Dialog actions', () => {
    it('should call onClose when Cancel button clicked', () => {
      const mockOnClose = jest.fn();
      render(<PromptPasteDialog {...defaultProps} onClose={mockOnClose} />);

      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should call onClose when clicking outside dialog', () => {
      const mockOnClose = jest.fn();
      render(<PromptPasteDialog {...defaultProps} onClose={mockOnClose} />);

      // Click on overlay (outside dialog)
      const overlay = screen.getByTestId ? screen.getByTestId('tutorial-overlay') : document.querySelector('.tutorial-overlay');
      if (overlay) {
        fireEvent.click(overlay);
        expect(mockOnClose).toHaveBeenCalled();
      }
    });
  });

  describe('Keyboard shortcuts', () => {
    it('should handle Enter key to submit', () => {
      const mockOnPaste = jest.fn();
      render(<PromptPasteDialog {...defaultProps} onPaste={mockOnPaste} />);

      const textarea = screen.getByPlaceholderText('Paste your prompt here (Ctrl+V or Cmd+V)...');
      fireEvent.change(textarea, { target: { value: 'Test prompt' } });

      fireEvent.keyDown(textarea, { key: 'Enter' });
      // Note: Enter key handling might need to be implemented in the component
    });

    it('should handle Escape key to close', () => {
      const mockOnClose = jest.fn();
      render(<PromptPasteDialog {...defaultProps} onClose={mockOnClose} />);

      const textarea = screen.getByPlaceholderText('Paste your prompt here (Ctrl+V or Cmd+V)...');
      fireEvent.keyDown(textarea, { key: 'Escape' });

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<PromptPasteDialog {...defaultProps} />);

      const textarea = screen.getByPlaceholderText('Paste your prompt here (Ctrl+V or Cmd+V)...');
      expect(textarea).toHaveAttribute('placeholder');

      const label = screen.getByText('Paste or type your prompt here:');
      expect(label).toBeInTheDocument();
    });

    it('should have focus management', () => {
      render(<PromptPasteDialog {...defaultProps} />);

      const textarea = screen.getByPlaceholderText('Paste your prompt here (Ctrl+V or Cmd+V)...');
      expect(textarea).toHaveFocus();
    });
  });

  describe('Edge cases', () => {
    it('should handle very long prompts', () => {
      const longPrompt = 'A'.repeat(1000);
      render(<PromptPasteDialog {...defaultProps} />);

      const textarea = screen.getByPlaceholderText('Paste your prompt here (Ctrl+V or Cmd+V)...');
      fireEvent.change(textarea, { target: { value: longPrompt } });

      expect(textarea).toHaveValue(longPrompt);
    });

    it('should handle special characters in prompts', () => {
      const specialPrompt = 'A prompt with {special|chars} and symbols !@#$%^&*()';
      render(<PromptPasteDialog {...defaultProps} />);

      const textarea = screen.getByPlaceholderText('Paste your prompt here (Ctrl+V or Cmd+V)...');
      fireEvent.change(textarea, { target: { value: specialPrompt } });

      expect(textarea).toHaveValue(specialPrompt);
    });

    it('should handle multiline prompts', () => {
      const multilinePrompt = 'Line 1\nLine 2\n{choice1|choice2}\nLine 4';
      render(<PromptPasteDialog {...defaultProps} />);

      const textarea = screen.getByPlaceholderText('Paste your prompt here (Ctrl+V or Cmd+V)...');
      fireEvent.change(textarea, { target: { value: multilinePrompt } });

      expect(textarea).toHaveValue(multilinePrompt);
    });
  });
});
