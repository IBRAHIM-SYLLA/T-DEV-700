import request from 'supertest';

/* =======================
  MOCK DATABASE
======================= */
jest.mock('../src/config/database', () => ({
  __esModule: true,
  AppDataSource: {
    getRepository: jest.fn(),
    initialize: jest.fn().mockResolvedValue(true),
  },
  testConnection: jest.fn(),
}));

/* =======================
  MOCK AUTH MIDDLEWARE
  ⚠️ OBLIGATOIRE : next()
======================= */
jest.mock('../src/utils/UserMiddleware', () => ({
  __esModule: true,
  verifyToken: (req: any, res: any, next: any) => next(),
  verifyAdminRh: (req: any, res: any, next: any) => next(),
  verifyManager: (req: any, res: any, next: any) => next(),
}));

jest.mock('../src/services/user-service', () => ({
  __esModule: true,
  UserService: jest.fn().mockImplementation(() => ({
    getAllUsers: jest.fn().mockResolvedValue([
      { user_id: 1, first_name: 'John', last_name: 'Doe' },
    ]),
  })),
}));



import { AppDataSource } from '../config/database';
import { UserEntity } from '../models/User/UserEntity';
import app from '../index';

/* =======================
  MOCK REPOSITORY
======================= */
const mockUserRepo = {
  find: jest.fn().mockResolvedValue([
    { user_id: 1, first_name: 'John', last_name: 'Doe' },
  ]),
};

(AppDataSource.getRepository as jest.Mock).mockImplementation((entity) => {
  if (entity === UserEntity) return mockUserRepo;
  return null;
});

/* =======================
  TESTS
======================= */
describe('✅ USERS ROUTES', () => {
  it('GET /api/users → retourne la liste des utilisateurs', async () => {
    const res = await request(app)
      .get('/api/users/')
      .set('Authorization', 'Bearer fake-token');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].first_name).toBe('John');
  });
});
