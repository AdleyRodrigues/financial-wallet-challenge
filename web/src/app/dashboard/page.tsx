"use client";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import { useDashboardPage } from "@/app/dashboard/use-dashboard-page";
import {
  loadingContainerStyles,
  mainStyles,
} from "@/app/dashboard/dashboard-page.styles";
import { BalanceCard } from "@/components/dashboard/balance-card";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DepositForm } from "@/components/dashboard/deposit-form";
import { ReverseConfirmationDialog } from "@/components/dashboard/reverse-confirmation-dialog";
import { TransactionHistory } from "@/components/dashboard/transaction-history";
import { TransferForm } from "@/components/dashboard/transfer-form";
import { Alert } from "@/components/ui/alert";
import { Loading } from "@/components/ui/loading";

export default function DashboardPage() {
  const {
    loading,
    user,
    balance,
    transactions,
    transactionsLoading,
    loggingOut,
    feedback,
    pendingReverseId,
    reversingId,
    handleBalanceUpdate,
    handleLogout,
    handleReverseRequest,
    handleCloseDialog,
    handleConfirmReverse,
  } = useDashboardPage();

  if (loading || !user) {
    return (
      <Box component="main" sx={loadingContainerStyles}>
        <Loading label="Carregando sua carteira..." />
      </Box>
    );
  }

  return (
    <Box component="main" sx={mainStyles}>
      <Container maxWidth="lg">
        <Stack spacing={4}>
          <DashboardHeader
            user={user}
            onLogout={handleLogout}
            loggingOut={loggingOut}
          />

          {feedback ? (
            <Alert variant={feedback.type === "success" ? "success" : "error"}>
              {feedback.message}
            </Alert>
          ) : null}

          <BalanceCard balance={balance} />

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 6 }}>
              <DepositForm onSuccess={handleBalanceUpdate} />
            </Grid>
            <Grid size={{ xs: 12, lg: 6 }}>
              <TransferForm onSuccess={handleBalanceUpdate} />
            </Grid>
          </Grid>

          <TransactionHistory
            transactions={transactions}
            loading={transactionsLoading}
            reversingId={reversingId}
            onReverseRequest={handleReverseRequest}
          />
        </Stack>
      </Container>

      <ReverseConfirmationDialog
        open={Boolean(pendingReverseId)}
        loading={Boolean(reversingId)}
        onClose={handleCloseDialog}
        onConfirm={handleConfirmReverse}
      />
    </Box>
  );
}
