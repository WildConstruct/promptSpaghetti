export type StorageError = {
    message: string;
    code?: string;
};
export type StorageResult<T> = {
    ok: true;
    data: T;
} | {
    ok: false;
    error: StorageError;
};
export declare function listUserGraphs(userId: string): Promise<StorageResult<{
    name: string;
}[]>>;
export declare function getUserGraph(userId: string, name: string): Promise<StorageResult<string>>;
export declare function putUserGraph(userId: string, name: string, content: string): Promise<StorageResult<{
    path: string;
}>>;
//# sourceMappingURL=psgStorage.d.ts.map