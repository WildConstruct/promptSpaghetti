/**
 * Re-export TemplateService to match expected import paths in test files
 * This file provides compatibility for tests looking for '../services/TemplateService'
 */

export * from './template-service';
export { TemplateService } from './template-service';
