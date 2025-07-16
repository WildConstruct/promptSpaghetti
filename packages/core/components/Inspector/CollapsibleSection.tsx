import React from "react";

export interface CollapsibleSectionProps {
  title: string;
  collapsed: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  collapsed,
  onToggle,
  children,
}) => {
  return (
    <div style={{ borderBottom: "1px solid #4a5568" }}>
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          padding: "12px 16px",
          background: "#374151",
          border: "none",
          borderBottom: collapsed ? "none" : "1px solid #4a5568",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          outline: "none",
          fontSize: 13,
          fontWeight: 600,
          color: "#e2e8f0",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#4a5568";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "#374151";
        }}
      >
        <span>{title}</span>
        <span 
          style={{ 
            transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
            fontSize: 12,
            color: "#a0aec0",
          }}
        >
          ▼
        </span>
      </button>
      {!collapsed && (
        <div
          style={{
            maxHeight: collapsed ? 0 : "1000px",
            overflow: "hidden",
            transition: "max-height 0.2s ease",
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
};