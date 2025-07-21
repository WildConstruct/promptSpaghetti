# Interactive Playground Basics

Learn how to use the PromptScape Interactive Playground to test, iterate, and experiment with custom nodes in real-time.

## What is the Interactive Playground?

The Interactive Playground is a web-based development environment that lets you:
- **Build nodes visually** with guided templates
- **Test in real-time** with immediate feedback
- **Experiment safely** without affecting your main project
- **Export working code** ready for production use

## Getting Started

### Opening the Playground

1. Navigate to the [Developer Portal](../index.html)
2. Click **"🎮 Interactive Playground"** or visit `/playground/`
3. The playground will load with a default text processor example

### Playground Interface Overview

```
┌─────────────────────────────────────────────────────────┐
│ 🎮 Custom Node Playground                    [Actions] │
├─────────────┬───────────────────────────────────────────┤
│ Templates   │ [Implementation] [Test Data] [Schema]     │
│ & Settings  │                                           │
│             │ ┌─────────────────────────────────────────┤
│ ┌─────────┐ │ │                                         │
│ │Text     │ │ │        Monaco Code Editor               │
│ │Processor│ │ │                                         │
│ └─────────┘ │ │                                         │
│             │ │                                         │
│ ┌─────────┐ │ └─────────────────────────────────────────┤
│ │API      │ │ Status: Ready           [Validate] [Run] │  
│ │Connector│ │                                           │
│ └─────────┘ │                                           │
└─────────────┴───────────────────────────────────────────┘
```

## Your First Playground Session

### Step 1: Load a Template

1. **Click on "Text Processor"** in the left sidebar
2. The playground loads pre-built TypeScript code
3. Notice the four tabs: Implementation, Test Inputs, Schema, Metadata

### Step 2: Understand the Code Structure

Click through each tab to see:

**Implementation Tab**: The main node logic
```typescript
export class TextProcessor extends CustomNodeBase {
  validate(): ValidationResult {
    // Validation logic
  }
  
  async execute(runtime: CustomNodeRuntime): Promise<CustomNodeResult> {
    // Core processing logic
  }
}
```

**Test Inputs Tab**: Sample data for testing
```json
{
  "text": "Hello World! This is a Test String.",
  "operation": "title"
}
```

**Schema Tab**: Input/output definitions
```json
{
  "inputs": {
    "text": {
      "type": "string",
      "required": true,
      "description": "Text to process"
    }
  },
  "outputs": {
    "result": {
      "type": "string", 
      "description": "Processed text result"
    }
  }
}
```

**Metadata Tab**: Node information and configuration
```json
{
  "type": "playground.text-processor",
  "displayName": "Text Processor",
  "description": "Advanced text processing...",
  "category": "Text Processing"
}
```

### Step 3: Run Your First Test

1. **Click the "▶ Execute" button** (bottom right)
2. Watch the loading indicator
3. View results in the popup panel

Expected output:
```json
{
  "result": "Hello World! This Is A Test String.",
  "originalLength": 37,
  "processedLength": 37,
  "operation": "title",
  "executionTime": 2.5
}
```

## Making Your First Modifications

### Experiment 1: Change the Input

1. Go to the **Test Inputs** tab
2. Modify the text:
   ```json
   {
     "text": "welcome to promptscape custom nodes!",
     "operation": "title"
   }
   ```
3. Click **Execute** again
4. See the new result: `"Welcome To Promptscape Custom Nodes!"`

### Experiment 2: Try Different Operations

Change the operation in Test Inputs:
- `"uppercase"` → `"WELCOME TO PROMPTSCAPE CUSTOM NODES!"`
- `"slug"` → `"welcome-to-promptscape-custom-nodes"`
- `"reverse"` → `"!sedon motsuc epacstpmorp ot emoclew"`

### Experiment 3: Modify the Code

1. Switch to the **Implementation** tab
2. Find the `switch` statement (around line 45)
3. Add a new operation:

```typescript
case 'alternating':
  result = text.split('').map((char, index) => 
    index % 2 === 0 ? char.toLowerCase() : char.toUpperCase()
  ).join('');
  break;
```

4. Update the **Schema** tab to include the new operation:
```json
"enum": ["uppercase", "lowercase", "title", "reverse", "trim", "slug", "alternating"]
```

5. Update **Test Inputs** to use the new operation:
```json
{
  "text": "hello world", 
  "operation": "alternating"
}
```

6. **Execute** to see: `"hElLo WoRlD"`

## Advanced Playground Features

### Validation and Error Checking

1. **Click "Validate"** to check your code
2. Common validation checks:
   - TypeScript compilation
   - Schema consistency
   - Metadata completeness
   - Security compliance

### Settings Panel

Configure playground behavior:
- **Enable Validation**: Real-time code checking
- **Enable Logging**: See execution logs and performance data
- **Enable Caching**: Cache results for repeated executions
- **Execution Timeout**: Set maximum execution time

### Error Handling Testing

1. Test with invalid inputs in the **Test Inputs** tab:
   ```json
   {
     "text": 123,  // Wrong type
     "operation": "uppercase"
   }
   ```

2. **Execute** to see error handling:
   ```
   ❌ Execution Error
   Input text must be a string
   Time: 2024-07-21T10:30:00.000Z
   ```

### Performance Monitoring

Enable logging to see detailed performance data:
```
📋 Execution Logs
[INFO] Processing text
[INFO] Text processing completed
```

## Working with Templates

### Available Templates

The playground includes several templates:

1. **Text Processor** (Beginner)
   - String manipulation
   - Basic validation
   - Performance logging

2. **API Connector** (Intermediate)  
   - External HTTP requests
   - Error recovery
   - Response parsing

3. **Conditional Logic** (Advanced)
   - Expression evaluation
   - Security validation
   - Complex branching

4. **Data Transformer** (Advanced)
   - Format conversion
   - Schema validation
   - Large data handling

### Switching Templates

1. Click any template in the sidebar
2. Playground loads the new code automatically
3. Previous work is lost (use Export first!)

### Customizing Templates

1. **Load a template** as starting point
2. **Modify** the implementation
3. **Update** schema and metadata accordingly
4. **Test thoroughly** with various inputs
5. **Export** your customized version

## Export and Integration

### Exporting Your Work

1. **Click "Export Node"** in the header
2. Downloads a JSON file with:
   - Complete implementation code
   - Schema and metadata
   - Export timestamp
   - Configuration settings

### Using Exported Nodes

The exported JSON can be:
1. **Imported** back into the playground later
2. **Converted** to a complete npm package
3. **Deployed** directly in PromptScape applications
4. **Shared** with team members

### Integration with PromptScape

```typescript
// In your PromptScape application
import { TextProcessor } from './exported-node';

const runtime = createRuntime();
runtime.registerCustomNode('my-text-processor', TextProcessor);
```

## Common Playground Workflows

### Rapid Prototyping

1. **Load** relevant template
2. **Modify** core logic quickly  
3. **Test** with sample data
4. **Iterate** on edge cases
5. **Export** when satisfied

### Learning Custom Node Development

1. **Start** with Text Processor
2. **Read** the implementation code
3. **Experiment** with modifications
4. **Break things** safely
5. **Progress** to advanced templates

### Debugging Existing Nodes

1. **Paste** your node code into Implementation
2. **Add** comprehensive test inputs
3. **Enable** logging and validation
4. **Step through** execution logic
5. **Fix** issues in real-time

### Teaching and Sharing

1. **Create** educational examples
2. **Export** complete implementations
3. **Share** playground URLs
4. **Document** lessons learned

## Best Practices

### Code Organization

- **Keep functions small** and focused
- **Add comprehensive error handling**
- **Include detailed logging**
- **Comment complex logic**
- **Use TypeScript types effectively**

### Testing Strategy

- **Test happy path** first
- **Add edge cases** systematically
- **Test error conditions**
- **Validate performance** with large inputs
- **Check security** with malicious inputs

### Performance Optimization

- **Enable caching** for expensive operations
- **Monitor execution time** with logging
- **Test with realistic data sizes**
- **Profile memory usage** patterns
- **Optimize critical paths**

## Troubleshooting

### Common Issues

**"Monaco Editor not loading"**
- Check internet connection
- Refresh the page
- Try incognito/private mode

**"Execution timeout"**  
- Reduce input data size
- Increase timeout in settings
- Check for infinite loops

**"Validation errors"**
- Review TypeScript syntax
- Check schema consistency
- Verify metadata completeness

**"Network errors"** (API Connector template)
- Check CORS settings
- Verify API endpoint availability
- Review security permissions

### Debug Mode

Enable detailed debugging:
1. Open browser developer tools (F12)
2. Check console for detailed error messages
3. Use network tab for API debugging
4. Monitor performance tab for bottlenecks

## Next Steps

### Continue Learning

1. **[Basic Patterns](./03-basic-patterns.html)** - Common implementation patterns
2. **[Advanced I/O](./04-advanced-io.html)** - Complex input/output handling  
3. **[Sample Projects](../sample-projects/)** - Complete example implementations

### Join the Community

- **[GitHub Discussions](https://github.com/promptspaghetti/promptscape/discussions)** - Ask questions
- **[Discord Server](https://discord.gg/promptscape)** - Real-time help
- **[Share Examples](../CONTRIBUTING.md)** - Contribute your creations

### Production Deployment

When your playground experiments are ready:
1. **[CLI Scaffolding](../cli-reference.html)** - Generate production projects
2. **[Testing Guide](../guides/testing.html)** - Comprehensive testing
3. **[Deployment Guide](../guides/deployment.html)** - Publishing and distribution

---

**Ready to experiment?** [Open the Interactive Playground →](../playground/)