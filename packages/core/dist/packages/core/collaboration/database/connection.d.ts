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
}
export declare class DatabaseConnection {
    private pool;
    private isConnected;
    constructor(config: DatabaseConfig);
}
//# sourceMappingURL=connection.d.ts.map