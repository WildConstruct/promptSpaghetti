import Redis from 'ioredis';
import { RedisConfig } from '../types';
export declare class RedisService {
    private client;
    private config;
    constructor(config: RedisConfig);
    connect(): Promise<void>;
    get(key: string): Promise<string | null>;
    set(key: string, value: string): Promise<void>;
    setex(key: string, seconds: number, value: string): Promise<void>;
    exists(key: string): Promise<boolean>;
    del(key: string): Promise<void>;
    incr(key: string): Promise<number>;
    expire(key: string, seconds: number): Promise<void>;
    ttl(key: string): Promise<number>;
    checkRateLimit(key: string, window: number, limit: number): Promise<{
        allowed: boolean;
        count: number;
        remaining: number;
        resetTime: Date;
    }>;
    storeSession(sessionId: string, data: any, ttl: number): Promise<void>;
    getSession(sessionId: string): Promise<any | null>;
    deleteSession(sessionId: string): Promise<void>;
    extendSession(sessionId: string, ttl: number): Promise<void>;
    cache(key: string, data: any, ttl: number): Promise<void>;
    getCache(key: string): Promise<any | null>;
    invalidateCache(pattern: string): Promise<void>;
    healthCheck(): Promise<boolean>;
    getInfo(): Promise<any>;
    close(): Promise<void>;
    getClient(): Redis;
}
//# sourceMappingURL=RedisService.d.ts.map