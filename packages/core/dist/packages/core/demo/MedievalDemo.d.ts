/**
 * Medieval Demo Integration
 * Provides historically accurate medieval content integration for UTDG
 * Connects with external medieval databases and content sources
 */
export interface MedievalClothing {
    id: string;
    name: string;
    description: string;
    socialClass: 'peasant' | 'merchant' | 'noble' | 'clergy' | 'royal';
    gender: 'male' | 'female' | 'unisex';
    materials: string[];
    colors: string[];
    period: {
        start: number;
        end: number;
    };
    regions: string[];
    seasonality: 'all' | 'spring' | 'summer' | 'autumn' | 'winter';
    occasions: string[];
    historicalAccuracy: 'high' | 'medium' | 'low';
    sources: string[];
}
export interface MedievalMaterial {
    id: string;
    name: string;
    type: 'fabric' | 'leather' | 'metal' | 'fur' | 'other';
    availability: 'common' | 'uncommon' | 'rare' | 'luxury';
    cost: 'low' | 'medium' | 'high' | 'extreme';
    durability: number;
    socialStatus: 'any' | 'common' | 'merchant' | 'noble' | 'royal';
    tradingSources: string[];
    primaryUses: string[];
    historicalNotes: string;
}
export interface MedievalLocation {
    id: string;
    name: string;
    type: 'castle' | 'village' | 'town' | 'monastery' | 'forest' | 'field' | 'road' | 'tavern';
    description: string;
    socialContext: string;
    typicalActivities: string[];
    socialClasses: string[];
    timeOfDay: 'dawn' | 'morning' | 'midday' | 'afternoon' | 'evening' | 'night' | 'any';
    season: 'spring' | 'summer' | 'autumn' | 'winter' | 'any';
    geographicalRegion: string;
    politicalContext: string;
}
export interface MedievalCharacter {
    id: string;
    name: string;
    title?: string;
    profession: string;
    socialClass: 'peasant' | 'merchant' | 'craftsman' | 'minor_noble' | 'major_noble' | 'clergy' | 'royal';
    gender: 'male' | 'female';
    age: number;
    description: string;
    typicalClothing: string[];
    skills: string[];
    possessions: string[];
    socialConnections: string[];
    historicalContext: string;
}
export interface MedievalScene {
    id: string;
    title: string;
    setting: MedievalLocation;
    characters: MedievalCharacter[];
    timeContext: {
        season: string;
        timeOfDay: string;
        weather?: string;
    };
    activities: string[];
    socialDynamics: string[];
    historicalElements: string[];
    sensoryDetails: {
        sights: string[];
        sounds: string[];
        smells: string[];
        textures: string[];
    };
    narrativeHooks: string[];
}
export declare class MedievalDemo {
    private metadataManager;
    private dataSourceManager;
    private clothingDatabase;
    private materialDatabase;
    private locationDatabase;
    private characterDatabase;
    private sceneDatabase;
    constructor();
    /**
     * Initialize medieval content databases with historically accurate data
     */
    private initializeMedievalDatabases;
    /**
     * Load medieval clothing database
     */
    private loadClothingDatabase;
    /**
     * Load medieval materials database
     */
    private loadMaterialDatabase;
    /**
     * Load medieval locations database
     */
    private loadLocationDatabase;
    /**
     * Load medieval characters database
     */
    private loadCharacterDatabase;
    /**
     * Load medieval scenes database
     */
    private loadSceneDatabase;
    /**
     * Generate historically accurate medieval scene
     */
    generateMedievalScene(options?: {
        socialClass?: string;
        location?: string;
        timeOfDay?: string;
        season?: string;
        theme?: string;
    }): MedievalScene | null;
    /**
     * Get clothing appropriate for character and context
     */
    getAppropriateClothing(character: MedievalCharacter, context: {
        occasion?: string;
        season?: string;
        socialSetting?: string;
    }): MedievalClothing[];
    /**
     * Validate medieval content for historical accuracy
     */
    validateHistoricalAccuracy(content: {
        era?: string;
        materials?: string[];
        socialClasses?: string[];
        activities?: string[];
    }): {
        isValid: boolean;
        violations: string[];
        suggestions: string[];
    };
    /**
     * Generate authentic medieval prompt elements
     */
    generatePromptElements(category: 'character' | 'setting' | 'object' | 'activity'): string[];
    /**
     * Create demo scenario with full medieval context
     */
    createDemoScenario(theme?: string): {
        scene: MedievalScene;
        characters: MedievalCharacter[];
        clothing: MedievalClothing[];
        materials: MedievalMaterial[];
        historicalContext: string;
        promptSuggestions: string[];
    };
    /**
     * Generate historical context explanation
     */
    private generateHistoricalContext;
    /**
     * Generate writing prompt suggestions
     */
    private generatePromptSuggestions;
    /**
     * Integration with Node Metadata Manager
     */
    integrateWithMetadata(nodeId: string, sceneId: string): Promise<void>;
    /**
     * Get all medieval content for external use
     */
    getAllMedievalContent(): {
        clothing: MedievalClothing[];
        materials: MedievalMaterial[];
        locations: MedievalLocation[];
        characters: MedievalCharacter[];
        scenes: MedievalScene[];
    };
}
export default MedievalDemo;
//# sourceMappingURL=MedievalDemo.d.ts.map