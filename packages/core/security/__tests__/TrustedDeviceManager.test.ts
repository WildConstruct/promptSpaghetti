/**
 * Test Suite for Trusted Device Manager
 * 
 * Tests comprehensive trusted device management including registration,
 * verification, trust evaluation, and maintenance operations.
 */

import {
  TrustedDeviceManager,
  TrustStatus,
  TrustLevel,
  VerificationMethod,
  TrustedDevice,
  DeviceVerificationRequest,
  TrustDecision
} from '../TrustedDeviceManager';
import {
  DeviceFingerprintingService,
  DeviceFingerprint,
  LocationData,
  RiskLevel,
  FingerprintType,
  FingerprintContext
} from '../DeviceFingerprintingService';

// Mock the DeviceFingerprintingService
jest.mock('../DeviceFingerprintingService');

describe('TrustedDeviceManager', () => {
  let manager: TrustedDeviceManager;
  let mockFingerprintService: jest.Mocked<DeviceFingerprintingService>;
  
  // Test data
  const testUserId = 'user-123';
  const testContext: FingerprintContext = {
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    headers: {}
  };
  
  const testFingerprint: DeviceFingerprint = {
    id: 'fp-123',
    type: FingerprintType.ENHANCED,
    confidence: 95,
    createdAt: new Date(),
    lastSeen: new Date(),
    seenCount: 1,
    basic: {
      userAgent: testContext.userAgent,
      language: 'en-US',
      platform: 'MacOS',
      cookieEnabled: true,
      doNotTrack: false,
      timezone: 'America/Los_Angeles',
      timezoneOffset: -480
    },
    enhanced: {
      screen: {
        width: 1920,
        height: 1080,
        colorDepth: 24,
        pixelRatio: 2,
        orientation: 'landscape'
      },
      browser: {
        name: 'Chrome',
        version: '126',
        engine: 'Blink',
        engineVersion: '126'
      },
      plugins: [],
      fonts: [],
      webgl: {
        vendor: 'Intel',
        renderer: 'Intel Iris',
        version: 'WebGL 2.0',
        shadingLanguageVersion: 'WebGL GLSL ES 3.00',
        extensions: [],
        parameters: {}
      },
      canvas: {
        fingerprint: 'canvas-fp-123',
        geometry: 'geo-123',
        text: 'text-123'
      },
      audio: {
        fingerprint: 'audio-fp-123',
        sampleRate: 48000,
        channelCount: 2,
        contextState: 'running'
      }
    },
    comprehensive: {
      hardware: {
        cpuCores: 8,
        memory: 16,
        touchSupport: false,
        sensors: [],
        bluetooth: true,
        usb: true,
        webrtc: {
          supported: true,
          localCandidates: [],
          stunServers: []
        }
      },
      network: {
        connectionType: 'wifi',
        downlink: 100,
        effectiveType: '4g',
        rtt: 50
      },
      permissions: {
        camera: 'granted',
        microphone: 'granted',
        location: 'prompt',
        notifications: 'granted',
        persistentStorage: 'granted'
      },
      storage: {
        localStorage: true,
        sessionStorage: true,
        indexedDB: true,
        webSQL: false,
        quota: 1000000
      },
      features: {
        webAssembly: true,
        serviceWorker: true,
        webWorker: true,
        webRTC: true,
        webGL: true,
        webGL2: true,
        webVR: false,
        webXR: false
      }
    }
  };
  
  const testLocation: LocationData = {
    id: 'loc-123',
    timestamp: new Date(),
    source: 'ip',
    accuracy: 5000,
    confidence: 85,
    coordinates: {
      latitude: 37.7749,
      longitude: -122.4194,
      accuracy: 5000
    },
    address: {
      country: 'United States',
      countryCode: 'US',
      region: 'California',
      regionCode: 'CA',
      city: 'San Francisco',
      postalCode: '94102'
    },
    network: {
      ipAddress: '192.168.1.100',
      isp: 'Comcast',
      timezone: 'America/Los_Angeles',
      vpnDetected: false,
      proxyDetected: false,
      torDetected: false,
      hostingProvider: false,
      datacenter: false
    },
    metadata: {
      language: 'en',
      currency: 'USD',
      callingCode: '+1'
    }
  };

  beforeEach(() => {
    jest.useFakeTimers();
    
    // Create mock fingerprint service
    mockFingerprintService = new DeviceFingerprintingService() as jest.Mocked<DeviceFingerprintingService>;
    
    // Mock the methods we need
    jest.spyOn(mockFingerprintService, 'generateFingerprint');
    jest.spyOn(mockFingerprintService, 'assessRisk');
    jest.spyOn(mockFingerprintService, 'on');
    jest.spyOn(mockFingerprintService, 'emit');
    jest.spyOn(mockFingerprintService, 'removeAllListeners');

    // Set default mock implementations
    mockFingerprintService.generateFingerprint.mockResolvedValue(testFingerprint as unknown as unknown as unknown as unknown);
    mockFingerprintService.assessRisk.mockReturnValue({
      deviceId: testFingerprint.id,
      overallRisk: RiskLevel.LOW,
      riskScore: 10,
      factors: [],
      recommendations: [],
      timestamp: new Date( as unknown)
    });

    manager = new TrustedDeviceManager(mockFingerprintService, {
      maxDevicesPerUser: 5,
      defaultTrustDurationDays: 30,
      defaultVerificationIntervalDays: 7,
      maxLocationRadiusKm: 50,
      requireLocationCheck: true,
      allowRoaming: false,
      autoExpireInactiveDays: 90,
      riskThreshold: {
        full: 20,
        partial: 50,
        deny: 80
      },
      verificationMethods: [VerificationMethod.EMAIL, VerificationMethod.SMS],
      enableAnomalyDetection: true,
      enableAutoRenewal: true
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    manager.removeAllListeners();
  });

  describe('Device Registration', () => {
    test('should register a new trusted device', async () => {
      const request: DeviceVerificationRequest = {
        userId: testUserId,
        deviceFingerprint: testFingerprint,
        location: testLocation,
        verificationMethod: VerificationMethod.EMAIL,
        metadata: { source: 'web' }
      };

      const device = await manager.registerTrustedDevice(request);

      expect(device).toBeDefined();
      expect(device.userId).toBe(testUserId);
      expect(device.fingerprintId).toBe(testFingerprint.id);
      expect(device.trustStatus).toBe(TrustStatus.PENDING);
      expect(device.trustLevel).toBe(TrustLevel.LIMITED);
      expect(device.verificationToken).toBeDefined();
      expect(device.name).toContain('Chrome on MacOS');
      expect(device.type).toBe('desktop');
      expect(device.primaryLocation).toEqual(testLocation);
    });

    test('should emit deviceRegistered event', async () => {
      const eventHandler = jest.fn<unknown[], unknown>();
      manager.on('deviceRegistered', eventHandler);

      const request: DeviceVerificationRequest = {
        userId: testUserId,
        deviceFingerprint: testFingerprint,
        location: testLocation,
        verificationMethod: VerificationMethod.EMAIL
      };

      await manager.registerTrustedDevice(request);

      expect(eventHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: testUserId,
          device: expect.objectContaining({
            userId: testUserId,
            fingerprintId: testFingerprint.id
          })
        })
      );
    });

    test('should enforce device limit per user', async () => {
      // Register maximum number of devices
      for (let i = 0; i < 5; i++) {
        const request: DeviceVerificationRequest = {
          userId: testUserId,
          deviceFingerprint: { ...testFingerprint, id: `fp-${i}` },
          location: testLocation,
          verificationMethod: VerificationMethod.EMAIL
        };
        await manager.registerTrustedDevice(request);
      }

      // Try to register one more device
      const extraRequest: DeviceVerificationRequest = {
        userId: testUserId,
        deviceFingerprint: { ...testFingerprint, id: 'fp-extra' },
        location: testLocation,
        verificationMethod: VerificationMethod.EMAIL
      };

      // Should succeed by removing oldest inactive device
      const device = await manager.registerTrustedDevice(extraRequest);
      expect(device).toBeDefined();
      
      const userDevices = manager.getUserDevices(testUserId);
      expect(userDevices.length).toBe(5);
    });
  });

  describe('Device Verification', () => {
    test('should verify a pending device', async () => {
      // Register a device
      const request: DeviceVerificationRequest = {
        userId: testUserId,
        deviceFingerprint: testFingerprint,
        location: testLocation,
        verificationMethod: VerificationMethod.EMAIL
      };

      const pendingDevice = await manager.registerTrustedDevice(request);
      const verificationToken = pendingDevice.verificationToken!;

      // Verify the device
      const verifiedDevice = await manager.verifyDevice(verificationToken);

      expect(verifiedDevice.trustStatus).toBe(TrustStatus.TRUSTED);
      expect(verifiedDevice.trustLevel).toBe(TrustLevel.FULL);
      expect(verifiedDevice.trustScore).toBe(100);
      expect(verifiedDevice.verificationToken).toBeUndefined();
    });

    test('should reject invalid verification token', async () => {
      await expect(manager.verifyDevice('invalid-token'))
        .rejects.toThrow('Invalid verification token');
    });

    test('should reject expired verification token', async () => {
      // Register a device
      const request: DeviceVerificationRequest = {
        userId: testUserId,
        deviceFingerprint: testFingerprint,
        location: testLocation,
        verificationMethod: VerificationMethod.EMAIL
      };

      const device = await manager.registerTrustedDevice(request);
      const verificationToken = device.verificationToken!;

      // Fast forward past expiration
      jest.advanceTimersByTime(25 * 60 * 60 * 1000); // 25 hours

      await expect(manager.verifyDevice(verificationToken))
        .rejects.toThrow('Verification token expired');
    });
  });

  describe('Trust Evaluation', () => {
    test('should trust a verified device', async () => {
      // Register and verify a device
      const request: DeviceVerificationRequest = {
        userId: testUserId,
        deviceFingerprint: testFingerprint,
        location: testLocation,
        verificationMethod: VerificationMethod.EMAIL
      };

      const device = await manager.registerTrustedDevice(request);
      await manager.verifyDevice(device.verificationToken!);

      // Check trust
      const decision = await manager.checkDeviceTrust(testUserId, testContext, testLocation);

      expect(decision.trusted).toBe(true);
      expect(decision.device).toBeDefined();
      expect(decision.requiresVerification).toBe(false);
      expect(decision.factors.deviceMatch).toBe(true);
      expect(decision.factors.notExpired).toBe(true);
      expect(decision.factors.notRevoked).toBe(true);
    });

    test('should not trust unrecognized device', async () => {
      const decision = await manager.checkDeviceTrust(testUserId, testContext, testLocation);

      expect(decision.trusted).toBe(false);
      expect(decision.reason).toBe('Device not recognized');
      expect(decision.requiresVerification).toBe(true);
      expect(decision.verificationMethods).toEqual([VerificationMethod.EMAIL, VerificationMethod.SMS]);
    });

    test('should not trust expired device', async () => {
      // Register and verify a device
      const request: DeviceVerificationRequest = {
        userId: testUserId,
        deviceFingerprint: testFingerprint,
        location: testLocation,
        verificationMethod: VerificationMethod.EMAIL
      };

      const device = await manager.registerTrustedDevice(request);
      await manager.verifyDevice(device.verificationToken!);

      // Fast forward past expiration
      jest.advanceTimersByTime(31 * 24 * 60 * 60 * 1000); // 31 days

      const decision = await manager.checkDeviceTrust(testUserId, testContext, testLocation);

      expect(decision.trusted).toBe(false);
      expect(decision.reason).toContain('Device trust has expired');
      expect(decision.factors.notExpired).toBe(false);
    });

    test('should not trust revoked device', async () => {
      // Register and verify a device
      const request: DeviceVerificationRequest = {
        userId: testUserId,
        deviceFingerprint: testFingerprint,
        location: testLocation,
        verificationMethod: VerificationMethod.EMAIL
      };

      const device = await manager.registerTrustedDevice(request);
      await manager.verifyDevice(device.verificationToken!);

      // Revoke the device
      await manager.revokeDevice(device.id, 'Security concern');

      const decision = await manager.checkDeviceTrust(testUserId, testContext, testLocation);

      expect(decision.trusted).toBe(false);
      expect(decision.reason).toContain('Device has been revoked');
      expect(decision.factors.notRevoked).toBe(false);
    });

    test('should check location when required', async () => {
      // Register and verify a device
      const request: DeviceVerificationRequest = {
        userId: testUserId,
        deviceFingerprint: testFingerprint,
        location: testLocation,
        verificationMethod: VerificationMethod.EMAIL
      };

      const device = await manager.registerTrustedDevice(request);
      await manager.verifyDevice(device.verificationToken!);

      // Check trust from different location
      const differentLocation: LocationData = {
        ...testLocation,
        coordinates: {
          latitude: 40.7128, // New York
          longitude: -74.0060,
          accuracy: 5000
        },
        address: {
          ...testLocation.address,
          city: 'New York',
          region: 'New York',
          regionCode: 'NY'
        }
      };

      const decision = await manager.checkDeviceTrust(testUserId, testContext, differentLocation);

      expect(decision.trusted).toBe(true); // Still trusted but...
      expect(decision.factors.locationMatch).toBe(false); // Location doesn't match
      expect(decision.riskScore).toBeGreaterThan(0);
    });

    test('should handle high risk devices', async () => {
      // Mock high risk assessment
      mockFingerprintService.assessRisk.mockReturnValue({
        deviceId: testFingerprint.id,
        overallRisk: RiskLevel.HIGH,
        riskScore: 85,
        factors: [],
        recommendations: [],
        timestamp: new Date( as unknown)
      });

      // Register and verify a device
      const request: DeviceVerificationRequest = {
        userId: testUserId,
        deviceFingerprint: testFingerprint,
        location: testLocation,
        verificationMethod: VerificationMethod.EMAIL
      };

      const device = await manager.registerTrustedDevice(request);
      await manager.verifyDevice(device.verificationToken!);

      const decision = await manager.checkDeviceTrust(testUserId, testContext, testLocation);

      expect(decision.trusted).toBe(false);
      expect(decision.reason).toContain('Risk level too high');
      expect(decision.factors.riskAcceptable).toBe(false);
    });

    test('should require periodic verification when configured', async () => {
      // Register and verify a device
      const request: DeviceVerificationRequest = {
        userId: testUserId,
        deviceFingerprint: testFingerprint,
        location: testLocation,
        verificationMethod: VerificationMethod.EMAIL
      };

      const device = await manager.registerTrustedDevice(request);
      await manager.verifyDevice(device.verificationToken!);

      // Fast forward past verification interval
      jest.advanceTimersByTime(8 * 24 * 60 * 60 * 1000); // 8 days

      const decision = await manager.checkDeviceTrust(testUserId, testContext, testLocation);

      expect(decision.trusted).toBe(true); // Still trusted but...
      expect(decision.requiresVerification).toBe(true); // Needs re-verification
      expect(decision.reason).toContain('Periodic verification required');
      expect(decision.factors.recentlyVerified).toBe(false);
    });
  });

  describe('Device Management', () => {
    test('should get user devices', async () => {
      // Register multiple devices
      const devices: TrustedDevice[] = [];
      for (let i = 0; i < 3; i++) {
        const request: DeviceVerificationRequest = {
          userId: testUserId,
          deviceFingerprint: { ...testFingerprint, id: `fp-${i}` },
          location: testLocation,
          verificationMethod: VerificationMethod.EMAIL
        };
        const device = await manager.registerTrustedDevice(request);
        devices.push(device);
      }

      const userDevices = manager.getUserDevices(testUserId);

      expect(userDevices).toHaveLength(3);
      expect(userDevices.map(d => d.id)).toEqual(devices.map(d => d.id));
    });

    test('should rename device', async () => {
      const request: DeviceVerificationRequest = {
        userId: testUserId,
        deviceFingerprint: testFingerprint,
        location: testLocation,
        verificationMethod: VerificationMethod.EMAIL
      };

      const device = await manager.registerTrustedDevice(request);
      const newName = 'My Work Laptop';

      const renamedDevice = manager.renameDevice(device.id, newName);

      expect(renamedDevice.name).toBe(newName);
      expect(renamedDevice.id).toBe(device.id);
    });

    test('should update device settings', async () => {
      const request: DeviceVerificationRequest = {
        userId: testUserId,
        deviceFingerprint: testFingerprint,
        location: testLocation,
        verificationMethod: VerificationMethod.EMAIL
      };

      const device = await manager.registerTrustedDevice(request);
      
      const updatedDevice = manager.updateDeviceSettings(device.id, {
        allowRoaming: true,
        maxLocationRadius: 100,
        notifyOnNewLogin: false
      });

      expect(updatedDevice.settings.allowRoaming).toBe(true);
      expect(updatedDevice.settings.maxLocationRadius).toBe(100);
      expect(updatedDevice.settings.notifyOnNewLogin).toBe(false);
    });

    test('should handle device not found errors', () => {
      expect(() => manager.renameDevice('invalid-id', 'New Name'))
        .toThrow('Device not found');
      
      expect(() => manager.updateDeviceSettings('invalid-id', {}))
        .toThrow('Device not found');
    });
  });

  describe('Event Handling', () => {
    test('should emit deviceTrusted event on successful trust check', async () => {
      const eventHandler = jest.fn<unknown[], unknown>();
      manager.on('deviceTrusted', eventHandler);

      // Register and verify a device
      const request: DeviceVerificationRequest = {
        userId: testUserId,
        deviceFingerprint: testFingerprint,
        location: testLocation,
        verificationMethod: VerificationMethod.EMAIL
      };

      const device = await manager.registerTrustedDevice(request);
      await manager.verifyDevice(device.verificationToken!);

      // Check trust
      await manager.checkDeviceTrust(testUserId, testContext, testLocation);

      expect(eventHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: testUserId,
          device: expect.objectContaining({
            id: device.id
          }),
          decision: expect.objectContaining({
            trusted: true
          })
        })
      );
    });

    test('should emit deviceUntrusted event on failed trust check', async () => {
      const eventHandler = jest.fn<unknown[], unknown>();
      manager.on('deviceUntrusted', eventHandler);

      // Check trust for unregistered device
      await manager.checkDeviceTrust(testUserId, testContext, testLocation);

      expect(eventHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: testUserId,
          decision: expect.objectContaining({
            trusted: false
          })
        })
      );
    });

    test('should emit deviceRevoked event', async () => {
      const eventHandler = jest.fn<unknown[], unknown>();
      manager.on('deviceRevoked', eventHandler);

      // Register a device
      const request: DeviceVerificationRequest = {
        userId: testUserId,
        deviceFingerprint: testFingerprint,
        location: testLocation,
        verificationMethod: VerificationMethod.EMAIL
      };

      const device = await manager.registerTrustedDevice(request);
      
      // Revoke it
      await manager.revokeDevice(device.id, 'Test revocation');

      expect(eventHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: testUserId,
          device: expect.objectContaining({
            id: device.id,
            trustStatus: TrustStatus.REVOKED
          }),
          reason: 'Test revocation'
        })
      );
    });
  });

  describe('Device Types', () => {
    test('should detect mobile device', async () => {
      const mobileContext: FingerprintContext = {
        ...testContext,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7 like Mac OS X) AppleWebKit/605.1.15'
      };

      const mobileFingerprint: DeviceFingerprint = {
        ...testFingerprint,
        basic: {
          ...testFingerprint.basic,
          userAgent: mobileContext.userAgent,
          platform: 'iPhone'
        }
      };

      mockFingerprintService.generateFingerprint.mockResolvedValue(mobileFingerprint as unknown as unknown as unknown as unknown);

      const request: DeviceVerificationRequest = {
        userId: testUserId,
        deviceFingerprint: mobileFingerprint,
        location: testLocation,
        verificationMethod: VerificationMethod.SMS
      };

      const device = await manager.registerTrustedDevice(request);

      expect(device.type).toBe('mobile');
    });

    test('should detect tablet device', async () => {
      const tabletContext: FingerprintContext = {
        ...testContext,
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_7 like Mac OS X) AppleWebKit/605.1.15'
      };

      const tabletFingerprint: DeviceFingerprint = {
        ...testFingerprint,
        basic: {
          ...testFingerprint.basic,
          userAgent: tabletContext.userAgent,
          platform: 'iPad'
        }
      };

      mockFingerprintService.generateFingerprint.mockResolvedValue(tabletFingerprint as unknown as unknown as unknown as unknown);

      const request: DeviceVerificationRequest = {
        userId: testUserId,
        deviceFingerprint: tabletFingerprint,
        location: testLocation,
        verificationMethod: VerificationMethod.EMAIL
      };

      const device = await manager.registerTrustedDevice(request);

      expect(device.type).toBe('tablet');
    });
  });

  describe('Auto-renewal', () => {
    test('should auto-renew eligible devices during maintenance', async () => {
      // Register and verify a device
      const request: DeviceVerificationRequest = {
        userId: testUserId,
        deviceFingerprint: testFingerprint,
        location: testLocation,
        verificationMethod: VerificationMethod.EMAIL
      };

      const device = await manager.registerTrustedDevice(request);
      await manager.verifyDevice(device.verificationToken!);

      // Fast forward to near expiration
      jest.advanceTimersByTime(24 * 24 * 60 * 60 * 1000); // 24 days

      // Use the device
      await manager.checkDeviceTrust(testUserId, testContext, testLocation);

      // Trigger maintenance
      jest.advanceTimersByTime(60 * 60 * 1000); // 1 hour

      const updatedDevice = manager.getUserDevices(testUserId)[0];
      
      // Should be renewed
      expect(updatedDevice.expiresAt.getTime()).toBeGreaterThan(Date.now() + 20 * 24 * 60 * 60 * 1000);
    });
  });

  describe('Error Handling', () => {
    test('should handle fingerprint service errors', async () => {
      mockFingerprintService.generateFingerprint.mockRejectedValue(new Error('Service error'));

      const decision = await manager.checkDeviceTrust(testUserId, testContext, testLocation);

      expect(decision.trusted).toBe(false);
      expect(decision.reason).toBe('Error checking device trust');
      expect(decision.riskScore).toBe(100);
    });

    test('should emit error events', async () => {
      const errorHandler = jest.fn<unknown[], unknown>();
      manager.on('error', errorHandler);

      mockFingerprintService.generateFingerprint.mockRejectedValue(new Error('Service error'));

      await manager.checkDeviceTrust(testUserId, testContext, testLocation);

      expect(errorHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          operation: 'checkDeviceTrust',
          userId: testUserId,
          error: 'Service error'
        })
      );
    });
  });
});