import { useNamedAccounts } from "@popcorn/greenfield-app/lib/utils";
import { Pop } from "../../types";
import { useContractRead } from "wagmi";
/**
 * useClaimableBalance returns the claimable token for a staking contract
 */
export const useClaimableToken: Pop.Hook<string> = ({ chainId, address, enabled }: Pop.StdProps) => {
  const [metadata] = useNamedAccounts(chainId as any, (!!address && [address]) || []);
  const isClaimable = !!metadata?.claimableTokenAdapter;

  const _enabled =
    typeof enabled === "boolean"
      ? !!enabled && !!address && !!chainId && !!isClaimable
      : !!address && !!chainId && !!isClaimable;

  return useContractRead({
    enabled: _enabled,
    scopeKey: `claimableToken:${chainId}:${address}`,
    address,
    chainId: Number(chainId),
    abi: metadata?.claimableTokenAdapter?.tokenFunctionAbi,
    functionName: metadata?.claimableTokenAdapter?.tokenFunction,
  }) as Pop.HookResult<string>;
};
