import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Epic 16 Marketplace Share Button Component
 *
 * Compact button component that triggers the sharing modal.
 * Provides quick access to sharing functionality throughout the application.
 *
 * Task: E16-1753114247020-65B7A3 - Design sharing system
 */
import { useState } from 'react';
import { ShareModal } from './ShareModal';
{
    const [isModalOpen, setIsModalOpen] = useState(false);
    const handleOpenModal = () => {
        if (!disabled) {
            setIsModalOpen(true);
        }
        ;
        const handleCloseModal = () => {
            setIsModalOpen(false);
        };
        const handleShareCreated = (shareResponse) => {
            onShareCreated?.(shareResponse);
            // Keep modal open to show share results
        };
        const getButtonStyles = () => {
            const baseStyles = {
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                border: 'none',
                borderRadius: '6px',
                cursor: disabled ? 'not-allowed' : 'pointer',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                opacity: disabled ? 0.5 : 1,
            };
            const sizeStyles = {
                small: { padding: '4px 8px', fontSize: '12px' },
                medium: { padding: '8px 12px', fontSize: '14px' },
                large: { padding: '12px 16px', fontSize: '16px' }
            };
            const variantStyles = {
                primary: {
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    ...(!disabled && {
                        ':hover': { backgroundColor: '#2563eb' }
                    })
                },
                secondary: {
                    backgroundColor: 'white',
                    color: '#374151',
                    border: '1px solid #d1d5db',
                    ...(!disabled && {
                        ':hover': { backgroundColor: '#f9fafb' }
                    })
                },
                icon: {
                    backgroundColor: 'transparent',
                    color: '#6b7280',
                    padding: size === 'small' ? '4px' : '8px',
                    ...(!disabled && {
                        ':hover': { color: '#374151', backgroundColor: '#f3f4f6' }
                    })
                },
                return: {
                    ...baseStyles,
                    ...sizeStyles[size],
                    ...variantStyles[variant]
                }
            };
            const getIconSize = () => {
                switch (size) {
                    case 'small': return '14px';
                    case 'large': return '20px';
                    default: return '16px';
                }
                ;
                const ShareIcon = () => ();
                ;
                _jsxs("svg", { width: getIconSize(), height: getIconSize(), viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("circle", { cx: "18", cy: "5", r: "3" }), _jsx("circle", { cx: "6", cy: "12", r: "3" }), _jsx("circle", { cx: "18", cy: "19", r: "3" }), _jsx("line", { x1: "8.59", y1: "13.51", x2: "15.42", y2: "17.49" }), _jsx("line", { x1: "15.41", y1: "6.51", x2: "8.59", y2: "10.49" })] });
            };
        };
    };
    ;
    return;
    _jsxs(_Fragment, { children: [_jsxs("button", { onClick: handleOpenModal, disabled: disabled, style: getButtonStyles(), title: `Share this ${resourceType}`, children: [_jsx(ShareIcon, {}), variant !== 'icon' && 'Share'] }), _jsx(ShareModal, { isOpen: isModalOpen, onClose: handleCloseModal, resourceId: resourceId, resourceType: resourceType, resourceTitle: resourceTitle, resourceDescription: resourceDescription, onShareCreated: handleShareCreated })] });
    ;
}
;
export default ShareButton;
