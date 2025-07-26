#!/usr/bin/env node
/**
 * Epic 17 Security Pattern Check
 * 
 * Detects dangerous security patterns and enforces security best practices.
 * Checks for SQL injection vulnerabilities, XSS risks, unsafe evaluations, etc.
 */

const fs = require('fs');
const path = require('path');

// Security vulnerability patterns
const SECURITY_PATTERNS = {
  // SQL injection risks
  sqlInjection: [
    /\$\{[^}]*\}.*(?:SELECT|INSERT|UPDATE|DELETE|DROP)/i,
    /['"].*\+.*['"].*(?:SELECT|INSERT|UPDATE|DELETE|DROP)/i,
    /query\s*\([^)]*\+[^)]*\)/i
  ],
  
  // XSS vulnerabilities
  xssRisks: [
    /innerHTML\s*=.*\+/,
    /outerHTML\s*=.*\+/,
    /document\.write\s*\(/,
    /\.html\(\s*[^)]*\+/,
    /dangerouslySetInnerHTML.*\+/
  ],
  
  // Code injection
  codeInjection: [
    /eval\s*\(/,
    /Function\s*\(\s*['"][^'"]*['"],/,
    /new\s+Function\s*\(/,
    /setTimeout\s*\(\s*['"][^'"]*\+/,
    /setInterval\s*\(\s*['"][^'"]*\+/
  ],
  
  // Unsafe operations
  unsafeOperations: [
    /exec\s*\([^)]*\+/,
    /spawn\s*\([^)]*\+/,
    /system\s*\([^)]*\+/,
    /__proto__/,
    /constructor\s*\[\s*['"]prototype['"]\s*\]/,
    /prototype\s*\[\s*['"]constructor['"]\s*\]/
  ],
  
  // Hardcoded secrets/credentials
  hardcodedSecrets: [
    /password\s*[:=]\s*['"][^'"]{8,}['"]/i,
    /api[_-]?key\s*[:=]\s*['"][^'"]{16,}['"]/i,
    /secret\s*[:=]\s*['"][^'"]{16,}['"]/i,
    /token\s*[:=]\s*['"][^'"]{32,}['"]/i,
    /private[_-]?key\s*[:=]\s*['"]-----BEGIN/i
  ],
  
  // Unsafe HTTP operations
  unsafeHTTP: [
    /http:\/\/(?!localhost|127\.0\.0\.1|0\.0\.0\.0)/,
    /fetch\s*\([^)]*\+[^)]*\)/,
    /\.get\s*\([^)]*\+[^)]*\)/,
    /\.post\s*\([^)]*\+[^)]*\)/
  ],
  
  // File system vulnerabilities
  fileSystemRisks: [
    /fs\.readFile[Sync]?\s*\([^)]*\+/,
    /fs\.writeFile[Sync]?\s*\([^)]*\+/,
    /path\.join\s*\([^)]*\.\.[^)]*\)/,
    /(?<!import.*|require.*|from\s*)\.\.\/\.\.\/.*(?!\.ts|\.js|\.tsx|\.jsx)/
  ],
  
  // Authentication/authorization bypasses
  authBypass: [
    /\.user\s*=\s*\{[^}]*admin[^}]*\}/i,
    /\.role\s*=\s*['"]admin['"]/i,
    /isAuthenticated\s*=\s*true/,
    /bypass.*auth/i
  ]
};

// Security best practices violations
const SECURITY_BEST_PRACTICES = {
  // Missing input validation
  missingValidation: [
    /req\.body\.[a-zA-Z_$][a-zA-Z0-9_$]*(?!\s*\?\.|\.validate|\.check)/,
    /req\.params\.[a-zA-Z_$][a-zA-Z0-9_$]*(?!\s*\?\.|\.validate|\.check)/,
    /req\.query\.[a-zA-Z_$][a-zA-Z0-9_$]*(?!\s*\?\.|\.validate|\.check)/
  ],
  
  // Missing error handling
  missingErrorHandling: [
    /JSON\.parse\s*\([^)]+\)(?!\s*\.catch|\s*try)/,
    /parseInt\s*\(\s*(?!process\.env)[^)]+\)(?!\s*\|\||\s*\?\?)/,
    /parseFloat\s*\(\s*(?!process\.env)[^)]+\)(?!\s*\|\||\s*\?\?)/
  ],
  
  // Insecure random
  insecureRandom: [
    /Math\.random\(\)(?!.*crypto)/,
    /Date\.now\(\)(?!.*crypto).*(?:token|id|key|secret)/i
  ]
};

// Allowed patterns (exceptions)
const ALLOWED_PATTERNS = [
  // Development/testing contexts
  /\/\*\s*security-disable/i,
  /\/\/\s*security-disable/i,
  /__tests?__/,
  /\.test\./,
  /\.spec\./,
  /cypress/,
  /jest/
];

function checkSecurityPatterns(filePath: string): any[] {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const violations = [];
    
    // Skip if file is explicitly allowed
    if (ALLOWED_PATTERNS.some(pattern => pattern.test(filePath) || pattern.test(content))) {
      return violations;
    }

    // Check all security patterns
    Object.entries(SECURITY_PATTERNS).forEach(([category, patterns]) => {
      patterns.forEach((pattern, index) => {
        let match;
        const regex = new RegExp(pattern.source, pattern.flags + 'g');
        
        while ((match = regex.exec(content)) !== null) {
          violations.push({
            type: 'vulnerability',
            category,
            pattern: pattern.source,
            match: match[0],
            line: getLineNumber(content, match.index),
            severity: getSeverity(category),
            message: getSecurityMessage(category, match[0])
          });
        }
      });
    });

    // Check best practices
    Object.entries(SECURITY_BEST_PRACTICES).forEach(([category, patterns]) => {
      patterns.forEach((pattern, index) => {
        let match;
        const regex = new RegExp(pattern.source, pattern.flags + 'g');
        
        while ((match = regex.exec(content)) !== null) {
          violations.push({
            type: 'best-practice',
            category,
            pattern: pattern.source,
            match: match[0],
            line: getLineNumber(content, match.index),
            severity: 'medium',
            message: getBestPracticeMessage(category, match[0])
          });
        }
      });
    });

    return violations;
  } catch (error) {
    console.error(`Error checking ${filePath}:`, error.message);
    return [];
  }
}

function getLineNumber(content: string, index: number): number {
  return content.substring(0, index).split('\n').length;
}

function getSeverity(category: string): string {
  const severityMap = {
    sqlInjection: 'critical',
    codeInjection: 'critical',
    xssRisks: 'high',
    hardcodedSecrets: 'high',
    unsafeOperations: 'high',
    authBypass: 'critical',
    unsafeHTTP: 'medium',
    fileSystemRisks: 'high'
  };
  return severityMap[category] || 'medium';
}

function getSecurityMessage(category: string, match: string): string {
  const messages = {
    sqlInjection: 'Potential SQL injection vulnerability detected',
    xssRisks: 'Potential XSS vulnerability - unsafe HTML manipulation',
    codeInjection: 'Dangerous code execution pattern detected',
    unsafeOperations: 'Unsafe operation that could lead to security vulnerabilities',
    hardcodedSecrets: 'Hardcoded secret/credential detected - use environment variables',
    unsafeHTTP: 'Insecure HTTP request - use HTTPS in production',
    fileSystemRisks: 'Potential directory traversal or file system vulnerability',
    authBypass: 'Authentication/authorization bypass pattern detected'
  };
  return messages[category] || 'Security vulnerability detected';
}

function getBestPracticeMessage(category: string, match: string): string {
  const messages = {
    missingValidation: 'Input validation missing - validate all user inputs',
    missingErrorHandling: 'Error handling missing - wrap in try-catch or handle errors',
    insecureRandom: 'Insecure random generation - use crypto.randomBytes() for security'
  };
  return messages[category] || 'Security best practice violation';
}

function main(): void {
  const filePaths = process.argv.slice(2);
  let totalViolations = 0;
  let criticalCount = 0;
  let hasErrors = false;

  if (filePaths.length === 0) {
    console.log('✅ Epic 17 Security Check: No files to check');
    process.exit(0);
  }

  console.log(`🔒 Epic 17 Security Check: Scanning ${filePaths.length} files...`);

  for (const filePath of filePaths) {
    const violations = checkSecurityPatterns(filePath);
    totalViolations += violations.length;

    if (violations.length > 0) {
      hasErrors = true;
      console.log(`\n🚨 ${path.relative(process.cwd(), filePath)}:`);
      
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
        console.log(`      Pattern: ${violation.match.trim()}`);
        console.log(`      Severity: ${violation.severity.toUpperCase()}`);
      });
    }
  }

  if (hasErrors) {
    console.log(`\n💥 Epic 17 Security Check: Found ${totalViolations} security issues`);
    
    if (criticalCount > 0) {
      console.log(`💀 CRITICAL: ${criticalCount} critical security vulnerabilities must be fixed!`);
    }
    
    console.log('\n🔧 Security fix guidelines:');
    console.log('   • Use parameterized queries to prevent SQL injection');
    console.log('   • Sanitize all user inputs before rendering to prevent XSS');
    console.log('   • Avoid eval() and dynamic code execution');
    console.log('   • Store secrets in environment variables, not in code');
    console.log('   • Use HTTPS for all external API calls');
    console.log('   • Validate and sanitize all file system operations');
    console.log('   • Implement proper authentication and authorization checks');
    
    process.exit(1);
  } else {
    console.log(`✅ Epic 17 Security Check: All ${filePaths.length} files passed security scan`);
    process.exit(0);
  }
}

if (require.main === module) {
  main();
}

module.exports = { checkSecurityPatterns, SECURITY_PATTERNS, SECURITY_BEST_PRACTICES };