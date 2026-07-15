import {
  formatPreviewResultsForTemplate,
  getOutputTemplateOption,
} from '../outputTemplates';

const results = [
  { seed: 101, result: 'left person prompt' },
  { seed: 102, result: 'center person prompt' },
  { seed: 103, result: 'right person prompt' },
  { seed: 104, result: 'incomplete extra prompt' },
];

describe('outputTemplates', () => {
  it('formats plain seed lists with the current Copy All shape', () => {
    expect(
      formatPreviewResultsForTemplate(results.slice(0, 3), {
        templateId: 'plain',
      })
    ).toBe(
      [
        'Seed 101: left person prompt',
        'Seed 102: center person prompt',
        'Seed 103: right person prompt',
      ].join('\n')
    );
  });

  it('formats complete seed triples as a 3-up image prompt', () => {
    const formatted = formatPreviewResultsForTemplate(results.slice(0, 3), {
      templateId: 'three-up-image-prompt',
    });

    expect(formatted).toContain(
      'Create one wide 16:9 photorealistic studio card with three separate full-body characters arranged left, center, and right.'
    );
    expect(formatted).toContain('Left slot (seed 101): left person prompt');
    expect(formatted).toContain('Center slot (seed 102): center person prompt');
    expect(formatted).toContain('Right slot (seed 103): right person prompt');
    expect(formatted).toContain('exactly three people total');
    expect(formatted).toContain(
      'distinct face, age/build, wardrobe silhouette, and pose for each slot'
    );
  });

  it('skips incomplete final triples for 3-up image prompts', () => {
    const formatted = formatPreviewResultsForTemplate(results, {
      templateId: 'three-up-image-prompt',
    });

    expect(formatted).toContain('Left slot (seed 101): left person prompt');
    expect(formatted).not.toContain('incomplete extra prompt');
  });

  it('exposes human-readable template options for the tray selector', () => {
    expect(getOutputTemplateOption('plain')?.label).toBe('Plain seed list');
    expect(getOutputTemplateOption('three-up-image-prompt')?.label).toBe(
      '3-up image prompt'
    );
  });
});
