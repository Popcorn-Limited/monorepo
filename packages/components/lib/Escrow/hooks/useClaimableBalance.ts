import { BigNumber, constants } from "ethers";
import { useNamedAccounts } from "@popcorn/components/lib/utils";
import { formatAndRoundBigNumber } from "@popcorn/utils/src/formatBigNumber";
import { Pop, BigNumberWithFormatted } from "../../types";
import { useContractReads } from "wagmi";

const ZERO = constants.Zero;
/**
 * useClaimableBalance returns the claimable balance a user has across all escrow records
 */
export const useClaimableBalance: Pop.Hook<BigNumberWithFormatted> = ({
  chainId,
  address,
  account,
  enabled,
  escrowIds,
}: { escrowIds?: string[] } & Pop.StdProps) => {
  const [metadata] = useNamedAccounts(chainId as any, (!!address && [address]) || []);

  const _enabled =
    (typeof enabled === "boolean" ? enabled : metadata?.balanceResolver === "escrowBalance") &&
    !!account &&
    !!address &&
    !!chainId;

  const { data, status } = useContractReads({
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

  const value = data?.reduce((acc, curr) => acc.add(curr || 0), ZERO) || ZERO;
  return {
    data: data
      ? {
          value,
          formatted: data && formatAndRoundBigNumber(value as BigNumber, 18),
        }
      : {
          value: constants.Zero,
          formatted: "0",
        },
    status,
  } as Pop.HookResult<BigNumberWithFormatted>;
};
