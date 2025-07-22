import { WeightControlOption } from '../components/Inspector/WeightControlSlider';
export interface PreviewVariant {
    id: string;
    seed: number;
    result: string;
    timestamp: number;
    executionTime: number;
    weightSnapshot: WeightControlOption[];
    variables: Record<string, string>;
}
export interface PreviewPerformance {
    averageExecutionTime: number;
    totalGenerations: number;
    successRate: number;
    lastUpdate: number;
}
export interface RealTimePreviewConfig {
    maxVariants: number;
    debounceMs: number;
    maxExecutionTime: number;
    enablePerformanceTracking: boolean;
    autoRefresh: boolean;
}
export declare const variants: PreviewVariant[], setVariants: import("react").Dispatch<import("react").SetStateAction<PreviewVariant[]>>;
export type { PreviewVariant, PreviewPerformance, RealTimePreviewConfig };
//# sourceMappingURL=useRealTimePreview.d.ts.map