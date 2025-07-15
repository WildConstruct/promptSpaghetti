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
    <div style={{ borderBottom: "1px solid #e5e7eb" }}>
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          padding: "12px 16px",
          background: "#f9fafb",
          border: "none",
          borderBottom: collapsed ? "none" : "1px solid #e5e7eb",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          outline: "none",
          fontSize: 13,
          fontWeight: 600,
          color: "#374151",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#f3f4f6";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "#f9fafb";
        }}
      >
        <span>{title}</span>
        <span 
          style={{ 
            transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
            fontSize: 12,
            color: "#6b7280",
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