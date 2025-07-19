import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('ClientsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    await prisma.user.deleteMany({});
    await request(app.getHttpServer()).post('/users').send({
      name: 'Test User',
      email: 'test@e2e.com',
      password: 'password123',
    });
    const loginResponse: request.Response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@e2e.com', password: 'password123' });

    const { access_token } = loginResponse.body as { access_token: string };
    accessToken = access_token;
  });

  beforeEach(async () => {
    await prisma.client.deleteMany({});
  });

  afterAll(async () => {
    await app.close();
  });

  it('should perform a full CRUD lifecycle for clients', async () => {
    const clientDto = {
      name: 'E2E Client',
      email: 'client@e2e.com',
      birthDate: '1995-10-20',
    };

    // 1. CREATE
    const createResponse: request.Response = await request(app.getHttpServer())
      .post('/clients')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(clientDto)
      .expect(201);

    const { id } = createResponse.body as { id: number };
    const clientId: number = id;
    expect(clientId).toBeDefined();

    // 2. READ (findOne)
    await request(app.getHttpServer())
      .get(`/clients/${clientId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .then((res) => {
        const body = res.body as { name: string };
        expect(body.name).toEqual(clientDto.name);
      });

    // 3. UPDATE
    await request(app.getHttpServer())
      .patch(`/clients/${clientId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Updated E2E Client' })
      .expect(200);

    // 4. VERIFY UPDATE
    await request(app.getHttpServer())
      .get(`/clients/${clientId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .then((res) => {
        const body = res.body as { name: string };
        expect(body.name).toEqual('Updated E2E Client');
      });

    // 5. DELETE
    await request(app.getHttpServer())
      .delete(`/clients/${clientId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(204);

    // 6. VERIFY DELETE
    await request(app.getHttpServer())
      .get(`/clients/${clientId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);
  });

  it('should return 401 Unauthorized when no token is provided', () => {
    return request(app.getHttpServer()).get('/clients').expect(401);
  });
});
