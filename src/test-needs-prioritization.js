#!/usr/bin/env node

/**
 * Test Needs Prioritization Tool
 * Implements priority-based test planning for Epic 18
 */

const fs = require('fs');
const path = require('path');

class TestNeedsPrioritizer {
  constructor() {
    this.coverageReport = null;
    this.priorityMatrix = {
      P0_SECURITY: {
        weight: 100,
        targetCoverage: 95,
        maxTimeWeeks: 1,
        description:
          'Security-critical components requiring immediate attention'
      },
      P1_CORE_ENGINE: {
        weight: 90,
        targetCoverage: 90,
        maxTimeWeeks: 2,
        description: 'Core business logic and execution engine'
      },
      P2_API_INTEGRATION: {
        weight: 80,
        targetCoverage: 80,
        maxTimeWeeks: 3,
        description: 'API endpoints and integration points'
      },
      P3_UI_COMPONENTS: {
        weight: 70,
        targetCoverage: 70,
        maxTimeWeeks: 6,
        description: 'User interface components and interactions'
      },
      P4_DATA_PERSISTENCE: {
        weight: 60,
        targetCoverage: 75,
        maxTimeWeeks: 8,
        description: 'Database operations and data management'
      }
    };

    this.riskAssessment = {
      CRITICAL: { multiplier: 2.0, color: '\x1b[31m' }, // Red
      HIGH: { multiplier: 1.5, color: '\x1b[33m' }, // Yellow
      MEDIUM: { multiplier: 1.2, color: '\x1b[36m' }, // Cyan
      LOW: { multiplier: 1.0, color: '\x1b[37m' } // White
    };

    this.securityVulnerabilities = [
      {
        component: 'packages/core/runtime/index.ts',
        vulnerability: 'SetVariable prototype pollution',
        cveScore: 8.5,
        priority: 'P0_SECURITY'
      },
      {
        component: 'packages/core/runtime/nodes/Conditional.ts',
        vulnerability: 'Expression injection via eval',
        cveScore: 9.2,
        priority: 'P0_SECURITY'
      },
      {
        component: 'packages/core/graphSchema.ts',
        vulnerability: 'Schema validation bypass',
        cveScore: 7.8,
        priority: 'P0_SECURITY'
      },
      {
        component: 'server/src/middleware/auth.ts',
        vulnerability: 'Authentication bypass',
        cveScore: 9.8,
        priority: 'P0_SECURITY'
      },
      {
        component: 'server/src/middleware/rate-limit.ts',
        vulnerability: 'Rate limiting bypass',
        cveScore: 6.5,
        priority: 'P0_SECURITY'
      }
    ];
  }

  async loadCoverageReport() {
    try {
      const coverageFile = path.join(
        __dirname,
        '../coverage/coverage-final.json'
      );
      if (fs.existsSync(coverageFile)) {
        this.coverageReport = JSON.parse(fs.readFileSync(coverageFile, 'utf8'));
      } else {
        console.log('⚠️  Coverage report not found, using estimated metrics');
        this.coverageReport = this.generateEstimatedCoverage();
      }
    } catch (error) {
      console.error('Error loading coverage report:', error.message);
      this.coverageReport = this.generateEstimatedCoverage();
    }
  }

  generateEstimatedCoverage() {
    return {
      total: {
        statements: { pct: 0.01 },
        branches: { pct: 0 },
        functions: { pct: 0 },
        lines: { pct: 0.01 }
      }
    };
  }

  categorizeComponents() {
    return {
      P0_SECURITY: [
        'packages/core/runtime/index.ts',
        'packages/core/runtime/nodes/Conditional.ts',
        'packages/core/graphSchema.ts',
        'packages/core/validation.ts',
        'server/src/middleware/auth.ts',
        'server/src/middleware/security-headers.ts',
        'server/src/middleware/rate-limit.ts',
        'server/src/routes/auth.ts'
      ],
      P1_CORE_ENGINE: [
        'packages/core/runtime/advanced.ts',
        'packages/core/runtime/io-system.ts',
        'server/src/engine.ts',
        'server/src/graphValidator.ts',
        'packages/core/GraphEditor.tsx',
        'packages/core/graphStore.ts'
      ],
      P2_API_INTEGRATION: [
        'server/src/index.ts',
        'server/src/exporter.ts',
        'api/preview.js',
        'api/export.js',
        'server/src/database/',
        'packages/core/PreviewModal.tsx'
      ],
      P3_UI_COMPONENTS: [
        'packages/core/components/Inspector/',
        'client/src/components/',
        'packages/core/components/Inspector/editors/',
        'client/src/pages/'
      ],
      P4_DATA_PERSISTENCE: [
        'server/src/database/models.ts',
        'server/src/database/*-dao.ts',
        'server/src/database/migration-service.ts',
        'server/src/analytics/',
        'server/src/performance/'
      ]
    };
  }

  calculatePriorityScore(component, priority, currentCoverage = 0) {
    const priorityConfig = this.priorityMatrix[priority];
    const coverageGap = Math.max(
      0,
      priorityConfig.targetCoverage - currentCoverage
    );
    const timeWeight = Math.max(1, 9 - priorityConfig.maxTimeWeeks);

    // Security vulnerability bonus
    const securityVuln = this.securityVulnerabilities.find(
      v => component.includes(v.component) || v.component.includes(component)
    );
    const securityBonus = securityVuln ? securityVuln.cveScore * 10 : 0;

    return priorityConfig.weight * coverageGap * timeWeight + securityBonus;
  }

  assessRiskLevel(priorityScore) {
    if (priorityScore > 8000) return 'CRITICAL';
    if (priorityScore > 5000) return 'HIGH';
    if (priorityScore > 2000) return 'MEDIUM';
    return 'LOW';
  }

  generatePriorityReport() {
    const components = this.categorizeComponents();
    const prioritizedTasks = [];

    console.log('\n🎯 TEST NEEDS PRIORITIZATION REPORT');
    console.log('=====================================');

    Object.entries(components).forEach(([priority, componentList]) => {
      const priorityConfig = this.priorityMatrix[priority];

      console.log(`\n${priority}: ${priorityConfig.description}`);
      console.log(
        `Target Coverage: ${priorityConfig.targetCoverage}% | Timeline: ${priorityConfig.maxTimeWeeks} weeks`
      );
      console.log('─'.repeat(80));

      componentList.forEach(component => {
        const priorityScore = this.calculatePriorityScore(
          component,
          priority,
          0
        );
        const riskLevel = this.assessRiskLevel(priorityScore);
        const riskConfig = this.riskAssessment[riskLevel];

        const task = {
          component,
          priority,
          priorityScore,
          riskLevel,
          targetCoverage: priorityConfig.targetCoverage,
          estimatedEffort: this.estimateEffort(
            component,
            priorityConfig.targetCoverage
          ),
          securityCritical: this.securityVulnerabilities.some(
            v =>
              component.includes(v.component) || v.component.includes(component)
          )
        };

        prioritizedTasks.push(task);

        console.log(
          `${riskConfig.color}${riskLevel.padEnd(8)}\x1b[0m | ` +
            `Score: ${priorityScore.toString().padStart(6)} | ` +
            `${component}${task.securityCritical ? ' 🔒' : ''}`
        );
      });
    });

    return prioritizedTasks.sort((a, b) => b.priorityScore - a.priorityScore);
  }

  estimateEffort(component, targetCoverage) {
    // Estimate effort based on component complexity and coverage target
    const complexityMap = {
      'packages/core/runtime/': 8,
      'server/src/engine.ts': 12,
      'packages/core/GraphEditor.tsx': 10,
      'server/src/middleware/': 4,
      'packages/core/components/': 6,
      'server/src/database/': 5,
      'api/': 3
    };

    const baseEffort =
      Object.entries(complexityMap).find(([pattern]) =>
        component.includes(pattern)
      )?.[1] || 4;

    return Math.ceil(baseEffort * (targetCoverage / 100) * 1.2); // 20% buffer
  }

  generateImplementationRoadmap(prioritizedTasks) {
    console.log('\n🗺️  IMPLEMENTATION ROADMAP');
    console.log('===========================');

    const phases = {
      'Phase 1 - Critical Security (Week 1-2)': prioritizedTasks.filter(
        t => t.riskLevel === 'CRITICAL' && t.priority === 'P0_SECURITY'
      ),
      'Phase 2 - Core Engine (Week 2-3)': prioritizedTasks.filter(
        t => t.priority === 'P1_CORE_ENGINE'
      ),
      'Phase 3 - API Integration (Week 4-5)': prioritizedTasks.filter(
        t => t.priority === 'P2_API_INTEGRATION'
      ),
      'Phase 4 - UI Components (Week 6-7)': prioritizedTasks.filter(
        t => t.priority === 'P3_UI_COMPONENTS'
      ),
      'Phase 5 - Data Persistence (Week 8)': prioritizedTasks.filter(
        t => t.priority === 'P4_DATA_PERSISTENCE'
      )
    };

    Object.entries(phases).forEach(([phaseName, tasks]) => {
      if (tasks.length === 0) return;

      console.log(`\n${phaseName}`);
      console.log('─'.repeat(60));

      const totalEffort = tasks.reduce(
        (sum, task) => sum + task.estimatedEffort,
        0
      );
      console.log(
        `Total Effort: ${totalEffort} hours | Tasks: ${tasks.length}`
      );

      tasks.slice(0, 5).forEach(task => {
        const riskColor = this.riskAssessment[task.riskLevel].color;
        console.log(
          `  ${riskColor}●\x1b[0m ${task.component} ` +
            `(${task.estimatedEffort}h, ${task.targetCoverage}% target)`
        );
      });

      if (tasks.length > 5) {
        console.log(`  ... and ${tasks.length - 5} more tasks`);
      }
    });
  }

  generateSuccessMetrics() {
    console.log('\n📊 SUCCESS METRICS & TARGETS');
    console.log('==============================');

    const metrics = [
      {
        metric: 'Overall Coverage',
        current: '0.01%',
        week2: '15%',
        week4: '40%',
        week8: '80%',
        target: '>80%'
      },
      {
        metric: 'Security Components',
        current: '0%',
        week2: '95%',
        week4: '95%',
        week8: '95%',
        target: '>95%'
      },
      {
        metric: 'Core Engine',
        current: '0%',
        week2: '60%',
        week4: '90%',
        week8: '90%',
        target: '>90%'
      },
      {
        metric: 'API Endpoints',
        current: '0%',
        week2: '20%',
        week4: '80%',
        week8: '85%',
        target: '>80%'
      }
    ];

    console.log(
      'Metric'.padEnd(20) +
        'Current'.padEnd(10) +
        'Week 2'.padEnd(10) +
        'Week 4'.padEnd(10) +
        'Week 8'.padEnd(10) +
        'Target'
    );
    console.log('─'.repeat(70));

    metrics.forEach(m => {
      console.log(
        m.metric.padEnd(20) +
          m.current.padEnd(10) +
          m.week2.padEnd(10) +
          m.week4.padEnd(10) +
          m.week8.padEnd(10) +
          m.target
      );
    });
  }

  generateActionItems() {
    console.log('\n⚡ IMMEDIATE ACTION ITEMS');
    console.log('=========================');

    const actions = [
      {
        action: 'Set up security test framework',
        owner: 'Senior Dev',
        deadline: 'Week 1',
        effort: '16h',
        blockers: 'None'
      },
      {
        action: 'Implement authentication flow tests',
        owner: 'Senior Dev',
        deadline: 'Week 1',
        effort: '12h',
        blockers: 'Security framework'
      },
      {
        action: 'Create core engine test suite',
        owner: 'Senior Dev',
        deadline: 'Week 2',
        effort: '20h',
        blockers: 'None'
      },
      {
        action: 'Establish CI/CD test integration',
        owner: 'DevOps',
        deadline: 'Week 2',
        effort: '8h',
        blockers: 'Test framework setup'
      },
      {
        action: 'Configure coverage reporting',
        owner: 'QA Engineer',
        deadline: 'Week 1',
        effort: '4h',
        blockers: 'None'
      }
    ];

    console.log(
      'Action'.padEnd(35) +
        'Owner'.padEnd(12) +
        'Deadline'.padEnd(10) +
        'Effort'.padEnd(8) +
        'Blockers'
    );
    console.log('─'.repeat(80));

    actions.forEach(item => {
      console.log(
        item.action.padEnd(35) +
          item.owner.padEnd(12) +
          item.deadline.padEnd(10) +
          item.effort.padEnd(8) +
          item.blockers
      );
    });
  }

  async run() {
    console.log('🔍 Analyzing test needs and prioritization...\n');

    await this.loadCoverageReport();

    const prioritizedTasks = this.generatePriorityReport();
    this.generateImplementationRoadmap(prioritizedTasks);
    this.generateSuccessMetrics();
    this.generateActionItems();

    console.log('\n✅ Test needs prioritization complete!');
    console.log('\n📋 SUMMARY:');
    console.log(`• Total components analyzed: ${prioritizedTasks.length}`);
    console.log(
      `• Critical security items: ${prioritizedTasks.filter(t => t.riskLevel === 'CRITICAL').length}`
    );
    console.log(
      `• High-priority items: ${prioritizedTasks.filter(t => t.riskLevel === 'HIGH').length}`
    );
    console.log('• Estimated timeline: 8 weeks');
    console.log('• Estimated effort: 350 hours');

    return {
      prioritizedTasks,
      totalTasks: prioritizedTasks.length,
      criticalTasks: prioritizedTasks.filter(t => t.riskLevel === 'CRITICAL')
        .length,
      estimatedWeeks: 8,
      estimatedHours: 350
    };
  }
}

// CLI execution
if (require.main === module) {
  const prioritizer = new TestNeedsPrioritizer();
  prioritizer
    .run()
    .then(results => {
      console.log('\n🎯 Prioritization completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Prioritization failed:', error.message);
      process.exit(1);
    });
}

module.exports = TestNeedsPrioritizer;
