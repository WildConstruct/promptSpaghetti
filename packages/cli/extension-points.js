#!/usr/bin/env node

/**
 * Extension Points CLI Tool - Epic 8.4 Story 8.4.1
 * Command-line interface for managing extension points
 */

const { program } = require('commander');
const fs = require('fs');
const path = require('path');

// Mock extension point registry for CLI usage
// In a real implementation, this would import from the actual registry
const mockExtensionPoints = [
  {
    id: 'runtime.node.custom',
    name: 'Custom Runtime Node',
    description: 'Create custom node types with custom execution logic',
    category: 'runtime',
    priority: 'critical',
    lifecycle: 'stable',
    version: '1.0.0',
    location: {
      file: 'packages/core/runtime/index.ts',
      line: 12,
      function: 'RuntimeNode'
    },
    interfaces: [{
      name: 'RuntimeNode',
      description: 'Base class for all runtime nodes',
      parameters: [
        {
          name: 'id',
          type: 'string',
          required: true,
          description: 'Unique node identifier'
        }
      ],
      returnType: 'TOutput',
      examples: [
        'class CustomNode extends RuntimeNode<string> { ... }'
      ]
    }],
    dependencies: ['runtime.context'],
    examples: [{
      name: 'Basic Custom Node',
      description: 'Simple custom node implementation',
      code: `
class CustomNode extends RuntimeNode<string> {
  constructor(id: string, private customData: string) {
    super(id);
  }

  run(ctx: ExecutionContext): string {
    return this.customData + ' processed';
  }
}`,
      language: 'typescript'
    }],
    constraints: {
      performance: {
        maxExecutionTime: 5000,
        maxMemoryUsage: 100 * 1024 * 1024
      },
      security: {
        permissions: ['runtime.execute'],
        sandboxed: true
      }
    },
    metadata: {
      addedIn: '1.0.0'
    }
  },
  {
    id: 'ui.inspector.editor',
    name: 'Inspector Node Editor',
    description: 'Create custom editors for node configuration',
    category: 'ui',
    priority: 'high',
    lifecycle: 'stable',
    version: '1.0.0',
    location: {
      file: 'packages/core/components/Inspector/BaseNodeEditor.tsx',
      line: 1,
      function: 'BaseNodeEditor'
    },
    interfaces: [{
      name: 'BaseNodeEditor',
      description: 'Base component for node editors',
      parameters: [
        {
          name: 'node',
          type: 'any',
          required: true,
          description: 'Node data object'
        },
        {
          name: 'onChange',
          type: '(partial: Record<string, unknown>) => void',
          required: true,
          description: 'Change handler function'
        }
      ],
      returnType: 'React.ReactElement',
      examples: [
        'export const CustomEditor: React.FC<BaseNodeEditorProps> = (props) => { ... }'
      ]
    }],
    dependencies: ['ui.inspector.context'],
    metadata: {
      addedIn: '1.0.0'
    }
  }
];

/**
 * List all extension points
 */
function listExtensionPoints(options) {
  let extensionPoints = mockExtensionPoints;
  
  // Apply filters
  if (options.category) {
    extensionPoints = extensionPoints.filter(ep => ep.category === options.category);
  }
  
  if (options.priority) {
    extensionPoints = extensionPoints.filter(ep => ep.priority === options.priority);
  }
  
  if (options.lifecycle) {
    extensionPoints = extensionPoints.filter(ep => ep.lifecycle === options.lifecycle);
  }
  
  if (options.search) {
    const query = options.search.toLowerCase();
    extensionPoints = extensionPoints.filter(ep => 
      ep.name.toLowerCase().includes(query) ||
      ep.description.toLowerCase().includes(query) ||
      ep.id.toLowerCase().includes(query)
    );
  }
  
  // Format output
  if (options.format === 'json') {
    console.log(JSON.stringify(extensionPoints, null, 2));
  } else if (options.format === 'table') {
    console.table(extensionPoints.map(ep => ({
      ID: ep.id,
      Name: ep.name,
      Category: ep.category,
      Priority: ep.priority,
      Lifecycle: ep.lifecycle,
      Version: ep.version
    })));
  } else {
    // Default format
    console.log('Extension Points:\n');
    extensionPoints.forEach(ep => {
      console.log(`📍 ${ep.name} (${ep.id})`);
      console.log(`   Category: ${ep.category} | Priority: ${ep.priority} | Lifecycle: ${ep.lifecycle}`);
      console.log(`   Location: ${ep.location.file}${ep.location.line ? ':' + ep.location.line : ''}`);
      console.log(`   ${ep.description}\n`);
    });
  }
}

/**
 * Show details for a specific extension point
 */
function showExtensionPoint(id, options) {
  const extensionPoint = mockExtensionPoints.find(ep => ep.id === id);
  
  if (!extensionPoint) {
    console.error(`Extension point '${id}' not found`);
    process.exit(1);
  }
  
  if (options.format === 'json') {
    console.log(JSON.stringify(extensionPoint, null, 2));
    return;
  }
  
  // Detailed view
  console.log(`\n📍 ${extensionPoint.name}\n`);
  console.log(`ID: ${extensionPoint.id}`);
  console.log(`Category: ${extensionPoint.category}`);
  console.log(`Priority: ${extensionPoint.priority}`);
  console.log(`Lifecycle: ${extensionPoint.lifecycle}`);
  console.log(`Version: ${extensionPoint.version}`);
  console.log(`Location: ${extensionPoint.location.file}${extensionPoint.location.line ? ':' + extensionPoint.location.line : ''}`);
  console.log(`\nDescription:\n${extensionPoint.description}\n`);
  
  // Interfaces
  console.log('Interfaces:');
  extensionPoint.interfaces.forEach(iface => {
    console.log(`\n  ${iface.name}:`);
    console.log(`    ${iface.description}`);
    console.log(`    Returns: ${iface.returnType}`);
    
    if (iface.parameters.length > 0) {
      console.log('    Parameters:');
      iface.parameters.forEach(param => {
        console.log(`      - ${param.name}: ${param.type}${param.required ? ' (required)' : ''}`);
        console.log(`        ${param.description}`);
      });
    }
    
    if (iface.examples && iface.examples.length > 0) {
      console.log('    Examples:');
      iface.examples.forEach(example => {
        console.log(`      ${example}`);
      });
    }
  });
  
  // Dependencies
  if (extensionPoint.dependencies && extensionPoint.dependencies.length > 0) {
    console.log('\nDependencies:');
    extensionPoint.dependencies.forEach(dep => {
      console.log(`  - ${dep}`);
    });
  }
  
  // Examples
  if (extensionPoint.examples && extensionPoint.examples.length > 0) {
    console.log('\nExamples:');
    extensionPoint.examples.forEach(example => {
      console.log(`\n  ${example.name}:`);
      console.log(`  ${example.description}`);
      console.log(`  \`\`\`${example.language}`);
      console.log(example.code);
      console.log('  ```');
    });
  }
  
  // Constraints
  if (extensionPoint.constraints) {
    console.log('\nConstraints:');
    
    if (extensionPoint.constraints.performance) {
      console.log('  Performance:');
      if (extensionPoint.constraints.performance.maxExecutionTime) {
        console.log(`    - Max execution time: ${extensionPoint.constraints.performance.maxExecutionTime}ms`);
      }
      if (extensionPoint.constraints.performance.maxMemoryUsage) {
        console.log(`    - Max memory usage: ${Math.round(extensionPoint.constraints.performance.maxMemoryUsage / 1024 / 1024)}MB`);
      }
    }
    
    if (extensionPoint.constraints.security) {
      console.log('  Security:');
      if (extensionPoint.constraints.security.permissions) {
        console.log(`    - Required permissions: ${extensionPoint.constraints.security.permissions.join(', ')}`);
      }
      if (extensionPoint.constraints.security.sandboxed !== undefined) {
        console.log(`    - Sandboxed: ${extensionPoint.constraints.security.sandboxed ? 'Yes' : 'No'}`);
      }
    }
  }
  
  // Metadata
  console.log('\nMetadata:');
  console.log(`  - Added in: ${extensionPoint.metadata.addedIn}`);
  if (extensionPoint.metadata.deprecatedIn) {
    console.log(`  - Deprecated in: ${extensionPoint.metadata.deprecatedIn}`);
  }
  if (extensionPoint.metadata.removedIn) {
    console.log(`  - Removed in: ${extensionPoint.metadata.removedIn}`);
  }
  if (extensionPoint.metadata.replacedBy) {
    console.log(`  - Replaced by: ${extensionPoint.metadata.replacedBy}`);
  }
  
  console.log('');
}

/**
 * Generate documentation
 */
function generateDocumentation(options) {
  const outputPath = options.output || 'extension-points-documentation.md';
  let extensionPoints = mockExtensionPoints;
  
  // Apply filters
  if (options.category) {
    extensionPoints = extensionPoints.filter(ep => ep.category === options.category);
  }
  
  // Generate markdown
  let markdown = '# Extension Point Documentation\n\n';
  markdown += `Generated: ${new Date().toISOString()}\n\n`;
  
  // Statistics
  const stats = {
    total: extensionPoints.length,
    byCategory: {},
    byPriority: {},
    byLifecycle: {}
  };
  
  extensionPoints.forEach(ep => {
    stats.byCategory[ep.category] = (stats.byCategory[ep.category] || 0) + 1;
    stats.byPriority[ep.priority] = (stats.byPriority[ep.priority] || 0) + 1;
    stats.byLifecycle[ep.lifecycle] = (stats.byLifecycle[ep.lifecycle] || 0) + 1;
  });
  
  markdown += '## Statistics\n\n';
  markdown += `- **Total Extension Points**: ${stats.total}\n`;
  markdown += `- **By Category**: ${Object.entries(stats.byCategory).map(([k, v]) => `${k}: ${v}`).join(', ')}\n`;
  markdown += `- **By Priority**: ${Object.entries(stats.byPriority).map(([k, v]) => `${k}: ${v}`).join(', ')}\n`;
  markdown += `- **By Lifecycle**: ${Object.entries(stats.byLifecycle).map(([k, v]) => `${k}: ${v}`).join(', ')}\n\n`;
  
  // Table of Contents
  markdown += '## Table of Contents\n\n';
  extensionPoints.forEach(ep => {
    markdown += `- [${ep.name}](#${ep.id.replace(/\./g, '-')})\n`;
  });
  markdown += '\n';
  
  // Extension Points
  extensionPoints.forEach(ep => {
    markdown += `## ${ep.name}\n\n`;
    markdown += `**ID**: \`${ep.id}\`  \n`;
    markdown += `**Category**: ${ep.category}  \n`;
    markdown += `**Priority**: ${ep.priority}  \n`;
    markdown += `**Lifecycle**: ${ep.lifecycle}  \n`;
    markdown += `**Version**: ${ep.version}  \n`;
    markdown += `**Location**: \`${ep.location.file}\`${ep.location.line ? `:${ep.location.line}` : ''}\n\n`;
    
    markdown += `${ep.description}\n\n`;
    
    // Interfaces
    markdown += '### Interfaces\n\n';
    ep.interfaces.forEach(iface => {
      markdown += `#### ${iface.name}\n\n`;
      markdown += `${iface.description}\n\n`;
      
      if (iface.parameters.length > 0) {
        markdown += '**Parameters**:\n\n';
        markdown += '| Name | Type | Required | Description |\n';
        markdown += '|---|---|---|---|\n';
        iface.parameters.forEach(param => {
          markdown += `| \`${param.name}\` | \`${param.type}\` | ${param.required ? 'Yes' : 'No'} | ${param.description} |\n`;
        });
        markdown += '\n';
      }
      
      markdown += `**Returns**: \`${iface.returnType}\`\n\n`;
      
      if (iface.examples && iface.examples.length > 0) {
        markdown += '**Examples**:\n\n';
        iface.examples.forEach(example => {
          markdown += `\`\`\`typescript\n${example}\n\`\`\`\n\n`;
        });
      }
    });
    
    // Dependencies
    if (ep.dependencies && ep.dependencies.length > 0) {
      markdown += '### Dependencies\n\n';
      ep.dependencies.forEach(dep => {
        markdown += `- \`${dep}\`\n`;
      });
      markdown += '\n';
    }
    
    // Examples
    if (ep.examples && ep.examples.length > 0) {
      markdown += '### Examples\n\n';
      ep.examples.forEach(example => {
        markdown += `#### ${example.name}\n\n`;
        markdown += `${example.description}\n\n`;
        markdown += `\`\`\`${example.language}\n${example.code}\n\`\`\`\n\n`;
      });
    }
    
    markdown += '---\n\n';
  });
  
  // Write to file
  fs.writeFileSync(outputPath, markdown);
  console.log(`Documentation generated: ${outputPath}`);
}

/**
 * Generate visualization
 */
function generateVisualization(options) {
  const outputPath = options.output || 'extension-points-diagram.mmd';
  let extensionPoints = mockExtensionPoints;
  
  // Apply filters
  if (options.category) {
    extensionPoints = extensionPoints.filter(ep => ep.category === options.category);
  }
  
  // Generate Mermaid diagram
  let mermaid = 'graph TD\n';
  
  if (options.groupByCategory) {
    // Group by category
    const categories = {};
    extensionPoints.forEach(ep => {
      if (!categories[ep.category]) {
        categories[ep.category] = [];
      }
      categories[ep.category].push(ep);
    });
    
    Object.entries(categories).forEach(([category, points]) => {
      mermaid += `    subgraph ${category}["${category.toUpperCase()}"]\n`;
      points.forEach(ep => {
        const nodeId = ep.id.replace(/[^a-zA-Z0-9]/g, '_');
        mermaid += `        ${nodeId}["${ep.name}"]\n`;
      });
      mermaid += `    end\n`;
    });
  } else {
    // Add all nodes
    extensionPoints.forEach(ep => {
      const nodeId = ep.id.replace(/[^a-zA-Z0-9]/g, '_');
      mermaid += `    ${nodeId}["${ep.name}"]\n`;
    });
  }
  
  // Add dependencies
  if (options.showDependencies) {
    extensionPoints.forEach(ep => {
      if (ep.dependencies && ep.dependencies.length > 0) {
        const sourceId = ep.id.replace(/[^a-zA-Z0-9]/g, '_');
        ep.dependencies.forEach(dep => {
          const targetId = dep.replace(/[^a-zA-Z0-9]/g, '_');
          mermaid += `    ${sourceId} --> ${targetId}\n`;
        });
      }
    });
  }
  
  // Write to file
  fs.writeFileSync(outputPath, mermaid);
  console.log(`Visualization generated: ${outputPath}`);
}

/**
 * Get extension point statistics
 */
function getStatistics(options) {
  const extensionPoints = mockExtensionPoints;
  
  const stats = {
    total: extensionPoints.length,
    byCategory: {},
    byPriority: {},
    byLifecycle: {}
  };
  
  extensionPoints.forEach(ep => {
    stats.byCategory[ep.category] = (stats.byCategory[ep.category] || 0) + 1;
    stats.byPriority[ep.priority] = (stats.byPriority[ep.priority] || 0) + 1;
    stats.byLifecycle[ep.lifecycle] = (stats.byLifecycle[ep.lifecycle] || 0) + 1;
  });
  
  if (options.format === 'json') {
    console.log(JSON.stringify(stats, null, 2));
  } else {
    console.log('Extension Point Statistics:\n');
    console.log(`Total: ${stats.total}`);
    console.log('\nBy Category:');
    Object.entries(stats.byCategory).forEach(([category, count]) => {
      console.log(`  ${category}: ${count}`);
    });
    console.log('\nBy Priority:');
    Object.entries(stats.byPriority).forEach(([priority, count]) => {
      console.log(`  ${priority}: ${count}`);
    });
    console.log('\nBy Lifecycle:');
    Object.entries(stats.byLifecycle).forEach(([lifecycle, count]) => {
      console.log(`  ${lifecycle}: ${count}`);
    });
  }
}

// CLI Configuration
program
  .name('extension-points')
  .description('Extension Points management CLI')
  .version('1.0.0');

// List command
program
  .command('list')
  .description('List all extension points')
  .option('-c, --category <category>', 'Filter by category')
  .option('-p, --priority <priority>', 'Filter by priority')
  .option('-l, --lifecycle <lifecycle>', 'Filter by lifecycle')
  .option('-s, --search <query>', 'Search extension points')
  .option('-f, --format <format>', 'Output format (default|json|table)', 'default')
  .action(listExtensionPoints);

// Show command
program
  .command('show <id>')
  .description('Show details for a specific extension point')
  .option('-f, --format <format>', 'Output format (default|json)', 'default')
  .action(showExtensionPoint);

// Generate documentation command
program
  .command('docs')
  .description('Generate documentation')
  .option('-o, --output <path>', 'Output file path')
  .option('-c, --category <category>', 'Filter by category')
  .option('-f, --format <format>', 'Output format (markdown|html)', 'markdown')
  .action(generateDocumentation);

// Generate visualization command
program
  .command('visualize')
  .description('Generate visualization diagram')
  .option('-o, --output <path>', 'Output file path')
  .option('-c, --category <category>', 'Filter by category')
  .option('-g, --group-by-category', 'Group by category')
  .option('-d, --show-dependencies', 'Show dependencies')
  .option('-f, --format <format>', 'Output format (mermaid|graphviz)', 'mermaid')
  .action(generateVisualization);

// Statistics command
program
  .command('stats')
  .description('Show extension point statistics')
  .option('-f, --format <format>', 'Output format (default|json)', 'default')
  .action(getStatistics);

// Parse command line arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}