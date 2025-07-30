// packages/core/types/VFXExport.ts
// VFX-ready export schema for Wild Construct film production pipeline integration
 > ;
;
;
'rain' | 'snow' | 'fog' | 'dust' | 'smoke' | 'mist';
density: number; // 0-1,
size: number;
velocity: [number, number, number];
color: [number, number, number, number]; // RGBA,
 > ;
volumetrics: {
    enabled: boolean;
    scattering: number;
    absorption: number;
}
;
;
historicalAccuracy: {
    score: number; // 0-1,
    factors: string;
    references: string;
}
;
;
 > ;
;
coordination: {
    crowdControl: boolean;
    backdrop: boolean;
    meteor: boolean;
    dependencies: string;
}
;
historicalContext: {
    narrative: string;
    culturalSignificance: string;
    historicalEvents: string;
    accuracy: number; // 0-1,
}
;
;
// Rendering coordination
rendering: {
    renderOrder: string;
    compositing: {
        layers: string;
        blendModes: string;
        masks: string;
    }
    ;
    postProcessing: {
        colorGrading: boolean;
        filmGrain: boolean;
        vignette: boolean;
        historicalFilmLook: string; // e.g., "1970s film stock",
    }
    ;
}
;
'temporal' | 'regional' | 'social' | 'technical';
rule: string;
enforcement: 'strict' | 'warning' | 'suggestion';
context: string;
 > ;
validation: {
    overallScore: number; // 0-1,
    violations: Array < {
        severity: 'error' | 'warning' | 'info',
        message: string,
        suggestions: string
    } > ;
}
;
;
// Data sources and provenance
dataSources: Array < {
    id: string,
    name: string,
    type: 'museum' | 'academic' | 'archaeological' | 'specialist',
    url: string,
    reliability: number, // 0-1,
    coverage: string
} > ;
// VFX pipeline metadata
vfxMetadata: {
    textureCategories: string;
    materialProperties: Array < {
        name: string,
        values: (Record),
        historicalBasis: string } > ;
    compatibilityFlags: {
        maya: boolean;
        blender: boolean;
        houdini: boolean;
        unreal: boolean;
        unity: boolean;
    }
    ;
}
;
export {};
