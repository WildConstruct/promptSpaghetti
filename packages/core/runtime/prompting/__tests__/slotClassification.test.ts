import { classifySlotText, slotsFromSegments } from '../slotClassification';
import { segmentPrompt } from '../PromptSegmentation';
import {
  matchFragmentsForSlot,
  matchFragmentsForSlots
} from '../slotFragmentMatch';

describe('slotClassification', () => {
  it('classifies lighting and setting phrases', () => {
    const light = classifySlotText('golden hour warm glow on the subject');
    expect(light.slotType).toBe('lighting');
    expect(light.classificationConfidence).toBeGreaterThan(0.5);

    const setting = classifySlotText('rainy city street and foggy harbor');
    expect(setting.slotType).toBe('setting');
    expect(setting.domainHints).toEqual(
      expect.arrayContaining(['environment'])
    );
  });

  it('builds slots from segmented prompt without dropping text', () => {
    const prompt =
      'A weary detective in a trench coat, rainy neon street, cinematic lighting';
    const { segments } = segmentPrompt(prompt);
    const slots = slotsFromSegments(segments);
    expect(slots.length).toBeGreaterThan(0);
    const joined = slots.map(s => s.sourceText).join(' ');
    expect(joined.toLowerCase()).toContain('detective');
  });
});

describe('slotFragmentMatch', () => {
  const library = [
    {
      id: 'lighting-moods',
      name: 'Lighting Moods',
      path: '/assets/library/setting-environment/lighting-moods.psg',
      slotTypes: ['lighting', 'mood', 'setting'],
      domains: ['environment'],
      tone: ['cinematic'],
      tags: ['lighting', 'atmosphere'],
      priority: 2
    },
    {
      id: 'body-types',
      name: 'Body Types',
      path: '/assets/library/body-silhouette/body-types.psg',
      slotTypes: ['appearance', 'subject'],
      domains: ['character'],
      tags: ['body'],
      priority: 1
    },
    {
      id: 'aerial',
      name: 'Aerial Motions',
      path: '/assets/library/action-dynamics/aerial-motions.psg',
      slotTypes: ['action'],
      domains: ['character'],
      tags: ['motion'],
      priority: 1
    }
  ];

  it('returns top matches with reasons for same slot and domain', () => {
    const hits = matchFragmentsForSlot(
      {
        slotType: 'lighting',
        sourceText: 'cinematic neon lighting',
        domainHints: ['environment'],
        toneHints: ['cinematic'],
        limit: 3
      },
      library
    );
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0].fragmentId).toBe('lighting-moods');
    expect(hits[0].reasons.join(' ')).toMatch(/slot|domain|tone/i);
  });

  it('leaves unmatched slots empty rather than inventing fragments', () => {
    const hits = matchFragmentsForSlot(
      {
        slotType: 'constraint',
        sourceText: 'must not include logos',
        domainHints: [],
        limit: 3
      },
      library
    );
    expect(hits).toEqual([]);
  });

  it('maps multiple slots stably', () => {
    const map = matchFragmentsForSlots(
      [
        {
          id: 'slot-1',
          slotType: 'appearance',
          sourceText: 'trench coat silhouette',
          domainHints: ['character']
        },
        {
          id: 'slot-2',
          slotType: 'action',
          sourceText: 'soars on updrafts',
          domainHints: ['character']
        }
      ],
      library,
      3
    );
    expect(map['slot-1'][0]?.fragmentId).toBe('body-types');
    expect(map['slot-2'][0]?.fragmentId).toBe('aerial');
  });
});
