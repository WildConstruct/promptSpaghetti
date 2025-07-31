// Debug Epic 17 Diagnostics Registration
// This script will help us understand what diagnostics are actually being created

const path = require('path');
const { DiagnosticService } = require('./server/src/admin/DiagnosticService.ts');

// Create a mock database service
class MockDatabaseService {
  async testConnection() {
    return new Promise(resolve => setTimeout(resolve, 50));
  }

  async query() {
    return [];
  }
  async initialize() {
    return true;
  }
  async close() {
    return true;
  }
}

try {
  console.log('🔍 Debugging Epic 17 Diagnostics Registration...\n');

  const mockDb = new MockDatabaseService();
  const diagnosticService = new DiagnosticService(mockDb);

  // Get all diagnostics
  console.log('📋 Fetching all diagnostics...');
  diagnosticService
    .listAvailableDiagnostics()
    .then(diagnostics => {
      console.log(`✅ Total diagnostics found: ${diagnostics.length}\n`);

      // Filter Epic 17 diagnostics
      const epic17Diagnostics = diagnostics.filter(d => d.diagnosticId.startsWith('epic17_'));
      console.log(`🎯 Epic 17 diagnostics found: ${epic17Diagnostics.length}`);

      if (epic17Diagnostics.length > 0) {
        console.log('\nEpic 17 Diagnostics:');
        epic17Diagnostics.forEach(d => {
          console.log(`  - ${d.diagnosticId}: ${d.name} (${d.category})`);
        });
      }

      // Get all suites
      console.log('\n📦 Fetching all diagnostic suites...');
      return diagnosticService.listDiagnosticSuites();
    })
    .then(suites => {
      console.log(`✅ Total suites found: ${suites.length}\n`);

      const epic17Suites = suites.filter(s => s.suiteId.startsWith('epic17_'));
      console.log(`🎯 Epic 17 suites found: ${epic17Suites.length}`);

      if (epic17Suites.length > 0) {
        console.log('\nEpic 17 Suites:');
        epic17Suites.forEach(s => {
          console.log(`  - ${s.suiteId}: ${s.name}`);
          console.log(`    Diagnostics: ${s.diagnostics.length}`);
          s.diagnostics.forEach(d => {
            console.log(`      * ${d.diagnosticId}`);
          });
        });
      }

      console.log('\n✅ Debug complete!');
    })
    .catch(error => {
      console.error('❌ Error during debugging:', error);
    });
} catch (error) {
  console.error('❌ Failed to initialize DiagnosticService:', error);
}
