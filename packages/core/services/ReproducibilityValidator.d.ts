import { VFXExportFormat } from '../types/VFXExport';
import { Node, Edge } from 'reactflow';

}
export interface ReproducibilityValidationOptions {
    strictMode?: boolean;
    allowApproximate?: boolean;
    validateChecksums?: boolean;
    checkVersionCompatibility?: boolean;
    requirePerformanceData?: boolean;

}
export interface ReproducibilityValidationReport {
    isValid: boolean;
    exactReproducible: boolean;
    approximateReproducible: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
    suggestions: ValidationSuggestion[];
    integrity: {
        configurationValid: boolean;
        seedsValid: boolean;
        versionCompatible: boolean;
        checksumValid: boolean;
}
    };
    performance: {
        estimatedReproductionTime: number;
        complexityScore: number;
        memoryRequirement: number;
    };

}
export interface ValidationError {
    code: string;
    message: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    field?: string;
    suggestion?: string;

}
export interface ValidationWarning {
    code: string;
    message: string;
    impact: 'reproducibility' | 'performance' | 'compatibility' | 'quality';
    suggestion?: string;

}
export interface ValidationSuggestion {
    code: string;
    message: string;
    category: 'optimization' | 'enhancement' | 'compatibility' | 'debugging';
    priority: 'high' | 'medium' | 'low';

export declare class ReproducibilityValidator {
    private static instance;
    static getInstance(): ReproducibilityValidator;
    /**
     * Comprehensive validation of VFX export reproducibility
     */
    validateReproducibility();
      exportData: VFXExportFormat,
      options?: ReproducibilityValidationOptions
    ): ReproducibilityValidationReport;
    private validateRandomizationState;
    private validateNodeRngStates;
    private validateNodeConfigurations;
    private validateNodeReproducibilityData;
    private validateVersionCompatibility;
    private validateDataIntegrity;
    private validateGraphIntegrity;
    private calculatePerformanceEstimates;
    private calculateComplexityScore;
    private estimateMemoryRequirement;
    private generateSuggestions;
    private assessOverallValidity;
    /**
     * Test actual reproduction by re-executing with exported data
     */
    testReproduction(exportData: VFXExportFormat, originalGraph: {)
        nodes: Node[];
        edges: Edge[];
}
    }): Promise<{
        success: boolean;
        identicalResults: boolean;
        differences: string[];
        reproductionTime: number;
    }>;
    private calculateConfigurationHash;
    private calculateReproducibilityHash;

//# sourceMappingURL=ReproducibilityValidator.d.ts.map