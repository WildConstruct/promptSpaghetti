# Interactive Examples Integration Guide

This guide explains how to integrate the interactive examples system into the Content Authoring Handbook.

## Quick Start

### 1. Include Required Files

Add these files to your HTML page:

```html
<!-- CSS -->
<link rel="stylesheet" href="assets/css/interactive-examples.css" />

<!-- JavaScript -->
<script src="assets/js/interactive-examples.js"></script>
```

### 2. Create Interactive Example

Add a div with the appropriate data attributes:

```html
<div
  id="my-example"
  data-interactive-example
  data-title="My Generator"
  data-variations="true"
  data-code='{"meta":{"name":"Test"},"grammar":{"start":"Hello!"}}'
></div>
```

### 3. Auto-initialization

Examples initialize automatically when the page loads. No additional JavaScript needed!

## Configuration Options

### Basic Configuration

```html
<div
  id="example-1"
  data-interactive-example
  data-title="Basic Example"
  data-code='{"grammar":{"start":"Hello world"}}'
></div>
```

### Advanced Configuration

```html
<div
  id="example-2"
  data-interactive-example
  data-title="Advanced Example"
  data-variations="true"
  data-options='{"autoRun":false,"editorHeight":"400px","showVariations":true}'
></div>
```

## Data Attributes

| Attribute         | Description        | Example                        |
| ----------------- | ------------------ | ------------------------------ |
| `data-title`      | Example title      | `"My Generator"`               |
| `data-code`       | Initial JSON code  | `'{"grammar":{"start":"Hi"}}'` |
| `data-variations` | Show variations    | `"true"` or `"false"`          |
| `data-options`    | Additional options | `'{"autoRun":false}'`          |

## Options Object

```javascript
{
  editorHeight: '300px',      // Height of code editor
  previewHeight: '200px',     // Height of preview area
  defaultSeed: '12345',       // Default seed value
  autoRun: true,              // Run generator on code changes
  syntaxHighlight: true,      // Enable syntax highlighting
  showVariations: false       // Show multiple seed outputs
}
```

## Manual Initialization

For dynamic content or custom initialization:

```javascript
const example = new InteractiveExample('my-container', {
  title: 'Custom Example',
  initialCode: JSON.stringify(
    {
      meta: { name: 'Custom Generator' },
      grammar: { start: 'Hello!' },
    },
    null,
    2
  ),
  autoRun: true,
  showVariations: true,
});
```

## Generator Engine Integration

### Current Implementation

The current implementation uses a simplified mock engine for demonstration. For production use, integrate with the actual Prompt Spaghetti engine:

```javascript
async executeGenerator(generatorJSON, seed) {
  // Replace this with actual engine call
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ generator: generatorJSON, seed })
  });

  return await response.json();
}
```

### Engine API Requirements

The engine should provide:

- `POST /api/generate` - Execute generator with seed
- `POST /api/validate` - Validate generator JSON
- `GET /api/examples` - Get example generators

## Styling Customization

### CSS Variables

Customize appearance using CSS variables:

```css
:root {
  --example-border-color: #e1e4e8;
  --example-bg-color: #ffffff;
  --example-header-bg: #f6f8fa;
  --example-button-bg: #fafbfc;
  --example-text-color: #24292e;
  --example-success-color: #1a7f37;
  --example-error-color: #cf222e;
}
```

### Custom Themes

Create themed examples:

```html
<div id="dark-example" data-interactive-example class="dark-theme" data-title="Dark Theme Example"></div>
```

```css
.dark-theme {
  --example-bg-color: #0d1117;
  --example-text-color: #f0f6fc;
  --example-border-color: #30363d;
}
```

## Example Templates

### Basic Generator Template

```html
<div
  id="basic-template"
  data-interactive-example
  data-title="Basic Generator Template"
  data-code='{
  "meta": {
    "name": "Basic Generator",
    "version": "1.0.0"
  },
  "grammar": {
    "start": "[greeting] [subject]!",
    "greeting": ["Hello", "Hi", "Hey"],
    "subject": ["world", "there", "friend"]
  }
}'
></div>
```

### Advanced Template with Variables

```html
<div
  id="advanced-template"
  data-interactive-example
  data-title="Advanced Generator Template"
  data-variations="true"
  data-code='{
  "meta": {
    "name": "Advanced Generator",
    "version": "1.0.0"
  },
  "variables": {
    "characterName": "",
    "characterClass": ""
  },
  "grammar": {
    "start": "[setCharacter][introduction]",
    "setCharacter": "[setName][setClass]",
    "setName": {
      "type": "setVariable",
      "key": "characterName", 
      "value": "[names]"
    },
    "setClass": {
      "type": "setVariable",
      "key": "characterClass",
      "value": "[classes]"
    },
    "names": ["Aria", "Bjorn", "Cara"],
    "classes": ["warrior", "mage", "rogue"],
    "introduction": "Meet {characterName} the {characterClass}!"
  }
}'
></div>
```

## Error Handling

### Common Issues

1. **Invalid JSON**: Check for syntax errors in data-code
2. **Missing Elements**: Ensure container has unique ID
3. **Script Loading**: Verify JavaScript files load correctly
4. **CSS Conflicts**: Check for conflicting styles

### Debug Mode

Enable debug mode for troubleshooting:

```javascript
window.InteractiveExampleDebug = true;
```

This will log detailed information to the browser console.

## Performance Considerations

### Lazy Loading

For pages with many examples, implement lazy loading:

```javascript
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const element = entry.target;
      if (!element.dataset.initialized) {
        new InteractiveExample(element.id);
        element.dataset.initialized = 'true';
      }
    }
  });
});

document.querySelectorAll('[data-interactive-example]').forEach(el => {
  observer.observe(el);
});
```

### Memory Management

Clean up examples when not needed:

```javascript
// Store reference when creating
const example = new InteractiveExample('my-example');

// Clean up when done
example.destroy();
```

## Accessibility

### Keyboard Navigation

- Tab navigation through controls
- Enter/Space to activate buttons
- Escape to close modals/tooltips

### Screen Reader Support

- Proper ARIA labels
- Semantic HTML structure
- Status announcements

```html
<div id="accessible-example" data-interactive-example aria-label="Interactive generator example" role="region"></div>
```

## Testing

### Unit Tests

Test individual components:

```javascript
describe('InteractiveExample', () => {
  it('should initialize correctly', () => {
    const example = new InteractiveExample('test-container');
    expect(example).toBeDefined();
  });

  it('should validate JSON correctly', () => {
    const example = new InteractiveExample('test-container');
    expect(example.validateJSON()).toBe(true);
  });
});
```

### Integration Tests

Test with actual generators:

```javascript
describe('Generator Integration', () => {
  it('should execute simple generator', async () => {
    const generator = {
      meta: { name: 'Test' },
      grammar: { start: 'Hello' },
    };

    const result = await executeGenerator(generator, 'test-seed');
    expect(result.output).toBe('Hello');
  });
});
```

## Deployment

### Static Site Integration

For static sites (GitHub Pages, Netlify):

1. Copy assets to your site's asset folder
2. Update paths in HTML includes
3. Ensure CORS is configured for any API calls

### Content Management Systems

For CMS integration:

1. Create custom shortcodes/blocks
2. Sanitize user input
3. Implement proper security measures

### CDN Deployment

Host assets on CDN for better performance:

```html
<link rel="stylesheet" href="https://cdn.example.com/interactive-examples.css" />
<script src="https://cdn.example.com/interactive-examples.js"></script>
```

## Security Considerations

### Input Sanitization

Always sanitize user input:

```javascript
function sanitizeJSON(input) {
  // Remove dangerous patterns
  const sanitized = input.replace(/eval\(|Function\(|<script/gi, '');
  return sanitized;
}
```

### Content Security Policy

Configure CSP headers:

```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline';" />
```

## Support and Community

### Getting Help

- Check the troubleshooting section
- Search existing issues
- Join the community Discord
- Submit bug reports with reproduction steps

### Contributing

- Follow the contribution guidelines
- Add tests for new features
- Update documentation
- Submit pull requests

This integration guide provides everything needed to successfully implement interactive examples in the Content Authoring Handbook.
