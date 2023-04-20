import { useToken } from "wagmi";
import useVaultTokenAddress from "./useVaultTokenAddress";
import { useNamedAccounts } from "@popcorn/greenfield-app/lib/utils";

function useVaultToken(vaultAddress: string, chainId?: any) {
  const { data: vaultTokenAddr } = useVaultTokenAddress(vaultAddress, chainId);
  const [asset] = useNamedAccounts(chainId as any, vaultTokenAddr ? [vaultTokenAddr] : []);

  const result = useToken({
    address: vaultTokenAddr as any,
    chainId,
  });
  return {
    ...result, data: { ...result?.data, symbol: asset?.symbol || result?.data?.symbol, name: asset?.name || result?.data?.name }
  }
}

export default useVaultToken;
