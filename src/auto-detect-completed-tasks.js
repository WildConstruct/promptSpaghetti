#!/usr/bin/env node
// Auto-detect completed tasks based on file implementations

const fs = require('fs');
const path = require('path');

console.log('🔍 Auto-detecting completed tasks...\n');

// Load current state
const statePath = path.join(__dirname, 'data', 'state.json');

if (!fs.existsSync(statePath)) {
  console.error('❌ State file not found');
  process.exit(1);
}

let state;
try {
  const stateData = fs.readFileSync(statePath, 'utf8');
  state = JSON.parse(stateData);
} catch (error) {
  console.error('❌ Error reading state file:', error.message);
  process.exit(1);
}

// Get all IN_PROGRESS tasks
const inProgressTasks = Object.values(state.tasks)
  .filter(task => task.state === 'IN_PROGRESS');

console.log(`📋 Found ${inProgressTasks.length} tasks in IN_PROGRESS status\n`);

const detectedCompletedTasks = [];

// Define patterns that suggest task completion
const completionPatterns = [
  // Authentication patterns
  {
    keywords: ['totp', 'authenticator', 'mfa'],
    files: [
      'server/src/auth/services/TOTPService.ts',
      'server/src/auth/services/TOTPSecretManager.ts'
    ]
  },
  // Password patterns
  {
    keywords: ['password', 'strength', 'complexity'],
    files: [
      'packages/core/components/PasswordStrengthIndicator.tsx',
      'packages/core/auth/PasswordComplexityValidator.ts'
    ]
  },
  // Rate limiting patterns
  {
    keywords: ['rate', 'limiting', 'middleware'],
    files: [
      'server/src/auth/middleware/RateLimitingMiddleware.ts',
      'packages/core/security/RateLimitingService.ts',
      'packages/core/security/RedisRateLimitStore.ts'
    ]
  },
  // Session patterns
  {
    keywords: ['session', 'rotation', 'expiration'],
    files: [
      'server/src/auth/services/SessionRotationService.ts',
      'server/src/auth/services/SessionExpirationService.ts',
      'server/src/auth/services/EnhancedSessionService.ts'
    ]
  },
  // Security patterns
  {
    keywords: ['security', 'audit', 'headers'],
    files: [
      'server/src/middleware/security-headers.ts',
      'server/src/services/security-audit-service.ts',
      'server/src/auth/services/SecurityHeaderAuditService.ts'
    ]
  },
  // Account lockout patterns
  {
    keywords: ['lockout', 'account', 'lockout'],
    files: [
      'server/src/auth/services/AccountLockoutService.ts',
      'packages/core/security/AccountLockoutService.ts',
      'server/src/auth/services/TemporaryLockoutService.ts'
    ]
  },
  // Challenge/CAPTCHA patterns
  {
    keywords: ['challenge', 'captcha', 'verification'],
    files: [
      'server/src/auth/services/ChallengeService.ts',
      'server/src/auth/middleware/ChallengeMiddleware.ts',
      'client/src/components/auth/ChallengeComponent.tsx'
    ]
  },
  // CORS patterns
  {
    keywords: ['cors', 'policy'],
    files: [
      'server/src/auth/services/CORSPolicyService.ts'
    ]
  },
  // Cookie patterns
  {
    keywords: ['cookie', 'secure', 'httponly'],
    files: [
      'server/src/auth/middleware/SecureCookieMiddleware.ts'
    ]
  }
];

// Check each IN_PROGRESS task
for (const task of inProgressTasks) {
  const title = task.title.toLowerCase();
  
  // Find matching patterns
  const matchingPatterns = completionPatterns.filter(pattern => 
    pattern.keywords.some(keyword => title.includes(keyword))
  );
  
  if (matchingPatterns.length > 0) {
    // Check if implementation files exist
    const implementationFiles = [];
    const missingFiles = [];
    
    for (const pattern of matchingPatterns) {
      for (const filePath of pattern.files) {
        const fullPath = path.join(__dirname, '..', filePath);
        if (fs.existsSync(fullPath)) {
          const stats = fs.statSync(fullPath);
          implementationFiles.push({
            path: filePath,
            size: stats.size,
            modified: stats.mtime
          });
        } else {
          missingFiles.push(filePath);
        }
      }
    }
    
    // Consider task completed if it has substantial implementation files
    const hasSubstantialImplementation = implementationFiles.some(file => file.size > 5000); // 5KB+
    const hasMultipleFiles = implementationFiles.length > 0;
    
    if (hasSubstantialImplementation || (hasMultipleFiles && missingFiles.length === 0)) {
      detectedCompletedTasks.push({
        task,
        implementationFiles,
        confidence: hasSubstantialImplementation ? 'HIGH' : 'MEDIUM'
      });
    }
  }
}

// Report findings
console.log('🎯 Auto-detection Results:\n');

if (detectedCompletedTasks.length === 0) {
  console.log('✅ No obviously completed tasks detected');
} else {
  console.log(`🔍 Detected ${detectedCompletedTasks.length} potentially completed tasks:\n`);
  
  detectedCompletedTasks.forEach((detection, index) => {
    const { task, implementationFiles, confidence } = detection;
    
    console.log(`${index + 1}. ${task.id}: "${task.title}"`);
    console.log(`   Assignee: ${task.assignee}`);
    console.log(`   Confidence: ${confidence}`);
    console.log(`   Files found: ${implementationFiles.length}`);
    
    implementationFiles.forEach(file => {
      const sizeKB = Math.round(file.size / 1024);
      console.log(`   - ${file.path} (${sizeKB}KB, ${file.modified.toISOString().split('T')[0]})`);
    });
    
    console.log('');
  });
  
  // Ask if user wants to move these to REVIEW
  console.log('💡 To move these tasks to REVIEW status, run:');
  detectedCompletedTasks.forEach(detection => {
    console.log(`   node src/finish-task.js ${detection.task.id} REVIEW`);
  });
  
  console.log('');
  console.log('🔧 Or run the batch fix script:');
  console.log('   node src/auto-fix-completed-tasks.js');
}

console.log(`\n📊 Summary:`);
console.log(`   Total IN_PROGRESS tasks: ${inProgressTasks.length}`);
console.log(`   Detected completed: ${detectedCompletedTasks.length}`);
console.log(`   Still in progress: ${inProgressTasks.length - detectedCompletedTasks.length}`);

// Export results for other scripts
if (require.main === module) {
  // Running directly
  process.exit(0);
} else {
  // Being required by another script
  module.exports = {
    detectedCompletedTasks,
    inProgressTasks
  };
}