#!/usr/bin/env node
// Auto-fix completed tasks by moving them to REVIEW status

const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Auto-fixing completed tasks...\n');

// Import the detection results
const detectionScript = path.join(__dirname, 'auto-detect-completed-tasks.js');
const { detectedCompletedTasks } = require(detectionScript);

if (detectedCompletedTasks.length === 0) {
  console.log('✅ No completed tasks detected that need fixing');
  process.exit(0);
}

console.log(`🎯 Found ${detectedCompletedTasks.length} tasks to fix:\n`);

let movedCount = 0;
let skippedCount = 0;

for (const detection of detectedCompletedTasks) {
  const { task, confidence } = detection;
  
  console.log(`🔄 Processing: ${task.id}`);
  console.log(`   Title: ${task.title}`);
  console.log(`   Assignee: ${task.assignee}`);
  console.log(`   Confidence: ${confidence}`);
  
  try {
    // Use finish-task.js to move to REVIEW
    const command = `node ${path.join(__dirname, 'finish-task.js')} ${task.id} REVIEW`;
    execSync(command, { encoding: 'utf8', cwd: __dirname });
    
    console.log('   ✅ Moved to REVIEW');
    movedCount++;
    
  } catch (error) {
    console.log(`   ❌ Failed: ${error.message}`);
    skippedCount++;
  }
  
  console.log('');
}

console.log('📊 Auto-fix Summary:');
console.log(`   Tasks moved to REVIEW: ${movedCount}`);
console.log(`   Tasks skipped: ${skippedCount}`);

if (movedCount > 0) {
  console.log('\n🚀 Next steps:');
  console.log('   1. Run QA review: node src/run-qa-agent.js');
  console.log('   2. Check commit status: node src/check-commit-status.js');
  console.log('   3. Push when ready: git add . && git commit && git push');
}