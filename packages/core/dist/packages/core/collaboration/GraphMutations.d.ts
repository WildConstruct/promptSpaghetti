/**
 * Epic 23: Graph Mutations - Core Types and Interfaces
 *
 * Defines the operational model for real-time collaborative graph editing
 * Integrates with existing WebSocket collaboration infrastructure
 */
import { z } from 'zod';
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
/**
 * Node update operation validation schema
 */
export declare const NodeUpdateOperationSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
/**
 * Edge add operation validation schema
 */
export declare const EdgeAddOperationSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
/**
 * All mutation operation schemas union
 */
export declare const MutationOperationSchema: z.ZodDiscriminatedUnion<"type", readonly [z.ZodDiscriminatedUnionOption<"type">, ...z.ZodDiscriminatedUnionOption<"type">[]]>;
/**
 * Generate a unique operation ID
 */
export declare function generateOperationId(userId: string, timestamp?: number): string;
/**
 * Generate a unique node ID
 */
export declare function generateNodeId(prefix?: string): string;
/**
 * Generate a unique edge ID
 */
export declare function generateEdgeId(sourceId: string, targetId: string): string;
/**
 * Check if an operation affects a specific node
 */
export declare function operationAffectsNode(operation: MutationOperation, nodeId: string): boolean;
//# sourceMappingURL=GraphMutations.d.ts.map