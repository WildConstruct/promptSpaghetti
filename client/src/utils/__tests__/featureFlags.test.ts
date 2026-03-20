import {
  parseStorageBooleanFlag,
  readScenePreviewV1Flag
} from '../featureFlags';

describe('featureFlags', () => {
  it('parses common enabled values', () => {
    expect(parseStorageBooleanFlag('true')).toBe(true);
    expect(parseStorageBooleanFlag('1')).toBe(true);
    expect(parseStorageBooleanFlag('enabled')).toBe(true);
  });

  it('defaults unknown values to false', () => {
    expect(parseStorageBooleanFlag(undefined)).toBe(false);
    expect(parseStorageBooleanFlag(null)).toBe(false);
    expect(parseStorageBooleanFlag('false')).toBe(false);
    expect(parseStorageBooleanFlag('preview-soon')).toBe(false);
  });

  it('reads the scene preview flag from storage', () => {
    expect(
      readScenePreviewV1Flag({
        getItem: (key: string) => (key === 'psg:scene-preview-v1' ? 'true' : null)
      })
    ).toBe(true);
  });
});
