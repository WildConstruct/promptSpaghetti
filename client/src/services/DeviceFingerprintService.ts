// Enhanced Device Fingerprinting Service - Epic 19 Implementation
// Comprehensive client-side device identification with multiple techniques
import * as crypto from 'crypto-js';

export interface DeviceFingerprintData {
  fingerprint: string;,
  components: FingerprintComponents;
  metadata: FingerprintMetadata;,
  timestamp: Date;
  confidence: number;
}
export interface FingerprintComponents {
  // Basic browser info
  userAgent: string;,
  language: string;
  languages: string;,
  platform: string;
  cookieEnabled: boolean;,
  doNotTrack: string | null;
  timezone: string;,
  timezoneOffset: number;
  // Screen and display
  screenResolution: string;,
  screenColorDepth: number;
  screenPixelRatio: number;,
  availableScreenResolution: string;
  // Hardware
  hardwareConcurrency: number;,
  deviceMemory: number | null;
  maxTouchPoints: number;
  // Canvas fingerprint
  canvasFingerprint: string;,
  canvasSupported: boolean;
  // WebGL fingerprint
  webglFingerprint: string;,
  webglVendor: string;
  webglRenderer: string;,
  webglSupported: boolean;
  // Audio fingerprint
  audioFingerprint: string;,
  audioSupported: boolean;
  // Fonts
  availableFonts: string;
  // Plugins
  plugins: string;
  // Media devices
  mediaDevices: MediaDeviceInfo;
  // Network info
  connectionType: string | null;
  // Battery info
  batteryLevel: number | null;,
  charging: boolean | null;
  // Permissions
  permissions: PermissionStatus;
}
export interface FingerprintMetadata {
  collectionTime: number; // milliseconds,
  errors: string;,
  browser: BrowserInfo;
  device: DeviceInfo;,
  riskFactors: RiskFactors;
}
export interface BrowserInfo {
  name: string;,
  version: string;
  majorVersion: number;,
  engine: string;
}
export interface DeviceInfo {
  type: 'desktop' | 'mobile' | 'tablet' | 'unknown';,
  os: string;
  osVersion: string;,
  vendor: string;
}
export interface RiskFactors {
  isIncognito: boolean;,
  isBot: boolean;
  hasAdBlocker: boolean;,
  hasTouchScreen: boolean;
  isVirtualMachine: boolean;,
  spoofingDetected: boolean;
}
export interface PermissionStatus {
  camera: PermissionState | null;,
  microphone: PermissionState | null;
  geolocation: PermissionState | null;,
  notifications: PermissionState | null;
}
export class DeviceFingerprintService {
  private static instance: DeviceFingerprintService;
  private cachedFingerprint: DeviceFingerprintData | null = null;
  private cacheExpiryMs = 5 * 60 * 1000; // 5 minutes
  private constructor() {}
  static getInstance(): DeviceFingerprintService {
  if (!DeviceFingerprintService.instance) {
  DeviceFingerprintService.instance = new DeviceFingerprintService();
  return DeviceFingerprintService.instance;
  /**
  * Collect comprehensive device fingerprint
  */
  async collectFingerprint(options: {,)
  useCache?: boolean;
  components?: string;
} = {}): Promise<DeviceFingerprintData> {
  const startTime = Date.now();
  // Check cache if enabled
  if (options.useCache && this.cachedFingerprint) {
  const cacheAge = Date.now() - this.cachedFingerprint.timestamp.getTime();
  if (cacheAge < this.cacheExpiryMs) {
  return this.cachedFingerprint;
  const errors: string = [];
  const components = await this.collectAllComponents(errors);
  const metadata = await this.collectMetadata(components, errors, startTime);
  // Generate fingerprint hash
  const fingerprint = this.generateFingerprint(components);
  // Calculate confidence score
  const confidence = this.calculateConfidence(components, metadata);
  const fingerprintData: DeviceFingerprintData = {,
  fingerprint,
  components,
  metadata,
  timestamp: new Date(),
  confidence
};
    // Cache the result
    this.cachedFingerprint = fingerprintData;
    return fingerprintData;
  /**
   * Collect all fingerprint components
   */
  private async collectAllComponents(errors: string): Promise<FingerprintComponents> {
  const [
  basicInfo,
  screenInfo,
  hardwareInfo,
  canvasData,
  webglData,
  audioData,
  fonts,
  plugins,
  mediaDevices,
  networkInfo,
  batteryInfo,
  permissions
  ] = await Promise.all([)
  this.collectBasicInfo(),
  this.collectScreenInfo(),
  this.collectHardwareInfo(),
  this.collectCanvasFingerprint(errors),
  this.collectWebGLFingerprint(errors),
  this.collectAudioFingerprint(errors),
  this.collectFonts(errors),
  this.collectPlugins(),
  this.collectMediaDevices(errors),
  this.collectNetworkInfo(errors),
  this.collectBatteryInfo(errors),
  this.collectPermissions(errors)
  ]);
  return {
  ...basicInfo,
  ...screenInfo,
  ...hardwareInfo,
  ...canvasData,
  ...webglData,
  ...audioData,
  availableFonts: fonts,
  plugins,
  mediaDevices,
  ...networkInfo,
  ...batteryInfo,
  permissions
};
  /**
   * Collect basic browser information
   */
  private async collectBasicInfo(): Promise<Partial<FingerprintComponents>> {
  return {
  userAgent: navigator.userAgent,
  language: navigator.language,
  languages: navigator.languages ? [...navigator.languages] : [navigator.language],
  platform: navigator.platform,
  cookieEnabled: navigator.cookieEnabled,
  doNotTrack: navigator.doNotTrack || null,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  timezoneOffset: new Date().getTimezoneOffset(),
};
  /**
   * Collect screen and display information
   */
  private async collectScreenInfo(): Promise<Partial<FingerprintComponents>> {
    return {
      screenResolution: `${screen.width}x${screen.height}`}
},
  screenColorDepth: screen.colorDepth,
      screenPixelRatio: window.devicePixelRatio || 1,
      availableScreenResolution: `${screen.availWidth}x${screen.availHeight}`}
    };
  /**
   * Collect hardware information
   */
  private async collectHardwareInfo(): Promise<Partial<FingerprintComponents>> {
    return {
      hardwareConcurrency: navigator.hardwareConcurrency || 0,
      deviceMemory: (navigator as Navigator & { deviceMemory?: number }).deviceMemory || null,
      maxTouchPoints: navigator.maxTouchPoints || 0;
  };
  /**
   * Generate canvas fingerprint
   */
  private async collectCanvasFingerprint(errors: string): Promise<Partial<FingerprintComponents>> {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return { canvasFingerprint: '', canvasSupported: false };
      canvas.width = 280;
      canvas.height = 60;
      // Draw complex scene for fingerprinting
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.font = '11pt Arial';
      ctx.fillText('Canvas fingerprint \u{1F511}', 2, 15);
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.font = '18pt Arial';
      ctx.fillText('BrowserLeaks.com', 4, 45);
      // Add some curves
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = 'rgb(255,0,255)';
      ctx.beginPath();
      ctx.arc(75, 25, 25, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgb(0,255,255)';
      ctx.beginPath();
      ctx.arc(75, 25, 20, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgb(255,255,0)';
      ctx.beginPath();
      ctx.arc(75, 25, 15, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.fill();
      // Get canvas data
      const dataURL = canvas.toDataURL();
      const fingerprint = crypto.SHA256(dataURL).toString();
      return {
  canvasFingerprint: fingerprint,
  canvasSupported: true,
};
    } catch (error) {
      errors.push(`Canvas fingerprint error: ${error.message}`);}
      return { canvasFingerprint: '', canvasSupported: false };
  /**
   * Collect WebGL fingerprint
   */
  private async collectWebGLFingerprint(errors: string): Promise<Partial<FingerprintComponents>> {
  try {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) {
  return {
  webglFingerprint: '',
  webglVendor: '',
  webglRenderer: '',
  webglSupported: false,
};
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      const vendor = debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 'Unknown';
      const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'Unknown';
      // Create WebGL fingerprint
      const vertexShader = gl.createShader(gl.VERTEX_SHADER);
      gl.shaderSource(vertexShader!, `)
        attribute vec2 attrVertex;
        varying vec2 varyingTexCoord;
        uniform vec2 uniformOffset;
        void main() {
  varyingTexCoord = attrVertex + uniformOffset;
  gl_Position = vec4(attrVertex, 0, 1);
  `);
  gl.compileShader(vertexShader!);
  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader!, `)
  precision mediump float;
  varying vec2 varyingTexCoord;
  void main() {
  gl_FragColor = vec4(varyingTexCoord, 0, 1);
  `);
  gl.compileShader(fragmentShader!);
  const program = gl.createProgram();
  gl.attachShader(program!, vertexShader!);
  gl.attachShader(program!, fragmentShader!);
  gl.linkProgram(program!);
  gl.useProgram(program!);
  // Draw scene
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData()
  gl.ARRAY_BUFFER,
  new Float32Array([-0.2)
  -0.9,
  0,
  0.4,
  -0.26,
  0,
  0,
  0.732134444,
  0]
  ), gl.STATIC_DRAW);
  canvas.width = 256;
  canvas.height = 128;
  gl.viewport(0, 0, 256, 128);
  const vertexPosAttrib = gl.getAttribLocation(program!, 'attrVertex');
  gl.vertexAttribPointer(vertexPosAttrib, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vertexPosAttrib);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 3);
  const pixels = new Uint8Array(256 * 128 * 4);
  gl.readPixels(0, 0, 256, 128, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  const fingerprint = crypto.SHA256(pixels.toString()).toString();
  return {
  webglFingerprint: fingerprint,
  webglVendor: vendor,
  webglRenderer: renderer,
  webglSupported: true,
};
    } catch (error) {
      errors.push(`WebGL fingerprint error: ${error.message}`);}
      return {
  webglFingerprint: '',
  webglVendor: '',
  webglRenderer: '',
  webglSupported: false,
};
  /**
   * Collect audio fingerprint
   */
  private async collectAudioFingerprint(errors: string): Promise<Partial<FingerprintComponents>> {
    try {
      const AudioContext = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContext) {
        return { audioFingerprint: '', audioSupported: false };
      const context = new AudioContext();
      const oscillator = context.createOscillator();
      const analyser = context.createAnalyser();
      const gain = context.createGain();
      const scriptProcessor = context.createScriptProcessor(4096, 1, 1);
      gain.gain.value = 0; // Mute
      oscillator.type = 'triangle';
      oscillator.frequency.value = 10000;
      oscillator.connect(analyser);
      analyser.connect(scriptProcessor);
      scriptProcessor.connect(gain);
      gain.connect(context.destination);
      return new Promise((resolve) => {
  let fingerprint = '';
  scriptProcessor.onaudioprocess = (event) => {
  const output = event.inputBuffer.getChannelData(0);
  const slice = output.slice(4000, 4100);
  const hash = crypto.SHA256(slice.toString()).toString();
  fingerprint = hash.substring(0, 32);
  oscillator.disconnect();
  analyser.disconnect();
  scriptProcessor.disconnect();
  gain.disconnect();
  resolve({)
  audioFingerprint: fingerprint,
  audioSupported: true,
});
        };
        oscillator.start(0);
        context.startRendering?.();
        // Fallback timeout
        setTimeout(() => {
  resolve({)
  audioFingerprint: fingerprint || '',
  audioSupported: !!fingerprint,
});
        }, 100);
      });
    } catch (error) {
      errors.push(`Audio fingerprint error: ${error.message}`);}
      return { audioFingerprint: '', audioSupported: false };
  /**
   * Detect available fonts
   */
  private async collectFonts(errors: string): Promise<string> {
    try {
      const baseFonts = ['monospace', 'sans-serif', 'serif'];
      const testString = 'mmmmmmmmmmlli';
      const testSize = '72px';
      const h = document.getElementsByTagName('body')[0];
      const s = document.createElement('span');
      s.style.fontSize = testSize;
      // SECURITY FIX: Use textContent instead of innerHTML to prevent XSS
      s.textContent = testString;
      const defaultWidth: Record<string, number> = {};
      const defaultHeight: Record<string, number> = {};
      for (const baseFont of baseFonts) {
        s.style.fontFamily = baseFont;
        h.appendChild(s);
        defaultWidth[baseFont] = s.offsetWidth;
        defaultHeight[baseFont] = s.offsetHeight;
        h.removeChild(s);
      const fontList = [;
        'Andale Mono', 'Arial', 'Arial Black', 'Arial Hebrew', 'Arial MT', 'Arial Narrow',
        'Arial Rounded MT Bold', 'Arial Unicode MS', 'Bitstream Vera Sans Mono', 'Book Antiqua',
        'Bookman Old Style', 'Calibri', 'Cambria', 'Cambria Math', 'Century', 'Century Gothic',
        'Century Schoolbook', 'Comic Sans', 'Comic Sans MS', 'Consolas', 'Courier', 'Courier New',
        'Geneva', 'Georgia', 'Helvetica', 'Helvetica Neue', 'Impact', 'Lucida Bright',
        'Lucida Calligraphy', 'Lucida Console', 'Lucida Fax', 'LUCIDA GRANDE', 'Lucida Handwriting',
        'Lucida Sans', 'Lucida Sans Typewriter', 'Lucida Sans Unicode', 'Microsoft Sans Serif',
        'Monaco', 'Monotype Corsiva', 'MS Gothic', 'MS Outlook', 'MS PGothic', 'MS Reference Sans Serif',
        'MS Sans Serif', 'MS Serif', 'MYRIAD', 'MYRIAD PRO', 'Palatino', 'Palatino Linotype',
        'Segoe Print', 'Segoe Script', 'Segoe UI', 'Segoe UI Light', 'Segoe UI Semibold',
        'Segoe UI Symbol', 'Tahoma', 'Times', 'Times New Roman', 'Times New Roman PS',
        'Trebuchet MS', 'Verdana', 'Wingdings', 'Wingdings 2', 'Wingdings 3'
      ];
      const detectedFonts: string = [];
      for (const font of fontList) {
        let detected = false;
        for (const baseFont of baseFonts) {
          s.style.fontFamily = `'${font}',${baseFont}`;}
          h.appendChild(s);
          const matched = (s.offsetWidth !== defaultWidth[baseFont] || s.offsetHeight !== defaultHeight[baseFont]);
          h.removeChild(s);
          if (matched) {
            detected = true;
            break;
        if (detected) {
          detectedFonts.push(font);
      return detectedFonts;
    } catch (error) {
      errors.push(`Font detection error: ${error.message}`);}
      return [];
  /**
   * Collect browser plugins
   */
  private async collectPlugins(): Promise<string> {
    const plugins: string = [];
    if (navigator.plugins) {
      for (let i = 0; i < navigator.plugins.length; i++) {
        const plugin = navigator.plugins[i];
        plugins.push(`${plugin.name} (${plugin.filename})`);}
    return plugins;
  /**
   * Collect media devices
   */
  private async collectMediaDevices(errors: string): Promise<MediaDeviceInfo> {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        return [];
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.map(device => ({)
  deviceId: device.deviceId,
        kind: device.kind,
        label: device.label || `${device.kind} device`}
},
  groupId: device.groupId;
  }));
    } catch (error) {
      errors.push(`Media devices error: ${error.message}`);}
      return [];
  /**
   * Collect network information
   */
  private async collectNetworkInfo(errors: string): Promise<Partial<FingerprintComponents>> {
    try {
      const connection = (navigator as Navigator & {)
  connection?: { effectiveType?: string };
        mozConnection?: { effectiveType?: string };
        webkitConnection?: { effectiveType?: string };
      }).connection || 
                        (navigator as Navigator & { mozConnection?: { effectiveType?: string } }).mozConnection || 
                        (navigator as Navigator & { webkitConnection?: { effectiveType?: string } }).webkitConnection;
      return {
  connectionType: connection?.effectiveType || null,
};
    } catch (error) {
      errors.push(`Network info error: ${error.message}`);}
      return { connectionType: null };
  /**
   * Collect battery information
   */
  private async collectBatteryInfo(errors: string): Promise<Partial<FingerprintComponents>> {
  try {
  if ('getBattery' in navigator) {
  const battery = await (navigator as any).getBattery();
  return {
  batteryLevel: battery.level,
  charging: battery.charging,
};
      return { batteryLevel: null, charging: null };
    } catch (error) {
      errors.push(`Battery info error: ${error.message}`);}
      return { batteryLevel: null, charging: null };
  /**
   * Collect permission status
   */
  private async collectPermissions(errors: string): Promise<PermissionStatus> {
  const permissions: PermissionStatus = {,
  camera: null,
  microphone: null,
  geolocation: null,
  notifications: null,
};
    try {
      if ('permissions' in navigator) {
        const permissionNames: Array<[keyof PermissionStatus, PermissionName]> = [
          ['camera', 'camera' as PermissionName],
          ['microphone', 'microphone' as PermissionName],
          ['geolocation', 'geolocation' as PermissionName],
          ['notifications', 'notifications' as PermissionName]
        ];
        for (const [key, name] of permissionNames) {
          try {
            const result = await navigator.permissions.query({ name });
            permissions[key] = result.state;
          } catch {
            // Permission not available
    } catch (error) {
      errors.push(`Permissions error: ${error.message}`);}
    return permissions;
  /**
   * Collect metadata about the fingerprinting process
   */
  private async collectMetadata(components: FingerprintComponents,)
    errors: string,
    startTime: number): Promise<FingerprintMetadata> {,
  const browser = this.detectBrowser();
  const device = this.detectDevice(components);
  const riskFactors = await this.detectRiskFactors(components);
  return {
  collectionTime: Date.now() - startTime,
  errors,
  browser,
  device,
  riskFactors
};
  /**
   * Detect browser information
   */
  private detectBrowser(): BrowserInfo {
    const ua = navigator.userAgent;
    let name = 'Unknown';
    let version = '0';
    let engine = 'Unknown';
    if (ua.indexOf('Firefox') > -1) {
      name = 'Firefox';
      version = ua.match(/Firefox\/(\d+\.?\d*)/)?.[1] || '0';
      engine = 'Gecko';
    } else if (ua.indexOf('Opera') > -1 || ua.indexOf('OPR') > -1) {
  name = 'Opera';
  version = ua.match(/(?:Opera|OPR)\/(\d+\.?\d*)/)?.[1] || '0';
  engine = 'Blink';
} else if (ua.indexOf('Chrome') > -1) {
      name = 'Chrome';
      version = ua.match(/Chrome\/(\d+\.?\d*)/)?.[1] || '0';
      engine = 'Blink';
    } else if (ua.indexOf('Safari') > -1) {
      name = 'Safari';
      version = ua.match(/Version\/(\d+\.?\d*)/)?.[1] || '0';
      engine = 'WebKit';
    } else if (ua.indexOf('Edge') > -1) {
  name = 'Edge';
  version = ua.match(/Edge\/(\d+\.?\d*)/)?.[1] || '0';
  engine = 'EdgeHTML';
  return {
  name,
  version,
  majorVersion: parseInt(version.split('.')[0], 10),
  engine
};
  /**
   * Detect device type and OS
   */
  private detectDevice(components: FingerprintComponents): DeviceInfo {
  const ua = navigator.userAgent;
  const platform = navigator.platform;
  let type: DeviceInfo['type'] = 'unknown';
  let os = 'Unknown';
  let osVersion = '';
  let vendor = '';
  // Detect device type
  if (components.maxTouchPoints > 0 || 'ontouchstart' in window) {
  if (ua.match(/tablet|ipad/i) || (ua.match(/android/i) && !ua.match(/mobile/i))) {
  type = 'tablet';
} else if (ua.match(/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i)) {
        type = 'mobile';
      } else {
        type = 'desktop';
    } else {
  type = 'desktop';
  // Detect OS
  if (ua.indexOf('Windows NT') > -1) {
  os = 'Windows';
  const match = ua.match(/Windows NT (\d+\.\d+)/);
  if (match) {
  const versions: Record<string, string> = {,
  '10.0': '10',
  '6.3': '8.1',
  '6.2': '8',
  '6.1': '7',
  '6.0': 'Vista',
  '5.1': 'XP',
};
        osVersion = versions[match[1]] || match[1];
    } else if (ua.indexOf('Mac OS X') > -1) {
      os = 'macOS';
      const match = ua.match(/Mac OS X (\d+[._]\d+)/);
      if (match) {
        osVersion = match[1].replace('_', '.');
    } else if (ua.indexOf('Android') > -1) {
      os = 'Android';
      const match = ua.match(/Android (\d+\.?\d*)/);
      if (match) {
        osVersion = match[1];
    } else if (ua.match(/iPhone|iPad|iPod/)) {
      os = 'iOS';
      const match = ua.match(/OS (\d+[._]\d+)/);
      if (match) {
        osVersion = match[1].replace('_', '.');
    } else if (ua.indexOf('Linux') > -1) {
      os = 'Linux';
    // Detect vendor
    if (navigator.vendor) {
      vendor = navigator.vendor;
    return { type, os, osVersion, vendor };
  /**
   * Detect risk factors and potential spoofing
   */
  private async detectRiskFactors(components: FingerprintComponents): Promise<RiskFactors> {
  return {
  isIncognito: await this.detectIncognito(),
  isBot: this.detectBot(components),
  hasAdBlocker: await this.detectAdBlocker(),
  hasTouchScreen: components.maxTouchPoints > 0 || 'ontouchstart' in window,
  isVirtualMachine: this.detectVirtualMachine(components),
  spoofingDetected: this.detectSpoofing(components),
};
  /**
   * Detect incognito/private mode
   */
  private async detectIncognito(): Promise<boolean> {
    return new Promise((resolve) => {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        navigator.storage.estimate().then(estimate => {)
  resolve(estimate.quota !== undefined && estimate.quota < 120000000);
        }).catch(() => resolve(false));
      } else {
        resolve(false);
    });
  /**
   * Detect bot/automation
   */
  private detectBot(components: FingerprintComponents): boolean {
  const botIndicators = [;
  navigator.webdriver,
  window.document.documentElement.getAttribute('webdriver') !== null,
  'callPhantom' in window,
  '_phantom' in window,
  'phantom' in window,
  components.plugins.length === 0 && components.languages.length === 0
  ];
  return botIndicators.some(indicator => indicator === true);
  /**
  * Detect ad blocker
  */
  private async detectAdBlocker(): Promise<boolean> {,
  return new Promise((resolve) => {
  const testAd = document.createElement('div');
  // SECURITY FIX: Use textContent instead of innerHTML to prevent XSS,
  testAd.textContent = '\u00A0'; // Non-breaking space
  testAd.className = 'adsbox pub_300x250 pub_300x250m pub_728x90 text-ad textAd text_ad text_ads text-ads text-ad-links';
  testAd.style.width = '1px';
  testAd.style.height = '1px';
  testAd.style.position = 'absolute';
  testAd.style.left = '-10000px';
  testAd.style.top = '-10000px';
  document.body.appendChild(testAd);
  setTimeout(() => {
  const blocked = testAd.offsetHeight === 0 || ;
  testAd.offsetWidth === 0 ||
  testAd.offsetLeft === 0 ||
  testAd.offsetTop === 0 ||
  testAd.clientHeight === 0 ||
  testAd.clientWidth === 0;
  document.body.removeChild(testAd);
  resolve(blocked);
}, 100);
    });
  /**
   * Detect virtual machine
   */
  private detectVirtualMachine(components: FingerprintComponents): boolean {
    const vmIndicators = [;
      components.webglRenderer.toLowerCase().includes('swiftshader'),
      components.webglVendor.toLowerCase().includes('mesa'),
      components.hardwareConcurrency === 1,
      components.deviceMemory === 0
    ];
    return vmIndicators.filter(indicator => indicator === true).length >= 2;
  /**
   * Detect fingerprint spoofing
   */
  private detectSpoofing(components: FingerprintComponents): boolean {
    const suspiciousPatterns = [;
      // Check for impossible combinations
      components.platform === 'MacIntel' && components.maxTouchPoints > 0,
      components.userAgent.includes('Windows') && components.platform === 'MacIntel',
      components.languages.length === 0,
      components.screenColorDepth === 0,
      components.hardwareConcurrency === 0
    ];
    return suspiciousPatterns.some(pattern => pattern === true);
  /**
   * Generate fingerprint hash from components
   */
  private generateFingerprint(components: FingerprintComponents): string {
    const significantComponents = [;
      components.userAgent,
      components.language,
      components.screenResolution,
      components.screenColorDepth,
      components.timezone,
      components.platform,
      components.canvasFingerprint,
      components.webglFingerprint,
      components.audioFingerprint,
      components.availableFonts.join(','),
      components.plugins.join(',')
    ];
    return crypto.SHA256(significantComponents.join('|')).toString();
  /**
   * Calculate confidence score
   */
  private calculateConfidence(components: FingerprintComponents, metadata: FingerprintMetadata): number {
    let score = 100;
    // Reduce score for missing components
    if (!components.canvasSupported) score -= 10;
    if (!components.webglSupported) score -= 10;
    if (!components.audioSupported) score -= 5;
    if (components.availableFonts.length === 0) score -= 5;
    if (components.plugins.length === 0) score -= 5;
    // Reduce score for errors
    score -= metadata.errors.length * 2;
    // Reduce score for risk factors
    if (metadata.riskFactors.isIncognito) score -= 10;
    if (metadata.riskFactors.isBot) score -= 20;
    if (metadata.riskFactors.spoofingDetected) score -= 30;
    if (metadata.riskFactors.isVirtualMachine) score -= 15;
    return Math.max(0, Math.min(100, score));
  /**
   * Compare two fingerprints
   */
  compareFingerprints(fp1: DeviceFingerprintData, fp2: DeviceFingerprintData): {,
  match: boolean;
    similarity: number;,
  changedComponents: string;
    if (fp1.fingerprint === fp2.fingerprint) {
      return { match: true, similarity: 100, changedComponents: [] };
    const changedComponents: string = [];
    let matchingComponents = 0;
    let totalComponents = 0;
    // Compare each component
    const componentKeys = Object.keys(fp1.components) as Array<keyof FingerprintComponents>;
    for (const key of componentKeys) {
      totalComponents++;
      const val1 = fp1.components[key];
      const val2 = fp2.components[key];
      if (JSON.stringify(val1) === JSON.stringify(val2)) {
        matchingComponents++;
      } else {
  changedComponents.push(key);
  const similarity = (matchingComponents / totalComponents) * 100;
  return {
  match: false,
  similarity: Math.round(similarity),
  changedComponents
};