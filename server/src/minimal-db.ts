// Minimal database setup for testing
import Database from 'better-sqlite3';

let db: Database.Database | null = null;

/**
 * Initialize database with minimal schema
 */
export function initDatabase(
  databasePath: string = ':memory:'
): Database.Database {
  if (db) {
    return db;
  }

  // Create in-memory database for testing
  db = new Database(databasePath);

  // Enable basic settings
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Create minimal schema inline
  db.exec(`
    CREATE TABLE IF NOT EXISTS corrections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      data TEXT
    );
  `);

  console.log('Minimal database initialized successfully');
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
 * Simple health check
 */
export function healthCheck(): boolean {
  try {
    const db = getDatabase();
    const result = db.prepare('SELECT 1 as health').get() as any;
    return result?.health === 1;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
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
