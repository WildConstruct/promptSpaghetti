/**
 * Embeddable Content System (Epic 16)
 *
 * DEPLOYMENT BLOCKER FIX: Comprehensive embeddable content system for creating,
 * managing, and deploying interactive widgets and components across external
 * websites. Provides secure iframe embedding, customizable theming, responsive
 * design, and cross-domain communication capabilities.
 *
 * Features:
 * - Secure iframe-based embedding
 * - Customizable themes and styling
 * - Responsive design adaptation
 * - Cross-domain messaging protocol
 * - Content security and sandboxing
 * - Performance optimization
 * - Analytics integration
 * - Real-time content updates
 */
import { EventEmitter } from 'events';

export interface EmbedConfig {
    id: string;
    type: EmbedType;
    title: string;
    description?: string;
    version: string;
    content: EmbedContent;
    styling: EmbedStyling;
    behavior: EmbedBehavior;
    security: SecurityConfig;
    analytics: AnalyticsConfig;
    permissions: PermissionConfig;
    metadata: EmbedMetadata;

export type EmbedType = 'widget' | 'form' | 'gallery' | 'chart' | 'video' | 'chat' | 'survey' | 'calendar' | 'map' | 'feed' | 'custom';

export interface EmbedContent {
    html?: string;
    css?: string;
    javascript?: string;
    data?: ContentData;
    template?: TemplateConfig;
    components: ComponentConfig[];
    layout: LayoutConfig;
    interactions: InteractionConfig[];

export interface ContentData {
    static: Record<string, any>;
    dynamic: DynamicDataConfig[];
    realTime: boolean;
    refreshInterval?: number;
    cachingStrategy: 'none' | 'browser' | 'cdn' | 'aggressive';
    compression: boolean;

export interface DynamicDataConfig {
    id: string;
    source: DataSource;
    endpoint: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: Record<string, string>;
    authentication?: AuthConfig;
    transform?: string;
    fallback?: any;
    errorHandling: ErrorHandlingConfig;

export interface DataSource {
    type: 'api' | 'database' | 'file' | 'stream' | 'websocket';
    url: string;
    credentials?: string;
    timeout: number;
    retryPolicy: RetryPolicy;

export interface AuthConfig {
    type: 'none' | 'api_key' | 'bearer' | 'basic' | 'oauth';
    credentials: Record<string, string>;
    refreshToken?: string;
    expiryTime?: Date;

export interface ErrorHandlingConfig {
    strategy: 'fail' | 'fallback' | 'retry' | 'ignore';
    maxRetries: number;
    backoffMs: number;
    fallbackValue?: any;
    errorMessage?: string;

export interface RetryPolicy {
    maxAttempts: number;
    backoffStrategy: 'linear' | 'exponential' | 'fixed';
    baseDelay: number;
    maxDelay: number;
    jitter: boolean;

export interface TemplateConfig {
    engine: 'mustache' | 'handlebars' | 'react' | 'vue' | 'custom';
    template: string;
    partials?: Record<string, string>;
    helpers?: Record<string, string>;
    data?: Record<string, any>;

export interface ComponentConfig {
    id: string;
    type: ComponentType;
    name: string;
    version: string;
    config: Record<string, any>;
    styling: ComponentStyling;
    events: ComponentEvent[];
    dependencies?: string[];
    async: boolean;
    lazy: boolean;

export type ComponentType = 'button' | 'input' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'slider' | 'datepicker' | 'image' | 'video' | 'audio' | 'chart' | 'table' | 'list' | 'card' | 'modal' | 'tooltip' | 'progress' | 'spinner' | 'custom';

export interface ComponentStyling {
    css?: string;
    classes?: string[];
    inline?: Record<string, string>;
    theme?: string;
    responsive?: ResponsiveConfig;
    animations?: AnimationConfig[];

export interface ResponsiveConfig {
    breakpoints: Record<string, number>;
    rules: ResponsiveRule[];
    strategy: 'mobile-first' | 'desktop-first';

export interface ResponsiveRule {
    breakpoint: string;
    styles: Record<string, string>;
    behavior?: Record<string, any>;

export interface AnimationConfig {
    trigger: 'load' | 'hover' | 'click' | 'scroll' | 'custom';
    type: 'fade' | 'slide' | 'scale' | 'rotate' | 'bounce' | 'custom';
    duration: number;
    easing: string;
    delay?: number;
    loop?: boolean | number;

export interface ComponentEvent {
    type: string;
    handler: string;
    preventDefault?: boolean;
    stopPropagation?: boolean;
    debounce?: number;
    throttle?: number;

export interface LayoutConfig {
    type: 'fixed' | 'fluid' | 'responsive' | 'adaptive';
    container: ContainerConfig;
    grid?: GridConfig;
    flexbox?: FlexboxConfig;
    position: PositionConfig;
    overflow: OverflowConfig;

export interface ContainerConfig {
    width: DimensionValue;
    height: DimensionValue;
    maxWidth?: DimensionValue;
    maxHeight?: DimensionValue;
    minWidth?: DimensionValue;
    minHeight?: DimensionValue;
    padding: SpacingValue;
    margin: SpacingValue;

export interface GridConfig {
    columns: number | 'auto';
    rows: number | 'auto';
    gap: SpacingValue;
    areas?: string[][];
    autoFlow: 'row' | 'column' | 'row dense' | 'column dense';

export interface FlexboxConfig {
    direction: 'row' | 'column' | 'row-reverse' | 'column-reverse';
    wrap: 'nowrap' | 'wrap' | 'wrap-reverse';
    justify: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
    align: 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';
    gap: SpacingValue;

export interface PositionConfig {
    type: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
    top?: DimensionValue;
    right?: DimensionValue;
    bottom?: DimensionValue;
    left?: DimensionValue;
    zIndex?: number;

export interface OverflowConfig {
    x: 'visible' | 'hidden' | 'scroll' | 'auto';
    y: 'visible' | 'hidden' | 'scroll' | 'auto';

export type DimensionValue = string | number | 'auto' | 'inherit' | 'initial' | 'unset';

export type SpacingValue = string | number | {
    top?: DimensionValue;
    right?: DimensionValue;
    bottom?: DimensionValue;
    left?: DimensionValue;
};

export interface InteractionConfig {
    id: string;
    trigger: InteractionTrigger;
    action: InteractionAction;
    condition?: string;
    throttle?: number;
    debounce?: number;
    once?: boolean;

export interface InteractionTrigger {
    type: 'click' | 'hover' | 'focus' | 'scroll' | 'resize' | 'keypress' | 'custom';
    target?: string;
    key?: string;
    threshold?: number;

export interface InteractionAction {
    type: 'navigate' | 'submit' | 'toggle' | 'animate' | 'update' | 'emit' | 'custom';
    params: Record<string, any>;
    callback?: string;

export interface EmbedStyling {
    theme: ThemeConfig;
    customCSS?: string;
    variables: Record<string, string>;
    responsive: ResponsiveConfig;
    animations: AnimationConfig[];
    fonts: FontConfig[];
    colors: ColorPalette;
    spacing: SpacingScale;
    shadows: ShadowConfig[];
    borders: BorderConfig;

export interface ThemeConfig {
    name: string;
    variant: 'light' | 'dark' | 'auto';
    colorScheme: ColorScheme;
    typography: TypographyConfig;
    spacing: SpacingConfig;
    borderRadius: BorderRadiusConfig;
    shadows: boolean;
    animations: boolean;

export interface ColorScheme {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    background: string;
    surface: string;
    text: {
        primary: string;
        secondary: string;
        disabled: string;
    };
    border: string;
    divider: string;

export interface TypographyConfig {
    fontFamily: {
        primary: string;
        secondary?: string;
        monospace: string;
    };
    fontSize: {
        xs: string;
        sm: string;
        base: string;
        lg: string;
        xl: string;
        '2xl': string;
        '3xl': string;
        '4xl': string;
    };
    fontWeight: {
        light: number;
        normal: number;
        medium: number;
        semibold: number;
        bold: number;
    };
    lineHeight: {
        tight: number;
        normal: number;
        relaxed: number;
    };

export interface SpacingConfig {
    scale: 'linear' | 'geometric' | 'custom';
    base: number;
    values: Record<string, number>;

export interface BorderRadiusConfig {
    none: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    full: string;

export interface FontConfig {
    family: string;
    source: 'google' | 'adobe' | 'system' | 'custom';
    url?: string;
    weights: number[];
    styles: ('normal' | 'italic')[];
    display: 'auto' | 'block' | 'swap' | 'fallback' | 'optional';

export interface ColorPalette {
    [key: string]: {
        50: string;
        100: string;
        200: string;
        300: string;
        400: string;
        500: string;
        600: string;
        700: string;
        800: string;
        900: string;
    };

export interface SpacingScale {
    [key: string]: string;

export interface ShadowConfig {
    name: string;
    value: string;

export interface BorderConfig {
    width: Record<string, string>;
    style: Record<string, string>;
    color: Record<string, string>;

export interface EmbedBehavior {
    responsive: boolean;
    autoResize: boolean;
    crossDomain: boolean;
    sandbox: SandboxConfig;
    loading: LoadingConfig;
    communication: CommunicationConfig;
    lifecycle: LifecycleConfig;
    performance: PerformanceConfig;

export interface SandboxConfig {
    enabled: boolean;
    permissions: SandboxPermission[];
    allowedDomains: string[];
    cspDirectives: Record<string, string>;

export type SandboxPermission = 'allow-scripts' | 'allow-forms' | 'allow-popups' | 'allow-modals' | 'allow-orientation-lock' | 'allow-pointer-lock' | 'allow-presentation' | 'allow-same-origin' | 'allow-top-navigation' | 'allow-downloads';

export interface LoadingConfig {
    strategy: 'eager' | 'lazy' | 'conditional';
    placeholder?: PlaceholderConfig;
    skeleton?: SkeletonConfig;
    spinner?: SpinnerConfig;
    timeout: number;
    fallback?: FallbackConfig;

export interface PlaceholderConfig {
    type: 'image' | 'text' | 'custom';
    content: string;
    styling?: Record<string, string>;

export interface SkeletonConfig {
    enabled: boolean;
    animation: 'pulse' | 'wave' | 'none';
    color: string;
    highlightColor: string;

export interface SpinnerConfig {
    type: 'circle' | 'dots' | 'bars' | 'custom';
    size: 'sm' | 'md' | 'lg';
    color: string;
    speed: number;

export interface FallbackConfig {
    content: string;
    styling?: Record<string, string>;
    retry?: boolean;
    retryText?: string;

export interface CommunicationConfig {
    enabled: boolean;
    protocol: 'postMessage' | 'custom';
    allowedOrigins: string[];
    messageTypes: string[];
    encryption?: EncryptionConfig;

export interface EncryptionConfig {
    enabled: boolean;
    algorithm: 'AES' | 'RSA';
    keySize: number;
    publicKey?: string;
    privateKey?: string;

export interface LifecycleConfig {
    hooks: LifecycleHook[];
    autoMount: boolean;
    autoDestroy: boolean;
    persistState: boolean;
    stateKey?: string;

export interface LifecycleHook {
    stage: 'beforeMount' | 'mounted' | 'beforeUpdate' | 'updated' | 'beforeDestroy' | 'destroyed';
    handler: string;
    async: boolean;

export interface PerformanceConfig {
    lazyLoading: boolean;
    codesplitting: boolean;
    bundleOptimization: boolean;
    compression: boolean;
    caching: CachingConfig;
    monitoring: MonitoringConfig;

export interface CachingConfig {
    enabled: boolean;
    strategy: 'memory' | 'localStorage' | 'sessionStorage' | 'indexedDB';
    ttl: number;
    maxSize: number;
    version: string;

export interface MonitoringConfig {
    enabled: boolean;
    metrics: string[];
    sampling: number;
    reporting: ReportingConfig;

export interface ReportingConfig {
    endpoint: string;
    batchSize: number;
    flushInterval: number;
    authentication?: AuthConfig;

export interface SecurityConfig {
    csp: CSPConfig;
    cors: CORSConfig;
    authentication?: AuthConfig;
    rateLimit?: RateLimitConfig;
    validation: ValidationConfig;
    sanitization: SanitizationConfig;

export interface CSPConfig {
    enabled: boolean;
    directives: Record<string, string>;
    reportUri?: string;
    reportOnly: boolean;

export interface CORSConfig {
    enabled: boolean;
    allowedOrigins: string[];
    allowedMethods: string[];
    allowedHeaders: string[];
    credentials: boolean;
    maxAge: number;

export interface RateLimitConfig {
    enabled: boolean;
    requests: number;
    windowMs: number;
    skipSuccessfulRequests?: boolean;
    skipFailedRequests?: boolean;

export interface ValidationConfig {
    enabled: boolean;
    schemas: Record<string, any>;
    strict: boolean;
    stripUnknown: boolean;

export interface SanitizationConfig {
    enabled: boolean;
    htmlSanitizer?: HTMLSanitizerConfig;
    cssSanitizer?: CSSSanitizerConfig;
    jsSanitizer?: JSSanitizerConfig;

export interface HTMLSanitizerConfig {
    allowedTags: string[];
    allowedAttributes: Record<string, string[]>;
    allowedSchemes: string[];
    allowedClasses: string[];

export interface CSSSanitizerConfig {
    allowedProperties: string[];
    allowedValues: Record<string, string[]>;
    allowedUnits: string[];
    blockedSelectors: string[];

export interface JSSanitizerConfig {
    allowedFunctions: string[];
    blockedKeywords: string[];
    maxExecutionTime: number;
    memoryLimit: number;

export interface AnalyticsConfig {
    enabled: boolean;
    trackingId?: string;
    events: AnalyticsEvent[];
    sampling: number;
    privacy: PrivacyConfig;

export interface AnalyticsEvent {
    name: string;
    trigger: string;
    properties?: Record<string, any>;
    category?: string;
    label?: string;

export interface PrivacyConfig {
    anonymizeIp: boolean;
    respectDoNotTrack: boolean;
    cookieConsent: boolean;
    dataRetention: number;

export interface PermissionConfig {
    required: Permission[];
    optional: Permission[];
    requestOnDemand: boolean;
    gracefulDegradation: boolean;

export interface Permission {
    type: PermissionType;
    reason: string;
    fallback?: string;

export type PermissionType = 'geolocation' | 'camera' | 'microphone' | 'notifications' | 'clipboard' | 'fullscreen' | 'storage' | 'cookies';

export interface EmbedMetadata {
    name: string;
    description: string;
    version: string;
    author: AuthorInfo;
    license: string;
    keywords: string[];
    category: string;
    tags: string[];
    documentation?: string;
    repository?: string;
    homepage?: string;
    created: Date;
    updated: Date;
    deprecated?: boolean;
    deprecationMessage?: string;

export interface AuthorInfo {
    name: string;
    email?: string;
    url?: string;
    organization?: string;

export declare class EmbeddableContent extends EventEmitter {
    private config;
    private analytics?;
    private iframe?;
    private container?;
    private isInitialized;
    private isLoaded;
    private communicationChannel?;
    private state;
    constructor(config: EmbedConfig);
    initialize(container: HTMLElement | string): Promise<void>;
    load(): Promise<void>;
    update(updates: Partial<EmbedConfig>): Promise<void>;
    destroy(): Promise<void>;
    sendMessage(type: string, data: any): void;
    updateContent(content: Partial<EmbedContent>): Promise<void>;
    updateData(data: Record<string, any>): Promise<void>;
    setState(key: string, value: any): void;
    getState(key?: string): any;
    track(event: string, properties?: Record<string, any>): void;
    getContainer(): HTMLElement | null;
    getIframe(): HTMLIFrameElement | null;
    isReady(): boolean;
    getConfig(): EmbedConfig;
    private createSecureIframe;
    private renderDirectly;
    private loadContent;
    private renderTemplate;
    private renderHTML;
    private renderComponents;
    private renderComponent;
    private loadDependencies;
    private loadDependency;
    private applyStyles;
    private buildCSS;
    private buildThemeCSS;
    private buildResponsiveCSS;
    private buildAnimationCSS;
    private injectCSS;
    private injectHTML;
    private setupInteractions;
    private setupInteraction;
    private createInteractionHandler;
    private executeAction;
    private setupCommunication;
    private processMessage;
    private setupResponsiveBehavior;
    private setupSecurity;
    private executeLifecycleHook;
    private showLoadingState;
    private hideLoadingState;
    private showErrorState;
    private showSkeleton;
    private showSpinner;
    private showPlaceholder;
    private buildIframeSrc;
    private buildCSPString;
    private gatherTemplateData;
    private processTemplate;
    private sanitizeHTML;
    private applyComponentStyles;
    private setupComponentEvents;
    private getAllDependencies;
    private applyTheme;
    private evaluateCondition;
    private handleSubmitAction;
    private handleToggleAction;
    private handleAnimateAction;
    private handleUpdateAction;
    private executeCustomCallback;
    private handleResize;
    private handleUpdate;
    private handleStateMessage;
    private handleContainerResize;
    private applyCsp;
    private setupRateLimit;
    private executeAsyncHook;
    private executeSyncHook;
    private renderWithData;
    private persistState;
    private debounce;
    private throttle;

export declare class EmbedBuilder {
    private config;
    constructor(id: string, type: EmbedType);
    title(title: string): this;
    content(content: Partial<EmbedContent>): this;
    styling(styling: Partial<EmbedStyling>): this;
    behavior(behavior: Partial<EmbedBehavior>): this;
    security(security: Partial<SecurityConfig>): this;
    analytics(analytics: Partial<AnalyticsConfig>): this;
    permissions(permissions: Partial<PermissionConfig>): this;
    metadata(metadata: Partial<EmbedMetadata>): this;
    build(): EmbedConfig;
    private validateConfig;
declare const _default: {
    EmbeddableContent: typeof EmbeddableContent;
    EmbedBuilder: typeof EmbedBuilder;
};
export default _default;
//# sourceMappingURL=EmbeddableContent.d.ts.map