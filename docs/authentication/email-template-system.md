# Email Template System Documentation

## Overview

This document describes the comprehensive email template system designed for Multi-Factor Authentication (MFA) communications as part of Epic 19: Authentication Enhancement & Security Hardening.

## Architecture

### Core Components

#### 1. EmailTemplateManager

The central class responsible for loading, managing, and rendering email templates.

```typescript
import { EmailTemplateManager } from '@promptscape/core/templates/EmailTemplateManager';

const templateManager = new EmailTemplateManager();
const result = templateManager.renderTemplate(
  'mfa-verification',
  variables,
  'html'
);
```

#### 2. Template Engine

Built-in template processing engine with support for:

- Variable substitution: `{{variable}}`
- Conditional blocks: `{{#if condition}}...{{/if}}`
- Helper functions: `{{capitalize name}}`

#### 3. Template Categories

- **Verification**: Login verification codes
- **Enrollment**: MFA setup and configuration
- **Security**: Security alerts and notifications
- **Notification**: Account changes and updates

## Available Templates

### MFA Verification (`mfa-verification`)

**Purpose**: Send verification codes during login process

**Variables**:

- `displayName` (required): User's display name
- `emailAddress` (required): User's email address
- `code` (required): 6-digit verification code
- `expiryMinutes` (required): Code expiration time
- `securityWarning` (optional): Security alert message
- `trackingPixelUrl` (optional): Analytics tracking pixel

**Features**:

- Mobile-responsive design
- Dark mode support
- High contrast accessibility
- Security warning section (conditional)
- Clear expiration messaging
- Troubleshooting guidance

### MFA Enrollment (`mfa-enrollment`)

**Purpose**: Guide users through MFA setup process

**Variables**:

- `displayName` (required): User's display name
- `emailAddress` (required): User's email address
- `code` (required): Setup verification code
- `expiryMinutes` (required): Code expiration time
- `setupUrl` (required): Link to complete setup
- `trackingPixelUrl` (optional): Analytics tracking pixel

**Features**:

- Progress indicators
- Benefits explanation
- Step-by-step instructions
- Call-to-action buttons
- Educational content

### Security Alert (`security-alert`)

**Purpose**: Notify users of security-related events

**Variables**:

- `displayName` (required): User's display name
- `alertType` (required): Type of security alert
- `alertMessage` (required): Detailed alert message
- `ipAddress` (required): Source IP address
- `location` (optional): Geographic location
- `timestamp` (required): Event timestamp

### Account Locked (`account-locked`)

**Purpose**: Inform users about account lockouts

**Variables**:

- `displayName` (required): User's display name
- `lockReason` (required): Reason for account lock
- `unlockTime` (required): Automatic unlock time
- `supportEmail` (required): Support contact email

### MFA Method Added (`mfa-method-added`)

**Purpose**: Confirm addition of new MFA methods

**Variables**:

- `displayName` (required): User's display name
- `methodType` (required): Type of MFA method
- `methodName` (required): Human-readable method name
- `timestamp` (required): Addition timestamp

### MFA Method Removed (`mfa-method-removed`)

**Purpose**: Confirm removal of MFA methods

**Variables**:

- `displayName` (required): User's display name
- `methodType` (required): Type of MFA method
- `methodName` (required): Human-readable method name
- `timestamp` (required): Removal timestamp

## Template Syntax

### Variable Substitution

```html
<p>Hello {{displayName}},</p>
<p>Your verification code is: {{code}}</p>
```

### Conditional Blocks

```html
{{#if securityWarning}}
<div class="security-warning">
  <strong>Security Alert:</strong> {{securityWarning}}
</div>
{{/if}}
```

### Helper Functions

```html
<h1>Welcome {{capitalize displayName}}!</h1>
<p>Email: {{lowercase emailAddress}}</p>
<p>Alert: {{uppercase alertType}}</p>
```

## Usage Examples

### Basic Template Rendering

```typescript
import { EmailTemplateManager } from '@promptscape/core/templates/EmailTemplateManager';

const templateManager = new EmailTemplateManager();

const variables = {
  displayName: 'John Doe',
  emailAddress: 'john.doe@example.com',
  code: '123456',
  expiryMinutes: '10'
};

// Render HTML version
const htmlResult = templateManager.renderTemplate(
  'mfa-verification',
  variables,
  'html'
);
console.log(htmlResult.subject); // "PromptScape - Your Verification Code"
console.log(htmlResult.content); // Full HTML email

// Render text version
const textResult = templateManager.renderTemplate(
  'mfa-verification',
  variables,
  'text'
);
console.log(textResult.content); // Plain text email
```

### Template Validation

```typescript
const validation = templateManager.validateTemplate(
  'mfa-verification',
  variables
);

if (!validation.valid) {
  console.error('Template validation failed:', validation.errors);
}

if (validation.warnings.length > 0) {
  console.warn('Template warnings:', validation.warnings);
}
```

### Advanced Rendering Options

```typescript
const result = templateManager.renderTemplate(
  'mfa-verification',
  variables,
  'html',
  {
    minify: true, // Minify HTML output
    stripComments: true, // Remove HTML comments
    validateVariables: true // Validate all variables present
  }
);
```

### Template Preview

```typescript
// Generate preview with sample data
const preview = templateManager.previewTemplate('mfa-verification', 'html');
console.log(preview); // Full HTML with sample data
```

## Customization

### Adding Custom Templates

```typescript
import { EmailTemplate } from '@promptscape/core/templates/EmailTemplateManager';

const customTemplate: EmailTemplate = {
  subject: 'Custom Notification - {{eventType}}',
  htmlTemplate: `
    <html>
      <body>
        <h1>{{capitalize eventType}}</h1>
        <p>Hello {{displayName}},</p>
        <p>{{message}}</p>
      </body>
    </html>
  `,
  textTemplate: `
    {{uppercase eventType}}
    
    Hello {{displayName}},
    
    {{message}}
  `,
  variables: ['displayName', 'eventType', 'message'],
  description: 'Custom notification template',
  category: 'notification'
};

templateManager.addTemplate('custom-notification', customTemplate);
```

### Template Categories

```typescript
// Get templates by category
const verificationTemplates =
  templateManager.getTemplatesByCategory('verification');
const securityTemplates = templateManager.getTemplatesByCategory('security');

// List all available templates
const allTemplates = templateManager.getAllTemplates();
for (const [name, template] of allTemplates) {
  console.log(`${name}: ${template.description}`);
}
```

## Design Guidelines

### Email Design Principles

#### 1. Mobile-First Design

- Responsive layouts that work on all screen sizes
- Touch-friendly buttons and links
- Readable font sizes (minimum 14px)
- Appropriate spacing for touch interfaces

#### 2. Accessibility

- High contrast color schemes
- Alt text for images
- Semantic HTML structure
- Screen reader compatibility
- Support for reduced motion preferences

#### 3. Brand Consistency

- PromptScape brand colors and typography
- Consistent header and footer design
- Professional and trustworthy appearance
- Clear visual hierarchy

#### 4. Security Focus

- Clear indication of security-related content
- Prominent display of verification codes
- Security warnings and alerts
- Contact information for security concerns

### Code Design Principles

#### 1. Responsive CSS

```css
/* Mobile-first approach */
.verification-code {
  font-size: 28px;
  padding: 12px;
}

@media (min-width: 600px) {
  .verification-code {
    font-size: 36px;
    padding: 16px;
  }
}
```

#### 2. Email Client Compatibility

```css
/* Outlook compatibility */
table,
td {
  mso-table-lspace: 0pt;
  mso-table-rspace: 0pt;
}

/* Image handling */
img {
  -ms-interpolation-mode: bicubic;
  border: 0;
  height: auto;
  line-height: 100%;
  outline: none;
  text-decoration: none;
}
```

#### 3. Dark Mode Support

```css
@media (prefers-color-scheme: dark) {
  .email-container {
    background-color: #1f2937 !important;
    color: #f9fafb !important;
  }

  .verification-code {
    background: #1f2937 !important;
    color: #60a5fa !important;
    border-color: #60a5fa !important;
  }
}
```

## Testing

### Template Testing Utilities

```typescript
import { TemplateTestUtils } from '@promptscape/core/templates/EmailTemplateManager';

// Generate test data
const testData = TemplateTestUtils.generateTestData();

// Test all templates
const results = TemplateTestUtils.testAllTemplates(templateManager);
results.forEach(result => {
  if (!result.valid) {
    console.error(`Template ${result.templateName} failed:`, result.errors);
  }
});
```

### Manual Testing

```typescript
// Test specific template with custom data
const testVariables = {
  displayName: 'Test User',
  emailAddress: 'test@example.com',
  code: '999999',
  expiryMinutes: '5',
  securityWarning: 'Test security warning'
};

const result = templateManager.renderTemplate(
  'mfa-verification',
  testVariables,
  'html'
);
// Save result.content to file for browser testing
```

### Automated Testing

Run the comprehensive test suite:

```bash
pnpm test -- EmailTemplateManager.test.ts
```

## Performance Considerations

### Template Caching

- Templates are loaded once at initialization
- Rendered templates are not cached (variables change frequently)
- Template objects are reused for multiple renders

### Optimization Techniques

```typescript
// Minify HTML for production
const result = templateManager.renderTemplate(
  'mfa-verification',
  variables,
  'html',
  {
    minify: true,
    stripComments: true
  }
);

// Batch template operations
const templates = ['mfa-verification', 'security-alert'];
const results = templates.map(templateName =>
  templateManager.renderTemplate(templateName, variables, 'html')
);
```

### Memory Management

- Templates are stored in memory for fast access
- Large HTML templates are optimized with minification
- No memory leaks in template rendering process

## Security Considerations

### Input Sanitization

- Template variables are treated as data, not code
- No JavaScript execution in templates
- HTML content is preserved as-is (trusted templates)

### Template Security

```typescript
// Safe variable substitution
const safeVariables = {
  displayName: escapeHtml(userInput.displayName),
  emailAddress: validateEmail(userInput.emailAddress),
  code: generateSecureCode()
};
```

### Content Security

- Email templates don't execute JavaScript
- External resources are minimized
- Tracking pixels are optional and configurable

## Deployment

### Production Setup

```typescript
// Initialize with production configuration
const templateManager = new EmailTemplateManager(
  process.env.TEMPLATE_DIRECTORY
);

// Enable production optimizations
const productionOptions = {
  minify: true,
  stripComments: true,
  validateVariables: true
};
```

### Environment Configuration

```env
# Template configuration
TEMPLATE_DIRECTORY=/app/templates/email
EMAIL_TEMPLATE_MINIFY=true
EMAIL_TEMPLATE_VALIDATE=true
```

### Monitoring and Analytics

```typescript
// Template rendering metrics
const startTime = Date.now();
const result = templateManager.renderTemplate(templateName, variables, format);
const renderTime = Date.now() - startTime;

// Log performance metrics
logger.info('Template rendered', {
  templateName,
  format,
  renderTime,
  contentLength: result?.content.length
});
```

## Best Practices

### 1. Variable Naming

- Use descriptive, consistent variable names
- Follow camelCase convention
- Include units in variable names when applicable (`expiryMinutes`)

### 2. Content Guidelines

- Keep subject lines under 50 characters
- Use clear, action-oriented language
- Include expiration times for time-sensitive content
- Provide fallback contact information

### 3. Template Organization

- Group related templates by category
- Use consistent naming conventions
- Document all template variables
- Include usage examples in descriptions

### 4. Version Control

- Store templates in version control
- Use semantic versioning for template changes
- Test template changes thoroughly
- Maintain backward compatibility when possible

### 5. Internationalization

- Design templates for multiple languages
- Use external translation services
- Keep text separate from formatting
- Consider right-to-left language support

## Troubleshooting

### Common Issues

#### 1. Missing Variables

```typescript
// Check for missing variables before rendering
const validation = templateManager.validateTemplate(templateName, variables);
if (!validation.valid) {
  throw new Error(
    `Template validation failed: ${validation.errors.join(', ')}`
  );
}
```

#### 2. Template Not Found

```typescript
// Verify template exists before rendering
const template = templateManager.getTemplate(templateName);
if (!template) {
  throw new Error(`Template '${templateName}' not found`);
}
```

#### 3. Rendering Errors

```typescript
try {
  const result = templateManager.renderTemplate(
    templateName,
    variables,
    format
  );
  if (!result) {
    throw new Error('Template rendering failed');
  }
} catch (error) {
  logger.error('Template rendering error', { templateName, error });
  // Use fallback template or plain text
}
```

### Debug Mode

```typescript
// Enable detailed logging
const templateManager = new EmailTemplateManager();
templateManager.setDebugMode(true);

// Preview templates for debugging
const preview = templateManager.previewTemplate(templateName, format);
console.log('Template preview:', preview);
```

This comprehensive email template system provides a robust foundation for all MFA-related communications while maintaining security, accessibility, and brand consistency.
