# Node Catalog API Technical Specification

## Overview

The Node Catalog API provides a centralized, versioned registry of all available node types in the PromptSpaghetti system. It serves as the single source of truth for node discovery, validation, and compatibility checking.

## API Endpoints

### 1. Get Full Catalog

```http
GET /api/catalog/nodes
```

**Response:**

```json
{
  "version": "2.0.0",
  "lastUpdated": "2025-01-26T10:00:00Z",
  "nodeCount": 45,
  "categories": [
    {
      "id": "branching",
      "name": "Branching & Choice",
      "description": "Nodes for conditional logic and random selection",
      "nodeCount": 8
    }
  ],
  "nodes": [
    {
      "id": "weightedChoice",
      "displayName": "Weighted Choice",
      "category": "branching",
      "version": "1.2.0",
      "description": "Randomly selects from weighted options",
      "inputs": [
        {
          "id": "target",
          "type": "any",
          "required": false,
          "description": "Optional input for chaining"
        }
      ],
      "outputs": [
        {
          "id": "main",
          "type": "string",
          "description": "Selected option text"
        }
      ],
      "configuration": {
        "type": "object",
        "properties": {
          "options": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "text": { "type": "string" },
                "weight": { "type": "number", "minimum": 0 }
              }
            }
          }
        }
      },
      "examples": [
        {
          "name": "Basic Color Choice",
          "config": {
            "options": [
              { "text": "red", "weight": 50 },
              { "text": "blue", "weight": 30 },
              { "text": "green", "weight": 20 }
            ]
          }
        }
      ],
      "tags": ["random", "choice", "weighted", "branching"],
      "deprecated": false
    }
  ],
  "compatibility": {
    "minimumVersion": "1.0.0",
    "breakingChanges": [
      {
        "version": "2.0.0",
        "nodes": ["legacyChoice"],
        "migration": "Use weightedChoice instead"
      }
    ]
  }
}
```

### 2. Get Node by ID

```http
GET /api/catalog/nodes/:nodeId
```

**Parameters:**

- `nodeId` (string): The unique identifier of the node type

**Response:** Single node object from catalog

### 3. Search Nodes

```http
GET /api/catalog/nodes/search?q=:query&category=:category&tags=:tags
```

**Query Parameters:**

- `q` (string): Search query for name/description
- `category` (string): Filter by category
- `tags` (string[]): Filter by tags (comma-separated)
- `includeDeprecated` (boolean): Include deprecated nodes

### 4. Get Node Compatibility

```http
GET /api/catalog/nodes/:nodeId/compatibility
```

**Response:**

```json
{
  "nodeId": "weightedChoice",
  "compatibleWith": ["1.0.0", "1.1.0", "1.2.0", "2.0.0"],
  "breakingChanges": [],
  "migrations": {
    "from": "1.0.0",
    "to": "2.0.0",
    "automatic": true,
    "script": "migrations/weightedChoice_1to2.js"
  },
  "dependencies": {
    "required": [],
    "optional": ["variableNode"]
  }
}
```

### 5. Agent-Optimized Endpoint

```http
GET /api/catalog/agent
```

**Response:** Simplified, flattened structure optimized for AI consumption

```json
{
  "nodes": {
    "weightedChoice": {
      "purpose": "random selection with weights",
      "inputs": "optional any type at 'target'",
      "outputs": "string at 'main'",
      "config": "array of {text: string, weight: number}",
      "example": "options: [{text:'yes',weight:70},{text:'no',weight:30}]"
    }
  },
  "categories": ["branching", "text", "variable", "utility", "epic7"],
  "total": 45
}
```

### 6. Validate Node Configuration

```http
POST /api/catalog/nodes/:nodeId/validate
```

**Request Body:**

```json
{
  "configuration": {
    "options": [{ "text": "option1", "weight": 50 }]
  }
}
```

**Response:**

```json
{
  "valid": true,
  "errors": [],
  "warnings": ["Only one option provided, consider adding more"],
  "suggestions": []
}
```

### 7. Get Node Registry Updates

```http
GET /api/catalog/updates?since=:timestamp
```

**Response:** List of nodes added/modified/deprecated since timestamp

## WebSocket API for Real-time Updates

```javascript
// Connect to catalog updates
ws://localhost:8000/catalog/stream

// Message types
{
  "type": "node.added",
  "data": { /* node definition */ }
}

{
  "type": "node.updated",
  "data": { /* updated node */ }
}

{
  "type": "node.deprecated",
  "data": { "nodeId": "legacyNode", "replacedBy": "newNode" }
}
```

## Internal Registry API (TypeScript)

```typescript
// Node Registry Service
class NodeRegistry {
  // Register a new node type
  register(nodeType: INodeType): void;

  // Get node definition
  getNode(id: string): NodeDefinition | null;

  // List all nodes
  listNodes(filter?: NodeFilter): NodeDefinition[];

  // Check if node exists
  hasNode(id: string): boolean;

  // Validate node configuration
  validateConfig(nodeId: string, config: any): ValidationResult;

  // Get node factory
  getFactory(nodeId: string): NodeFactory | null;

  // Auto-discover nodes from codebase
  discover(path: string): NodeDefinition[];

  // Generate catalog
  generateCatalog(): NodeCatalog;
}

// Node Type Interface
interface INodeType {
  id: string;
  version: string;
  metadata: NodeMetadata;

  // Factory method
  create(id: string, config: any): RuntimeNode;

  // Validation
  validate(config: any): ValidationResult;

  // Migration
  migrate?(fromVersion: string, config: any): any;

  // Serialization
  serialize(node: RuntimeNode): any;
  deserialize(data: any): RuntimeNode;
}
```

## Catalog Generation Process

1. **Build-time Generation:**

```bash
npm run generate:catalog
```

2. **Auto-discovery Decorators:**

```typescript
@NodeType({
  id: 'customNode',
  category: 'custom',
  version: '1.0.0',
  description: 'My custom node'
})
export class CustomNode extends BaseNode {
  @Input({ type: 'string', required: true })
  inputText: string;

  @Output({ type: 'string' })
  outputText: string;

  @Config({
    type: 'object',
    schema: ConfigSchema
  })
  configuration: CustomConfig;
}
```

3. **Catalog Output Files:**

- `/public/catalog/nodes.json` - Static JSON catalog
- `/src/types/catalog.d.ts` - TypeScript definitions
- `/docs/node-catalog.md` - Markdown documentation
- `/api/catalog/cache.json` - Server-side cache

## Error Handling

All API endpoints return consistent error responses:

```json
{
  "error": {
    "code": "NODE_NOT_FOUND",
    "message": "Node type 'unknownNode' not found in catalog",
    "details": {
      "requestedId": "unknownNode",
      "availableNodes": ["weightedChoice", "concat", ...]
    }
  }
}
```

## Rate Limiting

- General endpoints: 100 requests/minute
- Agent endpoint: 500 requests/minute
- WebSocket: 1 connection per client

## Caching Strategy

- Full catalog: Cache for 5 minutes
- Individual nodes: Cache for 10 minutes
- Search results: Cache for 1 minute
- Agent endpoint: Cache for 30 seconds

## Security Considerations

- CORS enabled for approved domains
- API key required for write operations (future)
- Input validation on all endpoints
- SQL injection prevention in search
- Rate limiting per IP address
