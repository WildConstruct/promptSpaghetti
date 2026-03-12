import { ValidationEngine } from '../runtime/ValidationEngine';
import { NodeIOSchema } from '../types';

describe('ValidationEngine enum validation', () => {
  it('enforces numeric enum constraints on inputs', () => {
    const schema: NodeIOSchema = {
      inputs: {
        mode: {
          type: 'number',
          required: true,
          validation: {
            enum: [1, 2, 3]
          }
        }
      },
      outputs: {
        result: {
          type: 'number'
        }
      }
    };

    const engine = new ValidationEngine(schema);

    expect(engine.validateInputs({ mode: 2 }).valid).toBe(true);
    expect(engine.validateInputs({ mode: 4 }).valid).toBe(false);
  });

  it('enforces boolean enum constraints on inputs', () => {
    const schema: NodeIOSchema = {
      inputs: {
        enabled: {
          type: 'boolean',
          required: true,
          validation: {
            enum: [true]
          }
        }
      },
      outputs: {
        result: {
          type: 'boolean'
        }
      }
    };

    const engine = new ValidationEngine(schema);

    expect(engine.validateInputs({ enabled: true }).valid).toBe(true);
    expect(engine.validateInputs({ enabled: false }).valid).toBe(false);
  });

  it('rejects enum rules that do not match the declared input type', () => {
    const schema: NodeIOSchema = {
      inputs: {
        enabled: {
          type: 'boolean',
          required: true,
          validation: {
            enum: ['yes', 'no']
          }
        }
      },
      outputs: {
        result: {
          type: 'boolean'
        }
      }
    };

    const engine = new ValidationEngine(schema);
    const result = engine.validateSchema();

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "Input 'enabled': enum values must match the declared boolean type"
    );
  });
});
