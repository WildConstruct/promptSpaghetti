import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Epic 16 Flagging Button Component
 * Task: E16-1753114247010-121CC7 - Create flagging functionality
 *
 * User-facing flagging button that integrates with existing ML flagging
 * infrastructure. Provides easy content reporting with reason selection
 * and tracks flagging status.
 */
import React, { useState, useCallback } from 'react';
export const FlaggingButton = ({
    contentId,
    contentType,
    userId,
    onFlag,
    onStatusChange,
    disabled = false,
    showLabel = true,
    size = 'medium',
    variant = 'button',
    className = ''
});
{
    // State management
    const [showModal, setShowModal] = useState(false);
    const [selectedReason, setSelectedReason] = useState('');
    const [details, setDetails] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [status, setStatus] = useState({});
    contentId,
        canFlag;
    true,
        alreadyFlagged;
    false,
        flagCount;
    0,
        userHasFlagged;
    false,
        status;
    'none',
    ;
}
;
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
            alreadyFlagged: Math.random() > 0.8, // 20% chance already flagged,
            flagCount: Math.floor(Math.random() * 5),
            userHasFlagged: Math.random() > 0.9, // 10% chance user already flagged,
            status: 'none',
        };
        setStatus(mockStatus);
        if (onStatusChange) {
            onStatusChange(mockStatus);
        }
        try { }
        catch (err) {
            console.error('Failed to load flagging status:', err);
        }
        ;
        const handleFlagClick = useCallback(() => {
            if (disabled || status.userHasFlagged) {
                return;
                setShowModal(true);
                setError(null);
                setSuccess(false);
            }
            [disabled, status.userHasFlagged];
        });
        const handleSubmitFlag = async () => {
            if (!selectedReason) {
                setError('Please select a reason for flagging this content');
                return;
                const reason = DEFAULT_FLAGGING_REASONS.find(r => r.id === selectedReason);
                if (reason?.requiresDetails && !details.trim()) {
                    setError('Please provide additional details for this type of report');
                    return;
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
                                timestamp: new Date().toISOString(),
                            },
                            if(onFlag) {
                                await onFlag(submission);
                                // Update status
                                const updatedStatus = {
                                    ...status,
                                    userHasFlagged: true,
                                    flagCount: status.flagCount + 1,
                                    status: 'pending',
                                };
                                setStatus(updatedStatus);
                                if (onStatusChange) {
                                    onStatusChange(updatedStatus);
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
                            }, catch(err) {
                                setError(`Failed to submit flag: ${err.message}`);
                            },
                            console, : .error('Flagging failed:', err) };
                        try { }
                        finally {
                            setLoading(false);
                        }
                        ;
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
                                height: '24px',
                            },
                            medium: {
                                padding: '6px 12px',
                                fontSize: '12px',
                                minWidth: variant === 'icon' ? '28px' : '70px',
                                height: '28px',
                            },
                            large: {
                                padding: '8px 16px',
                                fontSize: '14px',
                                minWidth: variant === 'icon' ? '32px' : '80px',
                                height: '32px',
                            },
                            const: getButtonColor = () => {
                                if (disabled || status.userHasFlagged)
                                    return '#9ca3af';
                                if (status.alreadyFlagged)
                                    return '#d97706';
                                return '#6b7280';
                            },
                            const: getButtonText = () => {
                                if (status.userHasFlagged)
                                    return '✓ Flagged';
                                if (variant === 'icon')
                                    return '🚩';
                                return showLabel ? '🚩 Flag' : '🚩';
                            },
                            const: getTooltipText = () => {
                                if (status.userHasFlagged)
                                    return 'You have already flagged this content';
                                if (disabled)
                                    return 'Flagging is not available';
                                return 'Report this content for review';
                            },
                            // Render button
                            const: renderButton = () => {
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
                                    transition: 'all 0.2s ease',
                                };
                                return;
                                _jsxs("button", { onClick: handleFlagClick, disabled: disabled || status.userHasFlagged, title: getTooltipText(), style: baseStyle, className: className, onMouseOver: (e) => {
                                        if (!disabled && !status.userHasFlagged) {
                                            e.currentTarget.style.backgroundColor = '#f3f4f6';
                                        }
                                    }, onMouseOut: (e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                    }, children: [getButtonText(), status.flagCount > 0 && variant !== 'icon' && ()
                                            < span, " style=", {
                                            fontSize: '10px',
                                            backgroundColor: '#fee2e2',
                                            color: '#dc2626',
                                            padding: '1px 4px',
                                            borderRadius: '8px',
                                            marginLeft: '4px',
                                        }, ">", status.flagCount] });
                            }
                        };
                    }
                    finally {
                    }
                }
            }
        };
    }
    finally {
    }
};
button >
;
;
;
return;
_jsxs(_Fragment, { children: [renderButton(), showModal && ()
            < div, " style=", {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
        }, ">", _jsxs("div", { style: {
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '24px',
                minWidth: '400px',
                maxWidth: '500px',
                maxHeight: '80vh',
                overflowY: 'auto',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }, children: [_jsxs("div", { style: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '20px',
                        paddingBottom: '12px',
                        borderBottom: '1px solid #e5e7eb',
                    }, children: [_jsx("h3", { style: {
                                margin: 0,
                                fontSize: '18px',
                                fontWeight: '600',
                                color: '#111827',
                            }, children: "\uD83D\uDEA9 Flag Content" }), _jsx("button", { onClick: handleCancel, style: {
                                backgroundColor: 'transparent',
                                border: 'none',
                                fontSize: '20px',
                                color: '#6b7280',
                                cursor: 'pointer',
                            }, children: "\u00D7" })] }), success && ()
                    < div, " style=", {
                    padding: '12px',
                    backgroundColor: '#d1fae5',
                    border: '1px solid #a7f3d0',
                    borderRadius: '6px',
                    color: '#065f46',
                    marginBottom: '16px',
                    textAlign: 'center',
                }, "> \u2705 Content has been flagged for review. Thank you for helping keep our community safe!"] }), ")}", error && ()
            < div, " style=", {
            padding: '12px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '6px',
            color: '#dc2626',
            marginBottom: '16px',
        }, "> \u274C ", error] });
div >
;
{
    !success && ();
    { /* Instructions */ }
    _jsxs("p", { style: {
            margin: '0 0 16px 0',
            fontSize: '14px',
            color: '#6b7280',
            lineHeight: '1.4',
        }, children: ["Please select the reason why you're flagging this ", contentType, ". Our moderation team will review your report."] });
    { /* Reason Selection */ }
    _jsxs("div", { style: { marginBottom: '16px' }, children: [_jsx("label", { style: {
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '8px',
                }, children: "Reason for flagging:" }), _jsxs("div", { style: {
                    display: 'grid',
                    gap: '8px',
                }, children: [DEFAULT_FLAGGING_REASONS.map(reason => ()
                        < label, key = { reason, : .id }, style = {}, {
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px',
                        padding: '8px',
                        border: selectedReason === reason.id ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        backgroundColor: selectedReason === reason.id ? '#eff6ff' : 'white',
                    }), ">", _jsx("input", { type: "radio", name: "reason", value: reason.id, checked: selectedReason === reason.id, onChange: (e) => setSelectedReason(e.target.value), style: { marginTop: '2px' } }), _jsxs("div", { style: { flex: 1 }, children: [_jsxs("div", { style: {
                                    fontSize: '13px',
                                    fontWeight: '500',
                                    color: '#111827',
                                    marginBottom: '2px',
                                }, children: [reason.label, _jsx("span", { style: {
                                            marginLeft: '6px',
                                            fontSize: '10px',
                                            padding: '1px 4px',
                                            borderRadius: '4px',
                                            backgroundColor: reason.severity === 'critical' ? '#dc2626' : ,
                                            reason, : .severity === 'high' ? '#d97706' : ,
                                            reason, : .severity === 'medium' ? '#3b82f6' : '#6b7280',
                                            color: 'white',
                                        }, children: reason.severity })] }), _jsx("div", { style: {
                                    fontSize: '12px',
                                    color: '#6b7280',
                                }, children: reason.description })] })] }), "))}"] });
    div >
        { /* Additional Details */};
    {
        selectedReason && DEFAULT_FLAGGING_REASONS.find(r => r.id === selectedReason)?.requiresDetails && ()
            < div;
        style = {};
        {
            marginBottom: '16px';
        }
    }
     >
        (_jsxs("label", { style: {
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px',
            }, children: ["Additional details: ", _jsx("span", { style: { color: '#dc2626' }, children: "*" })] })
            ,
                _jsx("textarea", { value: details, onChange: (e) => setDetails(e.target.value), placeholder: "Please provide specific details about this issue...", style: {
                        width: '100%',
                        minHeight: '80px',
                        padding: '8px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        fontSize: '13px',
                        fontFamily: 'inherit',
                        resize: 'vertical',
                    } }));
    div >
    ;
}
{ /* Action Buttons */ }
_jsxs("div", { style: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '8px',
        paddingTop: '16px',
        borderTop: '1px solid #e5e7eb',
    }, children: [_jsx("button", { onClick: handleCancel, disabled: loading, style: {
                padding: '8px 16px',
                backgroundColor: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
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
                gap: '6px',
            }, children: [loading && ()
                    < div, " style=", {
                    width: '12px',
                    height: '12px',
                    border: '2px solid white',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                }, " /> )} Submit Flag"] })] });
 >
;
div >
;
div >
;
{ /* Add CSS animation for loading spinner */ }
_jsx("style", { children: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        ` });
 >
;
;
;
export default FlaggingButton;
