import { OutputNode } from '../../runtime/nodes/epic1/OutputNode';
import type { ExecutionContext } from '../../runtime/types';

const ctx: ExecutionContext = { seed: 'output', variables: {} };

describe('OutputNode', () => {
  it('stores input and returns concatenated output', async () => {
    const node = new OutputNode('out');
    node.setInput(['Hello', 'world']);

    expect(node.getOutput()).toBe('Hello world');
    expect(await node.run(ctx)).toBe('Hello world');

    const stats = node.getStats();
    expect(stats.isEmpty).toBe(false);
    expect(stats.wordCount).toBe(2);
    expect(stats.lineCount).toBe(1);
    expect(stats.lastUpdated).toBeDefined();
  });

  it('clearOutput resets state and updates timestamp', () => {
    const node = new OutputNode('out-clear');
    node.setInput('Something');
    const beforeClear = node.getStats().lastUpdated;

    node.clearOutput();
    expect(node.getOutput()).toBe('');
    expect(node.getStats().isEmpty).toBe(true);
    expect(
      new Date(node.getStats().lastUpdated ?? 0).getTime()
    ).toBeGreaterThanOrEqual(new Date(beforeClear ?? 0).getTime());
  });

  it('classifies formatted output correctly', () => {
    const node = new OutputNode('format');

    node.setInput('{"valid": true}');
    expect(node.getFormattedOutput().format).toBe('json');

    node.setInput('```js\nconsole.log("hi");\n```');
    expect(node.getFormattedOutput().format).toBe('markdown');

    node.setInput('function greet() { return "hi"; }');
    expect(node.getFormattedOutput().format).toBe('code');

    node.setInput('plain text');
    expect(node.getFormattedOutput().format).toBe('plain');
  });

  it('prevents unlocking and logs a warning', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
    const node = new OutputNode('warn');

    node.unlock();
    expect(warnSpy).toHaveBeenCalledWith('Output nodes cannot be unlocked');
    warnSpy.mockRestore();
  });

  it('serializes metadata including computed stats', () => {
    const node = new OutputNode('serialize');
    node.setInput('hello world');

    const serialized = node.serialize();
    expect(serialized.metadata).toEqual(
      expect.objectContaining({
        isEmpty: false,
        wordCount: 2,
        format: 'plain'
      })
    );
  });
});
