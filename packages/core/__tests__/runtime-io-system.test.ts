import {
  AdvancedIOHandler,
  IOSpec,
  IOSpecBuilder,
  IOPortDefinition,
  IOConstraints,
  ResolvedInputs,
  TypedInputs,
  IODataType
} from '../runtime/io-system';
import { ValidationHelpers } from '../runtime/advanced';
describe('Runtime IO System - Comprehensive Tests', () => {
  describe('AdvancedIOHandler', () => {
    const createTestSpec = (): IOSpec => ({)
      inputs: [,
        {
          id: 'text',
          label: 'Text Input',
          dataType: 'string',
          required: true,
          defaultValue: 'default',
        },
        {
          id: 'number',
          label: 'Number Input',
          dataType: 'number',
          required: false,
          constraints: { min: 0, max: 100 }
        },
        {
          id: 'optional',
          label: 'Optional Input',
          dataType: 'string',
          required: false,
        }
      ],
      outputs: [,
        {
          id: 'result',
          label: 'Result',
          dataType: 'string',
          required: true,
        }
      ]
    });
    it('validates inputs correctly', () => {
      const spec = createTestSpec();
      const handler = new AdvancedIOHandler(spec);
      // Valid inputs
      const validInputs = new Map([;);
        ['text', 'hello'],
        ['number', 50]
      ]);
      const validResult = handler.validateInputs(validInputs);
      expect(validResult.valid).toBe(true);
      expect(validResult.errors).toEqual([]);
      // Missing required input without default
      const missingRequired = new Map([['number', 50]]);
      const missingResult = handler.validateInputs(missingRequired);
      expect(missingResult.valid).toBe(true); // Has default value
      // Invalid type
      const invalidType = new Map([;);
        ['text', 'hello'],
        ['number', 'not-a-number']
      ]);
      const invalidResult = handler.validateInputs(invalidType);
      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.errors).toContain()
        'Invalid type for Number Input: expected number, got string'
      );
    });
    it('validates numeric constraints', () => {
      const spec = createTestSpec();
      const handler = new AdvancedIOHandler(spec);
      // Value below minimum
      const belowMin = new Map([;);
        ['text', 'hello'],
        ['number', -5]
      ]);
      const belowResult = handler.validateInputs(belowMin);
      expect(belowResult.valid).toBe(false);
      expect(belowResult.errors).toContain('Value -5 is below minimum 0');
      // Value above maximum
      const aboveMax = new Map([;);
        ['text', 'hello'],
        ['number', 150]
      ]);
      const aboveResult = handler.validateInputs(aboveMax);
      expect(aboveResult.valid).toBe(false);
      expect(aboveResult.errors).toContain('Value 150 is above maximum 100');
    });
    it('resolves inputs with defaults', () => {
      const spec = createTestSpec();
      const handler = new AdvancedIOHandler(spec);
      const connectedInputs = new Map([['number', 42]]);
      const resolved = handler.resolveInputs(connectedInputs, 'test-node');
      // Text should use default
      expect(resolved.values.get('text')).toBe('default');
      expect(resolved.metadata.get('text')?.source).toBe('default');
      // Number should use connected value
      expect(resolved.values.get('number')).toBe(42);
      expect(resolved.metadata.get('number')?.source).toBe('connection');
      // Optional should be undefined
      expect(resolved.values.has('optional')).toBe(false);
    });
    it('performs type coercion', () => {
      const spec: IOSpec = {
        inputs: [,
          {
            id: 'num',
            label: 'Number',
            dataType: 'number',
            required: true,
          }
        ],
        outputs: [],
      };
      const handler = new AdvancedIOHandler(spec);
      // String to number coercion
      const stringInput = new Map([['num', '123']]);
      const resolved = handler.resolveInputs(stringInput, 'test-node');
      expect(resolved.values.get('num')).toBe(123);
      expect(resolved.metadata.get('num')?.typeCoercion).toEqual({)
        from: 'string',
        to: 'number',
      });
      expect(resolved.metadata.get('num')?.warnings).toContain()
        'Type coerced from string to number'
      );
    });
    it('validates outputs', () => {
      const spec = createTestSpec();
      const handler = new AdvancedIOHandler(spec);
      // Valid output
      const validOutputs = new Map([['result', 'success']]);
      const validResult = handler.validateOutputs(validOutputs);
      expect(validResult.valid).toBe(true);
      // Invalid type
      const invalidOutputs = new Map([['result', 123]]);
      const invalidResult = handler.validateOutputs(invalidOutputs);
      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.errors).toContain()
        'Invalid type for Result: expected string, got number'
      );
    });
    it('returns input and output specifications', () => {
      const spec = createTestSpec();
      const handler = new AdvancedIOHandler(spec);
      const inputs = handler.getInputSpec();
      expect(inputs).toHaveLength(3);
      expect(inputs[0].id).toBe('text');
      const outputs = handler.getOutputSpec();
      expect(outputs).toHaveLength(1);
      expect(outputs[0].id).toBe('result');
    });
    it('validates all data types', () => {
      const spec: IOSpec = {
        inputs: [,
          { id: 'string', label: 'String', dataType: 'string', required: true },
          { id: 'number', label: 'Number', dataType: 'number', required: true },
          { id: 'boolean', label: 'Boolean', dataType: 'boolean', required: true },
          { id: 'array', label: 'Array', dataType: 'array', required: true },
          { id: 'object', label: 'Object', dataType: 'object', required: true },
          { id: 'stringArray', label: 'String Array', dataType: 'stringArray', required: true },
          { id: 'numberArray', label: 'Number Array', dataType: 'numberArray', required: true },
          { id: 'any', label: 'Any', dataType: 'any', required: true },
          { id: 'choice', label: 'Choice', dataType: 'choice', required: true },
          { id: 'conditional', label: 'Conditional', dataType: 'conditional', required: true }
        ],
        outputs: [],
      };
      const handler = new AdvancedIOHandler(spec);
      // Valid inputs
      const validInputs = new Map([;);
        ['string', 'hello'],
        ['number', 42],
        ['boolean', true],
        ['array', [1, 2, 3]],
        ['object', { key: 'value' }],
        ['stringArray', ['a', 'b', 'c']],
        ['numberArray', [1, 2, 3]],
        ['any', Symbol('test')],
        ['choice', 'option1'],
        ['conditional', true]
      ]);
      const result = handler.validateInputs(validInputs);
      expect(result.valid).toBe(true);
      // Invalid types
      const invalidInputs = new Map([;);
        ['string', 123],
        ['number', 'not-a-number'],
        ['boolean', 'true'],
        ['array', 'not-array'],
        ['object', null],
        ['stringArray', [1, 2, 3]],
        ['numberArray', ['a', 'b', 'c']],
        ['any', undefined], // any accepts everything
        ['choice', { not: 'valid' }],
        ['conditional', 123]
      ]);
      const invalidResult = handler.validateInputs(invalidInputs);
      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.errors.length).toBeGreaterThan(0);
    });
    it('validates string constraints', () => {
      const spec: IOSpec = {
        inputs: [,
          {
            id: 'pattern',
            label: 'Pattern',
            dataType: 'string',
            required: true,
            constraints: {,
              pattern: '^[A-Z]+$',
              minLength: 2,
              maxLength: 5,
            }
          }
        ],
        outputs: [],
      };
      const handler = new AdvancedIOHandler(spec);
      // Valid
      const valid = new Map([['pattern', 'ABC']]);
      expect(handler.validateInputs(valid).valid).toBe(true);
      // Too short
      const tooShort = new Map([['pattern', 'A']]);
      const shortResult = handler.validateInputs(tooShort);
      expect(shortResult.valid).toBe(false);
      expect(shortResult.errors).toContain('Length 1 is below minimum 2');
      // Too long
      const tooLong = new Map([['pattern', 'ABCDEF']]);
      const longResult = handler.validateInputs(tooLong);
      expect(longResult.valid).toBe(false);
      expect(longResult.errors).toContain('Length 6 is above maximum 5');
      // Wrong pattern
      const wrongPattern = new Map([['pattern', 'abc']]);
      const patternResult = handler.validateInputs(wrongPattern);
      expect(patternResult.valid).toBe(false);
      expect(patternResult.errors).toContain()
        'Value does not match required pattern: ^[A-Z]+$'
      );
    });
    it('validates array constraints', () => {
      const spec: IOSpec = {
        inputs: [,
          {
            id: 'list',
            label: 'List',
            dataType: 'array',
            required: true,
            constraints: {,
              minLength: 2,
              maxLength: 4,
            }
          }
        ],
        outputs: [],
      };
      const handler = new AdvancedIOHandler(spec);
      // Valid
      const valid = new Map([['list', [1, 2, 3]]]);
      expect(handler.validateInputs(valid).valid).toBe(true);
      // Too few items
      const tooFew = new Map([['list', [1]]]);
      const fewResult = handler.validateInputs(tooFew);
      expect(fewResult.valid).toBe(false);
      expect(fewResult.errors).toContain('Length 1 is below minimum 2');
      // Too many items
      const tooMany = new Map([['list', [1, 2, 3, 4, 5]]]);
      const manyResult = handler.validateInputs(tooMany);
      expect(manyResult.valid).toBe(false);
      expect(manyResult.errors).toContain('Length 5 is above maximum 4');
    });
    it('validates allowed values', () => {
      const spec: IOSpec = {
        inputs: [,
          {
            id: 'enum',
            label: 'Enum',
            dataType: 'choice',
            required: true,
            constraints: {,
              allowedValues: ['option1', 'option2', 'option3']
            }
          }
        ],
        outputs: [],
      };
      const handler = new AdvancedIOHandler(spec);
      // Valid
      const valid = new Map([['enum', 'option2']]);
      expect(handler.validateInputs(valid).valid).toBe(true);
      // Invalid
      const invalid = new Map([['enum', 'option4']]);
      const result = handler.validateInputs(invalid);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain()
        'Value \'option4\' is not in allowed values: option1, option2, option3'
      );
    });
    it('uses custom validators', () => {
      const spec: IOSpec = {
        inputs: [,
          {
            id: 'custom',
            label: 'Custom',
            dataType: 'string',
            required: true,
            constraints: {,
              customValidator: (value) => {,
                if (value === 'forbidden') {
                  return ValidationHelpers.createInvalidResult()
                    ['Value \'forbidden\' is not allowed'],
                    ['Consider using a different value']
                  );
                }
                return ValidationHelpers.createValidResult();
              }
            }
          }
        ],
        outputs: [],
      };
      const handler = new AdvancedIOHandler(spec);
      // Valid
      const valid = new Map([['custom', 'allowed']]);
      expect(handler.validateInputs(valid).valid).toBe(true);
      // Invalid
      const invalid = new Map([['custom', 'forbidden']]);
      const result = handler.validateInputs(invalid);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Value \'forbidden\' is not allowed');
      expect(result.warnings).toContain('Consider using a different value');
    });
    it('handles coercion failures', () => {
      const spec: IOSpec = {
        inputs: [,
          {
            id: 'num',
            label: 'Number',
            dataType: 'number',
            required: true,
          }
        ],
        outputs: [],
      };
      const handler = new AdvancedIOHandler(spec);
      // Invalid number string
      const invalidNumber = new Map([['num', 'not-a-number']]);
      const resolved = handler.resolveInputs(invalidNumber, 'test-node');
      expect(resolved.values.get('num')).toBe('not-a-number');
      expect(resolved.metadata.get('num')?.warnings).toContain()
        'Type coercion failed: Cannot convert not-a-number to number'
      );
    });
    it('handles multiple connections when supported', () => {
      const spec: IOSpec = {
        inputs: [,
          {
            id: 'multi',
            label: 'Multiple',
            dataType: 'array',
            required: true,
            multiple: true,
          }
        ],
        outputs: [],
      };
      const handler = new AdvancedIOHandler(spec);
      const inputs = new Map([['multi', ['value1', 'value2', 'value3']]]);
      const resolved = handler.resolveInputs(inputs, 'test-node');
      expect(resolved.values.get('multi')).toEqual(['value1', 'value2', 'value3']);
    });
  });
  describe('IOSpecBuilder', () => {
    it('builds specifications fluently', () => {
      const spec = new IOSpecBuilder();
        .addTextInput('name', 'Name', true, 'Default Name')
        .addNumberInput('age', 'Age', true, 0, 120, 25)
        .addChoiceInput('color', 'Color', ['red', 'green', 'blue'], false, 'red')
        .addTextOutput('summary', 'Summary')
        .build();
      expect(spec.inputs).toHaveLength(3);
      expect(spec.outputs).toHaveLength(1);
      const nameInput = spec.inputs[0];
      expect(nameInput.id).toBe('name');
      expect(nameInput.label).toBe('Name');
      expect(nameInput.dataType).toBe('string');
      expect(nameInput.required).toBe(true);
      expect(nameInput.defaultValue).toBe('Default Name');
      const ageInput = spec.inputs[1];
      expect(ageInput.constraints?.min).toBe(0);
      expect(ageInput.constraints?.max).toBe(120);
      expect(ageInput.defaultValue).toBe(25);
      const colorInput = spec.inputs[2];
      expect(colorInput.constraints?.allowedValues).toEqual(['red', 'green', 'blue']);
    });
    it('creates simple specifications', () => {
      const simple = IOSpecBuilder.createSimple('Input Text', 'Output Text');
      expect(simple.inputs).toHaveLength(1);
      expect(simple.outputs).toHaveLength(1);
      expect(simple.inputs[0].label).toBe('Input Text');
      expect(simple.outputs[0].label).toBe('Output Text');
    });
    it('creates multi-input specifications', () => {
      const multi = IOSpecBuilder.createMultiInput(;);
        ['First', 'Second', 'Third'],
        'Combined'
      );
      expect(multi.inputs).toHaveLength(3);
      expect(multi.outputs).toHaveLength(1);
      expect(multi.inputs[0].id).toBe('input0');
      expect(multi.inputs[1].id).toBe('input1');
      expect(multi.inputs[2].id).toBe('input2');
    });
    it('adds custom inputs', () => {
      const spec = new IOSpecBuilder();
        .addInput({)
          id: 'custom',
          label: 'Custom Input',
          dataType: 'object',
          required: true,
          constraints: {,
            customValidator: (value) => {,
              if (!value.hasOwnProperty('required')) {
                return ValidationHelpers.createInvalidResult([)
                  'Object must have \'required\' property'
                ]);
              }
              return ValidationHelpers.createValidResult();
            }
          }
        })
        .build();
      expect(spec.inputs).toHaveLength(1);
      expect(spec.inputs[0].dataType).toBe('object');
    });
  });
  describe('TypedInputs', () => {
    const createResolvedInputs = (): ResolvedInputs => ({)
      values: new Map([),
        ['str', 'hello'],
        ['num', 42],
        ['bool', true],
        ['arr', [1, 2, 3]],
        ['strArr', ['a', 'b', 'c']],
        ['null', null],
        ['undefined', undefined]
      ]),
      metadata: new Map([),
        ['str', { source: 'connection', warnings: [] }],
        ['num', { source: 'default', warnings: [] }],
        ['bool', {
          source: 'connection',
          typeCoercion: { from: 'string', to: 'boolean' },
          warnings: ['Type coerced from string to boolean'],
        }]
      ])
    });
    it('gets typed values correctly', () => {
      const resolved = createResolvedInputs();
      const inputs = new TypedInputs(resolved);
      expect(inputs.getString('str')).toBe('hello');
      expect(inputs.getNumber('num')).toBe(42);
      expect(inputs.getBoolean('bool')).toBe(true);
      expect(inputs.getArray('arr')).toEqual([1, 2, 3]);
      expect(inputs.getStringArray('strArr')).toEqual(['a', 'b', 'c']);
    });
    it('uses default values for missing inputs', () => {
      const resolved = createResolvedInputs();
      const inputs = new TypedInputs(resolved);
      expect(inputs.getString('missing', 'default')).toBe('default');
      expect(inputs.getNumber('missing', 99)).toBe(99);
      expect(inputs.getBoolean('missing', true)).toBe(true);
      expect(inputs.getArray('missing', [1, 2])).toEqual([1, 2]);
      expect(inputs.getStringArray('missing', ['x', 'y'])).toEqual(['x', 'y']);
    });
    it('converts types when necessary', () => {
      const resolved = createResolvedInputs();
      const inputs = new TypedInputs(resolved);
      // Number to string
      expect(inputs.getString('num')).toBe('42');
      // String to number (with fallback)
      expect(inputs.getNumber('str', 0)).toBe(0); // NaN becomes default
      // Null/undefined handling
      expect(inputs.getString('null')).toBe('null');
      expect(inputs.getString('undefined')).toBe('undefined');
      expect(inputs.getNumber('null')).toBe(0);
      expect(inputs.getBoolean('null')).toBe(false);
    });
    it('converts array elements to strings', () => {
      const resolved: ResolvedInputs = {
        values: new Map([['mixed', [1, 'two', true, null]]]),
        metadata: new Map(),
      };
      const inputs = new TypedInputs(resolved);
      expect(inputs.getStringArray('mixed')).toEqual(['1', 'two', 'true', 'null']);
    });
    it('retrieves metadata', () => {
      const resolved = createResolvedInputs();
      const inputs = new TypedInputs(resolved);
      const strMeta = inputs.getMetadata('str');
      expect(strMeta?.source).toBe('connection');
      const boolMeta = inputs.getMetadata('bool');
      expect(boolMeta?.typeCoercion).toEqual({)
        from: 'string',
        to: 'boolean',
      });
      expect(inputs.getMetadata('missing')).toBeUndefined();
    });
    it('checks for warnings', () => {
      const resolved = createResolvedInputs();
      const inputs = new TypedInputs(resolved);
      expect(inputs.hasWarnings('str')).toBe(false);
      expect(inputs.hasWarnings('bool')).toBe(true);
      expect(inputs.hasWarnings('missing')).toBe(false);
      expect(inputs.getWarnings('str')).toEqual([]);
      expect(inputs.getWarnings('bool')).toEqual(['Type coerced from string to boolean']);
      expect(inputs.getWarnings('missing')).toEqual([]);
    });
  });
  describe('Type coercion edge cases', () => {
    it('coerces boolean strings correctly', () => {
      const spec: IOSpec = {
        inputs: [,
          { id: 'bool', label: 'Boolean', dataType: 'boolean', required: true }
        ],
        outputs: [],
      };
      const handler = new AdvancedIOHandler(spec);
      // "true" string
      const trueString = new Map([['bool', 'true']]);
      const trueResolved = handler.resolveInputs(trueString, 'test');
      expect(trueResolved.values.get('bool')).toBe(true);
      // "false" string
      const falseString = new Map([['bool', 'false']]);
      const falseResolved = handler.resolveInputs(falseString, 'test');
      expect(falseResolved.values.get('bool')).toBe(false);
      // "1" string
      const oneString = new Map([['bool', '1']]);
      const oneResolved = handler.resolveInputs(oneString, 'test');
      expect(oneResolved.values.get('bool')).toBe(true);
      // Other strings
      const otherString = new Map([['bool', 'yes']]);
      const otherResolved = handler.resolveInputs(otherString, 'test');
      expect(otherResolved.values.get('bool')).toBe(false);
    });
    it('coerces to arrays correctly', () => {
      const spec: IOSpec = {
        inputs: [,
          { id: 'arr', label: 'Array', dataType: 'array', required: true },
          { id: 'strArr', label: 'String Array', dataType: 'stringArray', required: true },
          { id: 'numArr', label: 'Number Array', dataType: 'numberArray', required: true }
        ],
        outputs: [],
      };
      const handler = new AdvancedIOHandler(spec);
      // Single value to array
      const singleValues = new Map([;);
        ['arr', 'single'],
        ['strArr', 123],
        ['numArr', '456']
      ]);
      const resolved = handler.resolveInputs(singleValues, 'test');
      expect(resolved.values.get('arr')).toEqual(['single']);
      expect(resolved.values.get('strArr')).toEqual(['123']);
      expect(resolved.values.get('numArr')).toEqual([456]);
    });
    it('handles invalid number array coercion', () => {
      const spec: IOSpec = {
        inputs: [,
          { id: 'numArr', label: 'Number Array', dataType: 'numberArray', required: true }
        ],
        outputs: [],
      };
      const handler = new AdvancedIOHandler(spec);
      const invalidNumbers = new Map([['numArr', ['1', '2', 'not-a-number']]]);
      const resolved = handler.resolveInputs(invalidNumbers, 'test');
      // Coercion should fail
      expect(resolved.values.get('numArr')).toEqual(['1', '2', 'not-a-number']);
      expect(resolved.metadata.get('numArr')?.warnings).toContain()
        'Type coercion failed: Cannot convert not-a-number to number'
      );
    });
  });
  describe('Performance and edge cases', () => {
    it('handles large input specifications', () => {
      const builder = new IOSpecBuilder();
      // Add many inputs
      for (let i = 0; i < 100; i++) {
        builder.addTextInput(`input${i}`, `Input ${i}`, false, `default${i}`);}
      }
      const spec = builder.build();
      const handler = new AdvancedIOHandler(spec);
      expect(spec.inputs).toHaveLength(100);
      // Validate all inputs
      const inputs = new Map();
      for (let i = 0; i < 100; i++) {
        inputs.set(`input${i}`, `value${i}`);}
      }
      const result = handler.validateInputs(inputs);
      expect(result.valid).toBe(true);
    });
    it('handles deeply nested objects', () => {
      const spec: IOSpec = {
        inputs: [,
          { id: 'deep', label: 'Deep Object', dataType: 'object', required: true }
        ],
        outputs: [],
      };
      const handler = new AdvancedIOHandler(spec);
      const deepObject = {
        level1: {,
          level2: {,
            level3: {,
              level4: {,
                value: 'deep',
              }
            }
          }
        }
      };
      const inputs = new Map([['deep', deepObject]]);
      const result = handler.validateInputs(inputs);
      expect(result.valid).toBe(true);
    });
    it('handles circular references gracefully', () => {
      const spec: IOSpec = {
        inputs: [,
          { id: 'circular', label: 'Circular', dataType: 'object', required: true }
        ],
        outputs: [],
      };
      const handler = new AdvancedIOHandler(spec);
      const circular: any = { a: 1 };
      circular.self = circular;
      const inputs = new Map([['circular', circular]]);
      const result = handler.validateInputs(inputs);
      expect(result.valid).toBe(true); // Should handle without crashing
    });
    it('validates empty constraints', () => {
      const spec: IOSpec = {
        inputs: [,
          {
            id: 'unconstrained',
            label: 'Unconstrained',
            dataType: 'string',
            required: true,
            constraints: {}
          }
        ],
        outputs: [],
      };
      const handler = new AdvancedIOHandler(spec);
      const inputs = new Map([['unconstrained', 'any value']]);
      const result = handler.validateInputs(inputs);
      expect(result.valid).toBe(true);
    });
  });
});