/**
 * Extension Upgrade Advisor - Epic 8.4 Story 8.4.4
 * Provides intelligent upgrade recommendations and migration assistance
 */
import { SemanticVersion, extensionVersionManager } from './ExtensionVersionManager';
import { extensionCompatibilityChecker } from './ExtensionCompatibilityChecker';
// Upgrade Advisor
export class ExtensionUpgradeAdvisor {
    static instance;
    upgradeStrategies = new Map();
    migrationRules = new Map();
    breakingChanges = new Map();
    constructor() {
        this.initializeDefaultStrategies();
    }
    static getInstance() {
        if (!ExtensionUpgradeAdvisor.instance) {
            ExtensionUpgradeAdvisor.instance = new ExtensionUpgradeAdvisor();
        }
        return ExtensionUpgradeAdvisor.instance;
    }
    /**
     * Get upgrade recommendations for an extension
     */
    getUpgradeRecommendations(currentExtension, availableVersions, context) {
        const currentVersion = new SemanticVersion(currentExtension.version);
        const availableSemanticVersions = availableVersions
            .map(v => new SemanticVersion(v))
            .filter(v => v.compareTo(currentVersion) > 0)
            .sort((a, b) => a.compareTo(b));
        if (availableSemanticVersions.length === 0) {
            return {
                hasUpdates: false,
                currentVersion: currentExtension.version,
                recommendations: [],
                strategy: 'none'
            };
        }
        const recommendations = [];
        const strategy = this.determineUpgradeStrategy(currentExtension, availableSemanticVersions, context);
        // Generate recommendations based on strategy
        switch (strategy) {
            case 'conservative':
                recommendations.push(...this.getConservativeRecommendations(currentVersion, availableSemanticVersions, context));
                break;
            case 'moderate':
                recommendations.push(...this.getModerateRecommendations(currentVersion, availableSemanticVersions, context));
                break;
            case 'aggressive':
                recommendations.push(...this.getAggressiveRecommendations(currentVersion, availableSemanticVersions, context));
                break;
            case 'security':
                recommendations.push(...this.getSecurityRecommendations(currentVersion, availableSemanticVersions, context));
                break;
        }
        return {
            hasUpdates: true,
            currentVersion: currentExtension.version,
            recommendations,
            strategy
        };
    }
    /**
     * Analyze upgrade path for specific target version
     */
    analyzeUpgradePath(currentExtension, targetVersion, availableVersions, context) {
        const upgradePath = extensionVersionManager.getUpgradePath(currentExtension.version, targetVersion, availableVersions);
        if (!upgradePath.possible) {
            return {
                feasible: false,
                reason: upgradePath.reason,
                path: upgradePath,
                migrationTasks: [],
                risks: [],
                benefits: []
            };
        }
        const migrationTasks = this.generateMigrationTasks(currentExtension, targetVersion, upgradePath);
        const risks = this.assessUpgradeRisks(currentExtension, targetVersion, upgradePath, context);
        const benefits = this.identifyUpgradeBenefits(currentExtension, targetVersion, context);
        return {
            feasible: true,
            path: upgradePath,
            migrationTasks,
            risks,
            benefits,
            estimatedEffort: this.estimateUpgradeEffort(migrationTasks, risks),
            timeline: this.generateUpgradeTimeline(upgradePath, migrationTasks)
        };
    }
    /**
     * Generate migration plan for upgrade
     */
    generateMigrationPlan(currentExtension, targetVersion, context) {
        const analysis = this.analyzeUpgradePath(currentExtension, targetVersion, [targetVersion], context);
        if (!analysis.feasible) {
            return {
                viable: false,
                reason: analysis.reason,
                phases: []
            };
        }
        const phases = this.generateMigrationPhases(analysis);
        const rollbackPlan = this.generateRollbackPlan(currentExtension, targetVersion);
        const testingPlan = this.generateTestingPlan(currentExtension, targetVersion);
        return {
            viable: true,
            phases,
            rollbackPlan,
            testingPlan,
            estimatedDuration: analysis.timeline?.totalDuration || 'Unknown',
            riskLevel: analysis.path.totalRisk || 'medium',
            prerequisites: this.identifyPrerequisites(currentExtension, targetVersion, context)
        };
    }
    /**
     * Check for breaking changes between versions
     */
    checkBreakingChanges(extensionId, fromVersion, toVersion) {
        const fromVer = new SemanticVersion(fromVersion);
        const toVer = new SemanticVersion(toVersion);
        const changes = this.breakingChanges.get(extensionId) || [];
        const applicableChanges = changes.filter(change => {
            const changeVer = new SemanticVersion(change.introducedIn);
            return changeVer.compareTo(fromVer) > 0 && changeVer.compareTo(toVer) <= 0;
        });
        return {
            hasBreakingChanges: applicableChanges.length > 0,
            changes: applicableChanges,
            impactLevel: this.calculateImpactLevel(applicableChanges),
            migrationRequired: applicableChanges.some(c => c.migrationRequired),
            automatedMigration: applicableChanges.every(c => c.automatedMigration)
        };
    }
    /**
     * Validate upgrade compatibility
     */
    validateUpgradeCompatibility(currentExtension, targetExtension, context) {
        const compatibilityResult = extensionCompatibilityChecker.checkExtensionCompatibility(targetExtension, {
            systemVersion: context.systemVersion,
            platform: context.platform,
            availableExtensions: context.availableExtensions,
            grantedPermissions: context.grantedPermissions,
            browserInfo: context.browserInfo
        });
        const dependencyConflicts = this.checkDependencyConflicts(currentExtension, targetExtension, context);
        const permissionChanges = this.analyzePermissionChanges(currentExtension, targetExtension);
        return {
            compatible: compatibilityResult.compatible && dependencyConflicts.length === 0,
            compatibilityResult,
            dependencyConflicts,
            permissionChanges,
            requiresRestart: this.requiresRestart(currentExtension, targetExtension),
            dataBackupRequired: this.requiresDataBackup(currentExtension, targetExtension)
        };
    }
    /**
     * Determine upgrade strategy based on context
     */
    determineUpgradeStrategy(extension, availableVersions, context) {
        const strategy = this.upgradeStrategies.get(extension.id);
        if (strategy) {
            return strategy.type;
        }
        // Default strategy based on context
        if (context.securityPriority) {
            return 'security';
        }
        if (context.stabilityPriority) {
            return 'conservative';
        }
        if (context.featurePriority) {
            return 'aggressive';
        }
        return 'moderate';
    }
    /**
     * Get conservative upgrade recommendations
     */
    getConservativeRecommendations(currentVersion, availableVersions, context) {
        const recommendations = [];
        // Latest patch version
        const latestPatch = availableVersions
            .filter(v => v.major === currentVersion.major && v.minor === currentVersion.minor)
            .pop();
        if (latestPatch) {
            recommendations.push({
                version: latestPatch.toString(),
                priority: 'high',
                reason: 'Latest patch version with bug fixes and security updates',
                risk: 'low',
                benefits: ['Bug fixes', 'Security updates'],
                effort: 'minimal'
            });
        }
        // Latest minor version (if stable)
        const latestMinor = availableVersions
            .filter(v => v.major === currentVersion.major && v.isStable())
            .pop();
        if (latestMinor && latestMinor.minor > currentVersion.minor) {
            recommendations.push({
                version: latestMinor.toString(),
                priority: 'medium',
                reason: 'Latest minor version with new features',
                risk: 'low',
                benefits: ['New features', 'Improvements', 'Bug fixes'],
                effort: 'low'
            });
        }
        return recommendations;
    }
    /**
     * Get moderate upgrade recommendations
     */
    getModerateRecommendations(currentVersion, availableVersions, context) {
        const recommendations = [];
        // Include conservative recommendations
        recommendations.push(...this.getConservativeRecommendations(currentVersion, availableVersions, context));
        // Latest stable version
        const latestStable = availableVersions
            .filter(v => v.isStable())
            .pop();
        if (latestStable && latestStable.major > currentVersion.major) {
            recommendations.push({
                version: latestStable.toString(),
                priority: 'medium',
                reason: 'Latest stable major version with significant improvements',
                risk: 'medium',
                benefits: ['Major improvements', 'New features', 'Performance gains'],
                effort: 'medium'
            });
        }
        return recommendations;
    }
    /**
     * Get aggressive upgrade recommendations
     */
    getAggressiveRecommendations(currentVersion, availableVersions, context) {
        const recommendations = [];
        // Include moderate recommendations
        recommendations.push(...this.getModerateRecommendations(currentVersion, availableVersions, context));
        // Latest version (including prereleases)
        const latestVersion = availableVersions[availableVersions.length - 1];
        if (latestVersion && latestVersion.isPrerelease()) {
            recommendations.push({
                version: latestVersion.toString(),
                priority: 'low',
                reason: 'Latest prerelease version with cutting-edge features',
                risk: 'high',
                benefits: ['Latest features', 'Early access to improvements'],
                effort: 'high'
            });
        }
        return recommendations;
    }
    /**
     * Get security-focused upgrade recommendations
     */
    getSecurityRecommendations(currentVersion, availableVersions, context) {
        const recommendations = [];
        // Filter versions with security fixes
        const securityVersions = availableVersions.filter(v => {
            // In a real implementation, this would check release notes or security advisories
            return v.compareTo(currentVersion) > 0;
        });
        for (const version of securityVersions) {
            const priority = version.major > currentVersion.major ? 'high' : 'medium';
            const risk = version.major > currentVersion.major ? 'medium' : 'low';
            recommendations.push({
                version: version.toString(),
                priority,
                reason: 'Contains security fixes',
                risk,
                benefits: ['Security improvements', 'Vulnerability fixes'],
                effort: risk === 'medium' ? 'medium' : 'low'
            });
        }
        return recommendations;
    }
    /**
     * Generate migration tasks
     */
    generateMigrationTasks(currentExtension, targetVersion, upgradePath) {
        const tasks = [];
        // Standard migration tasks
        tasks.push({
            id: 'backup',
            title: 'Backup current extension',
            description: 'Create backup of current extension and data',
            type: 'preparation',
            required: true,
            automated: false,
            estimatedDuration: '5 minutes'
        });
        tasks.push({
            id: 'validate-dependencies',
            title: 'Validate dependencies',
            description: 'Ensure all dependencies are compatible with target version',
            type: 'validation',
            required: true,
            automated: true,
            estimatedDuration: '2 minutes'
        });
        // Add version-specific migration tasks
        const rules = this.migrationRules.get(currentExtension.id) || [];
        for (const rule of rules) {
            if (rule.appliesTo(currentExtension.version, targetVersion)) {
                tasks.push(...rule.generateTasks(currentExtension, targetVersion));
            }
        }
        return tasks;
    }
    /**
     * Assess upgrade risks
     */
    assessUpgradeRisks(currentExtension, targetVersion, upgradePath, context) {
        const risks = [];
        // Breaking changes risk
        const breakingChanges = this.checkBreakingChanges(currentExtension.id, currentExtension.version, targetVersion);
        if (breakingChanges.hasBreakingChanges) {
            risks.push({
                type: 'breaking-changes',
                severity: breakingChanges.impactLevel,
                description: `${breakingChanges.changes.length} breaking changes detected`,
                mitigation: 'Review breaking changes and update extension code accordingly',
                probability: 'high'
            });
        }
        // Dependency conflicts risk
        risks.push({
            type: 'dependency-conflicts',
            severity: 'medium',
            description: 'Potential conflicts with existing dependencies',
            mitigation: 'Validate all dependencies before upgrade',
            probability: 'medium'
        });
        // Data loss risk
        if (this.requiresDataBackup(currentExtension, { version: targetVersion })) {
            risks.push({
                type: 'data-loss',
                severity: 'high',
                description: 'Potential data loss during upgrade',
                mitigation: 'Create comprehensive backup before upgrade',
                probability: 'low'
            });
        }
        return risks;
    }
    /**
     * Identify upgrade benefits
     */
    identifyUpgradeBenefits(currentExtension, targetVersion, context) {
        const benefits = [];
        const currentVer = new SemanticVersion(currentExtension.version);
        const targetVer = new SemanticVersion(targetVersion);
        // Version-based benefits
        if (targetVer.major > currentVer.major) {
            benefits.push({
                type: 'features',
                description: 'Major new features and improvements',
                impact: 'high'
            });
        }
        if (targetVer.minor > currentVer.minor) {
            benefits.push({
                type: 'features',
                description: 'New features and enhancements',
                impact: 'medium'
            });
        }
        if (targetVer.patch > currentVer.patch) {
            benefits.push({
                type: 'stability',
                description: 'Bug fixes and stability improvements',
                impact: 'low'
            });
        }
        // Always include security benefits
        benefits.push({
            type: 'security',
            description: 'Latest security updates and fixes',
            impact: 'high'
        });
        return benefits;
    }
    /**
     * Initialize default upgrade strategies
     */
    initializeDefaultStrategies() {
        this.upgradeStrategies.set('conservative', {
            type: 'conservative',
            name: 'Conservative',
            description: 'Prioritizes stability over new features',
            maxMajorVersionJump: 0,
            allowPrerelease: false,
            requiresManualApproval: false
        });
        this.upgradeStrategies.set('moderate', {
            type: 'moderate',
            name: 'Moderate',
            description: 'Balances stability and new features',
            maxMajorVersionJump: 1,
            allowPrerelease: false,
            requiresManualApproval: true
        });
        this.upgradeStrategies.set('aggressive', {
            type: 'aggressive',
            name: 'Aggressive',
            description: 'Prioritizes latest features over stability',
            maxMajorVersionJump: 999,
            allowPrerelease: true,
            requiresManualApproval: true
        });
    }
    /**
     * Helper methods
     */
    calculateImpactLevel(changes) {
        if (changes.length === 0)
            return 'low';
        const highImpactChanges = changes.filter(c => c.impact === 'high').length;
        if (highImpactChanges > 0)
            return 'high';
        if (changes.length > 3)
            return 'high';
        return 'medium';
    }
    checkDependencyConflicts(currentExtension, targetExtension, context) {
        const conflicts = [];
        // Implementation would check for actual conflicts
        return conflicts;
    }
    analyzePermissionChanges(currentExtension, targetExtension) {
        const changes = [];
        // Implementation would analyze permission differences
        return changes;
    }
    requiresRestart(currentExtension, targetExtension) {
        // Check if upgrade requires system restart
        return currentExtension.extension_type !== targetExtension.extension_type;
    }
    requiresDataBackup(currentExtension, targetExtension) {
        // Check if upgrade might affect data
        const currentVer = new SemanticVersion(currentExtension.version);
        const targetVer = new SemanticVersion(targetExtension.version);
        return targetVer.major > currentVer.major;
    }
    estimateUpgradeEffort(tasks, risks) {
        const totalTasks = tasks.length;
        const highRiskTasks = risks.filter(r => r.severity === 'high').length;
        if (totalTasks <= 3 && highRiskTasks === 0) {
            return { level: 'low', duration: '30 minutes', complexity: 'simple' };
        }
        if (totalTasks <= 6 && highRiskTasks <= 1) {
            return { level: 'medium', duration: '2 hours', complexity: 'moderate' };
        }
        return { level: 'high', duration: '1 day', complexity: 'complex' };
    }
    generateUpgradeTimeline(path, tasks) {
        return {
            phases: [
                { name: 'Preparation', duration: '15 minutes', tasks: tasks.filter(t => t.type === 'preparation') },
                { name: 'Validation', duration: '10 minutes', tasks: tasks.filter(t => t.type === 'validation') },
                { name: 'Migration', duration: '30 minutes', tasks: tasks.filter(t => t.type === 'migration') },
                { name: 'Verification', duration: '15 minutes', tasks: tasks.filter(t => t.type === 'verification') }
            ],
            totalDuration: path.estimatedDuration || '1 hour'
        };
    }
    generateMigrationPhases(analysis) {
        return [
            {
                name: 'Pre-upgrade',
                description: 'Prepare for upgrade',
                tasks: analysis.migrationTasks.filter(t => t.type === 'preparation'),
                duration: '15 minutes'
            },
            {
                name: 'Upgrade',
                description: 'Perform the upgrade',
                tasks: analysis.migrationTasks.filter(t => t.type === 'migration'),
                duration: '30 minutes'
            },
            {
                name: 'Post-upgrade',
                description: 'Verify upgrade success',
                tasks: analysis.migrationTasks.filter(t => t.type === 'verification'),
                duration: '15 minutes'
            }
        ];
    }
    generateRollbackPlan(currentExtension, targetVersion) {
        return {
            steps: [
                'Stop the upgraded extension',
                'Restore extension files from backup',
                'Restore extension data from backup',
                'Restart the extension',
                'Verify rollback success'
            ],
            estimatedDuration: '10 minutes',
            dataLossRisk: 'low'
        };
    }
    generateTestingPlan(currentExtension, targetVersion) {
        return {
            preUpgradeTests: [
                'Verify current functionality',
                'Test critical workflows',
                'Validate data integrity'
            ],
            postUpgradeTests: [
                'Verify upgrade success',
                'Test all functionality',
                'Validate data migration',
                'Check performance'
            ],
            rollbackTests: [
                'Verify rollback success',
                'Test restored functionality',
                'Validate data restoration'
            ]
        };
    }
    identifyPrerequisites(currentExtension, targetVersion, context) {
        const prerequisites = [];
        prerequisites.push('Ensure system meets minimum requirements');
        prerequisites.push('Verify all dependencies are available');
        prerequisites.push('Create backup of current extension');
        prerequisites.push('Review breaking changes documentation');
        return prerequisites;
    }
}
// Export singleton
export const extensionUpgradeAdvisor = ExtensionUpgradeAdvisor.getInstance();
