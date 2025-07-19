import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}));

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  describe('findOneByEmail', () => {
    it('should return a user if found', async () => {
      const mockUser = {
        id: 1,
        email: 'test@test.com',
        name: 'Test',
        password: 'hashedpassword',
      };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findOneByEmail('test@test.com');

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@test.com' },
      });
    });

    it('should return null if user is not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      const result = await service.findOneByEmail('notfound@test.com');
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should hash the password and create a new user', async () => {
      const userData = {
        name: 'New User',
        email: 'new@test.com',
        password: 'password123',
      };
      const hashedPassword = 'hashedPassword123';
      const createdUser = { id: 2, ...userData, password: hashedPassword };

      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockPrismaService.user.create.mockResolvedValue(createdUser);

      const result = await service.create(userData);

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          ...userData,
          password: hashedPassword,
        },
      });
      expect(result).toEqual(createdUser);
    });
  });
});
