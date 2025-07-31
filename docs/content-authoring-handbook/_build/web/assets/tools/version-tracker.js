#!/usr/bin/env node

/**
 * Version Tracker - Content Authoring Handbook
 * Epic 8.3 Story 8.3.5 - Version Control and Updates
 *
 * Tracks content changes, generates changelogs, and manages version metadata
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');

class VersionTracker {
  constructor() {
    this.rootDir = path.join(__dirname, '../..');
    this.versionFile = path.join(this.rootDir, 'VERSION');
    this.changelogFile = path.join(this.rootDir, 'CHANGELOG.md');
    this.metadataFile = path.join(this.rootDir, 'assets/data/version-metadata.json');

    this.initializeMetadata();
  }

  /**
   * Initialize version metadata file
   */
  initializeMetadata() {
    if (!fs.existsSync(this.metadataFile)) {
      const metadata = {
        version: this.getCurrentVersion(),
        lastUpdated: new Date().toISOString(),
        contentHash: this.generateContentHash(),
        buildNumber: 1,
        contributors: [],
        recentChanges: [],
      };

      this.ensureDirectoryExists(path.dirname(this.metadataFile));
      fs.writeFileSync(this.metadataFile, JSON.stringify(metadata, null, 2));
    }
  }

  /**
   * Get current version from VERSION file
   */
  getCurrentVersion() {
    try {
      return fs.readFileSync(this.versionFile, 'utf8').trim();
    } catch (error) {
      return '1.0.0';
    }
  }

  /**
   * Update version number
   */
  updateVersion(type = 'patch') {
    const currentVersion = this.getCurrentVersion();
    const [major, minor, patch] = currentVersion.split('.').map(Number);

    let newVersion;
    switch (type) {
      case 'major':
        newVersion = `${major + 1}.0.0`;
        break;
      case 'minor':
        newVersion = `${major}.${minor + 1}.0`;
        break;
      case 'patch':
      default:
        newVersion = `${major}.${minor}.${patch + 1}`;
        break;
    }

    fs.writeFileSync(this.versionFile, newVersion);
    this.updateMetadata({ version: newVersion });

    console.log(`Version updated from ${currentVersion} to ${newVersion}`);
    return newVersion;
  }

  /**
   * Generate content hash for change detection
   */
  generateContentHash() {
    const contentDirs = [
      'part1-foundation',
      'part2-content-development',
      'part3-engine-reference',
      'part4-practical-guides',
      'part5-advanced-topics',
      'part6-reference-materials',
    ];

    let combinedContent = '';

    contentDirs.forEach(dir => {
      const dirPath = path.join(this.rootDir, dir);
      if (fs.existsSync(dirPath)) {
        const files = this.getMarkdownFiles(dirPath);
        files.forEach(file => {
          const content = fs.readFileSync(file, 'utf8');
          combinedContent += content;
        });
      }
    });

    return crypto.createHash('sha256').update(combinedContent).digest('hex');
  }

  /**
   * Get all markdown files in directory recursively
   */
  getMarkdownFiles(dir) {
    const files = [];
    const items = fs.readdirSync(dir);

    items.forEach(item => {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);

      if (stat.isDirectory()) {
        files.push(...this.getMarkdownFiles(itemPath));
      } else if (item.endsWith('.md')) {
        files.push(itemPath);
      }
    });

    return files;
  }

  /**
   * Track content changes
   */
  trackChanges(filePath, changeDescription) {
    const metadata = this.getMetadata();
    const newHash = this.generateContentHash();

    if (metadata.contentHash !== newHash) {
      const change = {
        file: path.relative(this.rootDir, filePath),
        description: changeDescription,
        timestamp: new Date().toISOString(),
        author: this.getGitAuthor(),
        hash: newHash.substring(0, 8),
      };

      metadata.recentChanges.unshift(change);
      metadata.recentChanges = metadata.recentChanges.slice(0, 50); // Keep last 50 changes
      metadata.contentHash = newHash;
      metadata.lastUpdated = new Date().toISOString();

      this.updateMetadata(metadata);
      console.log(`Tracked change: ${change.file} - ${change.description}`);

      return change;
    }

    return null;
  }

  /**
   * Get Git author information
   */
  getGitAuthor() {
    try {
      const name = execSync('git config user.name', { encoding: 'utf8' }).trim();
      const email = execSync('git config user.email', { encoding: 'utf8' }).trim();
      return `${name} <${email}>`;
    } catch (error) {
      return 'Unknown Author';
    }
  }

  /**
   * Get version metadata
   */
  getMetadata() {
    try {
      return JSON.parse(fs.readFileSync(this.metadataFile, 'utf8'));
    } catch (error) {
      this.initializeMetadata();
      return JSON.parse(fs.readFileSync(this.metadataFile, 'utf8'));
    }
  }

  /**
   * Update version metadata
   */
  updateMetadata(updates) {
    const metadata = this.getMetadata();
    const updatedMetadata = { ...metadata, ...updates };

    fs.writeFileSync(this.metadataFile, JSON.stringify(updatedMetadata, null, 2));
  }

  /**
   * Add contributor to metadata
   */
  addContributor(contributor) {
    const metadata = this.getMetadata();

    if (!metadata.contributors.includes(contributor)) {
      metadata.contributors.push(contributor);
      this.updateMetadata(metadata);
      console.log(`Added contributor: ${contributor}`);
    }
  }

  /**
   * Generate changelog entry
   */
  generateChangelogEntry(version, changes) {
    const date = new Date().toISOString().split('T')[0];

    let entry = `## [${version}] - ${date}\n\n`;

    const changesByType = {
      Added: [],
      Changed: [],
      Fixed: [],
      Removed: [],
    };

    changes.forEach(change => {
      const type = this.categorizeChange(change.description);
      changesByType[type].push(change);
    });

    Object.entries(changesByType).forEach(([type, typeChanges]) => {
      if (typeChanges.length > 0) {
        entry += `### ${type}\n`;
        typeChanges.forEach(change => {
          entry += `- ${change.description} (${change.file})\n`;
        });
        entry += '\n';
      }
    });

    return entry;
  }

  /**
   * Categorize change based on description
   */
  categorizeChange(description) {
    const desc = description.toLowerCase();

    if (desc.includes('add') || desc.includes('new') || desc.includes('create')) {
      return 'Added';
    } else if (desc.includes('fix') || desc.includes('bug') || desc.includes('error')) {
      return 'Fixed';
    } else if (desc.includes('remove') || desc.includes('delete')) {
      return 'Removed';
    } else {
      return 'Changed';
    }
  }

  /**
   * Update changelog with recent changes
   */
  updateChangelog() {
    const metadata = this.getMetadata();
    const recentChanges = metadata.recentChanges.slice(0, 10);

    if (recentChanges.length === 0) {
      console.log('No recent changes to add to changelog');
      return;
    }

    const version = metadata.version;
    const newEntry = this.generateChangelogEntry(version, recentChanges);

    // Read existing changelog
    let changelog = '';
    if (fs.existsSync(this.changelogFile)) {
      changelog = fs.readFileSync(this.changelogFile, 'utf8');
    }

    // Insert new entry after [Unreleased] section
    const unreleasedIndex = changelog.indexOf('## [Unreleased]');
    if (unreleasedIndex !== -1) {
      const afterUnreleased = changelog.indexOf('\n## [', unreleasedIndex + 1);
      if (afterUnreleased !== -1) {
        changelog = changelog.slice(0, afterUnreleased) + '\n' + newEntry + changelog.slice(afterUnreleased);
      } else {
        changelog += '\n' + newEntry;
      }
    } else {
      changelog = newEntry + '\n' + changelog;
    }

    fs.writeFileSync(this.changelogFile, changelog);
    console.log(`Updated changelog with ${recentChanges.length} changes`);
  }

  /**
   * Generate version info for builds
   */
  generateVersionInfo() {
    const metadata = this.getMetadata();

    return {
      version: metadata.version,
      buildNumber: metadata.buildNumber,
      buildDate: new Date().toISOString(),
      contentHash: metadata.contentHash,
      lastUpdated: metadata.lastUpdated,
      contributors: metadata.contributors.length,
    };
  }

  /**
   * Increment build number
   */
  incrementBuildNumber() {
    const metadata = this.getMetadata();
    metadata.buildNumber = (metadata.buildNumber || 0) + 1;
    this.updateMetadata(metadata);

    console.log(`Build number incremented to ${metadata.buildNumber}`);
    return metadata.buildNumber;
  }

  /**
   * Ensure directory exists
   */
  ensureDirectoryExists(dir) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  /**
   * Get recent changes for notifications
   */
  getRecentChanges(limit = 10) {
    const metadata = this.getMetadata();
    return metadata.recentChanges.slice(0, limit);
  }

  /**
   * Check if content has changed since last build
   */
  hasContentChanged() {
    const metadata = this.getMetadata();
    const currentHash = this.generateContentHash();

    return metadata.contentHash !== currentHash;
  }
}

// CLI interface
if (require.main === module) {
  const tracker = new VersionTracker();
  const command = process.argv[2];

  switch (command) {
    case 'version':
      console.log(tracker.getCurrentVersion());
      break;

    case 'update':
      const type = process.argv[3] || 'patch';
      tracker.updateVersion(type);
      break;

    case 'track':
      const filePath = process.argv[3];
      const description = process.argv[4];
      if (filePath && description) {
        tracker.trackChanges(filePath, description);
      } else {
        console.log('Usage: node version-tracker.js track <file> <description>');
      }
      break;

    case 'changelog':
      tracker.updateChangelog();
      break;

    case 'build':
      const buildNumber = tracker.incrementBuildNumber();
      const versionInfo = tracker.generateVersionInfo();
      console.log(JSON.stringify(versionInfo, null, 2));
      break;

    case 'check':
      const hasChanged = tracker.hasContentChanged();
      console.log(hasChanged ? 'Content has changed' : 'No changes detected');
      process.exit(hasChanged ? 1 : 0);
      break;

    default:
      console.log('Usage: node version-tracker.js <command>');
      console.log('Commands:');
      console.log('  version              - Show current version');
      console.log('  update [type]        - Update version (patch/minor/major)');
      console.log('  track <file> <desc>  - Track content change');
      console.log('  changelog            - Update changelog');
      console.log('  build                - Increment build number and show version info');
      console.log('  check                - Check if content has changed');
      break;
  }
}

module.exports = VersionTracker;
