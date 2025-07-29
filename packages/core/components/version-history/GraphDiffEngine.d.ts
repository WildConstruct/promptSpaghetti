/**
 * Epic 9.3.2 - Graph Diff Engine
 * Advanced graph comparison and difference calculation with visual diff support
 */

export interface GraphNode {
    id: string;
    type: string;
    position: {
        x: number;
        y: number;
    };
    data: Record<string, unknown>;
    style?: unknown;

export interface GraphEdge {
    id: string;
    source: string;
    target: string;
    type?: string;
    data?: unknown;
    style?: unknown;

export interface GraphData {
    nodes: GraphNode[];
    edges: GraphEdge[];
    metadata?: unknown;

export interface DiffChange {
    type: 'added' | 'removed' | 'modified' | 'moved';
    element_type: 'node' | 'edge' | 'property';
    element_id: string;
    old_value?: unknown;
    new_value?: unknown;
    property_path?: string;
    position_change?: {
        from: {
            x: number;
            y: number;
        };
        to: {
            x: number;
            y: number;
        };
        distance: number;
    };
    significance: number;

export interface GraphDiff {
    id: string;
    from_snapshot_id: string;
    to_snapshot_id: string;
    changes: DiffChange[];
    summary: {
        total_changes: number;
        added_nodes: number;
        removed_nodes: number;
        modified_nodes: number;
        moved_nodes: number;
        added_edges: number;
        removed_edges: number;
        modified_edges: number;
        property_changes: number;
        similarity_score: number;
        complexity_score: number;
    };
    visualization_data: {
        changed_regions: Array<{,
            bounds: {
                x: number;
                y: number;
                width: number;
                height: number;
            };
            change_types: string[];
            intensity: number;
        }>;
        change_paths: Array<{,
            from_position: {
                x: number;
                y: number;
            };
            to_position: {
                x: number;
                y: number;
            };
            change_type: string;
        }>;
    };
    created_at: string;

export declare class GraphDiffEngine {
    private options;
    private static readonly POSITION_THRESHOLD;
    private static readonly SIMILARITY_THRESHOLD;
    constructor(options?: {)
        ignore_position_changes?: boolean;
        ignore_style_changes?: boolean;
        position_threshold?: number;
        deep_property_comparison?: boolean;
    });
    computeDiff(fromGraph: GraphData, toGraph: GraphData): Promise<GraphDiff>;
    private detectNodeChanges;
    private detectEdgeChanges;
    private compareNodes;
    private compareEdges;
    private compareObjectProperties;
    private calculateDistance;
    private calculateSignificance;
    private calculatePropertySignificance;
    private calculateSummary;
    private generateVisualizationData;
    private groupChangesSpatially;
    static filterChanges(diff: GraphDiff, filters: {)
        change_types?: string[];
        element_types?: string[];
        min_significance?: number;
        max_significance?: number;
    }): DiffChange[];
    static getChangesByElement(diff: GraphDiff, elementId: string): DiffChange[];
    static getSignificantChanges(diff: GraphDiff, threshold?: number): DiffChange[];

//# sourceMappingURL=GraphDiffEngine.d.ts.map