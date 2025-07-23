import { z } from 'zod';
import { CorrectionRule } from './models';

// ========== EXPORT FORMAT SCHEMAS ==========

/**
 * Standard correction rule export format
 */
export const ExportedCorrectionRuleSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  findPattern: z.string().min(1),
  replaceWith: z.string(),
  isRegex: z.boolean(),
  isActive: z.boolean(),
  priority: z.number().int().min(0),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  
  // Optional metadata
  metadata: z.object({
    version: z.string().optional(),
    author: z.string().optional(),
    usage_count: z.number().int().optional(),
    effectiveness_score: z.number().min(0).max(100).optional()
  }).optional()
});

/**
 * Correction set export format
 */
export const ExportedCorrectionSetSchema = z.object({
  meta: z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    version: z.string().default('1.0.0'),
    format_version: z.string().default('1.0'),
    created_at: z.string().datetime(),
    updated_at: z.string().datetime(),
    author: z.string().optional(),
    license: z.string().optional(),
    compatibility: z.object({
      min_version: z.string().optional(),
      max_version: z.string().optional()
    }).optional()
  }),
  
  rules: z.array(ExportedCorrectionRuleSchema),
  
  // Optional sections
  categories: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    color: z.string().optional()
  })).optional(),
  
  tags: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional()
  })).optional(),
  
  settings: z.object({
    auto_apply: z.boolean().optional(),
    priority_mode: z.enum(['sequence', 'weighted']).optional(),
    performance_mode: z.enum(['fast', 'thorough']).optional()
  }).optional(),
  
  // Statistics and metrics
  statistics: z.object({
    total_rules: z.number().int(),
    active_rules: z.number().int(),
    total_executions: z.number().int().optional(),
    success_rate: z.number().min(0).max(100).optional(),
    avg_execution_time: z.number().min(0).optional()
  }).optional()
});

// Type definitions
export type ExportedCorrectionRule = z.infer<typeof ExportedCorrectionRuleSchema>;
export type ExportedCorrectionSet = z.infer<typeof ExportedCorrectionSetSchema>;

// ========== FORMAT CONVERTERS ==========

/**
 * Convert database rule to export format
 */
export function ruleToExportFormat(rule: CorrectionRule): ExportedCorrectionRule {
  return {
    id: rule.uuid,
    name: rule.name,
    description: rule.description || undefined,
    findPattern: rule.find_pattern,
    replaceWith: rule.replace_with,
    isRegex: rule.is_regex,
    isActive: rule.is_active,
    priority: rule.priority,
    createdAt: rule.created_at,
    updatedAt: rule.updated_at,
    
    metadata: {
      version: rule.version.toString()
      // Additional metadata would be populated from statistics
    }
  };
}

/**
 * Convert export format to database rule input
 */
export function exportFormatToRule(exportedRule: ExportedCorrectionRule): {
  uuid: string;
  name: string;
  description?: string;
  find_pattern: string;
  replace_with: string;
  is_regex: boolean;
  is_active: boolean;
  priority: number;
} {
  return {
    uuid: exportedRule.id,
    name: exportedRule.name,
    description: exportedRule.description,
    find_pattern: exportedRule.findPattern,
    replace_with: exportedRule.replaceWith,
    is_regex: exportedRule.isRegex,
    is_active: exportedRule.isActive,
    priority: exportedRule.priority
  };
}

// ========== EXPORT FORMATTERS ==========

/**
 * Export correction set to JSON format
 */
export function exportToJSON(correctionSet: ExportedCorrectionSet): string {
  return JSON.stringify(correctionSet, null, 2);
}

/**
 * Export correction set to YAML format
 */
export function exportToYAML(correctionSet: ExportedCorrectionSet): string {
  // Simple YAML serialization - in production, use a proper YAML library
  const yamlLines: string[] = [];
  
  // Meta section
  yamlLines.push('meta:');
  yamlLines.push(`  name: "${correctionSet.meta.name}"`);
  if (correctionSet.meta.description) {
    yamlLines.push(`  description: "${correctionSet.meta.description}"`);
  }
  yamlLines.push(`  version: "${correctionSet.meta.version}"`);
  yamlLines.push(`  format_version: "${correctionSet.meta.format_version}"`);
  yamlLines.push(`  created_at: "${correctionSet.meta.created_at}"`);
  yamlLines.push(`  updated_at: "${correctionSet.meta.updated_at}"`);
  
  // Rules section
  yamlLines.push('');
  yamlLines.push('rules:');
  
  correctionSet.rules.forEach(rule => {
    yamlLines.push(`  - id: "${rule.id}"`);
    yamlLines.push(`    name: "${rule.name}"`);
    if (rule.description) {
      yamlLines.push(`    description: "${rule.description}"`);
    }
    yamlLines.push(`    findPattern: "${rule.findPattern.replace(/"/g, '\\"')}"`);
    yamlLines.push(`    replaceWith: "${rule.replaceWith.replace(/"/g, '\\"')}"`);
    yamlLines.push(`    isRegex: ${rule.isRegex}`);
    yamlLines.push(`    isActive: ${rule.isActive}`);
    yamlLines.push(`    priority: ${rule.priority}`);
    yamlLines.push(`    createdAt: "${rule.createdAt}"`);
    yamlLines.push(`    updatedAt: "${rule.updatedAt}"`);
    yamlLines.push('');
  });
  
  // Statistics section
  if (correctionSet.statistics) {
    yamlLines.push('statistics:');
    yamlLines.push(`  total_rules: ${correctionSet.statistics.total_rules}`);
    yamlLines.push(`  active_rules: ${correctionSet.statistics.active_rules}`);
    if (correctionSet.statistics.total_executions) {
      yamlLines.push(`  total_executions: ${correctionSet.statistics.total_executions}`);
    }
    if (correctionSet.statistics.success_rate) {
      yamlLines.push(`  success_rate: ${correctionSet.statistics.success_rate}`);
    }
    if (correctionSet.statistics.avg_execution_time) {
      yamlLines.push(`  avg_execution_time: ${correctionSet.statistics.avg_execution_time}`);
    }
  }
  
  return yamlLines.join('\n');
}

/**
 * Export correction set to CSV format
 */
export function exportToCSV(correctionSet: ExportedCorrectionSet): string {
  const csvLines: string[] = [];
  
  // CSV header
  csvLines.push([
    'id',
    'name',
    'description',
    'findPattern',
    'replaceWith',
    'isRegex',
    'isActive',
    'priority',
    'createdAt',
    'updatedAt'
  ].join(','));
  
  // CSV rows
  correctionSet.rules.forEach(rule => {
    csvLines.push([
      rule.id,
      `"${rule.name.replace(/"/g, '""')}"`,
      rule.description ? `"${rule.description.replace(/"/g, '""')}"` : '',
      `"${rule.findPattern.replace(/"/g, '""')}"`,
      `"${rule.replaceWith.replace(/"/g, '""')}"`,
      rule.isRegex.toString(),
      rule.isActive.toString(),
      rule.priority.toString(),
      rule.createdAt,
      rule.updatedAt
    ].join(','));
  });
  
  return csvLines.join('\n');
}

// ========== IMPORT PARSERS ==========

/**
 * Parse JSON correction set
 */
export function parseFromJSON(jsonString: string): ExportedCorrectionSet {
  const parsed = JSON.parse(jsonString);
  return ExportedCorrectionSetSchema.parse(parsed);
}

/**
 * Parse YAML correction set (simplified implementation)
 */
export function parseFromYAML(yamlString: string): ExportedCorrectionSet {
  // This is a simplified YAML parser - in production, use a proper YAML library
  const lines = yamlString.split('\n');
  const result: Record<string, unknown> = { meta: {}, rules: [] };
  
  let currentSection = '';
  let currentRule: Error = null;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed === 'meta:') {
      currentSection = 'meta';
      continue;
    }
    
    if (trimmed === 'rules:') {
      currentSection = 'rules';
      continue;
    }
    
    if (trimmed.startsWith('- id:')) {
      if (currentRule) {
        result.rules.push(currentRule);
      }
      currentRule = {};
      const id = trimmed.match(/id: "(.+)"/)?.[1];
      if (id) currentRule.id = id;
      continue;
    }
    
    if (currentSection === 'meta' && trimmed.includes(':')) {
      const [key, value] = trimmed.split(': ', 2);
      if (key && value) {
        result.meta[key] = value.replace(/"/g, '');
      }
    }
    
    if (currentSection === 'rules' && currentRule && trimmed.includes(':')) {
      const [key, value] = trimmed.split(': ', 2);
      if (key && value) {
        if (key === 'isRegex' || key === 'isActive') {
          currentRule[key] = value === 'true';
        } else if (key === 'priority') {
          currentRule[key] = parseInt(value, 10);
        } else {
          currentRule[key] = value.replace(/"/g, '');
        }
      }
    }
  }
  
  if (currentRule) {
    result.rules.push(currentRule);
  }
  
  return ExportedCorrectionSetSchema.parse(result);
}

/**
 * Parse CSV correction set
 */
export function parseFromCSV(csvString: string): ExportedCorrectionSet {
  const lines = csvString.split('\n');
  const headers = lines[0].split(',');
  
  const rules: ExportedCorrectionRule[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = parseCSVLine(line);
    
    if (values.length >= headers.length) {
      const rule: Error = {};
      headers.forEach((header, index) => {
        const value = values[index];
        switch (header) {
        case 'isRegex':
        case 'isActive':
          rule[header] = value === 'true';
          break;
        case 'priority':
          rule[header] = parseInt(value, 10);
          break;
        default:
          rule[header] = value;
        }
      });
      
      rules.push(rule);
    }
  }
  
  // Create minimal meta for CSV import
  const meta = {
    name: 'Imported Correction Set',
    version: '1.0.0',
    format_version: '1.0',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  return ExportedCorrectionSetSchema.parse({ meta, rules });
}

/**
 * Parse a single CSV line handling quoted values
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"' && !inQuotes) {
      inQuotes = true;
    } else if (char === '"' && inQuotes) {
      if (line[i + 1] === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = false;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
}

// ========== VALIDATION HELPERS ==========

/**
 * Validate imported correction set
 */
export function validateImportedSet(data: Record<string, unknown>): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  try {
    const validatedSet = ExportedCorrectionSetSchema.parse(data);
    
    // Additional validation
    if (validatedSet.rules.length === 0) {
      warnings.push('No correction rules found in the imported set');
    }
    
    if (validatedSet.rules.length > 500) {
      warnings.push(`Large number of rules (${validatedSet.rules.length}) - import may be slow`);
    }
    
    // Check for regex validity
    validatedSet.rules.forEach((rule, index) => {
      if (rule.isRegex) {
        try {
          new RegExp(rule.findPattern);
        } catch (error) {
          errors.push(`Rule ${index + 1} (${rule.name}): Invalid regex pattern`);
        }
      }
    });
    
    // Check for duplicate names
    const names = validatedSet.rules.map(r => r.name);
    const duplicates = names.filter((name, index) => names.indexOf(name) !== index);
    if (duplicates.length > 0) {
      warnings.push(`Duplicate rule names found: ${duplicates.slice(0, 5).join(', ')}${duplicates.length > 5 ? '...' : ''}`);
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      error.errors.forEach(e => {
        errors.push(`${e.path.join('.')}: ${e.message}`);
      });
    } else {
      errors.push(`Validation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    return {
      valid: false,
      errors,
      warnings
    };
  }
}

/**
 * Get format from file extension or content
 */
export function detectFormat(filename: string, content: string): 'json' | 'yaml' | 'csv' | 'unknown' {
  // Check file extension first
  const ext = filename.toLowerCase().split('.').pop();
  if (ext === 'json') return 'json';
  if (ext === 'yaml' || ext === 'yml') return 'yaml';
  if (ext === 'csv') return 'csv';
  
  // Check content
  const trimmed = content.trim();
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) return 'json';
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) return 'json';
  if (trimmed.includes('meta:') && trimmed.includes('rules:')) return 'yaml';
  if (trimmed.includes('id,name,description,findPattern')) return 'csv';
  
  return 'unknown';
}