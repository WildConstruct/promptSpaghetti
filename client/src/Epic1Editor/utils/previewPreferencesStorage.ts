export interface PreviewPreferences {
  backendId: string | null;
  model: string | null;
}

export interface PreviewPreferenceMap {
  bootstrap: PreviewPreferences;
  scene: PreviewPreferences;
}

const STORAGE_KEY = 'epic1-preview-preferences';

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

export function readPreviewPreferencesFromStorage(
  storage: Pick<Storage, 'getItem'>
): PreviewPreferenceMap {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        bootstrap: { backendId: null, model: null },
        scene: { backendId: null, model: null }
      };
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!isRecord(parsed)) {
      return {
        bootstrap: { backendId: null, model: null },
        scene: { backendId: null, model: null }
      };
    }

    // Backward compatibility for the earlier single-preference shape.
    if ('backendId' in parsed || 'model' in parsed) {
      const legacy = {
        backendId: typeof parsed.backendId === 'string' ? parsed.backendId : null,
        model: typeof parsed.model === 'string' ? parsed.model : null
      };
      return {
        bootstrap: legacy,
        scene: legacy
      };
    }

    return {
      bootstrap: isRecord(parsed.bootstrap)
        ? {
            backendId:
              typeof parsed.bootstrap.backendId === 'string'
                ? parsed.bootstrap.backendId
                : null,
            model:
              typeof parsed.bootstrap.model === 'string'
                ? parsed.bootstrap.model
                : null
          }
        : { backendId: null, model: null },
      scene: isRecord(parsed.scene)
        ? {
            backendId:
              typeof parsed.scene.backendId === 'string'
                ? parsed.scene.backendId
                : null,
            model:
              typeof parsed.scene.model === 'string'
                ? parsed.scene.model
                : null
          }
        : { backendId: null, model: null }
    };
  } catch {
    return {
      bootstrap: { backendId: null, model: null },
      scene: { backendId: null, model: null }
    };
  }
}

export function writePreviewPreferencesToStorage(
  storage: Pick<Storage, 'setItem' | 'removeItem'>,
  preferences: PreviewPreferenceMap
) {
  if (
    !preferences.bootstrap.backendId &&
    !preferences.bootstrap.model &&
    !preferences.scene.backendId &&
    !preferences.scene.model
  ) {
    storage.removeItem(STORAGE_KEY);
    return;
  }

  storage.setItem(STORAGE_KEY, JSON.stringify(preferences));
}

export { STORAGE_KEY as PREVIEW_PREFERENCES_STORAGE_KEY };
