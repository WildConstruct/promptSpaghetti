import React from "react";
import { ZodSchema, ZodTypeAny } from "zod";

/**
 * InspectorSidebar
 * Renders a dynamic form for the selected node using a provided Zod schema.
 * Props:
 * - node: The selected node object (or null if none selected)
 * - schema: Zod schema describing the form fields for this node type
 * - onChange: Callback when form values change (debounced)
 */
export interface InspectorSidebarProps {
  node: any | null;
  schema: ZodSchema<any> | null;
  onChange: (partial: Record<string, unknown>) => void;
}

export const InspectorSidebar: React.FC<InspectorSidebarProps> = ({ node, schema, onChange }) => {
  if (!node || !schema) {
    return (
      <aside style={{ padding: 16, width: 320, borderLeft: "1px solid #eee", background: "#fafbfc", height: "100%" }}>
        <em>Select a node to edit its properties.</em>
      </aside>
    );
  }

  // Generate form fields from schema (support different Zod versions)
  let shape: Record<string, ZodTypeAny> = {};
  if (schema) {
    const maybeShape: any = (schema as any).shape;
    if (typeof maybeShape === 'function') {
      try {
        shape = maybeShape();
      } catch {
        shape = {} as any;
      }
    } else if (maybeShape) {
      shape = maybeShape;
    } else if ((schema as any)._def?.shape) {
      const s = (schema as any)._def.shape;
      shape = typeof s === 'function' ? s() : s;
    }
  }

  return (
    <aside style={{ padding: 16, width: 320, borderLeft: "1px solid #eee", background: "#fafbfc", height: "100%" }}>
      <h3 style={{ marginTop: 0 }}>{node.data?.label || node.type} Properties</h3>
      <form>
        {Object.entries(shape).map(([key, zodType]) => {
          const value = node.data?.[key] ?? "";
          // Render basic input for string/number; customize per type as needed
          return (
            <div key={key} style={{ marginBottom: 12 }}>
              <label htmlFor={`field-${key}`} style={{ display: "block", fontWeight: 500, marginBottom: 4 }}>{key}</label>
              <input
                id={`field-${key}`}
                type={zodType._def.typeName === "ZodNumber" ? "number" : "text"}
                value={value}
                onChange={e => onChange({ [key]: zodType._def.typeName === "ZodNumber" ? Number(e.target.value) : e.target.value })}
                style={{ width: "100%", padding: 6, border: "1px solid #ccc", borderRadius: 4 }}
              />
            </div>
          );
        })}
      </form>
    </aside>
  );
};
