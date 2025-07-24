/**
 * Re-export TemplateService to match expected import paths in client test files
 * This file provides compatibility for tests looking for '../../services/templateService'
 */

export * from '../core/services/TemplateService';
export { TemplateService } from '../core/services/TemplateService';