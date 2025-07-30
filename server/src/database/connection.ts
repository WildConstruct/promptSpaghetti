import Database from 'better-sqlite3';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Handle __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database instance
let db: Database.Database | null = null;

/**
 * Initialize database connection and create tables
 */
export function initDatabase(databasePath: string = 'corrections.db'): Database.Database {
  if (db) {
    return db;
  }

  // Create database connection
  db = new Database(databasePath);
  
  // Enable WAL mode for better performance
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = NORMAL');
  db.pragma('cache_size = 10000');
  db.pragma('temp_store = memory');
  
  // Enable foreign key constraints
  db.pragma('foreign_keys = ON');
  
  // Read and execute schema
  const schemaPath = join(__dirname, 'schema.sql');
  const schema = readFileSync(schemaPath, 'utf8');
  
  // Execute schema in a transaction
  db.exec(schema);
  
  console.log('Database initialized successfully');
  return db;
}

/**
 * Get database instance
 */
export function getDatabase(): Database.Database {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

/**
 * Close database connection
 */
export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
    console.log('Database connection closed');
  }
}

/**
 * Health check for database
 */
export function healthCheck(): boolean {
  try {
    const db = getDatabase();
    const result = db.prepare('SELECT 1 as health').get();
    return result?.health === 1;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

/**
 * Get database statistics
 */
export function getDatabaseStats() {
  try {
    const db = getDatabase();
    
    const stats = {
      totalRules: db.prepare('SELECT COUNT(*) as count FROM correction_rules').get(),
      activeRules: db.prepare('SELECT COUNT(*) as count FROM correction_rules WHERE is_active = 1').get(),
      totalHistory: db.prepare('SELECT COUNT(*) as count FROM correction_rule_history').get(),
      totalStatistics: db.prepare('SELECT COUNT(*) as count FROM correction_statistics').get(),
      totalSets: db.prepare('SELECT COUNT(*) as count FROM correction_sets').get(),
      databaseSize: db.prepare('SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size()').get()
    };
    
    return stats;
  } catch (error) {
    console.error('Failed to get database stats:', error);
    return null;
  }
}

/**
 * Backup database
 */
export function backupDatabase(backupPath: string): boolean {
  try {
    const db = getDatabase();
    db.backup(backupPath);
    console.log(`Database backed up to ${backupPath}`);
    return true;
  } catch (error) {
    console.error('Database backup failed:', error);
    return false;
  }
}

/**
 * Vacuum database (optimize)
 */
export function vacuumDatabase(): boolean {
  try {
    const db = getDatabase();
    db.exec('VACUUM');
    console.log('Database vacuumed successfully');
    return true;
  } catch (error) {
    console.error('Database vacuum failed:', error);
    return false;
  }
}

/**
 * Run database migrations
 */
export function runMigrations(): boolean {
  try {
    const db = getDatabase();
    
    // Create migrations table if it doesn't exist
    db.exec(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        version VARCHAR(50) NOT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(version)

    `);
    
    // Get list of applied migrations
    const appliedMigrations = db.prepare('SELECT version FROM migrations').all() as { version: string }[];
    const appliedVersions = new Set(appliedMigrations.map(m => m.version));
    
    console.log('Applied migrations:', appliedVersions.size ? Array.from(appliedVersions).join(', ') : 'none');
    
    // Get all migration files
    const migrationsDir = join(__dirname, 'migrations');
    let migrationFiles: string[] = [];
    
    try {
      migrationFiles = readdirSync(migrationsDir)
        .filter(file => file.endsWith('.sql'))
        .sort(); // Sort to ensure migrations run in order
    } catch (error) {
      console.log('No migrations directory found, skipping migrations');
      return true;
    }
    
    // Run migrations that haven't been applied
    let appliedCount = 0;
    for (const file of migrationFiles) {
      const version = file.replace('.sql', '');
      
      if (!appliedVersions.has(version)) {
        console.log(`Applying migration: ${version}...`);
        const migrationPath = join(migrationsDir, file);
        
        try {
          const migrationSQL = readFileSync(migrationPath, 'utf8');
          
          // Run migration in a transaction
          const transaction = db.transaction(() => {
            // Execute all statements in the migration file
            const statements = migrationSQL
              .split(';')
              .map(s => s.trim())
              .filter(s => s.length > 0);
            
            for (const statement of statements) {
              db.exec(statement + ';');
            }
            
            // Record migration as applied
            db.prepare('INSERT INTO migrations (version) VALUES (?)').run(version);
          });
          
          transaction();
          console.log(`Migration ${version} applied successfully`);
          appliedCount++;
        } catch (migrationError) {
          console.error(`Failed to apply migration ${version}:`, migrationError);
          // Continue with other migrations but log the error
        }
      }
    }
    
    if (appliedCount > 0) {
      console.log(`Applied ${appliedCount} migration(s)`);
    } else {
      console.log('All migrations are up to date');
    }
    
    return true;
  } catch (error) {
    console.error('Migration runner failed:', error);
    return false;
  }
}

// Graceful shutdown
process.on('SIGINT', closeDatabase);
process.on('SIGTERM', closeDatabase);
process.on('beforeExit', closeDatabase);