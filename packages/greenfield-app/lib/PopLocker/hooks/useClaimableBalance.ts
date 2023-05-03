import { constants } from "ethers";
import { useNamedAccounts } from "@popcorn/greenfield-app/lib/utils";
import { BigNumberWithFormatted, Pop } from "../../types";
import { Address, useContractRead } from "wagmi";
import { formatAndRoundBigNumber } from "@popcorn/greenfield-app/lib/utils";

export const useClaimableBalance: Pop.Hook<BigNumberWithFormatted> = ({
  chainId,
  address,
  account,
  enabled,
}: Pop.StdProps) => {
  const [metadata] = useNamedAccounts(chainId as any, (!!address && [address]) || []);
  const _apyResolver = metadata?.apyResolver === "convex";

  const _enabled =
    typeof enabled === "boolean"
      ? !!enabled && !!account && !!address && !!chainId && _apyResolver
      : !!account && !!address && !!chainId && _apyResolver;

  const result = useContractRead({
    enabled: _enabled,
    scopeKey: `staking:convex:claimable:${chainId}:${address}:${account}`,
    address: (!!address && address) || "",
    chainId: Number(chainId),
    abi: [
      {
        inputs: [
          {
            internalType: "address",
            name: "_account",
            type: "address",
          },
        ],
        name: "claimableRewards",
        outputs: [
          {
            components: [
              {
                internalType: "address",
                name: "token",
                type: "address",
              },
              {
                internalType: "uint256",
                name: "amount",
                type: "uint256",
              },
            ],
            internalType: "struct PopLocker.EarnedData[]",
            name: "userRewards",
            type: "tuple[]",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
    ],
    functionName: "claimableRewards",
    args: [account as Address],
  });
  return {
    ...result,
    data: result?.data
      ? {
          value: result?.data[0].amount,
          formatted: formatAndRoundBigNumber(result.data[0].amount, 18),
        }
      : {
          value: constants.Zero,
          formatted: "0",
        },
  } as unknown as Pop.HookResult<BigNumberWithFormatted>;
};
