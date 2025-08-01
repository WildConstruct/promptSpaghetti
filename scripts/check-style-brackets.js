#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function checkStyleBrackets(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  console.log(`\n🔍 Checking style={{ patterns in ${path.basename(filePath)}...\n`);
  
  const issues = [];
  let openBrackets = 0;
  let currentStyleStart = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;
    
    // Find style={{ patterns
    const styleMatch = line.match(/style=\{\{/g);
    if (styleMatch) {
      openBrackets += styleMatch.length * 2; // Each style={{ adds 2 open brackets
      currentStyleStart = lineNum;
    }
    
    // Count opening brackets in the line
    const openMatches = (line.match(/\{/g) || []).length;
    openBrackets += openMatches;
    
    // Count closing brackets in the line
    const closeMatches = (line.match(/\}/g) || []).length;
    openBrackets -= closeMatches;
    
    // Check for specific problematic patterns
    if (line.includes('style={{ marginBottom: 20 }>')) {
      issues.push({
        line: lineNum,
        content: line.trim(),
        issue: 'Missing closing brace in style prop',
        fix: 'style={{ marginBottom: 20 }}>'
      });
    }
    
    if (line.includes('fontSize: 14 }>')) {
      issues.push({
        line: lineNum,
        content: line.trim(),
        issue: 'Missing closing brace in style prop',
        fix: 'fontSize: 14 }}>'
      });
    }
    
    // Check for other patterns where }} might be missing
    const stylePropMatch = line.match(/style=\{\{[^}]*\}>/);
    if (stylePropMatch) {
      issues.push({
        line: lineNum,
        content: line.trim(),
        issue: 'Style prop has only one closing brace, needs two',
        pattern: stylePropMatch[0]
      });
    }
  }
  
  // Report findings
  if (issues.length > 0) {
    console.log(`❌ Found ${issues.length} style bracket issues:\n`);
    issues.forEach(issue => {
      console.log(`Line ${issue.line}: ${issue.issue}`);
      console.log(`  Current: ${issue.content}`);
      if (issue.fix) {
        console.log(`  Fix:     ${issue.fix}`);
      }
      console.log();
    });
  } else {
    console.log('✅ No style bracket issues found!');
  }
  
  if (openBrackets !== 0) {
    console.log(`\n⚠️  Warning: File has ${openBrackets} unmatched ${openBrackets > 0 ? 'opening' : 'closing'} brackets overall`);
  }
}

// Run the checker
const filePath = process.argv[2] || '/Users/brianbehm/CascadeProjects/prompt-spaghetti/packages/core/PreviewModal.tsx';
checkStyleBrackets(filePath);