#!/usr/bin/env node

/**
 * Missing Import Fix Script
 * Automatically adds missing imports for commonly used components and utilities
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Common missing imports patterns
const importMappings = {
  // React Icons
  Shield: "import { Shield } from 'lucide-react';",
  Info: "import { Info } from 'lucide-react';",
  Zap: "import { Zap } from 'lucide-react';",
  AlertTriangle: "import { AlertTriangle } from 'lucide-react';",
  CheckCircle: "import { CheckCircle } from 'lucide-react';",
  XCircle: "import { XCircle } from 'lucide-react';",
  Clock: "import { Clock } from 'lucide-react';",
  Users: "import { Users } from 'lucide-react';",
  Settings: "import { Settings } from 'lucide-react';",
  Search: "import { Search } from 'lucide-react';",
  Plus: "import { Plus } from 'lucide-react';",
  Minus: "import { Minus } from 'lucide-react';",
  Edit: "import { Edit } from 'lucide-react';",
  Trash: "import { Trash } from 'lucide-react';",
  Download: "import { Download } from 'lucide-react';",
  Upload: "import { Upload } from 'lucide-react';",
  Eye: "import { Eye } from 'lucide-react';",
  EyeOff: "import { EyeOff } from 'lucide-react';",
  CheckSquare: "import { CheckSquare } from 'lucide-react';",
  Pie: "import { Pie } from 'lucide-react';",
  BarChart: "import { BarChart } from 'lucide-react';",
  LineChart: "import { LineChart } from 'lucide-react';",
  Activity: "import { Activity } from 'lucide-react';",
  TrendingUp: "import { TrendingUp } from 'lucide-react';",
  RefreshCw: "import { RefreshCw } from 'lucide-react';",
  Filter: "import { Filter } from 'lucide-react';",
  Save: "import { Save } from 'lucide-react';",
  Copy: "import { Copy } from 'lucide-react';",
  External: "import { External } from 'lucide-react';",

  // React hooks
  useState: "import { useState } from 'react';",
  useEffect: "import { useEffect } from 'react';",
  useContext: "import { useContext } from 'react';",
  useMemo: "import { useMemo } from 'react';",
  useCallback: "import { useCallback } from 'react';",
  useRef: "import { useRef } from 'react';",
  useReducer: "import { useReducer } from 'react';",

  // Common React components
  React: "import React from 'react';",
  Component: "import React, { Component } from 'react';",
  Fragment: "import { Fragment } from 'react';",

  // Testing utilities
  render: "import { render } from '@testing-library/react';",
  screen: "import { screen } from '@testing-library/react';",
  fireEvent: "import { fireEvent } from '@testing-library/react';",
  waitFor: "import { waitFor } from '@testing-library/react';",
  userEvent: "import userEvent from '@testing-library/user-event';",
  within: "import { within } from '@testing-library/react';",

  // Jest
  jest: '// jest is global',
  describe: '// describe is global',
  it: '// it is global',
  test: '// test is global',
  expect: '// expect is global',
  beforeEach: '// beforeEach is global',
  afterEach: '// afterEach is global',

  // Node.js
  process: '// process is global in Node.js',
  Buffer: '// Buffer is global in Node.js',
  console: '// console is global',
  __dirname: '// __dirname is global in Node.js',
  __filename: '// __filename is global in Node.js',
};

// Directories to process
const directories = [
  'packages/core/components/',
  'client/src/components/',
  'packages/core/runtime/',
  'server/src/services/',
  'packages/core/__tests__/',
  'client/src/__tests__/',
  'server/src/__tests__/',
];

async function analyzeUndefinedVariables(directory) {
  console.log(`\n🔍 Analyzing undefined variables in: ${directory}`);

  try {
    const result = execSync(`npx eslint "${directory}" --ext .ts,.tsx,.js,.jsx --format=compact`, {
      encoding: 'utf8',
      stdio: 'pipe',
    });
    console.log(`   ✅ No undefined variable issues found`);
    return [];
  } catch (error) {
    const output = String(error.stdout || error.stderr || '');

    // Extract undefined variable errors
    const undefinedMatches = output.match(/(.*?):\s*line\s*(\d+).*?'(\w+)'\s+is\s+not\s+defined/g) || [];
    const jsxUndefinedMatches =
      output.match(/(.*?):\s*line\s*(\d+).*?'(\w+)'\s+is\s+not\s+defined.*?react\/jsx-no-undef/g) || [];

    const allMatches = [...undefinedMatches, ...jsxUndefinedMatches];

    const issues = allMatches
      .map(match => {
        const parts = match.match(/(.*?):\s*line\s*(\d+).*?'(\w+)'\s+is\s+not\s+defined/);
        if (parts) {
          return {
            file: parts[1],
            line: parseInt(parts[2]),
            variable: parts[3],
            isJSX: match.includes('jsx-no-undef'),
          };
        }
        return null;
      })
      .filter(Boolean);

    console.log(`   📊 Found ${issues.length} undefined variable issues`);
    return issues;
  }
}

async function addMissingImports(filePath, issues) {
  const filename = path.basename(filePath);

  if (!fs.existsSync(filePath)) {
    console.log(`   ⚠️  File not found: ${filePath}`);
    return 0;
  }

  console.log(`   🔧 Adding imports for ${issues.length} undefined variables in: ${filename}`);

  let content = fs.readFileSync(filePath, 'utf8');
  let addCount = 0;

  // Group issues by variable name to avoid duplicates
  const uniqueVariables = [...new Set(issues.map(issue => issue.variable))];
  const importsToAdd = [];

  for (const variable of uniqueVariables) {
    if (importMappings[variable]) {
      const importStatement = importMappings[variable];

      // Skip if it's just a comment (globals)
      if (importStatement.startsWith('//')) {
        console.log(`     ℹ️  ${variable} is global - no import needed`);
        continue;
      }

      // Check if import already exists
      if (content.includes(importStatement) || content.includes(`import { ${variable} }`)) {
        console.log(`     ℹ️  ${variable} import already exists`);
        continue;
      }

      importsToAdd.push({
        variable,
        statement: importStatement,
      });
    } else {
      console.log(`     ❓ Unknown variable: ${variable} - skipping`);
    }
  }

  if (importsToAdd.length === 0) {
    console.log(`   ✅ No imports to add for ${filename}`);
    return 0;
  }

  // Add imports at the top of the file
  const lines = content.split('\n');
  let insertIndex = 0;

  // Find where to insert imports (after existing imports or at top)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('import ') || line.startsWith('//') || line.startsWith('/*') || line === '') {
      insertIndex = i + 1;
    } else {
      break;
    }
  }

  // Group imports by module for cleaner organization
  const importsByModule = {};
  for (const imp of importsToAdd) {
    const match = imp.statement.match(/from ['"](.+)['"];/);
    const module = match ? match[1] : 'unknown';

    if (!importsByModule[module]) {
      importsByModule[module] = [];
    }
    importsByModule[module].push(imp.variable);
  }

  // Create consolidated import statements
  const consolidatedImports = [];
  for (const [module, variables] of Object.entries(importsByModule)) {
    if (module === 'react') {
      // Consolidate React imports
      const existingReactImport = content.match(
        /import\s+(?:React(?:\s*,\s*)?)?(?:\{\s*([^}]*)\s*\})?\s+from\s+['"]react['"];/
      );

      if (existingReactImport) {
        // Add to existing React import
        const existingImports = existingReactImport[1] ? existingReactImport[1].split(',').map(s => s.trim()) : [];
        const newImports = [...new Set([...existingImports, ...variables])];
        const newImportStatement = `import { ${newImports.join(', ')} } from 'react';`;

        content = content.replace(existingReactImport[0], newImportStatement);
        console.log(`     ✓ Consolidated React import: ${variables.join(', ')}`);
        addCount += variables.length;
      } else {
        // Create new React import
        consolidatedImports.push(`import { ${variables.join(', ')} } from '${module}';`);
        console.log(`     ✓ Added React import: ${variables.join(', ')}`);
        addCount += variables.length;
      }
    } else {
      // Regular imports
      consolidatedImports.push(`import { ${variables.join(', ')} } from '${module}';`);
      console.log(`     ✓ Added import from ${module}: ${variables.join(', ')}`);
      addCount += variables.length;
    }
  }

  // Insert new import statements
  if (consolidatedImports.length > 0) {
    lines.splice(insertIndex, 0, ...consolidatedImports, '');
    content = lines.join('\n');
  }

  // Write back to file
  if (addCount > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`   ✅ Added ${addCount} imports to ${filename}`);
  }

  return addCount;
}

async function processDirectory(directory) {
  console.log(`\n🚀 Processing directory: ${directory}`);

  const issues = await analyzeUndefinedVariables(directory);

  if (issues.length === 0) {
    return 0;
  }

  // Group issues by file
  const issuesByFile = issues.reduce((acc, issue) => {
    if (!acc[issue.file]) {
      acc[issue.file] = [];
    }
    acc[issue.file].push(issue);
    return acc;
  }, {});

  let totalAdded = 0;

  for (const [filePath, fileIssues] of Object.entries(issuesByFile)) {
    const added = await addMissingImports(filePath, fileIssues);
    totalAdded += added;

    // Brief pause between files
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`   🎉 Directory summary: ${totalAdded} imports added`);
  return totalAdded;
}

async function main() {
  console.log('🎯 Missing Import Fix Script');
  console.log('📦 Automatically adding missing imports for undefined variables\n');

  // Get baseline count
  console.log('📊 Getting baseline undefined variable count...');
  try {
    execSync('pnpm lint', { stdio: 'pipe' });
  } catch (error) {
    const output = String(error.stdout || error.stderr || '');
    const undefinedCount = (output.match(/is not defined/g) || []).length;
    console.log(`📈 Found ~${undefinedCount} undefined variable violations\n`);
  }

  let totalAdded = 0;

  for (const directory of directories) {
    const added = await processDirectory(directory);
    totalAdded += added;

    // Brief pause between directories
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n📊 IMPORT FIX SUMMARY:');
  console.log(`📦 Total imports added: ${totalAdded}`);

  // Get new count
  console.log('\n🔄 Checking impact...');
  try {
    execSync('pnpm lint', { stdio: 'pipe' });
    console.log('✅ All linting issues resolved!');
  } catch (error) {
    const output = String(error.stdout || error.stderr || '');
    const remaining = output.match(/(\d+) problems?/);
    const undefinedCount = (output.match(/is not defined/g) || []).length;

    console.log(`📈 Remaining problems: ${remaining ? remaining[1] : 'Unknown'}`);
    console.log(`📈 Remaining undefined vars: ~${undefinedCount}`);

    if (totalAdded > 0) {
      console.log(`🎉 Estimated improvement: ${totalAdded} imports added`);
    }
  }

  console.log('\n📝 Next steps:');
  console.log('   1. Review added imports with: git diff');
  console.log('   2. Run tests to ensure imports are correct');
  console.log('   3. Commit changes if satisfied');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { analyzeUndefinedVariables, addMissingImports, processDirectory };
