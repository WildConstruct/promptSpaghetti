import { TargetingCondition } from './TargetingUIComponents';
export declare const useTargetingConditions: (initialConditions?: TargetingCondition) => void;
export declare const useUserSegments: () => any;
export declare const useTargetingPreview: () => any;
export declare const useAudienceManagement: () => any;
export declare const useGeographicTargeting: () => void;
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