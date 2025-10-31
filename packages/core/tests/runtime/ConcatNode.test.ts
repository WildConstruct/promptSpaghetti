import { ConcatNode } from '../../runtime/nodes/epic1/ConcatNode';
import type { ExecutionContext } from '../../runtime/types';

const ctx: ExecutionContext = { seed: 'concat', variables: {} };

describe('ConcatNode', () => {
  it('concatenates inputs with trimming by default', async () => {
    const node = new ConcatNode('concat-default');
    node.setInputs(['  hello  ', '  world  ', '', '   ']);

    const result = await node.run(ctx);
    expect(result).toBe('hello world');
    expect(node.getInputCount()).toBe(4);
  });

  it('respects custom separator and trimming preferences', async () => {
    const node = new ConcatNode(
      'concat-custom',
      { separator: ', ', trimInputs: false }
    );

    node.setInputs(['a ', ' b', 'c']);
    const result = await node.run(ctx);
    expect(result).toBe('a ,  b, c');

    node.setSeparator(' | ');
    node.setTrimInputs(true);
    node.setInputs(['  apple  ', 'banana', '  carrot  ']);

    const trimmedResult = await node.run(ctx);
    expect(trimmedResult).toBe('apple | banana | carrot');
    expect(node.getSeparator()).toBe(' | ');
    expect(node.getTrimInputs()).toBe(true);
  });

  it('provides helpful separator presets and preview', () => {
    const node = new ConcatNode('preview');
    node.setInputs(['alpha', ' beta ', 'gamma']);

    const preview = node.preview([' one ', ' two', 'three ']);
    expect(preview).toBe('one two three');
    node.clearInputs();
    expect(node.getInputCount()).toBe(0);

    const presets = ConcatNode.getSeparatorPresets();
    expect(presets.find(preset => preset.label === 'Comma')?.value).toBe(', ');
  });

  it('serializes metadata about current configuration', () => {
    const node = new ConcatNode('serialize');
    node.setInputs(['a', 'b', 'c']);
    node.setSeparator(' / ');

    const serialized = node.serialize();
    expect(serialized.metadata).toEqual(
      expect.objectContaining({
        inputCount: 3,
        separatorLength: 3,
        separatorDisplay: ' / '
      })
    );
  });

  it('validates configuration and reports issues', async () => {
    const node = new ConcatNode('validate');
    const validation = await (node as any).validateValue({
      separator: 123 as unknown as string,
      trimInputs: 'yes' as unknown as boolean
    });

    expect(validation.valid).toBe(false);
    expect(validation.errors).toEqual(
      expect.arrayContaining(['Separator must be a string', 'trimInputs must be a boolean'])
    );
  });
});

