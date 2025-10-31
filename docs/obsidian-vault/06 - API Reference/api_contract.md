# PromptSpaghetti API Contract

**Version: 1.0.0**  
**Last Updated: 2025-07-14**  
**Status: DRAFT**

This document defines the contract for PromptSpaghetti APIs and CLI interfaces. All API integrations and CLI invocations must conform to this specification.

## 1. REST API Endpoints

### 1.1 POST /preview

Executes a graph with multiple seeds and returns the generated outputs.

**Request:**

```json
{
  "graph": {
    "nodes": [
      {
        "id": "string",
        "type": "string",
        "inputs": ["string"],
        "config": {}
      }
    ],
    "seed": "number | string | undefined"
  },
  "runs": "number (optional, default: 3)",
  "seedStart": "number (optional, default: 1)"
}
```

**Response:**

```json
{
  "results": [
    {
      "seed": "number",
      "output": "string"
    }
  ]
}
```

**Status Codes:**

- `200 OK`: Graph executed successfully
- `400 Bad Request`: Invalid request format or parameters
- `503 Service Unavailable`: Preview API is disabled via feature flag

**Feature Flag:** `ENABLE_PREVIEW_API` (defaults to `true`)

**Example:**

```
POST /preview
{
  "graph": {
    "nodes": [
      {
        "id": "output1",
        "type": "Output",
        "inputs": ["template1"]
      },
      {
        "id": "template1",
        "type": "Template",
        "inputs": [],
        "config": {
          "template": "Hello world! Random number: {{rand}}"
        }
      }
    ]
  },
  "runs": 2,
  "seedStart": 42
}
```

**Response:**

```json
{
  "results": [
    {
      "seed": 42,
      "output": "Hello world! Random number: 0.7242"
    },
    {
      "seed": 43,
      "output": "Hello world! Random number: 0.1937"
    }
  ]
}
```

### 1.2 POST /execute

Executes a graph once with an optional seed and returns the output.

**Request:**

```json
{
  "graph": {
    "nodes": [
      {
        "id": "string",
        "type": "string",
        "inputs": ["string"],
        "config": {}
      }
    ],
    "seed": "number | string | undefined"
  }
}
```

**Response:**

```json
{
  "outputs": ["string"]
}
```

**Status Codes:**

- `200 OK`: Graph executed successfully
- `400 Bad Request`: Invalid request format or parameters

### 1.3 POST /export

Converts a graph to a GeneratorBundle format.

**Request:**

```json
{
  "graph": {
    "nodes": [
      {
        "id": "string",
        "type": "string",
        "inputs": ["string"],
        "config": {}
      }
    ]
  }
}
```

**Response:**

```json
{
  "bundle": {
    // GeneratorBundle format
  }
}
```

**Status Codes:**

- `200 OK`: Graph converted successfully
- `400 Bad Request`: Invalid graph format

### 1.4 POST /import

Converts a GeneratorBundle to a graph format.

**Request:**

```json
{
  "bundle": {
    // GeneratorBundle format
  }
}
```

**Response:**

```json
{
  "graph": {
    "nodes": [
      {
        "id": "string",
        "type": "string",
        "inputs": ["string"],
        "config": {}
      }
    ]
  }
}
```

**Status Codes:**

- `200 OK`: Bundle imported successfully
- `400 Bad Request`: Invalid bundle format

## 2. CLI Interface

### 2.1 Execute Command

```bash
prompt-spaghetti execute <file.json> [options]
```

**Options:**

- `--seed <n>`: Set random seed (default: current timestamp)
- `--output <file>`: Write output to file instead of stdout
- `--quiet`: Suppress warnings and info messages

**Exit Codes:**

- `0`: Success
- `1`: Runtime error
- `2`: Invalid arguments or file

### 2.2 Export Command

```bash
prompt-spaghetti export <graph.json> <output.bundle.json> [options]
```

**Options:**

- `--format <format>`: Output format (default: `bundle`)
- `--quiet`: Suppress warnings and info messages

**Exit Codes:**

- `0`: Success
- `1`: Export error
- `2`: Invalid arguments or file

### 2.3 Import Command

```bash
prompt-spaghetti import <bundle.json> <output.graph.json> [options]
```

**Options:**

- `--format <format>`: Input format (default: `bundle`)
- `--quiet`: Suppress warnings and info messages

**Exit Codes:**

- `0`: Success
- `1`: Import error
- `2`: Invalid arguments or file

## 3. Breaking Changes Policy

The API and CLI interfaces are versioned using [Semantic Versioning](https://semver.org/):

1. **MAJOR version** changes indicate incompatible API changes
2. **MINOR version** changes add functionality in a backward-compatible manner
3. **PATCH version** changes make backward-compatible bug fixes

For any breaking changes:

1. The API will maintain backward compatibility for at least 3 months
2. Deprecation notices will be provided in the documentation and responses
3. New major versions will be deployed with a different endpoint path (/v2/\*)

## 4. Error Response Format

All API error responses follow this format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    // Optional additional context
  }
}
```

Common error codes:

- `INVALID_REQUEST`: Request format or parameters are invalid
- `GRAPH_VALIDATION_ERROR`: Graph structure is invalid
- `EXECUTION_ERROR`: Error during graph execution
- `FEATURE_DISABLED`: Feature is disabled via feature flag
- `SERVER_ERROR`: Internal server error

---

This API contract is maintained by the PromptSpaghetti team and is subject to change with proper versioning and notification.
