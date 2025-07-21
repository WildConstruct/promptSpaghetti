#!/usr/bin/env node

/**
 * Create Epic 19 Tasks Script
 * 
 * Converts Epic 19 (Security & Compliance Framework) plan
 * into executable tasks in the task management system.
 * 
 * Based on: docs/epic19plan.md
 * Note: Only processes uncompleted tasks (marked with [ ])
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

// Function to extract pending tasks from the Epic 19 plan file
async function extractTasksFromEpic19Plan() {
  const planPath = path.join(__dirname, '..', 'docs', 'epic19plan.md');
  const content = await fs.readFile(planPath, 'utf8');
  
  // Extract all pending checkbox tasks from the plan ([ ] not [x])
  const taskMatches = content.match(/^- \[ \] .+$/gm);
  
  if (!taskMatches) {
    console.log('ℹ️  All Epic 19 tasks appear to be completed - no pending tasks found');
    return [];
  }
  
  // Process tasks and organize by story context
  const tasks = [];
  let currentStory = null;
  let currentSubstory = null;
  
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Detect story headers
    if (line.match(/^## Story \d+\.\d+/)) {
      currentStory = line.match(/## Story (\d+\.\d+) - (.+?)(?:\s+✅\s+\*\*COMPLETE\*\*)?$/);
    }
    
    // Detect substory headers  
    if (line.match(/^#### \d+\.\d+\.\d+/)) {
      currentSubstory = line.match(/#### (\d+\.\d+\.\d+) (.+?) \((.+?)\)(?:\s+✅\s+\*\*COMPLETE\*\*)?$/);
    }
    
    // Process only pending task items (not completed ones)
    if (line.match(/^- \[ \] /) && !line.match(/^- \[x\] /)) {
      const taskTitle = line.replace(/^- \[ \] /, '');
      
      // Determine story context
      let story = '19';
      let storyName = 'Security & Compliance Framework';
      
      if (currentStory) {
        story = currentStory[1];
        storyName = currentStory[2];
      }
      
      // Determine priority and estimate based on task content
      let priority = 'medium';
      let estimate = '4 hours';
      let wipClass = 'feature';
      
      // High priority for core security, authentication, and compliance
      if (taskTitle.toLowerCase().includes('security') || 
          taskTitle.toLowerCase().includes('authentication') || 
          taskTitle.toLowerCase().includes('encryption') ||
          taskTitle.toLowerCase().includes('compliance') ||
          taskTitle.toLowerCase().includes('audit') ||
          taskTitle.toLowerCase().includes('framework') ||
          taskTitle.toLowerCase().includes('breach') ||
          taskTitle.toLowerCase().includes('vulnerability')) {
        priority = 'high';
        estimate = '6 hours';
        wipClass = 'infrastructure';
      }
      
      // UI and interface tasks
      else if (taskTitle.toLowerCase().includes('ui') || 
               taskTitle.toLowerCase().includes('interface') ||
               taskTitle.toLowerCase().includes('dashboard') ||
               taskTitle.toLowerCase().includes('notification') ||
               taskTitle.toLowerCase().includes('alert') ||
               taskTitle.toLowerCase().includes('indicator')) {
        priority = 'medium';
        estimate = '5 hours';
        wipClass = 'ui';
      }
      
      // Core implementation and development tasks  
      else if (taskTitle.toLowerCase().includes('implement') || 
               taskTitle.toLowerCase().includes('develop') ||
               taskTitle.toLowerCase().includes('build') ||
               taskTitle.toLowerCase().includes('create') ||
               taskTitle.toLowerCase().includes('generate') ||
               taskTitle.toLowerCase().includes('configure')) {
        priority = 'high';
        estimate = '6 hours';
        wipClass = 'feature';
      }
      
      // Testing and validation tasks
      else if (taskTitle.toLowerCase().includes('test') || 
               taskTitle.toLowerCase().includes('validation') ||
               taskTitle.toLowerCase().includes('verification') ||
               taskTitle.toLowerCase().includes('monitor') ||
               taskTitle.toLowerCase().includes('analyze')) {
        priority = 'medium';
        estimate = '4 hours';
        wipClass = 'testing';
      }
      
      // Documentation and policy tasks
      else if (taskTitle.toLowerCase().includes('document') || 
               taskTitle.toLowerCase().includes('policy') ||
               taskTitle.toLowerCase().includes('procedure') ||
               taskTitle.toLowerCase().includes('guideline') ||
               taskTitle.toLowerCase().includes('define')) {
        priority = 'low';
        estimate = '3 hours';
        wipClass = 'documentation';
      }
      
      // Assign tags based on task content
      const tags = [];
      if (taskTitle.toLowerCase().includes('authentication') || taskTitle.toLowerCase().includes('mfa')) tags.push('authentication');
      if (taskTitle.toLowerCase().includes('password') || taskTitle.toLowerCase().includes('credential')) tags.push('passwords');
      if (taskTitle.toLowerCase().includes('session') || taskTitle.toLowerCase().includes('login')) tags.push('session-management');
      if (taskTitle.toLowerCase().includes('encryption') || taskTitle.toLowerCase().includes('crypto')) tags.push('encryption');
      if (taskTitle.toLowerCase().includes('audit') || taskTitle.toLowerCase().includes('logging')) tags.push('audit-logging');
      if (taskTitle.toLowerCase().includes('compliance') || taskTitle.toLowerCase().includes('gdpr')) tags.push('compliance');
      if (taskTitle.toLowerCase().includes('privacy') || taskTitle.toLowerCase().includes('data protection')) tags.push('data-privacy');
      if (taskTitle.toLowerCase().includes('access control') || taskTitle.toLowerCase().includes('rbac')) tags.push('access-control');
      if (taskTitle.toLowerCase().includes('security') || taskTitle.toLowerCase().includes('vulnerability')) tags.push('security');
      if (taskTitle.toLowerCase().includes('rate limit') || taskTitle.toLowerCase().includes('brute force')) tags.push('rate-limiting');
      if (taskTitle.toLowerCase().includes('anomaly') || taskTitle.toLowerCase().includes('detection')) tags.push('anomaly-detection');
      if (taskTitle.toLowerCase().includes('header') || taskTitle.toLowerCase().includes('csp')) tags.push('security-headers');
      if (taskTitle.toLowerCase().includes('classification') || taskTitle.toLowerCase().includes('tagging')) tags.push('data-classification');
      if (taskTitle.toLowerCase().includes('backup') || taskTitle.toLowerCase().includes('recovery')) tags.push('backup-recovery');
      if (taskTitle.toLowerCase().includes('incident') || taskTitle.toLowerCase().includes('response')) tags.push('incident-response');
      if (taskTitle.toLowerCase().includes('monitoring') || taskTitle.toLowerCase().includes('alert')) tags.push('monitoring');
      if (taskTitle.toLowerCase().includes('training') || taskTitle.toLowerCase().includes('awareness')) tags.push('security-training');
      if (taskTitle.toLowerCase().includes('policy') || taskTitle.toLowerCase().includes('governance')) tags.push('policy-governance');
      if (taskTitle.toLowerCase().includes('assessment') || taskTitle.toLowerCase().includes('penetration')) tags.push('security-assessment');
      if (taskTitle.toLowerCase().includes('ui') || taskTitle.toLowerCase().includes('component')) tags.push('ui');
      if (taskTitle.toLowerCase().includes('api') || taskTitle.toLowerCase().includes('backend')) tags.push('api');
      if (taskTitle.toLowerCase().includes('workflow') || taskTitle.toLowerCase().includes('process')) tags.push('workflow');
      
      // Default tags if none assigned
      if (tags.length === 0) {
        tags.push('security-compliance');
      }
      
      // Generate detailed description
      let description = `Implement ${taskTitle.toLowerCase()} as part of Epic 19 - Security & Compliance Framework.`;
      
      if (currentSubstory) {
        description += ` This task is part of substory ${currentSubstory[1]} (${currentSubstory[2]}) with estimated duration ${currentSubstory[3]}.`;
      }
      
      // Add specific technical details based on task type
      if (taskTitle.includes('authentication') || taskTitle.includes('MFA')) {
        description += ' Includes multi-factor authentication setup, secure credential management, user enrollment flows, and authentication flow integration.';
      } else if (taskTitle.includes('encryption') || taskTitle.includes('crypto')) {
        description += ' Includes encryption algorithm implementation, key management, secure data handling, and cryptographic validation systems.';
      } else if (taskTitle.includes('password') || taskTitle.includes('credential')) {
        description += ' Includes password policy enforcement, strength validation, breach detection, and secure credential storage mechanisms.';
      } else if (taskTitle.includes('session') || taskTitle.includes('login')) {
        description += ' Includes session security, timeout management, concurrent session handling, and anomaly detection capabilities.';
      } else if (taskTitle.includes('audit') || taskTitle.includes('logging')) {
        description += ' Includes comprehensive audit trail creation, log analysis, compliance reporting, and security event monitoring.';
      } else if (taskTitle.includes('compliance') || taskTitle.includes('GDPR')) {
        description += ' Includes regulatory compliance implementation, data protection controls, privacy rights management, and compliance reporting.';
      } else if (taskTitle.includes('access control') || taskTitle.includes('RBAC')) {
        description += ' Includes role-based access control, permission management, privilege escalation controls, and access monitoring.';
      } else if (taskTitle.includes('rate limit') || taskTitle.includes('brute force')) {
        description += ' Includes attack prevention, rate limiting strategies, IP blocking, and progressive challenge systems.';
      } else if (taskTitle.includes('anomaly') || taskTitle.includes('detection')) {
        description += ' Includes behavior analysis, risk scoring, threat detection, and automated response mechanisms.';
      } else if (taskTitle.includes('classification') || taskTitle.includes('tagging')) {
        description += ' Includes data sensitivity classification, automated tagging, policy enforcement, and data handling controls.';
      } else if (taskTitle.includes('incident') || taskTitle.includes('response')) {
        description += ' Includes incident detection, response workflows, recovery procedures, and post-incident analysis capabilities.';
      } else if (taskTitle.includes('UI') || taskTitle.includes('component')) {
        description += ' Includes secure interface development, user experience optimization, security indicator implementation, and accessibility compliance.';
      }
      
      // Generate acceptance criteria
      const acceptanceCriteria = [];
      
      if (taskTitle.includes('authentication') || taskTitle.includes('MFA')) {
        acceptanceCriteria.push('MFA system supports multiple authentication methods');
        acceptanceCriteria.push('Authentication flows are secure and user-friendly');
        acceptanceCriteria.push('Backup authentication methods work reliably');
        acceptanceCriteria.push('Authentication system prevents common attacks');
      }
      
      if (taskTitle.includes('encryption') || taskTitle.includes('crypto')) {
        acceptanceCriteria.push('Encryption uses industry-standard algorithms and key sizes');
        acceptanceCriteria.push('Key management provides secure key lifecycle');
        acceptanceCriteria.push('Encrypted data maintains integrity and confidentiality');
        acceptanceCriteria.push('Encryption performance meets application requirements');
      }
      
      if (taskTitle.includes('password') || taskTitle.includes('credential')) {
        acceptanceCriteria.push('Password policies enforce strong security requirements');
        acceptanceCriteria.push('Breach detection identifies compromised credentials');
        acceptanceCriteria.push('Credential storage uses secure hashing methods');
        acceptanceCriteria.push('Password reset process maintains security');
      }
      
      if (taskTitle.includes('session') || taskTitle.includes('login')) {
        acceptanceCriteria.push('Session management prevents hijacking attacks');
        acceptanceCriteria.push('Session timeouts work appropriately');
        acceptanceCriteria.push('Concurrent session policies are enforced');
        acceptanceCriteria.push('Login anomaly detection catches suspicious activity');
      }
      
      if (taskTitle.includes('audit') || taskTitle.includes('logging')) {
        acceptanceCriteria.push('Audit system captures all security-relevant events');
        acceptanceCriteria.push('Log data supports forensic investigation');
        acceptanceCriteria.push('Audit trail is tamper-evident and secure');
        acceptanceCriteria.push('Log analysis provides actionable security insights');
      }
      
      if (taskTitle.includes('compliance') || taskTitle.includes('GDPR')) {
        acceptanceCriteria.push('Compliance controls meet regulatory requirements');
        acceptanceCriteria.push('Data protection mechanisms enforce privacy rights');
        acceptanceCriteria.push('Compliance reporting provides required documentation');
        acceptanceCriteria.push('Privacy controls are user-accessible and functional');
      }
      
      if (taskTitle.includes('access control') || taskTitle.includes('RBAC')) {
        acceptanceCriteria.push('Access control system enforces least privilege principle');
        acceptanceCriteria.push('Role management is flexible and maintainable');
        acceptanceCriteria.push('Permission changes take effect immediately');
        acceptanceCriteria.push('Access monitoring detects privilege abuse');
      }
      
      if (taskTitle.includes('rate limit') || taskTitle.includes('brute force')) {
        acceptanceCriteria.push('Rate limiting prevents automated attacks');
        acceptanceCriteria.push('Lockout mechanisms balance security and usability');
        acceptanceCriteria.push('Challenge systems adapt to threat levels');
        acceptanceCriteria.push('Rate limiting performance scales with usage');
      }
      
      if (taskTitle.includes('anomaly') || taskTitle.includes('detection')) {
        acceptanceCriteria.push('Anomaly detection catches suspicious behavior accurately');
        acceptanceCriteria.push('Risk scoring provides meaningful threat assessment');
        acceptanceCriteria.push('Detection system minimizes false positives');
        acceptanceCriteria.push('Automated responses appropriately escalate threats');
      }
      
      if (taskTitle.includes('classification') || taskTitle.includes('tagging')) {
        acceptanceCriteria.push('Data classification system covers all data types');
        acceptanceCriteria.push('Classification policies are consistently enforced');
        acceptanceCriteria.push('Tagging system scales with data volume');
        acceptanceCriteria.push('Classification reporting supports compliance needs');
      }
      
      if (taskTitle.includes('incident') || taskTitle.includes('response')) {
        acceptanceCriteria.push('Incident response system detects threats quickly');
        acceptanceCriteria.push('Response workflows coordinate team actions effectively');
        acceptanceCriteria.push('Recovery procedures restore service securely');
        acceptanceCriteria.push('Post-incident analysis improves security posture');
      }
      
      if (taskTitle.includes('UI') || taskTitle.includes('component')) {
        acceptanceCriteria.push('Security interfaces are intuitive for users');
        acceptanceCriteria.push('UI components follow security design patterns');
        acceptanceCriteria.push('Interface design communicates security status clearly');
        acceptanceCriteria.push('Accessibility requirements are met');
      }
      
      if (taskTitle.includes('test') || taskTitle.includes('validation')) {
        acceptanceCriteria.push('Security testing covers all critical attack vectors');
        acceptanceCriteria.push('Validation procedures catch security weaknesses');
        acceptanceCriteria.push('Test coverage meets Epic 19 security standards');
        acceptanceCriteria.push('Security tests integrate with development workflow');
      }
      
      // Default acceptance criteria
      if (acceptanceCriteria.length === 0) {
        acceptanceCriteria.push('Security/compliance feature implemented and functional');
        acceptanceCriteria.push('Integration with existing Epic 19 system verified');
        acceptanceCriteria.push('Security controls meet enterprise requirements');
      }
      
      tasks.push({
        title: taskTitle,
        description,
        estimate,
        priority,
        wipClass,
        story,
        storyName,
        epic: 'Security & Compliance Framework',
        tags,
        acceptanceCriteria
      });
    }
  }
  
  return tasks;
}

// Utility functions
function generateTaskId() {
  const timestamp = Date.now().toString();
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `E19-${timestamp}-${random}`;
}

async function loadCurrentState() {
  const stateFile = path.join(__dirname, 'data/state.json');
  
  try {
    const stateData = await fs.readFile(stateFile, 'utf8');
    return JSON.parse(stateData);
  } catch (error) {
    throw new Error(`Failed to load state.json: ${error.message}`);
  }
}

async function saveState(state) {
  const stateFile = path.join(__dirname, 'data/state.json');
  await fs.writeFile(stateFile, JSON.stringify(state, null, 2));
}

function taskExists(state, title) {
  return Object.values(state.tasks).some(task => 
    task.title && task.title.toLowerCase().trim() === title.toLowerCase().trim()
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
    assignee: null,
    created: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    metadata: {
      source: 'epic19-automation',
      category: 'security-compliance-framework',
      automated: true,
      epic: 'Security & Compliance Framework',
      storyNumber: taskDef.story,
      storyName: taskDef.storyName,
      completionStatus: 'Epic 19 provides comprehensive security and compliance framework - ready for implementation'
    }
  };
}

async function createEpic19Tasks() {
  console.log('🔐 Creating Epic 19: Security & Compliance Framework Tasks\n');
  console.log('📋 Based on: docs/epic19plan.md');
  console.log('ℹ️  Note: Epic 19 provides comprehensive security and compliance capabilities\n');
  
  try {
    // Extract tasks from Epic 19 plan
    const epic19Tasks = await extractTasksFromEpic19Plan();
    
    if (epic19Tasks.length === 0) {
      console.log('🎉 All Epic 19 tasks are already complete!');
      console.log('🔐 Epic 19 Status: 100% complete - Production-ready Security & Compliance Framework');
      return {
        created: 0,
        skipped: 0,
        total: 0,
        allComplete: true
      };
    }
    
    console.log(`📝 Extracted ${epic19Tasks.length} tasks from Epic 19 plan\n`);
    
    // Load current state
    let state = await loadCurrentState();
    
    if (!state.tasks) {
      state.tasks = {};
    }
    
    let tasksCreated = 0;
    let tasksSkipped = 0;
    const storyBreakdown = {};
    const priorityBreakdown = {};
    const wipClassBreakdown = {};
    const securityBreakdown = {};
    
    // Process Epic 19 tasks
    for (const taskDef of epic19Tasks) {
      if (taskExists(state, taskDef.title)) {
        console.log(`⏭️  Skipping "${taskDef.title}" - already exists`);
        tasksSkipped++;
        continue;
      }
      
      const taskId = generateTaskId();
      const task = createTaskObject(taskDef, taskId);
      
      state.tasks[taskId] = task;
      
      console.log(`✅ Created ${taskId}: "${taskDef.title}"`);
      console.log(`   📊 Story: ${taskDef.story} | Priority: ${taskDef.priority} | ⏱️  Estimate: ${taskDef.estimate}`);
      console.log(`   🏷️  Tags: ${taskDef.tags.join(', ')}`);
      console.log('');
      
      tasksCreated++;
      
      // Update breakdowns
      storyBreakdown[taskDef.story] = (storyBreakdown[taskDef.story] || 0) + 1;
      priorityBreakdown[taskDef.priority] = (priorityBreakdown[taskDef.priority] || 0) + 1;
      wipClassBreakdown[taskDef.wipClass] = (wipClassBreakdown[taskDef.wipClass] || 0) + 1;
      
      // Track security features
      const securityTypes = ['authentication', 'encryption', 'audit-logging', 'compliance', 'access-control', 'anomaly-detection'];
      securityTypes.forEach(securityType => {
        if (taskDef.tags.some(tag => tag.includes(securityType))) {
          securityBreakdown[securityType] = (securityBreakdown[securityType] || 0) + 1;
        }
      });
    }
    
    // Update state metadata
    if (!state.metadata) {
      state.metadata = {};
    }
    state.metadata.lastUpdated = new Date().toISOString();
    state.metadata.totalTasks = Object.keys(state.tasks).length;
    state.metadata.epic19TasksCreated = tasksCreated;
    
    // Save updated state
    await saveState(state);
    
    // Generate comprehensive summary
    console.log('📊 EPIC 19 TASK CREATION SUMMARY');
    console.log('=================================\n');
    console.log(`✅ Tasks Created: ${tasksCreated}`);
    console.log(`⏭️  Tasks Skipped: ${tasksSkipped} (already exist)`);
    console.log(`📋 Total Tasks in System: ${Object.keys(state.tasks).length}\n`);
    
    if (tasksCreated > 0) {
      // Story breakdown
      console.log('📋 TASKS BY STORY:\n');
      Object.entries(storyBreakdown).forEach(([story, count]) => {
        console.log(`📈 Story ${story}: ${count} tasks`);
      });
      console.log('');
      
      // Priority breakdown
      console.log('🎯 PRIORITY BREAKDOWN:');
      Object.entries(priorityBreakdown).forEach(([priority, count]) => {
        const emoji = priority === 'high' ? '🔥' : priority === 'medium' ? '⚡' : '📝';
        console.log(`   ${emoji} ${priority.toUpperCase()}: ${count} tasks`);
      });
      console.log('');
      
      // WIP Class breakdown
      console.log('🏗️ WIP CLASS BREAKDOWN:');
      Object.entries(wipClassBreakdown).forEach(([wipClass, count]) => {
        const emoji = wipClass === 'infrastructure' ? '🏗️' : 
                     wipClass === 'ui' ? '🎨' : 
                     wipClass === 'testing' ? '🧪' : 
                     wipClass === 'documentation' ? '📚' : '⚙️';
        console.log(`   ${emoji} ${wipClass.toUpperCase()}: ${count} tasks`);
      });
      console.log('');
      
      // Security feature breakdown
      if (Object.keys(securityBreakdown).length > 0) {
        console.log('🔐 SECURITY FEATURES:');
        Object.entries(securityBreakdown).forEach(([securityType, count]) => {
          const emoji = securityType === 'authentication' ? '🔑' : 
                       securityType === 'encryption' ? '🔐' : 
                       securityType === 'audit-logging' ? '📋' : 
                       securityType === 'compliance' ? '📜' : 
                       securityType === 'access-control' ? '🚪' : 
                       securityType === 'anomaly-detection' ? '🎯' : '🛡️';
          console.log(`   ${emoji} ${securityType.toUpperCase().replace('-', ' ')}: ${count} tasks`);
        });
        console.log('');
      }
    }
    
    console.log('\n🤖 NEXT STEPS FOR AGENTS:\n');
    console.log('1. 🎯 Focus on high-priority authentication and encryption tasks');
    console.log('2. 🔄 Use: `node src/grab-tasks.js <agent-id>` to grab Epic 19 tasks');
    console.log('3. 🏷️  Filter by tags: "authentication", "encryption", "audit-logging", "compliance"');
    console.log('4. ⏱️  Start with core security infrastructure, then build compliance features');
    console.log('5. 📋 Security testing and validation are critical - implement with comprehensive coverage\n');
    
    console.log('✨ Epic 19 tasks created successfully!');
    console.log('🔐 Security & Compliance Framework implementation ready!');
    console.log('📈 Epic 19 Status: Comprehensive security and compliance system ready for development');
    
    return {
      created: tasksCreated,
      skipped: tasksSkipped,
      total: Object.keys(state.tasks).length,
      storyBreakdown,
      priorityBreakdown,
      wipClassBreakdown,
      securityBreakdown
    };
    
  } catch (error) {
    console.error('❌ Failed to create Epic 19 tasks:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  createEpic19Tasks().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { 
  createEpic19Tasks,
  extractTasksFromEpic19Plan
};