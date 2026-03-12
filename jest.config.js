/** @type {import('jest').Config} */
module.exports = {
  // Canonical root unit-test entrypoint for package-owned Jest suites.
  projects: [
    '<rootDir>/packages/asset-browser/jest.config.cjs',
    '<rootDir>/packages/core/jest.config.cjs',
    '<rootDir>/server/jest.config.cjs'
  ]
};
