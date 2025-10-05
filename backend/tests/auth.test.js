// backend/tests/auth.test.js
const request = require('supertest');

// Mock the models before requiring the app
jest.mock('../src/models', () => {
  const mockUser = {
    create: jest.fn(async (payload) => {
      // Return a plain object or fake Sequelize instance
      return {
        id: 999,
        name: payload.name,
        email: payload.email,
        password_hash: 'hashed', // not used directly
        get() { return { id: this.id, name: this.name, email: this.email }; }
      };
    }),
    findOne: jest.fn(async (opts) => null) // no existing user for tests
  };

  return {
    User: mockUser,
    sequelize: {
      authenticate: jest.fn().mockResolvedValue(true),
      sync: jest.fn().mockResolvedValue(true)
    }
  };
});

// Mock jsonwebtoken so route returns deterministic token
jest.mock('jsonwebtoken', () => ({
  sign: () => 'test-token'
}));

const app = require('../src/app');

describe('Auth API', () => {
  beforeAll(() => {
    process.env.NODE_ENV = 'test';
  });

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: 'test@example.com', password: '123456' });

    expect([200, 201]).toContain(res.statusCode);
    // Depending on your route, check token or user shape
    expect(res.body).toHaveProperty('token');
    expect(res.body.token).toBe('test-token');
  });
});
