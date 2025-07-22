import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { FiShare2, FiCopy, FiEye, FiEdit, FiTrash2, FiClock, FiDownload, FiLock, FiGlobe, FiUsers, FiRefreshCw, FiAlertCircle, FiCheck } from 'react-icons/fi';
export const ShareManager = ({ projectId, className = '' }) => {
    const [shares, setShares] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [copyFeedback, setCopyFeedback] = useState(null);
    const [selectedShare, setSelectedShare] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    useEffect(() => {
        fetchShares();
        fetchStats();
    }, [projectId]);
    const fetchShares = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/export/shares?project_id=${projectId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch shares');
            }
            const data = await response.json();
            setShares(data.data || []);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load shares');
        }
        finally {
            setLoading(false);
        }
    };
    const fetchStats = async () => {
        try {
            const response = await fetch(`/api/export/shares/stats?project_id=${projectId}`);
            if (response.ok) {
                const data = await response.json();
                setStats(data.data);
            }
        }
        catch (err) {
            console.error('Failed to fetch share stats:', err);
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
    const handleDeactivateShare = async (shareId) => {
        try {
            const response = await fetch(`/api/export/shares/${shareId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ is_active: false }),
            });
            if (!response.ok) {
                throw new Error('Failed to deactivate share');
            }
            await fetchShares();
            await fetchStats();
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to deactivate share');
        }
    };
    const handleDeleteShare = async (shareId) => {
        try {
            const response = await fetch(`/api/export/shares/${shareId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Failed to delete share');
            }
            await fetchShares();
            await fetchStats();
            setShowDeleteConfirm(null);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete share');
        }
    };
    const getAccessLevelIcon = (accessLevel) => {
        switch (accessLevel) {
            case 'public':
                return _jsx(FiGlobe, { className: "w-4 h-4 text-green-600" });
            case 'password_protected':
                return _jsx(FiLock, { className: "w-4 h-4 text-orange-600" });
            case 'private':
                return _jsx(FiEye, { className: "w-4 h-4 text-red-600" });
            default:
                return _jsx(FiShare2, { className: "w-4 h-4 text-gray-600" });
        }
    };
    const getAccessLevelColor = (accessLevel) => {
        switch (accessLevel) {
            case 'public':
                return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
            case 'password_protected':
                return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
            case 'private':
                return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
        }
    };
    const isShareExpired = (share) => {
        if (!share.expires_at)
            return false;
        return new Date(share.expires_at) < new Date();
    };
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    const getShareUrl = (share) => {
        return share.share_url || `${window.location.origin}/shared/${share.share_token}`;
    };
    return (_jsxs("div", { className: `share-manager ${className}`, children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-white", children: "Share Management" }), _jsx("p", { className: "text-sm text-gray-600 dark:text-gray-300", children: "Manage shared exports and access" })] }), _jsxs("button", { onClick: fetchShares, disabled: loading, className: "flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50", children: [_jsx(FiRefreshCw, { className: `w-4 h-4 ${loading ? 'animate-spin' : ''}` }), _jsx("span", { children: "Refresh" })] })] }), stats && (_jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 mb-6", children: [_jsx("div", { className: "bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm", children: _jsxs("div", { className: "flex items-center", children: [_jsx(FiShare2, { className: "w-5 h-5 text-blue-600 mr-2" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600 dark:text-gray-300", children: "Total Shares" }), _jsx("p", { className: "text-xl font-semibold text-gray-900 dark:text-white", children: stats.totalShares })] })] }) }), _jsx("div", { className: "bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm", children: _jsxs("div", { className: "flex items-center", children: [_jsx(FiCheck, { className: "w-5 h-5 text-green-600 mr-2" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600 dark:text-gray-300", children: "Active" }), _jsx("p", { className: "text-xl font-semibold text-gray-900 dark:text-white", children: stats.activeShares })] })] }) }), _jsx("div", { className: "bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm", children: _jsxs("div", { className: "flex items-center", children: [_jsx(FiDownload, { className: "w-5 h-5 text-purple-600 mr-2" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600 dark:text-gray-300", children: "Downloads" }), _jsx("p", { className: "text-xl font-semibold text-gray-900 dark:text-white", children: stats.totalDownloads })] })] }) }), _jsx("div", { className: "bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm", children: _jsxs("div", { className: "flex items-center", children: [_jsx(FiUsers, { className: "w-5 h-5 text-orange-600 mr-2" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600 dark:text-gray-300", children: "Total Access" }), _jsx("p", { className: "text-xl font-semibold text-gray-900 dark:text-white", children: stats.totalAccesses })] })] }) })] })), error && (_jsx("div", { className: "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(FiAlertCircle, { className: "w-5 h-5 text-red-600" }), _jsx("p", { className: "text-sm text-red-800 dark:text-red-200", children: error })] }) })), copyFeedback && (_jsx("div", { className: "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(FiCheck, { className: "w-5 h-5 text-green-600" }), _jsx("p", { className: "text-sm text-green-800 dark:text-green-200", children: copyFeedback })] }) })), loading ? (_jsx("div", { className: "flex items-center justify-center py-12", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" }) })) : shares.length === 0 ? (_jsxs("div", { className: "text-center py-12", children: [_jsx(FiShare2, { className: "w-12 h-12 text-gray-400 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 dark:text-white mb-2", children: "No shares found" }), _jsx("p", { className: "text-gray-600 dark:text-gray-300", children: "Create some shared exports to see them here" })] })) : (_jsx("div", { className: "space-y-4", children: shares.map((share) => {
                    const expired = isShareExpired(share);
                    return (_jsx("div", { className: `bg-white dark:bg-gray-800 rounded-lg border shadow-sm p-4 ${expired ? 'opacity-60' : ''} ${!share.is_active ? 'border-red-200 dark:border-red-800' : 'border-gray-200 dark:border-gray-700'}`, children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center space-x-3 mb-2", children: [getAccessLevelIcon(share.access_level), _jsx("span", { className: `px-2 py-1 rounded-full text-xs font-medium ${getAccessLevelColor(share.access_level)}`, children: share.access_level.replace('_', ' ').toUpperCase() }), expired && (_jsx("span", { className: "px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300", children: "EXPIRED" })), !share.is_active && (_jsx("span", { className: "px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300", children: "INACTIVE" }))] }), share.description && (_jsx("p", { className: "text-sm text-gray-600 dark:text-gray-300 mb-3", children: share.description })), _jsx("div", { className: "bg-gray-50 dark:bg-gray-700 rounded p-3 mb-3", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("code", { className: "text-sm text-gray-600 dark:text-gray-300 break-all", children: getShareUrl(share) }), _jsx("button", { onClick: () => handleCopyLink(getShareUrl(share)), className: "ml-2 p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors", title: "Copy link", children: _jsx(FiCopy, { className: "w-4 h-4" }) })] }) }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "text-gray-600 dark:text-gray-400", children: "Created:" }), _jsx("p", { className: "font-medium text-gray-900 dark:text-white", children: formatDate(share.created_at) })] }), share.expires_at && (_jsxs("div", { children: [_jsx("span", { className: "text-gray-600 dark:text-gray-400", children: "Expires:" }), _jsx("p", { className: `font-medium ${expired ? 'text-red-600' : 'text-gray-900 dark:text-white'}`, children: formatDate(share.expires_at) })] })), _jsxs("div", { children: [_jsx("span", { className: "text-gray-600 dark:text-gray-400", children: "Downloads:" }), _jsxs("p", { className: "font-medium text-gray-900 dark:text-white", children: [share.download_count, share.max_downloads && ` / ${share.max_downloads}`] })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-600 dark:text-gray-400", children: "Access Count:" }), _jsx("p", { className: "font-medium text-gray-900 dark:text-white", children: share.access_count })] })] }), share.last_accessed_at && (_jsxs("div", { className: "mt-3 text-sm", children: [_jsx("span", { className: "text-gray-600 dark:text-gray-400", children: "Last accessed:" }), _jsx("span", { className: "ml-2 text-gray-900 dark:text-white", children: formatDate(share.last_accessed_at) })] }))] }), _jsxs("div", { className: "flex items-center space-x-2 ml-4", children: [_jsx("button", { onClick: () => setSelectedShare(share), className: "p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors", title: "Edit share", children: _jsx(FiEdit, { className: "w-4 h-4" }) }), share.is_active && !expired && (_jsx("button", { onClick: () => handleDeactivateShare(share.id), className: "p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors", title: "Deactivate share", children: _jsx(FiClock, { className: "w-4 h-4" }) })), _jsx("button", { onClick: () => setShowDeleteConfirm(share.id), className: "p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors", title: "Delete share", children: _jsx(FiTrash2, { className: "w-4 h-4" }) })] })] }) }, share.id));
                }) })), showDeleteConfirm && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6", children: [_jsxs("div", { className: "flex items-center space-x-3 mb-4", children: [_jsx(FiAlertCircle, { className: "w-6 h-6 text-red-600" }), _jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-white", children: "Delete Share" })] }), _jsx("p", { className: "text-gray-600 dark:text-gray-300 mb-6", children: "Are you sure you want to delete this share? This action cannot be undone and the share link will become invalid immediately." }), _jsxs("div", { className: "flex justify-end space-x-3", children: [_jsx("button", { onClick: () => setShowDeleteConfirm(null), className: "px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors", children: "Cancel" }), _jsx("button", { onClick: () => handleDeleteShare(showDeleteConfirm), className: "px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors", children: "Delete Share" })] })] }) }))] }));
};
export default ShareManager;
