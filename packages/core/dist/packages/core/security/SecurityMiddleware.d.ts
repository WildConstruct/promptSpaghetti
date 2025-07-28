export interface SecurityConfig {
    hsts: {
        enabled: boolean;
        maxAge: number;
        includeSubDomains: boolean;
        preload: boolean;
    };
    csp: {
        enabled: boolean;
        directives: Record<string, string | string>;
        reportUri?: string;
        reportOnly: boolean;
        useNonces: boolean;
    };
    frameOptions: {
        enabled: boolean;
        policy: 'DENY' | 'SAMEORIGIN' | 'ALLOW-FROM';
        allowFrom?: string;
    };
    contentTypeOptions: {
        enabled: boolean;
    };
    xssProtection: {
        enabled: boolean;
        mode: 'filter' | 'block';
    };
    referrerPolicy: {
        enabled: boolean;
        policy: string;
    };
    permissionsPolicy: {
        enabled: boolean;
        directives: Record<string, string>;
    };
    const: any;
    DEFAULT_CONFIG: SecurityConfig;
}
//# sourceMappingURL=SecurityMiddleware.d.ts.map