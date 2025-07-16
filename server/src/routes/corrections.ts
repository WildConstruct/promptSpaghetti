import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { CorrectionsDAO } from '../database/corrections-dao';
import { ExportService } from '../database/export-service';
import { 
  CreateCorrectionRuleSchema, 
  UpdateCorrectionRuleSchema,
  CreateCorrectionRuleInput,
  UpdateCorrectionRuleInput 
} from '../database/models';

// Request schemas
const GetRulesQuerySchema = z.object({
  includeInactive: z.string().optional().transform(val => val === 'true'),
  search: z.string().optional(),
});

const RuleIdParamsSchema = z.object({
  id: z.string().transform(val => parseInt(val, 10)),
});

const ReorderRulesSchema = z.object({
  ruleIds: z.array(z.number().int().positive()),
});

const ImportRulesSchema = z.object({
  rules: z.array(z.any()),
  userId: z.number().int().positive().optional().default(1),
});

const StatsQuerySchema = z.object({
  days: z.string().optional().transform(val => parseInt(val || '30', 10)),
});

const ExportQuerySchema = z.object({
  format: z.enum(['json', 'yaml', 'csv']).optional().default('json'),
  name: z.string().optional(),
  description: z.string().optional(),
  includeInactive: z.string().optional().transform(val => val === 'true'),
  includeStatistics: z.string().optional().transform(val => val === 'true'),
  ruleIds: z.string().optional().transform(val => val ? val.split(',').map(id => parseInt(id, 10)) : undefined),
});

const ImportSchema = z.object({
  filename: z.string(),
  content: z.string(),
  overwrite: z.boolean().optional().default(false),
  merge: z.boolean().optional().default(false),
  skipDuplicates: z.boolean().optional().default(true),
});

const CreateCorrectionSetSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  version: z.string().optional().default('1.0.0'),
  isPublic: z.boolean().optional().default(false),
  ruleIds: z.array(z.number().int().positive()),
});

// Type definitions
interface GetRulesQuery {
  includeInactive?: boolean;
  search?: string;
}

interface RuleIdParams {
  id: number;
}

interface ReorderRulesBody {
  ruleIds: number[];
}

interface ImportRulesBody {
  rules: any[];
  userId?: number;
}

interface StatsQuery {
  days?: number;
}

interface ExportQuery {
  format?: 'json' | 'yaml' | 'csv';
  name?: string;
  description?: string;
  includeInactive?: boolean;
  includeStatistics?: boolean;
  ruleIds?: number[];
}

interface ImportBody {
  filename: string;
  content: string;
  overwrite?: boolean;
  merge?: boolean;
  skipDuplicates?: boolean;
}

interface CreateCorrectionSetBody {
  name: string;
  description?: string;
  version?: string;
  isPublic?: boolean;
  ruleIds: number[];
}

/**
 * Corrections API Routes
 */
export async function correctionsRoutes(fastify: FastifyInstance) {
  const dao = new CorrectionsDAO();
  const exportService = new ExportService();

  // ========== RULE MANAGEMENT ==========

  /**
   * GET /api/corrections/rules
   * Get all correction rules for a user
   */
  fastify.get<{ Querystring: GetRulesQuery }>('/rules', async (request, reply) => {
    try {
      const { includeInactive = false, search } = GetRulesQuerySchema.parse(request.query);
      const userId = 1; // TODO: Get from authentication
      
      let rules;
      if (search) {
        rules = dao.searchRules(search, userId);
      } else {
        rules = dao.getRulesByUser(userId, includeInactive);
      }
      
      return { success: true, data: rules };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ 
        success: false, 
        error: 'Failed to fetch correction rules' 
      });
    }
  });

  /**
   * GET /api/corrections/rules/:id
   * Get a specific correction rule by ID
   */
  fastify.get<{ Params: RuleIdParams }>('/rules/:id', async (request, reply) => {
    try {
      const { id } = RuleIdParamsSchema.parse(request.params);
      const rule = dao.getRuleById(id);
      
      if (!rule) {
        return reply.status(404).send({ 
          success: false, 
          error: 'Correction rule not found' 
        });
      }
      
      return { success: true, data: rule };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ 
        success: false, 
        error: 'Failed to fetch correction rule' 
      });
    }
  });

  /**
   * POST /api/corrections/rules
   * Create a new correction rule
   */
  fastify.post<{ Body: CreateCorrectionRuleInput }>('/rules', async (request, reply) => {
    try {
      const ruleData = CreateCorrectionRuleSchema.parse(request.body);
      const rule = dao.createRule(ruleData);
      
      return reply.status(201).send({ success: true, data: rule });
    } catch (error) {
      fastify.log.error(error);
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ 
          success: false, 
          error: 'Invalid rule data',
          details: error.errors 
        });
      }
      return reply.status(500).send({ 
        success: false, 
        error: 'Failed to create correction rule' 
      });
    }
  });

  /**
   * PUT /api/corrections/rules/:id
   * Update a correction rule
   */
  fastify.put<{ Params: RuleIdParams; Body: UpdateCorrectionRuleInput }>('/rules/:id', async (request, reply) => {
    try {
      const { id } = RuleIdParamsSchema.parse(request.params);
      const updateData = UpdateCorrectionRuleSchema.parse(request.body);
      const userId = 1; // TODO: Get from authentication
      
      const rule = dao.updateRule(id, updateData, userId);
      
      if (!rule) {
        return reply.status(404).send({ 
          success: false, 
          error: 'Correction rule not found' 
        });
      }
      
      return { success: true, data: rule };
    } catch (error) {
      fastify.log.error(error);
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ 
          success: false, 
          error: 'Invalid update data',
          details: error.errors 
        });
      }
      return reply.status(500).send({ 
        success: false, 
        error: 'Failed to update correction rule' 
      });
    }
  });

  /**
   * DELETE /api/corrections/rules/:id
   * Delete a correction rule
   */
  fastify.delete<{ Params: RuleIdParams }>('/rules/:id', async (request, reply) => {
    try {
      const { id } = RuleIdParamsSchema.parse(request.params);
      const userId = 1; // TODO: Get from authentication
      
      const deleted = dao.deleteRule(id, userId);
      
      if (!deleted) {
        return reply.status(404).send({ 
          success: false, 
          error: 'Correction rule not found' 
        });
      }
      
      return { success: true, message: 'Correction rule deleted successfully' };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ 
        success: false, 
        error: 'Failed to delete correction rule' 
      });
    }
  });

  /**
   * POST /api/corrections/rules/:id/toggle
   * Toggle rule active state
   */
  fastify.post<{ Params: RuleIdParams }>('/rules/:id/toggle', async (request, reply) => {
    try {
      const { id } = RuleIdParamsSchema.parse(request.params);
      const userId = 1; // TODO: Get from authentication
      
      const rule = dao.toggleRuleActive(id, userId);
      
      if (!rule) {
        return reply.status(404).send({ 
          success: false, 
          error: 'Correction rule not found' 
        });
      }
      
      return { success: true, data: rule };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ 
        success: false, 
        error: 'Failed to toggle correction rule' 
      });
    }
  });

  /**
   * POST /api/corrections/rules/reorder
   * Reorder correction rules
   */
  fastify.post<{ Body: ReorderRulesBody }>('/rules/reorder', async (request, reply) => {
    try {
      const { ruleIds } = ReorderRulesSchema.parse(request.body);
      const userId = 1; // TODO: Get from authentication
      
      const success = dao.reorderRules(ruleIds, userId);
      
      if (!success) {
        return reply.status(400).send({ 
          success: false, 
          error: 'Failed to reorder correction rules' 
        });
      }
      
      return { success: true, message: 'Rules reordered successfully' };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ 
        success: false, 
        error: 'Failed to reorder correction rules' 
      });
    }
  });

  // ========== RULE HISTORY ==========

  /**
   * GET /api/corrections/rules/:id/history
   * Get history for a specific rule
   */
  fastify.get<{ Params: RuleIdParams }>('/rules/:id/history', async (request, reply) => {
    try {
      const { id } = RuleIdParamsSchema.parse(request.params);
      const history = dao.getRuleHistory(id);
      
      return { success: true, data: history };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ 
        success: false, 
        error: 'Failed to fetch rule history' 
      });
    }
  });

  // ========== STATISTICS ==========

  /**
   * GET /api/corrections/stats
   * Get performance metrics for all rules
   */
  fastify.get<{ Querystring: StatsQuery }>('/stats', async (request, reply) => {
    try {
      const { days = 30 } = StatsQuerySchema.parse(request.query);
      const userId = 1; // TODO: Get from authentication
      
      const metrics = dao.getPerformanceMetrics(userId, days);
      
      return { success: true, data: metrics };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ 
        success: false, 
        error: 'Failed to fetch performance metrics' 
      });
    }
  });

  /**
   * GET /api/corrections/rules/:id/stats
   * Get statistics for a specific rule
   */
  fastify.get<{ Params: RuleIdParams; Querystring: StatsQuery }>('/rules/:id/stats', async (request, reply) => {
    try {
      const { id } = RuleIdParamsSchema.parse(request.params);
      const { days = 30 } = StatsQuerySchema.parse(request.query);
      
      const stats = dao.getRuleStats(id, days);
      
      return { success: true, data: stats };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ 
        success: false, 
        error: 'Failed to fetch rule statistics' 
      });
    }
  });

  // ========== IMPORT/EXPORT ==========

  /**
   * POST /api/corrections/import/localStorage
   * Import rules from localStorage format (legacy)
   */
  fastify.post<{ Body: ImportRulesBody }>('/import/localStorage', async (request, reply) => {
    try {
      const { rules, userId = 1 } = ImportRulesSchema.parse(request.body);
      const importedCount = dao.importFromLocalStorage(rules, userId);
      
      return { 
        success: true, 
        message: `Successfully imported ${importedCount} correction rules`,
        importedCount 
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ 
        success: false, 
        error: 'Failed to import correction rules' 
      });
    }
  });

  /**
   * GET /api/corrections/export/localStorage
   * Export rules to localStorage format (legacy)
   */
  fastify.get('/export/localStorage', async (request, reply) => {
    try {
      const userId = 1; // TODO: Get from authentication
      const rules = dao.exportToLocalStorage(userId);
      
      return { success: true, data: rules };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ 
        success: false, 
        error: 'Failed to export correction rules' 
      });
    }
  });

  /**
   * GET /api/corrections/export
   * Export rules in standard format
   */
  fastify.get<{ Querystring: ExportQuery }>('/export', async (request, reply) => {
    try {
      const options = ExportQuerySchema.parse(request.query);
      const userId = 1; // TODO: Get from authentication
      
      const result = await exportService.exportRules(userId, options.format, {
        name: options.name,
        description: options.description,
        includeInactive: options.includeInactive,
        includeStatistics: options.includeStatistics,
        ruleIds: options.ruleIds,
      });
      
      if (!result.success) {
        return reply.status(400).send({ 
          success: false, 
          error: result.error 
        });
      }
      
      // Set appropriate headers for download
      reply.header('Content-Type', result.mimeType);
      reply.header('Content-Disposition', `attachment; filename="${result.filename}"`);
      
      return result.data;
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ 
        success: false, 
        error: 'Failed to export correction rules' 
      });
    }
  });

  /**
   * POST /api/corrections/import
   * Import rules from standard format
   */
  fastify.post<{ Body: ImportBody }>('/import', async (request, reply) => {
    try {
      const importData = ImportSchema.parse(request.body);
      const userId = 1; // TODO: Get from authentication
      
      const result = await exportService.importRules(
        userId, 
        importData.filename, 
        importData.content, 
        {
          overwrite: importData.overwrite,
          merge: importData.merge,
          skipDuplicates: importData.skipDuplicates,
        }
      );
      
      if (!result.success) {
        return reply.status(400).send({ 
          success: false, 
          errors: result.errors 
        });
      }
      
      return { 
        success: true, 
        message: `Successfully imported ${result.importedCount} correction rules`,
        importedCount: result.importedCount,
        skippedCount: result.skippedCount,
        warnings: result.warnings
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ 
        success: false, 
        error: 'Failed to import correction rules' 
      });
    }
  });

  // ========== CORRECTION SETS ==========

  /**
   * GET /api/corrections/sets
   * Get available correction sets
   */
  fastify.get('/sets', async (request, reply) => {
    try {
      const userId = 1; // TODO: Get from authentication
      const sets = exportService.getCorrectionSets(userId);
      
      return { success: true, data: sets };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ 
        success: false, 
        error: 'Failed to fetch correction sets' 
      });
    }
  });

  /**
   * POST /api/corrections/sets
   * Create a new correction set
   */
  fastify.post<{ Body: CreateCorrectionSetBody }>('/sets', async (request, reply) => {
    try {
      const setData = CreateCorrectionSetSchema.parse(request.body);
      const userId = 1; // TODO: Get from authentication
      
      const result = await exportService.createCorrectionSet(
        userId,
        setData.ruleIds,
        {
          name: setData.name,
          description: setData.description,
          version: setData.version,
          isPublic: setData.isPublic,
        }
      );
      
      if (!result.success) {
        return reply.status(400).send({ 
          success: false, 
          error: result.error 
        });
      }
      
      return reply.status(201).send({ 
        success: true, 
        message: 'Correction set created successfully',
        setId: result.setId
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ 
        success: false, 
        error: 'Failed to create correction set' 
      });
    }
  });

  /**
   * GET /api/corrections/sets/:id
   * Get a specific correction set
   */
  fastify.get<{ Params: { id: string } }>('/sets/:id', async (request, reply) => {
    try {
      const setId = parseInt(request.params.id, 10);
      const userId = 1; // TODO: Get from authentication
      
      const set = exportService.getCorrectionSetById(setId, userId);
      
      if (!set) {
        return reply.status(404).send({ 
          success: false, 
          error: 'Correction set not found' 
        });
      }
      
      return { success: true, data: set };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ 
        success: false, 
        error: 'Failed to fetch correction set' 
      });
    }
  });

  /**
   * GET /api/corrections/sets/:id/download
   * Download a correction set
   */
  fastify.get<{ Params: { id: string } }>('/sets/:id/download', async (request, reply) => {
    try {
      const setId = parseInt(request.params.id, 10);
      const userId = 1; // TODO: Get from authentication
      
      const result = await exportService.downloadCorrectionSet(setId, userId);
      
      if (!result.success) {
        return reply.status(404).send({ 
          success: false, 
          error: result.error 
        });
      }
      
      // Set appropriate headers for download
      reply.header('Content-Type', result.mimeType);
      reply.header('Content-Disposition', `attachment; filename="${result.filename}"`);
      
      return result.data;
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ 
        success: false, 
        error: 'Failed to download correction set' 
      });
    }
  });

  /**
   * DELETE /api/corrections/sets/:id
   * Delete a correction set
   */
  fastify.delete<{ Params: { id: string } }>('/sets/:id', async (request, reply) => {
    try {
      const setId = parseInt(request.params.id, 10);
      const userId = 1; // TODO: Get from authentication
      
      const deleted = exportService.deleteCorrectionSet(setId, userId);
      
      if (!deleted) {
        return reply.status(404).send({ 
          success: false, 
          error: 'Correction set not found or access denied' 
        });
      }
      
      return { success: true, message: 'Correction set deleted successfully' };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ 
        success: false, 
        error: 'Failed to delete correction set' 
      });
    }
  });

  /**
   * DELETE /api/corrections/rules
   * Clear all rules for a user
   */
  fastify.delete('/rules', async (request, reply) => {
    try {
      const userId = 1; // TODO: Get from authentication
      const deletedCount = dao.clearAllRules(userId);
      
      return { 
        success: true, 
        message: `Successfully deleted ${deletedCount} correction rules`,
        deletedCount 
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ 
        success: false, 
        error: 'Failed to clear correction rules' 
      });
    }
  });

  // ========== RULE EXECUTION ==========

  /**
   * POST /api/corrections/apply
   * Apply corrections to text and record statistics
   */
  fastify.post<{ Body: { text: string; ruleIds?: number[] } }>('/apply', async (request, reply) => {
    try {
      const { text, ruleIds } = request.body;
      const userId = 1; // TODO: Get from authentication
      
      if (!text || typeof text !== 'string') {
        return reply.status(400).send({ 
          success: false, 
          error: 'Text is required' 
        });
      }
      
      // Get rules to apply
      const rules = ruleIds 
        ? ruleIds.map(id => dao.getRuleById(id)).filter(Boolean)
        : dao.getRulesByUser(userId, false);
      
      let correctedText = text;
      const appliedRules: any[] = [];
      
      // Apply rules in priority order
      for (const rule of rules.sort((a, b) => a.priority - b.priority)) {
        const startTime = Date.now();
        const originalText = correctedText;
        
        try {
          if (rule.is_regex) {
            const regex = new RegExp(rule.find_pattern, 'g');
            correctedText = correctedText.replace(regex, rule.replace_with);
          } else {
            correctedText = correctedText.replace(
              new RegExp(escapeRegExp(rule.find_pattern), 'g'),
              rule.replace_with
            );
          }
          
          const executionTime = Date.now() - startTime;
          const changed = originalText !== correctedText;
          
          if (changed) {
            appliedRules.push({
              id: rule.id,
              name: rule.name,
              executionTime,
              charactersChanged: Math.abs(correctedText.length - originalText.length),
            });
            
            // Record enhanced statistics
            dao.recordRuleUsage(rule.id, executionTime, originalText.length, true, {
              charactersAfter: correctedText.length,
            });
          }
        } catch (error) {
          // Record error statistics
          dao.recordRuleUsage(rule.id, Date.now() - startTime, originalText.length, false);
          
          fastify.log.warn(`Rule ${rule.name} failed to apply:`, error);
        }
      }
      
      return { 
        success: true, 
        data: {
          originalText: text,
          correctedText,
          appliedRules,
          changed: text !== correctedText,
          totalExecutionTime: appliedRules.reduce((sum, r) => sum + r.executionTime, 0),
        }
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ 
        success: false, 
        error: 'Failed to apply corrections' 
      });
    }
  });

  // ========== ENHANCED STATISTICS ENDPOINTS ==========

  /**
   * POST /api/corrections/rules/:id/feedback
   * Record user feedback for a rule
   */
  fastify.post<{ Params: RuleIdParams; Body: { rating: number; comment?: string } }>('/rules/:id/feedback', async (request, reply) => {
    try {
      const { id } = RuleIdParamsSchema.parse(request.params);
      const { rating, comment } = request.body;
      
      if (typeof rating !== 'number' || rating < 1 || rating > 5) {
        return reply.status(400).send({ 
          success: false, 
          error: 'Rating must be a number between 1 and 5' 
        });
      }
      
      const success = dao.recordUserFeedback(id, rating, comment);
      
      if (!success) {
        return reply.status(404).send({ 
          success: false, 
          error: 'Rule not found or no recent usage to rate' 
        });
      }
      
      return { success: true, message: 'Feedback recorded successfully' };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ 
        success: false, 
        error: 'Failed to record feedback' 
      });
    }
  });

  /**
   * POST /api/corrections/rules/:id/false-positive
   * Mark a rule application as false positive
   */
  fastify.post<{ Params: RuleIdParams }>('/rules/:id/false-positive', async (request, reply) => {
    try {
      const { id } = RuleIdParamsSchema.parse(request.params);
      
      const success = dao.markFalsePositive(id);
      
      if (!success) {
        return reply.status(404).send({ 
          success: false, 
          error: 'Rule not found or no recent usage to mark' 
        });
      }
      
      return { success: true, message: 'False positive recorded successfully' };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ 
        success: false, 
        error: 'Failed to record false positive' 
      });
    }
  });

  /**
   * GET /api/corrections/recommendations
   * Get rule effectiveness recommendations
   */
  fastify.get('/recommendations', async (request, reply) => {
    try {
      const userId = 1; // TODO: Get from authentication
      
      const recommendations = dao.getRuleRecommendations(userId);
      
      return { success: true, data: recommendations };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ 
        success: false, 
        error: 'Failed to get recommendations' 
      });
    }
  });
}

// Helper function to escape regex special characters
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}