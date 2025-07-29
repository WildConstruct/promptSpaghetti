/**
 * Sticky Note Context Menu Component
 * Epic 8.7: Story 8.7 - Collaboration & Documentation Tools - Task 1
 * 
 * Context menu for sticky note operations like edit, delete, 
 * change color, and duplicate.
 */
import React, { useEffect, useRef } from 'react';
import { 
  StickyNoteColor, 
  STICKY_NOTE_COLORS,
  StickyNoteContextMenuOptions 
} from '../../types/CollaborationTypes';
interface StickyNoteContextMenuProps extends StickyNoteContextMenuOptions {
  onClose: () => void;
  // Position menu and handle screen bounds
  useEffect(() => {
    if (menuRef.current) {
      const menu = menuRef.current;
      const rect = menu.getBoundingClientRect();
      // Adjust position if menu would go off-screen
      let adjustedX = x;
      let adjustedY = y;
      if (x + rect.width > window.innerWidth) {
        adjustedX = window.innerWidth - rect.width - 10;
      if (y + rect.height > window.innerHeight) {
        adjustedY = window.innerHeight - rect.height - 10;
      menu.style.left = `${Math.max(10, adjustedX)}px`;}
      menu.style.top = `${Math.max(10, adjustedY)}px`;}
  }, [x, y]);
  // Close menu on outside click
  useEffect(() => {
  const handleClickOutside = (e: MouseEvent) => {,
  if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
  onClose();
};
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);
  // Handle escape key
  useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {,
  if (e.key === 'Escape') {
  onClose();
};
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);
  const MenuItem: React.FC<{,
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  icon?: string;
  shortcut?: string;
}> = ({ onClick, disabled = false, children, icon, shortcut }) => ()
    <div
      onClick={disabled ? undefined : onClick}
      style={{
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '8px 12px',
  fontSize: 13,
  color: disabled ? '#9ca3af' : '#374151',
  cursor: disabled ? 'not-allowed' : 'pointer',
  background: 'transparent',
  border: 'none',
  borderRadius: 4,
  transition: 'background-color 0.15s ease',
  opacity: disabled ? 0.5 : 1,
}}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = '#f3f4f6';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent'
  }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {icon && <span style={{ fontSize: 14 }}>{icon}</span>}
        {children}
      </div>
      {shortcut && ()
        <span style={{
  fontSize: 11,
  color: '#6b7280',
  fontFamily: 'Monaco, monospace',
}}>
          {shortcut}
        </span>
      )}
    </div>
  );
  return;
    <div
      ref={menuRef}
      style={{
  position: 'fixed',
  zIndex: 10000,
  minWidth: 180,
  background: 'white',
  borderRadius: 8,
  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15), 0 4px 10px rgba(0, 0, 0, 0.1)',
  border: '1px solid #e5e7eb',
  padding: '4px 0',
  fontFamily: 'system-ui, -apple-system, sans-serif',
}}
    >
      {/* Edit */}
      <MenuItem
        onClick={() => onEdit?.()}
        disabled={!canEdit}
        icon="✏️"
        shortcut="Double-click"
      >
        Edit Note
      </MenuItem>
      {/* Duplicate */}
      <MenuItem
        onClick={() => onDuplicate?.()}
        icon="📋"
        shortcut="Ctrl+D"
      >
        Duplicate
      </MenuItem>
      <div style={{
  height: 1,
  background: '#e5e7eb',
  margin: '4px 0',
}} />
      {/* Color Options */}
      <div style={{ padding: '8px 12px' }}>
        <div style={{
  fontSize: 11,
  fontWeight: 500,
  color: '#6b7280',
  marginBottom: 6,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}}>
          Change Color
        </div>
        <div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: 8,
}}>
          {Object.entries(STICKY_NOTE_COLORS).map(([color, info]) => ()
            <button
              key={color}
              onClick={() => onChangeColor?.(color as StickyNoteColor)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 8px',
                background: info.background,
                border: `1px solid ${info.border}`}
},
  borderRadius: 4,
                cursor: 'pointer',
                fontSize: 10,
                color: info.text,
                fontWeight: 500,
                transition: 'all 0.15s ease',
                textAlign: 'left'
  }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = `0 2px 8px ${info.shadow}`;}
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none'
  }}
              title={info.description}
            >
              <div style={{
  width: 8,
  height: 8,
  borderRadius: '50%',
  background: info.border,
}} />
              {info.category}
            </button>
          ))}
        </div>
      </div>
      <div style={{
  height: 1,
  background: '#e5e7eb',
  margin: '4px 0',
}} />
      {/* Delete */}
      <MenuItem
        onClick={() => onDelete?.()}
        disabled={!canDelete}
        icon="🗑️"
        shortcut="Delete"
      >
        <span style={{ color: canDelete ? '#dc2626' : '#9ca3af' }}>
          Delete Note
        </span>
      </MenuItem>
    </div>
  );
};