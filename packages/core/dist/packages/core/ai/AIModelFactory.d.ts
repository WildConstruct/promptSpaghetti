/**
 * AI Model Factory
 * Epic 35.1.1 - Multi-Model Infrastructure
 *
 * Factory for creating and managing AI model adapters
 */
import { AIModelProvider, AIModelFactory as IAIModelFactory, ModelCapabilities, ModelMetadata } from './BaseAIModel';
import { HTTPRequestMapping } from './adapters/GenericHTTPAdapter';
export interface FactoryConfig {
    defaultTimeout?: number;
    defaultRetries?: number;
    enableLogging?: boolean;
    logLevel?: 'debug' | 'info' | 'warn' | 'error';
}
export interface ModelRegistration {
    id: string;
    provider: AIModelProvider;
    modelName: string;
    config: unknown;
    metadata?: Partial<ModelMetadata>;
    capabilities?: Partial<ModelCapabilities>;
    requestMapping?: HTTPRequestMapping;
}
export declare class AIModelFactory implements IAIModelFactory {
    private factoryConfig;
    private registeredModels;
    private modelInstances;
    constructor(config?: FactoryConfig);
    default: throw;
}
//# sourceMappingURL=AIModelFactory.d.ts.map