"use client";

import Stack from "@mui/material/Stack";
import { useTransferForm } from "@/components/dashboard/use-transfer-form";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

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
          type="number"
          slotProps={{ htmlInput: { min: 0.01, step: 0.01 } }}
          placeholder="0,00"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />

        <Button type="submit" variant="contained" fullWidth loading={loading}>
          Transferir
        </Button>
      </Stack>
    </Card>
  );
}
