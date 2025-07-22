import { DataSource, HistoricalQuery, QueryResult } from '../external-data/DataSourceManager';
interface UseExternalDataImportProps {
    autoRefresh?: boolean;
    refreshInterval?: number;
    enableRealTimeUpdates?: boolean;
    cacheStrategy?: 'aggressive' | 'conservative' | 'disabled';
    onError?: (error: Error) => void;
    onSuccess?: (results: QueryResult[]) => void;
}
interface ExternalDataImportState {
    isLoading: boolean;
    hasError: boolean;
    error: Error | null;
    lastQuery: HistoricalQuery | null;
    lastResults: QueryResult[];
    availableDataSources: DataSource[];
    enabledSourcesCount: number;
    cacheHitRate: number;
    lastUpdateTime: string | null;
}
interface UseExternalDataImportReturn {
    state: ExternalDataImportState;
    queryData: (query: HistoricalQuery, sourceIds?: string[]) => Promise<QueryResult[]>;
    refreshData: () => Promise<void>;
    clearCache: () => void;
    addDataSource: (source: DataSource) => void;
    updateDataSource: (sourceId: string, updates: Partial<DataSource>) => void;
    removeDataSource: (sourceId: string) => void;
    toggleDataSource: (sourceId: string) => void;
    getDataSource: (sourceId: string) => DataSource | null;
    startRealTimeUpdates: () => void;
    stopRealTimeUpdates: () => void;
    validateQuery: (query: HistoricalQuery) => {
        valid: boolean;
        errors: string[];
    };
    getQuerySuggestions: (partial: Partial<HistoricalQuery>) => string[];
    exportResults: (format: 'json' | 'csv') => string;
}
export declare const useExternalDataImport: ({ autoRefresh, refreshInterval, enableRealTimeUpdates, cacheStrategy, onError, onSuccess }?: UseExternalDataImportProps) => UseExternalDataImportReturn;
export declare const isValid: boolean, setIsValid: import("react").Dispatch<import("react").SetStateAction<boolean>>;
export declare const useCacheStats: () => {
    cacheStats: any;
    getCacheStats: () => void;
    clearCache: () => void;
    optimizeCache: () => void;
};
export {};
//# sourceMappingURL=useExternalDataImport.d.ts.map