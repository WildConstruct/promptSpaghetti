import { TextBlockNode } from '../../runtime/nodes/epic1/TextBlockNode';
import type { ExecutionContext } from '../../runtime/types';

const ctx: ExecutionContext = {
  seed: 'seed',
  variables: {
    hero: 'Aurora',
    location: 'Skyreach'
  }
};

describe('TextBlockNode', () => {
  it('returns processed text with variable substitution', async () => {
    const node = new TextBlockNode('text', 'Hello {{hero}} from {{location}}!');
    const output = await node.run(ctx);
    expect(output).toBe('Hello Aurora from Skyreach!');
  });

  it('rejects dangerous content and multiline constraints', async () => {
    const node = new TextBlockNode('validate', '', {
      multiline: false,
      maxLength: 10
    });

    const tooLong = await (node as any).validateValue('This is definitely too long');
    expect(tooLong.valid).toBe(false);
    expect(tooLong.errors).toContain(
      'Text exceeds maximum length of 10 characters'
    );

    const multiline = await (node as any).validateValue('line1\nline2');
    expect(multiline.valid).toBe(false);
    expect(multiline.errors).toContain('Multiline text is not allowed');

    const dangerous = await (node as any).validateValue('<script>alert(1)</script>');
    expect(dangerous.valid).toBe(false);
    expect(dangerous.errors).toContain('Text contains potentially dangerous content');
  });

  it('updates config flags and metadata helpers', () => {
    const node = new TextBlockNode('config', 'hello world', {
      multiline: true,
      placeholder: 'type text'
    });

    expect(node.getTextConfig().multiline).toBe(true);
    node.setMultiline(false);
    expect(node.getTextConfig().multiline).toBe(false);
    expect(node.getTextConfig().placeholder).toBe('type text');

    node.setMaxLength(3);
    expect(node.getTextConfig().maxLength).toBe(3);
    expect(node.getPreview(5)).toBe('he...');
    expect(node.getWordCount()).toBe(2);
    expect(node.getCharacterCount()).toBe('hello world'.length);
  });

  it('serializes with metadata and config', () => {
    const node = new TextBlockNode('serialize', 'Some quick text', {
      placeholder: 'enter'
    });
    const serialized = node.serialize();

    expect(serialized.config.placeholder).toBe('enter');
    expect(serialized.metadata.wordCount).toBe(3);
    expect(serialized.metadata.characterCount).toBeGreaterThan(0);
  });
});
