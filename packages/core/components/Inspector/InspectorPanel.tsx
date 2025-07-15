import React, { useState, useCallback, useRef, useEffect } from "react";
import { ZodSchema } from "zod";
import { PropertiesSection } from "./PropertiesSection";
import { PreviewSection } from "./PreviewSection";

export interface InspectorPanelProps {
  node: any | null;
  schema: ZodSchema<any> | null;
  onChange: (partial: Record<string, unknown>) => void;
  onClose?: () => void;
  initialWidth?: number;
  minWidth?: number;
  maxWidth?: number;
}

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
  node,
  schema,
  onChange,
  onClose,
  initialWidth = 320,
  minWidth = 280,
  maxWidth = 600,
}) => {
  const [width, setWidth] = useState(initialWidth);
  const [isResizing, setIsResizing] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const resizeRef = useRef<HTMLDivElement>(null);

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
          borderLeft: "1px solid #e0e0e0",
          background: "#fafbfc",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          transition: collapsed ? "width 0.2s ease" : "none",
        }}
      >
        <div
          style={{
            padding: "12px 16px",
            borderBottom: "1px solid #e0e0e0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#f5f6f7",
          }}
        >
          {!collapsed && (
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#333" }}>
              Inspector
            </h3>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 16,
              color: "#666",
              padding: 4,
            }}
            title={collapsed ? "Expand Inspector" : "Collapse Inspector"}
          >
            {collapsed ? "◀" : "▶"}
          </button>
        </div>
        {!collapsed && (
          <div style={{ 
            padding: 16, 
            color: "#666", 
            fontStyle: "italic",
            textAlign: "center",
            marginTop: 40
          }}>
            Select a node to edit its properties
          </div>
        )}
        <div
          ref={resizeRef}
          onMouseDown={handleMouseDown}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 4,
            cursor: "col-resize",
            background: "transparent",
            zIndex: 10,
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
        borderLeft: "1px solid #e0e0e0",
        background: "#fafbfc",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: collapsed ? "width 0.2s ease" : "none",
      }}
    >
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid #e0e0e0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#f5f6f7",
        }}
      >
        {!collapsed && (
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#333" }}>
            {node.data?.label || node.type} Inspector
          </h3>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {!collapsed && onClose && (
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 16,
                color: "#666",
                padding: 4,
              }}
              title="Close Inspector"
            >
              ✕
            </button>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 16,
              color: "#666",
              padding: 4,
            }}
            title={collapsed ? "Expand Inspector" : "Collapse Inspector"}
          >
            {collapsed ? "◀" : "▶"}
          </button>
        </div>
      </div>

      {!collapsed && (
        <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column" }}>
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
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          cursor: "col-resize",
          background: "transparent",
          zIndex: 10,
        }}
      />
    </aside>
  );
};