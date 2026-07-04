import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, TransactionStatus, TransactionType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { DepositDto } from './dto/deposit.dto';
import { TransferDto } from './dto/transfer.dto';

type TransactionDirection = 'IN' | 'OUT' | 'NEUTRAL';

type CreatedTransaction = {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: Prisma.Decimal;
  fromWalletId: string | null;
  toWalletId: string | null;
  originalTransactionId: string | null;
  description: string | null;
  createdAt: Date;
  reversedAt: Date | null;
};

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async deposit(userId: string, dto: DepositDto) {
    const amount = this.toDecimal(dto.amount);
    const wallet = await this.requireWallet(userId);

    const result = await this.prisma.$transaction(async (tx) => {
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: { increment: amount } },
        select: { balance: true },
      });

      const transaction = await tx.transaction.create({
        data: {
          type: TransactionType.DEPOSIT,
          status: TransactionStatus.COMPLETED,
          amount,
          toWalletId: wallet.id,
          description: dto.description,
        },
      });

      return { transaction, balance: updatedWallet.balance };
    });

    return {
      transaction: this.toTransactionDetail(
        result.transaction,
        wallet.id,
        null,
      ),
      balance: result.balance.toFixed(2),
    };
  }

  async transfer(userId: string, dto: TransferDto) {
    const amount = this.toDecimal(dto.amount);
    const senderWallet = await this.requireWallet(userId);

    const receiverUser = await this.prisma.user.findUnique({
      where: { email: dto.receiverEmail },
      include: { wallet: { select: { id: true } } },
    });

    if (!receiverUser?.wallet) {
      throw new NotFoundException('Receiver not found');
    }

    if (receiverUser.id === userId) {
      throw new BadRequestException('Cannot transfer to yourself');
    }

    const receiverWalletId = receiverUser.wallet.id;

    const result = await this.prisma.$transaction(async (tx) => {
      const debitResult = await tx.wallet.updateMany({
        where: {
          id: senderWallet.id,
          balance: { gte: amount },
        },
        data: {
          balance: { decrement: amount },
        },
      });

      if (debitResult.count !== 1) {
        throw new BadRequestException('Insufficient balance');
      }

      const receiverWallet = await tx.wallet.update({
        where: { id: receiverWalletId },
        data: { balance: { increment: amount } },
        select: { balance: true },
      });

      const transaction = await tx.transaction.create({
        data: {
          type: TransactionType.TRANSFER,
          status: TransactionStatus.COMPLETED,
          amount,
          fromWalletId: senderWallet.id,
          toWalletId: receiverWalletId,
          description: dto.description,
        },
      });

      const senderWalletUpdated = await tx.wallet.findUniqueOrThrow({
        where: { id: senderWallet.id },
        select: { balance: true },
      });

      return {
        transaction,
        senderBalance: senderWalletUpdated.balance,
        receiverBalance: receiverWallet.balance,
      };
    });

    return {
      transaction: this.toTransactionDetail(
        result.transaction,
        senderWallet.id,
        {
          name: receiverUser.name,
          email: receiverUser.email,
        },
      ),
      balance: result.senderBalance.toFixed(2),
    };
  }

  async reverse(userId: string, transactionId: string) {
    const wallet = await this.requireWallet(userId);

    const result = await this.prisma.$transaction(async (tx) => {
      const original = await tx.transaction.findUnique({
        where: { id: transactionId },
      });

      if (!original) {
        throw new NotFoundException('Transaction not found');
      }

      this.assertCanReverse(wallet.id, original);

      const markReversed = await tx.transaction.updateMany({
        where: {
          id: original.id,
          status: TransactionStatus.COMPLETED,
        },
        data: {
          status: TransactionStatus.REVERSED,
          reversedAt: new Date(),
        },
      });

      if (markReversed.count !== 1) {
        throw new BadRequestException('Transaction already reversed');
      }

      let reversal: CreatedTransaction;
      let balance: Prisma.Decimal;

      if (original.type === TransactionType.DEPOSIT) {
        const updatedWallet = await tx.wallet.update({
          where: { id: original.toWalletId! },
          data: { balance: { decrement: original.amount } },
          select: { balance: true },
        });

        reversal = await tx.transaction.create({
          data: {
            type: TransactionType.REVERSAL,
            status: TransactionStatus.COMPLETED,
            amount: original.amount,
            fromWalletId: original.toWalletId,
            originalTransactionId: original.id,
            description: `Reversal of deposit ${original.id}`,
          },
        });

        balance = updatedWallet.balance;
      } else {
        await tx.wallet.update({
          where: { id: original.toWalletId! },
          data: { balance: { decrement: original.amount } },
        });

        const updatedSender = await tx.wallet.update({
          where: { id: original.fromWalletId! },
          data: { balance: { increment: original.amount } },
          select: { balance: true },
        });

        reversal = await tx.transaction.create({
          data: {
            type: TransactionType.REVERSAL,
            status: TransactionStatus.COMPLETED,
            amount: original.amount,
            fromWalletId: original.toWalletId,
            toWalletId: original.fromWalletId,
            originalTransactionId: original.id,
            description: `Reversal of transfer ${original.id}`,
          },
        });

        balance = updatedSender.balance;
      }

      return { reversal, balance };
    });

    return {
      transaction: this.toTransactionDetail(result.reversal, wallet.id, null),
      balance: result.balance.toFixed(2),
    };
  }

  async list(userId: string) {
    const wallet = await this.requireWallet(userId);

    const records = await this.prisma.transaction.findMany({
      where: {
        OR: [{ fromWalletId: wallet.id }, { toWalletId: wallet.id }],
      },
      include: {
        fromWallet: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
        toWallet: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return records.map((record) => this.toHistoryItem(record, wallet.id));
  }

  private toDecimal(value: number): Prisma.Decimal {
    if (value <= 0) {
      throw new BadRequestException('Amount must be greater than zero');
    }
    return new Prisma.Decimal(value);
  }

  private async requireWallet(userId: string): Promise<{ id: string }> {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    return wallet;
  }

  private assertCanReverse(
    walletId: string,
    transaction: {
      type: TransactionType;
      status: TransactionStatus;
      fromWalletId: string | null;
      toWalletId: string | null;
    },
  ): void {
    if (transaction.type === TransactionType.REVERSAL) {
      throw new BadRequestException('Reversal transactions cannot be reversed');
    }

    if (transaction.status === TransactionStatus.REVERSED) {
      throw new BadRequestException('Transaction already reversed');
    }

    const isDepositOwner =
      transaction.type === TransactionType.DEPOSIT &&
      transaction.toWalletId === walletId;

    const isTransferSender =
      transaction.type === TransactionType.TRANSFER &&
      transaction.fromWalletId === walletId;

    if (!isDepositOwner && !isTransferSender) {
      throw new BadRequestException(
        'You can only reverse transactions you originated',
      );
    }
  }

  private canUserReverse(
    walletId: string,
    transaction: {
      type: TransactionType;
      status: TransactionStatus;
      fromWalletId: string | null;
      toWalletId: string | null;
    },
  ): boolean {
    if (transaction.status !== TransactionStatus.COMPLETED) {
      return false;
    }

    if (transaction.type === TransactionType.DEPOSIT) {
      return transaction.toWalletId === walletId;
    }

    if (transaction.type === TransactionType.TRANSFER) {
      return transaction.fromWalletId === walletId;
    }

    return false;
  }

  private resolveDirection(
    walletId: string,
    transaction: {
      type: TransactionType;
      fromWalletId: string | null;
      toWalletId: string | null;
    },
  ): TransactionDirection {
    if (
      transaction.toWalletId === walletId &&
      transaction.fromWalletId !== walletId
    ) {
      return 'IN';
    }

    if (
      transaction.fromWalletId === walletId &&
      transaction.toWalletId !== walletId
    ) {
      return 'OUT';
    }

    if (
      transaction.fromWalletId === walletId &&
      transaction.toWalletId === walletId
    ) {
      return 'NEUTRAL';
    }

    return 'NEUTRAL';
  }

  private resolveCounterparty(
    walletId: string,
    record: {
      type: TransactionType;
      fromWalletId: string | null;
      toWalletId: string | null;
      fromWallet: { user: { name: string; email: string } } | null;
      toWallet: { user: { name: string; email: string } } | null;
    },
  ): { name: string | null; email: string | null } {
    if (record.type === TransactionType.TRANSFER) {
      if (record.fromWalletId === walletId) {
        return {
          name: record.toWallet?.user.name ?? null,
          email: record.toWallet?.user.email ?? null,
        };
      }
      return {
        name: record.fromWallet?.user.name ?? null,
        email: record.fromWallet?.user.email ?? null,
      };
    }

    return { name: null, email: null };
  }

  private toTransactionDetail(
    transaction: {
      id: string;
      type: TransactionType;
      status: TransactionStatus;
      amount: Prisma.Decimal;
      fromWalletId: string | null;
      toWalletId: string | null;
      originalTransactionId: string | null;
      description: string | null;
      createdAt: Date;
      reversedAt: Date | null;
    },
    walletId: string,
    counterparty: { name: string; email: string } | null,
  ) {
    return {
      id: transaction.id,
      type: transaction.type,
      status: transaction.status,
      amount: transaction.amount.toFixed(2),
      direction: this.resolveDirection(walletId, transaction),
      description: transaction.description,
      counterpartyName: counterparty?.name ?? null,
      counterpartyEmail: counterparty?.email ?? null,
      createdAt: transaction.createdAt,
      reversedAt: transaction.reversedAt,
      canReverse: this.canUserReverse(walletId, transaction),
      originalTransactionId: transaction.originalTransactionId,
    };
  }

  private toHistoryItem(
    record: {
      id: string;
      type: TransactionType;
      status: TransactionStatus;
      amount: Prisma.Decimal;
      fromWalletId: string | null;
      toWalletId: string | null;
      originalTransactionId: string | null;
      description: string | null;
      createdAt: Date;
      reversedAt: Date | null;
      fromWallet: { user: { name: string; email: string } } | null;
      toWallet: { user: { name: string; email: string } } | null;
    },
    walletId: string,
  ) {
    const counterparty = this.resolveCounterparty(walletId, record);

    return {
      id: record.id,
      type: record.type,
      status: record.status,
      amount: record.amount.toFixed(2),
      direction: this.resolveDirection(walletId, record),
      description: record.description,
      counterpartyName: counterparty.name,
      counterpartyEmail: counterparty.email,
      createdAt: record.createdAt,
      reversedAt: record.reversedAt,
      canReverse: this.canUserReverse(walletId, record),
      originalTransactionId: record.originalTransactionId,
    };
  }
}
