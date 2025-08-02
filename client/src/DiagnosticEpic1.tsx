import React, { useEffect, useState } from 'react';

export const DiagnosticEpic1: React.FC = () => {
  const [diagnostics, setDiagnostics] = useState<string[]>([]);

  useEffect(() => {
    const runDiagnostics = async () => {
      const results: string[] = [];
      
      try {
        // Test 1: Can we import the nodes?
        const nodesModule = await import('@promptscape/core/components/epic1/nodes');
        results.push('✅ Nodes module loaded');
        results.push(`  - Has TextBlockNode: ${!!nodesModule.TextBlockNode}`);
        results.push(`  - Node types: ${Object.keys(nodesModule.epic1NodeTypes || {}).join(', ')}`);
      } catch (error) {
        results.push(`❌ Nodes module failed: ${error.message}`);
      }

      try {
        // Test 2: Can we import the main editor?
        const epic1Module = await import('@promptscape/core/components/epic1');
        results.push('✅ Epic1 module loaded');
        results.push(`  - Has Epic1GraphEditor: ${!!epic1Module.Epic1GraphEditor}`);
        results.push(`  - Has Epic1GraphEditorWithProvider: ${!!epic1Module.Epic1GraphEditorWithProvider}`);
      } catch (error) {
        results.push(`❌ Epic1 module failed: ${error.message}`);
      }

      try {
        // Test 3: Can we import the asset library?
        const assetModule = await import('@promptscape/core/components/epic1/asset-library');
        results.push('✅ Asset Library module loaded');
        results.push(`  - Has AssetLibrary: ${!!assetModule.AssetLibrary}`);
        results.push(`  - Has medievalPresets: ${!!assetModule.medievalPresets}`);
      } catch (error) {
        results.push(`❌ Asset Library failed: ${error.message}`);
      }

      try {
        // Test 4: Can we import the preview components?
        const previewModule = await import('@promptscape/core/components/epic1/preview/PreviewPanel');
        results.push('✅ Preview Panel module loaded');
        results.push(`  - Has PreviewPanel: ${!!previewModule.PreviewPanel}`);
      } catch (error) {
        results.push(`❌ Preview Panel failed: ${error.message}`);
      }

      try {
        // Test 5: Check for medieval demo
        const demoModule = await import('@promptscape/core/components/epic1/demo/MedievalDemoShowcase');
        results.push('✅ Medieval Demo module loaded');
        results.push(`  - Has MedievalDemoShowcase: ${!!demoModule.MedievalDemoShowcase}`);
      } catch (error) {
        results.push(`❌ Medieval Demo failed: ${error.message}`);
      }

      setDiagnostics(results);
    };

    runDiagnostics();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>Epic1 Module Diagnostics</h2>
      <div style={{ whiteSpace: 'pre-wrap' }}>
        {diagnostics.join('\n')}
      </div>
    </div>
  );
};