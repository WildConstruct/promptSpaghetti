#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

/**
 * Fix syntax errors in CommandPalette components
 */

// Fix KeyboardShortcutsManager.tsx
const kbFile = path.join(__dirname, '..', 'packages/core/components/CommandPalette/KeyboardShortcutsManager.tsx');
let kbContent = fs.readFileSync(kbFile, 'utf8');

// Add missing closing brace for interface
kbContent = kbContent.replace(
  /disabled\?: boolean;\s*\n\s*\n\s*\n\s*export const KeyboardShortcutsManager/,
  `disabled?: boolean;
}

export const KeyboardShortcutsManager`
);

// Fix function parameters - add commas
kbContent = kbContent.replace(
  /export const KeyboardShortcutsManager: React\.FC<KeyboardShortcutsManagerProps> = \(\{ onCommandPalette\s*onUndo\s*onRedo\s*onSave\s*onLoad\s*onExport\s*onSelectAll\s*onDelete\s*onDuplicate\s*onFitView\s*onZoomIn\s*onZoomOut\s*onGenerateCharacter\s*onToggleFullscreen/g,
  `export const KeyboardShortcutsManager: React.FC<KeyboardShortcutsManagerProps> = ({ 
  onCommandPalette,
  onUndo,
  onRedo,
  onSave,
  onLoad,
  onExport,
  onSelectAll,
  onDelete,
  onDuplicate,
  onFitView,
  onZoomIn,
  onZoomOut,
  onGenerateCharacter,
  onToggleFullscreen`
);

// Fix the rest of the parameters
kbContent = kbContent.replace(
  /onToggleFullscreen\s*customShortcuts = \[\]\s*theme = 'cinema'\s*disabled = false/g,
  `onToggleFullscreen,
  customShortcuts = [],
  theme = 'cinema',
  disabled = false`
);

fs.writeFileSync(kbFile, kbContent);
console.log('✅ Fixed KeyboardShortcutsManager.tsx');

// Fix CommandPalette.tsx
const cpFile = path.join(__dirname, '..', 'packages/core/components/CommandPalette/CommandPalette.tsx');
let cpContent = fs.readFileSync(cpFile, 'utf8');

// Ensure interfaces have proper semicolons
cpContent = cpContent.replace(/keywords: string\s+\[/g, 'keywords: string[];');

fs.writeFileSync(cpFile, cpContent);
console.log('✅ Fixed CommandPalette.tsx');