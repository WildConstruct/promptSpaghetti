# PromptScape Randomizer Graph

[![codecov](https://codecov.io/gh/WildConstruct/prompt-spaghetti/branch/main/graph/badge.svg)](https://codecov.io/gh/WildConstruct/prompt-spaghetti)
[![CI](https://github.com/WildConstruct/prompt-spaghetti/workflows/CI/badge.svg)](https://github.com/WildConstruct/prompt-spaghetti/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A powerful node-based visual editor for creating deterministic prompt generation graphs. Build complex branching grammars with an intuitive drag-and-drop interface, then execute them with reproducible results.

## 🚀 Features

- **Visual Graph Editor**: Drag-and-drop interface powered by React-Flow
- **Deterministic Execution**: Same graph + seed = identical output every time
- **6 Core Node Types**: WeightedChoice, Concat, Output, Include, SetVariable, GetVariable
- **Real-time Preview**: Generate 5 prompt variants instantly
- **Export/Import**: Compatible with existing Randomizer Engine bundles
- **CLI Support**: Batch execution for automation and CI/CD
- **Performance Optimized**: Handle large graphs with virtualization
- **TypeScript**: Full type safety with Zod schema validation

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Client      │    │   Server/API    │    │      CLI        │
│  (React+Vite)   │◄──►│   (Fastify)     │◄──►│   (Node.js)     │
│  Port: 3000     │    │  Port: 8000     │    │   Batch Exec    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │ Packages/Core   │
                    │ (Shared Logic)  │
                    │ Types, Schemas  │
                    │ Runtime Engine  │
                    └─────────────────┘
```

### Repository Structure

```
promptscape-graph/
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   └── ...
│   └── package.json
├── server/                # Node.js Fastify API
│   ├── src/
│   │   ├── engine.ts      # Graph execution engine
│   │   ├── exporter.ts    # Bundle conversion
│   │   └── index.ts       # API routes
│   └── package.json
├── packages/
│   ├── core/              # Shared TypeScript library
│   │   ├── runtime/       # Execution engine
│   │   ├── GraphEditor.tsx
│   │   ├── graphSchema.ts
│   │   └── ...
│   └── cli/               # Command-line interface
│       ├── cli.js
│       └── package.json
├── api/                   # Vercel serverless functions
│   ├── preview.js
│   ├── export.js
│   └── health.js
├── docs/                  # Documentation
│   ├── prd.md
│   ├── architecture.md
│   ├── deployment.md
│   └── ...
└── tests/                 # Cross-package tests
    ├── performance/
    └── integration/
```

## 🛠️ Quick Start

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/WildConstruct/prompt-spaghetti.git
cd prompt-spaghetti

# Install dependencies
pnpm install

# Start development servers
pnpm dev
```

This will start:

- **Client**: http://localhost:3000 (React UI)
- **Server**: http://localhost:8000 (API)

### Development with DevContainer

For the best development experience:

1. Open in VS Code or Windsurf
2. Install Dev Containers extension
3. Reopen in container when prompted
4. Run `pnpm dev` in the integrated terminal

## 📖 Usage

### Creating Your First Graph

1. **Open the Editor**: Navigate to http://localhost:3000
2. **Add Nodes**: Drag node types from the left palette onto the canvas
3. **Connect Nodes**: Click and drag from output handles to input handles
4. **Configure Nodes**: Click a node to edit its properties in the right sidebar
5. **Preview**: Click "Preview" to generate 5 sample outputs
6. **Export**: Use "Save as JSON" to export your graph

### Node Types

| Node Type          | Description                               | Example Use Case                       |
| ------------------ | ----------------------------------------- | -------------------------------------- |
| **WeightedChoice** | Randomly selects from weighted options    | Choose between different prompt styles |
| **Concat**         | Combines multiple inputs with a separator | Join subject + verb + object           |
| **Output**         | Marks the final output point              | Terminal node for completed prompts    |
| **Include**        | References another graph/bundle           | Modular prompt components              |
| **SetVariable**    | Stores a value for later use              | Remember user's chosen style           |
| **GetVariable**    | Retrieves a stored value                  | Use previously set style               |

### Command Line Interface

```bash
# Execute a graph from the command line
npx promptgraph exec my-graph.json --seed 1234

# Output a specific number of variants
npx promptgraph exec my-graph.json --count 10

# Use random seed
npx promptgraph exec my-graph.json --random
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test -- --coverage

# Run specific test suites
pnpm test -- packages/core
pnpm test -- --testNamePattern="GraphEditor"

# Run performance tests
pnpm test:performance
```

### Test Coverage Requirements

- **Global**: 80% minimum coverage
- **Core Engine**: 90% minimum coverage
- **Critical Paths**: 95% minimum coverage

## 🚀 Deployment

### Production Deployment

The application is deployed on Vercel with automatic deployments:

- **Production**: https://promptscape-graph.vercel.app
- **Staging**: https://promptscape-graph-staging.vercel.app

### Manual Deployment

```bash
# Deploy to Vercel
npm install -g vercel
vercel login
vercel --prod
```

### Environment Variables

Create a `.env` file based on `.env.example`:

```bash
# Copy example environment file
cp .env.example .env

# Edit with your values
ENABLE_CORRECTIONS=true
VITE_API_BASE_URL=http://localhost:8000
```

## 📊 Performance

### Benchmarks

| Metric                            | Target   | Current |
| --------------------------------- | -------- | ------- |
| Graph execution (5 variants)      | < 1s     | 0.3s    |
| Large graph rendering (250 nodes) | > 30 FPS | 45 FPS  |
| Memory usage                      | < 500MB  | 280MB   |
| Bundle size                       | < 5MB    | 2.8MB   |

### Optimization Features

- **React.memo**: Prevents unnecessary re-renders
- **Canvas Virtualization**: Handles 1000+ nodes efficiently
- **Debounced Operations**: Reduces computation overhead
- **Bundle Splitting**: Faster initial load times

## 🔧 Development

### Code Quality

```bash
# Linting
pnpm lint

# Type checking
pnpm typecheck

# Formatting
pnpm format

# Pre-commit hooks
pnpm prepare
```

### Architecture Decisions

- **Monorepo**: Single repo with multiple packages for easier development
- **TypeScript**: Full type safety and better developer experience
- **Zod**: Runtime validation and type inference
- **React-Flow**: Proven solution for node-based editors
- **Fastify**: High-performance API server
- **Vercel**: Serverless deployment with edge functions

## 🤝 Contributing

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Make** your changes
4. **Test** thoroughly: `pnpm test`
5. **Commit** with conventional commits: `git commit -m "feat: add amazing feature"`
6. **Push** to your fork: `git push origin feature/amazing-feature`
7. **Create** a Pull Request

### Code Style

- Use TypeScript for all new code
- Follow existing naming conventions
- Add tests for new features
- Update documentation as needed
- Keep commits atomic and well-described

### Issue Reporting

- Use the issue templates
- Include steps to reproduce
- Add screenshots for UI issues
- Mention your environment details

## 📝 Documentation

### Core Documentation

- **[Product Requirements](docs/prd.md)**: Complete feature specifications
- **[Architecture Guide](docs/architecture.md)**: Technical architecture overview
- **[API Documentation](docs/api_contract.md)**: API endpoints and schemas
- **[Deployment Guide](docs/deployment.md)**: Production deployment instructions
- **[Performance Guide](docs/PERF.md)**: Performance optimization details

### User Guides

- **[Content Authoring](docs/content_authoring.md)**: How to create effective prompt graphs
- **[Troubleshooting](docs/troubleshooting.md)**: Common issues and solutions
- **[Migration Guide](docs/migration.md)**: Upgrading from previous versions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React-Flow](https://reactflow.dev/) for the excellent node editor foundation
- [Vercel](https://vercel.com/) for seamless deployment and hosting
- [Fastify](https://fastify.dev/) for the high-performance API framework
- The open-source community for inspiration and contributions

## 📞 Support

- **Documentation**: Check the `docs/` directory
- **Issues**: [GitHub Issues](https://github.com/WildConstruct/prompt-spaghetti/issues)
- **Discussions**: [GitHub Discussions](https://github.com/WildConstruct/prompt-spaghetti/discussions)

---

**Made with ❤️ by the PromptScape Team**

_Building the future of prompt engineering, one node at a time._
