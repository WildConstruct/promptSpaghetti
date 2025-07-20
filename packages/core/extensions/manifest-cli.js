#!/usr/bin/env node

/**
 * Extension Manifest CLI - Epic 8.4 Story 8.4.3
 * Command-line interface for extension manifest operations
 */

const fs = require('fs');
const path = require('path');
const { ExtensionManifestParser } = require('./ExtensionManifest');
const { ExtensionManifestUtils, ManifestTemplateGenerator } = require('./ExtensionManifestUtils');

// CLI Commands
class ManifestCLI {
  constructor() {
    this.parser = ExtensionManifestParser.getInstance();
    this.commands = {
      create: this.createManifest.bind(this),
      validate: this.validateManifest.bind(this),
      convert: this.convertManifest.bind(this),
      merge: this.mergeManifests.bind(this),
      diff: this.diffManifests.bind(this),
      info: this.showManifestInfo.bind(this),
      template: this.generateTemplate.bind(this),
      wizard: this.runWizard.bind(this),
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
   * Create a new manifest
   */
  async createManifest(args) {
    const [outputPath, extensionType = 'node'] = args;
    
    if (!outputPath) {
      console.error('Usage: manifest-cli create <output-path> [extension-type]');
      return;
    }
    
    const template = ManifestTemplateGenerator.generateTemplate(extensionType);
    fs.writeFileSync(outputPath, template);
    
    console.log(`✅ Created ${extensionType} extension manifest at ${outputPath}`);
  }

  /**
   * Validate a manifest file
   */
  async validateManifest(args) {
    const [filePath] = args;
    
    if (!filePath) {
      console.error('Usage: manifest-cli validate <manifest-file>');
      return;
    }
    
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      return;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const result = this.parser.parseManifest(content);
    
    if (result.success) {
      console.log('✅ Manifest is valid');
      
      // Additional validation
      const dependencyValidation = ExtensionManifestUtils.validateManifestDependencies(result.data);
      if (dependencyValidation.warnings.length > 0) {
        console.log('\n⚠️  Warnings:');
        dependencyValidation.warnings.forEach(warning => {
          console.log(`  - ${warning}`);
        });
      }
    } else {
      console.log('❌ Manifest validation failed');
      console.log('\nErrors:');
      result.details?.forEach(detail => {
        console.log(`  - ${detail.path}: ${detail.message}`);
      });
    }
  }

  /**
   * Convert between manifest formats
   */
  async convertManifest(args) {
    const [inputPath, outputPath, format = 'manifest'] = args;
    
    if (!inputPath || !outputPath) {
      console.error('Usage: manifest-cli convert <input-file> <output-file> [format]');
      return;
    }
    
    if (!fs.existsSync(inputPath)) {
      console.error(`File not found: ${inputPath}`);
      return;
    }
    
    const content = fs.readFileSync(inputPath, 'utf8');
    const inputData = JSON.parse(content);
    
    let outputData;
    
    if (format === 'package') {
      // Convert manifest to package.json
      outputData = ExtensionManifestUtils.convertManifestToPackageJson(inputData);
    } else {
      // Convert package.json to manifest
      outputData = ExtensionManifestUtils.convertPackageJsonToManifest(inputData);
    }
    
    fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
    console.log(`✅ Converted ${inputPath} to ${outputPath} (${format} format)`);
  }

  /**
   * Merge two manifests
   */
  async mergeManifests(args) {
    const [basePath, overridePath, outputPath] = args;
    
    if (!basePath || !overridePath || !outputPath) {
      console.error('Usage: manifest-cli merge <base-manifest> <override-manifest> <output-file>');
      return;
    }
    
    if (!fs.existsSync(basePath) || !fs.existsSync(overridePath)) {
      console.error('One or more input files not found');
      return;
    }
    
    const baseContent = fs.readFileSync(basePath, 'utf8');
    const overrideContent = fs.readFileSync(overridePath, 'utf8');
    
    const baseManifest = JSON.parse(baseContent);
    const overrideManifest = JSON.parse(overrideContent);
    
    const merged = ExtensionManifestUtils.mergeManifests(baseManifest, overrideManifest);
    
    fs.writeFileSync(outputPath, JSON.stringify(merged, null, 2));
    console.log(`✅ Merged manifests to ${outputPath}`);
  }

  /**
   * Show diff between two manifests
   */
  async diffManifests(args) {
    const [oldPath, newPath] = args;
    
    if (!oldPath || !newPath) {
      console.error('Usage: manifest-cli diff <old-manifest> <new-manifest>');
      return;
    }
    
    if (!fs.existsSync(oldPath) || !fs.existsSync(newPath)) {
      console.error('One or more input files not found');
      return;
    }
    
    const oldContent = fs.readFileSync(oldPath, 'utf8');
    const newContent = fs.readFileSync(newPath, 'utf8');
    
    const oldManifest = JSON.parse(oldContent);
    const newManifest = JSON.parse(newContent);
    
    const diff = ExtensionManifestUtils.generateManifestDiff(oldManifest, newManifest);
    console.log(diff);
  }

  /**
   * Show manifest information
   */
  async showManifestInfo(args) {
    const [filePath] = args;
    
    if (!filePath) {
      console.error('Usage: manifest-cli info <manifest-file>');
      return;
    }
    
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      return;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const manifest = JSON.parse(content);
    
    const metadata = ExtensionManifestUtils.extractMetadata(manifest);
    const sizeInfo = ExtensionManifestUtils.getManifestSize(manifest);
    
    console.log('\n📋 Manifest Information');
    console.log('========================');
    console.log(`ID: ${metadata.id}`);
    console.log(`Name: ${metadata.name}`);
    console.log(`Version: ${metadata.version}`);
    console.log(`Type: ${metadata.type}`);
    console.log(`Author: ${metadata.author}`);
    console.log(`Description: ${metadata.description}`);
    console.log(`License: ${metadata.license}`);
    console.log(`Keywords: ${metadata.keywords.join(', ')}`);
    console.log(`Categories: ${metadata.categories.join(', ')}`);
    console.log('\n📊 Statistics');
    console.log('=============');
    console.log(`Dependencies: ${metadata.dependencyCount}`);
    console.log(`Permissions: ${metadata.permissionCount}`);
    console.log(`Has UI: ${metadata.hasUI ? 'Yes' : 'No'}`);
    console.log(`Has Runtime: ${metadata.hasRuntime ? 'Yes' : 'No'}`);
    console.log(`Has Security: ${metadata.hasSecurity ? 'Yes' : 'No'}`);
    console.log('\n📏 Size');
    console.log('=======');
    console.log(`Raw: ${sizeInfo.raw} bytes`);
    console.log(`Compressed: ${sizeInfo.compressed} bytes`);
    console.log(`Compression Ratio: ${(sizeInfo.compressionRatio * 100).toFixed(1)}%`);
    console.log(`Field Count: ${sizeInfo.fieldCount}`);
  }

  /**
   * Generate manifest template
   */
  async generateTemplate(args) {
    const [extensionType = 'node', outputPath] = args;
    
    const template = ManifestTemplateGenerator.generateTemplate(extensionType);
    
    if (outputPath) {
      fs.writeFileSync(outputPath, template);
      console.log(`✅ Generated ${extensionType} template at ${outputPath}`);
    } else {
      console.log(template);
    }
  }

  /**
   * Run interactive wizard
   */
  async runWizard(args) {
    const [outputPath = 'manifest.json'] = args;
    
    console.log('🧙 Extension Manifest Wizard');
    console.log('============================\n');
    
    const questions = ManifestTemplateGenerator.generateWizardQuestions();
    const answers = {};
    
    // Simulate interactive input (in real implementation, use readline)
    for (const question of questions) {
      const defaultValue = question.default || '';
      console.log(`${question.prompt} ${defaultValue ? `(${defaultValue})` : ''}`);
      
      // For demo purposes, use default values
      if (question.key === 'id') answers[question.key] = 'my-extension';
      else if (question.key === 'name') answers[question.key] = 'My Extension';
      else if (question.key === 'description') answers[question.key] = 'My custom extension';
      else if (question.key === 'extensionType') answers[question.key] = 'node';
      else if (question.key === 'authorName') answers[question.key] = 'Developer';
      else if (question.key === 'authorEmail') answers[question.key] = 'dev@example.com';
      else if (question.key === 'license') answers[question.key] = 'MIT';
      else if (question.key === 'permissions') answers[question.key] = [];
      else answers[question.key] = defaultValue;
    }
    
    // Generate manifest from answers
    const manifest = {
      manifest_version: '1.0',
      id: answers.id,
      name: answers.name,
      version: answers.version || '1.0.0',
      description: answers.description,
      author: {
        name: answers.authorName,
        email: answers.authorEmail
      },
      extension_type: answers.extensionType,
      main: 'index.js',
      dependencies: {
        system: '1.0.0'
      },
      permissions: answers.permissions || [],
      metadata: {
        license: answers.license
      }
    };
    
    fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2));
    console.log(`\n✅ Created manifest at ${outputPath}`);
  }

  /**
   * Show help information
   */
  showHelp() {
    console.log(`
🔧 Extension Manifest CLI
=========================

Usage: manifest-cli <command> [options]

Commands:
  create <output-path> [type]       Create a new manifest template
  validate <manifest-file>          Validate a manifest file
  convert <input> <output> [format] Convert between manifest formats
  merge <base> <override> <output>  Merge two manifests
  diff <old-manifest> <new-manifest> Show differences between manifests
  info <manifest-file>              Show manifest information
  template [type] [output]          Generate manifest template
  wizard [output]                   Run interactive manifest wizard
  help                              Show this help message

Extension Types:
  node        Node/runtime extension
  ui          User interface extension
  transform   Data transformation extension
  storage     Storage provider extension

Examples:
  manifest-cli create ./manifest.json node
  manifest-cli validate ./manifest.json
  manifest-cli convert ./package.json ./manifest.json manifest
  manifest-cli info ./manifest.json
  manifest-cli template ui ./ui-template.json
  manifest-cli wizard ./my-manifest.json
`);
  }
}

// Run CLI if called directly
if (require.main === module) {
  const cli = new ManifestCLI();
  cli.run(process.argv.slice(2));
}

module.exports = ManifestCLI;
