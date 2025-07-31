import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
/**
 * Cross-platform Modal component
 */
import { useEffect, useRef, forwardRef } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../hooks';
import { cn, createTransition } from '../utils';
export const Modal = forwardRef(
  (
    {
      isOpen,
      onClose,
      title,
      children,
      size = 'md',
      closeOnOverlayClick = true,
      closeOnEscape = true,
      showCloseButton = true,
      footer,
      className,
      style,
      testId,
      ...props
    },
    ref
  ) => {
    const theme = useTheme();
    const modalRef = useRef(null);
    const previousActiveElement = useRef(null);
    // Handle escape key
    useEffect(() => {
      const handleKeyDown = event => {
        if (event.key === 'Escape' && closeOnEscape && isOpen) {
          onClose();
        }
      };
      if (isOpen) {
        document.addEventListener('keydown', handleKeyDown);
        // Store the previously focused element
        previousActiveElement.current = document.activeElement;
        // Focus the modal
        setTimeout(() => {
          modalRef.current?.focus();
        }, 0);
      }
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        // Restore focus to previously focused element
        if (previousActiveElement.current && !isOpen) {
          previousActiveElement.current.focus();
        }
      };
    }, [isOpen, closeOnEscape, onClose]);
    // Prevent body scroll when modal is open
    useEffect(() => {
      if (isOpen) {
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
          document.body.style.overflow = originalOverflow;
        };
      }
    }, [isOpen]);
    if (!isOpen) return null;
    const getSizeStyles = () => {
      const sizeMap = {
        sm: { maxWidth: '400px', width: '90vw' },
        md: { maxWidth: '600px', width: '90vw' },
        lg: { maxWidth: '800px', width: '90vw' },
        xl: { maxWidth: '1200px', width: '95vw' },
        full: { width: '100vw', height: '100vh', maxWidth: 'none', maxHeight: 'none' },
      };
      return sizeMap[size];
    };
    const overlayStyles = {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: size === 'full' ? 'stretch' : 'center',
      justifyContent: 'center',
      padding: size === 'full' ? 0 : `${theme.spacing.lg}px`,
      zIndex: 1000,
      backdropFilter: 'blur(4px)',
      WebkitBackdropFilter: 'blur(4px)',
    };
    const modalStyles = {
      backgroundColor: theme.colors.background,
      borderRadius: size === 'full' ? 0 : `${theme.borderRadius * 2}px`,
      boxShadow: theme.shadows.lg,
      maxHeight: size === 'full' ? '100vh' : '90vh',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      outline: 'none',
      position: 'relative',
      ...getSizeStyles(),
      ...style,
    };
    const handleOverlayClick = event => {
      if (closeOnOverlayClick && event.target === event.currentTarget) {
        onClose();
      }
    };
    const CloseIcon = () =>
      _jsxs('svg', {
        width: '24',
        height: '24',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        children: [
          _jsx('line', { x1: '18', y1: '6', x2: '6', y2: '18' }),
          _jsx('line', { x1: '6', y1: '6', x2: '18', y2: '18' }),
        ],
      });
    const modalContent = _jsx('div', {
      className: 'ui-modal-overlay',
      style: overlayStyles,
      onClick: handleOverlayClick,
      'data-testid': testId,
      children: _jsxs('div', {
        ref: ref || modalRef,
        className: cn('ui-modal', className),
        style: modalStyles,
        role: 'dialog',
        'aria-modal': 'true',
        'aria-labelledby': title ? 'modal-title' : undefined,
        tabIndex: -1,
        ...props,
        children: [
          (title || showCloseButton) &&
            _jsxs('div', {
              className: 'ui-modal-header',
              style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: `${theme.spacing.lg}px`,
                borderBottom: `1px solid ${theme.colors.border}`,
                flexShrink: 0,
              },
              children: [
                title &&
                  _jsx('h2', {
                    id: 'modal-title',
                    className: 'ui-modal-title',
                    style: {
                      margin: 0,
                      fontSize: `${theme.typography.fontSize.xl}px`,
                      fontWeight: theme.typography.fontWeight.semibold,
                      color: theme.colors.text,
                      fontFamily: theme.typography.fontFamily,
                    },
                    children: title,
                  }),
                showCloseButton &&
                  _jsx('button', {
                    className: 'ui-modal-close',
                    onClick: onClose,
                    style: {
                      background: 'none',
                      border: 'none',
                      padding: `${theme.spacing.xs}px`,
                      cursor: 'pointer',
                      color: theme.colors.textSecondary,
                      borderRadius: `${theme.borderRadius}px`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: createTransition(['color', 'background-color']),
                      marginLeft: `${theme.spacing.md}px`,
                    },
                    onMouseEnter: e => {
                      e.currentTarget.style.backgroundColor = theme.colors.surface;
                      e.currentTarget.style.color = theme.colors.text;
                    },
                    onMouseLeave: e => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = theme.colors.textSecondary;
                    },
                    'aria-label': 'Close modal',
                    children: _jsx(CloseIcon, {}),
                  }),
              ],
            }),
          _jsx('div', {
            className: 'ui-modal-content',
            style: {
              flex: 1,
              overflow: 'auto',
              padding: `${theme.spacing.lg}px`,
            },
            children: children,
          }),
          footer &&
            _jsx('div', {
              className: 'ui-modal-footer',
              style: {
                borderTop: `1px solid ${theme.colors.border}`,
                padding: `${theme.spacing.lg}px`,
                display: 'flex',
                justifyContent: 'flex-end',
                gap: `${theme.spacing.sm}px`,
                flexShrink: 0,
              },
              children: footer,
            }),
        ],
      }),
    });
    // Render modal in portal
    if (typeof document !== 'undefined') {
      return createPortal(modalContent, document.body);
    }
    return modalContent;
  }
);
Modal.displayName = 'Modal';
// Modal animation styles
export const modalAnimationStyles = `
  .ui-modal-overlay {
    animation: ui-modal-overlay-enter 200ms ease-out;
  }
  
  .ui-modal {
    animation: ui-modal-enter 200ms ease-out;
  }
  
  @keyframes ui-modal-overlay-enter {
    from {
      opacity: 0;
      backdrop-filter: blur(0px);
      -webkit-backdrop-filter: blur(0px);
    }
    to {
      opacity: 1;
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
    }
  }
  
  @keyframes ui-modal-enter {
    from {
      opacity: 0;
      transform: scale(0.95) translateY(-10px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
  
  @media (prefers-reduced-motion: reduce) {
    .ui-modal-overlay,
    .ui-modal {
      animation: none;
    }
  }
  
  /* Mobile responsiveness */
  @media (max-width: 768px) {
    .ui-modal-overlay {
      padding: 16px;
      align-items: flex-end;
    }
    
    .ui-modal {
      width: 100% !important;
      max-height: 90vh;
      border-radius: 16px 16px 0 0;
    }
    
    @keyframes ui-modal-enter {
      from {
        opacity: 0;
        transform: translateY(100%);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  }
`;
//# sourceMappingURL=Modal.js.map
