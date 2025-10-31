#!/usr/bin/env node

/**
 * Sprint Planning Organization Script
 *
 * Analyzes 5,900 tasks across 29 epics and organizes them into
 * focused sprints based on dependencies, priorities, and logical sequences.
 *
 * Based on: Complete epic task inventory analysis
 */

const fs = require('fs').promises;
const path = require('path');

// Sprint Planning Configuration
const SPRINT_CONFIG = {
  sprintDurationWeeks: 2,
  velocityPointsPerSprint: 120, // Estimated based on team capacity
  hoursToPoints: 8, // 1 point = 8 hours of work
  maxTasksPerSprint: 50 // To prevent sprint overload
};

// Epic Priority Matrix based on dependencies and business value
const EPIC_PRIORITIES = {
  // Foundation Layer (Must complete first)
  foundation: [
    {
      epic: 6,
      name: 'Performance & Scalability',
      priority: 1,
      tasks: 173,
      dependencies: []
    },
    {
      epic: 7,
      name: 'Advanced Node Capabilities',
      priority: 1,
      tasks: 226,
      dependencies: [6]
    },
    {
      epic: 9,
      name: 'Error Handling & User Experience',
      priority: 1,
      tasks: 111,
      dependencies: [6]
    }
  ],

  // Core Infrastructure (Next priority)
  infrastructure: [
    {
      epic: 11,
      name: 'User Management & RBAC',
      priority: 2,
      tasks: 352,
      dependencies: [6, 9]
    },
    {
      epic: 14,
      name: 'Advanced Security & Authentication',
      priority: 2,
      tasks: 465,
      dependencies: [11]
    },
    {
      epic: 12,
      name: 'Data Integration & Pipeline Management',
      priority: 2,
      tasks: 424,
      dependencies: [6, 7]
    },
    {
      epic: 13,
      name: 'Performance Monitoring & Optimization',
      priority: 2,
      tasks: 473,
      dependencies: [6, 10]
    }
  ],

  // Business Logic & Features (Core value)
  businessLogic: [
    {
      epic: 10,
      name: 'Advanced Analytics & Intelligence',
      priority: 3,
      tasks: 754,
      dependencies: [6, 7, 12]
    },
    {
      epic: 17,
      name: 'Advanced Workflow & Automation',
      priority: 3,
      tasks: 554,
      dependencies: [7, 11, 12]
    },
    {
      epic: 18,
      name: 'Policy & Compliance Management',
      priority: 3,
      tasks: 513,
      dependencies: [11, 14]
    },
    {
      epic: 19,
      name: 'Policy Assignment & Configuration',
      priority: 3,
      tasks: 46,
      dependencies: [18]
    }
  ],

  // Advanced Features (Enhancement value)
  advanced: [
    {
      epic: 15,
      name: 'Internationalization & Localization',
      priority: 4,
      tasks: 450,
      dependencies: [9, 11]
    },
    {
      epic: 16,
      name: 'Advanced Testing & QA',
      priority: 4,
      tasks: 405,
      dependencies: [6, 7, 13]
    },
    {
      epic: 20,
      name: 'Advanced Monitoring & Observability',
      priority: 4,
      tasks: 1,
      dependencies: [13]
    },
    {
      epic: 22,
      name: 'Advanced Visualization & Graph Navigation',
      priority: 4,
      tasks: 2,
      dependencies: [6, 7]
    }
  ],

  // Collaboration & Integration (User experience)
  collaboration: [
    {
      epic: 23,
      name: 'Collaborative Workspaces & Real-time Co-editing',
      priority: 5,
      tasks: 41,
      dependencies: [11, 22]
    },
    {
      epic: 24,
      name: 'Custom Node & Extension Framework',
      priority: 5,
      tasks: 0,
      dependencies: [7, 14]
    },
    {
      epic: 25,
      name: 'Multi-model Orchestration & Chain Management',
      priority: 5,
      tasks: 0,
      dependencies: [12, 22]
    }
  ],

  // Cutting Edge & Research (Future innovation)
  research: [
    {
      epic: 26,
      name: 'AI Model & Training Management',
      priority: 6,
      tasks: 0,
      dependencies: [12, 14, 20]
    },
    {
      epic: 27,
      name: 'Prompt Graph Execution Runtime',
      priority: 6,
      tasks: 0,
      dependencies: [6, 10, 13]
    },
    {
      epic: 28,
      name: 'Domain-Specific Toolkits & Templates',
      priority: 6,
      tasks: 1,
      dependencies: [24, 25]
    },
    {
      epic: 29,
      name: 'Advanced LLM Research & Experimental Features',
      priority: 6,
      tasks: 0,
      dependencies: [25, 26, 27]
    }
  ]
};

// Sprint Themes and Focus Areas
const SPRINT_THEMES = [
  // Phase 1: Foundation (Sprints 1-4)
  { phase: 1, theme: 'Core Foundation', sprints: [1, 2, 3, 4] },

  // Phase 2: Infrastructure (Sprints 5-10)
  {
    phase: 2,
    theme: 'Infrastructure & Security',
    sprints: [5, 6, 7, 8, 9, 10]
  },

  // Phase 3: Business Logic (Sprints 11-18)
  {
    phase: 3,
    theme: 'Core Business Features',
    sprints: [11, 12, 13, 14, 15, 16, 17, 18]
  },

  // Phase 4: Advanced Features (Sprints 19-24)
  {
    phase: 4,
    theme: 'Advanced Capabilities',
    sprints: [19, 20, 21, 22, 23, 24]
  },

  // Phase 5: Collaboration (Sprints 25-28)
  { phase: 5, theme: 'Collaboration & Integration', sprints: [25, 26, 27, 28] },

  // Phase 6: Research & Innovation (Sprints 29-32)
  { phase: 6, theme: 'Research & Future Innovation', sprints: [29, 30, 31, 32] }
];

async function loadCurrentState() {
  const stateFile = path.join(__dirname, 'data/state.json');

  try {
    const stateData = await fs.readFile(stateFile, 'utf8');
    return JSON.parse(stateData);
  } catch (error) {
    throw new Error(`Failed to load state.json: ${error.message}`);
  }
}

function analyzeTasksByEpic(state) {
  const epicAnalysis = {};

  // Initialize all epics
  Object.values(EPIC_PRIORITIES)
    .flat()
    .forEach(epic => {
      epicAnalysis[epic.epic] = {
        name: epic.name,
        totalTasks: 0,
        highPriorityTasks: 0,
        mediumPriorityTasks: 0,
        lowPriorityTasks: 0,
        totalEstimatedHours: 0,
        totalStoryPoints: 0,
        tasks: []
      };
    });

  // Analyze all tasks
  Object.values(state.tasks).forEach(task => {
    // Extract epic number from various metadata sources
    let epicNum = null;

    if (task.metadata?.source?.includes('epic')) {
      const match = task.metadata.source.match(/epic(\d+)/);
      if (match) {epicNum = parseInt(match[1]);}
    }

    if (task.id?.includes('E')) {
      const match = task.id.match(/E(\d+)-/);
      if (match) {epicNum = parseInt(match[1]);}
    }

    if (epicNum && epicAnalysis[epicNum]) {
      const epic = epicAnalysis[epicNum];
      epic.totalTasks++;
      epic.tasks.push(task);

      // Analyze priority
      if (task.priority === 'high') {epic.highPriorityTasks++;}
      else if (task.priority === 'medium') {epic.mediumPriorityTasks++;}
      else {epic.lowPriorityTasks++;}

      // Calculate estimated hours and story points
      const hours = parseFloat(task.estimate?.replace(' hours', '')) || 4;
      epic.totalEstimatedHours += hours;
      epic.totalStoryPoints += Math.ceil(hours / SPRINT_CONFIG.hoursToPoints);
    }
  });

  return epicAnalysis;
}

function generateSprintPlan(epicAnalysis) {
  const sprints = [];
  const allEpics = Object.values(EPIC_PRIORITIES).flat();

  // Create dependency graph
  const dependencyGraph = {};
  allEpics.forEach(epic => {
    dependencyGraph[epic.epic] = {
      ...epic,
      analysis: epicAnalysis[epic.epic],
      completed: false,
      assigned: false
    };
  });

  // Process each phase
  SPRINT_THEMES.forEach(phase => {
    console.log(`\n🎯 PHASE ${phase.phase}: ${phase.theme.toUpperCase()}`);
    console.log('='.repeat(60));

    phase.sprints.forEach(sprintNum => {
      const sprint = {
        number: sprintNum,
        phase: phase.phase,
        theme: phase.theme,
        epics: [],
        totalStoryPoints: 0,
        totalTasks: 0,
        totalHours: 0,
        focus: '',
        keyDeliverables: []
      };

      // Find epics ready for this sprint (dependencies satisfied)
      const availableEpics = allEpics.filter(epic => {
        const epicData = dependencyGraph[epic.epic];
        if (epicData.assigned || epicData.analysis.totalTasks === 0)
          {return false;}

        // Check if all dependencies are completed
        const depsCompleted = epic.dependencies.every(
          dep =>
            dependencyGraph[dep]?.completed ||
            dependencyGraph[dep]?.analysis.totalTasks === 0
        );

        return depsCompleted && epic.priority <= phase.phase + 2; // Allow some flexibility
      });

      // Sort by priority and task count
      availableEpics.sort((a, b) => {
        if (a.priority !== b.priority) {return a.priority - b.priority;}
        return b.tasks - a.tasks; // Larger epics first within same priority
      });

      // Assign epics to sprint based on capacity
      let remainingCapacity = SPRINT_CONFIG.velocityPointsPerSprint;

      availableEpics.forEach(epic => {
        const analysis = epicAnalysis[epic.epic];
        if (analysis && analysis.totalStoryPoints > 0) {
          const epicPortionPoints = Math.min(
            analysis.totalStoryPoints,
            remainingCapacity
          );
          const epicPortionTasks = Math.ceil(
            (epicPortionPoints / analysis.totalStoryPoints) *
              analysis.totalTasks
          );

          if (epicPortionPoints >= 10) {
            // Minimum viable chunk
            sprint.epics.push({
              epic: epic.epic,
              name: epic.name,
              portionStoryPoints: epicPortionPoints,
              portionTasks: epicPortionTasks,
              isPartial: epicPortionPoints < analysis.totalStoryPoints
            });

            sprint.totalStoryPoints += epicPortionPoints;
            sprint.totalTasks += epicPortionTasks;
            sprint.totalHours +=
              epicPortionPoints * SPRINT_CONFIG.hoursToPoints;

            remainingCapacity -= epicPortionPoints;

            // Mark epic as completed if fully assigned
            if (epicPortionPoints >= analysis.totalStoryPoints) {
              dependencyGraph[epic.epic].completed = true;
              dependencyGraph[epic.epic].assigned = true;
            }
          }
        }
      });

      // Generate sprint focus and deliverables
      if (sprint.epics.length > 0) {
        sprint.focus = generateSprintFocus(sprint);
        sprint.keyDeliverables = generateKeyDeliverables(sprint);
        sprints.push(sprint);
      }
    });
  });

  return sprints;
}

function generateSprintFocus(sprint) {
  const epicNames = sprint.epics.map(e => e.name);

  if (sprint.phase === 1) {
    return `Foundation development focusing on ${epicNames.join(', ')}. Critical infrastructure and core capabilities.`;
  } else if (sprint.phase === 2) {
    return `Infrastructure hardening with ${epicNames.join(', ')}. Security, scalability, and data management.`;
  } else if (sprint.phase === 3) {
    return `Core business logic implementation: ${epicNames.join(', ')}. User-facing features and workflow automation.`;
  } else if (sprint.phase === 4) {
    return `Advanced feature development: ${epicNames.join(', ')}. Quality, monitoring, and enhanced capabilities.`;
  } else if (sprint.phase === 5) {
    return `Collaboration and integration: ${epicNames.join(', ')}. Real-time features and extension frameworks.`;
  } else {
    return `Research and innovation: ${epicNames.join(', ')}. Cutting-edge capabilities and experimental features.`;
  }
}

function generateKeyDeliverables(sprint) {
  const deliverables = [];

  sprint.epics.forEach(epic => {
    if (epic.epic === 6)
      {deliverables.push(
        'Performance optimization framework',
        'Scalability architecture'
      );}
    else if (epic.epic === 7)
      {deliverables.push('Advanced node system', 'Node execution engine');}
    else if (epic.epic === 9)
      {deliverables.push(
        'Error handling system',
        'User experience improvements'
      );}
    else if (epic.epic === 10)
      {deliverables.push('Analytics dashboard', 'Intelligence features');}
    else if (epic.epic === 11)
      {deliverables.push('User management system', 'RBAC implementation');}
    else if (epic.epic === 12)
      {deliverables.push('Data integration pipelines', 'ETL framework');}
    else if (epic.epic === 13)
      {deliverables.push('Performance monitoring', 'Optimization tools');}
    else if (epic.epic === 14)
      {deliverables.push('Security framework', 'Authentication system');}
    else if (epic.epic === 15)
      {deliverables.push('I18n/L10n system', 'Multi-language support');}
    else if (epic.epic === 16)
      {deliverables.push('Testing framework', 'QA automation');}
    else if (epic.epic === 17)
      {deliverables.push('Workflow engine', 'Automation features');}
    else if (epic.epic === 18)
      {deliverables.push('Policy management', 'Compliance tools');}
    else if (epic.epic === 19)
      {deliverables.push('Policy configuration', 'Assignment tools');}
    else if (epic.epic === 20)
      {deliverables.push('Advanced monitoring', 'Observability tools');}
    else if (epic.epic === 22)
      {deliverables.push('Graph visualization', 'Navigation tools');}
    else if (epic.epic === 23)
      {deliverables.push('Real-time collaboration', 'Workspace features');}
    else {deliverables.push(`${epic.name} core features`);}
  });

  return deliverables.slice(0, 5); // Limit to top 5 deliverables per sprint
}

async function createSprintPlan() {
  console.log('📋 PROMPT-SPAGHETTI SPRINT PLANNING ORGANIZATION');
  console.log('='.repeat(80));
  console.log(
    '🎯 Organizing 5,900 tasks across 29 epics into focused sprints\n'
  );

  try {
    // Load current state
    const state = await loadCurrentState();

    // Analyze tasks by epic
    console.log('📊 Analyzing task distribution across epics...\n');
    const epicAnalysis = analyzeTasksByEpic(state);

    // Generate sprint plan
    console.log(
      '🗓️  Generating sprint plan with dependencies and priorities...\n'
    );
    const sprints = generateSprintPlan(epicAnalysis);

    // Output comprehensive sprint plan
    console.log('🚀 COMPREHENSIVE SPRINT PLAN');
    console.log('='.repeat(80));

    sprints.forEach(sprint => {
      console.log(
        `\n📅 SPRINT ${sprint.number} (Phase ${sprint.phase}): ${sprint.theme}`
      );
      console.log('-'.repeat(60));
      console.log(`🎯 Focus: ${sprint.focus}`);
      console.log(
        `📊 Capacity: ${sprint.totalStoryPoints} story points | ${sprint.totalTasks} tasks | ${sprint.totalHours} hours`
      );

      console.log('\n📋 EPICS IN THIS SPRINT:');
      sprint.epics.forEach(epic => {
        const status = epic.isPartial ? '(PARTIAL)' : '(COMPLETE)';
        console.log(`   • Epic ${epic.epic}: ${epic.name} ${status}`);
        console.log(
          `     └─ ${epic.portionTasks} tasks, ${epic.portionStoryPoints} story points`
        );
      });

      console.log('\n🎯 KEY DELIVERABLES:');
      sprint.keyDeliverables.forEach(deliverable => {
        console.log(`   ✅ ${deliverable}`);
      });

      console.log('');
    });

    // Summary statistics
    const totalSprints = sprints.length;
    const totalStoryPoints = sprints.reduce(
      (sum, s) => sum + s.totalStoryPoints,
      0
    );
    const totalTasksPlanned = sprints.reduce((sum, s) => sum + s.totalTasks, 0);
    const totalHoursPlanned = sprints.reduce((sum, s) => sum + s.totalHours, 0);
    const estimatedWeeks = totalSprints * SPRINT_CONFIG.sprintDurationWeeks;
    const estimatedMonths = Math.ceil(estimatedWeeks / 4);

    console.log('\n📈 SPRINT PLAN SUMMARY');
    console.log('='.repeat(60));
    console.log(`📅 Total Sprints: ${totalSprints}`);
    console.log(
      `⏱️  Estimated Duration: ${estimatedWeeks} weeks (${estimatedMonths} months)`
    );
    console.log(`📊 Total Story Points: ${totalStoryPoints}`);
    console.log(`📋 Total Tasks: ${totalTasksPlanned} of 5,900`);
    console.log(`⏰ Total Hours: ${totalHoursPlanned}`);
    console.log(
      `👥 Team Velocity: ${SPRINT_CONFIG.velocityPointsPerSprint} points per sprint`
    );

    console.log('\n🎯 PHASE BREAKDOWN:');
    SPRINT_THEMES.forEach(phase => {
      const phaseSprints = sprints.filter(s => s.phase === phase.phase);
      const phasePoints = phaseSprints.reduce(
        (sum, s) => sum + s.totalStoryPoints,
        0
      );
      const phaseWeeks =
        phaseSprints.length * SPRINT_CONFIG.sprintDurationWeeks;
      console.log(
        `   Phase ${phase.phase}: ${phase.theme} - ${phaseSprints.length} sprints, ${phaseWeeks} weeks, ${phasePoints} points`
      );
    });

    console.log('\n🚀 RECOMMENDED NEXT ACTIONS:');
    console.log(
      '1. 🎯 Start Sprint 1: Focus on Epic 6 (Performance & Scalability)'
    );
    console.log(
      '2. 🔄 Use: `node src/grab-tasks.js <agent-id>` to assign Epic 6 tasks'
    );
    console.log(
      '3. 📋 Filter by tags: "performance", "scalability", "optimization"'
    );
    console.log(
      '4. ⏰ Sprint cadence: 2-week sprints with regular retrospectives'
    );
    console.log(
      '5. 📊 Track velocity and adjust capacity planning based on team performance'
    );

    console.log(
      '\n✨ Sprint planning complete! Ready for systematic execution.'
    );

    return {
      totalSprints,
      estimatedDuration: { weeks: estimatedWeeks, months: estimatedMonths },
      totalStoryPoints,
      totalTasksPlanned,
      sprints,
      phases: SPRINT_THEMES.length
    };
  } catch (error) {
    console.error('❌ Failed to create sprint plan:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  createSprintPlan().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = {
  createSprintPlan,
  EPIC_PRIORITIES,
  SPRINT_THEMES,
  SPRINT_CONFIG
};
