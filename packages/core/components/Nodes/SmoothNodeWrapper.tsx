/**
 * Smooth Node Wrapper with Professional Interactions
 * Epic 8.1: Task 4 - Cinema 4D quality node animations and hover states
 * 
 * Wraps React Flow nodes with professional smooth animations
 */
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { NodeProps, Handle, Position } from 'reactflow';
import { 
  createSmoothTransition, 
  animationDurations, 
  easingFunctions,
  useSmoothHover,
  globalAnimationManager
} from '../../utils/smoothAnimations';
import '../../styles/smoothAnimations.css';

export interface SmoothNodeWrapperProps extends NodeProps {
  children: React.ReactNode;
  nodeType?: string;
  isSelected?: boolean;
  isConnectable?: boolean;
  onNodeClick?: (nodeId: string) => void;
  onNodeDoubleClick?: (nodeId: string) => void;
  onNodeDelete?: (nodeId: string) => void;
}

export const SmoothNodeWrapper: React.FC<SmoothNodeWrapperProps> = ({)
  id,
  data,
  selected,
  children,
  nodeType = 'default',
  isSelected = false,
  isConnectable = true,
  onNodeClick,
  onNodeDoubleClick,
  onNodeDelete
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout>();
  // Professional hover state management
  const { isHovered: _____smoothHovered, hoverProps } = useSmoothHover();
  // Node creation animation
  useEffect(() => {
    if (nodeRef.current) {
      const animationId = `node-create-${id}`;}
      if (globalAnimationManager.registerAnimation(animationId)) {
        setIsAnimating(true);
        setTimeout(() => {
          setIsAnimating(false);
          globalAnimationManager.unregisterAnimation(animationId);
        }, animationDurations.complex);
      }
    }
  }, [id]);
  // Enhanced click handlers with haptic feedback
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    // Visual click feedback
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), animationDurations.micro);
    onNodeClick?.(id);
  }, [id, onNodeClick]);
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onNodeDoubleClick?.(id);
  }, [id, onNodeDoubleClick]);
  // Professional hover effects with Cinema 4D inspiration
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    // Add subtle hover delay for professional feel
    hoverTimeoutRef.current = setTimeout(() => {
      if (nodeRef.current) {
        nodeRef.current.style.transform = 'translateY(-2px) scale(1.02)';
      }
    }, 50);
  }, []);
  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    if (nodeRef.current) {
      nodeRef.current.style.transform = 'translateY(0) scale(1)';
    }
  }, []);
  // Professional color scheme based on node type
  const getNodeColors = () => {
    const colors = {
      'WeightedChoice': {
        primary: '#3b82f6',
        secondary: '#1e40af',
        accent: '#60a5fa',
        background: 'rgba(59, 130, 246, 0.1)'
      },
      'Concat': {
        primary: '#10b981',
        secondary: '#047857',
        accent: '#34d399',
        background: 'rgba(16, 185, 129, 0.1)'
      },
      'Output': {
        primary: '#f59e0b',
        secondary: '#d97706',
        accent: '#fbbf24',
        background: 'rgba(245, 158, 11, 0.1)'
      },
      'SetVariable': {
        primary: '#8b5cf6',
        secondary: '#7c3aed',
        accent: '#a78bfa',
        background: 'rgba(139, 92, 246, 0.1)'
      },
      'GetVariable': {
        primary: '#06b6d4',
        secondary: '#0891b2',
        accent: '#22d3ee',
        background: 'rgba(6, 182, 212, 0.1)'
      },
      'Conditional': {
        primary: '#ef4444',
        secondary: '#dc2626',
        accent: '#f87171',
        background: 'rgba(239, 68, 68, 0.1)'
      },
      default: {,
        primary: '#6b7280',
        secondary: '#4b5563',
        accent: '#9ca3af',
        background: 'rgba(107, 114, 128, 0.1)'
      }
    };
    return colors[nodeType as keyof typeof colors] || colors.default;
  };
  const colors = getNodeColors();
  // Professional node styling
  const getNodeStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      position: 'relative',
      borderRadius: 12,
      background: 'linear-gradient(135deg, rgba(31, 41, 55, 0.95) 0%, rgba(17, 24, 39, 0.98) 100%)',
      border: `2px solid ${selected || isSelected ? colors.primary : 'rgba(55, 65, 81, 0.8)'}`,}
      backdropFilter: 'blur(8px)',
      boxShadow: selected || isSelected 
        ? `0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px ${colors.primary}40`}
        : isHovered 
          ? '0 12px 40px rgba(0, 0, 0, 0.25)'
          : '0 4px 16px rgba(0, 0, 0, 0.15)',
      cursor: 'pointer',
      userSelect: 'none',
      minWidth: 160,
      minHeight: 80,
      ...createSmoothTransition()
        ['transform', 'box-shadow', 'border-color', 'background'],
        animationDurations.normal,
        easingFunctions.cinema4d.professional
      )
    };
    // Apply hover and selection effects
    if (isPressed) {
      return {
        ...baseStyle,
        transform: 'translateY(1px) scale(0.98)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
      };
    }
    if (isHovered) {
      return {
        ...baseStyle,
        transform: 'translateY(-2px) scale(1.02)',
        borderColor: colors.accent,
        background: `linear-gradient(135deg, ${colors.background} 0%, rgba(31, 41, 55, 0.95) 100%)`}
      };
    }
    return baseStyle;
  };
  // Professional handle styling
  const getHandleStyle = (type: 'source' | 'target'): React.CSSProperties => ({)
    width: 12,
    height: 12,
    borderRadius: '50%',
    border: `2px solid ${colors.primary}`,}
    background: type === 'source' ? colors.primary : 'rgba(31, 41, 55, 0.9)',
    boxShadow: `0 2px 8px ${colors.primary}40`,}
    ...createSmoothTransition()
      ['background', 'border-color', 'box-shadow', 'transform'],
      animationDurations.micro
    )
  });
  const handleHoverStyle: React.CSSProperties = {
    transform: 'scale(1.2)',
    background: colors.accent,
    borderColor: colors.accent,
    boxShadow: `0 4px 12px ${colors.primary}60`}
  };
  return ()
    <div
      ref={nodeRef}
      style={getNodeStyle()}
      className={`smooth-node ${isAnimating ? 'animate-node-create' : ''}`}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...hoverProps}
    >
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Left}
        style={getHandleStyle('target')}
        onMouseEnter={(e) => {
          Object.assign(e.currentTarget.style, handleHoverStyle);
        }}
        onMouseLeave={(e) => {
          Object.assign(e.currentTarget.style, getHandleStyle('target'));
        }}
        isConnectable={isConnectable}
      />
      {/* Node content */}
      <div
        style={{
          padding: '16px 20px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Node type indicator */}
        <div
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: colors.primary,
            boxShadow: `0 0 8px ${colors.primary}60`,}
            ...createSmoothTransition(['background', 'box-shadow'])
          }}
        />
        {/* Node content */}
        {children}
        {/* Selection indicator */}
        {(selected || isSelected) && ()
          <div
            style={{
              position: 'absolute',
              inset: -2,
              borderRadius: 14,
              background: `linear-gradient(45deg, ${colors.primary}20, transparent, ${colors.primary}20)`,}
              animation: 'glowPulse 2s ease-in-out infinite',
              pointerEvents: 'none',
              zIndex: -1,
            }}
          />
        )}
        {/* Hover glow effect */}
        {isHovered && ()
          <div
            style={{
              position: 'absolute',
              inset: -4,
              borderRadius: 16,
              background: `radial-gradient(circle at center, ${colors.primary}15, transparent)`,}
              pointerEvents: 'none',
              zIndex: -1,
              animation: 'fadeIn 0.3s ease-out'
            }}
          />
        )}
      </div>
      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Right}
        style={getHandleStyle('source')}
        onMouseEnter={(e) => {
          Object.assign(e.currentTarget.style, handleHoverStyle);
        }}
        onMouseLeave={(e) => {
          Object.assign(e.currentTarget.style, getHandleStyle('source'));
        }}
        isConnectable={isConnectable}
      />
      {/* Professional node label */}
      <div
        style={{
          position: 'absolute',
          bottom: -24,
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: 11,
          color: '#6b7280',
          fontWeight: 500,
          letterSpacing: '0.025em',
          opacity: isHovered ? 1 : 0.7,
          ...createSmoothTransition(['opacity'])
        }}
      >
        {nodeType}
      </div>
    </div>
  );
};
/**
 * Enhanced node creation animation component
 */
export interface NodeCreationAnimatorProps {
  children: React.ReactNode;
  isCreating: boolean;
  onAnimationComplete?: () => void;
}

export const NodeCreationAnimator: React.FC<NodeCreationAnimatorProps> = ({)
  children,
  isCreating,
  onAnimationComplete
}) => {
  useEffect(() => {
    if (isCreating && onAnimationComplete) {
      const timer = setTimeout(() => {
        onAnimationComplete();
      }, animationDurations.complex);
      return () => clearTimeout(timer);
    }
  }, [isCreating, onAnimationComplete]);
  return ()
    <div
      className={isCreating ? 'animate-node-create' : ''}
      style={{
        ...createSmoothTransition(['transform', 'opacity'])
      }}
    >
      {children}
    </div>
  );
};

export default SmoothNodeWrapper;