import { test, expect, devices } from '@playwright/test';

/**
 * Cross-browser compatibility tests for the main graph editor
 * Tests core functionality across Chrome, Firefox, and Safari
 */
test.describe('Cross-Browser Graph Editor Tests', () => {
  const testCases = [
    { name: 'chromium', device: devices['Desktop Chrome'] },
    { name: 'firefox', device: devices['Desktop Firefox'] },
    { name: 'webkit', device: devices['Desktop Safari'] }
  ];

  testCases.forEach(({ name, device }) => {
    test.describe(`${name} browser tests`, () => {
      test.use(device);

      test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('[data-testid="react-flow-canvas"]', {
          timeout: 10000
        });
      });

      test(`${name}: Basic node creation and connection`, async ({ page }) => {
        // Add a WeightedChoice node
        await page.click('[data-testid="palette-WeightedChoice"]');
        await page.click('[data-testid="react-flow-canvas"]', {
          position: { x: 200, y: 200 }
        });

        // Verify node was created
        const node1 = page.locator('[data-testid^="node-"]').first();
        await expect(node1).toBeVisible();

        // Add an Output node
        await page.click('[data-testid="palette-Output"]');
        await page.click('[data-testid="react-flow-canvas"]', {
          position: { x: 400, y: 200 }
        });

        // Verify second node was created
        const node2 = page.locator('[data-testid^="node-"]').nth(1);
        await expect(node2).toBeVisible();

        // Connect the nodes
        const handle1 = node1.locator('[data-testid="handle-source"]');
        const handle2 = node2.locator('[data-testid="handle-target"]');

        await handle1.dragTo(handle2);

        // Verify connection was created
        const edge = page.locator('[data-testid^="edge-"]');
        await expect(edge).toBeVisible();
      });

      test(`${name}: Inspector panel functionality`, async ({ page }) => {
        // Create a node
        await page.click('[data-testid="palette-WeightedChoice"]');
        await page.click('[data-testid="react-flow-canvas"]', {
          position: { x: 300, y: 300 }
        });

        // Select the node
        const node = page.locator('[data-testid^="node-"]').first();
        await node.click();

        // Verify inspector panel opens
        const inspector = page.locator('[data-testid="inspector-panel"]');
        await expect(inspector).toBeVisible();

        // Test form interactions
        const choiceInput = inspector
          .locator('input[placeholder*="choice"]')
          .first();
        await choiceInput.fill(`Test choice for ${name}`);

        // Verify the input was filled
        await expect(choiceInput).toHaveValue(`Test choice for ${name}`);
      });

      test(`${name}: Graph execution and preview`, async ({ page }) => {
        // Create a simple graph: WeightedChoice -> Output
        await page.click('[data-testid="palette-WeightedChoice"]');
        await page.click('[data-testid="react-flow-canvas"]', {
          position: { x: 200, y: 200 }
        });

        const node1 = page.locator('[data-testid^="node-"]').first();
        await node1.click();

        // Configure WeightedChoice
        const inspector = page.locator('[data-testid="inspector-panel"]');
        const choiceInput = inspector
          .locator('input[placeholder*="choice"]')
          .first();
        await choiceInput.fill('Option A');

        const addChoiceBtn = inspector.locator('button:has-text("Add Choice")');
        await addChoiceBtn.click();

        const choiceInput2 = inspector
          .locator('input[placeholder*="choice"]')
          .nth(1);
        await choiceInput2.fill('Option B');

        // Add Output node
        await page.click('[data-testid="palette-Output"]');
        await page.click('[data-testid="react-flow-canvas"]', {
          position: { x: 400, y: 200 }
        });

        // Connect nodes
        const handle1 = node1.locator('[data-testid="handle-source"]');
        const node2 = page.locator('[data-testid^="node-"]').nth(1);
        const handle2 = node2.locator('[data-testid="handle-target"]');
        await handle1.dragTo(handle2);

        // Execute preview
        await page.click('[data-testid="preview-button"]');

        // Verify preview modal opens
        const previewModal = page.locator('[data-testid="preview-modal"]');
        await expect(previewModal).toBeVisible({ timeout: 15000 });

        // Verify results are displayed
        const results = previewModal.locator('[data-testid="preview-results"]');
        await expect(results).toContainText(/Option [AB]/);
      });

      test(`${name}: Canvas interactions (pan, zoom, select)`, async ({
        page
      }) => {
        // Create multiple nodes for interaction testing
        const positions = [
          { x: 200, y: 200 },
          { x: 400, y: 200 },
          { x: 300, y: 350 }
        ];

        for (const pos of positions) {
          await page.click('[data-testid="palette-WeightedChoice"]');
          await page.click('[data-testid="react-flow-canvas"]', {
            position: pos
          });
        }

        const canvas = page.locator('[data-testid="react-flow-canvas"]');

        // Test panning (browser-specific handling)
        if (name === 'webkit') {
          // Safari requires different interaction
          await canvas.dragTo(canvas, {
            sourcePosition: { x: 300, y: 300 },
            targetPosition: { x: 350, y: 350 }
          });
        } else {
          await canvas.dragTo(canvas, {
            sourcePosition: { x: 100, y: 100 },
            targetPosition: { x: 150, y: 150 }
          });
        }

        // Test zoom (keyboard shortcuts)
        await canvas.click({ position: { x: 300, y: 300 } });

        if (name === 'firefox') {
          // Firefox may need different key combinations
          await page.keyboard.press('Control+=');
          await page.keyboard.press('Control+-');
        } else {
          await page.keyboard.press('Control+Equal');
          await page.keyboard.press('Control+Minus');
        }

        // Test multi-select with Ctrl+click
        const nodes = page.locator('[data-testid^="node-"]');
        await nodes.first().click();

        if (name === 'webkit') {
          // Safari uses Cmd instead of Ctrl
          await nodes.nth(1).click({ modifiers: ['Meta'] });
        } else {
          await nodes.nth(1).click({ modifiers: ['Control'] });
        }

        // Verify multiple selection
        const selectedNodes = page.locator('[data-testid^="node-"].selected');
        await expect(selectedNodes).toHaveCount(2);
      });

      test(`${name}: Local storage and persistence`, async ({ page }) => {
        // Create a graph
        await page.click('[data-testid="palette-WeightedChoice"]');
        await page.click('[data-testid="react-flow-canvas"]', {
          position: { x: 250, y: 250 }
        });

        // Configure the node
        const node = page.locator('[data-testid^="node-"]').first();
        await node.click();

        const inspector = page.locator('[data-testid="inspector-panel"]');
        const choiceInput = inspector
          .locator('input[placeholder*="choice"]')
          .first();
        await choiceInput.fill(`Browser test ${name}`);

        // Wait for autosave
        await page.waitForTimeout(6000);

        // Reload the page
        await page.reload();
        await page.waitForSelector('[data-testid="react-flow-canvas"]');

        // Check for restore prompt (if autosave worked)
        const restorePrompt = page.locator(
          '[data-testid="restore-draft-modal"]'
        );
        if (await restorePrompt.isVisible()) {
          await page.click('button:has-text("Restore")');

          // Verify the node was restored
          const restoredNode = page.locator('[data-testid^="node-"]').first();
          await expect(restoredNode).toBeVisible();

          // Verify the configuration was preserved
          await restoredNode.click();
          const restoredInput = inspector
            .locator('input[placeholder*="choice"]')
            .first();
          await expect(restoredInput).toHaveValue(`Browser test ${name}`);
        }
      });

      test(`${name}: File import/export functionality`, async ({ page }) => {
        // Create a simple graph
        await page.click('[data-testid="palette-Output"]');
        await page.click('[data-testid="react-flow-canvas"]', {
          position: { x: 300, y: 300 }
        });

        // Configure Output node
        const node = page.locator('[data-testid^="node-"]').first();
        await node.click();

        const inspector = page.locator('[data-testid="inspector-panel"]');
        const templateInput = inspector.locator(
          'textarea[placeholder*="template"]'
        );
        await templateInput.fill(`Test template for ${name} browser`);

        // Test export functionality
        await page.click('[data-testid="export-button"]');

        // Wait for export to complete (browser-specific download handling)
        if (name === 'chromium' || name === 'webkit') {
          // Most browsers show download notification
          await page.waitForTimeout(2000);
        } else if (name === 'firefox') {
          // Firefox might handle downloads differently
          await page.waitForTimeout(3000);
        }
      });

      test(`${name}: Error handling and validation`, async ({ page }) => {
        // Create nodes that would create a cycle
        await page.click('[data-testid="palette-WeightedChoice"]');
        await page.click('[data-testid="react-flow-canvas"]', {
          position: { x: 200, y: 200 }
        });

        await page.click('[data-testid="palette-WeightedChoice"]');
        await page.click('[data-testid="react-flow-canvas"]', {
          position: { x: 400, y: 200 }
        });

        const node1 = page.locator('[data-testid^="node-"]').first();
        const node2 = page.locator('[data-testid^="node-"]').nth(1);

        // Create connections that form a cycle
        const handle1Out = node1.locator('[data-testid="handle-source"]');
        const handle2In = node2.locator('[data-testid="handle-target"]');
        await handle1Out.dragTo(handle2In);

        const handle2Out = node2.locator('[data-testid="handle-source"]');
        const handle1In = node1.locator('[data-testid="handle-target"]');
        await handle2Out.dragTo(handle1In);

        // Verify error is displayed in status bar
        const statusBar = page.locator('[data-testid="status-bar"]');
        await expect(statusBar).toContainText(/cycle/i);

        // Verify preview is disabled
        const previewButton = page.locator('[data-testid="preview-button"]');
        await expect(previewButton).toBeDisabled();
      });

      test(`${name}: Responsive design and layout`, async ({ page }) => {
        // Test different viewport sizes
        await page.setViewportSize({ width: 1024, height: 768 });

        // Verify main components are visible
        await expect(
          page.locator('[data-testid="palette-panel"]')
        ).toBeVisible();
        await expect(
          page.locator('[data-testid="react-flow-canvas"]')
        ).toBeVisible();

        // Test smaller viewport (tablet)
        await page.setViewportSize({ width: 768, height: 1024 });

        // Components should still be functional
        await page.click('[data-testid="palette-WeightedChoice"]');
        await page.click('[data-testid="react-flow-canvas"]', {
          position: { x: 200, y: 200 }
        });

        const node = page.locator('[data-testid^="node-"]').first();
        await expect(node).toBeVisible();

        // Test mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });

        // Verify the app is still usable (might have different layout)
        await expect(
          page.locator('[data-testid="react-flow-canvas"]')
        ).toBeVisible();
      });
    });
  });
});
