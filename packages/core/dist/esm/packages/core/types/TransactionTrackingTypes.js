;
// Party filters
buyerId ?  : string;
sellerId ?  : string;
templateId ?  : string;
// Risk and fraud filters
riskLevel ?  : ('low' | 'medium' | 'high' | 'critical')[];
hasFraudFlags ?  : boolean;
requiresReview ?  : boolean;
// Text search
search ?  : string; // Search in transaction ID, buyer/seller names, template titles
// Admin filters
hasAdminNotes ?  : boolean;
hasFlags ?  : boolean;
flagType ?  : string;
// Pagination and sorting
page ?  : number;
pageSize ?  : number;
sortBy ?  : TransactionSortField;
sortOrder ?  : 'asc' | 'desc';
;
aggregations: TransactionAggregations;
filters: AppliedFilters;
topTemplates: Array;
topSellers: Array;
dailyVolume: Array;
 > ;
;
;
metrics: string;
;
alertSettings: {
    enabled: boolean;
    channels: AlertChannel;
    thresholds: MonitoringThresholds;
}
;
riskSettings: {
    enableMLDetection: boolean;
    manualReviewThreshold: number;
    autoFlagThreshold: number;
}
;
integrations: {
    stripe: boolean;
    paypal: boolean;
    analytics: boolean;
    crm: boolean;
}
;
export {};
