import { Address, useContractRead } from "wagmi";
import { Pop } from "../../types";

export const useStakingToken: Pop.Hook<Address> = ({ chainId, address }) => {
  return useContractRead({
    address,
    chainId: Number(chainId),
    keepPreviousData: true,
    abi: ["function stakingToken() view returns (address)"],
    functionName: "stakingToken",
    scopeKey: `stakingToken:${chainId}:${address}`,
    enabled: Boolean(chainId && address),
  }) as Pop.HookResult<Address>;
};
