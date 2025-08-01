#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

/**
 * Fix all style object syntax errors in App.tsx
 */

const filePath = path.join(__dirname, '..', 'client/src/App.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Fix 1: Tab Content Area div style object (lines 513-523)
content = content.replace(
  /style=\{\{\s*display: 'flex',\s*justifyContent: 'space-between',\s*borderBottom: '1px solid var\(--color-ui-border, #404040\)',\s*backgroundColor: 'var\(--color-bg-secondary, #2a2a2a\)',\s*padding: '0',\s*height: '40px',\s*alignItems: 'center'\s*>/,
  `style={{
  display: 'flex',
  justifyContent: 'space-between',
  borderBottom: '1px solid var(--color-ui-border, #404040)',
  backgroundColor: 'var(--color-bg-secondary, #2a2a2a)',
  padding: '0',
  height: '40px',
  alignItems: 'center'
}}
      >`
);

// Fix 2: Button style objects (missing closing }})
// Editor button
content = content.replace(
  /style=\{\{\s*padding: '8px 16px',\s*border: 'none',\s*backgroundColor: activeTab === 'editor' \? 'var\(--color-bg-primary, #1e1e1e\)' : 'transparent',\s*borderBottom:\s*activeTab === 'editor' \? '2px solid var\(--color-accent-orange, #ff7c00\)' : '2px solid transparent',\s*cursor: 'pointer',\s*fontSize: '12px',\s*fontWeight: activeTab === 'editor' \? 'bold' : 'normal',\s*color: 'var\(--color-text-primary, #e8e8e8\)'\s*>/,
  `style={{
  padding: '8px 16px',
  border: 'none',
  backgroundColor: activeTab === 'editor' ? 'var(--color-bg-primary, #1e1e1e)' : 'transparent',
  borderBottom:
  activeTab === 'editor' ? '2px solid var(--color-accent-orange, #ff7c00)' : '2px solid transparent',
  cursor: 'pointer',
  fontSize: '12px',
  fontWeight: activeTab === 'editor' ? 'bold' : 'normal',
  color: 'var(--color-text-primary, #e8e8e8)'
}}
          >`
);

// Randomizer button
content = content.replace(
  /style=\{\{\s*padding: '8px 16px',\s*border: 'none',\s*backgroundColor: activeTab === 'randomizer' \? 'var\(--color-bg-primary, #1e1e1e\)' : 'transparent',\s*borderBottom:\s*activeTab === 'randomizer' \? '2px solid var\(--color-accent-orange, #ff7c00\)' : '2px solid transparent',\s*cursor: 'pointer',\s*fontSize: '12px',\s*fontWeight: activeTab === 'randomizer' \? 'bold' : 'normal',\s*color: 'var\(--color-text-primary, #e8e8e8\)'\s*>/,
  `style={{
  padding: '8px 16px',
  border: 'none',
  backgroundColor: activeTab === 'randomizer' ? 'var(--color-bg-primary, #1e1e1e)' : 'transparent',
  borderBottom:
  activeTab === 'randomizer' ? '2px solid var(--color-accent-orange, #ff7c00)' : '2px solid transparent',
  cursor: 'pointer',
  fontSize: '12px',
  fontWeight: activeTab === 'randomizer' ? 'bold' : 'normal',
  color: 'var(--color-text-primary, #e8e8e8)'
}}
          >`
);

// Files button
content = content.replace(
  /style=\{\{\s*padding: '8px 16px',\s*border: 'none',\s*backgroundColor: activeTab === 'files' \? 'var\(--color-bg-primary, #1e1e1e\)' : 'transparent',\s*borderBottom:\s*activeTab === 'files' \? '2px solid var\(--color-accent-orange, #ff7c00\)' : '2px solid transparent',\s*cursor: 'pointer',\s*fontSize: '12px',\s*fontWeight: activeTab === 'files' \? 'bold' : 'normal',\s*color: 'var\(--color-text-primary, #e8e8e8\)'\s*>/,
  `style={{
  padding: '8px 16px',
  border: 'none',
  backgroundColor: activeTab === 'files' ? 'var(--color-bg-primary, #1e1e1e)' : 'transparent',
  borderBottom:
  activeTab === 'files' ? '2px solid var(--color-accent-orange, #ff7c00)' : '2px solid transparent',
  cursor: 'pointer',
  fontSize: '12px',
  fontWeight: activeTab === 'files' ? 'bold' : 'normal',
  color: 'var(--color-text-primary, #e8e8e8)'
}}
          >`
);

// Prototype button
content = content.replace(
  /style=\{\{\s*padding: '8px 16px',\s*border: 'none',\s*backgroundColor: activeTab === 'prototype' \? 'var\(--color-bg-primary, #1e1e1e\)' : 'transparent',\s*borderBottom:\s*activeTab === 'prototype' \? '2px solid var\(--color-accent-orange, #ff7c00\)' : '2px solid transparent',\s*cursor: 'pointer',\s*fontSize: '12px',\s*fontWeight: activeTab === 'prototype' \? 'bold' : 'normal',\s*color: 'var\(--color-text-primary, #e8e8e8\)'\s*>/,
  `style={{
  padding: '8px 16px',
  border: 'none',
  backgroundColor: activeTab === 'prototype' ? 'var(--color-bg-primary, #1e1e1e)' : 'transparent',
  borderBottom:
  activeTab === 'prototype' ? '2px solid var(--color-accent-orange, #ff7c00)' : '2px solid transparent',
  cursor: 'pointer',
  fontSize: '12px',
  fontWeight: activeTab === 'prototype' ? 'bold' : 'normal',
  color: 'var(--color-text-primary, #e8e8e8)'
}}
          >`
);

// Write the fixed content
fs.writeFileSync(filePath, content);
console.log('✅ Fixed style object syntax in App.tsx');