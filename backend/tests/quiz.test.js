// backend/tests/quiz.test.js
const request = require('supertest');

jest.mock('../src/models', () => ({
  Question: {
    findAll: jest.fn(async () => [
      {
        id: 1,
        text: 'What?',
        options: JSON.stringify([{ id: '0', text: 'Yes' }, { id: '1', text: 'No' }]),
        get() { return this; }
      }
    ])
  },
  sequelize: { authenticate: jest.fn().mockResolvedValue(true), sync: jest.fn().mockResolvedValue(true) }
}));

const app = require('../src/app');

test('GET /api/quiz/skill/:id returns parsed options', async () => {
  const res = await request(app).get('/api/quiz/skill/1');
  expect(res.statusCode).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
  expect(Array.isArray(res.body[0].options)).toBe(true);
});
