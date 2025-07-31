 > ;
// Version management
createPolicyVersion(id, string, changes, (Partial));
Promise;
getPolicyVersions(id, string);
Promise;
comparePolicyVersions(id, string, version1, string, version2, string);
Promise;
rollbackToVersion(id, string, version, string);
Promise;
// Bulk operations
bulkCreatePolicies(policies, CreatePolicyRequest);
Promise;
bulkUpdatePolicies(updates, BulkUpdateRequest);
Promise;
bulkDeletePolicies(ids, string);
Promise;
 > ;
assignPolicyToTarget();
policyId: string,
    targetType;
AssignmentTargetType,
    targetId;
string,
    options ?  : AssignmentOptions;
Promise;
unassignPolicyFromTarget();
policyId: string,
    targetType;
AssignmentTargetType,
    targetId;
string;
Promise;
// Bulk assignment operations
bulkAssign(assignments, CreateAssignmentRequest);
Promise;
bulkUnassign(criteria, AssignmentSearchCriteria);
Promise;
// Inheritance and conflict resolution
resolveAssignmentConflicts();
targetType: AssignmentTargetType,
    targetId;
string;
Promise;
getInheritanceChain(assignmentId, string);
Promise;
// Assignment validation
validateAssignment(assignment, CreateAssignmentRequest);
Promise;
simulateAssignment(assignment, CreateAssignmentRequest);
Promise;
 > ;
getUsageAnalytics(policyIds ?  : string, period ?  : AnalyticsPeriod);
Promise;
getComplianceAnalytics();
frameworks ?  : ComplianceFramework,
    period ?  : AnalyticsPeriod;
Promise;
getPerformanceAnalytics(period ?  : AnalyticsPeriod);
Promise;
// Real-time metrics
getRealTimeMetrics();
Promise;
getSystemHealth();
Promise;
// Reporting
generateComplianceReport();
frameworks: ComplianceFramework,
    format ?  : ReportFormat;
Promise;
generateUsageReport(period, AnalyticsPeriod, format ?  : ReportFormat);
Promise;
generateAuditReport(period, AnalyticsPeriod, format ?  : ReportFormat);
Promise;
// Insights and recommendations
getInsights(criteria ?  : InsightCriteria);
Promise;
getRecommendations(criteria ?  : RecommendationCriteria);
Promise;
 > ;
getTemplateUsage(templateId, string);
Promise;
// Template discovery
recommendTemplates(context, TemplateRecommendationContext);
Promise;
searchTemplatesByFramework(frameworks, ComplianceFramework);
Promise;
// Template validation
validateTemplate(template, CreateTemplateRequest);
Promise;
testTemplate(templateId, string, testData, TemplateTestData);
Promise;
 > ;
downloadExport(exportId, string);
Promise;
// Import operations
importPolicies(data, ImportData, options, ImportOptions);
Promise;
validateImportData(data, ImportData);
Promise;
getImportStatus(importId, string);
Promise;
// Batch operations
scheduleBatchExport();
criteria: PolicySearchCriteria,
    schedule;
ExportSchedule;
Promise;
scheduleBatchImport(source, ImportSource, schedule, ImportSchedule);
Promise;
export {};
