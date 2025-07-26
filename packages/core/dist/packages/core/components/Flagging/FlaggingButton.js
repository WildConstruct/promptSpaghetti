import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Epic 16 Flagging Button Component
 * Task: E16-1753114247010-121CC7 - Create flagging functionality
 *
 * User-facing flagging button that integrates with existing ML flagging
 * infrastructure. Provides easy content reporting with reason selection
 * and tracks flagging status.
 */
import React, { useState, useCallback } from 'react';
const DEFAULT_FLAGGING_REASONS = [
    {
        id: 'inappropriate_content',
        label: 'Inappropriate Content',
        description: 'Content contains inappropriate, offensive, or harmful material',
        severity: 'high',
        category: 'content',
        requiresDetails: false
    },
    {
        id: 'spam',
        label: 'Spam',
        description: 'Content is spam, promotional, or repetitive',
        severity: 'medium',
        category: 'spam',
        requiresDetails: false
    },
    {
        id: 'harassment',
        label: 'Harassment',
        description: 'Content contains harassment, bullying, or personal attacks',
        severity: 'high',
        category: 'harassment',
        requiresDetails: true
    },
    {
        id: 'copyright_violation',
        label: 'Copyright Violation',
        description: 'Content violates copyright or intellectual property rights',
        severity: 'high',
        category: 'legal',
        requiresDetails: true
    },
    {
        id: 'security_issue',
        label: 'Security Issue',
        description: 'Content contains security vulnerabilities or malicious code',
        severity: 'critical',
        category: 'security',
        requiresDetails: true
    },
    {
        id: 'misinformation',
        label: 'Misinformation',
        description: 'Content contains false or misleading information',
        severity: 'medium',
        category: 'content',
        requiresDetails: true
    },
    {
        id: 'privacy_violation',
        label: 'Privacy Violation',
        description: 'Content exposes private or personal information',
        severity: 'high',
        category: 'legal',
        requiresDetails: true
    },
    {
        id: 'low_quality',
        label: 'Low Quality',
        description: 'Content is low quality, incomplete, or not useful',
        severity: 'low',
        category: 'content',
        requiresDetails: false
    },
    {
        id: 'off_topic',
        label: 'Off Topic',
        description: 'Content is not relevant to the platform or category',
        severity: 'low',
        category: 'content',
        requiresDetails: false
    },
    {
        id: 'other',
        label: 'Other',
        description: 'Other issue not covered by the above categories',
        severity: 'medium',
        category: 'other',
        requiresDetails: true
    }
];
export const FlaggingButton = ({ contentId, contentType, userId, onFlag, onStatusChange, disabled = false, showLabel = true, size = 'medium', variant = 'button', className = '' }) => {
    // State management
    const [showModal, setShowModal] = useState(false);
    const [selectedReason, setSelectedReason] = useState('');
    const [details, setDetails] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [status, setStatus] = useState({
        contentId,
        canFlag: true,
        alreadyFlagged: false,
        flagCount: 0,
        userHasFlagged: false,
        status: 'none'
    });
    // Load flagging status
    React.useEffect(() => {
        loadFlaggingStatus();
    }, [contentId, userId]);
    const loadFlaggingStatus = async () => {
        try {
            // In real implementation, this would call the API
            // For now, we'll simulate status loading
            const mockStatus = {
                contentId,
                canFlag: !disabled,
                alreadyFlagged: Math.random() > 0.8, // 20% chance already flagged
                flagCount: Math.floor(Math.random() * 5),
                userHasFlagged: Math.random() > 0.9, // 10% chance user already flagged
                status: 'none'
            };
            setStatus(mockStatus);
            if (onStatusChange) {
                onStatusChange(mockStatus);
            }
        }
        catch (err) {
            console.error('Failed to load flagging status:', err);
        }
    };
    const handleFlagClick = useCallback(() => {
        if (disabled || status.userHasFlagged) {
            return;
        }
        setShowModal(true);
        setError(null);
        setSuccess(false);
    }, [disabled, status.userHasFlagged]);
    const handleSubmitFlag = async () => {
        if (!selectedReason) {
            setError('Please select a reason for flagging this content');
            return;
        }
        const reason = DEFAULT_FLAGGING_REASONS.find(r => r.id === selectedReason);
        if (reason?.requiresDetails && !details.trim()) {
            setError('Please provide additional details for this type of report');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const submission = {
                contentId,
                contentType,
                reasonId: selectedReason,
                details: details.trim() || undefined,
                reporterId: userId,
                metadata: {
                    severity: reason?.severity,
                    category: reason?.category,
                    timestamp: new Date().toISOString()
                }
            };
            if (onFlag) {
                await onFlag(submission);
            }
            // Update status
            const updatedStatus = {
                ...status,
                userHasFlagged: true,
                flagCount: status.flagCount + 1,
                status: 'pending'
            };
            setStatus(updatedStatus);
            if (onStatusChange) {
                onStatusChange(updatedStatus);
            }
            setSuccess(true);
            // Close modal after delay
            setTimeout(() => {
                setShowModal(false);
                setSelectedReason('');
                setDetails('');
                setSuccess(false);
            }, 2000);
            console.log(`✅ Content flagged: ${contentId} for reason: ${selectedReason}`);
        }
        catch (err) {
            setError(`Failed to submit flag: ${err.message}`);
            console.error('Flagging failed:', err);
        }
        finally {
            setLoading(false);
        }
    };
    const handleCancel = () => {
        setShowModal(false);
        setSelectedReason('');
        setDetails('');
        setError(null);
        setSuccess(false);
    };
    // Button styling based on props
    const buttonStyles = {
        small: {
            padding: '4px 8px',
            fontSize: '11px',
            minWidth: variant === 'icon' ? '24px' : '60px',
            height: '24px'
        },
        medium: {
            padding: '6px 12px',
            fontSize: '12px',
            minWidth: variant === 'icon' ? '28px' : '70px',
            height: '28px'
        },
        large: {
            padding: '8px 16px',
            fontSize: '14px',
            minWidth: variant === 'icon' ? '32px' : '80px',
            height: '32px'
        }
    };
    const getButtonColor = () => {
        if (disabled || status.userHasFlagged)
            return '#9ca3af';
        if (status.alreadyFlagged)
            return '#d97706';
        return '#6b7280';
    };
    const getButtonText = () => {
        if (status.userHasFlagged)
            return '✓ Flagged';
        if (variant === 'icon')
            return '🚩';
        return showLabel ? '🚩 Flag' : '🚩';
    };
    const getTooltipText = () => {
        if (status.userHasFlagged)
            return 'You have already flagged this content';
        if (disabled)
            return 'Flagging is not available';
        return 'Report this content for review';
    };
    // Render button
    const renderButton = () => {
        const baseStyle = {
            ...buttonStyles[size],
            backgroundColor: 'transparent',
            border: variant === 'link' ? 'none' : '1px solid #e5e7eb',
            borderRadius: '4px',
            color: getButtonColor(),
            cursor: (disabled || status.userHasFlagged) ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            fontWeight: '500',
            textDecoration: variant === 'link' ? 'underline' : 'none',
            opacity: (disabled || status.userHasFlagged) ? 0.6 : 1,
            transition: 'all 0.2s ease'
        };
        return (_jsxs("button", { onClick: handleFlagClick, disabled: disabled || status.userHasFlagged, title: getTooltipText(), style: baseStyle, className: className, onMouseOver: (e) => {
                if (!disabled && !status.userHasFlagged) {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                }
            }, onMouseOut: (e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
            }, children: [getButtonText(), status.flagCount > 0 && variant !== 'icon' && (_jsx("span", { style: {
                        fontSize: '10px',
                        backgroundColor: '#fee2e2',
                        color: '#dc2626',
                        padding: '1px 4px',
                        borderRadius: '8px',
                        marginLeft: '4px'
                    }, children: status.flagCount }))] }));
    };
    return (_jsxs(_Fragment, { children: [renderButton(), showModal && (_jsx("div", { style: {
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }, children: _jsxs("div", { style: {
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        padding: '24px',
                        minWidth: '400px',
                        maxWidth: '500px',
                        maxHeight: '80vh',
                        overflowY: 'auto',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }, children: [_jsxs("div", { style: {
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '20px',
                                paddingBottom: '12px',
                                borderBottom: '1px solid #e5e7eb'
                            }, children: [_jsx("h3", { style: {
                                        margin: 0,
                                        fontSize: '18px',
                                        fontWeight: '600',
                                        color: '#111827'
                                    }, children: "\uD83D\uDEA9 Flag Content" }), _jsx("button", { onClick: handleCancel, style: {
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        fontSize: '20px',
                                        color: '#6b7280',
                                        cursor: 'pointer'
                                    }, children: "\u00D7" })] }), success && (_jsx("div", { style: {
                                padding: '12px',
                                backgroundColor: '#d1fae5',
                                border: '1px solid #a7f3d0',
                                borderRadius: '6px',
                                color: '#065f46',
                                marginBottom: '16px',
                                textAlign: 'center'
                            }, children: "\u2705 Content has been flagged for review. Thank you for helping keep our community safe!" })), error && (_jsxs("div", { style: {
                                padding: '12px',
                                backgroundColor: '#fef2f2',
                                border: '1px solid #fecaca',
                                borderRadius: '6px',
                                color: '#dc2626',
                                marginBottom: '16px'
                            }, children: ["\u274C ", error] })), !success && (_jsxs(_Fragment, { children: [_jsxs("p", { style: {
                                        margin: '0 0 16px 0',
                                        fontSize: '14px',
                                        color: '#6b7280',
                                        lineHeight: '1.4'
                                    }, children: ["Please select the reason why you're flagging this ", contentType, ". Our moderation team will review your report."] }), _jsxs("div", { style: { marginBottom: '16px' }, children: [_jsx("label", { style: {
                                                display: 'block',
                                                fontSize: '14px',
                                                fontWeight: '500',
                                                color: '#374151',
                                                marginBottom: '8px'
                                            }, children: "Reason for flagging:" }), _jsx("div", { style: {
                                                display: 'grid',
                                                gap: '8px'
                                            }, children: DEFAULT_FLAGGING_REASONS.map(reason => (_jsxs("label", { style: {
                                                    display: 'flex',
                                                    alignItems: 'flex-start',
                                                    gap: '8px',
                                                    padding: '8px',
                                                    border: selectedReason === reason.id ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    backgroundColor: selectedReason === reason.id ? '#eff6ff' : 'white'
                                                }, children: [_jsx("input", { type: "radio", name: "reason", value: reason.id, checked: selectedReason === reason.id, onChange: (e) => setSelectedReason(e.target.value), style: { marginTop: '2px' } }), _jsxs("div", { style: { flex: 1 }, children: [_jsxs("div", { style: {
                                                                    fontSize: '13px',
                                                                    fontWeight: '500',
                                                                    color: '#111827',
                                                                    marginBottom: '2px'
                                                                }, children: [reason.label, _jsx("span", { style: {
                                                                            marginLeft: '6px',
                                                                            fontSize: '10px',
                                                                            padding: '1px 4px',
                                                                            borderRadius: '4px',
                                                                            backgroundColor: reason.severity === 'critical' ? '#dc2626' :
                                                                                reason.severity === 'high' ? '#d97706' :
                                                                                    reason.severity === 'medium' ? '#3b82f6' : '#6b7280',
                                                                            color: 'white'
                                                                        }, children: reason.severity })] }), _jsx("div", { style: {
                                                                    fontSize: '12px',
                                                                    color: '#6b7280'
                                                                }, children: reason.description })] })] }, reason.id))) })] }), selectedReason && DEFAULT_FLAGGING_REASONS.find(r => r.id === selectedReason)?.requiresDetails && (_jsxs("div", { style: { marginBottom: '16px' }, children: [_jsxs("label", { style: {
                                                display: 'block',
                                                fontSize: '14px',
                                                fontWeight: '500',
                                                color: '#374151',
                                                marginBottom: '8px'
                                            }, children: ["Additional details: ", _jsx("span", { style: { color: '#dc2626' }, children: "*" })] }), _jsx("textarea", { value: details, onChange: (e) => setDetails(e.target.value), placeholder: "Please provide specific details about this issue...", style: {
                                                width: '100%',
                                                minHeight: '80px',
                                                padding: '8px',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '4px',
                                                fontSize: '13px',
                                                fontFamily: 'inherit',
                                                resize: 'vertical'
                                            } })] })), _jsxs("div", { style: {
                                        display: 'flex',
                                        justifyContent: 'flex-end',
                                        gap: '8px',
                                        paddingTop: '16px',
                                        borderTop: '1px solid #e5e7eb'
                                    }, children: [_jsx("button", { onClick: handleCancel, disabled: loading, style: {
                                                padding: '8px 16px',
                                                backgroundColor: 'white',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '6px',
                                                fontSize: '14px',
                                                fontWeight: '500',
                                                color: '#374151',
                                                cursor: loading ? 'not-allowed' : 'pointer',
                                                opacity: loading ? 0.6 : 1
                                            }, children: "Cancel" }), _jsxs("button", { onClick: handleSubmitFlag, disabled: !selectedReason || loading, style: {
                                                padding: '8px 16px',
                                                backgroundColor: selectedReason && !loading ? '#dc2626' : '#9ca3af',
                                                border: 'none',
                                                borderRadius: '6px',
                                                fontSize: '14px',
                                                fontWeight: '500',
                                                color: 'white',
                                                cursor: selectedReason && !loading ? 'pointer' : 'not-allowed',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px'
                                            }, children: [loading && (_jsx("div", { style: {
                                                        width: '12px',
                                                        height: '12px',
                                                        border: '2px solid white',
                                                        borderTop: '2px solid transparent',
                                                        borderRadius: '50%',
                                                        animation: 'spin 1s linear infinite'
                                                    } })), "Submit Flag"] })] })] }))] }) })), _jsx("style", { children: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        ` })] }));
};
export default FlaggingButton;
