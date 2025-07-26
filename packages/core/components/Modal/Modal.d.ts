import React, { ReactNode } from 'react';
export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    size?: 'small' | 'medium' | 'large' | 'xlarge';
    closeOnOverlayClick?: boolean;
    closeOnEscape?: boolean;
    showCloseButton?: boolean;
    preventScrollClose?: boolean;
    className?: string;
    overlayClassName?: string;
    'aria-labelledby'?: string;
    'aria-describedby'?: string;
}
/**
 * Professional modal component with accessibility features
 * - Focus management and keyboard navigation
 * - Accessible dialog pattern (ARIA)
 * - Smooth animations
 * - Multiple size options
 * - Portal rendering for z-index management
 */
export declare const Modal: React.FC<ModalProps>;
export default Modal;
//# sourceMappingURL=Modal.d.ts.map