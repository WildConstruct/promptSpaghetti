/**
 * Core Database Types
 *
 * This file contains foundational type definitions used across the application
 * for database operations, pagination, and RBAC (Role-Based Access Control).
 */
// Export utility functions for creating pagination results
export function createPaginatedResult(data, totalCount, options) {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const totalPages = Math.ceil(totalCount / limit);
    return {
        data,
        pagination: {
            page,
            limit,
            totalCount,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
            nextPage: page < totalPages ? page + 1 : undefined,
            previousPage: page > 1 ? page - 1 : undefined
        }
    };
}
// Export utility function for creating operation results
export function createOperationResult(success, data, error, errorCode, executionTime) {
    return {
        success,
        data,
        error,
        errorCode,
        timestamp: new Date(),
        executionTime
    };
}
