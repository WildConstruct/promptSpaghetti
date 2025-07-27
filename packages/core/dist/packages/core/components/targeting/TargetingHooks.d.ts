/**
 * Targeting UI Hooks (Epic 17)
 *
 * DEPLOYMENT BLOCKER FIX: React hooks for targeting UI components
 * providing state management, data fetching, and interaction logic.
 */
import { TargetingCondition, UserSegment, TargetingAudience, TargetingPreview } from './TargetingUIComponents';
export declare const useTargetingConditions: (initialConditions?: TargetingCondition[]) => {
    conditions: TargetingCondition[];
    activeConditions: TargetingCondition[];
    conditionsByType: Record<string, TargetingCondition[]>;
    isDirty: boolean;
    addCondition: (condition: Omit<TargetingCondition, "id">) => void;
    updateCondition: (id: string, updates: Partial<TargetingCondition>) => void;
    removeCondition: (id: string) => void;
    reorderConditions: (fromIndex: number, toIndex: number) => void;
    clearConditions: () => void;
    resetToInitial: () => void;
    setConditions: import("react").Dispatch<import("react").SetStateAction<TargetingCondition[]>>;
};
export declare const useUserSegments: () => {
    segments: UserSegment[];
    activeSegments: UserSegment[];
    segmentsByTag: Record<string, UserSegment[]>;
    loading: boolean;
    error: string;
    fetchSegments: () => Promise<void>;
    createSegment: (segment: Omit<UserSegment, "id" | "createdAt" | "lastUpdated">) => Promise<any>;
    updateSegment: (id: string, updates: Partial<UserSegment>) => Promise<any>;
    deleteSegment: (id: string) => Promise<void>;
    duplicateSegment: (id: string) => Promise<any>;
};
export declare const useTargetingPreview: () => {
    preview: TargetingPreview;
    loading: boolean;
    error: string;
    generatePreview: (conditions: TargetingCondition[]) => Promise<any>;
    clearPreview: () => void;
};
export declare const useAudienceManagement: () => {
    audiences: TargetingAudience[];
    activeAudiences: TargetingAudience[];
    selectedAudience: TargetingAudience;
    loading: boolean;
    error: string;
    fetchAudiences: () => Promise<void>;
    createAudience: (audience: Omit<TargetingAudience, "id">) => Promise<any>;
    updateAudience: (id: string, updates: Partial<TargetingAudience>) => Promise<any>;
    deleteAudience: (id: string) => Promise<void>;
    selectAudience: (audience: TargetingAudience) => void;
};
export declare const useGeographicTargeting: () => {
    selectedCountries: string[];
    selectedRegions: string[];
    selectedCities: string[];
    excludeMode: boolean;
    availableLocations: {
        countries: any[];
        regions: any[];
        cities: any[];
    };
    setSelectedCountries: import("react").Dispatch<import("react").SetStateAction<string[]>>;
    setSelectedRegions: import("react").Dispatch<import("react").SetStateAction<string[]>>;
    setSelectedCities: import("react").Dispatch<import("react").SetStateAction<string[]>>;
    setExcludeMode: import("react").Dispatch<import("react").SetStateAction<boolean>>;
    toggleCountry: (countryCode: string) => void;
    toggleRegion: (regionCode: string) => void;
    toggleCity: (cityCode: string) => void;
    clearSelection: () => void;
    getTargetingConfig: () => {
        countries: string[];
        regions: string[];
        cities: string[];
        excludeMode: boolean;
    };
    loadFromConfig: (config: {
        countries?: string[];
        regions?: string[];
        cities?: string[];
        excludeMode?: boolean;
    }) => void;
};
export declare const useTargetingAnalytics: () => {
    analytics: unknown;
    timeRange: "30d" | "7d" | "90d" | "24h";
    loading: boolean;
    error: string;
    changeTimeRange: (range: "30d" | "7d" | "90d" | "24h") => void;
    fetchAnalytics: (range: "30d" | "7d" | "90d" | "24h") => Promise<void>;
};
export declare const useDebounce: <T>(value: T, delay: number) => T;
//# sourceMappingURL=TargetingHooks.d.ts.map