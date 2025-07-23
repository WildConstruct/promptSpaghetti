import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { NodeMeta } from '../Palette';
import { 
  professionalColors,
  professionalShadows,
  professionalSpacing,
  professionalBorderRadius
} from '../styles/professional-design-system';

interface ProfessionalNodeRendererProps {
  id: string;
  data: any;
  selected?: boolean;
  onSelect: (nodeId: string) => void;
  getNodeMeta: (nodeType: string) => NodeMeta;
  getCategoryColor: (category: string) => string;
}

/**
 * Professional Node Renderer - Cinema 4D/Substance Designer inspired
 * 
 * Features:
 * - Professional gradients and shadows
 * - Cinema 4D signature orange accents
 * - Clean typography with proper hierarchy
 * - Subtle animations and hover states
 * - Industry-standard color coding
 */
export const ProfessionalNodeRenderer = memo<ProfessionalNodeRendererProps>(({
  id,
  data,
  selected = false,
  onSelect,
  getNodeMeta,
  getCategoryColor
}) => {
  try {
    const hasVariations = data?.variations && data.variations.length > 0;
    const nodeType = data?.nodeType || data?.type || 'WeightedChoice';
    const nodeMeta = getNodeMeta(nodeType);
    const categoryColor = getCategoryColor(nodeMeta.category || 'general');
  
    // Get non-label properties for display
    const properties = Object.entries(data || {})
      .filter(([k]) => k !== 'label' && k !== 'variations' && k !== 'type')
      .slice(0, 3);
    
    // Professional node styling with gradients and shadows
    const nodeStyle: React.CSSProperties = {
      cursor: 'pointer',
      // Professional gradient background inspired by Cinema 4D panels
      background: `linear-gradient(
        135deg,
        ${professionalColors.background.tertiary} 0%,
        ${professionalColors.background.secondary} 50%,
        ${professionalColors.background.tertiary} 100%
      )`,
      border: selected 
        ? `2px solid ${professionalColors.accent.orange}` 
        : `1px solid ${professionalColors.ui.border}`,
      borderRadius: professionalBorderRadius.md,
      minWidth: 180, // Slightly larger for better professional appearance
      minHeight: 90,
      boxShadow: selected 
        ? professionalShadows.node.selected
        : professionalShadows.node.default,
      position: 'relative',
      overflow: 'visible',
      fontFamily: 'var(--font-primary)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', // Professional easing curve
      zIndex: 1,
      pointerEvents: 'auto',
      display: 'block',
      // Hardware acceleration for smooth animations
      WebkitTransform: 'translateZ(0)',
      transform: 'translateZ(0)',
      WebkitBackfaceVisibility: 'hidden',
      backfaceVisibility: 'hidden',
      // Subtle inner shadow for depth
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(
          180deg,
          rgba(255,
          255,
          255,
          0.05
        ) 0%, rgba(255,255,255,0.01) 50%, rgba(0,0,0,0.05) 100%)',
        borderRadius: 'inherit',
        pointerEvents: 'none',
      }
    };

    const headerStyle: React.CSSProperties = {
      // Cinema 4D inspired header gradient
      background: `linear-gradient(135deg, ${categoryColor} 0%, ${categoryColor}dd 100%)`,
      color: '#ffffff',
      padding: `${professionalSpacing[2]} ${professionalSpacing[3]}`,
      fontSize: 'var(--font-size-xs)',
      fontWeight: 600,
      display: 'flex',
      alignItems: 'center',
      gap: professionalSpacing[2],
      borderRadius: `${professionalBorderRadius.md} ${professionalBorderRadius.md} 0 0`,
      // Subtle text shadow for better readability
      textShadow: '0 1px 2px rgba(0,0,0,0.3)',
      // Inner highlight for professional appearance
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2)',
    };

    const contentStyle: React.CSSProperties = {
      padding: `${professionalSpacing[3]} ${professionalSpacing[3]}`,
      color: professionalColors.text.primary,
      minHeight: '50px',
      background: 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.005) 100%)',
    };

    const titleStyle: React.CSSProperties = {
      fontWeight: 600,
      fontSize: 'var(--font-size-base)',
      marginBottom: properties.length > 0 ? professionalSpacing[2] : 0,
      color: professionalColors.text.primary,
      lineHeight: 1.3,
      // Subtle glow for selected state
      ...(selected && {
        textShadow: `0 0 8px ${professionalColors.accent.orange}40`,
      }),
    };

    const propertiesStyle: React.CSSProperties = {
      fontSize: 'var(--font-size-xs)',
      color: professionalColors.text.secondary,
      lineHeight: 1.4,
      fontFamily: 'var(--font-mono)', // Use monospace for technical properties
    };

    const handleBaseStyle: React.CSSProperties = {
      width: 14, // Slightly larger for better interaction
      height: 14,
      borderRadius: '50%',
      border: `2px solid ${professionalColors.background.secondary}`,
      cursor: 'crosshair',
      zIndex: 10,
      transition: 'all 0.2s ease',
      boxShadow: professionalShadows.elevation.sm,
    };

    const inputHandleStyle: React.CSSProperties = {
      ...handleBaseStyle,
      background: professionalColors.ui.border,
      '&:hover': {
        background: professionalColors.ui.borderHover,
        transform: 'scale(1.1)',
        boxShadow: professionalShadows.elevation.md,
      }
    };

    const outputHandleStyle: React.CSSProperties = {
      ...handleBaseStyle,
      background: categoryColor,
      '&:hover': {
        background: categoryColor,
        transform: 'scale(1.1)',
        boxShadow: `${professionalShadows.elevation.md}, 0 0 12px ${categoryColor}40`,
      }
    };

    // Variation badge style
    const variationBadgeStyle: React.CSSProperties = {
      marginLeft: 'auto',
      width: 20,
      height: 20,
      backgroundColor: 'rgba(255,255,255,0.25)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 10,
      fontWeight: 'bold',
      boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.2)',
      transition: 'all 0.2s ease',
    };

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
        style={nodeStyle}
        onMouseEnter={(e) => {
          if (!selected) {
            e.currentTarget.style.WebkitTransform = 'translateY(-3px) translateZ(0)';
            e.currentTarget.style.transform = 'translateY(-3px) translateZ(0)';
            e.currentTarget.style.boxShadow = professionalShadows.node.hover;
            // Subtle glow effect on hover
            e.currentTarget.style.filter = 'brightness(1.05)';
          }
        }}
        onMouseLeave={(e) => {
          if (!selected) {
            e.currentTarget.style.WebkitTransform = 'translateY(0) translateZ(0)';
            e.currentTarget.style.transform = 'translateY(0) translateZ(0)';
            e.currentTarget.style.boxShadow = professionalShadows.node.default;
            e.currentTarget.style.filter = 'brightness(1)';
          }
        }}
        aria-label={(() => {
          const label = data?.label ?? nodeMeta.label;
          const summary = properties.map(([k, v]) => `${k}: ${String(v)}`).join(', ');
          return summary ? `${label}. ${summary}` : label;
        })()}
      >
        {/* Professional Header Section */}
        <div style={headerStyle}>
          <span style={{ fontSize: 16, filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.3))' }}>
            {typeof nodeMeta.icon === 'string' ? nodeMeta.icon : '🔧'}
          </span>
          <span style={{ letterSpacing: '0.01em' }}>{nodeMeta.label}</span>
          {hasVariations && (
            <div
              style={variationBadgeStyle}
              title={`${data.variations.length} variations`}
            >
              {data.variations.length}
            </div>
          )}
        </div>

        {/* Professional Content Section */}
        <div style={contentStyle}>
          {/* Node Title with professional typography */}
          <div style={titleStyle}>
            {data?.label || nodeMeta.label || nodeType || id}
          </div>
          
          {/* Properties with monospace font for technical data */}
          {properties.length > 0 && (
            <div style={propertiesStyle}>
              {properties.map(([k, v], idx) => (
                <div key={k} style={{ 
                  marginBottom: idx < properties.length - 1 ? '3px' : 0,
                  opacity: 0.8
                }}>
                  <span style={{ 
                    color: professionalColors.text.tertiary, 
                    fontWeight: 500 
                  }}>{k}:</span>{' '}
                  <span style={{ color: professionalColors.text.secondary }}>
                    {String(v).length > 22 ? String(v).slice(0, 22) + '…' : String(v)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Professional Input Handle */}
        <Handle
          type="target"
          position={Position.Left}
          id="target"
          style={inputHandleStyle}
          isConnectable={true}
        />

        {/* Professional Output Handle */}
        <Handle
          type="source"
          position={Position.Right}
          id="source"
          style={outputHandleStyle}
          isConnectable={true}
        />
      </div>
    );
  } catch (error) {
    console.error('ProfessionalNodeRenderer error:', error, 'Props:', { id, data });
    
    // Professional error state
    return (
      <div
        style={{
          cursor: 'pointer',
          background: `linear-gradient(
            135deg,
            ${professionalColors.background.tertiary} 0%,
            ${professionalColors.background.secondary} 100%
          )`,
          border: `1px solid ${professionalColors.accent.red}`,
          borderRadius: professionalBorderRadius.md,
          minWidth: 180,
          minHeight: 90,
          padding: professionalSpacing[3],
          color: professionalColors.text.primary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-primary)',
          boxShadow: professionalShadows.elevation.md,
          textAlign: 'center',
        }}
      >
        <div>
          <div style={{ 
            fontSize: 'var(--font-size-lg)', 
            marginBottom: professionalSpacing[2],
            color: professionalColors.accent.red 
          }}>
            ⚠️
          </div>
          <div style={{ fontSize: 'var(--font-size-sm)' }}>
            Error: {data?.nodeType || data?.type || 'Unknown'}
          </div>
        </div>
      </div>
    );
  }
});

ProfessionalNodeRenderer.displayName = 'ProfessionalNodeRenderer';

export default ProfessionalNodeRenderer;