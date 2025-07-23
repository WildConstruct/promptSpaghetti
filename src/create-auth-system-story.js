#!/usr/bin/env node

/**
 * Create Authentication System Resource Allocation Story
 * 
 * Creates a comprehensive user story for consolidating authentication resources,
 * fixing conflicting assignments, and organizing the remaining work for systematic 
 * completion of the 80% complete authentication system.
 * 
 * Addresses QA findings that Authentication tasks (Priority 2) have conflicting 
 * assignments with resources scattered across non-existent agents while core
 * login/registration/protected routes work perfectly.
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

// Priority Story: Authentication System Resource Allocation
const authSystemStory = {
  title: 'Consolidate Authentication System Resources - Complete 80% Finished System',
  description: `Consolidate authentication system resources, fix conflicting assignments, and organize systematic completion of the 80% complete authentication system. QA has identified that Authentication tasks (Priority 2) have conflicting assignments with some auth tasks assigned to non-existent agents (test-agent-3) while OAuth, MFA, email integration await completion.

**Current Status:**
- ✅ COMPLETE - Core Authentication (Backend Infrastructure, Database Schema, API Endpoints, Frontend Components, Route Protection, State Management, Password Management)
- 🟡 PARTIALLY COMPLETE - Advanced Features (OAuth Integration, Multi-Factor Auth, User Profile Management)
- 🔴 MISSING - Production Polish (Email Services, Admin Dashboard, Production Config)

**Current Problems:**
- Authentication tasks assigned to non-existent agents (test-agent-3)
- 80% complete system stalled at final implementation phase
- OAuth, MFA, email integration waiting for completion with scattered resources
- Near-complete system blocked despite core login/registration/protected routes working perfectly
- Conflicting assignments preventing systematic completion

**Business Impact:**
- Near-complete authentication system stalled at production readiness
- Ready for production MVP but lacks final 2-3 days of advanced features
- Development resources inefficiently allocated across conflicting assignments
- Authentication system completion blocked by resource coordination issues`,
  
  estimate: '12 hours',
  priority: 'high',
  wipClass: 'authentication',
  epic: 'Authentication System',
  story: 'AUTH-SYSTEM-CONSOLIDATION',
  tags: ['authentication', 'oauth', 'mfa', 'email-integration', 'resource-allocation', 'production-ready'],
  
  acceptanceCriteria: [
    'All authentication tasks reassigned from non-existent agents to active developers',
    'OAuth Integration frontend provider configs completed (3-4 hours)',
    'Multi-Factor Authentication frontend integration completed (4-6 hours)',
    'User Profile Management polished and production-ready (2-3 hours)',
    'Email Services implemented with verification and password reset notifications (3-4 hours)',
    'Admin Dashboard user management interface completed (6-8 hours)',
    'Production Config with security headers and rate limiting configured (2-3 hours)',
    'Authentication system reaches 95% completion with production MVP readiness',
    'Consolidated authentication work completed under dedicated developer sprint'
  ],
  
  businessValue: 'Completes production-ready authentication system from 80% to 95% completion, enabling secure user management and access control for the entire application',
  
  // Break down into specific implementable tasks
  implementationTasks: [
    {
      title: 'Audit Authentication Task Assignments and Fix Conflicting Allocations',
      description: 'Comprehensive audit of all authentication task assignments to identify conflicting assignments, non-existent agents, and scattered resources preventing systematic completion',
      estimate: '1 hour',
      priority: 'critical',
      tags: ['audit', 'task-assignment', 'resource-allocation'],
      acceptance: [
        'Complete audit of all authentication task assignments and current status',
        'Identification of tasks assigned to non-existent agents (test-agent-3)',
        'Documentation of conflicting assignments and resource allocation issues',
        'Reassignment plan for consolidating authentication work under dedicated developer',
        'Clear mapping of 80% complete vs remaining 20% authentication work'
      ]
    },
    {
      title: 'Complete OAuth Integration Frontend Provider Configurations',
      description: 'Complete OAuth integration by implementing frontend provider configurations for Google, GitHub, and other OAuth providers. Backend is ready, frontend needs provider configs.',
      estimate: '4 hours',
      priority: 'high', 
      tags: ['oauth', 'frontend', 'provider-config', 'integration'],
      acceptance: [
        'OAuth provider configurations implemented for Google, GitHub, and Microsoft',
        'Frontend OAuth login buttons and flow integration completed',
        'OAuth callback handling and token management implemented',
        'OAuth user profile data mapping and account linking functional',
        'OAuth integration testing with real provider configurations'
      ]
    },
    {
      title: 'Complete Multi-Factor Authentication Frontend Integration',
      description: 'Complete MFA system by implementing frontend integration for TOTP, SMS, and email-based multi-factor authentication. Backend is complete, frontend integration needed.',
      estimate: '5 hours',
      priority: 'high',
      tags: ['mfa', 'totp', 'sms', 'email-mfa', 'frontend'],
      acceptance: [
        'TOTP (Time-based One-Time Password) frontend implementation with QR codes',
        'SMS-based MFA frontend flow with phone number verification',
        'Email-based MFA frontend integration with code verification',
        'MFA setup and management interface in user profile',
        'MFA enforcement for sensitive operations and admin access'
      ]
    },
    {
      title: 'Implement Email Services for Authentication System',
      description: 'Implement comprehensive email services including verification emails, password reset notifications, and account security alerts',
      estimate: '4 hours',
      priority: 'high',
      tags: ['email', 'verification', 'password-reset', 'notifications'],
      acceptance: [
        'Email verification system with templated verification emails',
        'Password reset email notifications with secure reset links',
        'Account security alert emails for login attempts and changes',
        'Email template system with branding and customization',
        'Email delivery monitoring and error handling'
      ]
    },
    {
      title: 'Polish User Profile Management System',
      description: 'Polish and complete user profile management system with comprehensive profile editing, security settings, and account management features',
      estimate: '3 hours',
      priority: 'medium',
      tags: ['profile', 'user-management', 'security-settings'],
      acceptance: [
        'Complete user profile editing interface with validation',
        'Security settings panel with password change and MFA management',
        'Account preferences and notification settings',
        'Profile picture upload and management',
        'Account deletion and data export functionality'
      ]
    },
    {
      title: 'Build Admin Dashboard for User Management',
      description: 'Create comprehensive admin dashboard for user management, role administration, and system monitoring',
      estimate: '7 hours',
      priority: 'medium',
      tags: ['admin', 'dashboard', 'user-management', 'roles'],
      acceptance: [
        'User management interface with search, filter, and bulk operations',
        'Role and permission management system with RBAC controls',
        'Authentication system monitoring and analytics dashboard',
        'Admin tools for password resets, account unlocking, and user impersonation',
        'System health monitoring for authentication services'
      ]
    },
    {
      title: 'Configure Production Security Settings and Rate Limiting',
      description: 'Configure production-ready security settings including security headers, rate limiting, and authentication hardening',
      estimate: '2 hours',
      priority: 'high',
      tags: ['production', 'security', 'rate-limiting', 'hardening'],
      acceptance: [
        'Production security headers configured (CSRF, XSS, HSTS)',
        'Rate limiting implemented for login attempts and API endpoints',
        'Authentication session security hardening',
        'Production environment configuration validation',
        'Security audit and penetration testing preparation'
      ]
    }
  ]
};

// Utility functions
function generateTaskId(prefix = 'STORY') {
  const timestamp = Date.now().toString().slice(-6);
  const random = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

async function loadCurrentState() {
  const stateFile = path.join(__dirname, 'data/state.json');
  
  try {
    const stateData = await fs.readFile(stateFile, 'utf8');
    return JSON.parse(stateData);
  } catch (error) {
    // Create new state if file doesn't exist
    return {
      tasks: {},
      stories: {},
      metadata: {
        created: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      }
    };
  }
}

async function saveState(state) {
  const stateFile = path.join(__dirname, 'data/state.json');
  await fs.writeFile(stateFile, JSON.stringify(state, null, 2));
}

function storyExists(state, title) {
  return Object.values(state.stories || {}).some(story => 
    story.title && story.title.toLowerCase() === title.toLowerCase()
  );
}

function createStoryObject(storyDef, storyId) {
  return {
    id: storyId,
    title: storyDef.title,
    description: storyDef.description,
    status: 'READY_FOR_TASKS',
    priority: storyDef.priority,
    estimate: storyDef.estimate,
    wipClass: storyDef.wipClass,
    epic: storyDef.epic,
    story: storyDef.story,
    tags: storyDef.tags,
    acceptanceCriteria: storyDef.acceptanceCriteria,
    businessValue: storyDef.businessValue,
    implementationTasks: storyDef.implementationTasks,
    assignee: 'Unassigned',
    created: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    metadata: {
      source: 'qa-analysis',
      category: 'authentication-consolidation',
      automated: true,
      priority_level: storyDef.priority === 'critical' ? 0 : storyDef.priority === 'high' ? 1 : 2,
      business_impact: 'high',
      completion_percentage: 80,
      production_readiness: 'near-complete',
      epic_category: 'Authentication System'
    }
  };
}

function createImplementationTasks(storyId, implementationTasks, state) {
  let createdTasks = [];
  
  implementationTasks.forEach((taskDef, index) => {
    const taskId = generateTaskId('TASK');
    
    const task = {
      id: taskId,
      title: taskDef.title,
      description: taskDef.description,
      state: 'UNASSIGNED',
      priority: taskDef.priority,
      estimate: taskDef.estimate,
      wipClass: 'authentication',
      epic: 'Authentication System',
      story: storyId,
      tags: taskDef.tags,
      acceptanceCriteria: taskDef.acceptance,
      dependencies: index === 0 ? [] : index < 2 ? [createdTasks[0].id] : [], // First task is audit, others can run in parallel after audit
      businessValue: 'Completes production-ready authentication system enabling secure user management',
      assignee: 'Unassigned',
      created: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      metadata: {
        source: 'story-breakdown',
        category: 'authentication-completion',
        automated: true,
        priority_level: taskDef.priority === 'critical' ? 0 : taskDef.priority === 'high' ? 1 : 2,
        parent_story: storyId,
        sequence_order: index + 1,
        completion_percentage: index === 0 ? 0 : 80, // First task is audit, others start from 80%
        production_impact: 'high',
        auth_component: taskDef.tags[0]
      }
    };
    
    state.tasks[taskId] = task;
    createdTasks.push(task);
  });
  
  return createdTasks;
}

async function createAuthSystemStory() {
  console.log('🔐 Creating Authentication System Resource Allocation Story...\n');
  console.log('📋 This addresses the authentication system resource consolidation:');
  console.log('   ISSUE: 80% complete auth system with conflicting assignments and scattered resources');
  console.log('   STATUS: Core login/registration/protected routes work perfectly');
  console.log('   SOLUTION: Consolidate resources and complete remaining OAuth, MFA, email integration\n');
  
  try {
    // Load current state
    let state = await loadCurrentState();
    
    if (!state.stories) {
      state.stories = {};
    }
    if (!state.tasks) {
      state.tasks = {};
    }
    
    let storiesCreated = 0;
    let tasksCreated = 0;
    
    // Check if story already exists
    if (storyExists(state, authSystemStory.title)) {
      console.log('⏭️  Story already exists - updating with latest requirements...');
    }
    
    const storyId = generateTaskId('STORY-AUTH-SYSTEM');
    const story = createStoryObject(authSystemStory, storyId);
    
    state.stories[storyId] = story;
    storiesCreated++;
    
    // Create implementation tasks
    console.log('📝 Creating Implementation Tasks...\n');
    
    const implementationTasks = createImplementationTasks(
      storyId, 
      authSystemStory.implementationTasks, 
      state
    );
    
    tasksCreated = implementationTasks.length;
    
    // Update state metadata
    if (!state.metadata) {
      state.metadata = {};
    }
    state.metadata.lastUpdated = new Date().toISOString();
    state.metadata.totalStories = Object.keys(state.stories).length;
    state.metadata.totalTasks = Object.keys(state.tasks).length;
    state.metadata.authSystemStoryCreated = storiesCreated;
    
    // Save updated state
    await saveState(state);
    
    console.log(`✅ Created Story: ${story.title}`);
    console.log(`   📊 Priority: ${story.priority} | ⏱️  Estimate: ${story.estimate}`);
    console.log(`   🔐 Business Value: ${story.businessValue}`);
    console.log('');
    
    // Show created implementation tasks
    implementationTasks.forEach((task, index) => {
      console.log(`✅ Created Task ${index + 1}: ${task.title}`);
      console.log(`   ID: ${task.id} | ⏱️  ${task.estimate} | 📊 ${task.priority} priority`);
      if (task.dependencies.length > 0) {
        console.log(`   🔗 Depends on: ${task.dependencies.join(', ')}`);
      }
      console.log('');
    });
    
    // Generate comprehensive summary
    console.log('📊 AUTHENTICATION SYSTEM CONSOLIDATION STORY SUMMARY\n');
    console.log('='.repeat(65));
    console.log(`✅ Stories Created: ${storiesCreated}`);
    console.log(`✅ Implementation Tasks Created: ${tasksCreated}`);
    console.log(`📋 Total Stories in System: ${Object.keys(state.stories).length}`);
    console.log(`📋 Total Tasks in System: ${Object.keys(state.tasks).length}\n`);
    
    // Show authentication system status
    console.log('🔐 AUTHENTICATION SYSTEM STATUS:\n');
    console.log('✅ COMPLETE (80% - Production Ready):');
    console.log('   • Backend Infrastructure - Complete auth service with JWT, rate limiting, audit logging');
    console.log('   • Database Schema - 15+ tables for users, roles, sessions, OAuth, MFA');
    console.log('   • API Endpoints - Full RESTful auth API with Zod validation');
    console.log('   • Frontend Components - LoginForm, AuthProvider, PrivateRoute, RouteGuard');
    console.log('   • Route Protection - Role-based access control (RBAC) working');
    console.log('   • State Management - Zustand store with JWT token persistence');
    console.log('   • Password Management - Reset, strength validation, rotation\n');
    
    console.log('🟡 PARTIALLY COMPLETE (Need 2-3 days):');
    console.log('   • OAuth Integration - Backend ready, frontend needs provider configs (3-4 hours)');
    console.log('   • Multi-Factor Auth - Backend complete, frontend integration needed (4-6 hours)');
    console.log('   • User Profile Management - Basic functionality exists, needs polish (2-3 hours)\n');
    
    console.log('🔴 MISSING (Production Polish):');
    console.log('   • Email Services - Verification emails, password reset notifications (3-4 hours)');
    console.log('   • Admin Dashboard - User management interface (6-8 hours)');
    console.log('   • Production Config - Security headers, rate limiting config (2-3 hours)\n');
    
    // Show business impact
    console.log('💰 BUSINESS IMPACT:\n');
    console.log('🎯 PROBLEM SOLVED:');
    console.log('   • Consolidates scattered authentication resources under dedicated developer');
    console.log('   • Fixes conflicting assignments and non-existent agent allocations');
    console.log('   • Completes 80% finished authentication system to 95% production ready');
    console.log('   • Enables secure user management for entire application platform\n');
    
    console.log('📈 EXPECTED OUTCOMES:');
    console.log('   • Production-ready authentication system with OAuth, MFA, and email integration');
    console.log('   • Complete admin dashboard for user and role management');
    console.log('   • Hardened security configuration ready for production deployment');
    console.log('   • Systematic completion of authentication work within 2-3 day sprint\n');
    
    // Show implementation sequence
    console.log('🔄 IMPLEMENTATION SEQUENCE:\n');
    implementationTasks.forEach((task, index) => {
      const timelinePhase = index === 0 ? 'AUDIT PHASE' : 
        index <= 3 ? 'CORE COMPLETION PHASE' : 
          'POLISH & PRODUCTION PHASE';
      console.log(`${index + 1}. ${task.title} (${task.estimate}) - ${timelinePhase}`);
      console.log(`   🎯 ${task.acceptanceCriteria[0]}`);
    });
    console.log('');
    
    // Resource allocation analysis
    console.log('📊 RESOURCE ALLOCATION ANALYSIS:\n');
    console.log('🚨 Current Issues:');
    console.log('   • Authentication tasks assigned to non-existent agents (test-agent-3)');
    console.log('   • OAuth, MFA, email integration work scattered across multiple incomplete assignments');
    console.log('   • Near-complete system stalled at final implementation phase');
    console.log('   • Core functionality complete but advanced features fragmented\n');
    
    console.log('✅ Consolidation Strategy:');
    console.log('   • Reassign all authentication tasks to dedicated developer for 2-3 day sprint');
    console.log('   • Prioritize OAuth and MFA frontend integration (highest user value)');
    console.log('   • Complete email services and admin dashboard for production readiness');
    console.log('   • Configure production security settings for deployment\n');
    
    // Agent instructions
    console.log('🤖 NEXT STEPS FOR AGENTS:\n');
    console.log('1. 🔧 Development Agent should grab these authentication consolidation tasks:');
    console.log(`   node src/grab-tasks.js <agent-id> 7 --story=${storyId}`);
    console.log('2. 📊 Start with authentication task assignment audit and resource reallocation');
    console.log('3. 🔐 Focus on OAuth provider configuration and MFA frontend integration');
    console.log('4. 📧 Implement email services for verification and password reset workflows');
    console.log('5. 👥 Build admin dashboard for user management and system monitoring');
    console.log('6. 🔒 Configure production security settings and rate limiting\n');
    
    console.log('🎯 CRITICAL SUCCESS FACTORS:');
    console.log('   • Dedicated developer assignment for systematic completion');
    console.log('   • Focus on user-facing features (OAuth, MFA) before admin tools');
    console.log('   • Production security hardening as final deployment preparation');
    console.log('   • 80% → 95% completion within dedicated 2-3 day sprint\n');
    
    console.log('🚀 PRODUCTION READINESS TIMELINE:');
    console.log('   Day 1: Resource audit + OAuth/MFA frontend completion');
    console.log('   Day 2: Email services + User profile polish + Admin dashboard start');
    console.log('   Day 3: Admin dashboard completion + Production config + Security hardening');
    console.log('   Result: Production-ready authentication system with 95% feature completion');
    
    return {
      story: story,
      tasks: implementationTasks,
      created: storiesCreated,
      tasksCreated: tasksCreated,
      total: Object.keys(state.tasks).length
    };
    
  } catch (error) {
    console.error('❌ Failed to create authentication system story:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  createAuthSystemStory().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { 
  createAuthSystemStory, 
  authSystemStory 
};