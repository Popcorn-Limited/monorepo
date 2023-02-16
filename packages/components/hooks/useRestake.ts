import type { ContractWriteArgs } from "@popcorn/components/lib/types";
import type { ChainId } from "@popcorn/utils";
import { useContractWrite, usePrepareContractWrite } from "wagmi";

const useRestake = (restake: boolean, address: string, chainId: ChainId, wagmiConfig?: ContractWriteArgs) => {
  const { config } = usePrepareContractWrite({
    address,
    abi: ["function processExpiredLocks(bool _relock) external"],
    functionName: "processExpiredLocks",
    args: [restake],
    chainId: Number(chainId),
  });

  return useContractWrite({
    ...(wagmiConfig as any),
    ...config,
  });
};

export default useRestake;
