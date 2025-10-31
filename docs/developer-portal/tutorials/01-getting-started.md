# Getting Started with Custom Nodes

Welcome to custom node development for PromptScape! This tutorial will guide you through creating your first custom node in just a few minutes.

## What You'll Build

By the end of this tutorial, you'll have created a "Text Capitalizer" node that:

- Takes text input
- Converts it to uppercase
- Returns the processed result
- Includes proper validation and testing

## Prerequisites

- Node.js 18+ installed
- Basic TypeScript knowledge
- PromptScape development environment set up

## Step 1: Scaffold Your First Node

PromptScape provides an interactive CLI tool to generate custom node boilerplate. Let's use it to create our first node:

```bash
# Navigate to your PromptScape workspace
cd /path/to/your/promptscape-workspace

# Create a new custom node
npx @prompt-spaghetti/custom-node-sdk scaffold

# Follow the interactive prompts:
```

The CLI will ask you several questions. For this tutorial, use these answers:

```
? Node type identifier: my-company.text-capitalizer
? Display name: Text Capitalizer
? Description: Converts text to uppercase with validation
? Category: Text Processing
? Author name: Your Name
? Author email: your.email@example.com
? Does this node maintain state between executions? No
? Can results be cached for performance? Yes
? Does this node need file system access? No
? Does this node need network access? No

# For inputs:
? Input name: text
? Input type: string
? Is this input required? Yes
? Input description: Text to capitalize
? Input name: (leave empty to continue)

# For outputs:
? Output name: result
? Output type: string
? Output description: Capitalized text
? Output name: (leave empty to continue)
```

This generates a complete project structure:

```
my-company-text-capitalizer/
├── package.json          # Project configuration
├── tsconfig.json         # TypeScript configuration
├── jest.config.cjs       # Testing configuration
├── index.ts              # Your node implementation
├── index.test.ts         # Comprehensive tests
└── README.md             # Documentation
```

## Step 2: Understanding the Generated Code

Let's examine the generated node implementation in `index.ts`:

```typescript
import {
  CustomNodeBase,
  CustomNodeConfig,
  CustomNodeRuntime,
  CustomNodeResult,
  ValidationResult
} from '@prompt-spaghetti/custom-node-sdk';

/**
 * Converts text to uppercase with validation
 */
export class TextCapitalizer extends CustomNodeBase {
  constructor(id: string, config: CustomNodeConfig) {
    super(id, config);
  }

  validate(): ValidationResult {
    // Add custom validation logic here
    return {
      valid: true,
      errors: [],
      warnings: []
    };
  }

  async execute(runtime: CustomNodeRuntime): Promise<CustomNodeResult> {
    const { inputs, utils } = runtime;

    try {
      // Extract inputs
      const text = inputs.text;

      // TODO: Implement your custom node logic here
      const result = text.toUpperCase(); // Replace with actual logic

      return {
        outputs: {
          result
        }
      };
    } catch (error) {
      utils.log('error', 'Node execution failed', { error: error.message });
      throw error;
    }
  }
}
```

## Step 3: Enhance the Implementation

The scaffolded code already implements basic capitalization. Let's enhance it with better validation and error handling:

```typescript
validate(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if we have the required input schema
  if (!this.config.schema.inputs.text) {
    errors.push('Text input is required but not defined in schema');
  }

  // Warn about potential performance with very long strings
  if (this.config.schema.inputs.text?.maxLength &&
      this.config.schema.inputs.text.maxLength > 10000) {
    warnings.push('Processing very long strings may impact performance');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

async execute(runtime: CustomNodeRuntime): Promise<CustomNodeResult> {
  const { inputs, utils } = runtime;

  try {
    // Extract and validate inputs
    const text = inputs.text;

    if (typeof text !== 'string') {
      throw new Error('Input must be a string');
    }

    if (text.length === 0) {
      utils.log('warn', 'Empty string provided', { input: text });
      return { outputs: { result: '' } };
    }

    // Log processing for debugging
    utils.log('info', 'Processing text capitalization', {
      inputLength: text.length
    });

    // Implement the core logic
    const result = text.toUpperCase().trim();

    utils.log('info', 'Text capitalization completed', {
      outputLength: result.length
    });

    return {
      outputs: { result }
    };

  } catch (error) {
    utils.log('error', 'Node execution failed', {
      error: error.message,
      input: inputs.text
    });
    throw error;
  }
}
```

## Step 4: Test Your Node

The scaffolding included comprehensive tests. Let's run them:

```bash
cd my-company-text-capitalizer

# Install dependencies
npm install

# Run tests
npm test
```

You should see output like:

```
 PASS  ./index.test.ts
  TextCapitalizer
    validation
      ✓ should pass validation with valid configuration
    execution
      ✓ should execute successfully with valid inputs
      ✓ should throw error when required input "text" is missing

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
```

## Step 5: Build and Verify

Compile your TypeScript code:

```bash
# Build the project
npm run build

# This creates dist/index.js and dist/index.d.ts
ls dist/
```

## Step 6: Test in Interactive Playground

Now let's test your node in the PromptScape interactive playground:

1. **Open the Developer Portal**: Navigate to `docs/developer-portal/playground/index.html`

2. **Load Your Node**: Use the "Load Custom Node" feature to import your built node

3. **Test with Sample Data**:

   ```json
   {
     "text": "hello world, this is my first custom node!"
   }
   ```

4. **Expected Output**:
   ```json
   {
     "result": "HELLO WORLD, THIS IS MY FIRST CUSTOM NODE!"
   }
   ```

## Step 7: Understanding Node Metadata

Your node also exports metadata and schema information:

```typescript
// Export node metadata
export const nodeMetadata = {
  type: 'my-company.text-capitalizer',
  displayName: 'Text Capitalizer',
  description: 'Converts text to uppercase with validation',
  category: 'Text Processing',
  version: '1.0.0',
  author: {
    name: 'Your Name',
    email: 'your.email@example.com'
  }
};

// Export node schema
export const nodeSchema = {
  inputs: {
    text: {
      type: 'string',
      required: true,
      description: 'Text to capitalize'
    }
  },
  outputs: {
    result: {
      type: 'string',
      description: 'Capitalized text'
    }
  }
};
```

This metadata is used by PromptScape to:

- Display the node in the palette
- Generate the inspector UI
- Validate connections between nodes
- Provide documentation

## Next Steps

Congratulations! You've created your first custom node. Here's what to explore next:

### Immediate Next Steps

1. **[Try the Interactive Playground](./02-playground-basics.html)** - Test your node in real-time
2. **[Learn Basic Patterns](./03-basic-patterns.html)** - Common implementation patterns
3. **[Explore Sample Projects](../sample-projects/index.html)** - See more complex examples

### Advanced Topics

4. **[Advanced I/O Handling](./04-advanced-io.html)** - Complex input validation and transformation
5. **[State Management](./05-state-management.html)** - Building stateful nodes
6. **[External API Integration](./06-api-integration.html)** - Connecting to external services

## Common Issues and Solutions

### TypeScript Compilation Errors

**Issue**: `Cannot find module '@prompt-spaghetti/custom-node-sdk'`

**Solution**: Ensure the SDK is installed and built:

```bash
cd /path/to/promptscape-workspace
pnpm install
pnpm build
```

### Test Failures

**Issue**: Tests fail with context-related errors

**Solution**: Ensure you're using the latest SDK testing utilities:

```typescript
import { MockContextFactory } from '@prompt-spaghetti/custom-node-sdk/testing';
```

### Runtime Execution Issues

**Issue**: Node doesn't appear in PromptScape palette

**Solution**: Check that your node exports are properly configured and the metadata includes all required fields.

## Summary

You've successfully:

- ✅ Created a custom node using CLI scaffolding
- ✅ Enhanced the implementation with validation and error handling
- ✅ Written and run comprehensive tests
- ✅ Built the project and verified the output
- ✅ Understood the metadata and schema system

Your text capitalizer node is now ready to be integrated into PromptScape graphs!

**Continue to:** [Interactive Playground Basics →](./02-playground-basics.html)
