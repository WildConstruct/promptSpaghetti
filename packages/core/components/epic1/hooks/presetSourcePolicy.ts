type PresetSourcePayload = {
  psglib?: string;
  content?: unknown;
};

export const ALLOWED_PRESET_SOURCE_ROOTS = [
  '/assets/library/',
  '/presets/',
  '/asset-browser/presets/'
] as const;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const looksLikePresetDocument = (value: unknown): value is string => {
  if (typeof value !== 'string') {
    return false;
  }

  try {
    const parsed = JSON.parse(value);
    if (!isRecord(parsed)) {
      return false;
    }

    if (parsed.fileType === 'psglib') {
      return true;
    }

    return (
      typeof parsed.version === 'string' &&
      Array.isArray(parsed.nodes) &&
      (Array.isArray(parsed.edges) ||
        Array.isArray(parsed.groups) ||
        Array.isArray(parsed.regions) ||
        isRecord(parsed.metadata))
    );
  } catch {
    return false;
  }
};

const hasPathTraversal = (path: string): boolean =>
  path.split('/').some(segment => segment === '..' || segment.includes('\\'));

export const isSafePresetSourcePath = (path: string): boolean => {
  if (!path) {
    return false;
  }

  if (/^[a-z]+:\/\//i.test(path) || path.startsWith('//')) {
    return false;
  }

  if (hasPathTraversal(path)) {
    return false;
  }

  return ALLOWED_PRESET_SOURCE_ROOTS.some(root => path.startsWith(root));
};

export const getInlinePresetDocument = (
  payload: PresetSourcePayload
): string | null => {
  const inlineContent =
    payload?.psglib ??
    (typeof payload?.content === 'string' ? payload.content : null);

  return looksLikePresetDocument(inlineContent) ? inlineContent : null;
};
