// Data Protection Rule Schema - Epic 19
// Define rule schema and structure for data protection policies
// Task: T-1752989143998-258



export interface DataProtectionRule {
  ruleId: string;
  name: string;
  description: string;
  type: RuleType;
  category: RuleCategory;
  scope: RuleScope;
  conditions: RuleCondition[];
  actions: RuleAction[];
  priority: number;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;





export enum RuleType {
  ACCESS_CONTROL = 'ACCESS_CONTROL',
  DATA_FILTERING = 'DATA_FILTERING',
  CONSENT_ENFORCEMENT = 'CONSENT_ENFORCEMENT',
  RETENTION_POLICY = 'RETENTION_POLICY',
  AUDIT_REQUIREMENT = 'AUDIT_REQUIREMENT'


export enum RuleCategory {
  PRIVACY = 'PRIVACY',
  SECURITY = 'SECURITY',
  COMPLIANCE = 'COMPLIANCE',
  OPERATIONAL = 'OPERATIONAL'




export interface RuleScope {
  dataTypes: string[];
  userGroups: string[];
  geographicRegions: string[];
  timeRange?: TimeRange;







export interface TimeRange {
  startDate?: Date;
  endDate?: Date;
  schedule?: string; // cron expression







export interface RuleCondition {
  field: string;
  operator: ConditionOperator;
  value: unknown;
  logicalOperator?: LogicalOperator;





export enum ConditionOperator {
  EQUALS = 'EQUALS',
  NOT_EQUALS = 'NOT_EQUALS',
  CONTAINS = 'CONTAINS',
  NOT_CONTAINS = 'NOT_CONTAINS',
  GREATER_THAN = 'GREATER_THAN',
  LESS_THAN = 'LESS_THAN',
  IN = 'IN',
  NOT_IN = 'NOT_IN'


export enum LogicalOperator {
  AND = 'AND',
  OR = 'OR',
  NOT = 'NOT'




export interface RuleAction {
  actionType: ActionType;
  parameters: Record<string, any>;
  executionOrder: number;





export enum ActionType {
  ALLOW = 'ALLOW',
  DENY = 'DENY',
  FILTER = 'FILTER',
  AUDIT_LOG = 'AUDIT_LOG',
  REQUIRE_CONSENT = 'REQUIRE_CONSENT',
  NOTIFY = 'NOTIFY',
  ANONYMIZE = 'ANONYMIZE',
  DELETE = 'DELETE'




export interface RuleValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];







export interface RuleEvaluationContext {
  userId: string;
  dataType: string;
  operation: string;
  timestamp: Date;
  metadata: Record<string, any>;



