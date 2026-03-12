import { CustomNodeAdapter } from '../runtime/CustomNodeAdapter';
import { MockContextFactory } from '../testing/MockContext';
import {
  CustomNodeBase,
  CustomNodeConfig,
  CustomNodeResult,
  CustomNodeRuntime,
  ValidationResult
} from '../types';

class DynamicValidationNode extends CustomNodeBase {
  public executed = false;

  validate(): ValidationResult {
    return {
      valid: true,
      errors: [],
      warnings: []
    };
  }

  validateDynamic(inputs: Record<string, unknown>): ValidationResult {
    if (inputs.mode === 'forbidden') {
      return {
        valid: false,
        errors: ['Mode cannot be forbidden'],
        warnings: []
      };
    }

    return {
      valid: true,
      errors: [],
      warnings: []
    };
  }

  execute(runtime: CustomNodeRuntime): CustomNodeResult {
    this.executed = true;

    return {
      outputs: {
        result: runtime.inputs.mode
      }
    };
  }
}

const createConfig = (): CustomNodeConfig =>
  ({
    metadata: {
      type: 'test.dynamic-validation-node',
      version: '1.0.0',
      displayName: 'Dynamic Validation Node',
      description: 'Test node for dynamic validation',
      category: 'test',
      author: { name: 'Test' }
    },
    schema: {
      inputs: {
        mode: {
          type: 'string',
          required: true
        }
      },
      outputs: {
        result: {
          type: 'string'
        }
      }
    },
    deterministic: true,
    cacheable: false,
    stateful: false
  }) as CustomNodeConfig;

describe('CustomNodeAdapter dynamic validation', () => {
  it('blocks execution when validateDynamic fails', async () => {
    const node = new DynamicValidationNode('test-node', createConfig());
    const adapter = new CustomNodeAdapter('test-node', node, createConfig());
    const ctx = MockContextFactory.create({
      variables: { mode: 'forbidden' }
    });

    await expect(adapter.run(ctx)).rejects.toThrow(
      'Dynamic input validation failed: Mode cannot be forbidden'
    );
    expect(node.executed).toBe(false);
  });

  it('allows execution when validateDynamic passes', async () => {
    const node = new DynamicValidationNode('test-node', createConfig());
    const adapter = new CustomNodeAdapter('test-node', node, createConfig());
    const ctx = MockContextFactory.create({
      variables: { mode: 'allowed' }
    });

    await expect(adapter.run(ctx)).resolves.toBe('allowed');
    expect(node.executed).toBe(true);
  });
});
