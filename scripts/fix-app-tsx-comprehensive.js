#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

/**
 * Comprehensive fix for App.tsx syntax issues
 */

const filePath = path.join(__dirname, '..', 'client/src/App.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Fix 1: Missing closing brace after BrowserSafeRandomizerPanel
const browserSafeEnd = content.indexOf('  RandomizerPanel = BrowserSafeRandomizerPanel;');
if (browserSafeEnd > -1 && !content.substring(browserSafeEnd + 48, browserSafeEnd + 52).includes('}')) {
  content = content.substring(0, browserSafeEnd + 48) + '\n}' + content.substring(browserSafeEnd + 48);
}

// Fix 2: Fix customCommandPaletteActions array
// First, find the array boundaries
const arrayStart = content.indexOf('const customCommandPaletteActions = [');
let arrayEnd = -1;
let braceCount = 0;
let inArray = false;

// Manually build proper array structure
if (arrayStart > -1) {
  const actions = [
    {
      id: 'file-new',
      title: 'New Graph',
      description: 'Create a new graph project',
      category: 'editing',
      icon: '📄',
      shortcut: '⌘N',
      keywords: ['new', 'create', 'file'],
      action: `() => {
        setShowCommandPalette(false);
        menuBarHandlers.onNew();
      }`
    },
    {
      id: 'file-open',
      title: 'Open Graph',
      description: 'Open an existing graph project',
      category: 'editing',
      icon: '📂',
      shortcut: '⌘O',
      keywords: ['open', 'load', 'file'],
      action: `() => {
        setShowCommandPalette(false);
        menuBarHandlers.onOpen();
      }`
    },
    {
      id: 'file-save',
      title: 'Save Graph',
      description: 'Save the current graph project',
      category: 'editing',
      icon: '💾',
      shortcut: '⌘S',
      keywords: ['save', 'file'],
      action: `() => {
        setShowCommandPalette(false);
        menuBarHandlers.onSave();
      }`
    },
    {
      id: 'export-json',
      title: 'Export as JSON',
      description: 'Export graph to JSON format',
      category: 'export',
      icon: '📦',
      keywords: ['export', 'json', 'download'],
      action: `() => {
        setShowCommandPalette(false);
        menuBarHandlers.onExport('json');
      }`
    },
    {
      id: 'view-fit',
      title: 'Fit View',
      description: 'Fit entire graph in view',
      category: 'navigation',
      icon: '🔍',
      shortcut: '⌘0',
      keywords: ['fit', 'view', 'zoom', 'center'],
      action: `() => {
        setShowCommandPalette(false);
        menuBarHandlers.onFitView();
      }`
    },
    {
      id: 'view-fullscreen',
      title: 'Toggle Fullscreen',
      description: 'Enter or exit fullscreen mode',
      category: 'navigation',
      icon: '⛶',
      shortcut: 'Alt+F',
      keywords: ['fullscreen', 'full', 'screen', 'maximize'],
      action: `() => {
        setShowCommandPalette(false);
        menuBarHandlers.onToggleFullscreen();
      }`
    },
    {
      id: 'theme-switch',
      title: 'Switch Theme',
      description: 'Change application theme',
      category: 'editing',
      icon: '🎨',
      keywords: ['theme', 'appearance', 'dark', 'light', 'cinema'],
      action: `() => {
        setShowCommandPalette(false);
        const nextTheme = theme === 'cinema' ? 'dark' : theme === 'dark' ? 'light' : 'cinema';
        menuBarHandlers.onToggleTheme(nextTheme);
      }`
    },
    {
      id: 'nav-randomizer',
      title: 'Go to LLM Randomizer',
      description: 'Switch to the LLM Randomizer tab',
      category: 'navigation',
      icon: '🎲',
      keywords: ['randomizer', 'llm', 'navigate', 'tab'],
      action: `() => {
        setShowCommandPalette(false);
        menuBarHandlers.onViewRandomizer();
      }`
    },
    {
      id: 'nav-files',
      title: 'Go to Files',
      description: 'Switch to the Files browser tab',
      category: 'navigation',
      icon: '📁',
      keywords: ['files', 'browser', 'navigate', 'tab'],
      action: `() => {
        setShowCommandPalette(false);
        menuBarHandlers.onViewFiles();
      }`
    },
    {
      id: 'help-shortcuts',
      title: 'Show Keyboard Shortcuts',
      description: 'Display keyboard shortcuts help',
      category: 'navigation',
      icon: '⌨️',
      shortcut: '?',
      keywords: ['help', 'shortcuts', 'keyboard', 'keys'],
      action: `() => {
        setShowCommandPalette(false);
        menuBarHandlers.onKeyboardShortcuts();
      }`
    },
    {
      id: 'help-about',
      title: 'About',
      description: 'Show application information',
      category: 'navigation',
      icon: 'ℹ️',
      keywords: ['about', 'info', 'version'],
      action: `() => {
        setShowCommandPalette(false);
        menuBarHandlers.onAbout();
      }`
    }
  ];

  // Build the array string
  let arrayString = '  const customCommandPaletteActions = [\n';
  actions.forEach((action, index) => {
    arrayString += '    {\n';
    arrayString += `      id: '${action.id}',\n`;
    arrayString += `      title: '${action.title}',\n`;
    arrayString += `      description: '${action.description}',\n`;
    arrayString += `      category: '${action.category}' as const,\n`;
    arrayString += `      icon: '${action.icon}',\n`;
    if (action.shortcut) {
      arrayString += `      shortcut: '${action.shortcut}',\n`;
    }
    arrayString += `      keywords: [${action.keywords.map(k => `'${k}'`).join(', ')}],\n`;
    arrayString += `      action: ${action.action}\n`;
    arrayString += '    }';
    if (index < actions.length - 1) {
      arrayString += ',';
    }
    arrayString += '\n';
  });
  arrayString += '  ];\n';

  // Find the end of the array in the original content
  let searchPos = arrayStart;
  let bracketCount = 0;
  let foundArrayEnd = false;
  for (let i = arrayStart; i < content.length; i++) {
    if (content[i] === '[') bracketCount++;
    if (content[i] === ']') {
      bracketCount--;
      if (bracketCount === 0) {
        // Found the end of the array
        arrayEnd = i + 1;
        // Skip any semicolon
        if (content[i + 1] === ';') arrayEnd++;
        foundArrayEnd = true;
        break;
      }
    }
  }

  if (foundArrayEnd) {
    content = content.substring(0, arrayStart) + arrayString + content.substring(arrayEnd);
  }
}

// Fix 3: Ensure MainApp function closes properly
const mainAppReturn = content.indexOf('  return (', content.indexOf('function MainApp()'));
const mainAppEnd = content.indexOf('  );\n}', mainAppReturn);
if (mainAppEnd === -1) {
  // Find where MainApp should end
  const divEnd = content.lastIndexOf('</div>\n  );');
  if (divEnd > -1) {
    content = content.substring(0, divEnd + 11) + '\n}\n' + content.substring(divEnd + 11);
  }
}

// Fix 4: Clean up any duplicate closing braces
content = content.replace(/}\s*}\s*\n\s*}/g, '}\n}');

// Save the fixed content
fs.writeFileSync(filePath, content);
console.log('✅ Applied comprehensive fixes to App.tsx');