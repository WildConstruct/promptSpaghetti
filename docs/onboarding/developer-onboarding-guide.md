# Developer Onboarding Guide

## Welcome to the Graph Editor Enhancement Project! 👋

This guide will help you quickly understand and contribute to our three major enhancement epics. Each epic has its own section with specific setup instructions, key concepts, and development patterns.

---

## 🚀 Quick Start (All Developers)

### Prerequisites

```bash
# Required versions
node >= 18.0.0
pnpm >= 8.0.0
git >= 2.30.0

# Optional but recommended
docker >= 20.10.0  # For Supabase local development
```

### Initial Setup

```bash
# Clone the repository
git clone <repository-url>
cd prompt-spaghetti

# Install dependencies
pnpm install

# Start development environment
pnpm dev

# Run tests
pnpm test

# Check code quality
pnpm lint
```

### Project Structure

```
prompt-spaghetti/
├── client/                 # React frontend application
├── server/                 # Fastify backend API
├── packages/
│   ├── core/              # Shared components and logic
│   ├── asset-browser/     # File browser components
│   └── cli/               # CLI tools
├── docs/
│   ├── stories/           # User story specifications
│   ├── technical-designs/ # Architecture documents
│   └── onboarding/        # This guide and others
```

### Key Technologies

- **Frontend**: React 18, TypeScript, React Flow, Zustand
- **Backend**: Node.js, Fastify, Supabase
- **Testing**: Jest, React Testing Library
- **Build**: Vite, pnpm workspaces

---

## 📚 Epic 1: Browser State Persistence (Stories 1.19-1.21)

### Overview

Implement automatic state saving to prevent data loss on browser refresh.

### Key Concepts

#### Zustand Store Enhancement

```typescript
// Current store location: packages/core/graphStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// You'll be adding persistence middleware
const useGraphStore = create(
  persist(
    set => ({
      // existing store logic
    }),
    {
      name: 'promptgraph:state:v1'
      // your persistence config
    }
  )
);
```

#### LocalStorage Management

```typescript
// Key patterns to follow
const STORAGE_KEYS = {
  STATE: 'promptgraph:state:v1',
  METADATA: 'promptgraph:meta:v1',
  BACKUP: 'promptgraph:backup:v1'
};

// Always validate on load
const loadState = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.STATE);
    return validateState(JSON.parse(stored));
  } catch {
    return null;
  }
};
```

### Development Workflow

#### Story 1.19: Local Storage Persistence

```bash
# Branch naming
git checkout -b story/1.19-local-storage-persistence

# Key files to modify
packages/core/graphStore.ts         # Add persist middleware
packages/core/persistence/index.ts  # Create persistence utilities
packages/core/__tests__/persistence.test.ts  # Add tests

# Testing localStorage
npm test -- --testPathPattern=persistence

# Manual testing
1. Open app in browser
2. Create a graph with nodes
3. Refresh page
4. Graph should restore
```

#### Story 1.20: Autosave Implementation

```bash
# Key implementation points
1. Create useAutosave hook
2. Debounce save operations (30 seconds)
3. Add visual indicator component
4. Handle multi-tab conflicts

# Component location
packages/core/components/AutosaveIndicator.tsx

# Testing autosave
- Use Jest fake timers
- Test debounce behavior
- Verify conflict detection
```

#### Story 1.21: State Restoration

```bash
# Recovery UI components
packages/core/components/recovery/
  ├── StateRecoveryDialog.tsx
  ├── RecoveryReport.tsx
  └── StorageInfo.tsx

# Test corruption scenarios
1. Manually corrupt localStorage
2. Verify recovery dialog appears
3. Test partial recovery
```

### Common Pitfalls & Solutions

| Issue               | Solution                                |
| ------------------- | --------------------------------------- |
| Quota exceeded      | Implement compression (lz-string)       |
| Circular references | Use custom JSON serializer              |
| Performance lag     | Debounce saves, use requestIdleCallback |
| Tab sync issues     | Use storage events for coordination     |

### Testing Checklist

- [ ] State persists across refresh
- [ ] Autosave triggers after changes
- [ ] Recovery UI handles corruption
- [ ] No performance regression
- [ ] Multi-tab synchronization works

---

## 🔐 Epic 2: User Authentication System (Stories 1.22-1.24)

### Overview

Implement secure authentication with Supabase to enable cloud features.

### Key Concepts

#### Supabase Setup

```bash
# Local Supabase development
npx supabase init
npx supabase start

# Environment variables (.env.local)
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=your-anon-key
```

#### UserProvider Pattern

```typescript
// Location: packages/asset-browser/src/user/UserProvider.tsx
import { createContext, useContext } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';

// Existing context to enhance
const UserContext = createContext<UserContextValue>();

// You'll add these methods
interface UserContextValue {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  // ... more auth methods
}
```

### Development Workflow

#### Story 1.22: Auth UI Components

```bash
# Component structure
packages/core/components/auth/
  ├── AuthModal.tsx         # Main modal container
  ├── LoginForm.tsx         # Login tab
  ├── SignupForm.tsx        # Signup tab
  ├── validation.ts         # Form validation

# Styling approach
- Use existing design system
- Follow accessibility guidelines
- Implement proper ARIA labels

# Testing forms
npm test -- --testPathPattern=auth-components
```

#### Story 1.23: Supabase Integration

```typescript
// Key integration points
1. Session restoration on app load
2. Token refresh before expiry
3. Auth state change subscription
4. Cross-tab synchronization

// Session management pattern
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      // Handle auth events
    }
  )
  return () => subscription.unsubscribe()
}, [])
```

#### Story 1.24: Feature Gating

```typescript
// Feature gate hook pattern
const { Gate } = useFeatureGate({
  requireAuth: true,
  fallback: <LoginPrompt />
})

return (
  <Gate>
    <CloudSaveButton />
  </Gate>
)
```

### Security Considerations

- Never store tokens in localStorage
- Use httpOnly cookies for sessions
- Implement CSRF protection
- Add rate limiting to auth endpoints
- Validate all inputs server-side

### Testing Checklist

- [ ] Login/signup flow works
- [ ] Session persists across refresh
- [ ] Token refresh happens automatically
- [ ] Anonymous mode fully functional
- [ ] Feature gates work correctly

---

## 🎨 Epic 3: Graph Annotation & Visualization (Stories 1.25-1.28)

### Overview

Add professional annotation tools and advanced edge routing capabilities.

### Key Concepts

#### React Flow Custom Nodes

```typescript
// Custom node pattern
const GroupNode = ({ data, selected }) => {
  return (
    <div className="group-node">
      <Handle type="target" position="top" />
      {/* Your node content */}
      <Handle type="source" position="bottom" />
    </div>
  )
}

// Register custom nodes
const nodeTypes = {
  groupNode: GroupNode,
  // ... other custom nodes
}
```

#### Annotation Layer System

```typescript
// Layer architecture
interface AnnotationLayer {
  id: string;
  annotations: Annotation[];
  visible: boolean;
  zIndex: number;
}

// Annotation types
type Annotation = PostItNote | BoundingBox | Connector;
```

### Development Workflow

#### Story 1.25: Post-it Notes

```bash
# Component structure
packages/core/components/annotations/
  ├── PostItNote.tsx
  ├── NoteEditor.tsx
  └── NoteStyles.ts

# Markdown support
npm install react-markdown

# Drag and drop
- Use React Flow's drag handlers
- Implement attachment detection
```

#### Story 1.26: Bounding Boxes

```typescript
// Geometry utilities needed
export function isNodeInBox(node: Node, box: Bounds): boolean;
export function getNodesInBox(nodes: Node[], box: Bounds): Node[];

// Drawing interaction
const handleAltDrag = event => {
  if (event.altKey) {
    startDrawingBox(event);
  }
};
```

#### Story 1.27: Node Grouping

```typescript
// Group management
const groupManager = {
  createGroup: (nodeIds: string[]) => NodeGroup,
  collapseGroup: (groupId: string) => void,
  expandGroup: (groupId: string) => void
}

// Keyboard shortcuts
Cmd+G: Group selected
Cmd+Shift+G: Ungroup
```

#### Story 1.28: Edge Routing

```typescript
// Routing algorithms
const routers = {
  orthogonal: OrthogonalRouter, // Right angles
  smooth: BezierRouter, // Curved paths
  step: StepRouter // Stair pattern
};

// Control points
interface ControlPoint {
  x: number;
  y: number;
  type: 'smooth' | 'sharp';
}
```

### Performance Optimization

```typescript
// Viewport culling for annotations
const visibleAnnotations = annotations.filter(ann =>
  isInViewport(ann, viewport)
);

// Batch rendering
requestAnimationFrame(() => {
  renderAnnotations(visibleAnnotations);
});

// Use React.memo for expensive components
const MemoizedAnnotation = React.memo(Annotation);
```

### Testing Checklist

- [ ] Annotations persist with graph
- [ ] Bounding boxes contain nodes correctly
- [ ] Groups collapse/expand properly
- [ ] Edge routing algorithms work
- [ ] Performance with 100+ annotations

---

## 🛠️ Development Best Practices

### Code Style Guidelines

```typescript
// Component naming
ComponentName.tsx       // PascalCase for components
useHookName.ts         // camelCase with 'use' prefix
utilityFunction.ts     // camelCase for utilities

// File organization
components/
  ComponentName/
    ├── ComponentName.tsx
    ├── ComponentName.test.tsx
    ├── ComponentName.css
    └── index.ts

// TypeScript patterns
- Use interfaces over types when possible
- Explicit return types for functions
- Avoid any, use unknown if needed
```

### Git Workflow

```bash
# Branch naming
story/1.XX-brief-description

# Commit messages
feat: add autosave functionality
fix: resolve localStorage quota issue
test: add persistence integration tests
docs: update onboarding guide

# PR process
1. Create feature branch
2. Implement with tests
3. Self-review changes
4. Create PR with description
5. Address review feedback
6. Squash and merge
```

### Testing Standards

```typescript
// Test file naming
ComponentName.test.tsx
functionName.test.ts

// Test structure
describe('ComponentName', () => {
  describe('when condition', () => {
    it('should behavior', () => {
      // Arrange
      // Act
      // Assert
    })
  })
})

// Coverage requirements
- Minimum 80% overall
- 90% for critical paths
- 100% for utility functions
```

### Performance Guidelines

- Debounce expensive operations (min 300ms)
- Use React.memo for pure components
- Implement virtual scrolling for lists > 50 items
- Profile with React DevTools before optimizing
- Target 60fps for all interactions

---

## 📖 Resources

### Documentation

- [Technical Designs](/docs/technical-designs/) - Architecture details
- [User Stories](/docs/stories/) - Requirements and acceptance criteria
- [API Documentation](/docs/api/) - Backend endpoints

### Key Files to Study

```
Epic 1 (Persistence):
- packages/core/graphStore.ts
- packages/core/validation.ts

Epic 2 (Auth):
- packages/asset-browser/src/user/UserProvider.tsx
- packages/core/utils/supabaseClient.ts

Epic 3 (Annotations):
- packages/core/GraphEditor.tsx
- packages/core/components/nodes/
```

### Useful Commands

```bash
# Development
pnpm dev                    # Start dev server
pnpm test -- --watch       # Run tests in watch mode
pnpm lint --fix           # Auto-fix linting issues

# Debugging
npm run test -- --coverage  # Check test coverage
npm run build              # Test production build
npm run analyze            # Bundle size analysis

# Supabase
npx supabase status        # Check local Supabase
npx supabase db reset      # Reset database
```

### Getting Help

- **Slack**: #graph-editor-dev
- **Documentation**: /docs folder
- **Tech Lead**: Contact for architectural decisions
- **Code Reviews**: Tag @senior-developers

---

## 🎯 Your First Task

### Recommended Starting Points

#### For Frontend Developers

Start with **Story 1.22** (Auth UI Components)

- Clear requirements
- Minimal dependencies
- Good introduction to codebase

#### For Full-Stack Developers

Start with **Story 1.19** (Local Storage Persistence)

- Core functionality
- Touches multiple layers
- High impact

#### For Backend Developers

Start with **Story 1.23** (Supabase Integration)

- Backend-focused
- Security considerations
- API design

### First Day Checklist

- [ ] Environment setup complete
- [ ] Can run tests successfully
- [ ] Reviewed assigned story
- [ ] Located key files
- [ ] Asked questions in Slack
- [ ] Created feature branch
- [ ] Written first test

---

## 🚨 Troubleshooting

### Common Issues

| Problem                | Solution                                        |
| ---------------------- | ----------------------------------------------- |
| `pnpm install` fails   | Clear node_modules and pnpm-lock.yaml, retry    |
| Supabase won't start   | Check Docker is running, ports 54321/54322 free |
| Tests timing out       | Increase Jest timeout in jest.config.js         |
| Build fails            | Check TypeScript errors with `pnpm tsc`         |
| Hot reload not working | Clear Vite cache: `rm -rf node_modules/.vite`   |

### Debug Mode

```bash
# Enable verbose logging
DEBUG=* pnpm dev

# Debug specific module
DEBUG=app:* pnpm dev

# Debug tests
npm test -- --detectOpenHandles
```

---

## 💡 Pro Tips

1. **Use the DevTools**: React DevTools and Redux DevTools are invaluable
2. **Read the tests**: Tests document expected behavior
3. **Check PR history**: See how similar features were implemented
4. **Ask questions early**: Don't spend > 30 min stuck
5. **Document as you go**: Update this guide with your learnings

---

## 📝 Notes Section

Use this space to add your own notes as you learn the codebase:

```
Your notes here...
```

---

Welcome aboard! We're excited to have you contributing to this project. Remember, every expert was once a beginner. Don't hesitate to ask questions and suggest improvements to this guide.

Happy coding! 🎉
