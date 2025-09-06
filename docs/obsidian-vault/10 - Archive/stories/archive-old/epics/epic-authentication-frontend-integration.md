# Epic: Authentication Frontend Integration - Brownfield Enhancement

## Epic Goal

Enable user authentication and account management by integrating the existing authentication components into the main application, allowing users to register, login, and access personalized features while maintaining full compatibility with the existing graph editor functionality.

## Epic Description

**Existing System Context:**

- Current relevant functionality: React-based graph editor with tab navigation, complete backend authentication system with APIs, frontend auth components (LoginForm, RegistrationForm, etc.)
- Technology stack: React 18, Vite, TypeScript, React Flow, Node.js/Fastify backend
- Integration points: App.tsx tab system needs routing integration, existing auth components need navigation access, backend auth APIs ready for frontend consumption

**Enhancement Details:**

- What's being added/changed: React Router setup, authentication pages, navigation integration, SMTP configuration for email verification
- How it integrates: Replace tab-based navigation with React Router, add auth routes (/login, /register), integrate auth state management, connect to existing backend APIs
- Success criteria: Users can access registration/login forms, complete authentication flow, receive verification emails, and access protected application features

---

## Story 1: React Router Setup and Authentication Pages

### User Story

As a user of the PromptGraph application,
I want to access dedicated login and registration pages through proper URL routing,
So that I can authenticate and manage my account through a professional, navigable interface.

### Story Context

**Existing System Integration:**

- Integrates with: Current App.tsx tab-based navigation, existing auth components in `/client/src/components/auth/`
- Technology: React 18, Vite, TypeScript, existing React Flow patterns
- Follows pattern: React component architecture, TypeScript interfaces
- Touch points: App.tsx navigation system, existing LoginForm/RegistrationForm components

### Acceptance Criteria

**Functional Requirements:**

1. React Router installed and configured with HashRouter for compatibility
2. Authentication routes created: `/login`, `/register`, `/dashboard`, `/`
3. Login page displays existing LoginForm component with proper styling
4. Registration page displays existing RegistrationForm component with proper styling
5. Protected routes redirect unauthenticated users to login page
6. Navigation between auth pages works seamlessly

**Integration Requirements:** 7. Existing graph editor functionality continues to work unchanged at `/dashboard` route 8. LLM Randomizer functionality preserved and accessible to authenticated users 9. Tab-based navigation converted to route-based navigation while maintaining UI consistency 10. Authentication state persists across route changes

**Quality Requirements:** 11. All auth page routes load without console errors 12. TypeScript types properly defined for route parameters and navigation 13. Responsive design maintained across all authentication pages 14. Loading states implemented for route transitions

### Implementation Steps for Scrum Master Task Breakdown:

**Phase 1: Dependencies & Setup**

1. Install React Router v6 dependency (`npm install react-router-dom`)
2. Install type definitions (`npm install @types/react-router-dom`)
3. Update package.json and verify no version conflicts
4. Create new directory structure: `/client/src/pages/auth/`

**Phase 2: Router Configuration** 5. Modify `/client/src/App.tsx` to import and configure BrowserRouter 6. Define route structure in App.tsx with Routes and Route components 7. Create route constants file `/client/src/constants/routes.ts` 8. Implement basic route navigation structure replacing tab system

**Phase 3: Authentication Pages** 9. Create `/client/src/pages/auth/LoginPage.tsx` component 10. Create `/client/src/pages/auth/RegisterPage.tsx` component 11. Create `/client/src/pages/DashboardPage.tsx` for authenticated users 12. Import existing LoginForm into LoginPage with proper props 13. Import existing RegistrationForm into RegisterPage with proper props

**Phase 4: Protected Routes** 14. Create `/client/src/components/ProtectedRoute.tsx` component 15. Implement route guard logic for authentication checking 16. Apply ProtectedRoute wrapper to dashboard and protected routes 17. Configure redirect logic for unauthenticated users

**Phase 5: Navigation Integration** 18. Update existing navigation to use React Router's `useNavigate` hook 19. Replace tab-based navigation with route-based navigation 20. Ensure GraphEditor component renders correctly at `/dashboard` route 21. Preserve LLM Randomizer accessibility through routing

**Phase 6: Testing & Validation** 22. Test all route transitions work without console errors 23. Verify existing graph editor functionality preserved 24. Test protected route redirects work correctly 25. Validate TypeScript compilation with no errors 26. Test responsive design across auth pages

### Technical Notes

- **Integration Approach:** Replace App.tsx tab system with React Router, maintain existing component structure
- **Existing Pattern Reference:** Follow current React component patterns in GraphEditor.tsx and existing auth components
- **Key Constraints:** Must preserve existing graph editor functionality, maintain component reusability

### Definition of Done

- ✅ React Router v6 installed and configured
- ✅ Auth routes (/, /login, /register, /dashboard) implemented and working
- ✅ Existing LoginForm and RegistrationForm integrated into routed pages
- ✅ Protected route guards implemented
- ✅ Navigation between routes works smoothly
- ✅ Graph editor functionality preserved at /dashboard route
- ✅ LLM Randomizer accessible to authenticated users
- ✅ No TypeScript errors or console warnings
- ✅ Responsive design maintained

---

## Story 2: Authentication State Management and Navigation Integration

### User Story

As a user of the PromptGraph application,
I want seamless authentication state management with proper login/logout navigation,
So that I can maintain my authenticated session across the application and easily access account features.

### Story Context

**Existing System Integration:**

- Integrates with: Backend auth APIs at `/api/auth/*`, React Router from Story 1, existing auth services
- Technology: React Context API, existing Zustand patterns, backend LoginService/RegistrationService
- Follows pattern: Existing graphStore state management patterns, React hook patterns
- Touch points: App.tsx routing structure, existing auth components, backend authentication endpoints

### Acceptance Criteria

**Functional Requirements:**

1. Authentication context (AuthContext) created with login/logout state management
2. User profile information stored and accessible throughout the application
3. Login/logout navigation added to main application header/navbar
4. Session persistence implemented using localStorage/sessionStorage
5. Automatic token refresh handled for extended sessions
6. User profile dropdown with account management options

**Integration Requirements:** 7. Authentication state integrates with existing graph editor without disruption 8. Protected routes automatically redirect based on authentication status 9. Existing graph state management (graphStore) works with authenticated users 10. Backend auth APIs properly called for login/logout operations

**Quality Requirements:** 11. Authentication state updates trigger appropriate UI re-renders 12. Session expiration handled gracefully with user notification 13. Loading states shown during authentication operations 14. Error handling for network failures and auth errors

### Implementation Steps for Scrum Master Task Breakdown:

**Phase 1: Authentication Context Setup**

1. Create `/client/src/contexts/AuthContext.tsx` file
2. Define AuthUser interface and AuthState type definitions
3. Implement AuthProvider component with state management
4. Create useAuth custom hook for consuming auth context
5. Add AuthProvider to App.tsx root component

**Phase 2: Backend API Integration** 6. Create `/client/src/services/authService.ts` for API calls 7. Implement login API call function with error handling 8. Implement logout API call function 9. Implement session validation API call function 10. Add axios/fetch configuration for auth endpoints

**Phase 3: Session Persistence** 11. Implement localStorage token storage utilities 12. Add session persistence to AuthContext 13. Create session restoration logic on app initialization 14. Implement automatic token refresh functionality 15. Add session expiration detection and handling

**Phase 4: Navigation UI Components** 16. Create `/client/src/components/UserMenu.tsx` dropdown component 17. Create `/client/src/components/AuthButtons.tsx` for login/logout 18. Integrate UserMenu into main application header/navbar 19. Add conditional rendering based on authentication state 20. Style navigation components to match existing design

**Phase 5: State Integration** 21. Connect authentication state to protected routes 22. Update ProtectedRoute component to use AuthContext 23. Integrate auth state with existing graphStore if needed 24. Ensure auth state updates trigger appropriate re-renders 25. Add loading states for authentication operations

**Phase 6: Error Handling & UX** 26. Implement error handling for network failures 27. Add user feedback for authentication errors 28. Create session expiration warning notifications 29. Test authentication flow end-to-end 30. Validate auth state persistence across browser refresh

### Technical Notes

- **Integration Approach:** Create AuthContext following existing Zustand patterns, integrate with backend auth endpoints
- **Existing Pattern Reference:** Follow graphStore.ts patterns for state management, use existing API calling patterns
- **Key Constraints:** Must not interfere with existing graph operations, maintain session security

### Definition of Done

- ✅ AuthContext implemented with login/logout functionality
- ✅ User navigation (login/logout buttons) added to application header
- ✅ Session persistence working with localStorage
- ✅ Authentication state properly integrated with routing
- ✅ Backend auth API integration working (login, logout, session validation)
- ✅ Graph editor functionality unaffected by auth state changes
- ✅ Loading states and error handling implemented
- ✅ Session expiration handling working
- ✅ User profile information accessible throughout app

---

## Story 3: SMTP Configuration and Email Verification Flow

### User Story

As a new user registering for PromptGraph,
I want to receive email verification messages and complete my account setup,
So that I can securely activate my account and start using the application.

### Story Context

**Existing System Integration:**

- Integrates with: Backend EmailService, existing RegistrationService, user registration flow from Stories 1-2
- Technology: SMTP service provider (SendGrid/AWS SES), existing backend email infrastructure
- Follows pattern: Existing backend service patterns, email template system
- Touch points: Registration form workflow, backend email sending service, user onboarding flow

### Acceptance Criteria

**Functional Requirements:**

1. SMTP service provider configured (SendGrid or AWS SES) for email delivery
2. Email verification flow working end-to-end from registration to activation
3. Email verification page/component created for token validation
4. Resend verification email functionality implemented
5. Email delivery status tracking and error handling
6. Welcome email sent after successful account activation

**Integration Requirements:** 7. Registration flow from Story 2 triggers email verification automatically 8. Email verification integrates with authentication state management 9. Failed email delivery handled gracefully with user notification 10. Email verification status reflected in user profile and navigation

**Quality Requirements:** 11. Email templates properly formatted and professional 12. Email delivery monitoring and logging implemented 13. Rate limiting on email sending to prevent abuse 14. Comprehensive error handling for email service failures

### Implementation Steps for Scrum Master Task Breakdown:

**Phase 1: SMTP Service Setup**

1. Choose and configure SMTP provider (SendGrid or AWS SES)
2. Create SMTP service account and obtain API credentials
3. Add SMTP configuration to server environment variables
4. Update server configuration to include email service settings
5. Test SMTP connection and basic email sending

**Phase 2: Backend Email Service Configuration** 6. Update `/server/src/auth/services/EmailService.ts` with SMTP configuration 7. Implement actual email sending functionality (replace template-only code) 8. Add email template rendering for verification emails 9. Implement email delivery status tracking 10. Add rate limiting to email sending functionality

**Phase 3: Email Verification Pages** 11. Create `/client/src/pages/auth/EmailVerificationPage.tsx` 12. Implement email verification token validation 13. Add email verification status checking 14. Create resend verification email functionality 15. Style email verification pages consistently

**Phase 4: Registration Flow Integration** 16. Update registration process to trigger email verification 17. Modify registration success page to include email verification instructions 18. Update AuthContext to handle email verification status 19. Add email verification status to user profile data 20. Implement post-verification welcome flow

**Phase 5: Email Templates & Content** 21. Design professional email verification template 22. Create welcome email template for activated accounts 23. Implement email template variables and personalization 24. Add company branding and styling to email templates 25. Test email rendering across major email clients

**Phase 6: Error Handling & Monitoring** 26. Implement comprehensive error handling for email failures 27. Add email delivery logging and monitoring 28. Create fallback mechanisms for email service outages 29. Test complete registration to activation flow 30. Validate email verification works across different email providers

### Technical Notes

- **Integration Approach:** Configure SMTP service, extend existing EmailService, integrate with registration workflow
- **Existing Pattern Reference:** Follow existing backend service patterns, use existing error handling approaches
- **Key Constraints:** Email service costs, delivery reliability, spam prevention

### Definition of Done

- ✅ SMTP service provider (SendGrid/AWS SES) configured and tested
- ✅ Email verification emails sending successfully
- ✅ Email verification page/component implemented and working
- ✅ Resend verification email functionality working
- ✅ Registration to email verification flow working end-to-end
- ✅ Email delivery error handling implemented
- ✅ Welcome email functionality working
- ✅ Email verification status integrated with auth state
- ✅ Email templates professionally formatted
- ✅ Rate limiting and spam prevention measures implemented

---

## Epic Compatibility Requirements

- ✅ Existing APIs remain unchanged (backend auth system ready)
- ✅ Database schema changes are backward compatible (auth tables already exist)
- ✅ UI changes follow existing patterns (React component patterns maintained)
- ✅ Performance impact is minimal (routing overhead negligible)

## Epic Risk Mitigation

- **Primary Risk:** Breaking existing graph editor functionality or user workflows
- **Mitigation:** Implement routing as additive feature, preserve existing tab functionality as fallback, thorough testing of existing features
- **Rollback Plan:** Revert to tab-based navigation by removing router and restoring original App.tsx structure

## Epic Definition of Done

- ✅ All 3 stories completed with acceptance criteria met
- ✅ Existing functionality verified through testing (graph editor, LLM randomizer work unchanged)
- ✅ Integration points working correctly (auth components accessible via routes)
- ✅ Documentation updated appropriately (routing setup documented)
- ✅ No regression in existing features (comprehensive testing completed)
