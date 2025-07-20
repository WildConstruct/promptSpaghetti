import React, { useState } from 'react';
import { BaseNodeEditor, BaseNodeEditorProps } from '../BaseNodeEditor';
import { TextFieldEditor } from '../TextFieldEditor';
import { EnhancedTextAreaEditor } from '../EnhancedTextAreaEditor';
import { SelectEditor, SelectOption } from '../SelectEditor';
import { CollapsibleSection } from '../CollapsibleSection';

export interface OutputEditorProps extends Omit<BaseNodeEditorProps, 'children'> {
  // Output specific props can be added here
}

const OUTPUT_FORMATS: SelectOption[] = [
  { value: 'text', label: 'Plain Text' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'html', label: 'HTML' },
  { value: 'json', label: 'JSON' }
];

const OUTPUT_DESTINATIONS: SelectOption[] = [
  { value: 'final', label: 'Final Output' },
  { value: 'intermediate', label: 'Intermediate Result' },
  { value: 'debug', label: 'Debug Output' }
];

export const OutputEditor: React.FC<OutputEditorProps> = (props) => {
  const { nodeData, onChange } = props;
  
  // Output specific fields
  const label = (nodeData.label as string) || '';
  const template = (nodeData.template as string) || '';
  const format = (nodeData.format as string) || 'text';
  const destination = (nodeData.destination as string) || 'final';
  const includeMetadata = !!(nodeData.includeMetadata as boolean);
  const transformations = (nodeData.transformations as string[]) || [];

  // State for collapsible sections
  const [basicPropsCollapsed, setBasicPropsCollapsed] = useState(false);
  const [outputConfigCollapsed, setOutputConfigCollapsed] = useState(false);
  const [postProcessingCollapsed, setPostProcessingCollapsed] = useState(true);
  const [previewCollapsed, setPreviewCollapsed] = useState(true);

  const handleFieldChange = (field: string, value: unknown) => {
    onChange({ [field]: value });
  };

  const handleTransformationChange = (index: number, transformation: string) => {
    const newTransformations = [...transformations];
    newTransformations[index] = transformation;
    onChange({ transformations: newTransformations });
  };

  const addTransformation = () => {
    onChange({ 
      transformations: [...transformations, ''] 
    });
  };

  const removeTransformation = (index: number) => {
    const newTransformations = transformations.filter((_: any, i: number) => i !== index);
    onChange({ transformations: newTransformations });
  };

  return (
    <div className="output-editor">
      {/* Basic Properties */}
      <CollapsibleSection 
        title="Basic Properties" 
        collapsed={basicPropsCollapsed}
        onToggle={() => setBasicPropsCollapsed(!basicPropsCollapsed)}
      >
        <TextFieldEditor
          label="Label"
          value={label}
          fieldKey="label"
          zodType={null as any}
          onChange={(value) => handleFieldChange('label', value)}
          placeholder="Enter output label..."
        />

        <EnhancedTextAreaEditor
          label="Output Template"
          value={template}
          fieldKey="template"
          zodType={null as any}
          onChange={(value) => handleFieldChange('template', value)}
          placeholder="Enter output template... Use {input} to reference connected node output."
          rows={4}
          showWordCount
          autoResize
          enableInlineCorrections={true}
          showCorrectionHighlights={true}
        />
      </CollapsibleSection>

      {/* Output Configuration */}
      <CollapsibleSection 
        title="Output Configuration" 
        collapsed={outputConfigCollapsed}
        onToggle={() => setOutputConfigCollapsed(!outputConfigCollapsed)}
      >
        <SelectEditor
          label="Format"
          value={format}
          fieldKey="format"
          options={OUTPUT_FORMATS}
          zodType={null as any}
          onChange={(value) => handleFieldChange('format', value)}
        />

        <SelectEditor
          label="Destination"
          value={destination}
          fieldKey="destination"
          options={OUTPUT_DESTINATIONS}
          zodType={null as any}
          onChange={(value) => handleFieldChange('destination', value)}
        />

        <div style={{ marginBottom: 16 }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 12,
            color: '#e2e8f0',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={includeMetadata}
              onChange={(e) => handleFieldChange('includeMetadata', e.target.checked)}
              style={{
                width: 14,
                height: 14,
                cursor: 'pointer'
              }}
            />
            Include metadata in output
          </label>
          <div style={{
            fontSize: 10,
            color: '#a0aec0',
            marginTop: 2,
            marginLeft: 22
          }}>
            Adds execution metadata like timestamp, node path, and seed information
          </div>
        </div>
      </CollapsibleSection>

      {/* Transformations */}
      <CollapsibleSection 
        title="Post-Processing" 
        collapsed={postProcessingCollapsed}
        onToggle={() => setPostProcessingCollapsed(!postProcessingCollapsed)}
      >
        <div style={{ marginBottom: 12 }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8
          }}>
            <label style={{ 
              fontWeight: 500, 
              color: '#e2e8f0',
              fontSize: 12
            }}>
              Transformations
            </label>
            <button
              onClick={addTransformation}
              style={{
                padding: '4px 8px',
                fontSize: 10,
                background: '#4299e1',
                border: 'none',
                borderRadius: 2,
                color: 'white',
                cursor: 'pointer'
              }}
            >
              + Add
            </button>
          </div>

          {transformations.length === 0 ? (
            <div style={{
              padding: 12,
              background: '#2d3748',
              border: '1px dashed #4a5568',
              borderRadius: 4,
              textAlign: 'center',
              color: '#a0aec0',
              fontSize: 12,
              fontStyle: 'italic'
            }}>
              No transformations configured. Add transformations to modify output.
            </div>
          ) : (
            <div style={{
              background: '#2d3748',
              border: '1px solid #4a5568',
              borderRadius: 4,
              padding: 8
            }}>
              {transformations.map((transformation: string, index: number) => (
                <div key={index} style={{
                  display: 'flex',
                  gap: 8,
                  marginBottom: index < transformations.length - 1 ? 8 : 0
                }}>
                  <input
                    type="text"
                    value={transformation}
                    onChange={(e) => handleTransformationChange(index, e.target.value)}
                    placeholder="e.g., trim, lowercase, capitalize"
                    style={{
                      flex: 1,
                      padding: 6,
                      border: '1px solid #4a5568',
                      borderRadius: 2,
                      background: '#1a202c',
                      color: '#e2e8f0',
                      fontSize: 12
                    }}
                  />
                  <button
                    onClick={() => removeTransformation(index)}
                    style={{
                      padding: '4px 6px',
                      background: '#e53e3e',
                      border: 'none',
                      borderRadius: 2,
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: 10
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{
          fontSize: 10,
          color: '#a0aec0',
          lineHeight: 1.4
        }}>
          <strong>Available transformations:</strong><br />
          • trim - Remove leading/trailing whitespace<br />
          • lowercase, uppercase, capitalize - Text case transformations<br />
          • stripHtml - Remove HTML tags<br />
          • encode - URL encode output<br />
          • Custom JavaScript expressions supported
        </div>
      </CollapsibleSection>

      {/* Preview */}
      <CollapsibleSection 
        title="Preview" 
        collapsed={previewCollapsed}
        onToggle={() => setPreviewCollapsed(!previewCollapsed)}
      >
        <div style={{
          background: '#1a202c',
          border: '1px solid #4a5568',
          borderRadius: 4,
          padding: 12,
          fontSize: 12,
          color: '#e2e8f0'
        }}>
          <div style={{ marginBottom: 8, fontWeight: 500 }}>
            Output Configuration:
          </div>
          
          <div style={{ marginBottom: 4 }}>
            <span style={{ color: '#a0aec0' }}>Format:</span> {format}
          </div>
          <div style={{ marginBottom: 4 }}>
            <span style={{ color: '#a0aec0' }}>Destination:</span> {destination}
          </div>
          <div style={{ marginBottom: 4 }}>
            <span style={{ color: '#a0aec0' }}>Metadata:</span> {includeMetadata ? 'Included' : 'Excluded'}
          </div>
          
          {transformations.length > 0 && (
            <div style={{ marginBottom: 4 }}>
              <span style={{ color: '#a0aec0' }}>Transformations:</span> {transformations.filter(Boolean).join(' → ')}
            </div>
          )}

          {template && (
            <div style={{ 
              marginTop: 8, 
              padding: 8, 
              background: 'rgba(66, 153, 225, 0.1)',
              borderRadius: 2
            }}>
              <div style={{ color: '#a0aec0', fontSize: 10, marginBottom: 4 }}>
                Template Preview:
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: 11 }}>
                {template}
              </div>
            </div>
          )}
        </div>
      </CollapsibleSection>
    </div>
  );
};