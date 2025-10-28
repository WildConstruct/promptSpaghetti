# Epic 8.1 - Python Executor Bridge Architecture

## Overview

This document defines the microservice architecture for the Python Executor Bridge, enabling secure and scalable execution of Python code within prompt-spaghetti node graphs.

## Service Boundaries and Responsibilities

### 1. Main Application (Node.js/TypeScript)

**Responsibilities:**

- Graph execution orchestration
- Node lifecycle management
- User interface and experience
- Authentication and authorization
- Graph persistence and state management
- Client-side validation and security

**Boundaries:**

- Does NOT execute Python code directly
- Does NOT manage Python environments
- Does NOT handle Python package dependencies
- Delegates Python execution to executor service

### 2. Python Executor Service (Python/FastAPI)

**Responsibilities:**

- Secure Python code execution in sandboxed environments
- Python package management and dependency resolution
- Resource monitoring and enforcement (CPU, memory, time)
- Code validation and security scanning
- Execution result formatting and error handling
- Audit logging for executed code

**Boundaries:**

- Does NOT manage user authentication (trusts main app)
- Does NOT persist user data or graphs
- Does NOT handle UI concerns
- Focused solely on Python execution environment

### 3. Redis Cache Layer (Optional - Future Enhancement)

**Responsibilities:**

- Caching execution results for identical code/input combinations
- Session storage for long-running executions
- Rate limiting and throttling state

## API Contract Between Services

### Main Application → Python Executor

#### Execute Code Endpoint

```http
POST /v1/execute
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "code": "def transform(input_text):\n    return input_text.upper()",
  "input": "hello world",
  "timeout": 30,
  "memory_limit": "128MB",
  "execution_id": "node-abc123-exec-456",
  "allowed_modules": ["re", "json", "datetime"]
}
```

#### Response Format

```json
{
  "success": true,
  "result": "HELLO WORLD",
  "execution_time": 0.045,
  "memory_used": "12MB",
  "warnings": [],
  "metadata": {
    "execution_id": "node-abc123-exec-456",
    "python_version": "3.11.0",
    "modules_imported": ["re"]
  }
}
```

#### Error Response

```json
{
  "success": false,
  "error": {
    "type": "ExecutionError",
    "message": "NameError: name 'undefined_var' is not defined",
    "code": "EXECUTION_FAILED",
    "line": 3,
    "traceback": "..."
  },
  "execution_time": 0.012,
  "metadata": {
    "execution_id": "node-abc123-exec-456"
  }
}
```

### Health and Management Endpoints

#### Health Check

```http
GET /health
→ 200 OK: {"status": "healthy", "python_version": "3.11.0", "active_executions": 0}
```

#### Metrics

```http
GET /metrics
→ 200 OK: {"executions_total": 1234, "avg_execution_time": 0.045, "active_workers": 4}
```

## Data Flow and Transformation Pipeline

### 1. Request Initiation

```
Main App (PythonTransform Node)
  ↓ HTTP Request
Python Executor Service
```

### 2. Security Validation Pipeline

```
Incoming Request
  ↓
Authentication Validation (JWT)
  ↓
Code Security Scanning
  ↓
Resource Limit Validation
  ↓
Module Allowlist Check
```

### 3. Execution Pipeline

```
Validated Request
  ↓
Create Sandboxed Environment
  ↓
Install/Validate Required Modules
  ↓
Execute Code with Resource Monitoring
  ↓
Capture Output/Errors
  ↓
Cleanup Environment
  ↓
Format Response
```

### 4. Response Flow

```
Execution Results
  ↓
JSON Serialization
  ↓ HTTP Response
Main App (PythonTransform Node)
  ↓
Integration with Node Graph Execution
```

## Deployment Architecture

### Development Environment

```
┌─────────────────┐    ┌─────────────────────┐
│   Main App      │    │  Python Executor    │
│  (Port 3000)    │    │    (Port 8001)      │
│                 │────│                     │
│ - Node.js       │HTTP│ - FastAPI           │
│ - React UI      │    │ - Docker Container  │
│ - Graph Engine  │    │ - Sandboxed Python  │
└─────────────────┘    └─────────────────────┘
```

### Production Environment

```
┌────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │    │  Main App       │    │ Python Executor │
│   (nginx/ALB)   │    │  (Multiple)     │    │   Cluster       │
│                 │────│                 │────│                 │
│ - SSL Term.     │    │ - Node.js       │    │ - Kubernetes    │
│ - Rate Limiting │    │ - Stateless     │    │ - Auto-scaling  │
│ - Health Checks │    │ - Horizontal    │    │ - Resource Mgmt │
└────────────────┘    └─────────────────┘    └─────────────────┘
                               │
                      ┌─────────────────┐
                      │   Database      │
                      │   (PostgreSQL)  │
                      │                 │
                      │ - User Data     │
                      │ - Graph Store   │
                      │ - Audit Logs    │
                      └─────────────────┘
```

### Security Layers

```
┌─────────────────────────────────────────────────┐
│                Load Balancer                    │
│ • Rate Limiting                                 │
│ • DDoS Protection                               │
│ • SSL/TLS Termination                           │
└─────────────────────────────────────────────────┘
                        │
┌─────────────────────────────────────────────────┐
│                Main Application                 │
│ • JWT Authentication                            │
│ • Input Validation                              │
│ • Authorization Checks                          │
│ • Request Sanitization                          │
└─────────────────────────────────────────────────┘
                        │
┌─────────────────────────────────────────────────┐
│              Python Executor Service            │
│ • Container Isolation                           │
│ • Resource Limits (CPU/Memory/Time)             │
│ • Module Allowlisting                           │
│ • Code Security Scanning                        │
│ • Network Restrictions                          │
│ • File System Sandboxing                       │
└─────────────────────────────────────────────────┘
```

## Technology Selection

### Python Web Framework: FastAPI

**Rationale:**

- High performance (comparable to Node.js)
- Automatic API documentation generation (OpenAPI)
- Built-in request validation with Pydantic
- Excellent async support for concurrent executions
- Type hints and modern Python features

### Communication Protocol: REST over HTTP

**Rationale:**

- Simplicity and universality
- Excellent debugging and monitoring tools
- Native browser support for development
- Stateless design supports scaling
- Familiar to development teams

**Alternative Considered:** gRPC

- **Pros:** Better performance, streaming support
- **Cons:** Additional complexity, less debugging tools
- **Decision:** Start with REST, migrate to gRPC if performance requires

### Containerization: Docker + Kubernetes

**Rationale:**

- Container isolation provides security boundaries
- Resource limiting built into containers
- Easy scaling and deployment
- Consistent environments across dev/staging/prod
- Kubernetes provides orchestration and health management

### Security Framework:

- **RestrictedPython** for code execution safety
- **Docker seccomp profiles** for system call restrictions
- **Resource limits** via cgroups
- **Network policies** for container isolation

## Operational Requirements

### Scaling Strategy

- **Horizontal scaling:** Multiple Python executor containers
- **Auto-scaling triggers:** CPU > 70%, Memory > 80%, Queue depth > 10
- **Load balancing:** Round-robin with health checks
- **Resource allocation:**
  - Development: 1 CPU, 512MB RAM per container
  - Production: 2 CPU, 1GB RAM per container

### Monitoring and Logging

- **Application metrics:** Execution time, success rate, active executions
- **System metrics:** CPU, memory, disk usage per container
- **Business metrics:** Most used Python modules, error patterns
- **Distributed tracing:** Request flow from main app through executor
- **Log aggregation:** Structured JSON logs to centralized system

### Disaster Recovery and High Availability

- **RTO (Recovery Time Objective):** 5 minutes
- **RPO (Recovery Point Objective):** 0 (stateless service)
- **Multi-AZ deployment** in production
- **Health checks** with automatic container restart
- **Graceful degradation:** Main app continues without Python execution
- **Circuit breaker pattern** to prevent cascade failures

## Integration Points with Existing Architecture

### Epic 7 Advanced Node Integration

- `PythonTransform` node extends `AdvancedRuntimeNode`
- Leverages existing state management and caching systems
- Uses `measureExecution` for performance tracking
- Integrates with validation framework

### Inspector Panel Integration

- Code editor component with Python syntax highlighting
- Real-time execution preview in inspector
- Error display with line numbers and highlighting
- Module management interface for allowed libraries

### Graph Engine Integration

- Seamless integration with existing node execution pipeline
- Maintains deterministic behavior with execution context
- Supports async execution without blocking graph processing
- Error handling propagates through graph execution chain

## Next Steps (8.1.2 - 8.1.6)

1. **REST API Implementation** - Detailed FastAPI service implementation
2. **Sandboxed Execution Environment** - Docker container security setup
3. **Main Application Integration** - PythonTransform node implementation
4. **Performance Monitoring** - Metrics and alerting system
5. **Documentation and Examples** - Developer guides and tutorials
