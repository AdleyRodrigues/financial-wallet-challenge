"use client";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import ListItem from "@mui/material/ListItem";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {
  actionsStackStyles,
  chipRowStyles,
  counterpartyStyles,
  dateStyles,
  descriptionStyles,
  getAmountStyles,
  listItemStyles,
} from "@/components/dashboard/transaction-item.styles";
import {
  DIRECTION_LABELS,
  formatTransactionDate,
  getTransactionDescription,
  STATUS_LABELS,
  TYPE_LABELS,
} from "@/components/dashboard/transaction-item.utils";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/currency";
import type { Transaction } from "@/types/transaction";

type TransactionItemProps = {
  transaction: Transaction;
  reversing: boolean;
  onReverseRequest: (transactionId: string) => void;
};

export function TransactionItem({
  transaction,
  reversing,
  onReverseRequest,
}: TransactionItemProps) {
  const isIncoming = transaction.direction === "IN";
  const isOutgoing = transaction.direction === "OUT";

  return (
    <ListItem disableGutters sx={listItemStyles}>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack spacing={1} sx={chipRowStyles}>
          <Chip label={TYPE_LABELS[transaction.type]} size="small" />
          <Chip
            label={STATUS_LABELS[transaction.status]}
            size="small"
            color={transaction.status === "COMPLETED" ? "success" : "warning"}
            variant="outlined"
          />
          <Chip
            label={DIRECTION_LABELS[transaction.direction]}
            size="small"
            variant="outlined"
          />
        </Stack>

        <Typography sx={descriptionStyles}>
          {getTransactionDescription(transaction)}
        </Typography>
        {transaction.counterpartyEmail ? (
          <Typography variant="body2" color="text.secondary" sx={counterpartyStyles}>
            {transaction.counterpartyEmail}
          </Typography>
        ) : null}
        <Typography variant="caption" color="text.disabled" sx={dateStyles}>
          {formatTransactionDate(transaction.createdAt)}
        </Typography>
      </Box>

      <Stack spacing={1} sx={actionsStackStyles}>
        <Typography variant="h6" sx={getAmountStyles(transaction.direction)}>
          {isIncoming ? "+" : isOutgoing ? "-" : ""}
          {formatCurrency(transaction.amount)}
        </Typography>

        {transaction.canReverse ? (
          <Button
            variant="outlined"
            color="error"
            size="small"
            loading={reversing}
            onClick={() => onReverseRequest(transaction.id)}
          >
            Reverter
          </Button>
        ) : null}
      </Stack>
    </ListItem>
  );
}
