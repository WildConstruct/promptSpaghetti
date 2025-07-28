// Geolocation Service Tests
// Comprehensive test coverage for login geolocation tracking functionality

import { GeolocationService, GeolocationData, LocationHistory } from '../auth/services/GeolocationService';
import { DatabaseService } from '../auth/database/DatabaseService';
import { RedisService } from '../auth/database/RedisService';

// Mock implementations
class MockDatabaseService {
  private mockData: unknown = {
    user_location_history: []
  };

  async query(sql: string, params: any[] = []): Promise<{ rows: any[] }> {

    // Mock database operations for testing
    if (sql.includes('CREATE TABLE')) {
      return { rows: [] };
    }
    
    if (sql.includes('INSERT INTO user_location_history')) {
      const [userId, locationKey, locationData] = params;
      this.mockData.user_location_history.push({
        user_id: userId,
        location_key: locationKey,
        location_data: JSON.parse(locationData),
        frequency: 1,
        is_typical: false,
        first_seen: new Date(),
        last_seen: new Date()
      });
      return { rows: [] };
    }

    if (sql.includes('SELECT') && sql.includes('user_location_history')) {
      const userId = params[0];
      const userHistory = this.mockData.user_location_history.filter(
        (record: unknown) => record.user_id === userId
      );
      return {
        rows: userHistory.map((record: unknown) => ({
          location_data: JSON.stringify(record.location_data),
          first_seen: record.first_seen,
          last_seen: record.last_seen,
          frequency: record.frequency,
          is_typical: record.is_typical
        }))
      };
    }

    if (sql.includes('UPDATE user_location_history')) {
      const [userId, locationKey, newFrequency, isTypical] = params;
      const record = this.mockData.user_location_history.find(
        (r: unknown) => r.user_id === userId && r.location_key === locationKey
      );
      if (record) {
        record.frequency = newFrequency;
        record.is_typical = isTypical;
        record.last_seen = new Date();
      }
      return { rows: [] };
    }

    return { rows: [] };
  }

  // Helper methods for testing
  setMockData(data: unknown) {
    this.mockData = data;
  }

  getMockData() {
    return this.mockData;
  }
}

class MockRedisService {
  private cache: Map<string, string> = new Map();

  async setex(key: string, expiry: number, value: string): Promise<void> {

    this.cache.set(key, value);
  }

  async get(key: string): Promise<string | null> {

    return this.cache.get(key) || null;
  }

  // Helper methods for testing
  clearCache() {
    this.cache.clear();
  }

  setCacheValue(key: string, value: string) {
    this.cache.set(key, value);
  }

  getCacheSize() {
    return this.cache.size;
  }
}

describe('GeolocationService', () => {
  let geolocationService: GeolocationService;
  let mockDb: MockDatabaseService;
  let mockRedis: MockRedisService;

  beforeEach(() => {
    mockDb = new MockDatabaseService();
    mockRedis = new MockRedisService();
    geolocationService = new GeolocationService(
      mockDb as any,
      mockRedis as any,
      {
        enableCache: true,
        cacheExpiryHours: 24,
        fallbackToHeaders: true,
        requireMinimumConfidence: 0.7,
        newLocationThresholdKm: 100,
        typicalLocationUpdateThreshold: 5
      }
    );

    // Mock fetch for testing
    global.fetch = jest.fn<unknown[], unknown>();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    mockRedis.clearCache();
  });

  describe('getGeolocationData', () => {
    it('should return fallback data for invalid IP addresses', async () => {
      const result = await geolocationService.getGeolocationData('invalid-ip');
      
      expect(result.country).toBe('Unknown');
      expect(result.countryCode).toBe('XX');
      expect(result.confidence).toBe(0.1);
      expect(result.source).toBe('fallback');
    });

    it('should return cached data when available', async () => {
      const cachedData: GeolocationData = {
        country: 'United States',
        countryCode: 'US',
        region: 'California',
        regionCode: 'CA',
        city: 'San Francisco',
        timezone: 'America/Los_Angeles',
        confidence: 0.9,
        source: 'cache'
      };

      mockRedis.setCacheValue('geolocation:192.168.1.1', JSON.stringify(cachedData));

      const result = await geolocationService.getGeolocationData('192.168.1.1');
      
      expect(result.country).toBe('United States');
      expect(result.source).toBe('cache');
      expect(result.confidence).toBe(0.9);
    });

    it('should fetch data from IP-API when cache is empty', async () => {
      const mockApiResponse = {
        status: 'success',
        country: 'United States',
        countryCode: 'US',
        regionName: 'California',
        region: 'CA',
        city: 'San Francisco',
        zip: '94105',
        lat: 37.7749,
        lon: -122.4194,
        timezone: 'America/Los_Angeles',
        isp: 'Example ISP',
        org: 'Example Organization',
        as: 'AS12345 Example ASN',
        proxy: false,
        hosting: false
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: () => Promise.resolve(mockApiResponse)
      });

      const result = await geolocationService.getGeolocationData('8.8.8.8');
      
      expect(result.country).toBe('United States');
      expect(result.countryCode).toBe('US');
      expect(result.city).toBe('San Francisco');
      expect(result.coordinates?.latitude).toBe(37.7749);
      expect(result.coordinates?.longitude).toBe(-122.4194);
      expect(result.source).toBe('ipapi');
      expect(result.confidence).toBe(0.8);
    });

    it('should fall back to headers when API fails', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

      const headers = {
        'cf-ipcountry': 'US',
        'cf-timezone': 'America/Los_Angeles'
      };

      const result = await geolocationService.getGeolocationData('8.8.8.8', headers);
      
      expect(result.country).toBe('United States');
      expect(result.countryCode).toBe('US');
      expect(result.timezone).toBe('America/Los_Angeles');
      expect(result.source).toBe('cloudflare');
      expect(result.confidence).toBe(0.6);
    });

    it('should handle API failure responses gracefully', async () => {
      const mockApiResponse = {
        status: 'fail',
        message: 'Invalid IP address'
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: () => Promise.resolve(mockApiResponse)
      });

      const result = await geolocationService.getGeolocationData('8.8.8.8');
      
      expect(result.source).toBe('fallback');
      expect(result.confidence).toBe(0.1);
    });
  });

  describe('trackLoginLocation', () => {
    it('should identify new location for first-time user', async () => {
      const geolocationData: GeolocationData = {
        country: 'United States',
        countryCode: 'US',
        region: 'California',
        regionCode: 'CA',
        city: 'San Francisco',
        timezone: 'America/Los_Angeles',
        confidence: 0.9,
        source: 'ipapi'
      };

      const result = await geolocationService.trackLoginLocation(
        'user123',
        '8.8.8.8',
        geolocationData
      );

      expect(result.isNewLocation).toBe(true);
      expect(result.isTypicalLocation).toBe(false);
      expect(result.suspiciousIndicators).toEqual([]);
    });

    it('should recognize returning location', async () => {
      const userId = 'user123';
      const geolocationData: GeolocationData = {
        country: 'United States',
        countryCode: 'US',
        region: 'California',
        regionCode: 'CA',
        city: 'San Francisco',
        timezone: 'America/Los_Angeles',
        confidence: 0.9,
        source: 'ipapi'
      };

      // First login - should be new
      await geolocationService.trackLoginLocation(userId, '8.8.8.8', geolocationData);

      // Mock existing location history
      mockDb.setMockData({
        user_location_history: [{
          user_id: userId,
          location_key: 'us:ca:san francisco',
          location_data: geolocationData,
          frequency: 10,
          is_typical: true,
          first_seen: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
          last_seen: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
        }]
      });

      // Second login - should be recognized
      const result = await geolocationService.trackLoginLocation(
        userId,
        '8.8.8.8',
        geolocationData
      );

      expect(result.isNewLocation).toBe(false);
      expect(result.isTypicalLocation).toBe(true);
    });

    it('should detect suspicious VPN usage', async () => {
      const geolocationData: GeolocationData = {
        country: 'United States',
        countryCode: 'US',
        region: 'California',
        regionCode: 'CA',
        city: 'San Francisco',
        timezone: 'America/Los_Angeles',
        isVpn: true,
        confidence: 0.9,
        source: 'ipapi'
      };

      const result = await geolocationService.trackLoginLocation(
        'user123',
        '8.8.8.8',
        geolocationData
      );

      expect(result.suspiciousIndicators).toContain('vpn_detected');
    });

    it('should detect Tor exit nodes', async () => {
      const geolocationData: GeolocationData = {
        country: 'Germany',
        countryCode: 'DE',
        region: 'Berlin',
        regionCode: 'BE',
        city: 'Berlin',
        timezone: 'Europe/Berlin',
        isTor: true,
        confidence: 0.8,
        source: 'ipapi'
      };

      const result = await geolocationService.trackLoginLocation(
        'user123',
        '8.8.8.8',
        geolocationData
      );

      expect(result.suspiciousIndicators).toContain('tor_exit_node');
    });

    it('should detect hosting provider IPs', async () => {
      const geolocationData: GeolocationData = {
        country: 'United States',
        countryCode: 'US',
        region: 'Virginia',
        regionCode: 'VA',
        city: 'Ashburn',
        timezone: 'America/New_York',
        organization: 'Amazon Web Services Hosting',
        isHosting: true,
        confidence: 0.9,
        source: 'ipapi'
      };

      const result = await geolocationService.trackLoginLocation(
        'user123',
        '8.8.8.8',
        geolocationData
      );

      expect(result.suspiciousIndicators).toContain('hosting_provider');
      expect(result.suspiciousIndicators).toContain('datacenter_ip');
    });
  });

  describe('getUserLocationHistory', () => {
    it('should return empty array for new user', async () => {
      const result = await geolocationService.getUserLocationHistory('newuser');
      expect(result).toEqual([]);
    });

    it('should return location history for existing user', async () => {
      const userId = 'user123';
      const locationData = {
        country: 'United States',
        countryCode: 'US',
        region: 'California',
        regionCode: 'CA',
        city: 'San Francisco',
        timezone: 'America/Los_Angeles',
        confidence: 0.9,
        source: 'ipapi'
      };

      mockDb.setMockData({
        user_location_history: [{
          user_id: userId,
          location_key: 'us:ca:san francisco',
          location_data: locationData,
          frequency: 15,
          is_typical: true,
          first_seen: new Date('2024-01-01'),
          last_seen: new Date('2024-01-15')
        }]
      });

      const result = await geolocationService.getUserLocationHistory(userId);
      
      expect(result).toHaveLength(1);
      expect(result[0].userId).toBe(userId);
      expect(result[0].location.country).toBe('United States');
      expect(result[0].frequency).toBe(15);
      expect(result[0].isTypical).toBe(true);
    });
  });

  describe('distance calculation', () => {
    it('should calculate distance between coordinates correctly', async () => {
      // Test using the public interface by checking location analysis
      const userId = 'user123';
      
      // First location: San Francisco
      const sfLocation: GeolocationData = {
        country: 'United States',
        countryCode: 'US',
        region: 'California',
        regionCode: 'CA',
        city: 'San Francisco',
        timezone: 'America/Los_Angeles',
        coordinates: { latitude: 37.7749, longitude: -122.4194 },
        confidence: 0.9,
        source: 'ipapi'
      };

      await geolocationService.trackLoginLocation(userId, '8.8.8.8', sfLocation);

      // Mock existing SF location in history
      mockDb.setMockData({
        user_location_history: [{
          user_id: userId,
          location_key: 'us:ca:san francisco',
          location_data: sfLocation,
          frequency: 10,
          is_typical: true,
          first_seen: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          last_seen: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }]
      });

      // Second location: Los Angeles (about 380 miles away)
      const laLocation: GeolocationData = {
        country: 'United States',
        countryCode: 'US',
        region: 'California',
        regionCode: 'CA',
        city: 'Los Angeles',
        timezone: 'America/Los_Angeles',
        coordinates: { latitude: 34.0522, longitude: -118.2437 },
        confidence: 0.9,
        source: 'ipapi'
      };

      const result = await geolocationService.trackLoginLocation(userId, '8.8.8.9', laLocation);

      // LA should be detected as a new location since it's more than 100km threshold
      expect(result.isNewLocation).toBe(true);
      expect(result.distanceFromNearestKm).toBeGreaterThan(300); // ~380 miles = ~612 km
    });
  });

  describe('location key generation', () => {
    it('should generate consistent location keys', async () => {
      const location1: GeolocationData = {
        country: 'United States',
        countryCode: 'US',
        region: 'California',
        regionCode: 'CA',
        city: 'San Francisco',
        timezone: 'America/Los_Angeles',
        confidence: 0.9,
        source: 'ipapi'
      };

      const location2: GeolocationData = {
        country: 'United States',
        countryCode: 'US',
        region: 'California',
        regionCode: 'CA',
        city: 'San Francisco',
        timezone: 'America/Los_Angeles',
        confidence: 0.8,
        source: 'cache'
      };

      // Both should generate the same location key
      await geolocationService.trackLoginLocation('user1', '8.8.8.8', location1);
      await geolocationService.trackLoginLocation('user1', '8.8.8.9', location2);

      // Should update existing record rather than create new one
      const history = await geolocationService.getUserLocationHistory('user1');
      expect(history).toHaveLength(1);
    });
  });

  describe('schema initialization', () => {
    it('should create required database tables', async () => {
      const querySpy = jest.spyOn(mockDb, 'query');
      
      await geolocationService.initializeSchema();

      expect(querySpy).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS user_location_history')
      );
      expect(querySpy).toHaveBeenCalledWith(
        expect.stringContaining('CREATE INDEX IF NOT EXISTS idx_user_location_history_user_id')
      );
    });
  });

  describe('IP validation', () => {
    it('should validate IPv4 addresses correctly', async () => {
      // Mock API response for valid IP
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: () => Promise.resolve({
          status: 'success',
          country: 'United States',
          countryCode: 'US'
  }
      });

      // Valid IPv4
      const result1 = await geolocationService.getGeolocationData('192.168.1.1');
      expect(result1.source).not.toBe('fallback'); // Should attempt real lookup

      // Invalid IPv4
      const result2 = await geolocationService.getGeolocationData('256.256.256.256');
      expect(result2.source).toBe('fallback');

      // Malformed IP
      const result3 = await geolocationService.getGeolocationData('not.an.ip.address');
      expect(result3.source).toBe('fallback');
    });
  });

  describe('caching behavior', () => {
    it('should cache successful lookups', async () => {
      const mockApiResponse = {
        status: 'success',
        country: 'United States',
        countryCode: 'US',
        regionName: 'California',
        region: 'CA',
        city: 'San Francisco',
        timezone: 'America/Los_Angeles',
        lat: 37.7749,
        lon: -122.4194
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: () => Promise.resolve(mockApiResponse)
      });

      const ip = '8.8.8.8';
      
      // First call should make API request
      const result1 = await geolocationService.getGeolocationData(ip);
      expect(result1.source).toBe('ipapi');

      // Second call should use cache
      const result2 = await geolocationService.getGeolocationData(ip);
      expect(result2.source).toBe('cache');
    });

    it('should not cache low confidence results', async () => {
      const newMockRedis = new MockRedisService();
      const service = new GeolocationService(
        mockDb as any,
        newMockRedis as any,
        { 
          enableCache: true,
          requireMinimumConfidence: 0.9 // Higher than default 0.8
        }
      );

      const mockApiResponse = {
        status: 'success',
        country: 'Unknown',
        countryCode: 'XX'
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: () => Promise.resolve(mockApiResponse)
      });

      const result = await service.getGeolocationData('8.8.8.8');
      
      // Should not be cached due to low confidence (0.8 < 0.9)
      expect(newMockRedis.getCacheSize()).toBe(0);
    });
  });

  describe('error handling', () => {
    it('should handle network errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await geolocationService.getGeolocationData('8.8.8.8');
      
      expect(result.source).toBe('fallback');
      expect(result.country).toBe('Unknown');
    });

    it('should handle malformed API responses', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: () => Promise.resolve(null)
      });

      const result = await geolocationService.getGeolocationData('8.8.8.8');
      
      expect(result.source).toBe('fallback');
    });
  });
});