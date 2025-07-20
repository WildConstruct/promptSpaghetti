/**
 * Touch-optimized context menu with long-press activation
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { TouchManager } from './TouchManager';
import { GestureEvent } from './gestures';
import { HapticFeedback, VisualFeedback } from './feedback';
import { TOUCH_TARGETS } from '../mobile/design-system';
import { touchTargetUtils } from './accessibility';

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  type?: 'normal' | 'separator' | 'submenu' | 'checkbox' | 'radio';
  checked?: boolean;
  disabled?: boolean;
  danger?: boolean;
  shortcut?: string;
  submenu?: ContextMenuItem[];
  onSelect?: () => void;
}

export interface TouchContextMenuProps {
  items: ContextMenuItem[];
  onSelect?: (item: ContextMenuItem) => void;
  onDismiss?: () => void;
  position?: { x: number; y: number };
  anchor?: 'auto' | 'top' | 'bottom' | 'left' | 'right' | 'center';
  showShortcuts?: boolean;
  enableHaptics?: boolean;
}

/**
 * Touch-friendly context menu component
 */
export const TouchContextMenu: React.FC<TouchContextMenuProps> = ({
  items,
  onSelect,
  onDismiss,
  position,
  anchor = 'auto',
  showShortcuts = false,
  enableHaptics = true
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [submenuOpen, setSubmenuOpen] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState(position || { x: 0, y: 0 });
  const haptic = useRef(HapticFeedback.getInstance());
  
  // Calculate menu position to keep it on screen
  useEffect(() => {
    if (!menuRef.current || !position) return;
    
    const menu = menuRef.current;
    const rect = menu.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };
    
    let x = position.x;
    let y = position.y;
    
    // Auto-anchor based on available space
    if (anchor === 'auto') {
      // Horizontal adjustment
      if (x + rect.width > viewport.width - 20) {
        x = viewport.width - rect.width - 20;
      }
      if (x < 20) {
        x = 20;
      }
      
      // Vertical adjustment
      if (y + rect.height > viewport.height - 20) {
        y = viewport.height - rect.height - 20;
      }
      if (y < 20) {
        y = 20;
      }
    } else {
      // Manual anchor positions
      switch (anchor) {
      case 'top':
        y = Math.max(20, position.y - rect.height);
        break;
      case 'bottom':
        y = Math.min(viewport.height - rect.height - 20, position.y);
        break;
      case 'left':
        x = Math.max(20, position.x - rect.width);
        break;
      case 'right':
        x = Math.min(viewport.width - rect.width - 20, position.x);
        break;
      case 'center':
        x = position.x - rect.width / 2;
        y = position.y - rect.height / 2;
        break;
      }
    }
    
    setMenuPosition({ x, y });
  }, [position, anchor]);
  
  // Handle item selection
  const handleItemSelect = useCallback((item: ContextMenuItem, index: number) => {
    if (item.disabled) return;
    
    if (item.type === 'submenu' && item.submenu) {
      setSubmenuOpen(submenuOpen === item.id ? null : item.id);
      if (enableHaptics) haptic.current.trigger('light');
      return;
    }
    
    if (enableHaptics) haptic.current.trigger('selection');
    
    // Visual feedback
    VisualFeedback.trigger(menuRef.current!, {
      enabled: true,
      type: 'highlight',
      duration: 200
    });
    
    item.onSelect?.();
    onSelect?.(item);
    onDismiss?.();
  }, [submenuOpen, enableHaptics, onSelect, onDismiss]);
  
  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const visibleItems = items.filter(item => item.type !== 'separator');
    const currentIndex = selectedIndex;
    
    switch (e.key) {
    case 'ArrowUp':
      e.preventDefault();
      const prevIndex = currentIndex <= 0 ? visibleItems.length - 1 : currentIndex - 1;
      setSelectedIndex(prevIndex);
      break;
        
    case 'ArrowDown':
      e.preventDefault();
      const nextIndex = currentIndex >= visibleItems.length - 1 ? 0 : currentIndex + 1;
      setSelectedIndex(nextIndex);
      break;
        
    case 'Enter':
    case ' ':
      e.preventDefault();
      if (currentIndex >= 0 && visibleItems[currentIndex]) {
        handleItemSelect(visibleItems[currentIndex], currentIndex);
      }
      break;
        
    case 'Escape':
      e.preventDefault();
      onDismiss?.();
      break;
    }
  }, [items, selectedIndex, handleItemSelect, onDismiss]);
  
  // Dismiss on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onDismiss?.();
      }
    };
    
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [onDismiss]);
  
  // Render menu item
  const renderMenuItem = (item: ContextMenuItem, index: number) => {
    if (item.type === 'separator') {
      return <div key={item.id} className="context-menu-separator" />;
    }
    
    const isSelected = selectedIndex === index;
    const hasSubmenu = item.type === 'submenu' && item.submenu;
    const isSubmenuOpen = submenuOpen === item.id;
    
    return (
      <div key={item.id}>
        <button
          className={`
            context-menu-item
            ${isSelected ? 'selected' : ''}
            ${item.disabled ? 'disabled' : ''}
            ${item.danger ? 'danger' : ''}
            ${item.checked ? 'checked' : ''}
          `}
          onClick={() => handleItemSelect(item, index)}
          disabled={item.disabled}
          style={{
            minHeight: TOUCH_TARGETS.large,
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            width: '100%',
            justifyContent: 'space-between'
          }}
        >
          <div className="menu-item-content">
            {item.icon && <span className="menu-item-icon">{item.icon}</span>}
            <span className="menu-item-label">{item.label}</span>
          </div>
          
          <div className="menu-item-extras">
            {showShortcuts && item.shortcut && (
              <span className="menu-item-shortcut">{item.shortcut}</span>
            )}
            {hasSubmenu && (
              <span className="menu-item-arrow">▶</span>
            )}
            {item.type === 'checkbox' && item.checked && (
              <span className="menu-item-check">✓</span>
            )}
          </div>
        </button>
        
        {hasSubmenu && isSubmenuOpen && (
          <div className="context-submenu">
            {item.submenu!.map((subItem, subIndex) => 
              renderMenuItem(subItem, items.length + subIndex)
            )}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div
      ref={menuRef}
      className="touch-context-menu"
      style={{
        position: 'fixed',
        left: menuPosition.x,
        top: menuPosition.y,
        zIndex: 10000,
        minWidth: '200px',
        maxWidth: '300px',
        backgroundColor: 'var(--color-background)',
        border: '1px solid var(--color-border)',
        borderRadius: '8px',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.15)',
        padding: '8px 0',
        fontSize: '16px',
        touchAction: 'none',
        userSelect: 'none'
      }}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {items.map((item, index) => renderMenuItem(item, index))}
    </div>
  );
};

/**
 * Context menu provider for long-press activation
 */
export interface ContextMenuProviderProps {
  items: ContextMenuItem[] | ((target: HTMLElement) => ContextMenuItem[]);
  longPressDelay?: number;
  enableHaptics?: boolean;
  children: React.ReactNode;
}

export const ContextMenuProvider: React.FC<ContextMenuProviderProps> = ({
  items,
  longPressDelay = 500,
  enableHaptics = true,
  children
}) => {
  const [menuState, setMenuState] = useState<{
    visible: boolean;
    position: { x: number; y: number };
    items: ContextMenuItem[];
  }>({
    visible: false,
    position: { x: 0, y: 0 },
    items: []
  });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLElement | null>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    const touchManager = new TouchManager({
      element: containerRef.current,
      config: {
        longPressDelay,
        preventDefault: false // Allow normal touch interactions
      },
      handlers: {
        longPress: (event: GestureEvent) => {
          const target = event.target as HTMLElement;
          targetRef.current = target;
          
          // Get context items
          const contextItems = typeof items === 'function' ? items(target) : items;
          
          // Show menu
          setMenuState({
            visible: true,
            position: event.center,
            items: contextItems
          });
          
          // Haptic feedback
          if (enableHaptics) {
            HapticFeedback.getInstance().trigger('heavy');
          }
        }
      }
    });
    
    return () => touchManager.destroy();
  }, [items, longPressDelay, enableHaptics]);
  
  const handleDismiss = useCallback(() => {
    setMenuState(prev => ({ ...prev, visible: false }));
    targetRef.current = null;
  }, []);
  
  return (
    <>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
        {children}
      </div>
      
      {menuState.visible && (
        <TouchContextMenu
          items={menuState.items}
          position={menuState.position}
          onDismiss={handleDismiss}
          enableHaptics={enableHaptics}
        />
      )}
    </>
  );
};

/**
 * Common context menu items for graph editing
 */
export const graphContextMenuItems = {
  node: (nodeId: string): ContextMenuItem[] => [
    {
      id: 'edit',
      label: 'Edit Node',
      icon: '✏️',
      shortcut: 'Double Tap',
      onSelect: () => console.log('Edit node', nodeId)
    },
    {
      id: 'duplicate',
      label: 'Duplicate',
      icon: '📋',
      shortcut: 'Cmd+D',
      onSelect: () => console.log('Duplicate node', nodeId)
    },
    { id: 'sep1', type: 'separator' },
    {
      id: 'connect',
      label: 'Connect To...',
      icon: '🔗',
      type: 'submenu',
      submenu: [
        { id: 'connect-new', label: 'New Node', icon: '➕' },
        { id: 'connect-existing', label: 'Existing Node', icon: '🔍' }
      ]
    },
    {
      id: 'disconnect',
      label: 'Disconnect All',
      icon: '✂️',
      onSelect: () => console.log('Disconnect node', nodeId)
    },
    { id: 'sep2', type: 'separator' },
    {
      id: 'delete',
      label: 'Delete',
      icon: '🗑',
      danger: true,
      shortcut: 'Long Press',
      onSelect: () => console.log('Delete node', nodeId)
    }
  ],
  
  edge: (edgeId: string): ContextMenuItem[] => [
    {
      id: 'edit-edge',
      label: 'Edit Connection',
      icon: '✏️',
      onSelect: () => console.log('Edit edge', edgeId)
    },
    {
      id: 'reverse',
      label: 'Reverse Direction',
      icon: '🔄',
      onSelect: () => console.log('Reverse edge', edgeId)
    },
    { id: 'sep1', type: 'separator' },
    {
      id: 'delete-edge',
      label: 'Delete Connection',
      icon: '✂️',
      danger: true,
      onSelect: () => console.log('Delete edge', edgeId)
    }
  ],
  
  canvas: (position: { x: number; y: number }): ContextMenuItem[] => [
    {
      id: 'add-node',
      label: 'Add Node',
      icon: '➕',
      type: 'submenu',
      submenu: [
        { id: 'add-text', label: 'Text Node', icon: '📝' },
        { id: 'add-weighted', label: 'Weighted Choice', icon: '⚖️' },
        { id: 'add-output', label: 'Output Node', icon: '📤' },
        { id: 'add-variable', label: 'Variable Node', icon: '📊' }
      ]
    },
    {
      id: 'paste',
      label: 'Paste',
      icon: '📋',
      shortcut: '3-Finger Tap',
      disabled: true, // Enable when clipboard has content
      onSelect: () => console.log('Paste at', position)
    },
    { id: 'sep1', type: 'separator' },
    {
      id: 'select-all',
      label: 'Select All',
      icon: '🔲',
      shortcut: '3-Finger Tap',
      onSelect: () => console.log('Select all')
    },
    {
      id: 'zoom',
      label: 'Zoom',
      icon: '🔍',
      type: 'submenu',
      submenu: [
        { id: 'zoom-in', label: 'Zoom In', icon: '➕' },
        { id: 'zoom-out', label: 'Zoom Out', icon: '➖' },
        { id: 'zoom-fit', label: 'Fit to Screen', icon: '⬜' },
        { id: 'zoom-reset', label: 'Reset Zoom', icon: '🔄' }
      ]
    },
    { id: 'sep2', type: 'separator' },
    {
      id: 'grid',
      label: 'Show Grid',
      icon: '⚏',
      type: 'checkbox',
      checked: true,
      onSelect: () => console.log('Toggle grid')
    },
    {
      id: 'snap',
      label: 'Snap to Grid',
      icon: '🧲',
      type: 'checkbox',
      checked: false,
      onSelect: () => console.log('Toggle snap')
    }
  ]
};