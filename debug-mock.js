// Debug what our mock is exporting
const path = require('path');
const mockPath = path.join(__dirname, 'client/__mocks__/reactflow.tsx');

console.log('Mock file path:', mockPath);
console.log('File exists:', require('fs').existsSync(mockPath));

// Try to understand the issue by reading the mock content
const mockContent = require('fs').readFileSync(mockPath, 'utf-8');
console.log('\nHandle component definition in mock:');
const lines = mockContent.split('\n');
const handleStartLine = lines.findIndex((line: string) => line.includes('export const Handle'));
for (let i = handleStartLine; i < handleStartLine + 10; i++) {
  if (lines[i]) {
    console.log(`${i + 1}: ${lines[i]}`);
  }
}