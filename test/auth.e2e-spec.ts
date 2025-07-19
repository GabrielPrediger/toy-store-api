import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const testUser = {
    name: 'Auth E2E User',
    email: 'auth@e2e.com',
    password: 'password123',
  };

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    prisma = app.get<PrismaService>(PrismaService);

    await prisma.user.deleteMany({});
    const hashedPassword = await bcrypt.hash(testUser.password, 10);
    await prisma.user.create({
      data: { ...testUser, password: hashedPassword },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({});
    await app.close();
  });

  it('should return a JWT access token for valid credentials (POST /auth/login)', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: testUser.email, password: testUser.password })
      .expect(201)
      .then((res) => {
        const body = res.body as { access_token: string };
        expect(body).toHaveProperty('access_token');
        expect(typeof body.access_token).toBe('string');
      });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({});
    await app.close();
  });

  it('should return a JWT access token for valid credentials (POST /auth/login)', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: testUser.email, password: testUser.password })
      .expect(201)
      .then((res) => {
        const body = res.body as { access_token: string };
        expect(body).toHaveProperty('access_token');
        expect(typeof body.access_token).toBe('string');
      });
  });

  it('should return 401 Unauthorized for an incorrect password (POST /auth/login)', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: testUser.email, password: 'wrongpassword' })
      .expect(401);
  });

  it('should return 401 Unauthorized for a non-existent user (POST /auth/login)', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'notfound@e2e.com', password: 'password123' })
      .expect(401);
  });
});
