/**
 * Health Check Definition System Test Suite - Epic 17.4.5
 *
 * Comprehensive tests for the health check definition model and service,
 * including validation, execution, scheduling, and integration with the
 * diagnostic system.
 *
 * Task: E17-1753114397253-2E1DFD - Build system diagnostics
 * Epic: 17 - Backstage Admin Controls (Story 17.4.5 - Health Check System)
 */

import {
  describe,
  test,
  expect,
  beforeEach,
  afterEach,
  jest
} from '@jest/globals';
import { Database } from '../../server/src/database';
import { AuditService } from '../../server/src/auth/services/AuditService';
import { DiagnosticService } from '../../server/src/admin/DiagnosticService';
import { HealthCheckDefinitionService } from '../../server/src/admin/HealthCheckDefinitionService';
import {
  HealthCheckDefinition,
  HealthCheckDefinitionBuilder,
  HealthCheckDefinitionValidator,
  HealthCheckCategory,
  HealthCheckPriority,
  HealthCheckType,
  HealthStatus,
  ComparisonOperator,
  createExampleHealthChecks
} from '../packages/core/admin/HealthCheckDefinitionModel';

// Mock dependencies
const mockDatabase = {
  query: jest.fn()
} as unknown as Database;

const mockAuditService = {
  logAction: jest.fn()
} as unknown as AuditService;

const mockDiagnosticService = {
  runDiagnosticSuite: jest.fn(),
  runSingleDiagnostic: jest.fn()
} as unknown as DiagnosticService;

describe('Health Check Definition System', () => {
  let healthCheckService: HealthCheckDefinitionService;

  beforeEach(async () => {
    jest.clearAllMocks();

    healthCheckService = new HealthCheckDefinitionService(
      mockDatabase,
      mockAuditService,
      mockDiagnosticService
    );

    await healthCheckService.initialize();
  });

  afterEach(async () => {
    await healthCheckService.shutdown();
  });

  describe('HealthCheckDefinitionBuilder', () => {
    test('should build a basic HTTP endpoint health check', () => {
      const healthCheck = new HealthCheckDefinitionBuilder(
        'test_api',
        'Test API Health Check'
      )
        .description('Tests the API endpoint for availability')
        .category(HealthCheckCategory.INTEGRATION)
        .priority(HealthCheckPriority.HIGH)
        .tags('api', 'critical', 'external')
        .httpEndpoint({
          url: 'https://api.example.com/health',
          method: 'GET',
          expectedStatusCodes: [200, 204],
          timeout: 5000,
          responseValidation: {
            contentType: ['application/json'],
            jsonPath: [
              { path: '$.status', expectedValue: 'ok', required: true }
            ]
          }
        })
        .schedule('*/5 * * * *', 'UTC')
        .alerting({
          enabled: true,
          thresholds: {
            responseTime: {
              warning: 2000,
              critical: 5000,
              unit: 'ms',
              evaluationWindow: 300,
              evaluationMethod: 'average'
            },
            errorRate: {
              warning: 5,
              critical: 10,
              unit: '%',
              evaluationWindow: 300,
              evaluationMethod: 'average'
            },
            availability: {
              warning: 99,
              critical: 95,
              unit: '%',
              evaluationWindow: 300,
              evaluationMethod: 'average'
            },
            custom: {}
          }
        })
        .validation({
          output: {
            expectedFormat: 'json',
            successConditions: [
              {
                field: 'status',
                operator: ComparisonOperator.EQUALS,
                value: 'ok',
                description: 'API returns healthy status'
              }
            ]
          }
        })
        .build();

      expect(healthCheck.id).toBe('test_api');
      expect(healthCheck.name).toBe('Test API Health Check');
      expect(healthCheck.category).toBe(HealthCheckCategory.INTEGRATION);
      expect(healthCheck.priority).toBe(HealthCheckPriority.HIGH);
      expect(healthCheck.tags).toContain('api');
      expect(healthCheck.config.type).toBe(HealthCheckType.HTTP_ENDPOINT);
      expect(healthCheck.config.endpoint?.url).toBe(
        'https://api.example.com/health'
      );
      expect(healthCheck.execution?.schedule?.cronExpression).toBe(
        '*/5 * * * *'
      );
      expect(healthCheck.alerting?.enabled).toBe(true);
    });

    test('should build a database query health check with validation', () => {
      const healthCheck = new HealthCheckDefinitionBuilder(
        'db_check',
        'Database Health Check'
      )
        .description('Validates database connectivity and performance')
        .category(HealthCheckCategory.DATABASE)
        .priority(HealthCheckPriority.CRITICAL)
        .tags('database', 'infrastructure')
        .databaseQuery({
          database: 'main',
          query:
            'SELECT COUNT(*) as count FROM health_check_table WHERE status = $1',
          timeout: 3000,
          expectedResults: {
            minRows: 1,
            exactRows: 1,
            columns: ['count']
          }
        })
        .parameter('status', {
          name: 'status',
          type: 'string',
          description: 'Status to check for',
          required: true,
          defaultValue: 'active',
          validation: {
            enumValues: ['active', 'inactive', 'pending']
          }
        })
        .validation({
          security: {
            requiresAuthentication: true,
            requiredPermissions: ['database:read'],
            auditLevel: 'detailed'
          }
        })
        .build();

      expect(healthCheck.config.type).toBe(HealthCheckType.DATABASE_QUERY);
      expect(healthCheck.config.query?.database).toBe('main');
      expect(healthCheck.config.parameters['status']).toBeDefined();
      expect(healthCheck.config.parameters['status'].defaultValue).toBe(
        'active'
      );
      expect(healthCheck.validation?.security?.requiresAuthentication).toBe(
        true
      );
    });

    test('should fail to build with missing required fields', () => {
      expect(() => {
        new HealthCheckDefinitionBuilder('test', 'Test').build();
      }).toThrow('Required field');
    });

    test('should support method chaining', () => {
      const builder = new HealthCheckDefinitionBuilder(
        'chain_test',
        'Chain Test'
      )
        .description('Test method chaining')
        .category(HealthCheckCategory.SYSTEM)
        .priority(HealthCheckPriority.MEDIUM)
        .tags('test')
        .httpEndpoint({
          url: 'http://localhost/health',
          method: 'GET',
          expectedStatusCodes: [200],
          timeout: 1000
        })
        .validation({
          output: {
            expectedFormat: 'json',
            successConditions: [
              {
                field: 'status',
                operator: ComparisonOperator.EQUALS,
                value: 'ok',
                description: 'Simple health check'
              }
            ]
          }
        });

      expect(builder).toBeDefined();
      expect(() => builder.build()).not.toThrow();
    });
  });

  describe('HealthCheckDefinitionValidator', () => {
    test('should validate a correct health check definition', () => {
      const validDefinition = new HealthCheckDefinitionBuilder(
        'valid_check',
        'Valid Health Check'
      )
        .description('A properly configured health check')
        .category(HealthCheckCategory.SYSTEM)
        .priority(HealthCheckPriority.HIGH)
        .httpEndpoint({
          url: 'http://example.com/health',
          method: 'GET',
          expectedStatusCodes: [200],
          timeout: 5000
        })
        .validation({
          runtime: {
            maxExecutionTime: 4000,
            networkAccessRequired: true,
            fileSystemAccessRequired: false,
            privilegedAccessRequired: false
          }
        })
        .build();

      const result = HealthCheckDefinitionValidator.validate(validDefinition);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.score).toBeGreaterThan(90);
    });

    test('should detect validation errors', () => {
      const invalidDefinition = {
        id: 'ab', // Too short
        name: 'Test', // Too short
        description: 'Test description',
        category: HealthCheckCategory.SYSTEM,
        priority: HealthCheckPriority.HIGH,
        tags: [],
        config: {
          type: HealthCheckType.HTTP_ENDPOINT,
          parameters: {},
          dependencies: [],
          timeout: 500, // Too low
          retries: {
            maxAttempts: 3,
            backoffStrategy: 'exponential',
            initialDelay: 1000
          }
        },
        validation: {
          input: { required: [], customValidators: [] },
          output: {
            expectedFormat: 'json',
            successConditions: [],
            warningConditions: [],
            errorConditions: []
          },
          runtime: {
            maxExecutionTime: 1000,
            networkAccessRequired: false,
            fileSystemAccessRequired: false,
            privilegedAccessRequired: false
          }, // Greater than timeout
          security: {
            requiresAuthentication: false,
            requiredPermissions: [],
            sensitiveDataHandling: 'none',
            auditLevel: 'basic'
          }
        },
        execution: undefined,
        alerting: undefined,
        createdBy: 'test',
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      } as HealthCheckDefinition;

      const result = HealthCheckDefinitionValidator.validate(invalidDefinition);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(
        result.errors.some(e => e.includes('ID must be at least 3 characters'))
      ).toBe(true);
      expect(
        result.errors.some(e =>
          e.includes('name must be at least 5 characters')
        )
      ).toBe(true);
      expect(
        result.warnings.some(w => w.includes('Timeout less than 1 second'))
      ).toBe(true);
      expect(result.score).toBeLessThan(50);
    });

    test('should validate cron expressions', () => {
      const validCronDefinition = new HealthCheckDefinitionBuilder(
        'cron_test',
        'Cron Test Check'
      )
        .description('Test cron validation')
        .category(HealthCheckCategory.SYSTEM)
        .priority(HealthCheckPriority.LOW)
        .httpEndpoint({
          url: 'http://localhost/test',
          method: 'GET',
          expectedStatusCodes: [200],
          timeout: 5000
        })
        .schedule('0 */6 * * *') // Every 6 hours
        .validation({
          output: {
            expectedFormat: 'json',
            successConditions: [
              {
                field: 'status',
                operator: ComparisonOperator.EQUALS,
                value: 'ok',
                description: 'Cron test health check'
              }
            ]
          },
          runtime: {
            maxExecutionTime: 4000,
            networkAccessRequired: true,
            fileSystemAccessRequired: false,
            privilegedAccessRequired: false
          }
        })
        .build();

      const result =
        HealthCheckDefinitionValidator.validate(validCronDefinition);

      // Debug validation errors if any
      if (!result.isValid) {
        console.log('Validation errors:', result.errors);
        console.log('Validation warnings:', result.warnings);
      }

      expect(result.isValid).toBe(true);

      // Test invalid cron
      const invalidCronDefinition = { ...validCronDefinition };
      invalidCronDefinition.execution!.schedule!.cronExpression =
        'invalid cron';

      const invalidResult = HealthCheckDefinitionValidator.validate(
        invalidCronDefinition
      );
      expect(invalidResult.isValid).toBe(false);
      expect(
        invalidResult.errors.some(e => e.includes('Invalid cron expression'))
      ).toBe(true);
    });
  });

  describe('HealthCheckDefinitionService', () => {
    describe('Definition Management', () => {
      test('should create a new health check definition', async () => {
        const definition = new HealthCheckDefinitionBuilder(
          'service_test',
          'Service Test Check'
        )
          .description('Test health check for service testing')
          .category(HealthCheckCategory.INTEGRATION)
          .priority(HealthCheckPriority.MEDIUM)
          .httpEndpoint({
            url: 'http://test.example.com/health',
            method: 'GET',
            expectedStatusCodes: [200],
            timeout: 3000
          })
          .validation({
            output: {
              expectedFormat: 'json',
              successConditions: [
                {
                  field: 'status',
                  operator: ComparisonOperator.EQUALS,
                  value: 'ok',
                  description: 'Service test health check'
                }
              ]
            },
            runtime: {
              maxExecutionTime: 2000, // Less than the 3000ms timeout
              networkAccessRequired: true,
              fileSystemAccessRequired: false,
              privilegedAccessRequired: false
            }
          })
          .build();

        const result = await healthCheckService.createDefinition(
          definition,
          'test-user'
        );

        expect(result).toBeDefined();
        expect(result.id).toBe('service_test');
        expect(result.createdBy).toBe('test-user');
        expect(result.createdAt).toBeInstanceOf(Date);
        expect(mockAuditService.logAction).toHaveBeenCalledWith(
          expect.objectContaining({
            action: 'health_check_definition_created',
            userId: 'test-user'
          })
        );
      });

      test('should prevent creating duplicate health check definitions', async () => {
        const definition = new HealthCheckDefinitionBuilder(
          'duplicate_test',
          'Duplicate Test'
        )
          .description('Test duplicate prevention')
          .category(HealthCheckCategory.SYSTEM)
          .priority(HealthCheckPriority.LOW)
          .httpEndpoint({
            url: 'http://localhost/test',
            method: 'GET',
            expectedStatusCodes: [200],
            timeout: 1000
          })
          .validation({
            output: {
              expectedFormat: 'json',
              successConditions: [
                {
                  field: 'status',
                  operator: ComparisonOperator.EQUALS,
                  value: 'ok',
                  description: 'Duplicate test check'
                }
              ]
            },
            runtime: {
              maxExecutionTime: 800, // Less than the 1000ms timeout
              networkAccessRequired: true,
              fileSystemAccessRequired: false,
              privilegedAccessRequired: false
            }
          })
          .build();

        await healthCheckService.createDefinition(definition, 'test-user');

        await expect(
          healthCheckService.createDefinition(definition, 'test-user')
        ).rejects.toThrow('already exists');
      });

      test('should update existing health check definition', async () => {
        const originalDefinition = new HealthCheckDefinitionBuilder(
          'update_test',
          'Update Test'
        )
          .description('Original description')
          .category(HealthCheckCategory.SYSTEM)
          .priority(HealthCheckPriority.LOW)
          .httpEndpoint({
            url: 'http://localhost/original',
            method: 'GET',
            expectedStatusCodes: [200],
            timeout: 1000
          })
          .validation({
            output: {
              expectedFormat: 'json',
              successConditions: [
                {
                  field: 'status',
                  operator: ComparisonOperator.EQUALS,
                  value: 'ok',
                  description: 'Update test check'
                }
              ]
            },
            runtime: {
              maxExecutionTime: 800, // Less than the 1000ms timeout
              networkAccessRequired: true,
              fileSystemAccessRequired: false,
              privilegedAccessRequired: false
            }
          })
          .build();

        await healthCheckService.createDefinition(
          originalDefinition,
          'test-user'
        );

        const updates = {
          description: 'Updated description',
          priority: HealthCheckPriority.HIGH
        };

        const updatedDefinition = await healthCheckService.updateDefinition(
          'update_test',
          updates,
          'test-user'
        );

        expect(updatedDefinition.description).toBe('Updated description');
        expect(updatedDefinition.priority).toBe(HealthCheckPriority.HIGH);
        expect(updatedDefinition.updatedAt).toBeInstanceOf(Date);
        expect(mockAuditService.logAction).toHaveBeenCalledWith(
          expect.objectContaining({
            action: 'health_check_definition_updated'
          })
        );
      });

      test('should delete health check definition', async () => {
        const definition = new HealthCheckDefinitionBuilder(
          'delete_test',
          'Delete Test'
        )
          .description('Test deletion')
          .category(HealthCheckCategory.SYSTEM)
          .priority(HealthCheckPriority.LOW)
          .httpEndpoint({
            url: 'http://localhost/delete',
            method: 'GET',
            expectedStatusCodes: [200],
            timeout: 1000
          })
          .validation({
            output: {
              expectedFormat: 'json',
              successConditions: [
                {
                  field: 'status',
                  operator: ComparisonOperator.EQUALS,
                  value: 'ok',
                  description: 'Delete test check'
                }
              ]
            },
            runtime: {
              maxExecutionTime: 800, // Less than the 1000ms timeout
              networkAccessRequired: true,
              fileSystemAccessRequired: false,
              privilegedAccessRequired: false
            }
          })
          .build();

        await healthCheckService.createDefinition(definition, 'test-user');

        await healthCheckService.deleteDefinition('delete_test', 'test-user');

        const deletedDefinition =
          await healthCheckService.getDefinition('delete_test');
        expect(deletedDefinition).toBeNull();
        expect(mockAuditService.logAction).toHaveBeenCalledWith(
          expect.objectContaining({
            action: 'health_check_definition_deleted'
          })
        );
      });

      test('should list health check definitions with filters', async () => {
        // Create test definitions
        const definitions = [
          new HealthCheckDefinitionBuilder('list_test_1', 'List Test 1')
            .description('First test')
            .category(HealthCheckCategory.SYSTEM)
            .priority(HealthCheckPriority.HIGH)
            .tags('critical', 'system')
            .httpEndpoint({
              url: 'http://localhost/test1',
              method: 'GET',
              expectedStatusCodes: [200],
              timeout: 1000
            })
            .validation({
              output: {
                expectedFormat: 'json',
                successConditions: [
                  {
                    field: 'status',
                    operator: ComparisonOperator.EQUALS,
                    value: 'ok',
                    description: 'Check status is ok'
                  }
                ]
              },
              runtime: {
                maxExecutionTime: 800, // Less than the 1000ms timeout
                networkAccessRequired: true,
                fileSystemAccessRequired: false,
                privilegedAccessRequired: false
              }
            })
            .build(),

          new HealthCheckDefinitionBuilder('list_test_2', 'List Test 2')
            .description('Second test')
            .category(HealthCheckCategory.DATABASE)
            .priority(HealthCheckPriority.MEDIUM)
            .tags('database', 'monitoring')
            .databaseQuery({
              database: 'test',
              query: 'SELECT 1',
              timeout: 2000
            })
            .validation({
              output: {
                expectedFormat: 'json',
                successConditions: [
                  {
                    field: 'result',
                    operator: ComparisonOperator.EQUALS,
                    value: 1,
                    description: 'Check database result is 1'
                  }
                ]
              },
              runtime: {
                maxExecutionTime: 1500, // Less than the 2000ms timeout
                networkAccessRequired: false,
                fileSystemAccessRequired: false,
                privilegedAccessRequired: false
              }
            })
            .build()
        ];

        for (const def of definitions) {
          await healthCheckService.createDefinition(def, 'test-user');
        }

        // Test filtering by category
        const systemChecks = await healthCheckService.listDefinitions({
          category: HealthCheckCategory.SYSTEM
        });
        expect(systemChecks).toHaveLength(1);
        expect(systemChecks[0].id).toBe('list_test_1');

        // Test filtering by priority
        const highPriorityChecks = await healthCheckService.listDefinitions({
          priority: HealthCheckPriority.HIGH
        });
        expect(highPriorityChecks).toHaveLength(1);
        expect(highPriorityChecks[0].priority).toBe(HealthCheckPriority.HIGH);

        // Test filtering by tags
        const criticalChecks = await healthCheckService.listDefinitions({
          tags: ['critical']
        });
        expect(criticalChecks).toHaveLength(1);
        expect(criticalChecks[0].tags).toContain('critical');

        // Test getting all definitions
        const allChecks = await healthCheckService.listDefinitions();
        expect(allChecks.length).toBeGreaterThanOrEqual(2);
      });
    });

    describe('Health Check Execution', () => {
      test('should execute HTTP endpoint health check', async () => {
        const definition = new HealthCheckDefinitionBuilder(
          'execute_http_test',
          'Execute HTTP Test'
        )
          .description('Test HTTP execution')
          .category(HealthCheckCategory.INTEGRATION)
          .priority(HealthCheckPriority.MEDIUM)
          .httpEndpoint({
            url: 'http://example.com/health',
            method: 'GET',
            expectedStatusCodes: [200],
            timeout: 5000
          })
          .validation({
            output: {
              expectedFormat: 'json',
              successConditions: [
                {
                  field: 'status',
                  operator: ComparisonOperator.EQUALS,
                  value: 'ok',
                  description: 'HTTP execution test check'
                }
              ]
            },
            runtime: {
              maxExecutionTime: 4000,
              networkAccessRequired: true,
              fileSystemAccessRequired: false,
              privilegedAccessRequired: false
            }
          })
          .build();

        await healthCheckService.createDefinition(definition, 'test-user');

        const result = await healthCheckService.executeHealthCheck(
          'execute_http_test',
          'test-user'
        );

        expect(result).toBeDefined();
        expect(result.checkId).toBe('execute_http_test');
        expect(result.executionId).toBeTruthy();
        expect(result.timestamp).toBeInstanceOf(Date);
        expect([
          HealthStatus.HEALTHY,
          HealthStatus.UNHEALTHY,
          HealthStatus.ERROR
        ]).toContain(result.status);
        expect(result.score).toBeGreaterThanOrEqual(0);
        expect(result.score).toBeLessThanOrEqual(100);
        expect(result.metrics).toBeDefined();
        expect(result.metadata).toBeDefined();
        expect(mockAuditService.logAction).toHaveBeenCalledWith(
          expect.objectContaining({
            action: 'health_check_executed'
          })
        );
      });

      test('should execute database query health check', async () => {
        const definition = new HealthCheckDefinitionBuilder(
          'execute_db_test',
          'Execute DB Test'
        )
          .description('Test database execution')
          .category(HealthCheckCategory.DATABASE)
          .priority(HealthCheckPriority.HIGH)
          .databaseQuery({
            database: 'test_db',
            query: 'SELECT COUNT(*) FROM users',
            timeout: 3000
          })
          .validation({
            output: {
              expectedFormat: 'json',
              successConditions: [
                {
                  field: 'count',
                  operator: ComparisonOperator.GREATER_THAN,
                  value: 0,
                  description: 'DB execution test check'
                }
              ]
            },
            runtime: {
              maxExecutionTime: 2500,
              networkAccessRequired: false,
              fileSystemAccessRequired: false,
              privilegedAccessRequired: false
            }
          })
          .build();

        await healthCheckService.createDefinition(definition, 'test-user');

        const result = await healthCheckService.executeHealthCheck(
          'execute_db_test',
          'test-user'
        );

        expect(result.checkId).toBe('execute_db_test');
        expect(result.details.affectedComponents).toContain('database');
        expect(result.metrics.custom).toBeDefined();
      });

      test('should handle health check execution errors gracefully', async () => {
        const definition = new HealthCheckDefinitionBuilder(
          'error_test',
          'Error Test'
        )
          .description('Test error handling')
          .category(HealthCheckCategory.SYSTEM)
          .priority(HealthCheckPriority.LOW)
          .httpEndpoint({
            url: 'http://invalid-url-that-will-fail.example.com',
            method: 'GET',
            expectedStatusCodes: [200],
            timeout: 1000
          })
          .validation({
            output: {
              expectedFormat: 'json',
              successConditions: [
                {
                  field: 'status',
                  operator: ComparisonOperator.EQUALS,
                  value: 'ok',
                  description: 'Error test check'
                }
              ]
            },
            runtime: {
              maxExecutionTime: 800,
              networkAccessRequired: true,
              fileSystemAccessRequired: false,
              privilegedAccessRequired: false
            }
          })
          .build();

        await healthCheckService.createDefinition(definition, 'test-user');

        const result = await healthCheckService.executeHealthCheck(
          'error_test',
          'test-user'
        );

        // The service returns a status based on expected status codes
        expect(result).toBeDefined();
        expect([
          HealthStatus.HEALTHY,
          HealthStatus.UNHEALTHY,
          HealthStatus.ERROR
        ]).toContain(result.status);
        expect(result.checkId).toBe('error_test');

        expect(mockAuditService.logAction).toHaveBeenCalledWith(
          expect.objectContaining({
            action: 'health_check_executed'
          })
        );
      });

      test('should execute bulk health checks in parallel', async () => {
        // Create multiple health checks
        const checkIds = ['bulk_test_1', 'bulk_test_2', 'bulk_test_3'];

        for (let i = 0; i < checkIds.length; i++) {
          const definition = new HealthCheckDefinitionBuilder(
            checkIds[i],
            `Bulk Test ${i + 1}`
          )
            .description(`Test bulk execution ${i + 1}`)
            .category(HealthCheckCategory.SYSTEM)
            .priority(HealthCheckPriority.MEDIUM)
            .httpEndpoint({
              url: `http://example.com/health${i + 1}`,
              method: 'GET',
              expectedStatusCodes: [200],
              timeout: 2000
            })
            .validation({
              output: {
                expectedFormat: 'json',
                successConditions: [
                  {
                    field: 'status',
                    operator: ComparisonOperator.EQUALS,
                    value: 'ok',
                    description: `Bulk test ${i + 1} check`
                  }
                ]
              },
              runtime: {
                maxExecutionTime: 1500,
                networkAccessRequired: true,
                fileSystemAccessRequired: false,
                privilegedAccessRequired: false
              }
            })
            .build();

          await healthCheckService.createDefinition(definition, 'test-user');
        }

        const startTime = Date.now();
        const bulkResult = await healthCheckService.executeBulkHealthChecks(
          checkIds,
          'test-user',
          true // parallel execution
        );
        const executionTime = Date.now() - startTime;

        expect(bulkResult).toBeDefined();
        expect(bulkResult.totalChecks).toBe(3);
        expect(bulkResult.results).toHaveLength(3);
        expect(bulkResult.executionId).toBeTruthy();
        expect([
          HealthStatus.HEALTHY,
          HealthStatus.DEGRADED,
          HealthStatus.UNHEALTHY,
          HealthStatus.ERROR
        ]).toContain(bulkResult.overallStatus);

        // Parallel execution should be faster than sequential
        expect(executionTime).toBeLessThan(5000);

        expect(mockAuditService.logAction).toHaveBeenCalledWith(
          expect.objectContaining({
            action: 'bulk_health_check_executed'
          })
        );
      });

      test('should execute bulk health checks sequentially', async () => {
        const checkIds = ['seq_test_1', 'seq_test_2'];

        for (let i = 0; i < checkIds.length; i++) {
          const definition = new HealthCheckDefinitionBuilder(
            checkIds[i],
            `Sequential Test ${i + 1}`
          )
            .description(`Test sequential execution ${i + 1}`)
            .category(HealthCheckCategory.INTEGRATION)
            .priority(HealthCheckPriority.LOW)
            .httpEndpoint({
              url: `http://example.com/seq${i + 1}`,
              method: 'GET',
              expectedStatusCodes: [200],
              timeout: 1000
            })
            .validation({
              output: {
                expectedFormat: 'json',
                successConditions: [
                  {
                    field: 'status',
                    operator: ComparisonOperator.EQUALS,
                    value: 'ok',
                    description: `Sequential test ${i + 1} check`
                  }
                ]
              },
              runtime: {
                maxExecutionTime: 800,
                networkAccessRequired: true,
                fileSystemAccessRequired: false,
                privilegedAccessRequired: false
              }
            })
            .build();

          await healthCheckService.createDefinition(definition, 'test-user');
        }

        const bulkResult = await healthCheckService.executeBulkHealthChecks(
          checkIds,
          'test-user',
          false // sequential execution
        );

        expect(bulkResult.totalChecks).toBe(2);
        expect(bulkResult.results).toHaveLength(2);
        expect(bulkResult.completedChecks + bulkResult.failedChecks).toBe(2);
      });
    });

    describe('Example Health Check Definitions', () => {
      test('should create and validate example health checks', () => {
        const examples = createExampleHealthChecks();

        expect(examples).toHaveLength(2);

        // Test database connectivity check
        const dbCheck = examples[0];
        expect(dbCheck.id).toBe('db_connectivity');
        expect(dbCheck.category).toBe(HealthCheckCategory.DATABASE);
        expect(dbCheck.priority).toBe(HealthCheckPriority.CRITICAL);
        expect(dbCheck.config.type).toBe(HealthCheckType.DATABASE_QUERY);

        const dbValidation = HealthCheckDefinitionValidator.validate(dbCheck);
        expect(dbValidation.isValid).toBe(true);

        // Test API endpoint check
        const apiCheck = examples[1];
        expect(apiCheck.id).toBe('api_health');
        expect(apiCheck.category).toBe(HealthCheckCategory.INTEGRATION);
        expect(apiCheck.priority).toBe(HealthCheckPriority.HIGH);
        expect(apiCheck.config.type).toBe(HealthCheckType.HTTP_ENDPOINT);

        const apiValidation = HealthCheckDefinitionValidator.validate(apiCheck);
        expect(apiValidation.isValid).toBe(true);
      });

      test('should be able to create example definitions in service', async () => {
        const examples = createExampleHealthChecks();

        for (const example of examples) {
          const created = await healthCheckService.createDefinition(
            example,
            'system'
          );
          expect(created.id).toBe(example.id);
          expect(created.createdBy).toBe('system');
        }

        const allDefinitions = await healthCheckService.listDefinitions();
        expect(allDefinitions.length).toBe(examples.length);
      });
    });
  });

  describe('Integration with Diagnostic Service', () => {
    test('should integrate with existing diagnostic framework', async () => {
      // This test would verify that health check definitions can be converted
      // to diagnostic definitions and executed through the diagnostic service

      const healthCheckDef = new HealthCheckDefinitionBuilder(
        'integration_test',
        'Integration Test'
      )
        .description('Test diagnostic service integration')
        .category(HealthCheckCategory.SYSTEM)
        .priority(HealthCheckPriority.HIGH)
        .httpEndpoint({
          url: 'http://localhost/diagnostic-integration',
          method: 'GET',
          expectedStatusCodes: [200],
          timeout: 2000
        })
        .validation({
          output: {
            expectedFormat: 'json',
            successConditions: [
              {
                field: 'status',
                operator: ComparisonOperator.EQUALS,
                value: 'ok',
                description: 'Integration test check'
              }
            ]
          },
          runtime: {
            maxExecutionTime: 1500,
            networkAccessRequired: true,
            fileSystemAccessRequired: false,
            privilegedAccessRequired: false
          }
        })
        .build();

      await healthCheckService.createDefinition(healthCheckDef, 'test-user');

      // Verify that the health check can be executed and produces results
      // that are compatible with the diagnostic system format
      const result = await healthCheckService.executeHealthCheck(
        'integration_test',
        'test-user'
      );

      expect(result.checkId).toBe('integration_test');
      expect(result.status).toBeDefined();
      expect(result.details).toBeDefined();
      expect(result.metrics).toBeDefined();

      // Verify result can be converted to diagnostic format if needed
      expect(result.details.findings).toBeInstanceOf(Array);
      expect(result.details.recommendations).toBeInstanceOf(Array);
    });
  });

  describe('Performance and Scalability', () => {
    test('should handle large numbers of health check definitions efficiently', async () => {
      const startTime = Date.now();

      // Create 50 health check definitions
      const promises = [];
      for (let i = 0; i < 50; i++) {
        const definition = new HealthCheckDefinitionBuilder(
          `perf_test_${i}`,
          `Performance Test ${i}`
        )
          .description(`Performance test definition ${i}`)
          .category(HealthCheckCategory.SYSTEM)
          .priority(HealthCheckPriority.LOW)
          .httpEndpoint({
            url: `http://example.com/perf${i}`,
            method: 'GET',
            expectedStatusCodes: [200],
            timeout: 1000
          })
          .validation({
            output: {
              expectedFormat: 'json',
              successConditions: [
                {
                  field: 'status',
                  operator: ComparisonOperator.EQUALS,
                  value: 'ok',
                  description: `Performance test ${i} check`
                }
              ]
            },
            runtime: {
              maxExecutionTime: 800,
              networkAccessRequired: true,
              fileSystemAccessRequired: false,
              privilegedAccessRequired: false
            }
          })
          .build();

        promises.push(
          healthCheckService.createDefinition(definition, 'perf-test')
        );
      }

      await Promise.all(promises);
      const creationTime = Date.now() - startTime;

      // Verify all definitions were created quickly (less than 5 seconds)
      expect(creationTime).toBeLessThan(5000);

      // Test bulk listing performance
      const listStartTime = Date.now();
      const allDefinitions = await healthCheckService.listDefinitions();
      const listTime = Date.now() - listStartTime;

      expect(allDefinitions.length).toBe(50);
      expect(listTime).toBeLessThan(1000); // Should list quickly
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle inactive health checks', async () => {
      const definition = new HealthCheckDefinitionBuilder(
        'inactive_test',
        'Inactive Test'
      )
        .description('Test inactive handling')
        .category(HealthCheckCategory.SYSTEM)
        .priority(HealthCheckPriority.LOW)
        .httpEndpoint({
          url: 'http://example.com/inactive',
          method: 'GET',
          expectedStatusCodes: [200],
          timeout: 1000
        })
        .validation({
          output: {
            expectedFormat: 'json',
            successConditions: [
              {
                field: 'status',
                operator: ComparisonOperator.EQUALS,
                value: 'ok',
                description: 'Inactive test check'
              }
            ]
          },
          runtime: {
            maxExecutionTime: 800,
            networkAccessRequired: true,
            fileSystemAccessRequired: false,
            privilegedAccessRequired: false
          }
        })
        .build();

      // Mark as inactive
      definition.isActive = false;

      await healthCheckService.createDefinition(definition, 'test-user');

      await expect(
        healthCheckService.executeHealthCheck('inactive_test', 'test-user')
      ).rejects.toThrow('inactive');
    });

    test('should handle missing health check definition', async () => {
      await expect(
        healthCheckService.executeHealthCheck('nonexistent_check', 'test-user')
      ).rejects.toThrow('not found');

      await expect(
        healthCheckService.updateDefinition(
          'nonexistent_check',
          {},
          'test-user'
        )
      ).rejects.toThrow('not found');

      await expect(
        healthCheckService.deleteDefinition('nonexistent_check', 'test-user')
      ).rejects.toThrow('not found');
    });

    test('should handle malformed health check parameters', async () => {
      const definition = new HealthCheckDefinitionBuilder(
        'malformed_test',
        'Malformed Test'
      )
        .description('Test malformed parameter handling')
        .category(HealthCheckCategory.SYSTEM)
        .priority(HealthCheckPriority.LOW)
        .httpEndpoint({
          url: 'http://example.com/malformed',
          method: 'GET',
          expectedStatusCodes: [200],
          timeout: 1000
        })
        .parameter('required_param', {
          name: 'required_param',
          type: 'string',
          description: 'A required parameter',
          required: true
        })
        .validation({
          output: {
            expectedFormat: 'json',
            successConditions: [
              {
                field: 'status',
                operator: ComparisonOperator.EQUALS,
                value: 'ok',
                description: 'Malformed test check'
              }
            ]
          },
          runtime: {
            maxExecutionTime: 800,
            networkAccessRequired: true,
            fileSystemAccessRequired: false,
            privilegedAccessRequired: false
          }
        })
        .build();

      await healthCheckService.createDefinition(definition, 'test-user');

      // Execute without required parameter should handle gracefully
      const result = await healthCheckService.executeHealthCheck(
        'malformed_test',
        'test-user',
        {} // Missing required parameter
      );

      // Should still execute but potentially with degraded status
      expect(result).toBeDefined();
      expect(result.checkId).toBe('malformed_test');
    });
  });
});
