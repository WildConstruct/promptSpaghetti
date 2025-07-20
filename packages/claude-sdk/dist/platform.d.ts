/**
 * Platform-specific Claude integrations
 */
import { ClaudeClient } from './client';
export declare function createPlatformClaudeClient(platform: 'web' | 'mobile' | 'desktop'): ClaudeClient;
export declare function getPlatformFeatures(platform: 'web' | 'mobile' | 'desktop'): {
    voiceInput: boolean;
    realtimeStreaming: boolean;
    batchProcessing: boolean;
} | {
    voiceInput: boolean;
    realtimeStreaming: boolean;
    batchProcessing: boolean;
} | {
    voiceInput: boolean;
    realtimeStreaming: boolean;
    batchProcessing: boolean;
};
//# sourceMappingURL=platform.d.ts.map