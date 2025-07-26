#!/usr/bin/env node
/**
 * Epic 17 API Documentation Check
 * 
 * Ensures all API routes have proper documentation including:
 * - JSDoc comments with descriptions
 * - Parameter documentation
 * - Response documentation
 * - Error handling documentation
 * - Security requirements
 */

const fs = require('fs');
const path = require('path');

// Required documentation patterns
const DOC_REQUIREMENTS = {
  // Route handler function must have JSDoc
  routeHandler: {
    pattern: /(fastify\.(get|post|put|delete|patch)\s*\([^,]+,\s*)(?:async\s+)?(?:function|\([^)]*\)\s*=>|\{)/g,
    required: ['description', 'params', 'response']
  },
  
  // JSDoc block pattern
  jsdocBlock: /\/\*\*[\s\S]*?\*\//g,
  
  // Required JSDoc tags
  requiredTags: [
    '@description',
    '@route',
    '@method',
    '@access',
    '@param',
    '@returns',
    '@throws',
    '@security'
  ]
};

// Security access patterns
const SECURITY_PATTERNS = {
  requiresAuth: [
    /\.authenticate\(/,
    /requireAuth/,
    /checkAuth/,
    /verifyToken/,
    /requireLogin/
  ],
  requiresRole: [
    /requireRole/,
    /checkRole/,
    /hasRole/,
    /authorize/
  ],
  publicEndpoint: [
    /public/,
    /open/,
    /anonymous/
  ]
};

function checkAPIDocumentation(filePath: string): any[] {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const violations = [];
    
    // Find all route handlers
    const routeHandlers = findRouteHandlers(content);
    
    for (const handler of routeHandlers) {
      const jsdoc = findJSDocForHandler(content, handler);
      
      if (!jsdoc) {
        violations.push({
          type: 'missing-documentation',
          line: handler.line,
          route: handler.route,
          method: handler.method,
          message: `API route ${handler.method.toUpperCase()} ${handler.route} missing JSDoc documentation`
        });
        continue;
      }
      
      // Check required documentation elements
      const missingTags = checkRequiredTags(jsdoc, handler);
      violations.push(...missingTags.map(tag => ({
        type: 'missing-tag',
        line: handler.line,
        route: handler.route,
        method: handler.method,
        tag,
        message: `Missing ${tag} documentation for ${handler.method.toUpperCase()} ${handler.route}`
      })));
      
      // Check security documentation
      const securityIssues = checkSecurityDocumentation(content, handler, jsdoc);
      violations.push(...securityIssues);
      
      // Check parameter documentation
      const paramIssues = checkParameterDocumentation(content, handler, jsdoc);
      violations.push(...paramIssues);
      
      // Check response documentation
      const responseIssues = checkResponseDocumentation(jsdoc, handler);
      violations.push(...responseIssues);
    }
    
    return violations;
  } catch (error) {
    console.error(`Error checking ${filePath}:`, error.message);
    return [];
  }
}

function findRouteHandlers(content: string): any[] {
  const handlers = [];
  const routePattern = /fastify\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g;
  
  let match;
  while ((match = routePattern.exec(content)) !== null) {
    handlers.push({
      method: match[1],
      route: match[2],
      index: match.index,
      line: getLineNumber(content, match.index)
    });
  }
  
  return handlers;
}

function findJSDocForHandler(content: string, handler: any): string | null {
  // Look backwards from handler position for JSDoc comment
  const beforeHandler = content.substring(0, handler.index);
  const lines = beforeHandler.split('\n');
  
  // Look for JSDoc in the previous 20 lines
  let jsdocStart = -1;
  let jsdocEnd = -1;
  
  for (let i = lines.length - 1; i >= Math.max(0, lines.length - 20); i--) {
    const line = lines[i].trim();
    
    if (line === '*/' && jsdocEnd === -1) {
      jsdocEnd = i;
    }
    
    if (line.startsWith('/**') && jsdocEnd !== -1) {
      jsdocStart = i;
      break;
    }
    
    // Stop if we hit another function or significant code
    if (line.includes('function') || line.includes('=>') || line.includes('fastify.')) {
      if (jsdocStart === -1) break;
    }
  }
  
  if (jsdocStart !== -1 && jsdocEnd !== -1) {
    return lines.slice(jsdocStart, jsdocEnd + 1).join('\n');
  }
  
  return null;
}

function checkRequiredTags(jsdoc: string, handler: any): any[] {
  const missingTags = [];
  
  // Basic required tags
  const basicTags = ['@description', '@route', '@method'];
  
  for (const tag of basicTags) {
    if (!jsdoc.includes(tag)) {
      missingTags.push(tag);
    }
  }
  
  // Check for parameter documentation if route has parameters
  if (handler.route.includes(':') && !jsdoc.includes('@param')) {
    missingTags.push('@param');
  }
  
  // Check for response documentation
  if (!jsdoc.includes('@returns') && !jsdoc.includes('@response')) {
    missingTags.push('@returns');
  }
  
  // Check for error documentation
  if (!jsdoc.includes('@throws') && !jsdoc.includes('@error')) {
    missingTags.push('@throws');
  }
  
  return missingTags;
}

function checkSecurityDocumentation(content: string, handler: any, jsdoc: string): any[] {
  const issues = [];
  
  // Determine if endpoint requires authentication
  const requiresAuth = SECURITY_PATTERNS.requiresAuth.some(pattern => 
    pattern.test(content.substring(handler.index, handler.index + 500))
  );
  
  const requiresRole = SECURITY_PATTERNS.requiresRole.some(pattern => 
    pattern.test(content.substring(handler.index, handler.index + 500))
  );
  
  const isPublic = SECURITY_PATTERNS.publicEndpoint.some(pattern => 
    pattern.test(jsdoc) || pattern.test(content.substring(handler.index, handler.index + 500))
  );
  
  // Check security documentation
  if (!jsdoc.includes('@security') && !jsdoc.includes('@access')) {
    issues.push({
      type: 'missing-security-doc',
      line: handler.line,
      route: handler.route,
      method: handler.method,
      message: `Missing security/access documentation for ${handler.method.toUpperCase()} ${handler.route}`
    });
  }
  
  // Validate security documentation accuracy
  if (requiresAuth && jsdoc.includes('@access public')) {
    issues.push({
      type: 'incorrect-security-doc',
      line: handler.line,
      route: handler.route,
      method: handler.method,
      message: `Route requires authentication but documented as public: ${handler.method.toUpperCase()} ${handler.route}`
    });
  }
  
  if (requiresRole && !jsdoc.includes('@access admin') && !jsdoc.includes('@access role')) {
    issues.push({
      type: 'missing-role-doc',
      line: handler.line,
      route: handler.route,
      method: handler.method,
      message: `Route requires role-based access but not documented: ${handler.method.toUpperCase()} ${handler.route}`
    });
  }
  
  return issues;
}

function checkParameterDocumentation(content: string, handler: any, jsdoc: string): any[] {
  const issues = [];
  
  // Extract route parameters
  const routeParams = [];
  const paramMatches = handler.route.matchAll(/:([a-zA-Z_$][a-zA-Z0-9_$]*)/g);
  for (const match of paramMatches) {
    routeParams.push(match[1]);
  }
  
  // Check if all route parameters are documented
  for (const param of routeParams) {
    const paramDocPattern = new RegExp(`@param.*${param}`, 'i');
    if (!paramDocPattern.test(jsdoc)) {
      issues.push({
        type: 'missing-param-doc',
        line: handler.line,
        route: handler.route,
        method: handler.method,
        parameter: param,
        message: `Missing parameter documentation for '${param}' in ${handler.method.toUpperCase()} ${handler.route}`
      });
    }
  }
  
  // Check for body parameter documentation for POST/PUT/PATCH
  if (['post', 'put', 'patch'].includes(handler.method.toLowerCase())) {
    const hasBodyDoc = /@param.*body|@body|@requestBody/i.test(jsdoc);
    if (!hasBodyDoc) {
      issues.push({
        type: 'missing-body-doc',
        line: handler.line,
        route: handler.route,
        method: handler.method,
        message: `Missing request body documentation for ${handler.method.toUpperCase()} ${handler.route}`
      });
    }
  }
  
  return issues;
}

function checkResponseDocumentation(jsdoc: string, handler: any): any[] {
  const issues = [];
  
  // Check for basic response documentation
  const hasResponseDoc = /@returns|@response|@success/i.test(jsdoc);
  if (!hasResponseDoc) {
    issues.push({
      type: 'missing-response-doc',
      line: handler.line,
      route: handler.route,
      method: handler.method,
      message: `Missing response documentation for ${handler.method.toUpperCase()} ${handler.route}`
    });
  }
  
  // Check for error response documentation
  const hasErrorDoc = /@throws|@error|@failure/i.test(jsdoc);
  if (!hasErrorDoc) {
    issues.push({
      type: 'missing-error-doc',
      line: handler.line,
      route: handler.route,
      method: handler.method,
      message: `Missing error response documentation for ${handler.method.toUpperCase()} ${handler.route}`
    });
  }
  
  return issues;
}

function getLineNumber(content: string, index: number): number {
  return content.substring(0, index).split('\n').length;
}

function main() {
  const filePaths = process.argv.slice(2);
  let totalViolations = 0;
  let hasErrors = false;

  if (filePaths.length === 0) {
    console.log('✅ Epic 17 API Documentation: No files to check');
    process.exit(0);
  }

  console.log(`📚 Epic 17 API Documentation: Checking ${filePaths.length} files...`);

  for (const filePath of filePaths) {
    const violations = checkAPIDocumentation(filePath);
    totalViolations += violations.length;

    if (violations.length > 0) {
      hasErrors = true;
      console.log(`\n📋 ${path.relative(process.cwd(), filePath)}:`);
      
      const grouped = violations.reduce((acc, violation) => {
        const key = `${violation.method?.toUpperCase()} ${violation.route}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(violation);
        return acc;
      }, {});
      
      Object.entries(grouped).forEach(([route, routeViolations]) => {
        console.log(`   🚫 ${route}:`);
        routeViolations.forEach(violation => {
          console.log(`      Line ${violation.line}: ${violation.message}`);
        });
      });
    }
  }

  if (hasErrors) {
    console.log(`\n💥 Epic 17 API Documentation: Found ${totalViolations} documentation issues`);
    console.log('\n📝 Documentation requirements:');
    console.log('   • All API routes must have JSDoc comments');
    console.log('   • Include @description, @route, @method tags');
    console.log('   • Document all parameters with @param');
    console.log('   • Document responses with @returns');
    console.log('   • Document errors with @throws');
    console.log('   • Specify access level with @access or @security');
    console.log('   • Example:');
    console.log(`     /**
      * @description Get user profile information
      * @route GET /api/users/:id
      * @method GET
      * @access authenticated
      * @param {string} id - User ID
      * @returns {Object} User profile data
      * @throws {404} User not found
      * @throws {401} Authentication required
      */`);
    process.exit(1);
  } else {
    console.log(`✅ Epic 17 API Documentation: All ${filePaths.length} files properly documented`);
    process.exit(0);
  }
}

if (require.main === module) {
  main();
}

module.exports = { checkAPIDocumentation, DOC_REQUIREMENTS, SECURITY_PATTERNS };