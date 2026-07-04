"use client";

import { FormEvent, useState } from "react";
import { ApiError } from "@/lib/api";
import { API_ERROR_MESSAGES } from "@/lib/error-catalog";
import { parsePositiveAmount } from "@/lib/form";
import { transactionsService } from "@/services/transactions-service";

type UseDepositFormOptions = {
  onSuccess: (balance: string) => void;
};

export function useDepositForm({ onSuccess }: UseDepositFormOptions) {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const parsedAmount = parsePositiveAmount(amount);

    if (parsedAmount === null) {
      setError(API_ERROR_MESSAGES.validation.invalidAmount);
      return;
    }

    setLoading(true);

    try {
      const result = await transactionsService.deposit({ amount: parsedAmount });
      setSuccess(API_ERROR_MESSAGES.feedback.depositSuccess);
      setAmount("");
      onSuccess(result.balance);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(API_ERROR_MESSAGES.feedback.depositFailed);
      }
    } finally {
      setLoading(false);
    }
  }

  return {
    amount,
    error,
    success,
    loading,
    setAmount,
    handleSubmit,
  };
}
