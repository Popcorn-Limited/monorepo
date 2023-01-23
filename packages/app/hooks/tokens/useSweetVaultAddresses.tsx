import { ChainId } from "@popcorn/utils";
import { useDeployment } from "@popcorn/app/hooks/useDeployment";

export default function useSweetVaultAddresses(chainId: ChainId) {
  const { sEthSweetVault } = useDeployment(chainId);
  return { sEthSweetVault };
}
