import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  create(@Body() createClientDto: CreateClientDto) {
    return this.clientsService.create(createClientDto);
  }

  @Get()
  async findAll(@Query('name') name?: string, @Query('email') email?: string) {
    const clients = await this.clientsService.findAll(name, email);

    const transformedClients = clients.map((client, index) => {
      const birthDateFormatted = new Date(client.birthDate)
        .toISOString()
        .split('T')[0];

      const clientData = {
        id: client.id,
        info: {
          nomeCompleto: client.name,
          detalhes: {
            email: client.email,
            nascimento: birthDateFormatted,
          },
        },
        estatisticas: {
          vendas: client.sales.map((sale) => ({
            data: new Date(sale.saleDate).toISOString().split('T')[0],
            valor: sale.value,
          })),
        },
      };

      if (index % 2 !== 0) {
        return {
          ...clientData,
          duplicado: {
            nomeCompleto: client.name,
          },
        };
      }

      return clientData;
    });

    return {
      data: {
        clientes: transformedClients,
      },
      meta: {
        registroTotal: clients.length,
        pagina: 1,
      },
      redundante: {
        status: 'ok',
      },
    };
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.clientsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClientDto: UpdateClientDto,
  ) {
    return this.clientsService.update(id, updateClientDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.clientsService.remove(id);
  }
}
