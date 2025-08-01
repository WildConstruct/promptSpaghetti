#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// This script fixes style object indentation issues in JSX files

function fixStyleObjects(content) {
  const lines = content.split('\n');
  const result = [];
  let i = 0;
  
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // Check if this is a div/span with style={{ on one line, properties on next lines
    if (line.includes('style={{') && !line.includes('}}')) {
      // Found start of multi-line style
      const baseIndent = line.match(/^\s*/)[0];
      const elementIndent = line.substring(0, line.indexOf('style={{'));
      result.push(line);
      i++;
      
      // Collect all style properties until we find the closing
      const styleProps = [];
      let braceCount = 2; // Already have {{
      
      while (i < lines.length && braceCount > 0) {
        const propLine = lines[i];
        const propTrimmed = propLine.trim();
        
        // Count braces
        for (const char of propLine) {
          if (char === '{') braceCount++;
          if (char === '}') braceCount--;
        }
        
        if (braceCount > 0) {
          // Still inside style object
          if (propTrimmed && !propTrimmed.startsWith('//')) {
            // This is a property - ensure proper indentation
            styleProps.push(elementIndent + '  ' + propTrimmed);
          } else {
            styleProps.push(propLine); // Keep empty lines or comments as-is
          }
        } else {
          // Found closing - fix it
          if (propTrimmed === '>') {
            styleProps.push(elementIndent + '}}>');
          } else if (propTrimmed === '}>') {
            styleProps.push(elementIndent + '}}>');
          } else if (propTrimmed.startsWith('}>')) {
            // Content after closing
            styleProps.push(elementIndent + '}}' + propTrimmed.substring(1));
          } else {
            styleProps.push(propLine);
          }
        }
        i++;
      }
      
      result.push(...styleProps);
      continue;
    }
    
    // Check for orphaned style object properties (wrong indentation)
    if (lines[i-1] && lines[i-1].includes('style={{') && 
        !lines[i-1].includes('}}') && 
        trimmed && 
        !trimmed.startsWith('//') && 
        !trimmed.startsWith('}')) {
      // This looks like a style property that needs fixing
      const prevIndent = lines[i-1].match(/^\s*/)[0];
      const elementIndent = lines[i-1].substring(0, lines[i-1].indexOf('style={{'));
      result.push(elementIndent + '  ' + trimmed);
      i++;
      continue;
    }
    
    // Fix lines that are just '}>' 
    if (trimmed === '}>' && i > 0) {
      // Look back to see if this is closing a style prop
      let j = i - 1;
      let foundStyle = false;
      while (j >= 0 && j > i - 20) {
        if (lines[j].includes('style={{')) {
          foundStyle = true;
          const indent = lines[j].substring(0, lines[j].indexOf('style={{'));
          result.push(indent + '}}>');
          i++;
          break;
        }
        j--;
      }
      if (foundStyle) continue;
    }
    
    // Fix orphaned closing braces with improper indentation
    if (trimmed === '}>') {
      // Check if previous lines contain style properties
      let isStyleClosing = false;
      for (let j = Math.max(0, i - 10); j < i; j++) {
        if (lines[j].includes('fontSize:') || 
            lines[j].includes('color:') || 
            lines[j].includes('padding:') ||
            lines[j].includes('margin:') ||
            lines[j].includes('background:')) {
          isStyleClosing = true;
          break;
        }
      }
      
      if (isStyleClosing) {
        // Find the proper indentation
        let properIndent = '';
        for (let j = i - 1; j >= 0 && j > i - 20; j--) {
          if (lines[j].includes('<div') || lines[j].includes('<span')) {
            properIndent = lines[j].match(/^\s*/)[0];
            break;
          }
        }
        result.push(properIndent + '                        }}>');
        i++;
        continue;
      }
    }
    
    // Default - keep line as is
    result.push(line);
    i++;
  }
  
  return result.join('\n');
}

// Process files
const files = [
  'packages/core/PreviewModal.tsx',
  'packages/core/GraphEditor.tsx'
];

for (const file of files) {
  const filePath = path.join(__dirname, '..', file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Skipping ${file} - not found`);
    continue;
  }
  
  console.log(`🔧 Fixing ${file}...`);
  
  // Read file
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Apply fixes
  content = fixStyleObjects(content);
  
  // Additional specific fixes
  // Fix the useState type indentation
  content = content.replace(
    /const \[exportDialog, setExportDialog\] = useState<\{\n\s*open: boolean;\n\s*type: 'individual' \| 'batch' \| 'comparison';\n\s*individualIndex\?: number;\n\s*\}>/g,
    `const [exportDialog, setExportDialog] = useState<{
    open: boolean;
    type: 'individual' | 'batch' | 'comparison';
    individualIndex?: number;
  }>`
  );
  
  // Fix getFileExtension indentation
  content = content.replace(
    /const getFileExtension = \(format: ExportFormat\): string => \{\n\s*const extensions: Record<ExportFormat, string> = \{/g,
    `const getFileExtension = (format: ExportFormat): string => {
    const extensions: Record<ExportFormat, string> = {`
  );
  
  // Fix the extensions object closing
  content = content.replace(/^\s*\};\n\s*return extensions/gm, '    };\n    return extensions');
  
  // Write back
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Fixed ${file}`);
}

console.log('\n🎯 Now running Biome formatter...');

// Now try Biome with fixed files
const { execSync } = require('child_process');
try {
  execSync('npx @biomejs/biome format --write packages/core/PreviewModal.tsx packages/core/GraphEditor.tsx packages/core/serverProjectManager.ts', {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit'
  });
  console.log('\n✅ Biome formatting complete!');
} catch (error) {
  console.log('\n⚠️  Biome encountered issues. May need manual review.');
}

console.log('\n🏗️  Testing build...');
try {
  execSync('pnpm --filter client build', {
    cwd: path.join(__dirname, '..'),
    stdio: 'pipe'
  });
  console.log('✅ Build successful!');
} catch (error) {
  console.log('❌ Build still has issues. Check error output above.');
}