#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'packages/core/GraphEditor.tsx');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

let divStack = [];
let currentIndent = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const lineNum = i + 1;
  
  // Track opening divs
  if (line.includes('<div')) {
    const indent = line.match(/^\s*/)[0].length;
    divStack.push({ line: lineNum, indent, content: line.trim() });
    console.log(`Line ${lineNum}: Opening div (depth ${divStack.length})`);
  }
  
  // Track closing divs
  if (line.includes('</div>')) {
    if (divStack.length === 0) {
      console.error(`ERROR: Line ${lineNum}: Closing div without opening!`);
    } else {
      const opened = divStack.pop();
      console.log(`Line ${lineNum}: Closing div (was opened at line ${opened.line})`);
    }
  }
}

if (divStack.length > 0) {
  console.error('\nERROR: Unclosed divs:');
  divStack.forEach(({ line, content }) => {
    console.error(`  Line ${line}: ${content}`);
  });
}

console.log(`\nFinal state: ${divStack.length} unclosed divs`);