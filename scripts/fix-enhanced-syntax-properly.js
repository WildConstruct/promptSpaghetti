#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

/**
 * Fix JSX and style syntax errors in EnhancedGraphEditor.tsx
 */

const filePath = path.join(__dirname, '..', 'client/src/components/EnhancedGraphEditor.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Fix 1: Fix malformed JSX closing (e.g., }</div}}>)
content = content.replace(/\}\s*<\/div\s*>/g, '}</div>');

// Fix 2: Fix event handlers that are split across lines incorrectly
// Pattern: onEventName={e =}}  > {
content = content.replace(/(\w+)=\{e =\}\}\s*>\s*\{/g, '$1={e => {');

// Fix 3: Fix closing braces that are on wrong lines
content = content.replace(/\}\}\s*(\w+)=\{e => \{/g, '}}\n          $1={e => {');

// Fix 4: Fix style props that have incorrect closing
content = content.replace(/}}"\s*>/g, '}}>');

// Fix 5: Fix onClick handlers that are missing arrow
content = content.replace(/onClick=\{handleRunGraph\}\}style=\{/g, 'onClick={handleRunGraph} style={');

// Fix 6: Fix style tag content
content = content.replace(/\{\/\* Override ReactFlow default selection styles \*\/\}<style>\{`/g, '{/* Override ReactFlow default selection styles */}\n      <style>{`');

// Fix 7: Fix CSS inside style tags
content = content.replace(/box-shadow: none !important;\s*\n\s*\.professional-reactflow/g, 'box-shadow: none !important;\n        }\n        .professional-reactflow');

// Fix 8: Fix className and style prop order
content = content.replace(/className="professional-reactflow"\s*\}\}/g, '}}\n            className="professional-reactflow"');

// Fix 9: Fix onBlur handlers with incorrect closing
content = content.replace(/\}\s*onBlurCapture=\{e => \{/g, '}}\n          onBlurCapture={e => {');
content = content.replace(/\}\s*onBlur=\{e => \{/g, '}}\n          onBlur={e => {');

// Fix 10: Fix event handler closing braces
content = content.replace(/handleSave\(\);\s*\}/g, 'handleSave();\n          }}');

// Fix 11: Fix style objects that have closing brace issues
content = content.replace(/transition: 'all 0\.2s ease'\s*\}\}/g, 'transition: \'all 0.2s ease\'\n                }}');

// Fix 12: Fix multiline event handlers
content = content.replace(/e\.currentTarget\.style\.background = ([^;]+);\s*\}/g, 'e.currentTarget.style.background = $1;\n              }}');
content = content.replace(/e\.target\.style\.borderColor = ([^;]+);\s*\}/g, 'e.target.style.borderColor = $1;\n          }}');

// Fix 13: Fix Controls closing tag
content = content.replace(/\}\s*\/>/g, '}}\n            />');

// Write the fixed content
fs.writeFileSync(filePath, content);
console.log('✅ Fixed syntax errors in EnhancedGraphEditor.tsx');