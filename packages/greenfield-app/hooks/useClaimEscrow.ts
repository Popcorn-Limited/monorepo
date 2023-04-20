import { ConfigArgs } from "../../greenfield-app/types";
import { useContractWrite, usePrepareContractWrite } from "wagmi";
import { ChainId } from "@popcorn/utils";

export const useClaimEscrow = (escrowIds: string[], address: string, chainId: ChainId, wagmiConfig?: ConfigArgs) => {
  const { config } = usePrepareContractWrite({
    address,
    abi: ["function claimRewards(bytes32[]) external"],
    functionName: "claimRewards",
    args: [escrowIds],
    chainId: Number(chainId),
  });

  return useContractWrite({
    ...(wagmiConfig as any),
    ...config,
  });
};
