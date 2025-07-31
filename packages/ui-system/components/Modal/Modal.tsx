/**
 * Modal Component - Epic 16 Design System Foundation
 * Accessible modal component for sharing dialogs and overlays
 */

import React, { useEffect, useRef, useCallback, ReactNode } from 'react';
import { colors } from '../../tokens/colors';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  preventBodyScroll?: boolean;
  className?: string;
  overlayClassName?: string;
  contentClassName?: string;
  style?: React.CSSProperties;
  overlayStyle?: React.CSSProperties;
  contentStyle?: React.CSSProperties;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
}

// Modal size configurations
const modalSizes = {
  sm: {
    maxWidth: '24rem', // 384px
    width: '90vw',
  },
  md: {
    maxWidth: '32rem', // 512px
    width: '90vw',
  },
  lg: {
    maxWidth: '48rem', // 768px
    width: '90vw',
  },
  xl: {
    maxWidth: '64rem', // 1024px
    width: '95vw',
  },
  full: {
    maxWidth: '100vw',
    width: '100vw',
    height: '100vh',
    borderRadius: '0',
  },
} as const;

// Close icon component
const CloseIcon: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Focus trap hook
const useFocusTrap = (isOpen: boolean, containerRef: React.RefObject<HTMLDivElement>) => {
  const firstFocusableElementRef = useRef<HTMLElement | null>(null);
  const lastFocusableElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    firstFocusableElementRef.current = focusableElements[0] as HTMLElement;
    lastFocusableElementRef.current = focusableElements[focusableElements.length - 1] as HTMLElement;

    // Focus first element when modal opens
    firstFocusableElementRef.current?.focus();

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstFocusableElementRef.current) {
          lastFocusableElementRef.current?.focus();
          e.preventDefault();
        }
      } else {
        // Tab
        if (document.activeElement === lastFocusableElementRef.current) {
          firstFocusableElementRef.current?.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);
    return () => document.removeEventListener('keydown', handleTabKey);
  }, [isOpen, containerRef]);
};

// Body scroll lock hook
const useBodyScrollLock = (isLocked: boolean) => {
  useEffect(() => {
    if (!isLocked) return;

    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [isLocked]);
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  preventBodyScroll = true,
  className = '',
  overlayClassName = '',
  contentClassName = '',
  style,
  overlayStyle,
  contentStyle,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Hooks
  useFocusTrap(isOpen, modalRef);
  useBodyScrollLock(isOpen && preventBodyScroll);

  // Event handlers
  const handleEscapeKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape) {
        onClose();
      }
    },
    [closeOnEscape, onClose]
  );

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (closeOnOverlayClick && e.target === overlayRef.current) {
        onClose();
      }
    },
    [closeOnOverlayClick, onClose]
  );

  // Effects
  useEffect(() => {
    if (isOpen && closeOnEscape) {
      document.addEventListener('keydown', handleEscapeKey);
      return () => document.removeEventListener('keydown', handleEscapeKey);
    }
  }, [isOpen, handleEscapeKey, closeOnEscape]);

  // Don't render if not open
  if (!isOpen) return null;

  // Styles
  const overlayStyles: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.component.modal.overlay,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
    zIndex: 1000,
    animation: 'modalOverlayFadeIn 0.2s ease-out',
    ...overlayStyle,
  };

  const modalStyles: React.CSSProperties = {
    backgroundColor: colors.component.modal.background,
    borderRadius: '0.5rem',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    border: `1px solid ${colors.component.modal.border}`,
    ...modalSizes[size],
    maxHeight: size === 'full' ? '100vh' : '90vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    animation: 'modalContentSlideIn 0.2s ease-out',
    ...contentStyle,
  };

  const headerStyles: React.CSSProperties = {
    padding: '1.5rem 1.5rem 0 1.5rem',
    borderBottom: title || description ? `1px solid ${colors.semantic.border.default}` : 'none',
    paddingBottom: title || description ? '1rem' : '0',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '1rem',
  };

  const bodyStyles: React.CSSProperties = {
    padding: '1.5rem',
    flex: 1,
    overflow: 'auto',
  };

  const titleStyles: React.CSSProperties = {
    fontSize: '1.25rem',
    fontWeight: '600',
    lineHeight: '1.5',
    color: colors.semantic.text.primary,
    margin: 0,
  };

  const descriptionStyles: React.CSSProperties = {
    fontSize: '0.875rem',
    color: colors.semantic.text.secondary,
    marginTop: '0.25rem',
    margin: 0,
  };

  const closeButtonStyles: React.CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.5rem',
    borderRadius: '0.25rem',
    color: colors.semantic.text.tertiary,
    transition: 'color 0.2s ease-in-out',
    flexShrink: 0,
    marginTop: '-0.5rem',
    marginRight: '-0.5rem',
  };

  return (
    <>
      {/* Add keyframe animations */}
      <style>
        {`
          @keyframes modalOverlayFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes modalContentSlideIn {
            from { 
              opacity: 0;
              transform: scale(0.95) translateY(-10px);
            }
            to { 
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }
        `}
      </style>

      <div
        ref={overlayRef}
        className={`ui-modal-overlay ${overlayClassName}`}
        style={overlayStyles}
        onClick={handleOverlayClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabelledBy || (title ? 'modal-title' : undefined)}
        aria-describedby={ariaDescribedBy || (description ? 'modal-description' : undefined)}
      >
        <div
          ref={modalRef}
          className={`ui-modal-content ${contentClassName}`}
          style={{
            ...modalStyles,
            ...style,
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          {(title || description || showCloseButton) && (
            <div className="ui-modal-header" style={headerStyles}>
              <div style={{ flex: 1, minWidth: 0 }}>
                {title && (
                  <h2 id="modal-title" className="ui-modal-title" style={titleStyles}>
                    {title}
                  </h2>
                )}
                {description && (
                  <p id="modal-description" className="ui-modal-description" style={descriptionStyles}>
                    {description}
                  </p>
                )}
              </div>

              {showCloseButton && (
                <button
                  type="button"
                  className="ui-modal-close"
                  style={closeButtonStyles}
                  onClick={onClose}
                  aria-label="Close modal"
                  onMouseEnter={e => {
                    e.currentTarget.style.color = colors.semantic.text.primary;
                    e.currentTarget.style.backgroundColor = colors.base.gray[100];
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = colors.semantic.text.tertiary;
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <CloseIcon size={20} />
                </button>
              )}
            </div>
          )}

          {/* Body */}
          <div className={`ui-modal-body ${className}`} style={bodyStyles}>
            {children}
          </div>
        </div>
      </div>
    </>
  );
};

// Modal footer component for consistent action layouts
export interface ModalFooterProps {
  children: ReactNode;
  justify?: 'start' | 'center' | 'end' | 'between';
  className?: string;
  style?: React.CSSProperties;
}

export const ModalFooter: React.FC<ModalFooterProps> = ({ children, justify = 'end', className = '', style }) => {
  const footerStyles: React.CSSProperties = {
    padding: '1rem 1.5rem',
    borderTop: `1px solid ${colors.semantic.border.default}`,
    display: 'flex',
    gap: '0.75rem',
    justifyContent:
      justify === 'start'
        ? 'flex-start'
        : justify === 'center'
          ? 'center'
          : justify === 'end'
            ? 'flex-end'
            : 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    ...style,
  };

  return (
    <div className={`ui-modal-footer ${className}`} style={footerStyles}>
      {children}
    </div>
  );
};

// Modal header component for custom headers
export interface ModalHeaderProps {
  children: ReactNode;
  showCloseButton?: boolean;
  onClose?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({
  children,
  showCloseButton = true,
  onClose,
  className = '',
  style,
}) => {
  const headerStyles: React.CSSProperties = {
    padding: '1.5rem 1.5rem 1rem 1.5rem',
    borderBottom: `1px solid ${colors.semantic.border.default}`,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '1rem',
    ...style,
  };

  const closeButtonStyles: React.CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.5rem',
    borderRadius: '0.25rem',
    color: colors.semantic.text.tertiary,
    transition: 'color 0.2s ease-in-out',
    flexShrink: 0,
    marginTop: '-0.5rem',
    marginRight: '-0.5rem',
  };

  return (
    <div className={`ui-modal-header ${className}`} style={headerStyles}>
      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>

      {showCloseButton && onClose && (
        <button
          type="button"
          className="ui-modal-close"
          style={closeButtonStyles}
          onClick={onClose}
          aria-label="Close modal"
          onMouseEnter={e => {
            e.currentTarget.style.color = colors.semantic.text.primary;
            e.currentTarget.style.backgroundColor = colors.base.gray[100];
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = colors.semantic.text.tertiary;
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <CloseIcon size={20} />
        </button>
      )}
    </div>
  );
};

// Export types for external use
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';
