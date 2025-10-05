// backend/tests/setupTests.js
process.env.NODE_ENV = process.env.NODE_ENV || 'test';

// Conditionally mock a redis client wrapper if it exists in the project.
// This avoids failing tests when the project doesn't use a redis wrapper.
try {
  // adjust the path to match how your app would import it
  const redisClientPath = require.resolve('../src/utils/redisClient');
  // If resolved, mock it
  jest.mock(redisClientPath, () => ({
    getClient: () => ({
      get: jest.fn().mockResolvedValue(null),
      setEx: jest.fn().mockResolvedValue('OK'),
      quit: jest.fn().mockResolvedValue(null)
    })
  }));
  // console.log('Mocked redisClient for tests');
} catch (err) {
  // If module not found, skip mocking — fine if app doesn't use redis wrapper
  // console.log('No redisClient module found; skipping redis mock.');
}

// You can add other global mocks or helpers here as needed.
