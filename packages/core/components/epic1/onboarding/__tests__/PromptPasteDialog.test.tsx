/**
 * Tests for PromptPasteDialog component
 * Tests paste dialog functionality and user interactions
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { jest } from '@jest/globals';
import { PromptPasteDialog } from '../PromptPasteDialog';

describe('PromptPasteDialog', () => {
  const examplePrompt =
    'A {weathered|grinning|stoic} 1960s {racegoer|mechanic|vendor} in a {flat cap|straw boater|fedora}, watching from the grandstand';

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

      expect(screen.getByText('Paste your prompt')).toBeInTheDocument();
      expect(screen.getByText('Paste or type your prompt here:')).toBeInTheDocument();
      expect(screen.getByText('Create nodes')).toBeInTheDocument();
    });

    it('should not render when closed', () => {
      render(<PromptPasteDialog {...defaultProps} isOpen={false} />);

      expect(screen.queryByText('Paste your prompt')).not.toBeInTheDocument();
    });

    it('should show tutorial helper for tutorial steps', () => {
      render(<PromptPasteDialog {...defaultProps} />);

      expect(screen.getByText(/We pre-filled an example below/)).toBeInTheDocument();
      expect(screen.getByText('Use example')).toBeInTheDocument();
    });

    it('should not show tutorial helper outside tutorial steps', () => {
      render(<PromptPasteDialog {...defaultProps} tutorialStep={undefined} />);

      expect(screen.queryByText(/We pre-filled an example below/)).not.toBeInTheDocument();
    });
  });

  describe('Example prompt handling', () => {
    it('should display the current example prompt', () => {
      render(<PromptPasteDialog {...defaultProps} />);

      expect(screen.getAllByText(examplePrompt)).toHaveLength(2);
    });

    it('should use example prompt when button clicked', () => {
      render(<PromptPasteDialog {...defaultProps} />);

      const textarea = screen.getByPlaceholderText('Paste your prompt here (Ctrl+V or Cmd+V)...');
      fireEvent.change(textarea, { target: { value: 'Custom draft' } });
      fireEvent.click(screen.getByText('Use example'));

      expect(textarea).toHaveValue(examplePrompt);
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

      expect(textarea).toHaveValue('test');
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
    it('should call onPaste with prompt text when Create nodes clicked', () => {
      const mockOnPaste = jest.fn();
      render(<PromptPasteDialog {...defaultProps} onPaste={mockOnPaste} />);

      const textarea = screen.getByPlaceholderText('Paste your prompt here (Ctrl+V or Cmd+V)...');
      fireEvent.change(textarea, { target: { value: 'Test prompt' } });

      fireEvent.click(screen.getByText('Create nodes'));

      expect(mockOnPaste).toHaveBeenCalledWith('Test prompt');
    });

    it('should enable Create nodes button when text is present', () => {
      render(<PromptPasteDialog {...defaultProps} tutorialStep={undefined} />);

      const textarea = screen.getByPlaceholderText('Paste your prompt here (Ctrl+V or Cmd+V)...');
      const createButton = screen.getByText('Create nodes');

      expect(createButton).toBeDisabled();

      fireEvent.change(textarea, { target: { value: 'Test prompt' } });
      expect(createButton).not.toBeDisabled();
    });

    it('should disable Create nodes button when text is empty or whitespace', () => {
      render(<PromptPasteDialog {...defaultProps} tutorialStep={undefined} />);

      const textarea = screen.getByPlaceholderText('Paste your prompt here (Ctrl+V or Cmd+V)...');
      const createButton = screen.getByText('Create nodes');

      fireEvent.change(textarea, { target: { value: '' } });
      expect(createButton).toBeDisabled();

      fireEvent.change(textarea, { target: { value: '   \n\t  ' } });
      expect(createButton).toBeDisabled();

      fireEvent.change(textarea, { target: { value: 'Valid prompt' } });
      expect(createButton).not.toBeDisabled();
    });

    it('should trim whitespace when submitting', () => {
      const mockOnPaste = jest.fn();
      render(<PromptPasteDialog {...defaultProps} onPaste={mockOnPaste} />);

      const textarea = screen.getByPlaceholderText('Paste your prompt here (Ctrl+V or Cmd+V)...');
      fireEvent.change(textarea, { target: { value: '  Test prompt  ' } });

      fireEvent.click(screen.getByText('Create nodes'));

      expect(mockOnPaste).toHaveBeenCalledWith('Test prompt');
    });
  });

  describe('Dialog actions', () => {
    it('should call onClose when Cancel button clicked', () => {
      const mockOnClose = jest.fn();
      render(<PromptPasteDialog {...defaultProps} onClose={mockOnClose} />);

      fireEvent.click(screen.getByText('Cancel'));

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should call onClose when clicking outside dialog', () => {
      const mockOnClose = jest.fn();
      render(<PromptPasteDialog {...defaultProps} onClose={mockOnClose} />);

      const container = document.body.firstChild as HTMLElement;
      const overlay = container.firstChild as HTMLElement;
      fireEvent.click(overlay);
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Keyboard shortcuts', () => {
    it('should handle Escape key to close', () => {
      const mockOnClose = jest.fn();
      render(<PromptPasteDialog {...defaultProps} onClose={mockOnClose} />);

      const textarea = screen.getByPlaceholderText('Paste your prompt here (Ctrl+V or Cmd+V)...');
      fireEvent.keyDown(textarea, { key: 'Escape' });

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper label and placeholder', () => {
      render(<PromptPasteDialog {...defaultProps} />);

      const textarea = screen.getByPlaceholderText('Paste your prompt here (Ctrl+V or Cmd+V)...');
      expect(textarea).toHaveAttribute('placeholder');

      expect(screen.getByText('Paste or type your prompt here:')).toBeInTheDocument();
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
