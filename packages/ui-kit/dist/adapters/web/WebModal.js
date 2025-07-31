import { jsx as _jsx } from 'react/jsx-runtime';
/**
 * Web-specific Modal implementation with enhanced features
 */
import { useEffect, useCallback } from 'react';
import { Modal } from '../../components/Modal';
import { usePlatformAdapter } from '../usePlatformAdapter';
export const WebModal = ({
  backdrop = 'clickable',
  keyboard = true,
  scrollable = true,
  centered = false,
  fullscreen = false,
  animation = true,
  isOpen,
  onClose,
  children,
  ...props
}) => {
  const adapter = usePlatformAdapter();
  // Enhanced escape key handling
  const handleEscapeKey = useCallback(
    e => {
      if (keyboard && e.key === 'Escape' && isOpen) {
        e.preventDefault();
        onClose();
      }
    },
    [keyboard, isOpen, onClose]
  );
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      // Focus management - focus the modal when it opens
      const modal = document.querySelector('[data-modal="true"]');
      if (modal) {
        modal.focus();
      }
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscapeKey]);
  // Enhanced overlay click handling
  const handleOverlayClick = e => {
    if (backdrop === 'clickable' && e.target === e.currentTarget) {
      onClose();
    }
  };
  // Browser history integration
  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      // Add a history entry when modal opens
      const handlePopState = () => {
        onClose();
      };
      window.addEventListener('popstate', handlePopState);
      window.history.pushState({ modal: true }, '');
      return () => {
        window.removeEventListener('popstate', handlePopState);
        // Clean up history state
        if (window.history.state?.modal) {
          window.history.back();
        }
      };
    }
  }, [isOpen, onClose]);
  const getModalSize = () => {
    if (fullscreen === true) return 'full';
    if (typeof fullscreen === 'string') return `fullscreen-${fullscreen}`;
    return props.size;
  };
  return _jsx(Modal, {
    ...props,
    isOpen: isOpen,
    onClose: onClose,
    size: getModalSize(),
    closeOnOverlayClick: backdrop === 'clickable',
    closeOnEscape: keyboard,
    style: {
      ...props.style,
      // Web-specific enhancements
      ...(animation && {
        transition: 'all 0.3s ease',
        opacity: isOpen ? 1 : 0,
        transform: isOpen ? 'scale(1)' : 'scale(0.95)',
      }),
      ...(centered && {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }),
      ...(scrollable && {
        maxHeight: '90vh',
        overflow: 'auto',
      }),
    },
    'data-modal': 'true',
    tabIndex: -1,
    role: 'dialog',
    'aria-modal': 'true',
    onClick: handleOverlayClick,
    children: children,
  });
};
//# sourceMappingURL=WebModal.js.map
