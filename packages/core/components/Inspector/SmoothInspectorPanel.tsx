/**
 * Enhanced Inspector Panel with Smooth Animations
 * Epic 8.1: Task 4 - Cinema 4D quality smooth interactions
 * 
 * Professional inspector panel with 60fps animations and Cinema 4D polish
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ZodSchema } from 'zod';
import { ChevronLeft, ChevronRight, Settings, Maximize2, Minimize2 } from 'lucide-react';
import { PropertiesSection } from './PropertiesSection';
import { PreviewSection } from './PreviewSection';
import { useUISettingsStore } from '../../stores/uiSettingsStore';
import { 
  createSmoothTransition, 
  animationDurations, 
  easingFunctions,
  useSmoothHover,
  AnimatedElement 
} from '../../utils/smoothAnimations';
import '../../styles/smoothAnimations.css';

// Filmmaker-friendly node type names
const getFilmmakerFriendlyName = (nodeType: string): string => {
  const friendlyNames: Record<string, string> = {
    'WeightedChoice': 'Random Selection',
    'Concat': 'Text Combiner', 
    'Output': 'Final Output',
    'Include': 'Scene Reference',
    'SetVariable': 'Set Element',
    'GetVariable': 'Use Element',
    'Subject': 'Character/Object',
    'Action': 'Action/Verb',
    'Attribute': 'Description',
    'Connector': 'Transition',
    'Conditional': 'If/Then Logic',
    'Sequential': 'Sequence',
    'Markov': 'Smart Chain',
    'WeightedAdvanced': 'Weighted Selection',
    'PythonTransform': 'Text Transform'
  };
  
  return friendlyNames[nodeType] || nodeType;
};

export interface SmoothInspectorPanelProps {
  node: any | null;
  schema: ZodSchema<any> | null;
  onChange: (partial: Record<string, unknown>) => void;
  onClose?: () => void;
  onGlobalPreviewRequest?: () => void;
  initialWidth?: number;
  minWidth?: number;
  maxWidth?: number;
}

export const SmoothInspectorPanel = ({ 
  node, 
  schema, 
  onChange,
  onClose,
  onGlobalPreviewRequest,
  initialWidth = 320,
  minWidth = 280,
  maxWidth = 600
}) => {
  const [isResizing, setIsResizing] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const resizeRef = useRef<HTMLDivElement>(null);

  // UI Settings
  const { 
    debugMode, 
    setDebugMode, 
    shouldShowTechnicalFields,
    complexityLevel,
    setComplexityLevel,
    shouldShowAdvancedFeatures
  } = useUISettingsStore();

  // Smooth hover states
  const collapseHover = useSmoothHover();
  const debugHover = useSmoothHover();
    const maximizeHover = useSmoothHover();

  // Resize handlers with smooth animations
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    
    const newWidth = window.innerWidth - e.clientX;
    const clampedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
    setWidth(clampedWidth);
  }, [isResizing, minWidth, maxWidth]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  // Animation styles
  const panelStyle: React.CSSProperties = {
    width: collapsed ? 48 : isMaximized ? '50%' : width,
    minWidth: collapsed ? 48 : minWidth,
    height: '100%',
    borderLeft: '1px solid #374151',
    background: 'linear-gradient(180deg, #1f2937 0%, #111827 100%)',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    zIndex: 10,
    boxShadow: collapsed ? 'none' : '-4px 0 20px rgba(0, 0, 0, 0.1)',
    ...createSmoothTransition(
      ['width', 'min-width', 'box-shadow'], 
      animationDurations.panel,
      easingFunctions.cinema4d.professional
    )
  };

  const headerStyle: React.CSSProperties = {
    padding: collapsed ? '8px' : '16px 20px',
    borderBottom: '1px solid #374151',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'linear-gradient(180deg, #374151 0%, #2d3748 100%)',
    backdropFilter: 'blur(8px)',
    ...createSmoothTransition(['padding', 'background'], animationDurations.normal)
  };

  const buttonStyle: React.CSSProperties = {
    background: 'rgba(59, 130, 246, 0.1)',
    border: '1px solid rgba(59, 130, 246, 0.2)',
    borderRadius: '6px',
    padding: '8px',
    cursor: 'pointer',
    color: '#93c5fd',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...createSmoothTransition(
      ['background', 'border-color', 'transform', 'box-shadow'],
      animationDurations.micro
    )
  };

  const getHoverButtonStyle = (isHovered: boolean): React.CSSProperties => ({
    ...buttonStyle,
    background: isHovered ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
    borderColor: isHovered ? 'rgba(59, 130, 246, 0.4)' : 'rgba(59, 130, 246, 0.2)',
    transform: isHovered ? 'translateY(-1px)' : 'translateY(0)',
    boxShadow: isHovered ? '0 4px 12px rgba(59, 130, 246, 0.2)' : '0 2px 4px rgba(0, 0, 0, 0.1)'
  });

  // Handle collapse with animation
  const handleCollapse = useCallback(() => {
    setCollapsed(!collapsed);
    if (isMaximized) {
      setIsMaximized(false);
    }
  }, [collapsed, isMaximized]);

  // Handle maximize with animation
  const handleMaximize = useCallback(() => {
    setIsMaximized(!isMaximized);
    if (collapsed) {
      setCollapsed(false);
    }
  }, [isMaximized, collapsed]);

  // Debug mode toggle with animation
  const handleDebugToggle = useCallback(() => {
    setDebugMode(!debugMode);
  }, [debugMode, setDebugMode]);

  if (!node || !schema) {
    return (
      <aside style={panelStyle}>
        <div style={headerStyle}>
          {!collapsed && (
            <AnimatedElement 
              animationType="fade" 
              duration={animationDurations.fast}
              isVisible={!collapsed}
            >
              <h3 style={{ 
                margin: 0, 
                fontSize: 16, 
                fontWeight: 600, 
                color: '#f3f4f6',
                letterSpacing: '0.025em'
              }}>
                Inspector
              </h3>
            </AnimatedElement>
          )}
          
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              {...collapseHover.hoverProps}
              onClick={handleCollapse}
              style={getHoverButtonStyle(collapseHover.isHovered)}
              title={collapsed ? 'Expand Inspector' : 'Collapse Inspector'}
            >
              {collapsed ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </button>
          </div>
        </div>

        {!collapsed && (
          <AnimatedElement 
            animationType="fade" 
            duration={animationDurations.normal}
            delay={100}
            isVisible={!collapsed}
          >
            <div style={{ 
              padding: 24, 
              color: '#9ca3af', 
              fontStyle: 'italic',
              textAlign: 'center',
              marginTop: 60,
              fontSize: 15,
              lineHeight: 1.6
            }}>
              <div style={{ 
                fontSize: 48, 
                opacity: 0.3, 
                marginBottom: 16,
                ...createSmoothTransition(['opacity'], 2000)
              }}>
                🎬
              </div>
              Select a node to configure its properties
            </div>
          </AnimatedElement>
        )}

        {/* Resize handle */}
        <div
          ref={resizeRef}
          onMouseDown={handleMouseDown}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 6,
            cursor: 'col-resize',
            background: 'transparent',
            zIndex: 20,
            opacity: isResizing ? 1 : 0,
            ...createSmoothTransition(['opacity'], animationDurations.fast)
          }}
        />

        {/* Visual resize indicator */}
        <div
          style={{
            position: 'absolute',
            left: -1,
            top: 0,
            bottom: 0,
            width: 2,
            background: isResizing ? '#3b82f6' : 'transparent',
            ...createSmoothTransition(['background'], animationDurations.fast)
          }}
        />
      </aside>
    );
  }

  const nodeTypeName = getFilmmakerFriendlyName(node.type);

  return (
    <aside style={panelStyle} className="inspector-panel">
      {/* Header with smooth animations */}
      <div style={headerStyle}>
        {!collapsed && (
          <AnimatedElement 
            animationType="slide" 
            duration={animationDurations.normal}
            isVisible={!collapsed}
          >
            <div>
              <h3 style={{ 
                margin: 0, 
                fontSize: 16, 
                fontWeight: 600, 
                color: '#f3f4f6',
                letterSpacing: '0.025em',
                marginBottom: 4
              }}>
                {nodeTypeName}
              </h3>
              {debugMode && (
                <div style={{ 
                  fontSize: 12, 
                  color: '#6b7280', 
                  fontFamily: 'monospace'
                }}>
                  ID: {node.id}
                </div>
              )}
            </div>
          </AnimatedElement>
        )}
        
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {!collapsed && !isMaximized && (
            <button
              {...maximizeHover.hoverProps}
              onClick={handleMaximize}
              style={getHoverButtonStyle(maximizeHover.isHovered)}
              title="Maximize Inspector"
            >
              <Maximize2 size={14} />
            </button>
          )}

          {!collapsed && isMaximized && (
            <button
              {...maximizeHover.hoverProps}
              onClick={handleMaximize}
              style={getHoverButtonStyle(maximizeHover.isHovered)}
              title="Restore Inspector"
            >
              <Minimize2 size={14} />
            </button>
          )}

          {!collapsed && (
            <button
              {...debugHover.hoverProps}
              onClick={handleDebugToggle}
              style={{
                ...getHoverButtonStyle(debugHover.isHovered),
                background: debugMode 
                  ? 'rgba(239, 68, 68, 0.2)' 
                  : debugHover.isHovered 
                    ? 'rgba(59, 130, 246, 0.2)' 
                    : 'rgba(59, 130, 246, 0.1)',
                borderColor: debugMode 
                  ? 'rgba(239, 68, 68, 0.4)' 
                  : debugHover.isHovered 
                    ? 'rgba(59, 130, 246, 0.4)' 
                    : 'rgba(59, 130, 246, 0.2)'
              }}
              title={debugMode ? 'Hide Technical Details' : 'Show Technical Details'}
            >
              {debugMode ? '👨‍💻' : '🎭'}
            </button>
          )}
          
          <button
            {...collapseHover.hoverProps}
            onClick={handleCollapse}
            style={getHoverButtonStyle(collapseHover.isHovered)}
            title={collapsed ? 'Expand Inspector' : 'Collapse Inspector'}
          >
            {collapsed ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>
      </div>

      {/* Content with smooth animations */}
      {!collapsed && (
        <AnimatedElement 
          animationType="slide" 
          duration={animationDurations.panel}
          delay={50}
          isVisible={!collapsed}
          style={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column',
            overflow: 'hidden' 
          }}
        >
          <div style={{ 
            flex: 1, 
            overflow: 'auto',
            padding: '0 4px'
          }}>
            <PropertiesSection 
              node={node} 
              schema={schema} 
              onChange={onChange}
            />
          </div>
          
          <AnimatedElement 
            animationType="fade" 
            duration={animationDurations.normal}
            delay={200}
            isVisible={!collapsed}
          >
            <PreviewSection node={node} />
          </AnimatedElement>
        </AnimatedElement>
      )}

      {/* Enhanced resize handle with visual feedback */}
      <div
        ref={resizeRef}
        onMouseDown={handleMouseDown}
        style={{
          position: 'absolute',
          left: -3,
          top: 0,
          bottom: 0,
          width: 6,
          cursor: 'col-resize',
          background: 'transparent',
          zIndex: 20,
          borderRadius: '0 3px 3px 0'
        }}
        className="smooth-transition"
      />

      {/* Visual resize indicator */}
      <div
        style={{
          position: 'absolute',
          left: -1,
          top: 0,
          bottom: 0,
          width: 2,
          background: isResizing 
            ? 'linear-gradient(180deg, #3b82f6, #1d4ed8)' 
            : 'transparent',
          boxShadow: isResizing ? '0 0 8px rgba(59, 130, 246, 0.5)' : 'none',
          ...createSmoothTransition(
            ['background', 'box-shadow'], 
            animationDurations.fast
          )
        }}
      />

      {/* Subtle glow effect when active */}
      {(node && !collapsed) && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.02) 0%, transparent 50%)',
            pointerEvents: 'none',
            opacity: isResizing ? 1 : 0,
            ...createSmoothTransition(['opacity'], animationDurations.normal)
          }}
        />
      )}
    </aside>
  );
};