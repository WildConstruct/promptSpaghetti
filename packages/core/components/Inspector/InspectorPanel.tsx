import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ZodSchema } from 'zod';
import { PropertiesSection } from './PropertiesSection';
import { PreviewSection } from './PreviewSection';
import { PreferenceControls } from './PreferenceControls';
import { useUISettingsStore } from '../../stores/uiSettingsStore';
import { useNodeDisclosure } from '../../hooks/useNodeDisclosure';

// Map technical node types to filmmaker-friendly names
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

export interface InspectorPanelProps {
  node: any | null;
  schema: ZodSchema<any> | null;
  onChange: (partial: Record<string, unknown>) => void;
  onClose?: () => void;
  initialWidth?: number;
  minWidth?: number;
  maxWidth?: number;
}

export   const [isResizing, setIsResizing] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const resizeRef = useRef<HTMLDivElement>(null);
  const { 
    debugMode, 
    setDebugMode, 
    shouldShowTechnicalFields,
    complexityLevel,
    setComplexityLevel,
    shouldShowAdvancedFeatures,
    globalDisclosureLevel,
    setGlobalDisclosureLevel
  } = useUISettingsStore();
  
  const nodeId = node?.id;
  const nodeType = node?.data?.nodeType || node?.type;

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

  if (!node || !schema) {
    return (
      <aside
        style={{
          width: collapsed ? 40 : width,
          minWidth: collapsed ? 40 : minWidth,
          borderLeft: '1px solid #4a5568',
          background: '#1a202c',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: collapsed ? 'width 0.2s ease' : 'none'
        }}
        onKeyDown={(e) => {
          e.stopPropagation();
        }}
        onKeyUp={(e) => {
          e.stopPropagation();
        }}
        onKeyPress={(e) => {
          e.stopPropagation();
        }}
      >
        <div
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid #4a5568',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#2d3748'
          }}
        >
          {!collapsed && (
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>
              Inspector
            </h3>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 16,
              color: '#a0aec0',
              padding: 4
            }}
            title={collapsed ? 'Expand Inspector' : 'Collapse Inspector'}
          >
            {collapsed ? '◀' : '▶'}
          </button>
        </div>
        {!collapsed && (
          <div style={{ 
            padding: 16, 
            color: '#a0aec0', 
            fontStyle: 'italic',
            textAlign: 'center',
            marginTop: 40
          }}>
            Select a node to edit its properties
          </div>
        )}
        <div
          ref={resizeRef}
          onMouseDown={handleMouseDown}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 4,
            cursor: 'col-resize',
            background: 'transparent',
            zIndex: 10
          }}
        />
      </aside>
    );
  }

  return (
    <aside
      style={{
        width: collapsed ? 40 : width,
        minWidth: collapsed ? 40 : minWidth,
        borderLeft: '1px solid #4a5568',
        background: '#1a202c',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: collapsed ? 'width 0.2s ease' : 'none'
      }}
      onKeyDown={(e) => {
        e.stopPropagation();
      }}
      onKeyUp={(e) => {
        e.stopPropagation();
      }}
      onKeyPress={(e) => {
        e.stopPropagation();
      }}
    >
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid #4a5568',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#2d3748'
        }}
      >
        {!collapsed && (
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>
            <span style={{ color: '#4CAF50' }}>🔍</span> {node.data?.label || getFilmmakerFriendlyName(node.data?.nodeType || node.type)} Properties
          </h3>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <select
                value={complexityLevel}
                onChange={(e) => setComplexityLevel(e.target.value as 'basic' | 'advanced' | 'expert')}
                style={{
                  background: '#2d3748',
                  border: '1px solid #4a5568',
                  borderRadius: 4,
                  color: '#e2e8f0',
                  fontSize: 10,
                  padding: '2px 4px',
                  cursor: 'pointer'
                }}
                title="Choose interface complexity level"
              >
                <option value="basic">🎭 Basic</option>
                <option value="advanced">⚡ Advanced</option>
                <option value="expert">👨‍💻 Debug</option>
              </select>
              <div
                style={{
                  fontSize: 8,
                  color: '#a0aec0',
                  fontWeight: 500,
                  padding: '1px 4px',
                  background: 
                    complexityLevel === 'basic' ? '#22543d' : 
                    complexityLevel === 'advanced' ? '#2a4365' : '#553c9a',
                  borderRadius: 2,
                  display: 'inline-block',
                  minWidth: 40,
                  textAlign: 'center'
                }}
                title={
                  complexityLevel === 'basic' ? 'Basic: Essential fields only' :
                  complexityLevel === 'advanced' ? 'Advanced: Power user options' :
                  'Debug: All technical details'
                }
              >
                {complexityLevel === 'basic' ? 'BASIC' : 
                 complexityLevel === 'advanced' ? 'ADV' : 'DBG'}
              </div>
              <button
                onClick={() => setShowPreferences(!showPreferences)}
                style={{
                  background: showPreferences ? '#4299e1' : 'transparent',
                  border: '1px solid #4a5568',
                  borderRadius: 3,
                  color: showPreferences ? 'white' : '#a0aec0',
                  fontSize: 10,
                  padding: '2px 6px',
                  cursor: 'pointer',
                  marginLeft: 4
                }}
                title="Configure disclosure preferences"
              >
                ⚙️
              </button>
            </div>
          )}
          {!collapsed && onClose && (
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 16,
                color: '#a0aec0',
                padding: 4
              }}
              title="Close Inspector"
            >
              ✕
            </button>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 16,
              color: '#a0aec0',
              padding: 4
            }}
            title={collapsed ? 'Expand Inspector' : 'Collapse Inspector'}
          >
            {collapsed ? '◀' : '▶'}
          </button>
        </div>
      </div>

      {!collapsed && (
        <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
          {showPreferences && (
            <div style={{ 
              padding: '0 16px 16px 16px',
              borderBottom: '1px solid #4a5568',
              background: 'rgba(66, 153, 225, 0.05)'
            }}>
              <PreferenceControls
                nodeId={nodeId}
                nodeType={nodeType}
                showNodeSpecificControls={true}
                compact={false}
              />
            </div>
          )}
          <PropertiesSection
            node={node}
            schema={schema}
            onChange={onChange}
          />
          <PreviewSection
            node={node}
          />
        </div>
      )}

      <div
        ref={resizeRef}
        onMouseDown={handleMouseDown}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          cursor: 'col-resize',
          background: 'transparent',
          zIndex: 10
        }}
      />
    </aside>
  );
};