#!/usr/bin/env node

/**
 * Import Epic 1 tickets from epic1-tickets.json into the task management system
 */

const fs = require('fs').promises;
const path = require('path');
const { StateLock } = require('./src/utils/StateLock');

async function importEpic1Tickets() {
  console.log('🎫 Importing Epic 1 Tickets into Task System\n');

  try {
    // Load Epic 1 tickets
    const ticketsPath = path.join(__dirname, 'epic1-tickets.json');
    const ticketsData = await fs.readFile(ticketsPath, 'utf8');
    const tickets = JSON.parse(ticketsData);

    console.log(`Found ${tickets.length} Epic 1 tickets to import\n`);

    // Initialize StateLock
    const stateLock = new StateLock();

    // Convert tickets to task format and add to state
    const results = await stateLock.transaction(state => {
      if (!state.tasks) state.tasks = {};

      const addedTasks = [];
      const existingTasks = [];

      for (const ticket of tickets) {
        // Convert ticket to task format
        const task = {
          id: ticket.id,
          title: ticket.title,
          description: ticket.description,
          epic: ticket.epic,
          story: ticket.story_id,
          priority:
            ticket.priority === 'CRITICAL'
              ? 1
              : ticket.priority === 'HIGH'
                ? 2
                : ticket.priority === 'MEDIUM'
                  ? 3
                  : 4,
          est: ticket.estimated_hours,
          wip_class: 'FEAT',
          tags: ticket.tags.split(',').concat(['epic-1', 'brownfield-rebuild']),
          state: 'UNASSIGNED',
          created: ticket.created_at,
          updated: ticket.created_at,
          source: 'epic1-tickets.json',
          category: 'foundation',
          metadata: JSON.parse(ticket.metadata)
        };

        // Check if task already exists
        if (state.tasks[task.id]) {
          existingTasks.push(task);
        } else {
          state.tasks[task.id] = task;
          addedTasks.push(task);
        }
      }

      return { addedTasks, existingTasks };
    });

    // Display results
    console.log('✅ Import Complete!\n');
    console.log(`📊 Summary:`);
    console.log(`   - Tasks imported: ${results.addedTasks.length}`);
    console.log(`   - Already existed: ${results.existingTasks.length}`);
    console.log(`   - Total Epic 1 tasks: ${tickets.length}`);

    if (results.addedTasks.length > 0) {
      console.log(`\n🆔 Imported Tasks:`);
      results.addedTasks.forEach(task => {
        console.log(`   ${task.id}: ${task.title} (${task.est}h)`);
      });
    }

    if (results.existingTasks.length > 0) {
      console.log(`\n⚠️  Already existed (skipped):`);
      results.existingTasks.forEach(task => {
        console.log(`   ${task.id}: ${task.title}`);
      });
    }

    console.log(
      '\n🚀 Epic 1 tasks are now available in the task management system!'
    );
    console.log('   Use "node src/monitor-available-tasks.js" to see them');
    console.log(
      '   Use "node src/grab-tasks.js <agent-id> 2 --epic=1" to grab Epic 1 tasks'
    );
  } catch (error) {
    console.error('❌ Import failed:', error.message);
    process.exit(1);
  }
}

// Run the import
importEpic1Tickets();
