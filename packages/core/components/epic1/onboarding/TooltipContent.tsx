/**
 * Tooltip Content - Rich content components for tooltips
 */

import React from 'react';

interface TooltipContentProps {
  title: string;
  description: string;
  icon?: string;
  shortcut?: string;
  example?: string;
  learnMore?: () => void;
}

export const TooltipContent: React.FC<TooltipContentProps> = ({
  title,
  description,
  icon,
  shortcut,
  example,
  learnMore,
}) => {
  return (
    <div style={{ padding: '12px', maxWidth: '280px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        {icon && (
          <span style={{ fontSize: '20px' }}>{icon}</span>
        )}
        <h4 style={{ 
          fontSize: '15px', 
          fontWeight: 600, 
          margin: 0,
          flex: 1,
          color: '#1a1a1a',
        }}>
          {title}
        </h4>
        {shortcut && (
          <kbd style={{
            backgroundColor: '#f3f4f6',
            border: '1px solid #e5e7eb',
            borderRadius: '4px',
            padding: '2px 6px',
            fontSize: '12px',
            fontFamily: 'monospace',
            color: '#4b5563',
          }}>
            {shortcut}
          </kbd>
        )}
      </div>

      {/* Description */}
      <p style={{
        fontSize: '13px',
        lineHeight: 1.5,
        color: '#4a4a4a',
        margin: '0 0 8px 0',
      }}>
        {description}
      </p>

      {/* Example */}
      {example && (
        <div style={{
          backgroundColor: '#f9fafb',
          borderLeft: '3px solid #6366f1',
          padding: '8px',
          borderRadius: '4px',
          marginBottom: '8px',
        }}>
          <p style={{
            fontSize: '12px',
            color: '#4b5563',
            margin: 0,
            fontFamily: 'monospace',
          }}>
            Example: {example}
          </p>
        </div>
      )}

      {/* Learn more */}
      {learnMore && (
        <button
          onClick={learnMore}
          style={{
            background: 'none',
            border: 'none',
            color: '#6366f1',
            fontSize: '12px',
            cursor: 'pointer',
            padding: 0,
            textDecoration: 'underline',
          }}
        >
          Learn more →
        </button>
      )}
    </div>
  );
};

// Specialized tooltip content for different features
export const NodeEditTooltip: React.FC = () => (
  <TooltipContent
    title="Inline Editing"
    description="Double-click any text in a node to edit it directly. Your changes save automatically when you click outside or press Enter."
    icon="✏️"
    shortcut="Double-click"
    example="Change 'brave' to 'fearless'"
  />
);

export const CanvasControlsTooltip: React.FC = () => (
  <TooltipContent
    title="Canvas Navigation"
    description="Use your mouse to navigate the canvas. Drag to pan around, scroll to zoom in/out, and right-click for the context menu."
    icon="🖱️"
    example="Hold Space + drag for quick pan"
  />
);

export const ConnectionTooltip: React.FC = () => (
  <TooltipContent
    title="Connect Nodes"
    description="Drag from the edge of one node to another to create a connection. Delete connections by selecting and pressing Delete."
    icon="🔗"
    shortcut="Drag handles"
  />
);

export const PreviewTooltip: React.FC = () => (
  <TooltipContent
    title="Generate Variations"
    description="Click to generate multiple variations of your prompt using different random seeds. Each run produces unique results."
    icon="🎲"
    shortcut="Ctrl/Cmd + Enter"
    example="5 variations with different seeds"
  />
);

export const SaveTooltip: React.FC = () => (
  <TooltipContent
    title="Auto-Save Active"
    description="Your work is automatically saved every 5 seconds. The cloud icon shows when saves are in progress."
    icon="☁️"
    example="Last saved: 2 seconds ago"
  />
);

export const PaletteTooltip: React.FC = () => (
  <TooltipContent
    title="Node Library"
    description="Drag any node type from here onto the canvas to add it to your graph. Each type has unique properties."
    icon="🎨"
    learnMore={() => window.dispatchEvent(new Event('showNodeTypes'))}
  />
);

// Tooltip content registry
export const tooltipContent = {
  'node-edit': NodeEditTooltip,
  'canvas-controls': CanvasControlsTooltip,
  'connection': ConnectionTooltip,
  'preview': PreviewTooltip,
  'save': SaveTooltip,
  'palette': PaletteTooltip,
} as const;

// Quick tooltip component
export const QuickTooltip: React.FC<{
  text: string;
  shortcut?: string;
}> = ({ text, shortcut }) => (
  <div style={{ 
    padding: '8px 12px',
    fontSize: '13px',
    color: '#374151',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  }}>
    <span>{text}</span>
    {shortcut && (
      <kbd style={{
        backgroundColor: '#f3f4f6',
        border: '1px solid #e5e7eb',
        borderRadius: '3px',
        padding: '1px 4px',
        fontSize: '11px',
        fontFamily: 'monospace',
      }}>
        {shortcut}
      </kbd>
    )}
  </div>
);