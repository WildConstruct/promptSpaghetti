function parseStorageBooleanFlag(raw: string | null | undefined): boolean {
  if (!raw) {
    return false;
  }

  switch (raw.trim().toLowerCase()) {
    case '1':
    case 'true':
    case 'yes':
    case 'on':
    case 'enabled':
      return true;
    default:
      return false;
  }
}

export function readScenePreviewV1Flag(
  storage: Pick<Storage, 'getItem'>
): boolean {
  return parseStorageBooleanFlag(storage.getItem('psg:scene-preview-v1'));
}

export { parseStorageBooleanFlag };
