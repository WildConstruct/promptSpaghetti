#!/usr/bin/env node

/**
 * Simple ticket creation script for Authentication Frontend Integration Epic
 * Creates tickets via GitHub automation script
 */

const { execSync } = require('child_process');
const fs = require('fs');

// Create a ticket using the github automation script
function createTicketViaScript(title: string, description: string, priority: string = 'medium'): string | null {
  try {
    // Escape quotes in the description
    const escapedTitle = title.replace(/"/g, '\\"');
    const escapedDescription = description.replace(/"/g, '\\"');
    
    console.log(`Creating: ${title.substring(0, 60)}...`);
    
    const result = execSync(
      `./scripts/github-automation.sh create-ticket "${escapedTitle}" "${escapedDescription}" "${priority}" "epic-task-generator"`,
      { 
        encoding: 'utf8',
        cwd: '/Users/brianbehm/CascadeProjects/prompt-spaghetti'
      }
    );
    
    // Extract ticket ID from output
    const match = result.match(/✓ Ticket created: (TICKET-\d+)/);
    if (match) {
      console.log(`✓ Created: ${match[1]}`);
      return match[1];

    
    return null;
 catch (error) {
    console.error(`✗ Failed to create ticket: ${error.message}`);
    return null;



// Authentication Frontend Integration Epic Tasks Summary
const taskSummary = {
  'Story 1: React Router Setup and Authentication Pages': [
    // Phase 1: Dependencies & Setup
    { title: 'AUTH-S1-P1-1: Install React Router v6 dependency', priority: 'high' },
    { title: 'AUTH-S1-P1-2: Install React Router type definitions', priority: 'high' },
    { title: 'AUTH-S1-P1-3: Update package.json and verify no version conflicts', priority: 'medium' },
    { title: 'AUTH-S1-P1-4: Create directory structure for auth pages', priority: 'medium' },
    
    // Phase 2: Router Configuration  
    { title: 'AUTH-S1-P2-5: Configure BrowserRouter in App.tsx', priority: 'high' },
    { title: 'AUTH-S1-P2-6: Define route structure with Routes/Route components', priority: 'high' },
    { title: 'AUTH-S1-P2-7: Create route constants file', priority: 'medium' },
    { title: 'AUTH-S1-P2-8: Replace tab system with route navigation', priority: 'high' },
    
    // Phase 3: Authentication Pages
    { title: 'AUTH-S1-P3-9: Create LoginPage.tsx component', priority: 'high' },
    { title: 'AUTH-S1-P3-10: Create RegisterPage.tsx component', priority: 'high' },
    { title: 'AUTH-S1-P3-11: Create DashboardPage.tsx component', priority: 'high' },
    { title: 'AUTH-S1-P3-12: Integrate LoginForm into LoginPage', priority: 'high' },
    { title: 'AUTH-S1-P3-13: Integrate RegistrationForm into RegisterPage', priority: 'high' },
    
    // Phase 4: Protected Routes
    { title: 'AUTH-S1-P4-14: Create ProtectedRoute.tsx component', priority: 'high' },
    { title: 'AUTH-S1-P4-15: Implement route guard logic', priority: 'high' },
    { title: 'AUTH-S1-P4-16: Apply ProtectedRoute to dashboard routes', priority: 'high' },
    { title: 'AUTH-S1-P4-17: Configure redirect logic for unauthenticated users', priority: 'high' },
    
    // Phase 5: Navigation Integration
    { title: 'AUTH-S1-P5-18: Update navigation to use useNavigate hook', priority: 'high' },
    { title: 'AUTH-S1-P5-19: Complete tab-to-route navigation replacement', priority: 'high' },
    { title: 'AUTH-S1-P5-20: Verify GraphEditor renders at /dashboard route', priority: 'high' },
    { title: 'AUTH-S1-P5-21: Preserve LLM Randomizer accessibility', priority: 'medium' },
    
    // Phase 6: Testing & Validation
    { title: 'AUTH-S1-P6-22: Test all route transitions', priority: 'high' },
    { title: 'AUTH-S1-P6-23: Verify graph editor functionality preserved', priority: 'high' },
    { title: 'AUTH-S1-P6-24: Test protected route redirects', priority: 'high' },
    { title: 'AUTH-S1-P6-25: Validate TypeScript compilation', priority: 'medium' },
    { title: 'AUTH-S1-P6-26: Test responsive design across auth pages', priority: 'medium' }
  ],
  
  'Story 2: Authentication State Management and Navigation Integration': [
    // Phase 1: Authentication Context Setup
    { title: 'AUTH-S2-P1-1: Create AuthContext.tsx file', priority: 'high' },
    { title: 'AUTH-S2-P1-2: Define AuthUser interface and AuthState types', priority: 'high' },
    { title: 'AUTH-S2-P1-3: Implement AuthProvider component', priority: 'high' },
    { title: 'AUTH-S2-P1-4: Create useAuth custom hook', priority: 'high' },
    { title: 'AUTH-S2-P1-5: Add AuthProvider to App.tsx', priority: 'high' },
    
    // Phase 2: Backend API Integration
    { title: 'AUTH-S2-P2-6: Create authService.ts for API calls', priority: 'high' },
    { title: 'AUTH-S2-P2-7: Implement login API call function', priority: 'high' },
    { title: 'AUTH-S2-P2-8: Implement logout API call function', priority: 'high' },
    { title: 'AUTH-S2-P2-9: Implement session validation API', priority: 'high' },
    { title: 'AUTH-S2-P2-10: Configure HTTP client for auth endpoints', priority: 'medium' },
    
    // Phase 3: Session Persistence
    { title: 'AUTH-S2-P3-11: Implement localStorage token utilities', priority: 'high' },
    { title: 'AUTH-S2-P3-12: Add session persistence to AuthContext', priority: 'high' },
    { title: 'AUTH-S2-P3-13: Create session restoration logic', priority: 'high' },
    { title: 'AUTH-S2-P3-14: Implement automatic token refresh', priority: 'medium' },
    { title: 'AUTH-S2-P3-15: Add session expiration detection', priority: 'high' },
    
    // Phase 4: Navigation UI Components
    { title: 'AUTH-S2-P4-16: Create UserMenu.tsx dropdown component', priority: 'high' },
    { title: 'AUTH-S2-P4-17: Create AuthButtons.tsx component', priority: 'high' },
    { title: 'AUTH-S2-P4-18: Integrate UserMenu into main header', priority: 'high' },
    { title: 'AUTH-S2-P4-19: Add conditional rendering by auth state', priority: 'high' },
    { title: 'AUTH-S2-P4-20: Style navigation components consistently', priority: 'medium' },
    
    // Phase 5: State Integration
    { title: 'AUTH-S2-P5-21: Connect auth state to protected routes', priority: 'high' },
    { title: 'AUTH-S2-P5-22: Update ProtectedRoute to use AuthContext', priority: 'high' },
    { title: 'AUTH-S2-P5-23: Integrate auth state with graphStore if needed', priority: 'medium' },
    { title: 'AUTH-S2-P5-24: Ensure auth state updates trigger re-renders', priority: 'high' },
    { title: 'AUTH-S2-P5-25: Add loading states for auth operations', priority: 'medium' },
    
    // Phase 6: Error Handling & UX
    { title: 'AUTH-S2-P6-26: Implement error handling for network failures', priority: 'high' },
    { title: 'AUTH-S2-P6-27: Add user feedback for authentication errors', priority: 'high' },
    { title: 'AUTH-S2-P6-28: Create session expiration warnings', priority: 'medium' },
    { title: 'AUTH-S2-P6-29: Test authentication flow end-to-end', priority: 'high' },
    { title: 'AUTH-S2-P6-30: Validate auth state persistence across refresh', priority: 'high' }
  ],
  
  'Story 3: SMTP Configuration and Email Verification Flow': [
    // Phase 1: SMTP Service Setup
    { title: 'AUTH-S3-P1-1: Choose and configure SMTP provider', priority: 'high' },
    { title: 'AUTH-S3-P1-2: Create SMTP account and obtain credentials', priority: 'high' },
    { title: 'AUTH-S3-P1-3: Add SMTP config to environment variables', priority: 'high' },
    { title: 'AUTH-S3-P1-4: Update server config for email service', priority: 'medium' },
    { title: 'AUTH-S3-P1-5: Test SMTP connection and basic sending', priority: 'high' },
    
    // Phase 2: Backend Email Service Configuration
    { title: 'AUTH-S3-P2-6: Update EmailService.ts with SMTP config', priority: 'high' },
    { title: 'AUTH-S3-P2-7: Implement actual email sending functionality', priority: 'high' },
    { title: 'AUTH-S3-P2-8: Add email template rendering', priority: 'high' },
    { title: 'AUTH-S3-P2-9: Implement email delivery status tracking', priority: 'medium' },
    { title: 'AUTH-S3-P2-10: Add rate limiting to email sending', priority: 'medium' },
    
    // Phase 3: Email Verification Pages
    { title: 'AUTH-S3-P3-11: Create EmailVerificationPage.tsx', priority: 'high' },
    { title: 'AUTH-S3-P3-12: Implement email verification token validation', priority: 'high' },
    { title: 'AUTH-S3-P3-13: Add email verification status checking', priority: 'high' },
    { title: 'AUTH-S3-P3-14: Create resend verification email functionality', priority: 'high' },
    { title: 'AUTH-S3-P3-15: Style email verification pages', priority: 'medium' },
    
    // Phase 4: Registration Flow Integration
    { title: 'AUTH-S3-P4-16: Update registration to trigger email verification', priority: 'high' },
    { title: 'AUTH-S3-P4-17: Modify registration success page instructions', priority: 'high' },
    { title: 'AUTH-S3-P4-18: Update AuthContext for verification status', priority: 'high' },
    { title: 'AUTH-S3-P4-19: Add verification status to user profile', priority: 'medium' },
    { title: 'AUTH-S3-P4-20: Implement post-verification welcome flow', priority: 'medium' },
    
    // Phase 5: Email Templates & Content
    { title: 'AUTH-S3-P5-21: Design professional verification email template', priority: 'high' },
    { title: 'AUTH-S3-P5-22: Create welcome email template', priority: 'medium' },
    { title: 'AUTH-S3-P5-23: Implement email template variables', priority: 'medium' },
    { title: 'AUTH-S3-P5-24: Add company branding to templates', priority: 'medium' },
    { title: 'AUTH-S3-P5-25: Test email rendering across clients', priority: 'medium' },
    
    // Phase 6: Error Handling & Monitoring
    { title: 'AUTH-S3-P6-26: Implement email error handling', priority: 'high' },
    { title: 'AUTH-S3-P6-27: Add email delivery logging and monitoring', priority: 'medium' },
    { title: 'AUTH-S3-P6-28: Create fallback mechanisms for outages', priority: 'medium' },
    { title: 'AUTH-S3-P6-29: Test complete registration to activation flow', priority: 'high' },
    { title: 'AUTH-S3-P6-30: Validate email verification across providers', priority: 'medium' }
  ]
};

// Create description for a task
function createTaskDescription(title: string, storyPhase: string): string {
  return `Task: ${title}

Epic: Authentication Frontend Integration  
Story: ${storyPhase.split(' - ')[0]}
Phase: ${storyPhase.split(' - ')[1] || 'Implementation'}

This task is part of the comprehensive Authentication Frontend Integration Epic that enables user authentication and account management by integrating existing authentication components into the main application.

Acceptance Criteria:
- Task completed according to epic requirements
- No regression in existing functionality
- TypeScript compilation successful
- Code follows existing patterns
- Proper error handling implemented
- Testing completed for changes

Dependencies:
- Completion depends on prior tasks in the same phase
- Integration with existing authentication backend APIs
- Compatibility with existing graph editor functionality

Epic Context:
This task contributes to enabling users to register, login, and access personalized features while maintaining full compatibility with the existing graph editor functionality. The epic spans React Router setup, authentication state management, and email verification flow.

Please refer to docs/epics/epic-authentication-frontend-integration.md for detailed implementation requirements.`;


console.log('=== Creating Authentication Frontend Integration Epic Tasks ===\n');

let totalTasks = 0;
let successCount = 0;
let failureCount = 0;

// Create tickets for each story
for (const [storyName, tasks] of Object.entries(taskSummary)) {
  console.log(`\n--- ${storyName} ---`);
  console.log(`Creating ${tasks.length} tasks...\n`);
  
  for (const task of (tasks as any[])) {
    totalTasks++;
    const description = createTaskDescription(task.title, storyName);
    const ticketId = createTicketViaScript(task.title, description, task.priority);
    
    if (ticketId) {
      successCount++;
 else {
      failureCount++;

    
    // Small delay to avoid overwhelming the system
    execSync('sleep 0.1');



console.log('\n=== Task Creation Complete ===');
console.log(`Total tasks: ${totalTasks}`);
console.log(`Successfully created: ${successCount}`);
console.log(`Failed: ${failureCount}`);

if (successCount > 0) {
  console.log(`\n✓ ${successCount} development tasks created for Authentication Frontend Integration Epic`);
  console.log('\nEpic Summary:');
  console.log('- Story 1: React Router Setup and Authentication Pages (26 tasks)');
  console.log('- Story 2: Authentication State Management and Navigation Integration (30 tasks)');
  console.log('- Story 3: SMTP Configuration and Email Verification Flow (30 tasks)');
  console.log('\nAll tasks are now available in the ticket system with UNASSIGNED status.');
  console.log('Developers can grab tasks using the task management system.');
