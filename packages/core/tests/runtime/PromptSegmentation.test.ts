import { segmentPrompt } from '../../runtime/prompting/PromptSegmentation';

describe('segmentPrompt', () => {
  it('splits comma-delimited descriptors into individual segments', () => {
    const prompt =
      'a black grandmother and her granddaughter, laughing, minimalist green background, facing each other, connection, like a fashion photoshoot';

    const { segments } = segmentPrompt(prompt);

    expect(segments).toHaveLength(6);
    expect(segments.map(segment => segment.text.trim())).toEqual([
      'a black grandmother and her granddaughter',
      'laughing',
      'minimalist green background',
      'facing each other',
      'connection',
      'like a fashion photoshoot'
    ]);

    // Ensure the segments cover the entire prompt without overlap gaps.
    const covered = segments
      .map(({ startIndex, endIndex }) => prompt.slice(startIndex, endIndex))
      .join('');
    expect(covered.replace(/,\s*/g, '')).toBe(
      prompt.replace(/,\s*/g, '')
    );
  });
});
