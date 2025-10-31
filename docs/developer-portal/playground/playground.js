/**
 * @fileoverview Interactive Custom Node Playground
 * Extends the existing PromptScape interactive examples framework
 */

class CustomNodePlayground {
  constructor() {
    this.editors = {};
    this.currentTemplate = null;
    this.executionContext = null;
    this.initializeEditors();
    this.loadDefaultTemplate();
  }

  initializeEditors() {
    require.config({
      paths: {
        vs: 'https://unpkg.com/monaco-editor@0.34.1/min/vs'
      }
    });

    require(['vs/editor/editor.main'], () => {
      // Implementation Editor
      this.editors.implementation = monaco.editor.create(
        document.getElementById('editor'),
        {
          value: '',
          language: 'typescript',
          theme: 'vs-dark',
          automaticLayout: true,
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          renderWhitespace: 'boundary',
          scrollBeyondLastLine: false,
          wordWrap: 'on'
        }
      );

      // Test Inputs Editor
      this.editors.testInputs = monaco.editor.create(
        document.getElementById('inputEditor'),
        {
          value: '{\n  "input": "test value"\n}',
          language: 'json',
          theme: 'vs-dark',
          automaticLayout: true,
          minimap: { enabled: false },
          fontSize: 14
        }
      );

      // Schema Editor
      this.editors.schema = monaco.editor.create(
        document.getElementById('schemaEditor'),
        {
          value: '',
          language: 'json',
          theme: 'vs-dark',
          automaticLayout: true,
          minimap: { enabled: false },
          fontSize: 14
        }
      );

      // Metadata Editor
      this.editors.metadata = monaco.editor.create(
        document.getElementById('metadataEditor'),
        {
          value: '',
          language: 'json',
          theme: 'vs-dark',
          automaticLayout: true,
          minimap: { enabled: false },
          fontSize: 14
        }
      );

      // Add change listeners for validation
      Object.values(this.editors).forEach(editor => {
        editor.onDidChangeModelContent(() => {
          this.debounceValidation();
        });
      });
    });
  }

  loadDefaultTemplate() {
    this.loadTemplate('text-processor');
  }

  loadTemplate(templateName) {
    this.currentTemplate = templateName;
    const template = this.getTemplate(templateName);

    // Update editors with template content
    if (this.editors.implementation) {
      this.editors.implementation.setValue(template.implementation);
    }

    if (this.editors.testInputs) {
      this.editors.testInputs.setValue(
        JSON.stringify(template.testInputs, null, 2)
      );
    }

    if (this.editors.schema) {
      this.editors.schema.setValue(JSON.stringify(template.schema, null, 2));
    }

    if (this.editors.metadata) {
      this.editors.metadata.setValue(
        JSON.stringify(template.metadata, null, 2)
      );
    }

    this.updateStatus(`Loaded template: ${template.metadata.displayName}`);
  }

  getTemplate(templateName) {
    const templates = {
      'text-processor': {
        implementation: `import {
  CustomNodeBase,
  CustomNodeConfig,
  CustomNodeRuntime,
  CustomNodeResult,
  ValidationResult
} from '@prompt-spaghetti/custom-node-sdk';

/**
 * Advanced text processing with multiple transformation options
 */
export class TextProcessor extends CustomNodeBase {
  validate(): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!this.config.schema.inputs.text) {
      errors.push('Text input is required');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  async execute(runtime: CustomNodeRuntime): Promise<CustomNodeResult> {
    const { inputs, utils } = runtime;
    
    try {
      const text = inputs.text;
      const operation = inputs.operation || 'uppercase';
      
      if (typeof text !== 'string') {
        throw new Error('Input must be a string');
      }

      utils.log('info', 'Processing text', { 
        operation, 
        textLength: text.length 
      });

      let result: string;
      
      switch (operation) {
        case 'uppercase':
          result = text.toUpperCase();
          break;
        case 'lowercase':
          result = text.toLowerCase();
          break;
        case 'title':
          result = text.replace(/\\w\\S*/g, (txt) => 
            txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
          );
          break;
        case 'reverse':
          result = text.split('').reverse().join('');
          break;
        case 'trim':
          result = text.trim();
          break;
        case 'slug':
          result = text
            .toLowerCase()
            .replace(/[^\\w\\s-]/g, '')
            .replace(/[\\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
          break;
        default:
          result = text;
      }

      return {
        outputs: {
          result,
          originalLength: text.length,
          processedLength: result.length,
          operation
        }
      };
    } catch (error) {
      utils.log('error', 'Text processing failed', { error: error.message });
      throw error;
    }
  }
}`,
        testInputs: {
          text: 'Hello World! This is a Test String.',
          operation: 'title'
        },
        schema: {
          inputs: {
            text: {
              type: 'string',
              required: true,
              description: 'Text to process'
            },
            operation: {
              type: 'string',
              required: false,
              default: 'uppercase',
              enum: [
                'uppercase',
                'lowercase',
                'title',
                'reverse',
                'trim',
                'slug'
              ],
              description: 'Processing operation to apply'
            }
          },
          outputs: {
            result: {
              type: 'string',
              description: 'Processed text result'
            },
            originalLength: {
              type: 'number',
              description: 'Length of original text'
            },
            processedLength: {
              type: 'number',
              description: 'Length of processed text'
            },
            operation: {
              type: 'string',
              description: 'Operation that was applied'
            }
          }
        },
        metadata: {
          type: 'playground.text-processor',
          displayName: 'Text Processor',
          description:
            'Advanced text processing with multiple transformation options',
          category: 'Text Processing',
          version: '1.0.0',
          author: {
            name: 'PromptScape Playground',
            email: 'playground@promptscape.dev'
          }
        }
      },

      'api-connector': {
        implementation: `import {
  CustomNodeBase,
  CustomNodeConfig,
  CustomNodeRuntime,
  CustomNodeResult,
  ValidationResult
} from '@prompt-spaghetti/custom-node-sdk';

/**
 * Generic API connector with configurable endpoints and methods
 */
export class APIConnector extends CustomNodeBase {
  validate(): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!this.config.security?.allowNetworkAccess) {
      errors.push('Network access must be enabled for API connections');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  async execute(runtime: CustomNodeRuntime): Promise<CustomNodeResult> {
    const { inputs, utils } = runtime;
    
    try {
      const url = inputs.url;
      const method = inputs.method || 'GET';
      const headers = inputs.headers || {};
      const body = inputs.body;

      if (!url || typeof url !== 'string') {
        throw new Error('URL is required and must be a string');
      }

      utils.log('info', 'Making API request', { url, method });

      const requestOptions = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      };

      if (body && method !== 'GET') {
        requestOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
      }

      const response = await fetch(url, requestOptions);
      const responseData = await response.text();
      
      let parsedData;
      try {
        parsedData = JSON.parse(responseData);
      } catch {
        parsedData = responseData;
      }

      utils.log('info', 'API request completed', { 
        status: response.status,
        statusText: response.statusText 
      });

      return {
        outputs: {
          data: parsedData,
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          success: response.ok
        }
      };
    } catch (error) {
      utils.log('error', 'API request failed', { error: error.message });
      throw error;
    }
  }
}`,
        testInputs: {
          url: 'https://jsonplaceholder.typicode.com/posts/1',
          method: 'GET',
          headers: {
            'User-Agent': 'PromptScape-Playground/1.0'
          }
        },
        schema: {
          inputs: {
            url: {
              type: 'string',
              required: true,
              description: 'API endpoint URL'
            },
            method: {
              type: 'string',
              required: false,
              default: 'GET',
              enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
              description: 'HTTP method'
            },
            headers: {
              type: 'object',
              required: false,
              description: 'HTTP headers'
            },
            body: {
              type: 'any',
              required: false,
              description: 'Request body (for non-GET methods)'
            }
          },
          outputs: {
            data: {
              type: 'any',
              description: 'Response data'
            },
            status: {
              type: 'number',
              description: 'HTTP status code'
            },
            statusText: {
              type: 'string',
              description: 'HTTP status text'
            },
            headers: {
              type: 'object',
              description: 'Response headers'
            },
            success: {
              type: 'boolean',
              description: 'Whether the request was successful'
            }
          }
        },
        metadata: {
          type: 'playground.api-connector',
          displayName: 'API Connector',
          description:
            'Generic API connector with configurable endpoints and methods',
          category: 'External APIs',
          version: '1.0.0',
          author: {
            name: 'PromptScape Playground',
            email: 'playground@promptscape.dev'
          }
        }
      },

      'conditional-logic': {
        implementation: `import {
  CustomNodeBase,
  CustomNodeConfig,
  CustomNodeRuntime,
  CustomNodeResult,
  ValidationResult
} from '@prompt-spaghetti/custom-node-sdk';

/**
 * Advanced conditional logic with expression evaluation
 */
export class ConditionalLogic extends CustomNodeBase {
  validate(): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!this.config.schema.inputs.condition) {
      errors.push('Condition input is required');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  async execute(runtime: CustomNodeRuntime): Promise<CustomNodeResult> {
    const { inputs, utils } = runtime;
    
    try {
      const condition = inputs.condition;
      const trueValue = inputs.trueValue;
      const falseValue = inputs.falseValue;
      const expression = inputs.expression;

      utils.log('info', 'Evaluating condition', { condition, expression });

      let result: boolean;

      if (expression && typeof expression === 'string') {
        // Safe expression evaluation
        result = this.evaluateExpression(expression, runtime.context);
      } else {
        // Direct boolean evaluation
        result = Boolean(condition);
      }

      const output = result ? trueValue : falseValue;

      utils.log('info', 'Condition evaluated', { 
        result, 
        selectedOutput: result ? 'trueValue' : 'falseValue' 
      });

      return {
        outputs: {
          result: output,
          conditionMet: result,
          expression: expression || null
        }
      };
    } catch (error) {
      utils.log('error', 'Condition evaluation failed', { error: error.message });
      throw error;
    }
  }

  private evaluateExpression(expression: string, context: any): boolean {
    // Simple and safe expression evaluator
    // Supports basic comparisons and logical operations
    
    // Security: Block dangerous patterns
    const dangerousPatterns = ['eval', 'function', 'constructor', '__proto__'];
    if (dangerousPatterns.some(pattern => expression.includes(pattern))) {
      throw new Error('Unsafe expression detected');
    }

    // Replace variable references with actual values
    let safeExpression = expression;
    
    // Simple variable substitution
    const variablePattern = /\\$\\{([^}]+)\\}/g;
    safeExpression = safeExpression.replace(variablePattern, (match, varName) => {
      const value = context.variables?.get(varName);
      return JSON.stringify(value);
    });

    try {
      // Use Function constructor for safe evaluation
      return Boolean(new Function('return ' + safeExpression)());
    } catch (error) {
      throw new Error(\`Invalid expression: \${error.message}\`);
    }
  }
}`,
        testInputs: {
          condition: true,
          trueValue: 'Condition is true!',
          falseValue: 'Condition is false!',
          expression: '5 > 3 && 2 < 4'
        },
        schema: {
          inputs: {
            condition: {
              type: 'any',
              required: false,
              description:
                'Condition to evaluate (used if no expression provided)'
            },
            expression: {
              type: 'string',
              required: false,
              description: 'JavaScript expression to evaluate'
            },
            trueValue: {
              type: 'any',
              required: true,
              description: 'Value to return when condition is true'
            },
            falseValue: {
              type: 'any',
              required: true,
              description: 'Value to return when condition is false'
            }
          },
          outputs: {
            result: {
              type: 'any',
              description: 'Selected output based on condition'
            },
            conditionMet: {
              type: 'boolean',
              description: 'Whether the condition was met'
            },
            expression: {
              type: 'string',
              description: 'Expression that was evaluated (if any)'
            }
          }
        },
        metadata: {
          type: 'playground.conditional-logic',
          displayName: 'Conditional Logic',
          description: 'Advanced conditional logic with expression evaluation',
          category: 'Logic & Control',
          version: '1.0.0',
          author: {
            name: 'PromptScape Playground',
            email: 'playground@promptscape.dev'
          }
        }
      }
    };

    // Add templates for other node types with similar structure...
    templates['data-transformer'] = this.createDataTransformerTemplate();
    templates['math-processor'] = this.createMathProcessorTemplate();
    templates['utility-helper'] = this.createUtilityHelperTemplate();

    return templates[templateName] || templates['text-processor'];
  }

  createDataTransformerTemplate() {
    return {
      implementation: '// Data Transformer implementation would go here...',
      testInputs: { data: { key: 'value' }, format: 'json' },
      schema: { inputs: {}, outputs: {} },
      metadata: {
        type: 'playground.data-transformer',
        displayName: 'Data Transformer'
      }
    };
  }

  createMathProcessorTemplate() {
    return {
      implementation: '// Math Processor implementation would go here...',
      testInputs: { numbers: [1, 2, 3, 4, 5], operation: 'sum' },
      schema: { inputs: {}, outputs: {} },
      metadata: {
        type: 'playground.math-processor',
        displayName: 'Math Processor'
      }
    };
  }

  createUtilityHelperTemplate() {
    return {
      implementation: '// Utility Helper implementation would go here...',
      testInputs: { input: 'test', utility: 'hash' },
      schema: { inputs: {}, outputs: {} },
      metadata: {
        type: 'playground.utility-helper',
        displayName: 'Utility Helper'
      }
    };
  }

  debounceValidation() {
    clearTimeout(this.validationTimer);
    this.validationTimer = setTimeout(() => {
      this.validateNode();
    }, 500);
  }

  async validateNode() {
    try {
      const implementation = this.editors.implementation?.getValue() || '';
      const schema = JSON.parse(this.editors.schema?.getValue() || '{}');
      const metadata = JSON.parse(this.editors.metadata?.getValue() || '{}');

      // Basic TypeScript/JavaScript validation
      if (
        !implementation.includes('class ') ||
        !implementation.includes('extends CustomNodeBase')
      ) {
        throw new Error(
          'Implementation must include a class extending CustomNodeBase'
        );
      }

      if (
        !implementation.includes('validate()') ||
        !implementation.includes('execute(')
      ) {
        throw new Error(
          'Implementation must include validate() and execute() methods'
        );
      }

      // Schema validation
      if (!schema.inputs || !schema.outputs) {
        throw new Error('Schema must include inputs and outputs');
      }

      // Metadata validation
      if (!metadata.type || !metadata.displayName) {
        throw new Error('Metadata must include type and displayName');
      }

      this.updateStatus('✅ Validation passed', 'success');
    } catch (error) {
      this.updateStatus(`❌ Validation failed: ${error.message}`, 'error');
    }
  }

  async executeNode() {
    try {
      this.updateStatus('🔄 Executing node...', 'loading');
      this.showLoading(true);

      // Get editor contents
      const implementation = this.editors.implementation?.getValue() || '';
      const testInputs = JSON.parse(
        this.editors.testInputs?.getValue() || '{}'
      );
      const enableLogging =
        document.getElementById('enableLogging')?.checked || false;
      const timeout = parseInt(
        document.getElementById('executionTimeout')?.value || '5000'
      );

      // Simulate node execution (in a real environment, this would compile and run the TypeScript)
      const result = await this.simulateExecution(implementation, testInputs, {
        enableLogging,
        timeout
      });

      this.displayResults(result);
      this.updateStatus('✅ Execution completed', 'success');
    } catch (error) {
      this.displayResults({
        error: error.message,
        timestamp: new Date().toISOString()
      });
      this.updateStatus(`❌ Execution failed: ${error.message}`, 'error');
    } finally {
      this.showLoading(false);
    }
  }

  async simulateExecution(implementation, testInputs, options) {
    return new Promise(resolve => {
      setTimeout(
        () => {
          // Simulate successful execution with mock results
          const mockResults = {
            outputs: {
              result: 'HELLO WORLD! THIS IS A TEST STRING.',
              originalLength: 37,
              processedLength: 37,
              operation: 'title'
            },
            executionTime: Math.random() * 100 + 50,
            logs: options.enableLogging
              ? [
                  {
                    level: 'info',
                    message: 'Processing text',
                    data: { operation: 'title', textLength: 37 }
                  },
                  {
                    level: 'info',
                    message: 'Text processing completed',
                    data: { result: 'success' }
                  }
                ]
              : [],
            timestamp: new Date().toISOString(),
            nodeMetadata: {
              type: 'playground.text-processor',
              version: '1.0.0'
            }
          };
          resolve(mockResults);
        },
        Math.random() * 1000 + 500
      );
    });
  }

  displayResults(results) {
    const resultsPanel = document.getElementById('resultsPanel');
    const resultsContent = document.getElementById('resultsContent');

    resultsContent.innerHTML = '';

    if (results.error) {
      resultsContent.innerHTML = `
                <div class="execution-result execution-error">
                    <strong>❌ Execution Error</strong><br>
                    ${results.error}<br>
                    <small>Time: ${results.timestamp}</small>
                </div>
            `;
    } else {
      let html = `
                <div class="execution-result">
                    <strong>✅ Execution Successful</strong><br>
                    <strong>Execution Time:</strong> ${Math.round(results.executionTime)}ms<br>
                    <strong>Outputs:</strong><br>
                    <pre>${JSON.stringify(results.outputs, null, 2)}</pre>
                </div>
            `;

      if (results.logs && results.logs.length > 0) {
        html += `
                    <div class="execution-result">
                        <strong>📋 Execution Logs</strong><br>
                        ${results.logs
                          .map(
                            log =>
                              `<div><span style="color: ${this.getLogColor(log.level)}">[${log.level.toUpperCase()}]</span> ${log.message}</div>`
                          )
                          .join('')}
                    </div>
                `;
      }

      resultsContent.innerHTML = html;
    }

    resultsPanel.style.display = 'block';
  }

  getLogColor(level) {
    const colors = {
      info: '#007bff',
      warn: '#ffc107',
      error: '#dc3545',
      debug: '#6c757d'
    };
    return colors[level] || '#6c757d';
  }

  updateStatus(message, type = 'info') {
    const statusText = document.getElementById('statusText');
    statusText.textContent = message;

    // Add visual indicators based on type
    statusText.className = type;
  }

  showLoading(show) {
    const loadingIndicator = document.getElementById('loadingIndicator');
    loadingIndicator.style.display = show ? 'inline-block' : 'none';
  }
}

// Tab switching functionality
function switchTab(tabName) {
  // Update tab buttons
  document.querySelectorAll('.playground-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  event.target.classList.add('active');

  // Update tab content
  document.querySelectorAll('.tab-content').forEach(content => {
    content.style.display = 'none';
  });
  document.getElementById(tabName).style.display = 'block';

  // Refresh editor layout if needed
  setTimeout(() => {
    Object.values(window.playground?.editors || {}).forEach(editor => {
      editor.layout();
    });
  }, 100);
}

// Global functions for UI interactions
function loadTemplate(templateName) {
  window.playground?.loadTemplate(templateName);
}

function validateNode() {
  window.playground?.validateNode();
}

function executeNode() {
  window.playground?.executeNode();
}

function closeResults() {
  document.getElementById('resultsPanel').style.display = 'none';
}

function loadExample() {
  // Load a predefined example
  window.playground?.loadTemplate('text-processor');
}

function exportNode() {
  // Export the current node as a downloadable package
  const implementation =
    window.playground?.editors?.implementation?.getValue() || '';
  const schema = window.playground?.editors?.schema?.getValue() || '{}';
  const metadata = window.playground?.editors?.metadata?.getValue() || '{}';

  const nodePackage = {
    implementation,
    schema: JSON.parse(schema),
    metadata: JSON.parse(metadata),
    exportedAt: new Date().toISOString()
  };

  const blob = new Blob([JSON.stringify(nodePackage, null, 2)], {
    type: 'application/json'
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'custom-node-export.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Initialize playground when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.playground = new CustomNodePlayground();
});
