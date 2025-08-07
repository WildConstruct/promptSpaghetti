#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Priority files to fix based on error analysis
const priorityFiles = [
  'client/src/components/__tests__/TemplateCreationWizard.test.tsx',
  'client/src/components/admin/RoleCloneManager.tsx', 
  'client/src/components/admin/backup/RestoreInterface.tsx',
  'client/src/components/admin/UnifiedModerationDashboard.tsx',
  'client/src/components/admin/ApiManagementDashboard.tsx'
];

function fixFile(filePath) {
  console.log(`\n🔧 Fixing ${path.basename(filePath)}...`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let fixed = content;
    
    // Common fixes based on error patterns
    
    // Fix 1: Fix mock function generic syntax
    fixed = fixed.replace(/jest\.fn<unknown, unknown>\(\)/g, 'jest.fn()');
    fixed = fixed.replace(/jest\.MockedFunction<any>;,/g, 'jest.MockedFunction<any>;');
    
    // Fix 2: Fix object/array literal issues
    // Fix incomplete object literals in mock data
    fixed = fixed.replace(/created: new Date\( as unknown as unknown\)/g, 'created: new Date()');
    
    // Fix 3: Fix JSX syntax issues
    // Fix render calls missing parentheses
    fixed = fixed.replace(/render\(\);\s*<TestWrapper>/g, 'render(\n        <TestWrapper>');
    
    // Fix 4: Fix mock return values with syntax errors
    fixed = fixed.replace(/mockResolvedValue\(\[\)/g, 'mockResolvedValue([');
    fixed = fixed.replace(/mockResolvedValue\(\{ \)/g, 'mockResolvedValue({');
    
    // Fix 5: Fix trailing commas in interface definitions
    fixed = fixed.replace(/};,/g, '};');
    
    // Fix 6: Fix JSX closing tags
    // Match patterns where JSX elements are incomplete
    fixed = fixed.replace(/\);\s*\n\s*return;\s*\n\s*<QueryClientProvider/g, ');\n  return (\n    <QueryClientProvider');
    
    // Fix 7: Fix missing closing braces in objects
    // Look for patterns where object literals are incomplete
    const lines = fixed.split('\n');
    const fixedLines = [];
    let braceCount = 0;
    let parenCount = 0;
    let inJSX = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      
      // Track braces and parentheses
      for (const char of line) {
        if (char === '{' && !inJSX) braceCount++;
        if (char === '}' && !inJSX) braceCount--;
        if (char === '(') parenCount++;
        if (char === ')') parenCount--;
        if (char === '<' && /^<[A-Z]/.test(line.substring(line.indexOf('<')))) inJSX = true;
        if (char === '>' && inJSX) inJSX = false;
      }
      
      fixedLines.push(line);
    }
    
    fixed = fixedLines.join('\n');
    
    // Write the fixed content
    fs.writeFileSync(filePath, fixed);
    
    // Run TypeScript compiler to check if errors are reduced
    try {
      execSync(`pnpm tsc --noEmit ${filePath}`, { stdio: 'pipe' });
      console.log(`✅ ${path.basename(filePath)} - No TypeScript errors!`);
      return { success: true, errors: 0 };
    } catch (error) {
      const output = error.stdout ? error.stdout.toString() : '';
      const errorCount = (output.match(/error TS/g) || []).length;
      console.log(`⚠️  ${path.basename(filePath)} - Still has ${errorCount} errors`);
      return { success: false, errors: errorCount };
    }
    
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return { success: false, errors: -1 };
  }
}

// Main function to fix priority files
async function main() {
  console.log('🚀 Starting TypeScript Error Fixer');
  console.log('=' .repeat(50));
  
  let totalFixed = 0;
  let totalRemaining = 0;
  
  for (const file of priorityFiles) {
    const fullPath = path.join(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      const result = fixFile(fullPath);
      if (result.success) {
        totalFixed++;
      } else if (result.errors > 0) {
        totalRemaining += result.errors;
      }
    } else {
      console.log(`⚠️  File not found: ${file}`);
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`📊 Summary: ${totalFixed} files completely fixed`);
  console.log(`📊 Remaining errors: ${totalRemaining}`);
  
  // If we need more specific fixes, create a detailed fix for the test file
  if (totalRemaining > 0) {
    console.log('\n🔍 Creating specific fix for TemplateCreationWizard.test.tsx...');
    createSpecificTestFix();
  }
}

function createSpecificTestFix() {
  const testFile = 'client/src/components/__tests__/TemplateCreationWizard.test.tsx';
  const fullPath = path.join(process.cwd(), testFile);
  
  const fixScript = `
// Node.js script to fix specific issues in TemplateCreationWizard.test.tsx
const fs = require('fs');

const filePath = '${fullPath}';
let content = fs.readFileSync(filePath, 'utf8');

// Fix specific patterns found in this file
// 1. Fix the mock definition
content = content.replace(
  /jest\\.mock\\('reactflow', \\(\\) => \\(\\{[\\s\\S]*?\\}\\)\\);/,
  \`jest.mock('reactflow', () => ({
  ReactFlow: ({ children, nodes = [], edges = [], ...props }: {
    children?: React.ReactNode;
    nodes?: unknown;
    edges?: unknown;
    [key: string]: unknown;
  }) => (
    <div data-testid="react-flow" {...props}>
      {children}
      <div data-testid="flow-nodes">{JSON.stringify(nodes)}</div>
      <div data-testid="flow-edges">{JSON.stringify(edges)}</div>
    </div>
  ),
  Controls: () => <div data-testid="flow-controls">Controls</div>,
  Background: () => <div data-testid="flow-background">Background</div>,
  useNodesState: () => [[], jest.fn(), jest.fn()],
  useEdgesState: () => [[], jest.fn(), jest.fn()],
  addEdge: jest.fn(),
  useReactFlow: () => ({
    getNodes: jest.fn(() => []),
    getEdges: jest.fn(() => []),
    setNodes: jest.fn(),
    setEdges: jest.fn(),
    getViewport: jest.fn(() => ({ x: 0, y: 0, zoom: 1 }))
  })
}));\`
);

// 2. Fix the template service mock array
content = content.replace(
  /mockTemplateService\\.getTemplatesByCategory\\.mockResolvedValue\\(\\[\\)[\\s\\S]*?\\]\\);/,
  \`mockTemplateService.getTemplatesByCategory.mockResolvedValue([
      { 
        id: '1', 
        name: 'AI & Analytics', 
        description: 'AI workflows',
        category: 'AI',
        version: '1.0',
        author: 'Test Author',
        rating: 4.5,
        reviews: [],
        graph: { nodes: [], edges: [], annotations: [] },
        metadata: {
          created: new Date(),
          lastModified: new Date(),
          usageCount: 0,
          tags: ['ai', 'analytics'],
          difficulty: 'intermediate',
          category: 'AI',
          language: 'en',
          license: 'MIT',
          dependencies: []
        }
      },
      { 
        id: '2', 
        name: 'Data Processing', 
        description: 'Data workflows',
        category: 'Data',
        version: '1.0',
        author: 'Test Author',
        rating: 4.0,
        reviews: [],
        graph: { nodes: [], edges: [], annotations: [] },
        metadata: {
          created: new Date(),
          lastModified: new Date(),
          usageCount: 0,
          tags: ['data'],
          difficulty: 'intermediate',
          category: 'Data',
          language: 'en',
          license: 'MIT',
          dependencies: []
        }
      },
      { 
        id: '3', 
        name: 'Creative', 
        description: 'Creative workflows',
        category: 'Creative',
        version: '1.0',
        author: 'Test Author',
        rating: 4.2,
        reviews: [],
        graph: { nodes: [], edges: [], annotations: [] },
        metadata: {
          created: new Date(),
          lastModified: new Date(),
          usageCount: 0,
          tags: ['creative'],
          difficulty: 'intermediate',
          category: 'Creative',
          language: 'en',
          license: 'MIT',
          dependencies: []
        }
      }
    ]);\`
);

fs.writeFileSync(filePath, content);
console.log('✅ Applied specific fixes to TemplateCreationWizard.test.tsx');
`;

  const fixScriptPath = path.join(process.cwd(), 'fix-template-test.js');
  fs.writeFileSync(fixScriptPath, fixScript);
  
  try {
    execSync(`node ${fixScriptPath}`, { stdio: 'inherit' });
    fs.unlinkSync(fixScriptPath);
  } catch (error) {
    console.error('Error running specific fix:', error.message);
  }
}

// Run the main function
main().catch(console.error);