import { quickStartTemplates } from '../quickStartTemplates';
import { TEMPLATE_CATALOG_BY_ID } from '../templateCatalog';

const collectText = (value: unknown): string[] => {
  if (typeof value === 'string') {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.flatMap(collectText);
  }

  if (value && typeof value === 'object') {
    return Object.values(value as Record<string, unknown>).flatMap(collectText);
  }

  return [];
};

describe('phrase grammar branching template', () => {
  it('is exposed in quick-start templates and the catalog', () => {
    expect(quickStartTemplates.phrase_grammar_branching).toBeDefined();
    expect(TEMPLATE_CATALOG_BY_ID.phrase_grammar_branching).toMatchObject({
      title: 'Phrase Grammar Branching',
      category: 'characters',
      branching: true,
    });
  });

  it('uses region boxes to label the advanced grammar concepts', () => {
    const template = quickStartTemplates.phrase_grammar_branching;
    const regionLabels = template.nodes
      .filter(node => node.type === 'enhancedBoundingBox')
      .map(node => node.data.label);

    expect(regionLabels).toEqual(
      expect.arrayContaining([
        'Branch commitment',
        'Grammar glue',
        'Complete phrase merge',
        'Bad-output fix',
      ])
    );
  });

  it('contains a merge-oriented concat node', () => {
    const template = quickStartTemplates.phrase_grammar_branching;
    const mergeNodes = template.nodes.filter(
      node =>
        node.type === 'concat' &&
        collectText(node.data).some(text => /merge/i.test(text))
    );

    expect(mergeNodes.length).toBeGreaterThan(0);
  });

  it('avoids the bad t-shirt plus shirt-color phrase', () => {
    const template = quickStartTemplates.phrase_grammar_branching;
    const allTemplateText = template.nodes
      .flatMap(node => collectText(node.data))
      .join(' ')
      .toLowerCase();

    expect(allTemplateText).not.toContain('rumpled t-shirt black shirt');
  });
});
