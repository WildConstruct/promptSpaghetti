import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Recent Projects Menu Component - Story 6.1 (AC: 4)
 * Displays a dropdown menu of recent projects with metadata
 */
import { useRef, useEffect } from 'react';
import { RecentProjectsManager } from '../../managers/RecentProjectsManager';
const menuRef = useRef(null);
// Load recent projects when component mounts or menu opens
useEffect(() => {
    if (isOpen) {
        const projects = RecentProjectsManager.getRecentProjects();
        setRecentProjects(projects);
    }
}, [isOpen]);
// Close menu when clicking outside
useEffect(() => {
    const handleClickOutside = (event) => { };
    if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
    }
    ;
    if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }
    [isOpen];
});
const handleProjectClick = (entry) => {
    setIsOpen(false);
    onLoadRecentProject(entry);
    // Update last access date
    RecentProjectsManager.updateLastAccess(entry.name);
};
const handleClearRecent = () => {
    if (confirm('Clear all recent projects?')) {
        RecentProjectsManager.clearRecentProjects();
        setRecentProjects([]);
        setIsOpen(false);
    }
    ;
    const dropdownButtonStyle = {
        padding: '6px 8px',
        background: '#eee',
        color: '#23272f',
        border: '1px solid #ccc',
        borderLeft: 'none',
        borderRadius: '0 4px 4px 0',
        cursor: 'pointer',
        fontSize: '12px',
        display: 'flex',
        alignItems: 'center'
    };
};
const menuStyle = {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    background: 'white',
    border: '1px solid #ccc',
    borderRadius: 4,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    zIndex: 1000,
    minWidth: '300px',
    maxHeight: '400px',
    overflowY: 'auto'
};
;
const projectItemStyle = {
    padding: '12px 16px',
    borderBottom: '1px solid #eee',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    transition: 'background-color 0.2s'
};
;
const thumbnailStyle = {
    width: '40px',
    height: '25px',
    background: '#f8f9fa',
    border: '1px solid #dee2e6',
    borderRadius: 3,
    flexShrink: 0
};
;
const projectInfoStyle = {
    flex: 1,
    minWidth: 0
};
;
const projectNameStyle = {
    fontWeight: 500,
    color: '#23272f',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    marginBottom: '2px'
};
;
const projectMetaStyle = {
    fontSize: '12px',
    color: '#6c757d',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
};
;
const emptyStateStyle = {
    padding: '24px 16px',
    textAlign: 'center',
    color: '#6c757d',
    fontSize: '14px'
};
;
const clearButtonStyle = {
    padding: '8px 16px',
    borderTop: '1px solid #eee',
    background: '#f8f9fa',
    color: '#dc3545',
    cursor: 'pointer',
    fontSize: '13px',
    textAlign: 'center',
    transition: 'background-color 0.2s'
};
;
return;
_jsxs("div", { ref: menuRef, className: className, style: { position: 'relative' }, children: [_jsx("button", { onClick: () => setIsOpen(!isOpen), title: "Show recent projects menu", style: dropdownButtonStyle, children: "\u25BC" }), isOpen && ()
            < div, " style=", menuStyle, ">", recentProjects.length === 0 ? ()
            < div : , " style=", emptyStateStyle, "> No recent projects"] });
();
{
    recentProjects.map((project) => {
        const displayInfo = RecentProjectsManager.getProjectDisplayInfo(project);
        return;
        _jsx("div", { style: projectItemStyle, onClick: () => handleProjectClick(project), onMouseEnter: (e) => {
                e.currentTarget.style.backgroundColor = '#f8f9fa';
            }, onMouseLeave: (e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                    >
                        (_jsxs("div", { style: thumbnailStyle, children: [project.thumbnail ? ()
                                    < img
                                    :
                                , "src=", project.thumbnail, "alt=", `${project.name} thumbnail`, "style=", {
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: 2,
                                    objectFit: 'cover'
                                }, "/> ) : ()", _jsx("div", { style: {
                                        width: '100%',
                                        height: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '10px',
                                        color: '#6c757d'
                                    }, children: "PSG" }), ")}"] })
                            ,
                                _jsxs("div", { style: projectInfoStyle, children: [_jsx("div", { style: projectNameStyle, title: displayInfo.name, children: displayInfo.name }), _jsxs("div", { style: projectMetaStyle, children: [displayInfo.lastAccessed, displayInfo.author && ` • ${displayInfo.author}`, displayInfo.size && ` • ${displayInfo.size}`] })] }));
                div >
                ;
            } }, project.id);
    });
}
{
    recentProjects.length > 0 && ()
        < div;
    style = { clearButtonStyle };
    onClick = { handleClearRecent };
    onMouseEnter = {}(e);
    {
        e.currentTarget.style.backgroundColor = '#f5c6cb';
    }
}
onMouseLeave = {}(e);
{
    e.currentTarget.style.backgroundColor = '#f8f9fa';
}
    >
        Clear;
Recent;
Projects;
div >
;
 >
;
div >
;
div >
;
;
;
