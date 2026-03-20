import type { ImageBootstrapSelectionSummary } from './imageBootstrapSelection';

const STORAGE_KEY = 'epic1-bootstrap-refinement-seed';

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

export function readBootstrapRefinementSeedFromStorage(
  storage: Pick<Storage, 'getItem'>
): ImageBootstrapSelectionSummary | null {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!isRecord(parsed) || typeof parsed.bootstrapGroupId !== 'string') {
      return null;
    }

    return parsed as ImageBootstrapSelectionSummary;
  } catch {
    return null;
  }
}

export function writeBootstrapRefinementSeedToStorage(
  storage: Pick<Storage, 'setItem' | 'removeItem'>,
  seed: ImageBootstrapSelectionSummary | null
) {
  if (!seed) {
    storage.removeItem(STORAGE_KEY);
    return;
  }

  storage.setItem(STORAGE_KEY, JSON.stringify(seed));
}

export { STORAGE_KEY as BOOTSTRAP_REFINEMENT_SEED_STORAGE_KEY };
