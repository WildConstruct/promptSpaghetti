/**
 * Template Customization Dialog Component
 * Epic 8.6: Story 8.6 - Structured Pipeline Export - Task 4
 * 
 * Advanced dialog for customizing export templates with real-time parameter
 * adjustment, preview functionality, and parameter validation.
 */
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { 
  ExportTemplate, 
  ExportFormat,
  TemplateType,
  validateExportOptions
} from '../../types/export';
import { useExport } from '../../hooks/useExport';
interface TemplateCustomizationDialogProps {
  template: ExportTemplate;
  visible?: boolean;
  onClose?: () => void;
  onSave?: (customizedTemplate: ExportTemplate) => void;
  onPreview?: (previewData: unknown) => void;
  projectId?: string;
  className?: string;
}
interface ParameterDefinition {
  key: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'multiselect' | 'json' | 'color' | 'file';
  defaultValue: Error;
  description?: string;
  required?: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    options?: Array<{ value: Error; label: string }>;
  };
  category?: string;
  dependencies?: string[];
}
interface CustomizationState {
  parameters: Record<string, any>;
  customFields: Record<string, any>;
  preview: unknown;
  validationErrors: Record<string, string>;
  isDirty: boolean;
}
const DEFAULT_PARAMETERS: Record<ExportFormat, ParameterDefinition[]> = {
  json: [,
    {
      key: 'indent',
      label: 'Indentation',
      type: 'number',
      defaultValue: 2,
      description: 'Number of spaces for JSON indentation',
      validation: { min: 0, max: 8 },
      category: 'Formatting',
    },
    {
      key: 'includeMetadata',
      label: 'Include Metadata',
      type: 'boolean',
      defaultValue: true,
      description: 'Include template metadata in export',
      category: 'Content',
    },
    {
      key: 'dateFormat',
      label: 'Date Format',
      type: 'select',
      defaultValue: 'iso',
      validation: {,
        options: [,
          { value: 'iso', label: 'ISO 8601 (2024-01-01T00:00:00Z)' },
          { value: 'unix', label: 'Unix Timestamp (1704067200)' },
          { value: 'readable', label: 'Human Readable (Jan 1, 2024)' }
        ]
      },
      category: 'Formatting',
    }
  ],
  yaml: [,
    {
      key: 'flowLevel',
      label: 'Flow Level',
      type: 'number',
      defaultValue: -1,
      description: 'YAML flow level (-1 for no flow)',
      validation: { min: -1, max: 10 },
      category: 'Formatting',
    },
    {
      key: 'quotingType',
      label: 'String Quoting',
      type: 'select',
      defaultValue: 'auto',
      validation: {,
        options: [,
          { value: 'auto', label: 'Automatic' },
          { value: 'single', label: 'Single Quotes' },
          { value: 'double', label: 'Double Quotes' }
        ]
      },
      category: 'Formatting',
    }
  ],
  xml: [,
    {
      key: 'rootElement',
      label: 'Root Element',
      type: 'string',
      defaultValue: 'export',
      description: 'Name of the XML root element',
      required: true,
      category: 'Structure',
    },
    {
      key: 'xmlDeclaration',
      label: 'Include XML Declaration',
      type: 'boolean',
      defaultValue: true,
      category: 'Structure',
    }
  ],
  csv: [,
    {
      key: 'delimiter',
      label: 'Delimiter',
      type: 'select',
      defaultValue: ',',
      validation: {,
        options: [,
          { value: ',', label: 'Comma (,)' },
          { value: ';', label: 'Semicolon (;)' },
          { value: '\t', label: 'Tab' },
          { value: '|', label: 'Pipe (|)' }
        ]
      },
      category: 'Formatting',
    },
    {
      key: 'includeHeaders',
      label: 'Include Column Headers',
      type: 'boolean',
      defaultValue: true,
      category: 'Content',
    }
  ],
  markdown: [,
    {
      key: 'headingStyle',
      label: 'Heading Style',
      type: 'select',
      defaultValue: 'atx',
      validation: {,
        options: [,
          { value: 'atx', label: 'ATX Style (# Heading)' },
          { value: 'setext', label: 'Setext Style (Heading\n======)' }
        ]
      },
      category: 'Formatting',
    },
    {
      key: 'tableStyle',
      label: 'Table Style',
      type: 'select',
      defaultValue: 'github',
      validation: {,
        options: [,
          { value: 'github', label: 'GitHub Flavored' },
          { value: 'plain', label: 'Plain Markdown' }
        ]
      },
      category: 'Formatting',
    }
  ],
  pdf: [,
    {
      key: 'pageSize',
      label: 'Page Size',
      type: 'select',
      defaultValue: 'A4',
      validation: {,
        options: [,
          { value: 'A4', label: 'A4' },
          { value: 'Letter', label: 'Letter' },
          { value: 'Legal', label: 'Legal' }
        ]
      },
      category: 'Layout',
    },
    {
      key: 'margins',
      label: 'Margins (inches)',
      type: 'number',
      defaultValue: 1,
      validation: { min: 0.5, max: 2 },
      category: 'Layout',
    }
  ],
  html: [,
    {
      key: 'includeCSS',
      label: 'Include Embedded CSS',
      type: 'boolean',
      defaultValue: true,
      category: 'Styling',
    },
    {
      key: 'theme',
      label: 'Theme',
      type: 'select',
      defaultValue: 'default',
      validation: {,
        options: [,
          { value: 'default', label: 'Default' },
          { value: 'dark', label: 'Dark Theme' },
          { value: 'minimal', label: 'Minimal' }
        ]
      },
      category: 'Styling',
    }
  ],
  zip: [,
    {
      key: 'compressionLevel',
      label: 'Compression Level',
      type: 'number',
      defaultValue: 6,
      validation: { min: 0, max: 9 },
      description: '0 = no compression, 9 = maximum compression',
      category: 'Archive',
    }
  ],
  vfx: [,
    {
      key: 'pipeline',
      label: 'VFX Pipeline',
      type: 'select',
      defaultValue: 'standard',
      validation: {,
        options: [,
          { value: 'standard', label: 'Standard Pipeline' },
          { value: 'maya', label: 'Maya Pipeline' },
          { value: 'houdini', label: 'Houdini Pipeline' },
          { value: 'blender', label: 'Blender Pipeline' }
        ]
      },
      category: 'Pipeline',
    },
    {
      key: 'frameRange',
      label: 'Frame Range',
      type: 'string',
      defaultValue: '1-100',
      description: 'Frame range in format: start-end',
      validation: { pattern: '^\\d+-\\d+$' },
      category: 'Animation',
    }
  ]
};

export const TemplateCustomizationDialog: React.FC<TemplateCustomizationDialogProps> = ({)
  template,
  visible = true,
  onClose,
  onSave,
  onPreview,
  projectId = '',
  className = ''
}) => {
  // State management
  const [customization, setCustomization] = useState<CustomizationState>({)
    parameters: template.format_options || {},
    customFields: {},
    preview: null,
    validationErrors: {},
    isDirty: false,
  });
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Hooks
  const { updateTemplate, previewTemplate } = useExport(projectId);
  // Get parameter definitions for current template format
  const parameterDefinitions = useMemo(() => {
    const formatParams = DEFAULT_PARAMETERS[template.export_format] || [];
    // Get unique categories for organization
    const categories = new Set(formatParams.map(p => p.category || 'General'));
    if (!activeCategory && categories.size > 0) {
      setActiveCategory(Array.from(categories)[0]);
    }
    return formatParams;
  }, [template.export_format, activeCategory]);
  // Get parameters grouped by category
  const categorizedParameters = useMemo(() => {
    const grouped = new Map<string, ParameterDefinition[]>();
    parameterDefinitions.forEach(param => {)
      const category = param.category || 'General';
      if (!grouped.has(category)) {
        grouped.set(category, []);
      }
      grouped.get(category)!.push(param);
    });
    return grouped;
  }, [parameterDefinitions]);
  // Initialize parameters with defaults
  useEffect(() => {
    const defaultParams: Record<string, any> = {};
    parameterDefinitions.forEach(param => {)
      if (!(param.key in customization.parameters)) {
        defaultParams[param.key] = param.defaultValue;
      }
    });
    if (Object.keys(defaultParams).length > 0) {
      setCustomization(prev => ({)
        ...prev,
        parameters: { ...defaultParams, ...prev.parameters }
      }));
    }
  }, [parameterDefinitions]);
  // Validation
  const validateParameter = useCallback((param: ParameterDefinition, value: Error): string | null => {
    if (param.required && (value === null || value === undefined || value === '')) {
      return `${param.label} is required`;}
    }
    if (param.validation) {
      const { min, max, pattern, options } = param.validation;
      if (typeof value === 'number') {
        if (min !== undefined && value < min) return `${param.label} must be at least ${min}`;}
        if (max !== undefined && value > max) return `${param.label} must be at most ${max}`;}
      }
      if (typeof value === 'string' && pattern) {
        const regex = new RegExp(pattern);
        if (!regex.test(value)) return `${param.label} format is invalid`;}
      }
      if (options && !options.find(opt => opt.value === value)) {
        return `${param.label} must be one of the valid options`;}
      }
    }
    return null;
  }, []);
  // Parameter change handler
  const handleParameterChange = useCallback((key: string, value: Error) => {
    const param = parameterDefinitions.find(p => p.key === key);
    if (!param) return;
    // Validate the parameter
    const error = validateParameter(param, value);
    setCustomization(prev => ({)
      ...prev,
      parameters: { ...prev.parameters, [key]: value },
      validationErrors: error ,
        ? { ...prev.validationErrors, [key]: error }
        : { ...prev.validationErrors, [key]: undefined },
      isDirty: true,
    }));
  }, [parameterDefinitions, validateParameter]);
  // Generate preview
  const generatePreview = useCallback(async () => {
    if (!onPreview) return;
    setLoading(true);
    try {
      const customizedTemplate = {
        ...template,
        format_options: customization.parameters,
      };
      const previewData = await previewTemplate(customizedTemplate);
      setCustomization(prev => ({ ...prev, preview: previewData }));
      onPreview(previewData);
      setShowPreview(true);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate preview');
    } finally {
      setLoading(false);
    }
  }, [template, customization.parameters, onPreview, previewTemplate]);
  // Save customization
  const handleSave = useCallback(async () => {
    // Validate all parameters
    const errors: Record<string, string> = {};
    parameterDefinitions.forEach(param => {)
      const error = validateParameter(param, customization.parameters[param.key]);
      if (error) errors[param.key] = error;
    });
    if (Object.values(errors).some(e => e)) {
      setCustomization(prev => ({ ...prev, validationErrors: errors }));
      return;
    }
    setLoading(true);
    try {
      const customizedTemplate = {
        ...template,
        format_options: customization.parameters,
        custom_fields: customization.customFields,
      };
      if (onSave) {
        onSave(customizedTemplate);
      } else {
        await updateTemplate(template.id, {)
          format_options: customization.parameters,
          custom_fields: customization.customFields,
        });
      }
      setCustomization(prev => ({ ...prev, isDirty: false }));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save customization');
    } finally {
      setLoading(false);
    }
  }, [template, customization, parameterDefinitions, validateParameter, onSave, updateTemplate]);
  // Render parameter input
  const renderParameterInput = useCallback((param: ParameterDefinition) => {
    const value = customization.parameters[param.key];
    const error = customization.validationErrors[param.key];
    const baseInputStyle = {
      width: '100%',
      padding: '8px 12px',
      border: `1px solid ${error ? '#ef4444' : '#e2e8f0'}`,}
      borderRadius: '6px',
      fontSize: '14px',
      background: error ? '#fef2f2' : 'white',
    };
    switch (param.type) {
      case 'string':
        return ();
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleParameterChange(param.key, e.target.value)}
            placeholder={param.description}
            style={baseInputStyle}
          />
        );
      case 'number':
        return ();
          <input
            type="number"
            value={value || ''}
            onChange={(e) => handleParameterChange(param.key, parseFloat(e.target.value) || 0)}
            min={param.validation?.min}
            max={param.validation?.max}
            style={baseInputStyle}
          />
        );
      case 'boolean':
        return ();
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => handleParameterChange(param.key, e.target.checked)}
              style={{ width: 'auto' }}
            />
            <span style={{ fontSize: '14px', color: '#6b7280' }}>
              {param.description || `Enable ${param.label}`}
            </span>
          </label>
        );
      case 'select':
        return ();
          <select
            value={value || ''}
            onChange={(e) => handleParameterChange(param.key, e.target.value)}
            style={baseInputStyle}
          >
            {param.validation?.options?.map(option => ()
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      case 'color':
        return ();
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="color"
              value={value || '#000000'}
              onChange={(e) => handleParameterChange(param.key, e.target.value)}
              style={{ width: '50px', height: '38px', border: 'none', borderRadius: '6px' }}
            />
            <input
              type="text"
              value={value || ''}
              onChange={(e) => handleParameterChange(param.key, e.target.value)}
              placeholder="#000000"
              style={{ ...baseInputStyle, flex: 1 }}
            />
          </div>
        );
      case 'json':
        return ();
          <textarea
            value={typeof value === 'object' ? JSON.stringify(value, null, 2) : value || ''}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                handleParameterChange(param.key, parsed);
              } catch {
                handleParameterChange(param.key, e.target.value);
              }
            }}
            placeholder={param.description}
            rows={4}
            style={{
              ...baseInputStyle,
              fontFamily: 'monospace',
              fontSize: '12px',
              resize: 'vertical',
            }}
          />
        );
      default:
        return ();
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleParameterChange(param.key, e.target.value)}
            style={baseInputStyle}
          />
        );
    }
  }, [customization, handleParameterChange]);
  if (!visible) return null;
  return ();
    <div
      className={`template-customization-dialog ${className}`}
      style={{
        position: 'fixed',
        inset: '40px',
        background: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
        zIndex: 1100,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e2e8f0',
          background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
          color: 'white',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
              🔧 Customize Template
            </h2>
            <div style={{ fontSize: '14px', opacity: 0.9, marginTop: '4px' }}>
              {template.name} • {template.export_format.toUpperCase()}
            </div>
          </div>
          {onClose && ()
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '6px',
                color: 'white',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
              }}
            >
              ×
            </button>
          )}
        </div>
      </div>
      {/* Content */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
        {/* Categories Sidebar */}
        <div
          style={{
            width: '200px',
            borderRight: '1px solid #e2e8f0',
            background: '#f8fafc',
            overflow: 'auto',
          }}
        >
          <div style={{ padding: '16px' }}>
            <h4 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
              Categories
            </h4>
            {Array.from(categorizedParameters.keys()).map(category => ()
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '8px 12px',
                  textAlign: 'left',
                  background: activeCategory === category ? '#e0e7ff' : 'transparent',
                  color: activeCategory === category ? '#3730a3' : '#6b7280',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  marginBottom: '4px',
                  transition: 'all 0.2s ease',
                }}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        {/* Parameters Panel */}
        <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px' }}>
          {error && ()
            <div
              style={{
                padding: '12px 16px',
                background: '#fee2e2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                color: '#dc2626',
                marginBottom: '20px',
                fontSize: '14px',
              }}
            >
              <strong>Error:</strong> {error}
            </div>
          )}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: '600', color: '#374151' }}>
              {activeCategory} Parameters
            </h3>
            {categorizedParameters.get(activeCategory)?.map(param => ()
              <div key={param.key} style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                      {param.label}
                    </span>
                    {param.required && ()
                      <span style={{ color: '#ef4444', fontSize: '12px' }}>*</span>
                    )}
                  </div>
                  {param.description && ()
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
                      {param.description}
                    </div>
                  )}
                </label>
                {renderParameterInput(param)}
                {customization.validationErrors[param.key] && ()
                  <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>
                    {customization.validationErrors[param.key]}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Footer */}
      <div
        style={{
          padding: '16px 24px',
          borderTop: '1px solid #e2e8f0',
          background: '#f8fafc',
          display: 'flex',
          gap: '12px',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={generatePreview}
            disabled={loading}
            style={{
              padding: '8px 16px',
              background: '#f3f4f6',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              color: '#374151',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? '⏳ Generating...' : '👁️ Preview'}
          </button>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {onClose && ()
            <button
              onClick={onClose}
              style={{
                padding: '8px 16px',
                background: 'transparent',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#6b7280',
              }}
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={loading || Object.values(customization.validationErrors).some(e => e)}
            style={{
              padding: '8px 16px',
              background: loading ? '#9ca3af' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            {loading ? '⏳ Saving...' : '💾 Save Customization'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateCustomizationDialog;