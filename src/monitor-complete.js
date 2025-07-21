#!/usr/bin/env node

/**
 * Complete Monitoring Dashboard
 * 
 * Comprehensive view combining:
 * - Task allocation and priorities
 * - Epic integration completion status
 * - Business value delivery tracking
 */

const { execSync } = require('child_process');
const { showEpicCompletion } = require('./show-epic-completion.js');

// Color coding
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m'
};

async function showCompleteDashboard() {
  console.log(`${colors.bright}${colors.cyan}═══════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}   COMPLETE AGENT COORDINATION & EPIC COMPLETION DASHBOARD${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}═══════════════════════════════════════════════════════════════${colors.reset}\n`);
  
  // Show Epic Completion first (most important)
  await showEpicCompletion();
  
  console.log(`\n${colors.bright}${colors.yellow}═══════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bright}${colors.yellow}   CURRENT TASK ALLOCATION & COORDINATION STATUS${colors.reset}`);
  console.log(`${colors.bright}${colors.yellow}═══════════════════════════════════════════════════════════════${colors.reset}\n`);
  
  // Show regular task monitoring
  try {
    execSync('node src/monitor-available-tasks.js', { stdio: 'inherit' });
  } catch (error) {
    console.error('Failed to load task monitoring:', error.message);
  }
  
  console.log(`\n${colors.bright}${colors.cyan}🔧 QUICK COMMANDS${colors.reset}`);
  console.log(`${colors.bright}├─ Epic status only: node src/show-epic-completion.js${colors.reset}`);
  console.log(`${colors.bright}├─ Task status only: node src/monitor-available-tasks.js${colors.reset}`);
  console.log(`${colors.bright}├─ Grab priority work: node src/grab-tasks.js <your-id> 2 --priority-only${colors.reset}`);
  console.log(`${colors.bright}└─ Complete dashboard: node src/monitor-complete.js${colors.reset}`);
}

if (require.main === module) {
  showCompleteDashboard().catch(error => {
    console.error('Dashboard error:', error.message);
    process.exit(1);
  });
}