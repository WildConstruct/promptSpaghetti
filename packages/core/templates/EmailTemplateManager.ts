/**
 * Email Template Manager for MFA Communications
 * Task: T-1752989143997-824 - Design email templates for verification codes
 * Epic 19: Authentication Enhancement & Security Hardening
 */

import fs from 'fs';
import path from 'path';

// ========================================
// Template Types & Interfaces
// ========================================

export interface EmailTemplate {
  subject: string;
  htmlTemplate: string;
  textTemplate: string;
  variables: string[];
  description: string;
  category: 'verification' | 'enrollment' | 'security' | 'notification';
}

export interface TemplateVariables {
  // Common variables
  displayName: string;
  emailAddress: string;
  expiryMinutes: string;
  code: string;
  
  // Optional security variables
  securityWarning?: string;
  trackingPixelUrl?: string;
  
  // Enrollment-specific variables
  setupUrl?: string;
  
  // Branding variables
  companyName?: string;
  supportEmail?: string;
  
  // Localization variables
  locale?: string;
  timezone?: string;
}

export interface TemplateRenderOptions {
  minify?: boolean;
  stripComments?: boolean;
  inlineCSS?: boolean;
  validateVariables?: boolean;
}

// ========================================
// Template Engine
// ========================================

class TemplateEngine {
  private static readonly VARIABLE_PATTERN = /\{\{(\w+)\}\}/g;
  private static readonly CONDITIONAL_PATTERN = /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g;
  private static readonly HELPER_PATTERN = /\{\{(\w+)\s+([\w\s]+)\}\}/g;

  /**
   * Render template with variables and conditionals
   */
  static render(template: string, variables: TemplateVariables): string {
    let rendered = template;

    // Process conditionals first
    rendered = this.processConditionals(rendered, variables);
    
    // Process helpers
    rendered = this.processHelpers(rendered, variables);
    
    // Process simple variable substitution
    rendered = this.processVariables(rendered, variables);

    return rendered;
  }

  /**
   * Process conditional blocks {{#if variable}}...{{/if}}
   */
  private static processConditionals(template: string, variables: TemplateVariables): string {
    return template.replace(this.CONDITIONAL_PATTERN, (match, variable, content) => {
      const value = (variables as any)[variable];
      return value ? content : '';
    });
  }

  /**
   * Process helper functions (future extensibility)
   */
  private static processHelpers(template: string, variables: TemplateVariables): string {
    return template.replace(this.HELPER_PATTERN, (match, helper, args) => {
      switch (helper) {
        case 'capitalize':
          const text = (variables as any)[args.trim()];
          return text ? text.charAt(0).toUpperCase() + text.slice(1) : '';
        case 'uppercase':
          return ((variables as any)[args.trim()] || '').toUpperCase();
        case 'lowercase':
          return ((variables as any)[args.trim()] || '').toLowerCase();
        default:
          return match; // No helper found, leave as is
      }
    });
  }

  /**
   * Process simple variable substitution {{variable}}
   */
  private static processVariables(template: string, variables: TemplateVariables): string {
    return template.replace(this.VARIABLE_PATTERN, (match, variable) => {
      const value = (variables as any)[variable];
      return value !== undefined ? String(value) : match;
    });
  }

  /**
   * Extract all variables from a template
   */
  static extractVariables(template: string): string[] {
    const variables = new Set<string>();
    let match;

    // Extract from simple variables
    const simplePattern = /\{\{(\w+)\}\}/g;
    while ((match = simplePattern.exec(template)) !== null) {
      variables.add(match[1]);
    }

    // Extract from conditionals
    const conditionalPattern = /\{\{#if\s+(\w+)\}\}/g;
    while ((match = conditionalPattern.exec(template)) !== null) {
      variables.add(match[1]);
    }

    // Extract from helpers
    const helperPattern = /\{\{(\w+)\s+([\w\s]+)\}\}/g;
    while ((match = helperPattern.exec(template)) !== null) {
      const args = match[2].trim().split(/\s+/);
      args.forEach(arg => {
        if (/^\w+$/.test(arg)) {
          variables.add(arg);
        }
      });
    }

    return Array.from(variables);
  }

  /**
   * Validate that all required variables are provided
   */
  static validateVariables(template: string, variables: TemplateVariables): string[] {
    const required = this.extractVariables(template);
    const provided = Object.keys(variables);
    const missing: string[] = [];

    for (const variable of required) {
      if (!provided.includes(variable) && (variables as any)[variable] === undefined) {
        missing.push(variable);
      }
    }

    return missing;
  }
}

// ========================================
// Template Manager
// ========================================

export class EmailTemplateManager {
  private templates: Map<string, EmailTemplate> = new Map();
  private templateDirectory: string;

  constructor(templateDirectory?: string) {
    this.templateDirectory = templateDirectory || path.join(__dirname, 'email');
    this.loadTemplates();
  }

  /**
   * Load all templates from the template directory
   */
  private loadTemplates(): void {
    try {
      // Load MFA verification template
      const verificationHtml = this.loadTemplateFile('mfa-verification-template.html');
      const verificationText = this.loadTemplateFile('mfa-verification-template.txt');
      
      this.templates.set('mfa-verification', {
        subject: 'PromptScape - Your Verification Code',
        htmlTemplate: verificationHtml,
        textTemplate: verificationText,
        variables: ['displayName', 'emailAddress', 'code', 'expiryMinutes', 'securityWarning', 'trackingPixelUrl'],
        description: 'Email template for MFA verification codes during login',
        category: 'verification'
      });

      // Load MFA enrollment template
      const enrollmentHtml = this.loadTemplateFile('mfa-enrollment-template.html');
      const enrollmentText = this.loadTemplateFile('mfa-enrollment-template.txt');
      
      this.templates.set('mfa-enrollment', {
        subject: 'PromptScape - Complete Your MFA Setup',
        htmlTemplate: enrollmentHtml,
        textTemplate: enrollmentText,
        variables: ['displayName', 'emailAddress', 'code', 'expiryMinutes', 'setupUrl', 'trackingPixelUrl'],
        description: 'Email template for MFA enrollment verification',
        category: 'enrollment'
      });

      // Load additional templates as needed
      this.loadSecurityTemplates();
      this.loadNotificationTemplates();

    } catch (error) {
      console.error('Failed to load email templates:', error);
      throw new Error('Email template loading failed');
    }
  }

  /**
   * Load security-related templates
   */
  private loadSecurityTemplates(): void {
    // Security alert template
    this.templates.set('security-alert', {
      subject: 'PromptScape - Security Alert for Your Account',
      htmlTemplate: this.createSecurityAlertTemplate(),
      textTemplate: this.createSecurityAlertTextTemplate(),
      variables: ['displayName', 'alertType', 'alertMessage', 'ipAddress', 'location', 'timestamp'],
      description: 'Template for security alerts and notifications',
      category: 'security'
    });

    // Account locked template
    this.templates.set('account-locked', {
      subject: 'PromptScape - Account Temporarily Locked',
      htmlTemplate: this.createAccountLockedTemplate(),
      textTemplate: this.createAccountLockedTextTemplate(),
      variables: ['displayName', 'lockReason', 'unlockTime', 'supportEmail'],
      description: 'Template for account lockout notifications',
      category: 'security'
    });
  }

  /**
   * Load notification templates
   */
  private loadNotificationTemplates(): void {
    // MFA method added
    this.templates.set('mfa-method-added', {
      subject: 'PromptScape - New MFA Method Added',
      htmlTemplate: this.createMFAMethodAddedTemplate(),
      textTemplate: this.createMFAMethodAddedTextTemplate(),
      variables: ['displayName', 'methodType', 'methodName', 'timestamp'],
      description: 'Notification when a new MFA method is added',
      category: 'notification'
    });

    // MFA method removed
    this.templates.set('mfa-method-removed', {
      subject: 'PromptScape - MFA Method Removed',
      htmlTemplate: this.createMFAMethodRemovedTemplate(),
      textTemplate: this.createMFAMethodRemovedTextTemplate(),
      variables: ['displayName', 'methodType', 'methodName', 'timestamp'],
      description: 'Notification when an MFA method is removed',
      category: 'notification'
    });
  }

  /**
   * Load template file content
   */
  private loadTemplateFile(filename: string): string {
    const filePath = path.join(this.templateDirectory, filename);
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`Template file not found: ${filePath}`);
    }

    return fs.readFileSync(filePath, 'utf-8');
  }

  /**
   * Get a template by name
   */
  getTemplate(templateName: string): EmailTemplate | null {
    return this.templates.get(templateName) || null;
  }

  /**
   * Get all available templates
   */
  getAllTemplates(): Map<string, EmailTemplate> {
    return new Map(this.templates);
  }

  /**
   * Get templates by category
   */
  getTemplatesByCategory(category: EmailTemplate['category']): EmailTemplate[] {
    return Array.from(this.templates.values()).filter(template => template.category === category);
  }

  /**
   * Render an email template
   */
  renderTemplate(
    templateName: string, 
    variables: TemplateVariables, 
    format: 'html' | 'text' = 'html',
    options: TemplateRenderOptions = {}
  ): { subject: string; content: string } | null {
    const template = this.getTemplate(templateName);
    if (!template) {
      return null;
    }

    // Validate variables if requested
    if (options.validateVariables) {
      const templateContent = format === 'html' ? template.htmlTemplate : template.textTemplate;
      const missingVariables = TemplateEngine.validateVariables(templateContent, variables);
      
      if (missingVariables.length > 0) {
        throw new Error(`Missing required variables: ${missingVariables.join(', ')}`);
      }
    }

    // Render subject
    const subject = TemplateEngine.render(template.subject, variables);

    // Render content
    const templateContent = format === 'html' ? template.htmlTemplate : template.textTemplate;
    let content = TemplateEngine.render(templateContent, variables);

    // Apply rendering options
    if (options.minify && format === 'html') {
      content = this.minifyHTML(content);
    }

    if (options.stripComments && format === 'html') {
      content = content.replace(/<!--[\s\S]*?-->/g, '');
    }

    return { subject, content };
  }

  /**
   * Validate a template
   */
  validateTemplate(templateName: string, variables: TemplateVariables): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const template = this.getTemplate(templateName);
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!template) {
      errors.push(`Template '${templateName}' not found`);
      return { valid: false, errors, warnings };
    }

    // Check HTML template
    try {
      const htmlMissing = TemplateEngine.validateVariables(template.htmlTemplate, variables);
      if (htmlMissing.length > 0) {
        errors.push(`HTML template missing variables: ${htmlMissing.join(', ')}`);
      }
    } catch (error) {
      errors.push(`HTML template validation error: ${error}`);
    }

    // Check text template
    try {
      const textMissing = TemplateEngine.validateVariables(template.textTemplate, variables);
      if (textMissing.length > 0) {
        errors.push(`Text template missing variables: ${textMissing.join(', ')}`);
      }
    } catch (error) {
      errors.push(`Text template validation error: ${error}`);
    }

    // Check for unused variables
    const allRequired = [
      ...TemplateEngine.extractVariables(template.htmlTemplate),
      ...TemplateEngine.extractVariables(template.textTemplate)
    ];
    const unique = Array.from(new Set(allRequired));
    const provided = Object.keys(variables);
    
    const unused = provided.filter(variable => !unique.includes(variable));
    if (unused.length > 0) {
      warnings.push(`Unused variables provided: ${unused.join(', ')}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Preview a template with sample data
   */
  previewTemplate(templateName: string, format: 'html' | 'text' = 'html'): string | null {
    const sampleVariables: TemplateVariables = {
      displayName: 'John Doe',
      emailAddress: 'john.doe@example.com',
      code: '123456',
      expiryMinutes: '10',
      securityWarning: 'This login attempt appears to be from an unusual location.',
      setupUrl: 'https://promptscape.com/mfa/setup',
      trackingPixelUrl: 'https://analytics.promptscape.com/pixel.gif'
    };

    const result = this.renderTemplate(templateName, sampleVariables, format);
    return result ? result.content : null;
  }

  /**
   * Add or update a template
   */
  addTemplate(name: string, template: EmailTemplate): void {
    this.templates.set(name, template);
  }

  /**
   * Remove a template
   */
  removeTemplate(name: string): boolean {
    return this.templates.delete(name);
  }

  /**
   * Simple HTML minification
   */
  private minifyHTML(html: string): string {
    return html
      .replace(/\s+/g, ' ') // Collapse whitespace
      .replace(/>\s+</g, '><') // Remove whitespace between tags
      .trim();
  }

  // ========================================
  // Template Creation Helpers
  // ========================================

  private createSecurityAlertTemplate(): string {
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Security Alert</h2>
      <p>Hi {{displayName}},</p>
      <p>{{alertMessage}}</p>
      <p><strong>Details:</strong></p>
      <ul>
        <li>IP Address: {{ipAddress}}</li>
        <li>Location: {{location}}</li>
        <li>Time: {{timestamp}}</li>
      </ul>
      <p>If this was not you, please contact security immediately.</p>
    </div>`;
  }

  private createSecurityAlertTextTemplate(): string {
    return `
SECURITY ALERT

Hi {{displayName}},

{{alertMessage}}

Details:
- IP Address: {{ipAddress}}
- Location: {{location}}
- Time: {{timestamp}}

If this was not you, please contact security immediately.
    `;
  }

  private createAccountLockedTemplate(): string {
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #d97706;">Account Temporarily Locked</h2>
      <p>Hi {{displayName}},</p>
      <p>Your account has been temporarily locked due to {{lockReason}}.</p>
      <p>Your account will be automatically unlocked at {{unlockTime}}.</p>
      <p>If you need immediate assistance, contact {{supportEmail}}.</p>
    </div>`;
  }

  private createAccountLockedTextTemplate(): string {
    return `
ACCOUNT TEMPORARILY LOCKED

Hi {{displayName}},

Your account has been temporarily locked due to {{lockReason}}.

Your account will be automatically unlocked at {{unlockTime}}.

If you need immediate assistance, contact {{supportEmail}}.
    `;
  }

  private createMFAMethodAddedTemplate(): string {
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #059669;">MFA Method Added</h2>
      <p>Hi {{displayName}},</p>
      <p>A new MFA method has been added to your account:</p>
      <p><strong>{{methodType}}</strong>: {{methodName}}</p>
      <p>Added on: {{timestamp}}</p>
      <p>If you didn't add this method, please contact security immediately.</p>
    </div>`;
  }

  private createMFAMethodAddedTextTemplate(): string {
    return `
MFA METHOD ADDED

Hi {{displayName}},

A new MFA method has been added to your account:

{{methodType}}: {{methodName}}

Added on: {{timestamp}}

If you didn't add this method, please contact security immediately.
    `;
  }

  private createMFAMethodRemovedTemplate(): string {
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #d97706;">MFA Method Removed</h2>
      <p>Hi {{displayName}},</p>
      <p>An MFA method has been removed from your account:</p>
      <p><strong>{{methodType}}</strong>: {{methodName}}</p>
      <p>Removed on: {{timestamp}}</p>
      <p>If you didn't remove this method, please contact security immediately.</p>
    </div>`;
  }

  private createMFAMethodRemovedTextTemplate(): string {
    return `
MFA METHOD REMOVED

Hi {{displayName}},

An MFA method has been removed from your account:

{{methodType}}: {{methodName}}

Removed on: {{timestamp}}

If you didn't remove this method, please contact security immediately.
    `;
  }
}

// ========================================
// Template Testing Utilities
// ========================================

export class TemplateTestUtils {
  /**
   * Generate test data for template previews
   */
  static generateTestData(): TemplateVariables {
    return {
      displayName: 'Alex Johnson',
      emailAddress: 'alex.johnson@example.com',
      code: Math.floor(100000 + Math.random() * 900000).toString(),
      expiryMinutes: '10',
      securityWarning: 'This login attempt appears to be from a new device in San Francisco, CA.',
      setupUrl: 'https://promptscape.com/mfa/setup?token=abc123',
      trackingPixelUrl: 'https://analytics.promptscape.com/pixel.gif?id=test',
      companyName: 'PromptScape',
      supportEmail: 'security@promptscape.com',
      locale: 'en-US',
      timezone: 'America/Los_Angeles'
    };
  }

  /**
   * Test all templates with sample data
   */
  static testAllTemplates(manager: EmailTemplateManager): { 
    templateName: string; 
    valid: boolean; 
    errors: string[]; 
    warnings: string[] 
  }[] {
    const testData = this.generateTestData();
    const results: any[] = [];

    for (const [templateName] of manager.getAllTemplates()) {
      const validation = manager.validateTemplate(templateName, testData);
      results.push({
        templateName,
        valid: validation.valid,
        errors: validation.errors,
        warnings: validation.warnings
      });
    }

    return results;
  }
}

export default EmailTemplateManager;