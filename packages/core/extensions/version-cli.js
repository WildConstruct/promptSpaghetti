#!/usr/bin/env node

/**
 * Extension Version CLI - Epic 8.4 Story 8.4.4
 * Command-line interface for extension version management and compatibility checking
 */

const fs = require('fs');
const path = require('path');
const { SemanticVersion, VersionRange, extensionVersionManager } = require('./ExtensionVersionManager');
const { extensionCompatibilityChecker } = require('./ExtensionCompatibilityChecker');
const { extensionUpgradeAdvisor } = require('./ExtensionUpgradeAdvisor');

// Version CLI
class VersionCLI {
  constructor() {
    this.commands = {
      check: this.checkCompatibility.bind(this),
      upgrade: this.getUpgradeRecommendations.bind(this),
      analyze: this.analyzeUpgradePath.bind(this),
      compare: this.compareVersions.bind(this),
      validate: this.validateVersion.bind(this),
      range: this.testVersionRange.bind(this),
      next: this.getNextVersion.bind(this),
      breaking: this.checkBreakingChanges.bind(this),
      plan: this.generateMigrationPlan.bind(this),
      help: this.showHelp.bind(this)
    };
  }

  /**
   * Main CLI entry point
   */
  async run(args) {
    const [command, ...commandArgs] = args;
    
    if (!command || !this.commands[command]) {
      this.showHelp();
      return;
    }
    
    try {
      await this.commands[command](commandArgs);
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  }

  /**
   * Check extension compatibility
   */
  async checkCompatibility(args) {
    const [manifestPath, systemVersion = '1.0.0', platform = 'web'] = args;
    
    if (!manifestPath) {
      console.error('Usage: version-cli check <manifest-file> [system-version] [platform]');
      return;
    }
    
    if (!fs.existsSync(manifestPath)) {
      console.error(`Manifest file not found: ${manifestPath}`);
      return;
    }
    
    const manifestContent = fs.readFileSync(manifestPath, 'utf8');
    const manifest = JSON.parse(manifestContent);
    
    const result = extensionCompatibilityChecker.checkExtensionCompatibility(manifest, {
      systemVersion,
      platform,
      availableExtensions: new Map(),
      grantedPermissions: ['file-system-read', 'ui-components']
    });
    
    console.log(`\n🔍 Compatibility Check for ${manifest.name}`);
    console.log('='.repeat(50));
    console.log(`Status: ${result.compatible ? '✅ Compatible' : '❌ Incompatible'}`);
    
    if (result.issues.length > 0) {
      console.log('\n⚠️ Issues:');
      result.issues.forEach(issue => {
        console.log(`  ${issue.severity === 'error' ? '❌' : '⚠️'} ${issue.message}`);
      });
    }
    
    if (result.warnings.length > 0) {
      console.log('\n📝 Warnings:');
      result.warnings.forEach(warning => {
        console.log(`  ⚠️ ${warning}`);
      });
    }
    
    if (result.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      result.recommendations.forEach(rec => {
        console.log(`  • ${rec}`);
      });
    }
  }

  /**
   * Get upgrade recommendations
   */
  async getUpgradeRecommendations(args) {
    const [manifestPath, ...availableVersions] = args;
    
    if (!manifestPath || availableVersions.length === 0) {
      console.error('Usage: version-cli upgrade <manifest-file> <available-version1> [available-version2] ...');
      return;
    }
    
    if (!fs.existsSync(manifestPath)) {
      console.error(`Manifest file not found: ${manifestPath}`);
      return;
    }
    
    const manifestContent = fs.readFileSync(manifestPath, 'utf8');
    const manifest = JSON.parse(manifestContent);
    
    const recommendations = extensionUpgradeAdvisor.getUpgradeRecommendations(
      manifest,
      availableVersions,
      {
        systemVersion: '1.0.0',
        platform: 'web',
        availableExtensions: new Map(),
        grantedPermissions: [],
        stabilityPriority: true
      }
    );
    
    console.log(`\n⬆️ Upgrade Recommendations for ${manifest.name}`);
    console.log('='.repeat(50));
    console.log(`Current Version: ${recommendations.currentVersion}`);
    console.log(`Strategy: ${recommendations.strategy}`);
    
    if (!recommendations.hasUpdates) {
      console.log('\nℹ️ No updates available');
      return;
    }
    
    console.log('\nAvailable Updates:');
    recommendations.recommendations.forEach(rec => {
      const priorityIcon = rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢';
      const riskIcon = rec.risk === 'high' ? '⚠️' : rec.risk === 'medium' ? '🟡' : '✅';
      
      console.log(`\n${priorityIcon} Version ${rec.version}`);
      console.log(`   Priority: ${rec.priority}`);
      console.log(`   Risk: ${rec.risk} ${riskIcon}`);
      console.log(`   Effort: ${rec.effort}`);
      console.log(`   Reason: ${rec.reason}`);
      console.log(`   Benefits: ${rec.benefits.join(', ')}`);
    });
  }

  /**
   * Analyze upgrade path
   */
  async analyzeUpgradePath(args) {
    const [manifestPath, targetVersion, ...availableVersions] = args;
    
    if (!manifestPath || !targetVersion) {
      console.error('Usage: version-cli analyze <manifest-file> <target-version> [available-version1] ...');
      return;
    }
    
    if (!fs.existsSync(manifestPath)) {
      console.error(`Manifest file not found: ${manifestPath}`);
      return;
    }
    
    const manifestContent = fs.readFileSync(manifestPath, 'utf8');
    const manifest = JSON.parse(manifestContent);
    
    const allVersions = [targetVersion, ...availableVersions];
    const analysis = extensionUpgradeAdvisor.analyzeUpgradePath(
      manifest,
      targetVersion,
      allVersions,
      {
        systemVersion: '1.0.0',
        platform: 'web',
        availableExtensions: new Map(),
        grantedPermissions: []
      }
    );
    
    console.log('\n🔍 Upgrade Path Analysis');
    console.log('='.repeat(50));
    console.log(`From: ${manifest.version}`);
    console.log(`To: ${targetVersion}`);
    console.log(`Feasible: ${analysis.feasible ? '✅ Yes' : '❌ No'}`);
    
    if (!analysis.feasible) {
      console.log(`Reason: ${analysis.reason}`);
      return;
    }
    
    console.log('\nUpgrade Path:');
    analysis.path.steps.forEach((step, index) => {
      const riskIcon = step.risk === 'high' ? '🔴' : step.risk === 'medium' ? '🟡' : '🟢';
      console.log(`  ${index + 1}. ${step.fromVersion} → ${step.toVersion} (${step.type}) ${riskIcon}`);
      
      if (step.breakingChanges) {
        console.log('     ⚠️ Breaking changes detected');
      }
      
      if (step.recommendedActions.length > 0) {
        console.log(`     Actions: ${step.recommendedActions.join(', ')}`);
      }
    });
    
    console.log(`\nOverall Risk: ${analysis.path.totalRisk}`);
    console.log(`Estimated Duration: ${analysis.path.estimatedDuration}`);
    
    if (analysis.risks.length > 0) {
      console.log('\n⚠️ Risks:');
      analysis.risks.forEach(risk => {
        console.log(`  • ${risk.description} (${risk.severity})`);
        console.log(`    Mitigation: ${risk.mitigation}`);
      });
    }
    
    if (analysis.benefits.length > 0) {
      console.log('\n🎆 Benefits:');
      analysis.benefits.forEach(benefit => {
        console.log(`  • ${benefit.description} (${benefit.impact} impact)`);
      });
    }
  }

  /**
   * Compare two versions
   */
  async compareVersions(args) {
    const [version1, version2] = args;
    
    if (!version1 || !version2) {
      console.error('Usage: version-cli compare <version1> <version2>');
      return;
    }
    
    try {
      const v1 = new SemanticVersion(version1);
      const v2 = new SemanticVersion(version2);
      
      const comparison = v1.compareTo(v2);
      let result;
      
      if (comparison > 0) {
        result = `${version1} > ${version2}`;
      } else if (comparison < 0) {
        result = `${version1} < ${version2}`;
      } else {
        result = `${version1} = ${version2}`;
      }
      
      console.log('\n🔄 Version Comparison');
      console.log('='.repeat(30));
      console.log(`Result: ${result}`);
      console.log(`\nVersion 1: ${version1}`);
      console.log(`  Major: ${v1.major}, Minor: ${v1.minor}, Patch: ${v1.patch}`);
      console.log(`  Prerelease: ${v1.prerelease.join('.') || 'none'}`);
      console.log(`  Stable: ${v1.isStable() ? 'Yes' : 'No'}`);
      
      console.log(`\nVersion 2: ${version2}`);
      console.log(`  Major: ${v2.major}, Minor: ${v2.minor}, Patch: ${v2.patch}`);
      console.log(`  Prerelease: ${v2.prerelease.join('.') || 'none'}`);
      console.log(`  Stable: ${v2.isStable() ? 'Yes' : 'No'}`);
      
    } catch (error) {
      console.error(`Invalid version format: ${error.message}`);
    }
  }

  /**
   * Validate version format
   */
  async validateVersion(args) {
    const [version] = args;
    
    if (!version) {
      console.error('Usage: version-cli validate <version>');
      return;
    }
    
    try {
      const v = new SemanticVersion(version);
      
      console.log('\n✅ Valid Semantic Version');
      console.log('='.repeat(30));
      console.log(`Version: ${version}`);
      console.log(`Major: ${v.major}`);
      console.log(`Minor: ${v.minor}`);
      console.log(`Patch: ${v.patch}`);
      console.log(`Prerelease: ${v.prerelease.join('.') || 'none'}`);
      console.log(`Build: ${v.build.join('.') || 'none'}`);
      console.log(`Stable: ${v.isStable() ? 'Yes' : 'No'}`);
      
    } catch (error) {
      console.log('\n❌ Invalid Semantic Version');
      console.log('='.repeat(30));
      console.log(`Version: ${version}`);
      console.log(`Error: ${error.message}`);
    }
  }

  /**
   * Test version range
   */
  async testVersionRange(args) {
    const [range, ...versions] = args;
    
    if (!range || versions.length === 0) {
      console.error('Usage: version-cli range <range> <version1> [version2] ...');
      return;
    }
    
    try {
      const versionRange = VersionRange.parse(range);
      
      console.log('\n🎯 Version Range Test');
      console.log('='.repeat(30));
      console.log(`Range: ${range}`);
      console.log();
      
      versions.forEach(version => {
        try {
          const v = new SemanticVersion(version);
          const satisfies = versionRange.satisfies(v);
          const icon = satisfies ? '✅' : '❌';
          console.log(`${icon} ${version} ${satisfies ? 'satisfies' : 'does not satisfy'} ${range}`);
        } catch (error) {
          console.log(`❌ ${version} - Invalid version format`);
        }
      });
      
    } catch (error) {
      console.error(`Invalid version range: ${error.message}`);
    }
  }

  /**
   * Get next version
   */
  async getNextVersion(args) {
    const [currentVersion, releaseType = 'patch'] = args;
    
    if (!currentVersion) {
      console.error('Usage: version-cli next <current-version> [release-type]');
      console.error('Release types: major, minor, patch, prerelease');
      return;
    }
    
    const validTypes = ['major', 'minor', 'patch', 'prerelease'];
    if (!validTypes.includes(releaseType)) {
      console.error(`Invalid release type: ${releaseType}`);
      console.error(`Valid types: ${validTypes.join(', ')}`);
      return;
    }
    
    try {
      const v = new SemanticVersion(currentVersion);
      const nextVersion = v.getNextVersion(releaseType);
      
      console.log('\n⬆️ Next Version');
      console.log('='.repeat(20));
      console.log(`Current: ${currentVersion}`);
      console.log(`Type: ${releaseType}`);
      console.log(`Next: ${nextVersion.toString()}`);
      
    } catch (error) {
      console.error(`Error: ${error.message}`);
    }
  }

  /**
   * Check breaking changes
   */
  async checkBreakingChanges(args) {
    const [extensionId, fromVersion, toVersion] = args;
    
    if (!extensionId || !fromVersion || !toVersion) {
      console.error('Usage: version-cli breaking <extension-id> <from-version> <to-version>');
      return;
    }
    
    const analysis = extensionUpgradeAdvisor.checkBreakingChanges(extensionId, fromVersion, toVersion);
    
    console.log('\n⚠️ Breaking Changes Analysis');
    console.log('='.repeat(40));
    console.log(`Extension: ${extensionId}`);
    console.log(`From: ${fromVersion}`);
    console.log(`To: ${toVersion}`);
    console.log(`Has Breaking Changes: ${analysis.hasBreakingChanges ? 'Yes' : 'No'}`);
    
    if (analysis.hasBreakingChanges) {
      console.log(`Impact Level: ${analysis.impactLevel}`);
      console.log(`Migration Required: ${analysis.migrationRequired ? 'Yes' : 'No'}`);
      console.log(`Automated Migration: ${analysis.automatedMigration ? 'Yes' : 'No'}`);
      
      console.log('\nChanges:');
      analysis.changes.forEach((change, index) => {
        console.log(`  ${index + 1}. ${change.description} (${change.type})`);
        console.log(`     Impact: ${change.impact}`);
        console.log(`     Migration Required: ${change.migrationRequired ? 'Yes' : 'No'}`);
        if (change.migrationGuide) {
          console.log(`     Guide: ${change.migrationGuide}`);
        }
      });
    } else {
      console.log('\n✅ No breaking changes detected');
    }
  }

  /**
   * Generate migration plan
   */
  async generateMigrationPlan(args) {
    const [manifestPath, targetVersion] = args;
    
    if (!manifestPath || !targetVersion) {
      console.error('Usage: version-cli plan <manifest-file> <target-version>');
      return;
    }
    
    if (!fs.existsSync(manifestPath)) {
      console.error(`Manifest file not found: ${manifestPath}`);
      return;
    }
    
    const manifestContent = fs.readFileSync(manifestPath, 'utf8');
    const manifest = JSON.parse(manifestContent);
    
    const plan = extensionUpgradeAdvisor.generateMigrationPlan(
      manifest,
      targetVersion,
      {
        systemVersion: '1.0.0',
        platform: 'web',
        availableExtensions: new Map(),
        grantedPermissions: []
      }
    );
    
    console.log('\n📅 Migration Plan');
    console.log('='.repeat(30));
    console.log(`Extension: ${manifest.name}`);
    console.log(`From: ${manifest.version}`);
    console.log(`To: ${targetVersion}`);
    console.log(`Viable: ${plan.viable ? 'Yes' : 'No'}`);
    
    if (!plan.viable) {
      console.log(`Reason: ${plan.reason}`);
      return;
    }
    
    console.log(`Risk Level: ${plan.riskLevel}`);
    console.log(`Estimated Duration: ${plan.estimatedDuration}`);
    
    if (plan.prerequisites && plan.prerequisites.length > 0) {
      console.log('\n📋 Prerequisites:');
      plan.prerequisites.forEach(prereq => {
        console.log(`  • ${prereq}`);
      });
    }
    
    console.log('\n📆 Migration Phases:');
    plan.phases.forEach((phase, index) => {
      console.log(`\n${index + 1}. ${phase.name} (${phase.duration})`);
      console.log(`   ${phase.description}`);
      
      if (phase.tasks.length > 0) {
        console.log('   Tasks:');
        phase.tasks.forEach(task => {
          const icon = task.automated ? '🤖' : '👤';
          const required = task.required ? ' (Required)' : '';
          console.log(`     ${icon} ${task.title}${required}`);
          console.log(`        ${task.description}`);
        });
      }
    });
    
    if (plan.rollbackPlan) {
      console.log('\n↩️ Rollback Plan:');
      console.log(`Duration: ${plan.rollbackPlan.estimatedDuration}`);
      console.log(`Data Loss Risk: ${plan.rollbackPlan.dataLossRisk}`);
      console.log('Steps:');
      plan.rollbackPlan.steps.forEach((step, index) => {
        console.log(`  ${index + 1}. ${step}`);
      });
    }
  }

  /**
   * Show help information
   */
  showHelp() {
    console.log(`
📈 Extension Version CLI
========================

Usage: version-cli <command> [options]

Commands:
  check <manifest> [system-ver] [platform]     Check extension compatibility
  upgrade <manifest> <version1> [version2]...  Get upgrade recommendations
  analyze <manifest> <target> [versions]...    Analyze upgrade path
  compare <version1> <version2>                Compare two versions
  validate <version>                           Validate version format
  range <range> <version1> [version2]...       Test version range
  next <version> [type]                        Get next version
  breaking <ext-id> <from> <to>                Check breaking changes
  plan <manifest> <target>                     Generate migration plan
  help                                         Show this help message

Release Types:
  major       Breaking changes (1.0.0 -> 2.0.0)
  minor       New features (1.0.0 -> 1.1.0)
  patch       Bug fixes (1.0.0 -> 1.0.1)
  prerelease  Pre-release (1.0.0 -> 1.0.1-alpha.0)

Version Ranges:
  1.2.3       Exact version
  >=1.2.3     Greater than or equal
  <2.0.0      Less than
  ~1.2.3      Compatible within same minor (~1.2.3 := >=1.2.3 <1.3.0)
  ^1.2.3      Compatible within same major (^1.2.3 := >=1.2.3 <2.0.0)
  1.2.x       Any patch version
  *           Any version

Examples:
  version-cli check ./manifest.json 1.0.0 web
  version-cli upgrade ./manifest.json 1.1.0 1.2.0 2.0.0
  version-cli analyze ./manifest.json 2.0.0 1.1.0 1.2.0 2.0.0
  version-cli compare 1.2.3 1.3.0
  version-cli validate 1.2.3-alpha.1
  version-cli range "^1.2.0" 1.2.5 1.3.0 2.0.0
  version-cli next 1.2.3 minor
  version-cli plan ./manifest.json 2.0.0
`);
  }
}

// Run CLI if called directly
if (require.main === module) {
  const cli = new VersionCLI();
  cli.run(process.argv.slice(2));
}

module.exports = VersionCLI;
