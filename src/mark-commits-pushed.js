#!/usr/bin/env node

/**
 * Mark commits as pushed after successful GitHub push
 * Run this after: git add . && git commit && git push
 */

const fs = require('fs');
const path = require('path');

function markCommitsPushed() {
  const commitTrackingFile = path.join(
    __dirname,
    'data',
    'commit-tracking.json'
  );

  if (!fs.existsSync(commitTrackingFile)) {
    console.log('No commit tracking file found - nothing to mark as pushed');
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

  if (unpushedCount === 0) {
    console.log('✅ No unpushed approvals to mark');
    return;
  }

  // Archive the pushed approvals
  if (!commitData.pushedHistory) {
    commitData.pushedHistory = [];
  }

  commitData.pushedHistory.push({
    pushedAt: new Date().toISOString(),
    taskCount: unpushedCount,
    tasks: commitData.unpushedApprovals
  });

  // Reset unpushed counter
  commitData.unpushedApprovals = [];
  commitData.lastPushTimestamp = new Date().toISOString();
  commitData.readyForPush = false;

  // Save updated tracking
  fs.writeFileSync(commitTrackingFile, JSON.stringify(commitData, null, 2));

  console.log(`✅ Marked ${unpushedCount} approved tasks as pushed to GitHub`);
  console.log('📊 Commit counter reset to 0');
  console.log('🎯 Next GitHub automation will trigger after 10 new approvals');
}

// Run if called directly
if (require.main === module) {
  markCommitsPushed();
}

module.exports = { markCommitsPushed };
