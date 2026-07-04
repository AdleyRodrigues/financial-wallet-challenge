"use client";

import Send from "@mui/icons-material/Send";
import Stack from "@mui/material/Stack";
import { useTransferForm } from "@/components/dashboard/transfer-form/use-transfer-form";
import { Alert } from "@/components/ui/alert/alert";
import { Button } from "@/components/ui/button/button";
import { Card } from "@/components/ui/card/card";
import { Input } from "@/components/ui/input/input";

type TransferFormProps = {
  onSuccess: (balance: string) => void;
};

export function TransferForm({ onSuccess }: TransferFormProps) {
  const {
    receiverEmail,
    amount,
    error,
    success,
    loading,
    setReceiverEmail,
    setAmount,
    handleSubmit,
  } = useTransferForm({ onSuccess });

  return (
    <Card
      title="Transferir"
      titleIcon={<Send fontSize="small" />}
      description="Envie valores para outro usuário pelo e-mail cadastrado."
    >
      <Stack component="form" spacing={2} onSubmit={handleSubmit} noValidate>
        {error ? <Alert variant="error">{error}</Alert> : null}
        {success ? <Alert variant="success">{success}</Alert> : null}

        <Input
          label="E-mail do destinatário"
          name="receiverEmail"
          type="email"
          autoComplete="email"
          placeholder="destinatario@email.com"
          value={receiverEmail}
          onChange={(event) => setReceiverEmail(event.target.value)}
        />

        <Input
          label="Valor (R$)"
          name="amount"
          type="text"
          inputMode="decimal"
          autoComplete="off"
          placeholder="0,00"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          loading={loading}
          loadingLabel="Transferindo..."
        >
          Transferir
        </Button>
      </Stack>
    </Card>
  );
}
