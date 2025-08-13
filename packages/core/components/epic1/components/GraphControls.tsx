import React from 'react';
import { Panel } from 'reactflow';
import { NodePalette } from '../NodePalette';
import { NodeToolbar } from '../NodeToolbar';

interface GraphControlsProps {
  onTogglePreview: () => void;
  onExecute?: () => void;
  isPreviewVisible: boolean;
  onNodePaletteCollapse: (collapsed: boolean) => void;
  showExecuteButton?: boolean;
  showNodePalette?: boolean;
  showNodeToolbar?: boolean;
  showInstructions?: boolean;
}

/**
 * GraphControls - Manages all control panels and toolbars
 * Consolidates UI controls in one place
 */
export const GraphControls: React.FC<GraphControlsProps> = ({
  onTogglePreview,
  onExecute,
  isPreviewVisible,
  onNodePaletteCollapse,
  showExecuteButton = true,
  showNodePalette = true,
  showNodeToolbar = true,
  showInstructions = true,
}) => {
  return (
    <>
      {/* Top-right controls panel */}
      <Panel position="top-right">
        <div className="epic1-controls">
          <button 
            className="epic1-preview-toggle"
            onClick={onTogglePreview}
            title="Toggle preview (P)"
          >
            {isPreviewVisible ? '👁️' : '👁️‍🗨️'}
          </button>
          {showExecuteButton && onExecute && (
            <button 
              className="epic1-execute-button"
              onClick={onExecute}
            >
              Execute Graph
            </button>
          )}
        </div>
      </Panel>

      {/* Bottom instructions panel */}
      {showInstructions && (
        <Panel position="bottom-center">
          <div className="epic1-instructions">
            Click any node to edit • Tab/Shift+Tab to navigate • Enter to confirm • Escape to cancel • Press P for preview • Press ? for help
          </div>
        </Panel>
      )}

      {/* Node creation palette */}
      {showNodePalette && (
        <NodePalette 
          position="left" 
          defaultCollapsed={false} 
          onCollapsedChange={onNodePaletteCollapse}
        />
      )}
      
      {/* Top toolbar */}
      {showNodeToolbar && (
        <NodeToolbar position="top" />
      )}
    </>
  );
};

/**
 * QuickActionBar - Floating action bar for common operations
 * Can be positioned anywhere on the canvas
 */
export const QuickActionBar: React.FC<{
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  actions: Array<{
    icon: string;
    label: string;
    onClick: () => void;
    disabled?: boolean;
  }>;
}> = ({ position = 'top-center', actions }) => {
  return (
    <Panel position={position}>
      <div className="epic1-quick-actions">
        {actions.map((action, index) => (
          <button
            key={index}
            className="epic1-quick-action"
            onClick={action.onClick}
            disabled={action.disabled}
            title={action.label}
          >
            <span className="epic1-quick-action-icon">{action.icon}</span>
            <span className="epic1-quick-action-label">{action.label}</span>
          </button>
        ))}
      </div>
    </Panel>
  );
};