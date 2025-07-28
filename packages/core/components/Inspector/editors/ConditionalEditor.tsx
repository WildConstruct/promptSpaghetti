import React from 'react';
import { BaseNodeEditorProps } from '../BaseNodeEditor';
import { TextFieldEditor } from '../TextFieldEditor';
import { TextAreaEditor } from '../TextAreaEditor';
import { ProgressiveDisclosureSection } from '../ProgressiveDisclosureSection';
import { ConditionalBranch } from '../../../runtime/nodes/Conditional';

export interface ConditionalEditorProps extends Omit<BaseNodeEditorProps, 'children'> {
  nodeId: string;

/**
 * Epic 8.4 - Conditional Editor with Progressive Disclosure
 * 
 * Three-tier disclosure system:
 * - Basic: Node name, default output, and simple conditional branches
 * - Advanced: Branch management and conditional logic controls
 * - Debug: Technical settings, strict mode, variable access controls
 */

export const defaultOutput = (nodeData.defaultOutput as string) || '';
  const name = (nodeData.name as string) || (nodeData.label as string) || 'Conditional';
  const allowVariableAccess = (nodeData.allowVariableAccess as boolean) ?? true;
  const strictMode = (nodeData.strictMode as boolean) ?? false;
  // No manual collapse state needed - managed by ProgressiveDisclosureSection
  const handleBranchesChange = (newBranches: ConditionalBranch) => {
    onChange({ branches: newBranches });
  };
  const handleAddBranch = () => {
    const newBranch: ConditionalBranch = {,
  condition: '',
      output: '',
      label: `Branch ${branches.length + 1}`}
    };
    handleBranchesChange([...branches, newBranch]);
  };
  const handleRemoveBranch = (index: number) => {
    const newBranches = branches.filter((_, i) => i !== index);
    handleBranchesChange(newBranches);
  };
  const handleUpdateBranch = (index: number, field: keyof ConditionalBranch, value: string) => {
    const newBranches = [...branches];
    newBranches[index] = { ...newBranches[index], [field]: value };
    handleBranchesChange(newBranches);
  };
  const handleNameChange = (value: unknown) => {
    onChange({ name: value as string, label: value as string });
  };
  const handleDefaultOutputChange = (value: unknown) => {
    onChange({ defaultOutput: value as string });
  };
  const handleAllowVariableAccessChange = (value: unknown) => {
    onChange({ allowVariableAccess: Boolean(value) });
  };
  const handleStrictModeChange = (value: unknown) => {
    onChange({ strictMode: Boolean(value) });
  };
  return;
    <div className="conditional-editor">
      {/* BASIC LEVEL: Essential conditional settings */}
      <ProgressiveDisclosureSection
        title="Essential Settings"
        level="basic"
        description="Core conditional logic for smart storytelling"
        defaultExpanded={true}
        priority="critical"
        fieldName="name"
      >
        <div style={{ marginBottom: 16 }}>
          <TextFieldEditor
            label="Decision Name"
            value={name}
            fieldKey="name"
            zodType={null}
            onChange={handleNameChange}
            placeholder="e.g., Character Response, Plot Branch, Scene Choice"
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <TextAreaEditor
            label="Default Response"
            value={defaultOutput}
            fieldKey="defaultOutput"
            zodType={null}
            onChange={handleDefaultOutputChange}
            placeholder="What should happen when no specific conditions are met..."
            rows={2}
          />
          <div style={{
  fontSize: 10,
  color: '#a0aec0',
  marginTop: 4,
}}>
            This will be used when none of your conditions match
          </div>
        </div>
      </ProgressiveDisclosureSection>
      {/* ADVANCED LEVEL: Conditional branches and logic controls */}
      <ProgressiveDisclosureSection
        title="Conditional Logic"
        level="advanced"
        description="Define conditions that trigger different responses"
        defaultExpanded={false}
        priority="important"
        fieldName="branches"
      >
        <div style={{ marginBottom: 12 }}>
          <div style={{
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 8,
}}>
            <label style={{
  fontWeight: 500,
  color: '#e2e8f0',
  fontSize: 12,
}}>
              Conditional Logic
            </label>
            <button
              onClick={handleAddBranch}
              style={{
  padding: '4px 8px',
  fontSize: 10,
  background: '#4299e1',
  border: 'none',
  borderRadius: 2,
  color: '#fff',
  cursor: 'pointer',
}}
            >
              Add Branch
            </button>
          </div>
          {branches.length === 0 ? ()
            <div style={{
  background: '#2d3748',
  border: '1px solid #4a5568',
  borderRadius: 4,
  padding: 16,
  textAlign: 'center',
  color: '#a0aec0',
  fontSize: 12,
  fontStyle: 'italic',
}}>
              No conditional branches. Add a branch to start building logic.
            </div>
          ) : ()
            <div style={{
  background: '#2d3748',
  border: '1px solid #4a5568',
  borderRadius: 4,
  padding: 8,
}}>
              {branches.map((branch, index) => ()
                <div
                  key={index}
                  style={{
  background: '#1a202c',
  border: '1px solid #4a5568',
  borderRadius: 4,
  padding: 12,
  marginBottom: index < branches.length - 1 ? 8 : 0,
}}
                >
                  <div style={{
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 8,
}}>
                    <input
                      type="text"
                      value={branch.label || `Branch ${index + 1}`}
                      onChange={(e) => handleUpdateBranch(index, 'label', e.target.value)}
                      style={{
  background: '#2d3748',
  border: '1px solid #4a5568',
  borderRadius: 2,
  padding: '2px 6px',
  color: '#e2e8f0',
  fontSize: 11,
  fontWeight: 500,
  flex: 1,
  marginRight: 8,
}}
                      placeholder={`Branch ${index + 1}`}
                    />
                    <button
                      onClick={() => handleRemoveBranch(index)}
                      style={{
  background: '#e53e3e',
  border: 'none',
  borderRadius: 2,
  color: '#fff',
  cursor: 'pointer',
  padding: '2px 6px',
  fontSize: 10,
}}
                    >
                      Remove
                    </button>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <label style={{
  display: 'block',
  fontSize: 10,
  color: '#a0aec0',
  marginBottom: 4,
}}>
                      Condition Expression
                    </label>
                    <input
                      type="text"
                      value={branch.condition}
                      onChange={(e) => handleUpdateBranch(index, 'condition', e.target.value)}
                      style={{
  width: '100%',
  padding: 4,
  border: '1px solid #4a5568',
  borderRadius: 2,
  background: '#2d3748',
  color: '#e2e8f0',
  fontSize: 11,
  fontFamily: 'monospace',
}}
                      placeholder="e.g., variable > 5, hasVariable('debug'), startsWith(text, 'hello')"
                    />
                  </div>
                  <div>
                    <label style={{
  display: 'block',
  fontSize: 10,
  color: '#a0aec0',
  marginBottom: 4,
}}>
                      Output Value
                    </label>
                    <textarea
                      value={branch.output}
                      onChange={(e) => handleUpdateBranch(index, 'output', e.target.value)}
                      rows={2}
                      style={{
  width: '100%',
  padding: 4,
  border: '1px solid #4a5568',
  borderRadius: 2,
  background: '#2d3748',
  color: '#e2e8f0',
  fontSize: 11,
  resize: 'vertical',
  minHeight: 32,
}}
                      placeholder="Output when condition is true..."
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Expression Help */}
        <div style={{
  background: '#1a202c',
  border: '1px solid #4a5568',
  borderRadius: 4,
  padding: 8,
  marginTop: 12,
}}>
          <div style={{
  fontSize: 11,
  fontWeight: 500,
  color: '#e2e8f0',
  marginBottom: 4,
}}>
            Available Expression Functions:
          </div>
          <div style={{
  fontSize: 10,
  color: '#a0aec0',
  fontFamily: 'monospace',
  lineHeight: 1.4,
}}>
            • Variable access: variable, hasVariable('name'), getVariable('name', 'default')<br/>
            • Comparisons: ===, !==, {'>'}, {'<'}, {'>='}, {'<='}, &amp;&amp;, ||, !<br/>
            • Strings: startsWith(str, 'prefix'), includes(str, 'substring'), isEmpty(str)<br/>
            • Arrays: includes(arr, item), length(arr)<br/>
            • Math: +, -, *, /, %, Math.min, Math.max, Math.abs<br/>
            • Regex: matches(str, 'pattern')
          </div>
        </div>
      </ProgressiveDisclosureSection>
      {/* DEBUG LEVEL: Technical settings and advanced options */}
      <ProgressiveDisclosureSection
        title="Technical Settings & Preview"
        level="debug"
        description="Advanced expression controls and execution preview"
        defaultExpanded={false}
        priority="supplementary"
        fieldName="settings"
      >
        {/* Technical Settings */}
        <div style={{ marginBottom: 16 }}>
          <div style={{
  fontSize: 11,
  fontWeight: 500,
  color: '#e2e8f0',
  marginBottom: 8,
}}>
            Expression Engine Settings:
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{
  display: 'flex',
  alignItems: 'center',
  fontSize: 12,
  color: '#e2e8f0',
  cursor: 'pointer',
}}>
              <input
                type="checkbox"
                checked={allowVariableAccess}
                onChange={(e) => handleAllowVariableAccessChange(e.target.checked)}
                style={{ marginRight: 8 }}
              />
              Allow Variable Access
            </label>
            <div style={{
  fontSize: 10,
  color: '#a0aec0',
  marginTop: 2,
  marginLeft: 20,
}}>
              Enable access to execution context variables in expressions
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{
  display: 'flex',
  alignItems: 'center',
  fontSize: 12,
  color: '#e2e8f0',
  cursor: 'pointer',
}}>
              <input
                type="checkbox"
                checked={strictMode}
                onChange={(e) => handleStrictModeChange(e.target.checked)}
                style={{ marginRight: 8 }}
              />
              Strict Mode
            </label>
            <div style={{
  fontSize: 10,
  color: '#a0aec0',
  marginTop: 2,
  marginLeft: 20,
}}>
              Throw errors on expression evaluation failures (otherwise treats as false)
            </div>
          </div>
        </div>
        {/* Debug Node Information */}
        <div style={{
  background: '#1a202c',
  border: '1px solid #4a5568',
  borderRadius: 4,
  padding: 8,
  marginBottom: 16,
}}>
          <div style={{
  fontSize: 11,
  fontWeight: 500,
  color: '#e2e8f0',
  marginBottom: 4,
}}>
            Node Configuration:
          </div>
          <div style={{ fontSize: 10, color: '#a0aec0', lineHeight: 1.4 }}>
            <div>Node ID: {props.nodeId}</div>
            <div>Type: Conditional</div>
            <div>Branches: {branches.length}</div>
            <div>Variable Access: {allowVariableAccess ? 'Enabled' : 'Disabled'}</div>
            <div>Strict Mode: {strictMode ? 'Enabled' : 'Disabled'}</div>
          </div>
        </div>
        <div style={{
  background: '#1a202c',
  border: '1px solid #4a5568',
  borderRadius: 4,
  padding: 12,
  fontSize: 12,
  color: '#e2e8f0',
}}>
          {branches.length === 0 ? ()
            <div style={{ color: '#a0aec0', fontStyle: 'italic' }}>
              Add conditional branches to see logic preview
            </div>
          ) : ()
            <div>
              <div style={{ marginBottom: 8, fontWeight: 500 }}>
                Execution Logic:
              </div>
              {branches.map((branch, index) => ()
                <div key={index} style={{
  marginBottom: 6,
  padding: '4px 8px',
  background: 'rgba(66, 153, 225, 0.1)',
  borderRadius: 2,
  borderLeft: '3px solid #4299e1',
}}>
                  <div style={{ fontWeight: 500, marginBottom: 2 }}>
                    {index === 0 ? 'IF' : 'ELSE IF'} {branch.label || `Branch ${index + 1}`}:}
                  </div>
                  <div style={{
  fontFamily: 'monospace',
  fontSize: 10,
  color: '#90cdf4',
  marginBottom: 2,
}}>
                    {branch.condition || 'No condition'}
                  </div>
                  <div style={{ fontSize: 10, color: '#a0aec0' }}>
                    → &quot;{branch.output || 'No output'}&quot;
                  </div>
                </div>
              ))}
              {defaultOutput && ()
                <div style={{
  marginTop: 8,
  padding: '4px 8px',
  background: 'rgba(237, 137, 54, 0.1)',
  borderRadius: 2,
  borderLeft: '3px solid #ed8936',
}}>
                  <div style={{ fontWeight: 500, marginBottom: 2 }}>
                    ELSE (Default):
                  </div>
                  <div style={{ fontSize: 10, color: '#a0aec0' }}>
                    → &quot;{defaultOutput}&quot;
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </ProgressiveDisclosureSection>
    </div>
  );
};