import { WeightControlOption } from '../components/Inspector/WeightControlSlider';

export interface PreviewVariant {
    id: string;
    seed: number;
    result: string;
    timestamp: number;
    executionTime: number;
    weightSnapshot: WeightControlOption[];
    variables: Record<string, string>;

export interface PreviewPerformance {
    averageExecutionTime: number;
    totalGenerations: number;
    successRate: number;
    lastUpdate: number;

export interface RealTimePreviewConfig {
    maxVariants: number;
    debounceMs: number;
    maxExecutionTime: number;
    enablePerformanceTracking: boolean;
    autoRefresh: boolean;

export declare const useRealTimePreview: (graph: GraphData, seedConfig?: SeedConfig) => {
    variants: PreviewVariant[];
    isGenerating: boolean;
    performance: PreviewPerformance;
    error: string | null;
    requestPreview: (weights: WeightControlOption[]) => void;
    forcePreview: (weights: WeightControlOption[]) => void;
    refreshVariant: (variantId: string) => Promise<void>;
    getVariant: (variantId: string) => PreviewVariant | undefined;
    clearVariants: () => void;
    getPerformanceInsights: () => string[];
    exportVariants: () => {,
        template: any;
        variables: any;
        variants: {,
            seed: number;
            result: string;
            weights: WeightControlOption[];
            variables: Record<string, string>;
            timestamp: number;
            executionTime: number;
        }[];
        performance: PreviewPerformance;
        exportTimestamp: number;
    };
    config: any;
};
export type { PreviewVariant, PreviewPerformance, RealTimePreviewConfig };
//# sourceMappingURL=useRealTimePreview.d.ts.map