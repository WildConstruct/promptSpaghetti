/**
 * VFX Pipeline Visualizer - E17-1753114397343-6622FD
 *
 * Advanced visualization components for Wild Construct VFX pipeline workflows.
 * Provides real-time visualization of historical accuracy, scene composition,
 * asset relationships, and creative workflow metrics.
 */
import React from 'react';
export interface VFXScene {
    id: string;
    name: string;
    historicalPeriod: string;
    region: string;
    timeOfDay: 'dawn' | 'morning' | 'noon' | 'afternoon' | 'evening' | 'night';
    weather: string;
    characters: VFXCharacter;
    assets: VFXAsset;
    composition: SceneComposition;
    accuracy: HistoricalAccuracyMetrics;
}
export interface VFXCharacter {
    id: string;
    name: string;
    type: 'crowd' | 'hero' | 'background';
    period: string;
    culture: string;
    accuracy: number;
    clothing: string;
    position: {
        x: number;
        y: number;
        z: number;
    };
}
export interface VFXAsset {
    id: string;
    name: string;
    type: 'building' | 'prop' | 'terrain' | 'vegetation' | 'texture';
    period: string;
    region: string;
    accuracy: number;
    materials: MaterialProperty;
    lod: number;
}
export interface MaterialProperty {
    name: string;
    type: 'diffuse' | 'roughness' | 'metallic' | 'normal' | 'displacement';
    value: number;
    historicallyAccurate: boolean;
}
export interface SceneComposition {
    cameraPosition: {
        x: number;
        y: number;
        z: number;
    };
    focalLength: number;
    depth: number;
    layers: SceneLayer;
}
export interface SceneLayer {
    id: string;
    name: string;
    type: 'foreground' | 'midground' | 'background';
    opacity: number;
    elements: string;
}
export interface HistoricalAccuracyMetrics {
    overall: number;
    architecture: number;
    clothing: number;
    technology: number;
    culture: number;
    timeline: number;
    expertValidated: boolean;
    violations: AccuracyViolation;
}
export interface AccuracyViolation {
    type: 'anachronism' | 'cultural' | 'architectural' | 'technological';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    element: string;
    suggestion: string;
}
export interface VFXPipelineVisualizerProps {
    scene?: VFXScene;
    scenes?: VFXScene;
    realTimeUpdate?: boolean;
    showControls?: boolean;
    onSceneUpdate?: (scene: VFXScene) => void;
    className?: string;
}
export declare const VFXPipelineVisualizer: React.FC<VFXPipelineVisualizerProps>;
export default VFXPipelineVisualizer;
//# sourceMappingURL=VFXPipelineVisualizer.d.ts.map