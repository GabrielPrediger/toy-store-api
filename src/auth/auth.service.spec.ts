import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

const mockUsersService = {
  findOneByEmail: jest.fn(),
};
const mockJwtService = {
  sign: jest.fn(),
};
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return user object (without password) if credentials are valid', async () => {
      const user = {
        id: 1,
        email: 'test@test.com',
        password: 'hashedpassword',
        name: 'Test',
      };
      mockUsersService.findOneByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('test@test.com', 'password123');

      expect(result).toEqual({ id: 1, email: 'test@test.com', name: 'Test' });
      expect(result).not.toHaveProperty('password');
    });

    it('should return null if user is not found', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue(null);
      const result = await service.validateUser(
        'notfound@test.com',
        'password123',
      );
      expect(result).toBeNull();
    });

    it('should return null if password does not match', async () => {
      const user = {
        id: 1,
        email: 'test@test.com',
        password: 'hashedpassword',
      };
      mockUsersService.findOneByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser(
        'test@test.com',
        'wrongpassword',
      );
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return an access token', () => {
      const user = {
        id: 1,
        email: 'test@test.com',
        name: 'Test',
        password: 'hashedpassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const fakeToken = 'fake-jwt-token';
      mockJwtService.sign.mockReturnValue(fakeToken);

      const result = service.login(user);

      expect(result).toEqual({ access_token: fakeToken });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        email: user.email,
        sub: user.id,
      });
    });
  });
});
