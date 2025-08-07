// Simple debug script to understand what's being rendered
const fs = require('fs');

// Get the latest test output to see the actual HTML structure
console.log('Debug: Let me check what the test is actually rendering...');

// Read the GraphNode test file to understand the test structure
const testContent = fs.readFileSync('./client/src/components/__tests__/GraphNode.test.tsx', 'utf-8');

// Find the test that's failing
const lines = testContent.split('\n');
const handleTestStartLine = lines.findIndex((line: string) => line.includes('renders input and output handles'));

console.log('\nTest code around the failing test:');
for (let i = handleTestStartLine; i < handleTestStartLine + 15; i++) {
  if (lines[i]) {
    console.log(`${i + 1}: ${lines[i]}`);

