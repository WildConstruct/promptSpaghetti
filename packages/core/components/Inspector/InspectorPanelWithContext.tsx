import React, { useCallback, useRef, useEffect } from 'react';
import { PropertiesSection } from './PropertiesSection';
import { PreviewSection } from './PreviewSection';
import { useInspectorContext } from './InspectorContext';
interface InspectorPanelWithContextProps {
  onClose?: () => void;
  minWidth?: number;
  maxWidth?: number;
}

export const InspectorPanelWithContext: React.FC<InspectorPanelWithContextProps> = ({
  onClose,
  minWidth = 280,
  maxWidth = 600
}) => {
  const {
    selectedNode,
    selectedSchema,
    panelWidth,
    panelCollapsed,
    panelVisible,
    setPanelWidth,
    setPanelCollapsed,
    updateNodeData
  } = useInspectorContext();
  const [isResizing, setIsResizing] = React.useState(false);
  const resizeRef = useRef<HTMLDivElement>(null);
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    const newWidth = window.innerWidth - e.clientX;
    const clampedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
    setPanelWidth(clampedWidth);
  }, [isResizing, minWidth, maxWidth, setPanelWidth]);
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
  const handleChange = (partial: Record<string, unknown>) => {
    if (selectedNode) {
      updateNodeData(selectedNode.id, partial);
    }
  };
  if (!panelVisible) {
    return null;
  }
  if (!selectedNode || !selectedSchema) {
    return (
  <aside
  style={{
  width: panelCollapsed ? 40 : panelWidth,
  minWidth: panelCollapsed ? 40 : minWidth,
  borderLeft: '1px solid #4a5568',
  background: '#1a202c',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: panelCollapsed ? 'width 0.2s ease' : 'none',
}}
      >
        <div
          style={{
  padding: '12px 16px',
  borderBottom: '1px solid #4a5568',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  background: '#2d3748',
}}
        >
          {!panelCollapsed && (
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>
              Inspector
            </h3>
          )}
          <button
            onClick={() => setPanelCollapsed(!panelCollapsed)}
            style={{
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: 16,
  color: '#a0aec0',
  padding: 4,
}}
            title={panelCollapsed ? 'Expand Inspector' : 'Collapse Inspector'}
          >
            {panelCollapsed ? '◀' : '▶'}
          </button>
        </div>
        {!panelCollapsed && (
          <div style={{
  padding: 16,
  color: '#a0aec0',
  fontStyle: 'italic',
  textAlign: 'center',
  marginTop: 40,
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
  zIndex: 10,
}}
        />
      </aside>
    );
  return (
    <aside
      style={{
  width: panelCollapsed ? 40 : panelWidth,
  minWidth: panelCollapsed ? 40 : minWidth,
  borderLeft: '1px solid #4a5568',
  background: '#1a202c',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: panelCollapsed ? 'width 0.2s ease' : 'none',
}}
    >
      <div
        style={{
  padding: '12px 16px',
  borderBottom: '1px solid #4a5568',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  background: '#2d3748',
}}
      >
        {!panelCollapsed && (
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>
            {selectedNode.data?.label || selectedNode.type} Inspector
          </h3>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {!panelCollapsed && onClose && (
            <button
              onClick={onClose}
              style={{
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: 16,
  color: '#a0aec0',
  padding: 4,
}}
              title="Close Inspector"
            >
              ✕
            </button>
          )}
          <button
            onClick={() => setPanelCollapsed(!panelCollapsed)}
            style={{
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: 16,
  color: '#a0aec0',
  padding: 4,
}}
            title={panelCollapsed ? 'Expand Inspector' : 'Collapse Inspector'}
          >
            {panelCollapsed ? '◀' : '▶'}
          </button>
        </div>
      </div>
      {!panelCollapsed && (
        <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
          <PropertiesSection
            node={selectedNode}
            schema={selectedSchema}
            onChange={handleChange}
          />
          <PreviewSection
            node={selectedNode}
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
  zIndex: 10,
}}
      />
    </aside>
  );
};