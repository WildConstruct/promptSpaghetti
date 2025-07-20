import React, { useState } from 'react';
import { BaseNodeEditor, BaseNodeEditorProps } from '../BaseNodeEditor';
import { TextFieldEditor } from '../TextFieldEditor';
import { EnhancedTextAreaEditor } from '../EnhancedTextAreaEditor';
import { SelectEditor, SelectOption } from '../SelectEditor';
import { CollapsibleSection } from '../CollapsibleSection';

export interface ConcatEditorProps extends Omit<BaseNodeEditorProps, 'children'> {
  // Concat specific props can be added here
}

const SEPARATOR_PRESETS: SelectOption[] = [
  { value: '', label: 'No separator (direct concatenation)' },
  { value: ' ', label: 'Space' },
  { value: '\n', label: 'New line' },
  { value: ', ', label: 'Comma and space' },
  { value: ' | ', label: 'Pipe with spaces' },
  { value: ' - ', label: 'Dash with spaces' },
  { value: 'custom', label: 'Custom separator...' }
];

const JOIN_MODES: SelectOption[] = [
  { value: 'all', label: 'Join All Inputs' },
  { value: 'non-empty', label: 'Join Non-Empty Only' },
  { value: 'first-n', label: 'Join First N Inputs' },
  { value: 'last-n', label: 'Join Last N Inputs' }
];

export const ConcatEditor: React.FC<ConcatEditorProps> = (props) => {
  const { nodeData, onChange } = props;
  
  // Concat specific fields
  const label = (nodeData.label as string) || '';
  const separator = (nodeData.separator as string) ?? ' ';
  const customSeparator = (nodeData.customSeparator as string) || '';
  const joinMode = (nodeData.joinMode as string) || 'all';
  const limitCount = (nodeData.limitCount as number) || 2;
  const prefix = (nodeData.prefix as string) || '';
  const suffix = (nodeData.suffix as string) || '';
  const trimInputs = (nodeData.trimInputs as boolean) ?? true;
  const preserveOrder = (nodeData.preserveOrder as boolean) ?? true;

  // State for collapsible sections
  const [basicPropsCollapsed, setBasicPropsCollapsed] = useState(false);
  const [concatSettingsCollapsed, setConcatSettingsCollapsed] = useState(false);
  const [wrappingCollapsed, setWrappingCollapsed] = useState(true);
  const [previewCollapsed, setPreviewCollapsed] = useState(true);

  const [separatorMode, setSeparatorMode] = React.useState(
    SEPARATOR_PRESETS.find(preset => preset.value === separator) ? separator : 'custom'
  );

  const handleFieldChange = (field: string, value: unknown) => {
    onChange({ [field]: value });
  };

  const handleSeparatorChange = (value: unknown) => {
    const mode = value as string;
    setSeparatorMode(mode);
    if (mode !== 'custom') {
      handleFieldChange('separator', mode);
    } else {
      handleFieldChange('separator', customSeparator);
    }
  };

  const handleCustomSeparatorChange = (value: unknown) => {
    const strValue = value as string;
    handleFieldChange('customSeparator', strValue);
    if (separatorMode === 'custom') {
      handleFieldChange('separator', strValue);
    }
  };

  const getDisplaySeparator = () => {
    const actualSeparator = separatorMode === 'custom' ? customSeparator : separator;
    switch (actualSeparator) {
    case '': return '〈none〉';
    case ' ': return '〈space〉';
    case '\n': return '〈newline〉';
    case '\t': return '〈tab〉';
    default: return `"${actualSeparator}"`;
    }
  };

  return (
    <div className="concat-editor">
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
          placeholder="Enter concatenation label..."
        />
      </CollapsibleSection>

      {/* Concatenation Settings */}
      <CollapsibleSection 
        title="Concatenation Settings" 
        collapsed={concatSettingsCollapsed}
        onToggle={() => setConcatSettingsCollapsed(!concatSettingsCollapsed)}
      >
        <SelectEditor
          label="Join Mode"
          value={joinMode}
          fieldKey="joinMode"
          options={JOIN_MODES}
          zodType={null as any}
          onChange={(value) => handleFieldChange('joinMode', value)}
        />

        {(joinMode === 'first-n' || joinMode === 'last-n') && (
          <TextFieldEditor
            label="Limit Count"
            value={limitCount}
            fieldKey="limitCount"
            type="number"
            zodType={null as any}
            onChange={(value) => handleFieldChange('limitCount', value)}
            placeholder="Number of inputs to include..."
          />
        )}

        <SelectEditor
          label="Separator"
          value={separatorMode}
          fieldKey="separatorMode"
          options={SEPARATOR_PRESETS}
          zodType={null as any}
          onChange={handleSeparatorChange}
        />

        {separatorMode === 'custom' && (
          <TextFieldEditor
            label="Custom Separator"
            value={customSeparator}
            fieldKey="customSeparator"
            zodType={null as any}
            onChange={handleCustomSeparatorChange}
            placeholder="Enter custom separator..."
          />
        )}

        <div style={{ marginBottom: 16 }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 12,
            color: '#e2e8f0',
            cursor: 'pointer',
            marginBottom: 8
          }}>
            <input
              type="checkbox"
              checked={trimInputs}
              onChange={(e) => handleFieldChange('trimInputs', e.target.checked)}
              style={{
                width: 14,
                height: 14,
                cursor: 'pointer'
              }}
            />
            Trim input whitespace
          </label>

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
              checked={preserveOrder}
              onChange={(e) => handleFieldChange('preserveOrder', e.target.checked)}
              style={{
                width: 14,
                height: 14,
                cursor: 'pointer'
              }}
            />
            Preserve input order
          </label>
        </div>
      </CollapsibleSection>

      {/* Prefix and Suffix */}
      <CollapsibleSection 
        title="Wrapping" 
        collapsed={wrappingCollapsed}
        onToggle={() => setWrappingCollapsed(!wrappingCollapsed)}
      >
        <EnhancedTextAreaEditor
          label="Prefix"
          value={prefix}
          fieldKey="prefix"
          zodType={null as any}
          onChange={(value) => handleFieldChange('prefix', value)}
          placeholder="Text to add before concatenated result..."
          rows={2}
          enableInlineCorrections={true}
          showCorrectionHighlights={true}
        />

        <EnhancedTextAreaEditor
          label="Suffix"
          value={suffix}
          fieldKey="suffix"
          zodType={null as any}
          onChange={(value) => handleFieldChange('suffix', value)}
          placeholder="Text to add after concatenated result..."
          rows={2}
          enableInlineCorrections={true}
          showCorrectionHighlights={true}
        />
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
            Concatenation Configuration:
          </div>
          
          <div style={{ marginBottom: 4 }}>
            <span style={{ color: '#a0aec0' }}>Mode:</span> {JOIN_MODES.find(m => m.value === joinMode)?.label}
          </div>
          
          {(joinMode === 'first-n' || joinMode === 'last-n') && (
            <div style={{ marginBottom: 4 }}>
              <span style={{ color: '#a0aec0' }}>Limit:</span> {limitCount} inputs
            </div>
          )}
          
          <div style={{ marginBottom: 4 }}>
            <span style={{ color: '#a0aec0' }}>Separator:</span> {getDisplaySeparator()}
          </div>
          
          <div style={{ marginBottom: 4 }}>
            <span style={{ color: '#a0aec0' }}>Options:</span>{' '}
            {[
              trimInputs && 'Trim inputs',
              preserveOrder && 'Preserve order'
            ].filter(Boolean).join(', ') || 'None'}
          </div>

          <div style={{ 
            marginTop: 12, 
            padding: 8, 
            background: 'rgba(66, 153, 225, 0.1)',
            borderRadius: 2
          }}>
            <div style={{ color: '#a0aec0', fontSize: 10, marginBottom: 4 }}>
              Example with inputs ["Hello", "World", "!"]:
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: 11 }}>
              {prefix}
              Hello{separatorMode === 'custom' ? customSeparator : separator}World{separatorMode === 'custom' ? customSeparator : separator}!
              {suffix}
            </div>
          </div>

          {(prefix || suffix) && (
            <div style={{
              marginTop: 8,
              fontSize: 10,
              color: '#a0aec0',
              fontStyle: 'italic'
            }}>
              * Prefix and suffix are applied to the final concatenated result
            </div>
          )}
        </div>
      </CollapsibleSection>
    </div>
  );
};