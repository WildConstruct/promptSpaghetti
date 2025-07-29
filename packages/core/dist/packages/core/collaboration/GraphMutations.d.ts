/**
 * Base interface for all graph mutation operations
 */
export interface BaseMutationOperation {
    operationId: string;
    documentId: string;
    timestamp: number;
    userId: string;
    clientId?: string;
    operationVector?: VersionVector;
    dependencies?: string;
}
export interface VersionVector {
    [clientId: string]: number;
}
export declare enum OperationPriority {
    LOW = 1,
    MEDIUM = 2,
    HIGH = 3,
    CRITICAL = 4
    /**
     * Node Addition Operation
     */
    ,
    /**
     * Node Addition Operation
     */
    export = 5,
    interface = 6,
    NodeAddOperation = 7,
    extends = 8,
    BaseMutationOperation = 9
}
//# sourceMappingURL=GraphMutations.d.ts.map