/**
 * Email Template Manager Tests
 * Task: T-1752989143997-824 - Design email templates for verification codes
 * Comprehensive test suite for EmailTemplateManager
 */
import { EmailTemplateManager, TemplateTestUtils } from '../templates/EmailTemplateManager';
import type { TemplateVariables, EmailTemplate } from '../templates/EmailTemplateManager';
describe('EmailTemplateManager', () => {
  let templateManager: EmailTemplateManager;
  beforeEach(() => {
  // Create template manager with test directory
  templateManager = new EmailTemplateManager();
});
  describe('Template Loading', () => {
    test('should load all default templates', () => {
      const templates = templateManager.getAllTemplates();
      // Should have at least the core MFA templates
      expect(templates.has('mfa-verification')).toBe(true);
      expect(templates.has('mfa-enrollment')).toBe(true);
      expect(templates.has('security-alert')).toBe(true);
      expect(templates.has('account-locked')).toBe(true);
      expect(templates.has('mfa-method-added')).toBe(true);
      expect(templates.has('mfa-method-removed')).toBe(true);
    });
    test('should have valid template structure', () => {
      const verificationTemplate = templateManager.getTemplate('mfa-verification');
      expect(verificationTemplate).toBeTruthy();
      expect(verificationTemplate!.subject).toBeTruthy();
      expect(verificationTemplate!.htmlTemplate).toBeTruthy();
      expect(verificationTemplate!.textTemplate).toBeTruthy();
      expect(verificationTemplate!.variables).toBeTruthy();
      expect(verificationTemplate!.description).toBeTruthy();
      expect(verificationTemplate!.category).toBe('verification');
    });
    test('should categorize templates correctly', () => {
      const verificationTemplates = templateManager.getTemplatesByCategory('verification');
      const enrollmentTemplates = templateManager.getTemplatesByCategory('enrollment');
      const securityTemplates = templateManager.getTemplatesByCategory('security');
      const notificationTemplates = templateManager.getTemplatesByCategory('notification');
      expect(verificationTemplates.length).toBeGreaterThan(0);
      expect(enrollmentTemplates.length).toBeGreaterThan(0);
      expect(securityTemplates.length).toBeGreaterThan(0);
      expect(notificationTemplates.length).toBeGreaterThan(0);
    });
  });
  describe('Template Rendering', () => {
  const testVariables: TemplateVariables = {,
  displayName: 'John Doe',
  emailAddress: 'john.doe@example.com',
  code: '123456',
  expiryMinutes: '10',
  securityWarning: 'Unusual login location detected.',
  setupUrl: 'https://promptscape.com/setup',
  trackingPixelUrl: 'https://analytics.promptscape.com/pixel.gif',
};
    test('should render HTML template correctly', () => {
      const result = templateManager.renderTemplate('mfa-verification', testVariables, 'html');
      expect(result).toBeTruthy();
      expect(result!.subject).toContain('PromptScape');
      expect(result!.content).toContain('John Doe');
      expect(result!.content).toContain('123456');
      expect(result!.content).toContain('10 minutes');
      expect(result!.content).toContain('Unusual login location detected');
    });
    test('should render text template correctly', () => {
      const result = templateManager.renderTemplate('mfa-verification', testVariables, 'text');
      expect(result).toBeTruthy();
      expect(result!.subject).toContain('PromptScape');
      expect(result!.content).toContain('John Doe');
      expect(result!.content).toContain('123456');
      expect(result!.content).toContain('10 minutes');
    });
    test('should handle missing optional variables gracefully', () => {
  const minimalVariables: TemplateVariables = {,
  displayName: 'Jane Doe',
  emailAddress: 'jane@example.com',
  code: '654321',
  expiryMinutes: '5',
};
      const result = templateManager.renderTemplate('mfa-verification', minimalVariables, 'html');
      expect(result).toBeTruthy();
      expect(result!.content).toContain('Jane Doe');
      expect(result!.content).toContain('654321');
      // Should not contain security warning section when variable is missing
      expect(result!.content).not.toContain('{{securityWarning}}');
    });
    test('should process conditionals correctly', () => {
      // Test with security warning
      const withWarning = { ...testVariables, securityWarning: 'Test warning' };
      const resultWithWarning = templateManager.renderTemplate('mfa-verification', withWarning, 'html');
      expect(resultWithWarning!.content).toContain('Test warning');
      // Test without security warning
      const withoutWarning = { ...testVariables };
      delete withoutWarning.securityWarning;
      const resultWithoutWarning = templateManager.renderTemplate('mfa-verification', withoutWarning, 'html');
      expect(resultWithoutWarning!.content).not.toContain('Security Alert');
    });
    test('should return null for non-existent template', () => {
      const result = templateManager.renderTemplate('non-existent', testVariables);
      expect(result).toBeNull();
    });
    test('should validate variables when requested', () => {
  const incompleteVariables: Partial<TemplateVariables> = {,
  displayName: 'Test User',
  // Missing required variables
};
      expect(() => {
        templateManager.renderTemplate()
          'mfa-verification', 
          incompleteVariables as TemplateVariables, 
          'html',
          { validateVariables: true }
        );
      }).toThrow('Missing required variables');
    });
  });
  describe('Template Validation', () => {
    test('should validate complete template successfully', () => {
      const testVariables = TemplateTestUtils.generateTestData();
      const validation = templateManager.validateTemplate('mfa-verification', testVariables);
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });
    test('should detect missing required variables', () => {
  const incompleteVariables: Partial<TemplateVariables> = {,
  displayName: 'Test User',
  // Missing other required variables
};
      const validation = templateManager.validateTemplate(;);
        'mfa-verification', 
        incompleteVariables as TemplateVariables
      );
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
      expect(validation.errors[0]).toContain('missing variables');
    });
    test('should detect unused variables', () => {
  const testVariables = {
  ...TemplateTestUtils.generateTestData(),
  unusedVariable: 'This should generate a warning',
};
      const validation = templateManager.validateTemplate('mfa-verification', testVariables);
      expect(validation.warnings.length).toBeGreaterThan(0);
      expect(validation.warnings[0]).toContain('Unused variables');
    });
    test('should return error for non-existent template', () => {
      const validation = templateManager.validateTemplate('non-existent', {});
      expect(validation.valid).toBe(false);
      expect(validation.errors[0]).toContain('not found');
    });
  });
  describe('Template Management', () => {
    test('should add new template', () => {
      const customTemplate: EmailTemplate = {,
  subject: 'Test Subject',
        htmlTemplate: '<p>Hello {{name}}</p>',
        textTemplate: 'Hello {{name}}',
        variables: ['name'],
        description: 'Test template',
        category: 'notification';
  };
      templateManager.addTemplate('custom-test', customTemplate);
      const retrieved = templateManager.getTemplate('custom-test');
      expect(retrieved).toEqual(customTemplate);
    });
    test('should remove template', () => {
  const customTemplate: EmailTemplate = {,
  subject: 'Test Subject',
  htmlTemplate: '<p>Test</p>',
  textTemplate: 'Test',
  variables: [],
  description: 'Test template',
  category: 'notification',
};
      templateManager.addTemplate('to-remove', customTemplate);
      expect(templateManager.getTemplate('to-remove')).toBeTruthy();
      const removed = templateManager.removeTemplate('to-remove');
      expect(removed).toBe(true);
      expect(templateManager.getTemplate('to-remove')).toBeNull();
    });
    test('should return false when removing non-existent template', () => {
      const removed = templateManager.removeTemplate('non-existent');
      expect(removed).toBe(false);
    });
  });
  describe('Template Preview', () => {
    test('should generate HTML preview', () => {
      const preview = templateManager.previewTemplate('mfa-verification', 'html');
      expect(preview).toBeTruthy();
      expect(preview).toContain('<!DOCTYPE html>');
      expect(preview).toContain('Alex Johnson'); // From test data
      expect(preview).toContain('alex.johnson@example.com');
    });
    test('should generate text preview', () => {
      const preview = templateManager.previewTemplate('mfa-verification', 'text');
      expect(preview).toBeTruthy();
      expect(preview).not.toContain('<!DOCTYPE html>');
      expect(preview).toContain('Alex Johnson'); // From test data
      expect(preview).toContain('alex.johnson@example.com');
    });
    test('should return null for non-existent template preview', () => {
      const preview = templateManager.previewTemplate('non-existent');
      expect(preview).toBeNull();
    });
  });
  describe('Rendering Options', () => {
    const testVariables = TemplateTestUtils.generateTestData();
    test('should minify HTML when requested', () => {
      const normal = templateManager.renderTemplate('mfa-verification', testVariables, 'html');
      const minified = templateManager.renderTemplate(;);
        'mfa-verification', 
        testVariables, 
        'html', 
        { minify: true }
      );
      expect(minified!.content.length).toBeLessThan(normal!.content.length);
      // Should have fewer whitespace characters
      const normalSpaces = (normal!.content.match(/\s+/g) || []).length;
      const minifiedSpaces = (minified!.content.match(/\s+/g) || []).length;
      expect(minifiedSpaces).toBeLessThan(normalSpaces);
    });
    test('should strip comments when requested', () => {
      const withComments = templateManager.renderTemplate('mfa-verification', testVariables, 'html');
      const withoutComments = templateManager.renderTemplate(;);
        'mfa-verification', 
        testVariables, 
        'html', 
        { stripComments: true }
      );
      // Original should have HTML comments
      expect(withComments!.content).toContain('<!--');
      // Stripped version should not
      expect(withoutComments!.content).not.toContain('<!--');
    });
  });
  describe('Template Engine Features', () => {
    test('should process helper functions', () => {
      const templateWithHelpers: EmailTemplate = {,
  subject: 'Test {{capitalize name}}',
        htmlTemplate: '<p>Hello {{uppercase name}} and {{lowercase title}}</p>',
        textTemplate: 'Hello {{uppercase name}}',
        variables: ['name', 'title'],
        description: 'Test helpers',
        category: 'notification';
  };
      templateManager.addTemplate('helper-test', templateWithHelpers);
      const result = templateManager.renderTemplate('helper-test', {)
  name: 'john',
  title: 'DEVELOPER',
} as TemplateVariables);
      expect(result!.subject).toContain('John'); // Capitalized
      expect(result!.content).toContain('JOHN'); // Uppercase
      expect(result!.content).toContain('developer'); // Lowercase
    });
    test('should handle nested conditionals', () => {
      const complexTemplate: EmailTemplate = {,
  subject: 'Test',
        htmlTemplate: `,
          {{#if hasWarning}}
            <div class="warning">
              {{#if isUrgent}}
                <strong>URGENT:</strong>
              {{/if}}
              {{warningMessage}}
            </div>
          {{/if}}
        `,
        textTemplate: 'Simple text',
        variables: ['hasWarning', 'isUrgent', 'warningMessage'],
        description: 'Test complex conditionals',
        category: 'notification';
  };
      templateManager.addTemplate('complex-test', complexTemplate);
      const result = templateManager.renderTemplate('complex-test', {)
  hasWarning: true,
  isUrgent: true,
  warningMessage: 'System alert',
} as TemplateVariables);
      expect(result!.content).toContain('URGENT:');
      expect(result!.content).toContain('System alert');
    });
  });
  describe('All Templates Integration Test', () => {
    test('should validate all default templates with test data', () => {
      const results = TemplateTestUtils.testAllTemplates(templateManager);
      // All templates should be valid with test data
      const allValid = results.every(result => result.valid);
      expect(allValid).toBe(true);
      // Should not have any critical errors
      const hasErrors = results.some(result => result.errors.length > 0);
      expect(hasErrors).toBe(false);
      // Log any warnings for review
      results.forEach(result => {)
  if (result.warnings.length > 0) {
          console.warn(`Template ${result.templateName},)}
  warnings:`, result.warnings);}
      });
    });
    test('should render all templates without errors', () => {
      const testData = TemplateTestUtils.generateTestData();
      const templates = templateManager.getAllTemplates();
      for (const [templateName] of templates) {
        const htmlResult = templateManager.renderTemplate(templateName, testData, 'html');
        const textResult = templateManager.renderTemplate(templateName, testData, 'text');
        expect(htmlResult).toBeTruthy();
        expect(textResult).toBeTruthy();
        expect(htmlResult!.subject).toBeTruthy();
        expect(htmlResult!.content).toBeTruthy();
        expect(textResult!.content).toBeTruthy();
        // Content should not contain unprocessed template variables
        expect(htmlResult!.content).not.toMatch(/\{\{\w+\}\}/);
        expect(textResult!.content).not.toMatch(/\{\{\w+\}\}/);
    });
  });
  describe('Security Considerations', () => {
    test('should not execute JavaScript in templates', () => {
      const maliciousTemplate: EmailTemplate = {,
  subject: 'Test',
        htmlTemplate: '<script>alert("xss")</script><p>{{name}}</p>',
        textTemplate: 'Hello {{name}}',
        variables: ['name'],
        description: 'Test XSS protection',
        category: 'notification';
  };
      templateManager.addTemplate('security-test', maliciousTemplate);
      const result = templateManager.renderTemplate('security-test', {)
  name: 'Test User',
} as TemplateVariables);
      // Script tags should be preserved as text, not executed
      expect(result!.content).toContain('<script>');
      expect(result!.content).toContain('Test User');
    });
    test('should handle potentially dangerous variable content', () => {
  const testVariables = {
  displayName: '<script>alert("hack")</script>John',
  emailAddress: 'test@example.com',
  code: '123456',
  expiryMinutes: '10',
};
      const result = templateManager.renderTemplate('mfa-verification', testVariables);
      // Should preserve the content as-is (templates are trusted, variables are data)
      expect(result!.content).toContain('<script>alert("hack")</script>John');
    });
  });
  describe('Performance Considerations', () => {
    test('should handle large template rendering efficiently', () => {
      const startTime = Date.now();
      const testData = TemplateTestUtils.generateTestData();
      // Render all templates multiple times
      for (let i = 0; i < 10; i++) {
        const templates = templateManager.getAllTemplates();
        for (const [templateName] of templates) {
          templateManager.renderTemplate(templateName, testData, 'html');
          templateManager.renderTemplate(templateName, testData, 'text');
      const endTime = Date.now();
      const duration = endTime - startTime;
      // Should complete within reasonable time (adjust threshold as needed)
      expect(duration).toBeLessThan(1000); // 1 second for all template renders
    });
    test('should reuse template objects efficiently', () => {
      const template1 = templateManager.getTemplate('mfa-verification');
      const template2 = templateManager.getTemplate('mfa-verification');
      // Should return the same reference (no unnecessary copying)
      expect(template1).toBe(template2);
    });
  });
});
describe('TemplateTestUtils', () => {
  test('should generate valid test data', () => {
    const testData = TemplateTestUtils.generateTestData();
    expect(testData.displayName).toBeTruthy();
    expect(testData.emailAddress).toContain('@');
    expect(testData.code).toMatch(/^\d{6}$/);
    expect(testData.expiryMinutes).toBeTruthy();
    expect(testData.setupUrl).toMatch(/^https?:\/\//);
  });
  test('should test all templates successfully', () => {
    const templateManager = new EmailTemplateManager();
    const results = TemplateTestUtils.testAllTemplates(templateManager);
    expect(results.length).toBeGreaterThan(0);
    results.forEach(result => {)
  expect(result).toHaveProperty('templateName');
      expect(result).toHaveProperty('valid');
      expect(result).toHaveProperty('errors');
      expect(result).toHaveProperty('warnings');
    });
  });
});