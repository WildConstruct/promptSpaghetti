/**
 * Universal Texture Description Graph (UTDG) Data Schema
 * Epic 8.8: Historical Data Integration Foundation
 *
 * Provides the foundational data structures for historically accurate
 * content generation and Wild Construct ecosystem integration.
 */

export interface Era {
    name: string;
    period: {,
        start: number;
        end: number;
    };
    region: string[];
    accuracy: 'high' | 'medium' | 'low';
    description?: string;
    culturalContext?: string[];

export declare export interface UTDGNode {
    id: string;
    type: 'material' | 'texture' | 'pattern' | 'style' | 'garment' | 'accessory' | 'tool' | 'decoration';
    content: string;
    description?: string;
    metadata: {,
        era: Era[];
        authenticity: number;
        source: string;
        tags: string[];
        social_class?: SocialClass[];
        gender?: 'male' | 'female' | 'unisex';
        age_group?: 'child' | 'adult' | 'elder';
        occupation?: string[];
        ceremonial?: boolean;
        daily_use?: boolean;
    };
    relationships: {,
        compatible: string[];
        incompatible: string[];
        variations: Variation[];
        requires?: string[];
        enhances?: string[];
    };
    constraints: HistoricalConstraint[];
    external_source?: {
        source_id: string;
        source_type: 'museum_api' | 'academic_db' | 'archaeological' | 'literary';
        url?: string;
        last_updated: string;
        confidence: number;
    };

export interface HistoricalConstraint {
    id: string;
    rule: string;
    eras: Era[];
    regions?: string[];
    social_classes?: SocialClass[];
    enforcement: 'strict' | 'warning' | 'suggestion';
    message: string;
    description?: string;
    historical_basis?: string;

export interface ConstraintValidationResult {
    valid: boolean;
    violations: ConstraintViolation[];
    warnings: ConstraintWarning[];
    suggestions: ConstraintSuggestion[];

export interface ConstraintViolation {
    constraint_id: string;
    node_ids: string[];
    message: string;
    severity: 'critical' | 'major' | 'minor';

export interface ConstraintWarning {
    constraint_id: string;
    node_ids: string[];
    message: string;
    historical_context?: string;

export interface ConstraintSuggestion {
    constraint_id: string;
    node_ids: string[];
    message: string;
    suggested_alternatives?: string[];

export interface DataSource {
    id: string;
    name: string;
    type: 'api' | 'database' | 'file' | 'webscrape';
    endpoint?: string;
    authentication?: AuthConfig;
    caching: {,
        enabled: boolean;
        ttl: number;
        strategy: 'memory' | 'disk' | 'hybrid';
        max_size?: number;
    };
    transforms: DataTransform[];
    rate_limiting?: {
        requests_per_minute: number;
        requests_per_hour: number;
    };
    metadata: {,
        description: string;
        coverage_eras: Era[];
        data_types: UTDGNodeType[];
        accuracy_level: 'high' | 'medium' | 'low';
        last_validated: string;
    };

export interface AuthConfig {
    type: 'api_key' | 'oauth' | 'basic' | 'bearer';
    credentials: Record<string, string>;

export interface DataTransform {
    type: 'map_fields' | 'filter' | 'validate' | 'enrich';
    config: Record<string, any>;
    description: string;

export type UTDGNodeType = UTDGNode['type'];

export interface HistoricalQuery {
    era: string | string[];
    region?: string | string[];
    category: UTDGNodeType | UTDGNodeType[];
    social_class?: SocialClass | SocialClass[];
    filters: Record<string, any>;
    limit?: number;
    offset?: number;
    sort_by?: 'relevance' | 'authenticity' | 'date';
    include_variations?: boolean;
    min_authenticity?: number;

export interface HistoricalQueryResult {
    nodes: UTDGNode[];
    total_count: number;
    query_metadata: {,
        query_time: number;
        cache_hit: boolean;
        sources_used: string[];
    };

export interface MedievalClothing extends UTDGNode {
    type: 'garment';
    medieval_specific: {,
        garment_type: 'tunic' | 'surcoat' | 'hose' | 'braies' | 'chemise' | 'gown' | 'cloak' | 'hood';
        construction_method: 'sewn' | 'wrapped' | 'pinned' | 'laced';
        fabric_type: 'wool' | 'linen' | 'silk' | 'hemp' | 'cotton' | 'fur' | 'leather';
        dye_availability: 'common' | 'expensive' | 'rare' | 'impossible';
        seasonal_use: 'summer' | 'winter' | 'all_season';
        ceremonial_context?: 'court' | 'religious' | 'wedding' | 'funeral' | 'feast';
    };

export interface UTDGGraph {
    nodes: UTDGNode[];
    constraints: HistoricalConstraint[];
    metadata: {,
        version: string;
        created: string;
        last_modified: string;
        era_focus: Era[];
        accuracy_level: 'high' | 'medium' | 'low';
        source_attribution: string[];
    };

export interface ContentGenerationConfig {
    era: Era;
    region?: string;
    social_class?: SocialClass;
    scenario: 'daily_life' | 'ceremonial' | 'military' | 'religious' | 'artistic';
    gender?: 'male' | 'female' | 'mixed';
    age_groups?: ('child' | 'adult' | 'elder')[];
    variation_level: 'low' | 'medium' | 'high';
    historical_accuracy: 'strict' | 'moderate' | 'flexible';
    creativity_factor: number;
    required_elements?: string[];
    forbidden_elements?: string[];
    prefer_common_items?: boolean;

export interface GeneratedContent {
    nodes: UTDGNode[];
    constraints_applied: HistoricalConstraint[];
    generation_metadata: {,
        config: ContentGenerationConfig;
        generation_time: number;
        accuracy_score: number;
        creativity_score: number;
        historical_basis: string[];
    };

export interface VFXExportData {
    scene_description: string;
    historical_context: Era;
    accuracy_notes: string[];
    materials: MaterialDescription[];
    textures: TextureDescription[];
    lighting_notes?: string[];
    atmospheric_notes?: string[];
    crowd_control_data?: CrowdControlData;
    backdrop_data?: BackdropData;
    meteor_data?: MeteorData;

export interface MaterialDescription {
    name: string;
    properties: Record<string, any>;
    historical_basis: string;
    authenticity_level: number;

export interface TextureDescription {
    name: string;
    pattern: string;
    color_palette: string[];
    historical_source: string;

export interface CrowdControlData {
    character_types: string[];
    clothing_combinations: string[][];
    social_stratification: Record<SocialClass, number>;

export interface BackdropData {
    architectural_style: string;
    materials: string[];
    atmospheric_conditions: string[];

export interface MeteorData {
    weather_patterns: string[];
    seasonal_conditions: string[];
    time_of_day_preferences: string[];

export interface DataQualityMetrics {
    completeness: number;
    consistency: number;
    historical_accuracy: number;
    source_reliability: number;
    freshness: number;

export interface ValidationReport {
    overall_score: number;
    metrics: DataQualityMetrics;
    issues: ValidationIssue[];
    recommendations: string[];
    last_validated: string;

export interface ValidationIssue {
    type: 'missing_data' | 'inconsistency' | 'historical_error' | 'source_issue';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    affected_nodes: string[];
    suggested_fix?: string;

export type { UTDGNode, Era, HistoricalConstraint, DataSource, HistoricalQuery, HistoricalQueryResult, MedievalClothing, UTDGGraph, ContentGenerationConfig, GeneratedContent, VFXExportData, ValidationReport, ConstraintValidationResult };
//# sourceMappingURL=UTDG.d.ts.map