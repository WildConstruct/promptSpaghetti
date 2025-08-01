/**
 * UTDG (Universal Texture Description Graph) Manager
 * Epic 8.8: Historical Data Integration Foundation
 *
 * Central management system for UTDG data and historical content generation
 */
import { UTDGNode,
  Era,
  HistoricalQuery,
  HistoricalQueryResult,
  ContentGenerationConfig,
  GeneratedContent,
  VFXExportData }
  ValidationReport
} from '../types/UTDG';
import ConstraintValidator from './ConstraintValidator';
import ExternalDataService from './ExternalDataService';
/**
 * UTDG Manager - Central orchestrator for historical data integration
 */
export declare class UTDGManager {
    private static instance;
    private constraintValidator;
    private externalDataService;
    private medievalDemo;
    private nodeRegistry;
    constructor();
    static getInstance(): UTDGManager;
    /**
     * Query historical content from all available sources
     */
    queryHistoricalContent(query: HistoricalQuery): Promise<HistoricalQueryResult>;
    /**
     * Generate historically accurate content for a specific scenario
     */
    generateHistoricalContent(config: ContentGenerationConfig): Promise<GeneratedContent>;
    /**
     * Generate medieval demo content specifically
     */
    generateMedievalDemo(scenario: 'court_scene' | 'village_life' | 'monastery' | 'market_day'): GeneratedContent;
    /**
     * Export UTDG data for Wild Construct VFX pipeline
     */
    exportForVFX(nodes: UTDGNode[], era: Era, scene_description: string): VFXExportData;
    /**
     * Validate UTDG data quality and historical accuracy
     */
    validateUTDGData(nodes: UTDGNode[]): ValidationReport;
    /**
     * Register external data sources
     */
    registerExternalSource(source: any): void;
    /**
     * Get constraint validator for custom validation
     */
    getConstraintValidator(): ConstraintValidator;
    /**
     * Get external data service for custom queries
     */
    getExternalDataService(): ExternalDataService;
    /**
     * Query medieval demo database directly
     */
    private queryMedievalDemo;
    /**
     * Synchronous content generation for demo scenarios
     */
    private generateHistoricalContentSync;
    private getRelevantNodeTypes;
    private filterByConfiguration;
    private applyCreativityFilter;
    private getAppliedConstraints;
    private calculateAccuracyScore;
    private generateRecommendations;
    private extractMaterialProperties;
    private extractPatternDescription;
    private extractColorPalette;
    private extractCharacterTypes;
    private generateClothingCombinations;
    private calculateSocialDistribution;
    private determineArchitecturalStyle;
    private getAtmosphericConditions;
    private getWeatherPatterns;
    private getSeasonalConditions;
    private getTimePreferences;
    private generateAccuracyNotes;
    private generateLightingNotes;
    private generateAtmosphericNotes;

export default UTDGManager;
//# sourceMappingURL=UTDGManager.d.ts.map