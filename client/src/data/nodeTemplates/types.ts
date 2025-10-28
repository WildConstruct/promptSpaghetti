export interface NodeOption {
  label: string;
  value: string;
  weight: number;
  description?: string;
}

export type OptionConfig = NodeOption[];

export interface NodeTemplateData {
  label: string;
  description: string;
  category: string;
  options: OptionConfig;
}

export interface NodeTemplate {
  id: string;
  type: 'logic' | 'transform' | 'output';
  position: { x: number; y: number };
  data: NodeTemplateData;
}
