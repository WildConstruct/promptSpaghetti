function readGlobalEnv(key: string): string | undefined {
  const globalEnv = (globalThis as unknown as { __env__?: Record<string, unknown> })
    .__env__;

  if (!globalEnv || !Object.prototype.hasOwnProperty.call(globalEnv, key)) {
    return undefined;
  }

  const value = globalEnv[key];
  return typeof value === 'string'
    ? value
    : value !== null && typeof value !== 'undefined'
      ? String(value)
      : undefined;
}

export function readEnvVar(key: string): string | undefined {
  if (
    typeof process !== 'undefined' &&
    typeof process.env !== 'undefined' &&
    Object.prototype.hasOwnProperty.call(process.env, key)
  ) {
    return (process.env as Record<string, string | undefined>)[key];
  }

  return readGlobalEnv(key);
}

export function parseBoolean(value: unknown, fallback = true): boolean {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  switch (String(value).trim().toLowerCase()) {
    case '1':
    case 'true':
    case 'yes':
    case 'on':
    case 'enabled':
      return true;
    case '0':
    case 'false':
    case 'no':
    case 'off':
    case 'disabled':
      return false;
    default:
      return fallback;
  }
}

export function readEnvBoolean(key: string, fallback = false): boolean {
  return parseBoolean(readEnvVar(key), fallback);
}

export function readEnvNumber(key: string, fallback: number): number {
  const value = readEnvVar(key);
  if (value === undefined || value === null || String(value).trim() === '') {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}
