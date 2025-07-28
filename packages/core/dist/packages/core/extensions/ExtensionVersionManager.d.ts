export declare class SemanticVersion {
    readonly major: number;
    readonly minor: number;
    readonly patch: number;
    readonly prerelease: string;
    readonly build: string;
    readonly raw: string;
    constructor(version: string);
    /**
     * Parse version string into components
     */
    private parseVersion;
    /**
     * Compare this version with another
     */
    compareTo(other: SemanticVersion): number;
    /**
     * Check if this version is compatible with a range
     */
    satisfies(range: string): boolean;
    /**
     * Get next version for different release types
     */
    getNextVersion(releaseType: ReleaseType): SemanticVersion;
    'patch': return;
}
//# sourceMappingURL=ExtensionVersionManager.d.ts.map