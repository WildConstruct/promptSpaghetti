# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Final QA testing checklist and release preparation

### Changed

- Updated documentation for Epic 4 completion

### Fixed

- Performance optimizations for large graphs

## [0.1.0-alpha] - 2025-07-15

### Added

- **Epic 1: Foundation & Core Infrastructure**
  - Monorepo structure with pnpm workspaces
  - Development container with Node 18, Python 3.11
  - React-Flow canvas skeleton with grid and minimap
  - GitHub Actions CI pipeline with linting and testing
  - Preview deployment on Vercel

- **Epic 2: Editor MVP (Graph Authoring)**
  - Core node library with 6 node types (WeightedChoice, Concat, Output, Include, SetVariable, GetVariable)
  - Visual node connections with real-time validation
  - Node inspector with schema-driven forms
  - Preview-5 modal for testing graph outputs
  - Graph JSON autosave to localStorage with restore functionality

- **Epic 3: Executor & Integration**
  - Deterministic graph executor with seeded randomization
  - CLI wrapper for batch execution (`npx promptgraph exec`)
  - Export to GeneratorBundle format for compatibility
  - Import legacy bundle functionality
  - Determinism test matrix with golden file validation
  - Preview API endpoint for graph execution

- **Epic 4: Alpha Hardening & DX Polish**
  - Performance profiling and optimization
    - React.memo optimization for components
    - Playwright performance testing for large graphs
    - Memory usage monitoring and optimization
    - Bundle size analysis and optimization
  - Corrections Manager feature flag
    - In-memory corrections store with Zustand
    - CRUD operations for find/replace rules
    - Regex pattern support
    - Integration with graph execution pipeline
  - Vercel production deployment
    - Serverless functions for API endpoints
    - CDN configuration for static assets
    - Environment variable management
    - Health check endpoints
  - Comprehensive documentation
    - Updated README with architecture diagrams
    - Technical architecture documentation
    - Content authoring guide for users
    - API documentation and deployment guide
    - Performance monitoring documentation

### Technical Improvements

- **Performance Optimizations**
  - Memoized React components to prevent unnecessary re-renders
  - Debounced validation and autosave operations
  - Efficient graph traversal algorithms
  - Canvas virtualization for large graphs (>500 nodes)
  - Bundle splitting for optimal loading

- **Development Experience**
  - Comprehensive test coverage with Jest and React Testing Library
  - Playwright end-to-end testing for critical workflows
  - ESLint and Prettier for code quality
  - TypeScript for type safety
  - Zod for runtime validation

- **Production Readiness**
  - Vercel Edge Functions for API scaling
  - CORS configuration for cross-origin requests
  - Environment-specific configurations
  - Health monitoring and error tracking
  - Security headers and XSS prevention

### Architecture

- **Monorepo Structure**
  - `client/`: React + Vite frontend
  - `server/`: Node.js Fastify API
  - `packages/core/`: Shared TypeScript library
  - `packages/cli/`: Command-line interface
  - `api/`: Vercel serverless functions

- **Core Features**
  - Deterministic execution with seedrandom
  - Real-time graph validation
  - Schema-driven UI forms
  - Extensible node system
  - Bundle export/import compatibility

### Dependencies

- **Frontend**: React 18, Vite, React-Flow, Zustand, Zod
- **Backend**: Node.js 18, Fastify, TypeScript
- **Testing**: Jest, React Testing Library, Playwright
- **Deployment**: Vercel, GitHub Actions
- **Development**: ESLint, Prettier, pnpm

### Browser Support

- Chrome ≥ 113
- Firefox ≥ 114
- Safari ≥ 16
- Edge (latest)

### Performance Targets

- Graph execution (5 variants): < 1 second
- Large graph rendering (250 nodes): > 30 FPS
- Memory usage: < 500MB during execution
- Bundle size: < 5MB total

### Known Limitations

- Canvas virtualization not implemented for >500 nodes
- No real-time collaboration features
- Limited to 6 core node types
- No persistent storage (localStorage only)
- No user authentication system

### Security Features

- XSS prevention through input sanitization
- CORS configuration for API endpoints
- Rate limiting on API requests
- Secure environment variable handling
- Content Security Policy headers

### Migration Notes

- No breaking changes from previous versions
- Backward compatible with existing graph formats
- Environment variables need to be configured for production
- New corrections feature requires `ENABLE_CORRECTIONS` flag

### Contributors

- Epic 1: Foundation setup and infrastructure
- Epic 2: Graph editor and UI components
- Epic 3: Execution engine and API development
- Epic 4: Performance optimization and production deployment

---

## Development Guidelines

### Versioning Strategy

- **Major** (X.y.z): Breaking changes to API or graph format
- **Minor** (x.Y.z): New features, backward compatible
- **Patch** (x.y.Z): Bug fixes, performance improvements

### Release Process

1. Complete all Epic requirements
2. Pass QA testing checklist
3. Update CHANGELOG.md
4. Create release tag
5. Deploy to production
6. Monitor for issues

### Future Roadmap

- **v0.2.0**: Additional node types and Python integration
- **v0.3.0**: Real-time collaboration features
- **v1.0.0**: Full production release with persistent storage

---

_For detailed technical information, see the [Architecture Documentation](docs/architecture.md)._
