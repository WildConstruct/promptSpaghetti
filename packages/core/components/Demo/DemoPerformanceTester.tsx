/**
 * Demo Performance Tester
 * Epic 8.1: Task 5 - Test performance with complex demo graphs
 * 
 * Creates complex demo graphs and tests performance for presentations
 */
import React, { useState, useCallback, useRef } from 'react';
import { Node, Edge } from 'reactflow';
import { ProfessionalSpinner } from '../LoadingStates/ProfessionalSpinner';

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
}

export const DemoPerformanceTester: React.FC<DemoPerformanceTesterProps> = ({)
  onTestComplete,
  onGraphGenerated,
  targetFPS = 30,
  maxRenderTime = 16
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>('');
  const [results, setResults] = useState<PerformanceTestResult[]>([]);
  const performanceObserverRef = useRef<PerformanceObserver | null>(null);
  const metricsRef = useRef({)
    frameCount: 0,
    renderTimeSum: 0,
    lastFrameTime: 0,
    startTime: 0,
  });
  // Generate complex demo graph for testing
  const generateComplexDemoGraph = useCallback((nodeCount: number): { nodes: Node[], edges: Edge[] } => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    // Create a complex graph structure simulating a real filmmaker workflow
    const categories = ['Subject', 'Action', 'Attribute', 'Connector', 'WeightedChoice', 'Concat', 'Output'];
    // Generate nodes in a hierarchical structure
    for (let i = 0; i < nodeCount; i++) {
      const category = categories[i % categories.length];
      const x = (i % 20) * 250; // Grid layout;
      const y = Math.floor(i / 20) * 150;
      nodes.push({)
        id: `demo-node-${i}`,}
        type: 'default',
        position: { x, y },
        data: {,
          nodeType: category,
          label: `${category} ${i + 1}`,}
          // Add realistic data for different node types
          ...(category === 'WeightedChoice' && {)
            choices: [,
              { text: 'Option A', weight: 0.4 },
              { text: 'Option B', weight: 0.3 },
              { text: 'Option C', weight: 0.3 }
            ]
          }),
          ...(category === 'Subject' && {)
            variations: ['Character A', 'Character B', 'Character C']
          }),
          ...(category === 'Action' && {)
            variations: ['runs', 'walks', 'jumps', 'dances']
          })
        }
      });
    }
    // Generate edges to create realistic connections
    for (let i = 0; i < nodes.length - 1; i++) {
      // Connect to next node (linear flow)
      if (i < nodes.length - 1) {
        edges.push({)
          id: `edge-${i}-${i + 1}`,}
          source: nodes[i].id,
          target: nodes[i + 1].id,
          type: 'smoothstep',
        });
      }
      // Add some branching connections
      if (i % 5 === 0 && i + 3 < nodes.length) {
        edges.push({)
          id: `branch-edge-${i}-${i + 3}`,}
          source: nodes[i].id,
          target: nodes[i + 3].id,
          type: 'smoothstep',
        });
      }
      // Add convergence connections
      if (i % 7 === 0 && i + 2 < nodes.length) {
        edges.push({)
          id: `converge-edge-${i}-${i + 2}`,}
          source: nodes[i].id,
          target: nodes[i + 2].id,
          type: 'straight',
        });
      }
    }
    return { nodes, edges };
  }, []);
  // Start performance monitoring
  const startPerformanceMonitoring = useCallback(() => {
    metricsRef.current = {
      frameCount: 0,
      renderTimeSum: 0,
      lastFrameTime: performance.now(),
      startTime: performance.now(),
    };
    // Monitor frame rate
    const measureFrame = (timestamp: number) => {
      const metrics = metricsRef.current;
      if (metrics.lastFrameTime) {
        metrics.frameCount++;
        const delta = timestamp - metrics.lastFrameTime;
        metrics.renderTimeSum += delta;
      }
      metrics.lastFrameTime = timestamp;
      requestAnimationFrame(measureFrame);
    };
    requestAnimationFrame(measureFrame);
    // Monitor render performance with PerformanceObserver
    if ('PerformanceObserver' in window) {
      performanceObserverRef.current = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.name.includes('react-flow') || entry.entryType === 'measure') {
            // Track rendering performance
          }
        });
      });
      performanceObserverRef.current.observe({)
        entryTypes: ['measure', 'navigation']
      });
    }
  }, []);
  // Stop performance monitoring and calculate results
  const stopPerformanceMonitoring = useCallback((nodeCount: number, edgeCount: number): PerformanceTestResult => {
    const metrics = metricsRef.current;
    const testDuration = (performance.now() - metrics.startTime) / 1000; // seconds;
    // Calculate average FPS
    const avgFPS = metrics.frameCount / testDuration;
    // Calculate average render time
    const avgRenderTime = metrics.renderTimeSum / metrics.frameCount;
    // Get memory usage
    let memoryUsage = 0;
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      memoryUsage = memory.usedJSHeapSize / memory.totalJSHeapSize;
    }
    // Check if performance meets thresholds
    const passedThreshold = avgFPS >= targetFPS && avgRenderTime <= maxRenderTime;
    // Generate recommendations
    const recommendations: string[] = [];
    if (avgFPS < targetFPS) {
      recommendations.push('FPS below target - consider reducing node count or visual complexity');
    }
    if (avgRenderTime > maxRenderTime) {
      recommendations.push('Render time too high - optimize animations and effects');
    }
    if (memoryUsage > 0.8) {
      recommendations.push('High memory usage - implement node virtualization');
    }
    if (nodeCount > 150) {
      recommendations.push('Large graph detected - enable viewport culling');
    }
    if (edgeCount > 200) {
      recommendations.push('Many connections - simplify edges at low zoom levels');
    }
    // Cleanup
    if (performanceObserverRef.current) {
      performanceObserverRef.current.disconnect();
    }
    return {
      nodeCount,
      edgeCount,
      renderTime: avgRenderTime,
      fps: avgFPS,
      memoryUsage,
      testDuration,
      passedThreshold,
      recommendations
    };
  }, [targetFPS, maxRenderTime]);
  // Run performance test with specific node count
  const runTest = useCallback(async (nodeCount: number) => {
    setCurrentTest(`Testing with ${nodeCount} nodes`);}
    // Generate test graph
    const { nodes, edges } = generateComplexDemoGraph(nodeCount);
    // Notify parent component
    onGraphGenerated?.(nodes, edges);
    // Start monitoring
    startPerformanceMonitoring();
    // Wait for graph to render and settle
    await new Promise(resolve => setTimeout(resolve, 3000));
    // Stop monitoring and get results
    const result = stopPerformanceMonitoring(nodeCount, edges.length);
    onTestComplete?.(result);
    return result;
  }, [generateComplexDemoGraph, onGraphGenerated, startPerformanceMonitoring, stopPerformanceMonitoring, onTestComplete]);
  // Run comprehensive performance test suite
  const runFullTestSuite = useCallback(async () => {
    setIsRunning(true);
    const testResults: PerformanceTestResult[] = [];
    try {
      // Test different complexity levels
      const testCases = [25, 50, 100, 150, 200, 300];
      for (const nodeCount of testCases) {
        setCurrentTest(`Performance test: ${nodeCount} nodes`);}
        const result = await runTest(nodeCount);
        testResults.push(result);
        // Brief pause between tests
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      setResults(testResults);
      setCurrentTest('Test suite completed');
    } catch (error) {
      console.error('Performance test failed:', error);
      setCurrentTest('Test failed');
    } finally {
      setIsRunning(false);
    }
  }, [runTest]);
  // Quick demo graph generation for presentations
  const generateDemoScenarios = useCallback(() => {
    const scenarios = [;
      {
        name: 'Simple Film Prompt',
        nodeCount: 15,
        description: 'Basic character + action + setting workflow'
      },
      {
        name: 'Complex Scene Builder',
        nodeCount: 50,
        description: 'Multiple characters, actions, and weighted choices'
      },
      {
        name: 'Enterprise Workflow',
        nodeCount: 100,
        description: 'Full production pipeline with multiple outputs'
      },
      {
        name: 'Stress Test',
        nodeCount: 200,
        description: 'Maximum complexity for performance validation'
      }
    ];
    return scenarios;
  }, []);
  return ()
    <div style={{
      position: 'fixed',
      top: 60,
      left: 10,
      background: 'rgba(31, 41, 55, 0.98)',
      border: '1px solid rgba(55, 65, 81, 0.6)',
      borderRadius: '8px',
      padding: '16px',
      fontSize: '12px',
      color: '#e5e7eb',
      zIndex: 10000,
      backdropFilter: 'blur(16px)',
      minWidth: '280px',
      maxHeight: '70vh',
      overflow: 'auto',
    }}
    className="development-only"
    >
      <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 14 }}>
        🚀 Demo Performance Tester
      </div>
      {isRunning && ()
        <div style={{ marginBottom: 16, textAlign: 'center' }}>
          <ProfessionalSpinner size="small" variant="cinema4d" type="dots" />
          <div style={{ marginTop: 8, fontSize: 11 }}>{currentTest}</div>
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        <button
          onClick={runFullTestSuite}
          disabled={isRunning}
          style={{
            background: '#4CAF50',
            border: 'none',
            borderRadius: '4px',
            color: 'white',
            padding: '8px 12px',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            fontSize: '12px',
            opacity: isRunning ? 0.6 : 1
          }}
        >
          Run Full Test Suite
        </button>
        <div style={{ fontWeight: 500, marginTop: 8 }}>Quick Demo Scenarios:</div>
        {generateDemoScenarios().map((scenario, index) => ()
          <button
            key={index}
            onClick={() => runTest(scenario.nodeCount)}
            disabled={isRunning}
            style={{
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '4px',
              color: '#93c5fd',
              padding: '8px 12px',
              cursor: isRunning ? 'not-allowed' : 'pointer',
              fontSize: '11px',
              textAlign: 'left',
              opacity: isRunning ? 0.6 : 1
            }}
          >
            <div style={{ fontWeight: 500 }}>{scenario.name}</div>
            <div style={{ fontSize: 10, opacity: 0.8 }}>{scenario.description}</div>
            <div style={{ fontSize: 10, color: '#60a5fa' }}>{scenario.nodeCount} nodes</div>
          </button>
        ))}
      </div>
      {results.length > 0 && ()
        <div>
          <div style={{ fontWeight: 500, marginBottom: 8 }}>Test Results:</div>
          <div style={{ maxHeight: '200px', overflow: 'auto' }}>
            {results.map((result, index) => ()
              <div
                key={index}
                style={{
                  background: result.passedThreshold ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                  border: `1px solid ${result.passedThreshold ? 'rgba(76, 175, 80, 0.3)' : 'rgba(244, 67, 54, 0.3)'}`,}
                  borderRadius: '4px',
                  padding: '8px',
                  marginBottom: '8px',
                  fontSize: '10px',
                }}
              >
                <div style={{ fontWeight: 500, marginBottom: 4 }}>
                  {result.nodeCount} nodes ({result.edgeCount} edges)
                  <span style={{ 
                    float: 'right',
                    color: result.passedThreshold ? '#4CAF50' : '#f44336'
                  }}>
                    {result.passedThreshold ? '✓' : '✗'}
                  </span>
                </div>
                <div>FPS: {result.fps.toFixed(1)} | Render: {result.renderTime.toFixed(1)}ms</div>
                <div>Memory: {(result.memoryUsage * 100).toFixed(1)}%</div>
                {result.recommendations.length > 0 && ()
                  <div style={{ marginTop: 4, fontSize: 9, opacity: 0.8 }}>
                    💡 {result.recommendations[0]}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DemoPerformanceTester;