import { useToken } from "wagmi";
import useVaultTokenAddress from "./useVaultTokenAddress";
import { useNamedAccounts } from "@popcorn/components/lib/utils";

function useVaultToken(vaultAddress: string, chainId?: any) {
  const { data: vaultTokenAddr } = useVaultTokenAddress(vaultAddress, chainId);
  const [asset] = useNamedAccounts(chainId as any, vaultTokenAddr ? [vaultTokenAddr] : []);

  return useToken({
    address: vaultTokenAddr as any,
    chainId,
  });
}

export default useVaultToken;
