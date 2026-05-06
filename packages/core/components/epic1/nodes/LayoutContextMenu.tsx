import React, { useEffect, useMemo, useRef } from 'react';
import './NodeContextMenu.css';

export type LayoutContextMenuMode = 'node' | 'canvas' | null;

export interface LayoutContextMenuPosition {
  x: number;
  y: number;
}

interface LayoutContextMenuProps {
  mode: LayoutContextMenuMode;
  position: LayoutContextMenuPosition | null;
  nodeType?: string;
  selectedCount: number;
  totalNodeCount: number;
  onClose: () => void;
  onNeatenSelection: () => void;
  onCleanupSelection: () => void;
  onAlignHorizontal: () => void;
  onAlignVertical: () => void;
  onDistributeHorizontal: () => void;
  onDistributeVertical: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onNeatenAll: () => void;
  onCleanupAll: () => void;
  onFitView: () => void;
  onSetGridSize?: (value: number) => void;
  onSetRowSnap?: (value: number) => void;
}

interface MenuAction {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  shortcut?: string;
}

const MENU_WIDTH = 240;
const MENU_HEIGHT = 420;

function formatNodeType(nodeType?: string) {
  if (!nodeType) {
    return 'Node Layout';
  }

  return nodeType
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, letter => letter.toUpperCase());
}

function clampMenuPosition(position: LayoutContextMenuPosition) {
  if (typeof window === 'undefined') {
    return position;
  }

  return {
    x: Math.min(position.x, Math.max(8, window.innerWidth - MENU_WIDTH - 8)),
    y: Math.min(position.y, Math.max(8, window.innerHeight - MENU_HEIGHT - 8))
  };
}

export const LayoutContextMenu: React.FC<LayoutContextMenuProps> = ({
  mode,
  position,
  nodeType,
  selectedCount,
  totalNodeCount,
  onClose,
  onNeatenSelection,
  onCleanupSelection,
  onAlignHorizontal,
  onAlignVertical,
  onDistributeHorizontal,
  onDistributeVertical,
  onDuplicate,
  onDelete,
  onNeatenAll,
  onCleanupAll,
  onFitView,
  onSetGridSize,
  onSetRowSnap
}) => {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const clampedPosition = useMemo(
    () => (position ? clampMenuPosition(position) : null),
    [position]
  );

  useEffect(() => {
    if (!mode) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const handlePointerDown = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handlePointerDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [mode, onClose]);

  if (!mode || !clampedPosition) {
    return null;
  }

  const runAction = (action: () => void, disabled?: boolean) => {
    if (disabled) {
      return;
    }
    action();
    onClose();
  };

  const renderAction = ({
    label,
    onClick,
    disabled,
    danger,
    shortcut
  }: MenuAction) => (
    <button
      key={label}
      type="button"
      className={`context-menu-item${danger ? ' danger' : ''}`}
      disabled={disabled}
      onClick={() => runAction(onClick, disabled)}
    >
      <span>{label}</span>
      {shortcut && <span className="context-menu-shortcut">{shortcut}</span>}
    </button>
  );

  const hasSelection = selectedCount > 0;
  const hasTwoSelected = selectedCount >= 2;
  const hasThreeSelected = selectedCount >= 3;
  const hasNodes = totalNodeCount > 0;

  const nodeActions: MenuAction[] = [
    {
      label: hasSelection ? 'Neaten Selection' : 'Neaten Selection (select nodes)',
      onClick: onNeatenSelection,
      disabled: !hasSelection
    },
    {
      label: hasSelection ? 'Clean Up Selection' : 'Clean Up Selection (select nodes)',
      onClick: onCleanupSelection,
      disabled: !hasSelection
    },
    {
      label: hasTwoSelected ? 'Align Horizontal' : 'Align Horizontal (2+ nodes)',
      onClick: onAlignHorizontal,
      disabled: !hasTwoSelected
    },
    {
      label: hasTwoSelected ? 'Align Vertical' : 'Align Vertical (2+ nodes)',
      onClick: onAlignVertical,
      disabled: !hasTwoSelected
    },
    {
      label: hasThreeSelected
        ? 'Distribute Horizontal'
        : 'Distribute Horizontal (3+ nodes)',
      onClick: onDistributeHorizontal,
      disabled: !hasThreeSelected
    },
    {
      label: hasThreeSelected
        ? 'Distribute Vertical'
        : 'Distribute Vertical (3+ nodes)',
      onClick: onDistributeVertical,
      disabled: !hasThreeSelected
    },
    {
      label: hasSelection ? 'Duplicate' : 'Duplicate (select nodes)',
      onClick: onDuplicate,
      disabled: !hasSelection,
      shortcut: 'Ctrl+D'
    },
    {
      label: hasSelection ? 'Delete' : 'Delete (select nodes)',
      onClick: onDelete,
      disabled: !hasSelection,
      danger: hasSelection
    }
  ];

  const canvasActions: MenuAction[] = [
    {
      label: hasNodes ? 'Neaten All' : 'Neaten All (no nodes)',
      onClick: onNeatenAll,
      disabled: !hasNodes
    },
    {
      label: hasNodes ? 'Clean Up All' : 'Clean Up All (no nodes)',
      onClick: onCleanupAll,
      disabled: !hasNodes
    },
    {
      label: 'Fit View',
      onClick: onFitView
    }
  ];

  return (
    <div
      ref={menuRef}
      className="node-context-menu layout-context-menu"
      role="menu"
      aria-label="Graph context menu"
      style={{
        position: 'fixed',
        left: clampedPosition.x,
        top: clampedPosition.y,
        zIndex: 3000
      }}
      onContextMenu={event => event.preventDefault()}
      onMouseDown={event => event.stopPropagation()}
      data-testid="layout-context-menu"
    >
      <div className="context-menu-header">
        <span className="node-type-badge">
          {mode === 'node' ? formatNodeType(nodeType) : 'Canvas Layout'}
        </span>
      </div>

      <div className="context-menu-items">
        {mode === 'node' ? nodeActions.map(renderAction) : canvasActions.map(renderAction)}

        {mode === 'canvas' && (onSetGridSize || onSetRowSnap) && (
          <>
            <div className="context-menu-separator" />
            <div className="context-menu-section-label">Neaten Presets</div>
            <div className="context-menu-preset-grid">
              {[10, 20, 40].map(value => (
                <button
                  key={`grid-${value}`}
                  type="button"
                  className="context-menu-item compact"
                  onClick={() =>
                    onSetGridSize && runAction(() => onSetGridSize(value))
                  }
                >
                  Grid {value}
                </button>
              ))}
              {[30, 40, 60].map(value => (
                <button
                  key={`row-${value}`}
                  type="button"
                  className="context-menu-item compact"
                  onClick={() =>
                    onSetRowSnap && runAction(() => onSetRowSnap(value))
                  }
                >
                  Row {value}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LayoutContextMenu;
