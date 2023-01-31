import { Address, useContractRead } from "wagmi";
import { Pop } from "../../types";

export const useStakingToken: Pop.Hook<Address> = ({ chainId, address }) => {
  return useContractRead({
    address,
    chainId: Number(chainId),
    abi: ["function stakingToken() view returns (address)"],
    functionName: "stakingToken",
    args: [],
    cacheOnBlock: true,
    scopeKey: `stakingToken:${chainId}:${address}`,
    enabled: !!chainId && !!address,
  }) as Pop.HookResult<Address>;
};
