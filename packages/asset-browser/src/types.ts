export type Preset = {
  id: string;
  name: string;
  tags: string[];
  type?: 'image' | 'text' | 'audio' | 'video' | 'graph' | 'unknown';
  // Optional relative or absolute path to the preset file (e.g. /presets/foo.psglib)
  path?: string;
  // Additional metadata for pro browser
  category?: string;
  complexity?: 'simple' | 'medium' | 'complex';
  nodes?: number;
  nodeTypes?: string[];
  data?: unknown;
  description?: string;
  author?: string;
  version?: string;
  createdAt?: string;
  updatedAt?: string;
  thumbnail?: string;
  metadata?: {
    file?: string;
    nodes?: number;
    options?: number;
    combinations?: number;
    region?: string;
    [key: string]: unknown;
  };
};
