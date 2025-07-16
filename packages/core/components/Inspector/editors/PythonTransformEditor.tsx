import React, { useState, useEffect } from "react";
import { BaseNodeEditor, BaseNodeEditorProps } from "../BaseNodeEditor";
import { TextFieldEditor } from "../TextFieldEditor";
import { TextAreaEditor } from "../TextAreaEditor";
import { SelectEditor, SelectOption } from "../SelectEditor";
import { CollapsibleSection } from "../CollapsibleSection";

export interface PythonTransformEditorProps extends Omit<BaseNodeEditorProps, 'children'> {
  // Python specific props can be added here
}

const MEMORY_LIMIT_OPTIONS: SelectOption[] = [
  { value: "64MB", label: "64MB" },
  { value: "128MB", label: "128MB" },
  { value: "256MB", label: "256MB" },
  { value: "512MB", label: "512MB" },
  { value: "1GB", label: "1GB" },
];

const TIMEOUT_OPTIONS: SelectOption[] = [
  { value: "5", label: "5 seconds" },
  { value: "10", label: "10 seconds" },
  { value: "30", label: "30 seconds" },
  { value: "60", label: "1 minute" },
  { value: "300", label: "5 minutes" },
];

const FALLBACK_BEHAVIOR_OPTIONS: SelectOption[] = [
  { value: "error", label: "Throw Error" },
  { value: "skip", label: "Skip (Empty Output)" },
  { value: "default", label: "Use Default Value" },
];

const COMMON_MODULES = [
  'json', 'math', 'datetime', 'random', 'string', 'itertools',
  'collections', 'functools', 'operator', 'copy', 'uuid', 'hashlib',
  're', 'base64', 'urllib.parse'
];

export const PythonTransformEditor: React.FC<PythonTransformEditorProps> = (props) => {
  const { nodeData, onChange } = props;
  
  // Python specific fields
  const code = (nodeData.code as string) || `def transform(input_data):\n    # Your Python code here\n    return input_data`;
  const timeout = (nodeData.timeout as number) || 30;
  const memoryLimit = (nodeData.memoryLimit as string) || "128MB";
  const allowedModules = (nodeData.allowedModules as string[]) || ['json', 'math', 'datetime'];
  const pythonConfig = (nodeData.pythonConfig as any) || {};
  
  const strictMode = pythonConfig.strictMode ?? true;
  const enableCaching = pythonConfig.enableCaching ?? true;
  const executorUrl = pythonConfig.executorUrl || "";
  const retryAttempts = pythonConfig.retryAttempts || 3;
  const fallbackBehavior = pythonConfig.fallbackBehavior || "error";
  const defaultOutput = pythonConfig.defaultOutput || "";

  // State for collapsible sections
  const [codeEditorCollapsed, setCodeEditorCollapsed] = useState(false);
  const [resourcesCollapsed, setResourcesCollapsed] = useState(false);
  const [modulesCollapsed, setModulesCollapsed] = useState(true);
  const [advancedCollapsed, setAdvancedCollapsed] = useState(true);
  const [previewCollapsed, setPreviewCollapsed] = useState(true);

  // State for validation
  const [codeValidation, setCodeValidation] = useState<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  } | null>(null);

  const [isValidating, setIsValidating] = useState(false);

  const handleFieldChange = (field: string, value: unknown) => {
    onChange({ [field]: value });
  };

  const handlePythonConfigChange = (field: string, value: unknown) => {
    onChange({ 
      pythonConfig: { 
        ...pythonConfig, 
        [field]: value 
      } 
    });
  };

  const handleModuleToggle = (module: string) => {
    const newModules = allowedModules.includes(module)
      ? allowedModules.filter(m => m !== module)
      : [...allowedModules, module];
    onChange({ allowedModules: newModules });
  };

  const addCustomModule = () => {
    const moduleName = prompt("Enter module name:");
    if (moduleName && !allowedModules.includes(moduleName)) {
      onChange({ allowedModules: [...allowedModules, moduleName] });
    }
  };

  const removeModule = (module: string) => {
    onChange({ allowedModules: allowedModules.filter(m => m !== module) });
  };

  // Validate code on change (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (code.trim()) {
        validateCode();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [code]);

  const validateCode = async () => {
    setIsValidating(true);
    try {
      // In a real implementation, this would call the Python executor's validate endpoint
      // For now, we'll do basic validation
      const errors: string[] = [];
      const warnings: string[] = [];

      // Check for required transform function
      if (!code.includes('def transform(')) {
        errors.push('Code must define a transform function');
      }

      // Check for dangerous patterns
      const dangerousPatterns = [
        'eval(', 'exec(', '__import__', 'open(', 'file(',
        'subprocess', 'os.system', 'socket.', 'urllib.'
      ];

      for (const pattern of dangerousPatterns) {
        if (code.includes(pattern)) {
          warnings.push(`Potentially dangerous pattern detected: ${pattern}`);
        }
      }

      // Check for infinite loops
      if (code.includes('while True:')) {
        warnings.push('Potential infinite loop detected');
      }

      setCodeValidation({
        valid: errors.length === 0,
        errors,
        warnings
      });
    } catch (error) {
      setCodeValidation({
        valid: false,
        errors: ['Validation service unavailable'],
        warnings: []
      });
    } finally {
      setIsValidating(false);
    }
  };

  const getCodeEditorStyles = () => {
    const baseStyles = {
      fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
      fontSize: 12,
      lineHeight: 1.4,
      padding: 12,
      border: "1px solid #4a5568",
      borderRadius: 4,
      background: "#1a202c",
      color: "#e2e8f0",
      resize: "vertical" as const,
      minHeight: 200,
      maxHeight: 400,
    };

    if (codeValidation && !codeValidation.valid) {
      return { ...baseStyles, borderColor: "#e53e3e" };
    }

    return baseStyles;
  };

  return (
    <div className="python-transform-editor">
      {/* Code Editor */}
      <CollapsibleSection 
        title="Python Code" 
        collapsed={codeEditorCollapsed}
        onToggle={() => setCodeEditorCollapsed(!codeEditorCollapsed)}
      >
        <div style={{ marginBottom: 8 }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}>
            <label style={{ 
              fontWeight: 500, 
              color: "#e2e8f0",
              fontSize: 12,
            }}>
              Transform Function
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              {isValidating && (
                <span style={{ fontSize: 10, color: "#4299e1" }}>
                  Validating...
                </span>
              )}
              <button
                onClick={validateCode}
                disabled={isValidating}
                style={{
                  padding: "4px 8px",
                  fontSize: 10,
                  background: "#4299e1",
                  border: "none",
                  borderRadius: 2,
                  color: "white",
                  cursor: "pointer",
                  opacity: isValidating ? 0.5 : 1,
                }}
              >
                Validate
              </button>
            </div>
          </div>

          <textarea
            value={code}
            onChange={(e) => handleFieldChange("code", e.target.value)}
            placeholder="def transform(input_data):\n    # Your Python code here\n    return input_data"
            style={getCodeEditorStyles()}
          />

          {/* Validation Results */}
          {codeValidation && (
            <div style={{ marginTop: 8 }}>
              {codeValidation.errors.length > 0 && (
                <div style={{
                  background: "rgba(229, 62, 62, 0.1)",
                  border: "1px solid #e53e3e",
                  borderRadius: 4,
                  padding: 8,
                  marginBottom: 8,
                }}>
                  <div style={{ color: "#e53e3e", fontSize: 10, fontWeight: 500, marginBottom: 4 }}>
                    Validation Errors:
                  </div>
                  {codeValidation.errors.map((error, index) => (
                    <div key={index} style={{ color: "#e53e3e", fontSize: 10 }}>
                      • {error}
                    </div>
                  ))}
                </div>
              )}

              {codeValidation.warnings.length > 0 && (
                <div style={{
                  background: "rgba(237, 137, 54, 0.1)",
                  border: "1px solid #ed8936",
                  borderRadius: 4,
                  padding: 8,
                  marginBottom: 8,
                }}>
                  <div style={{ color: "#ed8936", fontSize: 10, fontWeight: 500, marginBottom: 4 }}>
                    Validation Warnings:
                  </div>
                  {codeValidation.warnings.map((warning, index) => (
                    <div key={index} style={{ color: "#ed8936", fontSize: 10 }}>
                      • {warning}
                    </div>
                  ))}
                </div>
              )}

              {codeValidation.valid && codeValidation.errors.length === 0 && (
                <div style={{
                  background: "rgba(56, 178, 172, 0.1)",
                  border: "1px solid #38b2ac",
                  borderRadius: 4,
                  padding: 8,
                  marginBottom: 8,
                }}>
                  <div style={{ color: "#38b2ac", fontSize: 10, fontWeight: 500 }}>
                    ✓ Code validation passed
                  </div>
                </div>
              )}
            </div>
          )}

          <div style={{
            fontSize: 10,
            color: "#a0aec0",
            lineHeight: 1.4,
          }}>
            <strong>Requirements:</strong><br />
            • Must define a <code>transform(input_data)</code> function<br />
            • Function should return a string or value that can be converted to string<br />
            • Use <code>input_data</code> parameter to access the input from connected nodes<br />
            • Access context variables via <code>context['variable_name']</code>
          </div>
        </div>
      </CollapsibleSection>

      {/* Resource Configuration */}
      <CollapsibleSection 
        title="Resource Limits" 
        collapsed={resourcesCollapsed}
        onToggle={() => setResourcesCollapsed(!resourcesCollapsed)}
      >
        <SelectEditor
          label="Memory Limit"
          value={memoryLimit}
          fieldKey="memoryLimit"
          options={MEMORY_LIMIT_OPTIONS}
          zodType={null as any}
          onChange={(value) => handleFieldChange("memoryLimit", value)}
        />

        <SelectEditor
          label="Timeout"
          value={timeout.toString()}
          fieldKey="timeout"
          options={TIMEOUT_OPTIONS}
          zodType={null as any}
          onChange={(value) => handleFieldChange("timeout", parseInt(value as string))}
        />

        <div style={{
          fontSize: 10,
          color: "#a0aec0",
          lineHeight: 1.4,
          marginTop: 8,
        }}>
          Resource limits help prevent runaway code from consuming excessive system resources.
          Set appropriate limits based on your expected processing requirements.
        </div>
      </CollapsibleSection>

      {/* Allowed Modules */}
      <CollapsibleSection 
        title="Allowed Modules" 
        collapsed={modulesCollapsed}
        onToggle={() => setModulesCollapsed(!modulesCollapsed)}
      >
        <div style={{ marginBottom: 12 }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}>
            <label style={{ 
              fontWeight: 500, 
              color: "#e2e8f0",
              fontSize: 12,
            }}>
              Available Modules
            </label>
            <button
              onClick={addCustomModule}
              style={{
                padding: "4px 8px",
                fontSize: 10,
                background: "#4299e1",
                border: "none",
                borderRadius: 2,
                color: "white",
                cursor: "pointer",
              }}
            >
              + Custom
            </button>
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, color: "#a0aec0", marginBottom: 8 }}>
              Common Modules:
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {COMMON_MODULES.map((module) => (
                <button
                  key={module}
                  onClick={() => handleModuleToggle(module)}
                  style={{
                    padding: "2px 6px",
                    fontSize: 10,
                    background: allowedModules.includes(module) ? "#4299e1" : "#4a5568",
                    border: "none",
                    borderRadius: 2,
                    color: "white",
                    cursor: "pointer",
                    opacity: allowedModules.includes(module) ? 1 : 0.7,
                  }}
                >
                  {module}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 10, color: "#a0aec0", marginBottom: 8 }}>
              Currently Allowed:
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {allowedModules.map((module) => (
                <div
                  key={module}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "2px 6px",
                    background: "#2d3748",
                    border: "1px solid #4a5568",
                    borderRadius: 2,
                    fontSize: 10,
                    color: "#e2e8f0",
                  }}
                >
                  {module}
                  <button
                    onClick={() => removeModule(module)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#e53e3e",
                      cursor: "pointer",
                      fontSize: 10,
                      padding: 0,
                      width: 12,
                      height: 12,
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Advanced Configuration */}
      <CollapsibleSection 
        title="Advanced Settings" 
        collapsed={advancedCollapsed}
        onToggle={() => setAdvancedCollapsed(!advancedCollapsed)}
      >
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
              checked={strictMode}
              onChange={(e) => handlePythonConfigChange("strictMode", e.target.checked)}
              style={{
                width: 14,
                height: 14,
                cursor: "pointer",
              }}
            />
            Strict Mode
          </label>
          <div style={{
            fontSize: 10,
            color: "#a0aec0",
            marginTop: 2,
            marginLeft: 22,
          }}>
            Enable additional security restrictions and validation
          </div>
        </div>

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
              checked={enableCaching}
              onChange={(e) => handlePythonConfigChange("enableCaching", e.target.checked)}
              style={{
                width: 14,
                height: 14,
                cursor: "pointer",
              }}
            />
            Enable Caching
          </label>
          <div style={{
            fontSize: 10,
            color: "#a0aec0",
            marginTop: 2,
            marginLeft: 22,
          }}>
            Cache execution results for identical inputs to improve performance
          </div>
        </div>

        <TextFieldEditor
          label="Executor URL (Optional)"
          value={executorUrl}
          fieldKey="executorUrl"
          zodType={null as any}
          onChange={(value) => handlePythonConfigChange("executorUrl", value)}
          placeholder="http://localhost:8001"
        />

        <TextFieldEditor
          label="Retry Attempts"
          value={retryAttempts.toString()}
          fieldKey="retryAttempts"
          zodType={null as any}
          onChange={(value) => handlePythonConfigChange("retryAttempts", parseInt(value as string) || 0)}
          placeholder="3"
        />

        <SelectEditor
          label="Fallback Behavior"
          value={fallbackBehavior}
          fieldKey="fallbackBehavior"
          options={FALLBACK_BEHAVIOR_OPTIONS}
          zodType={null as any}
          onChange={(value) => handlePythonConfigChange("fallbackBehavior", value)}
        />

        {fallbackBehavior === 'default' && (
          <TextAreaEditor
            label="Default Output"
            value={defaultOutput}
            fieldKey="defaultOutput"
            zodType={null as any}
            onChange={(value) => handlePythonConfigChange("defaultOutput", value)}
            placeholder="Enter default output to use when execution fails..."
            rows={3}
          />
        )}
      </CollapsibleSection>

      {/* Preview */}
      <CollapsibleSection 
        title="Configuration Preview" 
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
            Python Execution Configuration:
          </div>
          
          <div style={{ marginBottom: 4 }}>
            <span style={{ color: "#a0aec0" }}>Memory Limit:</span> {memoryLimit}
          </div>
          <div style={{ marginBottom: 4 }}>
            <span style={{ color: "#a0aec0" }}>Timeout:</span> {timeout} seconds
          </div>
          <div style={{ marginBottom: 4 }}>
            <span style={{ color: "#a0aec0" }}>Modules:</span> {allowedModules.join(", ")}
          </div>
          <div style={{ marginBottom: 4 }}>
            <span style={{ color: "#a0aec0" }}>Strict Mode:</span> {strictMode ? "Enabled" : "Disabled"}
          </div>
          <div style={{ marginBottom: 4 }}>
            <span style={{ color: "#a0aec0" }}>Caching:</span> {enableCaching ? "Enabled" : "Disabled"}
          </div>
          <div style={{ marginBottom: 4 }}>
            <span style={{ color: "#a0aec0" }}>Fallback:</span> {fallbackBehavior}
          </div>
          
          {executorUrl && (
            <div style={{ marginBottom: 4 }}>
              <span style={{ color: "#a0aec0" }}>Custom Executor:</span> {executorUrl}
            </div>
          )}

          <div style={{ 
            marginTop: 8, 
            padding: 8, 
            background: "rgba(66, 153, 225, 0.1)",
            borderRadius: 2,
          }}>
            <div style={{ color: "#a0aec0", fontSize: 10, marginBottom: 4 }}>
              Code Preview:
            </div>
            <div style={{ 
              fontFamily: "monospace", 
              fontSize: 9, 
              maxHeight: 100, 
              overflow: "auto",
              whiteSpace: "pre-wrap"
            }}>
              {code.slice(0, 200)}{code.length > 200 ? "..." : ""}
            </div>
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );
};