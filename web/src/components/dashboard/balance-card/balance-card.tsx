"use client";

import AccountBalanceWallet from "@mui/icons-material/AccountBalanceWallet";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {
  balanceHintStyles,
  getBalanceAmountStyles,
  glowDecorationStyles,
  overlineStyles,
  paperStyles,
} from "@/components/dashboard/balance-card/balance-card.styles";
import { formatCurrency } from "@/lib/currency";

type BalanceCardProps = {
  balance: string;
};

export function BalanceCard({ balance }: BalanceCardProps) {
  const numericBalance = parseFloat(balance);
  const isNegative = !Number.isNaN(numericBalance) && numericBalance < 0;

  return (
    <Paper elevation={0} sx={paperStyles}>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
        <AccountBalanceWallet fontSize="small" color="primary" aria-hidden />
        <Typography variant="overline" color="text.secondary" sx={overlineStyles}>
          Saldo disponível
        </Typography>
      </Stack>
      <Typography
        variant="h3"
        component="p"
        sx={getBalanceAmountStyles(isNegative)}
      >
        {formatCurrency(balance)}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={balanceHintStyles}>
        Seu saldo é atualizado em tempo real após depósitos, transferências e
        reversões.
      </Typography>
      <Box sx={glowDecorationStyles} />
    </Paper>
  );
}
