import { BigNumber } from "ethers";
import { useNamedAccounts } from "@popcorn/components/lib/utils";
import { Pop } from "../../types";
import { useContractReads } from "wagmi";

export const useClaimableBalances: Pop.Hook<BigNumber[]> = ({
  chainId,
  address,
  account,
  enabled,
  escrowIds,
}: { escrowIds?: string[] } & Pop.StdProps) => {
  const [metadata] = useNamedAccounts(chainId as any, (!!address && [address]) || []);

  const _enabled = enabled
    ? true
    : metadata?.balanceResolver === "escrowBalance" && !!account && !!address && !!chainId;

  return useContractReads({
    enabled: _enabled,
    scopeKey: `escrow:claimable:${chainId}:${address}:${account}`,
    cacheOnBlock: true,
    contracts: escrowIds?.map((escrowId) => ({
      address: (!!address && address) || "",
      chainId: Number(chainId),
      abi: ["function getClaimableAmount(bytes32) external view returns (uint256)"],
      functionName: "getClaimableAmount",
      args: [escrowId],
    })),
  }) as Pop.HookResult<BigNumber[]>;
};
