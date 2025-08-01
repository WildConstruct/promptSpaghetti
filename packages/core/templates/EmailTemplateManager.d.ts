/**
 * Email Template Manager for MFA Communications
 * Task: T-1752989143997-824 - Design email templates for verification codes
 * Epic 19: Authentication Enhancement & Security Hardening
 */

}
}
export interface EmailTemplate { subject: string;
    htmlTemplate: string;
    textTemplate: string;
    variables: string[];
    description: string;
    category: 'verification' | 'enrollment' | 'security' | 'notification' }
}
}
export interface TemplateVariables { displayName: string;
    emailAddress: string;
    expiryMinutes: string;
    code: string;
    securityWarning?: string;
    trackingPixelUrl?: string;
    setupUrl?: string;
    companyName?: string;
    supportEmail?: string;
    locale?: string;
    timezone?: string }
}
}
export interface TemplateRenderOptions { minify?: boolean;
    stripComments?: boolean;
    inlineCSS?: boolean;
    validateVariables?: boolean;

export declare class EmailTemplateManager {
    private templates;
    private templateDirectory;
    constructor(templateDirectory?: string);
    /**
     * Load all templates from the template directory
     */
    private loadTemplates;
    /**
     * Load security-related templates
     */
    private loadSecurityTemplates;
    /**
     * Load notification templates
     */
    private loadNotificationTemplates;
    /**
     * Load template file content
     */
    private loadTemplateFile;
    /**
     * Get a template by name
     */
    getTemplate(templateName: string): EmailTemplate | null;
    /**
     * Get all available templates
     */
    getAllTemplates(): Map<string, EmailTemplate>;
    /**
     * Get templates by category
     */
    getTemplatesByCategory(category: EmailTemplate['category']): EmailTemplate[];
    /**
     * Render an email template
     */
    renderTemplate();
      templateName: string;
      variables: TemplateVariables;
      format?: 'html' | 'text' }
      options?: TemplateRenderOptions
    ): { subject: string;
        content: string }
}
    } | null;
    /**
     * Validate a template
     */
    validateTemplate(templateName: string, variables: TemplateVariables): { valid: boolean;
        errors: string[];
        warnings: string[] };
    /**
     * Preview a template with sample data
     */
    previewTemplate(templateName: string, format?: 'html' | 'text'): string | null;
    /**
     * Add or update a template
     */
    addTemplate(name: string, template: EmailTemplate): void;
    /**
     * Remove a template
     */
    removeTemplate(name: string): boolean;
    /**
     * Simple HTML minification
     */
    private minifyHTML;
    private createSecurityAlertTemplate;
    private createSecurityAlertTextTemplate;
    private createAccountLockedTemplate;
    private createAccountLockedTextTemplate;
    private createMFAMethodAddedTemplate;
    private createMFAMethodAddedTextTemplate;
    private createMFAMethodRemovedTemplate;
    private createMFAMethodRemovedTextTemplate;

export declare class TemplateTestUtils { /**
     * Generate test data for template previews
     */
    static generateTestData(): TemplateVariables;
    /**
     * Test all templates with sample data
     */
    static testAllTemplates(manager: EmailTemplateManager): {
        templateName: string;
        valid: boolean;
        errors: string[];
        warnings: string[] }[];

export default EmailTemplateManager;
//# sourceMappingURL=EmailTemplateManager.d.ts.map