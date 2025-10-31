import { BaseInlineEditableNode } from '../../runtime/nodes/epic1/BaseInlineEditableNode';
import type { ExecutionContext } from '../../runtime/types';

const flushPromises = () => new Promise(resolve => setTimeout(resolve, 0));

class TestInlineNode extends BaseInlineEditableNode<{ text: string }, string> {
  constructor(
    id: string,
    initialValue = { text: 'initial' },
    config = {}
  ) {
    super(id, initialValue, { previewMode: 'auto', ...config });
  }

  async run(ctx: ExecutionContext): Promise<string> {
    return `${this.getCurrentValue().text}:${ctx.seed}`;
  }

  protected cloneValue(value: { text: string }): { text: string } {
    return { ...value };
  }

  protected async validateValue(value: { text: string }) {
    const errors: string[] = [];
    if (!value.text || value.text.trim().length === 0) {
      errors.push('Text is required');
    }
    if (value.text && value.text.length > 50) {
      errors.push('Text is too long');
    }
    return { valid: errors.length === 0, errors };
  }

  getNodeType(): string {
    return 'TestInlineNode';
  }
}

const ctx: ExecutionContext = { seed: 'ctx', variables: {} };

describe('BaseInlineEditableNode', () => {
  it('prevents editing when locked and allows after unlock', () => {
    const node = new TestInlineNode('locked', { text: 'value' }, {
      isLocked: true,
      lockReason: 'Testing lock'
    });

    expect(() => node.startEdit()).toThrow(/Node is locked/);
    node.unlock();
    expect(() => node.startEdit()).not.toThrow();
  });

  it('supports edit lifecycle with validation and commit', async () => {
    const node = new TestInlineNode('edit');

    node.startEdit();
    expect(node.isEditing()).toBe(true);

    node.updateEditBuffer({ text: 'updated' });
    await flushPromises();

    expect(node.isDirty()).toBe(true);
    expect(node.getValidationErrors()).toEqual([]);

    await node.commitEdit();
    expect(node.isEditing()).toBe(false);
    expect(node.getCurrentValue().text).toBe('updated');
    expect(node.getData().lastPreviewUpdate).toBeDefined();
  });

  it('retains edit mode when validation fails on commit', async () => {
    const node = new TestInlineNode('invalid');

    node.startEdit();
    node.updateEditBuffer({ text: '' });
    await flushPromises();

    await expect(node.commitEdit()).rejects.toThrow(/Validation failed/);
    expect(node.isEditing()).toBe(true);
    expect(node.getValidationErrors()).toContain('Text is required');
  });

  it('clears edit state on cancel', () => {
    const node = new TestInlineNode('cancel');
    node.startEdit();
    node.updateEditBuffer({ text: 'draft' });
    node.cancelEdit();

    expect(node.isEditing()).toBe(false);
    expect(node.isDirty()).toBe(false);
    expect(node.getValidationErrors()).toEqual([]);
    expect(node.getCurrentValue().text).toBe('initial');
  });

  it('provides cloned data snapshots', () => {
    const node = new TestInlineNode('clone', { text: 'original' });
    const snapshot = node.getData();

    snapshot.value.text = 'mutated';
    snapshot.editState.isEditing = true;

    const refreshed = node.getData();
    expect(refreshed.value.text).toBe('original');
    expect(refreshed.editState.isEditing).toBe(false);
  });

  it('allows data round-trip via setData', () => {
    const node = new TestInlineNode('round');
    const data = node.getData();
    data.value.text = 'round-trip';
    data.editState.isEditing = true;
    data.editState.editBuffer = { text: 'buffer' };

    node.setData(data);
    expect(node.getCurrentValue().text).toBe('round-trip');
    expect(node.isEditing()).toBe(true);
    expect(node.getValidationErrors()).toEqual([]);
  });

  it('executes run with latest committed value', async () => {
    const node = new TestInlineNode('run');
    node.startEdit();
    node.updateEditBuffer({ text: 'execution' });
    await flushPromises();
    await node.commitEdit();

    const output = await node.run(ctx);
    expect(output).toBe('execution:ctx');
  });
});
