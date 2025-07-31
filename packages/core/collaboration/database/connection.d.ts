import { PoolClient, QueryResult } from 'pg';

}
export interface DatabaseConfig {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
    ssl?: boolean;
    connectionTimeoutMillis?: number;
    idleTimeoutMillis?: number;
    max?: number;

export declare class DatabaseConnection {
    private pool;
    private isConnected;
    constructor(config: DatabaseConfig);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>>;
    transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T>;
    healthCheck(): Promise<{
        status: 'healthy' | 'unhealthy';
        latency: number;
        connections: {
            total: number;
            idle: number;
            waiting: number;
}
        };
    }>;
    get isHealthy(): boolean;
    get poolStats(): {
        totalCount: any;
        idleCount: any;
        waitingCount: any;
    };

export declare const ValidationHelpers: {
    isValidUUID(id: string): boolean;
};
export declare class QueryBuilder {
    private query;
    private params;
    private paramCount;
    constructor(baseQuery?: string);
    append(sql: string): this;
    where(condition: string, ...params: any[]): this;
    orderBy(column: string, direction?: 'ASC' | 'DESC'): this;
    limit(count: number): this;
    offset(count: number): this;
    param(value: any): string;
    build(): {
        query: string;
        params: any[];
    };
    static select(columns?: string[] | string): QueryBuilder;
    static insert(table: string): QueryBuilder;
    static update(table: string): QueryBuilder;
    static delete(table: string): QueryBuilder;
    from(table: string): this;
    join(table: string, condition: string): this;
    leftJoin(table: string, condition: string): this;
    set(assignments: Record<string, any>): this;
    values(data: Record<string, any>): this;
    returning(columns?: string[] | string): this;

export declare class MigrationRunner {
    private db;
    constructor(db: DatabaseConnection);
    ensureMigrationsTable(): Promise<void>;
    getAppliedMigrations(): Promise<string[]>;
    applyMigration(version: string, sql: string): Promise<void>;
    rollbackMigration(version: string): Promise<void>;

//# sourceMappingURL=connection.d.ts.map