import { ChainId } from "@popcorn/utils";
import { useDeployment } from "@popcorn/app/hooks/useDeployment";

export const useSweetVaults = (chainId: ChainId) => {
  const { sEthSweetVault } = useDeployment(chainId);
  return [sEthSweetVault];
};
