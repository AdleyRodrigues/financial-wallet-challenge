"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ApiError } from "@/lib/api";
import { API_ERROR_MESSAGES } from "@/lib/error-catalog";
import { transactionsService } from "@/services/transactions-service";

type Feedback = {
  type: "success" | "error";
  message: string;
};

type UseTransactionActionsOptions = {
  onBalanceUpdate: (balance: string) => void;
  onFeedback: (feedback: Feedback) => void;
  onClearFeedback: () => void;
  refreshTransactions: () => Promise<void>;
};

export function useTransactionActions({
  onBalanceUpdate,
  onFeedback,
  onClearFeedback,
  refreshTransactions,
}: UseTransactionActionsOptions) {
  const router = useRouter();
  const [pendingReverseId, setPendingReverseId] = useState<string | null>(null);
  const [reversingId, setReversingId] = useState<string | null>(null);

  function handleReverseRequest(transactionId: string) {
    setPendingReverseId(transactionId);
  }

  function handleCloseDialog() {
    if (!reversingId) {
      setPendingReverseId(null);
    }
  }

  async function handleConfirmReverse() {
    if (!pendingReverseId) {
      return;
    }

    const transactionId = pendingReverseId;
    onClearFeedback();
    setReversingId(transactionId);

    try {
      const result = await transactionsService.reverse(transactionId);
      onBalanceUpdate(result.balance);
      onFeedback({
        type: "success",
        message: API_ERROR_MESSAGES.feedback.reverseSuccess,
      });
      setPendingReverseId(null);
      await refreshTransactions();
    } catch (err) {
      if (err instanceof ApiError) {
        onFeedback({ type: "error", message: err.message });
        if (err.status === 401) {
          router.replace("/login");
        }
      } else {
        onFeedback({
          type: "error",
          message: API_ERROR_MESSAGES.feedback.reverseFailed,
        });
      }
    } finally {
      setReversingId(null);
    }
  }

  return {
    pendingReverseId,
    reversingId,
    handleReverseRequest,
    handleCloseDialog,
    handleConfirmReverse,
  };
}
