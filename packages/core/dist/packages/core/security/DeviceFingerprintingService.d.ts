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
export declare enum FingerprintType {
    BASIC = "basic",
    ENHANCED = "enhanced",
    COMPREHENSIVE = "comprehensive",
    export,
    enum,
    RiskLevel
}
export interface FingerprintContext {
    ipAddress: string;
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
        plugins?: any;
        canvas?: any;
        webgl?: any;
        audio?: any;
        fonts?: string;
        storage?: any;
        permissions?: any;
        network?: any;
    };
}
export declare class DeviceFingerprintingService extends EventEmitter {
    private fingerprints;
    private locations;
    private riskAssessments;
    private ipLocationCache;
    constructor();
    private readonly geoipApiKey?;
    private readonly fraudDetectionEnabled;
    super(): any;
}
//# sourceMappingURL=DeviceFingerprintingService.d.ts.map