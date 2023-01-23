import { BigNumber } from "ethers";
import { useNamedAccounts } from "@popcorn/components/lib/utils";
import { Pop } from "../../types";
import { useContractRead } from "wagmi";
/**
 * useClaimableBalance returns the claimable balance a user has across all escrow records
 */
export const useClaimableBalance: Pop.Hook<BigNumber> = ({ chainId, address, account, enabled }: Pop.StdProps) => {
  const [metadata] = useNamedAccounts(chainId as any, (!!address && [address]) || []);
  const _apyResolver = metadata?.apyResolver === "synthetix";

  const _enabled =
    typeof enabled === "boolean"
      ? !!enabled && !!account && !!address && !!chainId && _apyResolver
      : !!account && !!address && !!chainId && _apyResolver;

  return useContractRead({
    enabled: _enabled,
    scopeKey: `staking:synthetix:claimable:${chainId}:${address}:${account}`,
    cacheOnBlock: true,
    address: (!!address && address) || "",
    chainId: Number(chainId),
    abi: ["function earned(address) external view returns (uint256)"],
    functionName: "earned(address)",
    args: [account],
  }) as Pop.HookResult<BigNumber>;
};
