#!/usr/bin/env node

/**
 * Check current commit tracking status
 */

const fs = require('fs');
const path = require('path');

function checkCommitStatus() {
  const commitTrackingFile = path.join(__dirname, 'data', 'commit-tracking.json');
  
  console.log('=== COMMIT TRACKING STATUS ===');
  
  if (!fs.existsSync(commitTrackingFile)) {
    console.log('📄 No commit tracking file found');
    console.log('🎯 GitHub automation will start tracking after first QA approval');
    return;
  }
  
  let commitData;
  try {
    commitData = JSON.parse(fs.readFileSync(commitTrackingFile, 'utf8'));
  } catch (error) {
    console.log('❌ Error reading commit tracking file:', error.message);
    return;
  }
  
  const unpushedCount = commitData.unpushedApprovals?.length || 0;
  const pushedHistory = commitData.pushedHistory?.length || 0;
  
  console.log(`📊 Unpushed approvals: ${unpushedCount}/10`);
  console.log(`📈 Total push batches: ${pushedHistory}`);
  
  if (commitData.lastPushTimestamp) {
    console.log(`⏱️  Last push: ${commitData.lastPushTimestamp}`);
  }
  
  if (commitData.readyForPush) {
    console.log('🚀 READY FOR GITHUB PUSH!');
    console.log('   Run: git add . && git commit -m "feat: approved tasks" && git push');
    console.log('   Then: node src/mark-commits-pushed.js');
  } else if (unpushedCount > 0) {
    const remaining = 10 - unpushedCount;
    console.log(`⏳ Need ${remaining} more approvals to trigger GitHub automation`);
  } else {
    console.log('✅ All commits pushed, ready for new approvals');
  }
  
  if (unpushedCount > 0) {
    console.log('');
    console.log('📋 Unpushed approvals:');
    commitData.unpushedApprovals.forEach((approval, index) => {
      console.log(`   ${index + 1}. ${approval.taskId} (${approval.approvedAt})`);
    });
  }
}

// Run if called directly
if (require.main === module) {
  checkCommitStatus();
}

module.exports = { checkCommitStatus };