#!/usr/bin/env node

/**
 * Script to create development tasks for Authentication Frontend Integration Epic
 * Based on the detailed epic requirements in docs/epics/epic-authentication-frontend-integration.md
 */

const API_URL = 'http://localhost:8000/api';

// Story 1: React Router Setup and Authentication Pages (Steps 1-30)
const story1Tasks = [
  // Phase 1: Dependencies & Setup (Steps 1-4)
  {
    title: 'AUTH-STORY1-P1-1: Install React Router v6 dependency',
    description: 'Install React Router v6 dependency using npm install react-router-dom\n\nAcceptance Criteria:\n- React Router v6 successfully installed\n- No version conflicts with existing dependencies\n- Package.json updated with correct version\n\nStory Context: Story 1 Phase 1 - Dependencies & Setup',
    priority: 'high'
  },
  {
    title: 'AUTH-STORY1-P1-2: Install React Router type definitions',
    description: 'Install TypeScript type definitions for React Router using npm install @types/react-router-dom\n\nAcceptance Criteria:\n- TypeScript definitions installed\n- No compilation errors\n- IntelliSense working for React Router components\n\nStory Context: Story 1 Phase 1 - Dependencies & Setup',
    priority: 'high'
  },
  {
    title: 'AUTH-STORY1-P1-3: Update package.json and verify no version conflicts',
    description: 'Verify package.json is updated correctly and there are no version conflicts with existing dependencies\n\nAcceptance Criteria:\n- Package.json includes react-router-dom and @types/react-router-dom\n- No dependency conflicts reported\n- All existing dependencies still compatible\n\nStory Context: Story 1 Phase 1 - Dependencies & Setup',
    priority: 'medium'
  },
  {
    title: 'AUTH-STORY1-P1-4: Create new directory structure for auth pages',
    description: 'Create new directory structure: /client/src/pages/auth/ for authentication page components\n\nAcceptance Criteria:\n- Directory /client/src/pages/auth/ created\n- Proper folder structure in place for auth pages\n- Directory follows existing project conventions\n\nStory Context: Story 1 Phase 1 - Dependencies & Setup',
    priority: 'medium'
  },

  // Phase 2: Router Configuration (Steps 5-8)
  {
    title: 'AUTH-STORY1-P2-5: Modify App.tsx to import and configure BrowserRouter',
    description: 'Modify /client/src/App.tsx to import BrowserRouter from react-router-dom and wrap the app with routing capability\n\nAcceptance Criteria:\n- BrowserRouter imported and configured in App.tsx\n- App wrapped with routing capability\n- No breaking changes to existing functionality\n- TypeScript compilation successful\n\nStory Context: Story 1 Phase 2 - Router Configuration',
    priority: 'high'
  },
  {
    title: 'AUTH-STORY1-P2-6: Define route structure in App.tsx with Routes and Route components',
    description: 'Define the complete route structure using Routes and Route components for authentication and dashboard routes\n\nAcceptance Criteria:\n- Routes and Route components properly configured\n- Route structure defined for /, /login, /register, /dashboard\n- Nested routing setup if needed\n- Route components imported correctly\n\nStory Context: Story 1 Phase 2 - Router Configuration',
    priority: 'high'
  },
  {
    title: 'AUTH-STORY1-P2-7: Create route constants file',
    description: 'Create /client/src/constants/routes.ts file to define route constants for maintainable routing\n\nAcceptance Criteria:\n- Route constants file created with TypeScript\n- All route paths defined as constants\n- Constants used throughout the application\n- Follows TypeScript best practices\n\nStory Context: Story 1 Phase 2 - Router Configuration',
    priority: 'medium'
  },
  {
    title: 'AUTH-STORY1-P2-8: Implement basic route navigation structure replacing tab system',
    description: 'Replace the existing tab-based navigation system with route-based navigation while maintaining UI consistency\n\nAcceptance Criteria:\n- Tab system replaced with route navigation\n- UI consistency maintained\n- Navigation works smoothly between routes\n- No loss of existing functionality\n\nStory Context: Story 1 Phase 2 - Router Configuration',
    priority: 'high'
  },

  // Phase 3: Authentication Pages (Steps 9-13)
  {
    title: 'AUTH-STORY1-P3-9: Create LoginPage.tsx component',
    description: 'Create /client/src/pages/auth/LoginPage.tsx component to house the login functionality\n\nAcceptance Criteria:\n- LoginPage component created with TypeScript\n- Component follows existing React patterns\n- Proper component structure and exports\n- Ready for LoginForm integration\n\nStory Context: Story 1 Phase 3 - Authentication Pages',
    priority: 'high'
  },
  {
    title: 'AUTH-STORY1-P3-10: Create RegisterPage.tsx component',
    description: 'Create /client/src/pages/auth/RegisterPage.tsx component to house the registration functionality\n\nAcceptance Criteria:\n- RegisterPage component created with TypeScript\n- Component follows existing React patterns\n- Proper component structure and exports\n- Ready for RegistrationForm integration\n\nStory Context: Story 1 Phase 3 - Authentication Pages',
    priority: 'high'
  },
  {
    title: 'AUTH-STORY1-P3-11: Create DashboardPage.tsx for authenticated users',
    description: 'Create /client/src/pages/DashboardPage.tsx component to serve as the main authenticated user dashboard\n\nAcceptance Criteria:\n- DashboardPage component created with TypeScript\n- Component structure ready for graph editor integration\n- Follows existing component patterns\n- Prepared for protected route usage\n\nStory Context: Story 1 Phase 3 - Authentication Pages',
    priority: 'high'
  },
  {
    title: 'AUTH-STORY1-P3-12: Import existing LoginForm into LoginPage with proper props',
    description: 'Import and integrate the existing LoginForm component into LoginPage.tsx with proper prop passing and styling\n\nAcceptance Criteria:\n- LoginForm successfully imported and integrated\n- Props passed correctly between components\n- Styling consistent with existing design\n- Form functionality preserved\n\nStory Context: Story 1 Phase 3 - Authentication Pages',
    priority: 'high'
  },
  {
    title: 'AUTH-STORY1-P3-13: Import existing RegistrationForm into RegisterPage with proper props',
    description: 'Import and integrate the existing RegistrationForm component into RegisterPage.tsx with proper prop passing and styling\n\nAcceptance Criteria:\n- RegistrationForm successfully imported and integrated\n- Props passed correctly between components\n- Styling consistent with existing design\n- Form functionality preserved\n\nStory Context: Story 1 Phase 3 - Authentication Pages',
    priority: 'high'
  },

  // Phase 4: Protected Routes (Steps 14-17)
  {
    title: 'AUTH-STORY1-P4-14: Create ProtectedRoute.tsx component',
    description: 'Create /client/src/components/ProtectedRoute.tsx component to implement route guards for authentication\n\nAcceptance Criteria:\n- ProtectedRoute component created with TypeScript\n- Route guard logic implemented\n- Authentication checking functionality\n- Component follows React patterns\n\nStory Context: Story 1 Phase 4 - Protected Routes',
    priority: 'high'
  },
  {
    title: 'AUTH-STORY1-P4-15: Implement route guard logic for authentication checking',
    description: 'Implement the core authentication checking logic within the ProtectedRoute component\n\nAcceptance Criteria:\n- Authentication status checking implemented\n- Proper handling of authenticated/unauthenticated states\n- Integration with authentication state management\n- Secure route protection logic\n\nStory Context: Story 1 Phase 4 - Protected Routes',
    priority: 'high'
  },
  {
    title: 'AUTH-STORY1-P4-16: Apply ProtectedRoute wrapper to dashboard and protected routes',
    description: 'Apply the ProtectedRoute wrapper to dashboard and other routes that require authentication\n\nAcceptance Criteria:\n- ProtectedRoute applied to appropriate routes\n- Dashboard route properly protected\n- Other sensitive routes protected as needed\n- Route configuration updated correctly\n\nStory Context: Story 1 Phase 4 - Protected Routes',
    priority: 'high'
  },
  {
    title: 'AUTH-STORY1-P4-17: Configure redirect logic for unauthenticated users',
    description: 'Configure automatic redirect logic to send unauthenticated users to the login page\n\nAcceptance Criteria:\n- Redirect logic implemented for unauthenticated access\n- Users redirected to /login when accessing protected routes\n- Return URL preservation for post-login redirect\n- Smooth user experience during redirects\n\nStory Context: Story 1 Phase 4 - Protected Routes',
    priority: 'high'
  },

  // Phase 5: Navigation Integration (Steps 18-21)
  {
    title: 'AUTH-STORY1-P5-18: Update existing navigation to use React Router useNavigate hook',
    description: 'Update existing navigation components to use React Router\'s useNavigate hook instead of tab-based navigation\n\nAcceptance Criteria:\n- useNavigate hook implemented throughout navigation\n- Programmatic navigation working correctly\n- Existing navigation patterns updated\n- No breaking changes to navigation flow\n\nStory Context: Story 1 Phase 5 - Navigation Integration',
    priority: 'high'
  },
  {
    title: 'AUTH-STORY1-P5-19: Replace tab-based navigation with route-based navigation',
    description: 'Complete the replacement of tab-based navigation with route-based navigation while maintaining UI consistency\n\nAcceptance Criteria:\n- Tab navigation completely replaced with route navigation\n- UI consistency maintained across transition\n- All navigation links work with routing\n- No leftover tab-based navigation code\n\nStory Context: Story 1 Phase 5 - Navigation Integration',
    priority: 'high'
  },
  {
    title: 'AUTH-STORY1-P5-20: Ensure GraphEditor component renders correctly at /dashboard route',
    description: 'Verify that the existing GraphEditor component renders correctly when accessed via the /dashboard route\n\nAcceptance Criteria:\n- GraphEditor renders without errors at /dashboard\n- All GraphEditor functionality preserved\n- React Flow integration working correctly\n- No performance degradation\n\nStory Context: Story 1 Phase 5 - Navigation Integration',
    priority: 'high'
  },
  {
    title: 'AUTH-STORY1-P5-21: Preserve LLM Randomizer accessibility through routing',
    description: 'Ensure LLM Randomizer functionality remains accessible to authenticated users through the new routing system\n\nAcceptance Criteria:\n- LLM Randomizer accessible via routing\n- All LLM Randomizer features working\n- Proper route configuration for randomizer\n- No loss of randomizer functionality\n\nStory Context: Story 1 Phase 5 - Navigation Integration',
    priority: 'medium'
  },

  // Phase 6: Testing & Validation (Steps 22-26)
  {
    title: 'AUTH-STORY1-P6-22: Test all route transitions work without console errors',
    description: 'Comprehensively test all route transitions to ensure they work smoothly without console errors or warnings\n\nAcceptance Criteria:\n- All route transitions tested and working\n- No console errors during navigation\n- Smooth transitions between routes\n- All routes load correctly\n\nStory Context: Story 1 Phase 6 - Testing & Validation',
    priority: 'high'
  },
  {
    title: 'AUTH-STORY1-P6-23: Verify existing graph editor functionality preserved',
    description: 'Thoroughly verify that all existing graph editor functionality is preserved after routing implementation\n\nAcceptance Criteria:\n- All graph editor features working as before\n- No regression in graph functionality\n- React Flow integration maintained\n- Graph operations perform correctly\n\nStory Context: Story 1 Phase 6 - Testing & Validation',
    priority: 'high'
  },
  {
    title: 'AUTH-STORY1-P6-24: Test protected route redirects work correctly',
    description: 'Test that protected route redirects work correctly for both authenticated and unauthenticated users\n\nAcceptance Criteria:\n- Unauthenticated users redirected to login\n- Authenticated users can access protected routes\n- Redirect logic works consistently\n- No unauthorized access possible\n\nStory Context: Story 1 Phase 6 - Testing & Validation',
    priority: 'high'
  },
  {
    title: 'AUTH-STORY1-P6-25: Validate TypeScript compilation with no errors',
    description: 'Ensure all TypeScript code compiles without errors after routing implementation\n\nAcceptance Criteria:\n- TypeScript compilation successful\n- No TypeScript errors or warnings\n- All type definitions correct\n- IntelliSense working properly\n\nStory Context: Story 1 Phase 6 - Testing & Validation',
    priority: 'medium'
  },
  {
    title: 'AUTH-STORY1-P6-26: Test responsive design across auth pages',
    description: 'Test responsive design across all authentication pages to ensure mobile and desktop compatibility\n\nAcceptance Criteria:\n- All auth pages responsive on mobile and desktop\n- UI elements scale properly\n- No layout issues on different screen sizes\n- Consistent design across devices\n\nStory Context: Story 1 Phase 6 - Testing & Validation',
    priority: 'medium'
  }
];

// Story 2: Authentication State Management and Navigation Integration (Steps 1-30)
const story2Tasks = [
  // Phase 1: Authentication Context Setup (Steps 1-5)
  {
    title: 'AUTH-STORY2-P1-1: Create AuthContext.tsx file',
    description: 'Create /client/src/contexts/AuthContext.tsx file to implement authentication state management\n\nAcceptance Criteria:\n- AuthContext.tsx file created with TypeScript\n- File follows existing project structure\n- Ready for authentication state implementation\n- Proper TypeScript setup\n\nStory Context: Story 2 Phase 1 - Authentication Context Setup',
    priority: 'high'
  },
  {
    title: 'AUTH-STORY2-P1-2: Define AuthUser interface and AuthState type definitions',
    description: 'Define comprehensive TypeScript interfaces for AuthUser and AuthState to ensure type safety\n\nAcceptance Criteria:\n- AuthUser interface defined with proper types\n- AuthState type defined for context state\n- Type definitions comprehensive and accurate\n- Follows TypeScript best practices\n\nStory Context: Story 2 Phase 1 - Authentication Context Setup',
    priority: 'high'
  },
  {
    title: 'AUTH-STORY2-P1-3: Implement AuthProvider component with state management',
    description: 'Implement the AuthProvider component with comprehensive authentication state management\n\nAcceptance Criteria:\n- AuthProvider component implemented\n- State management for login/logout functionality\n- User profile state management\n- Error handling for auth operations\n\nStory Context: Story 2 Phase 1 - Authentication Context Setup',
    priority: 'high'
  },
  {
    title: 'AUTH-STORY2-P1-4: Create useAuth custom hook for consuming auth context',
    description: 'Create a custom useAuth hook for components to easily consume authentication context\n\nAcceptance Criteria:\n- useAuth hook implemented and working\n- Easy access to auth state and functions\n- Type-safe hook implementation\n- Follows React hooks patterns\n\nStory Context: Story 2 Phase 1 - Authentication Context Setup',
    priority: 'high'
  },
  {
    title: 'AUTH-STORY2-P1-5: Add AuthProvider to App.tsx root component',
    description: 'Integrate the AuthProvider into App.tsx as a root-level provider for the entire application\n\nAcceptance Criteria:\n- AuthProvider wrapped around the entire app\n- Authentication context available throughout app\n- No breaking changes to existing components\n- Proper provider hierarchy\n\nStory Context: Story 2 Phase 1 - Authentication Context Setup',
    priority: 'high'
  },

  // Phase 2: Backend API Integration (Steps 6-10)
  {
    title: 'AUTH-STORY2-P2-6: Create authService.ts for API calls',
    description: 'Create /client/src/services/authService.ts file to handle all authentication-related API calls\n\nAcceptance Criteria:\n- authService.ts file created with TypeScript\n- Service follows existing API patterns\n- Ready for authentication endpoint integration\n- Proper error handling structure\n\nStory Context: Story 2 Phase 2 - Backend API Integration',
    priority: 'high'
  },
  {
    title: 'AUTH-STORY2-P2-7: Implement login API call function with error handling',
    description: 'Implement login API call function with comprehensive error handling and response processing\n\nAcceptance Criteria:\n- Login API function implemented\n- Comprehensive error handling\n- Response data processing\n- Integration with backend auth endpoints\n\nStory Context: Story 2 Phase 2 - Backend API Integration',
    priority: 'high'
  },
  {
    title: 'AUTH-STORY2-P2-8: Implement logout API call function',
    description: 'Implement logout API call function to properly handle user logout operations\n\nAcceptance Criteria:\n- Logout API function implemented\n- Proper session cleanup\n- Error handling for logout failures\n- Integration with backend logout endpoint\n\nStory Context: Story 2 Phase 2 - Backend API Integration',
    priority: 'high'
  },
  {
    title: 'AUTH-STORY2-P2-9: Implement session validation API call function',
    description: 'Implement session validation API call function to verify user authentication status\n\nAcceptance Criteria:\n- Session validation function implemented\n- Token validation with backend\n- Session expiration handling\n- Error handling for invalid sessions\n\nStory Context: Story 2 Phase 2 - Backend API Integration',
    priority: 'high'
  },
  {
    title: 'AUTH-STORY2-P2-10: Add axios/fetch configuration for auth endpoints',
    description: 'Configure HTTP client (axios or fetch) for authentication endpoints with proper headers and error handling\n\nAcceptance Criteria:\n- HTTP client configured for auth endpoints\n- Proper headers and authentication setup\n- Base URL configuration\n- Error interceptors implemented\n\nStory Context: Story 2 Phase 2 - Backend API Integration',
    priority: 'medium'
  },

  // Phase 3: Session Persistence (Steps 11-15)
  {
    title: 'AUTH-STORY2-P3-11: Implement localStorage token storage utilities',
    description: 'Implement utilities for storing and retrieving authentication tokens from localStorage\n\nAcceptance Criteria:\n- Token storage utilities implemented\n- Secure token handling\n- localStorage integration working\n- Token retrieval and cleanup functions\n\nStory Context: Story 2 Phase 3 - Session Persistence',
    priority: 'high'
  },
  {
    title: 'AUTH-STORY2-P3-12: Add session persistence to AuthContext',
    description: 'Integrate session persistence capabilities into the AuthContext for maintaining user sessions\n\nAcceptance Criteria:\n- Session persistence integrated in AuthContext\n- Authentication state persists across browser refresh\n- Proper session lifecycle management\n- Secure session handling\n\nStory Context: Story 2 Phase 3 - Session Persistence',
    priority: 'high'
  },
  {
    title: 'AUTH-STORY2-P3-13: Create session restoration logic on app initialization',
    description: 'Implement logic to restore user session when the application initializes\n\nAcceptance Criteria:\n- Session restoration on app init\n- Automatic login for valid sessions\n- Graceful handling of expired sessions\n- Loading states during restoration\n\nStory Context: Story 2 Phase 3 - Session Persistence',
    priority: 'high'
  },
  {
    title: 'AUTH-STORY2-P3-14: Implement automatic token refresh functionality',
    description: 'Implement automatic token refresh to maintain user sessions without manual re-authentication\n\nAcceptance Criteria:\n- Automatic token refresh implemented\n- Seamless session extension\n- Refresh token handling\n- Error handling for refresh failures\n\nStory Context: Story 2 Phase 3 - Session Persistence',
    priority: 'medium'
  },
  {
    title: 'AUTH-STORY2-P3-15: Add session expiration detection and handling',
    description: 'Implement session expiration detection and proper handling to maintain security\n\nAcceptance Criteria:\n- Session expiration detection\n- Automatic logout on expiration\n- User notification of session expiry\n- Graceful session cleanup\n\nStory Context: Story 2 Phase 3 - Session Persistence',
    priority: 'high'
  },

  // Phase 4: Navigation UI Components (Steps 16-20)
  {
    title: 'AUTH-STORY2-P4-16: Create UserMenu.tsx dropdown component',
    description: 'Create /client/src/components/UserMenu.tsx dropdown component for authenticated user options\n\nAcceptance Criteria:\n- UserMenu dropdown component created\n- User profile options included\n- Logout functionality integrated\n- Consistent styling with app design\n\nStory Context: Story 2 Phase 4 - Navigation UI Components',
    priority: 'high'
  },
  {
    title: 'AUTH-STORY2-P4-17: Create AuthButtons.tsx for login/logout',
    description: 'Create /client/src/components/AuthButtons.tsx component for login and logout button functionality\n\nAcceptance Criteria:\n- AuthButtons component created\n- Login/logout buttons implemented\n- Conditional rendering based on auth state\n- Proper event handling\n\nStory Context: Story 2 Phase 4 - Navigation UI Components',
    priority: 'high'
  },
  {
    title: 'AUTH-STORY2-P4-18: Integrate UserMenu into main application header/navbar',
    description: 'Integrate the UserMenu component into the main application header or navigation bar\n\nAcceptance Criteria:\n- UserMenu integrated in main navigation\n- Proper positioning and styling\n- Responsive design maintained\n- No conflicts with existing navigation\n\nStory Context: Story 2 Phase 4 - Navigation UI Components',
    priority: 'high'
  },
  {
    title: 'AUTH-STORY2-P4-19: Add conditional rendering based on authentication state',
    description: 'Implement conditional rendering throughout the UI based on user authentication state\n\nAcceptance Criteria:\n- Conditional rendering implemented\n- UI adapts to auth state changes\n- Proper component visibility control\n- Seamless state-based UI updates\n\nStory Context: Story 2 Phase 4 - Navigation UI Components',
    priority: 'high'
  },
  {
    title: 'AUTH-STORY2-P4-20: Style navigation components to match existing design',
    description: 'Apply consistent styling to all navigation components to match the existing application design\n\nAcceptance Criteria:\n- Navigation components styled consistently\n- Design matches existing app aesthetic\n- Responsive design maintained\n- No visual inconsistencies\n\nStory Context: Story 2 Phase 4 - Navigation UI Components',
    priority: 'medium'
  },

  // Phase 5: State Integration (Steps 21-25)
  {
    title: 'AUTH-STORY2-P5-21: Connect authentication state to protected routes',
    description: 'Connect the authentication state management to the protected routes system\n\nAcceptance Criteria:\n- Auth state connected to protected routes\n- Route protection based on auth status\n- Seamless integration between auth and routing\n- Real-time route access updates\n\nStory Context: Story 2 Phase 5 - State Integration',
    priority: 'high'
  },
  {
    title: 'AUTH-STORY2-P5-22: Update ProtectedRoute component to use AuthContext',
    description: 'Update the ProtectedRoute component to use AuthContext instead of static authentication checking\n\nAcceptance Criteria:\n- ProtectedRoute uses AuthContext\n- Dynamic authentication checking\n- Real-time auth state updates\n- Improved route protection\n\nStory Context: Story 2 Phase 5 - State Integration',
    priority: 'high'
  },
  {
    title: 'AUTH-STORY2-P5-23: Integrate auth state with existing graphStore if needed',
    description: 'Integrate authentication state with existing graphStore state management if integration is required\n\nAcceptance Criteria:\n- Auth state integrated with graphStore if needed\n- No conflicts between state management systems\n- Proper state isolation maintained\n- User-specific graph data handling\n\nStory Context: Story 2 Phase 5 - State Integration',
    priority: 'medium'
  },
  {
    title: 'AUTH-STORY2-P5-24: Ensure auth state updates trigger appropriate re-renders',
    description: 'Ensure that authentication state changes trigger appropriate component re-renders throughout the application\n\nAcceptance Criteria:\n- Auth state changes trigger re-renders\n- UI updates reflect auth state immediately\n- Performance optimization for re-renders\n- No unnecessary re-renders\n\nStory Context: Story 2 Phase 5 - State Integration',
    priority: 'high'
  },
  {
    title: 'AUTH-STORY2-P5-25: Add loading states for authentication operations',
    description: 'Add appropriate loading states for all authentication operations to improve user experience\n\nAcceptance Criteria:\n- Loading states for login/logout operations\n- Loading indicators during API calls\n- Proper loading state management\n- Improved user feedback\n\nStory Context: Story 2 Phase 5 - State Integration',
    priority: 'medium'
  },

  // Phase 6: Error Handling & UX (Steps 26-30)
  {
    title: 'AUTH-STORY2-P6-26: Implement error handling for network failures',
    description: 'Implement comprehensive error handling for network failures during authentication operations\n\nAcceptance Criteria:\n- Network error handling implemented\n- User-friendly error messages\n- Retry mechanisms where appropriate\n- Graceful degradation on network issues\n\nStory Context: Story 2 Phase 6 - Error Handling & UX',
    priority: 'high'
  },
  {
    title: 'AUTH-STORY2-P6-27: Add user feedback for authentication errors',
    description: 'Add clear user feedback and error messaging for authentication failures and errors\n\nAcceptance Criteria:\n- Clear error messages for auth failures\n- User-friendly error presentation\n- Actionable error guidance\n- Consistent error handling UX\n\nStory Context: Story 2 Phase 6 - Error Handling & UX',
    priority: 'high'
  },
  {
    title: 'AUTH-STORY2-P6-28: Create session expiration warning notifications',
    description: 'Create warning notifications to alert users before their session expires\n\nAcceptance Criteria:\n- Session expiration warnings implemented\n- Timely notification before expiry\n- Options to extend session\n- Clear expiration messaging\n\nStory Context: Story 2 Phase 6 - Error Handling & UX',
    priority: 'medium'
  },
  {
    title: 'AUTH-STORY2-P6-29: Test authentication flow end-to-end',
    description: 'Perform comprehensive end-to-end testing of the complete authentication flow\n\nAcceptance Criteria:\n- Complete auth flow tested end-to-end\n- Login/logout cycles working correctly\n- Session persistence tested\n- Error scenarios tested\n\nStory Context: Story 2 Phase 6 - Error Handling & UX',
    priority: 'high'
  },
  {
    title: 'AUTH-STORY2-P6-30: Validate auth state persistence across browser refresh',
    description: 'Validate that authentication state properly persists across browser refresh and tab reopening\n\nAcceptance Criteria:\n- Auth state persists across browser refresh\n- Session restoration working correctly\n- No loss of authentication on refresh\n- Consistent auth state across tabs\n\nStory Context: Story 2 Phase 6 - Error Handling & UX',
    priority: 'high'
  }
];

// Story 3: SMTP Configuration and Email Verification Flow (Steps 1-30)
const story3Tasks = [
  // Phase 1: SMTP Service Setup (Steps 1-5)
  {
    title: 'AUTH-STORY3-P1-1: Choose and configure SMTP provider (SendGrid or AWS SES)',
    description: 'Research, choose, and configure an SMTP service provider (SendGrid or AWS SES) for email delivery\n\nAcceptance Criteria:\n- SMTP provider selected (SendGrid or AWS SES)\n- Service account created and configured\n- Cost and deliverability evaluated\n- Service meets project requirements\n\nStory Context: Story 3 Phase 1 - SMTP Service Setup',
    priority: 'high'
  },
  {
    title: 'AUTH-STORY3-P1-2: Create SMTP service account and obtain API credentials',
    description: 'Create SMTP service account and obtain the necessary API credentials for email sending\n\nAcceptance Criteria:\n- SMTP service account created\n- API credentials obtained and secured\n- Account configured for email sending\n- Credentials stored securely\n\nStory Context: Story 3 Phase 1 - SMTP Service Setup',
    priority: 'high'
  },
  {
    title: 'AUTH-STORY3-P1-3: Add SMTP configuration to server environment variables',
    description: 'Add SMTP configuration settings to server environment variables for secure credential management\n\nAcceptance Criteria:\n- Environment variables configured for SMTP\n- Secure credential storage\n- Configuration accessible to email service\n- No hardcoded credentials in codebase\n\nStory Context: Story 3 Phase 1 - SMTP Service Setup',
    priority: 'high'
  },
  {
    title: 'AUTH-STORY3-P1-4: Update server configuration to include email service settings',
    description: 'Update server configuration files to include email service settings and initialization\n\nAcceptance Criteria:\n- Server config updated for email service\n- Email service initialization configured\n- Configuration follows existing patterns\n- No breaking changes to server startup\n\nStory Context: Story 3 Phase 1 - SMTP Service Setup',
    priority: 'medium'
  },
  {
    title: 'AUTH-STORY3-P1-5: Test SMTP connection and basic email sending',
    description: 'Test SMTP connection and verify basic email sending functionality is working\n\nAcceptance Criteria:\n- SMTP connection tested and working\n- Basic email sending verified\n- Email delivery confirmed\n- Error handling tested\n\nStory Context: Story 3 Phase 1 - SMTP Service Setup',
    priority: 'high'
  },

  // Phase 2: Backend Email Service Configuration (Steps 6-10)
  {
    title: 'AUTH-STORY3-P2-6: Update EmailService.ts with SMTP configuration',
    description: 'Update /server/src/auth/services/EmailService.ts with actual SMTP configuration and implementation\n\nAcceptance Criteria:\n- EmailService.ts updated with SMTP config\n- Actual email sending implementation\n- Configuration integrated properly\n- Service follows existing patterns\n\nStory Context: Story 3 Phase 2 - Backend Email Service Configuration',
    priority: 'high'
  },
  {
    title: 'AUTH-STORY3-P2-7: Implement actual email sending functionality (replace template-only code)',
    description: 'Replace template-only email code with actual email sending functionality using the configured SMTP service\n\nAcceptance Criteria:\n- Actual email sending implemented\n- Template code replaced with working implementation\n- Email delivery working end-to-end\n- Error handling for email failures\n\nStory Context: Story 3 Phase 2 - Backend Email Service Configuration',
    priority: 'high'
  },
  {
    title: 'AUTH-STORY3-P2-8: Add email template rendering for verification emails',
    description: 'Implement email template rendering system for verification emails with dynamic content\n\nAcceptance Criteria:\n- Email template rendering implemented\n- Dynamic content insertion working\n- Professional email formatting\n- Template system extensible\n\nStory Context: Story 3 Phase 2 - Backend Email Service Configuration',
    priority: 'high'
  },
  {
    title: 'AUTH-STORY3-P2-9: Implement email delivery status tracking',
    description: 'Implement email delivery status tracking to monitor email send success and failures\n\nAcceptance Criteria:\n- Email delivery status tracking implemented\n- Success and failure logging\n- Delivery confirmation handling\n- Status accessible for troubleshooting\n\nStory Context: Story 3 Phase 2 - Backend Email Service Configuration',
    priority: 'medium'
  },
  {
    title: 'AUTH-STORY3-P2-10: Add rate limiting to email sending functionality',
    description: 'Implement rate limiting on email sending to prevent abuse and comply with provider limits\n\nAcceptance Criteria:\n- Rate limiting implemented for email sending\n- Abuse prevention measures in place\n- Provider limit compliance\n- Error handling for rate limit exceeded\n\nStory Context: Story 3 Phase 2 - Backend Email Service Configuration',
    priority: 'medium'
  },

  // Phase 3: Email Verification Pages (Steps 11-15)
  {
    title: 'AUTH-STORY3-P3-11: Create EmailVerificationPage.tsx',
    description: 'Create /client/src/pages/auth/EmailVerificationPage.tsx for email verification user interface\n\nAcceptance Criteria:\n- EmailVerificationPage component created\n- Email verification UI implemented\n- Token validation interface\n- Follows existing component patterns\n\nStory Context: Story 3 Phase 3 - Email Verification Pages',
    priority: 'high'
  },
  {
    title: 'AUTH-STORY3-P3-12: Implement email verification token validation',
    description: 'Implement email verification token validation logic to verify user email addresses\n\nAcceptance Criteria:\n- Token validation logic implemented\n- Backend API integration for verification\n- Token expiration handling\n- Security validation for tokens\n\nStory Context: Story 3 Phase 3 - Email Verification Pages',
    priority: 'high'
  },
  {
    title: 'AUTH-STORY3-P3-13: Add email verification status checking',
    description: 'Add functionality to check and display email verification status to users\n\nAcceptance Criteria:\n- Verification status checking implemented\n- Status display in user interface\n- Real-time status updates\n- Clear status messaging\n\nStory Context: Story 3 Phase 3 - Email Verification Pages',
    priority: 'high'
  },
  {
    title: 'AUTH-STORY3-P3-14: Create resend verification email functionality',
    description: 'Implement functionality to allow users to resend verification emails if needed\n\nAcceptance Criteria:\n- Resend verification email implemented\n- Rate limiting on resend requests\n- User feedback for resend actions\n- Error handling for resend failures\n\nStory Context: Story 3 Phase 3 - Email Verification Pages',
    priority: 'high'
  },
  {
    title: 'AUTH-STORY3-P3-15: Style email verification pages consistently',
    description: 'Apply consistent styling to email verification pages to match the application design\n\nAcceptance Criteria:\n- Email verification pages styled consistently\n- Design matches application aesthetic\n- Responsive design implemented\n- User-friendly verification interface\n\nStory Context: Story 3 Phase 3 - Email Verification Pages',
    priority: 'medium'
  },

  // Phase 4: Registration Flow Integration (Steps 16-20)
  {
    title: 'AUTH-STORY3-P4-16: Update registration process to trigger email verification',
    description: 'Update the user registration process to automatically trigger email verification\n\nAcceptance Criteria:\n- Registration triggers email verification\n- Verification email sent on successful registration\n- Integration with existing registration flow\n- Error handling for email send failures\n\nStory Context: Story 3 Phase 4 - Registration Flow Integration',
    priority: 'high'
  },
  {
    title: 'AUTH-STORY3-P4-17: Modify registration success page to include email verification instructions',
    description: 'Update registration success page to include clear instructions about email verification\n\nAcceptance Criteria:\n- Registration success page updated\n- Clear email verification instructions\n- Next steps guidance for users\n- Professional messaging and design\n\nStory Context: Story 3 Phase 4 - Registration Flow Integration',
    priority: 'high'
  },
  {
    title: 'AUTH-STORY3-P4-18: Update AuthContext to handle email verification status',
    description: 'Update AuthContext to include and manage email verification status as part of authentication state\n\nAcceptance Criteria:\n- AuthContext includes verification status\n- Verification status management implemented\n- State updates when verification changes\n- Integration with auth flow\n\nStory Context: Story 3 Phase 4 - Registration Flow Integration',
    priority: 'high'
  },
  {
    title: 'AUTH-STORY3-P4-19: Add email verification status to user profile data',
    description: 'Add email verification status to user profile data and display throughout the application\n\nAcceptance Criteria:\n- Verification status in user profile\n- Status visible in relevant UI components\n- Profile data updated with verification\n- Consistent status representation\n\nStory Context: Story 3 Phase 4 - Registration Flow Integration',
    priority: 'medium'
  },
  {
    title: 'AUTH-STORY3-P4-20: Implement post-verification welcome flow',
    description: 'Implement a welcome flow that guides users after successful email verification\n\nAcceptance Criteria:\n- Post-verification welcome flow implemented\n- User guidance after verification\n- Welcome messaging and next steps\n- Smooth onboarding experience\n\nStory Context: Story 3 Phase 4 - Registration Flow Integration',
    priority: 'medium'
  },

  // Phase 5: Email Templates & Content (Steps 21-25)
  {
    title: 'AUTH-STORY3-P5-21: Design professional email verification template',
    description: 'Design a professional email template for verification emails with proper branding and formatting\n\nAcceptance Criteria:\n- Professional email verification template\n- Proper branding and styling\n- Clear verification instructions\n- Mobile-friendly email design\n\nStory Context: Story 3 Phase 5 - Email Templates & Content',
    priority: 'high'
  },
  {
    title: 'AUTH-STORY3-P5-22: Create welcome email template for activated accounts',
    description: 'Create a welcome email template that is sent after users successfully activate their accounts\n\nAcceptance Criteria:\n- Welcome email template created\n- Engaging welcome content\n- Next steps and feature highlights\n- Professional email design\n\nStory Context: Story 3 Phase 5 - Email Templates & Content',
    priority: 'medium'
  },
  {
    title: 'AUTH-STORY3-P5-23: Implement email template variables and personalization',
    description: 'Implement email template variables and personalization features for dynamic content\n\nAcceptance Criteria:\n- Template variables implemented\n- Personalization with user data\n- Dynamic content insertion\n- Template system flexibility\n\nStory Context: Story 3 Phase 5 - Email Templates & Content',
    priority: 'medium'
  },
  {
    title: 'AUTH-STORY3-P5-24: Add company branding and styling to email templates',
    description: 'Add consistent company branding and styling to all email templates\n\nAcceptance Criteria:\n- Company branding in email templates\n- Consistent styling across emails\n- Professional brand representation\n- Brand guideline compliance\n\nStory Context: Story 3 Phase 5 - Email Templates & Content',
    priority: 'medium'
  },
  {
    title: 'AUTH-STORY3-P5-25: Test email rendering across major email clients',
    description: 'Test email template rendering across major email clients to ensure compatibility\n\nAcceptance Criteria:\n- Email rendering tested across clients\n- Compatibility with Gmail, Outlook, Apple Mail\n- Responsive design in email clients\n- Consistent appearance across platforms\n\nStory Context: Story 3 Phase 5 - Email Templates & Content',
    priority: 'medium'
  },

  // Phase 6: Error Handling & Monitoring (Steps 26-30)
  {
    title: 'AUTH-STORY3-P6-26: Implement comprehensive error handling for email failures',
    description: 'Implement comprehensive error handling for all email service failures and edge cases\n\nAcceptance Criteria:\n- Comprehensive email error handling\n- Error recovery mechanisms\n- User-friendly error messages\n- Logging for troubleshooting\n\nStory Context: Story 3 Phase 6 - Error Handling & Monitoring',
    priority: 'high'
  },
  {
    title: 'AUTH-STORY3-P6-27: Add email delivery logging and monitoring',
    description: 'Add logging and monitoring capabilities for email delivery to track performance and issues\n\nAcceptance Criteria:\n- Email delivery logging implemented\n- Monitoring for delivery metrics\n- Performance tracking\n- Issue detection and alerting\n\nStory Context: Story 3 Phase 6 - Error Handling & Monitoring',
    priority: 'medium'
  },
  {
    title: 'AUTH-STORY3-P6-28: Create fallback mechanisms for email service outages',
    description: 'Create fallback mechanisms to handle email service outages gracefully\n\nAcceptance Criteria:\n- Fallback mechanisms for email outages\n- Graceful degradation strategies\n- User notification of service issues\n- Recovery procedures\n\nStory Context: Story 3 Phase 6 - Error Handling & Monitoring',
    priority: 'medium'
  },
  {
    title: 'AUTH-STORY3-P6-29: Test complete registration to activation flow',
    description: 'Test the complete user flow from registration through email verification to account activation\n\nAcceptance Criteria:\n- Complete registration to activation tested\n- End-to-end email verification flow working\n- All steps in user journey validated\n- Error scenarios tested\n\nStory Context: Story 3 Phase 6 - Error Handling & Monitoring',
    priority: 'high'
  },
  {
    title: 'AUTH-STORY3-P6-30: Validate email verification works across different email providers',
    description: 'Validate that email verification works correctly across different email providers and services\n\nAcceptance Criteria:\n- Email verification tested across providers\n- Gmail, Outlook, Yahoo compatibility\n- Spam folder considerations\n- Delivery reliability across providers\n\nStory Context: Story 3 Phase 6 - Error Handling & Monitoring',
    priority: 'medium'
  }
];

// Combine all tasks
const allTasks = [
  ...story1Tasks,
  ...story2Tasks,
  ...story3Tasks
];

console.log('\n=== Authentication Frontend Integration Epic Task Creation ===');
console.log(`Creating ${allTasks.length} development tasks across 3 stories...\n`);

// Function to create a single ticket
async function createTicket(task) {
  try {
    const response = await fetch(`${API_URL}/tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: task.title,
        description: task.description,
        priority: task.priority,
        created_by: 'epic-task-generator'
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error(`Failed to create ticket "${task.title}":`, error.message);
    return null;
  }
}

// Function to create all tickets
async function createAllTickets() {
  console.log('Starting ticket creation...\n');
  
  let successCount = 0;
  let failureCount = 0;
  
  for (let i = 0; i < allTasks.length; i++) {
    const task = allTasks[i];
    console.log(`Creating ticket ${i + 1}/${allTasks.length}: ${task.title}`);
    
    const result = await createTicket(task);
    
    if (result && result.id) {
      console.log(`✓ Created ticket: ${result.id}`);
      successCount++;
    } else {
      console.log('✗ Failed to create ticket');
      failureCount++;
    }
    
    // Add small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n=== Task Creation Summary ===');
  console.log(`Total tasks: ${allTasks.length}`);
  console.log(`Successfully created: ${successCount}`);
  console.log(`Failed: ${failureCount}`);
  
  if (successCount > 0) {
    console.log(`\n✓ ${successCount} development tasks created for Authentication Frontend Integration Epic`);
    console.log('\nTasks cover all implementation steps across 3 stories:');
    console.log('- Story 1: React Router Setup and Authentication Pages (30 tasks)');
    console.log('- Story 2: Authentication State Management and Navigation Integration (30 tasks)');
    console.log('- Story 3: SMTP Configuration and Email Verification Flow (30 tasks)');
    console.log('\nDevelopers can now grab these tasks using the task management system.');
  }
}

// Check if server is running first
async function checkServer() {
  try {
    const response = await fetch(`${API_URL}/health`);
    if (response.ok) {
      return true;
    }
  } catch (error) {
    return false;
  }
  return false;
}

// Main execution
async function main() {
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.error('❌ Server is not running at http://localhost:8000');
    console.log('Please start the server first:');
    console.log('  pnpm --filter server dev');
    process.exit(1);
  }
  
  await createAllTickets();
}

// Run the script
main().catch(console.error);