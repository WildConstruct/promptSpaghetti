import { CorrectionsDAO } from './corrections-dao';
import { initDatabase } from './connection';

/**
 * Migration service to handle data transition from localStorage to database
 */
export class MigrationService {
  private dao: CorrectionsDAO;

  constructor() {
    initDatabase();
    this.dao = new CorrectionsDAO();
  }

  /**
   * Migrate corrections from localStorage format to database
   */
  async migrateFromLocalStorage(localStorageData: unknown): Promise<{
    success: boolean;
    importedCount: number;
    errors: string[];
  }> {

    const errors: string[] = [];
    let importedCount = 0;

    try {
      // Parse localStorage data
      const correctionsData = this.parseLocalStorageData(localStorageData);
      
      if (!correctionsData || !correctionsData.rules) {
        return {
          success: false,
          importedCount: 0,
          errors: ['No valid corrections data found in localStorage']
        };
      }

      // Import rules
      try {
        importedCount = this.dao.importFromLocalStorage(correctionsData.rules);
      } catch (error) {
        errors.push(`Failed to import rules: ${error instanceof Error ? error.message : String(error)}`);
      }

      // Import user preferences if available
      if (correctionsData.preferences) {
        try {
          await this.migrateUserPreferences(correctionsData.preferences);
        } catch (error) {
          errors.push(`Failed to import preferences: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      return {
        success: errors.length === 0,
        importedCount,
        errors
      };
    } catch (error) {
      return {
        success: false,
        importedCount: 0,
        errors: [`Migration failed: ${error instanceof Error ? error.message : String(error)}`]
      };
    }
  }

  /**
   * Parse localStorage data into structured format
   */
  private parseLocalStorageData(data: Record<string, unknown>): {
    rules: unknown[];
    preferences?: unknown;
  } | null {
    try {
      // Handle different localStorage formats
      if (typeof data === 'string') {
        data = JSON.parse(data);
      }

      // Check for corrections-store format (Zustand persist)
      if (data.state && data.state.rules) {
        return {
          rules: data.state.rules,
          preferences: data.state.preferences || null
        };
      }

      // Check for direct rules array
      if (Array.isArray(data)) {
        return {
          rules: data,
          preferences: null
        };
      }

      // Check for object with rules property
      if (data.rules && Array.isArray(data.rules)) {
        return {
          rules: data.rules,
          preferences: data.preferences || null
        };
      }

      return null;
    } catch (error) {
      console.error('Failed to parse localStorage data:', error);
      return null;
    }
  }

  /**
   * Migrate user preferences
   */
  private async migrateUserPreferences(preferences: unknown): Promise<void> {

    // TODO: Implement user preferences migration
    // This would update the user_preferences table with the settings
    console.log('User preferences migration not yet implemented:', preferences);
  }

  /**
   * Validate migration data before importing
   */
  validateMigrationData(data: Record<string, unknown>): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const parsed = this.parseLocalStorageData(data);
      
      if (!parsed) {
        errors.push('Unable to parse localStorage data');
        return { valid: false, errors, warnings };
      }

      const { rules } = parsed;

      if (!Array.isArray(rules)) {
        errors.push('Rules data is not an array');
        return { valid: false, errors, warnings };
      }

      // Validate each rule
      rules.forEach((rule, index) => {
        const ruleErrors = this.validateRule(rule, index);
        errors.push(...ruleErrors);
      });

      // Check for potential issues
      if (rules.length === 0) {
        warnings.push('No correction rules found to migrate');
      }

      if (rules.length > 100) {
        warnings.push(`Large number of rules (${rules.length}) - migration may take longer`);
      }

      // Check for duplicate names
      const names = rules.map(r => r.name).filter(Boolean);
      const duplicates = names.filter((name, index) => names.indexOf(name) !== index);
      if (duplicates.length > 0) {
        warnings.push(`Duplicate rule names found: ${duplicates.join(', ')}`);
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings
      };
    } catch (error) {
      errors.push(`Validation failed: ${error instanceof Error ? error.message : String(error)}`);
      return { valid: false, errors, warnings };
    }
  }

  /**
   * Validate a single rule
   */
  private validateRule(rule: Error, index: number): string[] {
    const errors: string[] = [];

    if (!rule.name || typeof rule.name !== 'string') {
      errors.push(`Rule ${index}: Missing or invalid name`);
    }

    if (!rule.findPattern || typeof rule.findPattern !== 'string') {
      errors.push(`Rule ${index}: Missing or invalid findPattern`);
    }

    if (rule.replaceWith === undefined || typeof rule.replaceWith !== 'string') {
      errors.push(`Rule ${index}: Missing or invalid replaceWith`);
    }

    if (rule.isRegex && typeof rule.isRegex !== 'boolean') {
      errors.push(`Rule ${index}: Invalid isRegex value`);
    }

    if (rule.isActive && typeof rule.isActive !== 'boolean') {
      errors.push(`Rule ${index}: Invalid isActive value`);
    }

    if (rule.priority !== undefined && typeof rule.priority !== 'number') {
      errors.push(`Rule ${index}: Invalid priority value`);
    }

    // Validate regex patterns
    if (rule.isRegex) {
      try {
        new RegExp(rule.findPattern);
      } catch (error) {
        errors.push(`Rule ${index}: Invalid regex pattern: ${rule.findPattern}`);
      }
    }

    return errors;
  }

  /**
   * Create a backup of current database before migration
   */
  async createBackup(): Promise<string> {

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = `corrections-backup-${timestamp}.db`;
    
    try {
      const { backupDatabase } = await import('./connection');
      const success = backupDatabase(backupPath);
      
      if (!success) {
        throw new Error('Backup failed');
      }
      
      return backupPath;
    } catch (error) {
      throw new Error(`Failed to create backup: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get migration status and statistics
   */
  getMigrationStatus(): {
    databaseInitialized: boolean;
    totalRules: number;
    activeRules: number;
    canMigrate: boolean;
    } {
    try {
      const { getDatabaseStats } = require('./connection');
      const stats = getDatabaseStats();
      
      return {
        databaseInitialized: stats !== null,
        totalRules: stats?.totalRules?.count || 0,
        activeRules: stats?.activeRules?.count || 0,
        canMigrate: stats !== null
      };
    } catch (error) {
      return {
        databaseInitialized: false,
        totalRules: 0,
        activeRules: 0,
        canMigrate: false
      };
    }
  }
}

/**
 * Standalone migration function for CLI usage
 */
export async function runMigration(localStorageData: unknown): Promise<void> {

  const migrationService = new MigrationService();
  
  console.log('Starting corrections migration...');
  
  // Validate data first
  const validation = migrationService.validateMigrationData(localStorageData);
  
  if (!validation.valid) {
    console.error('Migration validation failed:');
    validation.errors.forEach(error => console.error(`  - ${error}`));
    return;
  }
  
  if (validation.warnings.length > 0) {
    console.warn('Migration warnings:');
    validation.warnings.forEach(warning => console.warn(`  - ${warning}`));
  }
  
  // Create backup
  try {
    const backupPath = await migrationService.createBackup();
    console.log(`Database backup created: ${backupPath}`);
  } catch (error) {
    console.warn('Failed to create backup:', error);
  }
  
  // Run migration
  const result = await migrationService.migrateFromLocalStorage(localStorageData);
  
  if (result.success) {
    console.log(`Migration completed successfully! Imported ${result.importedCount} correction rules.`);
  } else {
    console.error('Migration failed:');
    result.errors.forEach(error => console.error(`  - ${error}`));
  }
  
  // Show final status
  const status = migrationService.getMigrationStatus();
  console.log(`Final status: ${status.totalRules} total rules, ${status.activeRules} active rules`);
}