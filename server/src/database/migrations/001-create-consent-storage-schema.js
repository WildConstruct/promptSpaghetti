/**
 * Database Migration: Create Consent Storage Schema
 * Epic 19 - Security & Compliance Framework
 * Task: E19-1753114711826-03C121 - Create schema for consent storage
 */

const fs = require('fs');
const path = require('path');

/**
 * Migration: Create consent storage schema and populate default data
 */
const migration = {
  name: '001-create-consent-storage-schema',
  description: 'Create comprehensive consent management schema with GDPR/CCPA compliance',
  version: '1.0.0',

  async up(queryInterface, Sequelize) {
    console.log('🚀 Starting consent storage schema migration...');

    try {
      // Read the main schema file
      const schemaPath = path.join(__dirname, '../schemas/consent-storage-schema.sql');
      const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

      // Read the default data file
      const seedPath = path.join(__dirname, '../seeds/consent-default-data.sql');
      const seedSQL = fs.readFileSync(seedPath, 'utf8');

      // Execute schema creation
      console.log('📋 Creating database schema...');
      await queryInterface.sequelize.query(schemaSQL, {
        type: Sequelize.QueryTypes.RAW,
      });

      console.log('🌱 Inserting default data...');
      await queryInterface.sequelize.query(seedSQL, {
        type: Sequelize.QueryTypes.RAW,
      });

      // Verify installation
      console.log('🔍 Verifying schema installation...');
      const verificationResults = await this.verifyInstallation(queryInterface, Sequelize);

      if (verificationResults.success) {
        console.log('✅ Consent storage schema migration completed successfully!');
        console.log(
          `📊 Created ${verificationResults.tableCount} tables with ${verificationResults.recordCount} default records`
        );
      } else {
        throw new Error('Schema verification failed: ' + verificationResults.error);
      }
    } catch (error) {
      console.error('❌ Migration failed:', error.message);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Reverting consent storage schema migration...');

    try {
      // List of tables to drop in reverse dependency order
      const tablesToDrop = [
        'consent_metrics',
        'compliance_violations',
        'consent_reports',
        'jit_prompt_configs',
        'consent_configurations',
        'consent_interactions',
        'consent_change_history',
        'user_cookie_consents',
        'cookie_definitions',
        'user_consent_preferences',
        'consent_third_party_sharing',
        'third_party_entities',
        'consent_data_categories',
        'data_categories',
        'consent_purpose_mappings',
        'consent_purposes',
        'consent_records',
      ];

      // Drop views first
      const viewsToDrop = ['expiring_consents', 'consent_summary', 'active_consents'];

      console.log('🗑️ Dropping views...');
      for (const view of viewsToDrop) {
        try {
          await queryInterface.sequelize.query(`DROP VIEW IF EXISTS ${view} CASCADE;`);
        } catch (error) {
          console.warn(`⚠️ Could not drop view ${view}: ${error.message}`);
        }
      }

      console.log('🗑️ Dropping tables...');
      for (const table of tablesToDrop) {
        try {
          await queryInterface.sequelize.query(`DROP TABLE IF EXISTS ${table} CASCADE;`);
        } catch (error) {
          console.warn(`⚠️ Could not drop table ${table}: ${error.message}`);
        }
      }

      // Drop functions
      const functionsToDrop = [
        'cleanup_expired_consents',
        'archive_old_consent_history',
        'verify_consent_data_integrity',
        'log_consent_change',
        'update_updated_at_column',
      ];

      console.log('🗑️ Dropping functions...');
      for (const func of functionsToDrop) {
        try {
          await queryInterface.sequelize.query(`DROP FUNCTION IF EXISTS ${func}() CASCADE;`);
        } catch (error) {
          console.warn(`⚠️ Could not drop function ${func}: ${error.message}`);
        }
      }

      // Drop extension if no other tables are using it
      try {
        await queryInterface.sequelize.query('DROP EXTENSION IF EXISTS "uuid-ossp";');
      } catch (error) {
        console.warn('⚠️ Could not drop uuid-ossp extension (may be in use by other tables)');
      }

      console.log('✅ Consent storage schema rollback completed');
    } catch (error) {
      console.error('❌ Rollback failed:', error.message);
      throw error;
    }
  },

  /**
   * Verify that the migration was successful
   */
  async verifyInstallation(queryInterface, Sequelize) {
    try {
      // Check that all main tables exist
      const requiredTables = [
        'consent_records',
        'consent_purposes',
        'consent_purpose_mappings',
        'data_categories',
        'consent_data_categories',
        'third_party_entities',
        'consent_third_party_sharing',
        'user_consent_preferences',
        'cookie_definitions',
        'user_cookie_consents',
        'consent_change_history',
        'consent_interactions',
        'consent_configurations',
        'jit_prompt_configs',
        'consent_reports',
        'compliance_violations',
        'consent_metrics',
      ];

      let tableCount = 0;
      for (const table of requiredTables) {
        const [results] = await queryInterface.sequelize.query(
          `SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = '${table}'
          );`
        );

        if (results[0].exists) {
          tableCount++;
        } else {
          return {
            success: false,
            error: `Required table ${table} was not created`,
          };
        }
      }

      // Check that default data was inserted
      const [purposeCount] = await queryInterface.sequelize.query('SELECT COUNT(*) as count FROM consent_purposes;');

      const [categoryCount] = await queryInterface.sequelize.query('SELECT COUNT(*) as count FROM data_categories;');

      const [cookieCount] = await queryInterface.sequelize.query('SELECT COUNT(*) as count FROM cookie_definitions;');

      const [configCount] = await queryInterface.sequelize.query(
        'SELECT COUNT(*) as count FROM consent_configurations;'
      );

      const totalRecords =
        parseInt(purposeCount[0].count) +
        parseInt(categoryCount[0].count) +
        parseInt(cookieCount[0].count) +
        parseInt(configCount[0].count);

      if (totalRecords === 0) {
        return {
          success: false,
          error: 'No default data was inserted',
        };
      }

      // Check that views exist
      const requiredViews = ['active_consents', 'consent_summary', 'expiring_consents'];
      for (const view of requiredViews) {
        const [results] = await queryInterface.sequelize.query(
          `SELECT EXISTS (
            SELECT FROM information_schema.views 
            WHERE table_schema = 'public' 
            AND table_name = '${view}'
          );`
        );

        if (!results[0].exists) {
          return {
            success: false,
            error: `Required view ${view} was not created`,
          };
        }
      }

      // Check that functions exist
      const requiredFunctions = [
        'cleanup_expired_consents',
        'verify_consent_data_integrity',
        'update_updated_at_column',
        'log_consent_change',
      ];

      for (const func of requiredFunctions) {
        const [results] = await queryInterface.sequelize.query(
          `SELECT EXISTS (
            SELECT FROM information_schema.routines 
            WHERE routine_schema = 'public' 
            AND routine_name = '${func}'
          );`
        );

        if (!results[0].exists) {
          return {
            success: false,
            error: `Required function ${func} was not created`,
          };
        }
      }

      // Run integrity verification function
      const [integrityResults] = await queryInterface.sequelize.query('SELECT * FROM verify_consent_data_integrity();');

      // Check for any integrity issues
      const hasIssues = integrityResults.some(result => result.issue_count > 0);
      if (hasIssues) {
        console.warn('⚠️ Some data integrity issues detected (may be normal for fresh installation):');
        integrityResults.forEach(result => {
          if (result.issue_count > 0) {
            console.warn(
              `  - ${result.table_name}: ${result.issue_count} ${result.issue_type} (${result.description})`
            );
          }
        });
      }

      return {
        success: true,
        tableCount: tableCount,
        recordCount: totalRecords,
        integrityIssues: integrityResults.filter(r => r.issue_count > 0).length,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  /**
   * Get migration metadata
   */
  getMetadata() {
    return {
      name: this.name,
      description: this.description,
      version: this.version,
      createdAt: new Date(),
      epic: 'Epic 19 - Security & Compliance Framework',
      task: 'E19-1753114711826-03C121',
      author: 'claude_code_dev',
      dependencies: [],
      rollbackSupported: true,
      estimatedDuration: '2-5 minutes',
      dataLoss: {
        onUp: false,
        onDown: true,
        description: 'Rollback will remove all consent data',
      },
    };
  },

  /**
   * Pre-migration checks
   */
  async preCheck(queryInterface, Sequelize) {
    console.log('🔍 Running pre-migration checks...');

    try {
      // Check database version
      const [versionResult] = await queryInterface.sequelize.query('SELECT version();');
      const version = versionResult[0].version;
      console.log(`📍 Database version: ${version}`);

      // Check if UUID extension is available
      try {
        await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
        console.log('✅ UUID extension is available');
      } catch (error) {
        throw new Error('UUID extension (uuid-ossp) is not available. Please install it first.');
      }

      // Check available disk space (rough estimate)
      const [spaceResult] = await queryInterface.sequelize.query(
        'SELECT pg_size_pretty(pg_database_size(current_database())) as size;'
      );
      console.log(`💾 Current database size: ${spaceResult[0].size}`);

      // Check for conflicting tables
      const conflictingTables = ['consent_records', 'consent_purposes', 'data_categories'];
      for (const table of conflictingTables) {
        const [results] = await queryInterface.sequelize.query(
          `SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = '${table}'
          );`
        );

        if (results[0].exists) {
          throw new Error(
            `Conflicting table found: ${table}. Please remove or rename it before running this migration.`
          );
        }
      }

      console.log('✅ Pre-migration checks passed');
      return { success: true };
    } catch (error) {
      console.error('❌ Pre-migration check failed:', error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * Post-migration tasks
   */
  async postMigration(queryInterface, Sequelize) {
    console.log('🔧 Running post-migration tasks...');

    try {
      // Update table statistics for better query planning
      console.log('📊 Updating table statistics...');
      await queryInterface.sequelize.query('ANALYZE;');

      // Test key functionality
      console.log('🧪 Testing key functionality...');

      // Test consent record creation
      const testConsentId = await this.testConsentCreation(queryInterface, Sequelize);

      // Test consent history logging
      await this.testHistoryLogging(queryInterface, Sequelize, testConsentId);

      // Test cleanup function
      await this.testCleanupFunction(queryInterface, Sequelize);

      // Clean up test data
      await queryInterface.sequelize.query("DELETE FROM consent_records WHERE modified_by = 'migration_test';");

      console.log('✅ Post-migration tasks completed successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Post-migration tasks failed:', error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * Test consent record creation
   */
  async testConsentCreation(queryInterface, Sequelize) {
    const testConsent = {
      session_id: 'migration_test_session',
      consent_type: 'EXPLICIT',
      status: 'ACTIVE',
      granularity: 'PURPOSE',
      legal_basis: 'CONSENT',
      collection_method: 'API',
      source: 'migration',
      modified_by: 'migration_test',
    };

    const [result] = await queryInterface.sequelize.query(`
      INSERT INTO consent_records (${Object.keys(testConsent).join(', ')})
      VALUES (${Object.values(testConsent)
        .map(v => `'${v}'`)
        .join(', ')})
      RETURNING consent_id;
    `);

    const consentId = result[0].consent_id;
    console.log(`✅ Test consent record created: ${consentId}`);
    return consentId;
  },

  /**
   * Test consent history logging
   */
  async testHistoryLogging(queryInterface, Sequelize, consentId) {
    // Update the consent to trigger history logging
    await queryInterface.sequelize.query(`
      UPDATE consent_records 
      SET status = 'WITHDRAWN', modified_by = 'migration_test' 
      WHERE consent_id = '${consentId}';
    `);

    // Check that history was logged
    const [historyResult] = await queryInterface.sequelize.query(`
      SELECT COUNT(*) as count 
      FROM consent_change_history 
      WHERE consent_id = '${consentId}';
    `);

    if (historyResult[0].count > 0) {
      console.log('✅ Consent history logging is working');
    } else {
      throw new Error('Consent history logging is not working');
    }
  },

  /**
   * Test cleanup function
   */
  async testCleanupFunction(queryInterface, Sequelize) {
    const [result] = await queryInterface.sequelize.query('SELECT cleanup_expired_consents();');
    const cleanupCount = result[0].cleanup_expired_consents;
    console.log(`✅ Cleanup function executed successfully (processed ${cleanupCount} records)`);
  },
};

module.exports = migration;
