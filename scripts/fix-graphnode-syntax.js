#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

/**
 * Fix syntax errors in GraphNode.tsx
 */

const filePath = path.join(__dirname, '..', 'client/src/components/GraphNode.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Fix the malformed style and attribute section
// The issue is on lines 16-19 where style object is not closed properly
// and className/data-selected are incorrectly placed inside the style object

// Replace the problematic section
content = content.replace(
  /style=\{\{\s*padding: 12,\s*border: '1px solid #666',\s*borderRadius: 6,\s*background: '#3a3a3a',\s*color: '#e0e0e0',\s*minWidth: 120,\s*fontSize: 14,\s*fontWeight: 500,\s*boxShadow: '0 2px 8px rgba\(0,0,0,0\.3\)',\s*transition: 'all 0\.2s ease'\s*className=\{selected \? 'selected' : ''\}\}data-selected=\{selected \? 'true' : undefined\}\s*\}\}>/,
  `style={{
  padding: 12,
  border: '1px solid #666',
  borderRadius: 6,
  background: '#3a3a3a',
  color: '#e0e0e0',
  minWidth: 120,
  fontSize: 14,
  fontWeight: 500,
  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
  transition: 'all 0.2s ease'
}}
      className={selected ? 'selected' : ''}
      data-selected={selected ? 'true' : undefined}
    >`
);

// Fix Handle style objects (missing closing braces)
content = content.replace(
  /style=\{\{\s*borderRadius: 3,\s*width: 8,\s*height: 8,\s*backgroundColor: '#666',\s*border: '2px solid #e0e0e0'\s*\}\}/g,
  `style={{
  borderRadius: 3,
  width: 8,
  height: 8,
  backgroundColor: '#666',
  border: '2px solid #e0e0e0'
}}`
);

// Write the fixed content
fs.writeFileSync(filePath, content);
console.log('✅ Fixed syntax errors in GraphNode.tsx');