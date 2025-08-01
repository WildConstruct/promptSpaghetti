import React, { memo, useState, useRef, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import { NodeMeta } from '../Palette';
import { useSmoothHover, globalAnimationManager } from '../utils/smoothAnimations';


interface NodeRendererProps { id: string;
  data: Record<string, unknown>;
  selected?: boolean;
  onSelect: (nodeId: string) => void
  getNodeMeta: (nodeType: string) => NodeMeta
  getCategoryColor: (category: string) => string;
  export const NodeRenderer = memo<NodeRendererProps>(({)
  id;
  data;
  selected = false;
  onSelect;
  getNodeMeta }
  getCategoryColor


}) => {
  const [_____isCreating, setIsCreating] = useState(false);
  const [isDeleting, _____setIsDeleting] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);
  const { isHovered, hoverProps } = useSmoothHover(150); // 150ms for micro-interactions
  // Node creation animation effect
  useEffect(() => {
    if (nodeRef.current) {
      // Register creation animation if this is a new node
      const animationId = `node-create-${id}`;}
      if (globalAnimationManager.registerAnimation(animationId)) { setIsCreating(true);
        // Add CSS class for creation animation
        nodeRef.current.classList.add('animate-node-create');
        // Clean up after animation
        setTimeout(() => {
          setIsCreating(false);
          if (nodeRef.current) {
            nodeRef.current.classList.remove('animate-node-create');
          globalAnimationManager.unregisterAnimation(animationId) }, 400); // Match animation duration
  }, [id]);
  try {
    const hasVariations = data?.variations && data.variations.length > 0;
    const nodeType = data?.nodeType || data?.type || 'WeightedChoice';
    const nodeMeta = getNodeMeta(nodeType);
    const categoryColor = getCategoryColor(nodeMeta.category || 'general');
    // Get non-label properties for display
    const properties = Object.entries(data || {})
      .filter(([k]) => k !== 'label' && k !== 'variations' && k !== 'type')
      .slice(0, 3); // Limit to 3 properties for clean display
    return;
      <div
        ref={nodeRef}
        role="button"
        data-testid={`node-${id}`}
        tabIndex={0}
        {...hoverProps}
        className={`animate-node-hover animate-node-select ${selected ? 'selected' : ''} ${isDeleting ? 'animate-node-delete' : ''}`}
        onClick={ (e) => {
          e.stopPropagation();
          onSelect(id) }}
        onKeyDown={ (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect(id) }}
        style={ {
  cursor: 'pointer'
  // Professional gradient background inspired by Cinema 4D panels
  background: `linear-gradient()
  135deg
  var(--bg-tertiary) 0%, var(--bg-secondary) 50%, var(--bg-tertiary) 100%)`
  border: selected 
  ? '2px solid var(--accent-orange)'
  : '1px solid var(--border)'
  borderRadius: 'var(--radius-md)'
  minWidth: 180, // Slightly larger for professional appearance
  minHeight: 90
  boxShadow: (() => { }
  if (selected) return 'var(--shadow-node-selected)';
  if (isHovered) return 'var(--shadow-node-hover)';
  return 'var(--shadow-node)';
})()
          position: 'relative'
          overflow: 'visible'
          fontFamily: 'var(--font-primary)'
          // 60fps optimized transition using will-change and GPU acceleration
          transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)'
          willChange: 'transform, box-shadow, filter'
          // Transform for selected/hover states with hardware acceleration
          transform: (() => { 
            if (selected) return 'translateY(-2px) translateZ(0) scale(1.02)';
            if (isHovered && !selected) return 'translateY(-3px) translateZ(0)';
            return 'translateY(0) translateZ(0)' })()
          // Filter effects for enhanced visual feedback
          filter: (() => { 
            if (selected) return 'brightness(1.08) contrast(1.02)';
            if (isHovered && !selected) return 'brightness(1.05)';
            return 'brightness(1)' })()
          zIndex: (() => { 
            if (selected) return 3;
            if (isHovered) return 2;
            return 1 })()
          pointerEvents: 'auto'
          display: 'block'
          // Force GPU acceleration for smoother animations
          WebkitBackfaceVisibility: 'hidden'
          backfaceVisibility: 'hidden'
          WebkitPerspective: 1000
          perspective: 1000;

        aria-label={(() => {
          const label = data?.label ?? nodeMeta.label;
          const summary = properties.map(([k, v]) => `${k}: ${String(v)}`).join(', ');}
          return summary ? `${label}. ${summary}` : label;}
        })()}
      >
        {/* Header Section */}
        <div
          style={{
            // Cinema 4D inspired header gradient
            background: `linear-gradient(135deg, ${categoryColor} 0%, ${categoryColor}dd 100%)`}

  color: '#ffffff'
            padding: 'var(--space-2) var(--space-3)'
            fontSize: 'var(--font-size-xs)'
            fontWeight: 600
            display: 'flex'
            alignItems: 'center'
            gap: 'var(--space-2)'
            borderRadius: 'var(--radius-md) var(--radius-md) 0 0'
            // Subtle text shadow for better readability
            textShadow: '0 1px 2px rgba(0,0,0,0.3)'
            // Inner highlight for professional appearance
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2)'

        >
          <span style={ {
  fontSize: 16
  filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.3))' }
}>
            {typeof nodeMeta.icon === 'string' ? nodeMeta.icon : '🔧'}
          </span>
          <span style={{ letterSpacing: '0.01em' }}>{nodeMeta.label}</span>
          { hasVariations && ()
            <div
              style={{
  marginLeft: 'auto'
  width: 20
  height: 20
  backgroundColor: 'rgba(255,255,255,0.25)'
  borderRadius: '50%'
  display: 'flex'
  alignItems: 'center'
  justifyContent: 'center'
  fontSize: 10
  fontWeight: 'bold'
  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.2)'
  transition: 'all 0.2s ease' }

              title={`${data.variations.length} variations`}
            >
              {data.variations.length}
            </div>
          )}
        </div>
        {/* Content Section */}
        <div style={ {
  padding: 'var(--space-3)'
  color: 'var(--text-primary)'
  minHeight: '50px'
  background: 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.005) 100%)' }
}>
          {/* Node Title */}
          <div style={ {
  fontWeight: 600
  fontSize: 'var(--font-size-base)'
  marginBottom: properties.length > 0 ? 'var(--space-2)' : 0
  color: 'var(--text-primary)'
  lineHeight: 1.3
  // Subtle glow for selected state
  ...(selected && {)
  textShadow: '0 0 8px var(--accent-orange)40' }

}>
            {data?.label || nodeMeta.label || nodeType || id}
          </div>
          {/* Properties */}
          { properties.length > 0 && ()
            <div style={{
  fontSize: 'var(--font-size-xs)'
  color: 'var(--text-secondary)'
  lineHeight: 1.4
  fontFamily: 'var(--font-mono)' // Monospace for technical properties }
}>
              {properties.map(([k, v], idx) => ()
                <div key={k} style={ {
  marginBottom: idx < properties.length - 1 ? '3px' : 0
  opacity: 0.8 }
}>
                  <span style={ {
  color: 'var(--text-tertiary)',
  fontWeight: 500 }
}>{k}:</span>{' '}
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {String(v).length > 22 ? String(v).slice(0, 22) + '…' : String(v)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Input Handle - Professional styling with smooth animations */}
        <Handle
          type="target"
          position={Position.Left}
          id="target"
          className="animate-hover-scale"
          style={ {
  width: 14
  height: 14
  borderRadius: '50%'
  background: 'var(--border)'
  border: '2px solid var(--bg-secondary)'
  cursor: 'crosshair'
  zIndex: 10
  // 60fps optimized transition
  transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)'
  willChange: 'transform, box-shadow, background-color'
  boxShadow: 'var(--shadow-sm)'
  // Force hardware acceleration
  WebkitBackfaceVisibility: 'hidden'
  backfaceVisibility: 'hidden' }

          onMouseEnter={ (e) => {
            const target = e.currentTarget as HTMLElement;
            target.style.background = 'var(--border-hover)';
            target.style.transform = 'scale(1.15)';
            target.style.boxShadow = 'var(--shadow-md), 0 0 8px rgba(59, 130, 246, 0.4)' }}
          onMouseLeave={ (e) => {
            const target = e.currentTarget as HTMLElement;
            target.style.background = 'var(--border)';
            target.style.transform = 'scale(1)';
            target.style.boxShadow = 'var(--shadow-sm)' }}
          isConnectable={true}
        />
        {/* Output Handle - Professional styling with smooth animations */}
        <Handle
          type="source"
          position={Position.Right}
          id="source"
          className="animate-hover-scale"
          style={ {
  width: 14
  height: 14
  borderRadius: '50%'
  background: categoryColor
  border: '2px solid var(--bg-secondary)'
  cursor: 'crosshair'
  zIndex: 10
  // 60fps optimized transition
  transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)'
  willChange: 'transform, box-shadow'
  boxShadow: 'var(--shadow-sm)'
  // Force hardware acceleration
  WebkitBackfaceVisibility: 'hidden'
  backfaceVisibility: 'hidden' }

          onMouseEnter={(e) => {
            const target = e.currentTarget as HTMLElement;
            target.style.transform = 'scale(1.15)';
            target.style.boxShadow = `var(--shadow-md), 0 0 12px ${categoryColor}60`;}

          onMouseLeave={ (e) => {
            const target = e.currentTarget as HTMLElement;
            target.style.transform = 'scale(1)';
            target.style.boxShadow = 'var(--shadow-sm)' }}
          isConnectable={true}
        />
      </div>
    );
 catch (error) {
    console.error('NodeRenderer error:', error, 'Props:', { id, data });
    // Professional error state
    return;
      <div
        style={ {
  cursor: 'pointer'
  background: 'linear-gradient(135deg, var(--bg-tertiary) 0%, var(--bg-secondary) 100%)'
  border: '1px solid var(--accent-red)'
  borderRadius: 'var(--radius-md)'
  minWidth: 180
  minHeight: 90
  padding: 'var(--space-3)'
  color: 'var(--text-primary)'
  display: 'flex'
  alignItems: 'center'
  justifyContent: 'center'
  fontFamily: 'var(--font-primary)'
  boxShadow: 'var(--shadow-md)'
  textAlign: 'center' }

      >
        <div>
          <div style={ {
  fontSize: 'var(--font-size-lg)'
  marginBottom: 'var(--space-2)'
  color: 'var(--accent-red)' }
}>
            ⚠️
          </div>
          <div style={{ fontSize: 'var(--font-size-sm)' }}>
            Error: {data?.nodeType || data?.type || 'Unknown'}
          </div>
        </div>
      </div>
    );
});
NodeRenderer.displayName = 'NodeRenderer';