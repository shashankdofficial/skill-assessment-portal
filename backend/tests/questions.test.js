// backend/tests/questions.test.js
const request = require('supertest');

/**
 * Mock models BEFORE requiring the app:
 * - Question.findAndCountAll should return rows with options stored as JSON string
 *   so we can verify the route parses the options into arrays.
 */
jest.mock('../src/models', () => ({
  Question: {
    findAndCountAll: jest.fn(async () => ({
      rows: [
        {
          id: 1,
          text: 'What is 2+2?',
          // stored as string in DB; route should parse it
          options: JSON.stringify([{ id: '0', text: '3' }, { id: '1', text: '4' }]),
          // emulate Sequelize instance shape
          get() { return { id: this.id, text: this.text, options: this.options }; }
        }
      ],
      count: 1
    }))
  },
  sequelize: {
    authenticate: jest.fn().mockResolvedValue(true),
    sync: jest.fn().mockResolvedValue(true)
  }
}));

/**
 * Mock auth & role middlewares so /api/questions doesn't return 401 in tests.
 * The auth middleware attaches a fake user to req (admin role).
 * The role middleware returns a middleware that calls next() (no-op).
 *
 * Use the same relative path that your application uses to require these middlewares.
 * Our tests live in backend/tests, and the app uses ../middlewares/auth from src files,
 * so the path here is ../src/middlewares/auth (adjust if your actual import path differs).
 */
jest.mock('../src/middlewares/auth', () => {
  return jest.fn((req, res, next) => {
    // attach a fake authenticated user
    req.user = { id: 1, name: 'Test Admin', role: 'admin' };
    return next();
  });
});

// role middleware factory: role('admin') returns (req,res,next) => next()
jest.mock('../src/middlewares/role', () => {
  return jest.fn(() => {
    return (req, res, next) => next();
  });
});

// Now require the app (after mocks)
const app = require('../src/app');

describe('Questions API', () => {
  beforeAll(() => {
    process.env.NODE_ENV = 'test';
  });

  it('GET /api/questions should return parsed options and pagination', async () => {
    const res = await request(app).get('/api/questions?page=1&limit=5');
    expect(res.statusCode).toBe(200);
    expect(res.body.rows).toBeDefined();
    expect(Array.isArray(res.body.rows)).toBe(true);
    expect(res.body.rows[0].options).toBeDefined();
    // options should be parsed into an array of objects
    expect(Array.isArray(res.body.rows[0].options)).toBe(true);
    expect(res.body.rows[0].options[0].text).toBe('3');
  });
});
