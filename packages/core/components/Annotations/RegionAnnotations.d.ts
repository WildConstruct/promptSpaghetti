/**
 * Area/Region Annotations System - E17-1753114397305-79782A
 *
 * Professional region selection and annotation tools for VFX pipeline workflows.
 * Supports multi-node selection, highlighting, MARS zone annotations, and area-based feedback.
 */
import React from 'react';

export interface RegionAnnotation {
    id: string;
    name: string;
    type: 'selection' | 'highlight' | 'problem_area' | 'optimization_zone' | 'mars_zone' | 'performance_area';
    shape: 'rectangle' | 'circle' | 'polygon' | 'freehand';
    area: RegionArea;
    style: RegionStyle;
    description: string;
    author: VFXUser;
    timestamp: string;
    lastModified: string;
    visible: boolean;
    locked: boolean;
    priority: 'low' | 'medium' | 'high' | 'critical';
    status: 'active' | 'resolved' | 'archived';
    marsZone?: MARSZoneType;
    nodeIds: string[];
    tags: string[];
    metadata: RegionMetadata;

export interface RegionArea {
    shape: 'rectangle' | 'circle' | 'polygon' | 'freehand';
    bounds: {,
        x: number;
        y: number;
        width: number;
        height: number;
    };
    points: Array<{,
        x: number;
        y: number;
    }>;
    center?: {
        x: number;
        y: number;
    };
    radius?: number;

export interface RegionStyle {
    borderColor: string;
    borderWidth: number;
    borderStyle: 'solid' | 'dashed' | 'dotted';
    fillColor: string;
    fillOpacity: number;
    shadowColor?: string;
    shadowBlur?: number;
    animation?: 'none' | 'pulse' | 'glow' | 'march';

export interface RegionMetadata {
    nodeCount: number;
    totalComplexity?: number;
    estimatedRenderTime?: number;
    performanceImpact?: 'low' | 'medium' | 'high';
    lastAnalysis?: string;

export type MARSZoneType = 'motion_source' | 'action_trigger' | 'reaction_output' | 'subject_focus' | 'camera_influence' | 'lighting_zone' | 'effects_region' | 'audio_sync' | 'timing_critical' | 'creative_decision';

export interface VFXUser {
    id: string;
    name: string;
    role: string;
    color: string;

export interface RegionAnnotationSystemProps {
    width: number;
    height: number;
    regions: RegionAnnotation[];
    nodes?: Array<{
        id: string;
        x: number;
        y: number;
        width: number;
        height: number;
        type: string;
    }>;
    currentUser: VFXUser;
    onRegionsChange: (regions: RegionAnnotation[]) => void;
    onRegionSelect?: (regionId: string | null) => void;
    onNodesInRegion?: (nodeIds: string[]) => void;
    selectedRegion?: string | null;
    readonly?: boolean;
    showGrid?: boolean;
    className?: string;

export declare const RegionAnnotationSystem: React.FC<RegionAnnotationSystemProps>;
export default RegionAnnotationSystem;
//# sourceMappingURL=RegionAnnotations.d.ts.map