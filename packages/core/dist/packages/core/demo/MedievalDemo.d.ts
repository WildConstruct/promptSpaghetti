export interface MedievalClothing {
    id: string;
    name: string;
    description: string;
    socialClass: 'peasant' | 'merchant' | 'noble' | 'clergy' | 'royal';
    gender: 'male' | 'female' | 'unisex';
    materials: string;
    colors: string;
    period: {
        start: number;
        end: number;
    };
    regions: string;
    seasonality: 'all' | 'spring' | 'summer' | 'autumn' | 'winter';
    occasions: string;
    historicalAccuracy: 'high' | 'medium' | 'low';
    sources: string;
}
export interface MedievalMaterial {
    id: string;
    name: string;
    type: 'fabric' | 'leather' | 'metal' | 'fur' | 'other';
    availability: 'common' | 'uncommon' | 'rare' | 'luxury';
    cost: 'low' | 'medium' | 'high' | 'extreme';
    durability: number;
    socialStatus: 'any' | 'common' | 'merchant' | 'noble' | 'royal';
    tradingSources: string;
    primaryUses: string;
    historicalNotes: string;
}
export interface MedievalLocation {
    id: string;
    name: string;
    type: 'castle' | 'village' | 'town' | 'monastery' | 'forest' | 'field' | 'road' | 'tavern';
    description: string;
    socialContext: string;
    typicalActivities: string;
    socialClasses: string;
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
    typicalClothing: string;
    skills: string;
    possessions: string;
    socialConnections: string;
    historicalContext: string;
}
export interface MedievalScene {
    id: string;
    title: string;
    setting: MedievalLocation;
    characters: MedievalCharacter;
    timeContext: {
        season: string;
        timeOfDay: string;
        weather?: string;
    };
    activities: string;
    socialDynamics: string;
    historicalElements: string;
    sensoryDetails: {
        sights: string;
        sounds: string;
        smells: string;
        textures: string;
    };
    narrativeHooks: string;
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
    generateMedievalScene(options: {}): any;
    socialClass?: string;
    location?: string;
    timeOfDay?: string;
    season?: string;
    theme?: string;
}
//# sourceMappingURL=MedievalDemo.d.ts.map