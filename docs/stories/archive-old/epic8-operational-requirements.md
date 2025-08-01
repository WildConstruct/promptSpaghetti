# Epic 8.1.1 - Operational Requirements

## Scaling Strategy and Resource Allocation

### Development Environment

**Target:** Single developer workflow with fast iteration

**Resources:**

- 1 Docker container: 1 CPU core, 512MB RAM
- Local execution timeout: 30 seconds
- Concurrent executions: 1 (sequential execution)
- Storage: 1GB for container images and temporary files

**Setup:**

```yaml
# docker-compose.dev.yml
version: '3.8'
services:
  python-executor:
    build: ./python-executor
    ports:
      - '8001:8000'
    environment:
      - ENV=development
      - MAX_CONCURRENT_EXECUTIONS=1
      - EXECUTION_TIMEOUT=30
    volumes:
      - ./python-executor:/app
    resources:
      limits:
        cpus: '1.0'
        memory: 512M
```

### Staging Environment

**Target:** Pre-production testing with realistic load

**Resources:**

- 2-3 containers: 1 CPU core, 1GB RAM each
- Load balancer: nginx or cloud ALB
- Execution timeout: 60 seconds
- Concurrent executions: 10 per container
- Auto-scaling: Manual (for testing scenarios)

**Configuration:**

```yaml
# k8s-staging.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: python-executor-staging
spec:
  replicas: 2
  selector:
    matchLabels:
      app: python-executor
  template:
    spec:
      containers:
        - name: python-executor
          image: python-executor:staging
          resources:
            requests:
              cpu: 500m
              memory: 512Mi
            limits:
              cpu: 1000m
              memory: 1Gi
          env:
            - name: MAX_CONCURRENT_EXECUTIONS
              value: '10'
            - name: EXECUTION_TIMEOUT
              value: '60'
```

### Production Environment

**Target:** High availability with automatic scaling

**Base Resources:**

- Minimum 3 containers (multi-AZ distribution)
- 2 CPU cores, 2GB RAM per container
- Execution timeout: 120 seconds
- Concurrent executions: 20 per container
- Auto-scaling enabled

**Scaling Triggers:**

- CPU utilization > 70% for 2 minutes → Scale up
- Memory utilization > 80% for 2 minutes → Scale up
- Active executions > 15 per pod → Scale up
- Queue depth > 20 requests → Scale up
- CPU utilization < 30% for 5 minutes → Scale down

**Horizontal Pod Autoscaler:**

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: python-executor-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: python-executor
  minReplicas: 3
  maxReplicas: 20
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
        - type: Percent
          value: 100
          periodSeconds: 15
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
        - type: Percent
          value: 10
          periodSeconds: 60
```

## Monitoring and Logging Approach

### Application Performance Monitoring

#### Key Performance Indicators (KPIs)

- **Execution Success Rate:** > 99.5%
- **Average Execution Time:** < 2 seconds
- **95th Percentile Execution Time:** < 5 seconds
- **Service Availability:** > 99.9%
- **Error Rate:** < 0.5%

#### Metrics Collection

```python
# metrics.py
from prometheus_client import Counter, Histogram, Gauge, Summary

# Request metrics
REQUEST_COUNT = Counter(
    'python_executor_requests_total',
    'Total requests to Python executor',
    ['method', 'endpoint', 'status']
)

EXECUTION_DURATION = Histogram(
    'python_executor_execution_seconds',
    'Time spent executing Python code',
    buckets=[0.1, 0.5, 1.0, 2.0, 5.0, 10.0, 30.0, float('inf')]
)

# Resource metrics
ACTIVE_EXECUTIONS = Gauge(
    'python_executor_active_executions',
    'Number of currently running executions'
)

MEMORY_USAGE = Gauge(
    'python_executor_memory_bytes',
    'Memory usage of Python executor container'
)

# Error tracking
EXECUTION_ERRORS = Counter(
    'python_executor_errors_total',
    'Total execution errors',
    ['error_type', 'error_code']
)

# Business metrics
CODE_COMPLEXITY = Summary(
    'python_executor_code_complexity',
    'Complexity metrics of executed code'
)

POPULAR_MODULES = Counter(
    'python_executor_modules_used_total',
    'Most frequently used Python modules',
    ['module_name']
)
```

#### Dashboards and Alerting

```yaml
# grafana-dashboard.json (key panels)
panels:
  - title: 'Request Rate'
    type: 'graph'
    targets:
      - expr: 'rate(python_executor_requests_total[5m])'

  - title: 'Execution Time Distribution'
    type: 'histogram'
    targets:
      - expr: 'python_executor_execution_seconds_bucket'

  - title: 'Error Rate'
    type: 'stat'
    targets:
      - expr: 'rate(python_executor_errors_total[5m]) / rate(python_executor_requests_total[5m])'
    alert:
      condition: 'gt'
      value: 0.01 # 1% error rate

  - title: 'Resource Utilization'
    type: 'graph'
    targets:
      - expr: 'python_executor_memory_bytes / 1024 / 1024' # MB
      - expr: 'rate(container_cpu_usage_seconds_total[5m]) * 100' # %
```

### Structured Logging

#### Log Levels and Categories

```python
import structlog
import sys

# Configure structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()

# Usage examples
@app.post("/v1/execute")
async def execute_code(request: ExecuteRequest):
    logger.info(
        "execution_started",
        execution_id=request.execution_id,
        code_hash=hashlib.md5(request.code.encode()).hexdigest(),
        timeout=request.timeout,
        allowed_modules=request.allowed_modules
    )

    try:
        result = await run_python_code(request)
        logger.info(
            "execution_completed",
            execution_id=request.execution_id,
            duration=result.execution_time,
            memory_used=result.memory_used,
            success=True
        )
    except Exception as e:
        logger.error(
            "execution_failed",
            execution_id=request.execution_id,
            error_type=type(e).__name__,
            error_message=str(e),
            traceback=traceback.format_exc()
        )
```

#### Log Aggregation and Analysis

```yaml
# fluentd config for log collection
<source>
@type forward
port 24224
</source>

<filter python-executor.**>
@type parser
key_name log
format json
reserve_data true
</filter>

<match python-executor.**>
@type elasticsearch
host elasticsearch.logging.svc.cluster.local
port 9200
index_name python-executor-logs
type_name _doc
include_tag_key true
tag_key @log_name
</match>
```

### Distributed Tracing

#### OpenTelemetry Integration

```python
from opentelemetry import trace
from opentelemetry.exporter.jaeger.thrift import JaegerExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor

# Initialize tracing
trace.set_tracer_provider(TracerProvider())
tracer = trace.get_tracer(__name__)

jaeger_exporter = JaegerExporter(
    agent_host_name="jaeger-agent",
    agent_port=6831,
)

span_processor = BatchSpanProcessor(jaeger_exporter)
trace.get_tracer_provider().add_span_processor(span_processor)

# Trace execution flow
@app.post("/v1/execute")
async def execute_code(request: ExecuteRequest):
    with tracer.start_as_current_span("python_execution") as span:
        span.set_attribute("execution.id", request.execution_id)
        span.set_attribute("code.length", len(request.code))
        span.set_attribute("timeout", request.timeout)

        with tracer.start_as_current_span("code_validation"):
            validate_code(request.code)

        with tracer.start_as_current_span("environment_setup"):
            env = create_sandbox_environment()

        with tracer.start_as_current_span("code_execution") as exec_span:
            result = execute_in_sandbox(request.code, env)
            exec_span.set_attribute("execution.success", result.success)
            exec_span.set_attribute("execution.duration", result.duration)
```

## Disaster Recovery and High Availability Plan

### Service Level Objectives (SLOs)

#### Availability Targets

- **Service Availability:** 99.9% (8.77 hours downtime/year)
- **Response Time:** 95% of requests < 2 seconds
- **Error Rate:** < 0.1% of all executions
- **Recovery Time Objective (RTO):** 5 minutes
- **Recovery Point Objective (RPO):** 0 (stateless service)

#### Failure Scenarios and Response

| Scenario              | Impact               | Detection Time | Recovery Time | Mitigation                 |
| --------------------- | -------------------- | -------------- | ------------- | -------------------------- |
| Single pod failure    | Reduced capacity     | 30 seconds     | 1 minute      | Auto-restart, HPA scaling  |
| Node failure          | 20-30% capacity loss | 1 minute       | 3 minutes     | Pod rescheduling, multi-AZ |
| AZ failure            | 33% capacity loss    | 2 minutes      | 5 minutes     | Cross-AZ distribution      |
| Region failure        | 100% service loss    | 5 minutes      | 15 minutes    | Cross-region failover      |
| Code injection attack | Security breach      | Real-time      | Immediate     | Container isolation, audit |

### High Availability Architecture

#### Multi-AZ Deployment

```yaml
# Node affinity for multi-AZ distribution
apiVersion: apps/v1
kind: Deployment
spec:
  template:
    spec:
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
            - weight: 100
              podAffinityTerm:
                labelSelector:
                  matchExpressions:
                    - key: app
                      operator: In
                      values:
                        - python-executor
                topologyKey: topology.kubernetes.io/zone
      tolerations:
        - key: node.kubernetes.io/not-ready
          operator: Exists
          effect: NoExecute
          tolerationSeconds: 30
        - key: node.kubernetes.io/unreachable
          operator: Exists
          effect: NoExecute
          tolerationSeconds: 30
```

#### Health Checks and Circuit Breakers

```python
# Health check implementation
@app.get("/health")
async def health_check():
    checks = {}

    # Check system resources
    memory = psutil.virtual_memory()
    checks["memory"] = {
        "available_mb": memory.available // 1024 // 1024,
        "usage_percent": memory.percent,
        "healthy": memory.percent < 90
    }

    # Check Python interpreter
    try:
        exec("print('test')", {})
        checks["python_interpreter"] = {"healthy": True}
    except Exception as e:
        checks["python_interpreter"] = {"healthy": False, "error": str(e)}

    # Check container resources
    checks["disk_space"] = {
        "usage_percent": psutil.disk_usage('/').percent,
        "healthy": psutil.disk_usage('/').percent < 85
    }

    # Overall health
    healthy = all(check.get("healthy", True) for check in checks.values())

    return {
        "status": "healthy" if healthy else "unhealthy",
        "timestamp": datetime.utcnow().isoformat(),
        "checks": checks,
        "version": os.getenv("SERVICE_VERSION", "unknown")
    }

# Circuit breaker for external dependencies
from pybreaker import CircuitBreaker

db_breaker = CircuitBreaker(
    fail_max=5,
    reset_timeout=30,
    exclude=[ConnectionError, TimeoutError]
)

@db_breaker
async def log_execution_audit(execution_data):
    # Log to external audit system
    pass
```

### Graceful Degradation Strategy

#### Fallback Mechanisms

```python
class PythonExecutorService:
    def __init__(self):
        self.cache = {}
        self.circuit_breaker = CircuitBreaker(fail_max=3, reset_timeout=60)

    async def execute_with_fallback(self, request: ExecuteRequest):
        # Try cache first
        cache_key = self.get_cache_key(request)
        if cache_key in self.cache:
            logger.info("execution_from_cache", execution_id=request.execution_id)
            return self.cache[cache_key]

        try:
            # Primary execution path
            result = await self.execute_python(request)
            self.cache[cache_key] = result
            return result

        except ResourceExhaustedException:
            # Queue for later execution
            await self.queue_for_retry(request)
            return ExecutionResult(
                success=False,
                error="Service temporarily unavailable - queued for retry",
                retry_after=60
            )

        except SecurityException:
            # Don't retry security violations
            logger.warning("security_violation",
                         execution_id=request.execution_id,
                         code_hash=hashlib.md5(request.code.encode()).hexdigest())
            return ExecutionResult(
                success=False,
                error="Code execution blocked for security reasons",
                permanent_failure=True
            )
```

#### User Communication Strategy

```typescript
// Client-side handling in main application
class PythonExecutorClient {
  async executeCode(code: string, input: any): Promise<ExecutionResult> {
    try {
      const result = await this.httpClient.post('/v1/execute', {
        code,
        input,
        execution_id: generateId(),
      });
      return result.data;
    } catch (error) {
      if (error.status === 503) {
        // Service temporarily unavailable
        this.showUserMessage('Python execution is temporarily unavailable. Please try again in a moment.');
        return { success: false, error: 'Service unavailable', retry: true };
      }

      if (error.status === 429) {
        // Rate limited
        this.showUserMessage('Too many requests. Please wait before trying again.');
        return { success: false, error: 'Rate limited', retry_after: error.headers['retry-after'] };
      }

      // Other errors
      throw error;
    }
  }
}
```

### Monitoring and Alerting for Reliability

#### Critical Alerts (PagerDuty Integration)

```yaml
# prometheus alerts
groups:
  - name: python-executor.critical
    rules:
      - alert: PythonExecutorDown
        expr: up{job="python-executor"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: 'Python Executor service is down'

      - alert: HighErrorRate
        expr: rate(python_executor_errors_total[5m]) / rate(python_executor_requests_total[5m]) > 0.05
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: 'High error rate in Python Executor'

      - alert: HighLatency
        expr: histogram_quantile(0.95, python_executor_execution_seconds_bucket) > 10
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: 'High execution latency in Python Executor'
```

#### Runbook Documentation

```markdown
# Python Executor Service Runbook

## Alert: PythonExecutorDown

**Severity:** Critical
**Description:** No Python executor pods are responding to health checks

**Investigation Steps:**

1. Check pod status: `kubectl get pods -l app=python-executor`
2. Check pod logs: `kubectl logs -l app=python-executor --tail=100`
3. Check node resources: `kubectl top nodes`
4. Check events: `kubectl get events --sort-by=.metadata.creationTimestamp`

**Resolution:**

- If pods are pending: Check node capacity and resource requests
- If pods are crashing: Check logs for errors, validate container image
- If nodes are down: Coordinate with infrastructure team

**Escalation:** If not resolved in 10 minutes, escalate to platform team
```

This completes Story 8.1.1 - Microservice Architecture Design with comprehensive operational requirements covering scaling, monitoring, logging, and disaster recovery planning.
