export type TransactionType = "DEPOSIT" | "TRANSFER" | "REVERSAL";
export type TransactionStatus = "COMPLETED" | "REVERSED";
export type TransactionDirection = "IN" | "OUT" | "NEUTRAL";

export type Transaction = {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: string;
  direction: TransactionDirection;
  description: string | null;
  counterpartyName: string | null;
  counterpartyEmail: string | null;
  createdAt: string;
  reversedAt: string | null;
  canReverse: boolean;
  originalTransactionId: string | null;
};

export type DepositPayload = {
  amount: number;
};

export type TransferPayload = {
  receiverEmail: string;
  amount: number;
};

export type TransactionMutationResponse = {
  transaction: Transaction;
  balance: string;
};
