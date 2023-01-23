import { ChainId } from "@popcorn/utils";
import { useDeployment } from "@popcorn/app/hooks/useDeployment";

export default function useSetTokenAddresses(chainId: ChainId) {
  const { butter, threeX } = useDeployment(chainId);
  return { butter, threeX };
}
