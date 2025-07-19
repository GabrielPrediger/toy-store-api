import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { SalesService } from './sales.service';
import { NotFoundException } from '@nestjs/common';

const mockPrismaService = {
  sale: {
    groupBy: jest.fn(),
    create: jest.fn(),
  },
  client: {
    findUnique: jest.fn(),
  },
  $queryRaw: jest.fn(),
};

describe('SalesService', () => {
  let service: SalesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<SalesService>(SalesService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDailySalesTotal', () => {
    it('should group sales by date and return the summed total in a clean format', async () => {
      const mockDbResult = [
        {
          saleDate: new Date('2025-07-18T03:00:00.000Z'),
          _sum: { value: 150 },
        },
        {
          saleDate: new Date('2025-07-19T03:00:00.000Z'),
          _sum: { value: 200 },
        },
      ];

      mockPrismaService.sale.groupBy.mockResolvedValue(mockDbResult);

      const result = await service.getDailySalesTotal();

      expect(result).toEqual([
        { date: '2025-07-18', total: 150 },
        { date: '2025-07-19', total: 200 },
      ]);

      expect(mockPrismaService.sale.groupBy).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.sale.groupBy).toHaveBeenCalledWith({
        by: ['saleDate'],
        _sum: { value: true },
        orderBy: { saleDate: 'asc' },
      });
    });
  });

  describe('getTopClientsStats', () => {
    it('should return the top clients for volume, average, and frequency', async () => {
      const mockQueryResult = [
        {
          id: 1,
          name: 'Cliente Frequente',
          email: 'freq@test.com',
          totalVolume: 300.0,
          averageSaleValue: 100.0,
          uniqueSaleDays: 3n,
        },
        {
          id: 2,
          name: 'Cliente de Valor',
          email: 'valor@test.com',
          totalVolume: 1000.0,
          averageSaleValue: 500.0,
          uniqueSaleDays: 2n,
        },
        {
          id: 3,
          name: 'Cliente de Ticket Médio',
          email: 'media@test.com',
          totalVolume: 600.0,
          averageSaleValue: 600.0,
          uniqueSaleDays: 1n,
        },
      ];
      mockPrismaService.$queryRaw.mockResolvedValue(mockQueryResult);

      const result = await service.getTopClientsStats();

      expect(result.topClientByVolume!.id).toBe(2);
      expect(result.topClientByAverage!.id).toBe(3);
      expect(result.topClientByFrequency!.id).toBe(1);

      expect(mockPrismaService.$queryRaw).toHaveBeenCalledTimes(1);
    });

    it('should return null for all categories if there are no sales stats', async () => {
      mockPrismaService.$queryRaw.mockResolvedValue([]);

      const result = await service.getTopClientsStats();

      expect(result.topClientByVolume).toBeNull();
      expect(result.topClientByAverage).toBeNull();
      expect(result.topClientByFrequency).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a sale successfully when client exists', async () => {
      const saleDto = { clientId: 1, value: 100 };
      const createdSale = { id: 1, ...saleDto, saleDate: new Date() };

      mockPrismaService.client.findUnique.mockResolvedValue({
        id: 1,
        name: 'Test Client',
      });

      mockPrismaService.sale.create.mockResolvedValue(createdSale);

      const result = await service.create(saleDto);

      expect(result).toEqual(createdSale);
      expect(mockPrismaService.client.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockPrismaService.sale.create).toHaveBeenCalledTimes(1);
    });

    it('should throw a NotFoundException if the client does not exist', async () => {
      const saleDto = { clientId: 999, value: 100 };
      mockPrismaService.client.findUnique.mockResolvedValue(null);

      await expect(service.create(saleDto)).rejects.toThrow(NotFoundException);

      expect(mockPrismaService.sale.create).not.toHaveBeenCalled();
    });
  });
});
