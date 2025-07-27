/**
 * FormField - Reusable field wrapper with consistent styling
 * REFACTOR-002: Admin Dashboard Architecture Consolidation
 * 
 * Handles all form field types with validation and consistent UX
 */

import React from 'react';
import { Eye, EyeOff, AlertCircle, HelpCircle } from 'lucide-react';
import { FormFieldSchema } from './AdminFormBuilder';

interface FormFieldProps {
  field: FormFieldSchema;
  value: any;
  error?: string;
  onChange: (value: any) => void;
  onBlur: () => void;
  showPassword?: boolean;
  onTogglePassword?: () => void;
  disabled?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({
  field,
  value,
  error,
  onChange,
  onBlur,
  showPassword = false,
  onTogglePassword,
  disabled = false
}) => {
  const fieldId = `field-${field.name}`;
  const hasError = Boolean(error);

  const renderInput = () => {
    const baseProps = {
      id: fieldId,
      name: field.name,
      disabled,
      onBlur,
      className: `form-input ${hasError ? 'error' : ''}`
    };

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            {...baseProps}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            rows={field.rows || 3}
          />
        );

      case 'select':
        return (
          <select
            {...baseProps}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
          >
            {field.placeholder && (
              <option value="" disabled>
                {field.placeholder}
              </option>
            )}
            {field.options?.map((option) => (
              <option 
                key={option.value} 
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'multiselect':
        return (
          <select
            {...baseProps}
            multiple
            value={Array.isArray(value) ? value : []}
            onChange={(e) => {
              const selectedValues = Array.from(e.target.selectedOptions, option => option.value);
              onChange(selectedValues);
            }}
          >
            {field.options?.map((option) => (
              <option 
                key={option.value} 
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <label className="checkbox-wrapper">
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => onChange(e.target.checked)}
              disabled={disabled}
              onBlur={onBlur}
            />
            <span className="checkbox-label">{field.label}</span>
          </label>
        );

      case 'radio':
        return (
          <div className="radio-group">
            {field.options?.map((option) => (
              <label key={option.value} className="radio-wrapper">
                <input
                  type="radio"
                  name={field.name}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => onChange(e.target.value)}
                  disabled={disabled || option.disabled}
                  onBlur={onBlur}
                />
                <span className="radio-label">{option.label}</span>
              </label>
            ))}
          </div>
        );

      case 'file':
        return (
          <input
            {...baseProps}
            type="file"
            onChange={(e) => {
              const files = e.target.files;
              onChange(field.multiple ? Array.from(files || []) : files?.[0] || null);
            }}
            accept={field.accept}
            multiple={field.multiple}
          />
        );

      case 'password':
        return (
          <div className="password-input-wrapper">
            <input
              {...baseProps}
              type={showPassword ? 'text' : 'password'}
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={field.placeholder}
            />
            {onTogglePassword && (
              <button
                type="button"
                onClick={onTogglePassword}
                className="password-toggle"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            )}
          </div>
        );

      case 'number':
        return (
          <input
            {...baseProps}
            type="number"
            value={value || ''}
            onChange={(e) => onChange(e.target.value ? Number(e.target.value) : '')}
            placeholder={field.placeholder}
            min={field.validation?.min}
            max={field.validation?.max}
          />
        );

      case 'email':
        return (
          <input
            {...baseProps}
            type="email"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
          />
        );

      case 'date':
      case 'datetime-local':
        return (
          <input
            {...baseProps}
            type={field.type}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
          />
        );

      default:
        return (
          <input
            {...baseProps}
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
          />
        );
    }
  };

  // Don't render label for checkbox since it's handled in the input
  const shouldRenderLabel = field.type !== 'checkbox';

  return (
    <div className={`form-field ${field.type === 'checkbox' ? 'checkbox-field' : ''}`}>
      {shouldRenderLabel && (
        <label htmlFor={fieldId} className="form-label">
          {field.label}
          {field.required && <span className="required-asterisk">*</span>}
          {field.help && (
            <div className="help-tooltip">
              <HelpCircle size={14} />
              <div className="tooltip-content">{field.help}</div>
            </div>
          )}
        </label>
      )}

      <div className="form-input-wrapper">
        {renderInput()}
      </div>

      {/* Error Message */}
      {error && (
        <div className="form-error">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}

      {/* Help Text */}
      {field.help && field.type !== 'checkbox' && (
        <div className="form-help">
          {field.help}
        </div>
      )}
    </div>
  );
};

export default FormField;