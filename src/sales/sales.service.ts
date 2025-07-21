import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSaleDto } from './dto/create-sale.dto';
import { Client, Prisma } from '@prisma/client';
import { ClientStat } from './@types';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  async create(createSaleDto: CreateSaleDto) {
    const { clientId, value, saleDate } = createSaleDto;

    const clientExists: Client | null = await this.prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!clientExists) {
      throw new NotFoundException(`Cliente com ID ${clientId} não encontrado.`);
    }

    return this.prisma.sale.create({
      data: {
        value,
        saleDate: saleDate ? new Date(saleDate) : new Date(),
        clientId,
      },
    });
  }

  async getDailySalesTotal() {
    const dailyTotals = await this.prisma.sale.groupBy({
      by: ['saleDate'],
      _sum: {
        value: true,
      },
      orderBy: {
        saleDate: 'asc',
      },
    });

    return dailyTotals.map((item) => ({
      date: new Date(item.saleDate).toISOString().split('T')[0],
      total: item._sum.value,
    }));
  }

  async getTopClientsStats() {
    const clientStats = await this.prisma.$queryRaw<ClientStat[]>(Prisma.sql`
      SELECT
        c.id,
        c.name,
        c.email,
        SUM(s.value) as "totalVolume",
        AVG(s.value) as "averageSaleValue",
        COUNT(DISTINCT s."saleDate") as "uniqueSaleDays"
      FROM "Client" as c
      JOIN "Sale" as s ON c.id = s."clientId"
      GROUP BY c.id
      HAVING COUNT(s.id) > 0;
    `);

    if (clientStats.length === 0) {
      return {
        topClientByVolume: null,
        topClientByAverage: null,
        topClientByFrequency: null,
      };
    }

    const processedStats = clientStats.map((stat) => ({
      ...stat,
      totalVolume: Number(stat.totalVolume),
      averageSaleValue: Number(stat.averageSaleValue),
      uniqueSaleDays: Number(stat.uniqueSaleDays),
    }));

    const topClientByVolume = processedStats.reduce((prev, current) =>
      prev.totalVolume > current.totalVolume ? prev : current,
    );

    const topClientByAverage = processedStats.reduce((prev, current) =>
      prev.averageSaleValue > current.averageSaleValue ? prev : current,
    );

    const topClientByFrequency = processedStats.reduce((prev, current) =>
      prev.uniqueSaleDays > current.uniqueSaleDays ? prev : current,
    );

    return {
      topClientByVolume,
      topClientByAverage,
      topClientByFrequency,
    };
  }
}
