import {
  tutorialSequences,
  TUTORIAL_SEQUENCE_META,
  type TutorialSequenceId
} from '../tutorialModel';

// The lesson ladder: each of these teaches one concept on a loaded graph and
// ends on a hands-on lab bench.
const LESSON_SEQUENCES: TutorialSequenceId[] = [
  'foundations',
  'weighted-choice',
  'concat',
  'variables',
  'prefixes',
  'branching',
  'region-boxes',
  'televangelist'
];

describe('lesson tutorial ladder', () => {
  it('registers every sequence in both the sequence map and the panel meta', () => {
    const seqIds = Object.keys(tutorialSequences).sort();
    const metaIds = Object.keys(TUTORIAL_SEQUENCE_META).sort();
    expect(seqIds).toEqual(metaIds);
  });

  it('orders the panel metadata uniquely and contiguously', () => {
    const orders = Object.values(TUTORIAL_SEQUENCE_META)
      .map(m => m.order)
      .sort((a, b) => a - b);
    expect(new Set(orders).size).toBe(orders.length);
  });

  it.each(LESSON_SEQUENCES)('lesson "%s" loads a graph then ends on a lab bench', id => {
    const steps = tutorialSequences[id];
    expect(steps.length).toBeGreaterThan(1);

    // First step loads the teaching graph.
    expect(typeof steps[0].loadTemplateId).toBe('string');
    expect(steps[0].loadTemplateId!.length).toBeGreaterThan(0);

    // Every step is fully formed.
    for (const step of steps) {
      expect(step.id).toBeTruthy();
      expect(step.title).toBeTruthy();
      expect(step.description).toBeTruthy();
    }

    // Exactly one lab bench, at the end (a tutorial may add a short bridge coda
    // after it, e.g. variables → televangelist).
    const labSteps = steps.filter(s => s.action === 'lab');
    expect(labSteps).toHaveLength(1);
    const labIndex = steps.findIndex(s => s.action === 'lab');
    expect(labIndex).toBeGreaterThanOrEqual(steps.length - 2);
  });

  it('only the first step of each lesson loads a graph', () => {
    for (const id of LESSON_SEQUENCES) {
      const withLoad = tutorialSequences[id].filter(s => s.loadTemplateId);
      expect(withLoad).toHaveLength(1);
      expect(tutorialSequences[id][0].loadTemplateId).toBeDefined();
    }
  });

  it('bridges the variables lesson toward the televangelist capstone', () => {
    const variablesText = tutorialSequences.variables
      .map(s => `${s.title} ${s.description}`)
      .join(' ')
      .toLowerCase();
    expect(variablesText).toContain('televangelist');
  });
});
