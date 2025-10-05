// backend/tests/skills.test.js
const request = require('supertest');

jest.mock('../src/models', () => ({
  Skill: {
    findAll: jest.fn(async () => [{ id: 1, name: 'React', description: '...' }]),
    findAndCountAll: jest.fn(async () => ({ rows: [{ id:1, name:'React' }], count: 1 }))
  },
  sequelize: {
    authenticate: jest.fn().mockResolvedValue(true),
    sync: jest.fn().mockResolvedValue(true)
  }
}));

const app = require('../src/app');

describe('Skills API', () => {
  beforeAll(() => {
    process.env.NODE_ENV = 'test';
  });

  it('GET /api/skills should return array when no query params', async () => {
    const res = await request(app).get('/api/skills');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/skills?page=1 should return paginated object', async () => {
    const res = await request(app).get('/api/skills?page=1&limit=5');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('rows');
    expect(Array.isArray(res.body.rows)).toBe(true);
  });
});
