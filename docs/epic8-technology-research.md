# Epic 8.1.1 - Technology Research and Selection

## Containerization Options Analysis

### Docker (Recommended)
**Advantages:**
- Industry standard with mature ecosystem
- Excellent isolation and security features
- Resource limiting via cgroups (CPU, memory, disk I/O)
- Lightweight compared to VMs
- Easy local development with Docker Compose
- Rich base image ecosystem (python:3.11-slim)

**Use Case:**
```dockerfile
FROM python:3.11-slim
RUN useradd -m -u 1000 sandboxuser
USER sandboxuser
WORKDIR /app
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt
COPY app.py .
CMD ["python", "app.py"]
```

**Security Features:**
- `--security-opt no-new-privileges`
- `--cap-drop ALL` to remove all capabilities
- `--read-only` filesystem with tmpfs for /tmp
- Custom seccomp profile to restrict system calls

### Kubernetes (Production Orchestration)
**Advantages:**
- Horizontal pod autoscaling
- Rolling deployments with zero downtime
- Service discovery and load balancing
- Resource quotas and limit ranges
- Network policies for micro-segmentation
- Health checks and automatic restarts

**Resource Configuration:**
```yaml
resources:
  requests:
    cpu: 100m
    memory: 256Mi
  limits:
    cpu: 500m
    memory: 512Mi
```

**Alternative Considered:** Docker Swarm
- **Pros:** Simpler than Kubernetes, integrated with Docker
- **Cons:** Less feature-rich, smaller ecosystem
- **Decision:** Use Kubernetes for production scalability

## Communication Protocol Analysis

### REST over HTTP (Recommended)
**Advantages:**
- Universal compatibility (browsers, tools, libraries)
- Stateless design supports horizontal scaling
- Rich ecosystem of monitoring and debugging tools
- Human-readable for development and debugging
- Built-in caching support with HTTP headers
- OpenAPI specification generation

**API Design Principles:**
- RESTful resource modeling
- Consistent error response format
- Versioning through URL path (/v1/execute)
- Content negotiation (JSON primary, text/plain for simple responses)
- Idempotent operations where possible

### gRPC (Future Consideration)
**Advantages:**
- Binary protocol with better performance
- Built-in streaming for long-running executions
- Strong typing with Protocol Buffers
- Excellent code generation for clients

**Current Decision:** Start with REST for simplicity, evaluate gRPC migration if:
- Latency becomes critical (>100ms average)
- Need for streaming Python execution results
- High throughput requirements (>1000 req/sec)

## Security Frameworks and Libraries

### Python Code Execution Security

#### RestrictedPython (Primary Choice)
```python
from RestrictedPython import compile_restricted, safe_globals

# Compile user code safely
code = compile_restricted(user_code, '<user_script>', 'exec')

# Execute with restricted environment
safe_env = {
    '__builtins__': safe_globals,
    'allowed_modules': ['re', 'json', 'datetime']
}
exec(code, safe_env)
```

**Features:**
- AST-based code analysis before execution
- Removes dangerous operations (eval, exec, import, file access)
- Configurable allowed operations and modules
- Execution time and memory monitoring

#### Alternative: PyPy Sandbox
- **Pros:** Complete Python interpreter isolation
- **Cons:** Complex setup, limited Python version support
- **Decision:** Use RestrictedPython for easier maintenance

### Container Security

#### Docker Security Profile
```json
{
  "defaultAction": "SCMP_ACT_ERRNO",
  "architectures": ["SCMP_ARCH_X86_64"],
  "syscalls": [
    {
      "names": ["read", "write", "open", "close", "stat", "fstat"],
      "action": "SCMP_ACT_ALLOW"
    }
  ]
}
```

#### AppArmor Profile (Linux)
```
profile python-executor {
  /usr/bin/python3 ix,
  /app/** r,
  /tmp/** rw,
  deny network,
  deny /proc/sys/** w,
}
```

### Authentication and Authorization

#### JWT Token Validation
```python
import jwt
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer

security = HTTPBearer()

def verify_token(token: str = Depends(security)):
    try:
        payload = jwt.decode(token.credentials, SECRET_KEY, algorithms=['HS256'])
        return payload
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

#### Rate Limiting
```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/v1/execute")
@limiter.limit("10/minute")
async def execute_code(request: Request, ...):
    pass
```

## Operational Requirements Detail

### Scaling Strategy and Resource Allocation

#### Development Environment
- **Single container** with 1 CPU core, 512MB RAM
- **Local Docker Compose** for easy development
- **Hot reloading** for code changes
- **Shared volume** for code persistence during development

#### Staging Environment
- **2-3 containers** behind load balancer
- **1 CPU core, 1GB RAM** per container
- **Kubernetes deployment** with manual scaling
- **Resource monitoring** with alerts

#### Production Environment
- **Horizontal Pod Autoscaler** configuration:
  ```yaml
  spec:
    minReplicas: 3
    maxReplicas: 20
    targetCPUUtilizationPercentage: 70
    targetMemoryUtilizationPercentage: 80
  ```
- **Node affinity** to ensure containers don't overload single node
- **Pod disruption budgets** for maintenance
- **Resource quotas** to prevent runaway containers

### Monitoring and Logging Approach

#### Application Metrics (Prometheus)
```python
from prometheus_client import Counter, Histogram, Gauge

EXECUTION_COUNTER = Counter('python_executions_total', 'Total executions')
EXECUTION_DURATION = Histogram('python_execution_seconds', 'Execution time')
ACTIVE_EXECUTIONS = Gauge('python_active_executions', 'Currently running executions')
```

#### Structured Logging
```python
import structlog

logger = structlog.get_logger()

@app.post("/v1/execute")
async def execute_code(request: ExecuteRequest):
    logger.info("execution_started", 
                execution_id=request.execution_id,
                code_length=len(request.code),
                timeout=request.timeout)
```

#### Distributed Tracing (OpenTelemetry)
```python
from opentelemetry import trace
from opentelemetry.exporter.jaeger.thrift import JaegerExporter

tracer = trace.get_tracer(__name__)

@app.post("/v1/execute")
async def execute_code(request: ExecuteRequest):
    with tracer.start_as_current_span("python_execution") as span:
        span.set_attribute("execution.id", request.execution_id)
        span.set_attribute("code.length", len(request.code))
```

### Disaster Recovery and High Availability Plan

#### Multi-Region Deployment
```
Primary Region (us-east-1)     Secondary Region (us-west-2)
┌─────────────────────┐        ┌─────────────────────┐
│ Main App Cluster    │        │ Main App Cluster    │
│ Python Exec Cluster │───────▶│ Python Exec Cluster │
│ Database (Primary)  │        │ Database (Replica)  │
└─────────────────────┘        └─────────────────────┘
```

#### Health Check Strategy
```python
@app.get("/health")
async def health_check():
    # Check Docker daemon
    # Check available memory
    # Check Python interpreter
    # Check required modules
    return {
        "status": "healthy",
        "python_version": sys.version,
        "available_memory": psutil.virtual_memory().available,
        "active_executions": len(active_executions)
    }
```

#### Circuit Breaker Pattern
```python
from circuit_breaker import CircuitBreaker

python_executor_breaker = CircuitBreaker(
    failure_threshold=5,
    recovery_timeout=30,
    expected_exception=ExecutionTimeoutError
)

@python_executor_breaker
async def call_python_executor(code, input_data):
    # Make HTTP request to Python executor
    pass
```

#### Graceful Degradation
- **Fallback behavior:** Main app continues without Python execution
- **User notification:** Clear error messages when Python service unavailable
- **Cached results:** Return previous execution results if available
- **Queue system:** Buffer requests during service recovery

## Technology Stack Summary

### Selected Technologies
1. **Containerization:** Docker + Kubernetes
2. **Communication:** REST over HTTP with OpenAPI
3. **Python Security:** RestrictedPython + Docker isolation
4. **Monitoring:** Prometheus + Grafana + OpenTelemetry
5. **Authentication:** JWT tokens with shared secret
6. **Rate Limiting:** Token bucket algorithm
7. **Load Balancing:** Kubernetes Services + Ingress

### Implementation Priority
1. **Phase 1:** Docker container with RestrictedPython
2. **Phase 2:** FastAPI service with basic endpoints
3. **Phase 3:** Kubernetes deployment with monitoring
4. **Phase 4:** Advanced security and rate limiting
5. **Phase 5:** High availability and disaster recovery

## Next Implementation Steps (Story 8.1.2)
1. Create FastAPI service structure
2. Implement REST API endpoints with OpenAPI spec
3. Add request/response validation with Pydantic
4. Create Docker container with security hardening
5. Set up basic monitoring and health checks