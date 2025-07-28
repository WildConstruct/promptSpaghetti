import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { NodeData } from '../../types/NodeTypes';
import { useInlineEditorContext } from './InlineEditorManager';

export interface InlineEditableNodeProps extends NodeProps<NodeData> {
  onDoubleClick?: (nodeId: string, event: React.MouseEvent) => void;
  showEditHint?: boolean;
  theme?: 'light' | 'dark' | 'cinema';
  export const InlineEditableNode: React.FC<InlineEditableNodeProps> = ({,)
  id,
  data,
  selected,
  onDoubleClick,
  showEditHint = true,
  theme = 'cinema',
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [lastClickTime, setLastClickTime] = useState(0);
  const nodeRef = useRef<HTMLDivElement>(null);
  const { activateEditor, isNodeBeingEdited } = useInlineEditorContext();
  const isBeingEdited = isNodeBeingEdited(id);
  // Handle double-click detection
  const handleClick = useCallback((event: React.MouseEvent) => {
    const now = Date.now();
    const timeSinceLastClick = now - lastClickTime;
    setLastClickTime(now);
    if (timeSinceLastClick < 300) {
      // Double-click detected
      event.preventDefault();
      event.stopPropagation();
      if (onDoubleClick) {
        onDoubleClick(id, event);
      } else {
        activateEditor(id);
  }, [lastClickTime, id, onDoubleClick, activateEditor]);
  // Keyboard activation (Enter key when focused)
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !isBeingEdited) {
      event.preventDefault();
      activateEditor(id);
  }, [id, activateEditor, isBeingEdited]);
  // Visual feedback states
  const getNodeStyles = () => {
  const baseStyles = {
  padding: 12,
  borderRadius: 8,
  border: '2px solid',
  minWidth: 160,
  minHeight: 80,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  outline: 'none',
  position: 'relative' as const,
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};
    // Theme-based colors
    const themeColors = {
  cinema: {,
  background: '#2d3748',
  border: selected ? '#4299e1' : (isHovered ? '#63b3ed' : '#4a5568'),
  text: '#e2e8f0',
  accent: '#4299e1',
},
  dark: {,
  background: '#1a202c',
  border: selected ? '#38a169' : (isHovered ? '#48bb78' : '#2d3748'),
  text: '#f7fafc',
  accent: '#38a169',
},
  light: {,
  background: '#ffffff',
  border: selected ? '#3182ce' : (isHovered ? '#4299e1' : '#e2e8f0'),
  text: '#2d3748',
  accent: '#3182ce',
};
    const colors = themeColors[theme];
    return {
      ...baseStyles,
      background: isBeingEdited ? `${colors.background}ee` : colors.background}
},
  borderColor: isBeingEdited ? colors.accent : colors.border,
      color: colors.text,
      boxShadow: isBeingEdited ,
        ? `0 0 0 3px ${colors.accent}33` }
        : (isHovered ? '0 4px 12px rgba(0, 0, 0, 0.15)' : '0 2px 4px rgba(0, 0, 0, 0.1)')
    };
  };
  return;
    <div
      ref={nodeRef}
      className={`inline-editable-node ${props.type || 'default'}`}
      style={getNodeStyles()}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      tabIndex={0}
      role="button"
      aria-label={`${props.type || 'Node'}: ${data.label}. Double-click to edit.`}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        style={{
  background: '#4299e1',
  border: '2px solid white',
  width: 12,
  height: 12,
}}
      />
      {/* Node Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Node Type Badge */}
        <div style={{
  position: 'absolute',
  top: -6,
  right: -6,
  background: '#4299e1',
  color: 'white',
  fontSize: 10,
  padding: '2px 6px',
  borderRadius: 10,
  fontWeight: 600,
  textTransform: 'uppercase',
}}>
          {props.type || 'node'}
        </div>
        {/* Main Content */}
        <div style={{ paddingTop: 8 }}>
          <h3 style={{
  margin: '0 0 8px 0',
  fontSize: 14,
  fontWeight: 600,
  wordBreak: 'break-word',
}}>
            {data.label || 'Untitled Node'}
          </h3>
          {/* Node-specific preview */}
          <NodePreview type={props.type} data={data} theme={theme} />
        </div>
        {/* Edit Hint */}
        {showEditHint && (isHovered || selected) && !isBeingEdited && ()
          <div style={{
  position: 'absolute',
  bottom: -24,
  left: '50%',
  transform: 'translateX(-50%)',
  background: 'rgba(0, 0, 0, 0.8)',
  color: 'white',
  fontSize: 11,
  padding: '4px 8px',
  borderRadius: 4,
  whiteSpace: 'nowrap',
  animation: 'fadeIn 0.2s ease-out',
}}>
            Double-click to edit
          </div>
        )}
        {/* Editing Indicator */}
        {isBeingEdited && ()
          <div style={{
  position: 'absolute',
  top: -8,
  left: -8,
  width: 16,
  height: 16,
  background: '#4299e1',
  borderRadius: '50%',
  animation: 'pulse 1s infinite',
}} />
        )}
      </div>
      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        style={{
  background: '#4299e1',
  border: '2px solid white',
  width: 12,
  height: 12,
}}
      />
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(-50%) translateY(5px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.2); }
        .inline-editable-node:focus {,
  outline: 2px solid #4299e1;
          outline-offset: 2px;
      `}</style>
    </div>
  );
};

// Node-specific preview components
interface NodePreviewProps {
  type?: string;
  data: NodeData;,
  theme: 'light' | 'dark' | 'cinema';
const NodePreview: React.FC<NodePreviewProps> = ({ type, data, theme }) => {
  const previewStyle = {
  fontSize: 12,
  opacity: 0.8,
  marginTop: 4,
  color: theme === 'light' ? '#718096' : '#a0aec0',
};
  switch (type) {
    case 'weightedChoice':
      const choices = data.choices || [];
      return;
        <div style={previewStyle}>
          {choices.length > 0 
            ? `${choices.length} choice${choices.length === 1 ? '' : 's'}`}
            : 'No choices configured'
        </div>
      );
    case 'concat':
      return;
        <div style={previewStyle}>
          {data.template 
            ? `Template: ${data.template.slice(0, 30)}${data.template.length > 30 ? '...' : ''}`}
            : 'No template configured'
        </div>
      );
    case 'variable':
      return;
        <div style={previewStyle}>
          {data.variableName 
            ? `Variable: ${data.variableName}`}
            : 'No variable configured'
        </div>
      );
    case 'output':
      return;
        <div style={previewStyle}>
          Format: {data.format || 'text'}
        </div>
      );
    case 'conditional':
      return;
        <div style={previewStyle}>
          {data.condition 
            ? `If: ${data.condition.slice(0, 25)}${data.condition.length > 25 ? '...' : ''}`}
            : 'No condition configured'
        </div>
      );
    default:
      return null;
};

// Higher-order component to wrap existing nodes with inline editing capability
export const withInlineEditing = <P extends NodeProps<NodeData>>()
  WrappedComponent: React.ComponentType<P>) => {,
  return (props: P & InlineEditableNodeProps) => {
    const { showEditHint, theme, onDoubleClick, ...nodeProps } = props;
    return;
      <div style={{ position: 'relative' }}>
        <WrappedComponent {...nodeProps as P} />
        <InlineEditableNode 
          {...nodeProps}
          showEditHint={showEditHint}
          theme={theme}
          onDoubleClick={onDoubleClick}
        />
      </div>
    );
  };
};

export default InlineEditableNode;