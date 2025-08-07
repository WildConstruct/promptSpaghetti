#!/usr/bin/env node

/**
 * Script to fix critical test infrastructure issues
 * Focus: Database service mock types, missing imports, enum/interface exports
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Starting test infrastructure fixes...');

// Find test files with type errors
const testFiles = execSync(`find . -name "*.test.ts" -o -name "*.test.tsx" | grep -v node_modules | head -100`)
  .toString()
  .trim()
  .split('\n')
  .filter(file => file && file.length > 0);

console.log(`📁 Scanning ${testFiles.length} test files for infrastructure issues...`);

let filesProcessed = 0;
let issuesFixed = 0;
const criticalPatterns = [];

testFiles.forEach(filePath => {
  try {
    if (!fs.existsSync(filePath)) return;

    const content = fs.readFileSync(filePath, 'utf8');
    let updatedContent = content;
    let hasChanges = false;

    // Pattern 1: Fix unknown database service mocks
    if (content.includes('as unknown') && content.includes('DatabaseService')) {
      const mockDbPattern = /mockDb.*=.*\{\}.*as unknown/g;
      if (content.match(mockDbPattern)) {
        updatedContent = updatedContent.replace(
          /mockDb.*=.*\{\}.*as unknown/g,
          'mockDb = { query: jest.fn(), transaction: jest.fn(), pool: {}, config: {} } as any'
        );
        hasChanges = true;
        issuesFixed++;
        console.log(`✅ ${path.relative('.', filePath)}: Fixed database service mock`);
      }
    }

    // Pattern 2: Fix client.query mock issues
    if (content.includes('mockClient') && content.includes('query')) {
      const clientPattern = /mockClient.*=.*\{\}.*as unknown/g;
      if (content.match(clientPattern)) {
        updatedContent = updatedContent.replace(
          /mockClient.*=.*\{\}.*as unknown/g,
          'mockClient = { query: jest.fn(), release: jest.fn() } as any'
        );
        hasChanges = true;
        issuesFixed++;
        console.log(`✅ ${path.relative('.', filePath)}: Fixed client mock`);
      }
    }

    // Pattern 3: Fix Redis mock issues
    if (content.includes('mockRedis') && content.includes('as unknown')) {
      const redisPattern = /mockRedis.*=.*\{\}.*as unknown/g;
      if (content.match(redisPattern)) {
        updatedContent = updatedContent.replace(
          /mockRedis.*=.*\{\}.*as unknown/g,
          'mockRedis = { get: jest.fn(), setex: jest.fn(), del: jest.fn() } as any'
        );
        hasChanges = true;
        issuesFixed++;
        console.log(`✅ ${path.relative('.', filePath)}: Fixed Redis mock`);
      }
    }

    // Pattern 4: Fix unknown type constraint violations in jest.fn calls
    const jestFnPattern = /jest\.fn<unknown\[\], unknown>\(\)/g;
    if (content.match(jestFnPattern)) {
      updatedContent = updatedContent.replace(jestFnPattern, 'jest.fn()');
      hasChanges = true;
      issuesFixed++;
      console.log(`✅ ${path.relative('.', filePath)}: Fixed jest.fn type constraints`);
    }

    // Pattern 5: Fix constructor argument issues
    if (content.includes('new DatabaseService() as jest.Mocked')) {
      updatedContent = updatedContent.replace(
        /new DatabaseService\(\) as jest\.Mocked/g,
        'new DatabaseService({} as any) as jest.Mocked'
      );
      hasChanges = true;
      issuesFixed++;
      console.log(`✅ ${path.relative('.', filePath)}: Fixed DatabaseService constructor`);
    }

    // Pattern 6: Fix AuditService constructor issues
    if (content.includes('new AuditService(mockDatabaseService) as jest.Mocked')) {
      updatedContent = updatedContent.replace(
        /new AuditService\(mockDatabaseService\) as jest\.Mocked/g,
        'new AuditService({} as any, mockDatabaseService) as jest.Mocked'
      );
      hasChanges = true;
      issuesFixed++;
      console.log(`✅ ${path.relative('.', filePath)}: Fixed AuditService constructor`);
    }

    if (hasChanges) {
      fs.writeFileSync(filePath, updatedContent);
      filesProcessed++;
    }

    // Track problematic patterns for analysis
    if (content.includes('TS2345') || content.includes('TS2339') || content.includes('TS2307')) {
      criticalPatterns.push({
        file: filePath,
        hasTypeErrors: true,
        hasDatabaseIssues: content.includes('DatabaseService'),
        hasImportIssues: content.includes('Cannot find module'),
        hasEnumIssues: content.includes('only refers to a type'),
      });
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
});

console.log(`\n📊 Infrastructure fix results:`);
console.log(`   • Files processed: ${filesProcessed}`);
console.log(`   • Issues fixed: ${issuesFixed}`);
console.log(`   • Files with critical patterns: ${criticalPatterns.length}`);

if (criticalPatterns.length > 0) {
  console.log(`\n🔍 Files needing additional attention:`);
  criticalPatterns.slice(0, 10).forEach(item => {
    console.log(`   • ${path.relative('.', item.file)}`);
    if (item.hasDatabaseIssues) console.log(`     - Database service issues`);
    if (item.hasImportIssues) console.log(`     - Missing import issues`);
    if (item.hasEnumIssues) console.log(`     - Enum/interface export issues`);
  });
}

console.log(`\n💡 Next steps: Fix enum exports, missing imports, and interface definitions.`);
