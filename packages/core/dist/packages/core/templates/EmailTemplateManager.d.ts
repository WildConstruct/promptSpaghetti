export interface EmailTemplate {
    subject: string;
    htmlTemplate: string;
    textTemplate: string;
    variables: string;
    description: string;
    category: 'verification' | 'enrollment' | 'security' | 'notification';
}
export interface TemplateVariables {
    displayName: string;
    emailAddress: string;
    expiryMinutes: string;
    code: string;
    securityWarning?: string;
    trackingPixelUrl?: string;
    setupUrl?: string;
    companyName?: string;
    supportEmail?: string;
    locale?: string;
    timezone?: string;
}
export interface TemplateRenderOptions {
    minify?: boolean;
    stripComments?: boolean;
    inlineCSS?: boolean;
    validateVariables?: boolean;
}
//# sourceMappingURL=EmailTemplateManager.d.ts.map