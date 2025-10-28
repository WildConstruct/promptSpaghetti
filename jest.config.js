/** @type {import('jest').Config} */
module.exports = {
  // Delegate to package-level Jest configs so each package controls its env/setup
  projects: [
    '<rootDir>/packages/asset-browser/jest.config.cjs',
    '<rootDir>/packages/core/jest.config.cjs'
  ]
};
