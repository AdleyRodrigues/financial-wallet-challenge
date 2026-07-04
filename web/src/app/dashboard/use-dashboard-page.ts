"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useTransactionActions } from "@/components/dashboard/transaction-actions/use-transaction-actions";
import { ApiError } from "@/lib/api";
import { API_ERROR_MESSAGES } from "@/lib/error-catalog";
import { authService } from "@/services/auth-service";
import { transactionsService } from "@/services/transactions-service";
import { walletService } from "@/services/wallet-service";
import type { User } from "@/types/auth";
import type { Transaction } from "@/types/transaction";

type Feedback = {
  type: "success" | "error";
  message: string;
};

export function useDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [balance, setBalance] = useState("0.00");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const refreshTransactions = useCallback(async () => {
    setTransactionsLoading(true);
    try {
      const data = await transactionsService.list();
      setTransactions(data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.replace("/login");
        return;
      }
      setFeedback({
        type: "error",
        message: API_ERROR_MESSAGES.dashboard.refreshTransactionsFailed,
      });
    } finally {
      setTransactionsLoading(false);
    }
  }, [router]);

  const transactionActions = useTransactionActions({
    onBalanceUpdate: setBalance,
    onFeedback: setFeedback,
    onClearFeedback: () => setFeedback(null),
    refreshTransactions,
  });

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      try {
        const [{ user: currentUser }, wallet] = await Promise.all([
          authService.me(),
          walletService.getWallet(),
        ]);

        if (!active) {
          return;
        }

        setUser(currentUser);
        setBalance(wallet.balance);
        setLoading(false);

        setTransactionsLoading(true);
        const data = await transactionsService.list();
        if (active) {
          setTransactions(data);
        }
      } catch {
        if (active) {
          router.replace("/login");
        }
      } finally {
        if (active) {
          setTransactionsLoading(false);
        }
      }
    }

    void bootstrap();

    return () => {
      active = false;
    };
  }, [router]);

  async function handleBalanceUpdate(newBalance: string) {
    setBalance(newBalance);
    setFeedback(null);
    await refreshTransactions();
  }

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await authService.logout();
      setUser(null);
      setBalance("0.00");
      setTransactions([]);
      setFeedback(null);
      router.replace("/login");
      router.refresh();
    } catch {
      setFeedback({
        type: "error",
        message: API_ERROR_MESSAGES.dashboard.logoutFailed,
      });
    } finally {
      setLoggingOut(false);
    }
  }

  return {
    loading,
    user,
    balance,
    transactions,
    transactionsLoading,
    loggingOut,
    feedback,
    handleBalanceUpdate,
    handleLogout,
    ...transactionActions,
  };
}
