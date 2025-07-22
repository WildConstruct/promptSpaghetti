# PromptScape System Architecture Diagrams

**Task**: E18-1753114562020-546CB8 - Create architecture diagrams  
**Epic**: 18 - Technical Debt & Refactoring  
**Author**: Claude Code  
**Date**: 2025-07-22  

## Overview

This document provides comprehensive architectural diagrams for the PromptScape Randomizer Graph system, illustrating the system's structure, data flow, component interactions, and execution patterns. These diagrams serve as visual documentation for developers, architects, and stakeholders.

## 1. High-Level System Overview

```mermaid
graph TB
    %% User Interface Layer
    subgraph "User Interface Layer"
        UI[Web Browser]
        CLI[Command Line Interface]
        API_CLIENT[API Clients]
    end

    %% Frontend Application Layer
    subgraph "Frontend Application"
        subgraph "React Application (Port 3000)"
            GRAPH_EDITOR[Graph Editor<br/>React-Flow Canvas]
            INSPECTOR[Inspector Panel<br/>Node Configuration]
            PALETTE[Node Palette<br/>Drag & Drop]
            PREVIEW[Preview Modal<br/>Multi-seed Execution]
            STATUS_BAR[Status Bar<br/>Validation Display]
        end
    end

    %% Core Engine Layer
    subgraph "Core Engine Layer"
        subgraph "packages/core"
            RUNTIME[Runtime Engine<br/>Node Execution]
            SCHEMAS[Schema Layer<br/>Zod Validation]
            TYPES[Type Definitions<br/>Graph Structure]
            UTILS[Utility Functions<br/>Performance & Security]
        end
    end

    %% Backend Services Layer
    subgraph "Backend Services"
        subgraph "Fastify API Server (Port 8000)"
            GRAPH_API[Graph Execution API<br/>/preview endpoint]
            EXPORT_API[Export API<br/>/export endpoint]
            HEALTH_API[Health Check<br/>/health endpoint]
        end
        
        subgraph "CLI Package"
            CLI_ENGINE[CLI Engine<br/>Commander.js]
            BATCH_EXECUTOR[Batch Executor<br/>File Processing]
        end
    end

    %% Data & Storage Layer
    subgraph "Data & Storage"
        LOCAL_STORAGE[(LocalStorage<br/>Autosave)]
        FILE_SYSTEM[(File System<br/>Graph Files)]
        MEMORY_CACHE[(Memory Cache<br/>Execution Results)]
    end

    %% Infrastructure Layer
    subgraph "Infrastructure"
        VERCEL[Vercel Platform<br/>Static Hosting]
        EDGE_FUNCTIONS[Edge Functions<br/>Serverless API]
        CDN[Content Delivery Network]
    end

    %% Connections
    UI --> GRAPH_EDITOR
    UI --> INSPECTOR
    UI --> PALETTE
    
    GRAPH_EDITOR --> RUNTIME
    INSPECTOR --> SCHEMAS
    PREVIEW --> GRAPH_API
    
    CLI --> CLI_ENGINE
    CLI_ENGINE --> RUNTIME
    
    GRAPH_API --> RUNTIME
    EXPORT_API --> RUNTIME
    
    RUNTIME --> TYPES
    SCHEMAS --> TYPES
    
    GRAPH_EDITOR --> LOCAL_STORAGE
    CLI_ENGINE --> FILE_SYSTEM
    RUNTIME --> MEMORY_CACHE
    
    VERCEL --> GRAPH_EDITOR
    EDGE_FUNCTIONS --> GRAPH_API
    CDN --> GRAPH_EDITOR

    %% Styling
    classDef ui fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef frontend fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef core fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    classDef backend fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef storage fill:#fce4ec,stroke:#880e4f,stroke-width:2px
    classDef infrastructure fill:#f1f8e9,stroke:#33691e,stroke-width:2px

    class UI,CLI,API_CLIENT ui
    class GRAPH_EDITOR,INSPECTOR,PALETTE,PREVIEW,STATUS_BAR frontend
    class RUNTIME,SCHEMAS,TYPES,UTILS core
    class GRAPH_API,EXPORT_API,HEALTH_API,CLI_ENGINE,BATCH_EXECUTOR backend
    class LOCAL_STORAGE,FILE_SYSTEM,MEMORY_CACHE storage
    class VERCEL,EDGE_FUNCTIONS,CDN infrastructure
```

## 2. Monorepo Structure Diagram

```mermaid
graph TB
    subgraph "PromptScape Monorepo"
        ROOT[Root Package<br/>promptscape-graph]
        
        subgraph "Packages"
            CORE_PKG[packages/core<br/>Shared Library]
            CLI_PKG[packages/cli<br/>Command Line Tool]
            ANALYTICS[packages/analytics-sdk<br/>Analytics Integration]
            UI_KIT[packages/ui-kit<br/>UI Components]
            GRAPH_CORE[packages/graph-core<br/>Graph Utilities]
        end
        
        subgraph "Applications"
            CLIENT_APP[client/<br/>React Frontend]
            SERVER_APP[server/<br/>Fastify API]
        end
        
        subgraph "Supporting"
            DOCS[docs/<br/>Documentation]
            TESTS[tests/<br/>Cross-package Tests]
            SCRIPTS[scripts/<br/>Build & Automation]
            API_FUNCTIONS[api/<br/>Vercel Functions]
        end
        
        subgraph "Configuration"
            PACKAGE_JSON[package.json<br/>Workspace Config]
            PNPM_WORKSPACE[pnpm-workspace.yaml]
            TURBO_CONFIG[turbo.json<br/>Build Pipeline]
            TSCONFIG[tsconfig.json<br/>TypeScript Config]
        end
    end

    %% Dependencies
    CLIENT_APP --> CORE_PKG
    CLIENT_APP --> UI_KIT
    CLIENT_APP --> ANALYTICS
    
    SERVER_APP --> CORE_PKG
    SERVER_APP --> GRAPH_CORE
    
    CLI_PKG --> CORE_PKG
    
    API_FUNCTIONS --> CORE_PKG
    
    TESTS --> CORE_PKG
    TESTS --> CLIENT_APP
    TESTS --> SERVER_APP
    
    ROOT --> PACKAGE_JSON
    ROOT --> PNPM_WORKSPACE
    ROOT --> TURBO_CONFIG

    %% Styling
    classDef package fill:#e3f2fd,stroke:#0277bd,stroke-width:2px
    classDef app fill:#f1f8e9,stroke:#558b2f,stroke-width:2px
    classDef support fill:#fff8e1,stroke:#ff8f00,stroke-width:2px
    classDef config fill:#fce4ec,stroke:#c2185b,stroke-width:2px

    class CORE_PKG,CLI_PKG,ANALYTICS,UI_KIT,GRAPH_CORE package
    class CLIENT_APP,SERVER_APP app
    class DOCS,TESTS,SCRIPTS,API_FUNCTIONS support
    class PACKAGE_JSON,PNPM_WORKSPACE,TURBO_CONFIG,TSCONFIG config
```

## 3. Node Execution Flow Diagram

```mermaid
sequenceDiagram
    participant User
    participant GraphEditor
    participant Inspector
    participant API
    participant Engine
    participant Nodes
    participant Context

    User->>GraphEditor: Create/Edit Graph
    GraphEditor->>Inspector: Select Node
    Inspector->>GraphEditor: Configure Node Properties
    
    User->>GraphEditor: Request Preview
    GraphEditor->>API: POST /preview {graph, seeds}
    
    API->>Engine: executeGraph(graph, seedArray)
    
    loop For each seed
        Engine->>Context: Create ExecutionContext(seed)
        Engine->>Nodes: Traverse graph depth-first
        
        loop For each node
            Nodes->>Context: Get input values
            Nodes->>Nodes: Execute node logic
            Nodes->>Context: Store result
        end
        
        Engine->>Engine: Collect output nodes
    end
    
    Engine->>API: Return results array
    API->>GraphEditor: Return preview results
    GraphEditor->>User: Display preview modal

    Note over Engine,Context: Deterministic execution with seeded random
    Note over Nodes: Six core node types: WeightedChoice, Concat, Output, Include, SetVariable, GetVariable
```

## 4. Data Flow Architecture

```mermaid
graph LR
    subgraph "Input Sources"
        USER_INPUT[User Input<br/>Graph Creation]
        FILE_IMPORT[File Import<br/>JSON/Bundle]
        CLI_BATCH[CLI Batch<br/>Automated Execution]
    end

    subgraph "Validation Layer"
        SCHEMA_VALIDATION[Schema Validation<br/>Zod Schemas]
        GRAPH_VALIDATION[Graph Validation<br/>Connection Rules]
        SECURITY_VALIDATION[Security Validation<br/>Input Sanitization]
    end

    subgraph "Processing Core"
        GRAPH_STORE[Graph State<br/>Zustand Store]
        EXECUTION_ENGINE[Execution Engine<br/>Deterministic Runtime]
        CONTEXT_MANAGER[Context Manager<br/>Variable & State]
    end

    subgraph "Output Destinations"
        UI_DISPLAY[UI Display<br/>Visual Results]
        FILE_EXPORT[File Export<br/>JSON/Bundle]
        CLI_OUTPUT[CLI Output<br/>Terminal/Files]
        API_RESPONSE[API Response<br/>JSON Results]
    end

    %% Data Flow
    USER_INPUT --> SCHEMA_VALIDATION
    FILE_IMPORT --> SCHEMA_VALIDATION
    CLI_BATCH --> SCHEMA_VALIDATION

    SCHEMA_VALIDATION --> GRAPH_VALIDATION
    GRAPH_VALIDATION --> SECURITY_VALIDATION

    SECURITY_VALIDATION --> GRAPH_STORE
    GRAPH_STORE --> EXECUTION_ENGINE
    EXECUTION_ENGINE --> CONTEXT_MANAGER

    CONTEXT_MANAGER --> UI_DISPLAY
    CONTEXT_MANAGER --> FILE_EXPORT
    CONTEXT_MANAGER --> CLI_OUTPUT
    CONTEXT_MANAGER --> API_RESPONSE

    %% Styling
    classDef input fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    classDef validation fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef processing fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef output fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px

    class USER_INPUT,FILE_IMPORT,CLI_BATCH input
    class SCHEMA_VALIDATION,GRAPH_VALIDATION,SECURITY_VALIDATION validation
    class GRAPH_STORE,EXECUTION_ENGINE,CONTEXT_MANAGER processing
    class UI_DISPLAY,FILE_EXPORT,CLI_OUTPUT,API_RESPONSE output
```

## 5. Component Interaction Diagram

```mermaid
graph TB
    subgraph "Frontend Components"
        subgraph "React-Flow Canvas"
            CANVAS[Canvas Component]
            NODE_RENDERER[Node Renderer]
            EDGE_RENDERER[Edge Renderer]
            MINIMAP[Minimap]
        end
        
        subgraph "Inspector System"
            INSPECTOR_PANEL[Inspector Panel]
            NODE_EDITORS[Node-Specific Editors]
            COLLAPSIBLE_SECTIONS[Collapsible Sections]
            VARIATION_LIST[Variation List]
        end
        
        subgraph "UI Controls"
            PALETTE_PANEL[Palette Panel]
            TOOLBAR[Toolbar]
            STATUS_BAR_COMP[Status Bar]
            MODAL_SYSTEM[Modal System]
        end
    end

    subgraph "State Management"
        GRAPH_STORE_STATE[Graph Store<br/>Zustand]
        UI_SETTINGS[UI Settings Store]
        PERFORMANCE_CACHE[Performance Cache]
    end

    subgraph "Core Services"
        VALIDATION_SERVICE[Validation Service]
        EXECUTION_SERVICE[Execution Service]
        EXPORT_SERVICE[Export Service]
        AUTOSAVE_SERVICE[Autosave Service]
    end

    subgraph "Hooks & Utilities"
        USE_GRAPH[useGraph Hook]
        USE_VALIDATION[useValidation Hook]
        USE_PREVIEW[usePreview Hook]
        USE_AUTOSAVE[useAutosave Hook]
    end

    %% Interactions
    CANVAS --> GRAPH_STORE_STATE
    NODE_RENDERER --> NODE_EDITORS
    INSPECTOR_PANEL --> VALIDATION_SERVICE
    
    PALETTE_PANEL --> GRAPH_STORE_STATE
    TOOLBAR --> EXECUTION_SERVICE
    STATUS_BAR_COMP --> VALIDATION_SERVICE
    
    GRAPH_STORE_STATE --> USE_GRAPH
    UI_SETTINGS --> USE_VALIDATION
    
    USE_GRAPH --> AUTOSAVE_SERVICE
    USE_PREVIEW --> EXECUTION_SERVICE
    USE_VALIDATION --> VALIDATION_SERVICE
    
    EXECUTION_SERVICE --> PERFORMANCE_CACHE
    EXPORT_SERVICE --> GRAPH_STORE_STATE

    %% Styling
    classDef component fill:#e1f5fe,stroke:#0277bd,stroke-width:2px
    classDef state fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef service fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
    classDef hook fill:#fff8e1,stroke:#f57c00,stroke-width:2px

    class CANVAS,NODE_RENDERER,EDGE_RENDERER,MINIMAP,INSPECTOR_PANEL,NODE_EDITORS,PALETTE_PANEL,TOOLBAR component
    class GRAPH_STORE_STATE,UI_SETTINGS,PERFORMANCE_CACHE state
    class VALIDATION_SERVICE,EXECUTION_SERVICE,EXPORT_SERVICE,AUTOSAVE_SERVICE service
    class USE_GRAPH,USE_VALIDATION,USE_PREVIEW,USE_AUTOSAVE hook
```

## 6. Runtime Engine Architecture

```mermaid
graph TB
    subgraph "Execution Context Layer"
        BASIC_CONTEXT[Basic ExecutionContext<br/>Variables, Seed, Depth]
        ADVANCED_CONTEXT[Advanced ExecutionContext<br/>State, Performance, Cache]
        EXTENDED_CONTEXT[Extended ExecutionContext<br/>Extensions, Debugging]
    end

    subgraph "Node Type Hierarchy"
        BASE_NODE[RuntimeNode<br/>Abstract Base]
        
        subgraph "Basic Nodes (Epic 3)"
            WEIGHTED_CHOICE[WeightedChoiceNode<br/>Random Selection]
            CONCAT_NODE[ConcatNode<br/>String Joining]
            OUTPUT_NODE[OutputNode<br/>Terminal Output]
            INCLUDE_NODE[IncludeNode<br/>External Reference]
            SET_VAR_NODE[SetVariableNode<br/>State Storage]
            GET_VAR_NODE[GetVariableNode<br/>State Retrieval]
        end
        
        subgraph "Advanced Nodes (Epic 7)"
            ADVANCED_BASE[AdvancedRuntimeNode<br/>Enhanced Base]
            WEIGHTED_ADV[WeightedAdvanced<br/>Complex Distributions]
            CONDITIONAL[Conditional<br/>Expression Evaluation]
            SEQUENTIAL[Sequential<br/>Pattern Sequences]
            MARKOV[Markov<br/>State Transitions]
        end
    end

    subgraph "Support Systems"
        SCHEMA_SYSTEM[Schema System<br/>Zod Validation]
        SECURITY_SYSTEM[Security System<br/>Input Sanitization]
        PERFORMANCE_SYSTEM[Performance System<br/>Metrics & Optimization]
        EXTENSION_SYSTEM[Extension System<br/>Plugin Architecture]
    end

    %% Inheritance
    BASE_NODE --> WEIGHTED_CHOICE
    BASE_NODE --> CONCAT_NODE
    BASE_NODE --> OUTPUT_NODE
    BASE_NODE --> INCLUDE_NODE
    BASE_NODE --> SET_VAR_NODE
    BASE_NODE --> GET_VAR_NODE

    BASE_NODE --> ADVANCED_BASE
    ADVANCED_BASE --> WEIGHTED_ADV
    ADVANCED_BASE --> CONDITIONAL
    ADVANCED_BASE --> SEQUENTIAL
    ADVANCED_BASE --> MARKOV

    %% Context Usage
    BASIC_CONTEXT --> WEIGHTED_CHOICE
    BASIC_CONTEXT --> CONCAT_NODE
    ADVANCED_CONTEXT --> WEIGHTED_ADV
    ADVANCED_CONTEXT --> CONDITIONAL
    EXTENDED_CONTEXT --> SEQUENTIAL
    EXTENDED_CONTEXT --> MARKOV

    %% System Integration
    SCHEMA_SYSTEM --> BASE_NODE
    SECURITY_SYSTEM --> BASE_NODE
    PERFORMANCE_SYSTEM --> ADVANCED_BASE
    EXTENSION_SYSTEM --> ADVANCED_BASE

    %% Styling
    classDef context fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    classDef basic fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef advanced fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef system fill:#fff3e0,stroke:#f57c00,stroke-width:2px

    class BASIC_CONTEXT,ADVANCED_CONTEXT,EXTENDED_CONTEXT context
    class BASE_NODE,WEIGHTED_CHOICE,CONCAT_NODE,OUTPUT_NODE,INCLUDE_NODE,SET_VAR_NODE,GET_VAR_NODE basic
    class ADVANCED_BASE,WEIGHTED_ADV,CONDITIONAL,SEQUENTIAL,MARKOV advanced
    class SCHEMA_SYSTEM,SECURITY_SYSTEM,PERFORMANCE_SYSTEM,EXTENSION_SYSTEM system
```

## 7. State Management Architecture

```mermaid
graph TB
    subgraph "State Management Layer"
        subgraph "Zustand Stores"
            GRAPH_STORE_MAIN[Graph Store<br/>Main State]
            UI_SETTINGS_STORE[UI Settings Store<br/>User Preferences]
            PERFORMANCE_STORE[Performance Store<br/>Metrics & Cache]
        end
        
        subgraph "State Slices"
            NODES_SLICE[Nodes Slice<br/>Node Data & Config]
            EDGES_SLICE[Edges Slice<br/>Connection Data]
            VIEWPORT_SLICE[Viewport Slice<br/>Canvas Position]
            SELECTION_SLICE[Selection Slice<br/>Selected Elements]
        end
        
        subgraph "Persistence Layer"
            LOCAL_STORAGE_PERSIST[LocalStorage<br/>Persistence]
            SESSION_STORAGE[SessionStorage<br/>Temporary State]
            MEMORY_CACHE_STATE[Memory Cache<br/>Runtime State]
        end
    end

    subgraph "State Operations"
        ACTIONS[Action Creators<br/>State Mutations]
        SELECTORS[Selectors<br/>Derived State]
        MIDDLEWARE[Middleware<br/>Logging, Persistence]
    end

    subgraph "React Integration"
        HOOKS_LAYER[Custom Hooks Layer]
        CONTEXT_PROVIDERS[Context Providers]
        COMPONENT_STATE[Component Local State]
    end

    %% Data Flow
    GRAPH_STORE_MAIN --> NODES_SLICE
    GRAPH_STORE_MAIN --> EDGES_SLICE
    GRAPH_STORE_MAIN --> VIEWPORT_SLICE
    GRAPH_STORE_MAIN --> SELECTION_SLICE

    NODES_SLICE --> ACTIONS
    EDGES_SLICE --> ACTIONS
    ACTIONS --> SELECTORS
    SELECTORS --> MIDDLEWARE

    MIDDLEWARE --> LOCAL_STORAGE_PERSIST
    MIDDLEWARE --> SESSION_STORAGE
    MIDDLEWARE --> MEMORY_CACHE_STATE

    GRAPH_STORE_MAIN --> HOOKS_LAYER
    UI_SETTINGS_STORE --> CONTEXT_PROVIDERS
    PERFORMANCE_STORE --> COMPONENT_STATE

    %% Styling
    classDef store fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef slice fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
    classDef persistence fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef operation fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef react fill:#ffebee,stroke:#d32f2f,stroke-width:2px

    class GRAPH_STORE_MAIN,UI_SETTINGS_STORE,PERFORMANCE_STORE store
    class NODES_SLICE,EDGES_SLICE,VIEWPORT_SLICE,SELECTION_SLICE slice
    class LOCAL_STORAGE_PERSIST,SESSION_STORAGE,MEMORY_CACHE_STATE persistence
    class ACTIONS,SELECTORS,MIDDLEWARE operation
    class HOOKS_LAYER,CONTEXT_PROVIDERS,COMPONENT_STATE react
```

## 8. API & Service Layer

```mermaid
graph TB
    subgraph "API Layer"
        subgraph "Fastify Server (Port 8000)"
            FASTIFY_APP[Fastify App<br/>Main Server]
            
            subgraph "Route Handlers"
                PREVIEW_ROUTE[POST /preview<br/>Graph Execution]
                EXPORT_ROUTE[POST /export<br/>Bundle Generation]
                HEALTH_ROUTE[GET /health<br/>Health Check]
                ANALYTICS_ROUTE[POST /analytics<br/>Usage Metrics]
            end
            
            subgraph "Middleware"
                CORS_MIDDLEWARE[CORS<br/>Cross-Origin]
                HELMET_MIDDLEWARE[Helmet<br/>Security Headers]
                LOGGING_MIDDLEWARE[Logging<br/>Request/Response]
                VALIDATION_MIDDLEWARE[Validation<br/>Request Schema]
            end
        end
        
        subgraph "Vercel Edge Functions"
            PREVIEW_EDGE[api/preview.js<br/>Serverless Preview]
            EXPORT_EDGE[api/export.js<br/>Serverless Export]
            HEALTH_EDGE[api/health.js<br/>Serverless Health]
        end
    end

    subgraph "Service Layer"
        EXECUTION_SERVICE_LAYER[Execution Service<br/>Graph Processing]
        EXPORT_SERVICE_LAYER[Export Service<br/>Bundle Conversion]
        VALIDATION_SERVICE_LAYER[Validation Service<br/>Schema Checking]
        ANALYTICS_SERVICE[Analytics Service<br/>Metrics Collection]
    end

    subgraph "Data Integration"
        CORE_ENGINE_API[Core Engine<br/>Runtime Execution]
        SCHEMA_VALIDATION_API[Schema Validation<br/>Zod Schemas]
        PERFORMANCE_TRACKING[Performance Tracking<br/>Metrics Collection]
        ERROR_HANDLING[Error Handling<br/>Graceful Failures]
    end

    %% Connections
    FASTIFY_APP --> PREVIEW_ROUTE
    FASTIFY_APP --> EXPORT_ROUTE
    FASTIFY_APP --> HEALTH_ROUTE
    FASTIFY_APP --> ANALYTICS_ROUTE

    FASTIFY_APP --> CORS_MIDDLEWARE
    FASTIFY_APP --> HELMET_MIDDLEWARE
    FASTIFY_APP --> LOGGING_MIDDLEWARE
    FASTIFY_APP --> VALIDATION_MIDDLEWARE

    PREVIEW_ROUTE --> EXECUTION_SERVICE_LAYER
    EXPORT_ROUTE --> EXPORT_SERVICE_LAYER
    HEALTH_ROUTE --> VALIDATION_SERVICE_LAYER
    ANALYTICS_ROUTE --> ANALYTICS_SERVICE

    EXECUTION_SERVICE_LAYER --> CORE_ENGINE_API
    EXPORT_SERVICE_LAYER --> SCHEMA_VALIDATION_API
    VALIDATION_SERVICE_LAYER --> PERFORMANCE_TRACKING
    ANALYTICS_SERVICE --> ERROR_HANDLING

    PREVIEW_EDGE --> EXECUTION_SERVICE_LAYER
    EXPORT_EDGE --> EXPORT_SERVICE_LAYER
    HEALTH_EDGE --> VALIDATION_SERVICE_LAYER

    %% Styling
    classDef api fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef route fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
    classDef middleware fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef service fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef data fill:#ffebee,stroke:#d32f2f,stroke-width:2px

    class FASTIFY_APP,PREVIEW_EDGE,EXPORT_EDGE,HEALTH_EDGE api
    class PREVIEW_ROUTE,EXPORT_ROUTE,HEALTH_ROUTE,ANALYTICS_ROUTE route
    class CORS_MIDDLEWARE,HELMET_MIDDLEWARE,LOGGING_MIDDLEWARE,VALIDATION_MIDDLEWARE middleware
    class EXECUTION_SERVICE_LAYER,EXPORT_SERVICE_LAYER,VALIDATION_SERVICE_LAYER,ANALYTICS_SERVICE service
    class CORE_ENGINE_API,SCHEMA_VALIDATION_API,PERFORMANCE_TRACKING,ERROR_HANDLING data
```

## 9. Performance & Optimization Architecture

```mermaid
graph TB
    subgraph "Performance Monitoring"
        PERFORMANCE_TRACKER[Performance Tracker<br/>Global Instance]
        METRICS_COLLECTOR[Metrics Collector<br/>Real-time Data]
        BASELINE_SYSTEM[Baseline System<br/>Historical Comparison]
    end

    subgraph "Optimization Layers"
        subgraph "Frontend Optimizations"
            REACT_MEMO[React.memo<br/>Component Memoization]
            CANVAS_VIRTUAL[Canvas Virtualization<br/>Large Graph Handling]
            DEBOUNCED_OPS[Debounced Operations<br/>Reduced Computation]
            LAZY_LOADING[Lazy Loading<br/>Code Splitting]
        end
        
        subgraph "Backend Optimizations"
            CONTEXT_POOLING[Context Pooling<br/>Object Reuse]
            RESULT_CACHING[Result Caching<br/>Execution Memoization]
            PARALLEL_EXECUTION[Parallel Execution<br/>Independent Nodes]
            SCHEMA_COMPILATION[Schema Compilation<br/>Validation Optimization]
        end
    end

    subgraph "Caching Strategy"
        MEMORY_CACHE_PERF[Memory Cache<br/>Runtime Results]
        BROWSER_CACHE[Browser Cache<br/>Static Assets]
        CDN_CACHE[CDN Cache<br/>Global Distribution]
        VALIDATION_CACHE[Validation Cache<br/>Schema Results]
    end

    subgraph "Monitoring & Analysis"
        PERFORMANCE_DASHBOARD[Performance Dashboard<br/>Real-time Metrics]
        REGRESSION_DETECTION[Regression Detection<br/>Automated Alerts]
        OPTIMIZATION_TRACKING[Optimization Tracking<br/>Improvement Measurement]
        PROFILING_TOOLS[Profiling Tools<br/>Deep Analysis]
    end

    %% Connections
    PERFORMANCE_TRACKER --> METRICS_COLLECTOR
    METRICS_COLLECTOR --> BASELINE_SYSTEM

    REACT_MEMO --> PERFORMANCE_TRACKER
    CANVAS_VIRTUAL --> PERFORMANCE_TRACKER
    DEBOUNCED_OPS --> PERFORMANCE_TRACKER
    LAZY_LOADING --> BROWSER_CACHE

    CONTEXT_POOLING --> MEMORY_CACHE_PERF
    RESULT_CACHING --> MEMORY_CACHE_PERF
    PARALLEL_EXECUTION --> PERFORMANCE_TRACKER
    SCHEMA_COMPILATION --> VALIDATION_CACHE

    PERFORMANCE_DASHBOARD --> BASELINE_SYSTEM
    REGRESSION_DETECTION --> METRICS_COLLECTOR
    OPTIMIZATION_TRACKING --> PERFORMANCE_TRACKER
    PROFILING_TOOLS --> PERFORMANCE_DASHBOARD

    CDN_CACHE --> BROWSER_CACHE
    VALIDATION_CACHE --> MEMORY_CACHE_PERF

    %% Styling
    classDef monitoring fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    classDef frontend fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef backend fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef caching fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef analysis fill:#ffebee,stroke:#d32f2f,stroke-width:2px

    class PERFORMANCE_TRACKER,METRICS_COLLECTOR,BASELINE_SYSTEM monitoring
    class REACT_MEMO,CANVAS_VIRTUAL,DEBOUNCED_OPS,LAZY_LOADING frontend
    class CONTEXT_POOLING,RESULT_CACHING,PARALLEL_EXECUTION,SCHEMA_COMPILATION backend
    class MEMORY_CACHE_PERF,BROWSER_CACHE,CDN_CACHE,VALIDATION_CACHE caching
    class PERFORMANCE_DASHBOARD,REGRESSION_DETECTION,OPTIMIZATION_TRACKING,PROFILING_TOOLS analysis
```

## 10. Deployment & Infrastructure

```mermaid
graph TB
    subgraph "Development Environment"
        DEV_CLIENT[Client Dev Server<br/>Vite (Port 3000)]
        DEV_API[API Dev Server<br/>Fastify (Port 8000)]
        DEV_CONTAINER[DevContainer<br/>VS Code/Windsurf]
    end

    subgraph "Build & CI/CD Pipeline"
        subgraph "GitHub Actions"
            LINT_TEST[Lint & Test<br/>Quality Gates]
            BUILD_STAGE[Build Stage<br/>Compilation]
            SECURITY_SCAN[Security Scan<br/>Vulnerability Check]
            PERFORMANCE_TEST[Performance Test<br/>Regression Check]
        end
        
        subgraph "Deployment Targets"
            VERCEL_PREVIEW[Vercel Preview<br/>PR Deployments]
            VERCEL_PROD[Vercel Production<br/>Main Branch]
            DOCKER_REGISTRY[Docker Registry<br/>Container Images]
        end
    end

    subgraph "Production Infrastructure"
        subgraph "Vercel Platform"
            STATIC_HOSTING[Static Hosting<br/>React SPA]
            EDGE_FUNCTIONS_INFRA[Edge Functions<br/>Serverless API]
            CDN_GLOBAL[Global CDN<br/>Asset Distribution]
        end
        
        subgraph "Monitoring & Analytics"
            VERCEL_ANALYTICS[Vercel Analytics<br/>Usage Metrics]
            ERROR_TRACKING[Error Tracking<br/>Issue Monitoring]
            PERFORMANCE_MONITORING[Performance Monitoring<br/>Real-time Metrics]
        end
    end

    subgraph "External Services"
        CODECOV[Codecov<br/>Coverage Reports]
        SECURITY_ADVISORS[Security Advisors<br/>Vulnerability DB]
        PERFORMANCE_BUDGETS[Performance Budgets<br/>Threshold Monitoring]
    end

    %% Development Flow
    DEV_CLIENT --> DEV_API
    DEV_CONTAINER --> DEV_CLIENT
    DEV_CONTAINER --> DEV_API

    %% CI/CD Flow
    DEV_CLIENT --> LINT_TEST
    DEV_API --> LINT_TEST
    LINT_TEST --> BUILD_STAGE
    BUILD_STAGE --> SECURITY_SCAN
    SECURITY_SCAN --> PERFORMANCE_TEST

    PERFORMANCE_TEST --> VERCEL_PREVIEW
    PERFORMANCE_TEST --> VERCEL_PROD
    BUILD_STAGE --> DOCKER_REGISTRY

    %% Production Deployment
    VERCEL_PROD --> STATIC_HOSTING
    VERCEL_PROD --> EDGE_FUNCTIONS_INFRA
    STATIC_HOSTING --> CDN_GLOBAL

    %% Monitoring Integration
    STATIC_HOSTING --> VERCEL_ANALYTICS
    EDGE_FUNCTIONS_INFRA --> ERROR_TRACKING
    CDN_GLOBAL --> PERFORMANCE_MONITORING

    %% External Integration
    LINT_TEST --> CODECOV
    SECURITY_SCAN --> SECURITY_ADVISORS
    PERFORMANCE_TEST --> PERFORMANCE_BUDGETS

    %% Styling
    classDef dev fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    classDef ci fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef prod fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef monitoring fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef external fill:#ffebee,stroke:#d32f2f,stroke-width:2px

    class DEV_CLIENT,DEV_API,DEV_CONTAINER dev
    class LINT_TEST,BUILD_STAGE,SECURITY_SCAN,PERFORMANCE_TEST,VERCEL_PREVIEW,VERCEL_PROD,DOCKER_REGISTRY ci
    class STATIC_HOSTING,EDGE_FUNCTIONS_INFRA,CDN_GLOBAL prod
    class VERCEL_ANALYTICS,ERROR_TRACKING,PERFORMANCE_MONITORING monitoring
    class CODECOV,SECURITY_ADVISORS,PERFORMANCE_BUDGETS external
```

## Conclusion

These architecture diagrams provide comprehensive visual documentation of the PromptScape Randomizer Graph system, covering:

1. **High-level system overview** showing the complete application stack
2. **Monorepo structure** illustrating package organization and dependencies
3. **Node execution flow** detailing the graph processing pipeline
4. **Data flow architecture** showing information movement through the system
5. **Component interactions** mapping frontend and backend relationships
6. **Runtime engine architecture** detailing the node execution framework
7. **State management** showing how application state is handled
8. **API & service layer** illustrating the backend service architecture
9. **Performance & optimization** detailing performance enhancement strategies
10. **Deployment & infrastructure** showing the complete DevOps pipeline

These diagrams serve as living documentation that should be updated as the system evolves, providing clear visual references for developers, architects, and stakeholders to understand the system's structure and behavior.