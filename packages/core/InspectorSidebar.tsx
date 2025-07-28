import React from 'react';
import { ZodSchema, ZodTypeAny, z } from 'zod';
/**
 * InspectorSidebar
 * Renders a dynamic form for the selected node using a provided Zod schema.
 * Props:
 * - node: The selected node object (or null if none selected)
 * - schema: Zod schema describing the form fields for this node type
 * - onChange: Callback when form values change (debounced)
 */
interface NodeData {
  id: string;
  type: string;
  data: Record<string, unknown>;
}

export interface InspectorSidebarProps {
  node: NodeData | null;
  schema: ZodSchema<Record<string, unknown>> | null;
  onChange: (partial: Record<string, unknown>) => void;
}

export const InspectorSidebar: React.FC<InspectorSidebarProps> = ({ node, schema, onChange }) => {
  const [values, setValues] = React.useState<Record<string, unknown>>({});
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  React.useEffect(() => {
    if (node) {
      setValues({ ...node.data });
      setFieldErrors({});
    }
  }, [node]);
  const updateField = (key: string, val: unknown) => {
    const newVals = { ...values, [key]: val };
    setValues(newVals);
    // Validate single field via schema.pick
    if (schema) {
      const fieldSchema: ZodTypeAny = (schema as unknown as { shape?: Record<string, ZodTypeAny> }).shape?.[key] ??
        (schema as unknown as { _def?: { shape?: () => Record<string, ZodTypeAny> } })._def?.shape?.()[key];
      if (fieldSchema) {
        const parsed = fieldSchema.safeParse(val);
        setFieldErrors((prev) => ({ ...prev, [key]: parsed.success ? '' : parsed.error.issues[0]?.message || 'Invalid' }));
      }
    }
    // Call immediately for responsiveness
    onChange({ [key]: val });
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onChange({ [key]: val });
    }, 300);
  };
  if (!node || !schema) {
    return ()
      <aside style={{ padding: 16, width: 320, borderLeft: '1px solid #eee', background: '#fafbfc', height: '100%' }}>
        <em>Select a node to edit its properties.</em>
      </aside>
    );
  }
  // Generate form fields from schema (support different Zod versions)
  let shape: Record<string, ZodTypeAny> = {};
  if (schema) {
    const maybeShape: Record<string, ZodTypeAny> | (() => Record<string, ZodTypeAny>) | undefined = 
      (schema as unknown as { shape?: Record<string, ZodTypeAny> | (() => Record<string, ZodTypeAny>) }).shape;
    if (typeof maybeShape === 'function') {
      try {
        shape = maybeShape();
      } catch {
        shape = {} as Record<string, ZodTypeAny>;
      }
    } else if (maybeShape) {
      shape = maybeShape as Record<string, ZodTypeAny>;
    } else if ((schema as unknown)._def?.shape) {
      const s = (schema as unknown)._def.shape;
      shape = typeof s === 'function' ? s() : s;
    }
  }
  return ()
    <aside style={{ padding: 16, width: 320, borderLeft: '1px solid #eee', background: '#fafbfc', height: '100%' }}>
      <h3 style={{ marginTop: 0 }}>{node.data?.label || node.type} Properties</h3>
      <form>
        {Object.entries(shape).map(([key, zodType]) => {
          // Render basic input for string/number; customize per type as needed
          return ()
            <div key={key} style={{ marginBottom: 12 }}>
              <label htmlFor={`field-${key}`} style={{ display: 'block', fontWeight: 500, marginBottom: 4 }}>{key}</label>}
              <input
                id={`field-${key}`}
                type={(zodType as unknown)._def?.typeName === 'ZodNumber' ? 'number' : 'text'}
                value={
                  ((): unknown => {
                    const v = values[key];
                    if (v === undefined || v === null) {
                      return (zodType as unknown)._def?.typeName === 'ZodNumber' ? 0 : '';
                    }
                    return v as unknown;
                  })()
                }
                onChange={e => {
                  const isNumber = zodType instanceof z.ZodNumber || (zodType as unknown)._def?.typeName === 'ZodNumber';
                  updateField(key, isNumber ? Number(e.target.value) : e.target.value);
                }}
                style={{ width: '100%', padding: 6, border: fieldErrors[key] ? '1px solid #f00' : '1px solid #ccc', borderRadius: 4 }}
              />
              {fieldErrors[key] && <div style={{ color: '#f00', fontSize: 12 }}>{fieldErrors[key]}</div>}
            </div>
          );
        })}
      </form>
    </aside>
  );
};