/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */

/**
 * Device Fingerprinting Service
 *
 * Comprehensive device identification and location tracking system for
 * enhanced security and fraud detection in authentication systems.
 *
 * Features:
 * - Advanced device fingerprinting using multiple data points
 * - IP-based geolocation with accuracy validation
 * - Browser and environment profiling
 * - Canvas and WebGL fingerprinting
 * - Audio context fingerprinting
 * - Screen and hardware fingerprinting
 * - Behavioral pattern analysis
 * - VPN and proxy detection
 * - Risk scoring based on fingerprint analysis
 */
import { EventEmitter } from 'events';
export declare enum FingerprintType { BASIC = "basic",
    ENHANCED = "enhanced",
    COMPREHENSIVE = "comprehensive"

export declare enum RiskLevel {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"

export declare enum DeviceType {
    DESKTOP = "desktop",
    MOBILE = "mobile",
    TABLET = "tablet",
    EMBEDDED = "embedded" }
    UNKNOWN = "unknown"

}
}
export interface DeviceFingerprint { id: string;
    type: FingerprintType;
    confidence: number;
    createdAt: Date;
    lastSeen: Date;
    seenCount: number;
    basic: {
        userAgent: string;
        language: string;
        platform: string;
        cookieEnabled: boolean;
        doNotTrack: boolean;
        timezone: string;
        timezoneOffset: number }
}
    };
    enhanced: { screen: {
            width: number;
            height: number;
            colorDepth: number;
            pixelRatio: number;
            orientation: string };
        browser: { name: string;
            version: string;
            engine: string;
            engineVersion: string;
            buildId?: string;
            product?: string;
            productSub?: string;
            vendor?: string;
            vendorSub?: string };
        plugins: Array<{ name: string;
            filename: string;
            description: string;
            version?: string }>;
        fonts: string[];
        webgl: { vendor: string;
            renderer: string;
            version: string;
            shadingLanguageVersion: string;
            extensions: string[];
            parameters: Record<string, any> };
        canvas: { fingerprint: string;
            geometry: string;
            text: string };
        audio: { fingerprint: string;
            sampleRate: number;
            channelCount: number;
            contextState: string };
    };
    comprehensive: { hardware: {
            cpuCores: number;
            memory: number;
            touchSupport: boolean;
            sensors: string[];
            bluetooth: boolean;
            usb: boolean;
            webrtc: {
                supported: boolean;
                localCandidates: string[];
                stunServers: string[] };
        };
        network: { connectionType: string;
            downlink?: number;
            effectiveType?: string;
            rtt?: number;
            saveData?: boolean };
        permissions: { camera: string;
            microphone: string;
            location: string;
            notifications: string;
            persistentStorage: string };
        storage: { localStorage: boolean;
            sessionStorage: boolean;
            indexedDB: boolean;
            webSQL: boolean;
            quota: number };
        features: { webAssembly: boolean;
            serviceWorker: boolean;
            webWorker: boolean;
            webRTC: boolean;
            webGL: boolean;
            webGL2: boolean;
            webVR: boolean;
            webXR: boolean };
    };

}
}
export interface LocationData { id: string;
    timestamp: Date;
    source: 'ip' | 'gps' | 'wifi' | 'cell' | 'manual';
    accuracy: number;
    confidence: number;
    coordinates: {
        latitude: number;
        longitude: number;
        altitude?: number;
        accuracy?: number;
        altitudeAccuracy?: number;
        heading?: number;
        speed?: number }
}
    };
    address: { country: string;
        countryCode: string;
        region: string;
        regionCode: string;
        city: string;
        postalCode?: string;
        street?: string;
        district?: string };
    network: { ipAddress: string;
        isp: string;
        organization?: string;
        asn?: string;
        timezone: string;
        vpnDetected: boolean;
        proxyDetected: boolean;
        torDetected: boolean;
        hostingProvider: boolean;
        datacenter: boolean };
    metadata: { language: string;
        currency: string;
        callingCode: string;
        flag?: string;
        population?: number;
        area?: number };

}
}
export interface RiskAssessment { deviceId: string;
    overallRisk: RiskLevel;
    riskScore: number;
    factors: Array<{
        category: string;
        factor: string;
        impact: number;
        confidence: number;
        description: string }
}
    }>;
    recommendations: string[];
    timestamp: Date;

}
}
export interface FingerprintContext { ipAddress: string;
    userAgent: string;
    acceptLanguage?: string;
    acceptEncoding?: string;
    acceptCharset?: string;
    referer?: string;
    origin?: string;
    xForwardedFor?: string;
    xRealIp?: string;
    cfConnectingIp?: string;
    headers: Record<string, string>;
    clientData?: {
        screen?: any;
        navigator?: any;
        plugins?: any[];
        canvas?: any;
        webgl?: any;
        audio?: any;
        fonts?: string[];
        storage?: any;
        permissions?: any;
        network?: any }
}
    };
/**
 * Comprehensive device fingerprinting and location service
 */
export declare class DeviceFingerprintingService extends EventEmitter { private readonly geoipApiKey?;
    private readonly fraudDetectionEnabled;
    private fingerprints;
    private locations;
    private riskAssessments;
    private ipLocationCache;
    constructor(geoipApiKey?: string | undefined, fraudDetectionEnabled?: boolean);
    /**
     * Generate comprehensive device fingerprint
     */
    generateFingerprint(context: FingerprintContext, type?: FingerprintType): Promise<DeviceFingerprint>;
    /**
     * Get location data from IP address and other sources
     */
    getLocationData(ipAddress: string, additionalContext?: any): Promise<LocationData>;
    /**
     * Assess risk based on fingerprint and location
     */
    assessRisk(fingerprint: DeviceFingerprint, location: LocationData, userId?: string): RiskAssessment;
    /**
     * Check if device is known/trusted
     */
    isKnownDevice(fingerprintId: string): boolean;
    /**
     * Get device trust score
     */
    getDeviceTrustScore(fingerprintId: string): number;
    /**
     * Get fingerprint statistics
     */
    getStatistics(): {
        totalFingerprints: number;
        uniqueDevices: number;
        riskDistribution: Record<RiskLevel, number>;
        topCountries: Array<{
            country: string;
            count: number }>;
        deviceTypes: Record<DeviceType, number>;
        avgConfidence: number;
    };
    private calculateFingerprintId;
    private generateBasicFingerprint;
    private generateEnhancedFingerprint;
    private generateComprehensiveFingerprint;
    private calculateFingerprintConfidence;
    private fetchLocationFromIp;
    private isLocationDataFresh;
    private analyzeDeviceRisk;
    private analyzeLocationRisk;
    private analyzeBehavioralRisk;
    private determineRiskLevel;
    private generateRecommendations;
    private determineDeviceType;
    private parseUserAgent;
    private mockLatitudeFromIp;
    private mockLongitudeFromIp;
    private mockCountryFromIp;
    private mockCountryCodeFromIp;
    private detectVpn;
    private detectProxy;
    private detectTor;
    private detectHostingProvider;
    private detectDatacenter;
    private isUserDevice;
    private isUserLocation;
    private calculateAverageDistance;
    private startCleanupTimer;
    private cleanupOldData;

export declare const deviceFingerprintingService: DeviceFingerprintingService;
export default DeviceFingerprintingService;
//# sourceMappingURL=DeviceFingerprintingService.d.ts.map