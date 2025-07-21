# PromptScape Randomizer Graph — Brownfield Architecture

_Epic 19: Privacy & Compliance Framework Integration_  
_Version 1.0 · 2025-07-21_

---

## 1 · Integration Architecture Overview

### 1.1 Existing System Architecture (Preserved)
```
Core PromptScape System:
┌─────────────────────────────────────────────────────────────────┐
│                    React Frontend (Core)                       │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐  │
│  │   Graph Editor  │ │   Inspector     │ │    Palette      │  │
│  │   (React-Flow)  │ │   (Zod Forms)   │ │   (Drag/Drop)   │  │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                      Core Library                              │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐  │
│  │  Schema Layer   │ │  Runtime Engine │ │  State Manager  │  │
│  │   (Zod Types)   │ │   (Execution)   │ │   (Zustand)     │  │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                     API Services (Core)                       │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐  │
│  │   Graph API     │ │   Export API    │ │    CLI Tool     │  │
│  │   (Fastify)     │ │   (Bundler)     │ │   (Commander)   │  │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Epic 19 Integration Layer (Additive)
```
Privacy & Compliance Framework (Epic 19):
┌─────────────────────────────────────────────────────────────────┐
│                Privacy UI Components (NEW)                     │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐  │
│  │ Consent Banner  │ │Policy Dashboard │ │Preference Center│  │
│  │ConsentBanner.tsx│ │PolicyPreview.tsx│ │PreferenceCenter │  │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘  │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐  │
│  │Just-in-Time     │ │Granular Consent │ │Data Transparency│  │
│  │ConsentPrompt    │ │Interface        │ │Dashboard        │  │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                Privacy Service Layer (NEW)                    │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐  │
│  │Consent Services │ │Policy Services  │ │Compliance Engine│  │
│  │ConsentCollection│ │PolicyAuthoring  │ │ComplianceRule   │  │
│  │ConsentTracking  │ │PolicyNotify     │ │ComplianceReport │  │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘  │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐  │
│  │Data Services    │ │Audit Services   │ │Access Control   │  │
│  │DataClassify     │ │AuditEvidence    │ │AccessRequest    │  │
│  │DataRetention    │ │AuditWorkflow    │ │AccessGrants     │  │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                Privacy API Layer (NEW)                        │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐  │
│  │/api/consent/*   │ │/api/policy/*    │ │/api/compliance/*│  │
│  │/api/data/*      │ │/api/audit/*     │ │/api/access/*    │  │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 1.3 Non-Breaking Integration Pattern
**Key Integration Principles:**
- ✅ **Additive only**: No modifications to core graph functionality
- ✅ **Optional loading**: Privacy components load on-demand
- ✅ **Feature flagging**: All Epic 19 features can be disabled
- ✅ **API versioning**: Preserves existing API contracts

---

## 2 · Component Integration Details

### 2.1 Client-Side Integration
**React Component Hierarchy:**
```typescript
// Existing Structure (UNCHANGED)
App.tsx
├── GraphEditor.tsx (CORE - No changes)
├── InspectorSidebar.tsx (CORE - No changes)  
├── Palette.tsx (CORE - No changes)
└── PreviewModal.tsx (CORE - No changes)

// Epic 19 Integration (ADDITIVE)
App.tsx
├── ConsentBanner.tsx (NEW - Epic 19)
├── JustInTimeConsentProvider.tsx (NEW - Context wrapper)
└── PrivacyRouter.tsx (NEW - Privacy feature routing)
    ├── PolicyPreviewDashboard.tsx
    ├── ConsentPreferencesModal.tsx
    ├── UserDataTransparencyDashboard.tsx
    └── PreferenceCenter.tsx
```

**Integration Method:**
- **Context Providers**: Privacy context wraps existing app
- **Conditional Rendering**: Privacy UI shows based on feature flags
- **Event-Driven**: Privacy prompts triggered by user actions
- **State Isolation**: Privacy state separate from core graph state

### 2.2 Service Layer Integration
**Backend Service Architecture:**
```typescript
// Existing Services (UNCHANGED)
server/src/
├── engine.ts (CORE - Graph execution)
├── exporter.ts (CORE - Bundle generation)
├── graphValidator.ts (CORE - Validation)
└── index.ts (CORE - Main server)

// Epic 19 Services (ADDITIVE)
server/src/services/
├── Privacy/
│   ├── ConsentCollectionService.ts
│   ├── ConsentBasedDataFilterService.ts
│   ├── PolicyAuthoringService.ts
│   └── PolicyNotificationService.ts
├── Compliance/
│   ├── ComplianceRuleEngine.ts
│   ├── ComplianceReportingService.ts
│   ├── GDPRComplianceRuleset.ts
│   └── RegulatoryReportingService.ts
├── DataGovernance/
│   ├── DataClassificationService.ts
│   ├── DataRetentionFrameworkService.ts
│   ├── DataAccessControlService.ts
│   └── DataExportService.ts
└── Audit/
    ├── AuditWorkflowService.ts
    ├── AuditEvidenceMapper.ts
    └── AuditTeamCollaborationService.ts
```

### 2.3 Database Integration Strategy
**Data Isolation Pattern:**
```sql
-- Existing Schema (UNCHANGED)
graphs (id, user_id, data, created_at, updated_at)
users (id, email, created_at)

-- Epic 19 Schema (ADDITIVE)
consent_records (id, user_id, consent_type, granted, timestamp)
policy_assignments (id, user_id, policy_id, assigned_at)
data_classifications (id, data_type, classification_level, rules)
audit_logs (id, user_id, action, resource, timestamp, metadata)
compliance_reports (id, report_type, data, generated_at)
```

**Migration Strategy:**
- **Separate tables**: No foreign key dependencies on core tables
- **Backward compatibility**: Existing queries work unchanged
- **Gradual migration**: Users opt-into privacy features
- **Rollback capability**: Privacy schema can be dropped cleanly

---

## 3 · API Integration Architecture

### 3.1 Existing APIs (Preserved)
```typescript
// Core APIs (UNCHANGED)
POST /preview          // Graph execution
POST /export           // Bundle generation  
GET  /health          // Health check
```

### 3.2 New Privacy APIs (Additive)
```typescript
// Consent Management
POST   /api/consent/grant
POST   /api/consent/revoke  
GET    /api/consent/status
PUT    /api/consent/preferences

// Policy Management
GET    /api/policy/list
POST   /api/policy/create
PUT    /api/policy/:id/update
GET    /api/policy/:id/preview

// Data Governance
GET    /api/data/classification
POST   /api/data/export-request
GET    /api/data/retention-status
DELETE /api/data/purge

// Compliance & Audit
GET    /api/compliance/status
POST   /api/compliance/report
GET    /api/audit/logs
POST   /api/audit/evidence
```

### 3.3 Middleware Integration
**Non-Breaking Middleware Chain:**
```typescript
// Existing Middleware (UNCHANGED)
server.register(cors)
server.register(rateLimit)
server.register(validation)

// Epic 19 Middleware (CONDITIONAL)
if (PRIVACY_FEATURES_ENABLED) {
  server.register(consentMiddleware)    // Only for /api/* routes
  server.register(auditMiddleware)      // Logs privacy-related actions
  server.register(dataFilterMiddleware) // Filters based on consent
}
```

---

## 4 · Integration Security Architecture

### 4.1 Authentication Integration
**Existing Auth (Enhanced, Not Replaced):**
- ✅ **Preserved**: Existing user authentication system
- ✅ **Extended**: Additional privacy-related permissions
- ✅ **Role-based**: New roles for compliance officers, auditors

### 4.2 Data Security Integration
**Privacy-First Enhancements:**
```typescript
// Existing Data Flow (ENHANCED)
User Request → Auth Check → Core Processing → Response

// Epic 19 Enhanced Flow (CONDITIONAL)
User Request → Auth Check → Consent Check → Privacy Filter → 
Core Processing → Audit Log → Response
```

### 4.3 Compliance Security Measures
**Regulatory Compliance Integration:**
- **Encryption**: All privacy data encrypted at rest
- **Access logs**: Complete audit trail for all privacy operations  
- **Data minimization**: Only collect necessary privacy data
- **Right to deletion**: Complete data removal capabilities

---

## 5 · Performance & Scaling Integration

### 5.1 Performance Impact Mitigation
**Core Performance Preserved:**
- ✅ **Cache layer**: Privacy checks cached to avoid latency
- ✅ **Lazy loading**: Privacy UI components load on-demand  
- ✅ **Background processing**: Compliance reports generated async
- ✅ **Feature flags**: Disable privacy features for performance testing

### 5.2 Scaling Strategy
**Independent Scaling:**
```
Core Services (Existing):
├── Graph Engine → Scaled for prompt generation load
├── Export API → Scaled for bundle generation
└── Client UI → CDN distribution

Privacy Services (New):
├── Consent Service → Scaled for consent check volume  
├── Audit Service → Scaled for compliance reporting
└── Policy Service → Scaled for enterprise policy management
```

---

## 6 · Rollback & Recovery Architecture

### 6.1 Feature Flag Architecture
```typescript
interface FeatureFlags {
  PRIVACY_CONSENT_BANNER: boolean;
  PRIVACY_POLICY_MANAGEMENT: boolean; 
  PRIVACY_DATA_GOVERNANCE: boolean;
  PRIVACY_COMPLIANCE_REPORTING: boolean;
  PRIVACY_AUDIT_LOGGING: boolean;
}

// Instant rollback capability
const rollbackPrivacyFeatures = () => {
  updateFeatureFlags({
    PRIVACY_CONSENT_BANNER: false,
    PRIVACY_POLICY_MANAGEMENT: false,
    PRIVACY_DATA_GOVERNANCE: false, 
    PRIVACY_COMPLIANCE_REPORTING: false,
    PRIVACY_AUDIT_LOGGING: false
  });
};
```

### 6.2 Database Rollback Strategy
```sql
-- Clean Epic 19 rollback (if needed)
DROP TABLE IF EXISTS consent_records;
DROP TABLE IF EXISTS policy_assignments;
DROP TABLE IF EXISTS data_classifications;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS compliance_reports;

-- Core system remains unchanged
-- No dependencies to break
```

### 6.3 User Communication Strategy
**Rollback Communication Plan:**
1. **Advance notice**: 48-hour warning for major changes
2. **Feature status**: Clear indication when privacy features disabled
3. **Data preservation**: User data exported before rollback
4. **Migration path**: Clear upgrade path when features re-enabled

---

## 7 · Integration Testing Strategy

### 7.1 Regression Testing
**Core Functionality Verification:**
- ✅ **Graph creation**: Ensure prompt graph creation unchanged
- ✅ **Graph execution**: <1s performance target maintained  
- ✅ **Export/import**: Bundle generation works with privacy enabled
- ✅ **API compatibility**: All existing API integrations preserved

### 7.2 Integration Testing
**Privacy Feature Testing:**
- ✅ **Consent flow**: Privacy banners don't break graph workflow
- ✅ **Policy enforcement**: Data governance doesn't block core features
- ✅ **Performance**: Privacy checks don't impact generation speed
- ✅ **Rollback**: Feature flags instantly disable privacy features

### 7.3 User Acceptance Testing
**Dual Experience Validation:**
- **Basic users**: Can use core features without privacy interruption
- **Enterprise users**: Can access privacy features without confusion
- **Migration**: Existing users smoothly transition with privacy options

---

## 8 · Deployment Integration Strategy

### 8.1 Deployment Architecture
```
Production Deployment:
┌─────────────────────────────────────────┐
│             Load Balancer               │
├─────────────────────────────────────────┤
│          Core Services (v1)             │
│  ┌─────────────┐ ┌─────────────────────┐ │
│  │Graph Engine │ │  Export/CLI APIs    │ │
│  │(Unchanged)  │ │  (Unchanged)        │ │
│  └─────────────┘ └─────────────────────┘ │
├─────────────────────────────────────────┤
│        Privacy Services (v2)            │
│  ┌─────────────┐ ┌─────────────────────┐ │
│  │Privacy APIs │ │ Compliance Engine   │ │
│  │(New)        │ │ (New)               │ │
│  └─────────────┘ └─────────────────────┘ │
├─────────────────────────────────────────┤
│          Shared Infrastructure          │
│  ┌─────────────┐ ┌─────────────────────┐ │
│  │  Database   │ │    File Storage     │ │
│  │(Extended)   │ │   (Extended)        │ │
│  └─────────────┘ └─────────────────────┘ │
└─────────────────────────────────────────┘
```

### 8.2 Blue-Green Deployment
**Zero-Downtime Strategy:**
1. **Green environment**: Deploy with privacy features disabled
2. **Validation**: Run regression tests on core functionality
3. **Feature toggle**: Gradually enable privacy features
4. **Monitoring**: Real-time performance and error monitoring
5. **Rollback**: Instant switch to previous version if issues

---

## Change Log
| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-07-21 | 1.0 | Initial brownfield architecture for Epic 19 integration | PO-Sarah |

---

**Next Steps:**
1. **Create frontend-architecture.md** for UI/UX privacy component strategy
2. **Document rollback procedures** for 267 recent commits  
3. **Establish integration testing** for privacy features
4. **Create performance monitoring** for privacy impact assessment

This architecture ensures Epic 19 privacy features integrate seamlessly without disrupting the core PromptScape functionality while providing enterprise-grade compliance capabilities.