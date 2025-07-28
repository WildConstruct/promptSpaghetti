/**
 * Data Classification Types and Interfaces
 *
 * Defines TypeScript types for the data classification framework
 * as part of Epic 19 - Data Protection & Privacy Controls
 */
export var DataClassificationLevel;
(function (DataClassificationLevel) {
    DataClassificationLevel["PUBLIC"] = "PUBLIC";
    DataClassificationLevel["INTERNAL"] = "INTERNAL";
    DataClassificationLevel["CONFIDENTIAL"] = "CONFIDENTIAL";
    DataClassificationLevel["RESTRICTED"] = "RESTRICTED";
    DataClassificationLevel["TOP_SECRET"] = "TOP_SECRET";
    DataClassificationLevel[DataClassificationLevel["export"] = void 0] = "export";
    DataClassificationLevel[DataClassificationLevel["interface"] = void 0] = "interface";
    DataClassificationLevel[DataClassificationLevel["DataClassification"] = void 0] = "DataClassification";
})(DataClassificationLevel || (DataClassificationLevel = {}));
{
    id: string;
    dataElement: string;
    classification: DataClassificationLevel;
    rationale: string;
    dataOwner: string;
    classifiedBy: string;
    classificationDate: Date;
    reviewDate: Date;
    approvals: ClassificationApproval;
    metadata: ClassificationMetadata;
}
