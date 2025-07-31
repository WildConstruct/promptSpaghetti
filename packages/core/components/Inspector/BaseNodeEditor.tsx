import React from 'react';
import { ZodSchema, ZodTypeAny } from 'zod';
import { shouldShowField, classifyField } from '../../stores/uiSettingsStore';

// Convert technical error messages to filmmaker-friendly language
const getFilmmakerFriendlyError = (message: string): string => {
  const errorMappings: Record<string, string> = {,
  'Required': 'This field is required',
  'String must contain at least 1 character(s)': 'Please enter some text',
  'Number must be greater than 0': 'Please enter a positive number',
  'Invalid enum value': 'Please select a valid option',
  'Expected string, received number': 'Please enter text, not a number',
  'Expected number, received string': 'Please enter a number',
  'Array must contain at least 1 element(s)': 'Please add at least one item',
  'Invalid': 'Please check this value',
  'node': 'element',
  'Node': 'Element',
  'property': 'setting',
  'Property': 'Setting',
  'configuration': 'setup',
  'Configuration': 'Setup',
  'parameter': 'option',
  'Parameter': 'Option',
  'schema': 'format',
  'Schema': 'Format',
};
  // Performance optimization: use a single pass replacement
  let friendlyMessage = message;
  Object.entries(errorMappings).forEach(([technical, friendly]) => {
    friendlyMessage = friendlyMessage.replace(new RegExp(technical, 'gi'), friendly);
  });
  return friendlyMessage;
};

}
export interface BaseNodeEditorProps {
  nodeId: string;
  nodeData: Record<string, unknown>;
  schema: ZodSchema<unknown>;
  onChange: (partial: Record<string, unknown>) => void;
  className?: string;
  children?: React.ReactNode;
}
}
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
}
export const BaseNodeEditor: React.FC<BaseNodeEditorProps> = ({)
  nodeId,
  nodeData,
  schema,
  onChange,
  className = '',
  children
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
        const fieldSchema: unknown = ()
          schema as { shape?: Record<string,
          unknown> }
        ).shape?.[key] ?? (schema as { _def?: { shape?: () => Record<string, unknown> } })._def?.shape?.()[key];
        if (fieldSchema) {
  const parsed = fieldSchema.safeParse(val);
  setFieldErrors((prev) => ({ )
  ...prev,
  [key]: parsed.success ? '' : getFilmmakerFriendlyError(parsed.error.issues[0]?.message ?? 'Invalid value'),
}));
      } catch (error) {
        console.warn('Error validating field:', key, error);
    // Call parent onChange
    onChange({ [key]: val });
  };
  const getFieldSchema = (key: string): ZodTypeAny | null => {
    if (!schema) return null;
    try {
      const shape: unknown = (schema as { shape?: Record<string, unknown> }).shape;
      if (typeof shape === 'function') {
        return (shape() as Record<string, unknown>)[key] ?? null;
      } else if (shape) {
        return shape[key] ?? null;
      } else if ((schema as { _def?: { shape?: unknown } })._def?.shape) {
        const s = (schema as { _def: { shape: unknown } })._def.shape;
        const shapeObj = typeof s === 'function' ? s() : s;
        return (shapeObj as Record<string, unknown>)[key] ?? null;
    } catch (error) {
  console.warn('Error getting field schema:', key, error);
  return null;
};
  const renderField = (key: string): React.ReactNode => {
  const zodType = getFieldSchema(key);
  if (!zodType) return null;
  const fieldProps: EditorFieldProps = {,
  label: key,
  value: values[key],
  fieldKey: key,
  zodType,
  error: fieldErrors[key],
  onChange: (value) => updateField(key, value),
};
    // Allow custom field rendering via children
    if (children && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement, {)
  key,
        ...fieldProps
      });
    // Default field rendering (basic input)
    return;
      <div key={key} style={{ marginBottom: 12 }}>
        <label 
          htmlFor={`field-${nodeId}-${key}`} }
          style={{
  display: 'block',
  fontWeight: 500,
  marginBottom: 4,
  color: '#e2e8f0',
  fontSize: 12,
}}
        >
          {key}
        </label>
        <input
          id={`field-${nodeId}-${key}`}
          type={(zodType as { _def?: { typeName?: string } })._def?.typeName === 'ZodNumber' ? 'number' : 'text'}
          value={String(fieldProps.value ?? '')}
          onChange={(e) => {
            const isNumber = (zodType as { _def?: { typeName?: string } })._def?.typeName === 'ZodNumber';
            updateField(key, isNumber ? Number(e.target.value) : e.target.value);
          }}
          style={{
  width: '100%',
  padding: 6,
  border: fieldErrors[key] ? '1px solid #f56565' : '1px solid #4a5568',
  borderRadius: 4,
  background: '#2d3748',
  color: '#e2e8f0',
  fontSize: 12,
}}
          placeholder={`Enter ${key}...`}
        />
        {fieldErrors[key] && ()
          <div style={{
  color: '#f56565',
  fontSize: 10,
  marginTop: 2,
}}>
            {fieldErrors[key]}
          </div>
        )}
      </div>
    );
  };
  // Get all field keys from schema, filtered by UI settings
  const getFieldKeys = (): string => {
    if (!schema) return [];
    try {
      let shape: Record<string, ZodTypeAny> = {};
      if ((schema as { shape?: Record<string, unknown> }).shape) {
        const maybeShape: unknown = (schema as { shape: Record<string, unknown> }).shape;
        if (typeof maybeShape === 'function') {
          shape = maybeShape();
        } else if (maybeShape) {
          shape = maybeShape;
      } else if ((schema as { _def?: { shape?: unknown } })._def?.shape) {
        const s = (schema as { _def: { shape: unknown } })._def.shape;
        shape = typeof s === 'function' ? s() : s;
      const allKeys = Object.keys(shape);
      // Filter keys based on UI settings (hide technical fields unless in debug mode)
      return allKeys.filter(key => {)
  const fieldType = classifyField(key);
        return shouldShowField(key, fieldType);
      });
    } catch (error) {
  console.warn('Error getting field keys:', error);
  return [];
};
  const fieldKeys = getFieldKeys();
  return;
    <div className={`base-node-editor ${className}`}>}
      {fieldKeys.length > 0 ? ()
        fieldKeys.map(renderField)
      ) : ()
        <div style={{
  color: '#a0aec0',
  fontStyle: 'italic',
  textAlign: 'center',
  padding: 16,
  fontSize: 12,
}}>
          No editable properties found
        </div>
      )}
    </div>
  );
};

export default BaseNodeEditor;