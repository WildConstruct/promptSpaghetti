/**
 * Fragment Manifest Loader Service
 * Loads and processes the asset fragments manifest
 */

export interface FragmentManifest {
  version: string;
  type: string;
  name: string;
  description: string;
  created: string;
  lastUpdated: string;
  author: string;
  categories?: Record<string, FragmentCategory>;
  fragments?: Array<{
    id: string;
    name: string;
    description: string;
    path: string;
    category: string;
    tags: string[];
    nodeCount: number;
    metadata?: {
      author?: string;
      created?: string;
      updated?: string;
      version?: string;
    };
  }>;
}

export interface FragmentCategory {
  name: string;
  description: string;
  icon: string;
  path: string;
  fragments: FragmentEntry[];
}

export interface FragmentEntry {
  file: string;
  id: string;
  name: string;
  type: string;
  nodes?: number;
  options?: number;
  combinations?: number;
  region?: string;
  collapsible?: boolean;
  tags?: string[];
}

export class FragmentManifestLoader {
  private static manifestPath = '/assets/library/asset-fragments-manifest.json';
  private static cachedManifest: FragmentManifest | null = null;

  /**
   * Load the fragment manifest from the assets directory
   */
  static async loadManifest(): Promise<FragmentManifest> {
    if (this.cachedManifest) {
      return this.cachedManifest;
    }

    try {
      const response = await fetch(this.manifestPath);
      if (!response.ok) {
        throw new Error(`Failed to load manifest: ${response.statusText}`);
      }
      
      const manifest = await response.json() as FragmentManifest;
      this.cachedManifest = manifest;
      return manifest;
    } catch (error) {
      console.error('Error loading fragment manifest:', error);
      throw error;
    }
  }

  /**
   * Convert fragment manifest to preset format for the asset browser
   */
  static convertToPresets(manifest: FragmentManifest): Array<{
    id: string;
    name: string;
    tags: string[];
    type: 'text' | 'image' | 'audio' | 'video' | 'graph' | 'unknown' | undefined;
    category: string;
    metadata?: {
      nodes?: number;
      options?: number;
      combinations?: number;
      region?: string;
      file?: string;
    };
  }> {
    const presets: Array<{
      id: string;
      name: string;
      tags: string[];
      type: 'text' | 'image' | 'audio' | 'video' | 'graph' | 'unknown' | undefined;
      category: string;
      metadata?: {
        nodes?: number;
        options?: number;
        combinations?: number;
        region?: string;
        file?: string;
      };
    }> = [];

    // Handle new format with direct fragments array
    if (manifest.fragments && Array.isArray(manifest.fragments)) {
      manifest.fragments.forEach(fragment => {
        presets.push({
          id: fragment.id,
          name: fragment.name,
          tags: fragment.tags || [],
          type: 'graph' as const,
          category: fragment.category,
          metadata: {
            nodes: fragment.nodeCount,
            file: fragment.path
          }
        });
      });
    }
    
    // Handle old format with categories
    if (manifest.categories) {
      Object.entries(manifest.categories).forEach(([categoryKey, category]) => {
        category.fragments.forEach(fragment => {
          presets.push({
            id: fragment.id,
            name: fragment.name,
            tags: [
              categoryKey,
              fragment.type.toLowerCase(),
              ...(fragment.tags || [])
            ],
            type: 'graph' as const,  // Fragment manifests are always graph type
            category: category.name,
            metadata: {
              nodes: fragment.nodes,
              options: fragment.options,
              combinations: fragment.combinations,
              region: fragment.region,
              file: `${category.path}${fragment.file}`
            }
          });
        });
      });
    }

    return presets;
  }

  /**
   * Generate example output for a fragment based on its type
   */
  static generateExampleOutput(fragment: FragmentEntry): string {
    const examples: Record<string, readonly string[]> = {
      'SIMPLE': [
        'warm smile',
        'gentle grin',
        'subtle smirk',
        'bright beam'
      ] as const,
      'CONTEXTUAL': [
        'nervous smile with downcast eyes',
        'confident grin with raised chin',
        'tired smile with heavy lids',
        'surprised smile with wide eyes'
      ] as const,
      'MULTI-ASPECT': [
        'bright emerald eyes with gold flecks',
        'deep brown eyes with warm undertones',
        'piercing blue eyes with silver rings',
        'hazel eyes shifting green to amber'
      ] as const,
      'PATTERN': [
        'dawn → midday → dusk → midnight',
        'spring → summer → autumn → winter',
        'calm → tense → explosive → resolution'
      ] as const
    };

    const typeExamples = examples[fragment.type] || [`Example output for ${fragment.name}`];
    // Use deterministic selection based on fragment ID for consistent previews
    const hash = fragment.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const index = hash % typeExamples.length;
    
    return typeExamples[index];
  }

  /**
   * Clear cached manifest
   */
  static clearCache(): void {
    this.cachedManifest = null;
  }
}