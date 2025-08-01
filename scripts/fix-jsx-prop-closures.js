#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// This script specifically fixes JSX prop closure issues
function fixJSXPropClosures(content) {
  const lines = content.split('\n');
  const result = [];
  let i = 0;
  
  while (i < lines.length) {
    const line = lines[i];
    
    // Pattern 1: onSomething={(params) => { ... followed by another prop without closing }}
    if (line.match(/^\s*(on\w+|style|connectionLineStyle|defaultEdgeOptions)=\{\{?/)) {
      result.push(line);
      i++;
      
      // Look for the closing of this prop
      let braceCount = 0;
      let foundOpening = false;
      
      // Count opening braces in the initial line
      for (const char of line) {
        if (char === '{') {
          braceCount++;
          foundOpening = true;
        }
        if (char === '}') braceCount--;
      }
      
      // Continue until we balance the braces
      while (i < lines.length && braceCount > 0) {
        const nextLine = lines[i];
        const trimmed = nextLine.trim();
        
        // Count braces in current line
        for (const char of nextLine) {
          if (char === '{') braceCount++;
          if (char === '}') braceCount--;
        }
        
        result.push(nextLine);
        
        // Check if next line starts a new prop
        if (braceCount === 1 && i + 1 < lines.length) {
          const nextLineTrimmed = lines[i + 1].trim();
          if (nextLineTrimmed.match(/^(on\w+|style|[a-z]\w*)=[\{\[\"']/) || 
              nextLineTrimmed === '>' || 
              nextLineTrimmed === '/>') {
            // Need to close the current prop
            result.push(lines[i].match(/^(\s*)/)[1] + '}}');
            braceCount = 0;
          }
        }
        
        i++;
      }
    } else {
      result.push(line);
      i++;
    }
  }
  
  return result.join('\n');
}

// Fix specific patterns that the general function might miss
function fixSpecificPatterns(content) {
  // Fix onSomething={(param) => {\n ... \n next prop pattern
  content = content.replace(
    /(on\w+|style|connectionLineStyle|defaultEdgeOptions)=\{(\{?)\s*\(([^)]*)\)\s*=>\s*\{([^}]*?)\n(\s*)(on\w+|style|[a-z]\w*)=/gm,
    (match, prop1, openBrace, params, body, indent, prop2) => {
      const closeBraces = openBrace ? '}}' : '}';
      return `${prop1}={${openBrace}(${params}) => {${body}\n${indent}${closeBraces}\n${indent}${prop2}=`;
    }
  );
  
  // Fix style={{ ... followed by component closing
  content = content.replace(
    /style=\{\{([^}]*?)\n(\s*)(\/?>)/gm,
    (match, styleContent, indent, closing) => {
      return `style={{${styleContent}\n${indent}}}\n${indent}${closing}`;
    }
  );
  
  return content;
}

// Process file
const filePath = path.join(__dirname, '..', 'packages/core/GraphEditor.tsx');

console.log('🔧 Fixing JSX prop closures in GraphEditor.tsx...');

// Read file
let content = fs.readFileSync(filePath, 'utf8');

// Apply fixes
content = fixJSXPropClosures(content);
content = fixSpecificPatterns(content);

// Write back
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Fixed JSX prop closures');

// Test with a quick syntax check
try {
  require('typescript').createSourceFile(
    'test.tsx',
    content,
    require('typescript').ScriptTarget.Latest,
    true,
    require('typescript').ScriptKind.TSX
  );
  console.log('✅ TypeScript syntax check passed!');
} catch (error) {
  console.log('⚠️  TypeScript syntax check failed - may need manual review');
}