type Validator<T> = (value: unknown) => value is T;

function getStorage(): Storage | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function readStoredString(key: string): string | null {
  const storage = getStorage();
  if (!storage) {
    return null;
  }

  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStoredString(key: string, value: string): boolean {
  const storage = getStorage();
  if (!storage) {
    return false;
  }

  try {
    storage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function readStoredNumberInRange(
  key: string,
  fallback: number,
  min: number,
  max: number
): number {
  const saved = readStoredString(key);
  if (saved === null) {
    return fallback;
  }

  const parsed = parseInt(saved, 10);
  return !isNaN(parsed) && parsed >= min && parsed <= max ? parsed : fallback;
}

export function readStoredJson<T>(
  key: string,
  fallback: T,
  validator?: Validator<T>
): T {
  const saved = readStoredString(key);
  if (!saved) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(saved);
    return !validator || validator(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export function writeStoredJson(key: string, value: unknown): boolean {
  return writeStoredString(key, JSON.stringify(value));
}
