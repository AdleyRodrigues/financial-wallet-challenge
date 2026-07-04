"use client";

import Savings from "@mui/icons-material/Savings";
import Stack from "@mui/material/Stack";
import { useDepositForm } from "@/components/dashboard/deposit-form/use-deposit-form";
import { Alert } from "@/components/ui/alert/alert";
import { Button } from "@/components/ui/button/button";
import { Card } from "@/components/ui/card/card";
import { Input } from "@/components/ui/input/input";

type DepositFormProps = {
  onSuccess: (balance: string) => void;
};

export function DepositForm({ onSuccess }: DepositFormProps) {
  const { amount, error, success, loading, setAmount, handleSubmit } =
    useDepositForm({ onSuccess });

  return (
    <Card
      title="Depositar"
      titleIcon={<Savings fontSize="small" />}
      description="Adicione fundos à sua carteira de forma instantânea."
    >
      <Stack component="form" spacing={2} onSubmit={handleSubmit} noValidate>
        {error ? <Alert variant="error">{error}</Alert> : null}
        {success ? <Alert variant="success">{success}</Alert> : null}

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
          loadingLabel="Depositando..."
        >
          Depositar
        </Button>
      </Stack>
    </Card>
  );
}
