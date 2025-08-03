import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Recent Files Panel Component
 * Epic 3 Story 3.3: Recent Files & Workspace Management
 *
 * Dedicated panel for managing recent files, favorites, and workspace state
 */
import { useState, useCallback, useEffect } from 'react';
import { ProjectManager } from '../../projectManager';
export const RecentFilesPanel = ({ onFileSelected,
    onFileLoad,
    onClearRecents,
    theme = 'cinema',
    maxRecentFiles = 10,
    showFavorites = true,
    showClearButton = true });
{
    const [recentFiles, setRecentFiles] = useState([]);
    const [favoriteFiles, setFavoriteFiles] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [viewMode, setViewMode] = useState('list');
    const projectManager = ProjectManager.getInstance();
    // Theme styles
    const getThemeStyles = () => {
        const themes = {
            light: {
                background: '#ffffff',
                secondary: '#f8fafc',
                tertiary: '#f1f5f9',
                border: '#e5e7eb',
                text: '#374151',
                textSecondary: '#6b7280',
                accent: '#3b82f6',
                hover: '#f3f4f6',
                selection: '#dbeafe' }
        }, dark;
    }, cinema;
}
;
return themes[theme];
;
const styles = getThemeStyles();
// Load recent and favorite files
useEffect(() => {
    loadRecentFiles();
    loadFavoriteFiles();
}, [maxRecentFiles]);
const loadRecentFiles = useCallback(() => { setRecentFiles(projectManager.getRecentFiles(maxRecentFiles)); }, [projectManager, maxRecentFiles]);
const loadFavoriteFiles = useCallback(() => { setFavoriteFiles(projectManager.getFavoriteFiles()); }, [projectManager]);
// File actions
const handleFileSelect = useCallback((file) => {
    setSelectedFile(file);
    onFileSelected?.(file);
}, [onFileSelected]);
const handleFileLoad = useCallback((file) => {
    projectManager.addToRecentFiles(file);
    loadRecentFiles();
    onFileLoad?.(file);
}, [projectManager, loadRecentFiles, onFileLoad]);
const handleToggleFavorite = useCallback((file) => {
    const isFavorite = projectManager.toggleFavorite(file.id);
    file.isFavorite = isFavorite;
    loadFavoriteFiles();
    loadRecentFiles(); // Refresh recent files to show updated favorite status
}, [projectManager, loadFavoriteFiles, loadRecentFiles]);
const handleClearRecents = useCallback(() => {
    if (confirm('Are you sure you want to clear all recent files? This action cannot be undone.')) {
        // Clear recent files in ProjectManager
        // For now, just refresh (in real implementation would clear the list)
        onClearRecents?.();
        loadRecentFiles();
    }
}, [onClearRecents, loadRecentFiles]);
const formatDate = (date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - new Date(date).getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) {
        return 'Today';
    }
    else if (diffDays === 1) {
        return 'Yesterday';
    }
    else if (diffDays < 7) {
        return `${diffDays} days ago`;
    }
    else {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }
    format(new Date(date));
};
const formatFileSize = (bytes) => {
    if (bytes === 0)
        return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};
const FileItem = ({ file, compact = false }) => (_jsx("div", { onClick: () => handleFileSelect(file), onDoubleClick: () => handleFileLoad(file), style: {
        display: 'flex',
        alignItems: 'center',
        gap: compact ? '8px' : '12px',
        padding: compact ? '8px 12px' : '12px 16px',
        backgroundColor: selectedFile?.id === file.id ? styles.selection : 'transparent'
    }, "border:": true })) `1px solid ${selectedFile?.id === file.id ? styles.accent : 'transparent'}`;
borderRadius: '6px';
cursor: 'pointer';
transition: 'all 0.15s ease';
onMouseOver = { e };
{
    if (selectedFile?.id !== file.id) {
        e.currentTarget.style.backgroundColor = styles.hover;
    }
}
onMouseOut = { e };
{
    if (selectedFile?.id !== file.id) {
        e.currentTarget.style.backgroundColor = 'transparent';
    }
        >
            { /* File Icon */}
        < div;
    style = {};
    {
        width: compact ? '24px' : '32px';
        height: compact ? '24px' : '32px';
        backgroundColor: styles.tertiary;
        borderRadius: '4px';
        display: 'flex';
        alignItems: 'center';
        justifyContent: 'center';
        fontSize: compact ? '12px' : '16px';
        flexShrink: 0;
    }
        >
    ;
    div >
        { /* File Info */}
        < div;
    style = {};
    {
        flex: 1, overflow;
        'hidden';
    }
}
 >
    _jsx("div", { style: {
            fontWeight: '500',
            fontSize: compact ? '13px' : '14px',
            marginBottom: '2px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
        }
            >
                { file, : .metadata.title || file.name.replace('.psg', '') }, ...file.isFavorite && _jsx("span", { style: { fontSize: '12px' }, children: "\u2B50" }), div: true, children: !compact && (_jsx("div", { style: {
                fontSize: '12px',
                color: styles.textSecondary,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            }
                >
                    (_jsxs("span", { children: [file.nodeCount, " nodes"] })
                        ,
                            _jsx("span", { children: "\u2022" })
                                ,
                                    _jsx("span", { children: formatFileSize(file.size) })
                                        ,
                                            _jsx("span", { children: "\u2022" })
                                                ,
                                                    _jsx("span", { children: formatDate(file.lastModified) })) })) });
div >
    { /* Actions */}
    < div;
style = {};
{
    display: 'flex', alignItems;
    'center', gap;
    '4px';
}
 >
    _jsx("button", { onClick: e => {
            e.stopPropagation();
            handleToggleFavorite(file);
        }, style: {
            background: 'transparent',
            border: 'none',
            color: file.isFavorite ? styles.accent : styles.textSecondary,
            fontSize: '14px',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '2px'
        }, title: file.isFavorite ? 'Remove from favorites' : 'Add to favorites', children: file.isFavorite ? '⭐' : '☆' });
div >
;
div >
;
;
return (_jsxs("div", { style: {
        backgroundColor: styles.background,
        color: styles.text,
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '14px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
    }, children: [_jsx("div", { style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px'
            }, "borderBottom:": true }), " `1px solid $", styles.border, "` } >", _jsx("h2", { style: {
                margin: 0,
                fontSize: '18px',
                fontWeight: '600',
                color: styles.text
            }
                >
                    Recent, Files: true })] })
    ,
        _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' }, children: [_jsx("div", { style: { display: 'flex', backgroundColor: styles.tertiary, borderRadius: '4px', padding: '2px' }, children: ['list', 'grid'].map(mode => (_jsx("button", { onClick: () => setViewMode(mode), style: {
                            padding: '4px 8px',
                            backgroundColor: viewMode === mode ? styles.accent : 'transparent',
                            border: 'none',
                            borderRadius: '2px',
                            color: viewMode === mode ? styles.background : styles.textSecondary,
                            fontSize: '11px',
                            cursor: 'pointer'
                        }
                            >
                                { mode } === 'list' ? '☰' : '⊞' }, mode))) }), "))}"] })) /* Clear Button */;
{ /* Clear Button */ }
{
    showClearButton && recentFiles.length > 0 && (_jsx("button", { onClick: handleClearRecents, style: {
            padding: '6px 12px',
            backgroundColor: 'transparent'
        }, "border:": true })) `1px solid ${styles.border}`;
    borderRadius: '4px';
    color: styles.textSecondary;
    fontSize: '12px';
    cursor: 'pointer'
        >
            Clear;
    All;
    button >
    ;
}
div >
;
div >
    { /* Content */}
    < div;
style = {};
{
    flex: 1, overflow;
    'auto', padding;
    '16px';
}
 >
    { /* Favorites Section */};
{
    showFavorites && favoriteFiles.length > 0 && (_jsxs("div", { style: { marginBottom: '24px' }, children: [_jsx("h3", { style: {
                    margin: '0 0 12px 0',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: styles.accent,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }
                    >
                        _jsx("span", { children: "\u2B50" }), Favorites: true }), " (", favoriteFiles.length, ")"] })
        ,
            _jsx("div", { style: {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                }
                    >
                        { favoriteFiles, : .slice(0, 5).map(file => (_jsx(FileItem, { file: file, compact: true }, file.id))) }, div: true }));
}
{ /* Recent Files Section */ }
_jsxs("div", { children: [_jsx("h3", { style: {
                margin: '0 0 12px 0',
                fontSize: '14px',
                fontWeight: '600',
                color: styles.text,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            }
                >
                    _jsx("span", { children: "\uD83D\uDD50" }), Recent: true, Files: true }), " (", recentFiles.length, ")"] });
{
    recentFiles.length === 0 ? (_jsxs("div", { style: {
            textAlign: 'center',
            padding: '40px 20px',
            color: styles.textSecondary
        }, children: [_jsx("div", { style: { fontSize: '48px', marginBottom: '16px' }, children: "\uD83D\uDCC4" }), _jsx("div", { style: { fontSize: '16px', marginBottom: '8px' }, children: "No recent files" }), _jsx("div", { style: { fontSize: '14px' }, children: "Open some projects to see them here" })] })) : (_jsx("div", { style: {
            display: viewMode === 'grid' ? 'grid' : 'flex',
            gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(200px, 1fr))' : undefined,
            flexDirection: viewMode === 'list' ? 'column' : undefined,
            gap: viewMode === 'grid' ? '12px' : '4px'
        }
            >
                { recentFiles, : .map(file => (_jsx(FileItem, { file: file, compact: viewMode === 'list' }, file.id))) }, div: true, children: ")}" }));
    div >
    ;
    div >
    ;
    ;
}
;
export default RecentFilesPanel;
