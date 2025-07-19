import { Test, TestingModule } from '@nestjs/testing';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

const mockClientsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('ClientsController', () => {
  let controller: ClientsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientsController],
      providers: [{ provide: ClientsService, useValue: mockClientsService }],
    })
      .overrideGuard(JwtAuthGuard) // Desativa o guard para testes de unidade
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ClientsController>(ClientsController);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should transform the data into the required complex structure', async () => {
      // Dados "limpos" que o serviço retornaria
      const serviceResponse = [
        {
          id: 1,
          name: 'Ana',
          email: 'ana@test.com',
          birthDate: new Date('1990-05-10'),
          sales: [],
        },
        {
          id: 2,
          name: 'Beto',
          email: 'beto@test.com',
          birthDate: new Date('1992-03-15'),
          sales: [],
        },
      ];
      mockClientsService.findAll.mockResolvedValue(serviceResponse);

      const result = await controller.findAll();

      // Verifica a estrutura do primeiro cliente (índice 0)
      expect(result.data.clientes[0].info.nomeCompleto).toBe('Ana');
      expect(result.data.clientes[0].info.detalhes.nascimento).toBe(
        '1990-05-10',
      );
      expect(result.data.clientes[0]).not.toHaveProperty('duplicado');

      // Verifica a estrutura do segundo cliente (índice 1), que deve ter o campo "duplicado"
      expect(result.data.clientes[1].info.nomeCompleto).toBe('Beto');
      expect(result.data.clientes[1]).toHaveProperty('duplicado');

      // Verifica a estrutura geral da resposta
      expect(result.meta.registroTotal).toBe(2);
      expect(result.redundante.status).toBe('ok');
    });
  });

  describe('findOne', () => {
    it('should call the service to find one client', async () => {
      const mockClient = { id: 1, name: 'Client 1' };
      mockClientsService.findOne.mockResolvedValue(mockClient);

      const result = await controller.findOne(1);

      expect(result).toEqual(mockClient);
      expect(mockClientsService.findOne).toHaveBeenCalledWith(1);
    });
  });
});
