import type { Transaction } from "@/types/transaction";

export const TYPE_LABELS: Record<Transaction["type"], string> = {
  DEPOSIT: "Depósito",
  TRANSFER: "Transferência",
  REVERSAL: "Reversão",
};

export const STATUS_LABELS: Record<Transaction["status"], string> = {
  COMPLETED: "Concluída",
  REVERSED: "Revertida",
};

export const DIRECTION_LABELS: Record<Transaction["direction"], string> = {
  IN: "Entrada",
  OUT: "Saída",
  NEUTRAL: "Neutro",
};

export function formatTransactionDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function getTransactionDescription(transaction: Transaction) {
  if (transaction.type === "REVERSAL") {
    return "Reversão de operação anterior";
  }

  if (transaction.description?.startsWith("Reversal of deposit")) {
    return "Reversão de depósito";
  }

  if (transaction.description?.startsWith("Reversal of transfer")) {
    return "Reversão de transferência";
  }

  if (transaction.description) {
    return transaction.description;
  }

  if (transaction.type === "DEPOSIT") {
    return "Depósito na carteira";
  }

  if (transaction.counterpartyName) {
    return transaction.direction === "OUT"
      ? `Para ${transaction.counterpartyName}`
      : `De ${transaction.counterpartyName}`;
  }

  return "Transferência entre carteiras";
}
