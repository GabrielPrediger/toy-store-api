import { Test, TestingModule } from '@nestjs/testing';
import { ClientsService } from './clients.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

const mockPrismaService = {
  client: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('ClientsService', () => {
  let service: ClientsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ClientsService>(ClientsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a client and convert birthDate to a Date object', async () => {
      const dto = {
        name: 'Test',
        email: 'test@test.com',
        birthDate: '2000-01-01',
      };
      const expectedClient = {
        id: 1,
        ...dto,
        birthDate: new Date(dto.birthDate),
      };
      mockPrismaService.client.create.mockResolvedValue(expectedClient);

      const result = await service.create(dto);

      expect(result).toEqual(expectedClient);
      expect(mockPrismaService.client.create).toHaveBeenCalledWith({
        data: {
          name: dto.name,
          email: dto.email,
          birthDate: new Date(dto.birthDate),
        },
      });
    });
  });

  describe('findAll', () => {
    it('should build filters correctly when name and email are provided', async () => {
      mockPrismaService.client.findMany.mockResolvedValue([]);
      await service.findAll('Ana', 'ana@test.com');

      expect(mockPrismaService.client.findMany).toHaveBeenCalledWith({
        where: {
          name: { contains: 'Ana', mode: 'insensitive' },
          email: { contains: 'ana@test.com', mode: 'insensitive' },
        },
        include: { sales: true },
      });
    });
  });

  describe('findOne', () => {
    it('should return a client if found', async () => {
      const mockClient = { id: 1, name: 'Found', email: 'found@test.com' };
      mockPrismaService.client.findUnique.mockResolvedValue(mockClient);

      const result = await service.findOne(1);
      expect(result).toEqual(mockClient);
    });

    it('should throw NotFoundException if client is not found', async () => {
      mockPrismaService.client.findUnique.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a client successfully', async () => {
      const dto = { name: 'Updated Name' };
      const existingClient = {
        id: 1,
        name: 'Old Name',
        email: 'test@test.com',
      };
      mockPrismaService.client.findUnique.mockResolvedValue(existingClient);
      mockPrismaService.client.update.mockResolvedValue({
        ...existingClient,
        ...dto,
      });

      await service.update(1, dto);

      expect(mockPrismaService.client.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { ...dto, birthDate: undefined },
      });
    });

    it('should throw NotFoundException if client to update does not exist', async () => {
      mockPrismaService.client.findUnique.mockResolvedValue(null);
      await expect(service.update(999, {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a client successfully', async () => {
      const existingClient = {
        id: 1,
        name: 'To Delete',
        email: 'delete@test.com',
      };
      mockPrismaService.client.findUnique.mockResolvedValue(existingClient);
      mockPrismaService.client.delete.mockResolvedValue(existingClient);

      await service.remove(1);

      expect(mockPrismaService.client.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });
});
