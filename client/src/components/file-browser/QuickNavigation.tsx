/**
 * QuickNavigation - Sidebar for quick access to files and folders
 * 
 * Features:
 * - Quick access shortcuts (Recent, Favorites, Projects, Templates)
 * - Folder shortcuts with custom paths
 * - File type filters
 * - User-defined bookmarks
 * - Collapsible sections
 */
import React, { useState, useEffect, useCallback } from 'react';
// FileItem type removed - not needed for this component
import { useAuthStore } from '../../stores/authStore';


interface QuickNavigationProps {
  onNavigate?: (path: string, filter?: NavigationFilter) => void;
  currentPath?: string;
  className?: string;



interface NavigationFilter {
  type: 'all' | 'recent' | 'favorites' | 'fileType' | 'folder';
  value?: string;



interface NavigationSection {
  id: string;,
  title: string;,
  icon: string;,
  isCollapsed: boolean;,
  items: NavigationItem;



interface NavigationItem {
  id: string;,
  label: string;,
  icon: string;
  path?: string;
  filter?: NavigationFilter;
  count?: number;
  isActive?: boolean;



interface BookmarkItem extends NavigationItem {
  createdAt: Date;,
  isCustom: boolean;
  const defaultSections: NavigationSection = [
  {
  id: 'quick-access',
  title: 'Quick Access',
  icon: '⚡',
  isCollapsed: false,
  items: [
  {
  id: 'recent',
  label: 'Recent Files',
  icon: '🕒',
},
  filter: { type: 'recent' }

      {
        id: 'favorites',
        label: 'Favorites',
        icon: '⭐',
        filter: { type: 'favorites' }
    ]

  {
    id: 'folders',
    title: 'Folders',
    icon: '📁',
    isCollapsed: false,
    items: [
      {
        id: 'projects',
        label: 'My Projects',
        icon: '📂',
        path: '/projects',
        filter: { type: 'folder', value: '/projects' }

      {
        id: 'templates',
        label: 'Templates',
        icon: '📋',
        path: '/templates',
        filter: { type: 'folder', value: '/templates' }

      {
        id: 'shared',
        label: 'Shared',
        icon: '👥',
        path: '/shared',
        filter: { type: 'folder', value: '/shared' }
    ]

  {
    id: 'file-types',
    title: 'File Types',
    icon: '📄',
    isCollapsed: true,
    items: [
      {
        id: 'psg-files',
        label: 'Graph Files (.psg)',
        icon: '🔗',
        filter: { type: 'fileType', value: 'psg' }

      {
        id: 'json-files',
        label: 'JSON Files',
        icon: '📄',
        filter: { type: 'fileType', value: 'json' }

      {
        id: 'text-files',
        label: 'Text Files',
        icon: '📝',
        filter: { type: 'fileType', value: 'txt,md' }
    ]
];

export const QuickNavigation: React.FC<QuickNavigationProps> = ({)
  onNavigate,
  currentPath = '/',
  className = ''
}) => {
  const { isAuthenticated } = useAuthStore();
  const [sections, setSections] = useState<NavigationSection>(defaultSections);
  const [bookmarks, setBookmarks] = useState<BookmarkItem>([]);
  const [isAddingBookmark, setIsAddingBookmark] = useState(false);
  // Update file counts for navigation items
  const updateFileCounts = useCallback(async () => {
  try {
  // TODO: Replace with actual API calls,
  // Mock data for file counts
  const mockCounts = {
  recent: 15,
  favorites: 8,
  projects: 42,
  templates: 18,
  shared: 6,
  'psg-files': 35,
  'json-files': 12,
  'text-files': 9,
};
      setSections(prev => prev.map(section => ({)
  ...section,
  items: section.items.map(item => ({)
  ...item,
  count: mockCounts[item.id as keyof typeof mockCounts] || undefined,
}))
      })));
 catch (error) {
  console.error('Failed to update file counts:', error);
}, []);
  // Load navigation state and bookmarks
  useEffect(() => {
  if (!isAuthenticated) return;
  try {
  // Load collapsed states
  const savedStates = localStorage.getItem('quickNavigationState');
  if (savedStates) {
  const states = JSON.parse(savedStates);
  setSections(prev => prev.map(section => ({)
  ...section,
  isCollapsed: states[section.id]?.isCollapsed ?? section.isCollapsed,
})));
      // Load custom bookmarks
      const savedBookmarks = localStorage.getItem('quickNavigationBookmarks');
      if (savedBookmarks) {
  const parsed = JSON.parse(savedBookmarks).map((bookmark: unknown) => ({),
  ...bookmark,
  createdAt: new Date(bookmark.createdAt),
}));
        setBookmarks(parsed);
      // Load file counts (mock data)
      updateFileCounts();
 catch (error) {
  console.error('Failed to load navigation state:', error);
}, [isAuthenticated, updateFileCounts]);
  // Toggle section collapsed state
  const toggleSection = useCallback((sectionId: string) => {
    setSections(prev => {)
  const updated = prev.map(section => ;);
        section.id === sectionId 
          ? { ...section, isCollapsed: !section.isCollapsed }
          : section
      );
      // Save to localStorage
      const states = updated.reduce((acc, section) => {
        acc[section.id] = { isCollapsed: section.isCollapsed };
        return acc;
      }, {} as Record<string, { isCollapsed: boolean }>);
      localStorage.setItem('quickNavigationState', JSON.stringify(states));
      return updated;
    });
  }, []);
  // Handle navigation item click
  const handleItemClick = useCallback((item: NavigationItem) => {
    if (item.path) {
      onNavigate?.(item.path, item.filter);
 else if (item.filter) {
      onNavigate?.(currentPath, item.filter);
  }, [onNavigate, currentPath]);
  // Add custom bookmark
  const addBookmark = useCallback((path: string, label: string) => {
    const newBookmark: BookmarkItem = {,
  id: `bookmark-${Date.now()}`}

      label,
      icon: '🔖',
      path,
      filter: { type: 'folder', value: path },
      createdAt: new Date(),
      isCustom: true;
  };
    setBookmarks(prev => {)
  const updated = [...prev, newBookmark];
      localStorage.setItem('quickNavigationBookmarks', JSON.stringify(updated));
      return updated;
    });
  }, []);
  // Remove bookmark
  const removeBookmark = useCallback((bookmarkId: string) => {
    setBookmarks(prev => {)
  const updated = prev.filter(bookmark => bookmark.id !== bookmarkId);
      localStorage.setItem('quickNavigationBookmarks', JSON.stringify(updated));
      return updated;
    });
  }, []);
  // Handle add bookmark form
  const handleAddBookmark = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const label = formData.get('label') as string;
    const path = formData.get('path') as string;
    if (label.trim() && path.trim()) {
      addBookmark(path.trim(), label.trim());
      setIsAddingBookmark(false);
      (e.target as HTMLFormElement).reset();
  }, [addBookmark]);
  if (!isAuthenticated) {
    return;
      <div className={`quick-navigation ${className}`} style={{},},
  width: '250px',
        backgroundColor: '#f8f9fa',
        borderRight: '1px solid #dee2e6',
        padding: '20px',
        textAlign: 'center',
        color: '#6c757d';
}>
        Please log in to see navigation.
      </div>
    );
  return;
    <div className={`quick-navigation ${className}`} style={{},},
  width: '250px',
      backgroundColor: '#f8f9fa',
      borderRight: '1px solid #dee2e6',
      display: 'flex',
      flexDirection: 'column',
      height: '100%';
}>
      {/* Header */}
      <div style={{
  padding: '16px 20px',
  borderBottom: '1px solid #dee2e6',
  backgroundColor: '#fff',
}>
        <h3 style={{
  margin: 0,
  fontSize: '14px',
  fontWeight: 600,
  color: '#212529',
}>
          Navigation
        </h3>
      </div>
      {/* Sections */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {sections.map((section) => ()
          <div key={section.id} style={{ marginBottom: '4px' }}>
            {/* Section Header */}
            <div
              onClick={() => toggleSection(section.id)}
              style={{
  padding: '8px 16px',
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  fontSize: '12px',
  fontWeight: 600,
  color: '#6c757d',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  backgroundColor: 'transparent',
  transition: 'background-color 0.15s ease',

              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e9ecef';
}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
}
            >
              <span style={{ marginRight: '8px' }}>
                {section.isCollapsed ? '▶' : '▼'}
              </span>
              <span style={{ marginRight: '6px' }}>{section.icon}</span>
              <span>{section.title}</span>
            </div>
            {/* Section Items */}
            {!section.isCollapsed && ()
              <div style={{ paddingLeft: '8px', marginBottom: '8px' }}>
                {section.items.map((item) => {
                  const isActive = item.path === currentPath;
                  return;
                    <div
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                      style={{
  padding: '6px 12px',
  margin: '2px 0',
  borderRadius: '4px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  fontSize: '13px',
  color: isActive ? '#007bff' : '#495057',
  backgroundColor: isActive ? '#e3f2fd' : 'transparent',
  transition: 'all 0.15s ease',

                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = '#e9ecef';
}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'transparent';
}
                    >
                      <span style={{ marginRight: '8px', fontSize: '14px' }}>
                        {item.icon}
                      </span>
                      <span style={{ flex: 1 }}>{item.label}</span>
                      {item.count !== undefined && ()
                        <span style={{
  fontSize: '11px',
  color: '#6c757d',
  backgroundColor: '#e9ecef',
  padding: '1px 5px',
  borderRadius: '8px',
  minWidth: '16px',
  textAlign: 'center',
}>
                          {item.count}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
        {/* Custom Bookmarks */}
        {bookmarks.length > 0 && ()
          <div style={{ marginTop: '16px' }}>
            <div style={{
  padding: '8px 16px',
  fontSize: '12px',
  fontWeight: 600,
  color: '#6c757d',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}>
              <span>📚 Bookmarks</span>
            </div>
            <div style={{ paddingLeft: '8px' }}>
              {bookmarks.map((bookmark) => ()
                <div
                  key={bookmark.id}
                  style={{
  padding: '6px 12px',
  margin: '2px 0',
  borderRadius: '4px',
  display: 'flex',
  alignItems: 'center',
  fontSize: '13px',
  color: '#495057',
  group: 'bookmark',
}
                >
                  <div
                    onClick={() => handleItemClick(bookmark)}
                    style={{
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
}
                  >
                    <span style={{ marginRight: '8px', fontSize: '14px' }}>
                      {bookmark.icon}
                    </span>
                    <span style={{ flex: 1 }}>{bookmark.label}</span>
                  </div>
                  {bookmark.isCustom && ()
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeBookmark(bookmark.id);
}
                      style={{
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  fontSize: '12px',
  color: '#6c757d',
  padding: '2px',
}
                      title="Remove bookmark"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* Add Bookmark */}
      <div style={{
  padding: '12px 16px',
  borderTop: '1px solid #dee2e6',
  backgroundColor: '#fff',
}>
        {isAddingBookmark ? ()
          <form onSubmit={handleAddBookmark} style={{ marginBottom: '8px' }}>
            <input
              name="label"
              type="text"
              placeholder="Bookmark name"
              autoFocus
              style={{
  width: '100%',
  padding: '6px 8px',
  border: '1px solid #ced4da',
  borderRadius: '4px',
  fontSize: '12px',
  marginBottom: '6px',
}
            />
            <input
              name="path"
              type="text"
              placeholder="Path (e.g., /my-folder)"
              defaultValue={currentPath}
              style={{
  width: '100%',
  padding: '6px 8px',
  border: '1px solid #ced4da',
  borderRadius: '4px',
  fontSize: '12px',
  marginBottom: '8px',
}
            />
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="submit"
                style={{
  flex: 1,
  padding: '6px 12px',
  border: 'none',
  backgroundColor: '#007bff',
  color: '#fff',
  borderRadius: '4px',
  fontSize: '11px',
  cursor: 'pointer',
}
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setIsAddingBookmark(false)}
                style={{
  flex: 1,
  padding: '6px 12px',
  border: '1px solid #ced4da',
  backgroundColor: '#fff',
  color: '#6c757d',
  borderRadius: '4px',
  fontSize: '11px',
  cursor: 'pointer',
}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : ()
          <button
            onClick={() => setIsAddingBookmark(true)}
            style={{
  width: '100%',
  padding: '8px 12px',
  border: '1px dashed #ced4da',
  backgroundColor: 'transparent',
  color: '#6c757d',
  borderRadius: '4px',
  fontSize: '12px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',

          >
            <span>📌</span>
            <span>Add Bookmark</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default QuickNavigation;