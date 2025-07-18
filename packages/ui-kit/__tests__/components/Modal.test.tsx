/**
 * Modal component tests
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from '../../src/components/Modal';
import { ThemeProvider } from '../../src/components/ThemeProvider';

const renderModal = (props = {}) => {
  return render(
    <ThemeProvider>
      <Modal isOpen={true} onClose={jest.fn()} {...props}>
        <div>Modal Content</div>
      </Modal>
    </ThemeProvider>
  );
};

describe('Modal', () => {
  it('renders when open', () => {
    renderModal();
    expect(screen.getByText('Modal Content')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <ThemeProvider>
        <Modal isOpen={false} onClose={jest.fn()}>
          <div>Modal Content</div>
        </Modal>
      </ThemeProvider>
    );
    
    expect(screen.queryByText('Modal Content')).not.toBeInTheDocument();
  });

  it('calls onClose when overlay is clicked', async () => {
    const handleClose = jest.fn();
    renderModal({ onClose: handleClose, closeOnOverlayClick: true });
    
    const overlay = screen.getByRole('dialog').parentElement;
    if (overlay) {
      await userEvent.click(overlay);
      expect(handleClose).toHaveBeenCalled();
    }
  });

  it('calls onClose when escape key is pressed', async () => {
    const handleClose = jest.fn();
    renderModal({ onClose: handleClose, closeOnEscape: true });
    
    await userEvent.keyboard('{Escape}');
    expect(handleClose).toHaveBeenCalled();
  });

  it('does not close on overlay click when disabled', async () => {
    const handleClose = jest.fn();
    renderModal({ onClose: handleClose, closeOnOverlayClick: false });
    
    const overlay = screen.getByRole('dialog').parentElement;
    if (overlay) {
      await userEvent.click(overlay);
      expect(handleClose).not.toHaveBeenCalled();
    }
  });

  it('does not close on escape when disabled', async () => {
    const handleClose = jest.fn();
    renderModal({ onClose: handleClose, closeOnEscape: false });
    
    await userEvent.keyboard('{Escape}');
    expect(handleClose).not.toHaveBeenCalled();
  });

  it('shows title when provided', () => {
    renderModal({ title: 'Test Modal Title' });
    expect(screen.getByText('Test Modal Title')).toBeInTheDocument();
  });

  it('shows close button when enabled', async () => {
    const handleClose = jest.fn();
    renderModal({ onClose: handleClose, showCloseButton: true });
    
    const closeButton = screen.getByRole('button', { name: /close/i });
    expect(closeButton).toBeInTheDocument();
    
    await userEvent.click(closeButton);
    expect(handleClose).toHaveBeenCalled();
  });

  it('supports different sizes', () => {
    const { rerender } = renderModal({ size: 'sm' });
    expect(screen.getByRole('dialog')).toHaveClass('ui-modal--sm');
    
    rerender(
      <ThemeProvider>
        <Modal isOpen={true} onClose={jest.fn()} size="lg">
          <div>Modal Content</div>
        </Modal>
      </ThemeProvider>
    );
    expect(screen.getByRole('dialog')).toHaveClass('ui-modal--lg');
  });

  it('renders footer when provided', () => {
    renderModal({ 
      footer: (
        <div>
          <button>Cancel</button>
          <button>Save</button>
        </div>
      )
    });
    
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('manages focus correctly', () => {
    renderModal();
    const modal = screen.getByRole('dialog');
    
    // Modal should be focused when opened
    expect(document.activeElement).toBe(modal);
  });

  it('prevents body scroll when open', () => {
    renderModal();
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('restores body scroll when closed', () => {
    const { rerender } = renderModal();
    
    rerender(
      <ThemeProvider>
        <Modal isOpen={false} onClose={jest.fn()}>
          <div>Modal Content</div>
        </Modal>
      </ThemeProvider>
    );
    
    expect(document.body.style.overflow).toBe('');
  });

  it('supports custom className and styles', () => {
    renderModal({ 
      className: 'custom-modal',
      style: { backgroundColor: 'red' }
    });
    
    const modal = screen.getByRole('dialog');
    expect(modal).toHaveClass('custom-modal');
    expect(modal).toHaveStyle({ backgroundColor: 'red' });
  });

  it('supports accessibility attributes', () => {
    renderModal({ 
      'aria-labelledby': 'modal-title',
      'aria-describedby': 'modal-description'
    });
    
    const modal = screen.getByRole('dialog');
    expect(modal).toHaveAttribute('aria-labelledby', 'modal-title');
    expect(modal).toHaveAttribute('aria-describedby', 'modal-description');
    expect(modal).toHaveAttribute('aria-modal', 'true');
  });
});