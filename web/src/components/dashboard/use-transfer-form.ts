"use client";

import { FormEvent, useState } from "react";
import { ApiError } from "@/lib/api";
import { parsePositiveAmount } from "@/lib/form";
import { transactionsService } from "@/services/transactions-service";

type UseTransferFormOptions = {
  onSuccess: (balance: string) => void;
};

export function useTransferForm({ onSuccess }: UseTransferFormOptions) {
  const [receiverEmail, setReceiverEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const parsedAmount = parsePositiveAmount(amount);

    if (!receiverEmail.trim()) {
      setError("Informe o e-mail do destinatário.");
      return;
    }

    if (parsedAmount === null) {
      setError("Informe um valor maior que zero.");
      return;
    }

    setLoading(true);

    try {
      const result = await transactionsService.transfer({
        receiverEmail: receiverEmail.trim(),
        amount: parsedAmount,
      });
      setSuccess("Transferência realizada com sucesso.");
      setReceiverEmail("");
      setAmount("");
      onSuccess(result.balance);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Não foi possível realizar a transferência.");
      }
    } finally {
      setLoading(false);
    }
  }

  return {
    receiverEmail,
    amount,
    error,
    success,
    loading,
    setReceiverEmail,
    setAmount,
    handleSubmit,
  };
}
