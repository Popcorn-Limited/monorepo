import { constants } from "ethers";
import { ConfigArgs } from "lib/types";
import { ChainId } from "types";
import { useContractWrite, usePrepareContractWrite } from "wagmi";

export const useApprove = (asset: string, spender: string, chainId: ChainId, wagmiConfig?: ConfigArgs) => {
  const { config } = usePrepareContractWrite({
    address: asset,
    abi: ["function approve(address spender, uint256 amount) public"],
    functionName: "approve",
    args: [spender, constants.MaxUint256],
    chainId: Number(chainId),
  });

  return useContractWrite({
    ...(wagmiConfig as any),
    ...config,
  });
};
