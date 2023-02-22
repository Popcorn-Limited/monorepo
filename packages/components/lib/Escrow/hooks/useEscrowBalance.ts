import { constants, BigNumber } from "ethers";
import { useIsMounted, useNamedAccounts } from "@popcorn/components/lib/utils";
import { useContractRead } from "wagmi";
import { formatAndRoundBigNumber } from "@popcorn/utils/src/formatBigNumber";
import { Pop, BigNumberWithFormatted } from "../../types";

/**
 * useEscrowBalance returns the balance a user has in a given pop escrow contract
 */
export const useEscrowBalance: Pop.Hook<BigNumberWithFormatted> = ({
  chainId,
  address,
  account,
  enabled,
  escrowIds,
}: { escrowIds?: string[] } & Pop.StdProps) => {
  const isMounted = useIsMounted();

  const [metadata] = useNamedAccounts(chainId as any, (!!address && [address]) || []);

  const _enabled =
    (typeof enabled === "boolean" ? enabled : metadata?.balanceResolver === "escrowBalance") &&
    !!account &&
    !!address &&
    !!chainId &&
    !!isMounted.current;

  const { data, status } = useContractRead({
    abi: ABI,
    address,
    functionName: "getEscrows(bytes32[])",
    chainId: Number(chainId),
    enabled: _enabled,
    scopeKey: `getEscrows:${chainId}:${address}:${account}`,
    args: (!!_enabled && [escrowIds]) || undefined,
    select: (data) => {
      return (data as [BigNumber, BigNumber, BigNumber, BigNumber, BigNumber, string][]).reduce(
        (total, [start, lastUpdateTime, end, initialBalance, balance, account]) => {
          return total.add(balance);
        },
        constants.Zero,
      );
    },
  });

  return {
    data: data
      ? {
          value: data as BigNumber,
          formatted: formatAndRoundBigNumber(data as BigNumber, 18),
        }
      : {
          value: constants.Zero,
          formatted: "0",
        },
    status,
  } as Pop.HookResult<BigNumberWithFormatted>;
};

const ABI = [
  "function getEscrows(bytes32[] calldata) external view returns ((uint256, uint256, uint256, uint256, uint256, address)[])",
  "function getEscrowIdsByUser(address) external view returns (bytes32[])",
];
