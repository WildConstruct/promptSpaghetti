/**
 * ConcatNode natural-language assembly behavior (joinStyle).
 * Verifies prose output when joinStyle is set, and that the default/legacy
 * separator behavior is unchanged when it is not.
 */
import { ConcatNode } from '../ConcatNode';
import { ExecutionContext } from '../../../types';

const ctx = {} as ExecutionContext; // ConcatNode.run does not use ctx

describe('ConcatNode natural-language assembly', () => {
  it('keeps legacy separator behavior by default', async () => {
    const node = new ConcatNode('c1', { separator: ' ', trimInputs: true });
    node.setInputs(['a fierce', 'knight']);
    expect(await node.run(ctx)).toBe('a fierce knight');
  });

  it('keeps explicit separator behavior verbatim', async () => {
    const node = new ConcatNode('c2', {
      separator: ', ',
      trimInputs: true,
      joinStyle: 'separator'
    });
    node.setInputs(['red', 'green', 'blue']);
    expect(await node.run(ctx)).toBe('red, green, blue');
  });

  it('produces a sentence with joinStyle "sentence"', async () => {
    const node = new ConcatNode('c3', {
      separator: ' ',
      trimInputs: true,
      joinStyle: 'sentence'
    });
    node.setInputs(['a', 'fierce', 'knight']);
    expect(await node.run(ctx)).toBe('A fierce knight.');
  });

  it('produces an Oxford list with joinStyle "and"', async () => {
    const node = new ConcatNode('c4', {
      separator: ' ',
      trimInputs: true,
      joinStyle: 'and'
    });
    node.setInputs(['red', 'green', 'blue']);
    expect(await node.run(ctx)).toBe('red, green, and blue');
  });

  it('drops empty fragments so prose has no gaps', async () => {
    const node = new ConcatNode('c5', {
      separator: ' ',
      trimInputs: true,
      joinStyle: 'space'
    });
    node.setInputs(['a fierce', '', 'knight']);
    expect(await node.run(ctx)).toBe('a fierce knight');
  });

  it('dedupe removes case-insensitive duplicates', async () => {
    const node = new ConcatNode('c6', {
      separator: ', ',
      trimInputs: true,
      joinStyle: 'comma',
      dedupe: true
    });
    node.setInputs(['Red', 'red', 'blue']);
    expect(await node.run(ctx)).toBe('Red, blue');
  });

  it('preview mirrors run output for prose styles', () => {
    const node = new ConcatNode('c7', {
      separator: ' ',
      trimInputs: true,
      joinStyle: 'sentence'
    });
    expect(node.preview(['a', 'brave', 'knight'])).toBe('A brave knight.');
  });
});
