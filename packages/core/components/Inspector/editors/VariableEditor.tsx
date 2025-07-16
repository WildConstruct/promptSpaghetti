import React, { useState } from "react";
import { BaseNodeEditor, BaseNodeEditorProps } from "../BaseNodeEditor";
import { TextFieldEditor } from "../TextFieldEditor";
import { TextAreaEditor } from "../TextAreaEditor";
import { SelectEditor, SelectOption } from "../SelectEditor";
import { CollapsibleSection } from "../CollapsibleSection";

export interface VariableEditorProps extends Omit<BaseNodeEditorProps, 'children'> {
  nodeType: 'SetVariable' | 'GetVariable';
}

const VARIABLE_TYPES: SelectOption[] = [
  { value: "string", label: "Text (String)" },
  { value: "number", label: "Number" },
  { value: "boolean", label: "Boolean (true/false)" },
  { value: "array", label: "Array/List" },
  { value: "object", label: "Object/JSON" },
  { value: "auto", label: "Auto-detect type" },
];

const SCOPE_OPTIONS: SelectOption[] = [
  { value: "global", label: "Global (entire execution)" },
  { value: "local", label: "Local (current branch)" },
  { value: "session", label: "Session (persistent)" },
];

export const VariableEditor: React.FC<VariableEditorProps> = (props) => {
  const { nodeData, onChange, nodeType } = props;
  
  // Variable specific fields
  const label = (nodeData.label as string) || "";
  const variableName = (nodeData.variableName as string) || "";
  const variableType = (nodeData.variableType as string) || "auto";
  const defaultValue = (nodeData.defaultValue as string) || "";
  const scope = (nodeData.scope as string) || "global";
  const persistent = (nodeData.persistent as boolean) ?? false;
  const value = (nodeData.value as string) || ""; // For SetVariable
  const allowOverwrite = (nodeData.allowOverwrite as boolean) ?? true; // For SetVariable
  const required = (nodeData.required as boolean) ?? false; // For GetVariable

  // State for collapsible sections
  const [basicPropsCollapsed, setBasicPropsCollapsed] = useState(false);
  const [setVarCollapsed, setSetVarCollapsed] = useState(false);
  const [getVarCollapsed, setGetVarCollapsed] = useState(false);
  const [scopeCollapsed, setScopeCollapsed] = useState(true);
  const [typeInfoCollapsed, setTypeInfoCollapsed] = useState(true);
  const [previewCollapsed, setPreviewCollapsed] = useState(true);

  const handleFieldChange = (field: string, value: unknown) => {
    onChange({ [field]: value });
  };

  const isSetVariable = nodeType === 'SetVariable';
  const isGetVariable = nodeType === 'GetVariable';

  return (
    <div className="variable-editor">
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
          onChange={(value) => handleFieldChange("label", value)}
          placeholder={`Enter ${nodeType.toLowerCase()} label...`}
        />

        <TextFieldEditor
          label="Variable Name"
          value={variableName}
          fieldKey="variableName"
          zodType={null as any}
          onChange={(value) => handleFieldChange("variableName", value)}
          placeholder="Enter variable name (e.g., userInput, counter)..."
        />

        <SelectEditor
          label="Variable Type"
          value={variableType}
          fieldKey="variableType"
          options={VARIABLE_TYPES}
          zodType={null as any}
          onChange={(value) => handleFieldChange("variableType", value)}
        />
      </CollapsibleSection>

      {/* SetVariable Specific Settings */}
      {isSetVariable && (
        <CollapsibleSection 
          title="Set Variable Configuration" 
          collapsed={setVarCollapsed}
          onToggle={() => setSetVarCollapsed(!setVarCollapsed)}
        >
          <TextAreaEditor
            label="Value"
            value={value}
            fieldKey="value"
            zodType={null as any}
            onChange={(value) => handleFieldChange("value", value)}
            placeholder="Enter the value to set for this variable..."
            rows={3}
            showWordCount
          />

          <div style={{ marginBottom: 16 }}>
            <label style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 12,
              color: "#e2e8f0",
              cursor: "pointer",
            }}>
              <input
                type="checkbox"
                checked={allowOverwrite}
                onChange={(e) => handleFieldChange("allowOverwrite", e.target.checked)}
                style={{
                  width: 14,
                  height: 14,
                  cursor: "pointer",
                }}
              />
              Allow overwriting existing variable
            </label>
            <div style={{
              fontSize: 10,
              color: "#a0aec0",
              marginTop: 2,
              marginLeft: 22,
            }}>
              If unchecked, setting an existing variable will fail
            </div>
          </div>
        </CollapsibleSection>
      )}

      {/* GetVariable Specific Settings */}
      {isGetVariable && (
        <CollapsibleSection 
          title="Get Variable Configuration" 
          collapsed={getVarCollapsed}
          onToggle={() => setGetVarCollapsed(!getVarCollapsed)}
        >
          <TextAreaEditor
            label="Default Value"
            value={defaultValue}
            fieldKey="defaultValue"
            zodType={null as any}
            onChange={(value) => handleFieldChange("defaultValue", value)}
            placeholder="Value to use if variable doesn't exist (optional)..."
            rows={2}
          />

          <div style={{ marginBottom: 16 }}>
            <label style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 12,
              color: "#e2e8f0",
              cursor: "pointer",
            }}>
              <input
                type="checkbox"
                checked={required}
                onChange={(e) => handleFieldChange("required", e.target.checked)}
                style={{
                  width: 14,
                  height: 14,
                  cursor: "pointer",
                }}
              />
              Variable is required
            </label>
            <div style={{
              fontSize: 10,
              color: "#a0aec0",
              marginTop: 2,
              marginLeft: 22,
            }}>
              If checked, execution will fail if variable doesn't exist and no default is provided
            </div>
          </div>
        </CollapsibleSection>
      )}

      {/* Scope and Persistence */}
      <CollapsibleSection 
        title="Scope & Persistence" 
        collapsed={scopeCollapsed}
        onToggle={() => setScopeCollapsed(!scopeCollapsed)}
      >
        <SelectEditor
          label="Scope"
          value={scope}
          fieldKey="scope"
          options={SCOPE_OPTIONS}
          zodType={null as any}
          onChange={(value) => handleFieldChange("scope", value)}
        />

        <div style={{ marginBottom: 16 }}>
          <label style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 12,
            color: "#e2e8f0",
            cursor: "pointer",
          }}>
            <input
              type="checkbox"
              checked={persistent}
              onChange={(e) => handleFieldChange("persistent", e.target.checked)}
              style={{
                width: 14,
                height: 14,
                cursor: "pointer",
              }}
            />
            Persistent across sessions
          </label>
          <div style={{
            fontSize: 10,
            color: "#a0aec0",
            marginTop: 2,
            marginLeft: 22,
          }}>
            Variable will be saved and restored between executions
          </div>
        </div>
      </CollapsibleSection>

      {/* Type Conversion Help */}
      {variableType !== "auto" && (
        <CollapsibleSection 
          title="Type Information" 
          collapsed={typeInfoCollapsed}
          onToggle={() => setTypeInfoCollapsed(!typeInfoCollapsed)}
        >
          <div style={{
            background: "#1a202c",
            border: "1px solid #4a5568",
            borderRadius: 4,
            padding: 12,
            fontSize: 11,
            color: "#e2e8f0",
            lineHeight: 1.4,
          }}>
            <div style={{ fontWeight: 500, marginBottom: 8 }}>
              {VARIABLE_TYPES.find(t => t.value === variableType)?.label} Format:
            </div>
            
            {variableType === "string" && (
              <div>
                <div>• Any text value</div>
                <div>• Example: "Hello World"</div>
              </div>
            )}
            
            {variableType === "number" && (
              <div>
                <div>• Numeric values (integer or decimal)</div>
                <div>• Examples: 42, 3.14, -10</div>
              </div>
            )}
            
            {variableType === "boolean" && (
              <div>
                <div>• true or false values</div>
                <div>• Examples: true, false</div>
                <div>• Also accepts: yes/no, 1/0</div>
              </div>
            )}
            
            {variableType === "array" && (
              <div>
                <div>• JSON array format</div>
                <div>• Examples: ["item1", "item2"], [1, 2, 3]</div>
              </div>
            )}
            
            {variableType === "object" && (
              <div>
                <div>• JSON object format</div>
                <div>• Example: {"{"}"name": "John", "age": 30{"}"}</div>
              </div>
            )}
          </div>
        </CollapsibleSection>
      )}

      {/* Preview */}
      <CollapsibleSection 
        title="Preview" 
        collapsed={previewCollapsed}
        onToggle={() => setPreviewCollapsed(!previewCollapsed)}
      >
        <div style={{
          background: "#1a202c",
          border: "1px solid #4a5568",
          borderRadius: 4,
          padding: 12,
          fontSize: 12,
          color: "#e2e8f0",
        }}>
          <div style={{ marginBottom: 8, fontWeight: 500 }}>
            {isSetVariable ? "Set Variable" : "Get Variable"} Configuration:
          </div>
          
          <div style={{ marginBottom: 4 }}>
            <span style={{ color: "#a0aec0" }}>Variable:</span> {variableName || "〈not set〉"}
          </div>
          <div style={{ marginBottom: 4 }}>
            <span style={{ color: "#a0aec0" }}>Type:</span> {VARIABLE_TYPES.find(t => t.value === variableType)?.label}
          </div>
          <div style={{ marginBottom: 4 }}>
            <span style={{ color: "#a0aec0" }}>Scope:</span> {SCOPE_OPTIONS.find(s => s.value === scope)?.label}
          </div>
          
          {isSetVariable && (
            <>
              <div style={{ marginBottom: 4 }}>
                <span style={{ color: "#a0aec0" }}>Allow Overwrite:</span> {allowOverwrite ? "Yes" : "No"}
              </div>
              {value && (
                <div style={{ 
                  marginTop: 8, 
                  padding: 8, 
                  background: "rgba(66, 153, 225, 0.1)",
                  borderRadius: 2,
                }}>
                  <div style={{ color: "#a0aec0", fontSize: 10, marginBottom: 4 }}>
                    Value to set:
                  </div>
                  <div style={{ fontFamily: "monospace", fontSize: 11 }}>
                    {value}
                  </div>
                </div>
              )}
            </>
          )}
          
          {isGetVariable && (
            <>
              <div style={{ marginBottom: 4 }}>
                <span style={{ color: "#a0aec0" }}>Required:</span> {required ? "Yes" : "No"}
              </div>
              {defaultValue && (
                <div style={{ 
                  marginTop: 8, 
                  padding: 8, 
                  background: "rgba(66, 153, 225, 0.1)",
                  borderRadius: 2,
                }}>
                  <div style={{ color: "#a0aec0", fontSize: 10, marginBottom: 4 }}>
                    Default value:
                  </div>
                  <div style={{ fontFamily: "monospace", fontSize: 11 }}>
                    {defaultValue}
                  </div>
                </div>
              )}
            </>
          )}
          
          <div style={{ marginTop: 8, fontSize: 10, color: "#a0aec0" }}>
            {persistent && "• Persistent across sessions"}
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );
};