// packages/core/runtime/__tests__/io-system.test.ts
// Tests for the standardized I/O handling system
import { AdvancedIOHandler, IOSpecBuilder, TypedInputs } from '../io-system';
describe('Advanced I/O System', () => {
    describe('IOSpecBuilder', () => {
        it('should build simple I/O specification', () => {
            const spec = IOSpecBuilder.createSimple('Text Input', 'Text Output');
            expect(spec.inputs).toHaveLength(1);
            expect(spec.outputs).toHaveLength(1);
            expect(spec.inputs[0].id).toBe('input');
            expect(spec.inputs[0].label).toBe('Text Input');
            expect(spec.inputs[0].dataType).toBe('string');
            expect(spec.outputs[0].id).toBe('output');
            expect(spec.outputs[0].label).toBe('Text Output');
        });
        it('should build multi-input specification', () => {
            const spec = IOSpecBuilder.createMultiInput(['Input A', 'Input B', 'Input C']);
            expect(spec.inputs).toHaveLength(3);
            expect(spec.outputs).toHaveLength(1);
            expect(spec.inputs[0].id).toBe('input0');
            expect(spec.inputs[1].id).toBe('input1');
            expect(spec.inputs[2].id).toBe('input2');
        });
        it('should build custom specification with builder pattern', () => {
            const spec = new IOSpecBuilder()
                .addTextInput('title', 'Title', true)
                .addNumberInput('count', 'Count', false, 1, 10, 5)
                .addChoiceInput('type', 'Type', ['A', 'B', 'C'], true, 'A')
                .addTextOutput('result', 'Result')
                .build();
            expect(spec.inputs).toHaveLength(3);
            expect(spec.outputs).toHaveLength(1);
            // Check title input
            const titleInput = spec.inputs[0];
            expect(titleInput.id).toBe('title');
            expect(titleInput.required).toBe(true);
            expect(titleInput.dataType).toBe('string');
            // Check count input with constraints
            const countInput = spec.inputs[1];
            expect(countInput.id).toBe('count');
            expect(countInput.required).toBe(false);
            expect(countInput.defaultValue).toBe(5);
            expect(countInput.constraints?.min).toBe(1);
            expect(countInput.constraints?.max).toBe(10);
            // Check choice input
            const typeInput = spec.inputs[2];
            expect(typeInput.id).toBe('type');
            expect(typeInput.dataType).toBe('choice');
            expect(typeInput.constraints?.allowedValues).toEqual(['A', 'B', 'C']);
        });
    });
    describe('AdvancedIOHandler', () => {
        let ioHandler;
        let spec;
        beforeEach(() => {
            spec = new IOSpecBuilder()
                .addTextInput('title', 'Title', true)
                .addNumberInput('count', 'Count', false, 1, 10, 5)
                .addChoiceInput('mode', 'Mode', ['fast', 'slow'], false, 'fast')
                .addTextOutput('result', 'Result')
                .build();
            ioHandler = new AdvancedIOHandler(spec);
        });
        describe('Input Validation', () => {
            it('should validate valid inputs', () => {
                const inputs = new Map([
                    ['title', 'Test Title'],
                    ['count', 3],
                    ['mode', 'fast']
                ]);
                const result = ioHandler.validateInputs(inputs);
                expect(result.valid).toBe(true);
                expect(result.errors).toHaveLength(0);
            });
            it('should detect missing required inputs', () => {
                const inputs = new Map([
                    ['count', 3],
                    ['mode', 'fast']
                    // Missing required 'title'
                ]);
                const result = ioHandler.validateInputs(inputs);
                expect(result.valid).toBe(false);
                expect(result.errors).toContain("Required input 'Title' (title) is missing");
            });
            it('should validate input constraints', () => {
                const inputs = new Map([
                    ['title', 'Test Title'],
                    ['count', 15], // Exceeds max of 10
                    ['mode', 'invalid'] // Not in allowed values
                ]);
                const result = ioHandler.validateInputs(inputs);
                expect(result.valid).toBe(false);
                expect(result.errors).toContain('Value 15 is above maximum 10');
                expect(result.errors).toContain("Value 'invalid' is not in allowed values: fast, slow");
            });
            it('should handle optional inputs with defaults', () => {
                const inputs = new Map([
                    ['title', 'Test Title']
                    // Missing optional 'count' and 'mode' - should use defaults
                ]);
                const result = ioHandler.validateInputs(inputs);
                expect(result.valid).toBe(true);
            });
        });
        describe('Input Resolution', () => {
            it('should resolve connected inputs', () => {
                const connectedInputs = new Map([
                    ['title', 'Connected Title'],
                    ['count', 7],
                    ['mode', 'slow']
                ]);
                const resolved = ioHandler.resolveInputs(connectedInputs, 'test-node');
                expect(resolved.values.get('title')).toBe('Connected Title');
                expect(resolved.values.get('count')).toBe(7);
                expect(resolved.values.get('mode')).toBe('slow');
                // Check metadata
                expect(resolved.metadata.get('title')?.source).toBe('connection');
                expect(resolved.metadata.get('count')?.source).toBe('connection');
                expect(resolved.metadata.get('mode')?.source).toBe('connection');
            });
            it('should use defaults for missing optional inputs', () => {
                const connectedInputs = new Map([
                    ['title', 'Title Only']
                    // Missing count and mode
                ]);
                const resolved = ioHandler.resolveInputs(connectedInputs, 'test-node');
                expect(resolved.values.get('title')).toBe('Title Only');
                expect(resolved.values.get('count')).toBe(5); // Default value
                expect(resolved.values.get('mode')).toBe('fast'); // Default value
                // Check metadata
                expect(resolved.metadata.get('title')?.source).toBe('connection');
                expect(resolved.metadata.get('count')?.source).toBe('default');
                expect(resolved.metadata.get('mode')?.source).toBe('default');
            });
            it('should perform type coercion with warnings', () => {
                const connectedInputs = new Map([
                    ['title', 'Valid Title'],
                    ['count', '8'], // String instead of number
                    ['mode', 'fast']
                ]);
                const resolved = ioHandler.resolveInputs(connectedInputs, 'test-node');
                expect(resolved.values.get('count')).toBe(8); // Coerced to number
                const countMetadata = resolved.metadata.get('count');
                expect(countMetadata?.typeCoercion).toEqual({
                    from: 'string',
                    to: 'number'
                });
                expect(countMetadata?.warnings).toContain('Type coerced from string to number');
            });
        });
        describe('Output Validation', () => {
            it('should validate valid outputs', () => {
                const outputs = new Map([
                    ['result', 'Valid Result String']
                ]);
                const result = ioHandler.validateOutputs(outputs);
                expect(result.valid).toBe(true);
                expect(result.errors).toHaveLength(0);
            });
            it('should detect invalid output types', () => {
                const outputs = new Map([
                    ['result', 12345] // Number instead of string
                ]);
                const result = ioHandler.validateOutputs(outputs);
                expect(result.valid).toBe(false);
                expect(result.errors).toContain('Invalid type for Result: expected string, got number');
            });
        });
        describe('Type Coercion', () => {
            it('should coerce strings to numbers', () => {
                const numberSpec = new IOSpecBuilder()
                    .addNumberInput('value', 'Value', true)
                    .addTextOutput('result', 'Result')
                    .build();
                const handler = new AdvancedIOHandler(numberSpec);
                const inputs = new Map([['value', '42']]);
                const resolved = handler.resolveInputs(inputs, 'test-node');
                expect(resolved.values.get('value')).toBe(42);
                expect(resolved.metadata.get('value')?.typeCoercion?.from).toBe('string');
                expect(resolved.metadata.get('value')?.typeCoercion?.to).toBe('number');
            });
            it('should coerce values to string arrays', () => {
                const arraySpec = new IOSpecBuilder()
                    .addInput({
                    id: 'items',
                    label: 'Items',
                    dataType: 'stringArray',
                    required: true
                })
                    .addTextOutput('result', 'Result')
                    .build();
                const handler = new AdvancedIOHandler(arraySpec);
                const inputs = new Map([['items', [1, 2, 3]]]);
                const resolved = handler.resolveInputs(inputs, 'test-node');
                expect(resolved.values.get('items')).toEqual(['1', '2', '3']);
            });
            it('should handle boolean coercion', () => {
                const boolSpec = new IOSpecBuilder()
                    .addInput({
                    id: 'flag',
                    label: 'Flag',
                    dataType: 'boolean',
                    required: true
                })
                    .addTextOutput('result', 'Result')
                    .build();
                const handler = new AdvancedIOHandler(boolSpec);
                // Test string to boolean
                const inputs1 = new Map([['flag', 'true']]);
                const resolved1 = handler.resolveInputs(inputs1, 'test-node');
                expect(resolved1.values.get('flag')).toBe(true);
                const inputs2 = new Map([['flag', 'false']]);
                const resolved2 = handler.resolveInputs(inputs2, 'test-node');
                expect(resolved2.values.get('flag')).toBe(false);
                const inputs3 = new Map([['flag', '1']]);
                const resolved3 = handler.resolveInputs(inputs3, 'test-node');
                expect(resolved3.values.get('flag')).toBe(true);
            });
        });
        describe('Constraint Validation', () => {
            it('should validate string length constraints', () => {
                const constrainedSpec = new IOSpecBuilder()
                    .addInput({
                    id: 'text',
                    label: 'Text',
                    dataType: 'string',
                    required: true,
                    constraints: { minLength: 3, maxLength: 10 }
                })
                    .addTextOutput('result', 'Result')
                    .build();
                const handler = new AdvancedIOHandler(constrainedSpec);
                // Valid length
                const validInputs = new Map([['text', 'hello']]);
                const validResult = handler.validateInputs(validInputs);
                expect(validResult.valid).toBe(true);
                // Too short
                const shortInputs = new Map([['text', 'hi']]);
                const shortResult = handler.validateInputs(shortInputs);
                expect(shortResult.valid).toBe(false);
                expect(shortResult.errors).toContain('Length 2 is below minimum 3');
                // Too long
                const longInputs = new Map([['text', 'this is too long']]);
                const longResult = handler.validateInputs(longInputs);
                expect(longResult.valid).toBe(false);
                expect(longResult.errors).toContain('Length 16 is above maximum 10');
            });
            it('should validate pattern constraints', () => {
                const patternSpec = new IOSpecBuilder()
                    .addInput({
                    id: 'email',
                    label: 'Email',
                    dataType: 'string',
                    required: true,
                    constraints: { pattern: '^[^@]+@[^@]+\\.[^@]+$' }
                })
                    .addTextOutput('result', 'Result')
                    .build();
                const handler = new AdvancedIOHandler(patternSpec);
                // Valid email
                const validInputs = new Map([['email', 'test@example.com']]);
                const validResult = handler.validateInputs(validInputs);
                expect(validResult.valid).toBe(true);
                // Invalid email
                const invalidInputs = new Map([['email', 'not-an-email']]);
                const invalidResult = handler.validateInputs(invalidInputs);
                expect(invalidResult.valid).toBe(false);
                expect(invalidResult.errors[0]).toContain('does not match required pattern');
            });
            it('should validate custom constraints', () => {
                const customValidator = (value) => {
                    if (typeof value === 'string' && value.includes('bad')) {
                        return { valid: false, errors: ['Value contains forbidden word'], warnings: [] };
                    }
                    return { valid: true, errors: [], warnings: [] };
                };
                const customSpec = new IOSpecBuilder()
                    .addInput({
                    id: 'text',
                    label: 'Text',
                    dataType: 'string',
                    required: true,
                    constraints: { customValidator }
                })
                    .addTextOutput('result', 'Result')
                    .build();
                const handler = new AdvancedIOHandler(customSpec);
                // Valid text
                const validInputs = new Map([['text', 'good text']]);
                const validResult = handler.validateInputs(validInputs);
                expect(validResult.valid).toBe(true);
                // Invalid text
                const invalidInputs = new Map([['text', 'bad text']]);
                const invalidResult = handler.validateInputs(invalidInputs);
                expect(invalidResult.valid).toBe(false);
                expect(invalidResult.errors).toContain('Value contains forbidden word');
            });
        });
    });
    describe('TypedInputs', () => {
        let typedInputs;
        let resolvedInputs;
        beforeEach(() => {
            resolvedInputs = {
                values: new Map([
                    ['title', 'Test Title'],
                    ['count', 42],
                    ['active', true],
                    ['items', ['a', 'b', 'c']],
                    ['numbers', [1, 2, 3]]
                ]),
                metadata: new Map([
                    ['title', { source: 'connection', warnings: [] }],
                    ['count', { source: 'connection', warnings: ['Type coerced from string to number'] }],
                    ['active', { source: 'default', warnings: [] }],
                    ['items', { source: 'connection', warnings: [] }],
                    ['numbers', { source: 'connection', warnings: [] }]
                ])
            };
            typedInputs = new TypedInputs(resolvedInputs);
        });
        it('should get typed values correctly', () => {
            expect(typedInputs.getString('title')).toBe('Test Title');
            expect(typedInputs.getNumber('count')).toBe(42);
            expect(typedInputs.getBoolean('active')).toBe(true);
            expect(typedInputs.getArray('items')).toEqual(['a', 'b', 'c']);
            expect(typedInputs.getStringArray('numbers')).toEqual(['1', '2', '3']);
        });
        it('should return defaults for missing values', () => {
            expect(typedInputs.getString('missing', 'default')).toBe('default');
            expect(typedInputs.getNumber('missing', 99)).toBe(99);
            expect(typedInputs.getBoolean('missing', true)).toBe(true);
            expect(typedInputs.getArray('missing', ['default'])).toEqual(['default']);
        });
        it('should handle type coercion gracefully', () => {
            // When a number is stored as string, getString should convert it
            expect(typedInputs.getString('count')).toBe('42');
            // When a string is requested as number
            expect(typedInputs.getNumber('title')).toBeNaN();
        });
        it('should provide metadata access', () => {
            const titleMetadata = typedInputs.getMetadata('title');
            expect(titleMetadata?.source).toBe('connection');
            expect(titleMetadata?.warnings).toHaveLength(0);
            const countMetadata = typedInputs.getMetadata('count');
            expect(countMetadata?.warnings).toContain('Type coerced from string to number');
        });
        it('should check for warnings', () => {
            expect(typedInputs.hasWarnings('title')).toBe(false);
            expect(typedInputs.hasWarnings('count')).toBe(true);
            expect(typedInputs.getWarnings('count')).toContain('Type coerced from string to number');
        });
    });
    describe('Data Type Validation', () => {
        let handler;
        beforeEach(() => {
            const spec = new IOSpecBuilder()
                .addInput({ id: 'str', label: 'String', dataType: 'string', required: false })
                .addInput({ id: 'num', label: 'Number', dataType: 'number', required: false })
                .addInput({ id: 'bool', label: 'Boolean', dataType: 'boolean', required: false })
                .addInput({ id: 'arr', label: 'Array', dataType: 'array', required: false })
                .addInput({ id: 'obj', label: 'Object', dataType: 'object', required: false })
                .addInput({ id: 'strArr', label: 'String Array', dataType: 'stringArray', required: false })
                .addInput({ id: 'numArr', label: 'Number Array', dataType: 'numberArray', required: false })
                .addInput({ id: 'any', label: 'Any', dataType: 'any', required: false })
                .addTextOutput('result', 'Result')
                .build();
            handler = new AdvancedIOHandler(spec);
        });
        it('should validate all data types correctly', () => {
            const validInputs = new Map([
                ['str', 'hello'],
                ['num', 42],
                ['bool', true],
                ['arr', [1, 'mixed', true]],
                ['obj', { key: 'value' }],
                ['strArr', ['a', 'b', 'c']],
                ['numArr', [1, 2, 3]],
                ['any', 'anything']
            ]);
            const result = handler.validateInputs(validInputs);
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });
        it('should detect invalid data types', () => {
            const invalidInputs = new Map([
                ['str', 123], // Number instead of string
                ['num', 'not-a-number'], // String instead of number
                ['bool', 'not-a-boolean'], // String instead of boolean
                ['arr', 'not-an-array'], // String instead of array
                ['obj', ['not', 'an', 'object']], // Array instead of object
                ['strArr', [1, 2, 3]], // Number array instead of string array
                ['numArr', ['a', 'b', 'c']] // String array instead of number array
            ]);
            const result = handler.validateInputs(invalidInputs);
            expect(result.valid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
        });
    });
});
