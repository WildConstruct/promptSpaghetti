import type { PreviewResult } from '../epic1/contexts/PreviewContext';

export type OutputTemplateId = 'plain' | 'three-up-image-prompt';

export interface OutputTemplateOption {
  id: OutputTemplateId;
  label: string;
  description: string;
}

export interface FormatPreviewResultsOptions {
  templateId: OutputTemplateId;
}

const THREE_UP_SLOT_LABELS = ['Left', 'Center', 'Right'] as const;

export const OUTPUT_TEMPLATE_OPTIONS: OutputTemplateOption[] = [
  {
    id: 'plain',
    label: 'Plain seed list',
    description: 'Copy each preview result as a seed-labeled text row.'
  },
  {
    id: 'three-up-image-prompt',
    label: '3-up image prompt',
    description:
      'Group every three seed outputs into one wide left/center/right image prompt.'
  }
];

export function getOutputTemplateOption(
  templateId: OutputTemplateId
): OutputTemplateOption | undefined {
  return OUTPUT_TEMPLATE_OPTIONS.find(option => option.id === templateId);
}

export function formatPreviewResultsForTemplate(
  results: PreviewResult[],
  options: FormatPreviewResultsOptions
): string {
  if (options.templateId === 'three-up-image-prompt') {
    return formatThreeUpImagePrompts(results);
  }

  return formatPlainSeedList(results);
}

function formatPlainSeedList(results: PreviewResult[]): string {
  return results
    .map(result => `Seed ${result.seed}: ${result.result}`)
    .join('\n');
}

function formatThreeUpImagePrompts(results: PreviewResult[]): string {
  const promptBlocks: string[] = [];

  for (let index = 0; index + 2 < results.length; index += 3) {
    const group = results.slice(index, index + 3);
    promptBlocks.push(formatThreeUpImagePromptBlock(group));
  }

  return promptBlocks.join('\n\n---\n\n');
}

function formatThreeUpImagePromptBlock(results: PreviewResult[]): string {
  const slotLines = results.map((result, index) => {
    const slot = THREE_UP_SLOT_LABELS[index];
    return `${slot} slot (seed ${result.seed}): ${result.result.trim()}`;
  });

  return [
    'Use case: historical-scene',
    'Asset type: Prompt Spaghetti multi-seed 3-up image prompt',
    'Primary request: Create one wide 16:9 photorealistic studio card with three separate full-body characters arranged left, center, and right.',
    '',
    'Character slots from grouped Prompt Spaghetti outputs:',
    ...slotLines,
    '',
    'Scene/backdrop: one seamless neutral light-gray studio/card background across the whole wide frame, simple floor plane, no scenic environment.',
    'Style/medium: documentary period photo realism, character-card studio photography, clean full-body silhouettes suitable for an extras/crowd-card layout.',
    'Composition/framing: wide split-screen / three-up layout, three people only, each person isolated in their own visual slot with generous negative space between them, all heads, hands, shoes, and feet visible, no cropping, no overlap, no merged bodies.',
    'Lighting/mood: soft even studio lighting, natural small shadows under shoes or chairs only.',
    'Constraints: one person per slot, exactly three people total, distinct face, age/build, wardrobe silhouette, and pose for each slot, no duplicate bodies, no extra people, no readable logos, no readable text, no watermark.'
  ].join('\n');
}
