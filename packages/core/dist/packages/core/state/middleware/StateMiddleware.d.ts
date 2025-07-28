/**
 * State Middleware System
 * REFACTOR-006: Advanced State Management & Data Flow Architecture
 *
 * Middleware pipeline for state transformations and validations
 */
import { StateChange, StateMiddleware } from '../containers/BaseStateContainer';
export interface MiddlewareContext<T> {
    state: T;
    prevState: T;
    change: StateChange<T>;
    domain: string;
    userId?: string;
    metadata: Record<string, any>;
}
export interface MiddlewareResult<T> {
    state: T;
    skipNext?: boolean;
    metadata?: Record<string, any>;
    warnings?: string;
}
export interface AsyncMiddleware<T> {
    name: string;
    order: number;
    beforeUpdate?: (context: MiddlewareContext<T>) => Promise<MiddlewareResult<T>>;
    afterUpdate?: (context: MiddlewareContext<T>) => Promise<void>;
    onError?: (error: Error, context: MiddlewareContext<T>) => Promise<void>;
}
export declare class ValidationMiddleware<T> implements StateMiddleware<T> {
    name: string;
    order: number;
    constructor();
    private validators;
    private options;
}
//# sourceMappingURL=StateMiddleware.d.ts.map