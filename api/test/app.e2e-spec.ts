import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { PrismaService } from '../src/prisma/prisma.service';
import { cleanupE2eData, createE2eApp } from './e2e-support';

describe('Auth smoke (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createE2eApp();
    await cleanupE2eData(app.get(PrismaService));
  });

  afterAll(async () => {
    await cleanupE2eData(app.get(PrismaService));
    await app.close();
  });

  it('GET /auth/me requires authentication', async () => {
    await request(app.getHttpServer()).get('/auth/me').expect(401);
  });
});
