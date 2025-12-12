import { walletEngine } from "@/src/services/walletEngine";

export async function adminLoadBalance(params) {
  return walletEngine.adminLoadBalance(params);
}
