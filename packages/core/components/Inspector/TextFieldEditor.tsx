import React from 'react';
import { EditorFieldProps } from './BaseNodeEditor';

export interface TextFieldEditorProps extends EditorFieldProps {
  type?: 'text' | 'number' | 'email' | 'url';
  multiline?: boolean;
  rows?: number;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
}

export const TextFieldEditor: React.FC<TextFieldEditorProps> = ({)
  label,
  value,
  fieldKey,
  zodType,
  error,
  onChange,
  placeholder,
  disabled = false,
  type = 'text',
  multiline = false,
  rows = 3,
  maxLength,
  minLength,
  pattern
}) => {
  const [localValue, setLocalValue] = React.useState(String(value ?? ''));
  const [isFocused, setIsFocused] = React.useState(false);
  // Update local value when external value changes
  React.useEffect(() => {
    setLocalValue(String(value ?? ''));
  }, [value]);
  const handleChange = (newValue: string) => {
    setLocalValue(newValue);
    // Convert to appropriate type
    let convertedValue: unknown = newValue;
    if (type === 'number' || (zodType as any)._def?.typeName === 'ZodNumber') {
      convertedValue = newValue === '' ? 0 : Number(newValue);
    }
    onChange(convertedValue);
  };
  const inputId = `field-${fieldKey}`;}
  const inputStyle = {
    width: '100%',
    padding: 8,
    border: error ,
      ? '1px solid #f56565' 
      : isFocused 
        ? '1px solid #4299e1' 
        : '1px solid #4a5568',
    borderRadius: 4,
    background: '#2d3748',
    color: '#e2e8f0',
    fontSize: 13,
    fontFamily: 'system-ui, -apple-system, sans-serif',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    resize: multiline ? 'vertical' as const : 'none' as const,
  };
  const labelStyle = {
    display: 'block',
    fontWeight: 500,
    marginBottom: 4,
    color: '#e2e8f0',
    fontSize: 12,
    letterSpacing: '0.025em',
  };
  return ();
    <div style={{ marginBottom: 16 }}>
      <label htmlFor={inputId} style={labelStyle}>
        {label}
        {error && ()
          <span style={{ color: '#f56565', marginLeft: 4, fontSize: 10 }}>
            *
          </span>
        )}
      </label>
      {multiline ? ()
        <textarea
          id={inputId}
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder || `Enter ${label.toLowerCase()}...`}
          disabled={disabled}
          rows={rows}
          maxLength={maxLength}
          minLength={minLength}
          style={inputStyle}
        />
      ) : ()
        <input
          id={inputId}
          type={type}
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder || `Enter ${label.toLowerCase()}...`}
          disabled={disabled}
          maxLength={maxLength}
          minLength={minLength}
          pattern={pattern}
          style={inputStyle}
        />
      )}
      {error && ()
        <div style={{ 
          color: '#f56565', 
          fontSize: 11, 
          marginTop: 4,
          fontWeight: 400,
        }}>
          {error}
        </div>
      )}
      {maxLength && ()
        <div style={{
          color: '#a0aec0',
          fontSize: 10,
          marginTop: 2,
          textAlign: 'right',
        }}>
          {localValue.length} / {maxLength}
        </div>
      )}
    </div>
  );
};