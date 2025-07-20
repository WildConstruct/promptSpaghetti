// Risk Scoring Algorithm for Login Anomaly Detection
// Calculates risk scores based on multiple behavioral and contextual factors

export interface LoginAttempt {
  userId?: string;
  ipAddress: string;
  userAgent: string;
  location?: {
    country: string;
    region: string;
    city: string;
    coordinates?: { lat: number; lng: number };
  };
  timestamp: Date;
  success: boolean;
  sessionId?: string;
  deviceFingerprint?: string;
  twoFactorUsed?: boolean;
}

export interface UserProfile {
  userId: string;
  typicalLocations: Array<{
    country: string;
    region: string;
    frequency: number;
  }>;
  typicalDevices: Array<{
    fingerprint: string;
    lastSeen: Date;
    frequency: number;
  }>;
  typicalLoginTimes: Array<{
    hourOfDay: number;
    dayOfWeek: number;
    frequency: number;
  }>;
  accountAge: number; // days
  mfaEnabled: boolean;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface RiskFactors {
  // Location-based factors
  newLocation: number;          // 0-1: 0 = known location, 1 = completely new
  geographicDistance: number;   // 0-1: distance from typical locations
  vpnTorDetection: number;      // 0-1: likelihood of VPN/Tor usage
  
  // Behavioral factors
  timeAnomaly: number;          // 0-1: deviation from typical login times
  velocityAnomaly: number;      // 0-1: impossible travel between locations
  deviceAnomaly: number;        // 0-1: new or suspicious device
  
  // Pattern-based factors
  bruteForceIndicator: number;  // 0-1: recent failed attempts pattern
  credentialStuffing: number;   // 0-1: pattern across multiple accounts
  frequencyAnomaly: number;     // 0-1: unusual login frequency
  
  // Contextual factors
  threatIntelligence: number;   // 0-1: IP in threat databases
  accountRiskLevel: number;     // 0-1: user's baseline risk level
  mfaBypass: number;           // 0-1: attempts to bypass MFA
}

export interface RiskScore {
  overallScore: number;         // 0-100: final calculated risk score
  confidence: number;           // 0-1: confidence in the score
  factors: RiskFactors;
  recommendations: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  explanation: string;
}

export interface RiskScoringConfig {
  // Weight configuration for different risk factors
  weights: {
    location: number;           // Weight for location-based factors
    behavioral: number;         // Weight for behavioral factors
    patterns: number;           // Weight for pattern-based factors
    contextual: number;         // Weight for contextual factors
  };
  
  // Threshold configuration
  thresholds: {
    low: number;               // 0-25: Low risk threshold
    medium: number;            // 26-60: Medium risk threshold  
    high: number;              // 61-85: High risk threshold
    critical: number;          // 86-100: Critical risk threshold
  };
  
  // Time windows for analysis
  timeWindows: {
    bruteForceWindow: number;   // Minutes to look back for brute force
    velocityWindow: number;     // Minutes for velocity calculation
    frequencyWindow: number;    // Hours for frequency analysis
  };
  
  // Distance and velocity limits
  limits: {
    maxReasonableDistance: number;  // KM for reasonable travel
    maxReasonableVelocity: number;  // KM/h for reasonable travel speed
  };
}

export class RiskScoringService {
  private config: RiskScoringConfig;
  
  constructor(config?: Partial<RiskScoringConfig>) {
    this.config = {
      weights: {
        location: 0.3,
        behavioral: 0.25,
        patterns: 0.3,
        contextual: 0.15
      },
      thresholds: {
        low: 25,
        medium: 60,
        high: 85,
        critical: 100
      },
      timeWindows: {
        bruteForceWindow: 15,
        velocityWindow: 60,
        frequencyWindow: 24
      },
      limits: {
        maxReasonableDistance: 500, // 500 KM
        maxReasonableVelocity: 1000 // 1000 KM/h (accounting for flights)
      },
      ...config
    };
  }

  /**
   * Calculate risk score for a login attempt
   */
  async calculateRiskScore(
    loginAttempt: LoginAttempt,
    userProfile: UserProfile,
    recentAttempts: LoginAttempt[]
  ): Promise<RiskScore> {
    // Calculate individual risk factors
    const factors = await this.calculateRiskFactors(loginAttempt, userProfile, recentAttempts);
    
    // Calculate weighted overall score
    const overallScore = this.calculateWeightedScore(factors);
    
    // Determine confidence based on available data
    const confidence = this.calculateConfidence(loginAttempt, userProfile, recentAttempts);
    
    // Determine severity level
    const severity = this.determineSeverity(overallScore);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(factors, overallScore);
    
    // Generate explanation
    const explanation = this.generateExplanation(factors, overallScore);
    
    return {
      overallScore: Math.round(overallScore),
      confidence,
      factors,
      recommendations,
      severity,
      explanation
    };
  }

  private async calculateRiskFactors(
    loginAttempt: LoginAttempt,
    userProfile: UserProfile,
    recentAttempts: LoginAttempt[]
  ): Promise<RiskFactors> {
    return {
      // Location-based factors
      newLocation: this.calculateLocationRisk(loginAttempt, userProfile),
      geographicDistance: this.calculateGeographicDistance(loginAttempt, userProfile),
      vpnTorDetection: await this.detectVpnTor(loginAttempt.ipAddress),
      
      // Behavioral factors
      timeAnomaly: this.calculateTimeAnomaly(loginAttempt, userProfile),
      velocityAnomaly: this.calculateVelocityAnomaly(loginAttempt, recentAttempts),
      deviceAnomaly: this.calculateDeviceAnomaly(loginAttempt, userProfile),
      
      // Pattern-based factors
      bruteForceIndicator: this.calculateBruteForceRisk(loginAttempt, recentAttempts),
      credentialStuffing: this.calculateCredentialStuffingRisk(loginAttempt, recentAttempts),
      frequencyAnomaly: this.calculateFrequencyAnomaly(loginAttempt, recentAttempts),
      
      // Contextual factors
      threatIntelligence: await this.checkThreatIntelligence(loginAttempt.ipAddress),
      accountRiskLevel: this.mapAccountRiskLevel(userProfile.riskLevel),
      mfaBypass: this.calculateMfaBypassRisk(loginAttempt, userProfile)
    };
  }

  private calculateLocationRisk(loginAttempt: LoginAttempt, userProfile: UserProfile): number {
    if (!loginAttempt.location) return 0.3; // Medium risk if no location data
    
    const { country, region } = loginAttempt.location;
    
    // Check if location matches any typical locations
    const matchingLocation = userProfile.typicalLocations.find(
      loc => loc.country === country && loc.region === region
    );
    
    if (matchingLocation) {
      // Risk decreases with frequency of use, but minimum risk for known locations
      return Math.max(0.05, 1 - (matchingLocation.frequency / 100));
    }
    
    // Check for same country but different region
    const sameCountry = userProfile.typicalLocations.find(
      loc => loc.country === country
    );
    
    if (sameCountry) {
      return 0.4; // Moderate risk for new region in known country
    }
    
    return 0.9; // Higher risk for completely new location
  }

  private calculateGeographicDistance(loginAttempt: LoginAttempt, userProfile: UserProfile): number {
    if (!loginAttempt.location?.coordinates || userProfile.typicalLocations.length === 0) {
      return 0.2; // Low-medium risk if no coordinate data
    }
    
    const { lat, lng } = loginAttempt.location.coordinates;
    
    // Find minimum distance to any typical location
    let minDistance = Infinity;
    
    for (const typicalLocation of userProfile.typicalLocations) {
      // For this example, we'll use a simple distance calculation
      // In practice, you'd use proper geolocation libraries
      const distance = this.calculateHaversineDistance(
        lat, lng, 
        0, 0 // Would need coordinates for typical locations
      );
      
      minDistance = Math.min(minDistance, distance);
    }
    
    // Normalize distance (0-1 scale)
    return Math.min(1, minDistance / this.config.limits.maxReasonableDistance);
  }

  private async detectVpnTor(ipAddress: string): Promise<number> {
    // In a real implementation, this would check against VPN/Tor databases
    // For now, return a placeholder value
    
    // Simple heuristic: check for known VPN/Tor IP ranges
    // This would be replaced with actual threat intelligence APIs
    const suspiciousRanges = [
      '10.', '172.', '192.168.', // Private ranges (simplified)
    ];
    
    const isSuspicious = suspiciousRanges.some(range => ipAddress.startsWith(range));
    return isSuspicious ? 0.6 : 0.1;
  }

  private calculateTimeAnomaly(loginAttempt: LoginAttempt, userProfile: UserProfile): number {
    const hour = loginAttempt.timestamp.getHours();
    const dayOfWeek = loginAttempt.timestamp.getDay();
    
    // Check if this time matches typical login patterns
    const matchingPattern = userProfile.typicalLoginTimes.find(
      pattern => pattern.hourOfDay === hour && pattern.dayOfWeek === dayOfWeek
    );
    
    if (matchingPattern) {
      return Math.max(0, 1 - (matchingPattern.frequency / 100));
    }
    
    // Check for similar hour on any day
    const similarHour = userProfile.typicalLoginTimes.find(
      pattern => Math.abs(pattern.hourOfDay - hour) <= 2
    );
    
    if (similarHour) {
      return 0.3; // Moderate risk for unusual day but typical time
    }
    
    return 0.7; // High risk for completely unusual time
  }

  private calculateVelocityAnomaly(loginAttempt: LoginAttempt, recentAttempts: LoginAttempt[]): number {
    if (!loginAttempt.location?.coordinates) return 0;
    
    const cutoffTime = new Date(
      loginAttempt.timestamp.getTime() - this.config.timeWindows.velocityWindow * 60 * 1000
    );
    
    const recentWithLocation = recentAttempts.filter(
      attempt => attempt.timestamp >= cutoffTime && 
                 attempt.location?.coordinates &&
                 attempt.userId === loginAttempt.userId
    );
    
    if (recentWithLocation.length === 0) return 0;
    
    const lastAttempt = recentWithLocation[recentWithLocation.length - 1];
    if (!lastAttempt.location?.coordinates) return 0;
    
    const distance = this.calculateHaversineDistance(
      loginAttempt.location.coordinates.lat,
      loginAttempt.location.coordinates.lng,
      lastAttempt.location.coordinates.lat,
      lastAttempt.location.coordinates.lng
    );
    
    const timeDiff = Math.abs(loginAttempt.timestamp.getTime() - lastAttempt.timestamp.getTime()) / (1000 * 60 * 60);
    
    // Prevent division by zero
    if (timeDiff === 0) return distance > 50 ? 1 : 0; // If same time, check if different location
    
    const velocity = distance / timeDiff;
    
    // Normalize velocity (0-1 scale)
    return Math.min(1, Math.max(0, velocity / this.config.limits.maxReasonableVelocity));
  }

  private calculateDeviceAnomaly(loginAttempt: LoginAttempt, userProfile: UserProfile): number {
    if (!loginAttempt.deviceFingerprint) return 0.4; // Medium risk if no fingerprint
    
    const knownDevice = userProfile.typicalDevices.find(
      device => device.fingerprint === loginAttempt.deviceFingerprint
    );
    
    if (knownDevice) {
      const daysSinceLastSeen = (Date.now() - knownDevice.lastSeen.getTime()) / (1000 * 60 * 60 * 24);
      
      // Risk increases if device hasn't been seen for a while
      if (daysSinceLastSeen > 30) return 0.4;
      if (daysSinceLastSeen > 7) return 0.2;
      return 0.1;
    }
    
    return 0.6; // High risk for completely new device
  }

  private calculateBruteForceRisk(loginAttempt: LoginAttempt, recentAttempts: LoginAttempt[]): number {
    const cutoffTime = new Date(
      loginAttempt.timestamp.getTime() - this.config.timeWindows.bruteForceWindow * 60 * 1000
    );
    
    const recentFailedAttempts = recentAttempts.filter(
      attempt => attempt.timestamp >= cutoffTime &&
                 !attempt.success &&
                 attempt.ipAddress === loginAttempt.ipAddress
    );
    
    // Normalize failed attempts (0-1 scale, with 10+ attempts = max risk)
    return Math.min(1, recentFailedAttempts.length / 10);
  }

  private calculateCredentialStuffingRisk(loginAttempt: LoginAttempt, recentAttempts: LoginAttempt[]): number {
    const cutoffTime = new Date(
      loginAttempt.timestamp.getTime() - this.config.timeWindows.bruteForceWindow * 60 * 1000
    );
    
    const uniqueUsersFromIp = new Set(
      recentAttempts
        .filter(attempt => attempt.timestamp >= cutoffTime &&
                          attempt.ipAddress === loginAttempt.ipAddress &&
                          !attempt.success)
        .map(attempt => attempt.userId)
        .filter(userId => userId)
    );
    
    // Normalize unique users (0-1 scale, with 20+ users = max risk)
    return Math.min(1, uniqueUsersFromIp.size / 20);
  }

  private calculateFrequencyAnomaly(loginAttempt: LoginAttempt, recentAttempts: LoginAttempt[]): number {
    const cutoffTime = new Date(
      loginAttempt.timestamp.getTime() - this.config.timeWindows.frequencyWindow * 60 * 60 * 1000
    );
    
    const recentUserAttempts = recentAttempts.filter(
      attempt => attempt.timestamp >= cutoffTime &&
                 attempt.userId === loginAttempt.userId
    );
    
    // Normalize frequency (0-1 scale, with 20+ attempts in 24h = max risk)
    return Math.min(1, recentUserAttempts.length / 20);
  }

  private async checkThreatIntelligence(ipAddress: string): Promise<number> {
    // In a real implementation, this would check against threat intelligence feeds
    // For now, return a placeholder value
    
    // Simple heuristic: check for suspicious patterns
    const suspiciousPatterns = [
      /^(185|194|195)\./, // Some known malicious ranges (simplified)
    ];
    
    const isThreat = suspiciousPatterns.some(pattern => pattern.test(ipAddress));
    return isThreat ? 0.8 : 0.1;
  }

  private mapAccountRiskLevel(riskLevel: string): number {
    switch (riskLevel) {
      case 'low': return 0.1;
      case 'medium': return 0.4;
      case 'high': return 0.7;
      default: return 0.3;
    }
  }

  private calculateMfaBypassRisk(loginAttempt: LoginAttempt, userProfile: UserProfile): number {
    if (!userProfile.mfaEnabled) return 0; // No MFA to bypass
    if (loginAttempt.twoFactorUsed) return 0; // MFA was used
    
    return 0.8; // High risk if MFA is enabled but not used
  }

  private calculateWeightedScore(factors: RiskFactors): number {
    const locationScore = (factors.newLocation + factors.geographicDistance + factors.vpnTorDetection) / 3;
    const behavioralScore = (factors.timeAnomaly + factors.velocityAnomaly + factors.deviceAnomaly) / 3;
    const patternScore = (factors.bruteForceIndicator + factors.credentialStuffing + factors.frequencyAnomaly) / 3;
    const contextualScore = (factors.threatIntelligence + factors.accountRiskLevel + factors.mfaBypass) / 3;
    
    const weightedScore = 
      (locationScore * this.config.weights.location) +
      (behavioralScore * this.config.weights.behavioral) +
      (patternScore * this.config.weights.patterns) +
      (contextualScore * this.config.weights.contextual);
    
    return weightedScore * 100; // Convert to 0-100 scale
  }

  private calculateConfidence(
    loginAttempt: LoginAttempt,
    userProfile: UserProfile,
    recentAttempts: LoginAttempt[]
  ): number {
    let confidence = 0.5; // Base confidence
    
    // Increase confidence based on available data
    if (loginAttempt.location) confidence += 0.1;
    if (loginAttempt.deviceFingerprint) confidence += 0.1;
    if (userProfile.typicalLocations.length > 0) confidence += 0.1;
    if (userProfile.typicalDevices.length > 0) confidence += 0.1;
    if (userProfile.accountAge > 30) confidence += 0.1; // Mature account
    if (recentAttempts.length > 10) confidence += 0.1; // Good historical data
    
    return Math.min(1, confidence);
  }

  private determineSeverity(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= this.config.thresholds.critical) return 'critical';
    if (score >= this.config.thresholds.high) return 'high';
    if (score >= this.config.thresholds.medium) return 'medium';
    return 'low';
  }

  private generateRecommendations(factors: RiskFactors, score: number): string[] {
    const recommendations: string[] = [];
    
    if (factors.newLocation > 0.5) {
      recommendations.push('Verify login from new location with additional authentication');
    }
    
    if (factors.bruteForceIndicator > 0.5) {
      recommendations.push('Consider blocking IP address due to brute force pattern');
    }
    
    if (factors.credentialStuffing > 0.5) {
      recommendations.push('Implement CAPTCHA or additional verification');
    }
    
    if (factors.mfaBypass > 0.5) {
      recommendations.push('Enforce multi-factor authentication');
    }
    
    if (factors.velocityAnomaly > 0.0001) {
      recommendations.push('Review for impossible travel patterns');
    }
    
    if (factors.threatIntelligence > 0.6) {
      recommendations.push('IP address flagged in threat intelligence - consider blocking');
    }
    
    if (score >= this.config.thresholds.high) {
      recommendations.push('Escalate to security team for manual review');
    }
    
    return recommendations;
  }

  private generateExplanation(factors: RiskFactors, score: number): string {
    const highFactors: string[] = [];
    
    if (factors.newLocation > 0.5) highFactors.push('new geographic location');
    if (factors.velocityAnomaly > 0.5) highFactors.push('unusual travel velocity');
    if (factors.timeAnomaly > 0.5) highFactors.push('atypical login time');
    if (factors.bruteForceIndicator > 0.5) highFactors.push('brute force pattern detected');
    if (factors.credentialStuffing > 0.5) highFactors.push('credential stuffing indicators');
    if (factors.deviceAnomaly > 0.5) highFactors.push('unrecognized device');
    if (factors.threatIntelligence > 0.5) highFactors.push('threat intelligence alerts');
    if (factors.mfaBypass > 0.5) highFactors.push('MFA bypass attempt');
    
    if (highFactors.length === 0) {
      return `Risk score of ${score} based on normal login patterns with no significant anomalies detected.`;
    }
    
    return `Risk score of ${score} due to: ${highFactors.join(', ')}. Multiple risk factors indicate potential security concern.`;
  }

  private calculateHaversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.degreesToRadians(lat2 - lat1);
    const dLng = this.degreesToRadians(lng2 - lng1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.degreesToRadians(lat1)) * Math.cos(this.degreesToRadians(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}