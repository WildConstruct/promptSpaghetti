import React, { memo } from "react";
import { Node, Handle, Position } from "reactflow";
import { NodeMeta } from "../Palette";

interface NodeRendererProps {
  id: string;
  data: any;
  selected?: boolean;
  onSelect: (nodeId: string) => void;
  getNodeMeta: (nodeType: string) => NodeMeta;
  getCategoryColor: (category: string) => string;
}

export const NodeRenderer = memo<NodeRendererProps>(({
  id,
  data,
  selected = false,
  onSelect,
  getNodeMeta,
  getCategoryColor,
}) => {
  try {
    const hasVariations = data?.variations && data.variations.length > 0;
    const nodeType = data?.nodeType || data?.type || 'WeightedChoice';
    const nodeMeta = getNodeMeta(nodeType);
    const categoryColor = getCategoryColor(nodeMeta.category || 'general');
  
    // Get non-label properties for display
    const properties = Object.entries(data || {})
      .filter(([k]) => k !== 'label' && k !== 'variations' && k !== 'type')
      .slice(0, 3); // Limit to 3 properties for clean display
    
    return (
      <div
        role="button"
        data-testid={`node-${id}`}
        tabIndex={0}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(id);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect(id);
          }
        }}
        style={{
          cursor: 'pointer',
          background: '#2d3748',
          border: selected ? `2px solid ${categoryColor}` : '1px solid #4a5568',
          borderRadius: 6,
          minWidth: 160,
          minHeight: 80,
          boxShadow: selected 
            ? `0 0 0 3px ${categoryColor}20, 0 4px 12px rgba(0,0,0,0.25)` 
            : '0 2px 8px rgba(0,0,0,0.15)',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          if (!selected) {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.25)';
          }
        }}
        onMouseLeave={(e) => {
          if (!selected) {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
          }
        }}
        aria-label={(() => {
          const label = data?.label ?? nodeMeta.label;
          const summary = properties.map(([k, v]) => `${k}: ${String(v)}`).join(', ');
          return summary ? `${label}. ${summary}` : label;
        })()}
      >
        {/* Header Section */}
        <div
          style={{
            background: categoryColor,
            color: '#fff',
            padding: '8px 12px',
            fontSize: 12,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span style={{ fontSize: 14 }}>
            {typeof nodeMeta.icon === 'string' ? nodeMeta.icon : '🔧'}
          </span>
          <span>{nodeMeta.label}</span>
          {hasVariations && (
            <div
              style={{
                marginLeft: 'auto',
                width: 18,
                height: 18,
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
                fontWeight: 'bold',
              }}
              title={`${data.variations.length} variations`}
            >
              {data.variations.length}
            </div>
          )}
        </div>

        {/* Content Section */}
        <div style={{ padding: '10px 12px', color: '#e2e8f0' }}>
          {/* Node Title */}
          <div style={{ 
            fontWeight: 500, 
            fontSize: 13, 
            marginBottom: properties.length > 0 ? 6 : 0,
            color: '#f7fafc'
          }}>
            {data?.label || id}
          </div>
          
          {/* Properties */}
          {properties.length > 0 && (
            <div style={{ fontSize: 11, color: '#a0aec0', lineHeight: 1.3 }}>
              {properties.map(([k, v], idx) => (
                <div key={k} style={{ marginBottom: idx < properties.length - 1 ? 2 : 0 }}>
                  <span style={{ color: '#cbd5e0' }}>{k}:</span>{' '}
                  <span>{String(v).length > 20 ? String(v).slice(0, 20) + '...' : String(v)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Input Handle - React Flow connection point */}
        <Handle
          type="target"
          position={Position.Left}
          id="target"
          style={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: '#4a5568',
            border: '2px solid #2d3748',
            cursor: 'crosshair',
            zIndex: 10,
          }}
          isConnectable={true}
        />

        {/* Output Handle - React Flow connection point */}
        <Handle
          type="source"
          position={Position.Right}
          id="source"
          style={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: categoryColor,
            border: '2px solid #2d3748',
            cursor: 'crosshair',
            zIndex: 10,
          }}
          isConnectable={true}
        />
      </div>
    );
  } catch (error) {
    console.error('NodeRenderer error:', error, 'Props:', { id, data });
    // Fallback render for error cases
    return (
      <div
        style={{
          cursor: 'pointer',
          background: '#2d3748',
          border: '1px solid #e53e3e',
          borderRadius: 6,
          minWidth: 160,
          minHeight: 80,
          padding: 12,
          color: '#e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        Error: {data?.nodeType || data?.type || 'Unknown'}
      </div>
    );
  }
});

NodeRenderer.displayName = 'NodeRenderer';