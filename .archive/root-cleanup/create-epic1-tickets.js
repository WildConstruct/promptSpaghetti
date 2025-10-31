#!/usr/bin/env node

/**
 * Create tickets for Epic 1 stories
 * This script creates task entries for each approved story
 */

const fs = require('fs');
const path = require('path');

// Epic 1 stories with their details
const epic1Stories = [
  {
    id: '1.0',
    title: 'Risk Mitigation & Brownfield Safety Framework',
    description:
      'Comprehensive risk mitigation and safety measures for brownfield rebuild',
    priority: 'CRITICAL',
    estimated_hours: 16,
    tags: 'risk-mitigation,brownfield,safety,analytics'
  },
  {
    id: '1.1',
    title: 'Core Node Engine & File Format',
    description:
      'Implement foundational node system with inline-editable data structures',
    priority: 'HIGH',
    estimated_hours: 24,
    tags: 'core,engine,file-format,foundation'
  },
  {
    id: '1.2',
    title: 'Prompt Analysis & Node Generation',
    description:
      'Parse prompts and generate inline-editable nodes intelligently',
    priority: 'HIGH',
    estimated_hours: 20,
    tags: 'parser,analysis,node-generation,ai'
  },
  {
    id: '1.3',
    title: 'Visual Node Editor with React Flow',
    description: 'Build visual canvas with inline editing capabilities',
    priority: 'HIGH',
    estimated_hours: 32,
    tags: 'ui,react-flow,editor,inline-editing'
  },
  {
    id: '1.4',
    title: 'Execution & Preview System',
    description: 'Live preview updates as users edit nodes inline',
    priority: 'HIGH',
    estimated_hours: 24,
    tags: 'preview,execution,real-time,performance'
  },
  {
    id: '1.5',
    title: 'Asset Library & Preset System',
    description: 'Drag-and-drop preset system with inline customization',
    priority: 'MEDIUM',
    estimated_hours: 20,
    tags: 'assets,presets,library,drag-drop'
  },
  {
    id: '1.6',
    title: 'Polish & Demo Optimization',
    description: 'Polish inline editing experience for investor demo',
    priority: 'MEDIUM',
    estimated_hours: 16,
    tags: 'polish,demo,ux,animations'
  },
  {
    id: '1.7',
    title: 'Onboarding & Help System',
    description: 'Interactive tutorial and contextual help for inline editing',
    priority: 'MEDIUM',
    estimated_hours: 16,
    tags: 'onboarding,tutorial,help,ux'
  }
];

// Create tickets summary
console.log('🎫 Creating Epic 1 Tickets\n');
console.log('Stories to ticket:');
console.log('==================');

let totalHours = 0;
epic1Stories.forEach(story => {
  const ticketId = `EPIC1-${story.id.replace('.', '-')}`;
  console.log(`\n${ticketId}: ${story.title}`);
  console.log(`  Priority: ${story.priority}`);
  console.log(`  Estimated: ${story.estimated_hours} hours`);
  console.log(`  Tags: ${story.tags}`);
  console.log(`  Story File: docs/stories/${story.id}.*.md`);
  totalHours += story.estimated_hours;
});

console.log('\n==================');
console.log(`Total Stories: ${epic1Stories.length}`);
console.log(`Total Estimated Hours: ${totalHours} (${totalHours / 8} days)`);
console.log(`Timeline: 8 weeks (320 hours capacity for team of 1)`);

// Create ticket data for task system
const tickets = epic1Stories.map(story => ({
  id: `EPIC1-${story.id.replace('.', '-')}`,
  story_id: story.id,
  title: story.title,
  description: story.description,
  status: 'TODO',
  priority: story.priority,
  estimated_hours: story.estimated_hours,
  tags: story.tags,
  epic: 'Epic 1',
  created_at: new Date().toISOString(),
  metadata: JSON.stringify({
    story_file: `docs/stories/${story.id}.*.md`,
    success_metrics: true,
    rollback_procedures: true,
    acceptance_criteria: true
  })
}));

// Save tickets to JSON for import
const ticketsFile = 'epic1-tickets.json';
fs.writeFileSync(ticketsFile, JSON.stringify(tickets, null, 2));
console.log(`\n✅ Tickets data saved to ${ticketsFile}`);

// Sprint allocation
console.log('\n📅 Sprint Allocation:');
console.log('Sprint 1-2 (Weeks 1-2): Stories 1.0, 1.1');
console.log('Sprint 3-4 (Weeks 3-4): Stories 1.2, 1.3');
console.log('Sprint 5-6 (Weeks 5-6): Stories 1.4, 1.5');
console.log('Sprint 7-8 (Weeks 7-8): Stories 1.6, 1.7');

console.log('\n🚀 Ready for distribution to development team!');
