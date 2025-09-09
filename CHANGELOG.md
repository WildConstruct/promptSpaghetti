# Changelog

All notable changes to Prompt Spaghetti will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0-demo] - 2025-01-28

### 🎬 Demo Release
This is the initial demo release for investor presentations and fundraising activities.

### Added
- **Core Graph Engine**: Deterministic execution with seeded randomization
- **Visual Editor**: Drag-and-drop node-based interface using React Flow
- **Node Types**: 
  - WeightedChoice - Probabilistic selection with custom weights
  - Concat - String concatenation with separators
  - Output - Graph output collection
  - Variable - Variable storage and retrieval
  - Template - Text templating with placeholders
- **Asset Browser**: Library of reusable fragments and presets
- **Multi-seed Preview**: Generate multiple variations with different seeds
- **PSG File Format**: Custom file format for saving/loading graphs
- **Keyboard Shortcuts**: Professional workflow shortcuts
- **Undo/Redo System**: Full history management
- **Auto-save**: Automatic project saving to prevent data loss

### Technical Stack
- React 18 with TypeScript
- Vite for fast development
- Fastify backend server
- Zustand for state management
- Zod for runtime validation
- Jest for testing

### Known Issues
- Performance optimization needed for graphs with 250+ nodes
- Limited to text generation (image/audio nodes planned for future)
- Collaboration features not yet implemented

## [0.9.0-beta] - 2024-12-15

### Added
- Initial Epic 1 MVP implementation
- Basic node system architecture
- Graph validation framework
- Inspector panel for node configuration
- Export/import functionality

### Changed
- Migrated from class-based to functional React components
- Improved TypeScript strict mode compliance

### Fixed
- Graph cycle detection
- Memory leaks in preview modal
- Edge connection validation

## [0.8.0-alpha] - 2024-11-01

### Added
- Project initialization
- Basic React Flow integration
- Initial node type definitions
- Proof of concept deterministic engine

---

## Roadmap

### [1.1.0] - Q2 2025 (Planned)
- **LLM Integration**: Connect to OpenAI, Claude, and local models
- **Advanced Nodes**: Conditional, Sequential, Markov chains
- **Performance**: GPU acceleration for large graphs
- **Collaboration**: Real-time multi-user editing

### [1.2.0] - Q3 2025 (Planned)
- **Film Pipeline Integration**: Maya, Houdini, Nuke plugins
- **Asset Intelligence**: Automatic metadata extraction
- **Version Control**: Built-in graph versioning
- **Template Marketplace**: Share and sell graph templates

### [2.0.0] - Q4 2025 (Planned)
- **Multi-modal Generation**: Image and audio nodes
- **Cloud Rendering**: Distributed graph execution
- **Enterprise Features**: SSO, audit logs, compliance
- **API v2**: GraphQL federation

---

*For questions or licensing inquiries, contact Brian Behm at wildconstruct@wildconstruct.com*