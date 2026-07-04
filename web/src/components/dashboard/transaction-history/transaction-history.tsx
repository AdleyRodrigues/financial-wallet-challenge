"use client";

import History from "@mui/icons-material/History";
import ReceiptLong from "@mui/icons-material/ReceiptLong";
import List from "@mui/material/List";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {
  emptyStateIconStyles,
  emptyStateStyles,
  emptyStateTitleStyles,
} from "@/components/dashboard/transaction-history/transaction-history.styles";
import { TransactionItem } from "@/components/dashboard/transaction-item/transaction-item";
import { Card } from "@/components/ui/card/card";
import { Loading } from "@/components/ui/loading/loading";
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
      titleIcon={<History fontSize="small" />}
      description="Acompanhe depósitos, transferências e reversões da sua carteira."
    >
      {loading ? (
        <Loading label="Carregando transações..." />
      ) : transactions.length === 0 ? (
        <Stack sx={emptyStateStyles}>
          <ReceiptLong sx={emptyStateIconStyles} fontSize="large" aria-hidden />
          <Typography variant="body2" color="text.secondary" sx={emptyStateTitleStyles}>
            Nenhuma transação ainda.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Faça um depósito ou uma transferência para começar.
          </Typography>
        </Stack>
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
