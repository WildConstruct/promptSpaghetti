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

  it('rejects default values that violate enum validation', () => {
    const schema: NodeIOSchema = {
      inputs: {
        mode: {
          type: 'number',
          required: true,
          default: 4,
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
    const result = engine.validateSchema();

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "Input 'mode' default value violates its validation rules"
    );
  });

  it('surfaces invalid regex patterns as schema validation errors', () => {
    const schema: NodeIOSchema = {
      inputs: {
        name: {
          type: 'string',
          required: true,
          validation: {
            pattern: '['
          }
        }
      },
      outputs: {
        result: {
          type: 'string'
        }
      }
    };

    const engine = new ValidationEngine(schema);
    const result = engine.validateSchema();

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "Input 'name': pattern must be a valid regular expression"
    );
  });

  it('applies zero-valued maxLength constraints to strings', () => {
    const schema: NodeIOSchema = {
      inputs: {
        name: {
          type: 'string',
          required: true,
          validation: {
            maxLength: 0
          }
        }
      },
      outputs: {
        result: {
          type: 'string'
        }
      }
    };

    const engine = new ValidationEngine(schema);

    expect(engine.validateInputs({ name: '' }).valid).toBe(true);
    expect(engine.validateInputs({ name: 'x' }).valid).toBe(false);
  });

  it('applies zero-valued maxLength constraints to arrays', () => {
    const schema: NodeIOSchema = {
      inputs: {
        items: {
          type: 'array',
          required: true,
          validation: {
            maxLength: 0
          }
        }
      },
      outputs: {
        result: {
          type: 'array'
        }
      }
    };

    const engine = new ValidationEngine(schema);

    expect(engine.validateInputs({ items: [] }).valid).toBe(true);
    expect(engine.validateInputs({ items: ['x'] }).valid).toBe(false);
  });

  it('rejects contradictory string length bounds', () => {
    const schema: NodeIOSchema = {
      inputs: {
        name: {
          type: 'string',
          required: true,
          validation: {
            minLength: 5,
            maxLength: 3
          }
        }
      },
      outputs: {
        result: {
          type: 'string'
        }
      }
    };

    const engine = new ValidationEngine(schema);
    const result = engine.validateSchema();

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "Input 'name': minLength cannot be greater than maxLength"
    );
  });

  it('rejects contradictory numeric bounds', () => {
    const schema: NodeIOSchema = {
      inputs: {
        count: {
          type: 'number',
          required: true,
          validation: {
            min: 10,
            max: 3
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
    const result = engine.validateSchema();

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "Input 'count': min cannot be greater than max"
    );
  });

  it('rejects negative string length bounds', () => {
    const schema: NodeIOSchema = {
      inputs: {
        name: {
          type: 'string',
          required: true,
          validation: {
            minLength: -1
          }
        }
      },
      outputs: {
        result: {
          type: 'string'
        }
      }
    };

    const engine = new ValidationEngine(schema);
    const result = engine.validateSchema();

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "Input 'name': minLength cannot be negative"
    );
  });

  it('rejects negative array length bounds', () => {
    const schema: NodeIOSchema = {
      inputs: {
        items: {
          type: 'array',
          required: true,
          validation: {
            maxLength: -1
          }
        }
      },
      outputs: {
        result: {
          type: 'array'
        }
      }
    };

    const engine = new ValidationEngine(schema);
    const result = engine.validateSchema();

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "Input 'items': maxLength cannot be negative"
    );
  });
});
