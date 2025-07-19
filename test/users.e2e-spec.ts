import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
  });

  beforeEach(async () => {
    await prisma.user.deleteMany({});
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create a new user successfully (POST /users)', async () => {
    const userDto = {
      name: 'E2E User',
      email: 'e2e@test.com',
      password: 'password123',
    };

    const response = await request(app.getHttpServer())
      .post('/users')
      .send(userDto)
      .expect(201);

    const body = response.body as {
      email: string;
      name: string;
      password?: string;
    };

    expect(body).toBeDefined();
    expect(body.email).toEqual(userDto.email);
    expect(body.name).toEqual(userDto.name);
    expect(body.password).toBeUndefined();

    const dbUser = await prisma.user.findUnique({
      where: { email: userDto.email },
    });
    expect(dbUser).not.toBeNull();
    if (dbUser) {
      expect(dbUser.password).not.toEqual(userDto.password);
    }
  });

  it('should return a 409 Conflict if the email already exists (POST /users)', async () => {
    const userDto = {
      name: 'E2E User',
      email: 'e2e@test.com',
      password: 'password123',
    };

    await request(app.getHttpServer()).post('/users').send(userDto);

    const response = await request(app.getHttpServer())
      .post('/users')
      .send(userDto)
      .expect(409);

    const body = response.body as { message: string };

    expect(body.message).toEqual('O e-mail fornecido já está em uso.');
  });
});
