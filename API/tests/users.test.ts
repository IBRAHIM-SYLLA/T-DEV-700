jest.resetModules();

jest.mock('../src/config/database', () => {
  return {
    __esModule: true,
    AppDataSource: {
      getRepository: jest.fn(),
      initialize: jest.fn().mockResolvedValue(true)
    },
    testConnection: jest.fn(),
  };
});

import request from 'supertest';
import { AppDataSource } from '../src/config/database';
import { UserEntity } from '../src/models/User/UserEntity';

const mockUserRepo = {
  find: jest.fn().mockResolvedValue([
    { user_id: 1, first_name: 'John', last_name: 'Doe' }
  ]),
};

(AppDataSource.getRepository as jest.Mock).mockImplementation((entity) => {
  if (entity === UserEntity) return mockUserRepo;
  return {};
});

const app = require('../src/index').default;

describe('✅ USERS ROUTES', () => {
  it('GET /api/users → retourne la liste des utilisateurs', async () => {
    const res = await request(app).get('/api/users');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].first_name).toBe('John');
  });
});
