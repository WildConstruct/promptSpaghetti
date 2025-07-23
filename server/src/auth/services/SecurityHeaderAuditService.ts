/**
 * Security Header Audit Service - Epic 19 Implementation
 * Regular security header audits with compliance tracking and vulnerability detection
 */

import crypto from 'crypto';
import { EventEmitter } from 'events';

export interface SecurityHeader {
  name: string;
  value: string;
  required: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  complianceStandards: string[];
  description: string;
  recommendation: string;
}

export interface HeaderAuditRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  headers: SecurityHeader[];
  endpoints: string[];
  environment: ('development' | 'staging' | 'production')[];
  schedule: {
    frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
    time?: string; // HH:MM for daily/weekly
    dayOfWeek?: number; // 0-6 for weekly
    dayOfMonth?: number; // 1-31 for monthly
  };
  notifications: {
    onViolation: boolean;
    onImprovement: boolean;
    recipients: string[];
    severity: ('low' | 'medium' | 'high' | 'critical')[];
  };
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface HeaderAuditResult {
  id: string;
  ruleId: string;
  endpoint: string;
  timestamp: Date;
  headers: {
    present: Array<{
      name: string;
      value: string;
      compliant: boolean;
      issues: string[];
    }>;
    missing: Array<{
      name: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      reason: string;
    }>;
    malformed: Array<{
      name: string;
      value: string;
      expectedFormat: string;
      issues: string[];
    }>;
  };
  score: number; // 0-100 compliance score
  securityLevel: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  violations: Array<{
    headerName: string;
    violationType: 'missing' | 'malformed' | 'weak' | 'deprecated';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    recommendation: string;
    complianceImpact: string[];
  }>;
  recommendations: string[];
  responseTime: number;
  responseStatus: number;
}

export interface AuditReport {
  id: string;
  generatedAt: Date;
  timeRange: { start: Date; end: Date };
  summary: {
    totalEndpoints: number;
    auditedEndpoints: number;
    averageScore: number;
    violationCount: number;
    criticalViolations: number;
    highViolations: number;
    mediumViolations: number;
    lowViolations: number;
    complianceRate: number;
  };
  trends: {
    scoreHistory: Array<{ date: Date; score: number }>;
    violationTrends: Array<{ date: Date; count: number; severity: string }>;
    improvementAreas: string[];
  };
  endpointDetails: Array<{
    endpoint: string;
    score: number;
    lastAudit: Date;
    violations: number;
    status: 'compliant' | 'warning' | 'violation' | 'critical';
  }>;
  recommendations: Array<{
    priority: 'high' | 'medium' | 'low';
    category: string;
    description: string;
    impact: string;
    effort: 'low' | 'medium' | 'high';
  }>;
}

export class SecurityHeaderAuditService extends EventEmitter {
  private rules: Map<string, HeaderAuditRule> = new Map();
  private auditResults: Map<string, HeaderAuditResult[]> = new Map();
  private scheduledTasks: Map<string, NodeJS.Timeout> = new Map();
  
  constructor() {
    super();
    this.initializeDefaultRules();
    this.startScheduledAudits();
  }

  /**
   * Create a new audit rule
   */
  async createAuditRule(
    ruleData: Omit<HeaderAuditRule, 'id' | 'createdAt' | 'updatedAt'>,
    createdBy: string
  ): Promise<HeaderAuditRule> {
    const rule: HeaderAuditRule = {
      ...ruleData,
      id: this.generateRuleId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy
    };

    await this.validateRule(rule);
    this.rules.set(rule.id, rule);
    
    if (rule.enabled) {
      this.scheduleAuditRule(rule);
    }

    await this.logAuditEvent('rule_created', rule.id, createdBy, {
      ruleName: rule.name,
      endpoints: rule.endpoints.length,
      headers: rule.headers.length
    });

    this.emit('ruleCreated', rule);
    return rule;
  }

  /**
   * Perform security header audit for endpoints
   */
  async performAudit(
    ruleId: string,
    endpoints?: string[]
  ): Promise<HeaderAuditResult[]> {
    const rule = this.rules.get(ruleId);
    if (!rule) {
      throw new Error('Audit rule not found');
    }

    if (!rule.enabled) {
      throw new Error('Audit rule is disabled');
    }

    const targetEndpoints = endpoints || rule.endpoints;
    const results: HeaderAuditResult[] = [];

    for (const endpoint of targetEndpoints) {
      try {
        const result = await this.auditEndpoint(endpoint, rule);
        results.push(result);
        
        // Store result
        const endpointResults = this.auditResults.get(endpoint) || [];
        endpointResults.push(result);
        
        // Keep only last 100 results per endpoint
        if (endpointResults.length > 100) {
          endpointResults.splice(0, endpointResults.length - 100);
        }
        
        this.auditResults.set(endpoint, endpointResults);

        // Check for violations and send notifications
        if (result.violations.length > 0) {
          await this.handleViolations(result, rule);
        }

      } catch (error) {
        console.error(`Audit failed for endpoint ${endpoint}:`, error.message);
      }
    }

    await this.logAuditEvent('audit_completed', ruleId, 'system', {
      endpointsAudited: results.length,
      averageScore: results.reduce((sum, r) => sum + r.score, 0) / results.length,
      violationsFound: results.reduce((sum, r) => sum + r.violations.length, 0)
    });

    this.emit('auditCompleted', { ruleId, results });
    return results;
  }

  /**
   * Generate comprehensive audit report
   */
  async generateAuditReport(
    timeRange: { start: Date; end: Date },
    endpoints?: string[]
  ): Promise<AuditReport> {
    const reportId = this.generateReportId();
    const allResults = this.getResultsInTimeRange(timeRange, endpoints);
    
    // Calculate summary statistics
    const summary = this.calculateSummaryStats(allResults);
    
    // Calculate trends
    const trends = this.calculateTrends(allResults, timeRange);
    
    // Get endpoint details
    const endpointDetails = this.getEndpointDetails(allResults);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(allResults);

    const report: AuditReport = {
      id: reportId,
      generatedAt: new Date(),
      timeRange,
      summary,
      trends,
      endpointDetails,
      recommendations
    };

    await this.logAuditEvent('report_generated', reportId, 'system', {
      timeRange,
      endpointsIncluded: endpointDetails.length,
      averageScore: summary.averageScore,
      violationCount: summary.violationCount
    });

    this.emit('reportGenerated', report);
    return report;
  }

  /**
   * Get security header recommendations for an endpoint
   */
  async getSecurityRecommendations(endpoint: string): Promise<{
    currentHeaders: Array<{ name: string; value: string; status: 'good' | 'warning' | 'missing' | 'deprecated' }>;
    recommendations: Array<{
      header: string;
      action: 'add' | 'modify' | 'remove';
      currentValue?: string;
      recommendedValue: string;
      reason: string;
      priority: 'high' | 'medium' | 'low';
    }>;
    score: number;
  }> {
    // Mock endpoint analysis - would make actual HTTP request
    const currentHeaders = await this.analyzeEndpointHeaders(endpoint);
    const recommendations = [];
    let score = 0;

    // Define essential security headers
    const essentialHeaders = this.getEssentialSecurityHeaders();
    
    for (const header of essentialHeaders) {
      const current = currentHeaders.find(h => h.name.toLowerCase() === header.name.toLowerCase());
      
      if (!current) {
        recommendations.push({
          header: header.name,
          action: 'add' as const,
          recommendedValue: header.value,
          reason: header.description,
          priority: header.severity === 'critical' ? 'high' as const : 
            header.severity === 'high' ? 'medium' as const : 'low' as const
        });
      } else {
        const analysis = this.analyzeHeaderValue(header.name, current.value);
        if (!analysis.compliant) {
          recommendations.push({
            header: header.name,
            action: 'modify' as const,
            currentValue: current.value,
            recommendedValue: header.value,
            reason: analysis.issues.join('; '),
            priority: header.severity === 'critical' ? 'high' as const : 'medium' as const
          });
        } else {
          score += this.getHeaderScore(header);
        }
      }
    }

    // Check for deprecated headers
    const deprecatedHeaders = ['X-XSS-Protection', 'X-Content-Type-Options'];
    for (const current of currentHeaders) {
      if (deprecatedHeaders.includes(current.name) && current.value !== 'nosniff') {
        recommendations.push({
          header: current.name,
          action: 'modify' as const,
          currentValue: current.value,
          recommendedValue: current.name === 'X-Content-Type-Options' ? 'nosniff' : '1; mode=block',
          reason: 'Header value is deprecated or weak',
          priority: 'medium' as const
        });
      }
    }

    score = Math.round((score / essentialHeaders.length) * 100);

    return { currentHeaders, recommendations, score };
  }

  // Private helper methods

  private initializeDefaultRules(): void {
    const productionRule: HeaderAuditRule = {
      id: 'production-security-headers',
      name: 'Production Security Headers',
      description: 'Comprehensive security header audit for production endpoints',
      enabled: true,
      headers: this.getEssentialSecurityHeaders(),
      endpoints: [
        '/api/auth/*',
        '/api/user/*',
        '/api/admin/*',
        '/api/data/*'
      ],
      environment: ['production'],
      schedule: {
        frequency: 'daily',
        time: '06:00'
      },
      notifications: {
        onViolation: true,
        onImprovement: false,
        recipients: ['security-team@company.com', 'devops@company.com'],
        severity: ['high', 'critical']
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'system'
    };

    this.rules.set(productionRule.id, productionRule);
  }

  private getEssentialSecurityHeaders(): SecurityHeader[] {
    return [
      {
        name: 'Strict-Transport-Security',
        value: 'max-age=31536000; includeSubDomains; preload',
        required: true,
        severity: 'critical',
        complianceStandards: ['OWASP', 'PCI-DSS', 'ISO27001'],
        description: 'Enforces HTTPS and prevents protocol downgrade attacks',
        recommendation: 'Set max-age to at least 1 year with includeSubDomains'
      },
      {
        name: 'Content-Security-Policy',
        value: 'default-src \'self\'; script-src \'self\' \'unsafe-inline\'; style-src \'self\' \'unsafe-inline\'; img-src \'self\' data: https:; font-src \'self\' https:; connect-src \'self\'; frame-ancestors \'none\'; object-src \'none\'; base-uri \'self\'',
        required: true,
        severity: 'critical',
        complianceStandards: ['OWASP', 'ISO27001'],
        description: 'Prevents XSS attacks by controlling resource loading',
        recommendation: 'Use restrictive CSP with specific source allowlists'
      },
      {
        name: 'X-Frame-Options',
        value: 'DENY',
        required: true,
        severity: 'high',
        complianceStandards: ['OWASP'],
        description: 'Prevents clickjacking attacks',
        recommendation: 'Use DENY or SAMEORIGIN based on application needs'
      },
      {
        name: 'X-Content-Type-Options',
        value: 'nosniff',
        required: true,
        severity: 'medium',
        complianceStandards: ['OWASP'],
        description: 'Prevents MIME type sniffing attacks',
        recommendation: 'Always set to nosniff'
      },
      {
        name: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin',
        required: true,
        severity: 'medium',
        complianceStandards: ['OWASP'],
        description: 'Controls referrer information sent with requests',
        recommendation: 'Use strict-origin-when-cross-origin for balance of security and functionality'
      },
      {
        name: 'Permissions-Policy',
        value: 'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), speaker=()',
        required: false,
        severity: 'low',
        complianceStandards: ['OWASP'],
        description: 'Controls browser feature access',
        recommendation: 'Disable unnecessary browser features'
      },
      {
        name: 'X-XSS-Protection',
        value: '1; mode=block',
        required: false,
        severity: 'low',
        complianceStandards: ['OWASP'],
        description: 'Legacy XSS protection (superseded by CSP)',
        recommendation: 'Include for legacy browser support but rely on CSP'
      }
    ];
  }

  private async auditEndpoint(endpoint: string, rule: HeaderAuditRule): Promise<HeaderAuditResult> {
    const startTime = Date.now();
    
    // Mock HTTP request analysis - would make actual request to endpoint
    const mockResponse = {
      status: 200,
      headers: {
        'strict-transport-security': 'max-age=31536000; includeSubDomains',
        'content-security-policy': 'default-src \'self\'',
        'x-frame-options': 'DENY',
        'x-content-type-options': 'nosniff'
        // Some headers intentionally missing for demonstration
      }
    };

    const responseTime = Date.now() - startTime;
    const violations = [];
    const presentHeaders = [];
    const missingHeaders = [];
    const malformedHeaders = [];
    
    let score = 0;
    const maxScore = rule.headers.reduce((sum, h) => sum + this.getHeaderScore(h), 0);

    // Check each required header
    for (const requiredHeader of rule.headers) {
      const responseHeader = mockResponse.headers[requiredHeader.name.toLowerCase()];
      
      if (!responseHeader) {
        if (requiredHeader.required) {
          missingHeaders.push({
            name: requiredHeader.name,
            severity: requiredHeader.severity,
            reason: `Required security header missing: ${requiredHeader.description}`
          });
          
          violations.push({
            headerName: requiredHeader.name,
            violationType: 'missing' as const,
            severity: requiredHeader.severity,
            description: `Missing required header: ${requiredHeader.name}`,
            recommendation: requiredHeader.recommendation,
            complianceImpact: requiredHeader.complianceStandards
          });
        }
      } else {
        const analysis = this.analyzeHeaderValue(requiredHeader.name, responseHeader);
        
        presentHeaders.push({
          name: requiredHeader.name,
          value: responseHeader,
          compliant: analysis.compliant,
          issues: analysis.issues
        });

        if (analysis.compliant) {
          score += this.getHeaderScore(requiredHeader);
        } else {
          violations.push({
            headerName: requiredHeader.name,
            violationType: 'malformed' as const,
            severity: requiredHeader.severity,
            description: `Header value issues: ${analysis.issues.join(', ')}`,
            recommendation: requiredHeader.recommendation,
            complianceImpact: requiredHeader.complianceStandards
          });

          malformedHeaders.push({
            name: requiredHeader.name,
            value: responseHeader,
            expectedFormat: requiredHeader.value,
            issues: analysis.issues
          });
        }
      }
    }

    // Calculate final score
    const finalScore = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    
    // Determine security level
    let securityLevel: HeaderAuditResult['securityLevel'] = 'very_high';
    if (finalScore < 20) securityLevel = 'very_low';
    else if (finalScore < 40) securityLevel = 'low';
    else if (finalScore < 60) securityLevel = 'medium';
    else if (finalScore < 80) securityLevel = 'high';

    // Generate recommendations
    const recommendations = this.generateHeaderRecommendations(violations, missingHeaders);

    return {
      id: this.generateResultId(),
      ruleId: rule.id,
      endpoint,
      timestamp: new Date(),
      headers: {
        present: presentHeaders,
        missing: missingHeaders,
        malformed: malformedHeaders
      },
      score: finalScore,
      securityLevel,
      violations,
      recommendations,
      responseTime,
      responseStatus: mockResponse.status
    };
  }

  private analyzeHeaderValue(headerName: string, value: string): { compliant: boolean; issues: string[] } {
    const issues = [];
    
    switch (headerName.toLowerCase()) {
    case 'strict-transport-security':
      if (!value.includes('max-age=')) {
        issues.push('Missing max-age directive');
      } else {
        const maxAge = parseInt(value.match(/max-age=(\d+)/)?.[1] || '0');
        if (maxAge < 31536000) { // 1 year
          issues.push('max-age should be at least 1 year (31536000 seconds)');
        }
      }
      if (!value.includes('includeSubDomains')) {
        issues.push('Consider adding includeSubDomains directive');
      }
      break;
        
    case 'content-security-policy':
      if (value.includes('\'unsafe-eval\'')) {
        issues.push('Avoid \'unsafe-eval\' directive');
      }
      if (value.includes('*') && !value.includes('\'self\'')) {
        issues.push('Wildcard sources should be used carefully');
      }
      break;
        
    case 'x-frame-options':
      if (!['DENY', 'SAMEORIGIN'].includes(value.toUpperCase())) {
        issues.push('Value should be DENY or SAMEORIGIN');
      }
      break;
        
    case 'x-content-type-options':
      if (value.toLowerCase() !== 'nosniff') {
        issues.push('Value should be nosniff');
      }
      break;
    }
    
    return {
      compliant: issues.length === 0,
      issues
    };
  }

  private getHeaderScore(header: SecurityHeader): number {
    const severityScores = {
      critical: 30,
      high: 20,
      medium: 10,
      low: 5
    };
    
    return severityScores[header.severity] || 0;
  }

  private async analyzeEndpointHeaders(endpoint: string): Promise<Array<{ name: string; value: string; status: 'good' | 'warning' | 'missing' | 'deprecated' }>> {
    // Mock implementation - would make actual HTTP request
    return [
      { name: 'Content-Type', value: 'application/json', status: 'good' },
      { name: 'X-Frame-Options', value: 'DENY', status: 'good' },
      { name: 'X-Content-Type-Options', value: 'nosniff', status: 'good' }
    ];
  }

  private generateHeaderRecommendations(violations: any[], missingHeaders: any[]): string[] {
    const recommendations = [];
    
    if (violations.length > 0) {
      recommendations.push('Fix malformed security headers to improve compliance');
    }
    
    if (missingHeaders.some(h => h.severity === 'critical')) {
      recommendations.push('Add critical security headers immediately');
    }
    
    if (missingHeaders.some(h => h.name.toLowerCase() === 'content-security-policy')) {
      recommendations.push('Implement Content Security Policy to prevent XSS attacks');
    }
    
    if (missingHeaders.some(h => h.name.toLowerCase() === 'strict-transport-security')) {
      recommendations.push('Add HSTS header to enforce HTTPS');
    }
    
    return recommendations;
  }

  private scheduleAuditRule(rule: HeaderAuditRule): void {
    const existingTask = this.scheduledTasks.get(rule.id);
    if (existingTask) {
      clearInterval(existingTask);
    }

    let intervalMs: number;
    switch (rule.schedule.frequency) {
    case 'hourly':
      intervalMs = 60 * 60 * 1000;
      break;
    case 'daily':
      intervalMs = 24 * 60 * 60 * 1000;
      break;
    case 'weekly':
      intervalMs = 7 * 24 * 60 * 60 * 1000;
      break;
    case 'monthly':
      intervalMs = 30 * 24 * 60 * 60 * 1000;
      break;
    default:
      intervalMs = 24 * 60 * 60 * 1000; // Default to daily
    }

    const task = setInterval(async () => {
      try {
        await this.performAudit(rule.id);
      } catch (error) {
        console.error(`Scheduled audit failed for rule ${rule.id}:`, error.message);
      }
    }, intervalMs);

    this.scheduledTasks.set(rule.id, task);
  }

  private startScheduledAudits(): void {
    for (const rule of this.rules.values()) {
      if (rule.enabled) {
        this.scheduleAuditRule(rule);
      }
    }
  }

  private async handleViolations(result: HeaderAuditResult, rule: HeaderAuditRule): Promise<void> {
    const criticalViolations = result.violations.filter(v => v.severity === 'critical');
    const highViolations = result.violations.filter(v => v.severity === 'high');
    
    if (criticalViolations.length > 0 || highViolations.length > 0) {
      // Send notifications based on rule configuration
      if (rule.notifications.onViolation) {
        await this.sendViolationNotification(result, rule);
      }
    }
  }

  private async sendViolationNotification(result: HeaderAuditResult, rule: HeaderAuditRule): Promise<void> {
    console.log(`Sending violation notification for endpoint ${result.endpoint}`);
    console.log(`Violations: ${result.violations.length}, Score: ${result.score}`);
  }

  private getResultsInTimeRange(timeRange: { start: Date; end: Date }, endpoints?: string[]): HeaderAuditResult[] {
    const results = [];
    
    for (const [endpoint, endpointResults] of this.auditResults.entries()) {
      if (endpoints && !endpoints.includes(endpoint)) continue;
      
      const filteredResults = endpointResults.filter(result => 
        result.timestamp >= timeRange.start && result.timestamp <= timeRange.end
      );
      
      results.push(...filteredResults);
    }
    
    return results;
  }

  private calculateSummaryStats(results: HeaderAuditResult[]): AuditReport['summary'] {
    const endpointsSet = new Set(results.map(r => r.endpoint));
    const violations = results.flatMap(r => r.violations);
    
    return {
      totalEndpoints: endpointsSet.size,
      auditedEndpoints: endpointsSet.size,
      averageScore: results.length > 0 ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length) : 0,
      violationCount: violations.length,
      criticalViolations: violations.filter(v => v.severity === 'critical').length,
      highViolations: violations.filter(v => v.severity === 'high').length,
      mediumViolations: violations.filter(v => v.severity === 'medium').length,
      lowViolations: violations.filter(v => v.severity === 'low').length,
      complianceRate: results.length > 0 ? Math.round((results.filter(r => r.violations.length === 0).length / results.length) * 100) : 100
    };
  }

  private calculateTrends(results: HeaderAuditResult[], timeRange: { start: Date; end: Date }): AuditReport['trends'] {
    // Group results by day
    const dailyData = new Map<string, { scores: number[]; violations: any[] }>();
    
    for (const result of results) {
      const day = result.timestamp.toISOString().split('T')[0];
      const dayData = dailyData.get(day) || { scores: [], violations: [] };
      dayData.scores.push(result.score);
      dayData.violations.push(...result.violations);
      dailyData.set(day, dayData);
    }
    
    const scoreHistory = Array.from(dailyData.entries()).map(([day, data]) => ({
      date: new Date(day),
      score: Math.round(data.scores.reduce((sum, s) => sum + s, 0) / data.scores.length)
    }));
    
    const violationTrends = Array.from(dailyData.entries()).flatMap(([day, data]) => 
      ['critical', 'high', 'medium', 'low'].map(severity => ({
        date: new Date(day),
        count: data.violations.filter(v => v.severity === severity).length,
        severity
      }))
    );
    
    return {
      scoreHistory,
      violationTrends,
      improvementAreas: this.identifyImprovementAreas(results)
    };
  }

  private getEndpointDetails(results: HeaderAuditResult[]): AuditReport['endpointDetails'] {
    const endpointMap = new Map<string, HeaderAuditResult[]>();
    
    for (const result of results) {
      const endpointResults = endpointMap.get(result.endpoint) || [];
      endpointResults.push(result);
      endpointMap.set(result.endpoint, endpointResults);
    }
    
    return Array.from(endpointMap.entries()).map(([endpoint, endpointResults]) => {
      const latestResult = endpointResults[endpointResults.length - 1];
      const avgScore = Math.round(endpointResults.reduce((sum, r) => sum + r.score, 0) / endpointResults.length);
      const totalViolations = endpointResults.reduce((sum, r) => sum + r.violations.length, 0);
      
      let status: 'compliant' | 'warning' | 'violation' | 'critical' = 'compliant';
      if (totalViolations === 0) status = 'compliant';
      else if (latestResult.violations.some(v => v.severity === 'critical')) status = 'critical';
      else if (latestResult.violations.some(v => v.severity === 'high')) status = 'violation';
      else status = 'warning';
      
      return {
        endpoint,
        score: avgScore,
        lastAudit: latestResult.timestamp,
        violations: totalViolations,
        status
      };
    });
  }

  private generateRecommendations(results: HeaderAuditResult[]): AuditReport['recommendations'] {
    const recommendations = [];
    const allViolations = results.flatMap(r => r.violations);
    
    // Analyze common issues
    const missingCSP = allViolations.filter(v => v.headerName === 'Content-Security-Policy').length;
    const missingHSTS = allViolations.filter(v => v.headerName === 'Strict-Transport-Security').length;
    const criticalIssues = allViolations.filter(v => v.severity === 'critical').length;
    
    if (criticalIssues > 0) {
      recommendations.push({
        priority: 'high' as const,
        category: 'Critical Security',
        description: 'Address critical security header violations immediately',
        impact: 'High security risk exposure',
        effort: 'low' as const
      });
    }
    
    if (missingCSP > results.length * 0.5) {
      recommendations.push({
        priority: 'high' as const,
        category: 'Content Security Policy',
        description: 'Implement CSP headers across all endpoints',
        impact: 'Prevents XSS attacks and improves security posture',
        effort: 'medium' as const
      });
    }
    
    if (missingHSTS > results.length * 0.3) {
      recommendations.push({
        priority: 'medium' as const,
        category: 'Transport Security',
        description: 'Add HSTS headers to enforce HTTPS',
        impact: 'Prevents protocol downgrade attacks',
        effort: 'low' as const
      });
    }
    
    return recommendations;
  }

  private identifyImprovementAreas(results: HeaderAuditResult[]): string[] {
    const areas = [];
    const allViolations = results.flatMap(r => r.violations);
    
    if (allViolations.some(v => v.headerName === 'Content-Security-Policy')) {
      areas.push('Content Security Policy implementation');
    }
    
    if (allViolations.some(v => v.headerName === 'Strict-Transport-Security')) {
      areas.push('HTTPS enforcement and HSTS configuration');
    }
    
    if (allViolations.some(v => v.severity === 'critical')) {
      areas.push('Critical security vulnerabilities');
    }
    
    return areas;
  }

  private async validateRule(rule: HeaderAuditRule): Promise<void> {
    if (!rule.name || rule.name.trim().length === 0) {
      throw new Error('Rule name is required');
    }
    
    if (!rule.endpoints || rule.endpoints.length === 0) {
      throw new Error('At least one endpoint must be specified');
    }
    
    if (!rule.headers || rule.headers.length === 0) {
      throw new Error('At least one header must be specified');
    }
  }

  private generateRuleId(): string {
    return `SAR-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  }

  private generateResultId(): string {
    return `SAU-${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
  }

  private generateReportId(): string {
    return `SRE-${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
  }

  private async logAuditEvent(action: string, target: string, performedBy: string, metadata: any): Promise<void> {
    console.log(`Security Audit Event: ${action} for ${target} by ${performedBy}`, metadata);
  }
}