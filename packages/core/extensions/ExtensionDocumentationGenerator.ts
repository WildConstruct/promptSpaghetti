/**
 * Extension Documentation Generator - Epic 8.4 Story 8.4.1
 * Generates comprehensive documentation for extension points
 */

import { ExtensionPoint, ExtensionPointCategory, ExtensionPointPriority, ExtensionPointLifecycle, extensionPointRegistry } from './ExtensionPointRegistry';

export interface DocumentationOptions {
  includeExamples?: boolean;
  includeConstraints?: boolean;
  includeMetadata?: boolean;
  format?: 'markdown' | 'html' | 'json';
  filterBy?: {
    category?: ExtensionPointCategory;
    priority?: ExtensionPointPriority;
    lifecycle?: ExtensionPointLifecycle;
  };
}

export class ExtensionDocumentationGenerator {
  private static instance: ExtensionDocumentationGenerator;

  private constructor() {}

  public static getInstance(): ExtensionDocumentationGenerator {
    if (!ExtensionDocumentationGenerator.instance) {
      ExtensionDocumentationGenerator.instance = new ExtensionDocumentationGenerator();
    }
    return ExtensionDocumentationGenerator.instance;
  }

  /**
   * Generate complete documentation for all extension points
   */
  public generateComplete(options: DocumentationOptions = {}): string {
    const registry = extensionPointRegistry;
    let extensionPoints = registry.getAll();

    // Apply filters
    if (options.filterBy) {
      if (options.filterBy.category) {
        extensionPoints = registry.getByCategory(options.filterBy.category);
      }
      if (options.filterBy.priority) {
        extensionPoints = extensionPoints.filter(ep => ep.priority === options.filterBy!.priority);
      }
      if (options.filterBy.lifecycle) {
        extensionPoints = extensionPoints.filter(ep => ep.lifecycle === options.filterBy!.lifecycle);
      }
    }

    switch (options.format) {
      case 'html':
        return this.generateHTML(extensionPoints, options);
      case 'json':
        return this.generateJSON(extensionPoints, options);
      case 'markdown':
      default:
        return this.generateMarkdown(extensionPoints, options);
    }
  }

  /**
   * Generate documentation for a single extension point
   */
  public generateSingle(extensionPointId: string, options: DocumentationOptions = {}): string {
    const extensionPoint = extensionPointRegistry.get(extensionPointId);
    if (!extensionPoint) {
      throw new Error(`Extension point ${extensionPointId} not found`);
    }

    return this.generateComplete({
      ...options,
      filterBy: { ...options.filterBy }
    });
  }

  /**
   * Generate documentation by category
   */
  public generateByCategory(category: ExtensionPointCategory, options: DocumentationOptions = {}): string {
    return this.generateComplete({
      ...options,
      filterBy: { ...options.filterBy, category }
    });
  }

  /**
   * Generate extension point index
   */
  public generateIndex(): string {
    const registry = extensionPointRegistry;
    const stats = registry.getStatistics();
    
    let markdown = `# Extension Point Index\n\n`;
    
    // Statistics
    markdown += `## Statistics\n\n`;
    markdown += `- **Total Extension Points**: ${stats.total}\n`;
    markdown += `- **By Category**:\n`;
    Object.entries(stats.byCategory).forEach(([category, count]) => {
      if (count > 0) {
        markdown += `  - ${category}: ${count}\n`;
      }
    });
    markdown += `- **By Priority**:\n`;
    Object.entries(stats.byPriority).forEach(([priority, count]) => {
      if (count > 0) {
        markdown += `  - ${priority}: ${count}\n`;
      }
    });
    markdown += `- **By Lifecycle**:\n`;
    Object.entries(stats.byLifecycle).forEach(([lifecycle, count]) => {
      if (count > 0) {
        markdown += `  - ${lifecycle}: ${count}\n`;
      }
    });

    // Quick Reference
    markdown += `\n## Quick Reference\n\n`;
    markdown += `| ID | Name | Category | Priority | Lifecycle |\n`;
    markdown += `|---|---|---|---|---|\n`;
    
    registry.getAll().forEach(ep => {
      markdown += `| \`${ep.id}\` | ${ep.name} | ${ep.category} | ${ep.priority} | ${ep.lifecycle} |\n`;
    });

    // By Category
    Object.values(ExtensionPointCategory).forEach(category => {
      const categoryPoints = registry.getByCategory(category);
      if (categoryPoints.length > 0) {
        markdown += `\n### ${category.charAt(0).toUpperCase() + category.slice(1)} Extension Points\n\n`;
        categoryPoints.forEach(ep => {
          markdown += `- **[${ep.name}](#${ep.id.replace(/\./g, '-')})** - ${ep.description}\n`;
        });
      }
    });

    return markdown;
  }

  /**
   * Generate search index for extension points
   */
  public generateSearchIndex(): any {
    const registry = extensionPointRegistry;
    const extensionPoints = registry.getAll();

    return {
      version: '1.0.0',
      generated: new Date().toISOString(),
      count: extensionPoints.length,
      documents: extensionPoints.map(ep => ({
        id: ep.id,
        title: ep.name,
        content: `${ep.description} ${ep.interfaces.map(i => i.description).join(' ')}`,
        category: ep.category,
        priority: ep.priority,
        lifecycle: ep.lifecycle,
        keywords: [
          ep.name.toLowerCase(),
          ep.category,
          ep.priority,
          ...ep.interfaces.map(i => i.name.toLowerCase())
        ],
        url: `#${ep.id.replace(/\./g, '-')}`
      }))
    };
  }

  /**
   * Generate markdown documentation
   */
  private generateMarkdown(extensionPoints: ExtensionPoint[], options: DocumentationOptions): string {
    let markdown = `# Extension Point Documentation\n\n`;
    markdown += `Generated: ${new Date().toISOString()}\n\n`;

    // Table of Contents
    markdown += `## Table of Contents\n\n`;
    extensionPoints.forEach(ep => {
      markdown += `- [${ep.name}](#${ep.id.replace(/\./g, '-')})\n`;
    });
    markdown += `\n`;

    // Extension Points
    extensionPoints.forEach(ep => {
      markdown += this.generateMarkdownExtensionPoint(ep, options);
    });

    return markdown;
  }

  /**
   * Generate markdown for a single extension point
   */
  private generateMarkdownExtensionPoint(ep: ExtensionPoint, options: DocumentationOptions): string {
    let markdown = `## ${ep.name}\n\n`;
    
    // Basic info
    markdown += `**ID**: \`${ep.id}\`  \n`;
    markdown += `**Category**: ${ep.category}  \n`;
    markdown += `**Priority**: ${ep.priority}  \n`;
    markdown += `**Lifecycle**: ${ep.lifecycle}  \n`;
    markdown += `**Version**: ${ep.version}  \n`;
    markdown += `**Location**: \`${ep.location.file}\``;
    if (ep.location.line) {
      markdown += `:${ep.location.line}`;
    }
    markdown += `\n\n`;

    // Description
    markdown += `${ep.description}\n\n`;

    // Interfaces
    markdown += `### Interfaces\n\n`;
    ep.interfaces.forEach(iface => {
      markdown += `#### ${iface.name}\n\n`;
      markdown += `${iface.description}\n\n`;
      
      if (iface.parameters.length > 0) {
        markdown += `**Parameters**:\n\n`;
        markdown += `| Name | Type | Required | Description | Default |\n`;
        markdown += `|---|---|---|---|---|\n`;
        iface.parameters.forEach(param => {
          markdown += `| \`${param.name}\` | \`${param.type}\` | ${param.required ? 'Yes' : 'No'} | ${param.description} | ${param.defaultValue !== undefined ? `\`${param.defaultValue}\`` : '-'} |\n`;
        });
        markdown += `\n`;
      }

      markdown += `**Returns**: \`${iface.returnType}\`\n\n`;

      if (iface.examples && iface.examples.length > 0) {
        markdown += `**Examples**:\n\n`;
        iface.examples.forEach(example => {
          markdown += `\`\`\`typescript\n${example}\n\`\`\`\n\n`;
        });
      }
    });

    // Dependencies
    if (ep.dependencies && ep.dependencies.length > 0) {
      markdown += `### Dependencies\n\n`;
      ep.dependencies.forEach(dep => {
        markdown += `- \`${dep}\`\n`;
      });
      markdown += `\n`;
    }

    // Examples
    if (options.includeExamples !== false && ep.examples && ep.examples.length > 0) {
      markdown += `### Examples\n\n`;
      ep.examples.forEach(example => {
        markdown += `#### ${example.name}\n\n`;
        markdown += `${example.description}\n\n`;
        markdown += `\`\`\`${example.language}\n${example.code}\n\`\`\`\n\n`;
      });
    }

    // Constraints
    if (options.includeConstraints !== false && ep.constraints) {
      markdown += `### Constraints\n\n`;
      
      if (ep.constraints.performance) {
        markdown += `#### Performance\n\n`;
        if (ep.constraints.performance.maxExecutionTime) {
          markdown += `- **Max Execution Time**: ${ep.constraints.performance.maxExecutionTime}ms\n`;
        }
        if (ep.constraints.performance.maxMemoryUsage) {
          markdown += `- **Max Memory Usage**: ${Math.round(ep.constraints.performance.maxMemoryUsage / 1024 / 1024)}MB\n`;
        }
        markdown += `\n`;
      }

      if (ep.constraints.security) {
        markdown += `#### Security\n\n`;
        if (ep.constraints.security.permissions) {
          markdown += `- **Required Permissions**: ${ep.constraints.security.permissions.join(', ')}\n`;
        }
        if (ep.constraints.security.sandboxed !== undefined) {
          markdown += `- **Sandboxed**: ${ep.constraints.security.sandboxed ? 'Yes' : 'No'}\n`;
        }
        markdown += `\n`;
      }
    }

    // Metadata
    if (options.includeMetadata !== false) {
      markdown += `### Metadata\n\n`;
      markdown += `- **Added in**: ${ep.metadata.addedIn}\n`;
      if (ep.metadata.deprecatedIn) {
        markdown += `- **Deprecated in**: ${ep.metadata.deprecatedIn}\n`;
      }
      if (ep.metadata.removedIn) {
        markdown += `- **Removed in**: ${ep.metadata.removedIn}\n`;
      }
      if (ep.metadata.replacedBy) {
        markdown += `- **Replaced by**: ${ep.metadata.replacedBy}\n`;
      }
      markdown += `\n`;
    }

    markdown += `---\n\n`;
    return markdown;
  }

  /**
   * Generate HTML documentation
   */
  private generateHTML(extensionPoints: ExtensionPoint[], options: DocumentationOptions): string {
    let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Extension Point Documentation</title>
    <style>
        body { font-family: system-ui, -apple-system, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { border-bottom: 2px solid #e1e5e9; padding-bottom: 20px; margin-bottom: 30px; }
        .extension-point { border: 1px solid #e1e5e9; border-radius: 8px; padding: 20px; margin-bottom: 30px; }
        .badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
        .badge.critical { background: #dc3545; color: white; }
        .badge.high { background: #fd7e14; color: white; }
        .badge.medium { background: #ffc107; color: black; }
        .badge.low { background: #6c757d; color: white; }
        .badge.stable { background: #28a745; color: white; }
        .badge.experimental { background: #17a2b8; color: white; }
        .badge.deprecated { background: #dc3545; color: white; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { border: 1px solid #e1e5e9; padding: 8px; text-align: left; }
        th { background: #f8f9fa; }
        code { background: #f8f9fa; padding: 2px 4px; border-radius: 3px; }
        pre { background: #f8f9fa; padding: 15px; border-radius: 5px; overflow-x: auto; }
        .toc { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .toc ul { list-style: none; padding-left: 0; }
        .toc li { margin: 5px 0; }
        .toc a { text-decoration: none; color: #007bff; }
        .toc a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Extension Point Documentation</h1>
        <p>Generated: ${new Date().toISOString()}</p>
    </div>
    
    <div class="toc">
        <h2>Table of Contents</h2>
        <ul>
            ${extensionPoints.map(ep => `<li><a href="#${ep.id.replace(/\./g, '-')}">${ep.name}</a></li>`).join('')}
        </ul>
    </div>`;

    extensionPoints.forEach(ep => {
      html += this.generateHTMLExtensionPoint(ep, options);
    });

    html += `
</body>
</html>`;

    return html;
  }

  /**
   * Generate HTML for a single extension point
   */
  private generateHTMLExtensionPoint(ep: ExtensionPoint, options: DocumentationOptions): string {
    let html = `
    <div class="extension-point" id="${ep.id.replace(/\./g, '-')}">
        <h2>${ep.name}</h2>
        
        <div style="margin-bottom: 15px;">
            <span class="badge ${ep.priority}">${ep.priority}</span>
            <span class="badge ${ep.lifecycle}">${ep.lifecycle}</span>
            <span class="badge">${ep.category}</span>
        </div>
        
        <table>
            <tr><th>ID</th><td><code>${ep.id}</code></td></tr>
            <tr><th>Version</th><td>${ep.version}</td></tr>
            <tr><th>Location</th><td><code>${ep.location.file}${ep.location.line ? ':' + ep.location.line : ''}</code></td></tr>
        </table>
        
        <p>${ep.description}</p>
        
        <h3>Interfaces</h3>`;

    ep.interfaces.forEach(iface => {
      html += `
        <h4>${iface.name}</h4>
        <p>${iface.description}</p>
        
        <table>
            <thead>
                <tr>
                    <th>Parameter</th>
                    <th>Type</th>
                    <th>Required</th>
                    <th>Description</th>
                    <th>Default</th>
                </tr>
            </thead>
            <tbody>
                ${iface.parameters.map(param => `
                    <tr>
                        <td><code>${param.name}</code></td>
                        <td><code>${param.type}</code></td>
                        <td>${param.required ? 'Yes' : 'No'}</td>
                        <td>${param.description}</td>
                        <td>${param.defaultValue !== undefined ? `<code>${param.defaultValue}</code>` : '-'}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        
        <p><strong>Returns:</strong> <code>${iface.returnType}</code></p>`;

      if (iface.examples && iface.examples.length > 0) {
        html += `<h5>Examples</h5>`;
        iface.examples.forEach(example => {
          html += `<pre><code>${this.escapeHtml(example)}</code></pre>`;
        });
      }
    });

    if (options.includeExamples !== false && ep.examples && ep.examples.length > 0) {
      html += `<h3>Examples</h3>`;
      ep.examples.forEach(example => {
        html += `
          <h4>${example.name}</h4>
          <p>${example.description}</p>
          <pre><code class="language-${example.language}">${this.escapeHtml(example.code)}</code></pre>
        `;
      });
    }

    html += `</div>`;
    return html;
  }

  /**
   * Generate JSON documentation
   */
  private generateJSON(extensionPoints: ExtensionPoint[], options: DocumentationOptions): string {
    const doc = {
      version: '1.0.0',
      generated: new Date().toISOString(),
      count: extensionPoints.length,
      options: options,
      extensionPoints: extensionPoints
    };

    return JSON.stringify(doc, null, 2);
  }

  /**
   * Escape HTML characters
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Export singleton instance
export const extensionDocumentationGenerator = ExtensionDocumentationGenerator.getInstance();