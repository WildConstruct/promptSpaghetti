#!/usr/bin/env node
/**
 * Epic 17 Naming Conventions Check
 * 
 * Enforces consistent camelCase naming conventions across the codebase.
 * Checks for function names, variable names, method names, and property names.
 */

const fs = require('fs');
const path = require('path');

// Naming convention rules
const NAMING_RULES = {
  // camelCase pattern
  camelCase: /^[a-z][a-zA-Z0-9]*$/,
  // PascalCase for classes/components
  pascalCase: /^[A-Z][a-zA-Z0-9]*$/,
  // SCREAMING_SNAKE_CASE for constants
  constantCase: /^[A-Z][A-Z0-9_]*$/,
  // kebab-case for file names (optional)
  kebabCase: /^[a-z0-9-]+$/
};

// Patterns to check
const PATTERNS = {
  // Function declarations: function functionName()
  functionDeclaration: /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g,
  // Variable declarations: const/let/var varName
  variableDeclaration: /(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g,
  // Method definitions: methodName() or methodName:
  methodDefinition: /([a-zA-Z_$][a-zA-Z0-9_$]*)\s*[:(]/g,
  // Property access: .propertyName
  propertyAccess: /\.([a-zA-Z_$][a-zA-Z0-9_$]*)/g,
  // Interface/type properties: propertyName:
  interfaceProperty: /^\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*[:?]/gm,
  // Class definitions: class ClassName
  classDefinition: /class\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g,
  // Interface definitions: interface InterfaceName
  interfaceDefinition: /interface\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g,
  // Type definitions: type TypeName
  typeDefinition: /type\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g,
  // Constants: const CONSTANT_NAME
  constantDefinition: /const\s+([A-Z][A-Z0-9_]*)/g
};

// Known exceptions (framework conventions, third-party APIs, etc.)
const EXCEPTIONS = new Set([
  // React conventions
  '__dirname', '__filename', '_id', '_rev',
  // Node.js conventions
  'process', 'require', 'module', 'exports',
  // Common acronyms
  'API', 'URL', 'HTTP', 'JSON', 'UUID', 'ID',
  // Epic 17 specific conventions
  'QRCode', 'OAuth', 'JWT', 'SQL', 'CSV', 'PDF',
  // Single letter variables (often used in loops, math)
  'i', 'j', 'k', 'x', 'y', 'z', 'a', 'b', 'c',
  // Common abbreviations
  'ctx', 'req', 'res', 'err', 'cb', 'fn', 'db'
]);

function checkNamingConventions(filePath: string): any[] {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const violations = [];
    const fileName = path.basename(filePath);

    // Check function names
    let match;
    while ((match = PATTERNS.functionDeclaration.exec(content)) !== null) {
      const name = match[1];
      if (!EXCEPTIONS.has(name) && !NAMING_RULES.camelCase.test(name)) {
        violations.push({
          type: 'function',
          name,
          line: getLineNumber(content, match.index),
          message: `Function '${name}' should be camelCase`
        });
      }
    }

    // Check variable names
    PATTERNS.variableDeclaration.lastIndex = 0;
    while ((match = PATTERNS.variableDeclaration.exec(content)) !== null) {
      const name = match[1];
      
      // Allow PascalCase for React components (variables ending with Component, or starting with uppercase in .tsx/.jsx files)
      const isReactComponent = (fileName.endsWith('.tsx') || fileName.endsWith('.jsx')) &&
                               (NAMING_RULES.pascalCase.test(name) && 
                                (name.endsWith('Component') || name.endsWith('Editor') || name.endsWith('Provider') || 
                                 name.endsWith('Context') || name.endsWith('Hook') || name.endsWith('Render') ||
                                 name.includes('Inner') || name.includes('Wrapper')));
      
      if (!EXCEPTIONS.has(name) && 
          !NAMING_RULES.camelCase.test(name) && 
          !NAMING_RULES.constantCase.test(name) &&
          !isReactComponent) {
        violations.push({
          type: 'variable',
          name,
          line: getLineNumber(content, match.index),
          message: `Variable '${name}' should be camelCase or CONSTANT_CASE (React components should be PascalCase)`
        });
      }
    }

    // Check class names
    PATTERNS.classDefinition.lastIndex = 0;
    while ((match = PATTERNS.classDefinition.exec(content)) !== null) {
      const name = match[1];
      if (!EXCEPTIONS.has(name) && !NAMING_RULES.pascalCase.test(name)) {
        violations.push({
          type: 'class',
          name,
          line: getLineNumber(content, match.index),
          message: `Class '${name}' should be PascalCase`
        });
      }
    }

    // Check interface names
    PATTERNS.interfaceDefinition.lastIndex = 0;
    while ((match = PATTERNS.interfaceDefinition.exec(content)) !== null) {
      const name = match[1];
      if (!EXCEPTIONS.has(name) && !NAMING_RULES.pascalCase.test(name)) {
        violations.push({
          type: 'interface',
          name,
          line: getLineNumber(content, match.index),
          message: `Interface '${name}' should be PascalCase`
        });
      }
    }

    // Check type names
    PATTERNS.typeDefinition.lastIndex = 0;
    while ((match = PATTERNS.typeDefinition.exec(content)) !== null) {
      const name = match[1];
      if (!EXCEPTIONS.has(name) && !NAMING_RULES.pascalCase.test(name)) {
        violations.push({
          type: 'type',
          name,
          line: getLineNumber(content, match.index),
          message: `Type '${name}' should be PascalCase`
        });
      }
    }

    return violations;
  } catch (error) {
    console.error(`Error checking ${filePath}:`, error.message);
    return [];
  }
}

function getLineNumber(content: string, index: number): number {
  return content.substring(0, index).split('\n').length;
}

function main(): void {
  const filePaths = process.argv.slice(2);
  let totalViolations = 0;
  let hasErrors = false;

  if (filePaths.length === 0) {
    console.log('✅ Epic 17 Naming Conventions: No files to check');
    process.exit(0);
  }

  console.log(`🔍 Epic 17 Naming Conventions: Checking ${filePaths.length} files...`);

  for (const filePath of filePaths) {
    const violations = checkNamingConventions(filePath);
    totalViolations += violations.length;

    if (violations.length > 0) {
      hasErrors = true;
      console.log(`\n❌ ${path.relative(process.cwd(), filePath)}:`);
      
      violations.forEach(violation => {
        console.log(`   Line ${violation.line}: ${violation.message} (${violation.type})`);
      });
    }
  }

  if (hasErrors) {
    console.log(`\n💥 Epic 17 Naming Conventions: Found ${totalViolations} violations`);
    console.log('\n🔧 Fix suggestions:');
    console.log('   • Use camelCase for functions, methods, and variables');
    console.log('   • Use PascalCase for classes, interfaces, and types');
    console.log('   • Use SCREAMING_SNAKE_CASE for constants');
    console.log('   • Consistent naming improves code readability and maintainability');
    process.exit(1);
  } else {
    console.log(`✅ Epic 17 Naming Conventions: All ${filePaths.length} files follow conventions`);
    process.exit(0);
  }
}

if (require.main === module) {
  main();
}

module.exports = { checkNamingConventions, NAMING_RULES, EXCEPTIONS };