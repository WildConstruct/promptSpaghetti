/**
 * Review Tools Types - Epic 17
 *
 * Comprehensive type definitions for unified review tools system that orchestrates
 * all administrative review workflows including fraud monitoring, enforcement actions,
 * content moderation, template submissions, and user management reviews.
 *
 * Task: E17-1753114397301-5C1461 - Develop review tools
 * Epic: 17 - Backstage Admin Controls
 */
reason: string;
suggestedTraining: string;
qualityTrend: 'improving' | 'stable' | 'declining';
efficiencyTrend: 'improving' | 'stable' | 'declining';
// Time series data
dailyVolumes: number;
dailyQualityScores: number;
dailyCompletionTimes: number;
// Seasonal patterns
seasonalPatterns: SeasonalPattern;
pattern: number;
confidence: number;
description: string;
confidence: number;
actionable: boolean;
relatedData: any;
generatedAt: Date;
title: string;
description: string;
expectedImpact: string;
implementation: ImplementationGuide;
successMetrics: string;
generatedAt: Date;
timeline: string;
resources: string;
prerequisites: string;
risks: string;
export {};
