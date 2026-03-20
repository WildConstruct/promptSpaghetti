import type { ScenePreviewV1State } from '../components/ScenePreviewV1Panel';

const STORAGE_KEY = 'epic1-scene-preview-v1-state';

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function isPlacementSurface(value: unknown): value is 'wall' | 'floor' {
  return value === 'wall' || value === 'floor';
}

function isScenePreviewState(value: unknown): value is ScenePreviewV1State {
  if (!isRecord(value)) {
    return false;
  }

  const { placements, usedCachedPreviewResultIds, mode } = value;
  if (
    !Array.isArray(placements) ||
    !Array.isArray(usedCachedPreviewResultIds) ||
    (mode !== 'grouped' && mode !== 'isolated')
  ) {
    return false;
  }

  return placements.every(placement => {
    if (!isRecord(placement)) {
      return false;
    }

    return (
      typeof placement.id === 'string' &&
      isPlacementSurface(placement.surface) &&
      typeof placement.label === 'string' &&
      typeof placement.provenance === 'string'
    );
  }) && usedCachedPreviewResultIds.every(id => typeof id === 'string');
}

export function readScenePreviewStateMapFromStorage(
  storage: Pick<Storage, 'getItem'>
): Record<string, ScenePreviewV1State> {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!isRecord(parsed)) {
      return {};
    }

    return Object.entries(parsed).reduce<Record<string, ScenePreviewV1State>>(
      (acc, [groupId, value]) => {
        if (isScenePreviewState(value)) {
          acc[groupId] = value;
        }
        return acc;
      },
      {}
    );
  } catch {
    return {};
  }
}

export function writeScenePreviewStateMapToStorage(
  storage: Pick<Storage, 'setItem' | 'removeItem'>,
  stateMap: Record<string, ScenePreviewV1State>
) {
  if (Object.keys(stateMap).length === 0) {
    storage.removeItem(STORAGE_KEY);
    return;
  }

  storage.setItem(STORAGE_KEY, JSON.stringify(stateMap));
}

export { STORAGE_KEY as SCENE_PREVIEW_STATE_STORAGE_KEY };
