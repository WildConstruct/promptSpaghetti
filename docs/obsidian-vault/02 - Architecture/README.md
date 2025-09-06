# 🏗️ Architecture Documentation

## System Architecture Overview

This section contains all architectural documentation, decisions, and technical specifications for Prompt Spaghetti.

---

## 📐 Architecture Layers

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **State Management**: Zustand
- **Graph Visualization**: React Flow
- **Styling**: CSS Modules + Tailwind
- **Build Tool**: Vite

### Backend Architecture
- **Runtime**: Node.js 18+
- **Framework**: Fastify
- **Database**: SQLite (local) + Supabase (cloud)
- **Validation**: Zod schemas
- **Authentication**: Supabase Auth

### Core Engine
- **Execution**: Deterministic graph traversal
- **Randomization**: Seeded PRNG
- **Node System**: Extensible base classes
- **I/O Handling**: Type-safe pipelines

---

## 📚 Key Documents

### Architectural Decision Records (ADRs)
- [[ADR-001-repository-pattern]] - Repository pattern implementation
- [[ADR-002-typescript-strict-mode]] - TypeScript configuration
- [[ADR-009-Core-Engine-Refactoring-Architecture]] - Engine redesign
- [[ADR-010-Security-Validation-Framework]] - Security architecture
- [[ADR-011-Component-Modernization-Strategy]] - UI component strategy

### System Design
- [[core-subsystems]] - Core subsystem breakdown
- [[node-architecture-design]] - Node system architecture
- [[node-lifecycle-design]] - Node execution lifecycle
- [[current-architecture-analysis]] - Current state analysis
- [[target-architecture-definition]] - Target architecture vision

### Technical Specifications
- [[technical-architecture-specification]] - Detailed tech specs
- [[integration-guide]] - Integration patterns
- [[plugin-extension-system]] - Plugin architecture (future)
- [[template-parsing-specification]] - Template parsing system

### Governance & Standards
- [[architecture-governance-framework]] - Governance processes
- [[architecture-rules]] - Architecture principles
- [[coding-standards]] - Code style guide
- [[tech-stack]] - Technology stack details

---

## 🔧 Core Components

### 1. Graph Engine
```
packages/core/runtime/
├── index.ts           # Core runtime
├── advanced.ts        # Advanced features
├── io-system.ts       # I/O handling
└── nodes/            # Node implementations
```

### 2. Visual Editor
```
client/src/
├── components/       # React components
├── stores/          # Zustand stores
└── hooks/           # Custom hooks
```

### 3. Asset Browser
```
packages/asset-browser/
├── components/      # Browser UI
├── services/        # Asset loading
└── types/          # TypeScript types
```

---

## 🔄 Data Flow

```mermaid
graph LR
    User --> Editor
    Editor --> Graph
    Graph --> Engine
    Engine --> Output
    Output --> Preview
```

1. **User Input** → Visual editor
2. **Graph Construction** → Node connections
3. **Validation** → Zod schemas
4. **Execution** → Deterministic engine
5. **Output** → Generated text

---

## 🛡️ Security Architecture

- [[mfa-system-architecture]] - Multi-factor auth design
- Input validation at all boundaries
- Sandboxed execution environment
- Rate limiting and throttling
- Audit logging

---

## 📊 Performance Considerations

### Optimization Strategies
- React.memo for component optimization
- Virtual scrolling for large graphs
- Debounced operations
- Lazy loading of assets
- Code splitting

### Benchmarks
- Graph execution: <1s for 5 variants
- Large graphs: 45 FPS with 250 nodes
- Bundle size: 2.8MB gzipped
- Memory usage: <280MB typical

---

## 🔌 Integration Points

### External Services
- **Supabase**: Authentication & storage
- **Vercel**: Deployment platform
- **GitHub**: Version control & CI/CD

### API Interfaces
- REST API for graph operations
- WebSocket for real-time updates (future)
- File import/export (PSG format)

---

## 📈 Evolution Path

### Current Architecture (v1.0)
- Monolithic frontend
- REST API backend
- Local + cloud storage

### Future Architecture (v2.0)
- Micro-frontends
- GraphQL federation
- Plugin marketplace
- Real-time collaboration

---

## 🏛️ Architecture Principles

1. **Simplicity First** - Don't over-engineer
2. **Type Safety** - TypeScript everywhere
3. **Deterministic** - Reproducible results
4. **Extensible** - Plugin-friendly design
5. **Performance** - Sub-second operations
6. **Security** - Defense in depth

---

## 📚 Related Sections

- [[00 - Start Here/Key Decisions]] - Architectural decisions
- [[04 - Technical Specs/README]] - Detailed specifications
- [[09 - Performance/README]] - Performance documentation
- [[10 - Archive/Legacy Architecture]] - Historical designs

---

*For implementation details, see the source code in `packages/core/` and `client/src/`*