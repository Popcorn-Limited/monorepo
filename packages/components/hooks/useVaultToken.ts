import { useToken } from "wagmi";
import useVaultTokenAddress from "./useVaultTokenAddress";

function useVaultToken(vaultAddress: string, chainId?: any) {
  const { data: vaultTokenAddrr } = useVaultTokenAddress(vaultAddress, chainId);
  return useToken({
    address: vaultTokenAddrr as any,
    chainId,
  });
}

export default useVaultToken;
