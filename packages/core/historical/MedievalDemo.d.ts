/**
 * Medieval Demo Database Schema and Content
 * Epic 8.8: Historical Data Integration Foundation
 *
 * Provides historically accurate medieval content for Wild Construct demo
 */
import { UTDGNode, MedievalClothing, Era, SocialClass } from '../types/UTDG';
/**
 * Medieval-specific content types and constants
 */
export declare const MEDIEVAL_PERIODS: {
    EARLY_MEDIEVAL: {
        readonly name: "Early Medieval";
        readonly period: {
            readonly start: 476;
            readonly end: 1000;
        };
        readonly region: readonly ["Europe"];
        readonly accuracy: "high";
        readonly description: "Early medieval period characterized by the fall of Rome and rise of feudalism";
    };
    HIGH_MEDIEVAL: {
        readonly name: "High Medieval";
        readonly period: {
            readonly start: 1000;
            readonly end: 1300;
        };
        readonly region: readonly ["Europe"];
        readonly accuracy: "high";
        readonly description: "High medieval period of cathedral building, crusades, and scholasticism";
    };
    LATE_MEDIEVAL: {
        readonly name: "Late Medieval";
        readonly period: {
            readonly start: 1300;
            readonly end: 1500;
        };
        readonly region: readonly ["Europe"];
        readonly accuracy: "high";
        readonly description: "Late medieval period transitioning toward Renaissance";
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
     * Get clothing items by criteria
     */
    getClothing(criteria?: {)
        era?: Era;
        social_class?: SocialClass;
        gender?: 'male' | 'female' | 'unisex';
        garment_type?: string;
        ceremonial?: boolean;
    }): MedievalClothing[];
    /**
     * Get materials by criteria
     */
    getMaterials(criteria?: {)
        era?: Era;
        fabric_type?: string;
        availability?: 'common' | 'expensive' | 'rare'
  }): UTDGNode[];
    /**
     * Get accessories by criteria
     */
    getAccessories(criteria?: {)
        era?: Era;
        social_class?: SocialClass;
        type?: string;
    }): UTDGNode[];
    /**
     * Generate a complete medieval outfit
     */
    generateOutfit(criteria: {)
        era: Era;
        social_class: SocialClass;
        gender: 'male' | 'female';
        occasion?: 'daily' | 'ceremonial' | 'work' | 'travel';
        season?: 'spring' | 'summer' | 'autumn' | 'winter'
  }): {
        outfit: (MedievalClothing | UTDGNode)[];
        description: string;
        historical_notes: string[];
    };
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
    /**
     * Create medieval accessories database
     */
    private createMedievalAccessories;
    /**
     * Check if era matches criteria
     */
    private eraMatches;
    /**
     * Generate outfit description
     */
    private generateOutfitDescription;
/**
 * Medieval historical constraints specific to the demo
 */
export declare const MEDIEVAL_DEMO_CONSTRAINTS: ({)
    id: string;
    rule: string;
    eras: {
        name: string;
        period: {
            start: number;
            end: number;
        };
        region: string[];
        accuracy: "high"
  }[];
    enforcement: "strict";
    message: string;
    historical_basis: string;
    social_classes?: undefined;
} | {
    id: string;
    rule: string;
    eras: {
        name: string;
        period: {
            start: number;
            end: number;
        };
        region: string[];
        accuracy: "high"
  }[];
    enforcement: "warning";
    message: string;
    historical_basis: string;
    social_classes?: undefined;
} | {
    id: string;
    rule: string;
    eras: {
        name: string;
        period: {
            start: number;
            end: number;
        };
        region: string[];
        accuracy: "high"
  }[];
    social_classes: readonly ["peasant", "artisan", "merchant", "noble"];
    enforcement: "suggestion";
    message: string;
    historical_basis: string;
})[];
export default MedievalDemoDatabase;
//# sourceMappingURL=MedievalDemo.d.ts.map