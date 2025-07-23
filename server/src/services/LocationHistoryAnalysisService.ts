// Location History Analysis Service
// Enhanced security insights and user behavior pattern analysis

import { DatabaseService } from '../auth/database/DatabaseService';
import { RedisService } from '../auth/database/RedisService';
import { AuditService } from '../auth/services/AuditService';
import { LocationData } from './LocationDetectionService';

export interface LocationCluster {
  id: string;
  label: 'home' | 'work' | 'frequent' | 'occasional';
  centerpoint: {
    latitude: number;
    longitude: number;
    country: string;
    city: string;
  };
  radius: number; // in kilometers
  accessCount: number;
  firstSeen: Date;
  lastSeen: Date;
  confidence: number; // 0-1 scale
  riskScore: number; // 0-100 scale
  isVerified: boolean;
  verificationMethod?: 'user_confirmed' | 'pattern_analysis' | 'device_correlation';
}

export interface TravelPattern {
  routeId: string;
  origin: LocationCluster;
  destination: LocationCluster;
  frequency: number;
  averageTravelTime: number; // in minutes
  typicalTravelMethods: string[]; // ['air', 'ground', 'unknown']
  riskScore: number;
  anomalies: {
    unusualSpeed: boolean;
    impossibleTiming: boolean;
    frequencyAnomaly: boolean;
  };
}

export interface UserLocationProfile {
  userId: string;
  clusters: LocationCluster[];
  travelPatterns: TravelPattern[];
  riskMetrics: {
    mobilityScore: number; // 0-100, higher = more mobile
    predictabilityScore: number; // 0-100, higher = more predictable
    riskScore: number; // 0-100, overall location-based risk
    anomalyCount: number;
  };
  insights: {
    primaryLocation?: LocationCluster;
    secondaryLocation?: LocationCluster;
    travelFrequency: 'low' | 'medium' | 'high';
    timeZoneComplexity: 'simple' | 'moderate' | 'complex';
    locationDiversity: number; // unique countries accessed
  };
  lastAnalyzed: Date;
  profileVersion: string;
}

export interface LocationAnomaly {
  id: string;
  userId: string;
  anomalyType: 'new_location' | 'unusual_timing' | 'frequency_spike' | 'travel_anomaly' | 'risk_escalation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  detectedAt: Date;
  location: LocationData;
  context: {
    expectedLocation?: LocationCluster;
    travelTime?: number;
    distanceFromExpected?: number;
    riskFactors: string[];
  };
  resolved: boolean;
  falsePositive: boolean;
  resolution?: {
    resolvedBy: string;
    resolvedAt: Date;
    resolution: string;
    preventFutureAlerts: boolean;
  };
}

export interface LocationRiskAssessment {
  overall: number;
  factors: {
    locationNovelty: number;
    travelPatternDeviation: number;
    temporalAnomalies: number;
    frequencyAnomalies: number;
    geopoliticalRisk: number;
    networkRisk: number;
  };
  recommendations: string[];
  actionRequired: boolean;
  suggestedActions: string[];
}

export interface LocationHistoryAnalysisConfig {
  enabled: boolean;
  
  // Clustering parameters
  clustering: {
    minPointsForCluster: number;
    maxDistanceKm: number;
    minTimeForHomeDetection: number; // days
    confidenceThreshold: number;
  };
  
  // Travel analysis
  travelAnalysis: {
    enabled: boolean;
    maxReasonableSpeedKmh: number;
    minTravelDistanceKm: number;
    anomalyDetectionSensitivity: 'low' | 'medium' | 'high';
  };
  
  // Risk scoring
  riskScoring: {
    noveltyWeight: number;
    frequencyWeight: number;
    geopoliticalWeight: number;
    temporalWeight: number;
  };
  
  // Anomaly detection
  anomalyDetection: {
    enabled: boolean;
    sensitivityLevel: number; // 0-1
    falsePositiveThreshold: number;
    autoResolveAfterDays: number;
  };
  
  // Caching and performance
  cache: {
    profileCacheTtl: number;
    analysisCacheTtl: number;
    batchAnalysisSize: number;
  };
}

export class LocationHistoryAnalysisService {
  private db: DatabaseService;
  private redis: RedisService;
  private auditService: AuditService;
  private config: LocationHistoryAnalysisConfig;

  constructor(
    db: DatabaseService,
    redis: RedisService,
    auditService: AuditService,
    config: LocationHistoryAnalysisConfig
  ) {
    this.db = db;
    this.redis = redis;
    this.auditService = auditService;
    this.config = config;
  }

  async initialize(): Promise<void> {
    // Create additional tables for history analysis
    await this.initializeAnalysisTables();
    
    // Load existing user profiles into cache
    await this.loadProfileCache();
    
    console.log('Location History Analysis Service initialized');
  }

  private async initializeAnalysisTables(): Promise<void> {
    // Location clusters table
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS user_location_clusters (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        label VARCHAR(20) NOT NULL CHECK (label IN ('home', 'work', 'frequent', 'occasional')),
        center_latitude DECIMAL(10, 8) NOT NULL,
        center_longitude DECIMAL(11, 8) NOT NULL,
        center_country VARCHAR(100),
        center_city VARCHAR(100),
        radius_km DECIMAL(8, 2) NOT NULL,
        access_count INTEGER DEFAULT 0,
        first_seen TIMESTAMP NOT NULL,
        last_seen TIMESTAMP NOT NULL,
        confidence DECIMAL(3, 2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
        risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
        is_verified BOOLEAN DEFAULT false,
        verification_method VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Travel patterns table
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS user_travel_patterns (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        route_id VARCHAR(100) NOT NULL,
        origin_cluster_id UUID REFERENCES user_location_clusters(id),
        destination_cluster_id UUID REFERENCES user_location_clusters(id),
        frequency INTEGER DEFAULT 1,
        avg_travel_time_minutes INTEGER,
        typical_travel_methods JSONB,
        risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
        anomalies JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // User location profiles table
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS user_location_profiles (
        user_id UUID PRIMARY KEY,
        clusters_data JSONB NOT NULL,
        travel_patterns_data JSONB NOT NULL,
        risk_metrics JSONB NOT NULL,
        insights JSONB NOT NULL,
        last_analyzed TIMESTAMP DEFAULT NOW(),
        profile_version VARCHAR(20) DEFAULT '1.0',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Location anomalies table
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS location_anomalies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        anomaly_type VARCHAR(50) NOT NULL,
        severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
        description TEXT NOT NULL,
        detected_at TIMESTAMP DEFAULT NOW(),
        location_data JSONB NOT NULL,
        context_data JSONB,
        resolved BOOLEAN DEFAULT false,
        false_positive BOOLEAN DEFAULT false,
        resolution_data JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create indexes for performance
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_location_clusters_user_id ON user_location_clusters(user_id);
      CREATE INDEX IF NOT EXISTS idx_location_clusters_label ON user_location_clusters(label);
      CREATE INDEX IF NOT EXISTS idx_location_clusters_confidence ON user_location_clusters(confidence);
      
      CREATE INDEX IF NOT EXISTS idx_travel_patterns_user_id ON user_travel_patterns(user_id);
      CREATE INDEX IF NOT EXISTS idx_travel_patterns_route ON user_travel_patterns(route_id);
      CREATE INDEX IF NOT EXISTS idx_travel_patterns_frequency ON user_travel_patterns(frequency);
      
      CREATE INDEX IF NOT EXISTS idx_location_profiles_analyzed ON user_location_profiles(last_analyzed);
      CREATE INDEX IF NOT EXISTS idx_location_profiles_version ON user_location_profiles(profile_version);
      
      CREATE INDEX IF NOT EXISTS idx_location_anomalies_user_id ON location_anomalies(user_id);
      CREATE INDEX IF NOT EXISTS idx_location_anomalies_severity ON location_anomalies(severity);
      CREATE INDEX IF NOT EXISTS idx_location_anomalies_resolved ON location_anomalies(resolved);
      CREATE INDEX IF NOT EXISTS idx_location_anomalies_type ON location_anomalies(anomaly_type);
    `);
  }

  private async loadProfileCache(): Promise<void> {
    // Load frequently accessed profiles into Redis cache
    const recentProfiles = await this.db.query(`
      SELECT user_id, profile_version 
      FROM user_location_profiles 
      WHERE last_analyzed >= NOW() - INTERVAL '7 days' 
      ORDER BY last_analyzed DESC 
      LIMIT 1000
    `);

    for (const profile of recentProfiles.rows) {
      const cacheKey = `location_profile:${profile.user_id}`;
      await this.redis.setex(cacheKey, this.config.cache.profileCacheTtl, JSON.stringify({
        version: profile.profile_version,
        lastAnalyzed: profile.last_analyzed
      }));
    }
  }

  async analyzeUserLocationHistory(userId: string, forceRefresh = false): Promise<UserLocationProfile> {
    const cacheKey = `location_profile:${userId}`;
    
    // Check cache first unless force refresh is requested
    if (!forceRefresh) {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        const profile = JSON.parse(cached);
        // Check if profile is recent enough
        const lastAnalyzed = new Date(profile.lastAnalyzed);
        const stalenessThreshold = new Date(Date.now() - this.config.cache.analysisCacheTtl * 1000);
        
        if (lastAnalyzed > stalenessThreshold) {
          return await this.getStoredProfile(userId);
        }
      }
    }

    // Get user's location history
    const locationHistory = await this.getUserLocationHistory(userId);
    
    if (locationHistory.length === 0) {
      throw new Error('Insufficient location history for analysis');
    }

    // Perform comprehensive analysis
    const clusters = await this.performLocationClustering(userId, locationHistory);
    const travelPatterns = await this.analyzeTravelPatterns(userId, clusters, locationHistory);
    const riskMetrics = await this.calculateRiskMetrics(userId, clusters, travelPatterns);
    const insights = await this.generateLocationInsights(clusters, travelPatterns, riskMetrics);

    const profile: UserLocationProfile = {
      userId,
      clusters,
      travelPatterns,
      riskMetrics,
      insights,
      lastAnalyzed: new Date(),
      profileVersion: '1.0'
    };

    // Store profile in database and cache
    await this.storeUserProfile(profile);
    await this.redis.setex(cacheKey, this.config.cache.profileCacheTtl, JSON.stringify(profile));

    // Log analysis completion
    await this.auditService.logEvent({
      userId,
      action: 'location_history_analyzed',
      details: {
        clustersFound: clusters.length,
        travelPatternsFound: travelPatterns.length,
        overallRiskScore: riskMetrics.riskScore
      },
      severity: 'info'
    });

    return profile;
  }

  private async getUserLocationHistory(userId: string): Promise<Array<{
    location: LocationData;
    accessTime: Date;
    accessCount: number;
  }>> {
    const result = await this.db.query(`
      SELECT 
        ip_address, country, country_code, region, city,
        latitude, longitude, timezone, isp, organization,
        is_proxy, is_vpn, is_tor, is_malicious,
        last_access, access_count
      FROM user_location_history 
      WHERE user_id = $1 
        AND latitude IS NOT NULL 
        AND longitude IS NOT NULL
      ORDER BY last_access DESC
    `, [userId]);

    return result.rows.map(row => ({
      location: {
        ipAddress: row.ip_address,
        country: row.country,
        countryCode: row.country_code,
        region: row.region,
        city: row.city,
        latitude: row.latitude,
        longitude: row.longitude,
        timezone: row.timezone,
        isp: row.isp,
        organization: row.organization,
        isProxy: row.is_proxy,
        isVpn: row.is_vpn,
        isTor: row.is_tor,
        isMalicious: row.is_malicious
      },
      accessTime: row.last_access,
      accessCount: row.access_count
    }));
  }

  private async performLocationClustering(
    userId: string,
    locationHistory: Array<{location: LocationData; accessTime: Date; accessCount: number}>
  ): Promise<LocationCluster[]> {
    const clusters: LocationCluster[] = [];
    const processedLocations = new Set<string>();

    // Sort by access frequency and recency
    const sortedLocations = locationHistory.sort((a, b) => {
      const scoreA = a.accessCount * 0.7 + (Date.now() - a.accessTime.getTime()) / (1000 * 60 * 60 * 24) * 0.3;
      const scoreB = b.accessCount * 0.7 + (Date.now() - b.accessTime.getTime()) / (1000 * 60 * 60 * 24) * 0.3;
      return scoreB - scoreA;
    });

    for (const locationEntry of sortedLocations) {
      const locationKey = `${locationEntry.location.latitude},${locationEntry.location.longitude}`;
      
      if (processedLocations.has(locationKey)) {
        continue;
      }

      // Find nearby locations that could be part of this cluster
      const nearbyLocations = locationHistory.filter(other => {
        if (other === locationEntry) return true;
        
        const distance = this.calculateDistance(
          locationEntry.location.latitude!,
          locationEntry.location.longitude!,
          other.location.latitude!,
          other.location.longitude!
        );
        
        return distance <= this.config.clustering.maxDistanceKm;
      });

      if (nearbyLocations.length >= this.config.clustering.minPointsForCluster) {
        // Calculate cluster center
        const centerLat = nearbyLocations.reduce(
          (sum,
            loc
          ) => sum + loc.location.latitude!, 0) / nearbyLocations.length;
        const centerLon = nearbyLocations.reduce(
          (sum,
            loc
          ) => sum + loc.location.longitude!, 0) / nearbyLocations.length;
        
        // Calculate cluster metrics
        const totalAccess = nearbyLocations.reduce((sum, loc) => sum + loc.accessCount, 0);
        const firstSeen = new Date(Math.min(...nearbyLocations.map(loc => loc.accessTime.getTime())));
        const lastSeen = new Date(Math.max(...nearbyLocations.map(loc => loc.accessTime.getTime())));
        
        // Determine cluster label based on frequency and time patterns
        const label = this.determineClusterLabel(nearbyLocations, totalAccess, firstSeen, lastSeen);
        
        // Calculate confidence based on access patterns
        const confidence = Math.min(1.0, totalAccess / 10 * 0.5 + nearbyLocations.length / 5 * 0.5);
        
        // Calculate risk score
        const riskScore = this.calculateClusterRiskScore(nearbyLocations);

        const cluster: LocationCluster = {
          id: `cluster_${clusters.length + 1}`,
          label,
          centerpoint: {
            latitude: centerLat,
            longitude: centerLon,
            country: locationEntry.location.country || 'Unknown',
            city: locationEntry.location.city || 'Unknown'
          },
          radius: Math.max(...nearbyLocations.map(loc => 
            this.calculateDistance(centerLat, centerLon, loc.location.latitude!, loc.location.longitude!)
          )),
          accessCount: totalAccess,
          firstSeen,
          lastSeen,
          confidence,
          riskScore,
          isVerified: false
        };

        clusters.push(cluster);

        // Mark these locations as processed
        nearbyLocations.forEach(loc => {
          const key = `${loc.location.latitude},${loc.location.longitude}`;
          processedLocations.add(key);
        });
      }
    }

    return clusters;
  }

  private determineClusterLabel(
    locations: Array<{location: LocationData; accessTime: Date; accessCount: number}>,
    totalAccess: number,
    firstSeen: Date,
    _____lastSeen: Date
  ): 'home' | 'work' | 'frequent' | 'occasional' {
    const daysSinceFirst = (Date.now() - firstSeen.getTime()) / (1000 * 60 * 60 * 24);
    const accessFrequency = totalAccess / Math.max(1, daysSinceFirst);

    // Analyze time patterns to distinguish home vs work
    const accessHours = locations.map(loc => loc.accessTime.getHours());
    const eveningAccess = accessHours.filter(hour => hour >= 18 || hour <= 6).length;
    const businessAccess = accessHours.filter(hour => hour >= 9 && hour <= 17).length;

    if (accessFrequency > 0.5 && daysSinceFirst > this.config.clustering.minTimeForHomeDetection) {
      // High frequency, long-term location
      if (eveningAccess > businessAccess) {
        return 'home';
      } else if (businessAccess > eveningAccess * 1.5) {
        return 'work';
      } else {
        return 'frequent';
      }
    } else if (totalAccess >= 5) {
      return 'frequent';
    } else {
      return 'occasional';
    }
  }

  private calculateClusterRiskScore(
    locations: Array<{location: LocationData; accessTime: Date; accessCount: number}>
  ): number {
    let riskScore = 0;

    // Check for proxy/VPN usage
    const proxyCount = locations.filter(loc => loc.location.isProxy || loc.location.isVpn).length;
    riskScore += (proxyCount / locations.length) * 30;

    // Check for malicious IPs
    const maliciousCount = locations.filter(loc => loc.location.isMalicious).length;
    riskScore += (maliciousCount / locations.length) * 40;

    // Check for Tor usage
    const torCount = locations.filter(loc => loc.location.isTor).length;
    riskScore += (torCount / locations.length) * 50;

    // Time-based anomalies (accessing at unusual hours)
    const unusualHourAccess = locations.filter(loc => {
      const hour = loc.accessTime.getHours();
      return hour >= 2 && hour <= 5; // 2 AM to 5 AM is unusual
    }).length;
    riskScore += (unusualHourAccess / locations.length) * 20;

    return Math.min(100, Math.round(riskScore));
  }

  private async analyzeTravelPatterns(
    userId: string,
    clusters: LocationCluster[],
    locationHistory: Array<{location: LocationData; accessTime: Date; accessCount: number}>
  ): Promise<TravelPattern[]> {
    const patterns: TravelPattern[] = [];
    const travelRoutes = new Map<string, {
      count: number;
      travelTimes: number[];
      origin: LocationCluster;
      destination: LocationCluster;
    }>();

    // Sort location history by time
    const sortedHistory = locationHistory.sort((a, b) => a.accessTime.getTime() - b.accessTime.getTime());

    // Analyze sequential location pairs for travel patterns
    for (let i = 0; i < sortedHistory.length - 1; i++) {
      const current = sortedHistory[i];
      const next = sortedHistory[i + 1];

      // Find which clusters these locations belong to
      const currentCluster = this.findNearestCluster(current.location, clusters);
      const nextCluster = this.findNearestCluster(next.location, clusters);

      if (currentCluster && nextCluster && currentCluster.id !== nextCluster.id) {
        const routeKey = `${currentCluster.id}->${nextCluster.id}`;
        const travelTime = (next.accessTime.getTime() - current.accessTime.getTime()) / (1000 * 60); // minutes

        if (!travelRoutes.has(routeKey)) {
          travelRoutes.set(routeKey, {
            count: 0,
            travelTimes: [],
            origin: currentCluster,
            destination: nextCluster
          });
        }

        const route = travelRoutes.get(routeKey)!;
        route.count++;
        route.travelTimes.push(travelTime);
      }
    }

    // Convert routes to travel patterns
    for (const [routeId, route] of travelRoutes) {
      if (route.count >= 2) { // Only consider routes used multiple times
        const avgTravelTime = route.travelTimes.reduce((sum, time) => sum + time, 0) / route.travelTimes.length;
        
        // Calculate distance between clusters
        const distance = this.calculateDistance(
          route.origin.centerpoint.latitude,
          route.origin.centerpoint.longitude,
          route.destination.centerpoint.latitude,
          route.destination.centerpoint.longitude
        );

        // Determine typical travel methods based on distance and time
        const typicalMethods = this.determineTravelMethods(distance, avgTravelTime);
        
        // Detect anomalies
        const anomalies = this.detectTravelAnomalies(distance, route.travelTimes, avgTravelTime);
        
        // Calculate risk score for this travel pattern
        const riskScore = this.calculateTravelRiskScore(route, distance, anomalies);

        const pattern: TravelPattern = {
          routeId,
          origin: route.origin,
          destination: route.destination,
          frequency: route.count,
          averageTravelTime: Math.round(avgTravelTime),
          typicalTravelMethods: typicalMethods,
          riskScore,
          anomalies
        };

        patterns.push(pattern);
      }
    }

    return patterns;
  }

  private findNearestCluster(location: LocationData, clusters: LocationCluster[]): LocationCluster | null {
    let nearestCluster: LocationCluster | null = null;
    let minDistance = Infinity;

    for (const cluster of clusters) {
      const distance = this.calculateDistance(
        location.latitude!,
        location.longitude!,
        cluster.centerpoint.latitude,
        cluster.centerpoint.longitude
      );

      if (distance <= cluster.radius && distance < minDistance) {
        minDistance = distance;
        nearestCluster = cluster;
      }
    }

    return nearestCluster;
  }

  private determineTravelMethods(distance: number, avgTravelTimeMinutes: number): string[] {
    const methods: string[] = [];
    const speedKmh = (distance / avgTravelTimeMinutes) * 60;

    if (speedKmh < 5) {
      methods.push('walking');
    } else if (speedKmh < 25) {
      methods.push('ground');
    } else if (speedKmh < 120) {
      methods.push('highway');
    } else if (speedKmh < 900) {
      methods.push('air');
    } else {
      methods.push('unknown');
    }

    return methods;
  }

  private detectTravelAnomalies(
    distance: number,
    travelTimes: number[],
    avgTravelTime: number
  ): {
    unusualSpeed: boolean;
    impossibleTiming: boolean;
    frequencyAnomaly: boolean;
  } {
    const maxReasonableSpeed = this.config.travelAnalysis.maxReasonableSpeedKmh;
    const minTravelTime = travelTimes.length > 0 ? Math.min(...travelTimes) : avgTravelTime;
    const maxSpeedKmh = (distance / minTravelTime) * 60;

    return {
      unusualSpeed: maxSpeedKmh > maxReasonableSpeed,
      impossibleTiming: minTravelTime < 5 && distance > 10, // Less than 5 minutes for > 10km
      frequencyAnomaly: travelTimes.some(time => Math.abs(time - avgTravelTime) > avgTravelTime * 2)
    };
  }

  private calculateTravelRiskScore(
    route: {count: number; travelTimes: number[]},
    distance: number,
    anomalies: {unusualSpeed: boolean; impossibleTiming: boolean; frequencyAnomaly: boolean}
  ): number {
    let riskScore = 0;

    // Base risk on anomalies
    if (anomalies.impossibleTiming) riskScore += 40;
    if (anomalies.unusualSpeed) riskScore += 30;
    if (anomalies.frequencyAnomaly) riskScore += 20;

    // Risk based on travel frequency (very low frequency might be suspicious)
    if (route.count < 3) riskScore += 15;

    // Risk based on distance (very long distance travels might be riskier)
    if (distance > 1000) riskScore += 10;

    return Math.min(100, riskScore);
  }

  private async calculateRiskMetrics(
    userId: string,
    clusters: LocationCluster[],
    travelPatterns: TravelPattern[]
  ): Promise<UserLocationProfile['riskMetrics']> {
    // Calculate mobility score (how often user travels)
    const mobilityScore = Math.min(100, (travelPatterns.length * 10) + (clusters.length * 5));

    // Calculate predictability score (how consistent are patterns)
    const highConfidenceClusters = clusters.filter(c => c.confidence > 0.7).length;
    const predictabilityScore = Math.min(100, (highConfidenceClusters / Math.max(1, clusters.length)) * 100);

    // Calculate overall risk score
    const clusterRiskAvg = clusters.length > 0 
      ? clusters.reduce((sum, c) => sum + c.riskScore, 0) / clusters.length 
      : 0;
    const travelRiskAvg = travelPatterns.length > 0
      ? travelPatterns.reduce((sum, p) => sum + p.riskScore, 0) / travelPatterns.length
      : 0;
    
    const riskScore = Math.round((clusterRiskAvg * 0.6) + (travelRiskAvg * 0.4));

    // Count recent anomalies
    const anomalyCount = await this.getRecentAnomalyCount(userId);

    return {
      mobilityScore,
      predictabilityScore,
      riskScore,
      anomalyCount
    };
  }

  private async getRecentAnomalyCount(userId: string): Promise<number> {
    const result = await this.db.query(`
      SELECT COUNT(*) as count 
      FROM location_anomalies 
      WHERE user_id = $1 
        AND detected_at >= NOW() - INTERVAL '30 days'
        AND NOT resolved
    `, [userId]);

    return parseInt(result.rows[0].count);
  }

  private async generateLocationInsights(
    clusters: LocationCluster[],
    travelPatterns: TravelPattern[],
    _____riskMetrics: UserLocationProfile['riskMetrics']
  ): Promise<UserLocationProfile['insights']> {
    // Find primary location (highest confidence home or work)
    const primaryLocation = clusters
      .filter(c => c.label === 'home' || c.label === 'work')
      .sort((a, b) => b.confidence - a.confidence)[0];

    // Find secondary location
    const secondaryLocation = clusters
      .filter(c => c !== primaryLocation && (c.label === 'home' || c.label === 'work' || c.label === 'frequent'))
      .sort((a, b) => b.confidence - a.confidence)[0];

    // Determine travel frequency
    const totalTravels = travelPatterns.reduce((sum, p) => sum + p.frequency, 0);
    let travelFrequency: 'low' | 'medium' | 'high';
    if (totalTravels < 5) travelFrequency = 'low';
    else if (totalTravels < 20) travelFrequency = 'medium';
    else travelFrequency = 'high';

    // Analyze timezone complexity
    const uniqueTimezones = new Set(clusters.map(c => this.getTimezoneFromLocation(c.centerpoint)));
    let timeZoneComplexity: 'simple' | 'moderate' | 'complex';
    if (uniqueTimezones.size <= 1) timeZoneComplexity = 'simple';
    else if (uniqueTimezones.size <= 3) timeZoneComplexity = 'moderate';
    else timeZoneComplexity = 'complex';

    // Calculate location diversity
    const uniqueCountries = new Set(clusters.map(c => c.centerpoint.country));
    const locationDiversity = uniqueCountries.size;

    return {
      primaryLocation,
      secondaryLocation,
      travelFrequency,
      timeZoneComplexity,
      locationDiversity
    };
  }

  private getTimezoneFromLocation(location: {country: string; city: string}): string {
    // Simplified timezone mapping - in production, use a proper timezone library
    const timezoneMap: Record<string, string> = {
      'United States': 'America/New_York',
      'United Kingdom': 'Europe/London',
      'Germany': 'Europe/Berlin',
      'Japan': 'Asia/Tokyo',
      'Australia': 'Australia/Sydney'
    };

    return timezoneMap[location.country] || 'UTC';
  }

  private async storeUserProfile(profile: UserLocationProfile): Promise<void> {
    await this.db.query(`
      INSERT INTO user_location_profiles (
        user_id, clusters_data, travel_patterns_data, risk_metrics, insights,
        last_analyzed, profile_version
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (user_id)
      DO UPDATE SET
        clusters_data = $2,
        travel_patterns_data = $3,
        risk_metrics = $4,
        insights = $5,
        last_analyzed = $6,
        profile_version = $7,
        updated_at = NOW()
    `, [
      profile.userId,
      JSON.stringify(profile.clusters),
      JSON.stringify(profile.travelPatterns),
      JSON.stringify(profile.riskMetrics),
      JSON.stringify(profile.insights),
      profile.lastAnalyzed,
      profile.profileVersion
    ]);

    // Store individual clusters
    for (const cluster of profile.clusters) {
      await this.db.query(`
        INSERT INTO user_location_clusters (
          id, user_id, label, center_latitude, center_longitude,
          center_country, center_city, radius_km, access_count,
          first_seen, last_seen, confidence, risk_score, is_verified,
          verification_method
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        ON CONFLICT (id)
        DO UPDATE SET
          access_count = $9,
          last_seen = $11,
          confidence = $12,
          risk_score = $13,
          updated_at = NOW()
      `, [
        cluster.id, profile.userId, cluster.label,
        cluster.centerpoint.latitude, cluster.centerpoint.longitude,
        cluster.centerpoint.country, cluster.centerpoint.city,
        cluster.radius, cluster.accessCount, cluster.firstSeen,
        cluster.lastSeen, cluster.confidence, cluster.riskScore,
        cluster.isVerified, cluster.verificationMethod
      ]);
    }

    // Store travel patterns
    for (const pattern of profile.travelPatterns) {
      await this.db.query(`
        INSERT INTO user_travel_patterns (
          user_id, route_id, frequency, avg_travel_time_minutes,
          typical_travel_methods, risk_score, anomalies
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (user_id, route_id)
        DO UPDATE SET
          frequency = $3,
          avg_travel_time_minutes = $4,
          typical_travel_methods = $5,
          risk_score = $6,
          anomalies = $7,
          updated_at = NOW()
      `, [
        profile.userId, pattern.routeId, pattern.frequency,
        pattern.averageTravelTime, JSON.stringify(pattern.typicalTravelMethods),
        pattern.riskScore, JSON.stringify(pattern.anomalies)
      ]);
    }
  }

  private async getStoredProfile(userId: string): Promise<UserLocationProfile> {
    const result = await this.db.query(`
      SELECT * FROM user_location_profiles WHERE user_id = $1
    `, [userId]);

    if (result.rows.length === 0) {
      throw new Error('No stored profile found');
    }

    const row = result.rows[0];
    return {
      userId: row.user_id,
      clusters: row.clusters_data,
      travelPatterns: row.travel_patterns_data,
      riskMetrics: row.risk_metrics,
      insights: row.insights,
      lastAnalyzed: row.last_analyzed,
      profileVersion: row.profile_version
    };
  }

  async assessLocationRisk(userId: string, currentLocation: LocationData): Promise<LocationRiskAssessment> {
    const profile = await this.analyzeUserLocationHistory(userId);
    const nearestCluster = this.findNearestCluster(currentLocation, profile.clusters);

    let overall = 0;
    const factors = {
      locationNovelty: 0,
      travelPatternDeviation: 0,
      temporalAnomalies: 0,
      frequencyAnomalies: 0,
      geopoliticalRisk: 0,
      networkRisk: 0
    };

    // Calculate location novelty
    if (!nearestCluster) {
      factors.locationNovelty = 80; // Completely new location
    } else if (nearestCluster.confidence < 0.5) {
      factors.locationNovelty = 40; // Low confidence cluster
    } else {
      factors.locationNovelty = Math.max(0, 30 - (nearestCluster.confidence * 30));
    }

    // Calculate network risk
    if (currentLocation.isMalicious) factors.networkRisk = 90;
    else if (currentLocation.isTor) factors.networkRisk = 70;
    else if (currentLocation.isVpn) factors.networkRisk = 40;
    else if (currentLocation.isProxy) factors.networkRisk = 30;

    // Calculate geopolitical risk (simplified)
    const highRiskCountries = ['XX', 'YY']; // Would be configurable
    if (highRiskCountries.includes(currentLocation.countryCode || '')) {
      factors.geopoliticalRisk = 50;
    }

    // Calculate temporal anomalies
    const currentHour = new Date().getHours();
    if ((currentHour >= 2 && currentHour <= 5) && nearestCluster?.label !== 'home') {
      factors.temporalAnomalies = 40;
    }

    // Calculate overall risk
    overall = Math.round(
      factors.locationNovelty * this.config.riskScoring.noveltyWeight +
      factors.networkRisk * 0.3 +
      factors.geopoliticalRisk * this.config.riskScoring.geopoliticalWeight +
      factors.temporalAnomalies * this.config.riskScoring.temporalWeight
    );

    const recommendations: string[] = [];
    const suggestedActions: string[] = [];

    if (factors.locationNovelty > 50) {
      recommendations.push('Verify this is a legitimate access from the new location');
      suggestedActions.push('Send location verification email');
    }

    if (factors.networkRisk > 60) {
      recommendations.push('Monitor for suspicious activity due to anonymization service usage');
      suggestedActions.push('Require additional authentication factors');
    }

    if (overall > 70) {
      recommendations.push('Consider temporary account restrictions');
      suggestedActions.push('Flag for manual security review');
    }

    return {
      overall: Math.min(100, overall),
      factors,
      recommendations,
      actionRequired: overall > 60,
      suggestedActions
    };
  }

  async detectLocationAnomalies(userId: string): Promise<LocationAnomaly[]> {
    const _____profile = await this.analyzeUserLocationHistory(userId);
    const anomalies: LocationAnomaly[] = [];

    // Get recent location access
    const recentAccess = await this.db.query(`
      SELECT * FROM user_location_history 
      WHERE user_id = $1 
        AND last_access >= NOW() - INTERVAL '7 days'
      ORDER BY last_access DESC
    `, [userId]);

    for (const access of recentAccess.rows) {
      const location: LocationData = {
        ipAddress: access.ip_address,
        country: access.country,
        city: access.city,
        latitude: access.latitude,
        longitude: access.longitude
      };

      const riskAssessment = await this.assessLocationRisk(userId, location);

      if (riskAssessment.overall > 70) {
        const anomaly: LocationAnomaly = {
          id: `anomaly_${Date.now()}_${userId}`,
          userId,
          anomalyType: this.classifyAnomalyType(riskAssessment),
          severity: this.determineSeverity(riskAssessment.overall),
          description: `High-risk location access detected: ${location.city}, ${location.country}`,
          detectedAt: new Date(),
          location,
          context: {
            riskFactors: riskAssessment.recommendations
          },
          resolved: false,
          falsePositive: false
        };

        anomalies.push(anomaly);
      }
    }

    // Store anomalies in database
    for (const anomaly of anomalies) {
      await this.storeAnomaly(anomaly);
    }

    return anomalies;
  }

  private classifyAnomalyType(riskAssessment: LocationRiskAssessment): LocationAnomaly['anomalyType'] {
    if (riskAssessment.factors.locationNovelty > 50) return 'new_location';
    if (riskAssessment.factors.travelPatternDeviation > 50) return 'travel_anomaly';
    if (riskAssessment.factors.temporalAnomalies > 30) return 'unusual_timing';
    return 'risk_escalation';
  }

  private determineSeverity(riskScore: number): LocationAnomaly['severity'] {
    if (riskScore >= 90) return 'critical';
    if (riskScore >= 70) return 'high';
    if (riskScore >= 50) return 'medium';
    return 'low';
  }

  private async storeAnomaly(anomaly: LocationAnomaly): Promise<void> {
    await this.db.query(`
      INSERT INTO location_anomalies (
        id, user_id, anomaly_type, severity, description,
        detected_at, location_data, context_data
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      anomaly.id, anomaly.userId, anomaly.anomalyType,
      anomaly.severity, anomaly.description, anomaly.detectedAt,
      JSON.stringify(anomaly.location), JSON.stringify(anomaly.context)
    ]);
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    // Haversine formula for calculating distance between two points on Earth
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  async getLocationStatistics(timeframe: 'day' | 'week' | 'month' = 'week'): Promise<Record<string, unknown>> {
    const timeframes = {
      day: '1 day',
      week: '1 week',
      month: '1 month'
    };

    const profileStats = await this.db.query(`
      SELECT 
        COUNT(*) as total_profiles,
        COUNT(*) FILTER (WHERE profile_version = '1.0') as current_version_profiles,
        AVG((risk_metrics->>'riskScore')::numeric) as avg_risk_score,
        AVG((risk_metrics->>'mobilityScore')::numeric) as avg_mobility_score,
        AVG((risk_metrics->>'predictabilityScore')::numeric) as avg_predictability_score
      FROM user_location_profiles
      WHERE last_analyzed >= NOW() - INTERVAL '${timeframes[timeframe]}'
    `);

    const clusterStats = await this.db.query(`
      SELECT 
        COUNT(*) as total_clusters,
        COUNT(*) FILTER (WHERE label = 'home') as home_clusters,
        COUNT(*) FILTER (WHERE label = 'work') as work_clusters,
        COUNT(*) FILTER (WHERE label = 'frequent') as frequent_clusters,
        COUNT(*) FILTER (WHERE is_verified = true) as verified_clusters,
        AVG(confidence) as avg_confidence
      FROM user_location_clusters
      WHERE updated_at >= NOW() - INTERVAL '${timeframes[timeframe]}'
    `);

    const anomalyStats = await this.db.query(`
      SELECT 
        COUNT(*) as total_anomalies,
        COUNT(*) FILTER (WHERE severity = 'critical') as critical_anomalies,
        COUNT(*) FILTER (WHERE severity = 'high') as high_anomalies,
        COUNT(*) FILTER (WHERE resolved = true) as resolved_anomalies,
        COUNT(*) FILTER (WHERE false_positive = true) as false_positives
      FROM location_anomalies
      WHERE detected_at >= NOW() - INTERVAL '${timeframes[timeframe]}'
    `);

    return {
      timeframe,
      profiles: profileStats.rows[0],
      clusters: clusterStats.rows[0],
      anomalies: anomalyStats.rows[0],
      generatedAt: new Date().toISOString()
    };
  }
}