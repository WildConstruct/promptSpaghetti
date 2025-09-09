#!/usr/bin/env node
/**
 * Create Testing Bug Fix Tickets - Generate tickets for test suite bugs identified during QA
 */

const Database = require('better-sqlite3');
const path = require('path');

function createTestingBugTickets() {
  console.log(
    '🧪 Creating tickets for testing suite bug fixes identified by QA...\n'
  );

  // Initialize database
  const dbPath = path.join(__dirname, 'data/tasks.db');
  const db = new Database(dbPath);

  // Create tables if they don't exist
  db.exec(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'TODO',
        assignee TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        priority TEXT DEFAULT 'MEDIUM',
        tags TEXT,
        estimated_hours INTEGER DEFAULT 0,
        work_class TEXT DEFAULT 'feature',
        business_value TEXT,
        dependencies TEXT,
        metadata TEXT,
        story_id TEXT
      )
    `);

  const timestamp = Date.now();
  const tickets = [];

  // Prepare insert statement
  const insertTask = db.prepare(`
        INSERT INTO tasks (
            id, title, description, status, assignee, priority, 
            tags, estimated_hours, work_class, business_value, 
            story_id, metadata
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

  // Define all the testing bugs we identified
  const testingBugs = [
    {
      id: `T-TEST-${timestamp}-001`,
      title: 'Fix RuntimeNode inheritance failures in runtime test suites',
      priority: 'high',
      est: 3,
      tags: ['testing', 'runtime', 'inheritance', 'typescript'],
      description: `Fix RuntimeNode class inheritance issues causing 4 test suites to fail with "Class extends value undefined is not a constructor or null" errors.

**Affected Test Suites:**
- packages/core/runtime/__tests__/runtime.test.ts
- packages/core/runtime/__tests__/advanced.test.ts  
- packages/core/__tests__/executor/executor.test.ts
- packages/core/__tests__/security.test.ts

**Root Cause:**
Class extension errors in compiled JavaScript files where RuntimeNode is undefined during import.

**Solution:**
Fix import/export chains and ensure proper module resolution for RuntimeNode base class.`
    },
    {
      id: `T-TEST-${timestamp}-002`,
      title: 'Fix React SelectEditor null reference error in inspector tests',
      priority: 'medium',
      est: 2,
      tags: ['testing', 'react', 'inspector', 'null-reference'],
      description: `Fix null reference error in SelectEditor component causing React test failures.

**Error Location:**
packages/core/components/Inspector/SelectEditor.js:58:44 - Cannot read properties of null (reading 'reduce')

**Affected Tests:**
- packages/core/__tests__/inspector-components.test.tsx

**Solution:**
Add null checks and proper error handling in SelectEditor component reduce logic.`
    },
    {
      id: `T-TEST-${timestamp}-003`,
      title:
        'Fix GraphCRDTAdapter method mocking issues in collaboration tests',
      priority: 'medium',
      est: 2,
      tags: ['testing', 'collaboration', 'mocking', 'crdt'],
      description: `Fix missing/incorrect method mocking in GraphCRDTAdapter tests causing "this.yGraph.getNode is not a function" errors.

**Affected Tests:**
- packages/core/__tests__/collaboration/GraphCRDTAdapter.test.ts

**Root Cause:**
Test mocks not properly defining yGraph methods that are called by the adapter.

**Solution:**
Update test mocks to include all required yGraph methods with proper implementations.`
    },
    {
      id: `T-TEST-${timestamp}-004`,
      title: 'Fix workflow store API URL formatting bug in query parameters',
      priority: 'low',
      est: 1,
      tags: ['testing', 'workflow', 'api', 'url-formatting'],
      description: `Fix URL formatting bug where query parameters are incorrectly concatenated with ? instead of &.

**Error:**
Expected: resource_id=resource-1&lock_type=edit  
Received: resource_id=resource-1?lock_type=edit

**Affected Tests:**
- packages/core/__tests__/stores/workflowStore.test.ts

**Solution:**
Fix query parameter concatenation logic in workflow store API calls.`
    },
    {
      id: `T-TEST-${timestamp}-005`,
      title: 'Fix security audit logger compilation syntax errors',
      priority: 'medium',
      est: 2,
      tags: ['testing', 'security', 'compilation', 'decorators'],
      description: `Fix syntax errors in security audit logger preventing test compilation.

**Error:**
SyntaxError: Invalid or unexpected token at @(0, security_audit_logger_1.auditSecurityEvent)

**Affected Tests:**
- packages/core/__tests__/security-audit-logger.test.ts

**Root Cause:**
Decorator syntax or import/export issues in compiled security audit logger.

**Solution:**
Fix decorator syntax and ensure proper compilation of security audit decorators.`
    },
    {
      id: `T-TEST-${timestamp}-006`,
      title: 'Fix workflow store rejectWorkflow API response type mismatch',
      priority: 'low',
      est: 1,
      tags: ['testing', 'workflow', 'api', 'response-types'],
      description: `Fix API response type mismatch in rejectWorkflow test where boolean is expected but object is returned.

**Error:**
Expected: true  
Received: {"success": true}

**Affected Tests:**
- packages/core/__tests__/stores/workflowStore.test.ts

**Solution:**
Update test expectation or API response to match expected return type.`
    }
  ];

  // Add each ticket to the database
  testingBugs.forEach(bug => {
    const metadata = JSON.stringify({
      source: 'qa-testing-analysis',
      category: 'bug-fix',
      severity:
        bug.priority === 'high'
          ? 'major'
          : bug.priority === 'medium'
            ? 'moderate'
            : 'minor',
      acceptanceCriteria: [
        'Test suite runs without errors',
        'All affected test cases pass',
        'No regression in existing functionality',
        'Code follows existing project patterns'
      ]
    });

    // Insert task into database
    insertTask.run(
      bug.id, // id
      bug.title, // title
      bug.description, // description
      'REVIEW', // status - set for review as requested
      'quinn-qa-architect', // assignee
      bug.priority.toUpperCase(), // priority
      bug.tags.join(','), // tags
      bug.est, // estimated_hours
      'BUG_FIX', // work_class
      'Fix testing infrastructure bugs to ensure reliable test execution', // business_value
      'TESTING_QA', // story_id
      metadata // metadata
    );

    tickets.push(bug);
    console.log(
      `✅ Created ${bug.priority.toUpperCase()} priority ticket: ${bug.id}`
    );
    console.log(`   📝 ${bug.title}`);
    console.log(`   ⏱️  Est: ${bug.est} hours`);
    console.log(`   🏷️  Tags: ${bug.tags.join(', ')}`);
    console.log('');
  });

  db.close();

  console.log('📊 SUMMARY:');
  console.log(`   🎫 Total Tickets Created: ${tickets.length}`);
  console.log(
    `   🔥 High Priority: ${tickets.filter(t => t.priority === 'high').length}`
  );
  console.log(
    `   ⚡ Medium Priority: ${tickets.filter(t => t.priority === 'medium').length}`
  );
  console.log(
    `   📋 Low Priority: ${tickets.filter(t => t.priority === 'low').length}`
  );
  console.log(
    `   ⏱️  Total Estimated Time: ${tickets.reduce((sum, t) => sum + t.est, 0)} hours`
  );
  console.log('   📈 All tickets set to REVIEW status for QA approval');
  console.log('\n🎯 Next Steps:');
  console.log('   1. Review tickets with: node src/run-qa-agent.js');
  console.log(
    '   2. Grab approved tickets with: node src/grab-tasks.js <dev-id> <count>'
  );
  console.log(
    '   3. Work on fixes and call: node src/finish-task.js <task-id>'
  );
}

if (require.main === module) {
  createTestingBugTickets();
}

module.exports = { createTestingBugTickets };
