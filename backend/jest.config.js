// backend/jest.config.js
module.exports = {
  testEnvironment: 'node',
  verbose: true,
  testTimeout: 10000,
  roots: ['<rootDir>/tests'],
  setupFilesAfterEnv: ['<rootDir>/tests/setupTests.js'],
  collectCoverage: true,
  coverageDirectory: '<rootDir>/coverage',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/tests/'
  ]
};
