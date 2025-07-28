// Epic 17.5.3 - Transaction-Specific Anomaly Detection Service
import { FastifyInstance } from 'fastify';
import { DatabaseService } from '../database/database.service.js';
import { Transaction } from '../marketplace/transaction.types.js';
// import { PaymentProvider } from '../marketplace/transaction.types.js';

}
export interface TransactionAnomalyPattern {
  patternType: 'velocity' | 'amount' | 'location' | 'time' | 'behavior' | 'payment_method';
  threshold: number;
  timeWindow: string; // e.g., '1h', '24h', '7d'
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  description: string;
}
}

}
export interface TransactionAnomaly {
  id: string;
  transactionId: string;
  userId: string;
  patternType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  evidence: Record<string, any>;
  confidence: number;
  suggestedActions: string[];
  status: 'new' | 'investigating' | 'resolved' | 'false_positive';
  detectedAt: Date;
  investigatedBy?: string;
  investigatedAt?: Date;
  resolution?: string;
}
}

}
export interface FraudRing {
  id: string;
  userIds: string[];
  suspiciousActivities: string[];
  confidence: number;
  totalAmount: number;
  transactionCount: number;
  detectedAt: Date;
  status: 'suspected' | 'confirmed' | 'dismissed';
}
}

export class TransactionAnomalyDetectionService {
  private db: DatabaseService;
  private fastify: FastifyInstance;
  private patterns: TransactionAnomalyPattern[];

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
    this.db = fastify.db;
    this.initializeDefaultPatterns();
  }

  private initializeDefaultPatterns(): void {
    this.patterns = [
      {
        patternType: 'velocity',
        threshold: 5, // More than 5 transactions in timeWindow
        timeWindow: '1h',
        severity: 'high',
        enabled: true,
        description: 'High transaction velocity detected'
  }
      {
        patternType: 'amount',
        threshold: 100000, // Transactions over $1000
        timeWindow: '24h',
        severity: 'medium',
        enabled: true,
        description: 'Unusually high transaction amount'
  }
      {
        patternType: 'amount',
        threshold: 500000, // Transactions over $5000
        timeWindow: '1h',
        severity: 'critical',
        enabled: true,
        description: 'Extremely high transaction amount'
  }
      {
        patternType: 'velocity',
        threshold: 50000, // More than $500 in rapid succession
        timeWindow: '15m',
        severity: 'high',
        enabled: true,
        description: 'High spending velocity detected'
  }
      {
        patternType: 'behavior',
        threshold: 3, // 3+ failed payments before success
        timeWindow: '1h',
        severity: 'medium',
        enabled: true,
        description: 'Suspicious payment behavior pattern'
  }
      {
        patternType: 'payment_method',
        threshold: 5, // Same payment method used by 5+ different users
        timeWindow: '24h',
        severity: 'high',
        enabled: true,
        description: 'Shared payment method across multiple accounts'
      }
    ];
  }

  // =============================================
  // Real-time Anomaly Detection
  // =============================================

  async detectAnomaliesForTransaction(transactionId: string): Promise<TransactionAnomaly[]> {

    const transaction = await this.getTransactionById(transactionId);
    if (!transaction) return [];

    const anomalies: TransactionAnomaly[] = [];

    // Run all enabled detection patterns
    for (const pattern of this.patterns.filter(p => p.enabled)) {
      const anomaly = await this.checkTransactionPattern(transaction, pattern);
      if (anomaly) {
        anomalies.push(anomaly);
      }
    }

    // Save detected anomalies
    for (const anomaly of anomalies) {
      await this.saveTransactionAnomaly(anomaly);
    }

    return anomalies;
  }

  private async checkTransactionPattern(
    transaction: Transaction, 
    pattern: TransactionAnomalyPattern
  ): Promise<TransactionAnomaly | null> {

    switch (pattern.patternType) {
    case 'velocity':
      return await this.checkVelocityAnomaly(transaction, pattern);
    case 'amount':
      return await this.checkAmountAnomaly(transaction, pattern);
    case 'behavior':
      return await this.checkBehaviorAnomaly(transaction, pattern);
    case 'payment_method':
      return await this.checkPaymentMethodAnomaly(transaction, pattern);
    case 'time':
      return await this.checkTimeAnomaly(transaction, pattern);
    default:
      return null;
    }
  }

  private async checkVelocityAnomaly(
    transaction: Transaction, 
    pattern: TransactionAnomalyPattern
  ): Promise<TransactionAnomaly | null> {

    const timeWindowMs = this.parseTimeWindow(pattern.timeWindow);
    const cutoffTime = new Date(new Date(transaction.created_at).getTime() - timeWindowMs);

    if (pattern.threshold < 100) {
      // Count-based velocity check
      const recentTransactions = await this.db.query(`
        SELECT COUNT(*) as count, SUM(amount_cents) as total_amount
        FROM transactions 
        WHERE user_id = ? AND created_at >= ? AND id != ?
      `, [transaction.user_id, cutoffTime.toISOString(), transaction.id]);

      const { count, total_amount } = recentTransactions[0] || { count: 0, total_amount: 0 };

      if (count >= pattern.threshold) {
        return {
          id: crypto.randomUUID(),
          transactionId: transaction.id,
          userId: transaction.user_id,
          patternType: 'velocity_count',
          severity: pattern.severity,
          description: `${pattern.description}: ${count} transactions in ${pattern.timeWindow}`,
          evidence: {
            transactionCount: count,
            totalAmount: total_amount,
            timeWindow: pattern.timeWindow,
            threshold: pattern.threshold
  }
          confidence: Math.min(0.9, 0.5 + (count - pattern.threshold) * 0.1),
          suggestedActions: [
            'Review user account activity',
            'Verify payment methods',
            'Consider temporary transaction limits',
            'Check for account compromise'
          ],
          status: 'new',
          detectedAt: new Date()
        };
      }
    } else {
      // Amount-based velocity check
      const recentAmount = await this.db.query(`
        SELECT SUM(amount_cents) as total_amount, COUNT(*) as count
        FROM transactions 
        WHERE user_id = ? AND created_at >= ? AND id != ?
      `, [transaction.user_id, cutoffTime.toISOString(), transaction.id]);

      const { total_amount, count } = recentAmount[0] || { total_amount: 0, count: 0 };

      if (total_amount >= pattern.threshold) {
        return {
          id: crypto.randomUUID(),
          transactionId: transaction.id,
          userId: transaction.user_id,
          patternType: 'velocity_amount',
          severity: pattern.severity,
          description: `${pattern.description}: $${(total_amount / 100).toFixed(2)} in ${pattern.timeWindow}`,
          evidence: {
            totalAmount: total_amount,
            transactionCount: count,
            timeWindow: pattern.timeWindow,
            threshold: pattern.threshold,
            averageAmount: count > 0 ? total_amount / count : 0
  }
          confidence: Math.min(0.95, 0.6 + (total_amount - pattern.threshold) / pattern.threshold * 0.3),
          suggestedActions: [
            'Verify spending legitimacy',
            'Check for account compromise',
            'Review transaction patterns',
            'Contact customer for verification'
          ],
          status: 'new',
          detectedAt: new Date(};
      }
    }

    return null;
  }

  private async checkAmountAnomaly(
    transaction: Transaction, 
    pattern: TransactionAnomalyPattern
  ): Promise<TransactionAnomaly | null> {

    if (transaction.amount_cents >= pattern.threshold) {
      // Get user's historical spending pattern
      const historicalData = await this.db.query(`
        SELECT 
          AVG(amount_cents) as avg_amount, 
          MAX(amount_cents) as max_amount, 
          STDDEV(amount_cents) as stddev_amount,
          COUNT(*) as count,
          PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY amount_cents) as p95_amount
        FROM transactions 
        WHERE user_id = ? AND status = 'succeeded' AND id != ?
      `, [transaction.user_id, transaction.id]);

      const { avg_amount, max_amount, stddev_amount, count, p95_amount } = historicalData[0] || {
        avg_amount: 0, max_amount: 0, stddev_amount: 0, count: 0, p95_amount: 0
      };

      let confidence = 0.5;
      const description = `${pattern.description}: $${(transaction.amount_cents / 100).toFixed(2)}`;

      // Calculate confidence based on statistical deviation
      if (count > 0 && avg_amount > 0) {
        const deviation = transaction.amount_cents / avg_amount;
        if (deviation > 10) {
          confidence = Math.min(0.95, 0.8 + Math.log10(deviation) * 0.1);
        } else if (stddev_amount > 0) {
          const zScore = (transaction.amount_cents - avg_amount) / stddev_amount;
          confidence = Math.min(0.9, 0.5 + Math.max(0, zScore - 2) * 0.1);
        }
      }

      const suggestedActions = ['Verify transaction legitimacy', 'Contact customer for confirmation'];
      
      if (transaction.amount_cents > (p95_amount || 0) * 3) {
        suggestedActions.push('Consider transaction hold pending verification');
        confidence = Math.max(confidence, 0.8);
      }
      
      if (transaction.amount_cents > 1000000) { // $10k+
        suggestedActions.push('Escalate to senior fraud team');
        confidence = Math.max(confidence, 0.9);
      }

      return {
        id: crypto.randomUUID(),
        transactionId: transaction.id,
        userId: transaction.user_id,
        patternType: 'unusual_amount',
        severity: pattern.severity,
        description,
        evidence: {
          transactionAmount: transaction.amount_cents,
          userAverageAmount: avg_amount,
          userMaxAmount: max_amount,
          userStddevAmount: stddev_amount,
          userTransactionCount: count,
          userP95Amount: p95_amount,
          threshold: pattern.threshold,
          deviationMultiple: avg_amount > 0 ? transaction.amount_cents / avg_amount : 0
  }
        confidence,
        suggestedActions,
        status: 'new',
        detectedAt: new Date(};
    }

    return null;
  }

  private async checkBehaviorAnomaly(
    transaction: Transaction, 
    pattern: TransactionAnomalyPattern
  ): Promise<TransactionAnomaly | null> {

    const timeWindowMs = this.parseTimeWindow(pattern.timeWindow);
    const cutoffTime = new Date(new Date(transaction.created_at).getTime() - timeWindowMs);

    // Check for pattern of failed payments followed by success
    const recentActivity = await this.db.query(`
      SELECT 
        status, 
        COUNT(*) as count,
        MIN(created_at) as first_attempt,
        MAX(created_at) as last_attempt
      FROM transactions 
      WHERE user_id = ? AND created_at >= ?
      GROUP BY status
      ORDER BY count DESC
    `, [transaction.user_id, cutoffTime.toISOString()]);

    const failedCount = recentActivity.find(r => r.status === 'failed')?.count || 0;
    const succeededCount = recentActivity.find(r => r.status === 'succeeded')?.count || 0;

    if (failedCount >= pattern.threshold && succeededCount > 0) {
      // Check if this follows a card testing pattern
      const cardTestingIndicators = await this.checkCardTestingPattern(transaction.user_id, cutoffTime);

      return {
        id: crypto.randomUUID(),
        transactionId: transaction.id,
        userId: transaction.user_id,
        patternType: 'suspicious_behavior',
        severity: cardTestingIndicators.isCardTesting ? 'high' : pattern.severity,
        description: `${pattern.description}: ${failedCount} failed attempts before success`,
        evidence: {
          failedAttempts: failedCount,
          successfulAttempts: succeededCount,
          timeWindow: pattern.timeWindow,
          threshold: pattern.threshold,
          cardTestingIndicators,
          recentActivity: recentActivity
  }
        confidence: Math.min(0.9, 0.6 + failedCount * 0.1),
        suggestedActions: [
          'Review payment methods used',
          'Check for card testing activity',
          'Verify user identity',
          'Consider account security review',
          ...(cardTestingIndicators.isCardTesting ? ['Block payment method immediately'] : [])
        ],
        status: 'new',
        detectedAt: new Date(};
    }

    return null;
  }

  private async checkCardTestingPattern(userId: string, cutoffTime: Date): Promise<{
    isCardTesting: boolean;
    indicators: string[];
  }> {

    const indicators: string[] = [];
    let isCardTesting = false;

    // Check for small amount testing transactions
    const smallAmountTests = await this.db.query(`
      SELECT COUNT(*) as count
      FROM transactions 
      WHERE user_id = ? AND created_at >= ? AND amount_cents <= 100 AND status = 'failed'
    `, [userId, cutoffTime.toISOString()]);

    if (smallAmountTests[0]?.count >= 3) {
      indicators.push('multiple_small_amount_tests');
      isCardTesting = true;
    }

    // Check for multiple different payment methods
    const paymentMethodCount = await this.db.query(`
      SELECT COUNT(DISTINCT pi.payment_method_id) as unique_methods
      FROM transactions t
      JOIN payment_intents pi ON t.payment_intent_id = pi.id
      WHERE t.user_id = ? AND t.created_at >= ?
    `, [userId, cutoffTime.toISOString()]);

    if (paymentMethodCount[0]?.unique_methods >= 3) {
      indicators.push('multiple_payment_methods');
      isCardTesting = true;
    }

    return { isCardTesting, indicators };
  }

  private async checkPaymentMethodAnomaly(
    transaction: Transaction, 
    pattern: TransactionAnomalyPattern
  ): Promise<TransactionAnomaly | null> {

    // Get payment method from payment intent
    const paymentIntentResult = await this.db.query(`
      SELECT payment_method_id
      FROM payment_intents
      WHERE id = ?
    `, [transaction.payment_intent_id]);

    if (paymentIntentResult.length === 0) return null;

    const paymentMethodId = paymentIntentResult[0].payment_method_id;

    // Check how many different users have used this payment method recently
    const timeWindowMs = this.parseTimeWindow(pattern.timeWindow);
    const cutoffTime = new Date(new Date(transaction.created_at).getTime() - timeWindowMs);

    const sharedUsageResult = await this.db.query(`
      SELECT 
        COUNT(DISTINCT t.user_id) as unique_users,
        SUM(t.amount_cents) as total_amount,
        COUNT(t.id) as transaction_count,
        GROUP_CONCAT(DISTINCT t.user_id) as user_ids
      FROM transactions t
      JOIN payment_intents pi ON t.payment_intent_id = pi.id
      WHERE pi.payment_method_id = ? AND t.created_at >= ?
    `, [paymentMethodId, cutoffTime.toISOString()]);

    const { unique_users, total_amount, transaction_count, user_ids } = sharedUsageResult[0] || {
      unique_users: 0, total_amount: 0, transaction_count: 0, user_ids: ''
    };

    if (unique_users >= pattern.threshold) {
      return {
        id: crypto.randomUUID(),
        transactionId: transaction.id,
        userId: transaction.user_id,
        patternType: 'shared_payment_method',
        severity: pattern.severity,
        description: `${pattern.description}: Used by ${unique_users} different users`,
        evidence: {
          paymentMethodId,
          uniqueUsers: unique_users,
          totalAmount: total_amount,
          transactionCount: transaction_count,
          timeWindow: pattern.timeWindow,
          threshold: pattern.threshold,
          affectedUserIds: user_ids.split(',').filter(id => id)
  }
        confidence: Math.min(0.95, 0.7 + (unique_users - pattern.threshold) * 0.05),
        suggestedActions: [
          'Investigate payment method sharing',
          'Review all transactions with this payment method',
          'Consider blocking payment method',
          'Check for fraud ring activity',
          'Verify cardholder identity'
        ],
        status: 'new',
        detectedAt: new Date(};
    }

    return null;
  }

  private async checkTimeAnomaly(
    transaction: Transaction, 
    ____pattern: TransactionAnomalyPattern
  ): Promise<TransactionAnomaly | null> {

    const transactionTime = new Date(transaction.created_at);
    const hour = transactionTime.getUTCHours();
    const dayOfWeek = transactionTime.getUTCDay();

    // Check for unusual timing patterns
    const unusualPatterns: string[] = [];
    let confidence = 0.3;

    // Very late night transactions (2-6 AM UTC)
    if (hour >= 2 && hour <= 6 && transaction.amount_cents > 10000) {
      unusualPatterns.push('late_night_transaction');
      confidence += 0.3;
    }

    // Weekend high-value transactions
    if ((dayOfWeek === 0 || dayOfWeek === 6) && transaction.amount_cents > 50000) {
      unusualPatterns.push('weekend_high_value');
      confidence += 0.2;
    }

    // Check user's typical transaction times
    const userTimePatterns = await this.db.query(`
      SELECT 
        AVG(EXTRACT(HOUR FROM created_at)) as avg_hour,
        STDDEV(EXTRACT(HOUR FROM created_at)) as stddev_hour,
        COUNT(*) as count
      FROM transactions
      WHERE user_id = ? AND status = 'succeeded' AND id != ?
    `, [transaction.user_id, transaction.id]);

    const { avg_hour, stddev_hour, count } = userTimePatterns[0] || { avg_hour: 12, stddev_hour: 6, count: 0 };

    if (count > 5 && stddev_hour > 0) {
      const hourDifference = Math.abs(hour - avg_hour);
      const normalizedDiff = Math.min(hourDifference, 24 - hourDifference); // Account for hour wraparound
      
      if (normalizedDiff > stddev_hour * 2) {
        unusualPatterns.push('unusual_time_for_user');
        confidence += 0.3;
      }
    }

    if (unusualPatterns.length > 0 && confidence > 0.5) {
      return {
        id: crypto.randomUUID(),
        transactionId: transaction.id,
        userId: transaction.user_id,
        patternType: 'unusual_timing',
        severity: 'medium',
        description: `Unusual transaction timing: ${unusualPatterns.join(', ')}`,
        evidence: {
          transactionHour: hour,
          transactionDayOfWeek: dayOfWeek,
          transactionAmount: transaction.amount_cents,
          unusualPatterns,
          userAverageHour: avg_hour,
          userHourStddev: stddev_hour,
          userTransactionCount: count
  }
        confidence,
        suggestedActions: [
          'Verify transaction timing with customer',
          'Check account security',
          'Review recent account activity'
        ],
        status: 'new',
        detectedAt: new Date(};
    }

    return null;
  }

  // =============================================
  // Fraud Ring Detection
  // =============================================

  async detectFraudRings(): Promise<FraudRing[]> {

    const fraudRings: FraudRing[] = [];

    // Detect based on shared payment methods
    await this.detectPaymentMethodRings(fraudRings);
    
    // Detect based on similar transaction patterns
    await this.detectPatternRings(fraudRings);
    
    // Detect based on IP address clustering
    await this.detectIPRings(fraudRings);

    return fraudRings;
  }

  private async detectPaymentMethodRings(fraudRings: FraudRing[]): Promise<void> {

    const sharedPaymentMethods = await this.db.query(`
      SELECT 
        pi.payment_method_id,
        GROUP_CONCAT(DISTINCT t.user_id) as user_ids,
        COUNT(DISTINCT t.user_id) as user_count,
        SUM(t.amount_cents) as total_amount,
        COUNT(t.id) as transaction_count,
        MIN(t.created_at) as first_transaction,
        MAX(t.created_at) as last_transaction
      FROM transactions t
      JOIN payment_intents pi ON t.payment_intent_id = pi.id
      WHERE t.created_at >= datetime('now', '-30 days')
      GROUP BY pi.payment_method_id
      HAVING user_count >= 3 AND total_amount > 50000
      ORDER BY user_count DESC, total_amount DESC
    `);

    for (const row of sharedPaymentMethods) {
      const userIds = row.user_ids.split(',').filter((id: string) => id);
      
      if (userIds.length >= 3) {
        const timeSpan = new Date(row.last_transaction).getTime() - new Date(row.first_transaction).getTime();
        const daySpan = timeSpan / (1000 * 60 * 60 * 24);
        
        // Higher confidence for shorter time spans (coordinated activity)
        let confidence = Math.min(0.9, 0.5 + userIds.length * 0.1);
        if (daySpan < 7) confidence += 0.2;
        if (row.total_amount > 200000) confidence += 0.1;

        fraudRings.push({
          id: crypto.randomUUID(),
          userIds,
          suspiciousActivities: ['shared_payment_method', 'coordinated_timing'],
          confidence,
          totalAmount: row.total_amount,
          transactionCount: row.transaction_count,
          detectedAt: new Date(),
          status: 'suspected'
        });
      }
    }
  }

  private async detectPatternRings(fraudRings: FraudRing[]): Promise<void> {

    const patternGroups = await this.db.query(`
      SELECT 
        amount_cents,
        transaction_type,
        provider,
        GROUP_CONCAT(DISTINCT user_id) as user_ids,
        COUNT(DISTINCT user_id) as user_count,
        COUNT(*) as transaction_count,
        MIN(created_at) as first_transaction,
        MAX(created_at) as last_transaction
      FROM transactions
      WHERE created_at >= datetime('now', '-7 days')
        AND status = 'succeeded'
      GROUP BY amount_cents, transaction_type, provider
      HAVING user_count >= 3 AND transaction_count >= 5
      ORDER BY user_count DESC, transaction_count DESC
    `);

    for (const row of patternGroups) {
      const userIds = row.user_ids.split(',').filter((id: string) => id);
      
      if (userIds.length >= 3) {
        const timeSpan = new Date(row.last_transaction).getTime() - new Date(row.first_transaction).getTime();
        const hourSpan = timeSpan / (1000 * 60 * 60);
        
        // Very similar transactions in short time frame suggest coordination
        let confidence = Math.min(0.8, 0.4 + userIds.length * 0.08);
        if (hourSpan < 24) confidence += 0.2;
        if (row.transaction_count / userIds.length > 2) confidence += 0.1;

        fraudRings.push({
          id: crypto.randomUUID(),
          userIds,
          suspiciousActivities: ['identical_transaction_patterns', 'coordinated_timing'],
          confidence,
          totalAmount: row.amount_cents * row.transaction_count,
          transactionCount: row.transaction_count,
          detectedAt: new Date(),
          status: 'suspected'
        });
      }
    }
  }

  private async detectIPRings(____fraudRings: FraudRing[]): Promise<void> {

    // This would require IP address data from risk assessments
    // Implementation would be similar to payment method rings but based on IP clustering
    // Skipping for now as IP data structure is not fully defined
  }

  // =============================================
  // Utility Methods
  // =============================================

  private parseTimeWindow(timeWindow: string): number {
    const match = timeWindow.match(/(\d+)([hmsd])/);
    if (!match) return 3600000; // Default 1 hour

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
    case 'm': return value * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    case 'd': return value * 24 * 60 * 60 * 1000;
    default: return value * 1000;
    }
  }

  private async getTransactionById(transactionId: string): Promise<Transaction | null> {

    const result = await this.db.query('SELECT * FROM transactions WHERE id = ?', [transactionId]);
    if (result.length === 0) return null;

    const transaction = result[0];
    transaction.fraud_flags = JSON.parse(transaction.fraud_flags || '[]');
    transaction.metadata = JSON.parse(transaction.metadata || '{}');
    return transaction;
  }

  private async saveTransactionAnomaly(anomaly: TransactionAnomaly): Promise<void> {

    await this.db.query(`
      INSERT INTO transaction_anomalies (
        id, transaction_id, user_id, pattern_type, severity, description,
        evidence, confidence, suggested_actions, status, detected_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      anomaly.id,
      anomaly.transactionId,
      anomaly.userId,
      anomaly.patternType,
      anomaly.severity,
      anomaly.description,
      JSON.stringify(anomaly.evidence),
      anomaly.confidence,
      JSON.stringify(anomaly.suggestedActions),
      anomaly.status,
      anomaly.detectedAt
    ]);

    // Log to application log
    this.fastify.log.warn('Transaction anomaly detected', {
      anomalyId: anomaly.id,
      transactionId: anomaly.transactionId,
      patternType: anomaly.patternType,
      severity: anomaly.severity,
      confidence: anomaly.confidence
    });
  }

  // =============================================
  // Management Methods
  // =============================================

  async updateAnomalyStatus(
    anomalyId: string,
    status: TransactionAnomaly['status'],
    investigatorId: string,
    resolution?: string
  ): Promise<void> {

    await this.db.query(`
      UPDATE transaction_anomalies 
      SET status = ?, investigated_by = ?, investigated_at = ?, resolution = ?
      WHERE id = ?
    `, [status, investigatorId, new Date(), resolution || null, anomalyId]);
  }

  async getActiveAnomalies(limit: number = 100): Promise<TransactionAnomaly[]> {

    const results = await this.db.query(`
      SELECT * FROM transaction_anomalies 
      WHERE status IN ('new', 'investigating')
      ORDER BY severity DESC, detected_at DESC
      LIMIT ?
    `, [limit]);

    return results.map(row => ({
      ...row,
      evidence: JSON.parse(row.evidence || '{}'),
      suggestedActions: JSON.parse(row.suggested_actions || '[]')
    }));
  }

  async getAnomaliesByTransaction(transactionId: string): Promise<TransactionAnomaly[]> {

    const results = await this.db.query(`
      SELECT * FROM transaction_anomalies 
      WHERE transaction_id = ?
      ORDER BY detected_at DESC
    `, [transactionId]);

    return results.map(row => ({
      ...row,
      evidence: JSON.parse(row.evidence || '{}'),
      suggestedActions: JSON.parse(row.suggested_actions || '[]')
    }));
  }

  async getAnomalyStatistics(timeWindow: string = '30d'): Promise<Record<string, any>> {
    const windowMs = this.parseTimeWindow(timeWindow);
    const cutoffTime = new Date(Date.now() - windowMs);

    const stats = await this.db.query(`
      SELECT 
        COUNT(*) as total_anomalies,
        COUNT(*) FILTER (WHERE status = 'resolved') as resolved_anomalies,
        COUNT(*) FILTER (WHERE status = 'false_positive') as false_positives,
        COUNT(*) FILTER (WHERE severity = 'critical') as critical_anomalies,
        COUNT(*) FILTER (WHERE severity = 'high') as high_anomalies,
        COUNT(*) FILTER (WHERE severity = 'medium') as medium_anomalies,
        COUNT(*) FILTER (WHERE severity = 'low') as low_anomalies,
        AVG(confidence) as avg_confidence
      FROM transaction_anomalies
      WHERE detected_at >= ?
    `, [cutoffTime.toISOString()]);

    return {
      ...stats[0],
      timeWindow,
      generatedAt: new Date()
    };
  }
}