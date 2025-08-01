/**
 * Transform Extension Interface - Epic 8.4 Story 8.4.2
 * Defines interfaces for extending the data transformation system
 */
import { z } from 'zod';
import { BaseExtension, ExtensionContext, ExtensionValidationResult } from './ExtensionInterfaces';

}
}
export interface TransformExtension extends BaseExtension { readonly extensionType: 'transform';
    getTransformDefinitions(): TransformDefinition[];
    createTransformInstance(transformId: string, config: any): DataTransform;
    validateTransformConfig(transformId: string, config: any): ExtensionValidationResult;
    getTransformSchema(transformId: string): z.ZodSchema<any>;
    onTransformCreated?(transform: DataTransform): void;
    onTransformExecuted?(transform: DataTransform, input: any, output: any): void;
    onTransformError?(transform: DataTransform, error: Error): void;
    supportsPipeline(): boolean;
    createPipeline?(transforms: DataTransform[]): TransformPipeline }
}
export interface DataTransform { readonly id: string;
    readonly name: string;
    readonly type: TransformType;
    readonly version: string;
    transform(input: any, context: TransformContext): Promise<any> | any;
    validateInput(input: any): ExtensionValidationResult;
    validateOutput(output: any): ExtensionValidationResult;
    getInputSchema(): z.ZodSchema<any>;
    getOutputSchema(): z.ZodSchema<any>;
    getConfiguration(): any;
    setConfiguration(config: any): void;
    getMetadata(): TransformMetadata;
    initialize(context: ExtensionContext): Promise<void>;
    dispose(): Promise<void>;

export declare enum TransformType {
    TEXT = "text";
    JSON = "json";
    ARRAY = "array";
    OBJECT = "object";
    STRING = "string";
    NUMBER = "number";
    BOOLEAN = "boolean";
    DATE = "date" }
    CUSTOM = "custom"

}
}
}
export interface TransformDefinition { id: string;
    name: string;
    description: string;
    version: string;
    type: TransformType;
    transformClass: new (id: string, config: any) => DataTransform;
    inputSchema: z.ZodSchema<any>;
    outputSchema: z.ZodSchema<any>;
    configSchema: z.ZodSchema<any>;
    ui: TransformUIConfiguration;
    runtime: TransformRuntimeConfiguration;
    pipeline: TransformPipelineConfiguration;
    metadata: TransformMetadata }
}
}
export interface TransformUIConfiguration { icon?: string;
    color?: string;
    category?: string;
    editor?: TransformEditorConfiguration;
    preview?: TransformPreviewConfiguration;
    help?: TransformHelpConfiguration }
}
}
export interface TransformEditorConfiguration { component?: React.ComponentType<TransformEditorProps>;
    autoGenerateForm?: boolean;
    formLayout?: 'vertical' | 'horizontal' | 'grid';
    fields?: Record<string, TransformFieldConfiguration>;
    validation?: TransformEditorValidation }
}
}
export interface TransformEditorProps { transform: DataTransform;
    config: any;
    onChange: (config: any) => void;
    onTest?: (input: any) => void;
    context: ExtensionContext }
}
}
export interface TransformFieldConfiguration { type: 'text' | 'textarea' | 'number' | 'boolean' | 'select' | 'json' | 'code' | 'custom';
    label?: string;
    placeholder?: string;
    helpText?: string;
    validation?: z.ZodSchema<any>;
    options?: Array<{
        value: any;
        label: string }
}
    }>;
    component?: React.ComponentType<any>;
    multiline?: boolean;
    syntax?: string;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    step?: number;

}
}
export interface TransformEditorValidation { validateOnChange?: boolean;
    validateOnBlur?: boolean;
    showErrors?: boolean;
    customValidation?: (config: any) => ExtensionValidationResult }
}
}
export interface TransformPreviewConfiguration { component?: React.ComponentType<TransformPreviewProps>;
    autoPreview?: boolean;
    sampleInput?: any;
    mode?: 'input-output' | 'side-by-side' | 'overlay' }
}
}
export interface TransformPreviewProps { transform: DataTransform;
    input: any;
    output: any;
    error?: Error;
    context: ExtensionContext }
}
}
export interface TransformHelpConfiguration {
    documentation?: string;
    examples?: TransformExample[];
    interactive?: boolean;
    tutorial?: string;
    links?: Array<{
        title: string;
        url: string;
        type: 'documentation' | 'example' | 'tutorial' | 'reference'
}
}
  }>;

}
}
export interface TransformRuntimeConfiguration { timeout?: number;
    retries?: number;
    performance?: TransformPerformanceConfiguration;
    security?: TransformSecurityConfiguration;
    caching?: TransformCachingConfiguration;
    streaming?: TransformStreamingConfiguration }
}
}
export interface TransformPerformanceConfiguration { maxMemoryUsage?: number;
    maxExecutionTime?: number;
    batchSize?: number;
    batchTimeout?: number;
    parallelism?: number;
    optimizationHints?: {
        cpuIntensive?: boolean;
        ioIntensive?: boolean;
        memoryIntensive?: boolean }
}
    };

}
}
export interface TransformSecurityConfiguration { sandboxed?: boolean;
    permissions?: string[];
    inputValidation?: {
        sanitize?: boolean;
        allowedTypes?: string[];
        maxSize?: number }
}
    };
    outputValidation?: { sanitize?: boolean;
        allowedTypes?: string[];
        maxSize?: number };

}
}
export interface TransformCachingConfiguration { enabled?: boolean;
    strategy?: 'memory' | 'disk' | 'distributed';
    ttl?: number;
    maxSize?: number;
    keyGenerator?: (input: any, config: any) => string;
    invalidationRules?: string[] }
}
}
export interface TransformStreamingConfiguration { enabled?: boolean;
    chunkSize?: number;
    backpressureLimit?: number;
    parallelChunks?: number;
    streamProcessor?: (chunk: any) => any;
    chunkCombiner?: (chunks: any[]) => any }
}
}
export interface TransformPipelineConfiguration { supportsComposition?: boolean;
    compositionType?: 'sequential' | 'parallel' | 'conditional';
    inputCompatibility?: string[];
    outputCompatibility?: string[];
    optimization?: {
        fuseable?: boolean;
        parallelizable?: boolean;
        cacheable?: boolean }
}
    };

}
}
export interface TransformMetadata {
    author: string;
    license: string;
    repository?: string;
    documentation?: string;
    examples?: TransformExample[];
    performance?: {
        complexity: 'O(1)' | 'O(n)' | 'O(n^2)' | 'O(log n)' | 'custom';
        memoryUsage: 'constant' | 'linear' | 'quadratic' | 'custom';
        scalability: 'excellent' | 'good' | 'moderate' | 'limited'
}
}
  };
    compatibility?: { minVersion: string;
        maxVersion?: string;
        deprecated?: boolean;
        deprecationMessage?: string };
    categories?: string[];
    tags?: string[];
    keywords?: string[];

}
}
export interface TransformExample { name: string;
    description: string;
    input: any;
    output: any;
    config?: any;
    explanation?: string;
    difficulty?: 'beginner' | 'intermediate' | 'advanced' }
}
}
export interface TransformContext { transformId: string;
    executionId: string;
    timestamp: Date;
    extensionContext: ExtensionContext;
    performance: {
        startTime: number;
        endTime?: number;
        memoryUsage?: number }
}
    };
    metadata: { inputSize?: number;
        outputSize?: number;
        transformVersion: string };
    pipeline?: { position: number;
        total: number;
        previousOutput?: any;
        nextTransform?: string };
    cache?: { enabled: boolean;
        key?: string;
        hit?: boolean };

}
}
export interface TransformPipeline { readonly id: string;
    readonly name: string;
    readonly transforms: DataTransform[];
    execute(input: any, context: TransformContext): Promise<any> | any;
    validate(): ExtensionValidationResult;
    optimize(): TransformPipeline;
    addTransform(transform: DataTransform, position?: number): void;
    removeTransform(transformId: string): void;
    moveTransform(transformId: string, newPosition: number): void;
    getMetadata(): PipelineMetadata }
}
}
export interface PipelineMetadata { transformCount: number;
    estimatedExecutionTime: number;
    estimatedMemoryUsage: number;
    inputType: string;
    outputType: string;
    compatibility: string[] }
}
}
export interface TransformRegistry { register(definition: TransformDefinition): void;
    unregister(transformId: string): void;
    get(transformId: string): TransformDefinition | undefined;
    getAll(): TransformDefinition[];
    getByType(type: TransformType): TransformDefinition[];
    getByCategory(category: string): TransformDefinition[];
    search(query: string): TransformDefinition[];
    filter(predicate: (definition: TransformDefinition) => boolean): TransformDefinition[];
    getCompatible(inputType: string, outputType: string): TransformDefinition[];
    validate(definition: TransformDefinition): ExtensionValidationResult;
    on(event: 'registered' | 'unregistered' | 'updated', listener: (definition: TransformDefinition) => void): void;
    off(event: 'registered' | 'unregistered' | 'updated', listener: (definition: TransformDefinition) => void): void }
}
}
export interface TransformFactory { create(transformId: string, config: any): DataTransform;
    createPipeline(transforms: DataTransform[]): TransformPipeline;
    validateConfig(transformId: string, config: any): ExtensionValidationResult;
    validatePipeline(transforms: DataTransform[]): ExtensionValidationResult;
    getInputSchema(transformId: string): z.ZodSchema<any>;
    getOutputSchema(transformId: string): z.ZodSchema<any>;
    getConfigSchema(transformId: string): z.ZodSchema<any>;
    supports(transformId: string): boolean;
    supportsType(type: TransformType): boolean;
    supportsPipeline(): boolean }
}
}
export interface TransformExecutionMonitor { onExecutionStart(transform: DataTransform, input: any, context: TransformContext): void;
    onExecutionEnd(transform: DataTransform, output: any, context: TransformContext): void;
    onExecutionError(transform: DataTransform, error: Error, context: TransformContext): void;
    getMetrics(transformId: string): TransformExecutionMetrics;
    getAllMetrics(): Map<string, TransformExecutionMetrics>;
    on(event: 'execution' | 'error' | 'performance', listener: (data: any) => void): void }
}
}
export interface TransformExecutionMetrics {
    transformId: string;
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    averageExecutionTime: number;
    minExecutionTime: number;
    maxExecutionTime: number;
    averageMemoryUsage: number;
    totalInputSize: number;
    totalOutputSize: number;
    lastExecuted: Date;
    lastError?: Error;

export declare namespace TransformExtensionHelpers {
    function createTransformDefinition(config: Partial<TransformDefinition>): TransformDefinition;
    function validateTransformDefinition(definition: TransformDefinition): ExtensionValidationResult;
    function createTransformRegistry(): TransformRegistry;

//# sourceMappingURL=TransformExtension.d.ts.map
}
}