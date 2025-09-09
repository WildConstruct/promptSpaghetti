#!/usr/bin/env node

/**
 * Create Utility Tasks Script
 *
 * Automatically creates tickets in the task management system for all
 * utility implementation tasks identified for agent productivity improvement.
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

// Utility task definitions
const utilityTasks = [
  {
    title: 'Build alerts for classification policy violations',
    description:
      'Create alerting system for data classification policy violations with real-time monitoring. Includes: policy validation, violation detection, alert routing, and compliance reporting.',
    estimate: '4 hours',
    priority: 'high',
    wipClass: 'infrastructure',
    epic: 'Security & Compliance',
    story: 'Automated Security Monitoring',
    tags: ['security', 'alerts', 'compliance', 'monitoring'],
    acceptanceCriteria: [
      'Policy violation detection in real-time',
      'Configurable alert thresholds and routing',
      'Compliance reporting dashboard',
      'Integration with existing logging systems'
    ]
  },
  {
    title: 'Build automated QA pre-check utility',
    description:
      'Validate code syntax, TypeScript errors, test coverage, and security patterns before QA submission. Includes: syntax validation, test coverage analysis, security scanning, and quality metrics.',
    estimate: '3 hours',
    priority: 'high',
    wipClass: 'tooling',
    epic: 'Development Tools',
    story: 'QA Process Automation',
    tags: ['qa', 'validation', 'automation', 'quality'],
    acceptanceCriteria: [
      'Syntax and TypeScript error detection',
      'Test coverage validation with configurable thresholds',
      'Security pattern scanning',
      'Detailed reporting with recommendations'
    ]
  },
  {
    title: 'Create agent productivity dashboard',
    description:
      'Track completion rates, task times, bottlenecks, and team performance metrics. Includes: agent performance tracking, productivity analytics, bottleneck identification, and team insights.',
    estimate: '5 hours',
    priority: 'medium',
    wipClass: 'feature',
    epic: 'Agent Management',
    story: 'Performance Analytics',
    tags: ['dashboard', 'analytics', 'productivity', 'metrics'],
    acceptanceCriteria: [
      'Real-time agent productivity metrics',
      'Task completion rate tracking',
      'Bottleneck identification and visualization',
      'Team performance comparisons and trends'
    ]
  },
  {
    title: 'Build task dependency resolver',
    description:
      'Detect task dependencies, visualize chains, identify blockers, suggest optimal ordering. Includes: dependency analysis, visualization tools, blocker detection, and workflow optimization.',
    estimate: '4 hours',
    priority: 'medium',
    wipClass: 'feature',
    epic: 'Task Management',
    story: 'Dependency Management',
    tags: ['dependencies', 'workflow', 'optimization', 'visualization'],
    acceptanceCriteria: [
      'Automatic dependency detection between tasks',
      'Visual dependency chain mapping',
      'Blocker identification and alerts',
      'Optimal task ordering recommendations'
    ]
  },
  {
    title: 'Create conflict resolution assistant',
    description:
      'Detect code overlaps, suggest merge strategies, automate simple conflict resolution. Includes: overlap detection, merge strategy recommendations, automated resolution, and conflict prevention.',
    estimate: '4 hours',
    priority: 'medium',
    wipClass: 'tooling',
    epic: 'Development Tools',
    story: 'Conflict Management',
    tags: ['git', 'conflicts', 'merging', 'automation'],
    acceptanceCriteria: [
      'Code overlap detection between concurrent tasks',
      'Merge strategy recommendations',
      'Automated resolution for simple conflicts',
      'Conflict prevention suggestions'
    ]
  },
  {
    title: 'Build test case generator',
    description:
      'Analyze task requirements and automatically generate comprehensive test cases. Includes: requirement analysis, test case generation, coverage optimization, and integration with testing frameworks.',
    estimate: '3 hours',
    priority: 'medium',
    wipClass: 'tooling',
    epic: 'Development Tools',
    story: 'Test Automation',
    tags: ['testing', 'automation', 'generation', 'coverage'],
    acceptanceCriteria: [
      'Requirement parsing and analysis',
      'Automated test case generation',
      'Test coverage optimization',
      'Integration with Jest and testing frameworks'
    ]
  },
  {
    title: 'Build code quality scanner',
    description:
      'Pre-commit hooks, code smell detection, performance optimization suggestions. Includes: quality metrics, code smell analysis, performance profiling, and automated recommendations.',
    estimate: '3 hours',
    priority: 'medium',
    wipClass: 'tooling',
    epic: 'Development Tools',
    story: 'Code Quality Automation',
    tags: ['quality', 'linting', 'performance', 'hooks'],
    acceptanceCriteria: [
      'Pre-commit quality checks and hooks',
      'Code smell detection and reporting',
      'Performance optimization suggestions',
      'Integration with CI/CD pipeline'
    ]
  },
  {
    title: 'Create agent workload balancer',
    description:
      'Automatically distribute tasks based on capacity, expertise, and load balancing. Includes: capacity monitoring, skill matching, load distribution algorithms, and workload optimization.',
    estimate: '5 hours',
    priority: 'medium',
    wipClass: 'feature',
    epic: 'Agent Management',
    story: 'Workload Distribution',
    tags: ['balancing', 'capacity', 'distribution', 'optimization'],
    acceptanceCriteria: [
      'Agent capacity and skill monitoring',
      'Intelligent task distribution algorithms',
      'Load balancing across team members',
      'Workload optimization recommendations'
    ]
  },
  {
    title: 'Create integration health monitor',
    description:
      'Monitor all automated systems, alert on failures, health dashboard. Includes: system monitoring, failure detection, health metrics, and operational dashboards.',
    estimate: '3 hours',
    priority: 'medium',
    wipClass: 'infrastructure',
    epic: 'System Operations',
    story: 'Health Monitoring',
    tags: ['monitoring', 'health', 'alerts', 'infrastructure'],
    acceptanceCriteria: [
      'Automated system health monitoring',
      'Failure detection and alerting',
      'Health metrics dashboard',
      'Integration status tracking'
    ]
  },
  {
    title: 'Create knowledge base indexer',
    description:
      'Extract patterns and solutions from completed tasks, build searchable FAQ system. Includes: pattern extraction, knowledge mining, search indexing, and FAQ generation.',
    estimate: '4 hours',
    priority: 'low',
    wipClass: 'feature',
    epic: 'Knowledge Management',
    story: 'Automated Documentation',
    tags: ['knowledge', 'indexing', 'search', 'documentation'],
    acceptanceCriteria: [
      'Pattern extraction from completed tasks',
      'Searchable knowledge base with FAQ',
      'Automated solution indexing',
      'Similar problem detection and suggestions'
    ]
  },
  {
    title: 'Create environment setup automator',
    description:
      'One-command dev environment setup with dependency resolution. Includes: environment configuration, dependency management, setup automation, and containerization.',
    estimate: '3 hours',
    priority: 'low',
    wipClass: 'tooling',
    epic: 'Development Tools',
    story: 'Environment Automation',
    tags: ['setup', 'environment', 'automation', 'docker'],
    acceptanceCriteria: [
      'One-command environment setup',
      'Automatic dependency resolution',
      'Containerized development environments',
      'Cross-platform compatibility'
    ]
  },
  {
    title: 'Build task estimation improver',
    description:
      'Learn from completion times vs estimates, suggest accurate time estimates. Includes: time tracking analysis, estimation algorithms, accuracy improvement, and predictive modeling.',
    estimate: '3 hours',
    priority: 'low',
    wipClass: 'feature',
    epic: 'Task Management',
    story: 'Estimation Intelligence',
    tags: ['estimation', 'learning', 'prediction', 'analytics'],
    acceptanceCriteria: [
      'Historical time vs estimate analysis',
      'Improved estimation algorithms',
      'Predictive time modeling',
      'Estimation accuracy tracking'
    ]
  },
  {
    title: 'Build documentation auto-generator',
    description:
      'Generate API docs, update READMEs, create changelogs from commits. Includes: API documentation generation, README automation, changelog creation, and documentation maintenance.',
    estimate: '3 hours',
    priority: 'low',
    wipClass: 'tooling',
    epic: 'Development Tools',
    story: 'Documentation Automation',
    tags: ['documentation', 'automation', 'api', 'changelog'],
    acceptanceCriteria: [
      'Automated API documentation generation',
      'README file maintenance and updates',
      'Automatic changelog creation from commits',
      'Documentation synchronization with code changes'
    ]
  }
];

async function createUtilityTasks() {
  console.log('🎫 Creating utility implementation tasks...\n');

  try {
    // Load current state
    const stateFile = path.join(__dirname, 'data/state.json');
    let state;

    try {
      const stateData = await fs.readFile(stateFile, 'utf8');
      state = JSON.parse(stateData);
    } catch (error) {
      // Create new state if file doesn't exist
      state = {
        tasks: {},
        metadata: {
          created: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        }
      };
    }

    if (!state.tasks) {
      state.tasks = {};
    }

    let tasksCreated = 0;
    let tasksSkipped = 0;

    for (const taskDef of utilityTasks) {
      // Generate task ID
      const taskId = `T-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;

      // Check if similar task already exists
      const existingTask = Object.values(state.tasks).find(
        task =>
          task.title && task.title.toLowerCase() === taskDef.title.toLowerCase()
      );

      if (existingTask) {
        console.log(
          `⏭️  Skipping "${taskDef.title}" - similar task exists (${existingTask.id || 'unknown ID'})`
        );
        tasksSkipped++;
        continue;
      }

      // Create task object
      const task = {
        id: taskId,
        title: taskDef.title,
        description: taskDef.description,
        state: 'TODO',
        priority: taskDef.priority,
        estimate: taskDef.estimate,
        wipClass: taskDef.wipClass,
        epic: taskDef.epic,
        story: taskDef.story,
        tags: taskDef.tags,
        acceptanceCriteria: taskDef.acceptanceCriteria,
        assignee: 'Unassigned',
        created: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        metadata: {
          source: 'utility-automation',
          category: 'agent-productivity',
          automated: true
        }
      };

      // Add task to state
      state.tasks[taskId] = task;

      console.log(`✅ Created task ${taskId}: "${taskDef.title}"`);
      console.log(
        `   Priority: ${taskDef.priority} | Estimate: ${taskDef.estimate} | Epic: ${taskDef.epic}`
      );

      tasksCreated++;
    }

    // Update state metadata
    if (!state.metadata) {
      state.metadata = {};
    }
    state.metadata.lastUpdated = new Date().toISOString();
    state.metadata.totalTasks = Object.keys(state.tasks).length;

    // Save updated state
    await fs.writeFile(stateFile, JSON.stringify(state, null, 2));

    console.log('\n📊 Task Creation Summary:');
    console.log(`✅ Created: ${tasksCreated} tasks`);
    console.log(`⏭️  Skipped: ${tasksSkipped} tasks (already exist)`);
    console.log(`📋 Total tasks in system: ${Object.keys(state.tasks).length}`);

    // Show created tasks by priority
    const createdTasks = Object.values(state.tasks).filter(
      task => task.metadata?.source === 'utility-automation'
    );

    console.log('\n📋 Created Utility Tasks by Priority:');
    const byPriority = createdTasks.reduce((acc, task) => {
      if (!acc[task.priority]) acc[task.priority] = [];
      acc[task.priority].push(task);
      return acc;
    }, {});

    ['high', 'medium', 'low'].forEach(priority => {
      if (byPriority[priority]) {
        console.log(
          `\n🔥 ${priority.toUpperCase()} PRIORITY (${byPriority[priority].length} tasks):`
        );
        byPriority[priority].forEach(task => {
          console.log(`   ${task.id}: ${task.title}`);
        });
      }
    });

    console.log(
      '\n🎉 Utility tasks have been added to the task management system!'
    );
    console.log(
      '📝 Agents can now grab these tasks using: node src/grab-tasks.js'
    );

    return {
      created: tasksCreated,
      skipped: tasksSkipped,
      total: Object.keys(state.tasks).length
    };
  } catch (error) {
    console.error('❌ Failed to create utility tasks:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  createUtilityTasks().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { createUtilityTasks, utilityTasks };
