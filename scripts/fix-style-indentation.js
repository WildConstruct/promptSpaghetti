#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// This script specifically targets the indentation issues in style props

const filePath = process.argv[2];
if (!filePath) {
  console.error('Usage: node fix-style-indentation.js <file-path>');
  process.exit(1);
}

console.log(`🔧 Fixing style indentation in ${path.basename(filePath)}...`);

function fixStyleIndentation(content) {
  const lines = content.split('\n');
  const fixedLines = [];
  let inStyleProp = false;
  let styleStartLine = -1;
  let baseIndent = '';
  let braceCount = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // Detect start of style prop
    if (!inStyleProp && line.includes('style={{')) {
      inStyleProp = true;
      styleStartLine = i;
      baseIndent = line.match(/^\s*/)[0];
      braceCount = 2; // Two opening braces
      
      // Count braces in the rest of this line
      const afterStyle = line.substring(line.indexOf('style={{') + 8);
      for (const char of afterStyle) {
        if (char === '{') braceCount++;
        if (char === '}') braceCount--;
      }
      
      // If style prop closes on same line, we're done
      if (braceCount === 0) {
        inStyleProp = false;
        fixedLines.push(line);
        continue;
      }
      
      fixedLines.push(line);
      continue;
    }
    
    // Process lines inside style prop
    if (inStyleProp) {
      // Count braces
      for (const char of line) {
        if (char === '{') braceCount++;
        if (char === '}') braceCount--;
      }
      
      // Check if we're at the closing line
      if (braceCount === 0) {
        inStyleProp = false;
        
        // Fix common patterns
        if (trimmed === '>') {
          fixedLines.push(baseIndent + '              }}>');
        } else if (trimmed === '}>') {
          fixedLines.push(baseIndent + '              }}>');
        } else if (trimmed.startsWith('}>')) {
          // Has content after closing
          fixedLines.push(baseIndent + '              }}' + trimmed.substring(1));
        } else if (line.includes('}>') && !line.includes('}}>')) {
          // Fix inline closing
          fixedLines.push(line.replace(/\}>/, '}}>'));
        } else {
          fixedLines.push(line);
        }
      } else {
        // Still inside style prop - fix indentation
        if (trimmed.length > 0 && !trimmed.startsWith('//') && !trimmed.startsWith('/*')) {
          // This is a style property
          const propertyIndent = baseIndent + '                ';
          fixedLines.push(propertyIndent + trimmed);
        } else {
          fixedLines.push(line);
        }
      }
    } else {
      fixedLines.push(line);
    }
  }
  
  return fixedLines.join('\n');
}

// Special handling for common problem patterns
function fixCommonPatterns(content) {
  // Fix useState generic types
  content = content.replace(
    /const \[(\w+), set\w+\] = useState<\{\n\s*([^}]+)\n\s*\}>/g,
    (match, varName, typeContent) => {
      const lines = typeContent.split('\n').map(l => l.trim()).filter(l => l);
      const formatted = lines.map(l => '    ' + l).join('\n');
      return `const [${varName}, set${varName.charAt(0).toUpperCase() + varName.slice(1)}] = useState<{\n${formatted}\n  }>`;
    }
  );
  
  // Fix const extensions object
  content = content.replace(
    /const extensions: Record<[^>]+> = \{\n([^}]+)\n\};/g,
    (match, props) => {
      const lines = props.split('\n').map(l => l.trim()).filter(l => l);
      const formatted = lines.map(l => '    ' + l).join('\n');
      return match.replace(props, formatted);
    }
  );
  
  // Fix orphaned style closings
  content = content.replace(/^(\s*)}>$/gm, '$1              }}>');
  
  // Fix style props that end with > instead of }>
  content = content.replace(/style=\{\{([^}]+)\}>/g, 'style={{$1}}>');
  
  return content;
}

// Read and process file
let content = fs.readFileSync(filePath, 'utf8');

// Apply fixes
content = fixCommonPatterns(content);
content = fixStyleIndentation(content);

// Write back
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Style indentation fixed!');
console.log('📝 Please run: pnpm --filter client build');