# File Format Specification v1.0.0

## Overview

This document defines the official file format specifications for the PromptScape Randomizer Graph system. It covers PSG (fragment) and PSGLib (preset) formats, their relationships, usage guidelines, and validation requirements.

## Format Types

### PSG Format (.psg) - Fragments

**Purpose**: Reusable component groups or graph fragments that can be inserted into larger graphs.

**Use Cases**:

- Character aspect fragments (body, emotion, action)
- Partial graph templates
- Reusable node collections
- Building blocks for complex graphs

**Key Characteristics**:

- Contains nodes, edges, and optional regions
- Uses x/y coordinates for node positioning
- Should NOT include Output nodes in fragments
- Supports region-based grouping with bounding boxes

### PSGLib Format (.psglib) - Complete Presets

**Purpose**: Complete, importable graph templates with full metadata and analytics tracking.

**Use Cases**:

- Full graph templates
- Shareable presets
- Marketplace items
- Complete workflow definitions

**Key Characteristics**:

- Contains full graph structure with metadata
- Uses position objects with x/y properties
- Includes usage statistics and marketplace fields
- Supports version tracking and licensing

## Schema Definitions

### PSG Schema (Fragment Format)

```typescript
interface PSGFile {
  version: string; // Format version (e.g., "1.0.0")
  name: string; // Fragment name
  description?: string; // Optional description
  metadata?: {
    type?: 'MULTI-ASPECT' | 'SINGLE' | string;
    author?: string;
    tags?: string[];
    [key: string]: any;
  };
  nodes: PSGNode[];
  edges: PSGEdge[];
  regions?: PSGRegion[]; // Optional region definitions
}

interface PSGNode {
  id: string; // Unique node identifier
  type: string; // Node type (e.g., "WeightedChoice")
  name?: string; // Display name
  description?: string;
  x: number; // X coordinate
  y: number; // Y coordinate
  options?: PSGNodeOption[]; // For WeightedChoice nodes
  template?: string; // For template-based nodes
  value?: any; // Node-specific value
  data?: Record<string, any>; // Additional node data
}

interface PSGNodeOption {
  text: string;
  weight: number;
  meta?: Record<string, any>;
}

interface PSGEdge {
  id: string;
  source: string; // Source node ID
  target: string; // Target node ID
}

interface PSGRegion {
  id: string;
  name: string;
  color?: string;
  color_comment?: string;
  nodes: string[]; // Node IDs in this region
  description?: string;
  metadata?: Record<string, any>;
  ports?: PSGPort[]; // Optional port definitions
}

interface PSGPort {
  id: string;
  label: string;
  type?: string;
  direction: 'input' | 'output';
  position?: number;
  color?: string;
}
```

### PSGLib Schema (Preset Format)

```typescript
interface PSGLibFile {
  fileType: 'psglib'; // Fixed identifier
  formatVersion: string; // Semantic version (e.g., "1.0.0")
  metadata: PSGLibMetadata;
  graph: {
    nodes: PSGLibNode[];
    edges: PSGLibEdge[];
    settings?: Record<string, any>;
  };
  additionalData?: {
    regions?: PSGRegion[]; // Preserved region data
  };
}

interface PSGLibMetadata {
  id: string; // Unique preset ID
  name: string;
  description: string;
  author: string;
  version: string; // Preset version
  tags: string[];
  nodeTypes: string[]; // List of node types used
  thumbnail?: string; // Base64 or URL
  lastModified: string; // ISO 8601 timestamp
  license: 'MIT' | 'CC-BY' | 'CC-BY-SA' | 'CC0' | 'proprietary' | 'custom';
  usageStats: {
    timesUsed: number;
    lastUsed: string | null;
    popularity: number;
  };
  marketplace?: {
    // Future marketplace support
    price: number | null;
    rating: number | null;
    downloads: number;
  };
  isFragment?: boolean; // Indicates if converted from fragment
  regions?: PSGRegion[]; // Original region data
}

interface PSGLibNode {
  id: string;
  type: string; // Node type identifier
  position: {
    x: number;
    y: number;
  };
  data: Record<string, any>; // Node-specific data
  size?: {
    width: number;
    height: number;
  };
  style?: Record<string, any>; // Visual styling
  label?: string;
  description?: string;
  tags?: string[];
}

interface PSGLibEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string; // Source connection point
  targetHandle?: string; // Target connection point
  type?: string; // Edge type
  data?: Record<string, any>;
}
```

## Node Type Naming Conventions

### Standard Node Types

The following mapping MUST be used consistently across all formats:

| Display Name          | PSG Type            | PSGLib/React Flow Type | Class Name          |
| --------------------- | ------------------- | ---------------------- | ------------------- |
| Weighted Choice       | WeightedChoice      | weightedChoice         | WeightedChoiceNode  |
| Output                | Output              | output                 | OutputNode          |
| Concatenate           | Concat              | concat                 | ConcatNode          |
| Text Block            | TextBlock           | textBlock              | TextBlockNode       |
| Variable              | Variable            | variable               | VariableNode        |
| Include               | Include             | include                | IncludeNode         |
| Set Variable          | SetVariable         | setVariable            | SetVariableNode     |
| Get Variable          | GetVariable         | getVariable            | GetVariableNode     |
| Subject               | Subject             | subject                | SubjectNode         |
| Action                | Action              | action                 | ActionNode          |
| Enhanced Bounding Box | EnhancedBoundingBox | enhancedBoundingBox    | EnhancedBoundingBox |

### Naming Rules

1. **PSG Format**: Use PascalCase for node types (e.g., `WeightedChoice`)
2. **PSGLib/React Flow**: Use camelCase for node types (e.g., `weightedChoice`)
3. **Class Names**: Use PascalCase with "Node" suffix (e.g., `WeightedChoiceNode`)
4. **New Types**: Must follow these conventions and be registered in nodeFactory

## Conversion Rules

### PSG to PSGLib Conversion

When converting from PSG to PSGLib format:

1. **Fragment Detection**:
   - Check for `metadata.type === 'MULTI-ASPECT'`
   - Check for presence of regions
   - If fragment, filter out Output nodes

2. **Node Type Mapping**:
   - Convert PascalCase to camelCase
   - Use the standard mapping table
   - Preserve unknown types with warning

3. **Position Conversion**:
   - PSG: `{ x: 100, y: 200 }`
   - PSGLib: `{ position: { x: 100, y: 200 } }`

4. **Region Handling**:
   - Create `enhancedBoundingBox` nodes for regions
   - Calculate bounds with padding
   - Preserve region metadata

5. **Edge Handle Mapping**:
   - WeightedChoice: outputs from 'main', inputs at 'target'
   - Output: outputs from 'output', inputs at 'target'
   - Concat: inputs at 'target'
   - Apply appropriate handles based on node types

### PSGLib to Graph Conversion

When importing PSGLib into the editor:

1. **ID Regeneration**:
   - Generate new unique IDs to avoid conflicts
   - Maintain ID mapping for edge references
   - Use timestamp + random + counter for uniqueness

2. **Node Data Structure**:
   - Extract `nodeType` from `type` field
   - Build appropriate data based on node type
   - Preserve all custom data fields

3. **Metadata Preservation**:
   - Track usage statistics
   - Maintain version information
   - Preserve licensing data

## Validation Requirements

### Schema Validation

All files MUST pass schema validation before processing:

1. **JSON Parsing**: Valid JSON structure required
2. **Schema Compliance**: Must match Zod schema definitions
3. **Version Compatibility**: Major version must match (1.x.x)
4. **Reference Integrity**: All edge sources/targets must exist
5. **Cycle Detection**: No circular dependencies allowed

### Content Validation

1. **Node Types**: Must be registered in nodeFactory
2. **Required Fields**: All required fields must be present
3. **Data Types**: Fields must match expected types
4. **Handle Compatibility**: Source/target handles must be valid

### Error Handling

```typescript
enum PSGLibErrorType {
  INVALID_JSON = 'INVALID_JSON',
  INVALID_SCHEMA = 'INVALID_SCHEMA',
  VERSION_INCOMPATIBLE = 'VERSION_INCOMPATIBLE',
  CORRUPTED_DATA = 'CORRUPTED_DATA',
  CIRCULAR_DEPENDENCY = 'CIRCULAR_DEPENDENCY'
}
```

## Version Management

### Format Versioning

- **Current Version**: 1.0.0
- **Versioning Scheme**: Semantic Versioning (Major.Minor.Patch)
- **Breaking Changes**: Increment Major version
- **New Features**: Increment Minor version
- **Bug Fixes**: Increment Patch version

### Compatibility Rules

1. **Forward Compatibility**: Newer parsers must read older formats
2. **Backward Compatibility**: Maintain for 2 major versions
3. **Migration Tools**: Provide automatic migration for version upgrades
4. **Deprecation Notice**: 6 months before removing support

### Version Detection

```typescript
function detectFormatVersion(data: any): string {
  if (data.formatVersion) return data.formatVersion; // PSGLib
  if (data.version) return data.version; // PSG
  return '1.0.0'; // Default
}
```

## Metadata Requirements

### Required Metadata

| Field                 | PSG | PSGLib | Description         |
| --------------------- | --- | ------ | ------------------- |
| version/formatVersion | ✓   | ✓      | Format version      |
| name                  | ✓   | ✓      | Human-readable name |
| id                    | -   | ✓      | Unique identifier   |
| author                | -   | ✓      | Creator name        |
| nodeTypes             | -   | ✓      | List of node types  |
| lastModified          | -   | ✓      | ISO 8601 timestamp  |

### Optional Metadata

- `description`: Detailed description
- `tags`: Categorization tags
- `thumbnail`: Preview image
- `license`: Usage license
- `usageStats`: Analytics data
- `marketplace`: Commerce data

## Best Practices

### For Fragments (PSG)

1. **No Output Nodes**: Fragments should not include Output nodes
2. **Clear Naming**: Use descriptive names for regions and nodes
3. **Port Definitions**: Define ports for region boundaries
4. **Metadata Tags**: Include relevant tags for discovery

### For Presets (PSGLib)

1. **Complete Graphs**: Include all necessary nodes and edges
2. **Version Tracking**: Update version on significant changes
3. **Usage Analytics**: Track usage for popularity metrics
4. **Licensing**: Specify appropriate license

### For Both Formats

1. **Unique IDs**: Ensure all IDs are unique within the file
2. **Valid References**: All edge references must point to existing nodes
3. **Documentation**: Include descriptions for complex structures
4. **Testing**: Validate before distribution

## Migration Guide

### From Legacy Formats

1. **Detect format version**
2. **Apply migration rules for version**
3. **Validate migrated data**
4. **Save in current format**

### Between PSG and PSGLib

Use the provided conversion functions:

- `convertPSGToPSGLib()`: Fragment to preset
- `parsePSG()`: Parse PSG files
- `parsePSGLib()`: Parse PSGLib files
- `regenerateNodeIds()`: Avoid ID conflicts

## Testing Requirements

### Unit Tests

1. **Schema Validation**: Test all schema rules
2. **Conversion**: Test PSG to PSGLib conversion
3. **ID Generation**: Test uniqueness of generated IDs
4. **Cycle Detection**: Test circular dependency detection

### Integration Tests

1. **File Import**: Test importing various file formats
2. **Node Creation**: Test node creation from data
3. **Edge Handling**: Test edge handle mapping
4. **Region Support**: Test bounding box creation

### Performance Tests

1. **Large Files**: Test with 500+ nodes
2. **Conversion Speed**: Benchmark conversion performance
3. **Memory Usage**: Monitor memory during processing

## Appendix

### Example PSG File (Fragment)

```json
{
  "version": "1.0.0",
  "name": "Character Emotions",
  "description": "Emotional states for character generation",
  "metadata": {
    "type": "MULTI-ASPECT",
    "author": "System",
    "tags": ["emotion", "character", "mood"]
  },
  "nodes": [
    {
      "id": "emotion-1",
      "type": "WeightedChoice",
      "name": "Primary Emotion",
      "x": 100,
      "y": 100,
      "options": [
        { "text": "happy", "weight": 3 },
        { "text": "sad", "weight": 2 },
        { "text": "angry", "weight": 1 }
      ]
    }
  ],
  "edges": [],
  "regions": [
    {
      "id": "region-emotions",
      "name": "Emotional States",
      "nodes": ["emotion-1"],
      "color": "#22d3ee"
    }
  ]
}
```

### Example PSGLib File (Preset)

```json
{
  "fileType": "psglib",
  "formatVersion": "1.0.0",
  "metadata": {
    "id": "preset-emotions-basic",
    "name": "Basic Emotions Template",
    "description": "Template for character emotional states",
    "author": "System",
    "version": "1.0.0",
    "tags": ["emotion", "character", "template"],
    "nodeTypes": ["weightedChoice"],
    "lastModified": "2025-01-26T10:00:00Z",
    "license": "MIT",
    "usageStats": {
      "timesUsed": 0,
      "lastUsed": null,
      "popularity": 0
    }
  },
  "graph": {
    "nodes": [
      {
        "id": "node-1",
        "type": "weightedChoice",
        "position": { "x": 100, "y": 100 },
        "data": {
          "label": "Primary Emotion",
          "options": [
            { "id": "opt-1", "text": "happy", "weight": 3 },
            { "id": "opt-2", "text": "sad", "weight": 2 }
          ]
        }
      }
    ],
    "edges": []
  }
}
```
