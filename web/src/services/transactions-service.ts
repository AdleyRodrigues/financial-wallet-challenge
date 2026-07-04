import { api } from "@/lib/api";
import type {
  DepositPayload,
  Transaction,
  TransactionMutationResponse,
  TransferPayload,
} from "@/types/transaction";

export const transactionsService = {
  list() {
    return api<Transaction[]>("/transactions");
  },

  deposit(payload: DepositPayload) {
    return api<TransactionMutationResponse>("/transactions/deposit", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  transfer(payload: TransferPayload) {
    return api<TransactionMutationResponse>("/transactions/transfer", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  reverse(transactionId: string) {
    return api<TransactionMutationResponse>(
      `/transactions/${transactionId}/reverse`,
      {
        method: "POST",
      },
    );
  },
};
