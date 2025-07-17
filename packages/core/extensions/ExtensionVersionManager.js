"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extensionVersionManager = exports.ExtensionVersionManager = exports.VersionRange = exports.SemanticVersion = void 0;
class SemanticVersion {
    constructor(version) {
        this.raw = version;
        const parsed = this.parseVersion(version);
        this.major = parsed.major;
        this.minor = parsed.minor;
        this.patch = parsed.patch;
        this.prerelease = parsed.prerelease;
        this.build = parsed.build;
    }
    parseVersion(version) {
        const semverRegex = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/;
        const match = version.match(semverRegex);
        if (!match) {
            throw new Error(`Invalid semantic version: ${version}`);
        }
        return {
            major: parseInt(match[1], 10),
            minor: parseInt(match[2], 10),
            patch: parseInt(match[3], 10),
            prerelease: match[4] ? match[4].split('.') : [],
            build: match[5] ? match[5].split('.') : []
        };
    }
    compareTo(other) {
        if (this.major !== other.major) {
            return this.major - other.major;
        }
        if (this.minor !== other.minor) {
            return this.minor - other.minor;
        }
        if (this.patch !== other.patch) {
            return this.patch - other.patch;
        }
        if (this.prerelease.length === 0 && other.prerelease.length > 0) {
            return 1;
        }
        if (this.prerelease.length > 0 && other.prerelease.length === 0) {
            return -1;
        }
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
            }
        }
        return 0;
    }
    satisfies(range) {
        return VersionRange.parse(range).satisfies(this);
    }
    getNextVersion(releaseType) {
        switch (releaseType) {
            case 'major':
                return new SemanticVersion(`${this.major + 1}.0.0`);
            case 'minor':
                return new SemanticVersion(`${this.major}.${this.minor + 1}.0`);
            case 'patch':
                return new SemanticVersion(`${this.major}.${this.minor}.${this.patch + 1}`);
            case 'prerelease':
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
            default:
                throw new Error(`Unknown release type: ${releaseType}`);
        }
    }
    isPrerelease() {
        return this.prerelease.length > 0;
    }
    isStable() {
        return !this.isPrerelease();
    }
    toString() {
        return this.raw;
    }
}
exports.SemanticVersion = SemanticVersion;
class VersionRange {
    constructor(ranges) {
        this.ranges = ranges;
    }
    static parse(range) {
        const orParts = range.split('||').map(part => part.trim());
        const ranges = [];
        for (const orPart of orParts) {
            const andParts = orPart.split(/\s+/).filter(part => part.length > 0);
            const rangeSet = [];
            for (const andPart of andParts) {
                const comparator = this.parseComparator(andPart);
                rangeSet.push(comparator);
            }
            ranges.push(rangeSet);
        }
        return new VersionRange(ranges);
    }
    static parseComparator(comp) {
        if (comp.startsWith('~')) {
            const version = new SemanticVersion(comp.substring(1));
            return {
                operator: '~',
                version,
                satisfies: (v) => {
                    return v.major === version.major &&
                        v.minor === version.minor &&
                        v.compareTo(version) >= 0 &&
                        v.major === version.major &&
                        v.minor === version.minor;
                }
            };
        }
        if (comp.startsWith('^')) {
            const version = new SemanticVersion(comp.substring(1));
            return {
                operator: '^',
                version,
                satisfies: (v) => {
                    return v.major === version.major && v.compareTo(version) >= 0;
                }
            };
        }
        const operators = ['>=', '<=', '>', '<', '='];
        for (const op of operators) {
            if (comp.startsWith(op)) {
                const version = new SemanticVersion(comp.substring(op.length));
                return {
                    operator: op,
                    version,
                    satisfies: (v) => {
                        const cmp = v.compareTo(version);
                        switch (op) {
                            case '>=': return cmp >= 0;
                            case '<=': return cmp <= 0;
                            case '>': return cmp > 0;
                            case '<': return cmp < 0;
                            case '=': return cmp === 0;
                            default: return false;
                        }
                    }
                };
            }
        }
        const version = new SemanticVersion(comp);
        return {
            operator: '=',
            version,
            satisfies: (v) => v.compareTo(version) === 0
        };
    }
    satisfies(version) {
        return this.ranges.some(rangeSet => rangeSet.every(comparator => comparator.satisfies(version)));
    }
    toString() {
        return this.ranges.map(rangeSet => rangeSet.map(comp => `${comp.operator}${comp.version}`).join(' ')).join(' || ');
    }
}
exports.VersionRange = VersionRange;
class ExtensionVersionManager {
    constructor() {
        this.versionCache = new Map();
        this.compatibilityCache = new Map();
    }
    static getInstance() {
        if (!ExtensionVersionManager.instance) {
            ExtensionVersionManager.instance = new ExtensionVersionManager();
        }
        return ExtensionVersionManager.instance;
    }
    parseVersion(version) {
        if (this.versionCache.has(version)) {
            return this.versionCache.get(version);
        }
        const parsed = new SemanticVersion(version);
        this.versionCache.set(version, parsed);
        return parsed;
    }
    checkCompatibility(extension, systemVersion, availableExtensions) {
        const cacheKey = `${extension.id}-${extension.version}-${systemVersion}`;
        if (this.compatibilityCache.has(cacheKey)) {
            return this.compatibilityCache.get(cacheKey);
        }
        const result = this.performCompatibilityCheck(extension, systemVersion, availableExtensions);
        this.compatibilityCache.set(cacheKey, result);
        return result;
    }
    performCompatibilityCheck(extension, systemVersion, availableExtensions) {
        const issues = [];
        const warnings = [];
        const systemCheck = this.checkSystemCompatibility(extension, systemVersion);
        if (!systemCheck.compatible) {
            issues.push({
                type: 'system-version',
                severity: 'error',
                message: systemCheck.message || 'System version incompatible',
                currentVersion: systemVersion,
                requiredVersion: extension.dependencies?.system || '1.0.0'
            });
        }
        if (extension.dependencies?.extensions) {
            for (const [depId, versionRange] of Object.entries(extension.dependencies.extensions)) {
                const depExtension = availableExtensions.get(depId);
                if (!depExtension) {
                    issues.push({
                        type: 'missing-dependency',
                        severity: 'error',
                        message: `Missing dependency: ${depId}`,
                        dependencyId: depId,
                        requiredVersion: versionRange
                    });
                    continue;
                }
                const depVersion = this.parseVersion(depExtension.version);
                const range = VersionRange.parse(versionRange);
                if (!range.satisfies(depVersion)) {
                    issues.push({
                        type: 'version-mismatch',
                        severity: 'error',
                        message: `Dependency ${depId} version ${depExtension.version} doesn't satisfy ${versionRange}`,
                        dependencyId: depId,
                        currentVersion: depExtension.version,
                        requiredVersion: versionRange
                    });
                }
            }
        }
        const circularDeps = this.findCircularDependencies(extension, availableExtensions);
        if (circularDeps.length > 0) {
            issues.push({
                type: 'circular-dependency',
                severity: 'error',
                message: `Circular dependency detected: ${circularDeps.join(' -> ')}`,
                circularPath: circularDeps
            });
        }
        if (extension.dependencies?.extensions) {
            for (const [depId, versionRange] of Object.entries(extension.dependencies.extensions)) {
                const depExtension = availableExtensions.get(depId);
                if (depExtension?.compatibility?.deprecated) {
                    warnings.push(`Dependency ${depId} is deprecated: ${depExtension.compatibility.deprecationMessage || 'No longer maintained'}`);
                }
            }
        }
        return {
            compatible: issues.filter(i => i.severity === 'error').length === 0,
            issues,
            warnings,
            systemVersion,
            extensionVersion: extension.version
        };
    }
    checkSystemCompatibility(extension, systemVersion) {
        const systemVer = this.parseVersion(systemVersion);
        if (extension.compatibility?.min_system_version) {
            const minVer = this.parseVersion(extension.compatibility.min_system_version);
            if (systemVer.compareTo(minVer) < 0) {
                return {
                    compatible: false,
                    message: `System version ${systemVersion} is below minimum required ${extension.compatibility.min_system_version}`
                };
            }
        }
        if (extension.compatibility?.max_system_version) {
            const maxVer = this.parseVersion(extension.compatibility.max_system_version);
            if (systemVer.compareTo(maxVer) > 0) {
                return {
                    compatible: false,
                    message: `System version ${systemVersion} is above maximum supported ${extension.compatibility.max_system_version}`
                };
            }
        }
        return { compatible: true };
    }
    findCircularDependencies(extension, availableExtensions, visited = new Set(), path = []) {
        if (visited.has(extension.id)) {
            const circularStart = path.indexOf(extension.id);
            return circularStart >= 0 ? path.slice(circularStart).concat(extension.id) : [];
        }
        visited.add(extension.id);
        path.push(extension.id);
        if (extension.dependencies?.extensions) {
            for (const depId of Object.keys(extension.dependencies.extensions)) {
                const depExtension = availableExtensions.get(depId);
                if (depExtension) {
                    const circular = this.findCircularDependencies(depExtension, availableExtensions, new Set(visited), [...path]);
                    if (circular.length > 0) {
                        return circular;
                    }
                }
            }
        }
        return [];
    }
    getUpgradePath(currentVersion, targetVersion, availableVersions) {
        const current = this.parseVersion(currentVersion);
        const target = this.parseVersion(targetVersion);
        if (current.compareTo(target) >= 0) {
            return {
                possible: false,
                reason: 'Target version is not newer than current version',
                steps: []
            };
        }
        const sortedVersions = availableVersions
            .map(v => this.parseVersion(v))
            .filter(v => v.compareTo(current) > 0 && v.compareTo(target) <= 0)
            .sort((a, b) => a.compareTo(b));
        const steps = [];
        let currentStep = current;
        for (const version of sortedVersions) {
            const stepType = this.getUpgradeStepType(currentStep, version);
            const risk = this.assessUpgradeRisk(currentStep, version, stepType);
            steps.push({
                fromVersion: currentStep.toString(),
                toVersion: version.toString(),
                type: stepType,
                risk,
                breakingChanges: stepType === 'major',
                recommendedActions: this.getRecommendedActions(stepType, risk)
            });
            currentStep = version;
        }
        return {
            possible: true,
            steps,
            totalRisk: this.calculateTotalRisk(steps),
            estimatedDuration: this.estimateDuration(steps)
        };
    }
    getUpgradeStepType(from, to) {
        if (from.major !== to.major)
            return 'major';
        if (from.minor !== to.minor)
            return 'minor';
        if (from.patch !== to.patch)
            return 'patch';
        return 'prerelease';
    }
    assessUpgradeRisk(from, to, type) {
        if (type === 'major')
            return 'high';
        if (type === 'minor')
            return 'medium';
        if (type === 'patch')
            return 'low';
        if (to.isPrerelease())
            return 'high';
        return 'low';
    }
    getRecommendedActions(type, risk) {
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
        }
        if (risk === 'high') {
            actions.push('Create backup before upgrade');
            actions.push('Test in staging environment');
        }
        return actions;
    }
    calculateTotalRisk(steps) {
        const riskScores = { low: 1, medium: 2, high: 3 };
        const totalScore = steps.reduce((sum, step) => sum + riskScores[step.risk], 0);
        const avgScore = totalScore / steps.length;
        if (avgScore >= 2.5)
            return 'high';
        if (avgScore >= 1.5)
            return 'medium';
        return 'low';
    }
    estimateDuration(steps) {
        const durations = { patch: 15, minor: 30, major: 120, prerelease: 60 };
        const totalMinutes = steps.reduce((sum, step) => sum + durations[step.type], 0);
        if (totalMinutes < 60)
            return `${totalMinutes} minutes`;
        if (totalMinutes < 1440)
            return `${Math.round(totalMinutes / 60)} hours`;
        return `${Math.round(totalMinutes / 1440)} days`;
    }
    clearCaches() {
        this.versionCache.clear();
        this.compatibilityCache.clear();
    }
}
exports.ExtensionVersionManager = ExtensionVersionManager;
exports.extensionVersionManager = ExtensionVersionManager.getInstance();
//# sourceMappingURL=ExtensionVersionManager.js.map