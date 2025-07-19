import { Controller, Post, Body, ConflictException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Prisma } from '@prisma/client';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      const newUser = await this.usersService.create(createUserDto);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = newUser;
      return result;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('O e-mail fornecido já está em uso.');
      }
      throw error;
    }
  }
}
