#!/usr/bin/env node
/**
 * Epic 17 Database Migration Safety Check
 * 
 * Ensures database migrations follow safety best practices:
 * - Backward compatibility
 * - No destructive operations without explicit confirmation
 * - Proper indexing strategies
 * - Transaction safety
 * - Performance considerations
 */

const fs = require('fs');
const path = require('path');

// Dangerous SQL patterns that require careful review
const DANGEROUS_PATTERNS = {
  // Destructive operations
  destructive: [
    /DROP\s+TABLE\s+/i,
    /DROP\s+DATABASE\s+/i,
    /DROP\s+COLUMN\s+/i,
    /DROP\s+INDEX\s+/i,
    /TRUNCATE\s+/i,
    /DELETE\s+FROM\s+(?!.*WHERE)/i // DELETE without WHERE clause
  ],
  
  // Schema changes that may break existing code
  breakingChanges: [
    /ALTER\s+TABLE\s+.*\s+DROP\s+/i,
    /ALTER\s+TABLE\s+.*\s+RENAME\s+COLUMN\s+/i,
    /ALTER\s+TABLE\s+.*\s+MODIFY\s+COLUMN\s+/i,
    /ALTER\s+TABLE\s+.*\s+CHANGE\s+COLUMN\s+/i,
    /RENAME\s+TABLE\s+/i
  ],
  
  // Operations that may cause performance issues
  performanceRisks: [
    /ALTER\s+TABLE\s+.*\s+ADD\s+COLUMN\s+.*NOT\s+NULL(?!\s+DEFAULT)/i, // NOT NULL without DEFAULT
    /CREATE\s+INDEX\s+(?!CONCURRENTLY)/i, // Non-concurrent index creation
    /ALTER\s+TABLE\s+.*\s+ADD\s+CONSTRAINT\s+.*FOREIGN\s+KEY/i, // FK without checking existing data
    /ALTER\s+TABLE\s+.*\s+MODIFY\s+COLUMN\s+.*\s+NOT\s+NULL/i // Making nullable column NOT NULL
  ],
  
  // Missing transaction management
  transactionIssues: [
    /^(?!.*BEGIN|.*START\s+TRANSACTION).*(?:ALTER|DROP|CREATE|INSERT|UPDATE|DELETE)/mi
  ],
  
  // Unsafe data operations
  unsafeDataOps: [
    /UPDATE\s+.*\s+SET\s+.*=.*\s+(?!WHERE)/i, // UPDATE without WHERE
    /INSERT\s+INTO\s+.*\s+SELECT\s+.*(?!LIMIT)/i, // Large INSERT SELECT without LIMIT
    /CREATE\s+TABLE\s+.*\s+SELECT\s+\*/i // CREATE TABLE AS SELECT *
  ]
};

// Required safety patterns
const SAFETY_REQUIREMENTS = {
  // Should have rollback strategy
  rollbackStrategy: [
    /-- ROLLBACK:/i,
    /-- REVERSE:/i,
    /-- UNDO:/i,
    /-- DOWN:/i
  ],
  
  // Should have transaction wrapper for DDL
  transactionWrapper: [
    /BEGIN;|START TRANSACTION;/i,
    /COMMIT;/i
  ],
  
  // Should have backup strategy for data changes
  backupStrategy: [
    /-- BACKUP:/i,
    /-- SNAPSHOT:/i,
    /CREATE\s+TABLE\s+.*_backup/i
  ]
};

// Migration naming patterns
const MIGRATION_PATTERNS = {
  // Should follow timestamp naming convention
  timestampNaming: /^\d{3}_\w+\.sql$/,
  
  // Should have descriptive names
  descriptiveNaming: /^\d{3}_[a-z0-9_]{10,}\.sql$/
};

function checkMigrationSafety(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);
    const violations = [];
    
    // Check file naming convention
    if (!MIGRATION_PATTERNS.timestampNaming.test(fileName)) {
      violations.push({
        type: 'naming-convention',
        line: 1,
        severity: 'medium',
        message: 'Migration file should follow naming convention: NNN_descriptive_name.sql'
      });
    }
    
    if (!MIGRATION_PATTERNS.descriptiveNaming.test(fileName)) {
      violations.push({
        type: 'naming-convention',
        line: 1,
        severity: 'low',
        message: 'Migration file name should be more descriptive (at least 10 characters)'
      });
    }
    
    // Check for dangerous patterns
    Object.entries(DANGEROUS_PATTERNS).forEach(([category, patterns]) => {
      patterns.forEach(pattern => {
        let match;
        const regex = new RegExp(pattern.source, pattern.flags + 'g');
        
        while ((match = regex.exec(content)) !== null) {
          violations.push({
            type: 'dangerous-operation',
            category,
            line: getLineNumber(content, match.index),
            severity: getSeverity(category),
            statement: match[0].trim(),
            message: getDangerousOperationMessage(category, match[0])
          });
        }
      });
    });
    
    // Check for required safety measures
    if (hasDangerousOperations(content)) {
      // Check for rollback strategy
      const hasRollback = SAFETY_REQUIREMENTS.rollbackStrategy.some(pattern => pattern.test(content));
      if (!hasRollback) {
        violations.push({
          type: 'missing-safety-measure',
          line: 1,
          severity: 'high',
          message: 'Migration with dangerous operations should include rollback strategy (-- ROLLBACK: comment)'
        });
      }
      
      // Check for transaction wrapper
      const hasTransaction = SAFETY_REQUIREMENTS.transactionWrapper.every(pattern => pattern.test(content));
      if (!hasTransaction) {
        violations.push({
          type: 'missing-safety-measure',
          line: 1,
          severity: 'medium',
          message: 'Migration should be wrapped in transaction (BEGIN; ... COMMIT;)'
        });
      }
    }
    
    // Check for data modification safety
    if (hasDataModifications(content)) {
      const hasBackupStrategy = SAFETY_REQUIREMENTS.backupStrategy.some(pattern => pattern.test(content));
      if (!hasBackupStrategy) {
        violations.push({
          type: 'missing-safety-measure',
          line: 1,
          severity: 'medium',
          message: 'Data modification should include backup strategy (-- BACKUP: comment or backup table)'
        });
      }
    }
    
    // Check for performance considerations
    const performanceIssues = checkPerformanceConsiderations(content);
    violations.push(...performanceIssues);
    
    // Check for Epic 17 specific requirements
    const epic17Issues = checkEpic17Requirements(content, fileName);
    violations.push(...epic17Issues);
    
    return violations;
  } catch (error) {
    console.error(`Error checking ${filePath}:`, error.message);
    return [];
  }
}

function hasDangerousOperations(content) {
  return Object.values(DANGEROUS_PATTERNS).some(patterns =>
    patterns.some(pattern => pattern.test(content))
  );
}

function hasDataModifications(content) {
  const dataModPatterns = [
    /INSERT\s+INTO/i,
    /UPDATE\s+/i,
    /DELETE\s+FROM/i,
    /TRUNCATE\s+/i
  ];
  return dataModPatterns.some(pattern => pattern.test(content));
}

function getSeverity(category) {
  const severityMap = {
    destructive: 'critical',
    breakingChanges: 'high',
    performanceRisks: 'medium',
    transactionIssues: 'medium',
    unsafeDataOps: 'high'
  };
  return severityMap[category] || 'medium';
}

function getDangerousOperationMessage(category, statement) {
  const messages = {
    destructive: 'Destructive operation detected - ensure this is intentional and properly backed up',
    breakingChanges: 'Schema change may break existing application code - verify compatibility',
    performanceRisks: 'Operation may cause performance issues or table locks',
    transactionIssues: 'Missing transaction management - wrap in BEGIN/COMMIT',
    unsafeDataOps: 'Unsafe data operation - missing WHERE clause or other safety measures'
  };
  return messages[category] || 'Potentially dangerous database operation';
}

function checkPerformanceConsiderations(content) {
  const issues = [];
  
  // Check for large table operations
  const largeTableOps = content.match(/ALTER\s+TABLE\s+(\w+)/gi);
  if (largeTableOps && largeTableOps.length > 0) {
    // Suggest using online DDL or maintenance windows
    issues.push({
      type: 'performance-consideration',
      line: 1,
      severity: 'medium',
      message: 'Consider using online DDL or scheduling during maintenance window for table alterations'
    });
  }
  
  // Check for missing indexes on foreign keys
  const fkPattern = /ADD\s+CONSTRAINT\s+.*FOREIGN\s+KEY\s*\(\s*([^)]+)\s*\)/gi;
  let fkMatch;
  while ((fkMatch = fkPattern.exec(content)) !== null) {
    const columnName = fkMatch[1].trim();
    const indexPattern = new RegExp(`CREATE\\s+INDEX\\s+.*\\(\\s*${columnName}\\s*\\)`, 'i');
    
    if (!indexPattern.test(content)) {
      issues.push({
        type: 'missing-index',
        line: getLineNumber(content, fkMatch.index),
        severity: 'medium',
        message: `Consider adding index on foreign key column '${columnName}' for performance`
      });
    }
  }
  
  return issues;
}

function checkEpic17Requirements(content, fileName) {
  const issues = [];
  
  // Check for Epic 17 specific requirements
  const isEpic17Migration = fileName.includes('epic17') || content.includes('Epic 17') || content.includes('Epic17');
  
  if (isEpic17Migration) {
    // Check for proper Epic 17 task tracking
    if (!content.includes('Task:') && !content.includes('E17-')) {
      issues.push({
        type: 'epic17-requirement',
        line: 1,
        severity: 'medium',
        message: 'Epic 17 migration should reference task ID (E17-XXXXXXXXXXXXX-XXXXXX)'
      });
    }
    
    // Check for security considerations in admin features
    if (content.includes('admin') || content.includes('Admin')) {
      const hasSecurityConsiderations = /-- Security:|-- RBAC:|-- Permissions:/i.test(content);
      if (!hasSecurityConsiderations) {
        issues.push({
          type: 'epic17-security',
          line: 1,
          severity: 'high',
          message: 'Admin-related migration should include security considerations comment'
        });
      }
    }
    
    // Check for feature flag integration
    if (content.includes('feature') && !content.includes('feature_flag')) {
      issues.push({
        type: 'epic17-feature-flag',
        line: 1,
        severity: 'low',
        message: 'Consider integrating with Epic 17 feature flag system'
      });
    }
  }
  
  return issues;
}

function getLineNumber(content, index) {
  return content.substring(0, index).split('\n').length;
}

function main() {
  const filePaths = process.argv.slice(2);
  let totalViolations = 0;
  let criticalCount = 0;
  let hasErrors = false;

  if (filePaths.length === 0) {
    console.log('✅ Epic 17 Migration Safety: No files to check');
    process.exit(0);
  }

  console.log(`🗃️ Epic 17 Migration Safety: Checking ${filePaths.length} migration files...`);

  for (const filePath of filePaths) {
    const violations = checkMigrationSafety(filePath);
    totalViolations += violations.length;

    if (violations.length > 0) {
      hasErrors = true;
      console.log(`\n⚠️ ${path.relative(process.cwd(), filePath)}:`);
      
      violations.forEach(violation => {
        const severityIcon = {
          critical: '💀',
          high: '🔥',
          medium: '⚠️',
          low: '💡'
        }[violation.severity] || '⚠️';

        if (violation.severity === 'critical') {
          criticalCount++;
        }
        
        console.log(`   Line ${violation.line}: ${severityIcon} ${violation.message}`);
        if (violation.statement) {
          console.log(`      Statement: ${violation.statement}`);
        }
        console.log(`      Severity: ${violation.severity.toUpperCase()}`);
      });
    }
  }

  if (hasErrors) {
    console.log(`\n💥 Epic 17 Migration Safety: Found ${totalViolations} safety issues`);
    
    if (criticalCount > 0) {
      console.log(`💀 CRITICAL: ${criticalCount} critical safety violations must be addressed!`);
    }
    
    console.log('\n🔧 Migration safety guidelines:');
    console.log('   • Always wrap destructive operations in transactions');
    console.log('   • Include rollback strategy for dangerous operations');
    console.log('   • Add backup strategy for data modifications');
    console.log('   • Use descriptive file names with timestamps');
    console.log('   • Consider performance impact of schema changes');
    console.log('   • Test migrations on staging data first');
    console.log('   • Include Epic 17 task references');
    console.log('   • Document security considerations for admin features');
    
    process.exit(1);
  } else {
    console.log(`✅ Epic 17 Migration Safety: All ${filePaths.length} migrations follow safety guidelines`);
    process.exit(0);
  }
}

if (require.main === module) {
  main();
}

module.exports = { checkMigrationSafety, DANGEROUS_PATTERNS, SAFETY_REQUIREMENTS };