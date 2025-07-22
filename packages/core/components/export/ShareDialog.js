import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { FiShare2, FiX, FiCopy, FiEye, FiLock, FiCheck, FiAlertCircle, FiGlobe } from 'react-icons/fi';
const ACCESS_LEVELS = [
    {
        value: 'public',
        label: 'Public',
        description: 'Anyone with the link can access',
        icon: FiGlobe
    },
    {
        value: 'password_protected',
        label: 'Password Protected',
        description: 'Requires password to access',
        icon: FiLock
    },
    {
        value: 'private',
        label: 'Private',
        description: 'Only you can access',
        icon: FiEye
    }
];
const EXPIRATION_OPTIONS = [
    { value: null, label: 'Never expires' },
    { value: 1, label: '1 day' },
    { value: 7, label: '1 week' },
    { value: 30, label: '1 month' },
    { value: 90, label: '3 months' }
];
export const ShareDialog = ({ exportJob, onClose, onShareCreated, className = '' }) => {
    const [shareData, setShareData] = useState({
        export_job_id: exportJob.id,
        access_level: 'public',
        password: '',
        max_downloads: null,
        expires_in_days: null,
        description: '',
        allow_download: true,
        allow_preview: true,
        track_access: true,
        notify_on_access: false
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [createdShare, setCreatedShare] = useState(null);
    const [copyFeedback, setCopyFeedback] = useState(null);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            // Validate required fields
            if (shareData.access_level === 'password_protected' && !shareData.password) {
                throw new Error('Password is required for password-protected shares');
            }
            // Calculate expiration date if specified
            let expires_at;
            if (shareData.expires_in_days) {
                const expireDate = new Date();
                expireDate.setDate(expireDate.getDate() + shareData.expires_in_days);
                expires_at = expireDate.toISOString();
            }
            const sharePayload = {
                ...shareData,
                expires_at,
                export_job_id: exportJob.id
            };
            const response = await fetch('/api/export/shares', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(sharePayload),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create share');
            }
            const result = await response.json();
            const newShare = result.data;
            setCreatedShare(newShare);
            onShareCreated(newShare);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create share');
        }
        finally {
            setLoading(false);
        }
    };
    const handleCopyLink = async (shareUrl) => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopyFeedback('Link copied to clipboard!');
            setTimeout(() => setCopyFeedback(null), 3000);
        }
        catch (err) {
            setCopyFeedback('Failed to copy link');
            setTimeout(() => setCopyFeedback(null), 3000);
        }
    };
    const formatFileSize = (bytes) => {
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0)
            return '0 Bytes';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    };
    const getShareUrl = (share) => {
        return `${window.location.origin}/shared/${share.share_token}`;
    };
    if (createdShare) {
        return (_jsxs("div", { className: `share-dialog success-state ${className}`, children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(FiCheck, { className: "w-6 h-6 text-green-600" }), _jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-white", children: "Share Created Successfully" })] }), _jsx("button", { onClick: onClose, className: "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300", children: _jsx(FiX, { className: "w-6 h-6" }) })] }), _jsx("div", { className: "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6", children: _jsxs("div", { className: "flex items-start space-x-3", children: [_jsx(FiShare2, { className: "w-5 h-5 text-green-600 mt-0.5" }), _jsxs("div", { className: "flex-1", children: [_jsx("h4", { className: "text-sm font-medium text-green-800 dark:text-green-200 mb-2", children: "Your export is now shared" }), _jsx("div", { className: "bg-white dark:bg-gray-800 rounded border p-3 mb-3", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("code", { className: "text-sm text-gray-600 dark:text-gray-300 break-all", children: getShareUrl(createdShare) }), _jsx("button", { onClick: () => handleCopyLink(getShareUrl(createdShare)), className: "ml-2 p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors", title: "Copy link", children: _jsx(FiCopy, { className: "w-4 h-4" }) })] }) }), copyFeedback && (_jsx("p", { className: "text-sm text-green-700 dark:text-green-300", children: copyFeedback }))] })] }) }), _jsx("div", { className: "space-y-4", children: _jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "text-gray-600 dark:text-gray-400", children: "Access Level:" }), _jsx("p", { className: "font-medium text-gray-900 dark:text-white capitalize", children: createdShare.access_level.replace('_', ' ') })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-600 dark:text-gray-400", children: "File Size:" }), _jsx("p", { className: "font-medium text-gray-900 dark:text-white", children: exportJob.output_file_size ? formatFileSize(exportJob.output_file_size) : 'Unknown' })] }), createdShare.expires_at && (_jsxs("div", { children: [_jsx("span", { className: "text-gray-600 dark:text-gray-400", children: "Expires:" }), _jsx("p", { className: "font-medium text-gray-900 dark:text-white", children: new Date(createdShare.expires_at).toLocaleDateString() })] })), createdShare.max_downloads && (_jsxs("div", { children: [_jsx("span", { className: "text-gray-600 dark:text-gray-400", children: "Max Downloads:" }), _jsx("p", { className: "font-medium text-gray-900 dark:text-white", children: createdShare.max_downloads })] }))] }) }), _jsx("div", { className: "flex justify-end space-x-3 mt-8", children: _jsx("button", { onClick: onClose, className: "px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors", children: "Close" }) })] }));
    }
    return (_jsxs("div", { className: `share-dialog ${className}`, children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(FiShare2, { className: "w-6 h-6 text-blue-600" }), _jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-white", children: "Share Export" })] }), _jsx("button", { onClick: onClose, className: "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300", children: _jsx(FiX, { className: "w-6 h-6" }) })] }), _jsxs("div", { className: "bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("h4", { className: "font-medium text-gray-900 dark:text-white", children: [exportJob.export_format.toUpperCase(), " Export"] }), _jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400 capitalize", children: exportJob.export_type.replace('_', ' ') })] }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Status" }), _jsx("p", { className: "font-medium text-green-600 capitalize", children: exportJob.status })] })] }), exportJob.output_file_size && (_jsxs("p", { className: "text-sm text-gray-600 dark:text-gray-400 mt-2", children: ["File size: ", formatFileSize(exportJob.output_file_size)] }))] }), error && (_jsx("div", { className: "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(FiAlertCircle, { className: "w-5 h-5 text-red-600" }), _jsx("p", { className: "text-sm text-red-800 dark:text-red-200", children: error })] }) })), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3", children: "Access Level" }), _jsx("div", { className: "grid grid-cols-1 gap-3", children: ACCESS_LEVELS.map((level) => {
                                    const Icon = level.icon;
                                    return (_jsxs("label", { className: `flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${shareData.access_level === level.value
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                            : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`, children: [_jsx("input", { type: "radio", name: "access_level", value: level.value, checked: shareData.access_level === level.value, onChange: (e) => setShareData(prev => ({
                                                    ...prev,
                                                    access_level: e.target.value
                                                })), className: "sr-only" }), _jsx(Icon, { className: "w-5 h-5 text-gray-600 dark:text-gray-400" }), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-gray-900 dark:text-white", children: level.label }), _jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: level.description })] })] }, level.value));
                                }) })] }), shareData.access_level === 'password_protected' && (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "Password" }), _jsx("input", { type: "password", value: shareData.password, onChange: (e) => setShareData(prev => ({ ...prev, password: e.target.value })), className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white", placeholder: "Enter password for access", required: true })] })), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "Link Expiration" }), _jsx("select", { value: shareData.expires_in_days || '', onChange: (e) => setShareData(prev => ({
                                    ...prev,
                                    expires_in_days: e.target.value ? parseInt(e.target.value) : null
                                })), className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white", children: EXPIRATION_OPTIONS.map((option) => (_jsx("option", { value: option.value || '', children: option.label }, option.value))) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "Maximum Downloads" }), _jsxs("select", { value: shareData.max_downloads || '', onChange: (e) => setShareData(prev => ({
                                    ...prev,
                                    max_downloads: e.target.value ? parseInt(e.target.value) : null
                                })), className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white", children: [_jsx("option", { value: "", children: "Unlimited" }), _jsx("option", { value: "1", children: "1 download" }), _jsx("option", { value: "5", children: "5 downloads" }), _jsx("option", { value: "10", children: "10 downloads" }), _jsx("option", { value: "25", children: "25 downloads" }), _jsx("option", { value: "100", children: "100 downloads" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "Description (Optional)" }), _jsx("textarea", { value: shareData.description, onChange: (e) => setShareData(prev => ({ ...prev, description: e.target.value })), className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white", rows: 3, placeholder: "Add a description for this shared export..." })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("label", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", checked: shareData.track_access, onChange: (e) => setShareData(prev => ({ ...prev, track_access: e.target.checked })), className: "rounded border-gray-300 text-blue-600 focus:ring-blue-500" }), _jsx("span", { className: "text-sm text-gray-700 dark:text-gray-300", children: "Track access and download statistics" })] }), _jsxs("label", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", checked: shareData.notify_on_access, onChange: (e) => setShareData(prev => ({ ...prev, notify_on_access: e.target.checked })), className: "rounded border-gray-300 text-blue-600 focus:ring-blue-500" }), _jsx("span", { className: "text-sm text-gray-700 dark:text-gray-300", children: "Notify me when someone accesses this share" })] })] }), _jsxs("div", { className: "flex justify-end space-x-3", children: [_jsx("button", { type: "button", onClick: onClose, className: "px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors", children: "Cancel" }), _jsx("button", { type: "submit", disabled: loading, className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed", children: loading ? 'Creating Share...' : 'Create Share Link' })] })] })] }));
};
export default ShareDialog;
