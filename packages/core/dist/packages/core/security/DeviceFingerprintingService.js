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
import crypto from 'crypto';
// Fingerprinting Types
export var FingerprintType;
(function (FingerprintType) {
    FingerprintType["BASIC"] = "basic";
    FingerprintType["ENHANCED"] = "enhanced";
    FingerprintType["COMPREHENSIVE"] = "comprehensive";
    FingerprintType[FingerprintType["export"] = void 0] = "export";
    FingerprintType[FingerprintType["enum"] = void 0] = "enum";
    FingerprintType[FingerprintType["RiskLevel"] = void 0] = "RiskLevel";
})(FingerprintType || (FingerprintType = {}));
{
    LOW = 'low',
        MEDIUM = 'medium',
        HIGH = 'high',
        CRITICAL = 'critical';
    export let DeviceType;
    (function (DeviceType) {
        DeviceType["DESKTOP"] = "desktop";
        DeviceType["MOBILE"] = "mobile";
        DeviceType["TABLET"] = "tablet";
        DeviceType["EMBEDDED"] = "embedded";
        DeviceType["UNKNOWN"] = "unknown";
        // Device Fingerprint Data
        DeviceType[DeviceType["export"] = void 0] = "export";
        DeviceType[DeviceType["interface"] = void 0] = "interface";
        DeviceType[DeviceType["DeviceFingerprint"] = void 0] = "DeviceFingerprint";
    })(DeviceType || (DeviceType = {}));
    {
        id: string;
        type: FingerprintType;
        confidence: number; // 0-100,
        createdAt: Date;
        lastSeen: Date;
        seenCount: number;
        // Basic fingerprint data
        basic: {
            userAgent: string;
            language: string;
            platform: string;
            cookieEnabled: boolean;
            doNotTrack: boolean;
            timezone: string;
            timezoneOffset: number;
        }
        ;
        // Enhanced fingerprint data
        enhanced: {
            screen: {
                width: number;
                height: number;
                colorDepth: number;
                pixelRatio: number;
                orientation: string;
            }
            ;
            browser: {
                name: string;
                version: string;
                engine: string;
                engineVersion: string;
                buildId ?  : string;
                product ?  : string;
                productSub ?  : string;
                vendor ?  : string;
                vendorSub ?  : string;
            }
            ;
            plugins: Array < {
                name: string,
                filename: string,
                description: string,
                version: string
            } > ;
            fonts: string;
            webgl: {
                ;
                vendor: string;
                renderer: string;
                version: string;
                shadingLanguageVersion: string;
                extensions: string;
                parameters: Record;
            }
            ;
            canvas: {
                fingerprint: string;
                geometry: string;
                text: string;
            }
            ;
            audio: {
                fingerprint: string;
                sampleRate: number;
                channelCount: number;
                contextState: string;
            }
            ;
        }
        ;
        // Comprehensive fingerprint data
        comprehensive: {
            hardware: {
                cpuCores: number;
                memory: number;
                touchSupport: boolean;
                sensors: string;
                bluetooth: boolean;
                usb: boolean;
                webrtc: {
                    supported: boolean;
                    localCandidates: string;
                    stunServers: string;
                }
                ;
            }
            ;
            network: {
                connectionType: string;
                downlink ?  : number;
                effectiveType ?  : string;
                rtt ?  : number;
                saveData ?  : boolean;
            }
            ;
            permissions: {
                camera: string;
                microphone: string;
                location: string;
                notifications: string;
                persistentStorage: string;
            }
            ;
            storage: {
                localStorage: boolean;
                sessionStorage: boolean;
                indexedDB: boolean;
                webSQL: boolean;
                quota: number;
            }
            ;
            features: {
                webAssembly: boolean;
                serviceWorker: boolean;
                webWorker: boolean;
                webRTC: boolean;
                webGL: boolean;
                webGL2: boolean;
                webVR: boolean;
                webXR: boolean;
            }
            ;
        }
        ;
        // Location Data
    }
     > ;
    recommendations: string;
    timestamp: Date;
    // Fingerprint Collection Context
}
export class DeviceFingerprintingService extends EventEmitter {
    fingerprints = new Map();
    locations = new Map();
    riskAssessments = new Map();
    ipLocationCache = new Map();
    geoipApiKey;
    fraudDetectionEnabled = true;
}
this.startCleanupTimer();
async;
generateFingerprint((), context, FingerprintContext, type, FingerprintType = FingerprintType.ENHANCED);
Promise < DeviceFingerprint > {
    const: fingerprintId = this.calculateFingerprintId(context),
    const: existing = this.fingerprints.get(fingerprintId),
    if(existing) {
        existing.lastSeen = new Date();
        existing.seenCount++;
        this.emit('fingerprintSeen', { fingerprint: existing, context });
        return existing;
        const fingerprint = {
            id: fingerprintId,
            type,
            confidence: 0,
            createdAt: new Date(),
            lastSeen: new Date(),
            seenCount: 1,
            basic: this.generateBasicFingerprint(context),
            enhanced: this.generateEnhancedFingerprint(context),
            comprehensive: this.generateComprehensiveFingerprint(context),
        };
        fingerprint.confidence = this.calculateFingerprintConfidence(fingerprint, type);
        this.fingerprints.set(fingerprintId, fingerprint);
        this.emit('fingerprintCreated', { fingerprint, context });
        return fingerprint;
        /**
         * Get location data from IP address and other sources
         */
    }
    /**
     * Get location data from IP address and other sources
     */
    ,
    ipAddress: string,
    additionalContext: any,
    Promise() {
        // Check cache first
        const cached = this.ipLocationCache.get(ipAddress);
        if (cached && this.isLocationDataFresh(cached)) {
            return cached;
            const location = await this.fetchLocationFromIp(ipAddress);
            // Enhance with additional context if available
            if (additionalContext?.coordinates) {
                location.coordinates = {
                    ...location.coordinates,
                    ...additionalContext.coordinates
                };
                location.source = 'gps';
                location.accuracy = additionalContext.accuracy || 10;
                // Store locations by IP
                const ipLocations = this.locations.get(ipAddress) || [];
                ipLocations.push(location);
                this.locations.set(ipAddress, ipLocations.slice(-10)); // Keep last 10 locations
                // Cache the result
                this.ipLocationCache.set(ipAddress, location);
                this.emit('locationDetected', { location, ipAddress });
                return location;
                /**
                 * Assess risk based on fingerprint and location
                 */
            }
            /**
             * Assess risk based on fingerprint and location
             */
        }
        /**
         * Assess risk based on fingerprint and location
         */
    }
    /**
     * Assess risk based on fingerprint and location
     */
    ,
    location: LocationData,
    userId: string,
    RiskAssessment
};
{
    const factors = [];
    let riskScore = 0;
    // Analyze device characteristics
    factors.push(...this.analyzeDeviceRisk(fingerprint));
    // Analyze location risk
    factors.push(...this.analyzeLocationRisk(location));
    // Analyze behavioral patterns if user is known
    if (userId) {
        factors.push(...this.analyzeBehavioralRisk(userId, fingerprint, location));
        // Calculate overall risk score
        riskScore = factors.reduce((score, factor) => score + factor.impact, 30);
        riskScore = Math.max(0, Math.min(100, riskScore));
        const overallRisk = this.determineRiskLevel(riskScore);
        const recommendations = this.generateRecommendations(factors, overallRisk);
        const assessment = {
            deviceId: fingerprint.id,
            overallRisk,
            riskScore,
            factors,
            recommendations,
            timestamp: new Date(),
        };
        this.riskAssessments.set(fingerprint.id, assessment);
        if (overallRisk === RiskLevel.HIGH || overallRisk === RiskLevel.CRITICAL) {
            this.emit('highRiskDetected', { assessment, fingerprint, location });
            return assessment;
            isKnownDevice(fingerprintId, string);
            boolean;
            {
                const fingerprint = this.fingerprints.get(fingerprintId);
                return fingerprint ? fingerprint.seenCount > 5 : false;
                getDeviceTrustScore(fingerprintId, string);
                number;
                {
                    const fingerprint = this.fingerprints.get(fingerprintId);
                    if (!fingerprint)
                        return 0;
                    const riskAssessment = this.riskAssessments.get(fingerprintId);
                    const baseScore = fingerprint.confidence;
                    const riskPenalty = riskAssessment ? riskAssessment.riskScore : 50;
                    const frequencyBonus = Math.min(20, fingerprint.seenCount * 2);
                    const ageBonus = Math.min(10, (Date.now() - fingerprint.createdAt.getTime()) / (24 * 60 * 60 * 1000));
                    return Math.max(0, Math.min(100, baseScore + frequencyBonus + ageBonus - riskPenalty));
                    getStatistics();
                    {
                        totalFingerprints: number;
                        uniqueDevices: number;
                        riskDistribution: Record;
                        topCountries: Array;
                        deviceTypes: Record;
                        avgConfidence: number;
                        const fingerprints = Array.from(this.fingerprints.values());
                        const assessments = Array.from(this.riskAssessments.values());
                        const locations = Array.from(this.ipLocationCache.values());
                        const riskDistribution = {
                            [RiskLevel.LOW]: 0,
                            [RiskLevel.MEDIUM]: 0,
                            [RiskLevel.HIGH]: 0,
                            [RiskLevel.CRITICAL]: 0,
                        };
                        assessments.forEach(assessment => { });
                        riskDistribution[assessment.overallRisk]++;
                    }
                    ;
                    const countryCounts = {};
                    locations.forEach(location => { });
                    countryCounts[location.address.country] = (countryCounts[location.address.country] || 0) + 1;
                }
                ;
                const topCountries = Object.entries(countryCounts);
                map(([country, count]) => ({ country, count }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 10);
                const deviceTypes = {
                    [DeviceType.DESKTOP]: 0,
                    [DeviceType.MOBILE]: 0,
                    [DeviceType.TABLET]: 0,
                    [DeviceType.EMBEDDED]: 0,
                    [DeviceType.UNKNOWN]: 0,
                };
                fingerprints.forEach(fp => { });
                const deviceType = this.determineDeviceType(fp);
                deviceTypes[deviceType]++;
            }
            ;
            const avgConfidence = fingerprints.length > 0;
            fingerprints.reduce((sum, fp) => sum + fp.confidence, 0) / fingerprints.length;
            0;
            return {
                totalFingerprints: fingerprints.length,
                uniqueDevices: new Set(fingerprints.map(fp => fp.id)).size,
                riskDistribution,
                topCountries,
                deviceTypes,
                avgConfidence
            };
            calculateFingerprintId(context, FingerprintContext);
            string;
            {
                const components = [];
                context.userAgent,
                    context.acceptLanguage || '',
                    context.ipAddress,
                    JSON.stringify(context.clientData?.screen || {}),
                    JSON.stringify(context.clientData?.canvas || {}),
                    JSON.stringify(context.clientData?.webgl || {}),
                    JSON.stringify(context.clientData?.audio || {});
                ;
                return crypto
                    .createHash('sha256')
                    .update(components.join('|'))
                    .digest('hex')
                    .substring(0, 32);
                generateBasicFingerprint(context, FingerprintContext);
                DeviceFingerprint['basic'];
                {
                    const ua = this.parseUserAgent(context.userAgent);
                    return {
                        userAgent: context.userAgent,
                        language: context.acceptLanguage?.split(',')[0] || 'en-US',
                        platform: ua.platform || 'unknown',
                        cookieEnabled: true, // Would be detected client-side,
                        doNotTrack: context.headers['dnt'] === '1',
                        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                        timezoneOffset: new Date().getTimezoneOffset(),
                    };
                    generateEnhancedFingerprint(context, FingerprintContext);
                    DeviceFingerprint['enhanced'];
                    {
                        const ua = this.parseUserAgent(context.userAgent);
                        const clientData = context.clientData || {};
                        return {
                            screen: {
                                width: clientData.screen?.width || 1920,
                                height: clientData.screen?.height || 1080,
                                colorDepth: clientData.screen?.colorDepth || 24,
                                pixelRatio: clientData.screen?.pixelRatio || 1,
                                orientation: clientData.screen?.orientation || 'landscape-primary',
                            },
                            browser: {
                                name: ua.browser || 'unknown',
                                version: ua.browserVersion || '1.0',
                                engine: ua.engine || 'unknown',
                                engineVersion: ua.engineVersion || '1.0',
                                buildId: clientData.navigator?.buildID,
                                product: clientData.navigator?.product,
                                productSub: clientData.navigator?.productSub,
                                vendor: clientData.navigator?.vendor,
                                vendorSub: clientData.navigator?.vendorSub,
                            },
                            plugins: clientData.plugins || [],
                            fonts: clientData.fonts || [],
                            webgl: clientData.webgl || {
                                vendor: 'unknown',
                                renderer: 'unknown',
                                version: 'unknown',
                                shadingLanguageVersion: 'unknown',
                                extensions: [],
                                parameters: {}
                            },
                            canvas: clientData.canvas || {
                                fingerprint: 'unknown',
                                geometry: 'unknown',
                                text: 'unknown',
                            },
                            audio: clientData.audio || {
                                fingerprint: 'unknown',
                                sampleRate: 44100,
                                channelCount: 2,
                                contextState: 'suspended',
                            },
                            generateComprehensiveFingerprint(context) {
                                const clientData = context.clientData || {};
                                return {
                                    hardware: {
                                        cpuCores: clientData.navigator?.hardwareConcurrency || 4,
                                        memory: clientData.navigator?.deviceMemory || 8,
                                        touchSupport: clientData.navigator?.maxTouchPoints > 0 || false,
                                        sensors: [],
                                        bluetooth: false,
                                        usb: false,
                                        webrtc: {
                                            supported: false,
                                            localCandidates: [],
                                            stunServers: [],
                                        },
                                        network: {
                                            connectionType: clientData.network?.connection?.effectiveType || 'unknown',
                                            downlink: clientData.network?.connection?.downlink,
                                            effectiveType: clientData.network?.connection?.effectiveType,
                                            rtt: clientData.network?.connection?.rtt,
                                            saveData: clientData.network?.connection?.saveData,
                                        },
                                        permissions: {
                                            camera: 'prompt',
                                            microphone: 'prompt',
                                            location: 'prompt',
                                            notifications: 'prompt',
                                            persistentStorage: 'prompt',
                                        },
                                        storage: {
                                            localStorage: true,
                                            sessionStorage: true,
                                            indexedDB: true,
                                            webSQL: false,
                                            quota: 0,
                                        },
                                        features: {
                                            webAssembly: true,
                                            serviceWorker: true,
                                            webWorker: true,
                                            webRTC: true,
                                            webGL: true,
                                            webGL2: false,
                                            webVR: false,
                                            webXR: false,
                                        },
                                        calculateFingerprintConfidence(fingerprint, type) {
                                            let confidence = 30; // Base confidence;
                                            // Browser and platform specificity
                                            if (fingerprint.basic.userAgent.length > 50)
                                                confidence += 10;
                                            if (fingerprint.enhanced.browser.name !== 'unknown')
                                                confidence += 10;
                                            // Screen characteristics
                                            if (fingerprint.enhanced.screen.width && fingerprint.enhanced.screen.height)
                                                confidence += 15;
                                            if (fingerprint.enhanced.screen.pixelRatio !== 1)
                                                confidence += 5;
                                            // WebGL capabilities
                                            if (fingerprint.enhanced.webgl.vendor !== 'unknown')
                                                confidence += 10;
                                            if (fingerprint.enhanced.webgl.extensions.length > 0)
                                                confidence += 5;
                                            // Canvas fingerprint
                                            if (fingerprint.enhanced.canvas.fingerprint !== 'unknown')
                                                confidence += 10;
                                            // Audio fingerprint
                                            if (fingerprint.enhanced.audio.fingerprint !== 'unknown')
                                                confidence += 5;
                                            // Plugins and fonts
                                            confidence += Math.min(10, fingerprint.enhanced.plugins.length);
                                            confidence += Math.min(5, fingerprint.enhanced.fonts.length / 10);
                                            return Math.min(100, confidence);
                                        },
                                        async fetchLocationFromIp(ipAddress) {
                                            // In a real implementation, this would call a GeoIP service
                                            // For now, return a mock location based on IP patterns
                                            const location = {
                                                id: crypto.randomUUID(),
                                                timestamp: new Date(),
                                                source: 'ip',
                                                accuracy: 50000, // 50km accuracy for IP-based location,
                                                confidence: 75,
                                                coordinates: {
                                                    latitude: this.mockLatitudeFromIp(ipAddress),
                                                    longitude: this.mockLongitudeFromIp(ipAddress),
                                                    accuracy: 50000,
                                                },
                                                address: {
                                                    country: this.mockCountryFromIp(ipAddress),
                                                    countryCode: this.mockCountryCodeFromIp(ipAddress),
                                                    region: 'Unknown Region',
                                                    regionCode: 'XX',
                                                    city: 'Unknown City',
                                                    postalCode: '00000',
                                                },
                                                network: {
                                                    ipAddress,
                                                    isp: 'Unknown ISP',
                                                    timezone: 'UTC',
                                                    vpnDetected: this.detectVpn(ipAddress),
                                                    proxyDetected: this.detectProxy(ipAddress),
                                                    torDetected: this.detectTor(ipAddress),
                                                    hostingProvider: this.detectHostingProvider(ipAddress),
                                                    datacenter: this.detectDatacenter(ipAddress),
                                                },
                                                metadata: {
                                                    language: 'en',
                                                    currency: 'USD',
                                                    callingCode: '+1',
                                                },
                                                return: location,
                                                isLocationDataFresh(location) {
                                                    const maxAge = 24 * 60 * 60 * 1000; // 24 hours;
                                                    return Date.now() - location.timestamp.getTime() < maxAge;
                                                },
                                                analyzeDeviceRisk(fingerprint) {
                                                    const factors = [];
                                                    // Check for automation indicators
                                                    if (fingerprint.enhanced.plugins.length === 0) {
                                                        factors.push({});
                                                        category: 'device',
                                                            factor;
                                                        'no_plugins',
                                                            impact;
                                                        15,
                                                            confidence;
                                                        80,
                                                            description;
                                                        'No browser plugins detected, possible headless browser',
                                                        ;
                                                    }
                                                    ;
                                                    // Check for suspicious user agent
                                                    if (fingerprint.basic.userAgent.includes('bot') || fingerprint.basic.userAgent.includes('crawler')) {
                                                        factors.push({});
                                                        category: 'device',
                                                            factor;
                                                        'bot_user_agent',
                                                            impact;
                                                        40,
                                                            confidence;
                                                        95,
                                                            description;
                                                        'User agent indicates automated browser',
                                                        ;
                                                    }
                                                    ;
                                                    // Check screen resolution
                                                    const { width, height } = fingerprint.enhanced.screen;
                                                    if (width === 1024 && height === 768) {
                                                        factors.push({});
                                                        category: 'device',
                                                            factor;
                                                        'common_resolution',
                                                            impact;
                                                        5,
                                                            confidence;
                                                        60,
                                                            description;
                                                        'Very common screen resolution',
                                                        ;
                                                    }
                                                    ;
                                                    return factors;
                                                },
                                                analyzeLocationRisk(location) {
                                                    const factors = [];
                                                    if (location.network.vpnDetected) {
                                                        factors.push({});
                                                        category: 'location',
                                                            factor;
                                                        'vpn_detected',
                                                            impact;
                                                        20,
                                                            confidence;
                                                        85,
                                                            description;
                                                        'VPN usage detected',
                                                        ;
                                                    }
                                                    ;
                                                    if (location.network.proxyDetected) {
                                                        factors.push({});
                                                        category: 'location',
                                                            factor;
                                                        'proxy_detected',
                                                            impact;
                                                        15,
                                                            confidence;
                                                        80,
                                                            description;
                                                        'Proxy server detected',
                                                        ;
                                                    }
                                                    ;
                                                    if (location.network.torDetected) {
                                                        factors.push({});
                                                        category: 'location',
                                                            factor;
                                                        'tor_detected',
                                                            impact;
                                                        35,
                                                            confidence;
                                                        95,
                                                            description;
                                                        'Tor network usage detected',
                                                        ;
                                                    }
                                                    ;
                                                    if (location.network.datacenter) {
                                                        factors.push({});
                                                        category: 'location',
                                                            factor;
                                                        'datacenter_ip',
                                                            impact;
                                                        25,
                                                            confidence;
                                                        90,
                                                            description;
                                                        'IP address belongs to a datacenter',
                                                        ;
                                                    }
                                                    ;
                                                    return factors;
                                                },
                                                fingerprint: DeviceFingerprint,
                                                location: LocationData, RiskAssessment, ['factors']: {
                                                    const: factors, RiskAssessment, ['factors']:  = [],
                                                    // Check if this is a new device for the user
                                                    const: userFingerprints = Array.from(this.fingerprints.values()),
                                                    : 
                                                        .filter(fp => this.isUserDevice(userId, fp.id)),
                                                    if(userFingerprints) { }, : .length === 0 } }, { factors };
                                        }, : .push({}),
                                        category: 'behavioral',
                                        factor: 'new_device',
                                        impact: 10,
                                        confidence: 90,
                                        description: 'First time seeing this device for this user', },
                                    // Check for location consistency
                                    const: userLocations = Array.from(this.ipLocationCache.values()),
                                    : 
                                        .filter(loc => this.isUserLocation(userId, loc.network.ipAddress)),
                                    if(userLocations) { }, : .length > 0
                                };
                                {
                                    const avgDistance = this.calculateAverageDistance(location, userLocations);
                                    if (avgDistance > 1000) { // More than 1000km from usual locations
                                        factors.push({});
                                        category: 'behavioral',
                                            factor;
                                        'unusual_location',
                                            impact;
                                        15,
                                            confidence;
                                        75,
                                            description;
                                        'Login from unusual geographic location',
                                        ;
                                    }
                                    ;
                                    return factors;
                                }
                            },
                            determineRiskLevel(riskScore) {
                                if (riskScore >= 80)
                                    return RiskLevel.CRITICAL;
                                if (riskScore >= 60)
                                    return RiskLevel.HIGH;
                                if (riskScore >= 40)
                                    return RiskLevel.MEDIUM;
                                return RiskLevel.LOW;
                            }
                        }();
                        factors: RiskAssessment['factors'],
                            riskLevel;
                        RiskLevel;
                        string;
                        {
                            const recommendations = [];
                            if (riskLevel === RiskLevel.CRITICAL) {
                                recommendations.push('Block access and require manual verification');
                                recommendations.push('Enable enhanced monitoring for this device');
                            }
                            else if (riskLevel === RiskLevel.HIGH) {
                                recommendations.push('Require additional authentication factors');
                                recommendations.push('Monitor subsequent activities closely');
                            }
                            else if (riskLevel === RiskLevel.MEDIUM) {
                                recommendations.push('Consider step-up authentication');
                                recommendations.push('Track device behavior patterns');
                                // Specific recommendations based on factors
                                if (factors.some(f => f.factor === 'vpn_detected')) {
                                    recommendations.push('Consider blocking VPN access for sensitive operations');
                                    if (factors.some(f => f.factor === 'new_device')) {
                                        recommendations.push('Send device registration notification to user');
                                        return [...new Set(recommendations)]; // Remove duplicates
                                        determineDeviceType(fingerprint, DeviceFingerprint);
                                        DeviceType;
                                        {
                                            const ua = fingerprint.basic.userAgent.toLowerCase();
                                            const screen = fingerprint.enhanced.screen;
                                            // Check user agent first for more accurate detection
                                            if (ua.includes('tablet') || ua.includes('ipad')) {
                                                return DeviceType.TABLET;
                                            }
                                            else if (ua.includes('mobile') || ua.includes('iphone')) {
                                                return DeviceType.MOBILE;
                                                // Fallback to screen size detection
                                                if (screen.width <= 767) {
                                                    return DeviceType.MOBILE;
                                                }
                                                else if (screen.width <= 1024) {
                                                    return DeviceType.TABLET;
                                                }
                                                else {
                                                    return DeviceType.DESKTOP;
                                                    parseUserAgent(userAgent, string);
                                                    any;
                                                    {
                                                        // Simplified user agent parsing
                                                        const ua = userAgent.toLowerCase();
                                                        let browser = 'unknown';
                                                        let browserVersion = '1.0';
                                                        let engine = 'unknown';
                                                        let platform = 'unknown';
                                                        if (ua.includes('chrome')) {
                                                            browser = 'Chrome';
                                                            const match = ua.match(/chrome\/([0-9.]+)/);
                                                            browserVersion = match ? match[1] : '1.0';
                                                            engine = 'Blink';
                                                        }
                                                        else if (ua.includes('firefox')) {
                                                            browser = 'Firefox';
                                                            const match = ua.match(/firefox\/([0-9.]+)/);
                                                            browserVersion = match ? match[1] : '1.0';
                                                            engine = 'Gecko';
                                                        }
                                                        else if (ua.includes('safari')) {
                                                            browser = 'Safari';
                                                            engine = 'WebKit';
                                                            if (ua.includes('windows'))
                                                                platform = 'Windows';
                                                            else if (ua.includes('mac'))
                                                                platform = 'macOS';
                                                            else if (ua.includes('linux'))
                                                                platform = 'Linux';
                                                            else if (ua.includes('android'))
                                                                platform = 'Android';
                                                            else if (ua.includes('ios'))
                                                                platform = 'iOS';
                                                            return { browser, browserVersion, engine, platform };
                                                            mockLatitudeFromIp(ip, string);
                                                            number;
                                                            {
                                                                // Generate consistent but fake latitude based on IP
                                                                const hash = crypto.createHash('md5').update(ip + 'lat').digest('hex');
                                                                const num = parseInt(hash.substring(0, 8), 16);
                                                                return ((num % 180) - 90) + (Math.random() - 0.5) * 10;
                                                                mockLongitudeFromIp(ip, string);
                                                                number;
                                                                {
                                                                    // Generate consistent but fake longitude based on IP
                                                                    const hash = crypto.createHash('md5').update(ip + 'lng').digest('hex');
                                                                    const num = parseInt(hash.substring(0, 8), 16);
                                                                    return ((num % 360) - 180) + (Math.random() - 0.5) * 10;
                                                                    mockCountryFromIp(ip, string);
                                                                    string;
                                                                    {
                                                                        const countries = ['United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Japan', 'Australia'];
                                                                        const hash = crypto.createHash('md5').update(ip + 'country').digest('hex');
                                                                        const index = parseInt(hash.substring(0, 2), 16) % countries.length;
                                                                        return countries[index];
                                                                        mockCountryCodeFromIp(ip, string);
                                                                        string;
                                                                        {
                                                                            const codes = ['US', 'CA', 'GB', 'DE', 'FR', 'JP', 'AU'];
                                                                            const hash = crypto.createHash('md5').update(ip + 'country').digest('hex');
                                                                            const index = parseInt(hash.substring(0, 2), 16) % codes.length;
                                                                            return codes[index];
                                                                            detectVpn(ip, string);
                                                                            boolean;
                                                                            {
                                                                                // Mock VPN detection based on IP pattern
                                                                                return ip.startsWith('10.') || ip.includes('vpn');
                                                                                detectProxy(ip, string);
                                                                                boolean;
                                                                                {
                                                                                    // Mock proxy detection
                                                                                    return ip.includes('proxy');
                                                                                    detectTor(ip, string);
                                                                                    boolean;
                                                                                    {
                                                                                        // Mock Tor detection
                                                                                        return ip.includes('tor');
                                                                                        detectHostingProvider(ip, string);
                                                                                        boolean;
                                                                                        {
                                                                                            // Mock hosting provider detection
                                                                                            return ip.startsWith('172.');
                                                                                            detectDatacenter(ip, string);
                                                                                            boolean;
                                                                                            {
                                                                                                // Mock datacenter detection
                                                                                                return ip.startsWith('203.') || ip.includes('datacenter');
                                                                                                isUserDevice(userId, string, deviceId, string);
                                                                                                boolean;
                                                                                                {
                                                                                                    // This would check a user-device mapping in a real implementation
                                                                                                    return Math.random() < 0.3; // Mock: 30% chance this is a known user device,
                                                                                                    isUserLocation(userId, string, ipAddress, string);
                                                                                                    boolean;
                                                                                                    {
                                                                                                        // This would check user location history in a real implementation
                                                                                                        return Math.random() < 0.5; // Mock: 50% chance this is a known user location,
                                                                                                        calculateAverageDistance(location, LocationData, userLocations, LocationData);
                                                                                                        number;
                                                                                                        {
                                                                                                            // Simplified distance calculation
                                                                                                            if (userLocations.length === 0)
                                                                                                                return 0;
                                                                                                            const distances = userLocations.map(ul => { });
                                                                                                            const lat1 = location.coordinates.latitude;
                                                                                                            const lon1 = location.coordinates.longitude;
                                                                                                            const lat2 = ul.coordinates.latitude;
                                                                                                            const lon2 = ul.coordinates.longitude;
                                                                                                            // Haversine formula for distance calculation
                                                                                                            const R = 6371; // Earth's radius in km;
                                                                                                            const dLat = (lat2 - lat1) * Math.PI / 180;
                                                                                                            const dLon = (lon2 - lon1) * Math.PI / 180;
                                                                                                            const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + ;
                                                                                                            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                                                                                                                Math.sin(dLon / 2) * Math.sin(dLon / 2);
                                                                                                            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                                                                                                            return R * c;
                                                                                                        }
                                                                                                        ;
                                                                                                        return distances.reduce((sum, d) => sum + d, 0) / distances.length;
                                                                                                        startCleanupTimer();
                                                                                                        void {
                                                                                                            // Clean up old data every hour
                                                                                                            setInterval() { }
                                                                                                        }();
                                                                                                        {
                                                                                                            this.cleanupOldData();
                                                                                                        }
                                                                                                        60 * 60 * 1000;
                                                                                                        ;
                                                                                                        cleanupOldData();
                                                                                                        void {
                                                                                                            const: maxAge = 30 * 24 * 60 * 60 * 1000, // 30 days;
                                                                                                            const: cutoff = new Date(Date.now() - maxAge),
                                                                                                            : .fingerprints
                                                                                                        };
                                                                                                        {
                                                                                                            if (fingerprint.lastSeen < cutoff) {
                                                                                                                this.fingerprints.delete(id);
                                                                                                                this.riskAssessments.delete(id);
                                                                                                                // Clean up old location cache
                                                                                                                for (const [ip, location] of this.ipLocationCache) {
                                                                                                                    if (location.timestamp < cutoff) {
                                                                                                                        this.ipLocationCache.delete(ip);
                                                                                                                        this.emit('cleanupCompleted', {});
                                                                                                                        remainingFingerprints: this.fingerprints.size,
                                                                                                                            remainingLocations;
                                                                                                                        this.ipLocationCache.size,
                                                                                                                        ;
                                                                                                                    }
                                                                                                                    ;
                                                                                                                    // Export default instance
                                                                                                                    export const deviceFingerprintingService = new DeviceFingerprintingService();
                                                                                                                    export default DeviceFingerprintingService;
                                                                                                                }
                                                                                                            }
                                                                                                        }
                                                                                                    }
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
