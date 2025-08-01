// Data Retention Periods - Epic 19
// Define retention periods by data category for compliance
// Task: T-1752989143998-476



export interface DataRetentionPeriod {
  category: DataCategory;
  subcategory?: string;
  retentionPeriod: number; // days
  legalBasis: LegalBasis[];
  jurisdiction: Jurisdiction[];
  automaticDeletion: boolean;
  archiveBeforeDeletion: boolean;
  reviewRequired: boolean;
  exceptions: RetentionException[];





export enum DataCategory {
  PERSONAL_IDENTIFIABLE = 'PERSONAL_IDENTIFIABLE',
  FINANCIAL = 'FINANCIAL',
  HEALTH = 'HEALTH',
  BEHAVIORAL = 'BEHAVIORAL',
  TECHNICAL = 'TECHNICAL',
  COMMUNICATION = 'COMMUNICATION',
  PREFERENCE = 'PREFERENCE',
  AUDIT_LOG = 'AUDIT_LOG',
  SECURITY = 'SECURITY',
  MARKETING = 'MARKETING'


export enum LegalBasis {
  GDPR_ARTICLE_6_1_A = 'GDPR_ARTICLE_6_1_A', // Consent
  GDPR_ARTICLE_6_1_B = 'GDPR_ARTICLE_6_1_B', // Contract
  GDPR_ARTICLE_6_1_C = 'GDPR_ARTICLE_6_1_C', // Legal obligation
  GDPR_ARTICLE_6_1_F = 'GDPR_ARTICLE_6_1_F', // Legitimate interest
  CCPA_BUSINESS_PURPOSE = 'CCPA_BUSINESS_PURPOSE',
  HIPAA_TREATMENT = 'HIPAA_TREATMENT',
  SOX_COMPLIANCE = 'SOX_COMPLIANCE',
  TAX_REQUIREMENT = 'TAX_REQUIREMENT'


export enum Jurisdiction {
  EU = 'EU',
  US = 'US',
  CALIFORNIA = 'CALIFORNIA',
  CANADA = 'CANADA',
  UK = 'UK',
  GLOBAL = 'GLOBAL'




export interface RetentionException {
  condition: string;
  extendedPeriod: number; // additional days
  reason: string;
  approval: ApprovalLevel;





export enum ApprovalLevel {
  AUTOMATIC = 'AUTOMATIC',
  SUPERVISOR = 'SUPERVISOR',
  LEGAL = 'LEGAL',
  DPO = 'DPO' // Data Protection Officer


// Standard retention periods by category
export const STANDARD_RETENTION_PERIODS: DataRetentionPeriod[] = [
  // Personal Identifiable Information
  {
    category: DataCategory.PERSONAL_IDENTIFIABLE,
    subcategory: 'basic_profile',
    retentionPeriod: 2555, // 7 years
    legalBasis: [LegalBasis.GDPR_ARTICLE_6_1_B, LegalBasis.GDPR_ARTICLE_6_1_F],
    jurisdiction: [Jurisdiction.EU, Jurisdiction.GLOBAL],
    automaticDeletion: true,
    archiveBeforeDeletion: true,
    reviewRequired: true,
    exceptions: [
      {
        condition: 'active_contract',
        extendedPeriod: 365,
        reason: 'Contract fulfillment',
        approval: ApprovalLevel.AUTOMATIC

      {
        condition: 'legal_dispute',
        extendedPeriod: 3650,
        reason: 'Legal hold',
        approval: ApprovalLevel.LEGAL

    ]

  // Financial Data
  {
    category: DataCategory.FINANCIAL,
    subcategory: 'payment_records',
    retentionPeriod: 2555, // 7 years
    legalBasis: [LegalBasis.TAX_REQUIREMENT, LegalBasis.SOX_COMPLIANCE],
    jurisdiction: [Jurisdiction.US, Jurisdiction.GLOBAL],
    automaticDeletion: false,
    archiveBeforeDeletion: true,
    reviewRequired: true,
    exceptions: [
      {
        condition: 'audit_requirement',
        extendedPeriod: 1095,
        reason: 'Regulatory audit',
        approval: ApprovalLevel.LEGAL

    ]

  // Health Information
  {
    category: DataCategory.HEALTH,
    subcategory: 'medical_records',
    retentionPeriod: 2190, // 6 years
    legalBasis: [LegalBasis.HIPAA_TREATMENT],
    jurisdiction: [Jurisdiction.US],
    automaticDeletion: false,
    archiveBeforeDeletion: true,
    reviewRequired: true,
    exceptions: [
      {
        condition: 'minor_patient',
        extendedPeriod: 6570, // Until age of majority + additional years
        reason: 'Minor patient records',
        approval: ApprovalLevel.SUPERVISOR

    ]

  // Behavioral Data
  {
    category: DataCategory.BEHAVIORAL,
    subcategory: 'usage_analytics',
    retentionPeriod: 1095, // 3 years
    legalBasis: [LegalBasis.GDPR_ARTICLE_6_1_F, LegalBasis.CCPA_BUSINESS_PURPOSE],
    jurisdiction: [Jurisdiction.EU, Jurisdiction.CALIFORNIA],
    automaticDeletion: true,
    archiveBeforeDeletion: false,
    reviewRequired: false,
    exceptions: [
      {
        condition: 'fraud_investigation',
        extendedPeriod: 730,
        reason: 'Security investigation',
        approval: ApprovalLevel.SUPERVISOR

    ]

  // Technical Data
  {
    category: DataCategory.TECHNICAL,
    subcategory: 'system_logs',
    retentionPeriod: 365, // 1 year
    legalBasis: [LegalBasis.GDPR_ARTICLE_6_1_F],
    jurisdiction: [Jurisdiction.GLOBAL],
    automaticDeletion: true,
    archiveBeforeDeletion: true,
    reviewRequired: false,
    exceptions: [
      {
        condition: 'security_incident',
        extendedPeriod: 1095,
        reason: 'Security forensics',
        approval: ApprovalLevel.SUPERVISOR

    ]

  // Communication Data
  {
    category: DataCategory.COMMUNICATION,
    subcategory: 'email_messages',
    retentionPeriod: 1095, // 3 years
    legalBasis: [LegalBasis.GDPR_ARTICLE_6_1_B, LegalBasis.GDPR_ARTICLE_6_1_F],
    jurisdiction: [Jurisdiction.EU, Jurisdiction.US],
    automaticDeletion: true,
    archiveBeforeDeletion: true,
    reviewRequired: false,
    exceptions: [
      {
        condition: 'legal_matter',
        extendedPeriod: 2555,
        reason: 'Legal proceedings',
        approval: ApprovalLevel.LEGAL

    ]

  // User Preferences
  {
    category: DataCategory.PREFERENCE,
    subcategory: 'user_settings',
    retentionPeriod: 1095, // 3 years
    legalBasis: [LegalBasis.GDPR_ARTICLE_6_1_A, LegalBasis.GDPR_ARTICLE_6_1_B],
    jurisdiction: [Jurisdiction.GLOBAL],
    automaticDeletion: true,
    archiveBeforeDeletion: false,
    reviewRequired: false,
    exceptions: []

  // Audit Logs
  {
    category: DataCategory.AUDIT_LOG,
    subcategory: 'access_logs',
    retentionPeriod: 2555, // 7 years
    legalBasis: [LegalBasis.GDPR_ARTICLE_6_1_C, LegalBasis.SOX_COMPLIANCE],
    jurisdiction: [Jurisdiction.GLOBAL],
    automaticDeletion: false,
    archiveBeforeDeletion: true,
    reviewRequired: true,
    exceptions: [
      {
        condition: 'regulatory_requirement',
        extendedPeriod: 3650,
        reason: 'Extended regulatory hold',
        approval: ApprovalLevel.DPO

    ]

  // Security Data
  {
    category: DataCategory.SECURITY,
    subcategory: 'incident_reports',
    retentionPeriod: 1825, // 5 years
    legalBasis: [LegalBasis.GDPR_ARTICLE_6_1_F],
    jurisdiction: [Jurisdiction.GLOBAL],
    automaticDeletion: false,
    archiveBeforeDeletion: true,
    reviewRequired: true,
    exceptions: [
      {
        condition: 'ongoing_investigation',
        extendedPeriod: 1095,
        reason: 'Active security investigation',
        approval: ApprovalLevel.SUPERVISOR

    ]

  // Marketing Data
  {
    category: DataCategory.MARKETING,
    subcategory: 'campaign_data',
    retentionPeriod: 730, // 2 years
    legalBasis: [LegalBasis.GDPR_ARTICLE_6_1_A, LegalBasis.CCPA_BUSINESS_PURPOSE],
    jurisdiction: [Jurisdiction.EU, Jurisdiction.CALIFORNIA],
    automaticDeletion: true,
    archiveBeforeDeletion: false,
    reviewRequired: false,
    exceptions: [
      {
        condition: 'consent_withdrawn',
        extendedPeriod: 0, // Immediate deletion
        reason: 'User consent withdrawal',
        approval: ApprovalLevel.AUTOMATIC

    ]

];

// Helper functions for retention management
export function getRetentionPeriod(
  category: DataCategory,
  subcategory?: string,
  jurisdiction?: Jurisdiction
): DataRetentionPeriod | undefined {
  return STANDARD_RETENTION_PERIODS.find(period => 
    period.category === category &&
    (!subcategory || period.subcategory === subcategory) &&
    (!jurisdiction || period.jurisdiction.includes(jurisdiction))
  );


export function calculateDeletionDate(
  retentionPeriod: DataRetentionPeriod,
  dataCreatedAt: Date,
  exceptions?: string[]
): Date {
  let totalRetentionDays = retentionPeriod.retentionPeriod;
  
  // Apply exceptions if any
  if (exceptions) {
    for (const exception of exceptions) {
      const applicableException = retentionPeriod.exceptions.find(e => 
        e.condition === exception
      );
      if (applicableException) {
        totalRetentionDays += applicableException.extendedPeriod;



  
  const deletionDate = new Date(dataCreatedAt);
  deletionDate.setDate(deletionDate.getDate() + totalRetentionDays);
  
  return deletionDate;


export function getApplicableJurisdictions(
  userLocation?: string,
  dataLocation?: string
): Jurisdiction[] {
  const jurisdictions: Jurisdiction[] = [Jurisdiction.GLOBAL];
  
  // Add specific jurisdictions based on user and data location
  if (userLocation?.includes('EU') || dataLocation?.includes('EU')) {
    jurisdictions.push(Jurisdiction.EU);

  
  if (userLocation?.includes('US') || dataLocation?.includes('US')) {
    jurisdictions.push(Jurisdiction.US);

  
  if (userLocation?.includes('CA') || dataLocation?.includes('CA')) {
    jurisdictions.push(Jurisdiction.CALIFORNIA);

  
  return jurisdictions;
