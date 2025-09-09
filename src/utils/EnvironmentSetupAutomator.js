#!/usr/bin/env node

/**
 * Environment Setup Automator
 *
 * Provides one-command development environment setup with automated dependency resolution,
 * configuration management, and environment validation for seamless onboarding.
 *
 * Key Features:
 * - One-command environment setup for new developers
 * - Automated dependency resolution and installation
 * - Environment variable configuration and validation
 * - Development tool installation and configuration
 * - Database setup and migration automation
 * - Docker environment provisioning
 * - Cross-platform compatibility (Windows, macOS, Linux)
 * - Environment health checks and diagnostics
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync, spawn } = require('child_process');
const os = require('os');

class EnvironmentSetupAutomator {
  constructor() {
    this.dataDir = path.join(__dirname, '../data/environment');
    this.configFile = path.join(this.dataDir, 'setup-config.json');
    this.profilesFile = path.join(this.dataDir, 'environment-profiles.json');
    this.historyFile = path.join(this.dataDir, 'setup-history.json');
    this.diagnosticsFile = path.join(this.dataDir, 'diagnostics.json');

    // Configuration for environment setup
    this.config = {
      setup: {
        // Setup modes
        modes: {
          minimal: 'Minimal setup for basic development',
          standard: 'Standard setup with all common tools',
          full: 'Full setup including optional tools and integrations',
          custom: 'Custom setup based on user preferences'
        },

        // Platform detection
        platform: process.platform,
        architecture: process.arch,
        nodeVersion: process.version,

        // Setup steps
        defaultSteps: [
          'detect_environment',
          'validate_system',
          'install_dependencies',
          'configure_environment',
          'setup_databases',
          'configure_tools',
          'validate_setup',
          'generate_report'
        ],

        // Timeout settings
        commandTimeout: 300000, // 5 minutes for individual commands
        totalTimeout: 1800000, // 30 minutes for total setup
        retryAttempts: 3,
        retryDelay: 5000
      },

      dependencies: {
        // Required system dependencies
        system: {
          node: {
            version: '>=18.0.0',
            installer: {
              windows: 'winget install OpenJS.NodeJS',
              macos: 'brew install node',
              linux:
                'curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt-get install -y nodejs'
            }
          },

          git: {
            version: '>=2.20.0',
            installer: {
              windows: 'winget install Git.Git',
              macos: 'brew install git',
              linux: 'sudo apt-get install git'
            }
          },

          docker: {
            version: '>=20.0.0',
            installer: {
              windows: 'winget install Docker.DockerDesktop',
              macos: 'brew install --cask docker',
              linux:
                'curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh'
            },
            optional: true
          },

          pnpm: {
            version: '>=8.0.0',
            installer: {
              all: 'npm install -g pnpm'
            }
          }
        },

        // Development tools
        tools: {
          vscode: {
            name: 'Visual Studio Code',
            installer: {
              windows: 'winget install Microsoft.VisualStudioCode',
              macos: 'brew install --cask visual-studio-code',
              linux: 'snap install code --classic'
            },
            optional: true,
            extensions: [
              'ms-vscode.vscode-typescript-next',
              'esbenp.prettier-vscode',
              'bradlc.vscode-tailwindcss',
              'ms-vscode.vscode-json'
            ]
          },

          chrome: {
            name: 'Google Chrome',
            installer: {
              windows: 'winget install Google.Chrome',
              macos: 'brew install --cask google-chrome',
              linux:
                'wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | sudo apt-key add - && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" | sudo tee /etc/apt/sources.list.d/google-chrome.list && sudo apt-get update && sudo apt-get install google-chrome-stable'
            },
            optional: true
          }
        },

        // Package managers by platform
        packageManagers: {
          windows: 'winget',
          macos: 'brew',
          linux: 'apt-get'
        }
      },

      environment: {
        // Environment variables to set up
        variables: {
          NODE_ENV: 'development',
          DEBUG: '*',
          PORT: '3000',
          API_PORT: '8000'
        },

        // Configuration files to create/update
        configFiles: {
          '.env.local': {
            template: '.env.example',
            required: true
          },

          '.vscode/settings.json': {
            content: {
              'typescript.preferences.includePackageJsonAutoImports': 'auto',
              'editor.formatOnSave': true,
              'editor.defaultFormatter': 'esbenp.prettier-vscode',
              'files.exclude': {
                '**/node_modules': true,
                '**/.git': true,
                '**/.DS_Store': true,
                '**/dist': true,
                '**/.turbo': true
              }
            },
            optional: true
          },

          '.gitconfig': {
            settings: {
              'core.autocrlf': process.platform === 'win32' ? 'true' : 'input',
              'core.editor': 'code --wait',
              'push.default': 'simple',
              'pull.rebase': 'false'
            },
            global: true,
            optional: true
          }
        },

        // Database setup
        databases: {
          postgresql: {
            enabled: false,
            version: '>=13.0.0',
            setup: {
              createDatabase: true,
              runMigrations: true,
              seedData: false
            }
          },

          redis: {
            enabled: false,
            version: '>=6.0.0',
            setup: {
              startService: true,
              configureMemory: true
            }
          }
        }
      },

      validation: {
        // Health checks to run after setup
        checks: [
          {
            name: 'Node.js Installation',
            command: 'node --version',
            expectedPattern: /v\d+\.\d+\.\d+/
          },
          {
            name: 'npm/pnpm Installation',
            command: 'pnpm --version',
            expectedPattern: /\d+\.\d+\.\d+/
          },
          {
            name: 'Git Installation',
            command: 'git --version',
            expectedPattern: /git version/
          },
          {
            name: 'Project Dependencies',
            command: 'pnpm install --dry-run',
            cwd: process.cwd()
          },
          {
            name: 'TypeScript Compilation',
            command: 'pnpm typecheck',
            cwd: process.cwd(),
            optional: true
          },
          {
            name: 'Linting',
            command: 'pnpm lint --max-warnings 0',
            cwd: process.cwd(),
            optional: true
          }
        ],

        // Performance benchmarks
        benchmarks: {
          installTime: 300, // Max install time in seconds
          buildTime: 120, // Max build time in seconds
          testTime: 60 // Max test time in seconds
        }
      }
    };

    this.setupHistory = [];
    this.currentStep = null;
    this.startTime = null;
    this.errors = [];
    this.warnings = [];
  }

  /**
   * Initialize the environment setup automator
   */
  async initialize() {
    try {
      await this.ensureDirectories();
      await this.loadConfiguration();
      await this.loadSetupHistory();

      console.log('Environment Setup Automator initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize Environment Setup Automator:', error);
      return false;
    }
  }

  /**
   * Ensure required directories exist
   */
  async ensureDirectories() {
    const dirs = [this.dataDir];

    for (const dir of dirs) {
      try {
        await fs.access(dir);
      } catch {
        await fs.mkdir(dir, { recursive: true });
      }
    }
  }

  /**
   * Load configuration from file
   */
  async loadConfiguration() {
    try {
      const configData = await fs.readFile(this.configFile, 'utf8');
      const fileConfig = JSON.parse(configData);
      this.config = { ...this.config, ...fileConfig };
    } catch (error) {
      // Config file doesn't exist or is invalid, use defaults
      await this.saveConfiguration();
    }
  }

  /**
   * Save configuration to file
   */
  async saveConfiguration() {
    await fs.writeFile(this.configFile, JSON.stringify(this.config, null, 2));
  }

  /**
   * Load setup history
   */
  async loadSetupHistory() {
    try {
      const historyData = await fs.readFile(this.historyFile, 'utf8');
      this.setupHistory = JSON.parse(historyData);
    } catch (error) {
      this.setupHistory = [];
    }
  }

  /**
   * Save setup history
   */
  async saveSetupHistory() {
    await fs.writeFile(
      this.historyFile,
      JSON.stringify(this.setupHistory, null, 2)
    );
  }

  /**
   * Run complete environment setup
   */
  async setupEnvironment(mode = 'standard', options = {}) {
    this.startTime = Date.now();
    this.errors = [];
    this.warnings = [];

    const setupId = `setup_${Date.now()}`;

    console.log(`🚀 Starting environment setup (mode: ${mode})`);
    console.log(`Setup ID: ${setupId}`);

    try {
      // Step 1: Detect current environment
      await this.runStep('detect_environment', () => this.detectEnvironment());

      // Step 2: Validate system requirements
      await this.runStep('validate_system', () =>
        this.validateSystemRequirements()
      );

      // Step 3: Install dependencies
      await this.runStep('install_dependencies', () =>
        this.installDependencies(mode, options)
      );

      // Step 4: Configure environment
      await this.runStep('configure_environment', () =>
        this.configureEnvironment(options)
      );

      // Step 5: Setup databases (if enabled)
      await this.runStep('setup_databases', () => this.setupDatabases(options));

      // Step 6: Configure development tools
      await this.runStep('configure_tools', () =>
        this.configureTools(mode, options)
      );

      // Step 7: Validate setup
      await this.runStep('validate_setup', () => this.validateSetup());

      // Step 8: Generate setup report
      await this.runStep('generate_report', () =>
        this.generateSetupReport(setupId)
      );

      const duration = Date.now() - this.startTime;

      // Record setup in history
      const setupRecord = {
        id: setupId,
        timestamp: new Date().toISOString(),
        mode,
        options,
        duration,
        success: this.errors.length === 0,
        errors: this.errors,
        warnings: this.warnings,
        platform: this.config.setup.platform,
        nodeVersion: this.config.setup.nodeVersion
      };

      this.setupHistory.push(setupRecord);
      await this.saveSetupHistory();

      if (this.errors.length === 0) {
        console.log(
          `✅ Environment setup completed successfully in ${Math.round(duration / 1000)}s`
        );
        console.log("🎉 You're ready to start developing!");

        // Show next steps
        this.showNextSteps();
      } else {
        console.log(
          `❌ Environment setup completed with ${this.errors.length} errors`
        );
        this.showTroubleshootingSteps();
      }

      return setupRecord;
    } catch (error) {
      const duration = Date.now() - this.startTime;

      console.error(
        `❌ Environment setup failed after ${Math.round(duration / 1000)}s:`,
        error.message
      );

      // Record failed setup
      const setupRecord = {
        id: setupId,
        timestamp: new Date().toISOString(),
        mode,
        options,
        duration,
        success: false,
        errors: [...this.errors, error.message],
        warnings: this.warnings,
        platform: this.config.setup.platform,
        nodeVersion: this.config.setup.nodeVersion,
        failedStep: this.currentStep
      };

      this.setupHistory.push(setupRecord);
      await this.saveSetupHistory();

      throw error;
    }
  }

  /**
   * Run a setup step with error handling and progress tracking
   */
  async runStep(stepName, stepFunction) {
    this.currentStep = stepName;
    console.log(
      `📋 ${stepName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`
    );

    try {
      await stepFunction();
      console.log(`✅ ${stepName} completed`);
    } catch (error) {
      console.error(`❌ ${stepName} failed:`, error.message);
      this.errors.push({ step: stepName, error: error.message });

      // Continue with non-critical steps
      if (!this.isCriticalStep(stepName)) {
        this.warnings.push(
          `Non-critical step ${stepName} failed: ${error.message}`
        );
      } else {
        throw error;
      }
    }
  }

  /**
   * Check if a step is critical for setup
   */
  isCriticalStep(stepName) {
    const criticalSteps = [
      'detect_environment',
      'validate_system',
      'install_dependencies',
      'configure_environment'
    ];
    return criticalSteps.includes(stepName);
  }

  /**
   * Detect current environment and system information
   */
  async detectEnvironment() {
    const env = {
      platform: process.platform,
      architecture: process.arch,
      nodeVersion: process.version,
      npmVersion: null,
      gitVersion: null,
      homeDirectory: os.homedir(),
      currentDirectory: process.cwd(),
      shell: process.env.SHELL || process.env.COMSPEC,
      user: os.userInfo().username,
      memory: Math.round(os.totalmem() / 1024 / 1024 / 1024) + 'GB',
      cpus: os.cpus().length
    };

    // Try to get npm/pnpm version
    try {
      env.npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    } catch (error) {
      // npm not installed
    }

    try {
      env.pnpmVersion = execSync('pnpm --version', { encoding: 'utf8' }).trim();
    } catch (error) {
      // pnpm not installed
    }

    // Try to get git version
    try {
      env.gitVersion = execSync('git --version', { encoding: 'utf8' }).trim();
    } catch (error) {
      // git not installed
    }

    console.log('Environment detected:', JSON.stringify(env, null, 2));
    this.detectedEnvironment = env;

    return env;
  }

  /**
   * Validate system requirements
   */
  async validateSystemRequirements() {
    const requirements = this.config.dependencies.system;
    const issues = [];

    for (const [tool, config] of Object.entries(requirements)) {
      try {
        if (tool === 'node') {
          const version = process.version;
          if (!this.satisfiesVersion(version, config.version)) {
            issues.push(
              `Node.js version ${version} does not satisfy requirement ${config.version}`
            );
          }
        } else {
          // Try to run the tool to check if it's installed
          const output = execSync(`${tool} --version`, {
            encoding: 'utf8',
            timeout: 5000
          });

          if (config.version) {
            const versionMatch = output.match(/(\d+\.\d+\.\d+)/);
            if (
              versionMatch &&
              !this.satisfiesVersion(versionMatch[1], config.version)
            ) {
              issues.push(
                `${tool} version ${versionMatch[1]} does not satisfy requirement ${config.version}`
              );
            }
          }
        }
      } catch (error) {
        if (!config.optional) {
          issues.push(`Required tool ${tool} is not installed`);
        } else {
          this.warnings.push(`Optional tool ${tool} is not installed`);
        }
      }
    }

    if (issues.length > 0) {
      throw new Error(`System validation failed:\n${issues.join('\n')}`);
    }

    console.log('✅ System requirements validated');
  }

  /**
   * Check if a version satisfies a requirement
   */
  satisfiesVersion(version, requirement) {
    // Simple version comparison - can be enhanced for complex semver
    const cleanVersion = version.replace(/^v/, '');
    const cleanRequirement = requirement.replace(/^>=/, '');

    const versionParts = cleanVersion.split('.').map(Number);
    const requirementParts = cleanRequirement.split('.').map(Number);

    for (
      let i = 0;
      i < Math.max(versionParts.length, requirementParts.length);
      i++
    ) {
      const vPart = versionParts[i] || 0;
      const rPart = requirementParts[i] || 0;

      if (vPart > rPart) return true;
      if (vPart < rPart) return false;
    }

    return true; // Equal versions satisfy
  }

  /**
   * Install system dependencies and development tools
   */
  async installDependencies(mode, options) {
    const platform = this.config.setup.platform;
    const dependencies = this.config.dependencies.system;
    const tools = this.config.dependencies.tools;

    // Install system dependencies
    for (const [tool, config] of Object.entries(dependencies)) {
      if (config.optional && mode === 'minimal') continue;

      if (!(await this.isToolInstalled(tool))) {
        console.log(`Installing ${tool}...`);
        await this.installTool(tool, config, platform);
      } else {
        console.log(`✓ ${tool} already installed`);
      }
    }

    // Install development tools (for standard and full modes)
    if (mode !== 'minimal') {
      for (const [tool, config] of Object.entries(tools)) {
        if (config.optional && mode === 'standard') continue;

        if (!(await this.isToolInstalled(tool))) {
          console.log(`Installing ${config.name}...`);
          await this.installTool(tool, config, platform);
        } else {
          console.log(`✓ ${config.name} already installed`);
        }
      }
    }

    // Install project dependencies
    console.log('Installing project dependencies...');
    await this.installProjectDependencies();
  }

  /**
   * Check if a tool is installed
   */
  async isToolInstalled(tool) {
    try {
      execSync(`${tool} --version`, { stdio: 'ignore', timeout: 5000 });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Install a specific tool
   */
  async installTool(tool, config, platform) {
    const installer = config.installer[platform] || config.installer.all;

    if (!installer) {
      throw new Error(`No installer defined for ${tool} on ${platform}`);
    }

    try {
      console.log(`Running: ${installer}`);
      execSync(installer, {
        stdio: 'inherit',
        timeout: this.config.setup.commandTimeout
      });

      // Install VS Code extensions if this is VS Code
      if (tool === 'vscode' && config.extensions) {
        for (const extension of config.extensions) {
          try {
            console.log(`Installing VS Code extension: ${extension}`);
            execSync(`code --install-extension ${extension}`, {
              stdio: 'inherit'
            });
          } catch (error) {
            this.warnings.push(
              `Failed to install VS Code extension ${extension}: ${error.message}`
            );
          }
        }
      }
    } catch (error) {
      throw new Error(`Failed to install ${tool}: ${error.message}`);
    }
  }

  /**
   * Install project dependencies
   */
  async installProjectDependencies() {
    const packageManager = (await this.isToolInstalled('pnpm'))
      ? 'pnpm'
      : 'npm';

    try {
      console.log(`Installing dependencies with ${packageManager}...`);
      execSync(`${packageManager} install`, {
        stdio: 'inherit',
        cwd: process.cwd(),
        timeout: this.config.setup.commandTimeout
      });
    } catch (error) {
      throw new Error(
        `Failed to install project dependencies: ${error.message}`
      );
    }
  }

  /**
   * Configure environment variables and config files
   */
  async configureEnvironment(options) {
    // Set up environment variables
    const envVars = {
      ...this.config.environment.variables,
      ...options.envVars
    };
    await this.setupEnvironmentVariables(envVars);

    // Create/update configuration files
    for (const [filePath, config] of Object.entries(
      this.config.environment.configFiles
    )) {
      if (config.optional && !options.includeOptional) continue;

      await this.setupConfigFile(filePath, config);
    }

    // Configure git if requested
    if (options.configureGit !== false) {
      await this.configureGit();
    }
  }

  /**
   * Set up environment variables
   */
  async setupEnvironmentVariables(envVars) {
    const envFile = path.join(process.cwd(), '.env.local');

    try {
      let existingContent = '';
      try {
        existingContent = await fs.readFile(envFile, 'utf8');
      } catch (error) {
        // File doesn't exist, that's okay
      }

      const newVars = [];
      for (const [key, value] of Object.entries(envVars)) {
        if (!existingContent.includes(`${key}=`)) {
          newVars.push(`${key}=${value}`);
        }
      }

      if (newVars.length > 0) {
        const content =
          existingContent +
          (existingContent ? '\n' : '') +
          newVars.join('\n') +
          '\n';
        await fs.writeFile(envFile, content);
        console.log(`✓ Environment variables added to ${envFile}`);
      }
    } catch (error) {
      this.warnings.push(
        `Failed to set up environment variables: ${error.message}`
      );
    }
  }

  /**
   * Set up a configuration file
   */
  async setupConfigFile(filePath, config) {
    const fullPath = path.join(process.cwd(), filePath);
    const dir = path.dirname(fullPath);

    try {
      // Ensure directory exists
      await fs.mkdir(dir, { recursive: true });

      let content = '';

      if (config.template) {
        // Copy from template
        const templatePath = path.join(process.cwd(), config.template);
        try {
          content = await fs.readFile(templatePath, 'utf8');
        } catch (error) {
          throw new Error(`Template file ${config.template} not found`);
        }
      } else if (config.content) {
        // Use provided content
        content =
          typeof config.content === 'string'
            ? config.content
            : JSON.stringify(config.content, null, 2);
      } else if (config.settings) {
        // Git config settings
        for (const [key, value] of Object.entries(config.settings)) {
          try {
            const scope = config.global ? '--global' : '--local';
            execSync(`git config ${scope} ${key} "${value}"`, {
              stdio: 'ignore'
            });
          } catch (error) {
            this.warnings.push(
              `Failed to set git config ${key}: ${error.message}`
            );
          }
        }
        return;
      }

      // Check if file already exists
      let shouldWrite = true;
      try {
        await fs.access(fullPath);
        if (!config.overwrite) {
          console.log(`⚠ ${filePath} already exists, skipping`);
          shouldWrite = false;
        }
      } catch (error) {
        // File doesn't exist, proceed with creation
      }

      if (shouldWrite && content) {
        await fs.writeFile(fullPath, content);
        console.log(`✓ Created ${filePath}`);
      }
    } catch (error) {
      this.warnings.push(
        `Failed to set up config file ${filePath}: ${error.message}`
      );
    }
  }

  /**
   * Configure git with recommended settings
   */
  async configureGit() {
    const gitSettings =
      this.config.environment.configFiles['.gitconfig']?.settings || {};

    for (const [key, value] of Object.entries(gitSettings)) {
      try {
        execSync(`git config --global ${key} "${value}"`, { stdio: 'ignore' });
      } catch (error) {
        this.warnings.push(`Failed to set git config ${key}: ${error.message}`);
      }
    }

    console.log('✓ Git configuration updated');
  }

  /**
   * Set up databases if enabled
   */
  async setupDatabases(options) {
    const databases = this.config.environment.databases;

    for (const [dbName, config] of Object.entries(databases)) {
      if (!config.enabled && !options.databases?.[dbName]) continue;

      console.log(`Setting up ${dbName}...`);

      try {
        switch (dbName) {
          case 'postgresql':
            await this.setupPostgreSQL(config);
            break;
          case 'redis':
            await this.setupRedis(config);
            break;
          default:
            this.warnings.push(`Unknown database type: ${dbName}`);
        }
      } catch (error) {
        this.warnings.push(`Failed to set up ${dbName}: ${error.message}`);
      }
    }
  }

  /**
   * Set up PostgreSQL database
   */
  async setupPostgreSQL(config) {
    // This is a simplified setup - in practice, you'd want more robust database setup
    try {
      // Check if PostgreSQL is running
      execSync('pg_isready', { stdio: 'ignore' });

      if (config.setup.createDatabase) {
        // Create development database
        const dbName = process.env.DB_NAME || 'prompt_spaghetti_dev';
        try {
          execSync(`createdb ${dbName}`, { stdio: 'ignore' });
          console.log(`✓ Created database ${dbName}`);
        } catch (error) {
          // Database might already exist
          this.warnings.push(`Database ${dbName} might already exist`);
        }
      }

      if (config.setup.runMigrations) {
        // Run migrations if available
        try {
          execSync('pnpm db:migrate', { stdio: 'inherit', cwd: process.cwd() });
          console.log('✓ Database migrations completed');
        } catch (error) {
          this.warnings.push(
            'Failed to run database migrations - they might not be set up yet'
          );
        }
      }
    } catch (error) {
      throw new Error('PostgreSQL is not running or not installed');
    }
  }

  /**
   * Set up Redis
   */
  async setupRedis(config) {
    try {
      // Check if Redis is running
      execSync('redis-cli ping', { stdio: 'ignore' });
      console.log('✓ Redis is running');
    } catch (error) {
      throw new Error('Redis is not running or not installed');
    }
  }

  /**
   * Configure development tools
   */
  async configureTools(mode, options) {
    // Set up Git hooks
    await this.setupGitHooks();

    // Configure IDE settings
    if (mode !== 'minimal') {
      await this.configureIDE();
    }

    // Set up development aliases/scripts
    await this.setupDevelopmentAliases();
  }

  /**
   * Set up Git hooks
   */
  async setupGitHooks() {
    const hooksDir = path.join(process.cwd(), '.git/hooks');

    try {
      await fs.access(hooksDir);

      // Set up pre-commit hook
      const preCommitHook = `#!/bin/sh
# Pre-commit hook for code quality
echo "Running pre-commit checks..."

# Run linter
echo "Checking code style..."
if ! pnpm lint --max-warnings 0; then
  echo "❌ Linting failed. Please fix the issues and try again."
  exit 1
fi

# Run type checking
echo "Checking TypeScript..."
if ! pnpm typecheck; then
  echo "❌ Type checking failed. Please fix the issues and try again."
  exit 1
fi

echo "✅ Pre-commit checks passed!"
exit 0
`;

      const preCommitPath = path.join(hooksDir, 'pre-commit');
      await fs.writeFile(preCommitPath, preCommitHook);
      await fs.chmod(preCommitPath, '755');

      console.log('✓ Git hooks configured');
    } catch (error) {
      this.warnings.push(
        'Failed to set up git hooks - not in a git repository?'
      );
    }
  }

  /**
   * Configure IDE settings
   */
  async configureIDE() {
    // VS Code settings are handled in configureEnvironment
    // Add other IDE configurations here if needed
    console.log('✓ IDE configuration completed');
  }

  /**
   * Set up development aliases and shortcuts
   */
  async setupDevelopmentAliases() {
    // Create a development script with common commands
    const devScript = `#!/bin/bash
# Development utility script

case "$1" in
  "start")
    echo "Starting development environment..."
    pnpm dev
    ;;
  "test")
    echo "Running tests..."
    pnpm test
    ;;
  "build")
    echo "Building project..."
    pnpm build
    ;;
  "clean")
    echo "Cleaning project..."
    rm -rf node_modules dist .turbo
    pnpm install
    ;;
  "reset")
    echo "Resetting development environment..."
    rm -rf node_modules dist .turbo
    pnpm install
    pnpm build
    ;;
  *)
    echo "Usage: dev {start|test|build|clean|reset}"
    echo "  start  - Start development servers"
    echo "  test   - Run test suite"
    echo "  build  - Build production bundle"
    echo "  clean  - Clean and reinstall dependencies"
    echo "  reset  - Reset entire development environment"
    ;;
esac
`;

    try {
      const scriptPath = path.join(process.cwd(), 'dev');
      await fs.writeFile(scriptPath, devScript);
      await fs.chmod(scriptPath, '755');
      console.log('✓ Development aliases configured');
    } catch (error) {
      this.warnings.push('Failed to create development script');
    }
  }

  /**
   * Validate the complete setup
   */
  async validateSetup() {
    const checks = this.config.validation.checks;
    const results = [];

    for (const check of checks) {
      console.log(`Validating: ${check.name}`);

      try {
        const options = {
          encoding: 'utf8',
          timeout: 30000,
          cwd: check.cwd || process.cwd()
        };

        const output = execSync(check.command, options);

        if (check.expectedPattern && !check.expectedPattern.test(output)) {
          throw new Error(`Output does not match expected pattern: ${output}`);
        }

        results.push({ name: check.name, success: true, output });
        console.log(`✅ ${check.name} - OK`);
      } catch (error) {
        results.push({
          name: check.name,
          success: false,
          error: error.message
        });

        if (check.optional) {
          console.log(`⚠ ${check.name} - Failed (optional): ${error.message}`);
          this.warnings.push(
            `Optional validation ${check.name} failed: ${error.message}`
          );
        } else {
          console.log(`❌ ${check.name} - Failed: ${error.message}`);
          this.errors.push({
            step: 'validation',
            check: check.name,
            error: error.message
          });
        }
      }
    }

    // Run performance benchmarks
    await this.runPerformanceBenchmarks();

    return results;
  }

  /**
   * Run performance benchmarks
   */
  async runPerformanceBenchmarks() {
    const benchmarks = this.config.validation.benchmarks;

    console.log('Running performance benchmarks...');

    // Test build time
    try {
      const startTime = Date.now();
      execSync('pnpm build', {
        stdio: 'ignore',
        cwd: process.cwd(),
        timeout: benchmarks.buildTime * 1000
      });
      const buildTime = (Date.now() - startTime) / 1000;

      if (buildTime > benchmarks.buildTime) {
        this.warnings.push(
          `Build time ${buildTime}s exceeds benchmark ${benchmarks.buildTime}s`
        );
      } else {
        console.log(
          `✅ Build time: ${buildTime}s (target: <${benchmarks.buildTime}s)`
        );
      }
    } catch (error) {
      this.warnings.push('Failed to run build benchmark');
    }

    // Test test suite time
    try {
      const startTime = Date.now();
      execSync('pnpm test --passWithNoTests', {
        stdio: 'ignore',
        cwd: process.cwd(),
        timeout: benchmarks.testTime * 1000
      });
      const testTime = (Date.now() - startTime) / 1000;

      if (testTime > benchmarks.testTime) {
        this.warnings.push(
          `Test time ${testTime}s exceeds benchmark ${benchmarks.testTime}s`
        );
      } else {
        console.log(
          `✅ Test time: ${testTime}s (target: <${benchmarks.testTime}s)`
        );
      }
    } catch (error) {
      this.warnings.push('Failed to run test benchmark');
    }
  }

  /**
   * Generate setup report
   */
  async generateSetupReport(setupId) {
    const duration = Date.now() - this.startTime;

    const report = {
      setupId,
      timestamp: new Date().toISOString(),
      duration: Math.round(duration / 1000),
      environment: this.detectedEnvironment,
      success: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
      summary: {
        totalSteps: this.config.setup.defaultSteps.length,
        completedSteps:
          this.config.setup.defaultSteps.length -
          this.errors.filter(e => this.isCriticalStep(e.step)).length,
        errorCount: this.errors.length,
        warningCount: this.warnings.length
      }
    };

    // Save report
    const reportFile = path.join(this.dataDir, `setup-report-${setupId}.json`);
    await fs.writeFile(reportFile, JSON.stringify(report, null, 2));

    // Generate HTML report
    await this.generateHTMLReport(report, setupId);

    console.log(`📊 Setup report saved to ${reportFile}`);

    return report;
  }

  /**
   * Generate HTML setup report
   */
  async generateHTMLReport(report, setupId) {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Environment Setup Report - ${setupId}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
    .status { display: inline-block; padding: 8px 16px; border-radius: 4px; font-weight: bold; }
    .success { background: #d4edda; color: #155724; }
    .error { background: #f8d7da; color: #721c24; }
    .warning { background: #fff3cd; color: #856404; }
    .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
    .metric { background: #f8f9fa; padding: 20px; border-radius: 4px; text-align: center; }
    .metric-value { font-size: 2em; font-weight: bold; color: #007bff; }
    .section { margin: 30px 0; }
    .section h2 { color: #343a40; border-bottom: 1px solid #eee; padding-bottom: 10px; }
    .list-item { background: #f8f9fa; margin: 10px 0; padding: 15px; border-radius: 4px; border-left: 4px solid #007bff; }
    .error-item { border-left-color: #dc3545; }
    .warning-item { border-left-color: #ffc107; }
    .environment { background: #e9ecef; padding: 20px; border-radius: 4px; font-family: monospace; }
    .timestamp { color: #6c757d; font-size: 0.9em; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Environment Setup Report</h1>
      <p class="timestamp">Generated: ${report.timestamp}</p>
      <p class="timestamp">Setup ID: ${setupId}</p>
      <span class="status ${report.success ? 'success' : 'error'}">
        ${report.success ? '✅ SUCCESS' : '❌ FAILED'}
      </span>
    </div>

    <div class="summary">
      <div class="metric">
        <div class="metric-value">${report.duration}s</div>
        <div>Setup Duration</div>
      </div>
      <div class="metric">
        <div class="metric-value">${report.summary.completedSteps}/${report.summary.totalSteps}</div>
        <div>Steps Completed</div>
      </div>
      <div class="metric">
        <div class="metric-value">${report.summary.errorCount}</div>
        <div>Errors</div>
      </div>
      <div class="metric">
        <div class="metric-value">${report.summary.warningCount}</div>
        <div>Warnings</div>
      </div>
    </div>

    <div class="section">
      <h2>Environment Information</h2>
      <div class="environment">
${Object.entries(report.environment)
  .map(([key, value]) => `        ${key}: ${value}`)
  .join('<br>')}
      </div>
    </div>

    ${
      report.errors.length > 0
        ? `
    <div class="section">
      <h2>Errors (${report.errors.length})</h2>
      ${report.errors
        .map(
          error => `
        <div class="list-item error-item">
          <strong>${error.step || 'Unknown Step'}</strong><br>
          ${error.error}
        </div>
      `
        )
        .join('')}
    </div>
    `
        : ''
    }

    ${
      report.warnings.length > 0
        ? `
    <div class="section">
      <h2>Warnings (${report.warnings.length})</h2>
      ${report.warnings
        .map(
          warning => `
        <div class="list-item warning-item">
          ${typeof warning === 'string' ? warning : warning.error || JSON.stringify(warning)}
        </div>
      `
        )
        .join('')}
    </div>
    `
        : ''
    }

    <div class="section">
      <h2>Next Steps</h2>
      <div class="list-item">
        <strong>Start Development:</strong> Run <code>pnpm dev</code> to start the development server
      </div>
      <div class="list-item">
        <strong>Run Tests:</strong> Run <code>pnpm test</code> to execute the test suite
      </div>
      <div class="list-item">
        <strong>Build Project:</strong> Run <code>pnpm build</code> to create production build
      </div>
      <div class="list-item">
        <strong>Check Documentation:</strong> Review README.md and docs/ folder for project-specific instructions
      </div>
    </div>
  </div>
</body>
</html>`;

    const htmlFile = path.join(this.dataDir, `setup-report-${setupId}.html`);
    await fs.writeFile(htmlFile, html);

    console.log(`📊 HTML report saved to ${htmlFile}`);
  }

  /**
   * Show next steps after successful setup
   */
  showNextSteps() {
    console.log('\n🎯 Next Steps:');
    console.log('1. Start development: pnpm dev');
    console.log('2. Run tests: pnpm test');
    console.log('3. Build project: pnpm build');
    console.log('4. Check documentation in README.md');
    console.log('5. Configure your IDE with project-specific settings');
    console.log('\n💡 Use the ./dev script for common development tasks');
  }

  /**
   * Show troubleshooting steps after failed setup
   */
  showTroubleshootingSteps() {
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check the setup report for detailed error information');
    console.log(
      '2. Ensure you have the latest versions of Node.js and npm/pnpm'
    );
    console.log(
      '3. Try running setup again with elevated permissions if needed'
    );
    console.log('4. Check your internet connection for dependency downloads');
    console.log('5. Review the error messages above for specific issues');
    console.log(
      '\n📞 Need help? Check the project documentation or open an issue'
    );
  }

  /**
   * Get setup history and statistics
   */
  async getSetupHistory() {
    await this.loadSetupHistory();

    const stats = {
      totalSetups: this.setupHistory.length,
      successfulSetups: this.setupHistory.filter(s => s.success).length,
      averageDuration:
        this.setupHistory.length > 0
          ? Math.round(
              this.setupHistory.reduce((sum, s) => sum + s.duration, 0) /
                this.setupHistory.length /
                1000
            )
          : 0,
      platforms: [...new Set(this.setupHistory.map(s => s.platform))],
      commonErrors: this.getCommonErrors(),
      recentSetups: this.setupHistory.slice(-10).reverse()
    };

    return {
      history: this.setupHistory,
      statistics: stats
    };
  }

  /**
   * Get common errors from setup history
   */
  getCommonErrors() {
    const errorCounts = {};

    for (const setup of this.setupHistory) {
      for (const error of setup.errors || []) {
        const errorKey = error.error || error;
        errorCounts[errorKey] = (errorCounts[errorKey] || 0) + 1;
      }
    }

    return Object.entries(errorCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([error, count]) => ({ error, count }));
  }

  /**
   * Run environment diagnostics
   */
  async runDiagnostics() {
    console.log('🔍 Running environment diagnostics...');

    const diagnostics = {
      timestamp: new Date().toISOString(),
      system: await this.detectEnvironment(),
      tools: {},
      projects: {},
      network: {},
      performance: {}
    };

    // Check installed tools
    const tools = ['node', 'npm', 'pnpm', 'git', 'docker', 'code'];
    for (const tool of tools) {
      try {
        const version = execSync(`${tool} --version`, {
          encoding: 'utf8',
          timeout: 5000
        }).trim();
        diagnostics.tools[tool] = { installed: true, version };
      } catch (error) {
        diagnostics.tools[tool] = { installed: false, error: error.message };
      }
    }

    // Check project status
    try {
      const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'));
      diagnostics.projects.name = packageJson.name;
      diagnostics.projects.version = packageJson.version;
      diagnostics.projects.scripts = Object.keys(packageJson.scripts || {});
    } catch (error) {
      diagnostics.projects.error = 'No package.json found or invalid';
    }

    // Check network connectivity
    try {
      execSync('ping -c 1 registry.npmjs.org', {
        stdio: 'ignore',
        timeout: 5000
      });
      diagnostics.network.npm = true;
    } catch (error) {
      diagnostics.network.npm = false;
    }

    // Performance checks
    try {
      const start = Date.now();
      execSync('pnpm install --dry-run', { stdio: 'ignore', timeout: 30000 });
      diagnostics.performance.dependencyCheck = Date.now() - start;
    } catch (error) {
      diagnostics.performance.dependencyCheck = -1;
    }

    // Save diagnostics
    await fs.writeFile(
      this.diagnosticsFile,
      JSON.stringify(diagnostics, null, 2)
    );

    console.log('📊 Diagnostics completed');
    this.displayDiagnostics(diagnostics);

    return diagnostics;
  }

  /**
   * Display diagnostics results
   */
  displayDiagnostics(diagnostics) {
    console.log('\n=== Environment Diagnostics ===\n');

    console.log('System Information:');
    console.log(
      `  Platform: ${diagnostics.system.platform} ${diagnostics.system.architecture}`
    );
    console.log(`  Node.js: ${diagnostics.system.nodeVersion}`);
    console.log(`  Memory: ${diagnostics.system.memory}`);
    console.log(`  CPUs: ${diagnostics.system.cpus}`);

    console.log('\nInstalled Tools:');
    for (const [tool, info] of Object.entries(diagnostics.tools)) {
      const status = info.installed ? '✅' : '❌';
      const version = info.installed ? info.version : 'Not installed';
      console.log(`  ${status} ${tool}: ${version}`);
    }

    console.log('\nProject Status:');
    if (diagnostics.projects.name) {
      console.log(
        `  Project: ${diagnostics.projects.name} v${diagnostics.projects.version}`
      );
      console.log(`  Scripts: ${diagnostics.projects.scripts.join(', ')}`);
    } else {
      console.log(`  ❌ ${diagnostics.projects.error}`);
    }

    console.log('\nNetwork Connectivity:');
    console.log(
      `  NPM Registry: ${diagnostics.network.npm ? '✅ Available' : '❌ Unavailable'}`
    );

    console.log('\nPerformance:');
    if (diagnostics.performance.dependencyCheck > 0) {
      console.log(
        `  Dependency Check: ${diagnostics.performance.dependencyCheck}ms`
      );
    } else {
      console.log('  Dependency Check: ❌ Failed');
    }
  }
}

// CLI interface
if (require.main === module) {
  const automator = new EnvironmentSetupAutomator();

  const command = process.argv[2];
  const args = process.argv.slice(3);

  async function main() {
    await automator.initialize();

    switch (command) {
      case 'setup':
        const mode = args[0] || 'standard';
        const options = {
          includeOptional: args.includes('--include-optional'),
          configureGit: !args.includes('--no-git'),
          databases: {}
        };

        if (args.includes('--with-postgres')) {
          options.databases.postgresql = true;
        }

        if (args.includes('--with-redis')) {
          options.databases.redis = true;
        }

        await automator.setupEnvironment(mode, options);
        break;

      case 'validate':
        await automator.validateSetup();
        break;

      case 'diagnostics':
        await automator.runDiagnostics();
        break;

      case 'history':
        const history = await automator.getSetupHistory();
        console.log(JSON.stringify(history, null, 2));
        break;

      case 'help':
      default:
        console.log(`Environment Setup Automator

Usage: node EnvironmentSetupAutomator.js <command> [options]

Commands:
  setup [mode]      Set up development environment
                    Modes: minimal, standard, full, custom (default: standard)
  validate          Validate current environment setup
  diagnostics       Run comprehensive environment diagnostics
  history           Show setup history and statistics
  help              Show this help message

Setup Options:
  --include-optional    Include optional tools and configurations
  --no-git             Skip git configuration
  --with-postgres      Enable PostgreSQL setup
  --with-redis         Enable Redis setup

Examples:
  node EnvironmentSetupAutomator.js setup                    # Standard setup
  node EnvironmentSetupAutomator.js setup minimal           # Minimal setup
  node EnvironmentSetupAutomator.js setup full --with-postgres  # Full setup with PostgreSQL
  node EnvironmentSetupAutomator.js validate                # Validate current setup
  node EnvironmentSetupAutomator.js diagnostics            # Run diagnostics

Environment Setup Modes:
  minimal    - Node.js, npm/pnpm, git, basic configuration
  standard   - All minimal tools + VS Code, development tools
  full       - All standard tools + optional integrations
  custom     - Interactive setup with user choices
`);
    }
  }

  main().catch(error => {
    console.error('Environment Setup Automator failed:', error);
    process.exit(1);
  });
}

module.exports = EnvironmentSetupAutomator;
