import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request, { type SuperAgentTest } from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { PrismaService } from '../src/prisma/prisma.service';

export const E2E_EMAIL_PREFIX = 'e2e.financial.wallet+';
export const E2E_WEB_EMAIL_PREFIX = 'e2e.web+';
export const E2E_PASSWORD = 'Password123!';
export const E2E_DESCRIPTION_MARKER = '[E2E]';

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type AuthResponse = {
  user: {
    id: string;
    name: string;
    email: string;
    sessionExpiresAt?: string;
    passwordHash?: string;
  };
};

export type WalletResponse = {
  id: string;
  balance: string;
};

export type TransactionResponse = {
  id: string;
  type: 'DEPOSIT' | 'TRANSFER' | 'REVERSAL';
  status: 'COMPLETED' | 'REVERSED';
  amount: string;
  direction?: 'IN' | 'OUT' | 'NEUTRAL';
  originalTransactionId: string | null;
  canReverse?: boolean;
};

export async function createE2eApp(): Promise<INestApplication<App>> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.use(cookieParser());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const frontendUrl =
    process.env.FRONTEND_URL ??
    process.env.WEB_ORIGIN ??
    'http://localhost:3000';
  app.enableCors({
    origin: frontendUrl,
    credentials: true,
  });

  await app.init();
  return app;
}

export function buildUserPayload(
  name: string,
  runId: number,
  alias: string,
): RegisterPayload {
  return {
    name,
    email: `${E2E_EMAIL_PREFIX}${alias}.${runId}@example.com`,
    password: E2E_PASSWORD,
  };
}

export function extractAccessToken(setCookie: string[]): string {
  const accessTokenCookie = setCookie.find((cookie) =>
    cookie.startsWith('accessToken='),
  );

  if (!accessTokenCookie) {
    throw new Error('Cookie accessToken não encontrado na resposta de login');
  }

  const [token] = accessTokenCookie.replace('accessToken=', '').split(';');
  return token;
}

export async function login(agent: SuperAgentTest, payload: LoginPayload) {
  return agent.post('/auth/login').send(payload).expect(200);
}

export async function registerUser(
  app: INestApplication<App>,
  payload: RegisterPayload,
) {
  return request(app.getHttpServer())
    .post('/auth/register')
    .send(payload)
    .expect(201);
}

export async function cleanupE2eData(prisma: PrismaService): Promise<void> {
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { email: { startsWith: E2E_EMAIL_PREFIX } },
        { email: { startsWith: E2E_WEB_EMAIL_PREFIX } },
      ],
    },
    select: { id: true },
  });
  const userIds = users.map((user) => user.id);

  if (userIds.length === 0) {
    return;
  }

  const wallets = await prisma.wallet.findMany({
    where: { userId: { in: userIds } },
    select: { id: true },
  });
  const walletIds = wallets.map((wallet) => wallet.id);

  if (walletIds.length > 0) {
    await prisma.transaction.deleteMany({
      where: {
        OR: [
          { description: { contains: E2E_DESCRIPTION_MARKER } },
          { fromWalletId: { in: walletIds } },
          { toWalletId: { in: walletIds } },
        ],
      },
    });
  }

  await prisma.wallet.deleteMany({
    where: { userId: { in: userIds } },
  });

  await prisma.user.deleteMany({
    where: { id: { in: userIds } },
  });
}
