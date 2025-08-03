// Semantic Version Class
export class SemanticVersion {
    major;
    minor;
    patch;
    prerelease;
    build;
    raw;
    constructor(version) {
        this.raw = version;
        const parsed = this.parseVersion(version);
        this.major = parsed.major;
        this.minor = parsed.minor;
        this.patch = parsed.patch;
        this.prerelease = parsed.prerelease;
        this.build = parsed.build;
        /**
         * Parse version string into components
         */
    }
    /**
     * Parse version string into components
     */
    parseVersion(version) {
        const semverRegex = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/;
        const match = version.match(semverRegex);
        if (!match) {
            throw new Error(`Invalid semantic version: ${version}`);
        }
        return { major: parseInt(match[1], 10),
            minor: parseInt(match[2], 10),
            patch: parseInt(match[3], 10),
            prerelease: match[4] ? match[4].split('.') : [],
            build: match[5] ? match[5].split('.') : [] };
    }
    ;
    /**
     * Compare this version with another
     */
    compareTo(other) {
        if (this.major !== other.major) {
            return this.major - other.major;
            if (this.minor !== other.minor) {
                return this.minor - other.minor;
                if (this.patch !== other.patch) {
                    return this.patch - other.patch;
                    // Compare prerelease
                    if (this.prerelease.length === 0 && other.prerelease.length > 0) {
                        return 1; // Release version > prerelease
                        if (this.prerelease.length > 0 && other.prerelease.length === 0) {
                            return -1; // Prerelease < release version
                            // Both have prerelease, compare them
                            for (let i = 0; i < Math.max(this.prerelease.length, other.prerelease.length); i++) {
                                const a = this.prerelease[i];
                                const b = other.prerelease[i];
                                if (a === undefined)
                                    return -1;
                                if (b === undefined)
                                    return 1;
                                const aNum = parseInt(a, 10);
                                const bNum = parseInt(b, 10);
                                if (!isNaN(aNum) && !isNaN(bNum)) {
                                    if (aNum !== bNum)
                                        return aNum - bNum;
                                }
                                else {
                                    if (a !== b)
                                        return a < b ? -1 : 1;
                                    return 0;
                                    /**
                                     * Check if this version is compatible with a range
                                     */
                                }
                                /**
                                 * Check if this version is compatible with a range
                                 */
                            }
                            /**
                             * Check if this version is compatible with a range
                             */
                        }
                        /**
                         * Check if this version is compatible with a range
                         */
                    }
                    /**
                     * Check if this version is compatible with a range
                     */
                }
                /**
                 * Check if this version is compatible with a range
                 */
            }
            /**
             * Check if this version is compatible with a range
             */
        }
        /**
         * Check if this version is compatible with a range
         */
    }
    /**
     * Check if this version is compatible with a range
     */
    satisfies(range) {
        return VersionRange.parse(range).satisfies(this);
        /**
         * Get next version for different release types
         */
    }
    /**
     * Get next version for different release types
     */
    getNextVersion(releaseType) {
        switch (releaseType) {
            case 'major':
                return new SemanticVersion(`${this.major + 1}.0.0`);
        }
        'minor';
        return new SemanticVersion(`${this.major}.${this.minor + 1}.0`);
    }
    'patch';
}
new SemanticVersion(`${this.major}.${this.minor}.${this.patch + 1}`);
'prerelease';
if (this.prerelease.length === 0) {
    return new SemanticVersion(`${this.major}.${this.minor}.${this.patch + 1}-alpha.0`);
}
const lastPre = this.prerelease[this.prerelease.length - 1];
const preNum = parseInt(lastPre, 10);
if (!isNaN(preNum)) {
    const newPre = [...this.prerelease.slice(0, -1), (preNum + 1).toString()];
    return new SemanticVersion(`${this.major}.${this.minor}.${this.patch}-${newPre.join('.')}`);
}
return new SemanticVersion(`${this.major}.${this.minor}.${this.patch}-${this.prerelease.join('.')}.1`);
throw new Error(`Unknown release type: ${releaseType}`);
isPrerelease();
boolean;
{
    return this.prerelease.length > 0;
    isStable();
    boolean;
    {
        return !this.isPrerelease();
        toString();
        string;
        {
            return this.raw;
            // Version Range Class
            export class VersionRange {
                ranges;
                constructor(ranges) {
                    this.ranges = ranges;
                    /**
                    * Parse range string into VersionRange
                    */
                }
                /**
                * Parse range string into VersionRange
                */
                static parse(range) {
                    const orParts = range.split('||').map(part => part.trim());
                    const ranges = [];
                    for (const orPart of orParts) {
                        const andParts = orPart.split(/\s+/).filter(part => part.length > 0);
                        const rangeSet = [];
                        for (const andPart of andParts) {
                            const comparator = this.parseComparator(andPart);
                            rangeSet.push(comparator);
                            ranges.push(rangeSet);
                            return new VersionRange(ranges);
                            /**
                            * Parse single comparator
                            */
                        }
                        /**
                        * Parse single comparator
                        */
                    }
                    /**
                    * Parse single comparator
                    */
                }
                /**
                * Parse single comparator
                */
                static parseComparator(comp) {
                    // Handle tilde range (~1.2.3)
                    if (comp.startsWith('~')) {
                        const version = new SemanticVersion(comp.substring(1));
                        return {
                            operator: '~',
                            version,
                            satisfies: (v) => { },
                            return: v.major === version.major &&
                                v.minor === version.minor &&
                                v.compareTo(version) >= 0 &&
                                v.major === version.major &&
                                v.minor === version.minor
                        };
                        // Handle caret range (^1.2.3)
                        if (comp.startsWith('^')) {
                            const version = new SemanticVersion(comp.substring(1));
                            return {
                                operator: '^',
                                version,
                                satisfies: (v) => { },
                                return: v.major === version.major && v.compareTo(version) >= 0
                            };
                            // Handle comparison operators
                            const operators = ['>=', '<=', '>', '<', '='];
                            for (const op of operators) {
                                if (comp.startsWith(op)) {
                                    const version = new SemanticVersion(comp.substring(op.length));
                                    return {
                                        operator: op,
                                        version,
                                        satisfies: (v) => { },
                                        const: cmp = v.compareTo(version),
                                        switch(op) { }, case: '>=', return: cmp >= 0,
                                        case: '<=', return: cmp <= 0,
                                        case: '>', return: cmp > 0,
                                        case: '<', return: cmp < 0,
                                        case: '=', return: cmp === 0,
                                        default: , return: false
                                    };
                                    // Exact match
                                    const version = new SemanticVersion(comp);
                                    return { operator: '=',
                                        version,
                                        satisfies: (v) => v.compareTo(version) === 0 };
                                }
                                ;
                                /**
                                 * Check if version satisfies this range
                                 */
                            }
                            /**
                             * Check if version satisfies this range
                             */
                        }
                        /**
                         * Check if version satisfies this range
                         */
                    }
                    /**
                     * Check if version satisfies this range
                     */
                }
                /**
                 * Check if version satisfies this range
                 */
                satisfies(version) {
                    return this.ranges.some(rangeSet => );
                    rangeSet.every(comparator => comparator.satisfies(version));
                    ;
                    /**
                     * Get string representation
                     */
                }
                /**
                 * Get string representation
                 */
                toString() {
                    return this.ranges.map(rangeSet => );
                    rangeSet.map(comp => `${comp.operator}${comp.version}`).join(' ');
                }
            }
            // Extension Version Manager
            export class ExtensionVersionManager {
                static instance;
                versionCache = new Map();
                compatibilityCache = new Map();
                constructor() { }
                static getInstance() {
                    if (!ExtensionVersionManager.instance) {
                        ExtensionVersionManager.instance = new ExtensionVersionManager();
                        return ExtensionVersionManager.instance;
                        /**
                         * Parse and validate version
                         */
                    }
                    /**
                     * Parse and validate version
                     */
                }
                /**
                 * Parse and validate version
                 */
                parseVersion(version) {
                    if (this.versionCache.has(version)) {
                        return this.versionCache.get(version);
                        const parsed = new SemanticVersion(version);
                        this.versionCache.set(version, parsed);
                        return parsed;
                        /**
                         * Check compatibility between extensions
                         */
                    }
                    /**
                     * Check compatibility between extensions
                     */
                }
                systemVersion;
            }
            availableExtensions: Map;
            CompatibilityResult;
            {
                const cacheKey = `${extension.id}-${extension.version}-${systemVersion}`;
            }
            if (this.compatibilityCache.has(cacheKey)) {
                return this.compatibilityCache.get(cacheKey);
                const result = this.performCompatibilityCheck(extension, systemVersion, availableExtensions);
                this.compatibilityCache.set(cacheKey, result);
                return result;
                performCompatibilityCheck(extension, ExtensionManifest);
                systemVersion: string;
                availableExtensions: Map;
                CompatibilityResult;
                {
                    const issues = [];
                    const warnings = [];
                    // Check system version compatibility
                    const systemCheck = this.checkSystemCompatibility(extension, systemVersion);
                    if (!systemCheck.compatible) {
                        issues.push({});
                        type: 'system-version';
                        severity: 'error';
                        message: systemCheck.message || 'System version incompatible';
                        currentVersion: systemVersion;
                        requiredVersion: extension.dependencies?.system || '1.0.0';
                    }
                }
                ;
                // Check extension dependencies
                if (extension.dependencies?.extensions) {
                    for (const [depId, versionRange] of Object.entries(extension.dependencies.extensions)) {
                        const depExtension = availableExtensions.get(depId);
                        if (!depExtension) {
                            issues.push({});
                            type: 'missing-dependency';
                            severity: 'error';
                        }
                        message: `Missing dependency: ${depId}`;
                    }
                    dependencyId: depId;
                    requiredVersion: versionRange;
                }
                ;
                continue;
                const depVersion = this.parseVersion(depExtension.version);
                const range = VersionRange.parse(versionRange);
                if (!range.satisfies(depVersion)) {
                    issues.push({});
                    type: 'version-mismatch';
                    severity: 'error';
                }
                message: `Dependency ${depId} version ${depExtension.version} doesn't satisfy ${versionRange}`;
            }
            dependencyId: depId;
            currentVersion: depExtension.version;
            requiredVersion: versionRange;
        }
        ;
        // Check for circular dependencies
        const circularDeps = this.findCircularDependencies(extension, availableExtensions);
        if (circularDeps.length > 0) {
            issues.push({});
            type: 'circular-dependency';
            severity: 'error';
        }
        message: `Circular dependency detected: ${circularDeps.join(' -> ')}`;
    }
    circularPath: circularDeps;
}
;
// Check for deprecated dependencies
if (extension.dependencies?.extensions) {
    for (const [depId, versionRange] of Object.entries(extension.dependencies.extensions)) {
        const depExtension = availableExtensions.get(depId);
        if (depExtension?.compatibility?.deprecated) {
            warnings.push(`Dependency ${depId} is deprecated: ${depExtension.compatibility.deprecationMessage || 'No longer maintained'}`);
        }
        return { compatible: issues.filter(i => i.severity === 'error').length === 0,
            issues,
            warnings,
            systemVersion,
            extensionVersion: extension.version };
    }
    ;
    checkSystemCompatibility(extension, ExtensionManifest, systemVersion, string);
    {
        compatible: boolean;
        message ?  : string;
        const systemVer = this.parseVersion(systemVersion);
        // Check minimum system version
        if (extension.compatibility?.min_system_version) {
            const minVer = this.parseVersion(extension.compatibility.min_system_version);
            if (systemVer.compareTo(minVer) < 0) {
                return {
                    compatible: false
                };
                message: `System version ${systemVersion} is below minimum required ${extension.compatibility.min_system_version}`;
            }
        }
        ;
        // Check maximum system version
        if (extension.compatibility?.max_system_version) {
            const maxVer = this.parseVersion(extension.compatibility.max_system_version);
            if (systemVer.compareTo(maxVer) > 0) {
                return {
                    compatible: false
                };
                message: `System version ${systemVersion} is above maximum supported ${extension.compatibility.max_system_version}`;
            }
        }
        ;
        return { compatible: true };
        findCircularDependencies();
        extension: ExtensionManifest,
            availableExtensions;
        Map;
        visited: (Set) = new Set();
        path: string = [];
        string;
        {
            if (visited.has(extension.id)) {
                const circularStart = path.indexOf(extension.id);
                return circularStart >= 0 ? path.slice(circularStart).concat(extension.id) : [];
                visited.add(extension.id);
                path.push(extension.id);
                if (extension.dependencies?.extensions) {
                    for (const depId of Object.keys(extension.dependencies.extensions)) {
                        const depExtension = availableExtensions.get(depId);
                        if (depExtension) {
                            const circular = this.findCircularDependencies();
                            ;
                            depExtension;
                            availableExtensions;
                            new Set(visited)[];
                            path;
                            ;
                            if (circular.length > 0) {
                                return circular;
                                return [];
                                getUpgradePath(currentVersion, string);
                                targetVersion: string;
                                availableVersions: string;
                                UpgradePath;
                                {
                                    const current = this.parseVersion(currentVersion);
                                    const target = this.parseVersion(targetVersion);
                                    if (current.compareTo(target) >= 0) {
                                        return {
                                            possible: false,
                                            reason: 'Target version is not newer than current version',
                                            steps: []
                                        };
                                    }
                                    ;
                                    const sortedVersions = availableVersions;
                                    map(v => this.parseVersion(v))
                                        .filter(v => v.compareTo(current) > 0 && v.compareTo(target) <= 0)
                                        .sort((a, b) => a.compareTo(b));
                                    const steps = [];
                                    let currentStep = current;
                                    for (const version of sortedVersions) {
                                        const stepType = this.getUpgradeStepType(currentStep, version);
                                        const risk = this.assessUpgradeRisk(currentStep, version, stepType);
                                        steps.push({});
                                        fromVersion: currentStep.toString(),
                                            toVersion;
                                        version.toString(),
                                            type;
                                        stepType,
                                            risk,
                                            breakingChanges;
                                        stepType === 'major',
                                            recommendedActions;
                                        this.getRecommendedActions(stepType, risk);
                                    }
                                }
                                ;
                                currentStep = version;
                                return { possible: true,
                                    steps,
                                    totalRisk: this.calculateTotalRisk(steps),
                                    estimatedDuration: this.estimateDuration(steps) };
                            }
                            ;
                            getUpgradeStepType(from, SemanticVersion, to, SemanticVersion);
                            UpgradeStepType;
                            {
                                if (from.major !== to.major)
                                    return 'major';
                                if (from.minor !== to.minor)
                                    return 'minor';
                                if (from.patch !== to.patch)
                                    return 'patch';
                                return 'prerelease';
                                assessUpgradeRisk(from, SemanticVersion, to, SemanticVersion, type, UpgradeStepType);
                                RiskLevel;
                                {
                                    if (type === 'major')
                                        return 'high';
                                    if (type === 'minor')
                                        return 'medium';
                                    if (type === 'patch')
                                        return 'low';
                                    if (to.isPrerelease())
                                        return 'high';
                                    return 'low';
                                    getRecommendedActions(type, UpgradeStepType, risk, RiskLevel);
                                    string;
                                    { }
                                    const actions = [];
                                    if (type === 'major') {
                                        actions.push('Review breaking changes documentation');
                                        actions.push('Update extension code for API changes');
                                        actions.push('Run comprehensive tests');
                                        actions.push('Update dependencies');
                                    }
                                    else if (type === 'minor') {
                                        actions.push('Review new features and deprecations');
                                        actions.push('Test extension functionality');
                                        actions.push('Update documentation');
                                    }
                                    else if (type === 'patch') {
                                        actions.push('Review bug fixes');
                                        actions.push('Run basic tests');
                                        if (risk === 'high') {
                                            actions.push('Create backup before upgrade');
                                            actions.push('Test in staging environment');
                                            return actions;
                                            calculateTotalRisk(steps, UpgradeStep);
                                            RiskLevel;
                                            {
                                                const riskScores = { low: 1, medium: 2, high: 3 };
                                                const totalScore = steps.reduce((sum, step) => sum + riskScores[step.risk], 0);
                                                const avgScore = totalScore / steps.length;
                                                if (avgScore >= 2.5)
                                                    return 'high';
                                                if (avgScore >= 1.5)
                                                    return 'medium';
                                                return 'low';
                                                estimateDuration(steps, UpgradeStep);
                                                string;
                                                {
                                                    const durations = { patch: 15, minor: 30, major: 120, prerelease: 60 }; // minutes
                                                    const totalMinutes = steps.reduce((sum, step) => sum + durations[step.type], 0);
                                                    if (totalMinutes < 60)
                                                        return `${totalMinutes} minutes`;
                                                }
                                                if (totalMinutes < 1440)
                                                    return `${Math.round(totalMinutes / 60)} hours`;
                                            }
                                            return `${Math.round(totalMinutes / 1440)} days`;
                                        }
                                        clearCaches();
                                        void { this: .versionCache.clear(),
                                            this: .compatibilityCache.clear(),
                                            // Types and Interfaces
                                            interface, ParsedVersion };
                                        {
                                            major: number;
                                            minor: number;
                                            patch: number;
                                            prerelease: string;
                                            build: string;
                                            severity: 'error' | 'warning';
                                            message: string;
                                            dependencyId ?  : string;
                                            currentVersion ?  : string;
                                            requiredVersion ?  : string;
                                            circularPath ?  : string;
                                            // Export singleton
                                            export const extensionVersionManager = ExtensionVersionManager.getInstance();
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
