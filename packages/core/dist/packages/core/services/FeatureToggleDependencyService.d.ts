export interface ToggleDependency {
    id: string;
    sourceToggleId: string;
    targetToggleId: string;
    dependencyType: DependencyType;
    relationship: DependencyRelationship;
    strength: number;
    reason: string;
    autoDetected: boolean;
    metadata: DependencyMetadata;
    created: Date;
    lastValidated: Date;
}
export declare enum DependencyType {
    REQUIRES = "requires",// Source requires target to be active
    BLOCKS = "blocks",// Source blocks target from being active
    CONFLICTS = "conflicts",// Source conflicts with target (mutual exclusion)
    ENHANCES = "enhances",// Source enhances target functionality
    FOLLOWS = "follows",// Source should activate after target
    PRECEDES = "precedes",// Source should activate before target
    export,
    enum,
    DependencyRelationship
}
//# sourceMappingURL=FeatureToggleDependencyService.d.ts.map