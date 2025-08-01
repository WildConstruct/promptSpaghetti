#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

/**
 * Fix specific syntax errors in EnhancedGraphEditor.tsx
 */

const filePath = path.join(__dirname, '..', 'client/src/components/EnhancedGraphEditor.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Fix 1: Remove extra closing braces after </div>
content = content.replace(/}<\/div>}>/gm, '}</div>');

// Fix 2: Fix closing div tags with extra characters
content = content.replace(/<\/div}}>}/g, '</div>');

// Fix 3: Fix the specific pattern where there are extra braces
content = content.replace(/\|\| '[^']+'\)}<\/div>}>/g, (match) => {
  return match.replace('}</div>}>', '}</div>');
});

// Fix 4: Fix style objects that are missing closing braces before JSX closing tags
content = content.replace(/}\s*>\s*>/g, '}}>');

// Fix 5: Fix closing braces for Handle components
content = content.replace(/height: '12px'\n}\n/g, "height: '12px'\n}}\n");

// Fix 6: Fix the NodeData interface
content = content.replace(/options\?: Array<\{,/, 'options?: Array<{');

// Fix 7: Fix the nodeTypes declaration
content = content.replace(/const nodeTypes: NodeTypes = \{,/, 'const nodeTypes: NodeTypes = {');

// Fix 8: Fix the ProfessionalPalette component interface
content = content.replace(/const ProfessionalPalette: React\.FC<\{,/, 'const ProfessionalPalette: React.FC<{');

// Fix 9: Fix the InspectorPanel component interface  
content = content.replace(/const InspectorPanel: React\.FC<\{,/, 'const InspectorPanel: React.FC<{');

// Fix 10: Fix the StatusBar component interface
content = content.replace(/const StatusBar: React\.FC<\{,/, 'const StatusBar: React.FC<{');

// Fix 11: Fix defaultNodes array declaration
content = content.replace(/const defaultNodes: Node = \[/, 'const defaultNodes: Node[] = [');

// Fix 12: Fix defaultEdges array declaration
content = content.replace(/const defaultEdges: Edge = \[/, 'const defaultEdges: Edge[] = [');

// Fix 13: Fix case statement syntax
content = content.replace(/case 'text':,/g, 'case \'text\':');
content = content.replace(/case 'logic':,/g, 'case \'logic\':');
content = content.replace(/case 'transform':,/g, 'case \'transform\':');
content = content.replace(/case 'variable':,/g, 'case \'variable\':');

// Fix 14: Fix colorMap declaration
content = content.replace(/const colorMap: Record<string, string> = \{,/, 'const colorMap: Record<string, string> = {');

// Fix 15: Fix the else clause
content = content.replace(/\n\s*else \{/g, ' else {');

// Fix 16: Fix the newNode declaration
content = content.replace(/const newNode: Node = \{,/, 'const newNode: Node = {');

// Fix 17: Fix missing closing braces in if statements
content = content.replace(/}\s*else if \(e\.key === 'Escape'\)/g, '}\n} else if (e.key === \'Escape\')');
content = content.replace(/}\s*else if \(e\.key === 'Delete'/g, '}\n} else if (e.key === \'Delete\'');

// Save the fixed content
fs.writeFileSync(filePath, content);
console.log('✅ Fixed syntax errors in EnhancedGraphEditor.tsx');