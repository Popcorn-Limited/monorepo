import { BigNumber } from "ethers";
import { ConfigArgs } from "lib/types";
import { ChainId } from "types";
import { useContractWrite, usePrepareContractWrite } from "wagmi";

export const useRedeemXPop = (address: string, amount: BigNumber, chainId: ChainId, wagmiConfig?: ConfigArgs) => {
  const { config } = usePrepareContractWrite({
    address,
    abi: ["function redeem(uint256 amount) external"],
    functionName: "redeem",
    args: [amount],
    chainId: Number(chainId),
  });

  return useContractWrite({
    ...(wagmiConfig as any),
    ...config,
  });
};
