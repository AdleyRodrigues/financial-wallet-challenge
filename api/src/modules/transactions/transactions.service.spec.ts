import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Prisma, TransactionStatus, TransactionType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { TransactionsService } from './transactions.service';

describe('TransactionsService', () => {
  const userId = 'user-1';
  const walletId = 'wallet-1';
  const receiverWalletId = 'wallet-2';
  const receiverUserId = 'user-2';

  const createPrismaMock = () => {
    const txMock = {
      wallet: {
        update: jest.fn(),
        updateMany: jest.fn(),
        findUniqueOrThrow: jest.fn(),
      },
      transaction: {
        create: jest.fn(),
        findUnique: jest.fn(),
        updateMany: jest.fn(),
        findMany: jest.fn(),
      },
    };

    const prisma = {
      wallet: {
        findUnique: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
      },
      $transaction: jest
        .fn()
        .mockImplementation((callback: (arg: typeof txMock) => unknown) =>
          callback(txMock),
        ),
    } as unknown as PrismaService;

    return { prisma, txMock };
  };

  const completedDeposit = {
    id: 'tx-deposit',
    type: TransactionType.DEPOSIT,
    status: TransactionStatus.COMPLETED,
    amount: new Prisma.Decimal('100.00'),
    fromWalletId: null,
    toWalletId: walletId,
    originalTransactionId: null,
    description: null,
    createdAt: new Date(),
    reversedAt: null,
  };

  const completedTransfer = {
    id: 'tx-transfer',
    type: TransactionType.TRANSFER,
    status: TransactionStatus.COMPLETED,
    amount: new Prisma.Decimal('40.00'),
    fromWalletId: walletId,
    toWalletId: receiverWalletId,
    originalTransactionId: null,
    description: null,
    createdAt: new Date(),
    reversedAt: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deposit increases balance', async () => {
    const { prisma, txMock } = createPrismaMock();
    const service = new TransactionsService(prisma);

    (prisma.wallet.findUnique as jest.Mock).mockResolvedValue({ id: walletId });
    txMock.wallet.update.mockResolvedValue({
      balance: new Prisma.Decimal('100.00'),
    });
    txMock.transaction.create.mockResolvedValue(completedDeposit);

    const result = await service.deposit(userId, { amount: 100 });

    expect(txMock.wallet.update).toHaveBeenCalledWith({
      where: { id: walletId },
      data: { balance: { increment: new Prisma.Decimal('100') } },
      select: { balance: true },
    });
    expect(result.balance).toBe('100.00');
  });

  it('deposit works when current balance is negative', async () => {
    const { prisma, txMock } = createPrismaMock();
    const service = new TransactionsService(prisma);

    (prisma.wallet.findUnique as jest.Mock).mockResolvedValue({ id: walletId });
    txMock.wallet.update.mockResolvedValue({
      balance: new Prisma.Decimal('50.00'),
    });
    txMock.transaction.create.mockResolvedValue({
      ...completedDeposit,
      amount: new Prisma.Decimal('100.00'),
    });

    const result = await service.deposit(userId, { amount: 100 });

    expect(result.balance).toBe('50.00');
  });

  it('deposit fails when amount is zero or negative', async () => {
    const { prisma } = createPrismaMock();
    const service = new TransactionsService(prisma);

    (prisma.wallet.findUnique as jest.Mock).mockResolvedValue({ id: walletId });

    await expect(service.deposit(userId, { amount: 0 })).rejects.toThrow(
      BadRequestException,
    );
    await expect(service.deposit(userId, { amount: -10 })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('transfer works with sufficient balance', async () => {
    const { prisma, txMock } = createPrismaMock();
    const service = new TransactionsService(prisma);

    (prisma.wallet.findUnique as jest.Mock).mockResolvedValue({ id: walletId });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: receiverUserId,
      name: 'Bruno',
      email: 'bruno@example.com',
      wallet: { id: receiverWalletId },
    });
    txMock.wallet.updateMany.mockResolvedValue({ count: 1 });
    txMock.wallet.update.mockResolvedValue({
      balance: new Prisma.Decimal('60.00'),
    });
    txMock.wallet.findUniqueOrThrow.mockResolvedValue({
      balance: new Prisma.Decimal('60.00'),
    });
    txMock.transaction.create.mockResolvedValue(completedTransfer);

    const result = await service.transfer(userId, {
      receiverEmail: 'bruno@example.com',
      amount: 40,
    });

    expect(txMock.wallet.updateMany).toHaveBeenCalledWith({
      where: {
        id: walletId,
        balance: { gte: new Prisma.Decimal('40') },
      },
      data: { balance: { decrement: new Prisma.Decimal('40') } },
    });
    expect(result.balance).toBe('60.00');
  });

  it('transfer fails with insufficient balance', async () => {
    const { prisma, txMock } = createPrismaMock();
    const service = new TransactionsService(prisma);

    (prisma.wallet.findUnique as jest.Mock).mockResolvedValue({ id: walletId });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: receiverUserId,
      email: 'bruno@example.com',
      wallet: { id: receiverWalletId },
    });
    txMock.wallet.updateMany.mockResolvedValue({ count: 0 });

    await expect(
      service.transfer(userId, {
        receiverEmail: 'bruno@example.com',
        amount: 40,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('transfer fails when transferring to yourself', async () => {
    const { prisma } = createPrismaMock();
    const service = new TransactionsService(prisma);

    (prisma.wallet.findUnique as jest.Mock).mockResolvedValue({ id: walletId });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: userId,
      email: 'alice@example.com',
      wallet: { id: walletId },
    });

    await expect(
      service.transfer(userId, {
        receiverEmail: 'alice@example.com',
        amount: 10,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('transfer fails when receiver does not exist', async () => {
    const { prisma } = createPrismaMock();
    const service = new TransactionsService(prisma);

    (prisma.wallet.findUnique as jest.Mock).mockResolvedValue({ id: walletId });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(
      service.transfer(userId, {
        receiverEmail: 'missing@example.com',
        amount: 10,
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('transfer uses conditional balance update', async () => {
    const { prisma, txMock } = createPrismaMock();
    const service = new TransactionsService(prisma);

    (prisma.wallet.findUnique as jest.Mock).mockResolvedValue({ id: walletId });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: receiverUserId,
      name: 'Bruno',
      email: 'bruno@example.com',
      wallet: { id: receiverWalletId },
    });
    txMock.wallet.updateMany.mockResolvedValue({ count: 1 });
    txMock.wallet.update.mockResolvedValue({
      balance: new Prisma.Decimal('0.00'),
    });
    txMock.wallet.findUniqueOrThrow.mockResolvedValue({
      balance: new Prisma.Decimal('0.00'),
    });
    txMock.transaction.create.mockResolvedValue(completedTransfer);

    await service.transfer(userId, {
      receiverEmail: 'bruno@example.com',
      amount: 40,
    });

    expect(txMock.wallet.updateMany).toHaveBeenCalledTimes(1);
    expect(txMock.wallet.update).toHaveBeenCalledWith({
      where: { id: receiverWalletId },
      data: { balance: { increment: new Prisma.Decimal('40') } },
      select: { balance: true },
    });
  });

  it('deposit reversal works', async () => {
    const { prisma, txMock } = createPrismaMock();
    const service = new TransactionsService(prisma);

    (prisma.wallet.findUnique as jest.Mock).mockResolvedValue({ id: walletId });
    txMock.transaction.findUnique.mockResolvedValue(completedDeposit);
    txMock.transaction.updateMany.mockResolvedValue({ count: 1 });
    txMock.wallet.update.mockResolvedValue({
      balance: new Prisma.Decimal('0.00'),
    });
    txMock.transaction.create.mockResolvedValue({
      id: 'tx-reversal',
      type: TransactionType.REVERSAL,
      status: TransactionStatus.COMPLETED,
      amount: new Prisma.Decimal('100.00'),
      fromWalletId: walletId,
      toWalletId: null,
      originalTransactionId: 'tx-deposit',
      description: null,
      createdAt: new Date(),
      reversedAt: null,
    });

    const result = await service.reverse(userId, 'tx-deposit');

    expect(txMock.wallet.update).toHaveBeenCalledWith({
      where: { id: walletId },
      data: { balance: { decrement: new Prisma.Decimal('100.00') } },
      select: { balance: true },
    });
    expect(result.balance).toBe('0.00');
  });

  it('transfer reversal works', async () => {
    const { prisma, txMock } = createPrismaMock();
    const service = new TransactionsService(prisma);

    (prisma.wallet.findUnique as jest.Mock).mockResolvedValue({ id: walletId });
    txMock.transaction.findUnique.mockResolvedValue(completedTransfer);
    txMock.transaction.updateMany.mockResolvedValue({ count: 1 });
    txMock.wallet.update
      .mockResolvedValueOnce({ balance: new Prisma.Decimal('0.00') })
      .mockResolvedValueOnce({ balance: new Prisma.Decimal('100.00') });
    txMock.transaction.create.mockResolvedValue({
      id: 'tx-reversal-transfer',
      type: TransactionType.REVERSAL,
      status: TransactionStatus.COMPLETED,
      amount: new Prisma.Decimal('40.00'),
      fromWalletId: receiverWalletId,
      toWalletId: walletId,
      originalTransactionId: 'tx-transfer',
      description: null,
      createdAt: new Date(),
      reversedAt: null,
    });

    const result = await service.reverse(userId, 'tx-transfer');

    expect(txMock.wallet.update).toHaveBeenNthCalledWith(1, {
      where: { id: receiverWalletId },
      data: { balance: { decrement: new Prisma.Decimal('40.00') } },
    });
    expect(txMock.wallet.update).toHaveBeenNthCalledWith(2, {
      where: { id: walletId },
      data: { balance: { increment: new Prisma.Decimal('40.00') } },
      select: { balance: true },
    });
    expect(result.balance).toBe('100.00');
  });

  it('duplicate reversal is not allowed', async () => {
    const { prisma, txMock } = createPrismaMock();
    const service = new TransactionsService(prisma);

    (prisma.wallet.findUnique as jest.Mock).mockResolvedValue({ id: walletId });
    txMock.transaction.findUnique.mockResolvedValue({
      ...completedDeposit,
      status: TransactionStatus.REVERSED,
    });

    await expect(service.reverse(userId, 'tx-deposit')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('receiver cannot reverse received transfer', async () => {
    const { prisma, txMock } = createPrismaMock();
    const service = new TransactionsService(prisma);

    (prisma.wallet.findUnique as jest.Mock).mockResolvedValue({
      id: receiverWalletId,
    });
    txMock.transaction.findUnique.mockResolvedValue(completedTransfer);

    await expect(
      service.reverse(receiverUserId, 'tx-transfer'),
    ).rejects.toThrow(BadRequestException);
  });

  it('sender can reverse sent transfer', async () => {
    const { prisma, txMock } = createPrismaMock();
    const service = new TransactionsService(prisma);

    (prisma.wallet.findUnique as jest.Mock).mockResolvedValue({ id: walletId });
    txMock.transaction.findUnique.mockResolvedValue(completedTransfer);
    txMock.transaction.updateMany.mockResolvedValue({ count: 1 });
    txMock.wallet.update
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce({ balance: new Prisma.Decimal('100.00') });
    txMock.transaction.create.mockResolvedValue({
      id: 'tx-reversal',
      type: TransactionType.REVERSAL,
      status: TransactionStatus.COMPLETED,
      amount: new Prisma.Decimal('40.00'),
      fromWalletId: receiverWalletId,
      toWalletId: walletId,
      originalTransactionId: 'tx-transfer',
      description: null,
      createdAt: new Date(),
      reversedAt: null,
    });

    await expect(service.reverse(userId, 'tx-transfer')).resolves.toBeDefined();
  });

  it('cannot reverse a REVERSAL transaction', async () => {
    const { prisma, txMock } = createPrismaMock();
    const service = new TransactionsService(prisma);

    (prisma.wallet.findUnique as jest.Mock).mockResolvedValue({ id: walletId });
    txMock.transaction.findUnique.mockResolvedValue({
      id: 'tx-reversal',
      type: TransactionType.REVERSAL,
      status: TransactionStatus.COMPLETED,
      amount: new Prisma.Decimal('40.00'),
      fromWalletId: receiverWalletId,
      toWalletId: walletId,
    });

    await expect(service.reverse(userId, 'tx-reversal')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('reversal may leave negative balance', async () => {
    const { prisma, txMock } = createPrismaMock();
    const service = new TransactionsService(prisma);

    (prisma.wallet.findUnique as jest.Mock).mockResolvedValue({
      id: receiverWalletId,
    });
    txMock.transaction.findUnique.mockResolvedValue({
      ...completedTransfer,
      fromWalletId: walletId,
      toWalletId: receiverWalletId,
    });
    txMock.transaction.updateMany.mockResolvedValue({ count: 0 });

    await expect(
      service.reverse(receiverUserId, 'tx-transfer'),
    ).rejects.toThrow(BadRequestException);

    (prisma.wallet.findUnique as jest.Mock).mockResolvedValue({ id: walletId });
    txMock.transaction.findUnique.mockResolvedValue(completedTransfer);
    txMock.transaction.updateMany.mockResolvedValue({ count: 1 });
    txMock.wallet.update
      .mockResolvedValueOnce({ balance: new Prisma.Decimal('-10.00') })
      .mockResolvedValueOnce({ balance: new Prisma.Decimal('30.00') });
    txMock.transaction.create.mockResolvedValue({
      id: 'tx-reversal-negative',
      type: TransactionType.REVERSAL,
      status: TransactionStatus.COMPLETED,
      amount: new Prisma.Decimal('40.00'),
      fromWalletId: receiverWalletId,
      toWalletId: walletId,
      originalTransactionId: 'tx-transfer',
      description: null,
      createdAt: new Date(),
      reversedAt: null,
    });

    const result = await service.reverse(userId, 'tx-transfer');

    expect(result.balance).toBe('30.00');
    expect(txMock.wallet.update).toHaveBeenNthCalledWith(1, {
      where: { id: receiverWalletId },
      data: { balance: { decrement: new Prisma.Decimal('40.00') } },
    });
  });
});
