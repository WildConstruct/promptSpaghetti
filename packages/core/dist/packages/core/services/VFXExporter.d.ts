import { VFXExporter } from '../types/VFXExport';
export declare class WildConstructVFXExporter implements VFXExporter {
    private static instance;
    private exportHistory;
    static getInstance(): WildConstructVFXExporter;
    private buildMetadata;
    private calculateVariabilityScore;
    private calculateDeterminismScore;
    private calculatePerformanceScore;
    private buildExecutionData;
}
//# sourceMappingURL=VFXExporter.d.ts.map