import { ChainId } from "@popcorn/utils";
import { useDeployment } from "../useDeployment";

export default function useLPTokenAddresses(chainId: ChainId) {
  const { popUsdcArrakisVault, popUsdcLp } = useDeployment(chainId);
  return { popUsdcArrakisVault, popUsdcLp };
}
