import type { ContractWriteArgs } from "@popcorn/greenfield-app/lib/types";
import type { BigNumber } from "ethers";
import { ChainId } from "@popcorn/utils";
import { constants } from "ethers";
import { useContractWrite, usePrepareContractWrite } from "wagmi";

// TODO: remove hard-coded gas
// NOTE: Fails - out of gas from anvil local if lower that this
const GAS_LIMIT = constants.Zero.add(1000000);

const useMainAction = (
  address: string,
  functionName: string,
  abi,
  chainId: ChainId,
  args: any[],
  wagmiConfig?: ContractWriteArgs,
) => {
  const { config } = usePrepareContractWrite({
    address,
    abi,
    functionName,
    args,
    chainId: Number(chainId),
    overrides:
      chainId === ChainId.Localhost
        ? {
            gasLimit: GAS_LIMIT,
          }
        : {},
  });

  return useContractWrite({
    ...(wagmiConfig as any),
    ...config,
  });
};

export default useMainAction;
