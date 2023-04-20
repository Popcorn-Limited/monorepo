import type { ContractWriteArgs } from "@popcorn/greenfield-app/lib/types";
import { ChainId } from "@popcorn/greenfield-app/lib/utils";
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
