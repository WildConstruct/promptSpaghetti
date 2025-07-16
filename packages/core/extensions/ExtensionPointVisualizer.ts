/**
 * Extension Point Visualizer - Epic 8.4 Story 8.4.1
 * Creates visual representations of extension points and their relationships
 */

import { ExtensionPoint, ExtensionPointCategory, extensionPointRegistry } from './ExtensionPointRegistry';

export interface VisualizationOptions {
  format?: 'mermaid' | 'graphviz' | 'json';
  includeInternal?: boolean;
  groupByCategory?: boolean;
  showDependencies?: boolean;
  showInterfaces?: boolean;
  theme?: 'light' | 'dark';
}

export interface ExtensionPointNode {
  id: string;
  name: string;
  category: ExtensionPointCategory;
  priority: string;
  lifecycle: string;
  interfaces: string[];
  dependencies: string[];
  location: string;
}

export interface ExtensionPointEdge {
  source: string;
  target: string;
  type: 'dependency' | 'interface' | 'inheritance';
  label?: string;
}

export interface ExtensionPointGraph {
  nodes: ExtensionPointNode[];
  edges: ExtensionPointEdge[];
  categories: Record<ExtensionPointCategory, ExtensionPointNode[]>;
}

export class ExtensionPointVisualizer {
  private static instance: ExtensionPointVisualizer;

  private constructor() {}

  public static getInstance(): ExtensionPointVisualizer {
    if (!ExtensionPointVisualizer.instance) {
      ExtensionPointVisualizer.instance = new ExtensionPointVisualizer();
    }
    return ExtensionPointVisualizer.instance;
  }

  /**
   * Generate a visual representation of extension points
   */
  public generateVisualization(options: VisualizationOptions = {}): string {
    const graph = this.buildGraph(options);
    
    switch (options.format) {
      case 'graphviz':
        return this.generateGraphviz(graph, options);
      case 'json':
        return this.generateJSON(graph, options);
      case 'mermaid':
      default:
        return this.generateMermaid(graph, options);
    }
  }

  /**
   * Generate extension point relationship map
   */
  public generateRelationshipMap(options: VisualizationOptions = {}): string {
    const registry = extensionPointRegistry;
    const extensionPoints = registry.getAll();
    
    let mermaid = 'graph TD\n';
    
    // Group by category if requested
    if (options.groupByCategory) {
      const categories = Object.values(ExtensionPointCategory);
      
      categories.forEach(category => {
        const categoryPoints = registry.getByCategory(category);
        if (categoryPoints.length > 0) {
          mermaid += `    subgraph ${category}["${category.toUpperCase()}"]\n`;
          categoryPoints.forEach(ep => {
            const nodeId = this.sanitizeId(ep.id);
            mermaid += `        ${nodeId}["${ep.name}"]\n`;
          });
          mermaid += `    end\n`;
        }
      });
    } else {
      // Add all nodes
      extensionPoints.forEach(ep => {
        const nodeId = this.sanitizeId(ep.id);
        mermaid += `    ${nodeId}["${ep.name}"]\n`;
      });
    }
    
    // Add dependencies
    if (options.showDependencies !== false) {
      extensionPoints.forEach(ep => {
        if (ep.dependencies && ep.dependencies.length > 0) {
          const sourceId = this.sanitizeId(ep.id);
          ep.dependencies.forEach(dep => {
            const targetId = this.sanitizeId(dep);
            mermaid += `    ${sourceId} --> ${targetId}\n`;
          });
        }
      });
    }
    
    // Add styling
    mermaid += this.generateMermaidStyling(options);
    
    return mermaid;
  }

  /**
   * Generate extension point hierarchy
   */
  public generateHierarchy(options: VisualizationOptions = {}): string {
    const registry = extensionPointRegistry;
    
    let mermaid = 'graph TD\n';
    
    // Root node
    mermaid += '    root["Extension System"]\n';
    
    // Category nodes
    Object.values(ExtensionPointCategory).forEach(category => {
      const categoryPoints = registry.getByCategory(category);
      if (categoryPoints.length > 0) {
        const categoryId = this.sanitizeId(category);
        mermaid += `    ${categoryId}["${category.toUpperCase()}"]\n`;
        mermaid += `    root --> ${categoryId}\n`;
        
        // Extension points in category
        categoryPoints.forEach(ep => {
          const nodeId = this.sanitizeId(ep.id);
          mermaid += `    ${nodeId}["${ep.name}"]\n`;
          mermaid += `    ${categoryId} --> ${nodeId}\n`;
          
          // Interfaces
          if (options.showInterfaces !== false && ep.interfaces.length > 0) {
            ep.interfaces.forEach(iface => {
              const interfaceId = this.sanitizeId(`${ep.id}.${iface.name}`);
              mermaid += `    ${interfaceId}["${iface.name}"]\n`;
              mermaid += `    ${nodeId} --> ${interfaceId}\n`;
            });
          }
        });
      }
    });
    
    // Add styling
    mermaid += this.generateMermaidStyling(options);
    
    return mermaid;
  }

  /**
   * Generate architecture overview
   */
  public generateArchitectureOverview(options: VisualizationOptions = {}): string {
    let mermaid = 'graph TB\n';
    
    // Core system components
    mermaid += '    subgraph core["Core System"]\n';
    mermaid += '        runtime["Runtime Engine"]\n';
    mermaid += '        schema["Schema System"]\n';
    mermaid += '        ui["UI Framework"]\n';
    mermaid += '        api["API Layer"]\n';
    mermaid += '    end\n';
    
    // Extension categories
    mermaid += '    subgraph ext["Extension Points"]\n';
    mermaid += '        runtime_ext["Runtime Extensions"]\n';
    mermaid += '        ui_ext["UI Extensions"]\n';
    mermaid += '        schema_ext["Schema Extensions"]\n';
    mermaid += '        api_ext["API Extensions"]\n';
    mermaid += '    end\n';
    
    // Extension system
    mermaid += '    subgraph system["Extension System"]\n';
    mermaid += '        registry["Extension Registry"]\n';
    mermaid += '        manager["Extension Manager"]\n';
    mermaid += '        loader["Extension Loader"]\n';
    mermaid += '    end\n';
    
    // Connections
    mermaid += '    runtime --> runtime_ext\n';
    mermaid += '    ui --> ui_ext\n';
    mermaid += '    schema --> schema_ext\n';
    mermaid += '    api --> api_ext\n';
    
    mermaid += '    runtime_ext --> registry\n';
    mermaid += '    ui_ext --> registry\n';
    mermaid += '    schema_ext --> registry\n';
    mermaid += '    api_ext --> registry\n';
    
    mermaid += '    registry --> manager\n';
    mermaid += '    manager --> loader\n';
    
    // Add styling
    mermaid += this.generateMermaidStyling(options);
    
    return mermaid;
  }

  /**
   * Build graph structure from extension points
   */
  private buildGraph(options: VisualizationOptions): ExtensionPointGraph {
    const registry = extensionPointRegistry;
    const extensionPoints = registry.getAll();
    
    const nodes: ExtensionPointNode[] = extensionPoints.map(ep => ({
      id: ep.id,
      name: ep.name,
      category: ep.category,
      priority: ep.priority,
      lifecycle: ep.lifecycle,
      interfaces: ep.interfaces.map(i => i.name),
      dependencies: ep.dependencies || [],
      location: ep.location.file
    }));
    
    const edges: ExtensionPointEdge[] = [];
    
    // Add dependency edges
    if (options.showDependencies !== false) {
      extensionPoints.forEach(ep => {
        if (ep.dependencies && ep.dependencies.length > 0) {
          ep.dependencies.forEach(dep => {
            edges.push({
              source: ep.id,
              target: dep,
              type: 'dependency',
              label: 'depends on'
            });
          });
        }
      });
    }
    
    // Add interface edges
    if (options.showInterfaces !== false) {
      extensionPoints.forEach(ep => {
        ep.interfaces.forEach(iface => {
          edges.push({
            source: ep.id,
            target: `${ep.id}.${iface.name}`,
            type: 'interface',
            label: 'provides'
          });
        });
      });
    }
    
    // Group by category
    const categories: Record<ExtensionPointCategory, ExtensionPointNode[]> = {} as any;
    Object.values(ExtensionPointCategory).forEach(category => {
      categories[category] = nodes.filter(node => node.category === category);
    });
    
    return { nodes, edges, categories };
  }

  /**
   * Generate Mermaid diagram
   */
  private generateMermaid(graph: ExtensionPointGraph, options: VisualizationOptions): string {
    let mermaid = 'graph TD\n';
    
    if (options.groupByCategory) {
      // Group by category
      Object.entries(graph.categories).forEach(([category, nodes]) => {
        if (nodes.length > 0) {
          mermaid += `    subgraph ${category}["${category.toUpperCase()}"]\n`;
          nodes.forEach(node => {
            const nodeId = this.sanitizeId(node.id);
            mermaid += `        ${nodeId}["${node.name}"]\n`;
          });
          mermaid += `    end\n`;
        }
      });
    } else {
      // Add all nodes
      graph.nodes.forEach(node => {
        const nodeId = this.sanitizeId(node.id);
        mermaid += `    ${nodeId}["${node.name}"]\n`;
      });
    }
    
    // Add edges
    graph.edges.forEach(edge => {
      const sourceId = this.sanitizeId(edge.source);
      const targetId = this.sanitizeId(edge.target);
      
      switch (edge.type) {
        case 'dependency':
          mermaid += `    ${sourceId} --> ${targetId}\n`;
          break;
        case 'interface':
          mermaid += `    ${sourceId} -.-> ${targetId}\n`;
          break;
        case 'inheritance':
          mermaid += `    ${sourceId} ==> ${targetId}\n`;
          break;
      }
    });
    
    // Add styling
    mermaid += this.generateMermaidStyling(options);
    
    return mermaid;
  }

  /**
   * Generate Graphviz diagram
   */
  private generateGraphviz(graph: ExtensionPointGraph, options: VisualizationOptions): string {
    let dot = 'digraph ExtensionPoints {\n';
    dot += '    rankdir=TB;\n';
    dot += '    node [shape=box, style=rounded];\n';
    
    if (options.groupByCategory) {
      Object.entries(graph.categories).forEach(([category, nodes]) => {
        if (nodes.length > 0) {
          dot += `    subgraph cluster_${category} {\n`;
          dot += `        label="${category.toUpperCase()}";\n`;
          dot += `        style=filled;\n`;
          dot += `        color=lightgrey;\n`;
          
          nodes.forEach(node => {
            const nodeId = this.sanitizeId(node.id).replace(/[.-]/g, '_');
            dot += `        ${nodeId} [label="${node.name}"];\n`;
          });
          
          dot += '    }\n';
        }
      });
    } else {
      graph.nodes.forEach(node => {
        const nodeId = this.sanitizeId(node.id).replace(/[.-]/g, '_');
        dot += `    ${nodeId} [label="${node.name}"];\n`;
      });
    }
    
    // Add edges
    graph.edges.forEach(edge => {
      const sourceId = this.sanitizeId(edge.source).replace(/[.-]/g, '_');
      const targetId = this.sanitizeId(edge.target).replace(/[.-]/g, '_');
      
      switch (edge.type) {
        case 'dependency':
          dot += `    ${sourceId} -> ${targetId} [label="depends on"];\n`;
          break;
        case 'interface':
          dot += `    ${sourceId} -> ${targetId} [style=dashed, label="provides"];\n`;
          break;
        case 'inheritance':
          dot += `    ${sourceId} -> ${targetId} [arrowhead=empty, label="extends"];\n`;
          break;
      }
    });
    
    dot += '}\n';
    return dot;
  }

  /**
   * Generate JSON representation
   */
  private generateJSON(graph: ExtensionPointGraph, options: VisualizationOptions): string {
    const visualization = {
      version: '1.0.0',
      generated: new Date().toISOString(),
      options: options,
      graph: graph
    };
    
    return JSON.stringify(visualization, null, 2);
  }

  /**
   * Generate Mermaid styling
   */
  private generateMermaidStyling(options: VisualizationOptions): string {
    let styling = '\n';
    
    if (options.theme === 'dark') {
      styling += '    classDef default fill:#2d3748,stroke:#4a5568,stroke-width:2px,color:#e2e8f0;\n';
      styling += '    classDef critical fill:#dc3545,stroke:#c82333,stroke-width:2px,color:#fff;\n';
      styling += '    classDef high fill:#fd7e14,stroke:#e8590c,stroke-width:2px,color:#fff;\n';
      styling += '    classDef medium fill:#ffc107,stroke:#e0a800,stroke-width:2px,color:#000;\n';
      styling += '    classDef low fill:#6c757d,stroke:#5a6268,stroke-width:2px,color:#fff;\n';
    } else {
      styling += '    classDef default fill:#f8f9fa,stroke:#6c757d,stroke-width:2px,color:#495057;\n';
      styling += '    classDef critical fill:#dc3545,stroke:#c82333,stroke-width:2px,color:#fff;\n';
      styling += '    classDef high fill:#fd7e14,stroke:#e8590c,stroke-width:2px,color:#fff;\n';
      styling += '    classDef medium fill:#ffc107,stroke:#e0a800,stroke-width:2px,color:#000;\n';
      styling += '    classDef low fill:#6c757d,stroke:#5a6268,stroke-width:2px,color:#fff;\n';
    }
    
    return styling;
  }

  /**
   * Sanitize ID for use in diagrams
   */
  private sanitizeId(id: string): string {
    return id.replace(/[^a-zA-Z0-9]/g, '_');
  }
}

// Export singleton instance
export const extensionPointVisualizer = ExtensionPointVisualizer.getInstance();