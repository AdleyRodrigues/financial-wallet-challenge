import { api } from "@/lib/api";
import type { Wallet } from "@/types/wallet";

export const walletService = {
  getWallet() {
    return api<Wallet>("/wallet");
  },
};
