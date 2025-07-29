/**
 * Drawing/Sketching Annotations System - E17-1753114397305-79782A
 *
 * Professional drawing and markup tools for VFX directors.
 * Canvas-based overlay system for visual communication and creative direction.
 */
import React from 'react';

export interface DrawingAnnotation {
    id: string;
    type: 'freehand' | 'arrow' | 'circle' | 'rectangle' | 'line' | 'text';
    points: Array<{,
        x: number;
        y: number;
    }>;
    style: DrawingStyle;
    layer: number;
    author: VFXUser;
    timestamp: string;
    visible: boolean;
    locked: boolean;
    text?: string;
    transform?: {
        rotation: number;
        scale: {
            x: number;
            y: number;
        };
    };

export interface DrawingStyle {
    color: string;
    thickness: number;
    opacity: number;
    fillColor?: string;
    fillOpacity?: number;
    dashPattern?: number[];
    lineCap: 'round' | 'square' | 'butt';
    lineJoin: 'round' | 'miter' | 'bevel';
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: 'normal' | 'bold';

export interface VFXUser {
    id: string;
    name: string;
    role: string;
    color: string;

export interface DrawingCanvasProps {
    width: number;
    height: number;
    annotations: DrawingAnnotation[];
    currentUser: VFXUser;
    backgroundImageUrl?: string;
    onAnnotationsChange: (annotations: DrawingAnnotation[]) => void;
    onSave?: (annotations: DrawingAnnotation[]) => void;
    readonly?: boolean;
    showGrid?: boolean;
    gridSize?: number;
    className?: string;

export declare const DrawingAnnotationsCanvas: React.FC<DrawingCanvasProps>;
export default DrawingAnnotationsCanvas;
//# sourceMappingURL=DrawingAnnotations.d.ts.map