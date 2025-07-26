#!/usr/bin/env node

/**
 * Fix Missing React Component Imports
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Common missing component mappings
const componentImports = {
  'X': 'lucide-react',
  'FileText': 'lucide-react', 
  'AlertTriangle': 'lucide-react',
  'Info': 'lucide-react',
  'Check': 'lucide-react',
  'ChevronDown': 'lucide-react',
  'ChevronUp': 'lucide-react'
};

function fixMissingImports(filePath) {
  if (!fs.existsSync(filePath)) return 0;
  
  // Get lint errors for this file
  try {
    execSync(`npx eslint "${filePath}" --format=compact`, { stdio: 'pipe' });
    return 0; // No errors
  } catch (error) {
    const output = error.stdout.toString();
    const missingComponents = [];
    
    // Extract missing components
    const matches = output.match(/'(\w+)' is not defined.*react\/jsx-no-undef/g);
    if (!matches) return 0;
    
    matches.forEach(match => {
      const component = match.match(/'(\w+)' is not defined/);
      if (component && componentImports[component[1]]) {
        missingComponents.push(component[1]);
      }
    });
    
    if (missingComponents.length === 0) return 0;
    
    console.log(`Fixing imports in: ${path.basename(filePath)}`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    let fixed = 0;
    
    // Group by library
    const byLibrary = {};
    missingComponents.forEach(comp => {
      const lib = componentImports[comp];
      if (!byLibrary[lib]) byLibrary[lib] = [];
      byLibrary[lib].push(comp);
    });
    
    // Add imports
    Object.entries(byLibrary).forEach(([library, components]) => {
      const importLine = `import { ${components.join(', ')} } from '${library}';`;
      
      // Check if library import already exists
      const existingImport = content.match(new RegExp(`import\\s+\\{([^}]+)\\}\\s+from\\s+['"]${library}['"];`));
      
      if (existingImport) {
        // Add to existing import
        const existingComponents = existingImport[1].split(',').map(s => s.trim());
        const newComponents = [...new Set([...existingComponents, ...components])];
        const newImportLine = `import { ${newComponents.join(', ')} } from '${library}';`;
        content = content.replace(existingImport[0], newImportLine);
        console.log(`  ✓ Added ${components.join(', ')} to existing ${library} import`);
      } else {
        // Add new import after first import or at top
        const lines = content.split('\n');
        let insertIndex = 0;
        
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].trim().startsWith('import ')) {
            insertIndex = i + 1;
          } else if (lines[i].trim().startsWith('import ')) {
            break;
          }
        }
        
        lines.splice(insertIndex, 0, importLine);
        content = lines.join('\n');
        console.log(`  ✓ Added new ${library} import: ${components.join(', ')}`);
      }
      
      fixed += components.length;
    });
    
    fs.writeFileSync(filePath, content);
    console.log(`  ✅ Fixed ${fixed} missing imports`);
    return fixed;
  }
}

// Process specific directories
const directories = [
  'packages/core/components/Demo'
];

let totalFixed = 0;

directories.forEach(dir => {
  if (!fs.existsSync(dir)) return;
  
  console.log(`\n🔍 Processing directory: ${dir}`);
  
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    if (file.match(/\.(tsx?|jsx?)$/)) {
      const filePath = path.join(dir, file);
      totalFixed += fixMissingImports(filePath);
    }
  });
});

console.log(`\n✅ Total missing imports fixed: ${totalFixed}`);