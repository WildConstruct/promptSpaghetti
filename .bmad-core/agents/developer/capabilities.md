# Developer Agent Capabilities

## Core Development Capabilities

### 1. Task Management

- **Grab Tasks**: `node src/grab-tasks.js claude_dev [task_count]`
- **Finish Tasks**: `node src/finish-task.js <task-id> [REVIEW|COMPLETED|BLOCKED]`
- **Monitor Tasks**: `node src/monitor-available-tasks.js`
- **Check Status**: Query current task assignments and progress

### 2. Code Implementation

- **Frontend Development**: React components, TypeScript interfaces, styling
- **Backend Development**: Node.js services, API endpoints, middleware
- **Testing**: Unit tests, integration tests, security tests
- **Security**: Input validation, XSS prevention, authentication flows

### 3. Architecture Understanding

- **Monorepo Structure**: Navigate and work across packages (core, client, server, cli)
- **Design Patterns**: Follow established patterns for node types, editors, validators
- **State Management**: Zustand stores, React context, component state
- **API Design**: RESTful endpoints, WebSocket connections, schema validation

### 4. Technology Stack Proficiency

#### Frontend Stack

- React 18 with hooks and functional components
- TypeScript for type safety
- Vite for build tooling
- React Flow for node-based UI
- Zustand for state management
- Jest and React Testing Library for testing

#### Backend Stack

- Node.js with TypeScript
- Fastify web framework
- Zod for schema validation
- WebSocket for real-time features
- Jest for testing

#### Development Tools

- ESLint with Airbnb configuration
- pnpm for package management
- Git for version control
- Proper lockfile for concurrent task management

### 5. Security Expertise

- **Input Validation**: Zod schemas, pattern matching, sanitization
- **XSS Prevention**: AST-based expression evaluation, safe DOM handling
- **Authentication**: JWT tokens, session management, role-based access
- **Data Protection**: Encryption, secure storage, privacy compliance

## Workflow Integration

### Development Process

1. **Task Assignment**: Self-assign from available task pool
2. **Analysis**: Review task requirements and acceptance criteria
3. **Planning**: Understand existing code patterns and architecture
4. **Implementation**: Write secure, tested, maintainable code
5. **Validation**: Ensure tests pass and security requirements are met
6. **Completion**: Mark task for review with proper documentation

### Quality Assurance

- **Test Coverage**: Maintain 80% global, 90% for core modules
- **Security Review**: Follow OWASP guidelines and security checklists
- **Code Review**: Adhere to established coding standards and patterns
- **Performance**: Ensure optimal performance for graph operations

### Documentation Standards

- **Code Comments**: Explain complex logic and architectural decisions
- **Commit Messages**: Clear, descriptive commit messages following conventions
- **API Documentation**: Update schemas and endpoint documentation
- **Architecture Notes**: Document significant design decisions

## Specialized Knowledge Areas

### 1. Graph Editor System

- **Node Types**: WeightedChoice, Conditional, Sequential, Markov nodes
- **Editor Components**: Inspector panels, node editors, validation systems
- **Execution Engine**: Deterministic runtime with seeded randomization
- **Schema Management**: Zod validation for UI and runtime schemas

### 2. Advanced Node Capabilities (Epic 7)

- **AdvancedRuntimeNode**: State management, caching, performance tracking
- **I/O System**: Type-safe input/output handling with validation
- **Expression Evaluation**: Safe JavaScript execution with AST parsing
- **Serialization**: Complex node state persistence and restoration

### 3. Security Implementation

- **Expression Security**: Block eval, constructor, prototype pollution
- **Input Validation**: Comprehensive validation with security patterns
- **Authentication Systems**: Multi-factor authentication, session management
- **Data Protection**: Encryption, secure storage, privacy controls

### 4. Testing Strategy

- **Unit Testing**: Component and function-level testing
- **Integration Testing**: End-to-end workflow testing
- **Security Testing**: Penetration testing with OWASP payloads
- **Performance Testing**: Load testing and optimization validation

## Constraints and Guidelines

### What the Agent Can Do

- Implement new features following established patterns
- Fix bugs and security vulnerabilities
- Add comprehensive test coverage
- Update documentation and schemas
- Optimize performance and maintainability

### What the Agent Should Avoid

- Breaking existing APIs or interfaces
- Introducing security vulnerabilities
- Bypassing established validation patterns
- Creating technical debt
- Making architectural changes without proper review

### Quality Gates

- All tests must pass before task completion
- Security review required for authentication/validation changes
- Code coverage thresholds must be maintained
- No ESLint errors or warnings
- Proper TypeScript typing without `any` usage
