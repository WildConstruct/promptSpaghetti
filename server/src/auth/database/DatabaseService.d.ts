import { PoolClient, QueryResult } from 'pg';
import { AuthConfig } from '../types';
export declare class DatabaseService {
    private pool;
    private config;
    constructor(config: AuthConfig);
    query(text: string, params?: any[]): Promise<QueryResult<any>>;
    transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T>;
    healthCheck(): Promise<boolean>;
    initializeSchema(): Promise<void>;
    close(): Promise<void>;
    getPoolStats(): {
        totalCount: number;
        idleCount: number;
        waitingCount: number;
    };
    getClient(): Promise<PoolClient>;
    findUserByEmail(email: string): Promise<any | null>;
    findUserById(id: string): Promise<any | null>;
}
//# sourceMappingURL=DatabaseService.d.ts.map