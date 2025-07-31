# Integration Architecture Diagrams

**System:** PromptScape Randomizer Graph Platform  
**Purpose:** Visual documentation of current state vs. target architecture

## Current Architecture (Problem State)

### System Overview - Current Fragmented State

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLIENT (React + Vite)                       │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐           │
│  │   useAuth    │ │  Analytics   │ │   GraphEditor│           │
│  │   Hook       │ │  Dashboard   │ │              │           │
│  └──────────────┘ └──────────────┘ └──────────────┘           │
│           │                │                │                  │
└───────────┼────────────────┼────────────────┼──────────────────┘
            │                │                │
            ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SERVER (Node.js + Fastify)                  │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌──────────────┐│
│  │AuthService  │ │Analytics    │ │Graph        │ │WebSocket     ││
│  │             │ │Collector    │ │Executor     │ │Server        ││
│  │ • JWT       │ │             │ │             │ │              ││
│  │ • Sessions  │ │ • Metrics   │ │ • Runtime   │ │ • Real-time  ││
│  │ • TOTP      │ │ • Events    │ │ • Nodes     │ │ • Analytics  ││
│  └─────────────┘ └─────────────┘ └─────────────┘ └──────────────┘│
│           │                │                │                │  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌──────────────┐│
│  │WebAuthn     │ │Cost         │ │Python       │ │Workflow      ││
│  │Service      │ │Tracker      │ │Executor     │ │Orchestrator  ││
│  └─────────────┘ └─────────────┘ └─────────────┘ └──────────────┘│
│           │                │                │                │  │
└───────────┼────────────────┼────────────────┼────────────────┼──┘
            │                │                │                │
            ▼                ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PACKAGES/CORE                               │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌──────────────┐│
│  │Auth         │ │Runtime      │ │Security     │ │Extensions    ││
│  │Components   │ │Advanced     │ │Dashboard    │ │Lifecycle     ││
│  └─────────────┘ └─────────────┘ └─────────────┘ └──────────────┘│
└─────────────────────────────────────────────────────────────────┘

PROBLEMS:
❌ Multiple auth systems (4+ implementations)
❌ Duplicate analytics (6+ separate systems)
❌ Direct database access from 10+ services
❌ No service registry or dependency injection
❌ Version conflicts (Zod: 3.0.0 vs 3.22.4 vs 3.25.76)
❌ Hardcoded configuration scattered everywhere
❌ No unified event bus
```

### Data Flow - Current Fragmented State

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│              │    │              │    │              │
│   Client     │    │   Server     │    │  Database    │
│              │    │              │    │              │
└──────┬───────┘    └──────┬───────┘    └──────┬───────┘
       │                   │                   │
       │  Auth Request     │                   │
       ├──────────────────►│                   │
       │                   │ Direct SQL        │
       │                   ├──────────────────►│
       │                   │                   │
       │  Analytics Event  │                   │
       ├──────────────────►│                   │
       │                   │ Direct SQL        │
       │                   ├──────────────────►│
       │                   │                   │
       │  Graph Execution  │                   │
       ├──────────────────►│                   │
       │                   │ Direct SQL        │
       │                   ├──────────────────►│
       │                   │                   │

PROBLEMS:
❌ Each request creates new DB connections
❌ No connection pooling or resource management
❌ No caching layer or data access abstraction
❌ No unified logging or monitoring
❌ Direct SQL queries scattered across services
```

## Target Architecture (Solution State)

### System Overview - Integrated Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLIENT (React + Vite)                       │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐           │
│  │  Unified     │ │   Unified    │ │   Graph      │           │
│  │  Auth Hook   │ │  Analytics   │ │   Editor     │           │
│  │              │ │  Dashboard   │ │              │           │
│  └──────────────┘ └──────────────┘ └──────────────┘           │
│           │                │                │                  │
└───────────┼────────────────┼────────────────┼──────────────────┘
            │                │                │
            ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY                               │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                SERVICE REGISTRY                             ││
│  │ • Service Discovery  • Health Checks  • Load Balancing     ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
            │                │                │
            ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MICROSERVICES LAYER                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌──────────────┐│
│  │   AUTH      │ │ ANALYTICS   │ │   GRAPH     │ │  WORKFLOW    ││
│  │  SERVICE    │ │  SERVICE    │ │  SERVICE    │ │  SERVICE     ││
│  │             │ │             │ │             │ │              ││
│  │ • JWT       │ │ • Events    │ │ • Runtime   │ │ • Orchestr.  ││
│  │ • WebAuthn  │ │ • Metrics   │ │ • Execution │ │ • Agents     ││
│  │ • TOTP      │ │ • Cost      │ │ • Nodes     │ │ • Tasks      ││
│  └─────────────┘ └─────────────┘ └─────────────┘ └──────────────┘│
└─────────────────────────────────────────────────────────────────┘
            │                │                │                │
            ▼                ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SHARED LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌──────────────┐│
│  │  EVENT BUS  │ │   CONFIG    │ │    DATA     │ │   CACHE      ││
│  │             │ │  MANAGER    │ │   ACCESS    │ │   LAYER      ││
│  │ • Pub/Sub   │ │             │ │   LAYER     │ │              ││
│  │ • Events    │ │ • Env Vars  │ │             │ │ • Redis      ││
│  │ • Messages  │ │ • Secrets   │ │ • Repos     │ │ • Memory     ││
│  └─────────────┘ └─────────────┘ └─────────────┘ └──────────────┘│
└─────────────────────────────────────────────────────────────────┘
            │                │                │                │
            ▼                ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐              │
│  │ PostgreSQL  │ │    Redis    │ │   File      │              │
│  │             │ │             │ │   Storage   │              │
│  │ • Users     │ │ • Sessions  │ │             │              │
│  │ • Graphs    │ │ • Cache     │ │ • Assets    │              │
│  │ • Analytics │ │ • Events    │ │ • Exports   │              │
│  └─────────────┘ └─────────────┘ └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘

BENEFITS:
✅ Single auth service with pluggable providers
✅ Unified analytics pipeline with event correlation
✅ Service registry for dependency management
✅ Data access layer with connection pooling
✅ Event bus for cross-service communication
✅ Centralized configuration management
```

### Data Flow - Integrated Architecture

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│              │    │              │    │              │    │              │
│   Client     │    │ API Gateway  │    │  Services    │    │  Data Layer  │
│              │    │              │    │              │    │              │
└──────┬───────┘    └──────┬───────┘    └──────┬───────┘    └──────┬───────┘
       │                   │                   │                   │
       │  Auth Request     │                   │                   │
       ├──────────────────►│ Route + Auth      │                   │
       │                   ├──────────────────►│                   │
       │                   │                   │ Repository        │
       │                   │                   ├──────────────────►│
       │                   │                   │                   │
       │                   │                   │ Event Bus         │
       │                   │                   │ ┌─────────────────┤
       │                   │                   │ │ • Auth Success  │
       │                   │                   │ │ • Analytics     │
       │                   │                   │ │ • Audit Log     │
       │                   │                   │ └─────────────────┤
       │                   │                   │                   │
       │  Response + Token │                   │                   │
       │◄──────────────────┤◄──────────────────┤                   │
       │                   │                   │                   │

BENEFITS:
✅ Connection pooling and resource management
✅ Unified logging and monitoring
✅ Event-driven architecture with pub/sub
✅ Caching layer for performance
✅ Repository pattern for data access
```

## Service Integration Patterns

### Before: Direct Dependencies (Tightly Coupled)

```
┌─────────────────┐
│  Auth Service   │
│                 │
│ ┌─────────────┐ │    ┌─────────────────┐
│ │ Database    │─┼───►│   PostgreSQL    │
│ │ Connection  │ │    └─────────────────┘
│ └─────────────┘ │
│                 │    ┌─────────────────┐
│ ┌─────────────┐ │    │   Redis         │
│ │ Redis Conn  │─┼───►│   Instance      │
│ └─────────────┘ │    └─────────────────┘
│                 │
│ ┌─────────────┐ │    ┌─────────────────┐
│ │ Email Svc   │─┼───►│   SMTP Server   │
│ └─────────────┘ │    └─────────────────┘
└─────────────────┘

PROBLEMS:
❌ Hard to test (requires real database)
❌ Hard to configure (hardcoded connections)
❌ Hard to scale (each service manages own resources)
❌ Hard to monitor (no centralized logging)
```

### After: Dependency Injection (Loosely Coupled)

```
┌─────────────────────────────────────────────────────────────────┐
│                     SERVICE CONTAINER                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌──────────────┐│
│  │ DB Pool     │ │ Redis Pool  │ │ Email Svc   │ │ Config Mgr   ││
│  │ Manager     │ │ Manager     │ │ Manager     │ │              ││
│  └─────────────┘ └─────────────┘ └─────────────┘ └──────────────┘│
└─────────────────────────────────────────────────────────────────┘
           ▲                ▲                ▲                ▲
           │                │                │                │
┌─────────────────┐        │                │                │
│  Auth Service   │        │                │                │
│                 │        │                │                │
│ ┌─────────────┐ │        │                │                │
│ │ IDatabase   │─┼────────┘                │                │
│ │ Interface   │ │                         │                │
│ └─────────────┘ │                         │                │
│                 │                         │                │
│ ┌─────────────┐ │                         │                │
│ │ ICache      │─┼─────────────────────────┘                │
│ │ Interface   │ │                                          │
│ └─────────────┘ │                                          │
│                 │                                          │
│ ┌─────────────┐ │                                          │
│ │ IEmail      │─┼──────────────────────────────────────────┘
│ │ Interface   │ │
│ └─────────────┘ │
└─────────────────┘

BENEFITS:
✅ Easy to test (inject mock dependencies)
✅ Easy to configure (centralized config management)
✅ Easy to scale (shared resource pools)
✅ Easy to monitor (centralized logging/metrics)
```

## Database Integration Pattern

### Before: Direct Database Access

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│              │    │              │    │              │
│ Auth Service │    │Analytics Svc │    │ Graph Service│
│              │    │              │    │              │
└──────┬───────┘    └──────┬───────┘    └──────┬───────┘
       │                   │                   │
       │ SQL Query         │ SQL Query         │ SQL Query
       ▼                   ▼                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                      PostgreSQL                                │
│                                                                 │
│  users     analytics_events     graphs     sessions     ...    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

PROBLEMS:
❌ Each service manages own connections
❌ No connection pooling
❌ SQL scattered throughout codebase
❌ No caching strategy
❌ Hard to implement cross-service transactions
```

### After: Repository Pattern with Connection Pooling

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│              │    │              │    │              │
│ Auth Service │    │Analytics Svc │    │ Graph Service│
│              │    │              │    │              │
└──────┬───────┘    └──────┬───────┘    └──────┬───────┘
       │                   │                   │
       │ Repository        │ Repository        │ Repository
       │ Interface         │ Interface         │ Interface
       ▼                   ▼                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATA ACCESS LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌──────────────┐│
│  │User         │ │Analytics    │ │Graph        │ │Session       ││
│  │Repository   │ │Repository   │ │Repository   │ │Repository    ││
│  └─────────────┘ └─────────────┘ └─────────────┘ └──────────────┘│
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐              │
│  │Connection   │ │Query        │ │Cache        │              │
│  │Pool Manager │ │Builder      │ │Manager      │              │
│  └─────────────┘ └─────────────┘ └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                      PostgreSQL                                │
└─────────────────────────────────────────────────────────────────┘

BENEFITS:
✅ Centralized connection management
✅ Query optimization and caching
✅ Consistent error handling
✅ Transaction management
✅ Database migration support
```

## Event System Integration

### Before: Direct Service Communication

```
┌──────────────┐                    ┌──────────────┐
│              │  HTTP Request      │              │
│ Auth Service │───────────────────►│Analytics Svc │
│              │                    │              │
└──────────────┘                    └──────────────┘
       │                                   │
       │ HTTP Request                      │ HTTP Request
       ▼                                   ▼
┌──────────────┐                    ┌──────────────┐
│              │                    │              │
│Email Service │                    │ Graph Service│
│              │                    │              │
└──────────────┘                    └──────────────┘

PROBLEMS:
❌ Tight coupling between services
❌ Synchronous communication causes bottlenecks
❌ Hard to add new consumers
❌ No event replay or persistence
❌ Difficult error handling and retries
```

### After: Event-Driven Architecture

```
┌──────────────┐    publish    ┌─────────────────────────────────────┐
│              │    events     │                                     │
│ Auth Service │──────────────►│            EVENT BUS                │
│              │               │                                     │
└──────────────┘               │  ┌─────────────┐ ┌─────────────┐    │
                               │  │   Topics    │ │ Subscribers │    │
┌──────────────┐    subscribe  │  │             │ │             │    │
│              │◄──────────────┤  │• auth       │ │• analytics  │    │
│Analytics Svc │               │  │• analytics  │ │• email      │    │
│              │               │  │• graphs     │ │• audit      │    │
└──────────────┘               │  │• workflows  │ │• workflows  │    │
                               │  └─────────────┘ └─────────────┘    │
┌──────────────┐    subscribe  │                                     │
│              │◄──────────────┤                                     │
│Email Service │               │                                     │
│              │               └─────────────────────────────────────┘
└──────────────┘                              ▲
                                              │ subscribe
┌──────────────┐                              │
│              │──────────────────────────────┘
│ Graph Service│
│              │
└──────────────┘

BENEFITS:
✅ Loose coupling between services
✅ Asynchronous communication improves performance
✅ Easy to add new event consumers
✅ Event persistence and replay capabilities
✅ Better error handling and retry mechanisms
```

---

**Document Version:** 1.0  
**Last Updated:** December 2024  
**Maintained By:** Development Team
