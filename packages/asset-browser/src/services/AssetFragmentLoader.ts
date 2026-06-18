export type FragmentEntry = {
  file: string;
  id: string;
  name: string;
  type: 'SIMPLE' | 'CONTEXTUAL' | 'MULTI-ASPECT';
  nodes: number;
  options?: number;
  combinations?: number;
  region: string;
  collapsible: boolean;
  content?: string;
};

export type FragmentCategory = {
  name: string;
  description: string;
  icon: string;
  path: string;
  fragments: FragmentEntry[];
};

export type AssetFragmentManifest = {
  version: string;
  type: 'asset-fragments';
  name: string;
  description: string;
  categories: Record<string, FragmentCategory>;
  statistics?: {
    total_fragments: number;
    total_nodes: number;
    total_options: number;
    categories: number;
  };
};

/**
 * Loads the asset fragment manifest from /assets/library/asset-fragments-manifest.json
 * Returns the parsed manifest with categories and fragments
 */
export async function loadAssetFragments(
  baseUrl: string = ''
): Promise<AssetFragmentManifest | null> {
  const candidates = [
    '/assets/library/asset-fragments-manifest.json',
    `${baseUrl}/assets/library/asset-fragments-manifest.json`,
    '/asset-fragments-manifest.json'
  ];

  for (const url of candidates) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;

      const data = await res.json();

      // Validate it's an asset fragment manifest
      if (data?.type !== 'asset-fragments') continue;

      return data as AssetFragmentManifest;
    } catch (err) {
      console.warn(`Failed to load asset fragments from ${url}:`, err);
      continue;
    }
  }

  return null;
}

export async function loadUserAssetFragments(
  folderPath: string
): Promise<FragmentEntry[]> {
  if (!folderPath.trim()) {
    return [];
  }

  const res = await fetch(
    `/api/local-fragments/list?folderPath=${encodeURIComponent(folderPath)}`,
    { cache: 'no-cache' }
  );

  if (!res.ok) {
    return [];
  }

  const data = await res.json();
  return Array.isArray(data?.fragments)
    ? (data.fragments as FragmentEntry[])
    : [];
}
