import { INestApplication } from '@nestjs/common';
import request, { type SuperAgentTest } from 'supertest';
import type { App } from 'supertest/types';
import { PrismaService } from '../src/prisma/prisma.service';
import {
  AuthResponse,
  buildUserPayload,
  cleanupE2eData,
  createE2eApp,
  E2E_DESCRIPTION_MARKER,
  login,
  registerUser,
  TransactionResponse,
  WalletResponse,
} from './e2e-support';

describe('Financial flow (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let runId: number;
  let alice: ReturnType<typeof buildUserPayload>;
  let bruno: ReturnType<typeof buildUserPayload>;
  let aliceAgent: SuperAgentTest;
  let brunoAgent: SuperAgentTest;
  let transferId: string;
  let depositId: string;

  beforeAll(async () => {
    app = await createE2eApp();
    prisma = app.get(PrismaService);
    await cleanupE2eData(prisma);

    runId = Date.now();
    alice = buildUserPayload('Alice E2E', runId, 'alice');
    bruno = buildUserPayload('Bruno E2E', runId, 'bruno');
    aliceAgent = request.agent(app.getHttpServer());
    brunoAgent = request.agent(app.getHttpServer());
  });

  afterAll(async () => {
    await cleanupE2eData(prisma);
    await app.close();
  });

  it('5.1 registers Alice and Bruno, logs in and validates /auth/me with cookie', async () => {
    await registerUser(app, alice);
    await registerUser(app, bruno);

    const aliceLogin = await login(aliceAgent, {
      email: alice.email,
      password: alice.password,
    });
    const cookieHeaderRaw = aliceLogin.headers['set-cookie'];
    const cookieHeader = Array.isArray(cookieHeaderRaw) ? cookieHeaderRaw : [];

    expect(cookieHeader.join(';')).toContain('accessToken=');
    expect(cookieHeader.join(';')).toContain('HttpOnly');

    const aliceMe = await aliceAgent.get('/auth/me').expect(200);
    const aliceMeBody = aliceMe.body as AuthResponse;

    expect(aliceMeBody.user.email).toBe(alice.email);
    expect(aliceMeBody.user.sessionExpiresAt).toBeTruthy();
    expect(aliceMeBody.user.passwordHash).toBeUndefined();
  });

  it('5.2 rejects protected wallet route without cookie', async () => {
    await request(app.getHttpServer()).get('/wallet').expect(401);
  });

  it('5.3 rejects Authorization Bearer without cookie', async () => {
    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', 'Bearer fake-token')
      .expect(401);
  });

  it('5.4 deposits and updates balance and history', async () => {
    const initialWallet = await aliceAgent.get('/wallet').expect(200);
    expect((initialWallet.body as WalletResponse).balance).toBe('0.00');

    const deposit = await aliceAgent
      .post('/transactions/deposit')
      .send({
        amount: 100,
        description: `${E2E_DESCRIPTION_MARKER} deposit`,
      })
      .expect(201);

    const depositBody = deposit.body as {
      transaction: TransactionResponse;
      balance: string;
    };
    depositId = depositBody.transaction.id;

    expect(depositBody.balance).toBe('100.00');
    expect(depositBody.transaction.type).toBe('DEPOSIT');

    const wallet = await aliceAgent.get('/wallet').expect(200);
    expect((wallet.body as WalletResponse).balance).toBe('100.00');

    const history = await aliceAgent.get('/transactions').expect(200);
    const historyBody = history.body as TransactionResponse[];
    expect(
      historyBody.some(
        (item) => item.id === depositId && item.type === 'DEPOSIT',
      ),
    ).toBe(true);
  });

  it('5.5 transfers between Alice and Bruno with updated balances and history', async () => {
    await login(brunoAgent, { email: bruno.email, password: bruno.password });

    const transfer = await aliceAgent
      .post('/transactions/transfer')
      .send({
        receiverEmail: bruno.email,
        amount: 40,
        description: `${E2E_DESCRIPTION_MARKER} transfer`,
      })
      .expect(201);

    const transferBody = transfer.body as {
      transaction: TransactionResponse;
      balance: string;
    };
    transferId = transferBody.transaction.id;

    expect(transferBody.balance).toBe('60.00');
    expect(transferBody.transaction.type).toBe('TRANSFER');
    expect(transferBody.transaction.status).toBe('COMPLETED');

    const aliceWallet = await aliceAgent.get('/wallet').expect(200);
    expect((aliceWallet.body as WalletResponse).balance).toBe('60.00');

    const brunoWallet = await brunoAgent.get('/wallet').expect(200);
    expect((brunoWallet.body as WalletResponse).balance).toBe('40.00');

    const aliceHistory = await aliceAgent.get('/transactions').expect(200);
    const aliceHistoryBody = aliceHistory.body as TransactionResponse[];
    expect(
      aliceHistoryBody.some(
        (item) => item.id === transferId && item.direction === 'OUT',
      ),
    ).toBe(true);

    const brunoHistory = await brunoAgent.get('/transactions').expect(200);
    const brunoHistoryBody = brunoHistory.body as TransactionResponse[];
    expect(
      brunoHistoryBody.some(
        (item) => item.id === transferId && item.direction === 'IN',
      ),
    ).toBe(true);
  });

  it('5.6 blocks transfer with insufficient balance', async () => {
    const aliceWalletBefore = await aliceAgent.get('/wallet').expect(200);
    const brunoWalletBefore = await brunoAgent.get('/wallet').expect(200);
    const aliceHistoryBefore = (
      await aliceAgent.get('/transactions').expect(200)
    ).body as TransactionResponse[];

    await aliceAgent
      .post('/transactions/transfer')
      .send({
        receiverEmail: bruno.email,
        amount: 9999,
        description: `${E2E_DESCRIPTION_MARKER} invalid transfer`,
      })
      .expect(400);

    const aliceWalletAfter = await aliceAgent.get('/wallet').expect(200);
    const brunoWalletAfter = await brunoAgent.get('/wallet').expect(200);
    const aliceHistoryAfter = (
      await aliceAgent.get('/transactions').expect(200)
    ).body as TransactionResponse[];

    expect((aliceWalletAfter.body as WalletResponse).balance).toBe(
      (aliceWalletBefore.body as WalletResponse).balance,
    );
    expect((brunoWalletAfter.body as WalletResponse).balance).toBe(
      (brunoWalletBefore.body as WalletResponse).balance,
    );
    expect(aliceHistoryAfter).toHaveLength(aliceHistoryBefore.length);
  });

  it('5.7 reverses transfer with compensating transaction and REVERSED status', async () => {
    const reversal = await aliceAgent
      .post(`/transactions/${transferId}/reverse`)
      .expect(201);

    const reversalBody = reversal.body as {
      transaction: TransactionResponse;
      balance: string;
    };

    expect(reversalBody.transaction.type).toBe('REVERSAL');
    expect(reversalBody.transaction.originalTransactionId).toBe(transferId);
    expect(reversalBody.balance).toBe('100.00');

    const aliceWallet = await aliceAgent.get('/wallet').expect(200);
    expect((aliceWallet.body as WalletResponse).balance).toBe('100.00');

    const brunoWallet = await brunoAgent.get('/wallet').expect(200);
    expect((brunoWallet.body as WalletResponse).balance).toBe('0.00');

    const aliceHistory = await aliceAgent.get('/transactions').expect(200);
    const historyBody = aliceHistory.body as TransactionResponse[];
    const original = historyBody.find((item) => item.id === transferId);
    const compensating = historyBody.find(
      (item) =>
        item.type === 'REVERSAL' && item.originalTransactionId === transferId,
    );

    expect(original?.status).toBe('REVERSED');
    expect(compensating).toBeTruthy();
  });

  it('5.8 blocks duplicate reversal', async () => {
    const aliceWalletBefore = await aliceAgent.get('/wallet').expect(200);
    const brunoWalletBefore = await brunoAgent.get('/wallet').expect(200);

    await aliceAgent.post(`/transactions/${transferId}/reverse`).expect(400);

    const aliceWalletAfter = await aliceAgent.get('/wallet').expect(200);
    const brunoWalletAfter = await brunoAgent.get('/wallet').expect(200);

    expect((aliceWalletAfter.body as WalletResponse).balance).toBe(
      (aliceWalletBefore.body as WalletResponse).balance,
    );
    expect((brunoWalletAfter.body as WalletResponse).balance).toBe(
      (brunoWalletBefore.body as WalletResponse).balance,
    );
  });

  it('5.9 prevents receiver from reversing received transfer', async () => {
    const freshRunId = Date.now() + 1;
    const freshAlice = buildUserPayload(
      'Alice Fresh',
      freshRunId,
      'alice-fresh',
    );
    const freshBruno = buildUserPayload(
      'Bruno Fresh',
      freshRunId,
      'bruno-fresh',
    );
    const freshAliceAgent = request.agent(app.getHttpServer());
    const freshBrunoAgent = request.agent(app.getHttpServer());

    await registerUser(app, freshAlice);
    await registerUser(app, freshBruno);
    await login(freshAliceAgent, {
      email: freshAlice.email,
      password: freshAlice.password,
    });
    await login(freshBrunoAgent, {
      email: freshBruno.email,
      password: freshBruno.password,
    });

    await freshAliceAgent
      .post('/transactions/deposit')
      .send({
        amount: 50,
        description: `${E2E_DESCRIPTION_MARKER} fresh deposit`,
      })
      .expect(201);

    const transfer = await freshAliceAgent
      .post('/transactions/transfer')
      .send({
        receiverEmail: freshBruno.email,
        amount: 20,
        description: `${E2E_DESCRIPTION_MARKER} fresh transfer`,
      })
      .expect(201);

    const freshTransferId = (
      transfer.body as { transaction: TransactionResponse }
    ).transaction.id;
    const brunoWalletBefore = await freshBrunoAgent.get('/wallet').expect(200);

    await freshBrunoAgent
      .post(`/transactions/${freshTransferId}/reverse`)
      .expect(400);

    const brunoWalletAfter = await freshBrunoAgent.get('/wallet').expect(200);
    expect((brunoWalletAfter.body as WalletResponse).balance).toBe(
      (brunoWalletBefore.body as WalletResponse).balance,
    );
  });

  it('5.10 allows deposit after deposit reversal resets balance to zero', async () => {
    const negativeRunId = Date.now() + 2;
    const negativeAlice = buildUserPayload(
      'Alice Negative',
      negativeRunId,
      'alice-negative',
    );
    const negativeAgent = request.agent(app.getHttpServer());

    await registerUser(app, negativeAlice);
    await login(negativeAgent, {
      email: negativeAlice.email,
      password: negativeAlice.password,
    });

    const deposit = await negativeAgent
      .post('/transactions/deposit')
      .send({
        amount: 10,
        description: `${E2E_DESCRIPTION_MARKER} negative deposit`,
      })
      .expect(201);

    const negativeDepositId = (
      deposit.body as { transaction: TransactionResponse }
    ).transaction.id;

    await negativeAgent
      .post(`/transactions/${negativeDepositId}/reverse`)
      .expect(201);

    const walletAfterReversal = await negativeAgent.get('/wallet').expect(200);
    expect((walletAfterReversal.body as WalletResponse).balance).toBe('0.00');

    const recoveryDeposit = await negativeAgent
      .post('/transactions/deposit')
      .send({
        amount: 25,
        description: `${E2E_DESCRIPTION_MARKER} recovery deposit`,
      })
      .expect(201);

    expect((recoveryDeposit.body as { balance: string }).balance).toBe('25.00');
  });

  it('logs out and invalidates cookie session', async () => {
    await aliceAgent.post('/auth/logout').expect(200);
    await aliceAgent.get('/wallet').expect(401);
  });
});
