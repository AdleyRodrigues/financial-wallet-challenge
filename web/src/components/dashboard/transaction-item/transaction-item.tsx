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
  descriptionRowStyles,
  descriptionStyles,
  getAmountStyles,
  listItemStyles,
  typeIconStyles,
} from "@/components/dashboard/transaction-item/transaction-item.styles";
import {
  formatTransactionDate,
  getTransactionDescription,
  STATUS_LABELS,
  TYPE_LABELS,
} from "@/components/dashboard/transaction-item/transaction-item.utils";
import { TransactionTypeIcon } from "@/components/dashboard/transaction-item/transaction-type-icon";
import { Button } from "@/components/ui/button/button";
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
          {transaction.status === "REVERSED" ? (
            <Chip
              label={STATUS_LABELS[transaction.status]}
              size="small"
              color="warning"
              variant="outlined"
            />
          ) : null}
        </Stack>

        <Stack direction="row" spacing={1} sx={descriptionRowStyles}>
          <TransactionTypeIcon
            transaction={transaction}
            fontSize="small"
            sx={typeIconStyles}
            aria-hidden
          />
          <Typography sx={descriptionStyles}>
            {getTransactionDescription(transaction)}
          </Typography>
        </Stack>
        {transaction.counterpartyEmail ? (
          <Typography variant="body2" color="text.secondary" sx={counterpartyStyles}>
            {transaction.counterpartyEmail}
          </Typography>
        ) : null}
        <Typography variant="caption" color="text.secondary" sx={dateStyles}>
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
            loadingLabel="Revertendo..."
            onClick={() => onReverseRequest(transaction.id)}
          >
            Reverter
          </Button>
        ) : null}
      </Stack>
    </ListItem>
  );
}
