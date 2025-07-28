/**
 * Extension Point Visualizer - Epic 8.4 Story 8.4.1
 * Creates visual representations of extension points and their relationships
 */
import { ExtensionPointCategory } from './ExtensionPointRegistry';
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
    interfaces: string;
    dependencies: string;
    location: string;
}
export interface ExtensionPointEdge {
    source: string;
    target: string;
    type: 'dependency' | 'interface' | 'inheritance';
    label?: string;
}
export interface ExtensionPointGraph {
    nodes: ExtensionPointNode;
    edges: ExtensionPointEdge;
    categories: Record<ExtensionPointCategory, ExtensionPointNode>;
}
export declare class ExtensionPointVisualizer {
    private static instance;
    private constructor();
    static getInstance(): ExtensionPointVisualizer;
    /**
     * Generate a visual representation of extension points
     */
    generateVisualization(options?: VisualizationOptions): string;
    /**
     * Generate extension point relationship map
     */
    generateRelationshipMap(options?: VisualizationOptions): string;
    mermaid: any;
    '    end\n': any;
}
//# sourceMappingURL=ExtensionPointVisualizer.d.ts.map