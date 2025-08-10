export type Preset = {
  id: string;
  name: string;
  tags: string[];
  type: 'image' | 'text' | 'audio' | 'video' | 'unknown';
};
