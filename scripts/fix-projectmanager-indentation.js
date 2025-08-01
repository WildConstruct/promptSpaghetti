#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'packages/core/projectManager.ts');

console.log('🔧 Fixing projectManager.ts indentation...');

let content = fs.readFileSync(filePath, 'utf8');

// Fix the loadProjectFromDevice method indentation
content = content.replace(
  /  static async loadProjectFromDevice\(\): Promise<LoadProjectResult> \{[\s\S]*?^\s*\}\s*$/m,
  `  static async loadProjectFromDevice(): Promise<LoadProjectResult> {
    return new Promise((resolve) => {
      try {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.psg';
        input.onchange = async (event) => {
          try {
            const file = (event.target as HTMLInputElement).files?.[0];
            if (!file) {
              resolve({
                success: false,
                error: 'No file selected',
              });
              return;
            }
            const content = await file.text();
            const deserializationOptions: DeserializationOptions = {
              skipValidation: false,
              autoMigrate: true,
              preserveIds: true,
            };
            const result = deserializeProject(content, deserializationOptions);
            if (!result.success) {
              resolve({
                success: false,
                error: result.error,
                warnings: result.warnings,
              });
              return;
            }
            resolve({
              success: true,
              data: result.data,
              warnings: result.warnings,
            });
          } catch (error) {
            resolve({
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error during load',
            });
          }
        };
        input.click();
      } catch (error) {
        resolve({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error creating file dialog',
        });
      }
    });
  }`
);

fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Fixed projectManager.ts indentation!');