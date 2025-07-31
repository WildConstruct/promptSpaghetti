# Template Parsing Specification

## Overview

This specification defines how the template-based variable system works in Epic 8, replacing manual variable entry with natural language template syntax.

## Template Syntax

### Basic Variable Syntax

```typescript
// Basic variable placeholder
'A {creature} in a {setting}';

// Variables extracted: ["creature", "setting"]
```

### Supported Patterns

```typescript
// Single word variables
'{color} dragon'; // ✅ Valid

// Multi-word variables (underscore or camelCase)
'{background_color}'; // ✅ Valid
'{backgroundColor}'; // ✅ Valid

// Numbers in variable names
'{option1}'; // ✅ Valid
'{setting2}'; // ✅ Valid
```

### Invalid Patterns

```typescript
// Spaces in variable names
'{background color}'; // ❌ Invalid

// Special characters
'{color-code}'; // ❌ Invalid
'{user@name}'; // ❌ Invalid

// Empty variables
'{}'; // ❌ Invalid

// Nested braces
'{{variable}}'; // ❌ Invalid
'{outer{inner}}'; // ❌ Invalid
```

## Parsing Algorithm

### Variable Extraction

```typescript
function extractVariables(template: string): ExtractedVariable[] {
  const regex = /\{(\w+)\}/g;
  const variables: ExtractedVariable[] = [];
  let match;

  while ((match = regex.exec(template)) !== null) {
    variables.push({
      name: match[1], // Variable name without braces
      placeholder: match[0], // Full {variable} text
      position: match.index, // Character position in template
    });
  }

  return variables;
}
```

### Validation Rules

```typescript
function validateTemplate(template: string): ValidationResult {
  const errors: string[] = [];

  // 1. Check balanced braces
  const openCount = (template.match(/\{/g) || []).length;
  const closeCount = (template.match(/\}/g) || []).length;
  if (openCount !== closeCount) {
    errors.push('Unmatched braces in template');
  }

  // 2. Check for empty variables
  if (template.includes('{}')) {
    errors.push('Empty variable names not allowed');
  }

  // 3. Check for invalid characters in variable names
  const invalidVars = template.match(/\{[^}\w]*\}/g);
  if (invalidVars) {
    errors.push(`Invalid characters in variables: ${invalidVars.join(', ')}`);
  }

  // 4. Check for nested braces
  if (template.includes('{{') || template.includes('}}')) {
    errors.push('Nested braces not supported');
  }

  return { valid: errors.length === 0, errors };
}
```

## Template Preview System

### Real-time Preview

```typescript
function previewTemplate(template: string, variables: Record<string, string>): string {
  let result = template;

  // Replace each variable with its value
  Object.entries(variables).forEach(([name, value]) => {
    const placeholder = `{${name}}`;
    const regex = new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g');
    result = result.replace(regex, value || `{${name}}`);
  });

  return result;
}
```

### Sample Variable Generation

```typescript
function generateSampleVariables(variables: ExtractedVariable[]): Record<string, string> {
  const samples: Record<string, string> = {};

  variables.forEach(variable => {
    samples[variable.name] = getSampleValue(variable.name);
  });

  return samples;
}

function getSampleValue(variableName: string): string {
  const name = variableName.toLowerCase();

  // Context-aware sample generation
  const sampleMap: Record<string, string> = {
    creature: 'dragon',
    animal: 'wolf',
    color: 'crimson',
    style: 'dramatic',
    setting: 'enchanted forest',
    location: 'ancient castle',
    character: 'warrior',
    person: 'wizard',
    time: 'at sunset',
    weather: 'stormy',
    mood: 'mysterious',
    object: 'glowing orb',
    action: 'flying',
  };

  // Find best match for variable name
  for (const [key, value] of Object.entries(sampleMap)) {
    if (name.includes(key)) {
      return value;
    }
  }

  // Default sample
  return `sample ${variableName}`;
}
```

## UI Integration Patterns

### Template Input Component

```typescript
interface TemplateInputProps {
  value: string;
  onChange: (template: string) => void;
  onVariablesChange: (variables: ExtractedVariable[]) => void;
}

function TemplateInput({ value, onChange, onVariablesChange }: TemplateInputProps) {
  const [variables, setVariables] = useState<ExtractedVariable[]>([]);

  useEffect(() => {
    const extracted = NodeAdapter.extractVariables(value);
    setVariables(extracted);
    onVariablesChange(extracted);
  }, [value]);

  return (
    <div className="template-input">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter template with {variables}..."
      />
      <VariableHighlight template={value} variables={variables} />
      <TemplatePreview template={value} variables={variables} />
    </div>
  );
}
```

### Variable Highlighting

```typescript
function VariableHighlight({ template, variables }: HighlightProps) {
  const highlightedTemplate = useMemo(() => {
    let result = template;

    // Highlight each variable with distinct colors
    variables.forEach((variable, index) => {
      const color = getVariableColor(index);
      const highlighted = `<span style="color: ${color}; background: ${color}20">${variable.placeholder}</span>`;
      result = result.replace(variable.placeholder, highlighted);
    });

    return result;
  }, [template, variables]);

  return <div dangerouslySetInnerHTML={{ __html: highlightedTemplate }} />;
}
```

### Variable Connection Ports

```typescript
function NodeWithVariablePorts({ node, variables }: NodePortsProps) {
  return (
    <div className="node-with-ports">
      <div className="input-ports">
        {variables.map(variable => (
          <VariablePort
            key={variable.name}
            variable={variable}
            type="input"
            onConnect={handleVariableConnect}
          />
        ))}
      </div>

      <NodeContent node={node} />

      <div className="output-port">
        <Port type="output" />
      </div>
    </div>
  );
}
```

## Error Handling

### Template Validation Errors

```typescript
interface TemplateError {
  type: 'syntax' | 'validation' | 'runtime';
  message: string;
  position?: number;
  suggestions?: string[];
}

function getTemplateErrors(template: string): TemplateError[] {
  const errors: TemplateError[] = [];

  // Syntax errors
  const validation = validateTemplate(template);
  if (!validation.valid) {
    errors.push(
      ...validation.errors.map(error => ({
        type: 'syntax' as const,
        message: error,
        suggestions: getSyntaxSuggestions(error),
      }))
    );
  }

  // Variable name warnings
  const variables = NodeAdapter.extractVariables(template);
  variables.forEach(variable => {
    if (variable.name.length < 2) {
      errors.push({
        type: 'validation',
        message: `Variable name "${variable.name}" is too short`,
        position: variable.position,
        suggestions: ['Use descriptive variable names (e.g., "color", "style")'],
      });
    }
  });

  return errors;
}
```

### Runtime Error Recovery

```typescript
function safeTemplatePreview(
  template: string,
  variables: Record<string, string>
): { result: string; errors: string[] } {
  const errors: string[] = [];

  try {
    const validation = validateTemplate(template);
    if (!validation.valid) {
      return {
        result: template,
        errors: validation.errors,
      };
    }

    const result = previewTemplate(template, variables);
    return { result, errors: [] };
  } catch (error) {
    errors.push(`Template processing error: ${error.message}`);
    return { result: template, errors };
  }
}
```

## Performance Considerations

### Template Parsing Cache

```typescript
class TemplateCache {
  private cache = new Map<string, ExtractedVariable[]>();
  private maxSize = 100;

  extractVariables(template: string): ExtractedVariable[] {
    if (this.cache.has(template)) {
      return this.cache.get(template)!;
    }

    const variables = NodeAdapter.extractVariables(template);

    // LRU cache management
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(template, variables);
    return variables;
  }
}
```

### Debounced Validation

```typescript
function useTemplateValidation(template: string, delay = 300) {
  const [validation, setValidation] = useState<ValidationResult>({ valid: true, errors: [] });

  const debouncedValidate = useMemo(
    () =>
      debounce((template: string) => {
        const result = validateTemplate(template);
        setValidation(result);
      }, delay),
    [delay]
  );

  useEffect(() => {
    debouncedValidate(template);
  }, [template, debouncedValidate]);

  return validation;
}
```

## Integration with Existing System

### Backward Compatibility

```typescript
// Migrate existing nodes to template system
function migrateToTemplateSystem(oldNode: InternalNode): UINode {
  if (oldNode.type === 'WeightedChoice') {
    return {
      type: 'WeightedChoice',
      choices: extractChoicesFromOldFormat(oldNode),
      name: oldNode.name || 'Choice Node',
    };
  }

  // Handle other node types...
}
```

### Export Compatibility

```typescript
// Ensure exported templates work in other systems
function exportTemplate(template: string): ExportedTemplate {
  return {
    template,
    variables: NodeAdapter.extractVariables(template),
    format: 'prompt-spaghetti-v2',
    compatibility: {
      version: '2.0',
      backwardCompatible: true,
    },
  };
}
```

This specification provides the foundation for a natural, designer-friendly template system that eliminates the need for manual variable configuration while maintaining full functionality.
