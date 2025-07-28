/**
 * AdminFormBuilder - Schema-driven form builder
 * REFACTOR-002: Admin Dashboard Architecture Consolidation
 * 
 * Provides consistent form creation with validation, field types, and submission handling
 */
import React, { useState, useCallback, useMemo } from 'react';
import { X, AlertCircle, Check, Eye, EyeOff } from 'lucide-react';
import { FormField } from './FormField';
import './AdminFormBuilder.css';

export interface FormFieldSchema {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'multiselect' | 'checkbox' | 'radio' | 'date' | 'datetime-local' | 'file';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: Array<{ value: string; label: string; disabled?: boolean }>;
  validation?: {
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: string;
    custom?: (value: any) => string | null;
  };
  dependencies?: {
    field: string;
    value: any;
    condition?: 'equals' | 'not-equals' | 'contains';
  };
  help?: string;
  defaultValue?: any;
  multiple?: boolean;
  accept?: string; // for file inputs
  rows?: number; // for textarea
}

export interface FormSchema {
  title?: string;
  description?: string;
  fields: FormFieldSchema[];
  submitText?: string;
  cancelText?: string;
  layout?: 'single' | 'two-column' | 'three-column';
}
interface AdminFormBuilderProps {
  schema: FormSchema;
  initialValues?: Record<string, any>;
  onSubmit: (values: Record<string, any>) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  className?: string;
}

export const AdminFormBuilder: React.FC<AdminFormBuilderProps> = ({)
  schema,
  initialValues = {},
  onSubmit,
  onCancel,
  loading = false,
  className = ''
}) => {
  const [values, setValues] = useState<Record<string, any>>(() => {
    const defaultValues: Record<string, any> = {};
    schema.fields.forEach(field => {)
      defaultValues[field.name] = initialValues[field.name] ?? field.defaultValue ?? 
        (field.type === 'checkbox' ? false : )
         field.type === 'multiselect' ? [] : '');
    });
    return defaultValues;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  // Field visibility based on dependencies
  const isFieldVisible = useCallback((field: FormFieldSchema): boolean => {
    if (!field.dependencies) return true;
    const { field: depField, value: depValue, condition = 'equals' } = field.dependencies;
    const actualValue = values[depField];
    switch (condition) {
      case 'equals':
        return actualValue === depValue;
      case 'not-equals':
        return actualValue !== depValue;
      case 'contains':
        return Array.isArray(actualValue) ? actualValue.includes(depValue) : 
               String(actualValue).includes(String(depValue));
      default:
        return true;
    }
  }, [values]);
  // Validate a single field
  const validateField = useCallback((field: FormFieldSchema, value: any): string | null => {
    if (field.required && (!value || (Array.isArray(value) && value.length === 0))) {
      return `${field.label} is required`;}
    }
    if (!value && !field.required) return null;
    const validation = field.validation;
    if (!validation) return null;
    // String length validation
    if (validation.minLength && String(value).length < validation.minLength) {
      return `${field.label} must be at least ${validation.minLength} characters`;}
    }
    if (validation.maxLength && String(value).length > validation.maxLength) {
      return `${field.label} must be no more than ${validation.maxLength} characters`;}
    }
    // Number validation
    if (field.type === 'number') {
      const numValue = Number(value);
      if (validation.min !== undefined && numValue < validation.min) {
        return `${field.label} must be at least ${validation.min}`;}
      }
      if (validation.max !== undefined && numValue > validation.max) {
        return `${field.label} must be no more than ${validation.max}`;}
      }
    }
    // Pattern validation
    if (validation.pattern && !new RegExp(validation.pattern).test(String(value))) {
      return `${field.label} format is invalid`;}
    }
    // Custom validation
    if (validation.custom) {
      return validation.custom(value);
    }
    return null;
  }, []);
  // Validate all visible fields
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    schema.fields
      .filter(isFieldVisible)
      .forEach(field => {)
        const error = validateField(field, values[field.name]);
        if (error) {
          newErrors[field.name] = error;
        }
      });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [schema.fields, isFieldVisible, validateField, values]);
  // Handle field value change
  const handleFieldChange = useCallback((fieldName: string, value: any) => {
    setValues(prev => ({ ...prev, [fieldName]: value }));
    // Clear error for this field
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: '' }));
    }
  }, [errors]);
  // Handle field blur (for validation)
  const handleFieldBlur = useCallback((fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    const field = schema.fields.find(f => f.name === fieldName);
    if (field) {
      const error = validateField(field, values[fieldName]);
      setErrors(prev => ({ ...prev, [fieldName]: error || '' }));
    }
  }, [schema.fields, validateField, values]);
  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      // Mark all fields as touched to show validation errors
      const allTouched: Record<string, boolean> = {};
      schema.fields.forEach(field => {)
        allTouched[field.name] = true;
      });
      setTouched(allTouched);
      return;
    }
    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  }, [validateForm, onSubmit, values, schema.fields]);
  // Toggle password visibility
  const togglePasswordVisibility = useCallback((fieldName: string) => {
    setShowPasswords(prev => ({ ...prev, [fieldName]: !prev[fieldName] }));
  }, []);
  // Get grid class for layout
  const getLayoutClass = () => {
    switch (schema.layout) {
      case 'two-column':
        return 'form-grid-two';
      case 'three-column':
        return 'form-grid-three';
      default:
        return 'form-grid-single';
    }
  };
  // Visible fields
  const visibleFields = useMemo(() => ;
    schema.fields.filter(isFieldVisible), 
    [schema.fields, isFieldVisible]
  );
  return ()
    <div className={`admin-form-builder ${className}`}>}
      {/* Form Header */}
      {(schema.title || schema.description) && ()
        <div className="form-header">
          {schema.title && ()
            <h2 className="form-title">{schema.title}</h2>
          )}
          {schema.description && ()
            <p className="form-description">{schema.description}</p>
          )}
        </div>
      )}
      {/* Form Content */}
      <form onSubmit={handleSubmit} className="admin-form">
        <div className={`form-grid ${getLayoutClass()}`}>}
          {visibleFields.map((field) => ()
            <FormField
              key={field.name}
              field={field}
              value={values[field.name]}
              error={touched[field.name] ? errors[field.name] : ''}
              onChange={(value) => handleFieldChange(field.name, value)}
              onBlur={() => handleFieldBlur(field.name)}
              showPassword={showPasswords[field.name]}
              onTogglePassword={() => togglePasswordVisibility(field.name)}
              disabled={loading || field.disabled}
            />
          ))}
        </div>
        {/* Form Actions */}
        <div className="form-actions">
          {onCancel && ()
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="btn btn-secondary"
            >
              {schema.cancelText || 'Cancel'}
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? ()
              <>
                <div className="spinner" />
                Submitting...
              </>
            ) : ()
              <>
                <Check size={16} />
                {schema.submitText || 'Submit'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminFormBuilder;