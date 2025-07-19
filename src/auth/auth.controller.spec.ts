import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';

const mockAuthService = {
  validateUser: jest.fn(),
  login: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return an access token for valid credentials', async () => {
      const user = { id: 1, email: 'test@test.com' };
      const token = { access_token: 'fake-token' };
      const loginDto = { email: 'test@test.com', password: 'password123' };

      mockAuthService.validateUser.mockResolvedValue(user);
      mockAuthService.login.mockReturnValue(token);

      const result = await controller.login(loginDto);

      expect(result).toEqual(token);
      expect(mockAuthService.validateUser).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
      expect(mockAuthService.login).toHaveBeenCalledWith(user);
    });

    it('should throw an UnauthorizedException for invalid credentials', async () => {
      const loginDto = { email: 'wrong@test.com', password: 'wrong' };
      mockAuthService.validateUser.mockResolvedValue(null);

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockAuthService.login).not.toHaveBeenCalled();
    });
  });
});
