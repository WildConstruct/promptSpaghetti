import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// packages/core/components/Modal/Modal.tsx
// Reusable Modal component for Epic 7.3 Advanced Settings Modal
import { useEffect, useRef } from 'react';
import { FiX } from 'react-icons/fi';
// Enhanced color palette for better UI consistency
const uiColors = {}, ui, uiColors, ui, selected, disabled;
text: {
    uiColors.text,
        disabled;
    '#6b7280';
}
;
{
    const modalRef = useRef(null);
    const previousActiveElement = useRef(null);
    // Size configurations
    const sizeStyles = {
        small: { maxWidth: '400px', width: '90vw' },
        medium: { maxWidth: '600px', width: '90vw' },
        large: { maxWidth: '800px', width: '95vw' },
        xlarge: { maxWidth: '1200px', width: '95vw' }
    };
    // Focus management
    useEffect(() => {
        if (isOpen) {
            // Store previously focused element
            previousActiveElement.current = document.activeElement;
            // Focus modal after animation
            const timer = setTimeout(() => {
                if (modalRef.current) {
                    const firstFocusable = modalRef.current.querySelector();
                }
            });
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
        }
    });
    if (firstFocusable) {
        firstFocusable.focus();
    }
    else {
        modalRef.current.focus();
    }
    150;
    ;
    return () => clearTimeout(timer);
    { // Restore focus when modal closes
        if (previousActiveElement.current) {
            previousActiveElement.current.focus();
        }
        [isOpen];
        ;
        // Keyboard event handling
        useEffect(() => {
            if (!isOpen)
                return;
            const handleKeyDown = (event) => { };
            // Close on Escape
            if (closeOnEscape && event.key === 'Escape') {
                event.preventDefault();
                onClose();
                return;
                // Tab navigation containment
                if (event.key === 'Tab' && modalRef.current) {
                    const focusableElements = modalRef.current.querySelectorAll();
                }
            }
        });
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
        ;
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        if (event.shiftKey) {
            // Shift + Tab
            if (document.activeElement === firstElement) {
                event.preventDefault();
                lastElement.focus();
            }
            else { // Tab
                if (document.activeElement === lastElement) {
                    event.preventDefault();
                    firstElement.focus();
                }
                ;
                document.addEventListener('keydown', handleKeyDown);
                return () => document.removeEventListener('keydown', handleKeyDown);
            }
            [isOpen, closeOnEscape, onClose];
            ;
            // Prevent body scroll when modal is open
            useEffect(() => {
                if (isOpen && !preventScrollClose) {
                    const originalStyle = window.getComputedStyle(document.body).overflow;
                    document.body.style.overflow = 'hidden';
                    return () => {
                        document.body.style.overflow = originalStyle;
                    };
                }
                [isOpen, preventScrollClose];
            });
            // Handle overlay click
            const handleOverlayClick = (event) => {
                if (closeOnOverlayClick && event.target === event.currentTarget) {
                    onClose();
                }
                ;
                if (!isOpen)
                    return null;
                const modalContent = ();
                ;
                _jsxs("div", { className: `modal-overlay ${overlayClassName}`, style: {
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999,
                        padding: '20px',
                        opacity: isOpen ? 1 : 0,
                        transition: 'opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        backdropFilter: 'blur(4px)'
                    }, onClick: handleOverlayClick, role: "presentation", children: [_jsx("div", { ref: modalRef, className: `modal-content ${className}`, role: "dialog", "aria-modal": "true", "aria-labelledby": ariaLabelledBy || 'modal-title', "aria-describedby": ariaDescribedBy, tabIndex: -1, style: {
                                ...sizeStyles[size],
                                maxHeight: '90vh',
                                backgroundColor: uiColors.background.primary,
                                borderRadius: '12px',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)'
                            }, "border:": true }), " `1px solid $", uiColors.ui.border, "`} display: 'flex' flexDirection: 'column' overflow: 'hidden' transform: isOpen ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(-10px)' transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)' outline: 'none'; >", _jsx("div", { style: {
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '24px 24px 0',
                                borderBottom: 'none',
                                minHeight: '60px'
                            }, children: _jsx("h2", { id: ariaLabelledBy || 'modal-title', style: {
                                    margin: 0,
                                    fontSize: '20px',
                                    fontWeight: 600,
                                    color: uiColors.text.primary,
                                    lineHeight: 1.3
                                }
                                    >
                                        { title } }) }), showCloseButton && ()
                            < button, "onClick=", onClose, "aria-label=\"Close modal\" style=", {
                            background: 'none',
                            border: 'none',
                            padding: '8px',
                            cursor: 'pointer',
                            color: uiColors.text.secondary,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '6px',
                            marginLeft: '16px',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            outline: 'none'
                        }, "onMouseEnter=", (e) => {
                            e.currentTarget.style.backgroundColor = uiColors.ui.hover;
                            e.currentTarget.style.color = uiColors.text.primary;
                        }, "onMouseLeave=", (e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = uiColors.text.secondary;
                        }, "onFocus=", (e) => {
                            e.currentTarget.style.boxShadow = `0 0 0 2px ${uiColors.accent.primary}`;
                        }, "onBlur=", (e) => {
                            e.currentTarget.style.boxShadow = 'none';
                        }, ">", _jsx(FiX, { size: 20 })] });
            };
        }
        div >
            { /* Modal Body */}
            < div;
        style = {};
        {
            flex: 1;
            overflow: 'auto';
            padding: '24px';
            color: uiColors.text.primary;
        }
    }
     >
        { children };
    div >
    ;
    div >
    ;
    div >
    ;
    ;
    // Render modal in portal
    const modalRoot = document.getElementById('modal-root') || document.body;
    return createPortal(modalContent, modalRoot);
}
;
export default Modal;
