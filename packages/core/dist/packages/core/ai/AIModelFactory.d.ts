/**
 * AI Model Factory
 * Epic 35.1.1 - Multi-Model Infrastructure
 *
 * Factory for creating and managing AI model adapters
 */
import { 
  BaseAIModel,
  AIModelType,
  AIModelProvider,
  ModelConfiguration,
  AIModelFactory as IAIModelFactory,
  ModelCapabilities,
  ModelMetadata
} from './BaseAIModel';
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
    createModel(config: ModelConfiguration): Promise<BaseAIModel>;
    getSupportedTypes(): AIModelType[];
    getDefaultConfiguration(type: AIModelType): ModelConfiguration;
    registerModel(registration: ModelRegistration): void;
    unregisterModel(modelId: string): void;
    getRegisteredModels(): ModelRegistration[];
    getModel(modelId: string): Promise<BaseAIModel | null>;
    destroyModel(modelId: string): Promise<void>;
    destroyAllModels(): Promise<void>;
    private _createOpenAIModel;
    private _createAnthropicModel;
    private _createLocalModel;
    private _createCustomHTTPModel;
    testModel(modelId: string): Promise<boolean>;
    getModelHealth(modelId: string): Promise<unknown>;
    getModelMetadata(modelId: string): ModelMetadata | null;
    createModels(configs: ModelConfiguration[]): Promise<BaseAIModel[]>;
    testAllModels(): Promise<Record<string, boolean>>;
    updateFactoryConfig(config: Partial<FactoryConfig>): void;
    getFactoryConfig(): FactoryConfig;
    getStatistics(): unknown;
    private _log;
}
export default AIModelFactory;
//# sourceMappingURL=AIModelFactory.d.ts.map