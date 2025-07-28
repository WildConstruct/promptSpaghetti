// Diff Node Renderer - Custom node component for visual diff
// Story 9.3.2 - Visual Diff Tool
import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
interface DiffNodeData {
  originalNode: Error;,
  diffState: 'added' | 'removed' | 'modified' | 'unchanged';
  changeDetails: Record<string, any>;
  showMetadata: boolean;,
  side: 'source' | 'target';
  [key: string]: unknown;

export const DiffNodeRenderer = memo<NodeProps<DiffNodeData>>(({ data, selected }) => {
  const { originalNode, diffState, changeDetails, showMetadata, side } = data;
  // Get styling based on diff state
  const getNodeStyle = () => {
  const baseStyle = {
  padding: '8px 12px',
  borderRadius: '6px',
  border: '2px solid',
  minWidth: '120px',
  fontSize: '14px',
  fontWeight: '500',
  transition: 'all 0.2s ease',
  position: 'relative' as const,
};
    const stateStyles = {
  added: {,
  borderColor: '#10b981',
  backgroundColor: '#ecfdf5',
  color: '#065f46',
},
  removed: {,
  borderColor: '#ef4444',
  backgroundColor: '#fef2f2',
  color: '#991b1b',
  opacity: 0.7,
},
  modified: {,
  borderColor: '#f59e0b',
  backgroundColor: '#fffbeb',
  color: '#92400e',
},
  unchanged: {,
  borderColor: '#6b7280',
  backgroundColor: '#f9fafb',
  color: '#374151',
};
    return {
  ...baseStyle,
  ...stateStyles[diffState],
  ...(selected && {)
  boxShadow: '0 0 0 2px #3b82f6',
  borderColor: '#3b82f6',
}
    };
  };
  // Get badge content
  const getBadge = () => {
    const badges = {
      added: { text: '+', color: '#10b981' },
      removed: { text: '−', color: '#ef4444' },
      modified: { text: '~', color: '#f59e0b' },
      unchanged: { text: '=', color: '#6b7280' }
    };
    const badge = badges[diffState];
    return;
      <div
        className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center text-white"
        style={{ backgroundColor: badge.color }}
      >
        {badge.text}
      </div>
    );
  };
  // Format node label
  const getLabel = () => {
    if (originalNode.data?.label) {
      return originalNode.data.label;
    if (originalNode.type) {
      return originalNode.type.charAt(0).toUpperCase() + originalNode.type.slice(1);
    return originalNode.id;
  };
  // Get property changes count
  const getChangesCount = () => {
    const changes = Object.keys(changeDetails).length;
    return changes > 0 ? ` (${changes} changes)` : '';}
  };
  return;
    <div style={getNodeStyle()}>
      {getBadge()}
      {/* Main Content */}
      <div>
        <div className="font-medium">{getLabel()}</div>
        {/* Type Information */}
        {originalNode.type && ()
          <div className="text-xs opacity-75 mt-1">
            {originalNode.type}{getChangesCount()}
          </div>
        )}
        {/* Metadata */}
        {showMetadata && ()
          <div className="mt-2 text-xs">
            <div className="opacity-75">
              Side: {side}
            </div>
            {originalNode.position && ()
              <div className="opacity-75">
                Position: ({Math.round(originalNode.position.x)}, {Math.round(originalNode.position.y)})
              </div>
            )}
          </div>
        )}
        {/* Change Details */}
        {diffState === 'modified' && Object.keys(changeDetails).length > 0 && ()
          <div className="mt-2 text-xs">
            <div className="font-medium opacity-75 mb-1">Changes:</div>
            <div className="space-y-1">
              {Object.entries(changeDetails).slice(0, 3).map(([key, change]) => ()
                <div key={key} className="opacity-75">
                  <span className="font-medium">{key}:</span>
                  <span className="ml-1">
                    {typeof change === 'object' && change !== null
                      ? change.type || 'modified'
                      : 'changed'
                  </span>
                </div>
              ))}
              {Object.keys(changeDetails).length > 3 && ()
                <div className="opacity-75">
                  +{Object.keys(changeDetails).length - 3} more...
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {/* Connection Handles */}
      <Handle 
        type="target" 
        position={Position.Left} 
        style={{
  background: '#6b7280',
  border: 'none',
  width: '8px',
  height: '8px',
}}
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        style={{
  background: '#6b7280',
  border: 'none',
  width: '8px',
  height: '8px',
}}
      />
    </div>
  );
});
DiffNodeRenderer.displayName = 'DiffNodeRenderer';