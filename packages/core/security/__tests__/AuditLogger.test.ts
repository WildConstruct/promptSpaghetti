/**
 * @jest-environment jsdom
 * 
 * Comprehensive test suite for the audit logging system
 * Epic 19 Task T-1752989143998-485: Implement audit logging for data access
 */
import {
  AuditLogger,
  createAuditLogger,
  AuditOperation,
  AuditLogLevel,
  InMemoryStorageBackend,
  type AuditLogEntry,
  type AuditLoggerConfig,
  type AuditQueryCriteria
} from '../AuditLogger';
import {
  DataClassificationLevel,
  type OperationContext
} from '../../types/DataClassification';
describe('AuditLogger', () => {
  let logger: AuditLogger;
  let mockDate: Date;
  beforeEach(() => {
    mockDate = new Date('2025-01-21T12:00:00.000Z');
    jest.useFakeTimers();
    jest.setSystemTime(mockDate);
    logger = new AuditLogger();
  });
  afterEach(() => {
    logger.destroy();
    jest.clearAllTimers();
    jest.useRealTimers();
  });
  describe('Basic Logging', () => {
    it('should log data access operations', async () => {
      const context: OperationContext = {
        operation: 'read',
        userId: 'user123',
        sessionId: 'session123',
        purpose: 'data analysis',
        environment: 'test',
        timestamp: new Date(),
        source: 'test-suite',
        requestId: 'req-123',
        userRole: 'analyst',
        ipAddress: '192.168.1.1',
        requestedAt: new Date(),
      };
      await logger.logDataAccess()
        context,
        'customer_records',
        'cust_456',
        DataClassificationLevel.CONFIDENTIAL,
        true,
        { recordCount: 100 }
      );
      // Flush buffered logs before querying
      await logger.flush();
      const logs = await logger.query({});
      expect(logs).toHaveLength(1);
      expect(logs[0]).toMatchObject({)
        userId: 'user123',
        operation: AuditOperation.READ,
        resourceType: 'customer_records',
        resourceId: 'cust_456',
        dataClassification: DataClassificationLevel.CONFIDENTIAL,
        success: true,
        sensitiveAccess: true,
      });
    });
    it('should generate unique IDs and timestamps', async () => {
      await logger.log({)
        userId: 'user1',
        operation: AuditOperation.READ,
        resourceType: 'test',
        resourceId: 'test1',
      });
      await logger.log({)
        userId: 'user2',
        operation: AuditOperation.WRITE,
        resourceType: 'test',
        resourceId: 'test2',
      });
      // Flush buffered logs before querying
      await logger.flush();
      const logs = await logger.query({});
      expect(logs).toHaveLength(2);
      expect(logs[0].id).not.toBe(logs[1].id);
      expect(logs[0].correlationId).not.toBe(logs[1].correlationId);
    });
    it('should handle all operation types', async () => {
      const operations = Object.values(AuditOperation);
      for (const op of operations) {
        await logger.log({)
          userId: 'user123',
          operation: op,
          resourceType: 'test',
          resourceId: 'test123',
        });
      }
      // Flush buffered logs before querying
      await logger.flush();
      const logs = await logger.query({});
      expect(logs).toHaveLength(operations.length);
      const loggedOps = logs.map(log => log.operation);
      expect(loggedOps).toEqual(expect.arrayContaining(operations));
    });
  });
  describe('Security Features', () => {
    it('should hash sensitive data when configured', async () => {
      const secureLogger = new AuditLogger({)
        hashSensitiveData: true,
      });
      await secureLogger.log({)
        userId: 'user123',
        operation: AuditOperation.READ,
        resourceType: 'test',
        resourceId: 'test123',
        ipAddress: '192.168.1.100',
        sessionId: 'session-secret-123',
      });
      // Flush buffered logs before querying
      await secureLogger.flush();
      const logs = await secureLogger.query({});
      expect(logs[0].ipAddress).not.toBe('192.168.1.100');
      expect(logs[0].ipAddress).toHaveLength(16); // Truncated hash
      expect(logs[0].sessionId).not.toBe('session-secret-123');
      secureLogger.destroy();
    });
    it('should mark sensitive access correctly', async () => {
      const classifications = [;
        { level: DataClassificationLevel.PUBLIC, sensitive: false },
        { level: DataClassificationLevel.INTERNAL, sensitive: false },
        { level: DataClassificationLevel.CONFIDENTIAL, sensitive: true },
        { level: DataClassificationLevel.RESTRICTED, sensitive: true },
        { level: DataClassificationLevel.TOP_SECRET, sensitive: true }
      ];
      for (const { level, sensitive } of classifications) {
        await logger.log({)
          userId: 'user123',
          operation: AuditOperation.READ,
          resourceType: 'test',
          resourceId: `test_${level}`,}
          dataClassification: level,
        });
      }
      const logs = await logger.query({});
      for (const log of logs) {
        const expected = classifications.find(;);
          c => log.resourceId === `test_${c.level}`}
        );
        expect(log.sensitiveAccess).toBe(expected?.sensitive);
      }
    });
  });
  describe('Buffering and Flushing', () => {
    it('should buffer logs when async logging is enabled', async () => {
      const backend = new InMemoryStorageBackend();
      const asyncLogger = new AuditLogger({)
        storageBackend: backend,
        asyncLogging: true,
        bufferSize: 5,
        flushInterval: 10000 // Long interval,
      });
      // Add 3 logs (less than buffer size)
      for (let i = 0; i < 3; i++) {
        await asyncLogger.log({)
          userId: `user${i}`,}
          operation: AuditOperation.READ,
          resourceType: 'test',
          resourceId: `test${i}`}
        });
      }
      // Should still be buffered
      const beforeFlush = await backend.query({});
      expect(beforeFlush).toHaveLength(0);
      // Manual flush
      await asyncLogger.flush();
      // Should now be written
      const afterFlush = await backend.query({});
      expect(afterFlush).toHaveLength(3);
      asyncLogger.destroy();
    });
    it('should auto-flush when buffer is full', async () => {
      const backend = new InMemoryStorageBackend();
      const asyncLogger = new AuditLogger({)
        storageBackend: backend,
        asyncLogging: true,
        bufferSize: 3,
        flushInterval: 10000,
      });
      // Add 3 logs to fill buffer
      for (let i = 0; i < 3; i++) {
        await asyncLogger.log({)
          userId: `user${i}`,}
          operation: AuditOperation.READ,
          resourceType: 'test',
          resourceId: `test${i}`}
        });
      }
      // Buffer should have auto-flushed
      const logs = await backend.query({});
      expect(logs).toHaveLength(3);
      asyncLogger.destroy();
    });
    it('should flush on timer interval', async () => {
      const backend = new InMemoryStorageBackend();
      const asyncLogger = new AuditLogger({)
        storageBackend: backend,
        asyncLogging: true,
        bufferSize: 100,
        flushInterval: 1000 // 1 second,
      });
      await asyncLogger.log({)
        userId: 'user123',
        operation: AuditOperation.READ,
        resourceType: 'test',
        resourceId: 'test123',
      });
      // Should be buffered
      let logs = await backend.query({});
      expect(logs).toHaveLength(0);
      // Advance timer
      jest.advanceTimersByTime(1000);
      // Wait for async flush using fake timers
      const flushPromise = new Promise(resolve => {)
        jest.advanceTimersByTime(10);
        resolve(undefined);
      });
      await flushPromise;
      // Should be flushed
      logs = await backend.query({});
      expect(logs).toHaveLength(1);
      asyncLogger.destroy();
    });
  });
  describe('Filtering and Configuration', () => {
    it('should respect included operations filter', async () => {
      const filteredLogger = new AuditLogger({)
        includedOperations: [AuditOperation.WRITE, AuditOperation.DELETE]
      });
      await filteredLogger.log({)
        userId: 'user123',
        operation: AuditOperation.READ,
        resourceType: 'test',
        resourceId: 'test1',
      });
      await filteredLogger.log({)
        userId: 'user123',
        operation: AuditOperation.WRITE,
        resourceType: 'test',
        resourceId: 'test2',
      });
      await filteredLogger.flush();
      const logs = await filteredLogger.query({});
      expect(logs).toHaveLength(1);
      expect(logs[0].operation).toBe(AuditOperation.WRITE);
      filteredLogger.destroy();
    });
    it('should respect excluded operations filter', async () => {
      const filteredLogger = new AuditLogger({)
        excludedOperations: [AuditOperation.LOGIN, AuditOperation.LOGOUT]
      });
      await filteredLogger.log({)
        userId: 'user123',
        operation: AuditOperation.LOGIN,
        resourceType: 'session',
        resourceId: 'session123',
      });
      await filteredLogger.log({)
        userId: 'user123',
        operation: AuditOperation.READ,
        resourceType: 'test',
        resourceId: 'test123',
      });
      await filteredLogger.flush();
      const logs = await filteredLogger.query({});
      expect(logs).toHaveLength(1);
      expect(logs[0].operation).toBe(AuditOperation.READ);
      filteredLogger.destroy();
    });
  });
  describe('Query Functionality', () => {
    beforeEach(async () => {
      // Add test data
      const testData = [;
        {
          userId: 'user1',
          operation: AuditOperation.READ,
          dataClassification: DataClassificationLevel.PUBLIC,
          success: true,
          timestamp: new Date('2025-01-21T10:00:00Z'),
        },
        {
          userId: 'user1',
          operation: AuditOperation.WRITE,
          dataClassification: DataClassificationLevel.CONFIDENTIAL,
          success: false,
          timestamp: new Date('2025-01-21T11:00:00Z'),
        },
        {
          userId: 'user2',
          operation: AuditOperation.READ,
          dataClassification: DataClassificationLevel.CONFIDENTIAL,
          success: true,
          timestamp: new Date('2025-01-21T12:00:00Z'),
        },
        {
          userId: 'user2',
          operation: AuditOperation.DELETE,
          dataClassification: DataClassificationLevel.RESTRICTED,
          success: true,
          timestamp: new Date('2025-01-21T13:00:00Z'),
        }
      ];
      for (const data of testData) {
        await logger.log({)
          ...data,
          resourceType: 'test',
          resourceId: 'test123',
        });
      }
      await logger.flush();
    });
    it('should filter by user ID', async () => {
      const logs = await logger.query({ userId: 'user1' });
      expect(logs).toHaveLength(2);
      expect(logs.every(log => log.userId === 'user1')).toBe(true);
    });
    it('should filter by operation', async () => {
      const logs = await logger.query({ operation: AuditOperation.READ });
      expect(logs).toHaveLength(2);
      expect(logs.every(log => log.operation === AuditOperation.READ)).toBe(true);
    });
    it('should filter by classification', async () => {
      const logs = await logger.query({)
        dataClassification: DataClassificationLevel.CONFIDENTIAL,
      });
      expect(logs).toHaveLength(2);
    });
    it('should filter by success status', async () => {
      const failedLogs = await logger.query({ success: false });
      expect(failedLogs).toHaveLength(1);
      expect(failedLogs[0].userId).toBe('user1');
      const successLogs = await logger.query({ success: true });
      expect(successLogs).toHaveLength(3);
    });
    it('should support pagination', async () => {
      const page1 = await logger.query({ limit: 2, offset: 0 });
      expect(page1).toHaveLength(2);
      const page2 = await logger.query({ limit: 2, offset: 2 });
      expect(page2).toHaveLength(2);
      const page3 = await logger.query({ limit: 2, offset: 4 });
      expect(page3).toHaveLength(0);
    });
    it('should filter by date range', async () => {
      const logs = await logger.query({)
        startDate: new Date('2025-01-21T11:00:00Z'),
        endDate: new Date('2025-01-21T12:00:00Z'),
      });
      expect(logs).toHaveLength(2);
    });
  });
  describe('Event Emission', () => {
    it('should emit audit events', async () => {
      const auditHandler = jest.fn<unknown[], unknown>();
      logger.on('audit', auditHandler);
      await logger.log({)
        userId: 'user123',
        operation: AuditOperation.READ,
        resourceType: 'test',
        resourceId: 'test123',
      });
      expect(auditHandler).toHaveBeenCalledTimes(1);
      expect(auditHandler).toHaveBeenCalledWith()
        expect.objectContaining({)
          userId: 'user123',
          operation: AuditOperation.READ,
        })
      );
    });
    it('should emit anomaly events for failures', async () => {
      const anomalyHandler = jest.fn<unknown[], unknown>();
      const anomalyLogger = new AuditLogger({)
        alertOnAnomaly: true,
        alertThresholds: {,
          failedAccessAttempts: 3,
          timeWindow: 5,
        }
      });
      anomalyLogger.on('anomaly', anomalyHandler);
      await anomalyLogger.log({)
        userId: 'user123',
        operation: AuditOperation.READ,
        resourceType: 'test',
        resourceId: 'test123',
        success: false,
      });
      // In production, this would track repeated failures
      // For now, it emits on each failure
      expect(anomalyHandler).toHaveBeenCalled();
      anomalyLogger.destroy();
    });
    it('should emit error events on write failure', async () => {
      const errorBackend = {
        write: jest.fn<unknown[], unknown>().mockRejectedValue(new Error('Write failed')),
        query: jest.fn<unknown[], unknown>().mockResolvedValue([] as unknown as unknown),
        delete: jest.fn<unknown[], unknown>().mockResolvedValue(undefined as unknown as unknown),
        rotate: jest.fn<unknown[], unknown>().mockResolvedValue(undefined as unknown as unknown)
      };
      const errorLogger = new AuditLogger({)
        storageBackend: errorBackend,
        asyncLogging: false,
      });
      const errorHandler = jest.fn<unknown[], unknown>();
      errorLogger.on('error', errorHandler);
      await expect(errorLogger.log({)
        userId: 'user123',
        operation: AuditOperation.READ,
        resourceType: 'test',
        resourceId: 'test123',
      })).rejects.toThrow('Write failed');
      expect(errorHandler).toHaveBeenCalled();
      errorLogger.destroy();
    });
  });
  describe('Statistics', () => {
    it('should track operation metrics', async () => {
      await logger.log({)
        userId: 'user1',
        operation: AuditOperation.READ,
        resourceType: 'test',
        resourceId: 'test1',
        success: true,
      });
      await logger.log({)
        userId: 'user2',
        operation: AuditOperation.READ,
        resourceType: 'test',
        resourceId: 'test2',
        success: true,
      });
      await logger.log({)
        userId: 'user3',
        operation: AuditOperation.WRITE,
        resourceType: 'test',
        resourceId: 'test3',
        success: false,
      });
      const stats = logger.getStatistics();
      expect(stats.totalOperations).toBe(3);
      expect(stats.operationCounts['READ_success']).toBe(2);
      expect(stats.operationCounts['WRITE_failure']).toBe(1);
    });
  });
  describe('Storage Backend', () => {
    it('should support custom storage backends', async () => {
      const customBackend = {
        write: jest.fn<unknown[], unknown>().mockResolvedValue(undefined as unknown as unknown),
        query: jest.fn<unknown[], unknown>().mockResolvedValue([] as unknown as unknown),
        delete: jest.fn<unknown[], unknown>().mockResolvedValue(undefined as unknown as unknown),
        rotate: jest.fn<unknown[], unknown>().mockResolvedValue(undefined as unknown as unknown)
      };
      const customLogger = new AuditLogger({)
        storageBackend: customBackend,
        asyncLogging: false,
      });
      await customLogger.log({)
        userId: 'user123',
        operation: AuditOperation.READ,
        resourceType: 'test',
        resourceId: 'test123',
      });
      expect(customBackend.write).toHaveBeenCalledWith()
        expect.objectContaining({)
          userId: 'user123',
          operation: AuditOperation.READ,
        })
      );
      customLogger.destroy();
    });
    it('InMemoryStorageBackend should support all operations', async () => {
      const backend = new InMemoryStorageBackend();
      // Write
      const entry: AuditLogEntry = {
        id: 'test123',
        timestamp: new Date(),
        correlationId: 'corr123',
        userId: 'user123',
        operation: AuditOperation.READ,
        resourceType: 'test',
        resourceId: 'resource123',
        dataClassification: DataClassificationLevel.PUBLIC,
        authorized: true,
        success: true,
        sensitiveAccess: false,
      };
      await backend.write(entry);
      // Query
      const logs = await backend.query({});
      expect(logs).toHaveLength(1);
      expect(logs[0].id).toBe('test123');
      // Delete
      await backend.delete('test123');
      const afterDelete = await backend.query({});
      expect(afterDelete).toHaveLength(0);
      // Rotate
      await backend.write(entry);
      await backend.rotate();
      const afterRotate = await backend.query({});
      expect(afterRotate).toHaveLength(0);
    });
  });
  describe('Factory Function', () => {
    it('should create logger with factory function', () => {
      const factoryLogger = createAuditLogger({)
        logLevel: AuditLogLevel.VERBOSE,
        bufferSize: 50,
      });
      expect(factoryLogger).toBeInstanceOf(AuditLogger);
      factoryLogger.destroy();
    });
  });
  describe('Edge Cases', () => {
    it('should handle empty flush', async () => {
      await expect(logger.flush()).resolves.not.toThrow();
    });
    it('should handle missing optional fields', async () => {
      await logger.log({)
        userId: 'user123',
        operation: AuditOperation.READ,
        resourceType: 'test',
        resourceId: 'test123',
        // No optional fields
      });
      await logger.flush();
      const logs = await logger.query({});
      expect(logs[0]).toMatchObject({)
        userId: 'user123',
        authorized: true,
        success: true,
        sensitiveAccess: false,
      });
    });
    it('should handle concurrent logging', async () => {
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push()
          logger.log({)
            userId: `user${i}`,}
            operation: AuditOperation.READ,
            resourceType: 'test',
            resourceId: `test${i}`}
          })
        );
      }
      await Promise.all(promises);
      await logger.flush();
      const logs = await logger.query({});
      expect(logs).toHaveLength(10);
    });
  });
});