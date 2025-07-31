'use strict';
// src/core/projector.ts
// Project events into Discord messages
Object.defineProperty(exports, '__esModule', { value: true });
exports.projectEvent = projectEvent;
exports.batchProject = batchProject;
exports.shouldBatch = shouldBatch;
exports.getChannelForEvent = getChannelForEvent;
/**
 * Project an event into Discord message(s)
 * Returns null if no Discord message should be sent
 */
function projectEvent(ev) {
  switch (ev.type) {
    case 'STORY_CREATED':
      return {
        channel: '#backlog',
        embed: {
          title: '📋 New Story Created',
          description: ev.payload.story.title,
          color: 0x3498db,
          fields: [
            { name: 'ID', value: ev.payload.story.id, inline: true },
            { name: 'Priority', value: String(ev.payload.story.priority), inline: true },
            { name: 'Created by', value: ev.actor, inline: true },
            { name: 'Acceptance Criteria', value: ev.payload.story.acceptance.join('\n') || 'None' },
          ],
        },
      };
    case 'TASK_CREATED':
      return {
        channel: '#dev-board',
        content: `📌 **New Task:** ${ev.payload.task.title} (${ev.payload.task.id}) - Est: ${ev.payload.task.est}h`,
      };
    case 'TASK_ASSIGNED':
      return {
        channel: '#dev-inbox',
        content: `📨 **Task Assigned:** ${ev.payload.task_id} → **${ev.payload.assignee}**`,
      };
    case 'TASK_STARTED':
      return {
        channel: '#dev-board',
        content: `🚀 **Started:** ${ev.payload.task_id} by ${ev.actor}`,
      };
    case 'TASK_MOVED_TO_REVIEW':
      return {
        channel: '#review-queue',
        embed: {
          title: '🔍 Task Ready for Review',
          description: `Task ${ev.payload.task_id} is ready for review`,
          color: 0x9b59b6,
          fields: [
            { name: 'Developer', value: ev.actor, inline: true },
            { name: 'Time', value: new Date().toLocaleTimeString(), inline: true },
          ],
        },
      };
    case 'TASK_ACCEPTED':
      return {
        channel: '#dev-board',
        content: `✅ **Accepted:** ${ev.payload.task_id} by ${ev.actor}`,
      };
    case 'TASK_REJECTED':
      return {
        channel: '#dev-board',
        embed: {
          title: '❌ Task Rejected',
          description: `Task ${ev.payload.task_id} needs more work`,
          color: 0xe74c3c,
          fields: [
            { name: 'Reason', value: ev.payload.reason },
            { name: 'Reviewer', value: ev.actor },
          ],
        },
      };
    case 'TASK_STUCK':
      return {
        channel: '#alerts',
        embed: {
          title: '⚠️ Task Stuck',
          description: `Task ${ev.payload.task_id} is stuck and needs attention`,
          color: 0xf39c12,
          fields: [
            { name: 'Reason', value: ev.payload.reason },
            { name: 'Detected by', value: ev.actor },
          ],
        },
      };
    case 'PHASE_CHANGED':
      return {
        channel: '#announcements',
        embed: {
          title: '🔄 Phase Changed',
          description: `Sprint phase changed to **${ev.payload.phase}**`,
          color: 0x2ecc71,
          fields: [
            { name: 'Cycle', value: String(ev.payload.cycle || 'Current'), inline: true },
            { name: 'Changed by', value: ev.actor, inline: true },
          ],
        },
      };
    case 'METRICS_PUBLISHED':
      const metric = ev.payload.metric;
      return {
        channel: '#metrics',
        embed: {
          title: '📊 Cycle Metrics',
          description: `Metrics for cycle ${metric.cycle}`,
          color: 0x1abc9c,
          fields: [
            { name: 'Lead Time', value: `${metric.lead_time_avg.toFixed(1)}h`, inline: true },
            { name: 'Throughput', value: String(metric.throughput), inline: true },
            { name: 'Blockers', value: String(metric.blockers), inline: true },
            { name: 'Rejected', value: String(metric.rejected), inline: true },
          ],
        },
      };
    case 'ERROR_FLAGGED':
      return {
        channel: '#alerts',
        embed: {
          title: '🚨 Error Detected',
          description: ev.payload.message || 'An error occurred',
          color: 0xe74c3c,
          fields: [
            { name: 'Actor', value: ev.actor },
            { name: 'Details', value: JSON.stringify(ev.payload.details || {}, null, 2).substring(0, 1000) },
          ],
        },
      };
    case 'SYSTEM_HEARTBEAT':
      // Don't project heartbeats to Discord
      return null;
    case 'INIT_SNAPSHOT':
      // Don't project snapshots to Discord
      return null;
    default:
      console.warn(`No projection defined for event type: ${ev.type}`);
      return null;
  }
}
/**
 * Batch multiple events into a single Discord message
 * Useful for reducing spam when many events happen quickly
 */
function batchProject(events) {
  if (events.length === 0) return null;
  // Group by type
  const byType = {};
  events.forEach(ev => {
    if (!byType[ev.type]) byType[ev.type] = [];
    byType[ev.type].push(ev);
  });
  // Special handling for multiple assignments
  if (byType['TASK_ASSIGNED'] && byType['TASK_ASSIGNED'].length > 1) {
    const assignments = byType['TASK_ASSIGNED'];
    const assignmentMap = {};
    assignments.forEach(ev => {
      const assignee = ev.payload.assignee;
      if (!assignmentMap[assignee]) assignmentMap[assignee] = [];
      assignmentMap[assignee].push(ev.payload.task_id);
    });
    const fields = Object.entries(assignmentMap).map(([dev, tasks]) => ({
      name: dev,
      value: tasks.join(', '),
      inline: true,
    }));
    return {
      channel: '#dev-inbox',
      embed: {
        title: '📨 Batch Task Assignment',
        description: `${assignments.length} tasks assigned`,
        color: 0x3498db,
        fields,
      },
    };
  }
  // Default: just project the first event
  return projectEvent(events[0]);
}
/**
 * Determine if an event should be projected immediately or batched
 */
function shouldBatch(ev) {
  const batchableTypes = ['TASK_ASSIGNED', 'TASK_CREATED', 'TASK_STARTED'];
  return batchableTypes.includes(ev.type);
}
/**
 * Get the appropriate Discord channel for an event type
 */
function getChannelForEvent(ev) {
  const channelMap = {
    STORY_CREATED: '#backlog',
    STORY_UPDATED: '#backlog',
    TASK_CREATED: '#dev-board',
    TASK_ASSIGNED: '#dev-inbox',
    TASK_STARTED: '#dev-board',
    TASK_MOVED_TO_REVIEW: '#review-queue',
    TASK_ACCEPTED: '#dev-board',
    TASK_REJECTED: '#dev-board',
    TASK_STUCK: '#alerts',
    TASK_UNBLOCKED: '#dev-board',
    PHASE_CHANGED: '#announcements',
    METRICS_PUBLISHED: '#metrics',
    ERROR_FLAGGED: '#alerts',
    SYSTEM_HEARTBEAT: '#system',
    INIT_SNAPSHOT: '#system',
  };
  return channelMap[ev.type] || '#general';
}
//# sourceMappingURL=projector.js.map
