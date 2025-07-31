// Direct test of eval validation
const { SecurityValidation } = require('./packages/core/validation/security');

console.log('Testing eval directly...');
try {
  const result = SecurityValidation.validateVariableName('eval');
  console.log(`SecurityValidation.validateVariableName('eval') = ${result}`);

  // Let's also test the dangerous properties directly
  console.log('\nTesting validateSafePropertyKey directly:');
  const safeResult = SecurityValidation.validateSafePropertyKey('eval');
  console.log(`SecurityValidation.validateSafePropertyKey('eval') = ${safeResult}`);
} catch (error) {
  console.error('Error:', error.message);
}
