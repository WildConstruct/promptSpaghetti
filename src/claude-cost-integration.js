#!/usr/bin/env node
/**
 * Claude Cost Integration - Bridge between ccusage and dashboard
 * This script integrates with ccusage to provide accurate Claude API cost tracking
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class ClaudeCostIntegration {
  constructor() {
    this.cacheFile = path.join(__dirname, 'data', 'claude-cost-cache.json');
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // Check if ccusage is available
  async checkCCUsageAvailable() {
    try {
      await execAsync('which ccusage || which bunx || which npx');
      return true;
    } catch {
      return false;
    }
  }

  // Get Claude conversation data directory
  getConversationDataDir() {
    // Common Claude Code data directories
    const possiblePaths = [
      path.join(process.env.HOME, '.claude'),
      path.join(process.env.HOME, '.config', 'claude'),
      path.join(process.env.HOME, 'Library', 'Application Support', 'Claude'),
      path.join(process.env.APPDATA, 'Claude'),
      path.join(process.cwd(), '.claude')
    ];

    for (const dir of possiblePaths) {
      if (fs.existsSync(dir)) {
        // Look for JSONL files
        try {
          const files = fs.readdirSync(dir);
          if (files.some(file => file.endsWith('.jsonl'))) {
            return dir;
          }
        } catch (error) {
          continue;
        }
      }
    }

    return null;
  }

  // Run ccusage and parse output
  async runCCUsage() {
    const dataDir = this.getConversationDataDir();
    if (!dataDir) {
      throw new Error('Claude conversation data directory not found');
    }

    console.log(`📊 Running ccusage on data directory: ${dataDir}`);

    try {
      // Try different ccusage execution methods
      let command;
      try {
        await execAsync('which ccusage');
        command = `ccusage --data-dir "${dataDir}" --output json`;
      } catch {
        try {
          await execAsync('which bunx');
          command = `bunx ccusage --data-dir "${dataDir}" --output json`;
        } catch {
          command = `npx ccusage --data-dir "${dataDir}" --output json`;
        }
      }

      const { stdout, stderr } = await execAsync(command, {
        timeout: 30000 // 30 second timeout
      });

      if (stderr) {
        console.warn('ccusage warnings:', stderr);
      }

      const costData = JSON.parse(stdout);
      return this.processCCUsageOutput(costData);
    } catch (error) {
      console.error('Error running ccusage:', error.message);
      throw error;
    }
  }

  // Process ccusage output into our format
  processCCUsageOutput(rawData) {
    // ccusage provides detailed breakdown - extract key metrics
    const processed = {
      type: 'actual',
      inputTokens: 0,
      outputTokens: 0,
      inputCost: 0,
      outputCost: 0,
      totalCost: 0,
      sessions: [],
      dailyBreakdown: [],
      modelBreakdown: {},
      lastUpdated: new Date().toISOString()
    };

    // Process sessions
    if (rawData.sessions) {
      rawData.sessions.forEach(session => {
        processed.sessions.push({
          date: session.date,
          inputTokens: session.input_tokens,
          outputTokens: session.output_tokens,
          cost: session.cost,
          model: session.model
        });

        processed.inputTokens += session.input_tokens || 0;
        processed.outputTokens += session.output_tokens || 0;
        processed.totalCost += session.cost || 0;
      });
    }

    // Process daily breakdown
    if (rawData.daily) {
      processed.dailyBreakdown = rawData.daily.map(day => ({
        date: day.date,
        sessions: day.sessions,
        totalCost: day.total_cost,
        inputTokens: day.input_tokens,
        outputTokens: day.output_tokens
      }));
    }

    // Process model breakdown
    if (rawData.models) {
      Object.keys(rawData.models).forEach(model => {
        processed.modelBreakdown[model] = {
          sessions: rawData.models[model].sessions,
          cost: rawData.models[model].cost,
          inputTokens: rawData.models[model].input_tokens,
          outputTokens: rawData.models[model].output_tokens
        };
      });
    }

    // Calculate input/output costs based on total
    const totalTokens = processed.inputTokens + processed.outputTokens;
    if (totalTokens > 0) {
      // Estimate split based on typical Claude usage (input usually ~20%, output ~80% of cost)
      processed.inputCost = processed.totalCost * 0.2;
      processed.outputCost = processed.totalCost * 0.8;
    }

    return processed;
  }

  // Get cached cost data
  getCachedCosts() {
    try {
      if (fs.existsSync(this.cacheFile)) {
        const cache = JSON.parse(fs.readFileSync(this.cacheFile, 'utf8'));
        const now = Date.now();
        const cacheTime = new Date(cache.lastUpdated).getTime();

        if (now - cacheTime < this.cacheTimeout) {
          return cache;
        }
      }
    } catch (error) {
      console.error('Error reading cost cache:', error);
    }
    return null;
  }

  // Save cost data to cache
  saveCostCache(costData) {
    try {
      const dataDir = path.dirname(this.cacheFile);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      fs.writeFileSync(this.cacheFile, JSON.stringify(costData, null, 2));
    } catch (error) {
      console.error('Error saving cost cache:', error);
    }
  }

  // Main method to get cost data
  async getCostData() {
    console.log('🔍 Getting Claude cost data...');

    // Try cache first
    const cached = this.getCachedCosts();
    if (cached) {
      console.log('📋 Using cached cost data');
      return cached;
    }

    // Check if ccusage is available
    const ccusageAvailable = await this.checkCCUsageAvailable();
    if (!ccusageAvailable) {
      throw new Error(
        'ccusage not available - install with: npm install -g ccusage'
      );
    }

    // Run ccusage
    try {
      const costData = await this.runCCUsage();
      this.saveCostCache(costData);

      console.log('✅ Retrieved actual cost data from ccusage');
      console.log(`💰 Total cost: $${costData.totalCost.toFixed(2)}`);
      console.log(
        `🔢 Total tokens: ${(costData.inputTokens + costData.outputTokens).toLocaleString()}`
      );

      return costData;
    } catch (error) {
      console.error('❌ Failed to get ccusage data:', error.message);
      throw error;
    }
  }

  // Generate cost report
  async generateReport() {
    try {
      const costData = await this.getCostData();

      console.log('\n📊 Claude Cost Report');
      console.log('==========================================');
      console.log(`Total Cost: $${costData.totalCost.toFixed(2)}`);
      console.log(`Input Tokens: ${costData.inputTokens.toLocaleString()}`);
      console.log(`Output Tokens: ${costData.outputTokens.toLocaleString()}`);
      console.log(`Sessions: ${costData.sessions.length}`);

      if (
        costData.modelBreakdown &&
        Object.keys(costData.modelBreakdown).length > 0
      ) {
        console.log('\nModel Breakdown:');
        Object.entries(costData.modelBreakdown).forEach(([model, data]) => {
          console.log(
            `  ${model}: $${data.cost.toFixed(2)} (${data.sessions} sessions)`
          );
        });
      }

      if (costData.dailyBreakdown && costData.dailyBreakdown.length > 0) {
        console.log('\nRecent Daily Usage:');
        costData.dailyBreakdown.slice(-7).forEach(day => {
          console.log(
            `  ${day.date}: $${day.totalCost.toFixed(2)} (${day.sessions} sessions)`
          );
        });
      }

      return costData;
    } catch (error) {
      console.error('❌ Error generating cost report:', error.message);
      throw error;
    }
  }

  // Install ccusage if not available
  async installCCUsage() {
    console.log('📦 Installing ccusage...');

    try {
      // Try bun first (fastest), then npm
      try {
        await execAsync('bun add -g ccusage');
        console.log('✅ Installed ccusage via bun');
      } catch {
        await execAsync('npm install -g ccusage');
        console.log('✅ Installed ccusage via npm');
      }
    } catch (error) {
      console.error('❌ Failed to install ccusage:', error.message);
      console.log('💡 Manual installation options:');
      console.log('   bun add -g ccusage');
      console.log('   npm install -g ccusage');
      console.log('   Or run directly: bunx ccusage or npx ccusage');
      throw error;
    }
  }
}

// CLI interface
async function main() {
  const integration = new ClaudeCostIntegration();
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    switch (command) {
      case 'report':
        await integration.generateReport();
        break;

      case 'install':
        await integration.installCCUsage();
        break;

      case 'check':
        const available = await integration.checkCCUsageAvailable();
        console.log('ccusage available:', available);
        if (available) {
          console.log('Data directory:', integration.getConversationDataDir());
        }
        break;

      case 'cache':
        const cached = integration.getCachedCosts();
        if (cached) {
          console.log('Cached data:', cached);
        } else {
          console.log('No cached data available');
        }
        break;

      default:
        console.log('Claude Cost Integration - Usage:');
        console.log(
          '  node claude-cost-integration.js report   # Generate cost report'
        );
        console.log(
          '  node claude-cost-integration.js install  # Install ccusage'
        );
        console.log(
          '  node claude-cost-integration.js check    # Check if ccusage is available'
        );
        console.log(
          '  node claude-cost-integration.js cache    # Show cached data'
        );
        break;
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Export for use as module
module.exports = { ClaudeCostIntegration };

// Run if called directly
if (require.main === module) {
  main();
}
