export declare function getSupabaseConfig(): {
    readonly url: string;
    readonly anonKey: string;
    readonly flagRaw: string;
    readonly enabledByFlag: boolean;
    readonly hasEnv: boolean;
    readonly enabled: boolean;
    readonly meta: {
        readonly urlKey: string;
        readonly anonKeyKey: string;
        readonly flagKey: string;
        readonly urlLen: number;
        readonly anonKeyLen: number;
    };
};
export declare function hasSupabaseEnv(): boolean;
export declare function isSupabaseFeatureFlagEnabled(): boolean;
export declare function isSupabaseEnabled(): boolean;
export declare function deriveEnableSupabaseProp(): boolean;
//# sourceMappingURL=supabaseFeature.d.ts.map