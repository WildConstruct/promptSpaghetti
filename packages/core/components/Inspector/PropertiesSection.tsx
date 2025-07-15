import React, { useState, useRef, useEffect } from "react";
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
            color: "#333",
            textTransform: "capitalize",
          }}
        >
          {key.replace(/([A-Z])/g, ' $1').trim()}
        </label>
        <input
          id={`field-${key}`}
          type={(zodType as any)._def?.typeName === "ZodNumber" ? "number" : "text"}
          value={
            (() => {
              const v = values[key];
              if (v === undefined || v === null) {
                return (zodType as any)._def?.typeName === "ZodNumber" ? 0 : "";
              }
              return v as any;
            })()
          }
          onChange={(e) => {
            const newValue = (zodType as any)._def?.typeName === "ZodNumber" 
              ? Number(e.target.value) 
              : e.target.value;
            updateField(key, newValue);
          }}
          style={{
            width: "100%",
            padding: "8px 12px",
            border: error ? "1px solid #ef4444" : "1px solid #d1d5db",
            borderRadius: 6,
            fontSize: 14,
            background: "#fff",
            outline: "none",
            transition: "border-color 0.2s",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "#3b82f6";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = error ? "#ef4444" : "#d1d5db";
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