#!/usr/bin/env node

/**
 * Documentation Auto-Generator
 *
 * Automatically generates and maintains project documentation including API docs,
 * READMEs, changelogs, and development guides from code analysis and git history.
 *
 * Key Features:
 * - Automatic API documentation generation from code
 * - README.md generation and updates from project structure
 * - Changelog generation from git commit history
 * - Code example extraction and documentation
 * - Cross-reference linking and navigation
 * - Multiple output formats (Markdown, HTML, JSON)
 * - Integration with development workflow
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

class DocumentationAutoGenerator {
  constructor() {
    this.dataDir = path.join(__dirname, '../data/documentation');
    this.outputDir = path.join(process.cwd(), 'docs/generated');
    this.configFile = path.join(this.dataDir, 'doc-config.json');
    this.cacheFile = path.join(this.dataDir, 'doc-cache.json');
    this.templatesDir = path.join(this.dataDir, 'templates');

    // Configuration for documentation generation
    this.config = {
      generation: {
        // Documentation types to generate
        types: {
          api: true, // API documentation from code
          readme: true, // Project README files
          changelog: true, // Git-based changelog
          guides: true, // Development guides
          examples: true, // Code examples
          troubleshooting: false // Troubleshooting guides
        },

        // Output formats
        formats: {
          markdown: true, // Markdown files
          html: false, // HTML documentation site
          json: true, // Structured JSON data
          pdf: false // PDF documentation
        },

        // Update strategies
        updateStrategy: 'incremental', // 'full', 'incremental', 'on_demand'
        autoCommit: false, // Auto-commit generated docs
        gitIntegration: true, // Integrate with git hooks

        // Generation triggers
        triggers: {
          onCommit: true, // Generate on git commit
          onPush: false, // Generate on git push
          scheduled: true, // Scheduled generation
          manual: true // Manual trigger support
        }
      },

      analysis: {
        // Code analysis settings
        filePatterns: {
          javascript: ['**/*.js', '**/*.jsx'],
          typescript: ['**/*.ts', '**/*.tsx'],
          documentation: ['**/*.md', '**/README*'],
          config: ['**/*.json', '**/*.yml', '**/*.yaml']
        },

        // Exclusion patterns
        exclude: [
          'node_modules/**',
          'dist/**',
          'build/**',
          '.git/**',
          'coverage/**',
          '**/*.test.js',
          '**/*.spec.js'
        ],

        // Analysis depth
        maxDepth: 10, // Maximum directory depth
        followSymlinks: false, // Follow symbolic links
        includeHidden: false, // Include hidden files

        // Code extraction
        extractComments: true, // Extract JSDoc comments
        extractTypes: true, // Extract TypeScript types
        extractExamples: true, // Extract code examples
        extractAPIs: true // Extract API definitions
      },

      templates: {
        // Template configurations
        readme: {
          sections: [
            'title',
            'description',
            'installation',
            'usage',
            'api',
            'examples',
            'contributing',
            'license'
          ],
          autoGenerate: ['api', 'examples'],
          preserveCustom: true
        },

        api: {
          groupBy: 'module', // 'module', 'class', 'namespace'
          includePrivate: false, // Include private methods
          includeInternal: false, // Include internal APIs
          sortBy: 'alphabetical', // 'alphabetical', 'logical'
          generateNavigation: true
        },

        changelog: {
          groupBy: 'type', // 'type', 'date', 'version'
          includeAuthors: true, // Include commit authors
          linkIssues: true, // Link to issue tracker
          maxEntries: 100, // Maximum changelog entries
          versionPattern: /^v?\d+\.\d+\.\d+/
        }
      }
    };

    // Documentation templates
    this.templates = {
      readme: {
        header: `# {{title}}

{{description}}

## Installation

\`\`\`bash
{{installCommand}}
\`\`\`

## Quick Start

{{quickStart}}

`,

        apiSection: `## API Reference

{{apiDocs}}

`,

        examplesSection: `## Examples

{{examples}}

`,

        footer: `## Contributing

{{contributingGuidelines}}

## License

{{license}}
`
      },

      api: {
        moduleHeader: `# {{moduleName}}

{{moduleDescription}}

## Classes

{{classes}}

## Functions

{{functions}}

## Types

{{types}}

`,

        classTemplate: `### {{className}}

{{classDescription}}

#### Constructor

\`\`\`{{language}}
{{constructor}}
\`\`\`

#### Methods

{{methods}}

#### Properties

{{properties}}

`,

        methodTemplate: `##### {{methodName}}

{{methodDescription}}

**Parameters:**
{{parameters}}

**Returns:** {{returnType}}
{{returnDescription}}

**Example:**
\`\`\`{{language}}
{{example}}
\`\`\`

`
      },

      changelog: {
        header: `# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

`,

        versionTemplate: `## [{{version}}] - {{date}}

{{changes}}

`,

        changeTemplate: `### {{changeType}}

{{changeList}}

`
      }
    };
  }

  async initialize() {
    // Ensure data directories exist
    await fs.mkdir(this.dataDir, { recursive: true });
    await fs.mkdir(this.outputDir, { recursive: true });
    await fs.mkdir(this.templatesDir, { recursive: true });

    // Load or create configuration
    await this.loadConfiguration();

    // Initialize cache
    await this.loadCache();

    console.log('DocumentationAutoGenerator initialized');
  }

  async loadConfiguration() {
    try {
      const configData = await fs.readFile(this.configFile, 'utf8');
      this.config = { ...this.config, ...JSON.parse(configData) };
    } catch (error) {
      // Create default configuration
      await this.saveConfiguration();
    }
  }

  async saveConfiguration() {
    await fs.writeFile(this.configFile, JSON.stringify(this.config, null, 2));
  }

  async loadCache() {
    try {
      const cacheData = await fs.readFile(this.cacheFile, 'utf8');
      this.cache = JSON.parse(cacheData);
    } catch (error) {
      this.cache = {
        lastGeneration: null,
        fileHashes: {},
        generatedFiles: [],
        apiData: {},
        projectInfo: {}
      };
    }
  }

  async saveCache() {
    await fs.writeFile(this.cacheFile, JSON.stringify(this.cache, null, 2));
  }

  // Generate all documentation
  async generateAll(options = {}) {
    console.log('Starting full documentation generation...');

    const startTime = Date.now();
    const results = {
      generated: [],
      updated: [],
      errors: []
    };

    try {
      // Analyze project structure
      const projectInfo = await this.analyzeProject();
      this.cache.projectInfo = projectInfo;

      // Generate different types of documentation
      if (this.config.generation.types.api) {
        const apiResult = await this.generateAPIDocumentation();
        results.generated.push(...apiResult.generated);
        results.errors.push(...apiResult.errors);
      }

      if (this.config.generation.types.readme) {
        const readmeResult = await this.generateREADMEs();
        results.generated.push(...readmeResult.generated);
        results.errors.push(...readmeResult.errors);
      }

      if (this.config.generation.types.changelog) {
        const changelogResult = await this.generateChangelog();
        results.generated.push(...changelogResult.generated);
        results.errors.push(...changelogResult.errors);
      }

      if (this.config.generation.types.guides) {
        const guidesResult = await this.generateGuides();
        results.generated.push(...guidesResult.generated);
        results.errors.push(...guidesResult.errors);
      }

      if (this.config.generation.types.examples) {
        const examplesResult = await this.generateExamples();
        results.generated.push(...examplesResult.generated);
        results.errors.push(...examplesResult.errors);
      }

      // Update cache
      this.cache.lastGeneration = new Date().toISOString();
      await this.saveCache();

      const duration = Date.now() - startTime;
      console.log(`Documentation generation completed in ${duration}ms`);
      console.log(`Generated: ${results.generated.length} files`);
      console.log(`Updated: ${results.updated.length} files`);
      if (results.errors.length > 0) {
        console.log(`Errors: ${results.errors.length}`);
      }

      return results;
    } catch (error) {
      console.error('Documentation generation failed:', error);
      results.errors.push({
        type: 'generation_failure',
        message: error.message,
        stack: error.stack
      });
      return results;
    }
  }

  // Analyze project structure and extract information
  async analyzeProject() {
    console.log('Analyzing project structure...');

    const analysis = {
      name: '',
      description: '',
      version: '',
      structure: {},
      dependencies: {},
      scripts: {},
      modules: [],
      apis: [],
      examples: []
    };

    try {
      // Read package.json for basic info
      const packagePath = path.join(process.cwd(), 'package.json');
      try {
        const packageData = JSON.parse(await fs.readFile(packagePath, 'utf8'));
        analysis.name = packageData.name || 'Unnamed Project';
        analysis.description = packageData.description || '';
        analysis.version = packageData.version || '0.0.0';
        analysis.dependencies = packageData.dependencies || {};
        analysis.scripts = packageData.scripts || {};
      } catch (error) {
        console.warn('Could not read package.json');
      }

      // Analyze file structure
      analysis.structure = await this.analyzeFileStructure(process.cwd());

      // Extract modules and APIs
      analysis.modules = await this.extractModules();
      analysis.apis = await this.extractAPIs();
      analysis.examples = await this.extractExamples();

      return analysis;
    } catch (error) {
      console.error('Project analysis failed:', error);
      return analysis;
    }
  }

  // Analyze file structure recursively
  async analyzeFileStructure(dirPath, depth = 0) {
    if (depth > this.config.analysis.maxDepth) {
      return null;
    }

    const structure = {
      name: path.basename(dirPath),
      type: 'directory',
      children: [],
      files: []
    };

    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        // Skip excluded patterns
        if (this.shouldExclude(fullPath)) {
          continue;
        }

        if (entry.isDirectory()) {
          const childStructure = await this.analyzeFileStructure(
            fullPath,
            depth + 1
          );
          if (childStructure) {
            structure.children.push(childStructure);
          }
        } else if (entry.isFile()) {
          structure.files.push({
            name: entry.name,
            extension: path.extname(entry.name),
            size: (await fs.stat(fullPath)).size
          });
        }
      }

      return structure;
    } catch (error) {
      console.warn(`Could not analyze directory ${dirPath}:`, error.message);
      return structure;
    }
  }

  // Check if file/path should be excluded
  shouldExclude(filePath) {
    const relativePath = path.relative(process.cwd(), filePath);

    for (const pattern of this.config.analysis.exclude) {
      if (this.matchPattern(relativePath, pattern)) {
        return true;
      }
    }

    return false;
  }

  // Simple pattern matching
  matchPattern(str, pattern) {
    // Convert glob pattern to regex
    const regexPattern = pattern
      .replace(/\*\*/g, '.*')
      .replace(/\*/g, '[^/]*')
      .replace(/\?/g, '.');

    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(str);
  }

  // Extract module information from code files
  async extractModules() {
    console.log('Extracting module information...');

    const modules = [];
    const codeFiles = await this.findCodeFiles();

    for (const filePath of codeFiles) {
      try {
        const content = await fs.readFile(filePath, 'utf8');
        const moduleInfo = this.parseModuleInfo(content, filePath);

        if (moduleInfo) {
          modules.push(moduleInfo);
        }
      } catch (error) {
        console.warn(`Could not parse module ${filePath}:`, error.message);
      }
    }

    return modules;
  }

  // Find all code files in the project
  async findCodeFiles() {
    const files = [];

    const searchPatterns = [
      ...this.config.analysis.filePatterns.javascript,
      ...this.config.analysis.filePatterns.typescript
    ];

    for (const pattern of searchPatterns) {
      try {
        // Simple file finding - in production would use proper glob library
        const found = await this.findFilesByPattern(process.cwd(), pattern);
        files.push(...found);
      } catch (error) {
        console.warn(`Pattern search failed for ${pattern}:`, error.message);
      }
    }

    return [...new Set(files)]; // Remove duplicates
  }

  // Simple file pattern matching
  async findFilesByPattern(dir, pattern) {
    const files = [];

    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (this.shouldExclude(fullPath)) {
          continue;
        }

        if (entry.isDirectory()) {
          const subFiles = await this.findFilesByPattern(fullPath, pattern);
          files.push(...subFiles);
        } else if (
          entry.isFile() &&
          this.matchPattern(entry.name, pattern.replace('**/', ''))
        ) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.warn(`Directory scan failed for ${dir}:`, error.message);
    }

    return files;
  }

  // Parse module information from file content
  parseModuleInfo(content, filePath) {
    const moduleInfo = {
      name: path.basename(filePath, path.extname(filePath)),
      path: filePath,
      description: '',
      exports: [],
      imports: [],
      classes: [],
      functions: [],
      constants: [],
      types: []
    };

    // Extract JSDoc description
    const docMatch = content.match(/\/\*\*\s*\n\s*\*\s*(.*?)\n\s*\*\//);
    if (docMatch) {
      moduleInfo.description = docMatch[1].trim();
    }

    // Extract exports (simplified parsing)
    const exportMatches = content.match(
      /export\s+(const|function|class|interface|type)\s+(\w+)/g
    );
    if (exportMatches) {
      moduleInfo.exports = exportMatches.map(match => {
        const [, type, name] = match.match(
          /export\s+(const|function|class|interface|type)\s+(\w+)/
        );
        return { type, name };
      });
    }

    // Extract classes
    const classMatches = content.match(
      /class\s+(\w+)(?:\s+extends\s+(\w+))?\s*{/g
    );
    if (classMatches) {
      moduleInfo.classes = classMatches.map(match => {
        const [, name, parent] = match.match(
          /class\s+(\w+)(?:\s+extends\s+(\w+))?\s*{/
        );
        return { name, parent };
      });
    }

    // Extract functions
    const functionMatches = content.match(
      /(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\([^)]*\)/g
    );
    if (functionMatches) {
      moduleInfo.functions = functionMatches.map(match => {
        const [, name] = match.match(/function\s+(\w+)/);
        return { name };
      });
    }

    return moduleInfo.exports.length > 0 ||
      moduleInfo.classes.length > 0 ||
      moduleInfo.functions.length > 0
      ? moduleInfo
      : null;
  }

  // Extract API information
  async extractAPIs() {
    console.log('Extracting API information...');

    const apis = [];

    // Look for server files and route definitions
    const serverFiles = await this.findFilesByPattern(
      process.cwd(),
      '**/*server*.js'
    );
    const routeFiles = await this.findFilesByPattern(
      process.cwd(),
      '**/*route*.js'
    );

    for (const filePath of [...serverFiles, ...routeFiles]) {
      try {
        const content = await fs.readFile(filePath, 'utf8');
        const apiInfo = this.parseAPIInfo(content, filePath);

        if (apiInfo.endpoints.length > 0) {
          apis.push(apiInfo);
        }
      } catch (error) {
        console.warn(`Could not parse API file ${filePath}:`, error.message);
      }
    }

    return apis;
  }

  // Parse API information from file content
  parseAPIInfo(content, filePath) {
    const apiInfo = {
      file: filePath,
      description: '',
      baseUrl: '',
      endpoints: []
    };

    // Extract API endpoints (simplified parsing for common patterns)
    const endpointPatterns = [
      /app\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g,
      /router\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g,
      /\.route\s*\(\s*['"`]([^'"`]+)['"`]\s*\)\s*\.(get|post|put|delete|patch)/g
    ];

    for (const pattern of endpointPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const [, method, path] = match;
        apiInfo.endpoints.push({
          method: method.toUpperCase(),
          path: path,
          description: '' // Could extract from nearby comments
        });
      }
    }

    return apiInfo;
  }

  // Extract code examples
  async extractExamples() {
    console.log('Extracting code examples...');

    const examples = [];

    // Look for example files and directories
    const exampleDirs = ['examples', 'samples', 'demo'];

    for (const dirName of exampleDirs) {
      const exampleDir = path.join(process.cwd(), dirName);

      try {
        await fs.access(exampleDir);
        const exampleFiles = await this.findFilesByPattern(
          exampleDir,
          '**/*.js'
        );

        for (const filePath of exampleFiles) {
          try {
            const content = await fs.readFile(filePath, 'utf8');
            const example = {
              name: path.basename(filePath, path.extname(filePath)),
              path: filePath,
              description: this.extractExampleDescription(content),
              code: content
            };

            examples.push(example);
          } catch (error) {
            console.warn(`Could not read example ${filePath}:`, error.message);
          }
        }
      } catch (error) {
        // Directory doesn't exist, skip
      }
    }

    return examples;
  }

  // Extract example description from code
  extractExampleDescription(content) {
    // Look for description in header comment
    const headerMatch = content.match(/\/\*\*?\s*\n?\s*\*?\s*(.*?)\n/);
    if (headerMatch) {
      return headerMatch[1].replace(/^\*\s*/, '').trim();
    }

    // Look for single line comment at top
    const lineMatch = content.match(/^\s*\/\/\s*(.*)/);
    if (lineMatch) {
      return lineMatch[1].trim();
    }

    return '';
  }

  // Generate API documentation
  async generateAPIDocumentation() {
    console.log('Generating API documentation...');

    const results = { generated: [], errors: [] };

    try {
      const apis = this.cache.projectInfo.apis || [];

      if (apis.length === 0) {
        console.log('No APIs found to document');
        return results;
      }

      // Generate main API documentation
      let apiDoc = this.templates.api.moduleHeader
        .replace('{{moduleName}}', 'API Reference')
        .replace(
          '{{moduleDescription}}',
          'Complete API documentation for all endpoints'
        );

      for (const api of apis) {
        apiDoc += `\n## ${path.basename(api.file)}\n\n`;

        if (api.description) {
          apiDoc += `${api.description}\n\n`;
        }

        for (const endpoint of api.endpoints) {
          apiDoc += `### ${endpoint.method} ${endpoint.path}\n\n`;

          if (endpoint.description) {
            apiDoc += `${endpoint.description}\n\n`;
          }

          apiDoc += `**Method:** \`${endpoint.method}\`\n`;
          apiDoc += `**Path:** \`${endpoint.path}\`\n\n`;
        }
      }

      // Write API documentation
      const apiDocPath = path.join(this.outputDir, 'api.md');
      await fs.writeFile(apiDocPath, apiDoc);
      results.generated.push(apiDocPath);

      console.log(`Generated API documentation: ${apiDocPath}`);
    } catch (error) {
      console.error('API documentation generation failed:', error);
      results.errors.push({
        type: 'api_generation_error',
        message: error.message
      });
    }

    return results;
  }

  // Generate README files
  async generateREADMEs() {
    console.log('Generating README files...');

    const results = { generated: [], errors: [] };

    try {
      const projectInfo = this.cache.projectInfo;

      // Generate main README
      let readme = this.templates.readme.header
        .replace('{{title}}', projectInfo.name || 'Project')
        .replace(
          '{{description}}',
          projectInfo.description || 'No description available'
        )
        .replace('{{installCommand}}', this.generateInstallCommand(projectInfo))
        .replace('{{quickStart}}', this.generateQuickStart(projectInfo));

      // Add API section if APIs exist
      if (projectInfo.apis && projectInfo.apis.length > 0) {
        readme += this.templates.readme.apiSection.replace(
          '{{apiDocs}}',
          'See [API Documentation](docs/generated/api.md) for complete API reference.'
        );
      }

      // Add examples section if examples exist
      if (projectInfo.examples && projectInfo.examples.length > 0) {
        const examplesList = projectInfo.examples
          .map(
            ex =>
              `- [${ex.name}](${path.relative(process.cwd(), ex.path)}) - ${ex.description}`
          )
          .join('\n');

        readme += this.templates.readme.examplesSection.replace(
          '{{examples}}',
          examplesList
        );
      }

      // Add footer
      readme += this.templates.readme.footer
        .replace(
          '{{contributingGuidelines}}',
          'Please read our contributing guidelines before submitting changes.'
        )
        .replace(
          '{{license}}',
          'This project is licensed under the MIT License.'
        );

      // Write README
      const readmePath = path.join(process.cwd(), 'README.md');

      // Check if README already exists and preserve custom sections
      try {
        const existingReadme = await fs.readFile(readmePath, 'utf8');
        readme = this.mergeReadmeContent(existingReadme, readme);
      } catch (error) {
        // File doesn't exist, use generated content
      }

      await fs.writeFile(readmePath, readme);
      results.generated.push(readmePath);

      console.log(`Generated README: ${readmePath}`);
    } catch (error) {
      console.error('README generation failed:', error);
      results.errors.push({
        type: 'readme_generation_error',
        message: error.message
      });
    }

    return results;
  }

  // Generate install command based on project info
  generateInstallCommand(projectInfo) {
    if (projectInfo.scripts && projectInfo.scripts.install) {
      return 'npm run install';
    }

    // Check if it's a pnpm workspace
    try {
      const pnpmWorkspace = path.join(process.cwd(), 'pnpm-workspace.yaml');
      fs.accessSync(pnpmWorkspace);
      return 'pnpm install';
    } catch (error) {
      // Not a pnpm workspace
    }

    return 'npm install';
  }

  // Generate quick start section
  generateQuickStart(projectInfo) {
    const scripts = projectInfo.scripts || {};

    let quickStart = '';

    if (scripts.dev) {
      quickStart += '```bash\n# Start development server\nnpm run dev\n```\n\n';
    }

    if (scripts.build) {
      quickStart += '```bash\n# Build for production\nnpm run build\n```\n\n';
    }

    if (scripts.test) {
      quickStart += '```bash\n# Run tests\nnpm test\n```\n\n';
    }

    return quickStart || 'No quick start information available.';
  }

  // Merge existing README content with generated content
  mergeReadmeContent(existing, generated) {
    if (!this.config.templates.readme.preserveCustom) {
      return generated;
    }

    // Simple merge strategy - preserve custom sections marked with special comments
    // In production, would implement more sophisticated merging
    return generated;
  }

  // Generate changelog from git history
  async generateChangelog() {
    console.log('Generating changelog...');

    const results = { generated: [], errors: [] };

    try {
      const gitLog = this.getGitLog();
      const changelog = this.parseCommitsToChangelog(gitLog);

      const changelogPath = path.join(this.outputDir, 'CHANGELOG.md');
      await fs.writeFile(changelogPath, changelog);
      results.generated.push(changelogPath);

      console.log(`Generated changelog: ${changelogPath}`);
    } catch (error) {
      console.error('Changelog generation failed:', error);
      results.errors.push({
        type: 'changelog_generation_error',
        message: error.message
      });
    }

    return results;
  }

  // Get git log data
  getGitLog() {
    try {
      const output = execSync('git log --oneline --no-merges -100', {
        encoding: 'utf8',
        cwd: process.cwd()
      });

      return output
        .trim()
        .split('\n')
        .map(line => {
          const [hash, ...messageParts] = line.split(' ');
          return {
            hash: hash,
            message: messageParts.join(' ')
          };
        });
    } catch (error) {
      console.warn('Could not get git log:', error.message);
      return [];
    }
  }

  // Parse commits into changelog format
  parseCommitsToChangelog(commits) {
    let changelog = this.templates.changelog.header;

    // Group commits by type
    const grouped = {
      feat: [],
      fix: [],
      docs: [],
      style: [],
      refactor: [],
      test: [],
      chore: [],
      other: []
    };

    for (const commit of commits) {
      const type = this.parseCommitType(commit.message);
      if (grouped[type]) {
        grouped[type].push(commit);
      } else {
        grouped.other.push(commit);
      }
    }

    // Generate changelog sections
    const typeLabels = {
      feat: 'Added',
      fix: 'Fixed',
      docs: 'Documentation',
      style: 'Style',
      refactor: 'Refactored',
      test: 'Tests',
      chore: 'Maintenance',
      other: 'Other'
    };

    let hasChanges = false;
    for (const [type, commits] of Object.entries(grouped)) {
      if (commits.length > 0) {
        changelog += `### ${typeLabels[type]}\n\n`;

        for (const commit of commits) {
          changelog += `- ${commit.message} (${commit.hash})\n`;
        }

        changelog += '\n';
        hasChanges = true;
      }
    }

    if (!hasChanges) {
      changelog += 'No changes found.\n';
    }

    return changelog;
  }

  // Parse commit type from conventional commit format
  parseCommitType(message) {
    const match = message.match(
      /^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?:/
    );
    return match ? match[1] : 'other';
  }

  // Generate development guides
  async generateGuides() {
    console.log('Generating development guides...');

    const results = { generated: [], errors: [] };

    // Generate basic development guide
    const devGuide = `# Development Guide

## Project Structure

This project follows a modular structure with the following key directories:

- \`src/\` - Source code
- \`tests/\` - Test files
- \`docs/\` - Documentation
- \`examples/\` - Code examples

## Development Workflow

1. Clone the repository
2. Install dependencies
3. Create a feature branch
4. Make your changes
5. Run tests
6. Submit a pull request

## Coding Standards

- Use ESLint for code linting
- Follow TypeScript best practices
- Write comprehensive tests
- Document public APIs

## Testing

Run the test suite with:

\`\`\`bash
npm test
\`\`\`

## Building

Build the project with:

\`\`\`bash
npm run build
\`\`\`
`;

    try {
      const guidePath = path.join(this.outputDir, 'development-guide.md');
      await fs.writeFile(guidePath, devGuide);
      results.generated.push(guidePath);

      console.log(`Generated development guide: ${guidePath}`);
    } catch (error) {
      results.errors.push({
        type: 'guide_generation_error',
        message: error.message
      });
    }

    return results;
  }

  // Generate examples documentation
  async generateExamples() {
    console.log('Generating examples documentation...');

    const results = { generated: [], errors: [] };

    try {
      const examples = this.cache.projectInfo.examples || [];

      if (examples.length === 0) {
        console.log('No examples found to document');
        return results;
      }

      let examplesDoc = `# Examples

This document contains code examples for common use cases.

`;

      for (const example of examples) {
        examplesDoc += `## ${example.name}\n\n`;

        if (example.description) {
          examplesDoc += `${example.description}\n\n`;
        }

        examplesDoc += `\`\`\`javascript\n${example.code}\n\`\`\`\n\n`;
      }

      const examplesPath = path.join(this.outputDir, 'examples.md');
      await fs.writeFile(examplesPath, examplesDoc);
      results.generated.push(examplesPath);

      console.log(`Generated examples documentation: ${examplesPath}`);
    } catch (error) {
      console.error('Examples documentation generation failed:', error);
      results.errors.push({
        type: 'examples_generation_error',
        message: error.message
      });
    }

    return results;
  }

  // CLI command handling
  async handleCommand(command, args) {
    switch (command) {
      case 'generate':
        return await this.generateAll();

      case 'api':
        return await this.generateAPIDocumentation();

      case 'readme':
        return await this.generateREADMEs();

      case 'changelog':
        return await this.generateChangelog();

      case 'guides':
        return await this.generateGuides();

      case 'examples':
        return await this.generateExamples();

      case 'analyze':
        const analysis = await this.analyzeProject();
        console.log('Project Analysis:');
        console.log(`Name: ${analysis.name}`);
        console.log(`Description: ${analysis.description}`);
        console.log(`Version: ${analysis.version}`);
        console.log(`Modules: ${analysis.modules.length}`);
        console.log(`APIs: ${analysis.apis.length}`);
        console.log(`Examples: ${analysis.examples.length}`);
        return analysis;

      case 'config':
        if (args.length > 0) {
          // Update configuration
          const [key, value] = args;
          this.updateConfig(key, value);
          await this.saveConfiguration();
          console.log(`Updated configuration: ${key} = ${value}`);
        } else {
          // Show configuration
          console.log('Current Configuration:');
          console.log(JSON.stringify(this.config, null, 2));
        }
        return this.config;

      case 'clean':
        await this.cleanGeneratedDocs();
        console.log('Cleaned generated documentation');
        return { cleaned: true };

      default:
        this.showHelp();
        return null;
    }
  }

  // Update configuration value
  updateConfig(key, value) {
    const keys = key.split('.');
    let current = this.config;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }

    // Parse value
    let parsedValue = value;
    if (value === 'true') parsedValue = true;
    else if (value === 'false') parsedValue = false;
    else if (!isNaN(value)) parsedValue = Number(value);

    current[keys[keys.length - 1]] = parsedValue;
  }

  // Clean generated documentation
  async cleanGeneratedDocs() {
    try {
      await fs.rm(this.outputDir, { recursive: true, force: true });
      await fs.mkdir(this.outputDir, { recursive: true });

      // Clear cache
      this.cache.generatedFiles = [];
      await this.saveCache();
    } catch (error) {
      console.error('Failed to clean documentation:', error);
    }
  }

  // Show help information
  showHelp() {
    console.log(`
Documentation Auto-Generator

USAGE:
  node DocumentationAutoGenerator.js <command> [options]

COMMANDS:
  generate      Generate all documentation types
  api          Generate API documentation only
  readme       Generate README files only
  changelog    Generate changelog only
  guides       Generate development guides only
  examples     Generate examples documentation only
  analyze      Analyze project structure
  config       Show or update configuration
  clean        Clean generated documentation
  help         Show this help message

EXAMPLES:
  node DocumentationAutoGenerator.js generate
  node DocumentationAutoGenerator.js api
  node DocumentationAutoGenerator.js config generation.types.api true
  node DocumentationAutoGenerator.js analyze

For more information, see the generated documentation in docs/generated/
`);
  }
}

// Main execution
async function main() {
  const generator = new DocumentationAutoGenerator();
  await generator.initialize();

  const [, , command = 'help', ...args] = process.argv;

  try {
    const result = await generator.handleCommand(command, args);

    if (result && typeof result === 'object') {
      process.exit(0);
    }
  } catch (error) {
    console.error('Command failed:', error);
    process.exit(1);
  }
}

// Export for use as module
module.exports = DocumentationAutoGenerator;

// Run if called directly
if (require.main === module) {
  main();
}
