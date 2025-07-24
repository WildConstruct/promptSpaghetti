/**
 * Re-export TemplateCreationWizard to match expected import paths in test files
 * This file provides compatibility for tests looking for '../TemplateCreationWizard'
 */

export * from '../core/components/templates/TemplateCreationWizard';
export { TemplateCreationWizard } from '../core/components/templates/TemplateCreationWizard';