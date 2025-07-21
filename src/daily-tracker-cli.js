#!/usr/bin/env node

/**
 * Daily Ticket Tracker CLI
 * 
 * Command-line interface for the Daily Ticket Tracker utility.
 * Provides commands to track tickets, view stats, and manage the system.
 */

const DailyTicketTracker = require('./utils/DailyTicketTracker');

class DailyTrackerCLI {
  constructor() {
    this.tracker = new DailyTicketTracker();
  }

  async initialize() {
    await this.tracker.initialize();
  }

  async run() {
    const args = process.argv.slice(2);
    const command = args[0];

    try {
      await this.initialize();

      switch (command) {
        case 'track-approval':
          await this.trackApproval(args[1], args[2]);
          break;
        case 'track-push':
          await this.trackPush(args[1], args[2], args[3]);
          break;
        case 'stats':
          await this.showStats(args[1]);
          break;
        case 'report':
          await this.generateReport(args[1] === '--timeline');
          break;
        case 'history':
          await this.showHistory(parseInt(args[1]) || 7);
          break;
        case 'reset':
          await this.resetTracker();
          break;
        case 'config':
          await this.showConfig();
          break;
        case 'monitor':
          await this.startMonitor();
          break;
        case 'help':
        default:
          this.showHelp();
          break;
      }
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  }

  async trackApproval(ticketId, agentId = 'manual') {
    if (!ticketId) {
      console.error('❌ Ticket ID required');
      return;
    }

    await this.tracker.trackApproval(ticketId, agentId);
    console.log(`✅ Tracked approval: ${ticketId} by ${agentId}`);
    await this.showQuickStats();
  }

  async trackPush(ticketsInput, agentId = 'manual', commitHash = '') {
    if (!ticketsInput) {
      console.error('❌ Ticket ID(s) required');
      return;
    }

    const ticketIds = ticketsInput.includes(',') 
      ? ticketsInput.split(',').map(id => id.trim())
      : [ticketsInput];

    await this.tracker.trackPush(ticketIds, agentId, commitHash);
    console.log(`🚀 Tracked push: ${ticketIds.length} ticket(s) by ${agentId}`);
    if (commitHash) {
      console.log(`   Commit: ${commitHash}`);
    }
    await this.showQuickStats();
  }

  async showStats(format = 'summary') {
    const stats = this.tracker.getCurrentStats();

    if (format === 'detailed') {
      console.log('\n📊 DETAILED DAILY STATISTICS');
      console.log('═'.repeat(50));
      console.log(`Date: ${stats.date}`);
      console.log(`Total Tickets: ${stats.total} (${stats.approved} approved + ${stats.pushed} pushed)`);
      console.log(`Active Agents: ${stats.agents.count}`);
      console.log(`Session Duration: ${stats.session.hoursActive} hours`);
      console.log(`Productivity: ${stats.session.avgTicketsPerHour} tickets/hour`);
      console.log(`Last Update: ${stats.lastUpdate.toLocaleTimeString()}`);

      if (stats.agents.count > 0) {
        console.log('\n👥 AGENT BREAKDOWN:');
        console.log('-'.repeat(30));
        Object.entries(stats.agents.breakdown).forEach(([agent, data]) => {
          console.log(`${agent}: ${data.total} total (${data.approved} approved, ${data.pushed} pushed)`);
        });
      }

      if (stats.timeline.length > 0) {
        console.log('\n⏰ RECENT ACTIVITY:');
        console.log('-'.repeat(30));
        stats.timeline.slice(-5).forEach(event => {
          const time = new Date(event.timestamp).toLocaleTimeString();
          const type = event.type === 'approval' ? '📋' : '🚀';
          console.log(`${time} ${type} ${event.type} by ${event.agentId}`);
        });
      }
    } else {
      await this.showQuickStats();
    }
  }

  async showQuickStats() {
    const stats = this.tracker.getCurrentStats();
    console.log(`\n📊 Today (${stats.date}): ${stats.total} tickets | ${stats.approved} approved | ${stats.pushed} pushed | ${stats.agents.count} agents`);
  }

  async generateReport(includeTimeline = false) {
    console.log('\n📋 GENERATING DAILY REPORT...');
    const report = await this.tracker.generateDailyReport(includeTimeline);

    console.log('\n📊 DAILY TICKET REPORT');
    console.log('═'.repeat(50));
    console.log(`Date: ${report.summary.date}`);
    console.log(`Total Tickets: ${report.summary.total}`);
    console.log(`├─ Approved: ${report.summary.approved}`);
    console.log(`└─ Pushed: ${report.summary.pushed}`);
    console.log(`Active Agents: ${report.summary.activeAgents}`);
    console.log(`Productivity: ${report.summary.productivity} tickets/hour`);

    if (report.milestones.length > 0) {
      console.log('\n🏆 MILESTONES ACHIEVED:');
      report.milestones.forEach(milestone => {
        console.log(`   • ${milestone}`);
      });
    }

    if (report.historical) {
      console.log('\n📈 7-DAY TREND:');
      console.log(`Total: ${report.historical.total} tickets`);
      console.log(`Average: ${report.historical.avgPerDay} tickets/day`);
      console.log(`Trend: ${report.historical.trend}`);
    }

    if (Object.keys(report.agents).length > 0) {
      console.log('\n👥 TOP AGENTS TODAY:');
      const sortedAgents = Object.entries(report.agents)
        .sort(([,a], [,b]) => b.total - a.total)
        .slice(0, 5);
      
      sortedAgents.forEach(([agent, data], index) => {
        const rank = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'][index] || '•';
        console.log(`   ${rank} ${agent}: ${data.total} tickets`);
      });
    }

    if (includeTimeline && report.timeline) {
      console.log('\n⏰ ACTIVITY TIMELINE:');
      console.log('-'.repeat(30));
      report.timeline.forEach(event => {
        const time = new Date(event.timestamp).toLocaleTimeString();
        const type = event.type === 'approval' ? '📋' : '🚀';
        const details = event.type === 'push' && event.count > 1 
          ? ` (${event.count} tickets)` 
          : '';
        console.log(`${time} ${type} ${event.type} by ${event.agentId}${details}`);
      });
    }

    console.log(`\nReport generated at: ${report.timestamp.toLocaleString()}`);
  }

  async showHistory(days = 7) {
    console.log(`\n📚 SHOWING LAST ${days} DAYS`);
    const history = await this.tracker.getHistoricalStats(days);

    if (!history || history.days === 0) {
      console.log('No historical data available.');
      return;
    }

    console.log('═'.repeat(50));
    console.log(`Period: ${history.days} days`);
    console.log(`Total Tickets: ${history.total}`);
    console.log(`Average per Day: ${history.avgPerDay}`);
    console.log(`Trend: ${history.trend}`);

    console.log('\n📅 DAILY BREAKDOWN:');
    console.log('-'.repeat(40));
    history.dailyBreakdown.forEach(day => {
      const bar = '█'.repeat(Math.min(Math.floor(day.total / 5), 20));
      console.log(`${day.date}: ${day.total.toString().padStart(3)} ${bar}`);
    });
  }

  async resetTracker() {
    console.log('⚠️  WARNING: This will reset today\'s counters!');
    
    // Simple confirmation
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const answer = await new Promise(resolve => {
      rl.question('Continue? (y/N): ', resolve);
    });
    rl.close();

    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      await this.tracker.manualReset();
      console.log('✅ Tracker reset complete');
    } else {
      console.log('❌ Reset cancelled');
    }
  }

  async showConfig() {
    console.log('\n⚙️  TRACKER CONFIGURATION:');
    console.log('═'.repeat(30));
    console.log(`Tracking Enabled: ${this.tracker.config.trackingEnabled}`);
    console.log(`Reset Time: ${this.tracker.config.resetTime} CT`);
    console.log(`Retention Days: ${this.tracker.config.retentionDays}`);
    console.log(`Notifications: ${this.tracker.config.enableNotifications}`);
    console.log(`Detailed Logging: ${this.tracker.config.detailedLogging}`);
  }

  async startMonitor() {
    console.log('👀 Starting live monitor... (Press Ctrl+C to stop)');
    console.log('═'.repeat(50));

    // Show initial stats
    await this.showStats('detailed');

    // Set up interval to show updates
    const interval = setInterval(async () => {
      process.stdout.write('\r' + ' '.repeat(80) + '\r'); // Clear line
      const stats = this.tracker.getCurrentStats();
      process.stdout.write(`📊 Live: ${stats.total} tickets | ${stats.agents.count} agents | ${stats.session.avgTicketsPerHour}/hr | ${new Date().toLocaleTimeString()}`);
    }, 5000);

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      clearInterval(interval);
      console.log('\n\n✅ Monitor stopped');
      process.exit(0);
    });
  }

  showHelp() {
    console.log(`
📊 Daily Ticket Tracker CLI

USAGE:
  node daily-tracker-cli.js <command> [options]

COMMANDS:
  track-approval <ticketId> [agentId]     Track a ticket approval
  track-push <ticketId(s)> [agentId] [commit]  Track ticket push/commit
  stats [detailed]                       Show current day statistics
  report [--timeline]                    Generate comprehensive report
  history [days]                         Show historical statistics
  reset                                  Manually reset daily counters
  config                                 Show configuration
  monitor                                Start live monitoring
  help                                   Show this help

EXAMPLES:
  node daily-tracker-cli.js track-approval T-123 claude-dev
  node daily-tracker-cli.js track-push T-123,T-124 BMad abc123def
  node daily-tracker-cli.js stats detailed
  node daily-tracker-cli.js report --timeline
  node daily-tracker-cli.js history 14
  node daily-tracker-cli.js monitor

The tracker automatically resets at midnight Central Time each day.
All data is stored in src/data/ directory.
`);
  }
}

// Run CLI if called directly
if (require.main === module) {
  const cli = new DailyTrackerCLI();
  cli.run().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = DailyTrackerCLI;