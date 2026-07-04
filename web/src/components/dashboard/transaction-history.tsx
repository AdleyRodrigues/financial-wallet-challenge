"use client";

import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import { emptyStateStyles } from "@/components/dashboard/transaction-history.styles";
import { TransactionItem } from "@/components/dashboard/transaction-item";
import { Card } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import type { Transaction } from "@/types/transaction";

type TransactionHistoryProps = {
  transactions: Transaction[];
  loading: boolean;
  reversingId: string | null;
  onReverseRequest: (transactionId: string) => void;
};

export function TransactionHistory({
  transactions,
  loading,
  reversingId,
  onReverseRequest,
}: TransactionHistoryProps) {
  return (
    <Card
      title="Histórico"
      description="Acompanhe depósitos, transferências e reversões da sua carteira."
    >
      {loading ? (
        <Loading label="Carregando transações..." />
      ) : transactions.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={emptyStateStyles}>
          Nenhuma transação encontrada.
        </Typography>
      ) : (
        <List disablePadding>
          {transactions.map((transaction) => (
            <TransactionItem
              key={transaction.id}
              transaction={transaction}
              reversing={reversingId === transaction.id}
              onReverseRequest={onReverseRequest}
            />
          ))}
        </List>
      )}
    </Card>
  );
}
