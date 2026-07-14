import { getDefaultNodeData } from '../nodeDefaults';

describe('getDefaultNodeData (B5 prose-join defaults)', () => {
  it('gives new Merge/concat nodes sentence joinStyle without forcing legacy graphs', () => {
    const data = getDefaultNodeData('concat');
    expect(data).toMatchObject({
      separator: ' ',
      joinStyle: 'sentence',
      dedupe: false
    });
  });

  it('does not invent joinStyle for unrelated node types', () => {
    expect(getDefaultNodeData('textBlock').joinStyle).toBeUndefined();
  });
});
