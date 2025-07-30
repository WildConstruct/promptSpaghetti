import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * LoadProjectDialog - Dialog for loading projects from .psg files
 */
import { useState } from 'react';
import { useGraphStore } from '../../graphStore';
export const LoadProjectDialog = ({ isOpen, onClose, onLoad }) => {
    const { loadProject, hasUnsavedChanges } = useGraphStore();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
    const handleLoadClick = () => {
        if (hasUnsavedChanges) {
            setShowUnsavedWarning(true);
        }
        else {
            performLoad();
        }
    };
    const performLoad = async () => {
        setIsLoading(true);
        setError(null);
        setShowUnsavedWarning(false);
        try {
            const result = await loadProject();
            onLoad?.(result);
            if (result.success) {
                onClose();
            }
            else {
                setError(result.error || 'Failed to load project');
            }
        }
        catch (err) {
            setError('An unexpected error occurred');
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleConfirmLoad = () => {
        performLoad();
    };
    const handleCancelWarning = () => {
        setShowUnsavedWarning(false);
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { style: {
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
        }, children: _jsxs("div", { style: {
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '24px',
                width: '90%',
                maxWidth: '500px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            }, children: [_jsxs("div", { style: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '24px',
                    }, children: [_jsx("h2", { style: {
                                margin: 0,
                                fontSize: '20px',
                                fontWeight: '600',
                                color: '#333',
                            }, children: "Load Project" }), _jsx("button", { onClick: onClose, style: {
                                background: 'none',
                                border: 'none',
                                fontSize: '24px',
                                cursor: 'pointer',
                                color: '#666',
                                padding: '0',
                                width: '32px',
                                height: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }, disabled: isLoading, children: "\u00D7" })] }), showUnsavedWarning && (_jsxs("div", { style: {
                        backgroundColor: '#fff3cd',
                        border: '1px solid #ffeaa7',
                        color: '#856404',
                        padding: '16px',
                        borderRadius: '4px',
                        marginBottom: '24px',
                    }, children: [_jsx("h3", { style: { margin: '0 0 8px 0', fontSize: '16px' }, children: "\u26A0\uFE0F Unsaved Changes" }), _jsx("p", { style: { margin: '0 0 16px 0', fontSize: '14px' }, children: "You have unsaved changes in your current project. Loading a new project will discard these changes." }), _jsxs("div", { style: { display: 'flex', gap: '12px', justifyContent: 'flex-end' }, children: [_jsx("button", { onClick: handleCancelWarning, style: {
                                        padding: '8px 16px',
                                        border: '1px solid #ddd',
                                        backgroundColor: 'white',
                                        color: '#666',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                    }, children: "Cancel" }), _jsx("button", { onClick: handleConfirmLoad, style: {
                                        padding: '8px 16px',
                                        border: 'none',
                                        backgroundColor: '#dc3545',
                                        color: 'white',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                    }, children: "Discard Changes & Load" })] })] })), !showUnsavedWarning && (_jsxs(_Fragment, { children: [_jsxs("div", { style: {
                                textAlign: 'center',
                                padding: '32px 16px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '6px',
                                marginBottom: '24px',
                            }, children: [_jsx("div", { style: {
                                        fontSize: '48px',
                                        marginBottom: '16px',
                                        opacity: 0.5,
                                    }, children: "\uD83D\uDCC1" }), _jsx("h3", { style: {
                                        margin: '0 0 8px 0',
                                        fontSize: '18px',
                                        color: '#333',
                                    }, children: "Choose Project File" }), _jsx("p", { style: {
                                        margin: 0,
                                        fontSize: '14px',
                                        color: '#666',
                                        lineHeight: 1.5,
                                    }, children: "Select a .psg project file from your device to load into the editor." })] }), _jsxs("div", { style: {
                                backgroundColor: '#e7f3ff',
                                border: '1px solid #b3d9ff',
                                padding: '12px',
                                borderRadius: '4px',
                                marginBottom: '24px',
                            }, children: [_jsx("h4", { style: { margin: '0 0 8px 0', fontSize: '14px', color: '#0066cc' }, children: "\uD83D\uDCCB Supported File Format" }), _jsxs("ul", { style: {
                                        margin: '0',
                                        paddingLeft: '16px',
                                        fontSize: '13px',
                                        color: '#0066cc',
                                        lineHeight: 1.4,
                                    }, children: [_jsx("li", { children: ".psg files created by this application" }), _jsx("li", { children: "Contains graph nodes, connections, and project metadata" }), _jsx("li", { children: "Automatically validates file format and compatibility" })] })] }), error && (_jsxs("div", { style: {
                                backgroundColor: '#fee',
                                border: '1px solid #fcc',
                                color: '#c33',
                                padding: '12px',
                                borderRadius: '4px',
                                marginBottom: '24px',
                                fontSize: '14px',
                            }, children: [_jsx("strong", { children: "Error:" }), " ", error] })), _jsxs("div", { style: {
                                display: 'flex',
                                gap: '12px',
                                justifyContent: 'flex-end',
                            }, children: [_jsx("button", { onClick: onClose, disabled: isLoading, style: {
                                        padding: '10px 20px',
                                        border: '1px solid #ddd',
                                        backgroundColor: 'white',
                                        color: '#666',
                                        borderRadius: '4px',
                                        cursor: isLoading ? 'not-allowed' : 'pointer',
                                        fontSize: '14px',
                                    }, children: "Cancel" }), _jsx("button", { onClick: handleLoadClick, disabled: isLoading, style: {
                                        padding: '10px 20px',
                                        border: 'none',
                                        backgroundColor: isLoading ? '#ccc' : '#007bff',
                                        color: 'white',
                                        borderRadius: '4px',
                                        cursor: isLoading ? 'not-allowed' : 'pointer',
                                        fontSize: '14px',
                                    }, children: isLoading ? 'Loading...' : 'Browse & Load Project' })] })] }))] }) }));
};
export default LoadProjectDialog;
