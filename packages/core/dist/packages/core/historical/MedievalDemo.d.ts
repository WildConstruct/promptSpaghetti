/**
 * Medieval-specific content types and constants
 */
export declare const MEDIEVAL_PERIODS: {
    EARLY_MEDIEVAL: {
        name: string;
        period: {
            start: number;
            end: number;
        };
        region: string[];
        accuracy: string;
        description: string;
    };
    HIGH_MEDIEVAL: {
        name: string;
        period: {
            start: number;
            end: number;
        };
        region: string[];
        accuracy: string;
        description: string;
    };
    LATE_MEDIEVAL: {
        name: string;
        period: {
            start: number;
            end: number;
        };
        region: string[];
        accuracy: string;
        description: string;
    };
};
/**
 * Medieval Demo Database
 */
export declare class MedievalDemoDatabase {
    private static instance;
    private clothingDatabase;
    private materialDatabase;
    private accessoryDatabase;
    constructor();
    static getInstance(): MedievalDemoDatabase;
    /**
     * Initialize the medieval demo database with historically accurate content
     */
    private initializeDatabase;
    /**
    * Create medieval clothing database
    */
    private createMedievalClothing;
    /**
     * Create medieval materials database
     */
    private createMedievalMaterials;
    materials: any;
    push({}: {}): any;
    id: 'medieval_linen_material_001';
    type: 'material';
    content: 'Fine linen cloth woven from flax fibers, prized for undergarments and shirts. Naturally white or cream colored, sometimes bleached.';
    description: 'Linen fabric for medieval undergarments';
    metadata: {
        era: [MEDIEVAL_PERIODS.HIGH_MEDIEVAL, MEDIEVAL_PERIODS.LATE_MEDIEVAL];
        authenticity: 0.92;
        source: 'Textile archaeological evidence';
        tags: ['linen', 'flax', 'white', 'undergarment', 'hygiene'];
        social_class: ['artisan', 'merchant', 'noble', 'clergy'];
    };
    relationships: {
        compatible: ['medieval_wool_001', 'medieval_chemise_001'];
        incompatible: ['medieval_peasant_only_001'];
        variations: [];
    };
    constraints: [];
}
//# sourceMappingURL=MedievalDemo.d.ts.map