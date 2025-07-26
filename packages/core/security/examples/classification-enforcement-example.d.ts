/**
 * Classification Enforcement Examples
 *
 * Demonstrates how to use the Classification Enforcer system
 * for securing data access based on classification levels
 */
import { ClassificationEnforcer } from '../ClassificationEnforcer';
declare const app: any;
declare const enforcer: ClassificationEnforcer;
declare function processDataOperation(
  userId: string,
  dataId: string,
  operation: 'read' | 'write' | 'delete',
  classification: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED'
): Promise<void>;
declare function batchProcessData(userId: string, dataItems: Array<{
    id: string;
    classification: any;
    value: any;
}>): Promise<{
    id: string;
    value: any;
    riskScore: number;
}[]>;
declare function createCustomEnforcer(): ClassificationEnforcer;
export { app, enforcer, processDataOperation, batchProcessData, createCustomEnforcer };
//# sourceMappingURL=classification-enforcement-example.d.ts.map