/**
 * Annotation Tools Demo - E17-1753114397305-79782A
 *
 * Comprehensive demonstration of all annotation tools working together
 * for professional VFX director workflows.
 */
import React from 'react';

export interface VFXUser {
    id: string;
    name: string;
    role: 'director' | 'vfx_supervisor' | 'artist' | 'producer' | 'pipeline_td' | 'coordinator';
    avatar?: string;
    email: string;
    color: string;


export interface AnnotationToolsDemoProps {
    className?: string;
    title?: string;
    showAllTools?: boolean;
    readonly?: boolean;
    initialUser?: VFXUser;

export declare const AnnotationToolsDemo: React.FC<AnnotationToolsDemoProps>;
export default AnnotationToolsDemo;
//# sourceMappingURL=AnnotationToolsDemo.d.ts.map