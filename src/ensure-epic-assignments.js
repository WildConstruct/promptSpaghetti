#!/usr/bin/env node

/**
 * Ensure Epic Assignments for Future Task Creation
 * This script creates a standardized function for all task creation workflows
 * to use proper epic assignments going forward.
 */

const fs = require('fs');
const path = require('path');

/**
 * Determine epic assignment based on task content
 * @param {Object} task - Task object with title, description, tags, etc.
 * @returns {Object} - Epic assignment data
 */
function determineEpicAssignment(task) {
  const title = (task.title || '').toLowerCase();
  const description = (task.description || '').toLowerCase();
  const tags = task.tags || [];
  const content = title + ' ' + description + ' ' + tags.join(' ');
  
  // Authentication (Story 20.1) detection
  const authKeywords = ['auth', 'login', 'register', 'password', 'jwt', 'token', 'session', 
    'signin', 'signup', 'oauth', 'totp', 'mfa', 'authentication', 
    'user management', 'account', 'credential'];
  
  if (authKeywords.some(keyword => content.includes(keyword))) {
    return {
      story: '20.1',
      tags: [...(tags || []), 'auth'].filter((tag, index, arr) => arr.indexOf(tag) === index),
      metadata: {
        epic: 'Authentication System',
        priority: 'critical'
      }
    };
  }
  
  // File Browser (Story 20.2) detection  
  const fileKeywords = ['file browser', 'project', 'save', 'load', 'import', 'export',
    'file management', 'project management', 'recent files', 
    'file preview', 'drag drop', 'upload', 'download'];
  
  if (fileKeywords.some(keyword => content.includes(keyword)) && 
      !content.includes('privacy') && !content.includes('policy')) {
    return {
      story: '20.2',
      tags: [...(tags || []), 'file-browser'].filter((tag, index, arr) => arr.indexOf(tag) === index),
      metadata: {
        epic: 'File Browser System',
        priority: 'critical'
      }
    };
  }
  
  // Epic 19 (Privacy/Compliance) detection
  const privacyKeywords = ['privacy', 'compliance', 'gdpr', 'policy', 'audit', 
    'iso 27001', 'security policy', 'data protection',
    'privacy policy', 'compliance framework', 'regulatory'];
  
  if (privacyKeywords.some(keyword => content.includes(keyword))) {
    return {
      story: '19',
      tags: [...(tags || []), 'privacy', 'compliance'].filter((tag, index, arr) => arr.indexOf(tag) === index),
      metadata: {
        epic: 'Privacy & Compliance Framework',
        priority: 'low' // Deprioritized per IMMEDIATE-PRIORITIES.md
      }
    };
  }
  
  // Epic 7 (Advanced Nodes) detection
  const advancedKeywords = ['weighted', 'conditional', 'sequential', 'markov', 
    'advanced node', 'runtime node', 'node type'];
  
  if (advancedKeywords.some(keyword => content.includes(keyword))) {
    return {
      story: '7',
      tags: [...(tags || []), 'advanced-nodes'].filter((tag, index, arr) => arr.indexOf(tag) === index),
      metadata: {
        epic: 'Advanced Node Capabilities',
        priority: 'medium'
      }
    };
  }
  
  // Epic 3 (Export System) detection
  const exportKeywords = ['export', 'generator bundle', 'png', 'pdf', 'yaml', 'xml'];
  
  if (exportKeywords.some(keyword => content.includes(keyword)) && 
      !content.includes('privacy')) {
    return {
      story: '3',
      tags: [...(tags || []), 'export'].filter((tag, index, arr) => arr.indexOf(tag) === index),
      metadata: {
        epic: 'Export System',
        priority: 'medium'
      }
    };
  }
  
  // Default for unclassified tasks
  return {
    story: 'Other',
    tags: tags || [],
    metadata: {
      epic: 'Other',
      priority: 'normal'
    }
  };
}

/**
 * Apply epic assignment to a task object
 * @param {Object} task - Task object to enhance
 * @returns {Object} - Enhanced task with epic assignments
 */
function applyEpicAssignment(task) {
  const epicData = determineEpicAssignment(task);
  
  return {
    ...task,
    story: epicData.story,
    tags: epicData.tags,
    metadata: {
      ...(task.metadata || {}),
      ...epicData.metadata,
      epic_assigned: true,
      epic_assignment_date: new Date().toISOString()
    }
  };
}

/**
 * Validate that a task has proper epic assignments
 * @param {Object} task - Task to validate
 * @returns {boolean} - True if properly assigned
 */
function hasProperEpicAssignment(task) {
  return !!(
    task.story && 
    task.tags && 
    Array.isArray(task.tags) && 
    task.metadata && 
    task.metadata.epic
  );
}

module.exports = {
  determineEpicAssignment,
  applyEpicAssignment,
  hasProperEpicAssignment
};

console.log('✅ Epic assignment utilities loaded');
console.log('📋 Functions available: determineEpicAssignment, applyEpicAssignment, hasProperEpicAssignment');
console.log('🎯 All future task creation should use these utilities for consistent epic assignments');