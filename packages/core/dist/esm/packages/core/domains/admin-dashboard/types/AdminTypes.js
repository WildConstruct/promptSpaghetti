;
widgets: {
    autoRefresh: boolean;
    refreshInterval: number;
    showHeaders: boolean;
    collapsible: boolean;
}
;
permissions: {
    canEdit: boolean;
    canExport: boolean;
    canViewSensitive: boolean;
}
;
theme: {
    variant: 'light' | 'dark' | 'auto';
    density: 'compact' | 'comfortable' | 'spacious';
}
;
position: {
    row: number;
    col: number;
}
;
size: {
    width: number;
    height: number;
}
;
config: WidgetConfig;
title ?  : string;
visible: boolean;
;
complianceScore: number;
;
usage: {
    totalRequests: number;
    lastUsed ?  : Date;
}
;
status: 'active' | 'inactive' | 'revoked';
expiresAt ?  : Date;
createdAt: Date;
;
usage: {
    totalRequests: number;
    averageResponseTime: number;
    errorRate: number;
}
;
status: 'active' | 'deprecated' | 'disabled';
;
health: {
    database: 'healthy' | 'warning' | 'error';
    cache: 'healthy' | 'warning' | 'error';
    api: 'healthy' | 'warning' | 'error';
    storage: 'healthy' | 'warning' | 'error';
}
;
uptime: number;
version: string;
environment: 'development' | 'staging' | 'production';
onWidgetMove: (widgetId, position) => void ;
onWidgetResize: (widgetId, size) => void ;
onWidgetRemove: (widgetId) => void ;
className ?  : string;
onWidgetAdd: (widgetType, position) => void ;
userPermissions: Permission;
className ?  : string;
export {};
