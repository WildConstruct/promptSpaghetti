export type Preset = {
  id: string;
  name: string;
  tags: string[];
  type?: 'image' | 'text' | 'audio' | 'video' | 'graph' | 'unknown';
  // Additional metadata for pro browser
  category?: string;
  complexity?: 'simple' | 'medium' | 'complex';
  nodes?: number;
  data?: unknown;
  description?: string;
  author?: string;
  version?: string;
  createdAt?: string;
  updatedAt?: string;
  thumbnail?: string;
};
