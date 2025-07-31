# Sample Projects & Examples

Explore comprehensive examples of custom nodes with progressive complexity. Each example includes full source code, tests, documentation, and usage scenarios.

## 🌟 Featured Projects

<div class="project-grid">
  <div class="project-card beginner">
    <div class="difficulty-badge">Beginner</div>
    <h3>📝 Text Processor</h3>
    <p>String manipulation with multiple transformation operations</p>
    <div class="project-meta">
      <span>⏱️ 15 min</span>
      <span>📦 1 file</span>
      <span>🧪 5 tests</span>
    </div>
    <a href="./text-processor/" class="project-link">View Project →</a>
  </div>
  
  <div class="project-card beginner">
    <div class="difficulty-badge">Beginner</div>
    <h3>🔢 Math Operations</h3>
    <p>Mathematical calculations with validation and error handling</p>
    <div class="project-meta">
      <span>⏱️ 20 min</span>
      <span>📦 1 file</span>
      <span>🧪 8 tests</span>
    </div>
    <a href="./math-operations/" class="project-link">View Project →</a>
  </div>
  
  <div class="project-card intermediate">
    <div class="difficulty-badge">Intermediate</div>
    <h3>🌐 Weather API</h3>
    <p>External API integration with caching and error recovery</p>
    <div class="project-meta">
      <span>⏱️ 45 min</span>
      <span>📦 3 files</span>
      <span>🧪 12 tests</span>
    </div>
    <a href="./weather-api/" class="project-link">View Project →</a>
  </div>
  
  <div class="project-card intermediate">
    <div class="difficulty-badge">Intermediate</div>
    <h3>📊 Data Transformer</h3>
    <p>Convert between JSON, CSV, XML with schema validation</p>
    <div class="project-meta">
      <span>⏱️ 60 min</span>
      <span>📦 4 files</span>
      <span>🧪 15 tests</span>
    </div>
    <a href="./data-transformer/" class="project-link">View Project →</a>
  </div>
  
  <div class="project-card advanced">
    <div class="difficulty-badge">Advanced</div>
    <h3>🔄 State Machine</h3>
    <p>Stateful workflow engine with transition management</p>
    <div class="project-meta">
      <span>⏱️ 120 min</span>
      <span>📦 6 files</span>
      <span>🧪 25 tests</span>
    </div>
    <a href="./state-machine/" class="project-link">View Project →</a>
  </div>
  
  <div class="project-card advanced">
    <div class="difficulty-badge">Advanced</div>
    <h3>🤖 AI Assistant</h3>
    <p>LLM integration with context management and streaming</p>
    <div class="project-meta">
      <span>⏱️ 180 min</span>
      <span>📦 8 files</span>
      <span>🧪 30 tests</span>
    </div>
    <a href="./ai-assistant/" class="project-link">View Project →</a>
  </div>
</div>

## 📚 Learning Path

### Level 1: Foundation (Beginner)

**Prerequisites**: Basic TypeScript knowledge  
**Time**: 2-3 hours total

1. **[Text Processor](./text-processor/)** - Learn basic node structure, validation, and testing
2. **[Math Operations](./math-operations/)** - Understand input validation and error handling
3. **[Array Utilities](./array-utilities/)** - Work with complex data types and transformations

**Skills Learned**:

- Custom node class structure
- Input/output validation
- Error handling patterns
- Basic testing strategies
- TypeScript best practices

### Level 2: Integration (Intermediate)

**Prerequisites**: Completed Level 1  
**Time**: 4-6 hours total

4. **[Weather API](./weather-api/)** - External API integration and network security
5. **[Data Transformer](./data-transformer/)** - Format conversion and schema validation
6. **[File Processor](./file-processor/)** - File system operations with security constraints
7. **[Database Connector](./database-connector/)** - Database operations and connection pooling

**Skills Learned**:

- External service integration
- Security and permissions management
- Caching strategies
- Performance optimization
- Data format handling

### Level 3: Advanced Patterns (Advanced)

**Prerequisites**: Completed Level 2  
**Time**: 8-12 hours total

8. **[State Machine](./state-machine/)** - Complex state management and workflow control
9. **[AI Assistant](./ai-assistant/)** - LLM integration with streaming and context
10. **[Custom Extension](./custom-extension/)** - Building full extensions with UI components
11. **[Performance Monitor](./performance-monitor/)** - Advanced monitoring and metrics collection

**Skills Learned**:

- Stateful node development
- Advanced runtime integration
- Performance monitoring
- Extension development
- Production deployment

## 🎯 Quick Start Guide

### Option 1: Browse Online

Click any project link above to explore the code, documentation, and usage examples in your browser.

### Option 2: Download & Run Locally

```bash
# Clone the repository
git clone https://github.com/promptspaghetti/custom-node-examples.git
cd custom-node-examples

# Install dependencies
npm install

# Choose a project and run it
cd text-processor
npm test
npm run build
```

### Option 3: Interactive Playground

Open any project in the [Interactive Playground](../playground/) to experiment with code changes in real-time.

## 🏗️ Project Structure

Each sample project follows a consistent structure:

```
project-name/
├── README.md              # Project overview and instructions
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── jest.config.cjs        # Testing configuration
├── src/
│   ├── index.ts           # Main node implementation
│   ├── types.ts           # Type definitions (if needed)
│   └── utils/             # Helper utilities (if needed)
├── tests/
│   ├── index.test.ts      # Unit tests
│   ├── fixtures/          # Test data and mocks
│   └── integration.test.ts # Integration tests (if applicable)
├── examples/
│   ├── basic-usage.json   # Simple usage example
│   ├── advanced-usage.json # Complex usage example
│   └── graph-integration.json # Graph integration example
└── docs/
    ├── API.md             # API documentation
    ├── DEVELOPMENT.md     # Development guide
    └── DEPLOYMENT.md      # Deployment instructions
```

## 🔧 Development Tools

### Code Generation

Each project includes scripts to generate boilerplate code:

```bash
npm run generate:test      # Generate test templates
npm run generate:types     # Generate TypeScript types
npm run generate:docs      # Generate API documentation
```

### Quality Assurance

Consistent quality checks across all projects:

```bash
npm run lint              # ESLint with TypeScript rules
npm run type-check        # TypeScript compilation check
npm run test:coverage     # Jest with coverage reporting
npm run test:integration  # End-to-end integration tests
```

### Build & Distribution

Production-ready build processes:

```bash
npm run build            # Compile TypeScript to JavaScript
npm run build:docs       # Generate documentation
npm run package         # Create distributable package
npm run publish         # Publish to registry (if configured)
```

## 📖 Additional Resources

### Documentation

- [API Reference](../api-reference/) - Complete SDK documentation
- [Best Practices](../guides/best-practices.html) - Coding standards and patterns
- [Security Guide](../guides/security.html) - Security considerations and practices
- [Testing Guide](../guides/testing.html) - Testing strategies and utilities

### Tools & Utilities

- [Interactive Playground](../playground/) - Real-time development environment
- [CLI Tools](../cli-reference.html) - Command-line utilities and scaffolding
- [VS Code Extension](../tools/vscode-extension/) - IDE integration and debugging
- [Template Generator](../tools/template-generator/) - Custom project templates

### Community

- [GitHub Repository](https://github.com/promptspaghetti/custom-node-examples) - Source code and issues
- [Discussion Forum](https://github.com/promptspaghetti/promptscape/discussions) - Community Q&A
- [Discord Server](https://discord.gg/promptscape) - Real-time community support
- [Contributing Guide](../CONTRIBUTING.md) - How to contribute examples

## 🎨 Customization

### Creating Your Own Examples

Want to contribute your own sample project? Follow these steps:

1. **Use the Template Generator**:

   ```bash
   npx @prompt-spaghetti/custom-node-sdk scaffold --template sample-project
   ```

2. **Follow the Structure**: Use the consistent project structure outlined above

3. **Add Comprehensive Tests**: Include unit tests, integration tests, and usage examples

4. **Document Everything**: README, API docs, and inline code comments

5. **Submit a Pull Request**: Share your example with the community

### Template Customization

Modify the existing templates to match your organization's standards:

```bash
# Copy template
cp -r text-processor my-custom-template

# Customize package.json, tsconfig.json, etc.
# Update README and documentation
# Modify source code structure

# Use your custom template
npx @prompt-spaghetti/custom-node-sdk scaffold --template ./my-custom-template
```

## 🚀 Next Steps

Ready to dive deeper? Here's what to explore next:

1. **Start with Level 1 Projects** if you're new to custom node development
2. **Try the Interactive Playground** to experiment with code changes
3. **Join the Community** to ask questions and share your creations
4. **Contribute Examples** to help other developers learn

---

<style>
.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin: 2rem 0;
}

.project-card {
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  padding: 1.5rem;
  position: relative;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.project-card:hover {
  border-color: #007bff;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.15);
  transform: translateY(-2px);
}

.difficulty-badge {
  position: absolute;
  top: -8px;
  right: 1rem;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
}

.beginner .difficulty-badge {
  background: #28a745;
}

.intermediate .difficulty-badge {
  background: #ffc107;
  color: #343a40;
}

.advanced .difficulty-badge {
  background: #dc3545;
}

.project-card h3 {
  margin: 0.5rem 0 1rem 0;
  color: #343a40;
  font-size: 1.2rem;
}

.project-card p {
  color: #6c757d;
  margin: 0 0 1rem 0;
  line-height: 1.5;
}

.project-meta {
  display: flex;
  gap: 1rem;
  margin: 1rem 0;
  font-size: 0.85rem;
  color: #6c757d;
}

.project-link {
  display: inline-block;
  background: #007bff;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.2s;
}

.project-link:hover {
  background: #0056b3;
  text-decoration: none;
  color: white;
}

@media (prefers-color-scheme: dark) {
  .project-card {
    background: #1a202c;
    border-color: #4a5568;
    color: #e2e8f0;
  }
  
  .project-card h3 {
    color: #e2e8f0;
  }
}
</style>

**Ready to start building?** [Choose your first project →](#featured-projects)
