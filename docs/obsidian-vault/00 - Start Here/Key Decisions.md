# 🎯 Key Decisions

## Major Architectural and Product Decisions

This document captures the critical decisions that shaped Prompt Spaghetti's evolution.

---

## 🏛️ Architecture Decisions

### 1. **Monorepo Structure** (Early 2024)

**Decision**: Use pnpm workspace monorepo
**Rationale**:

- Shared code between client/server
- Unified versioning
- Easier refactoring
  **Impact**: Enabled rapid development but led to complexity
  **Documents**: [[02 - Architecture/Monorepo Strategy]]

### 2. **React Flow for Graph Visualization**

**Decision**: Build on React Flow instead of custom canvas
**Rationale**:

- Proven library with good performance
- Active community
- Extensible architecture
  **Impact**: Accelerated development, professional UI
  **Trade-offs**: Some limitations in custom behaviors

### 3. **Deterministic Execution Engine**

**Decision**: Seed-based randomization for reproducibility
**Rationale**:

- Same input + seed = same output
- Debugging friendly
- Professional use cases need repeatability
  **Impact**: Core differentiator for the product

### 4. **TypeScript + Zod**

**Decision**: Full TypeScript with Zod runtime validation
**Rationale**:

- Type safety across stack
- Runtime validation for user inputs
- Self-documenting code
  **Impact**: Reduced bugs, better DX

---

## 📦 Technology Stack Evolution

### Initial Stack (v0.1)

- React + JavaScript
- Express backend
- Local storage only

### Current Stack (v1.0)

- React 18 + TypeScript
- Fastify backend
- Supabase for cloud storage
- Zustand for state management
- React Flow for graph UI

### Removed Technologies

- Redux (replaced with Zustand)
- GraphQL (simplified to REST)
- Multiple auth systems (consolidated)

---

## 🎨 Product Decisions

### 1. **"Photoshop for Prompts" Vision**

**Decision**: Professional creative tool, not a simple generator
**Rationale**:

- Target power users
- Differentiate from competitors
- Enable complex workflows
  **Impact**: Drove feature prioritization toward professional tools

### 2. **Node-Based Interface**

**Decision**: Graph/node paradigm over linear builders
**Rationale**:

- Visual programming familiar to creatives
- Handles complexity better
- Enables non-linear flows
  **Impact**: Steeper learning curve but more powerful

### 3. **PSG File Format**

**Decision**: Custom file format for graphs
**Rationale**:

- Optimized for our use case
- Version control friendly
- Human-readable JSON
  **Documents**: [[04 - Technical Specs/PSG Format Specification]]

### 4. **Asset Browser Integration**

**Decision**: Built-in preset/template system
**Rationale**:

- Accelerate user onboarding
- Share community creations
- Reduce blank canvas problem
  **Impact**: Major differentiator, improved UX

---

## 💰 Technical Debt Decisions

### The Great Cleanup (August 2024)

**Decision**: Massive refactoring to reduce tech debt
**Context**:

- 290+ service classes
- 4+ auth implementations
- $100k/month productivity loss
  **Action**:
- Consolidated to 3 core packages
- Removed 900k+ lines of code
- Unified architecture
  **Documents**: [[10 - Archive/Technical Debt Report]]

### Feature Freeze for Demo

**Decision**: Stop new features, focus on stability
**Rationale**:

- Demo deadline approaching
- Too many incomplete features
- Need stable baseline
  **Impact**: Successful demo release

---

## 🚫 What We Decided NOT to Do

### Rejected Approaches

1. **GraphQL API** - Too complex for our needs
2. **Microservices** - Premature optimization
3. **Custom Canvas** - React Flow was sufficient
4. **Blockchain Storage** - Over-engineering
5. **Native Apps** - Web-first strategy

### Deprecated Features

- Epic 17 incident playbooks
- Multi-agent coordination UI
- Real-time collaboration (postponed)
- Plugin system (future roadmap)

---

## 📊 Decision Framework

### How We Make Decisions

1. **User Value First** - Does it help users create better prompts?
2. **Technical Feasibility** - Can we build and maintain it?
3. **Time to Market** - How quickly can we ship?
4. **Differentiation** - Does it set us apart?
5. **Technical Debt** - What's the long-term cost?

### Decision Records

- [[02 - Architecture/ADR-001-repository-pattern]]
- [[02 - Architecture/ADR-002-typescript-strict-mode]]
- [[02 - Architecture/ADR-009-core-engine-refactoring]]
- [[02 - Architecture/ADR-010-security-validation]]

---

## 🔮 Pending Decisions

### Near-term

- [ ] Open source licensing model
- [ ] Monetization strategy
- [ ] Plugin architecture
- [ ] Mobile support approach

### Long-term

- [ ] AI integration depth
- [ ] Enterprise features
- [ ] SaaS vs self-hosted
- [ ] Marketplace model

---

## 📚 Related Documents

- [[00 - Start Here/Project Timeline]] - When decisions were made
- [[02 - Architecture/Architecture Principles]] - Guiding principles
- [[03 - Development Journey/Lessons Learned]] - Decision outcomes
- [[10 - Archive/Failed Experiments]] - What didn't work

---

_Last Updated: September 2024_
