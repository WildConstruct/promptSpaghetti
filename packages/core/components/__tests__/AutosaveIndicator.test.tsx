import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AutosaveIndicator } from '../AutosaveIndicator';

describe('AutosaveIndicator', () => {
  const defaultProps = {
    lastSaved: null as Date | null,
    isSaving: false,
    hasChanges: false,
    error: null as string | null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Rendering States', () => {
    it('should show "No changes" when no changes and not saving', () => {
      render(<AutosaveIndicator {...defaultProps} />);
      expect(screen.getByText('No changes')).toBeInTheDocument();
    });

    it('should show "Saving..." when saving', () => {
      render(<AutosaveIndicator {...defaultProps} isSaving={true} />);
      expect(screen.getByText('Saving...')).toBeInTheDocument();
      expect(screen.getByTestId('saving-spinner')).toBeInTheDocument();
    });

    it('should show "Changes pending" when has unsaved changes', () => {
      render(<AutosaveIndicator {...defaultProps} hasChanges={true} />);
      expect(screen.getByText('Changes pending')).toBeInTheDocument();
    });

    it('should show "Saved" with timestamp when recently saved', () => {
      const now = new Date();
      render(<AutosaveIndicator {...defaultProps} lastSaved={now} />);
      expect(screen.getByText(/Saved just now/i)).toBeInTheDocument();
    });

    it('should show error message when error exists', () => {
      render(<AutosaveIndicator {...defaultProps} error="Failed to save" />);
      expect(screen.getByText('Failed to save')).toBeInTheDocument();
      expect(screen.getByTestId('error-icon')).toBeInTheDocument();
    });
  });

  describe('Time Formatting', () => {
    it('should show "just now" for saves within 5 seconds', () => {
      const now = new Date();
      render(<AutosaveIndicator {...defaultProps} lastSaved={now} />);
      expect(screen.getByText(/just now/i)).toBeInTheDocument();
    });

    it('should show seconds ago for recent saves', () => {
      const thirtySecondsAgo = new Date(Date.now() - 30000);
      render(<AutosaveIndicator {...defaultProps} lastSaved={thirtySecondsAgo} />);
      expect(screen.getByText(/30 seconds ago/i)).toBeInTheDocument();
    });

    it('should show minutes ago for older saves', () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60000);
      render(<AutosaveIndicator {...defaultProps} lastSaved={fiveMinutesAgo} />);
      expect(screen.getByText(/5 minutes ago/i)).toBeInTheDocument();
    });

    it('should show hours ago for much older saves', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 3600000);
      render(<AutosaveIndicator {...defaultProps} lastSaved={twoHoursAgo} />);
      expect(screen.getByText(/2 hours ago/i)).toBeInTheDocument();
    });

    it('should show date for saves older than 24 hours', () => {
      const yesterday = new Date(Date.now() - 25 * 3600000);
      render(<AutosaveIndicator {...defaultProps} lastSaved={yesterday} />);
      expect(screen.getByText(yesterday.toLocaleDateString())).toBeInTheDocument();
    });
  });

  describe('Auto-update Timer', () => {
    it('should update time display automatically', async () => {
      const oneMinuteAgo = new Date(Date.now() - 60000);
      const { rerender } = render(<AutosaveIndicator {...defaultProps} lastSaved={oneMinuteAgo} />);
      
      expect(screen.getByText(/1 minute ago/i)).toBeInTheDocument();
      
      // Advance time by 1 minute
      act(() => {
        jest.advanceTimersByTime(60000);
      });
      
      rerender(<AutosaveIndicator {...defaultProps} lastSaved={oneMinuteAgo} />);
      
      await waitFor(() => {
        expect(screen.getByText(/2 minutes ago/i)).toBeInTheDocument();
      });
    });

    it('should clean up timer on unmount', () => {
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
      const { unmount } = render(<AutosaveIndicator {...defaultProps} lastSaved={new Date()} />);
      
      unmount();
      
      expect(clearIntervalSpy).toHaveBeenCalled();
    });
  });

  describe('Visual States', () => {
    it('should have success styling when saved', () => {
      render(<AutosaveIndicator {...defaultProps} lastSaved={new Date()} />);
      const indicator = screen.getByTestId('autosave-indicator');
      expect(indicator).toHaveClass('status-success');
    });

    it('should have warning styling when changes pending', () => {
      render(<AutosaveIndicator {...defaultProps} hasChanges={true} />);
      const indicator = screen.getByTestId('autosave-indicator');
      expect(indicator).toHaveClass('status-warning');
    });

    it('should have error styling when error exists', () => {
      render(<AutosaveIndicator {...defaultProps} error="Save failed" />);
      const indicator = screen.getByTestId('autosave-indicator');
      expect(indicator).toHaveClass('status-error');
    });

    it('should have saving animation when saving', () => {
      render(<AutosaveIndicator {...defaultProps} isSaving={true} />);
      const spinner = screen.getByTestId('saving-spinner');
      expect(spinner).toHaveClass('animate-spin');
    });
  });

  describe('Tooltip', () => {
    it('should show detailed save time in tooltip', () => {
      const saveTime = new Date('2025-01-28T10:30:00');
      render(<AutosaveIndicator {...defaultProps} lastSaved={saveTime} />);
      
      const indicator = screen.getByTestId('autosave-indicator');
      expect(indicator).toHaveAttribute('title', expect.stringContaining('10:30'));
    });

    it('should show error details in tooltip when error', () => {
      render(<AutosaveIndicator {...defaultProps} error="Network error: Connection refused" />);
      
      const indicator = screen.getByTestId('autosave-indicator');
      expect(indicator).toHaveAttribute('title', 'Network error: Connection refused');
    });

    it('should show keyboard shortcut in tooltip', () => {
      render(<AutosaveIndicator {...defaultProps} hasChanges={true} />);
      
      const indicator = screen.getByTestId('autosave-indicator');
      expect(indicator).toHaveAttribute('title', expect.stringContaining('Ctrl+S'));
    });
  });

  describe('Click Actions', () => {
    it('should trigger manual save on click when has changes', () => {
      const onManualSave = jest.fn();
      render(<AutosaveIndicator {...defaultProps} hasChanges={true} onManualSave={onManualSave} />);
      
      const indicator = screen.getByTestId('autosave-indicator');
      indicator.click();
      
      expect(onManualSave).toHaveBeenCalled();
    });

    it('should not trigger save when already saving', () => {
      const onManualSave = jest.fn();
      render(<AutosaveIndicator {...defaultProps} isSaving={true} onManualSave={onManualSave} />);
      
      const indicator = screen.getByTestId('autosave-indicator');
      indicator.click();
      
      expect(onManualSave).not.toHaveBeenCalled();
    });

    it('should retry on click when error', () => {
      const onRetry = jest.fn();
      render(<AutosaveIndicator {...defaultProps} error="Save failed" onRetry={onRetry} />);
      
      const indicator = screen.getByTestId('autosave-indicator');
      indicator.click();
      
      expect(onRetry).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have appropriate ARIA attributes', () => {
      render(<AutosaveIndicator {...defaultProps} isSaving={true} />);
      
      const indicator = screen.getByTestId('autosave-indicator');
      expect(indicator).toHaveAttribute('role', 'status');
      expect(indicator).toHaveAttribute('aria-live', 'polite');
      expect(indicator).toHaveAttribute('aria-busy', 'true');
    });

    it('should announce save completion', async () => {
      const { rerender } = render(<AutosaveIndicator {...defaultProps} isSaving={true} />);
      
      rerender(<AutosaveIndicator {...defaultProps} isSaving={false} lastSaved={new Date()} />);
      
      const announcement = screen.getByRole('status');
      expect(announcement).toHaveTextContent(/Saved/i);
    });

    it('should have keyboard support', () => {
      const onManualSave = jest.fn();
      render(<AutosaveIndicator {...defaultProps} hasChanges={true} onManualSave={onManualSave} />);
      
      const indicator = screen.getByTestId('autosave-indicator');
      indicator.focus();
      
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      indicator.dispatchEvent(enterEvent);
      
      expect(onManualSave).toHaveBeenCalled();
    });
  });

  describe('Performance', () => {
    it('should debounce rapid state changes', async () => {
      const { rerender } = render(<AutosaveIndicator {...defaultProps} />);
      
      // Rapid state changes
      for (let i = 0; i < 10; i++) {
        rerender(<AutosaveIndicator {...defaultProps} hasChanges={i % 2 === 0} />);
      }
      
      // Should only show final state
      expect(screen.getByText('No changes')).toBeInTheDocument();
    });

    it('should not re-render unnecessarily', () => {
      const renderSpy = jest.fn();
      const TestWrapper = (props: any) => {
        renderSpy();
        return <AutosaveIndicator {...props} />;
      };
      
      const { rerender } = render(<TestWrapper {...defaultProps} />);
      
      // Same props should not trigger re-render
      rerender(<TestWrapper {...defaultProps} />);
      
      expect(renderSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Recovery', () => {
    it('should clear error after successful save', () => {
      const { rerender } = render(<AutosaveIndicator {...defaultProps} error="Save failed" />);
      
      expect(screen.getByText('Save failed')).toBeInTheDocument();
      
      rerender(<AutosaveIndicator {...defaultProps} lastSaved={new Date()} />);
      
      expect(screen.queryByText('Save failed')).not.toBeInTheDocument();
      expect(screen.getByText(/Saved/i)).toBeInTheDocument();
    });

    it('should show retry count for repeated failures', () => {
      render(<AutosaveIndicator {...defaultProps} error="Save failed" retryCount={3} />);
      
      expect(screen.getByText(/Save failed.*3 retries/i)).toBeInTheDocument();
    });
  });
});