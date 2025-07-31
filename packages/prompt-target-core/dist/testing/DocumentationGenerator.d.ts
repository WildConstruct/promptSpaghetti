import { ModelAdaptor, ParameterSpec, Feature, Limitation, Platform } from '../types/index.js';
import { AdaptorTestResults } from './AdaptorTestFramework.js';
/**
 * Automated documentation generator for adaptors
 */
export declare class DocumentationGenerator {
  private logger;
  constructor(logger: any);
  /**
   * Generate comprehensive documentation for an adaptor
   */
  generateAdaptorDocumentation(
    adaptor: ModelAdaptor,
    testResults?: AdaptorTestResults,
    options?: DocumentationOptions
  ): Promise<AdaptorDocumentation>;
  /**
   * Generate overview section
   */
  private generateOverview;
  /**
   * Generate capabilities documentation
   */
  private generateCapabilitiesDocumentation;
  /**
   * Generate parameters documentation
   */
  private generateParametersDocumentation;
  /**
   * Generate features documentation
   */
  private generateFeaturesDocumentation;
  /**
   * Generate limitations documentation
   */
  private generateLimitationsDocumentation;
  /**
   * Generate usage examples
   */
  private generateExamples;
  /**
   * Generate API reference
   */
  private generateAPIReference;
  /**
   * Generate troubleshooting guide
   */
  private generateTroubleshooting;
  /**
   * Generate test results documentation
   */
  private generateTestDocumentation;
  /**
   * Generate markdown format
   */
  private generateMarkdown;
  /**
   * Generate HTML format
   */
  private generateHTML;
  private generateQuickStart;
  private generateBasicExample;
  private generateAdvancedExample;
  private generateErrorExample;
  private generateTutorials;
  private getNodeTypeDescription;
  private getNodeTypeExamples;
  private getFormatDescription;
  private getFormatMimeType;
  private generateParameterExamples;
  private generateParameterValidation;
  private generateFeatureExample;
  private generateWorkaround;
  private generateTypeDocumentation;
  private getDocumentationCSS;
  private convertMarkdownToHTML;
}
export interface DocumentationOptions {
  includeTutorials?: boolean;
  includeTestResults?: boolean;
  customSections?: CustomSection[];
  changelog?: ChangelogEntry[];
}
export interface AdaptorDocumentation {
  metadata: DocumentationMetadata;
  overview: OverviewSection;
  capabilities: CapabilitiesSection;
  parameters: ParametersSection;
  features: FeaturesSection;
  limitations: LimitationsSection;
  examples: ExamplesSection;
  apiReference: APIReferenceSection;
  troubleshooting: TroubleshootingSection;
  testResults?: TestDocumentationSection;
  changelog: ChangelogEntry[];
  formats?: DocumentationFormats;
}
export interface DocumentationMetadata {
  adaptorId: string;
  version: string;
  platform: Platform;
  name: string;
  description: string;
  generatedAt: Date;
  generatorVersion: string;
}
export interface OverviewSection {
  summary: string;
  platformInfo: {
    platform: Platform;
    version: string;
    supportedFormats: string[];
  };
  keyFeatures: string[];
  quickStart: string;
}
export interface CapabilitiesSection {
  supportedNodeTypes: Array<{
    type: string;
    description: string;
    examples: string[];
  }>;
  maxNodes?: number;
  maxPromptLength?: number;
  supportedFormats: Array<{
    format: string;
    description: string;
    mimeType: string;
  }>;
}
export interface ParametersSection {
  summary: string;
  parameters: Array<
    ParameterSpec & {
      examples: string[];
      validation: string;
    }
  >;
}
export interface FeaturesSection {
  supported: Array<
    Feature & {
      usageExample: string;
    }
  >;
  unsupported: Array<
    Feature & {
      workarounds: string[];
    }
  >;
  summary: string;
}
export interface LimitationsSection {
  byType: Record<string, Limitation[]>;
  summary: string[];
  workarounds: Array<{
    limitation: string;
    workaround: string;
  }>;
}
export interface ExamplesSection {
  examples: UsageExample[];
  tutorials: Tutorial[];
}
export interface UsageExample {
  title: string;
  description: string;
  code: string;
  output: string;
}
export interface Tutorial {
  title: string;
  steps: string[];
  code: string;
}
export interface APIReferenceSection {
  methods: MethodDocumentation[];
  types: TypeDocumentation[];
}
export interface MethodDocumentation {
  name: string;
  signature: string;
  description: string;
  parameters: Array<{
    name: string;
    type: string;
    description: string;
    optional?: boolean;
  }>;
  returns: string;
  examples: string[];
}
export interface TypeDocumentation {
  name: string;
  description: string;
  properties: Array<{
    name: string;
    type: string;
    description: string;
    optional?: boolean;
  }>;
}
export interface TroubleshootingSection {
  commonIssues: Array<{
    issue: string;
    cause: string;
    solution: string;
    code: string;
  }>;
  debugging: {
    enableLogging: string;
    validateFirst: string;
    checkCapabilities: string;
  };
  support: {
    documentation: string;
    examples: string;
    community: string;
  };
}
export interface TestDocumentationSection {
  summary: {
    passed: boolean;
    score: number;
    description: string;
  };
  compliance: any;
  performance: any;
  functionality: any;
}
export interface CustomSection {
  title: string;
  content: string;
  order?: number;
}
export interface ChangelogEntry {
  version: string;
  date: Date;
  changes: string[];
  breaking?: boolean;
}
export interface DocumentationFormats {
  markdown: string;
  html: string;
  json: string;
}
