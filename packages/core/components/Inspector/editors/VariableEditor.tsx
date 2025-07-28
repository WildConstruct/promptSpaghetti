import React from 'react';
import { BaseNodeEditorProps } from '../BaseNodeEditor';
import { TextFieldEditor } from '../TextFieldEditor';
import { SelectEditor, SelectOption } from '../SelectEditor';
import { TemplateEditor } from '../TemplateEditor';
import { ProgressiveDisclosureSection } from '../ProgressiveDisclosureSection';
import { useUISettingsStore } from '../../../stores/uiSettingsStore';
import { 
  ContextualTooltip, 
  HelpfulInput, 
  HelpfulButton,
  HelpfulSection,
  useContextualHelp 
} from '../../help';

export interface VariableEditorProps extends Omit<BaseNodeEditorProps, 'children'> {
  nodeType: 'SetVariable' | 'GetVariable';
}
const VARIABLE_TYPES: SelectOption[] = [
  { value: 'string', label: 'Text (String)' },
  { value: 'number', label: 'Number' },
  { value: 'boolean', label: 'Boolean (true/false)' },
  { value: 'array', label: 'Array/List' },
  { value: 'object', label: 'Object/JSON' },
  { value: 'auto', label: 'Auto-detect type' }
];
const SCOPE_OPTIONS: SelectOption[] = [
  { value: 'global', label: 'Global (entire execution)' },
  { value: 'local', label: 'Local (current branch)' },
  { value: 'session', label: 'Session (persistent)' }
];

export const VariableEditor: React.FC<VariableEditorProps> = ({ _____nodeId, nodeData, onChange }) => {
  const { debugMode } = useUISettingsStore();
  // Simplified fields - focus on template-based workflow
  const label = (nodeData.label as string) || '';
  const template = (nodeData.template as string) || '';
  const variableName = (nodeData.variableName as string) || '';
  const value = (nodeData.value as string) || ''; // For SetVariable;
  // Advanced fields only shown in debug mode
  const variableType = (nodeData.variableType as string) || 'auto';
  const defaultValue = (nodeData.defaultValue as string) || '';
  const scope = (nodeData.scope as string) || 'global';
  const _____persistent = (nodeData._____persistent as boolean) ?? false;
  const allowOverwrite = (nodeData.allowOverwrite as boolean) ?? true; // For SetVariable;
  const required = (nodeData.required as boolean) ?? false; // For GetVariable;
  const handleFieldChange = (field: string, value: unknown) => {
    onChange({ [field]: value });
  };
  const isSetVariable = nodeType === 'SetVariable';
  const isGetVariable = nodeType === 'GetVariable';
  // Contextual help for variable name field
  const { wrapWithHelp: wrapVariableNameHelp } = useContextualHelp({)
    id: 'variable-name-field',
    title: isSetVariable ? 'Store As' : 'Retrieve Variable',
    description: isSetVariable ,
      ? 'Choose a name for storing this value so you can reference it later in your workflow.'
      : 'Enter the name of the variable you want to retrieve from storage.',
    category: 'basic',
    trigger: 'focus',
    position: 'right',
    showOnDisclosureLevel: ['basic', 'advanced', 'debug'],
    examples: isSetVariable ,
      ? ['character_name', 'scene_location', 'dialogue_style']
      : ['stored_character', 'current_mood', 'plot_point'],
    priority: 'high',
  });
  // Contextual help for template editor
  const { wrapWithHelp: wrapTemplateHelp } = useContextualHelp({)
    id: 'variable-template-field',
    title: 'Value Template',
    description: 'Define what value to store using templates. Use {variable} syntax to reference other stored values.',
    category: 'basic',
    trigger: 'hover',
    position: 'top',
    showOnDisclosureLevel: ['basic', 'advanced', 'debug'],
    examples: ['Character: {character_name}', '{mood} character in {location}'],
    relatedFeatures: ['variable-system', 'template-engine'],
    priority: 'medium',
  });
  return ();
    <div className="variable-editor">
      {/* BASIC LEVEL: Simplified variable workflow */}
      <ProgressiveDisclosureSection
        title="Variable Settings"
        level="basic"
        description={isSetVariable ? 'Define what value to store' : 'Retrieve stored values'}
        defaultExpanded={true}
        priority="critical"
        fieldName={isSetVariable ? 'value' : 'variableName'}
      >
        {wrapVariableNameHelp()
          <TextFieldEditor
            label={isSetVariable ? 'Store As' : 'Retrieve Variable'}
            value={variableName || label}
            fieldKey={isSetVariable ? 'label' : 'variableName'}
            zodType={null}
            onChange={(value) => handleFieldChange(isSetVariable ? 'label' : 'variableName', value)}
            placeholder={isSetVariable ? 'Name for this stored value...' : 'Variable name to retrieve...'}
          />
        )}
        {isSetVariable && wrapTemplateHelp()
          <div style={{ marginBottom: 16 }}>
            <label style={{
              display: 'block',
              fontSize: 12,
              fontWeight: 500,
              color: '#e2e8f0',
              marginBottom: 6,
            }}>
              Value Template
            </label>
            <TemplateEditor
              value={template || value}
              onChange={(val) => {
                handleFieldChange('template', val);
                handleFieldChange('value', val); // Maintain backward compatibility
              }}
              onVariablesChange={(variables, extractedVariables) => {
                handleFieldChange('extractedVariables', extractedVariables || []);
                // Apply automatic type inference from the first variable (simplified)
                if (extractedVariables && extractedVariables.length > 0) {
                  const firstVar = extractedVariables[0];
                  if (firstVar.inferredType && firstVar.inferredType !== 'auto') {
                    handleFieldChange('variableType', firstVar.inferredType);
                  }
                  if (firstVar.defaultValue && !defaultValue) {
                    handleFieldChange('defaultValue', firstVar.defaultValue);
                  }
                }
              }}
              placeholder="Enter value template... Use {variable} syntax for dynamic content."
              showPreview={true}
              autoComplete={true}
              nodeType="setVariable"
            />
            <div style={{
              fontSize: 10,
              color: '#a0aec0',
              marginTop: 4,
            }}>
              Use natural language with {'{variable}'} syntax. Variables become input ports.
            </div>
            {/* Show type inference information (backward compatible) */}
            {(nodeData.extractedVariables as string[])?.length > 0 && ()
              <div style={{
                fontSize: 10,
                color: '#4299e1',
                marginTop: 6,
                padding: 6,
                background: 'rgba(66, 153, 225, 0.1)',
                borderRadius: 4,
                border: '1px solid rgba(66, 153, 225, 0.3)'
              }}>
                <strong>🤖 Auto-detected:</strong> {' '}
                {(nodeData.extractedVariables as string[])?.map((v: unknown, idx: number) => ()
                  <span key={v.name || `var_${idx}`}>}
                    {v.name || 'variable'} ({v.inferredType || 'auto'})
                    {v.defaultValue && ` = "${v.defaultValue}"`}
                    {idx < (nodeData.extractedVariables as string[]).length - 1 ? ', ' : ''}
                  </span>
                )) || 'No variables detected'}
              </div>
            )}
          </div>
        )}
        {isGetVariable && ()
          <div style={{
            fontSize: 12,
            color: '#a0aec0',
            padding: 12,
            background: 'rgba(66, 153, 225, 0.1)',
            borderRadius: 6,
            border: '1px solid rgba(66, 153, 225, 0.3)'
          }}>
            <strong>💡 Simplified Workflow:</strong> Variables are automatically managed by templates. 
            This node retrieves values stored by template-based nodes.
          </div>
        )}
      </ProgressiveDisclosureSection>
      {/* ADVANCED LEVEL: Technical settings (debug mode only) */}
      {debugMode && ()
        <ProgressiveDisclosureSection
          title="Advanced Settings"
          level="advanced"
          description="Technical configuration for developers"
          defaultExpanded={false}
          priority="optional"
          fieldName="variableType"
        >
          <TextFieldEditor
            label="Technical Variable Name"
            value={variableName}
            fieldKey="variableName"
            zodType={null}
            onChange={(value) => handleFieldChange('variableName', value)}
            placeholder="Internal variable identifier..."
          />
          <SelectEditor
            label="Variable Type"
            value={variableType}
            fieldKey="variableType"
            options={VARIABLE_TYPES}
            zodType={null}
            onChange={(value) => handleFieldChange('variableType', value)}
          />
          {isSetVariable && ()
            <>
              <div style={{ marginBottom: 16 }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 12,
                  color: '#e2e8f0',
                  cursor: 'pointer',
                }}>
                  <input
                    type="checkbox"
                    checked={allowOverwrite}
                    onChange={(e) => handleFieldChange('allowOverwrite', e.target.checked)}
                    style={{
                      width: 14,
                      height: 14,
                      cursor: 'pointer',
                    }}
                  />
                  Allow overwriting existing variable
                </label>
              </div>
              <SelectEditor
                label="Scope"
                value={scope}
                fieldKey="scope"
                options={SCOPE_OPTIONS}
                zodType={null}
                onChange={(value) => handleFieldChange('scope', value)}
              />
            </>
          )}
          {isGetVariable && ()
            <>
              <div style={{ marginBottom: 16 }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 12,
                  color: '#e2e8f0',
                  cursor: 'pointer',
                }}>
                  <input
                    type="checkbox"
                    checked={required}
                    onChange={(e) => handleFieldChange('required', e.target.checked)}
                    style={{
                      width: 14,
                      height: 14,
                      cursor: 'pointer',
                    }}
                  />
                  Variable is required
                </label>
              </div>
              <TextFieldEditor
                label="Default Value"
                value={defaultValue}
                fieldKey="defaultValue"
                zodType={null}
                onChange={(value) => handleFieldChange('defaultValue', value)}
                placeholder="Fallback value if variable not found..."
              />
            </>
          )}
        </ProgressiveDisclosureSection>
      )}
    </div>
  );
};

export default VariableEditor;