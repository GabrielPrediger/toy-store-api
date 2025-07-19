import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

interface LoginResponse {
  access_token: string;
}

interface ClientResponse {
  id: number;
  name: string;
  email: string;
  birthDate: string;
}

describe('AppController (e2e)', () => {
  let app: INestApplication & { getHttpServer(): any };
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    await request(app.getHttpServer())
      .post('/users')
      .send({
        name: 'Novo Usuário',
        email: 'novo.usuario@example.com',
        password: 'senhaForte123',
      })
      .expect(201);

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'novo.usuario@example.com',
        password: 'senhaForte123',
      });

    const loginBody = loginResponse.body as LoginResponse;
    accessToken = loginBody.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/clients (e2e)', () => {
    it('should create a client and then fetch it', async () => {
      const clientEmail = `test-${Date.now()}@example.com`;
      const createResponse = await request(app.getHttpServer())
        .post('/clients')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Cliente de Teste E2E',
          email: clientEmail,
          birthDate: '1990-01-01',
        })
        .expect(201);

      const createBody = createResponse.body as ClientResponse;
      expect(createBody.email).toEqual(clientEmail);
      const newClientId = createBody.id;

      const getResponse = await request(app.getHttpServer())
        .get(`/clients/${newClientId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const getBody = getResponse.body as ClientResponse;

      expect(getBody.id).toBe(newClientId);
      expect(getBody.name).toEqual('Cliente de Teste E2E');
    });

    it('should return 401 Unauthorized if no token is provided', () => {
      return request(app.getHttpServer())
        .post('/clients')
        .send({
          name: 'Falha',
          email: 'fail@test.com',
          birthDate: '2000-01-01',
        })
        .expect(401);
    });
  });
});
