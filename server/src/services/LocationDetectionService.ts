// Location-Based Detection Service
// Geographic threat analysis and unusual location monitoring

import { DatabaseService } from '../auth/database/DatabaseService';
import { RedisService } from '../auth/database/RedisService';
import { AuditService } from '../auth/services/AuditService';

export interface LocationData {
  ipAddress: string;
  country?: string;
  countryCode?: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  isp?: string;
  organization?: string;
  asn?: string;
  isProxy?: boolean;
  isVpn?: boolean;
  isTor?: boolean;
  isHosting?: boolean;
  isMalicious?: boolean;
  accuracy?: number;
  lastUpdated?: Date;
}

export interface LocationHistory {
  userId: string;
  location: LocationData;
  accessCount: number;
  firstAccess: Date;
  lastAccess: Date;
  riskScore: number;
  verified: boolean;
  flagged: boolean;
  flagReason?: string;
}

export interface LocationAlert {
  id: string;
  userId: string;
  location: LocationData;
  alertType: 'new_country' | 'new_city' | 'impossible_travel' | 'proxy_detected' | 'malicious_ip' | 'high_risk_region';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  metadata: {
    previousLocation?: LocationData;
    travelDistance?: number;
    travelTime?: number;
    riskFactors: string[];
  };
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
}

export interface LocationRisk {
  overall: number;
  factors: {
    newLocation: number;
    impossibleTravel: number;
    proxyDetection: number;
    maliciousIndicators: number;
    highRiskRegion: number;
    frequencyAnomalies: number;
  };
  recommendations: string[];
}

export interface LocationDetectionConfig {
  enabled: boolean;
  
  // Geolocation providers
  providers: {
    primary: 'ipapi' | 'maxmind' | 'ipgeolocation' | 'ipstack';
    fallback?: string[];
    apiKeys: Record<string, string>;
  };

  // Risk thresholds
  riskThresholds: {
    newCountry: number;
    newCity: number;
    impossibleTravel: number;
    proxyDetection: number;
    maliciousIP: number;
  };

  // Travel detection
  impossibleTravel: {
    enabled: boolean;
    maxSpeedKmh: number; // Maximum reasonable travel speed
    minimumTimeMinutes: number; // Minimum time between locations
    alertThresholdKm: number; // Distance that triggers analysis
  };

  // Cache settings
  cache: {
    ipLocationTtl: number; // IP location cache TTL in seconds
    userLocationTtl: number; // User location cache TTL in seconds
    riskScoreTtl: number; // Risk score cache TTL in seconds
  };

  // Regional risk scoring
  regionalRisk: {
    enabled: boolean;
    highRiskCountries: string[]; // ISO country codes
    highRiskRegions: string[]; // Custom region definitions
    riskWeights: Record<string, number>;
  };

  // Notification settings
  notifications: {
    enabled: boolean;
    alertOnNewCountry: boolean;
    alertOnImpossibleTravel: boolean;
    alertOnProxyDetection: boolean;
    webhookUrl?: string;
  };
}

export class LocationDetectionService {
  private db: DatabaseService;
  private redis: RedisService;
  private auditService: AuditService;
  private config: LocationDetectionConfig;

  constructor(
    db: DatabaseService,
    redis: RedisService,
    auditService: AuditService,
    config: LocationDetectionConfig
  ) {
    this.db = db;
    this.redis = redis;
    this.auditService = auditService;
    this.config = config;
  }

  async initialize(): Promise<void> {
    // Create database tables for location tracking
    await this.initializeTables();
    
    // Load malicious IP lists
    await this.loadThreatIntelligence();
    
    console.log('Location Detection Service initialized');
  }

  private async initializeTables(): Promise<void> {
    // Create user location history table
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS user_location_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        ip_address INET NOT NULL,
        country VARCHAR(100),
        country_code VARCHAR(2),
        region VARCHAR(100),
        city VARCHAR(100),
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        timezone VARCHAR(50),
        isp VARCHAR(255),
        organization VARCHAR(255),
        asn VARCHAR(50),
        is_proxy BOOLEAN DEFAULT false,
        is_vpn BOOLEAN DEFAULT false,
        is_tor BOOLEAN DEFAULT false,
        is_hosting BOOLEAN DEFAULT false,
        is_malicious BOOLEAN DEFAULT false,
        accuracy INTEGER,
        access_count INTEGER DEFAULT 1,
        first_access TIMESTAMP DEFAULT NOW(),
        last_access TIMESTAMP DEFAULT NOW(),
        risk_score INTEGER DEFAULT 0,
        verified BOOLEAN DEFAULT false,
        flagged BOOLEAN DEFAULT false,
        flag_reason TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create location alerts table
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS location_alerts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        ip_address INET NOT NULL,
        alert_type VARCHAR(50) NOT NULL,
        severity VARCHAR(20) NOT NULL,
        description TEXT NOT NULL,
        location_data JSONB,
        metadata JSONB,
        acknowledged BOOLEAN DEFAULT false,
        acknowledged_by VARCHAR(255),
        acknowledged_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create IP geolocation cache table
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS ip_geolocation_cache (
        ip_address INET PRIMARY KEY,
        location_data JSONB NOT NULL,
        provider VARCHAR(50) NOT NULL,
        last_updated TIMESTAMP DEFAULT NOW(),
        expires_at TIMESTAMP NOT NULL
      )
    `);

    // Create malicious IP tracking table
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS malicious_ips (
        ip_address INET PRIMARY KEY,
        threat_type VARCHAR(100) NOT NULL,
        confidence INTEGER NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
        source VARCHAR(100) NOT NULL,
        description TEXT,
        first_seen TIMESTAMP DEFAULT NOW(),
        last_seen TIMESTAMP DEFAULT NOW(),
        active BOOLEAN DEFAULT true
      )
    `);

    // Create indexes for performance
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_user_location_history_user_id ON user_location_history(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_location_history_ip ON user_location_history(ip_address);
      CREATE INDEX IF NOT EXISTS idx_user_location_history_last_access ON user_location_history(last_access);
      CREATE INDEX IF NOT EXISTS idx_location_alerts_user_id ON location_alerts(user_id);
      CREATE INDEX IF NOT EXISTS idx_location_alerts_severity ON location_alerts(severity);
      CREATE INDEX IF NOT EXISTS idx_location_alerts_acknowledged ON location_alerts(acknowledged);
      CREATE INDEX IF NOT EXISTS idx_ip_geolocation_cache_expires ON ip_geolocation_cache(expires_at);
      CREATE INDEX IF NOT EXISTS idx_malicious_ips_active ON malicious_ips(active);
    `);
  }

  private async loadThreatIntelligence(): Promise<void> {
    // In a production environment, this would load from threat intelligence feeds
    // For now, we'll initialize with some known malicious IP ranges and patterns
    
    
    // This would typically integrate with threat intelligence APIs
    console.log('Threat intelligence loaded (placeholder implementation)');
  }

  async detectLocation(userId: string, ipAddress: string): Promise<LocationData> {
    try {
      // Check cache first
      const cached = await this.getCachedLocation(ipAddress);
      if (cached) {
        await this.updateLocationHistory(userId, cached);
        return cached;
      }

      // Get location from geolocation provider
      const location = await this.geolocateIP(ipAddress);
      
      // Enhance with threat intelligence
      await this.enhanceWithThreatIntel(location);
      
      // Cache the result
      await this.cacheLocation(ipAddress, location);
      
      // Update user location history
      await this.updateLocationHistory(userId, location);
      
      // Analyze for threats
      await this.analyzeLocationThreats(userId, location);

      return location;
    } catch (error) {
      console.error('Location detection error:', error);
      
      // Return basic location data with error flag
      return {
        ipAddress,
        country: 'Unknown',
        accuracy: 0,
        lastUpdated: new Date()
      };
    }
  }

  private async getCachedLocation(ipAddress: string): Promise<LocationData | null> {
    try {
      // Try Redis cache first
      const redisKey = `location:${ipAddress}`;
      const cached = await this.redis.get(redisKey);
      if (cached) {
        return JSON.parse(cached);
      }

      // Try database cache
      const result = await this.db.query(`
        SELECT location_data, last_updated 
        FROM ip_geolocation_cache 
        WHERE ip_address = $1 AND expires_at > NOW()
      `, [ipAddress]);

      if (result.rows.length > 0) {
        const location = result.rows[0].location_data;
        location.lastUpdated = result.rows[0].last_updated;
        
        // Cache in Redis for faster access
        await this.redis.setex(redisKey, this.config.cache.ipLocationTtl, JSON.stringify(location));
        
        return location;
      }

      return null;
    } catch (error) {
      console.error('Cache lookup error:', error);
      return null;
    }
  }

  private async geolocateIP(ipAddress: string): Promise<LocationData> {
    const provider = this.config.providers.primary;
    
    try {
      switch (provider) {
      case 'ipapi':
        return await this.geolocateWithIPAPI(ipAddress);
      case 'maxmind':
        return await this.geolocateWithMaxMind(ipAddress);
      case 'ipgeolocation':
        return await this.geolocateWithIPGeolocation(ipAddress);
      case 'ipstack':
        return await this.geolocateWithIPStack(ipAddress);
      default:
        throw new Error(`Unknown geolocation provider: ${provider}`);
      }
    } catch (error) {
      console.error(`Primary provider ${provider} failed:`, error);
      
      // Try fallback providers
      for (const fallbackProvider of this.config.providers.fallback || []) {
        try {
          switch (fallbackProvider) {
          case 'ipapi':
            return await this.geolocateWithIPAPI(ipAddress);
          case 'maxmind':
            return await this.geolocateWithMaxMind(ipAddress);
          case 'ipgeolocation':
            return await this.geolocateWithIPGeolocation(ipAddress);
          case 'ipstack':
            return await this.geolocateWithIPStack(ipAddress);
          }
        } catch (fallbackError) {
          console.error(`Fallback provider ${fallbackProvider} failed:`, fallbackError);
        }
      }
      
      throw new Error('All geolocation providers failed');
    }
  }

  private async geolocateWithIPAPI(ipAddress: string): Promise<LocationData> {
    // IP-API implementation (free service)
    const response = await fetch(
      `http://ip-api.com/json/${ipAddress}?fields=status,
      message,
      country,
      countryCode,
      region,
      regionName,
      city,
      lat,
      lon,
      timezone,
      isp,
      org,
      as,
      proxy,
      hosting`
    );
    const data = await response.json();
    
    if (data.status === 'fail') {
      throw new Error(data.message || 'IP-API request failed');
    }

    return {
      ipAddress,
      country: data.country,
      countryCode: data.countryCode,
      region: data.regionName,
      city: data.city,
      latitude: data.lat,
      longitude: data.lon,
      timezone: data.timezone,
      isp: data.isp,
      organization: data.org,
      asn: data.as,
      isProxy: data.proxy,
      isHosting: data.hosting,
      accuracy: 80, // IP-API generally good accuracy
      lastUpdated: new Date()
    };
  }

  private async geolocateWithMaxMind(_____ipAddress: string): Promise<LocationData> {
    // MaxMind implementation (requires license)
    // This is a placeholder - would integrate with MaxMind GeoIP2 API
    throw new Error('MaxMind integration not implemented');
  }

  private async geolocateWithIPGeolocation(ipAddress: string): Promise<LocationData> {
    // IPGeolocation.io implementation
    const apiKey = this.config.providers.apiKeys.ipgeolocation;
    if (!apiKey) {
      throw new Error('IPGeolocation API key not configured');
    }

    const response = await fetch(
      `https://api.ipgeolocation.io/ipgeo?apiKey=${apiKey}&ip=${ipAddress}&fields=country_name,
      country_code2,
      state_prov,
      city,
      latitude,
      longitude,
      time_zone,
      isp,
      organization,
      as,
      threat`
    );
    const data = await response.json();

    return {
      ipAddress,
      country: data.country_name,
      countryCode: data.country_code2,
      region: data.state_prov,
      city: data.city,
      latitude: parseFloat(data.latitude),
      longitude: parseFloat(data.longitude),
      timezone: data.time_zone?.name,
      isp: data.isp,
      organization: data.organization,
      asn: data.as,
      isProxy: data.threat?.is_proxy,
      isVpn: data.threat?.is_known_attacker,
      isTor: data.threat?.is_tor,
      isMalicious: data.threat?.is_threat,
      accuracy: 85,
      lastUpdated: new Date()
    };
  }

  private async geolocateWithIPStack(ipAddress: string): Promise<LocationData> {
    // IPStack implementation
    const apiKey = this.config.providers.apiKeys.ipstack;
    if (!apiKey) {
      throw new Error('IPStack API key not configured');
    }

    const response = await fetch(`http://api.ipstack.com/${ipAddress}?access_key=${apiKey}&security=1`);
    const data = await response.json();

    return {
      ipAddress,
      country: data.country_name,
      countryCode: data.country_code,
      region: data.region_name,
      city: data.city,
      latitude: data.latitude,
      longitude: data.longitude,
      timezone: data.time_zone?.id,
      isp: data.connection?.isp,
      asn: data.connection?.asn,
      isProxy: data.security?.is_proxy,
      isVpn: data.security?.is_vpn,
      isTor: data.security?.is_tor,
      isMalicious: data.security?.is_threat,
      accuracy: 90,
      lastUpdated: new Date()
    };
  }

  private async enhanceWithThreatIntel(location: LocationData): Promise<void> {
    // Check against malicious IP database
    const maliciousCheck = await this.db.query(`
      SELECT threat_type, confidence, source, description 
      FROM malicious_ips 
      WHERE ip_address = $1 AND active = true
    `, [location.ipAddress]);

    if (maliciousCheck.rows.length > 0) {
      location.isMalicious = true;
      // Could add threat details to location data
    }

    // Additional threat intelligence checks would go here
    // (e.g., checking against known bot networks, compromised hosts, etc.)
  }

  private async cacheLocation(ipAddress: string, location: LocationData): Promise<void> {
    try {
      const locationJson = JSON.stringify(location);
      const expiresAt = new Date(Date.now() + this.config.cache.ipLocationTtl * 1000);

      // Cache in Redis
      await this.redis.setex(
        `location:${ipAddress}`,
        this.config.cache.ipLocationTtl,
        locationJson
      );

      // Cache in database
      await this.db.query(`
        INSERT INTO ip_geolocation_cache (ip_address, location_data, provider, expires_at)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (ip_address)
        DO UPDATE SET
          location_data = $2,
          provider = $3,
          last_updated = NOW(),
          expires_at = $4
      `, [ipAddress, locationJson, this.config.providers.primary, expiresAt]);
    } catch (error) {
      console.error('Location caching error:', error);
    }
  }

  private async updateLocationHistory(userId: string, location: LocationData): Promise<void> {
    try {
      // Check if this IP/location combination exists for this user
      const existing = await this.db.query(`
        SELECT id, access_count, first_access 
        FROM user_location_history 
        WHERE user_id = $1 AND ip_address = $2
      `, [userId, location.ipAddress]);

      if (existing.rows.length > 0) {
        // Update existing record
        await this.db.query(`
          UPDATE user_location_history 
          SET 
            access_count = access_count + 1,
            last_access = NOW(),
            updated_at = NOW(),
            country = $3,
            country_code = $4,
            region = $5,
            city = $6,
            latitude = $7,
            longitude = $8,
            timezone = $9,
            isp = $10,
            organization = $11,
            is_proxy = $12,
            is_vpn = $13,
            is_tor = $14,
            is_malicious = $15
          WHERE id = $1
        `, [
          existing.rows[0].id,
          userId,
          location.ipAddress,
          location.country,
          location.countryCode,
          location.region,
          location.city,
          location.latitude,
          location.longitude,
          location.timezone,
          location.isp,
          location.organization,
          location.isProxy,
          location.isVpn,
          location.isTor,
          location.isMalicious
        ]);
      } else {
        // Insert new record
        await this.db.query(`
          INSERT INTO user_location_history (
            user_id, ip_address, country, country_code, region, city,
            latitude, longitude, timezone, isp, organization, asn,
            is_proxy, is_vpn, is_tor, is_hosting, is_malicious, accuracy
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        `, [
          userId,
          location.ipAddress,
          location.country,
          location.countryCode,
          location.region,
          location.city,
          location.latitude,
          location.longitude,
          location.timezone,
          location.isp,
          location.organization,
          location.asn,
          location.isProxy || false,
          location.isVpn || false,
          location.isTor || false,
          location.isHosting || false,
          location.isMalicious || false,
          location.accuracy || 0
        ]);
      }
    } catch (error) {
      console.error('Location history update error:', error);
    }
  }

  private async analyzeLocationThreats(userId: string, location: LocationData): Promise<void> {
    const alerts: Partial<LocationAlert>[] = [];

    // Check for new country
    const isNewCountry = await this.isNewCountry(userId, location.countryCode);
    if (isNewCountry && location.countryCode) {
      alerts.push({
        alertType: 'new_country',
        severity: 'medium',
        description: `First access from ${location.country}`,
        metadata: {
          riskFactors: ['new_geographical_location']
        }
      });
    }

    // Check for new city
    const isNewCity = await this.isNewCity(userId, location.city, location.countryCode);
    if (isNewCity && location.city) {
      alerts.push({
        alertType: 'new_city',
        severity: 'low',
        description: `First access from ${location.city}, ${location.country}`,
        metadata: {
          riskFactors: ['new_city_location']
        }
      });
    }

    // Check for impossible travel
    const travelAnalysis = await this.analyzeImpossibleTravel(userId, location);
    if (travelAnalysis.isImpossible) {
      alerts.push({
        alertType: 'impossible_travel',
        severity: 'high',
        description: `Impossible travel detected: ${travelAnalysis.distance}km in ${travelAnalysis.timeMinutes} minutes`,
        metadata: {
          previousLocation: travelAnalysis.previousLocation,
          travelDistance: travelAnalysis.distance,
          travelTime: travelAnalysis.timeMinutes,
          riskFactors: ['impossible_travel_speed']
        }
      });
    }

    // Check for proxy/VPN usage
    if (location.isProxy || location.isVpn || location.isTor) {
      const proxyType = location.isTor ? 'Tor' : location.isVpn ? 'VPN' : 'Proxy';
      alerts.push({
        alertType: 'proxy_detected',
        severity: location.isTor ? 'high' : 'medium',
        description: `${proxyType} usage detected from ${location.country}`,
        metadata: {
          riskFactors: [`${proxyType.toLowerCase()}_usage`]
        }
      });
    }

    // Check for malicious IP
    if (location.isMalicious) {
      alerts.push({
        alertType: 'malicious_ip',
        severity: 'critical',
        description: 'Access from known malicious IP address',
        metadata: {
          riskFactors: ['malicious_ip_address']
        }
      });
    }

    // Check for high-risk regions
    if (this.config.regionalRisk.enabled && location.countryCode) {
      const isHighRisk = this.config.regionalRisk.highRiskCountries.includes(location.countryCode);
      if (isHighRisk) {
        alerts.push({
          alertType: 'high_risk_region',
          severity: 'medium',
          description: `Access from high-risk region: ${location.country}`,
          metadata: {
            riskFactors: ['high_risk_geographical_region']
          }
        });
      }
    }

    // Create alerts in database
    for (const alertData of alerts) {
      await this.createLocationAlert(userId, location, alertData);
    }
  }

  private async isNewCountry(userId: string, countryCode?: string): Promise<boolean> {
    if (!countryCode) return false;

    const result = await this.db.query(`
      SELECT COUNT(*) as count 
      FROM user_location_history 
      WHERE user_id = $1 AND country_code = $2
    `, [userId, countryCode]);

    return parseInt(result.rows[0].count) === 0;
  }

  private async isNewCity(userId: string, city?: string, countryCode?: string): Promise<boolean> {
    if (!city || !countryCode) return false;

    const result = await this.db.query(`
      SELECT COUNT(*) as count 
      FROM user_location_history 
      WHERE user_id = $1 AND city = $2 AND country_code = $3
    `, [userId, city, countryCode]);

    return parseInt(result.rows[0].count) === 0;
  }

  private async analyzeImpossibleTravel(userId: string, currentLocation: LocationData): Promise<{
    isImpossible: boolean;
    distance?: number;
    timeMinutes?: number;
    previousLocation?: LocationData;
  }> {
    if (!this.config.impossibleTravel.enabled) {
      return { isImpossible: false };
    }

    // Get the most recent location (within last 24 hours)
    const recentLocation = await this.db.query(`
      SELECT latitude, longitude, last_access, country, city
      FROM user_location_history 
      WHERE user_id = $1 
        AND latitude IS NOT NULL 
        AND longitude IS NOT NULL
        AND last_access >= NOW() - INTERVAL '24 hours'
      ORDER BY last_access DESC 
      LIMIT 1
    `, [userId]);

    if (recentLocation.rows.length === 0 || !currentLocation.latitude || !currentLocation.longitude) {
      return { isImpossible: false };
    }

    const prev = recentLocation.rows[0];
    const distance = this.calculateDistance(
      prev.latitude,
      prev.longitude,
      currentLocation.latitude,
      currentLocation.longitude
    );

    const timeMinutes = (Date.now() - new Date(prev.last_access).getTime()) / (1000 * 60);
    const speedKmh = (distance / timeMinutes) * 60;

    const isImpossible = distance > this.config.impossibleTravel.alertThresholdKm &&
                        timeMinutes > this.config.impossibleTravel.minimumTimeMinutes &&
                        speedKmh > this.config.impossibleTravel.maxSpeedKmh;

    return {
      isImpossible,
      distance: Math.round(distance),
      timeMinutes: Math.round(timeMinutes),
      previousLocation: {
        ipAddress: '',
        country: prev.country,
        city: prev.city,
        latitude: prev.latitude,
        longitude: prev.longitude
      }
    };
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

  private async createLocationAlert(
    userId: string,
    location: LocationData,
    alertData: Partial<LocationAlert>
  ): Promise<void> {
    try {
      await this.db.query(`
        INSERT INTO location_alerts (
          user_id, ip_address, alert_type, severity, description, 
          location_data, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        userId,
        location.ipAddress,
        alertData.alertType,
        alertData.severity,
        alertData.description,
        JSON.stringify(location),
        JSON.stringify(alertData.metadata)
      ]);

      // Log to audit service
      await this.auditService.logEvent({
        userId,
        action: 'location_alert_created',
        details: {
          alertType: alertData.alertType,
          severity: alertData.severity,
          location: {
            country: location.country,
            city: location.city,
            ipAddress: location.ipAddress
          }
        },
        ipAddress: location.ipAddress,
        severity: alertData.severity === 'critical' ? 'error' : 'warning'
      });

      // Send notifications if configured
      if (this.config.notifications.enabled) {
        await this.sendLocationAlert(userId, location, alertData);
      }
    } catch (error) {
      console.error('Failed to create location alert:', error);
    }
  }

  private async sendLocationAlert(
    userId: string,
    location: LocationData,
    alertData: Partial<LocationAlert>
  ): Promise<void> {
    // Implementation would send alerts via webhook, email, etc.
    console.log(`Location alert: ${alertData.alertType} for user ${userId} from ${location.country}`);
  }

  async getUserLocationHistory(userId: string, limit = 50): Promise<LocationHistory[]> {
    const result = await this.db.query(`
      SELECT 
        user_id, ip_address, country, country_code, region, city,
        latitude, longitude, timezone, isp, organization,
        access_count, first_access, last_access, risk_score,
        verified, flagged, flag_reason
      FROM user_location_history 
      WHERE user_id = $1 
      ORDER BY last_access DESC 
      LIMIT $2
    `, [userId, limit]);

    return result.rows.map(row => ({
      userId: row.user_id,
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
        organization: row.organization
      },
      accessCount: row.access_count,
      firstAccess: row.first_access,
      lastAccess: row.last_access,
      riskScore: row.risk_score,
      verified: row.verified,
      flagged: row.flagged,
      flagReason: row.flag_reason
    }));
  }

  async getLocationAlerts(
    userId?: string,
    severity?: string,
    acknowledged?: boolean,
    limit = 100
  ): Promise<LocationAlert[]> {
    let query = `
      SELECT 
        id, user_id, ip_address, alert_type, severity, description,
        location_data, metadata, acknowledged, acknowledged_by,
        acknowledged_at, created_at
      FROM location_alerts 
      WHERE 1=1
    `;
    const params: unknown[] = [];
    let paramIndex = 1;

    if (userId) {
      query += ` AND user_id = $${paramIndex}`;
      params.push(userId);
      paramIndex++;
    }

    if (severity) {
      query += ` AND severity = $${paramIndex}`;
      params.push(severity);
      paramIndex++;
    }

    if (acknowledged !== undefined) {
      query += ` AND acknowledged = $${paramIndex}`;
      params.push(acknowledged);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex}`;
    params.push(limit);

    const result = await this.db.query(query, params);

    return result.rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      location: row.location_data,
      alertType: row.alert_type,
      severity: row.severity,
      description: row.description,
      metadata: row.metadata,
      timestamp: row.created_at,
      acknowledged: row.acknowledged,
      acknowledgedBy: row.acknowledged_by,
      acknowledgedAt: row.acknowledged_at
    }));
  }

  async acknowledgeAlert(alertId: string, acknowledgedBy: string): Promise<void> {
    await this.db.query(`
      UPDATE location_alerts 
      SET acknowledged = true, acknowledged_by = $2, acknowledged_at = NOW()
      WHERE id = $1
    `, [alertId, acknowledgedBy]);
  }

  async calculateLocationRisk(userId: string, location: LocationData): Promise<LocationRisk> {
    const risk: LocationRisk = {
      overall: 0,
      factors: {
        newLocation: 0,
        impossibleTravel: 0,
        proxyDetection: 0,
        maliciousIndicators: 0,
        highRiskRegion: 0,
        frequencyAnomalies: 0
      },
      recommendations: []
    };

    // Calculate individual risk factors
    if (await this.isNewCountry(userId, location.countryCode)) {
      risk.factors.newLocation = this.config.riskThresholds.newCountry;
      risk.recommendations.push('Verify this is a legitimate login from the new country');
    }

    const travelAnalysis = await this.analyzeImpossibleTravel(userId, location);
    if (travelAnalysis.isImpossible) {
      risk.factors.impossibleTravel = this.config.riskThresholds.impossibleTravel;
      risk.recommendations.push('Investigate impossible travel pattern');
    }

    if (location.isProxy || location.isVpn || location.isTor) {
      risk.factors.proxyDetection = this.config.riskThresholds.proxyDetection;
      risk.recommendations.push('Monitor proxy/VPN usage for security implications');
    }

    if (location.isMalicious) {
      risk.factors.maliciousIndicators = this.config.riskThresholds.maliciousIP;
      risk.recommendations.push('Block access from malicious IP address');
    }

    if (this.config.regionalRisk.enabled && location.countryCode &&
        this.config.regionalRisk.highRiskCountries.includes(location.countryCode)) {
      risk.factors.highRiskRegion = 30;
      risk.recommendations.push('Enhanced monitoring for high-risk region');
    }

    // Calculate overall risk score
    risk.overall = Math.min(100, Object.values(risk.factors).reduce((sum, value) => sum + value, 0));

    return risk;
  }

  async getLocationStatistics(timeframe: 'day' | 'week' | 'month' = 'week'): Promise<Record<string, unknown>> {
    const timeframes = {
      day: '1 day',
      week: '1 week',
      month: '1 month'
    };

    const stats = await this.db.query(`
      SELECT 
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(DISTINCT ip_address) as unique_ips,
        COUNT(DISTINCT country_code) as unique_countries,
        COUNT(*) FILTER (WHERE flagged = true) as flagged_locations,
        COUNT(*) FILTER (WHERE is_proxy = true) as proxy_access,
        COUNT(*) FILTER (WHERE is_vpn = true) as vpn_access,
        COUNT(*) FILTER (WHERE is_tor = true) as tor_access,
        COUNT(*) FILTER (WHERE is_malicious = true) as malicious_access,
        AVG(risk_score) as avg_risk_score
      FROM user_location_history 
      WHERE last_access >= NOW() - INTERVAL '${timeframes[timeframe]}'
    `);

    const alertStats = await this.db.query(`
      SELECT 
        COUNT(*) as total_alerts,
        COUNT(*) FILTER (WHERE severity = 'critical') as critical_alerts,
        COUNT(*) FILTER (WHERE severity = 'high') as high_alerts,
        COUNT(*) FILTER (WHERE acknowledged = false) as unacknowledged_alerts
      FROM location_alerts 
      WHERE created_at >= NOW() - INTERVAL '${timeframes[timeframe]}'
    `);

    return {
      ...stats.rows[0],
      ...alertStats.rows[0],
      timeframe
    };
  }
}