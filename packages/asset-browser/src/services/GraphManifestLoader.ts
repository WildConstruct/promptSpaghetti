export type GraphEntry = {
  filename: string;
  title: string;
  updatedAt: string; // ISO string
  tags?: string[];
};

/**
 * Loads the server graph manifest from /graphs/manifest.json.
 * Returns an array of GraphEntry. Consumers decide empty/error UI.
 */
export async function loadServerGraphs(
  baseUrl: string = ''
): Promise<GraphEntry[]> {
  const url = baseUrl
    ? `${baseUrl.replace(/\/$/, '')}/graphs/manifest.json`
    : '/graphs/manifest.json';
  const res = await fetch(url);
  if (!res.ok) {
    // Surface to caller so they can render an Error state with retry.
    throw new Error(`Failed to load graph manifest: ${res.status}`);
  }
  const data = await res.json();
  if (!Array.isArray(data)) return [];
  // Minimal shape validation
  return data.filter(
    e => typeof e?.filename === 'string' && typeof e?.title === 'string'
  );
}
