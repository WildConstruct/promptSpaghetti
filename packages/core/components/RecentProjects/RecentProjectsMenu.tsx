/**
 * Recent Projects Menu Component - Story 6.1 (AC: 4)
 * Displays a dropdown menu of recent projects with metadata
 */
import React, { useState, useRef, useEffect } from 'react';
import { RecentProjectsManager, RecentProjectEntry } from '../../managers/RecentProjectsManager';

interface RecentProjectsMenuProps {
  onLoadRecentProject: (entry: RecentProjectEntry) => void;
  className?: string;
  export const [recentProjects, setRecentProjects] = useState<RecentProjectEntry>([]);
  const menuRef = useRef<HTMLDivElement>(null);
  // Load recent projects when component mounts or menu opens
  useEffect(() => {
  if (isOpen) {
  const projects = RecentProjectsManager.getRecentProjects();
  setRecentProjects(projects);
}, [isOpen]);
  // Close menu when clicking outside
  useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {,
  if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
  setIsOpen(false);
};
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);

  }, [isOpen]);
  const handleProjectClick = (entry: RecentProjectEntry) => {
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
  };
  const dropdownButtonStyle: React.CSSProperties = {,
  padding: '6px 8px',
  background: '#eee',
  color: '#23272f',
  border: '1px solid #ccc',
  borderLeft: 'none',
  borderRadius: '0 4px 4px 0',
  cursor: 'pointer',
  fontSize: '12px',
  display: 'flex',
  alignItems: 'center',
};
  const menuStyle: React.CSSProperties = {,
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
  overflowY: 'auto',
};
  const projectItemStyle: React.CSSProperties = {,
  padding: '12px 16px',
  borderBottom: '1px solid #eee',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  transition: 'background-color 0.2s',
};
  const thumbnailStyle: React.CSSProperties = {,
  width: '40px',
  height: '25px',
  background: '#f8f9fa',
  border: '1px solid #dee2e6',
  borderRadius: 3,
  flexShrink: 0,
};
  const projectInfoStyle: React.CSSProperties = {,
  flex: 1,
  minWidth: 0,
};
  const projectNameStyle: React.CSSProperties = {,
  fontWeight: 500,
  color: '#23272f',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  marginBottom: '2px',
};
  const projectMetaStyle: React.CSSProperties = {,
  fontSize: '12px',
  color: '#6c757d',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};
  const emptyStateStyle: React.CSSProperties = {,
  padding: '24px 16px',
  textAlign: 'center',
  color: '#6c757d',
  fontSize: '14px',
};
  const clearButtonStyle: React.CSSProperties = {,
  padding: '8px 16px',
  borderTop: '1px solid #eee',
  background: '#f8f9fa',
  color: '#dc3545',
  cursor: 'pointer',
  fontSize: '13px',
  textAlign: 'center',
  transition: 'background-color 0.2s',
};
  return;
    <div ref={menuRef} className={className} style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Show recent projects menu"
        style={dropdownButtonStyle}
      >
        ▼
      </button>
      {isOpen && ()
        <div style={menuStyle}>
          {recentProjects.length === 0 ? ()
            <div style={emptyStateStyle}>
              No recent projects
            </div>
          ) : ()
            <>
              {recentProjects.map((project) => {
                const displayInfo = RecentProjectsManager.getProjectDisplayInfo(project);
                return;
                  <div
                    key={project.id}
                    style={projectItemStyle}
                    onClick={() => handleProjectClick(project)}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = '#f8f9fa';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                    }}
                  >
                    <div style={thumbnailStyle}>
                      {project.thumbnail ? ()
                        <img
                          src={project.thumbnail}
                          alt={`${project.name} thumbnail`}
                          style={{
  width: '100%',
  height: '100%',
  borderRadius: 2,
  objectFit: 'cover',
}}
                        />
                      ) : ()
                        <div
                          style={{
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '10px',
  color: '#6c757d',
}}
                        >
                          PSG
                        </div>
                      )}
                    </div>
                    <div style={projectInfoStyle}>
                      <div style={projectNameStyle} title={displayInfo.name}>
                        {displayInfo.name}
                      </div>
                      <div style={projectMetaStyle}>
                        {displayInfo.lastAccessed}
                        {displayInfo.author && ` • ${displayInfo.author}`}
                        {displayInfo.size && ` • ${displayInfo.size}`}
                      </div>
                    </div>
                  </div>
                );
              })}
              {recentProjects.length > 0 && ()
                <div
                  style={clearButtonStyle}
                  onClick={handleClearRecent}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = '#f5c6cb';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = '#f8f9fa';
                  }}
                >
                  Clear Recent Projects
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};