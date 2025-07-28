export interface RedisClient {
    get(key: string): Promise<string | null>;
    set(key: string, value: string, options?: {
        EX?: number;
        PX?: number;
    }): Promise<string | null>;
    incr(key: string): Promise<number>;
    expire(key: string, seconds: number): Promise<number>;
    pexpire(key: string, milliseconds: number): Promise<number>;
    ttl(key: string): Promise<number>;
    del(key: string): Promise<number>;
    eval(script: string, keys: string, args: string): Promise<unknown>;
    ping(): Promise<string>;
    quit(): Promise<string>;
    scanStream(options?: {
        match?: string;
        count?: number;
    }): AsyncIterable<string>;
}
export interface RedisRateLimitConfig {
    keyPrefix?: string;
    client: RedisClient;
    enableScripting?: boolean;
    connectionTimeout?: number;
    retryAttempts?: number;
    retryDelay?: number;
    fallbackToMemory?: boolean;
}
//# sourceMappingURL=RedisRateLimitStore.d.ts.map