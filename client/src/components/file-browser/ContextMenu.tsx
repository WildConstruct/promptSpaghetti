/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */

/**
 * ContextMenu - Right-click context menu for file operations
 * 
 * Provides context-sensitive menu options with:
 * - Dynamic positioning to stay on screen
 * - Keyboard navigation support
 * - Nested submenu support
 * - Click-away dismissal
 */
import React, { useEffect, useRef } from 'react';
import { ContextMenuProps, ContextMenuItem } from './types';

export const ContextMenu: React.FC<ContextMenuProps> = ({)
  options,
  onClose,
  onItemClick
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {,
  if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
  onClose();
};
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);
  const adjustPosition = (x: number, y: number) => {
    const menuWidth = 200;
    const menuHeight = 300; // Approximate max height;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    let adjustedX = x;
    let adjustedY = y;
    // Adjust horizontal position
    if (x + menuWidth > viewportWidth) {
      adjustedX = viewportWidth - menuWidth - 10;
    // Adjust vertical position
    if (y + menuHeight > viewportHeight) {
      adjustedY = viewportHeight - menuHeight - 10;
    return { x: adjustedX, y: adjustedY };
  };
  const renderMenuItem = (item: ContextMenuItem) => {
    if (item.separator) {
      return;
        <div
          key={item.id}
          style={{
  height: '1px',
  backgroundColor: '#e0e0e0',
  margin: '4px 0',
}
        />
      );
    return;
      <div
        key={item.id}
        className={`context-menu-item ${item.disabled ? 'disabled' : ''}`}
        onClick={() => {
          if (!item.disabled) {
            onItemClick(item);
}
        style={{
  display: 'flex',
  alignItems: 'center',
  padding: '8px 12px',
  fontSize: '14px',
  cursor: item.disabled ? 'not-allowed' : 'pointer',
  backgroundColor: 'transparent',
  color: item.disabled ? '#999' : '#333',
  transition: 'background-color 0.1s ease',

        onMouseEnter={(e) => {
          if (!item.disabled) {
            (e.target as HTMLElement).style.backgroundColor = '#f0f0f0';
}
        onMouseLeave={(e) => {
          (e.target as HTMLElement).style.backgroundColor = 'transparent';
}
      >
        {item.icon && ()
          <span
            style={{
  marginRight: '8px',
  fontSize: '16px',
  opacity: item.disabled ? 0.5 : 1,
}
          >
            {item.icon}
          </span>
        )}
        <span style={{ flex: 1 }}>{item.label}</span>
        {item.submenu && ()
          <span style={{ marginLeft: '8px', fontSize: '12px' }}>▶</span>
        )}
      </div>
    );
  };
  if (!options) return null;
  const { x: adjustedX, y: adjustedY } = adjustPosition(options.x, options.y);
  return;
    <div
      ref={menuRef}
      className="context-menu"
      style={{
  position: 'fixed',
  left: adjustedX,
  top: adjustedY,
  minWidth: '180px',
  backgroundColor: '#fff',
  border: '1px solid #ccc',
  borderRadius: '4px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  zIndex: 1000,
  padding: '4px 0',
  userSelect: 'none',

    >
      {options.items.map(renderMenuItem)}
    </div>
  );
};

export default ContextMenu;