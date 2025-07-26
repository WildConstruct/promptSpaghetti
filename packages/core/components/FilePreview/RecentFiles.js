import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * RecentFiles - Component for displaying and managing recently accessed files
 *
 * Provides quick access to recently opened projects with chronological ordering
 */
import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { projectManager } from '../../projectManager';
export const RecentFiles = ({ limit = 10, onClick, style, className }) => {
    const [currentView, setCurrentView] = useState('recent');
    const [recentFiles, setRecentFiles] = useState([]);
    const [favoriteFiles, setFavoriteFiles] = useState([]);
    // Load files from projectManager
    const loadFiles = useCallback(() => {
        try {
            const recent = projectManager.getRecentFiles(limit);
            const favorites = projectManager.getFavoriteFiles();
            setRecentFiles(recent);
            setFavoriteFiles(favorites);
        }
        catch (error) {
            console.warn('Failed to load files from project manager:', error);
            setRecentFiles([]);
            setFavoriteFiles([]);
        }
    }, [limit]);
    // Load files on mount and when limit changes
    useEffect(() => {
        loadFiles();
    }, [loadFiles]);
    // Handle file click
    const handleFileClick = useCallback((file) => {
        // Add to recent files
        projectManager.addToRecentFiles(file);
        // Reload files to update the list
        loadFiles();
        // Call the onClick handler
        onClick?.(file);
    }, [onClick, loadFiles]);
    // Handle favorite toggle
    const handleToggleFavorite = useCallback((file) => {
        const newStatus = projectManager.toggleFavorite(file.id);
        // Update the file's favorite status
        file.isFavorite = newStatus;
        // Reload files to update the lists
        loadFiles();
    }, [loadFiles]);
    // Format file size
    const formatFileSize = useCallback((bytes) => {
        if (bytes === 0)
            return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }, []);
    // Format date
    const formatDate = useCallback((date) => {
        try {
            return date.toLocaleDateString();
        }
        catch (error) {
            return 'Invalid date';
        }
    }, []);
    // Get files to display based on current view
    const filesToDisplay = useMemo(() => {
        return currentView === 'recent' ? recentFiles : favoriteFiles;
    }, [currentView, recentFiles, favoriteFiles]);
    return (_jsxs("div", { className: className, style: style, children: [_jsxs("div", { style: {
                    display: 'flex',
                    marginBottom: '16px',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    border: '1px solid #e5e5e5'
                }, children: [_jsx("button", { onClick: () => setCurrentView('recent'), style: {
                            flex: 1,
                            padding: '8px 16px',
                            border: 'none',
                            backgroundColor: currentView === 'recent' ? '#3B82F6' : '#f8f9fa',
                            color: currentView === 'recent' ? 'white' : '#666',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500'
                        }, children: "Recent" }), _jsx("button", { onClick: () => setCurrentView('favorites'), style: {
                            flex: 1,
                            padding: '8px 16px',
                            border: 'none',
                            backgroundColor: currentView === 'favorites' ? '#3B82F6' : '#f8f9fa',
                            color: currentView === 'favorites' ? 'white' : '#666',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500'
                        }, children: "Favorites" })] }), _jsx("div", { style: {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                }, children: filesToDisplay.length === 0 ? (_jsx("div", { style: {
                        textAlign: 'center',
                        padding: '32px 16px',
                        color: '#999',
                        fontSize: '14px'
                    }, children: currentView === 'recent' ? 'No recent files' : 'No favorite files' })) : (filesToDisplay.map((file) => (_jsx("div", { style: {
                        border: '1px solid #e5e5e5',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        transition: 'border-color 0.2s ease'
                    }, onMouseEnter: (e) => {
                        e.currentTarget.style.borderColor = '#3B82F6';
                    }, onMouseLeave: (e) => {
                        e.currentTarget.style.borderColor = '#e5e5e5';
                    }, children: _jsxs("div", { style: {
                            padding: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            cursor: 'pointer'
                        }, onClick: () => handleFileClick(file), children: [_jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [_jsx("div", { style: {
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            color: '#333',
                                            marginBottom: '4px',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }, children: file.name }), _jsx("div", { style: {
                                            fontSize: '12px',
                                            color: '#666',
                                            marginBottom: '4px',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }, children: file.metadata.description || 'No description' }), _jsxs("div", { style: {
                                            fontSize: '11px',
                                            color: '#999',
                                            display: 'flex',
                                            gap: '12px'
                                        }, children: [_jsxs("span", { children: [file.nodeCount, " nodes"] }), _jsx("span", { children: formatFileSize(file.size) }), _jsx("span", { children: formatDate(file.lastModified) })] })] }), _jsx("button", { onClick: (e) => {
                                    e.stopPropagation();
                                    handleToggleFavorite(file);
                                }, style: {
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '4px',
                                    color: projectManager.isFavorite(file.id) ? '#ffc107' : '#ccc',
                                    fontSize: '16px'
                                }, title: projectManager.isFavorite(file.id) ? 'Remove from favorites' : 'Add to favorites', "aria-label": `${projectManager.isFavorite(file.id) ? 'Remove from' : 'Add to'} favorites`, children: projectManager.isFavorite(file.id) ? '⭐' : '☆' })] }) }, file.id)))) })] }));
};
// Memoized component for performance
const MemoizedRecentFiles = React.memo(RecentFiles, (prevProps, nextProps) => {
    return (prevProps.limit === nextProps.limit &&
        prevProps.onClick === nextProps.onClick);
});
MemoizedRecentFiles.displayName = 'RecentFiles';
export default MemoizedRecentFiles;
