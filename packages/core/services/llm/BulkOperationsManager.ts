// Bulk Operations Manager for Story 2.3b
// Handles parallel processing of metadata operations at scale

import { MetadataExtractor, SegmentMetadata } from './MetadataExtractor';
import { SimilarityEngine } from './SimilarityEngine';
import { ContinuityTracker, ValidationResult } from './ContinuityTracker';

export interface BulkOperation {
  id: string;
  type: 'extract' | 'apply_template' | 'sync_continuity' | 'validate' | 'index';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number; // 0-100
  total: number;
  completed: number;
  failed: number;
  startTime?: string;
  endTime?: string;
  errors: string[];
  results?: OperationResult[];
}

export interface BulkOperationOptions {
  concurrency?: number;
  retryFailures?: boolean;
  continueOnError?: boolean;
  progressCallback?: (operation: BulkOperation) => void;
}

export interface StyleTemplate {
  id: string;
  name: string;
  metadata: Partial<SegmentMetadata>;
  description?: string;
}

export interface NaturalLanguageQuery {
  query: string;
  parsed?: {
    conditions: Array<{
      field: string;
      operator: 'equals' | 'contains' | 'greater' | 'less' | 'exists';
      value: string | number | boolean;
    }>;
    keywords: string[];
    errors?: string[];
  };
}

type ExtractResult = {
  id: string;
  metadata?: SegmentMetadata;
  error?: string;
};

type TemplateResult = { id: string; success: boolean };

type ValidationSummary = {
  id: string;
  valid: boolean;
  issues: string[];
};

type SearchResult = { id: string; score: number };

type OperationResult =
  | ExtractResult
  | TemplateResult
  | ValidationResult
  | ValidationSummary
  | SearchResult;

export class BulkOperationsManager {
  private operations: Map<string, BulkOperation> = new Map();
  private metadataExtractor: MetadataExtractor;
  private similarityEngine: SimilarityEngine;
  private continuityTracker: ContinuityTracker;
  private abortControllers: Map<string, AbortController> = new Map();

  constructor(
    metadataExtractor: MetadataExtractor,
    similarityEngine: SimilarityEngine,
    continuityTracker: ContinuityTracker
  ) {
    this.metadataExtractor = metadataExtractor;
    this.similarityEngine = similarityEngine;
    this.continuityTracker = continuityTracker;
  }

  // Bulk metadata extraction
  async bulkExtractMetadata(
    items: Array<{ id: string; text: string }>,
    options: BulkOperationOptions = {}
  ): Promise<BulkOperation> {
    const operation = this.createOperation('extract', items.length);
    const abortController = new AbortController();
    this.abortControllers.set(operation.id, abortController);

    const {
      concurrency = 10,
      retryFailures = true,
      continueOnError = true,
      progressCallback
    } = options;

    operation.status = 'running';
    operation.startTime = new Date().toISOString();

    try {
      const results: ExtractResult[] = [];

      // Process in batches
      for (let i = 0; i < items.length; i += concurrency) {
        if (abortController.signal.aborted) {
          operation.status = 'cancelled';
          break;
        }

        const batch = items.slice(i, i + concurrency);

        const batchResults = await Promise.allSettled(
          batch.map(async item => {
            try {
              const result = await this.metadataExtractor.extract(item.text);
              operation.completed++;
              return { id: item.id, metadata: result.metadata };
            } catch (error) {
              operation.failed++;
              operation.errors.push(
                `Failed to extract metadata for ${item.id}: ${error}`
              );

              if (retryFailures) {
                // Retry once
                try {
                  const result = await this.metadataExtractor.extract(
                    item.text
                  );
                  operation.completed++;
                  operation.failed--; // Decrement failed count
                  return { id: item.id, metadata: result.metadata };
                } catch (retryError) {
                  if (!continueOnError) throw retryError;
                  return { id: item.id, error: String(retryError) };
                }
              } else if (!continueOnError) {
                throw error;
              }

              return { id: item.id, error: String(error) };
            }
          })
        );

        // Collect results
        for (const result of batchResults) {
          if (result.status === 'fulfilled') {
            results.push(result.value);
          }
        }

        // Update progress
        operation.progress = Math.round(
          (operation.completed / operation.total) * 100
        );

        if (progressCallback) {
          progressCallback(operation);
        }
      }

      operation.results = results;
      operation.status =
        operation.status === 'cancelled' ? 'cancelled' : 'completed';
    } catch (error) {
      operation.status = 'failed';
      operation.errors.push(String(error));
    } finally {
      operation.endTime = new Date().toISOString();
      this.abortControllers.delete(operation.id);
    }

    return operation;
  }

  // Apply style template to multiple items
  async bulkApplyTemplate(
    itemIds: string[],
    template: StyleTemplate,
    options: BulkOperationOptions = {}
  ): Promise<BulkOperation> {
    const operation = this.createOperation('apply_template', itemIds.length);
    const abortController = new AbortController();
    this.abortControllers.set(operation.id, abortController);

    const { concurrency = 10, progressCallback } = options;

    operation.status = 'running';
    operation.startTime = new Date().toISOString();

    try {
      const results: TemplateResult[] = [];

      for (let i = 0; i < itemIds.length; i += concurrency) {
        if (abortController.signal.aborted) {
          operation.status = 'cancelled';
          break;
        }

        const batch = itemIds.slice(i, i + concurrency);

        // Apply template to batch
        const batchResults = await Promise.all(
          batch.map(async id => {
            try {
              // In production, this would update the actual items
              // For now, simulate the operation
              await this.simulateDelay(100);
              operation.completed++;
              return { id, success: true };
            } catch (error) {
              operation.failed++;
              operation.errors.push(
                `Failed to apply template to ${id}: ${error}`
              );
              return { id, success: false };
            }
          })
        );

        results.push(...batchResults);

        operation.progress = Math.round(
          (operation.completed / operation.total) * 100
        );

        if (progressCallback) {
          progressCallback(operation);
        }
      }

      operation.results = results;
      operation.status =
        operation.status === 'cancelled' ? 'cancelled' : 'completed';
    } catch (error) {
      operation.status = 'failed';
      operation.errors.push(String(error));
    } finally {
      operation.endTime = new Date().toISOString();
      this.abortControllers.delete(operation.id);
    }

    return operation;
  }

  // Sync continuity for multiple extras
  async bulkSyncContinuity(
    extraIds: string[],
    sceneId: string,
    options: BulkOperationOptions = {}
  ): Promise<BulkOperation> {
    const operation = this.createOperation('sync_continuity', extraIds.length);
    const { concurrency = 10, progressCallback } = options;

    operation.status = 'running';
    operation.startTime = new Date().toISOString();

    try {
      const results: ValidationResult[] = [];

      for (let i = 0; i < extraIds.length; i += concurrency) {
        const batch = extraIds.slice(i, i + concurrency);

        const batchResults = await Promise.all(
          batch.map(async extraId => {
            try {
              const result = await this.continuityTracker.validateContinuity(
                extraId,
                {
                  scene_id: sceneId,
                  time_of_day: 'afternoon',
                  location: 'urban',
                  indoor: false
                }
              );
              operation.completed++;
              return result;
            } catch (error) {
              operation.failed++;
              operation.errors.push(
                `Failed to sync continuity for ${extraId}: ${error}`
              );
              return null;
            }
          })
        );

        results.push(
          ...(batchResults.filter(r => r !== null) as ValidationResult[])
        );

        operation.progress = Math.round(
          (operation.completed / operation.total) * 100
        );

        if (progressCallback) {
          progressCallback(operation);
        }
      }

      operation.results = results;
      operation.status = 'completed';
    } catch (error) {
      operation.status = 'failed';
      operation.errors.push(String(error));
    } finally {
      operation.endTime = new Date().toISOString();
    }

    return operation;
  }

  // Validate consistency for entire graph
  async bulkValidateConsistency(
    nodeIds: string[],
    options: BulkOperationOptions = {}
  ): Promise<BulkOperation> {
    const operation = this.createOperation('validate', nodeIds.length);
    const { concurrency = 10, progressCallback } = options;

    operation.status = 'running';
    operation.startTime = new Date().toISOString();

    try {
      const results: ValidationSummary[] = [];

      for (let i = 0; i < nodeIds.length; i += concurrency) {
        const batch = nodeIds.slice(i, i + concurrency);

        const batchResults = await Promise.all(
          batch.map(async nodeId => {
            try {
              // Simulate validation
              await this.simulateDelay(50);
              const valid = Math.random() > 0.2;
              const issues = valid ? [] : ['Sample consistency issue'];

              operation.completed++;
              return { id: nodeId, valid, issues };
            } catch (error) {
              operation.failed++;
              operation.errors.push(`Failed to validate ${nodeId}: ${error}`);
              return { id: nodeId, valid: false, issues: [String(error)] };
            }
          })
        );

        results.push(...batchResults);

        operation.progress = Math.round(
          (operation.completed / operation.total) * 100
        );

        if (progressCallback) {
          progressCallback(operation);
        }
      }

      operation.results = results;
      operation.status = 'completed';
    } catch (error) {
      operation.status = 'failed';
      operation.errors.push(String(error));
    } finally {
      operation.endTime = new Date().toISOString();
    }

    return operation;
  }

  // Bulk index for similarity search
  async bulkIndex(
    assets: Array<{ id: string; text: string; metadata: SegmentMetadata }>,
    options: BulkOperationOptions = {}
  ): Promise<BulkOperation> {
    const operation = this.createOperation('index', assets.length);
    const { progressCallback } = options;

    operation.status = 'running';
    operation.startTime = new Date().toISOString();

    try {
      await this.similarityEngine.bulkIndex(assets);
      operation.completed = assets.length;
      operation.progress = 100;
      operation.status = 'completed';

      if (progressCallback) {
        progressCallback(operation);
      }
    } catch (error) {
      operation.status = 'failed';
      operation.errors.push(String(error));
    } finally {
      operation.endTime = new Date().toISOString();
    }

    return operation;
  }

  // Parse natural language query
  parseNaturalLanguageQuery(query: string): NaturalLanguageQuery {
    const parsed: NaturalLanguageQuery = {
      query,
      parsed: {
        conditions: [],
        keywords: [],
        errors: []
      }
    };

    const lowerQuery = query.toLowerCase();

    // Parse location conditions
    if (lowerQuery.includes('urban') || lowerQuery.includes('city')) {
      parsed.parsed!.conditions.push({
        field: 'location',
        operator: 'equals',
        value: 'urban'
      });
    } else if (lowerQuery.includes('desert')) {
      parsed.parsed!.conditions.push({
        field: 'location',
        operator: 'equals',
        value: 'desert'
      });
    }

    // Parse mood conditions
    if (lowerQuery.includes('panicked') || lowerQuery.includes('frantic')) {
      parsed.parsed!.conditions.push({
        field: 'mood',
        operator: 'equals',
        value: 'frantic'
      });
    }

    // Parse intensity conditions
    if (
      lowerQuery.includes('high intensity') ||
      lowerQuery.includes('intense')
    ) {
      parsed.parsed!.conditions.push({
        field: 'intensity',
        operator: 'greater',
        value: 7
      });
    }

    // Parse prop/item conditions
    const withoutMatch = lowerQuery.match(/without\s+(\w+)/);
    if (withoutMatch) {
      parsed.parsed!.conditions.push({
        field: 'items',
        operator: 'contains',
        value: `!${withoutMatch[1]}` // Negation
      });
    }

    // Extract remaining keywords
    const stopWords = new Set([
      'in',
      'at',
      'the',
      'all',
      'find',
      'show',
      'get',
      'with',
      'without'
    ]);
    const words = query
      .split(/\s+/)
      .filter(word => !stopWords.has(word.toLowerCase()) && word.length > 2);
    parsed.parsed!.keywords = words;

    return parsed;
  }

  // Execute natural language search
  async executeNaturalLanguageSearch(
    query: string,
    items: Array<{ id: string; metadata?: SegmentMetadata }>
  ): Promise<Array<{ id: string; score: number }>> {
    const parsed = this.parseNaturalLanguageQuery(query);
    const results: SearchResult[] = [];

    for (const item of items) {
      if (!item.metadata) continue;

      let score = 0;
      let maxScore = 0;

      // Check conditions
      for (const condition of parsed.parsed!.conditions) {
        maxScore++;

        switch (condition.field) {
          case 'location':
            if (item.metadata.location === condition.value) score++;
            break;
          case 'mood':
            if (item.metadata.mood === condition.value) score++;
            break;
          case 'intensity':
            if (
              condition.operator === 'greater' &&
              item.metadata.intensity &&
              item.metadata.intensity > condition.value
            ) {
              score++;
            }
            break;
          case 'items':
            // Handle negation for "without"
            if (condition.value.startsWith('!')) {
              const itemToExclude = condition.value.substring(1);
              if (!item.metadata.tags?.includes(itemToExclude)) {
                score++;
              }
            }
            break;
        }
      }

      // Check keywords
      for (const keyword of parsed.parsed!.keywords) {
        const lowerKeyword = keyword.toLowerCase();
        if (
          item.metadata.subject?.toLowerCase().includes(lowerKeyword) ||
          item.metadata.action?.toLowerCase().includes(lowerKeyword) ||
          item.metadata.tags?.some(tag =>
            tag.toLowerCase().includes(lowerKeyword)
          )
        ) {
          score += 0.5;
          maxScore += 0.5;
        }
      }

      if (maxScore > 0) {
        results.push({ id: item.id, score: score / maxScore });
      }
    }

    return results.sort((a, b) => b.score - a.score);
  }

  // Cancel an operation
  cancelOperation(operationId: string): boolean {
    const controller = this.abortControllers.get(operationId);
    if (controller) {
      controller.abort();
      return true;
    }
    return false;
  }

  // Get operation status
  getOperation(operationId: string): BulkOperation | undefined {
    return this.operations.get(operationId);
  }

  // Get all operations
  getAllOperations(): BulkOperation[] {
    return Array.from(this.operations.values());
  }

  // Clear completed operations
  clearCompletedOperations(): void {
    for (const [id, operation] of this.operations.entries()) {
      if (operation.status === 'completed' || operation.status === 'failed') {
        this.operations.delete(id);
      }
    }
  }

  // Private helper methods

  private createOperation(
    type: BulkOperation['type'],
    total: number
  ): BulkOperation {
    const operation: BulkOperation = {
      id: `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      status: 'pending',
      progress: 0,
      total,
      completed: 0,
      failed: 0,
      errors: []
    };

    this.operations.set(operation.id, operation);
    return operation;
  }

  private simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
