// Geolocation Service for Login Attempts
// Provides comprehensive IP geolocation tracking and location-based security features

import { DatabaseService } from '../database/DatabaseService';
import { RedisService } from '../database/RedisService';



export interface GeolocationData {
  country: string;
  countryCode: string;
  region: string;
  regionCode: string;
  city: string;
  zipCode?: string;
  timezone: string;
  coordinates?: {
    latitude: number;
    longitude: number;



  };
  isp?: string;
  organization?: string;
  asn?: string;
  isVpn?: boolean;
  isTor?: boolean;
  isProxy?: boolean;
  isHosting?: boolean;
  confidence: number; // 0-1 scale
  source: 'cloudflare' | 'ipapi' | 'maxmind' | 'cache' | 'fallback';




export interface LocationHistory {
  userId: string;
  location: GeolocationData;
  firstSeen: Date;
  lastSeen: Date;
  frequency: number;
  isTypical: boolean;







export interface GeolocationConfig {
  // API configurations
  ipApiKey?: string;
  maxmindLicenseKey?: string;
  enableCache: boolean;
  cacheExpiryHours: number;
  
  // Fallback and reliability
  fallbackToHeaders: boolean;
  requireMinimumConfidence: number;
  
  // Location analysis
  newLocationThresholdKm: number;
  typicalLocationUpdateThreshold: number;
  suspiciousLocationPatterns: string[];





export class GeolocationService {
  private db: DatabaseService;
  private redis: RedisService;
  private config: GeolocationConfig;

  constructor(
    db: DatabaseService,
    redis: RedisService,
    config?: Partial<GeolocationConfig>
  ) {
    this.db = db;
    this.redis = redis;
    this.config = {
      enableCache: true,
      cacheExpiryHours: 24,
      fallbackToHeaders: true,
      requireMinimumConfidence: 0.7,
      newLocationThresholdKm: 100,
      typicalLocationUpdateThreshold: 5,
      suspiciousLocationPatterns: [
        'tor-exit',
        'proxy',
        'vpn',
        'hosting',
        'datacenter'
      ],
      ...config
    };


  /**
   * Get comprehensive geolocation data for an IP address
   */
  async getGeolocationData(
    ipAddress: string,
    fallbackHeaders?: {
      'cf-ipcountry'?: string;
      'cf-timezone'?: string;
      'cf-region'?: string;
      'x-forwarded-for'?: string;
    }
  ): Promise<GeolocationData> {

    // Validate IP address
    if (!this.isValidIP(ipAddress)) {
      return this.createFallbackGeolocation(ipAddress, fallbackHeaders);


    // Check cache first
    if (this.config.enableCache) {
      const cached = await this.getCachedGeolocation(ipAddress);
      if (cached) {
        return cached;



    // Try multiple geolocation sources
    let geolocationData: GeolocationData | null = null;

    // Primary: IP-API (free tier with good accuracy)
    geolocationData = await this.getLocationFromIPAPI(ipAddress);

    // Fallback: MaxMind (if configured)
    if (!geolocationData && this.config.maxmindLicenseKey) {
      geolocationData = await this.getLocationFromMaxMind(ipAddress);


    // Fallback: Cloudflare headers
    if (!geolocationData && this.config.fallbackToHeaders && fallbackHeaders) {
      geolocationData = this.createLocationFromHeaders(ipAddress, fallbackHeaders);


    // Ultimate fallback
    if (!geolocationData) {
      geolocationData = this.createFallbackGeolocation(ipAddress, fallbackHeaders);


    // Cache the result
    if (this.config.enableCache && geolocationData.confidence >= this.config.requireMinimumConfidence) {
      await this.cacheGeolocation(ipAddress, geolocationData);


    return geolocationData;


  /**
   * Track location for a user's login attempt
   */
  async trackLoginLocation(
    userId: string,
    ipAddress: string,
    geolocationData: GeolocationData
  ): Promise<{
    isNewLocation: boolean;
    isTypicalLocation: boolean;
    distanceFromNearestKm?: number;
    suspiciousIndicators: string[];
> {

    // Get user's location history
    const locationHistory = await this.getUserLocationHistory(userId);
    
    // Analyze if this is a new location
    const locationAnalysis = this.analyzeLocationForUser(geolocationData, locationHistory);
    
    // Update location history
    await this.updateLocationHistory(userId, geolocationData, locationAnalysis);
    
    // Check for suspicious patterns
    const suspiciousIndicators = this.detectSuspiciousLocation(geolocationData);
    
    return {
      isNewLocation: locationAnalysis.isNew,
      isTypicalLocation: locationAnalysis.isTypical,
      distanceFromNearestKm: locationAnalysis.nearestDistance,
      suspiciousIndicators
    };


  /**
   * Get user's historical locations
   */
  async getUserLocationHistory(userId: string): Promise<LocationHistory[]> {

    const result = await this.db.query(`
      SELECT 
        location_data,
        first_seen,
        last_seen,
        frequency,
        is_typical
      FROM user_location_history 
      WHERE user_id = $1 
      ORDER BY frequency DESC, last_seen DESC
    `, [userId]);

    return result.rows.map(row => ({
      userId,
      location: JSON.parse(row.location_data),
      firstSeen: row.first_seen,
      lastSeen: row.last_seen,
      frequency: row.frequency,
      isTypical: row.is_typical
    }));


  /**
   * Analyze if location is new or typical for user
   */
  private analyzeLocationForUser(
    location: GeolocationData,
    history: LocationHistory[]
  ): {
    isNew: boolean;
    isTypical: boolean;
    nearestDistance?: number;
 {
    if (history.length === 0) {
      return { isNew: true, isTypical: false };


    let nearestDistance = Infinity;
    let isExactMatch = false;
    let hasNearbyLocation = false;

    for (const historicalLocation of history) {
      // Check for exact location match
      if (this.isSameLocation(location, historicalLocation.location)) {
        isExactMatch = true;
        nearestDistance = 0;
        break;


      // Calculate distance if coordinates available
      if (location.coordinates && historicalLocation.location.coordinates) {
        const distance = this.calculateHaversineDistance(
          location.coordinates.latitude,
          location.coordinates.longitude,
          historicalLocation.location.coordinates.latitude,
          historicalLocation.location.coordinates.longitude
        );
        
        nearestDistance = Math.min(nearestDistance, distance);
        
        if (distance <= this.config.newLocationThresholdKm) {
          hasNearbyLocation = true;




    // Determine if this is a new location
    const isNew = !isExactMatch && !hasNearbyLocation;
    
    // Determine if this is a typical location (based on frequency thresholds)
    const isTypical = history.some(h => 
      this.isSameLocation(location, h.location) && 
      h.frequency >= this.config.typicalLocationUpdateThreshold
    );

    return {
      isNew,
      isTypical,
      nearestDistance: nearestDistance === Infinity ? undefined : nearestDistance
    };


  /**
   * Update user's location history
   */
  private async updateLocationHistory(
    userId: string,
    location: GeolocationData,
    analysis: { isNew: boolean; isTypical: boolean }
  ): Promise<void> {

    const locationKey = this.getLocationKey(location);
    
    // Check if location already exists for user
    const existing = await this.db.query(`
      SELECT id, frequency, first_seen
      FROM user_location_history
      WHERE user_id = $1 AND location_key = $2
    `, [userId, locationKey]);

    if (existing.rows.length > 0) {
      // Update existing location
      const newFrequency = existing.rows[0].frequency + 1;
      const isTypical = newFrequency >= this.config.typicalLocationUpdateThreshold;
      
      await this.db.query(`
        UPDATE user_location_history 
        SET 
          frequency = $3,
          last_seen = NOW(),
          is_typical = $4,
          location_data = $5
        WHERE user_id = $1 AND location_key = $2
      `, [userId, locationKey, newFrequency, isTypical, JSON.stringify(location)]);
 else {
      // Insert new location
      await this.db.query(`
        INSERT INTO user_location_history (
          user_id, location_key, location_data, 
          first_seen, last_seen, frequency, is_typical
        ) VALUES ($1, $2, $3, NOW(), NOW(), 1, false)
      `, [userId, locationKey, JSON.stringify(location)]);



  /**
   * Detect suspicious location indicators
   */
  private detectSuspiciousLocation(location: GeolocationData): string[] {
    const indicators: string[] = [];
    
    if (location.isVpn) indicators.push('vpn_detected');
    if (location.isTor) indicators.push('tor_exit_node');
    if (location.isProxy) indicators.push('proxy_detected');
    if (location.isHosting) indicators.push('hosting_provider');
    if (location.confidence < 0.5) indicators.push('low_confidence_location');
    
    // Check ISP/Organization patterns
    if (location.organization) {
      const org = location.organization.toLowerCase();
      if (org.includes('hosting') || org.includes('cloud') || org.includes('server')) {
        indicators.push('datacenter_ip');


    
    return indicators;


  /**
   * Get geolocation from IP-API service
   */
  private async getLocationFromIPAPI(ipAddress: string): Promise<GeolocationData | null> {

    try {
      // Note: In production, you'd use the Pro version for HTTPS and higher limits
      const response = await fetch(
        `http://ip-api.com/json/${ipAddress}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,proxy,hosting`
      );
      
      const data = await response.json();
      
      if (data.status === 'fail') {
        console.warn(`IP-API lookup failed for ${ipAddress}: ${data.message}`);
        return null;

      
      return {
        country: data.country || 'Unknown',
        countryCode: data.countryCode || 'XX',
        region: data.regionName || 'Unknown',
        regionCode: data.region || 'XX',
        city: data.city || 'Unknown',
        zipCode: data.zip,
        timezone: data.timezone || 'UTC',
        coordinates: data.lat && data.lon ? {
          latitude: data.lat,
          longitude: data.lon
 : undefined,
        isp: data.isp,
        organization: data.org,
        asn: data.as,
        isVpn: data.proxy,
        isTor: false, // IP-API doesn't provide Tor detection in free tier
        isProxy: data.proxy,
        isHosting: data.hosting,
        confidence: 0.8, // IP-API generally has good accuracy
        source: 'ipapi'
      };
 catch (error) {
      console.error(`Error fetching geolocation from IP-API for ${ipAddress}:`, error);
      return null;



  /**
   * Get geolocation from MaxMind (placeholder - requires MaxMind SDK)
   */
  private async getLocationFromMaxMind(ipAddress: string): Promise<GeolocationData | null> {

    // Placeholder implementation
    // In production, you would use the MaxMind Node.js SDK
    console.log(`MaxMind lookup for ${ipAddress} - not implemented`);
    return null;


  /**
   * Create geolocation from HTTP headers (Cloudflare)
   */
  private createLocationFromHeaders(
    ipAddress: string,
    headers: Record<string, string | undefined>
  ): GeolocationData | null {
    const country = headers['cf-ipcountry'];
    const timezone = headers['cf-timezone'];
    
    if (!country) return null;
    
    return {
      country: this.getCountryName(country),
      countryCode: country,
      region: 'Unknown',
      regionCode: 'XX',
      city: 'Unknown',
      timezone: timezone || 'UTC',
      confidence: 0.6, // Headers are less reliable
      source: 'cloudflare'
    };


  /**
   * Create fallback geolocation data
   */
  private createFallbackGeolocation(
    ipAddress: string,
    headers?: Record<string, string | undefined>
  ): GeolocationData {
    return {
      country: 'Unknown',
      countryCode: 'XX',
      region: 'Unknown',
      regionCode: 'XX',
      city: 'Unknown',
      timezone: 'UTC',
      confidence: 0.1,
      source: 'fallback'
    };


  /**
   * Cache geolocation data in Redis
   */
  private async cacheGeolocation(ipAddress: string, data: GeolocationData): Promise<void> {

    const cacheKey = `geolocation:${ipAddress}`;
    const expirySeconds = this.config.cacheExpiryHours * 3600;
    
    await this.redis.setex(cacheKey, expirySeconds, JSON.stringify(data));


  /**
   * Get cached geolocation data from Redis
   */
  private async getCachedGeolocation(ipAddress: string): Promise<GeolocationData | null> {

    const cacheKey = `geolocation:${ipAddress}`;
    const cached = await this.redis.get(cacheKey);
    
    if (cached) {
      try {
        const data = JSON.parse(cached);
        data.source = 'cache';
        return data;
 catch (error) {
        console.error('Error parsing cached geolocation data:', error);


    
    return null;


  /**
   * Validate IP address format
   */
  private isValidIP(ip: string): boolean {
    // IPv4 regex
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    // IPv6 regex (simplified)
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    
    if (ipv4Regex.test(ip)) {
      // Validate IPv4 ranges
      const parts = ip.split('.').map(Number);
      return parts.every(part => part >= 0 && part <= 255);

    
    return ipv6Regex.test(ip);


  /**
   * Check if two locations are the same (city level)
   */
  private isSameLocation(loc1: GeolocationData, loc2: GeolocationData): boolean {
    return loc1.country === loc2.country &&
           loc1.region === loc2.region &&
           loc1.city === loc2.city;


  /**
   * Generate a unique key for location storage
   */
  private getLocationKey(location: GeolocationData): string {
    return `${location.countryCode}:${location.regionCode}:${location.city}`.toLowerCase();


  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  private calculateHaversineDistance(
    lat1: number, lon1: number, 
    lat2: number, lon2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.degreesToRadians(lat2 - lat1);
    const dLon = this.degreesToRadians(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.degreesToRadians(lat1)) * Math.cos(this.degreesToRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;


  private degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);


  /**
   * Get country name from country code
   */
  private getCountryName(countryCode: string): string {
    const countryNames: Record<string, string> = {
      'US': 'United States',
      'GB': 'United Kingdom',
      'CA': 'Canada',
      'DE': 'Germany',
      'FR': 'France',
      'JP': 'Japan',
      'CN': 'China',
      'RU': 'Russia',
      'IN': 'India',
      'BR': 'Brazil',
      'AU': 'Australia',
      'MX': 'Mexico',
      'IT': 'Italy',
      'ES': 'Spain',
      'NL': 'Netherlands',
      'CH': 'Switzerland',
      'SE': 'Sweden',
      'NO': 'Norway',
      'DK': 'Denmark',
      'FI': 'Finland'
      // Add more as needed
    };
    
    return countryNames[countryCode] || countryCode;


  /**
   * Initialize database tables for geolocation tracking
   */
  async initializeSchema(): Promise<void> {

    await this.db.query(`
      CREATE TABLE IF NOT EXISTS user_location_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(255) NOT NULL,
        location_key VARCHAR(255) NOT NULL,
        location_data JSONB NOT NULL,
        first_seen TIMESTAMP DEFAULT NOW(),
        last_seen TIMESTAMP DEFAULT NOW(),
        frequency INTEGER DEFAULT 1,
        is_typical BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, location_key)

    `);

    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_user_location_history_user_id 
      ON user_location_history(user_id);
    `);

    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_user_location_history_location_key 
      ON user_location_history(location_key);
    `);

    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_user_location_history_typical 
      ON user_location_history(user_id, is_typical);
    `);

