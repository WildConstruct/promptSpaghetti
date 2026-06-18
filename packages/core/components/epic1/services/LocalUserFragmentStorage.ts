export const LOCAL_USER_FRAGMENT_FOLDER_COOKIE =
  'psg_user_documents_folder';

type LocalFragmentSaveResponse = {
  ok: true;
  filename: string;
  savedPath: string;
};

type SaveLocalUserFragmentOptions = {
  folderPath: string;
  filename: string;
  content: string;
  fetchImpl?: typeof fetch;
};

const readCookie = (name: string): string | null => {
  if (typeof document === 'undefined') {
    return null;
  }

  const prefix = `${name}=`;
  const entry = document.cookie
    .split(';')
    .map(cookie => cookie.trim())
    .find(cookie => cookie.startsWith(prefix));

  return entry ? decodeURIComponent(entry.slice(prefix.length)) : null;
};

export function getUserFragmentFolderFromCookie(): string | null {
  return readCookie(LOCAL_USER_FRAGMENT_FOLDER_COOKIE);
}

export function setUserFragmentFolderCookie(folderPath: string): void {
  if (typeof document === 'undefined') {
    return;
  }

  const encoded = encodeURIComponent(folderPath);
  const maxAgeSeconds = 60 * 60 * 24 * 365;
  document.cookie = `${LOCAL_USER_FRAGMENT_FOLDER_COOKIE}=${encoded}; Max-Age=${maxAgeSeconds}; path=/; SameSite=Lax`;
}

export async function saveLocalUserFragment({
  folderPath,
  filename,
  content,
  fetchImpl = fetch
}: SaveLocalUserFragmentOptions): Promise<LocalFragmentSaveResponse> {
  const response = await fetchImpl('/api/local-fragments/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      folderPath,
      filename,
      content
    })
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      typeof payload?.error === 'string'
        ? payload.error
        : 'Failed to save local fragment';
    throw new Error(message);
  }

  return payload as LocalFragmentSaveResponse;
}
