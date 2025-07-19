import { Test, TestingModule } from '@nestjs/testing';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

describe('SalesController', () => {
  let controller: SalesController;

  const mockSalesService = {
    create: jest.fn(),
    getDailySalesTotal: jest.fn(),
    getTopClientsStats: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SalesController],
      providers: [
        {
          provide: SalesService,
          useValue: mockSalesService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<SalesController>(SalesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call the create method from the service with correct data', async () => {
      const dto = { clientId: 1, value: 50 };
      mockSalesService.create.mockResolvedValue({
        id: 1,
        ...dto,
        saleDate: new Date(),
      });

      await controller.create(dto);

      expect(mockSalesService.create).toHaveBeenCalledWith(dto);
      expect(mockSalesService.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('getDailySalesTotal', () => {
    it('should call the getDailySalesTotal method from the service', async () => {
      await controller.getDailySalesTotal();
      expect(mockSalesService.getDailySalesTotal).toHaveBeenCalledTimes(1);
    });
  });

  describe('getTopClientsStats', () => {
    it('should call the getTopClientsStats method from the service', async () => {
      await controller.getTopClientsStats();
      expect(mockSalesService.getTopClientsStats).toHaveBeenCalledTimes(1);
    });
  });
});
