import { CorrectionsDAO } from './corrections-dao';
import { 
  ExportedCorrectionSet, 
  ExportedCorrectionRule,
  ruleToExportFormat,
  exportFormatToRule,
  exportToJSON,
  exportToYAML,
  exportToCSV,
  parseFromJSON,
  parseFromYAML,
  parseFromCSV,
  validateImportedSet,
  detectFormat
} from './export-formats';
import { getDatabase } from './connection';
import { createHash } from 'crypto';

/**
 * Service for handling correction rule imports and exports
 */
export class ExportService {
  private dao: CorrectionsDAO;

  constructor() {
    this.dao = new CorrectionsDAO();
  }

  // ========== EXPORT OPERATIONS ==========

  /**
   * Export correction rules to a standardized format
   */
  async exportRules(
    userId: number,
    format: 'json' | 'yaml' | 'csv' = 'json',
    options: {
      name?: string;
      description?: string;
      includeInactive?: boolean;
      includeStatistics?: boolean;
      ruleIds?: number[];
    } = {}
  ): Promise<{
    success: boolean;
    data?: string;
    filename?: string;
    mimeType?: string;
    error?: string;
  }> {
    try {
      // Get rules to export
      const rules = options.ruleIds 
        ? options.ruleIds.map(id => this.dao.getRuleById(id)).filter(Boolean)
        : this.dao.getRulesByUser(userId, options.includeInactive || false);

      if (rules.length === 0) {
        return {
          success: false,
          error: 'No correction rules found to export'
        };
      }

      // Convert to export format
      const exportedRules: ExportedCorrectionRule[] = rules.map(ruleToExportFormat);

      // Get statistics if requested
      let statistics;
      if (options.includeStatistics) {
        const metrics = this.dao.getPerformanceMetrics(userId);
        statistics = {
          total_rules: metrics.total_rules,
          active_rules: metrics.active_rules,
          total_executions: metrics.total_executions,
          success_rate: 100 - metrics.error_rate,
          avg_execution_time: metrics.average_execution_time
        };
      }

      // Create export set
      const exportSet: ExportedCorrectionSet = {
        meta: {
          name: options.name || 'Correction Rules Export',
          description: options.description || `Exported ${rules.length} correction rules`,
          version: '1.0.0',
          format_version: '1.0',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        rules: exportedRules,
        statistics
      };

      // Format output
      let data: string;
      let filename: string;
      let mimeType: string;

      switch (format) {
      case 'json':
        data = exportToJSON(exportSet);
        filename = `corrections-${Date.now()}.json`;
        mimeType = 'application/json';
        break;
      case 'yaml':
        data = exportToYAML(exportSet);
        filename = `corrections-${Date.now()}.yaml`;
        mimeType = 'application/x-yaml';
        break;
      case 'csv':
        data = exportToCSV(exportSet);
        filename = `corrections-${Date.now()}.csv`;
        mimeType = 'text/csv';
        break;
      default:
        return {
          success: false,
          error: 'Unsupported export format'
        };
      }

      return {
        success: true,
        data,
        filename,
        mimeType
      };
    } catch (error) {
      return {
        success: false,
        error: `Export failed: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Create a shareable correction set
   */
  async createCorrectionSet(
    userId: number,
    ruleIds: number[],
    metadata: {
      name: string;
      description?: string;
      version?: string;
      isPublic?: boolean;
    }
  ): Promise<{
    success: boolean;
    setId?: number;
    error?: string;
  }> {
    try {
      // Get rules
      const rules = ruleIds.map(id => this.dao.getRuleById(id)).filter(Boolean);
      
      if (rules.length === 0) {
        return {
          success: false,
          error: 'No valid rules found for the correction set'
        };
      }

      // Create export data
      const exportSet: ExportedCorrectionSet = {
        meta: {
          name: metadata.name,
          description: metadata.description || '',
          version: metadata.version || '1.0.0',
          format_version: '1.0',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        rules: rules.map(ruleToExportFormat)
      };

      const exportData = exportToJSON(exportSet);
      const checksum = createHash('sha256').update(exportData).digest('hex');

      // Store in database
      const db = getDatabase();
      const stmt = db.prepare(`
        INSERT INTO correction_sets (
          name, description, version, created_by, export_format, 
          export_data, checksum, is_public
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const result = stmt.run(
        metadata.name,
        metadata.description || null,
        metadata.version || '1.0.0',
        userId,
        'json',
        exportData,
        checksum,
        metadata.isPublic ? 1 : 0
      );

      const setId = result.lastInsertRowid as number;

      // Link rules to the set
      const linkStmt = db.prepare(`
        INSERT INTO correction_set_rules (set_id, rule_id, order_index)
        VALUES (?, ?, ?)
      `);

      rules.forEach((rule, index) => {
        linkStmt.run(setId, rule.id, index);
      });

      return {
        success: true,
        setId
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to create correction set: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  // ========== IMPORT OPERATIONS ==========

  /**
   * Import correction rules from file content
   */
  async importRules(
    userId: number,
    filename: string,
    content: string,
    options: {
      overwrite?: boolean;
      merge?: boolean;
      skipDuplicates?: boolean;
    } = {}
  ): Promise<{
    success: boolean;
    importedCount?: number;
    skippedCount?: number;
    errors?: string[];
    warnings?: string[];
  }> {
    try {
      // Detect format
      const format = detectFormat(filename, content);
      
      if (format === 'unknown') {
        return {
          success: false,
          errors: ['Unable to detect file format. Supported formats: JSON, YAML, CSV']
        };
      }

      // Parse content
      let importedSet: ExportedCorrectionSet;
      
      try {
        switch (format) {
        case 'json':
          importedSet = parseFromJSON(content);
          break;
        case 'yaml':
          importedSet = parseFromYAML(content);
          break;
        case 'csv':
          importedSet = parseFromCSV(content);
          break;
        default:
          throw new Error('Unsupported format');
        }
      } catch (error) {
        return {
          success: false,
          errors: [`Failed to parse ${format.toUpperCase()} file: ${error instanceof Error ? error.message : String(error)}`]
        };
      }

      // Validate imported data
      const validation = validateImportedSet(importedSet);
      if (!validation.valid) {
        return {
          success: false,
          errors: validation.errors,
          warnings: validation.warnings
        };
      }

      // Import rules
      const importResult = await this.importCorrectionRules(
        userId,
        importedSet.rules,
        options
      );

      return {
        success: true,
        importedCount: importResult.importedCount,
        skippedCount: importResult.skippedCount,
        errors: importResult.errors,
        warnings: [...(validation.warnings || []), ...(importResult.warnings || [])]
      };
    } catch (error) {
      return {
        success: false,
        errors: [`Import failed: ${error instanceof Error ? error.message : String(error)}`]
      };
    }
  }

  /**
   * Import correction rules from exported format
   */
  private async importCorrectionRules(
    userId: number,
    rules: ExportedCorrectionRule[],
    options: {
      overwrite?: boolean;
      merge?: boolean;
      skipDuplicates?: boolean;
    }
  ): Promise<{
    importedCount: number;
    skippedCount: number;
    errors: string[];
    warnings: string[];
  }> {
    let importedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];
    const warnings: string[] = [];

    // Get existing rules for conflict detection
    const existingRules = this.dao.getRulesByUser(userId, true);
    const existingByName = new Map(existingRules.map(r => [r.name, r]));
    const existingByUuid = new Map(existingRules.map(r => [r.uuid, r]));

    for (const rule of rules) {
      try {
        // Check for conflicts
        const existingByNameConflict = existingByName.get(rule.name);
        const existingByUuidConflict = existingByUuid.get(rule.id);

        if (existingByUuidConflict) {
          if (options.overwrite) {
            // Update existing rule
            const updateData = {
              name: rule.name,
              description: rule.description,
              find_pattern: rule.findPattern,
              replace_with: rule.replaceWith,
              is_regex: rule.isRegex,
              is_active: rule.isActive,
              priority: rule.priority
            };

            const updated = this.dao.updateRule(existingByUuidConflict.id, updateData, userId);
            if (updated) {
              importedCount++;
            } else {
              errors.push(`Failed to update rule: ${rule.name}`);
            }
          } else if (options.skipDuplicates) {
            skippedCount++;
            warnings.push(`Skipped duplicate rule: ${rule.name}`);
          } else {
            errors.push(`Rule with UUID ${rule.id} already exists: ${rule.name}`);
          }
          continue;
        }

        if (existingByNameConflict) {
          if (options.skipDuplicates) {
            skippedCount++;
            warnings.push(`Skipped rule with duplicate name: ${rule.name}`);
            continue;
          } else if (!options.merge) {
            errors.push(`Rule with name "${rule.name}" already exists`);
            continue;
          }
        }

        // Create new rule
        const ruleData = {
          name: rule.name,
          description: rule.description,
          find_pattern: rule.findPattern,
          replace_with: rule.replaceWith,
          is_regex: rule.isRegex,
          is_active: rule.isActive,
          priority: rule.priority,
          user_id: userId,
          scope: 'private' as const
        };

        const created = this.dao.createRule(ruleData);
        if (created) {
          importedCount++;
        } else {
          errors.push(`Failed to create rule: ${rule.name}`);
        }
      } catch (error) {
        errors.push(`Error importing rule "${rule.name}": ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    return {
      importedCount,
      skippedCount,
      errors,
      warnings
    };
  }

  // ========== CORRECTION SET OPERATIONS ==========

  /**
   * Get available correction sets
   */
  getCorrectionSets(userId: number, includePublic: boolean = true): unknown[] {
    const db = getDatabase();
    
    let whereClause = 'WHERE created_by = ?';
    const params = [userId];
    
    if (includePublic) {
      whereClause += ' OR is_public = 1';
    }
    
    const stmt = db.prepare(`
      SELECT 
        cs.*,
        COUNT(csr.rule_id) as rule_count
      FROM correction_sets cs
      LEFT JOIN correction_set_rules csr ON cs.id = csr.set_id
      ${whereClause}
      GROUP BY cs.id
      ORDER BY cs.created_at DESC
    `);
    
    return stmt.all(...params);
  }

  /**
   * Get correction set by ID
   */
  getCorrectionSetById(setId: number, userId: number): unknown {
    const db = getDatabase();
    
    const stmt = db.prepare(`
      SELECT cs.*, COUNT(csr.rule_id) as rule_count
      FROM correction_sets cs
      LEFT JOIN correction_set_rules csr ON cs.id = csr.set_id
      WHERE cs.id = ? AND (cs.created_by = ? OR cs.is_public = 1)
      GROUP BY cs.id
    `);
    
    return stmt.get(setId, userId);
  }

  /**
   * Download correction set
   */
  async downloadCorrectionSet(setId: number, userId: number): Promise<{
    success: boolean;
    data?: string;
    filename?: string;
    mimeType?: string;
    error?: string;
  }> {
    try {
      const set = this.getCorrectionSetById(setId, userId);
      
      if (!set) {
        return {
          success: false,
          error: 'Correction set not found or access denied'
        };
      }

      // Increment download count
      const db = getDatabase();
      const updateStmt = db.prepare(`
        UPDATE correction_sets 
        SET download_count = download_count + 1 
        WHERE id = ?
      `);
      updateStmt.run(setId);

      // Return export data
      const mimeType = set.export_format === 'json' 
        ? 'application/json' 
        : set.export_format === 'yaml' 
          ? 'application/x-yaml' 
          : 'text/csv';

      return {
        success: true,
        data: set.export_data,
        filename: `${set.name.replace(/[^a-z0-9]/gi, '_')}.${set.export_format}`,
        mimeType
      };
    } catch (error) {
      return {
        success: false,
        error: `Download failed: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Delete correction set
   */
  deleteCorrectionSet(setId: number, userId: number): boolean {
    try {
      const db = getDatabase();
      
      // Verify ownership
      const stmt = db.prepare('SELECT id FROM correction_sets WHERE id = ? AND created_by = ?');
      const set = stmt.get(setId, userId);
      
      if (!set) {
        return false;
      }

      // Delete the set (cascade will handle rules)
      const deleteStmt = db.prepare('DELETE FROM correction_sets WHERE id = ?');
      const result = deleteStmt.run(setId);
      
      return result.changes > 0;
    } catch (error) {
      console.error('Failed to delete correction set:', error);
      return false;
    }
  }
}