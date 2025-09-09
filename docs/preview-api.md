# Preview API Endpoint

## Overview

The Preview API Endpoint provides a way to generate multiple outputs from a graph using different seeds. This is useful for:

- Previewing variations of the same graph
- Testing the deterministic nature of the graph
- Generating multiple alternatives for users to choose from

## API Specification

### Endpoint

```
POST /preview
```

### Request Body

```json
{
  "graph": {
    "nodes": [...],  // Required: Array of node objects
    "edges": [...],  // Optional: Array of edge objects
    "seed": 12345    // Optional: Starting seed (overridden by seedStart)
  },
  "runs": 5,        // Optional: Number of outputs to generate (default: 5, max: 50)
  "seedStart": 1    // Optional: Starting seed value (default: 1)
}
```

### Response Body

```json
{
  "results": [
    {
      "seed": 1,
      "output": "Generated output for seed 1"
    },
    {
      "seed": 2,
      "output": "Generated output for seed 2"
    },
    ...
  ],
  "error": "Error message if applicable"
}
```

### Status Codes

- `200 OK`: Request processed successfully
- `400 Bad Request`: Invalid graph or parameters
- `500 Internal Server Error`: Server error during processing
- `503 Service Unavailable`: Preview API is disabled by feature flag

## Implementation Details

### Feature Flag

The Preview API can be disabled using an environment variable:

```
ENABLE_PREVIEW_API=false
```

This allows for easy rollback if issues arise in production.

### Execution Flow

1. API receives graph and parameters
2. Validates input using Zod schema
3. For each seed (starting at `seedStart` for `runs` iterations):
   - Creates a copy of the graph with the current seed
   - Executes the graph using the engine
   - Captures the first output node's result
   - Handles any errors per seed without failing the entire request
4. Returns an array of results with seed and output pairs

### Error Handling

- Schema validation errors return 400 with specific error details
- Runtime errors in individual seeds are captured in their output
- Catastrophic errors return 500 with error details
- Feature flag disablement returns 503

## Usage Examples

### Basic Usage

```javascript
// Client-side example
const response = await fetch('http://localhost:8000/preview', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    graph: myGraph,
    runs: 3
  })
});

const { results } = await response.json();
console.log(results);
```

### Custom Seed Range

```javascript
// Generate outputs for seeds 100-109
const response = await fetch('http://localhost:8000/preview', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    graph: myGraph,
    runs: 10,
    seedStart: 100
  })
});
```

## Testing

The API endpoint is thoroughly tested with unit tests covering:

- Multiple seed generation
- Feature flag functionality
- Error handling and validation
- Response format consistency

## Deployment Notes

### CI/CD Pipeline

The preview environment deployment is configured in the CI pipeline to:

1. Run API tests before deployment
2. Deploy to preview environment
3. Run smoke tests against the deployed endpoint

### Rollback Procedure

If issues are detected with the Preview API:

1. Set `ENABLE_PREVIEW_API=false` in environment
2. Deploy the change
3. Monitor and fix issues
4. Re-enable when resolved

The feature flag allows for immediate mitigation without requiring a code rollback.
