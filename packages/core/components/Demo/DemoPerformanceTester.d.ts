/**
 * Demo Performance Tester
 * Epic 8.1: Task 5 - Test performance with complex demo graphs
 *
 * Creates complex demo graphs and tests performance for presentations
 */
import React from 'react';
import { Node, Edge } from 'reactflow';

}
export interface PerformanceTestResult {
    nodeCount: number;
    edgeCount: number;
    renderTime: number;
    fps: number;
    memoryUsage: number;
    testDuration: number;
    passedThreshold: boolean;
    recommendations: string[];


}
export interface DemoPerformanceTesterProps {
    onTestComplete?: (result: PerformanceTestResult) => void;
    onGraphGenerated?: (nodes: Node[], edges: Edge[]) => void;
    targetFPS?: number;
    maxRenderTime?: number;

export declare const DemoPerformanceTester: React.FC<DemoPerformanceTesterProps>;
export default DemoPerformanceTester;
//# sourceMappingURL=DemoPerformanceTester.d.ts.map
}