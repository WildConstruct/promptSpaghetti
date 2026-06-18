import {
  ADVANCED_TUTORIAL_STEP_IDS,
  advancedTutorialSteps,
} from '../advancedTutorialModel';
import {
  TUTORIAL_ANCHOR_SELECTORS,
  tutorialSequences,
} from '../tutorialModel';

describe('advanced tutorial model', () => {
  it('keeps advanced step ids unique', () => {
    const ids = advancedTutorialSteps.map(step => step.id);

    expect(new Set(ids).size).toBe(ids.length);
    expect(Object.values(ADVANCED_TUTORIAL_STEP_IDS)).toHaveLength(ids.length);
  });

  it('defines complete steps with known anchors', () => {
    const knownAnchors = Object.keys(TUTORIAL_ANCHOR_SELECTORS);

    for (const step of advancedTutorialSteps) {
      expect(step.title.trim()).not.toBe('');
      expect(step.description.trim()).not.toBe('');

      if (step.anchorId) {
        expect(knownAnchors).toContain(step.anchorId);
      }
    }
  });

  it('registers the advanced sequence with phrase-system lessons', () => {
    expect(tutorialSequences.advanced).toBe(advancedTutorialSteps);
    expect(tutorialSequences.advanced.map(step => step.title)).toEqual(
      expect.arrayContaining([
        'Prompts Are Phrase Machines',
        'Merge When The Phrase Is Whole',
        'Region Boxes As Thought Labels',
      ])
    );
  });
});
