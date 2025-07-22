/**
 * Retry Mechanism Demo Service - Epic 17
 * Task: E17-1753114396828-35CAE6 - Implement retry mechanism
 * 
 * Demonstrates comprehensive usage of the retry mechanism utilities
 * across different types of operations and failure scenarios.
 */

import { RetryUtils, RetryPatterns, retryableDatabase, retryableHttp, RetryError } from '../utils/RetryUtils';

export class RetryDemoService {
  /**
   * Example 1: Database operation with custom retry configuration
   */
  @retryableDatabase({ 
    maxAttempts: 5, 
    baseDelay: 200,
    onAttempt: (attempt, error) => {
      console.log(`Database operation attempt ${attempt} failed: ${error.message}`);
    }
  })
  async performDatabaseOperation(): Promise<{ success: boolean; data: any }> {
    // Simulate a database operation that might fail
    const shouldFail = Math.random() < 0.3;
    
    if (shouldFail) {
      throw new Error('Database connection timeout');
    }
    
    return { success: true, data: { id: 123, value: 'test' } };
  }

  /**
   * Example 2: HTTP API call with retry
   */
  @retryableHttp({ 
    maxAttempts: 4,
    baseDelay: 1000,
    maxDelay: 8000
  })
  async callExternalAPI(url: string): Promise<any> {
    // Simulate HTTP call that might fail with server errors
    const shouldFail = Math.random() < 0.4;
    
    if (shouldFail) {
      const error = new Error('Service temporarily unavailable') as any;
      error.status = 503;
      throw error;
    }
    
    return { data: 'API response data', timestamp: new Date() };
  }

  /**
   * Example 3: Manual retry with custom logic
   */
  async processLogAnalysisWithRetry(sessionId: string): Promise<void> {
    const result = await RetryUtils.executeWithResult(
      async () => {
        return this.performLogAnalysis(sessionId);
      },
      {
        maxAttempts: 3,
        baseDelay: 2000,
        retryableErrors: [
          /timeout/i,
          /processing.*error/i,
          /resource.*busy/i
        ],
        onAttempt: (attempt, error) => {
          console.warn(`Log analysis attempt ${attempt} failed for session ${sessionId}: ${error.message}`);
        },
        onSuccess: (attempt, result) => {
          console.log(`Log analysis succeeded on attempt ${attempt} for session ${sessionId}`);
        }
      }
    );

    if (!result.success) {
      console.error(`Log analysis failed after ${result.attempts} attempts:`, result.error);
      throw result.error;
    }

    console.log(`Log analysis completed successfully in ${result.totalTime}ms after ${result.attempts} attempts`);
  }

  /**
   * Example 4: File operation with retry
   */
  async exportLogsToFile(logData: any[], filename: string): Promise<string> {
    return RetryPatterns.fileOperation(async () => {
      // Simulate file operation that might fail due to file system issues
      const shouldFail = Math.random() < 0.2;
      
      if (shouldFail) {
        throw new Error('EBUSY: resource busy or locked');
      }
      
      // Simulate file writing
      const filepath = `/logs/${filename}`;
      console.log(`Writing ${logData.length} log entries to ${filepath}`);
      
      return filepath;
    });
  }

  /**
   * Example 5: Circuit breaker pattern with retry
   */
  async sendCriticalAlert(alertData: any): Promise<void> {
    return RetryUtils.executeWithCircuitBreaker(
      async () => {
        return this.sendNotificationToExternalService(alertData);
      },
      'critical-alert-service',
      {
        maxAttempts: 3,
        baseDelay: 1000,
        retryableErrors: [500, 502, 503, 504, /timeout/i],
        onAttempt: (attempt, error) => {
          console.error(`Critical alert sending failed (attempt ${attempt}):`, error.message);
        }
      }
    );
  }

  /**
   * Example 6: Combining retry with transaction rollback
   */
  async performComplexDatabaseTransaction(): Promise<void> {
    const transaction = await this.beginTransaction();
    
    try {
      // Use retry for each step of the transaction
      await RetryUtils.executeDatabase(async () => {
        await this.insertLogEntry(transaction);
      });

      await RetryUtils.executeDatabase(async () => {
        await this.updateLogMetrics(transaction);
      });

      await RetryUtils.executeDatabase(async () => {
        await this.createLogAlert(transaction);
      });

      await transaction.commit();
      
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Transaction failed after retries: ${error.message}`);
    }
  }

  /**
   * Example 7: Graceful degradation with retry
   */
  async getLogAnalytics(startDate: Date, endDate: Date): Promise<any> {
    try {
      // Try primary analytics service first
      return await RetryPatterns.apiCall(
        () => this.getPrimaryAnalytics(startDate, endDate),
        'primary-analytics'
      );
    } catch (primaryError) {
      console.warn('Primary analytics service failed, trying fallback:', primaryError.message);
      
      try {
        // Fallback to secondary service
        return await RetryPatterns.apiCall(
          () => this.getSecondaryAnalytics(startDate, endDate),
          'secondary-analytics'
        );
      } catch (secondaryError) {
        console.warn('Secondary analytics service failed, using cached data:', secondaryError.message);
        
        // Final fallback to cached data
        return this.getCachedAnalytics(startDate, endDate);
      }
    }
  }

  /**
   * Example 8: Batch processing with retry and progress tracking
   */
  async processBatchLogs(logs: any[], batchSize: number = 100): Promise<void> {
    const batches = this.chunkArray(logs, batchSize);
    let processed = 0;
    const failed = [];

    for (const [index, batch] of batches.entries()) {
      try {
        await RetryUtils.execute(
          async () => {
            await this.processBatch(batch);
          },
          {
            maxAttempts: 2,
            baseDelay: 1000,
            onAttempt: (attempt) => {
              console.log(`Processing batch ${index + 1}/${batches.length}, attempt ${attempt}`);
            }
          }
        );
        
        processed += batch.length;
        console.log(`Progress: ${processed}/${logs.length} logs processed`);
        
      } catch (error) {
        console.error(`Batch ${index + 1} failed permanently:`, error.message);
        failed.push({ batchIndex: index, error: error.message, logs: batch });
      }
    }

    if (failed.length > 0) {
      console.warn(`${failed.length} batches failed permanently. Consider manual processing.`);
    }

    console.log(`Batch processing completed: ${processed}/${logs.length} logs processed successfully`);
  }

  // ==========================================
  // HELPER METHODS (Simulated Operations)
  // ==========================================

  private async performLogAnalysis(sessionId: string): Promise<void> {
    const shouldFail = Math.random() < 0.3;
    if (shouldFail) {
      throw new Error('Log analysis processing error');
    }
    console.log(`Log analysis completed for session: ${sessionId}`);
  }

  private async sendNotificationToExternalService(alertData: any): Promise<void> {
    const shouldFail = Math.random() < 0.4;
    if (shouldFail) {
      const error = new Error('External notification service unavailable') as any;
      error.status = 503;
      throw error;
    }
    console.log('Critical alert sent successfully');
  }

  private async beginTransaction(): Promise<any> {
    return {
      commit: async () => console.log('Transaction committed'),
      rollback: async () => console.log('Transaction rolled back')
    };
  }

  private async insertLogEntry(transaction: any): Promise<void> {
    // Simulate database insert that might fail
    if (Math.random() < 0.1) {
      throw new Error('Database deadlock detected');
    }
  }

  private async updateLogMetrics(transaction: any): Promise<void> {
    // Simulate metrics update that might fail
    if (Math.random() < 0.1) {
      throw new Error('Lock timeout exceeded');
    }
  }

  private async createLogAlert(transaction: any): Promise<void> {
    // Simulate alert creation that might fail
    if (Math.random() < 0.1) {
      throw new Error('Connection lost during alert creation');
    }
  }

  private async getPrimaryAnalytics(startDate: Date, endDate: Date): Promise<any> {
    if (Math.random() < 0.5) {
      throw new Error('Primary analytics service timeout');
    }
    return { source: 'primary', data: { logs: 1000, errors: 50 } };
  }

  private async getSecondaryAnalytics(startDate: Date, endDate: Date): Promise<any> {
    if (Math.random() < 0.3) {
      throw new Error('Secondary analytics service overloaded');
    }
    return { source: 'secondary', data: { logs: 950, errors: 48 } };
  }

  private getCachedAnalytics(startDate: Date, endDate: Date): any {
    return { source: 'cache', data: { logs: 900, errors: 45 }, cached: true };
  }

  private async processBatch(logs: any[]): Promise<void> {
    // Simulate batch processing that might fail
    if (Math.random() < 0.2) {
      throw new Error('Batch processing failed due to resource constraints');
    }
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}

/**
 * Example usage and testing
 */
export async function demonstrateRetryMechanisms(): Promise<void> {
  const demoService = new RetryDemoService();

  console.log('\n=== Retry Mechanism Demonstration ===\n');

  // Example 1: Database operation with retry
  try {
    console.log('1. Testing database operation with retry...');
    const result = await demoService.performDatabaseOperation();
    console.log('✓ Database operation succeeded:', result);
  } catch (error) {
    console.log('✗ Database operation failed:', error.message);
  }

  // Example 2: HTTP API call with retry
  try {
    console.log('\n2. Testing HTTP API call with retry...');
    const apiResult = await demoService.callExternalAPI('https://api.example.com/data');
    console.log('✓ API call succeeded:', apiResult);
  } catch (error) {
    console.log('✗ API call failed:', error.message);
  }

  // Example 3: Log analysis with detailed retry result
  try {
    console.log('\n3. Testing log analysis with retry...');
    await demoService.processLogAnalysisWithRetry('session-123');
    console.log('✓ Log analysis completed');
  } catch (error) {
    console.log('✗ Log analysis failed:', error.message);
  }

  // Example 4: File operation with retry
  try {
    console.log('\n4. Testing file operation with retry...');
    const filepath = await demoService.exportLogsToFile([{id: 1}, {id: 2}], 'test-logs.json');
    console.log('✓ File operation succeeded:', filepath);
  } catch (error) {
    console.log('✗ File operation failed:', error.message);
  }

  // Example 5: Critical alert with circuit breaker
  try {
    console.log('\n5. Testing critical alert with circuit breaker...');
    await demoService.sendCriticalAlert({ severity: 'high', message: 'System failure detected' });
    console.log('✓ Critical alert sent');
  } catch (error) {
    console.log('✗ Critical alert failed:', error.message);
  }

  // Example 6: Graceful degradation
  try {
    console.log('\n6. Testing graceful degradation with retry...');
    const analytics = await demoService.getLogAnalytics(new Date('2024-01-01'), new Date());
    console.log('✓ Analytics retrieved:', analytics);
  } catch (error) {
    console.log('✗ Analytics failed:', error.message);
  }

  console.log('\n=== Retry Mechanism Demonstration Complete ===\n');
}