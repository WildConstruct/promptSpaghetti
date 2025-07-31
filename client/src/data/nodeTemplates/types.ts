/**
 * Type definitions for node templates and configurations
 * REFACTOR-001: EnhancedGraphEditor Data Extraction
 */

}
export interface OptionConfig {
  label: string;,
  value: string;
  weight: number;
  description?: string;
}
}
}
export interface NodeData {
  label: string;,
  description: string;
  category: 'logic' | 'transform' | 'output';,
  options: OptionConfig;
}
}
}
export interface NodeTemplate {
  id: string;,
  type: 'logic' | 'transform' | 'output';

}
  position: { x: number; y: number };
  data: NodeData;
}
}
export interface GraphTemplate {
  name: string;,
  description: string;
  nodes: NodeTemplate;,
  edges: EdgeTemplate;
}
}
}
export interface EdgeTemplate {
  id: string;,
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}
}
}
export interface TemplateCategory {
  id: string;,
  name: string;
  description: string;,
  templates: NodeTemplate;
  // Template configuration for different domains
}
}
}
export interface DomainTemplate {
  domain: string;,
  categories: TemplateCategory;
  presets: GraphTemplate;
}
}