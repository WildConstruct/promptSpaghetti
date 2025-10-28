#!/usr/bin/env node

/**
 * Show Deployment Blocker Tasks
 *
 * Displays the current status of all 7 critical deployment blocker tasks
 * and provides instructions for agents to grab and work on them.
 */

const fs = require('fs');
const path = require('path');

function showDeploymentBlockers() {
  const statePath = path.join(__dirname, 'data', 'state.json');

  try {
    const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));

    console.log('🚨 DEPLOYMENT BLOCKER TASKS STATUS\n');
    console.log(
      '💥 CRITICAL: 5000+ TypeScript errors blocking authentication deployment'
    );
    console.log(
      '⚡ These 7 tasks MUST be completed before system can deploy\n'
    );

    const blockers = Object.values(state.tasks)
      .filter(t => t.metadata && t.metadata.category === 'deployment-blocker')
      .sort((a, b) => {
        // Sort by priority: foundational first
        const aFoundational = ['TYPES-DB-001', 'TYPES-AUTH-001'].includes(
          a.metadata?.taskCode
        );
        const bFoundational = ['TYPES-DB-001', 'TYPES-AUTH-001'].includes(
          b.metadata?.taskCode
        );

        if (aFoundational && !bFoundational) return -1;
        if (!aFoundational && bFoundational) return 1;

        return (a.metadata?.taskCode || '').localeCompare(
          b.metadata?.taskCode || ''
        );
      });

    if (blockers.length === 0) {
      console.log('❌ No deployment blocker tasks found!');
      console.log('Run: node src/create-deployment-blocker-tasks.js');
      return;
    }

    console.log('🔗 CRITICAL DEPENDENCY CHAIN:\n');

    // Show foundational tasks
    console.log('📍 FOUNDATIONAL TASKS (Start with these first):');
    const foundational = blockers.filter(t =>
      ['TYPES-DB-001', 'TYPES-AUTH-001'].includes(t.metadata?.taskCode)
    );

    foundational.forEach(t => {
      const status =
        t.state === 'UNASSIGNED'
          ? '🔴 UNASSIGNED'
          : t.state === 'IN_PROGRESS'
            ? '🟡 IN PROGRESS'
            : t.state === 'DONE'
              ? '✅ COMPLETE'
              : `🔵 ${t.state}`;

      console.log(`   ${status} ${t.id}: ${t.metadata?.taskCode}`);
      console.log(`      "${t.title}"`);
      console.log(`      ⏱️  ${t.estimate} | Assignee: ${t.assignee}`);
      console.log(`      🎯 ${t.businessValue.slice(0, 80)}...`);
      console.log('');
    });

    // Show infrastructure tasks
    console.log('📍 INFRASTRUCTURE TASKS (After foundation complete):');
    const infrastructure = blockers.filter(t =>
      [
        'FASTIFY-PLUGIN-001',
        'SECURITY-TYPES-001',
        'EXPORT-CONFLICTS-001'
      ].includes(t.metadata?.taskCode)
    );

    infrastructure.forEach(t => {
      const status =
        t.state === 'UNASSIGNED'
          ? '🔴 UNASSIGNED'
          : t.state === 'IN_PROGRESS'
            ? '🟡 IN PROGRESS'
            : t.state === 'DONE'
              ? '✅ COMPLETE'
              : `🔵 ${t.state}`;

      console.log(`   ${status} ${t.id}: ${t.metadata?.taskCode}`);
      console.log(`      "${t.title}"`);
      console.log(
        `      ⏱️  ${t.estimate} | Dependencies: ${t.dependencies.join(', ') || 'None'}`
      );
      console.log(`      Assignee: ${t.assignee}`);
      console.log('');
    });

    // Show feature tasks
    console.log('📍 FEATURE TASKS (Can be parallel):');
    const features = blockers.filter(t =>
      ['TEMPLATE-PARSER-001', 'VFX-TYPES-001'].includes(t.metadata?.taskCode)
    );

    features.forEach(t => {
      const status =
        t.state === 'UNASSIGNED'
          ? '🔴 UNASSIGNED'
          : t.state === 'IN_PROGRESS'
            ? '🟡 IN PROGRESS'
            : t.state === 'DONE'
              ? '✅ COMPLETE'
              : `🔵 ${t.state}`;

      console.log(`   ${status} ${t.id}: ${t.metadata?.taskCode}`);
      console.log(`      "${t.title}"`);
      console.log(
        `      ⏱️  ${t.estimate} | Dependencies: ${t.dependencies.join(', ') || 'None'}`
      );
      console.log(`      Assignee: ${t.assignee}`);
      console.log('');
    });

    // Summary statistics
    const unassigned = blockers.filter(t => t.state === 'UNASSIGNED').length;
    const inProgress = blockers.filter(t => t.state === 'IN_PROGRESS').length;
    const completed = blockers.filter(
      t => t.state === 'DONE' || t.state === 'COMPLETED'
    ).length;

    console.log('📊 DEPLOYMENT BLOCKER SUMMARY:');
    console.log(`   🔴 Unassigned: ${unassigned}/7`);
    console.log(`   🟡 In Progress: ${inProgress}/7`);
    console.log(`   ✅ Completed: ${completed}/7`);
    console.log('');

    // Agent instructions
    console.log('🤖 AGENT INSTRUCTIONS:\n');
    console.log(
      '1. 🔥 HIGHEST PRIORITY: Grab deployment blocker tasks immediately'
    );
    console.log(
      '2. 📍 Start with foundational: TYPES-DB-001 and TYPES-AUTH-001'
    );
    console.log(
      '3. 📝 To grab tasks: node src/grab-tasks.js <your-agent-id> 1'
    );
    console.log('4. 🔍 Look for task IDs starting with DEPLOY-');
    console.log('5. ✅ When complete: node src/finish-task.js <task-id>\n');

    console.log('⚡ CRITICAL SUCCESS CRITERIA:');
    console.log('   🎯 TypeScript compilation completes without errors');
    console.log('   🚀 Authentication system can deploy to production');
    console.log(
      '   🔐 Login/registration flows work in deployed environment\n'
    );

    if (unassigned === 7) {
      console.log('🚨 ALL TASKS UNASSIGNED - IMMEDIATE ACTION REQUIRED');
    } else if (unassigned > 0) {
      console.log(`⚠️  ${unassigned} critical tasks still need assignment`);
    } else if (completed < 7) {
      console.log(`🟡 ${7 - completed} tasks in progress - monitor completion`);
    } else {
      console.log('🎉 ALL DEPLOYMENT BLOCKERS COMPLETE!');
    }
  } catch (error) {
    console.error(
      '❌ Failed to load deployment blocker status:',
      error.message
    );
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  showDeploymentBlockers();
}

module.exports = { showDeploymentBlockers };
