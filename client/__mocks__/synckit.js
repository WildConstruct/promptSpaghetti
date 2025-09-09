// Mock for synckit to avoid ESM issues in Jest
module.exports = {
  createSyncFn: jest.fn(() => jest.fn())
  // Add any other specific mocked functions if needed
};
