import { test, expect } from '@playwright/test';

/**
 * Performance test for large graph rendering and interactions
 * Tests the system with a 250-node graph to measure FPS and memory usage
 */
test.describe('Large Graph Performance', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:3000');

    // Wait for the canvas to be ready
    await page.waitForSelector('[data-testid="react-flow-canvas"]');
  });

  test('250-node graph rendering performance', async ({ page }) => {
    // Create a large graph with 250 nodes
    const largeGraph = generateLargeGraph(250);

    // Inject the graph data into the application
    await page.evaluate(graph => {
      // Store the graph in localStorage to simulate loading a large graph
      localStorage.setItem('graphDraft', JSON.stringify(graph));
      window.location.reload();
    }, largeGraph);

    // Wait for the restore prompt and accept it
    await page.waitForSelector('[data-testid="restore-draft-modal"]');
    await page.click('button:has-text("Restore")');

    // Start performance monitoring
    const startTime = performance.now();
    const frameCount = 0;
    const lastFrameTime = startTime;

    // Monitor FPS for 5 seconds
    const fpsPromise = page.evaluate(() => {
      return new Promise<number>(resolve => {
        let frames = 0;
        const startTime = performance.now();

        const measureFrame = () => {
          frames++;
          if (performance.now() - startTime < 5000) {
            requestAnimationFrame(measureFrame);
          } else {
            const fps = frames / 5; // Average FPS over 5 seconds
            resolve(fps);
          }
        };

        requestAnimationFrame(measureFrame);
      });
    });

    // Monitor memory usage
    const memoryPromise = page.evaluate(() => {
      return new Promise<number>(resolve => {
        if ('memory' in performance) {
          const memory = (performance as any).memory;
          resolve(memory.usedJSHeapSize / 1024 / 1024); // Convert to MB
        } else {
          resolve(0); // Memory API not available
        }
      });
    });

    // Perform canvas interactions to test performance under load
    const canvas = page.locator('[data-testid="react-flow-canvas"]');

    // Test panning
    await canvas.dragTo(canvas, {
      sourcePosition: { x: 100, y: 100 },
      targetPosition: { x: 200, y: 200 },
    });

    // Test zooming
    await canvas.click({ position: { x: 300, y: 300 } });
    await page.keyboard.press('Control+Equal'); // Zoom in
    await page.keyboard.press('Control+Minus'); // Zoom out

    // Test node selection
    const firstNode = page.locator('[data-testid^="node-"]').first();
    await firstNode.click();

    // Wait for measurements to complete
    const [fps, memoryUsage] = await Promise.all([fpsPromise, memoryPromise]);

    // Performance assertions
    expect(fps).toBeGreaterThan(30); // Should maintain at least 30 FPS
    expect(memoryUsage).toBeLessThan(500); // Should use less than 500MB

    // Log performance metrics
    console.log('Performance metrics for 250-node graph:');
    console.log(`Average FPS: ${fps.toFixed(2)}`);
    console.log(`Memory usage: ${memoryUsage.toFixed(2)} MB`);
  });

  test('canvas virtualization with large graphs', async ({ page }) => {
    // Test that nodes outside viewport are not rendered
    const largeGraph = generateLargeGraph(1000);

    await page.evaluate(graph => {
      localStorage.setItem('graphDraft', JSON.stringify(graph));
      window.location.reload();
    }, largeGraph);

    await page.waitForSelector('[data-testid="restore-draft-modal"]');
    await page.click('button:has-text("Restore")');

    // Count rendered nodes in viewport
    const renderedNodes = await page.locator('[data-testid^="node-"]').count();

    // With virtualization, we should render far fewer than 1000 nodes
    expect(renderedNodes).toBeLessThan(100);
  });
});

/**
 * Generates a large graph with the specified number of nodes
 * Distributed across the canvas to test performance
 */
function generateLargeGraph(nodeCount: number) {
  const nodes = [];
  const edges = [];

  const nodeTypes = ['WeightedChoice', 'Concat', 'Output', 'Include', 'SetVariable', 'GetVariable'];

  for (let i = 0; i < nodeCount; i++) {
    const nodeType = nodeTypes[i % nodeTypes.length];
    const gridSize = Math.ceil(Math.sqrt(nodeCount));
    const x = (i % gridSize) * 200;
    const y = Math.floor(i / gridSize) * 150;

    nodes.push({
      id: `node-${i}`,
      type: 'default',
      position: { x, y },
      data: {
        label: `${nodeType}-${i}`,
        ...getDefaultNodeData(nodeType),
      },
      selected: false,
    });

    // Create some edges to test edge rendering performance
    if (i > 0 && i % 3 === 0) {
      edges.push({
        id: `edge-${i}`,
        source: `node-${i - 1}`,
        target: `node-${i}`,
        type: 'default',
      });
    }
  }

  return { nodes, edges };
}

/**
 * Gets default data for a node type
 */
function getDefaultNodeData(nodeType: string) {
  switch (nodeType) {
    case 'WeightedChoice':
      return { choices: ['option1', 'option2'], weights: [0.5, 0.5] };
    case 'Concat':
      return { separator: ' ' };
    case 'Output':
      return { template: 'Output: {{value}}' };
    case 'Include':
      return { bundleName: 'example' };
    case 'SetVariable':
      return { variableName: 'var1', value: 'default' };
    case 'GetVariable':
      return { variableName: 'var1' };
    default:
      return {};
  }
}
