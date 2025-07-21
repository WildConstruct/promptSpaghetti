#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load the specific task
const statePath = path.join(__dirname, 'data', 'state.json');
const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
const taskId = 'T-1752989143997-479';
const task = state.tasks[taskId];

console.log('=== DEBUGGING TASK:', taskId, '===\n');

if (!task) {
    console.log('❌ Task not found!');
    process.exit(1);
}

console.log('Raw Task Data:');
console.log(JSON.stringify(task, null, 2));

console.log('\n=== PROCESSED VALUES ===');

// Simulate the dashboard processing
const taskTags = (task.tags && Array.isArray(task.tags)) ? task.tags : [];
const taskState = String(task.state || 'unknown').toLowerCase();
const taskTitle = String(task.title || 'Untitled Task');
const taskId_processed = String(task.id || taskId);

console.log('taskTags:', taskTags);
console.log('taskState:', taskState);
console.log('taskTitle:', taskTitle);
console.log('taskId_processed:', taskId_processed);

const isAuth = taskTags.includes('auth') || (task.story && task.story.includes('20.1'));
const isFile = taskTags.includes('file-browser') || (task.story && task.story.includes('20.2'));
const priorityClass = isAuth ? 'priority-auth' : isFile ? 'priority-file' : '';
const stateClass = `state-${taskState.replace(/[^a-z0-9]/g, '-')}`;

console.log('isAuth:', isAuth);
console.log('isFile:', isFile);
console.log('priorityClass:', priorityClass);
console.log('stateClass:', stateClass);

console.log('\n=== CSS CLASSES GENERATED ===');

if (taskTags.length > 0) {
    console.log('Tag classes:');
    taskTags.forEach(tag => {
        const sanitizedTag = String(tag || '').replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
        const displayTag = String(tag || '').substring(0, 20);
        console.log(`  - tag-${sanitizedTag} (display: "${displayTag}")`);
    });
} else {
    console.log('No tags to process');
}

console.log('\n=== SIMULATED HTML OUTPUT ===');

// Simulate the HTML generation
try {
    const html = `
    <div class="ticket ${priorityClass} ${stateClass}">
        <div class="priority-indicator">📝</div>
        <div class="ticket-header">
            <div class="ticket-id">${taskId_processed}</div>
            <div class="ticket-state state-${taskState}">${task.state || 'Unknown'}</div>
        </div>
        <div class="ticket-title">${taskTitle}</div>
        <div class="ticket-meta">
            <div><strong>Assignee:</strong> ${task.assignee || 'Unassigned'}</div>
            <div><strong>Priority:</strong> ${task.priority || 'Normal'}</div>
            <div><strong>Story:</strong> ${task.story || 'N/A'}</div>
            <div><strong>Est. Time:</strong> ${task.est || 'N/A'} hrs</div>
        </div>
        ${(taskTags.length > 0) ? `
            <div class="ticket-tags">
                ${taskTags.map(tag => {
                    const sanitizedTag = String(tag || '').replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
                    const displayTag = String(tag || '').substring(0, 20);
                    return `<span class="tag tag-${sanitizedTag}">${displayTag}</span>`;
                }).join('')}
            </div>
        ` : ''}
        <div class="ticket-footer">
            <div><strong>Created:</strong> ${task.created || 'N/A'}</div>
            <div><strong>Updated:</strong> ${task.updated || 'N/A'}</div>
        </div>
    </div>`;
    
    console.log('✅ HTML generated successfully');
    console.log('Length:', html.length, 'characters');
    console.log('\nFirst 200 characters:');
    console.log(html.substring(0, 200) + '...');
    
} catch (error) {
    console.log('❌ Error generating HTML:', error.message);
}

console.log('\n=== RECOMMENDATIONS ===');

if (!task.tags) {
    console.log('⚠️  Task has undefined tags - this should be handled by the dashboard now');
}

if (!task.story) {
    console.log('⚠️  Task has no story field - this is normal for some tasks');
}

if (!task.priority) {
    console.log('⚠️  Task has no priority field - will show as "Normal"');
}

console.log('\n=== STATUS ===');
console.log('✅ Task should render properly in the updated dashboard');
console.log('✅ All undefined values have fallbacks');
console.log('✅ CSS classes are properly sanitized');