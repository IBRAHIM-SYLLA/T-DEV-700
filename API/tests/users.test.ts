jest.resetModules();

jest.mock('../src/config/database', () => {
  const mockQuery = jest.fn().mockResolvedValue([
    { user_id: 1, first_name: 'John', last_name: 'Doe' } 
  ]);

  const mockConnection = {
    query: mockQuery,
    release: jest.fn(),
  };

  const mockPool = {
    getConnection: jest.fn().mockResolvedValue(mockConnection),
    query: mockQuery,
  };

  console.log('🧩 Mock MariaDB chargé dans Jest !');

  return {
    __esModule: true,
    pool: mockPool,
    testConnection: jest.fn(),
  };
});

import request from 'supertest';
const app = require('../src/server').default;

describe('✅ USERS ROUTES', () => {
  it('GET /api/users → retourne la liste des utilisateurs', async () => {
    const res = await request(app).get('/api/users');
    console.log('Réponse API:', res.body); // 👀 utile une dernière fois pour vérifier

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].first_name).toBe('John');
  });
});
