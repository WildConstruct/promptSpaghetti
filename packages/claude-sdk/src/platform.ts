/**
 * Platform-specific Claude integrations
 */

import { ClaudeClient } from './client';
import { ClaudeConfig } from './types';

export function createPlatformClaudeClient(platform: 'web' | 'mobile' | 'desktop'): ClaudeClient {
  const baseConfig: ClaudeConfig = {
    apiKey: process.env.CLAUDE_API_KEY || 'dev-key',
    model: 'claude-3-sonnet-20240229',
    maxTokens: 4096,
    temperature: 0.7,
  };

  // Platform-specific optimizations
  const platformConfig = {
    web: {
      ...baseConfig,
      maxTokens: 4096, // Full feature set
    },
    mobile: {
      ...baseConfig,
      maxTokens: 2048, // Reduced for battery/performance
      temperature: 0.5, // More focused responses
    },
    desktop: {
      ...baseConfig,
      maxTokens: 8192, // Enhanced capabilities
    },
  };

  return new ClaudeClient(platformConfig[platform]);
}

export function getPlatformFeatures(platform: 'web' | 'mobile' | 'desktop') {
  return {
    web: {
      voiceInput: false,
      realtimeStreaming: true,
      batchProcessing: true,
    },
    mobile: {
      voiceInput: true, // Mobile voice integration
      realtimeStreaming: false, // Battery conservation
      batchProcessing: false,
    },
    desktop: {
      voiceInput: true,
      realtimeStreaming: true,
      batchProcessing: true,
    },
  }[platform];
}
