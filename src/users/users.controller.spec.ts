import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

const mockUsersService = {
  create: jest.fn(),
};

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a user and return the result without the password', async () => {
      const userDto = {
        name: 'Test',
        email: 'test@test.com',
        password: 'password123',
      };
      const createdUser = { id: 1, ...userDto, password: 'hashedpassword' };
      mockUsersService.create.mockResolvedValue(createdUser);

      const result = await controller.create(userDto);

      expect(result).toEqual({ id: 1, name: 'Test', email: 'test@test.com' });
      expect(result).not.toHaveProperty('password');
      expect(mockUsersService.create).toHaveBeenCalledWith(userDto);
    });

    it('should throw a ConflictException if the email is already in use', async () => {
      const userDto = {
        name: 'Test',
        email: 'test@test.com',
        password: 'password123',
      };

      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Email already in use',
        { code: 'P2002', clientVersion: 'test' },
      );
      mockUsersService.create.mockRejectedValue(prismaError);

      await expect(controller.create(userDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });
});
