// Continuity Tracking System for Story 2.3b
// Manages extra profiles, wardrobe history, and scene consistency

import { SegmentMetadata } from './MetadataExtractor';

export interface WardrobeItem {
  id: string;
  name: string;
  category: 'clothing' | 'accessory' | 'prop';
  color?: string;
  description?: string;
}

export interface WardrobeHistory {
  scene: string;
  timestamp: string;
  items: string[];
  notes?: string;
}

export interface ActionHistory {
  scene: string;
  action: string;
  position: string;
  timestamp: string;
  duration?: number;
}

export interface ExtraProfile {
  extra_id: string;
  name: string;
  appearance_traits: string[];
  wardrobe_history: WardrobeHistory[];
  action_history: ActionHistory[];
  metadata?: SegmentMetadata;
  last_position?: string;
  last_updated: string;
  locked: boolean;
  tags?: string[];
}

export interface ContinuityIssue {
  type: 'wardrobe' | 'position' | 'time' | 'weather' | 'props';
  severity: 'low' | 'medium' | 'high';
  description: string;
  affected_extras: string[];
  suggested_fix?: string;
  auto_fixable: boolean;
}

export interface ValidationResult {
  valid: boolean;
  issues: ContinuityIssue[];
  score: number; // 0-100, higher is better
  timestamp: string;
}

export interface SceneContext {
  scene_id: string;
  time_of_day: 'morning' | 'afternoon' | 'evening' | 'night';
  weather?: 'sunny' | 'cloudy' | 'rainy' | 'snowy';
  location: string;
  indoor: boolean;
}

export class ContinuityTracker {
  private profiles: Map<string, ExtraProfile> = new Map();
  private sceneContexts: Map<string, SceneContext> = new Map();
  private validationCache: Map<string, ValidationResult> = new Map();

  // Create or update an extra profile
  async createOrUpdateProfile(
    profile: Partial<ExtraProfile>
  ): Promise<ExtraProfile> {
    const existingProfile = profile.extra_id
      ? this.profiles.get(profile.extra_id)
      : null;

    const updatedProfile: ExtraProfile = {
      extra_id: profile.extra_id || this.generateExtraId(),
      name: profile.name || existingProfile?.name || 'Unnamed Extra',
      appearance_traits:
        profile.appearance_traits || existingProfile?.appearance_traits || [],
      wardrobe_history:
        profile.wardrobe_history || existingProfile?.wardrobe_history || [],
      action_history:
        profile.action_history || existingProfile?.action_history || [],
      metadata: profile.metadata || existingProfile?.metadata,
      last_position: profile.last_position || existingProfile?.last_position,
      last_updated: new Date().toISOString(),
      locked: profile.locked ?? existingProfile?.locked ?? false,
      tags: profile.tags || existingProfile?.tags || []
    };

    this.profiles.set(updatedProfile.extra_id, updatedProfile);
    return updatedProfile;
  }

  // Validate continuity for a scene change
  async validateContinuity(
    extra_id: string,
    newScene: SceneContext,
    proposedAction?: ActionHistory
  ): Promise<ValidationResult> {
    const profile = this.profiles.get(extra_id);
    if (!profile) {
      return {
        valid: false,
        issues: [
          {
            type: 'position',
            severity: 'high',
            description: `Extra ${extra_id} not found in continuity system`,
            affected_extras: [extra_id],
            auto_fixable: false
          }
        ],
        score: 0,
        timestamp: new Date().toISOString()
      };
    }

    const issues: ContinuityIssue[] = [];

    // Check wardrobe continuity
    const wardrobeIssues = this.checkWardrobeContinuity(profile, newScene);
    issues.push(...wardrobeIssues);

    // Check position/movement logic
    if (proposedAction) {
      const positionIssues = this.checkPositionContinuity(
        profile,
        newScene,
        proposedAction
      );
      issues.push(...positionIssues);
    }

    // Check time progression
    const timeIssues = this.checkTimeProgression(profile, newScene);
    issues.push(...timeIssues);

    // Check weather consistency
    const weatherIssues = this.checkWeatherConsistency(profile, newScene);
    issues.push(...weatherIssues);

    // Calculate continuity score
    const score = this.calculateContinuityScore(issues);

    const result: ValidationResult = {
      valid: issues.filter(i => i.severity === 'high').length === 0,
      issues,
      score,
      timestamp: new Date().toISOString()
    };

    // Cache the validation result
    const cacheKey = `${extra_id}_${newScene.scene_id}`;
    this.validationCache.set(cacheKey, result);

    return result;
  }

  // Check wardrobe continuity
  private checkWardrobeContinuity(
    profile: ExtraProfile,
    newScene: SceneContext
  ): ContinuityIssue[] {
    const issues: ContinuityIssue[] = [];

    if (profile.wardrobe_history.length === 0) return issues;

    const lastWardrobe =
      profile.wardrobe_history[profile.wardrobe_history.length - 1];
    const lastScene = this.sceneContexts.get(lastWardrobe.scene);

    if (!lastScene) return issues;

    // Check for impossible wardrobe changes
    if (this.isConsecutiveScene(lastScene, newScene)) {
      // Can't change clothes between consecutive scenes without a break
      const hasSignificantChange = this.detectWardrobeChange(lastWardrobe);
      if (hasSignificantChange) {
        issues.push({
          type: 'wardrobe',
          severity: 'high',
          description: `Wardrobe change detected between consecutive scenes ${lastScene.scene_id} and ${newScene.scene_id}`,
          affected_extras: [profile.extra_id],
          suggested_fix: 'Maintain same wardrobe or add scene break',
          auto_fixable: true
        });
      }
    }

    // Check weather-appropriate clothing
    if (newScene.weather === 'rainy' && !this.hasRainGear(lastWardrobe)) {
      issues.push({
        type: 'wardrobe',
        severity: 'medium',
        description: 'Extra lacks rain protection in rainy scene',
        affected_extras: [profile.extra_id],
        suggested_fix: 'Add umbrella or raincoat',
        auto_fixable: true
      });
    }

    return issues;
  }

  // Check position/movement continuity
  private checkPositionContinuity(
    profile: ExtraProfile,
    newScene: SceneContext,
    proposedAction: ActionHistory
  ): ContinuityIssue[] {
    const issues: ContinuityIssue[] = [];

    if (profile.action_history.length === 0) return issues;

    const lastAction =
      profile.action_history[profile.action_history.length - 1];
    const timeDiff = this.calculateTimeDifference(
      lastAction.timestamp,
      proposedAction.timestamp
    );
    const distance = this.estimateDistance(
      lastAction.position,
      proposedAction.position
    );

    // Check for impossible movements
    const maxSpeed = 5; // m/s (fast walk)
    const possibleDistance = maxSpeed * timeDiff;

    if (distance > possibleDistance) {
      issues.push({
        type: 'position',
        severity: 'high',
        description: `Impossible movement: ${distance}m in ${timeDiff}s between "${lastAction.position}" and "${proposedAction.position}"`,
        affected_extras: [profile.extra_id],
        suggested_fix: `Adjust position or add intermediate scene`,
        auto_fixable: false
      });
    }

    // Check for logical position progression
    if (
      lastAction.action === 'exiting' &&
      proposedAction.position === lastAction.position
    ) {
      issues.push({
        type: 'position',
        severity: 'medium',
        description: 'Extra appears in same position after exiting',
        affected_extras: [profile.extra_id],
        suggested_fix: 'Change position or action',
        auto_fixable: true
      });
    }

    return issues;
  }

  // Check time-of-day progression
  private checkTimeProgression(
    profile: ExtraProfile,
    newScene: SceneContext
  ): ContinuityIssue[] {
    const issues: ContinuityIssue[] = [];

    const recentScenes = this.getRecentScenes(profile, 3);
    if (recentScenes.length === 0) return issues;

    const lastScene = recentScenes[recentScenes.length - 1];

    // Check for backwards time progression
    if (this.isTimeBackwards(lastScene.time_of_day, newScene.time_of_day)) {
      issues.push({
        type: 'time',
        severity: 'medium',
        description: `Time progression issue: ${lastScene.time_of_day} → ${newScene.time_of_day}`,
        affected_extras: [profile.extra_id],
        suggested_fix: 'Adjust scene order or add flashback indicator',
        auto_fixable: false
      });
    }

    return issues;
  }

  // Check weather consistency
  private checkWeatherConsistency(
    profile: ExtraProfile,
    newScene: SceneContext
  ): ContinuityIssue[] {
    const issues: ContinuityIssue[] = [];

    const recentScenes = this.getRecentScenes(profile, 2);
    if (recentScenes.length === 0 || !newScene.weather) return issues;

    const lastScene = recentScenes[recentScenes.length - 1];

    // Check for impossible weather changes
    if (lastScene.weather && this.isConsecutiveScene(lastScene, newScene)) {
      if (lastScene.weather === 'sunny' && newScene.weather === 'snowy') {
        issues.push({
          type: 'weather',
          severity: 'high',
          description: `Impossible weather change: ${lastScene.weather} → ${newScene.weather} in consecutive scenes`,
          affected_extras: [profile.extra_id],
          suggested_fix: 'Gradual weather transition or scene break',
          auto_fixable: false
        });
      }
    }

    return issues;
  }

  // Bulk continuity validation
  async validateBulkContinuity(
    extra_ids: string[],
    newScene: SceneContext
  ): Promise<Map<string, ValidationResult>> {
    const results = new Map<string, ValidationResult>();

    // Process in parallel with limit
    const batchSize = 10;
    for (let i = 0; i < extra_ids.length; i += batchSize) {
      const batch = extra_ids.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(id => this.validateContinuity(id, newScene))
      );

      batch.forEach((id, index) => {
        results.set(id, batchResults[index]);
      });
    }

    return results;
  }

  // Auto-fix continuity issues
  async autoFixIssues(
    issues: ContinuityIssue[]
  ): Promise<{ fixed: number; failed: number }> {
    let fixed = 0;
    let failed = 0;

    for (const issue of issues) {
      if (!issue.auto_fixable) {
        failed++;
        continue;
      }

      try {
        switch (issue.type) {
          case 'wardrobe':
            await this.fixWardrobeIssue(issue);
            fixed++;
            break;
          case 'position':
            await this.fixPositionIssue(issue);
            fixed++;
            break;
          default:
            failed++;
        }
      } catch (error) {
        console.error('Failed to auto-fix issue:', error);
        failed++;
      }
    }

    return { fixed, failed };
  }

  // Generate continuity report
  generateContinuityReport(scene_ids: string[]): string {
    const report: string[] = ['# Continuity Report\n'];
    report.push(`Generated: ${new Date().toISOString()}\n\n`);

    for (const scene_id of scene_ids) {
      const scene = this.sceneContexts.get(scene_id);
      if (!scene) continue;

      report.push(`## Scene ${scene_id}\n`);
      report.push(`- Location: ${scene.location}\n`);
      report.push(`- Time: ${scene.time_of_day}\n`);
      report.push(`- Weather: ${scene.weather || 'Not specified'}\n\n`);

      // List extras in scene
      const extrasInScene = this.getExtrasInScene(scene_id);
      if (extrasInScene.length > 0) {
        report.push('### Extras:\n');
        for (const extra of extrasInScene) {
          const profile = this.profiles.get(extra);
          if (profile) {
            report.push(`- ${profile.name} (${profile.extra_id})\n`);
            const lastWardrobe = profile.wardrobe_history.slice(-1)[0];
            if (lastWardrobe) {
              report.push(`  - Wardrobe: ${lastWardrobe.items.join(', ')}\n`);
            }
          }
        }
        report.push('\n');
      }
    }

    return report.join('');
  }

  // Helper methods

  private generateExtraId(): string {
    const count = this.profiles.size + 1;
    return `extra_${count.toString().padStart(4, '0')}`;
  }

  private isConsecutiveScene(
    scene1: SceneContext,
    scene2: SceneContext
  ): boolean {
    if (scene1.scene_id === scene2.scene_id) {
      return false;
    }

    const extractIndex = (sceneId: string): number | null => {
      const match = sceneId.match(/(\d+)(?!.*\d)/);
      return match ? Number.parseInt(match[1], 10) : null;
    };

    const sceneIndex1 = extractIndex(scene1.scene_id);
    const sceneIndex2 = extractIndex(scene2.scene_id);

    if (
      sceneIndex1 !== null &&
      sceneIndex2 !== null &&
      Math.abs(sceneIndex1 - sceneIndex2) === 1
    ) {
      return true;
    }

    const timeOrder: SceneContext['time_of_day'][] = [
      'morning',
      'afternoon',
      'evening',
      'night'
    ];

    const index1 = timeOrder.indexOf(scene1.time_of_day);
    const index2 = timeOrder.indexOf(scene2.time_of_day);
    const timeDiff =
      index1 >= 0 && index2 >= 0 ? Math.abs(index1 - index2) : Number.POSITIVE_INFINITY;
    const sameLocation = scene1.location === scene2.location;
    const similarTimeOfDay = timeDiff <= 1;

    return sameLocation && similarTimeOfDay;
  }

  private detectWardrobeChange(wardrobe: WardrobeHistory): boolean {
    if (!wardrobe.notes) {
      return false;
    }

    const normalizedNotes = wardrobe.notes.toLowerCase();
    return (
      normalizedNotes.includes('change') ||
      normalizedNotes.includes('swap') ||
      normalizedNotes.includes('different')
    );
  }

  private hasRainGear(wardrobe: WardrobeHistory): boolean {
    return wardrobe.items.some(
      item =>
        item.toLowerCase().includes('umbrella') ||
        item.toLowerCase().includes('raincoat')
    );
  }

  private calculateTimeDifference(time1: string, time2: string): number {
    const t1 = new Date(time1).getTime();
    const t2 = new Date(time2).getTime();
    return Math.abs(t2 - t1) / 1000; // Return in seconds
  }

  private estimateDistance(pos1: string, pos2: string): number {
    // Simplified distance estimation
    if (pos1 === pos2) return 0;
    if (pos1.includes('left') && pos2.includes('right')) return 20;
    if (pos1.includes('background') && pos2.includes('foreground')) return 15;
    return 10; // Default medium distance
  }

  private isTimeBackwards(time1: string, time2: string): boolean {
    const timeOrder = ['morning', 'afternoon', 'evening', 'night'];
    return timeOrder.indexOf(time1) > timeOrder.indexOf(time2);
  }

  private getRecentScenes(
    profile: ExtraProfile,
    count: number
  ): SceneContext[] {
    const sceneIds = profile.action_history.slice(-count).map(a => a.scene);

    return sceneIds
      .map(id => this.sceneContexts.get(id))
      .filter(s => s !== undefined) as SceneContext[];
  }

  private getExtrasInScene(scene_id: string): string[] {
    const extras: string[] = [];

    for (const [extra_id, profile] of this.profiles.entries()) {
      const inScene = profile.action_history.some(a => a.scene === scene_id);
      if (inScene) {
        extras.push(extra_id);
      }
    }

    return extras;
  }

  private calculateContinuityScore(issues: ContinuityIssue[]): number {
    let score = 100;

    for (const issue of issues) {
      switch (issue.severity) {
        case 'high':
          score -= 20;
          break;
        case 'medium':
          score -= 10;
          break;
        case 'low':
          score -= 5;
          break;
      }
    }

    return Math.max(0, score);
  }

  private async fixWardrobeIssue(issue: ContinuityIssue): Promise<void> {
    // Implementation for auto-fixing wardrobe issues
    console.log('Fixing wardrobe issue:', issue.description);
  }

  private async fixPositionIssue(issue: ContinuityIssue): Promise<void> {
    // Implementation for auto-fixing position issues
    console.log('Fixing position issue:', issue.description);
  }
}
