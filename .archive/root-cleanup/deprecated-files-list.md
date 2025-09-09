# Deprecated Files to Remove for Epic 1 MVP

Based on the Epic 1 MVP specification (inline editing focus), the following directories and files should be removed as they are not part of the core MVP:

## Directories to Remove

### Client Components (Not part of Epic 1 MVP):
- `client/src/components/admin/` - Admin dashboards not needed for MVP
- `client/src/components/auth/` - Authentication/authorization not in MVP scope
- `client/src/components/marketplace/` - Marketplace features not in MVP
- `client/src/components/payment/` - Payment features not in MVP
- `client/src/components/moderation/` - Moderation features not in MVP
- `client/src/components/oauth/` - OAuth features not in MVP
- `client/src/components/policy/` - Policy management not in MVP
- `client/src/components/revenue/` - Revenue features not in MVP
- `client/src/components/security/` - Security dashboards not in MVP
- `client/src/components/transparency/` - Transparency features not in MVP
- `client/src/components/consent/` - Consent management not in MVP
- `client/src/components/approval/` - Approval workflows not in MVP

### Client Pages (Not part of Epic 1 MVP):
- `client/src/pages/EmailVerificationPage.tsx`
- `client/src/pages/LoginPage.tsx`
- `client/src/pages/PasswordResetPage.tsx`
- `client/src/pages/RegistrationPage.tsx`
- `client/src/pages/UnauthorizedPage.tsx`

### Client Hooks (Not part of Epic 1 MVP):
- `client/src/hooks/useAuth.ts`
- `client/src/hooks/useConsent.ts`
- `client/src/hooks/useConsentAwareToggle.tsx`
- `client/src/hooks/useDataAccess.ts`
- `client/src/hooks/useEpic17Authorization.ts`
- `client/src/hooks/useJustInTimeConsent.ts`
- `client/src/hooks/useLoginAnalytics.ts`
- `client/src/hooks/useMarketplace.ts`
- `client/src/hooks/usePasswordReset.ts`
- `client/src/hooks/usePaymentAnalytics.ts`
- `client/src/hooks/useRegistration.ts`
- `client/src/hooks/useRevenueAnalytics.ts`
- `client/src/hooks/useRouteGuard.ts`

### Client Stores (Not part of Epic 1 MVP):
- `client/src/stores/authStore.ts`
- `client/src/stores/__tests__/authStore.test.ts`

### Client Types (Not part of Epic 1 MVP):
- `client/src/types/MFATypes.ts`
- `client/src/types/consent.ts`
- `client/src/types/revenue.ts`
- `client/src/types/security.ts`

### Core Package Components (Not part of Epic 1 MVP):
- `packages/core/components/Admin/` - Admin features not in MVP
- `packages/core/components/Analytics/` - Advanced analytics not in MVP
- `packages/core/components/Community/` - Community features not in MVP
- `packages/core/components/Audit/` - Audit features not in MVP
- `packages/core/components/Contributions/` - Contribution system not in MVP

### Core Package Systems (Not part of Epic 1 MVP):
- `packages/core/auth/` - Authentication system not in MVP
- `packages/core/admin/` - Admin system not in MVP
- `packages/core/analytics/` - Analytics system not in MVP (except basic preview)
- `packages/core/audit/` - Audit system not in MVP
- `packages/core/community/` - Community system not in MVP

## Files to Keep (Core Epic 1 MVP):

### Essential for Inline Editing:
- `packages/core/components/epic1/` - All Epic 1 inline editing components
- `packages/core/components/Inspector/` - Modified for inline editing support
- `packages/core/GraphEditor.tsx` - Main editor component
- `packages/core/PreviewModal.tsx` - Preview functionality
- `packages/core/Palette.tsx` - Node palette
- `packages/core/components/CommandPalette/` - Professional features integration
- `packages/core/runtime/` - Core runtime engine
- `packages/core/validation.ts` - Graph validation
- `packages/core/graphSchema.ts` - Graph schemas

### Essential Client Components:
- `client/src/components/EnhancedGraphEditor.tsx` - Enhanced editor
- `client/src/components/BrowserSafeGraphEditor.tsx` - Browser-safe version
- `client/src/components/GraphNode.tsx` - Node components
- `client/src/components/NodePalette.tsx` - Node palette
- `client/src/components/StatusBar.tsx` - Status bar
- `client/src/components/file-browser/` - File management (keep for .psg files)

### Essential Hooks:
- `client/src/hooks/useGraphVersions.ts` - Version management
- `client/src/hooks/useFormAnalytics.ts` - Basic form analytics
- `client/src/hooks/useNavigation.ts` - Navigation
- `client/src/hooks/usePerformanceProfiler.ts` - Performance monitoring
- `client/src/hooks/useQualityMetrics.ts` - Quality metrics
- `client/src/hooks/useReportExport.ts` - Export functionality

## Summary

The Epic 1 MVP focuses on:
1. Inline editing capabilities (no side panels)
2. Core node engine with deterministic execution
3. Visual node editor with React Flow
4. Asset library with presets
5. Real-time preview system
6. Professional UI features (command palette, keyboard shortcuts)

Everything else (auth, admin, marketplace, payments, etc.) should be removed from this branch to keep it focused on the MVP deliverables.