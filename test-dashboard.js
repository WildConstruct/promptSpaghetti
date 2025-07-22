#!/usr/bin/env node

const fs = require('fs');

const stateFile = './src/data/state.json';
if (fs.existsSync(stateFile)) {
  const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
  const epic8Tasks = Object.values(state.tasks || {}).filter(t => t.epic === 'Epic 8');
  
  console.log('🎬 Epic 8 Dashboard Test Results');
  console.log('================================');
  console.log(`Total Epic 8 tasks: ${epic8Tasks.length}`);
  
  const stories = [...new Set(epic8Tasks.map(t => t.story || t.story_id))];
  console.log(`Stories covered: ${stories.sort().join(', ')}`);
  
  const assigned = epic8Tasks.filter(t => t.assignee && t.assignee !== 'null').length;
  console.log(`Assigned to agents: ${assigned}`);
  
  const byStatus = {};
  epic8Tasks.forEach(t => {
    const status = t.state || t.status || 'UNASSIGNED';
    byStatus[status] = (byStatus[status] || 0) + 1;
  });
  console.log('Status breakdown:', byStatus);
  
  console.log('\nSample task titles:');
  epic8Tasks.slice(0, 3).forEach(t => console.log(`  - ${t.title}`));
  
  console.log('\n✅ Dashboard should now show real Epic 8 data instead of stubs!');
} else {
  console.log('❌ State file not found');
}