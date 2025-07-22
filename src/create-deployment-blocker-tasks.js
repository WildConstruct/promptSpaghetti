#!/usr/bin/env node

/**
 * Create Deployment Blocker Tasks Script
 * 
 * Creates PRIORITY 0 tasks for the 7 critical deployment blockers preventing 
 * authentication system deployment due to 5000+ TypeScript compilation errors.
 * 
 * Based on IMMEDIATE-PRIORITIES.md, these are technical infrastructure tasks
 * that must be completed before the system can deploy.
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

// PRIORITY 0: Critical TypeScript Deployment Blockers
const deploymentBlockerTasks = [
  {
    title: 'Create Core Database Type Definitions',
    taskCode: 'TYPES-DB-001',
    description: 'Create packages/core/database/types.ts with foundational database interfaces. This is the most critical task as 1000+ cascading errors depend on these core types. Implement PaginatedResult<T> interface, PaginationOptions interface, and Role/Permission types for RBAC system.',
    estimate: '2 hours',
    priority: 'critical',
    wipClass: 'infrastructure',
    epic: 'TypeScript Infrastructure',
    story: 'Deployment Blocker Resolution',
    tags: ['typescript', 'database', 'types', 'infrastructure', 'deployment-blocker', 'foundational'],
    acceptanceCriteria: [
      'Create packages/core/database/types.ts file',
      'Implement PaginatedResult<T> generic interface',
      'Implement PaginationOptions interface with limit, offset, sort fields',
      'Define Role and Permission types for RBAC system',
      'Ensure types compile without errors',
      'Document interfaces with JSDoc comments'
    ],
    dependencies: [],
    businessValue: 'Resolves 1000+ cascading TypeScript errors blocking authentication deployment',
    technicalImpact: 'FOUNDATIONAL - Other deployment blocker tasks depend on this',
    blockedBy: [],
    blocks: ['FASTIFY-PLUGIN-001', 'SECURITY-TYPES-001', 'EXPORT-CONFLICTS-001']
  },
  {
    title: 'Install and Configure WebAuthn Type Packages',
    taskCode: 'TYPES-AUTH-001',
    description: 'Install missing WebAuthn and FIDO2 type packages that are preventing authentication system compilation. Install @types/webauthn and @types/fido2-lib packages and configure proper TypeScript definitions for authentication system.',
    estimate: '1 hour',
    priority: 'critical',
    wipClass: 'infrastructure',
    epic: 'TypeScript Infrastructure',
    story: 'Deployment Blocker Resolution',
    tags: ['typescript', 'webauthn', 'types', 'installation', 'deployment-blocker', 'auth'],
    acceptanceCriteria: [
      'Install @types/webauthn package as dev dependency',
      'Install @types/fido2-lib package as dev dependency',
      'Verify WebAuthn types are accessible in TypeScript',
      'Update tsconfig.json if needed for type resolution',
      'Ensure authentication imports compile without type errors'
    ],
    dependencies: [],
    businessValue: 'Enables WebAuthn authentication system to compile and deploy',
    technicalImpact: 'FOUNDATIONAL - Required for FASTIFY-PLUGIN-001',
    blockedBy: [],
    blocks: ['FASTIFY-PLUGIN-001']
  },
  {
    title: 'Fix Fastify Authentication Plugin Integration',
    taskCode: 'FASTIFY-PLUGIN-001',
    description: 'Resolve Fastify plugin integration gaps causing authentication system failures. Fix request.user property registration, implement fastify.database property plugin, and complete AuditService.logAction method implementation.',
    estimate: '2 hours',
    priority: 'critical',
    wipClass: 'integration',
    epic: 'TypeScript Infrastructure',
    story: 'Deployment Blocker Resolution',
    tags: ['fastify', 'plugins', 'authentication', 'integration', 'deployment-blocker', 'backend'],
    acceptanceCriteria: [
      'Fix request.user property missing error in auth middleware',
      'Implement fastify.database property registration',
      'Complete AuditService.logAction method implementation',
      'Resolve AuthenticatorTransport type definitions',
      'Ensure all Fastify auth plugins register correctly',
      'Test authentication flow compiles and works'
    ],
    dependencies: ['TYPES-DB-001', 'TYPES-AUTH-001'],
    businessValue: 'Enables authentication system to integrate with Fastify server',
    technicalImpact: 'CRITICAL - Authentication system cannot function without this',
    blockedBy: ['TYPES-DB-001', 'TYPES-AUTH-001'],
    blocks: []
  },
  {
    title: 'Repair Template Parsing Variable Scoping',
    taskCode: 'TEMPLATE-PARSER-001',
    description: 'Fix critical variable scoping issues in template parser system blocking VFX export and template functionality. Resolve "variable \'template\' out of scope" errors and complete function signature repairs in packages/core/utils/templateParser.ts.',
    estimate: '3 hours',
    priority: 'critical',
    wipClass: 'bug-fix',
    epic: 'TypeScript Infrastructure',
    story: 'Deployment Blocker Resolution',
    tags: ['template-parser', 'variable-scoping', 'bug-fix', 'deployment-blocker', 'vfx'],
    acceptanceCriteria: [
      'Fix variable scoping issues in packages/core/utils/templateParser.ts',
      'Resolve "variable template out of scope" compilation errors',
      'Complete broken function signature repairs',
      'Ensure template variable extraction system works',
      'Fix {variable} syntax processing in Epic 8 UX abstraction',
      'Add comprehensive tests for template parsing functionality'
    ],
    dependencies: [],
    businessValue: 'Enables template-based variable system and VFX export functionality',
    technicalImpact: 'BLOCKS - VFX export and advanced node template functionality',
    blockedBy: [],
    blocks: ['VFX-TYPES-001']
  },
  {
    title: 'Complete VFXRenderingData Interface Definition',
    taskCode: 'VFX-TYPES-001',
    description: 'Complete VFXRenderingData interface definition and resolve return statement syntax errors in VFX export system. Fix packages/core/services/VFXExporter.ts and complete weights property type definitions.',
    estimate: '2 hours',
    priority: 'critical',
    wipClass: 'feature',
    epic: 'TypeScript Infrastructure', 
    story: 'Deployment Blocker Resolution',
    tags: ['vfx', 'export', 'interface', 'types', 'deployment-blocker', 'rendering'],
    acceptanceCriteria: [
      'Complete VFXRenderingData interface definition',
      'Fix return statement syntax errors in VFXExporter.ts',
      'Complete weights property type definitions',
      'Ensure VFX export system compiles without errors',
      'Add proper TypeScript types for all VFX-related data structures',
      'Test VFX export generation works correctly'
    ],
    dependencies: ['TEMPLATE-PARSER-001'],
    businessValue: 'Enables VFX export system for film industry integration',
    technicalImpact: 'FEATURE - VFX export cannot function without proper type definitions',
    blockedBy: ['TEMPLATE-PARSER-001'],
    blocks: []
  },
  {
    title: 'Fix Rate Limiting and Security Interface Types',
    taskCode: 'SECURITY-TYPES-001',
    description: 'Resolve security interface type conflicts blocking security middleware and rate limiting systems. Fix RateLimitAction interface missing properties, resolve enum/class naming conflicts, and fix export assignment syntax errors.',
    estimate: '3 hours',
    priority: 'critical',
    wipClass: 'security',
    epic: 'TypeScript Infrastructure',
    story: 'Deployment Blocker Resolution',
    tags: ['security', 'rate-limiting', 'interfaces', 'types', 'deployment-blocker', 'middleware'],
    acceptanceCriteria: [
      'Add missing statusCode property to RateLimitAction interface',
      'Resolve RateLimitStrategy enum/class naming conflicts',
      'Fix duplicate function conflicts in AdaptiveThrottlingRules.ts',
      'Rename conflicting updateSystemMetrics methods',
      'Fix export assignment syntax errors in security modules',
      'Complete SecurityEventContext interface with strictMode and error properties'
    ],
    dependencies: ['TYPES-DB-001'],
    businessValue: 'Enables security middleware and rate limiting protection',
    technicalImpact: 'SECURITY - Rate limiting and security features cannot deploy without this',
    blockedBy: ['TYPES-DB-001'],
    blocks: []
  },
  {
    title: 'Resolve Module Export and Import Conflicts',
    taskCode: 'EXPORT-CONFLICTS-001',
    description: 'Fix missing export resolutions blocking module dependency resolution. Resolve SerializedGraph export mismatches, ValidationResult export conflicts, and missing database model exports across multiple modules.',
    estimate: '2 hours',
    priority: 'critical',
    wipClass: 'infrastructure',
    epic: 'TypeScript Infrastructure',
    story: 'Deployment Blocker Resolution',
    tags: ['modules', 'exports', 'imports', 'dependencies', 'deployment-blocker', 'resolution'],
    acceptanceCriteria: [
      'Fix SerializedGraph → serializeGraph export mismatch in LLM Randomizer',
      'Resolve ValidationResult export conflicts',
      'Complete serialization module exports',
      'Add missing Role, Permission exports to workspace-models.ts',
      'Fix PaginatedResult, PaginationOptions exports in template-models.ts',
      'Resolve Zod namespace import issues across modules'
    ],
    dependencies: ['TYPES-DB-001'],
    businessValue: 'Enables proper module loading and dependency resolution',
    technicalImpact: 'INFRASTRUCTURE - Module system cannot function without proper exports',
    blockedBy: ['TYPES-DB-001'],
    blocks: []
  }
];

// Utility functions
function generateTaskId(prefix = 'T') {
  const timestamp = Date.now().toString().slice(-6);
  const random = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

async function loadCurrentState() {
  const stateFile = path.join(__dirname, 'data/state.json');
  
  try {
    const stateData = await fs.readFile(stateFile, 'utf8');
    return JSON.parse(stateData);
  } catch (error) {
    // Create new state if file doesn't exist
    return {
      tasks: {},
      metadata: {
        created: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      }
    };
  }
}

async function saveState(state) {
  const stateFile = path.join(__dirname, 'data/state.json');
  await fs.writeFile(stateFile, JSON.stringify(state, null, 2));
}

function taskExists(state, taskCode) {
  return Object.values(state.tasks).some(task => 
    task.metadata?.taskCode === taskCode || 
    task.title && task.title.toLowerCase() === taskCode.toLowerCase()
  );
}

function createTaskObject(taskDef, taskId) {
  return {
    id: taskId,
    title: taskDef.title,
    description: taskDef.description,
    state: 'UNASSIGNED',
    priority: taskDef.priority,
    estimate: taskDef.estimate,
    wipClass: taskDef.wipClass,
    epic: taskDef.epic,
    story: taskDef.story,
    tags: taskDef.tags,
    acceptanceCriteria: taskDef.acceptanceCriteria,
    dependencies: taskDef.dependencies || [],
    businessValue: taskDef.businessValue,
    assignee: 'Unassigned',
    created: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    metadata: {
      source: 'deployment-blocker-automation',
      category: 'deployment-blocker',
      taskCode: taskDef.taskCode,
      automated: true,
      priority_level: 0, // PRIORITY 0 - Most critical
      epic: 'TypeScript Infrastructure',
      technicalImpact: taskDef.technicalImpact,
      blockedBy: taskDef.blockedBy || [],
      blocks: taskDef.blocks || []
    }
  };
}

async function createDeploymentBlockerTasks() {
  console.log('🚨 Creating PRIORITY 0 Deployment Blocker Tasks...\n');
  console.log('💥 CRITICAL: 5000+ TypeScript errors blocking authentication deployment');
  console.log('⚡ These 7 tasks MUST be completed before system can deploy\n');
  
  try {
    // Load current state
    let state = await loadCurrentState();
    
    if (!state.tasks) {
      state.tasks = {};
    }
    
    let tasksCreated = 0;
    let tasksSkipped = 0;
    
    console.log('🔥 Creating TypeScript Infrastructure Tasks (PRIORITY 0)...\n');
    
    for (const taskDef of deploymentBlockerTasks) {
      if (taskExists(state, taskDef.taskCode)) {
        console.log(`⏭️  Skipping "${taskDef.taskCode}" - already exists`);
        tasksSkipped++;
        continue;
      }
      
      const taskId = generateTaskId('DEPLOY');
      const task = createTaskObject(taskDef, taskId);
      
      state.tasks[taskId] = task;
      
      console.log(`🚨 Created ${taskId}: ${taskDef.taskCode} - "${taskDef.title}"`);
      console.log(`   ⚡ Priority: ${taskDef.priority} | ⏱️  Estimate: ${taskDef.estimate}`);
      console.log(`   💥 Technical Impact: ${taskDef.technicalImpact}`);
      console.log(`   🎯 Business Value: ${taskDef.businessValue}`);
      if (taskDef.dependencies.length > 0) {
        console.log(`   🔗 Dependencies: ${taskDef.dependencies.join(', ')}`);
      }
      if (taskDef.blocks.length > 0) {
        console.log(`   🚫 Blocks: ${taskDef.blocks.join(', ')}`);
      }
      console.log('');
      
      tasksCreated++;
    }
    
    // Update state metadata
    if (!state.metadata) {
      state.metadata = {};
    }
    state.metadata.lastUpdated = new Date().toISOString();
    state.metadata.totalTasks = Object.keys(state.tasks).length;
    state.metadata.deploymentBlockersCreated = tasksCreated;
    
    // Save updated state
    await saveState(state);
    
    // Generate summary
    console.log('🚨 DEPLOYMENT BLOCKER TASK CREATION SUMMARY\n');
    console.log('='.repeat(60));
    console.log(`🔥 Tasks Created: ${tasksCreated}`);
    console.log(`⏭️  Tasks Skipped: ${tasksSkipped} (already exist)`);
    console.log(`📋 Total Tasks: ${Object.keys(state.tasks).length}\n`);
    
    // Show dependency chain
    console.log('🔗 CRITICAL DEPENDENCY CHAIN:\n');
    console.log('📍 FOUNDATIONAL (Must be completed first):');
    console.log('   1. TYPES-DB-001: Core database types (2h) - BLOCKS 3 other tasks');
    console.log('   2. TYPES-AUTH-001: WebAuthn packages (1h) - BLOCKS Fastify plugin\n');
    
    console.log('📍 INFRASTRUCTURE (Depends on foundation):');
    console.log('   3. FASTIFY-PLUGIN-001: Auth plugin integration (2h) - Needs DB + Auth types');
    console.log('   4. SECURITY-TYPES-001: Security interfaces (3h) - Needs DB types');
    console.log('   5. EXPORT-CONFLICTS-001: Module exports (2h) - Needs DB types\n');
    
    console.log('📍 FEATURES (Can be parallel):');
    console.log('   6. TEMPLATE-PARSER-001: Template parsing (3h) - Independent');
    console.log('   7. VFX-TYPES-001: VFX interfaces (2h) - Needs template parser\n');
    
    // Show task assignment strategy
    console.log('🤖 RECOMMENDED ASSIGNMENT STRATEGY:\n');
    console.log('👨‍💻 Developer 1: TYPES-DB-001 → SECURITY-TYPES-001 → EXPORT-CONFLICTS-001');
    console.log('👩‍💻 Developer 2: TYPES-AUTH-001 → FASTIFY-PLUGIN-001');
    console.log('👨‍💻 Developer 3: TEMPLATE-PARSER-001 → VFX-TYPES-001\n');
    
    console.log('⏰ TOTAL ESTIMATED TIME: 15 hours across 3 developers = ~5-6 hours parallel\n');
    
    // Agent instructions
    console.log('🤖 IMMEDIATE AGENT INSTRUCTIONS:\n');
    console.log('1. 🔥 ALL agents must prioritize deployment blockers over ANY other work');
    console.log('2. 📍 Start with TYPES-DB-001 and TYPES-AUTH-001 (foundational)');
    console.log('3. 📝 Use: `node src/grab-tasks.js <agent-id> 1 --tags="deployment-blocker"`');
    console.log('4. 🚫 STOP all Epic 19 and non-critical work immediately');
    console.log('5. ✅ Run `node src/finish-task.js <task-id>` when complete\n');
    
    console.log('⚡ SUCCESS CRITERIA:');
    console.log('   🎯 TypeScript compilation completes without errors');
    console.log('   🚀 Authentication system can deploy to production');
    console.log('   🔐 Login/registration flows work in deployed environment\n');
    
    console.log('💥 CRITICAL: These tasks have PRIORITY 0 - highest urgency');
    console.log('🚨 Authentication system is 100% functionally complete but blocked by these type issues');
    console.log('✨ Deployment blocker tasks created successfully!');
    
    return {
      created: tasksCreated,
      skipped: tasksSkipped,
      total: Object.keys(state.tasks).length,
      foundationalTasks: 2, // TYPES-DB-001, TYPES-AUTH-001
      infrastructureTasks: 3, // FASTIFY, SECURITY, EXPORTS
      featureTasks: 2 // TEMPLATE, VFX
    };
    
  } catch (error) {
    console.error('❌ Failed to create deployment blocker tasks:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  createDeploymentBlockerTasks().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { 
  createDeploymentBlockerTasks, 
  deploymentBlockerTasks 
};