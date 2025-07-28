/**
 * Generic HTTP API Adapter
 * Epic 35.1.1 - Multi-Model Infrastructure
 *
 * Flexible adapter for custom AI model endpoints following REST conventions
 */
import { BaseAIModel, ModelMetadata, ModelCapabilities, CostEstimate } from '../BaseAIModel';
export interface HTTPConfig {
    baseURL: string;
    apiKey?: string;
    headers?: Record<string, string>;
    timeout?: number;
    maxRetries?: number;
    authType?: 'bearer' | 'api-key' | 'custom';
    healthEndpoint?: string;
}
export interface HTTPRequestOptions {
    endpoint?: string;
    method?: 'POST' | 'GET' | 'PUT' | 'PATCH';
    headers?: Record<string, string>;
    timeout?: number;
    retries?: number;
    parameters?: Record<string, unknown>;
}
export interface HTTPRequestMapping {
    inputPath: string;
    outputPath: string;
    parametersPath?: string;
    usagePath?: string;
    errorPath?: string;
    statusPath?: string;
}
export interface GenericHTTPResponse {
    status: number;
    data: unknown;
    headers: Record<string, string>;
    usage?: {
        input_tokens?: number;
        output_tokens?: number;
        total_tokens?: number;
    };
}
export declare class GenericHTTPAdapter extends BaseAIModel {
    private config;
    private requestMapping;
    private defaultEndpoint;
    constructor()
      id: string,
      config: HTTPConfig,
      metadata: Partial<ModelMetadata>,
      capabilities: Partial<ModelCapabilities>,
      requestMapping: HTTPRequestMapping,
      defaultEndpoint?: string
    );
    initialize(): Promise<void>;
    process(input: unknown, options?: HTTPRequestOptions): Promise<unknown>;
    cleanup(): Promise<void>;
    estimate(input: any, options?: HTTPRequestOptions): Promise<CostEstimate>;
    updateRequestMapping(mapping: Partial<HTTPRequestMapping>): void;
    updateHTTPConfig(config: Partial<HTTPConfig>): void;
    private _testConnection;
    private _makeRequest;
    private _buildHeaders;
    private _buildRequestPayload;
    private _extractContent;
    private _extractUsage;
    private _setValueByPath;
    private _getValueByPath;
    protected _performHealthCheck(): Promise<void>;
}
export default GenericHTTPAdapter;
//# sourceMappingURL=GenericHTTPAdapter.d.ts.map