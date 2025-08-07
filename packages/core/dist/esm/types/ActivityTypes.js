;
resource_url ?  : string;
aggregation_key ?  : string;
created_at: string;
by_actor: Record;
recent_activity: {
    today: number;
    this_week: number;
    this_month: number;
}
;
trends: {
    daily: Array;
    hourly: Array;
}
;
activity: ActivityEvent;
timestamp: string;
loadMore: () => Promise;
createActivity: (activity) => Promise;
export {};
