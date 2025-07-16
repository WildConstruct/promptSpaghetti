import React from "react";
import { ZodSchema, ZodTypeAny } from "zod";

export interface BaseNodeEditorProps {
  nodeId: string;
  nodeData: Record<string, unknown>;
  schema: ZodSchema<any>;
  onChange: (partial: Record<string, unknown>) => void;
  className?: string;
  children?: React.ReactNode;
}

export interface EditorFieldProps {
  label: string;
  value: unknown;
  fieldKey: string;
  zodType: ZodTypeAny;
  error?: string;
  onChange: (value: unknown) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const BaseNodeEditor: React.FC<BaseNodeEditorProps> = ({
  nodeId,
  nodeData,
  schema,
  onChange,
  className = "",
  children,
}) => {
  const [values, setValues] = React.useState<Record<string, unknown>>(nodeData || {});
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});

  // Update local state when nodeData changes
  React.useEffect(() => {
    setValues(nodeData || {});
    setFieldErrors({});
  }, [nodeData]);

  const updateField = (key: string, val: unknown) => {
    const newVals = { ...values, [key]: val };
    setValues(newVals);

    // Validate single field via schema
    if (schema) {
      try {
        const fieldSchema: any = (schema as any).shape?.[key] ?? (schema as any)._def?.shape?.()[key];
        if (fieldSchema) {
          const parsed = fieldSchema.safeParse(val);
          setFieldErrors((prev) => ({ 
            ...prev, 
            [key]: parsed.success ? "" : parsed.error.issues[0]?.message || "Invalid" 
          }));
        }
      } catch (error) {
        console.warn('Error validating field:', key, error);
      }
    }

    // Call parent onChange
    onChange({ [key]: val });
  };

  const getFieldSchema = (key: string): ZodTypeAny | null => {
    if (!schema) return null;
    
    try {
      const shape: any = (schema as any).shape;
      if (typeof shape === 'function') {
        return shape()[key] || null;
      } else if (shape) {
        return shape[key] || null;
      } else if ((schema as any)._def?.shape) {
        const s = (schema as any)._def.shape;
        const shapeObj = typeof s === 'function' ? s() : s;
        return shapeObj[key] || null;
      }
    } catch (error) {
      console.warn('Error getting field schema:', key, error);
    }
    
    return null;
  };

  const renderField = (key: string): React.ReactNode => {
    const zodType = getFieldSchema(key);
    if (!zodType) return null;

    const fieldProps: EditorFieldProps = {
      label: key,
      value: values[key],
      fieldKey: key,
      zodType,
      error: fieldErrors[key],
      onChange: (value) => updateField(key, value),
    };

    // Allow custom field rendering via children
    if (children && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement, {
        key,
        ...fieldProps,
      });
    }

    // Default field rendering (basic input)
    return (
      <div key={key} style={{ marginBottom: 12 }}>
        <label 
          htmlFor={`field-${nodeId}-${key}`} 
          style={{ 
            display: "block", 
            fontWeight: 500, 
            marginBottom: 4,
            color: "#e2e8f0",
            fontSize: 12,
          }}
        >
          {key}
        </label>
        <input
          id={`field-${nodeId}-${key}`}
          type={(zodType as any)._def?.typeName === "ZodNumber" ? "number" : "text"}
          value={String(fieldProps.value ?? "")}
          onChange={(e) => {
            const isNumber = (zodType as any)._def?.typeName === "ZodNumber";
            updateField(key, isNumber ? Number(e.target.value) : e.target.value);
          }}
          style={{ 
            width: "100%", 
            padding: 6, 
            border: fieldErrors[key] ? "1px solid #f56565" : "1px solid #4a5568", 
            borderRadius: 4,
            background: "#2d3748",
            color: "#e2e8f0",
            fontSize: 12,
          }}
          placeholder={`Enter ${key}...`}
        />
        {fieldErrors[key] && (
          <div style={{ 
            color: "#f56565", 
            fontSize: 10, 
            marginTop: 2 
          }}>
            {fieldErrors[key]}
          </div>
        )}
      </div>
    );
  };

  // Get all field keys from schema
  const getFieldKeys = (): string[] => {
    if (!schema) return [];
    
    try {
      let shape: Record<string, ZodTypeAny> = {};
      
      if ((schema as any).shape) {
        const maybeShape: any = (schema as any).shape;
        if (typeof maybeShape === 'function') {
          shape = maybeShape();
        } else if (maybeShape) {
          shape = maybeShape;
        }
      } else if ((schema as any)._def?.shape) {
        const s = (schema as any)._def.shape;
        shape = typeof s === 'function' ? s() : s;
      }
      
      return Object.keys(shape);
    } catch (error) {
      console.warn('Error getting field keys:', error);
      return [];
    }
  };

  const fieldKeys = getFieldKeys();

  return (
    <div className={`base-node-editor ${className}`}>
      {fieldKeys.length > 0 ? (
        fieldKeys.map(renderField)
      ) : (
        <div style={{ 
          color: "#a0aec0", 
          fontStyle: "italic", 
          textAlign: "center",
          padding: 16,
          fontSize: 12,
        }}>
          No editable properties found
        </div>
      )}
    </div>
  );
};