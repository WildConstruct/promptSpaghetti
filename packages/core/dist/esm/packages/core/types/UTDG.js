/**
 * Universal Texture Description Graph (UTDG) Data Schema
 * Epic 8.8: Historical Data Integration Foundation
 *
 * Provides the foundational data structures for historically accurate
 * content generation and Wild Construct ecosystem integration.
 */
;
region: string;
accuracy: 'high' | 'medium' | 'low';
description ?  : string;
culturalContext ?  : string;
export const HISTORICAL_ERAS = {
    MEDIEVAL_EARLY: {
        name: 'Early Medieval',
        period: { start: 476, end: 1000 },
        region: ['Europe'],
        accuracy: 'high',
        description: 'Early medieval period characterized by the fall of Rome and rise of feudalism'
    },
    MEDIEVAL_HIGH: {
        name: 'High Medieval',
        period: { start: 1000, end: 1300 },
        region: ['Europe'],
        accuracy: 'high',
        description: 'High medieval period of cathedral building, crusades, and scholasticism'
    },
    MEDIEVAL_LATE: {
        name: 'Late Medieval',
        period: { start: 1300, end: 1500 },
        region: ['Europe'],
        accuracy: 'high',
        description: 'Late medieval period transitioning toward Renaissance'
    },
    RENAISSANCE: {
        name: 'Renaissance',
        period: { start: 1400, end: 1600 },
        region: ['Europe'],
        accuracy: 'high',
        description: 'Renaissance period of cultural and artistic rebirth'
    }
};
;
relationships: {
    compatible: string; // Compatible node IDs,
    incompatible: string; // Incompatible node IDs,
    variations: Variation;
    requires ?  : string; // Required accompanying nodes,
    enhances ?  : string; // Nodes this enhances when present,
}
;
// Historical accuracy constraints
constraints: HistoricalConstraint;
// External data source information
external_source ?  : {
    source_id: string,
    source_type: 'museum_api' | 'academic_db' | 'archaeological' | 'literary',
    url: string,
    last_updated: string,
    confidence: number
};
;
transforms: DataTransform;
rate_limiting ?  : {
    requests_per_minute: number,
    requests_per_hour: number
};
metadata: {
    description: string;
    coverage_eras: Era;
    data_types: UTDGNodeType;
    accuracy_level: 'high' | 'medium' | 'low';
    last_validated: string;
}
;
;
;
;
