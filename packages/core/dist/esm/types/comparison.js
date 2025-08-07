// TypeScript types for visual diff and comparison system
// Story 9.3.2 - Visual Diff Tool
position: {
    x: number;
    y: number;
}
;
data: Record;
[key, string];
unknown;
    > ;
edges: Array < {
    id: string,
    source: string,
    target: string,
    data: (Record),
    [key]: string, unknown } > ;
metadata ?  : Record;
    > ;
position_changed: boolean;
visual_changes: Record;
    > ;
connection_changed: boolean;
;
    > ;
    > ;
failed: Array < {
    error: string } > ;
total_requested: number;
successful_count: number;
failed_count: number;
// Error types
export class ComparisonError extends Error {
    message;
    code;
    details;
}
this.name = 'ComparisonError';
export class DiffSessionError extends Error {
    message;
    code;
    sessionId;
}
this.name = 'DiffSessionError';
comparison_id: string;
user_id: string;
timestamp: Date;
data ?  : Record;
session_id: string;
user_id: string;
timestamp: Date;
data ?  : Record;
