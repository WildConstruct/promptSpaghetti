import React, { useState, useRef, useEffect, useCallback } from "react";
import { ZodSchema, ZodTypeAny } from "zod";
import { CollapsibleSection } from "./CollapsibleSection";
import { VariationList } from "./VariationList";

export interface PropertiesSectionProps {
  node: any;
  schema: ZodSchema<any>;
  onChange: (partial: Record<string, unknown>) => void;
}

export const PropertiesSection: React.FC<PropertiesSectionProps> = ({
  node,
  schema,
  onChange,
}) => {
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [commonPropsCollapsed, setCommonPropsCollapsed] = useState(false);
  const [specificPropsCollapsed, setSpecificPropsCollapsed] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const uncontrolledTestRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (node) {
      setValues({ ...node.data });
      setFieldErrors({});
    }
  }, [node]);

  const updateField = (key: string, val: unknown) => {
    const newVals = { ...values, [key]: val };
    setValues(newVals);

    // Validate single field via schema
    if (schema) {
      const fieldSchema: any = (schema as any).shape?.[key] ?? (schema as any)._def?.shape?.()[key];
      if (fieldSchema) {
        const parsed = fieldSchema.safeParse(val);
        setFieldErrors((prev) => ({
          ...prev,
          [key]: parsed.success ? "" : parsed.error.issues[0]?.message || "Invalid"
        }));
      }
    }

    // Debounced onChange call
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onChange({ [key]: val });
    }, 300);
  };

  // Extract schema shape
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

  // Separate common properties from node-specific ones
  const commonProps = ['label'];
  const variationProps = ['variations'];
  const commonFields = Object.entries(shape).filter(([key]) => commonProps.includes(key));
  const specificFields = Object.entries(shape).filter(([key]) => !commonProps.includes(key) && !variationProps.includes(key));

  const renderField = ([key, zodType]: [string, ZodTypeAny]) => {
    const value = values[key] ?? "";
    const error = fieldErrors[key];
    
    return (
      <div key={key} style={{ marginBottom: 16 }}>
        <label
          htmlFor={`field-${key}`}
          style={{
            display: "block",
            fontSize: 12,
            fontWeight: 600,
            marginBottom: 4,
            color: "#e2e8f0",
            textTransform: "capitalize",
          }}
        >
          {key.replace(/([A-Z])/g, ' $1').trim()}
        </label>
        <input
          id={`field-${key}`}
          type={(zodType as any)._def?.typeName === "ZodNumber" ? "number" : "text"}
          value={String(values[key] ?? "")}
          onChange={(e) => {
            e.stopPropagation(); // Prevent React Flow from capturing the event
            console.log('Input change event:', key, e.target.value); // Debug logging
            const newValue = (zodType as any)._def?.typeName === "ZodNumber" 
              ? Number(e.target.value) 
              : e.target.value;
            // Update local state immediately for responsive UI
            setValues(prev => ({ ...prev, [key]: newValue }));
            updateField(key, newValue);
          }}
          onKeyDown={(e) => {
            e.stopPropagation(); // Prevent React Flow keyboard handling
          }}
          onFocus={(e) => {
            e.stopPropagation();
            e.target.style.borderColor = "#4CAF50";
            console.log('FOCUS: Field focused', key);
          }}
          onBlur={(e) => {
            e.stopPropagation();
            e.target.style.borderColor = error ? "#ef4444" : "#4a5568";
            console.log('BLUR: Field blurred', key);
          }}
          style={{
            width: "100%",
            padding: "8px 12px",
            border: error ? "1px solid #ef4444" : "1px solid #4a5568",
            borderRadius: 6,
            fontSize: 14,
            background: "#2d3748",
            color: "#e2e8f0",
            outline: "none",
            transition: "border-color 0.2s",
            pointerEvents: "auto",
            userSelect: "text",
            WebkitUserSelect: "text",
          }}
        />
        {error && (
          <div style={{
            color: "#ef4444",
            fontSize: 12,
            marginTop: 4,
            fontWeight: 500,
          }}>
            {error}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {/* DEBUG TEST INPUT */}
      <div style={{ padding: "16px 20px 8px", background: "#2d3748", margin: "8px", borderRadius: 4 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4, color: "#e2e8f0" }}>
          DEBUG Test Input:
        </label>
        <input
          type="text"
          placeholder="Can you type here?"
          style={{
            width: "100%",
            padding: "8px 12px",
            border: "1px solid #4a5568",
            borderRadius: 6,
            fontSize: 14,
            background: "#374151",
            color: "#e2e8f0",
            outline: "none",
          }}
          onFocus={(e) => {
            console.log('DEBUG: Test input focused');
            e.target.style.borderColor = "#4CAF50";
          }}
          onBlur={(e) => {
            console.log('DEBUG: Test input blurred');
            e.target.style.borderColor = "#4a5568";
          }}
          onChange={(e) => {
            console.log('DEBUG: Test input changed:', e.target.value);
          }}
        />
        
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4, color: "#e2e8f0", marginTop: 12 }}>
          UNCONTROLLED Test Input (with ref):
        </label>
        <input
          ref={uncontrolledTestRef}
          type="text"
          placeholder="Try typing here (uncontrolled)"
          style={{
            width: "100%",
            padding: "8px 12px",
            border: "1px solid #4a5568",
            borderRadius: 6,
            fontSize: 14,
            background: "#374151",
            color: "#e2e8f0",
            outline: "none",
          }}
          onFocus={(e) => {
            console.log('DEBUG: Uncontrolled input focused');
            e.target.style.borderColor = "#4CAF50";
          }}
          onBlur={(e) => {
            console.log('DEBUG: Uncontrolled input blurred');
            e.target.style.borderColor = "#4a5568";
          }}
          onChange={(e) => {
            console.log('DEBUG: Uncontrolled input changed:', e.target.value);
          }}
        />
      </div>
      
      {commonFields.length > 0 && (
        <CollapsibleSection
          title="Common Properties"
          collapsed={commonPropsCollapsed}
          onToggle={() => setCommonPropsCollapsed(!commonPropsCollapsed)}
        >
          <div style={{ padding: "16px 20px 8px" }}>
            {commonFields.map(renderField)}
          </div>
        </CollapsibleSection>
      )}

      {specificFields.length > 0 && (
        <CollapsibleSection
          title={`${node.type} Properties`}
          collapsed={specificPropsCollapsed}
          onToggle={() => setSpecificPropsCollapsed(!specificPropsCollapsed)}
        >
          <div style={{ padding: "16px 20px 8px" }}>
            {specificFields.map(renderField)}
          </div>
        </CollapsibleSection>
      )}

      <CollapsibleSection
        title="Text Variations"
        collapsed={false}
        onToggle={() => {}}
      >
        <div style={{ padding: "16px 20px 8px" }}>
          <VariationList
            nodeId={node.id}
            variations={values.variations as string[] || []}
            placeholder="Add a text variation..."
            allowQuickEntry={true}
          />
        </div>
      </CollapsibleSection>
    </div>
  );
};