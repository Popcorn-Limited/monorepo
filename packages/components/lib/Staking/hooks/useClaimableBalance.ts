import { BigNumber, constants } from "ethers";
import { useNamedAccounts } from "@popcorn/components/lib/utils";
import { BigNumberWithFormatted, Pop } from "../../types";
import { Address, useContractRead } from "wagmi";
import { formatAndRoundBigNumber } from "@popcorn/utils";

export const useClaimableBalance: Pop.Hook<BigNumberWithFormatted> = ({
  chainId,
  address,
  account,
  enabled,
}: Pop.StdProps) => {
  const [metadata] = useNamedAccounts(chainId as any, (!!address && [address]) || []);
  const _apyResolver = ["synthetix", "convex"].includes(metadata?.apyResolver);

  const _enabled =
    typeof enabled === "boolean"
      ? !!enabled && !!account && !!address && !!chainId && _apyResolver
      : !!account && !!address && !!chainId && _apyResolver;

  if (metadata?.apyResolver === "synthetix") {
    const result = useContractRead({
      enabled: _enabled,
      scopeKey: `staking:synthetix:claimable:${chainId}:${address}:${account}`,
      cacheOnBlock: true,
      address: (!!address && address) || "",
      chainId: Number(chainId),
      abi: ["function earned(address) external view returns (uint256)"],
      functionName: "earned(address)",
      args: [account],
    }) as Pop.HookResult<BigNumber>;
    return {
      ...result,
      data: result?.data
        ? { value: result?.data, formatted: formatAndRoundBigNumber(result?.data, 18) }
        : { value: constants.Zero, formatted: "0" },
    } as unknown as Pop.HookResult<BigNumberWithFormatted>;
  } else {
    const result = useContractRead({
      enabled: _enabled,
      scopeKey: `staking:convex:claimable:${chainId}:${address}:${account}`,
      cacheOnBlock: true,
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
      data:
        result?.data && result?.data.length > 0
          ? { value: result?.data[0].amount, formatted: formatAndRoundBigNumber(result?.data[0].amount, 18) }
          : { value: constants.Zero, formatted: "0" },
    } as unknown as Pop.HookResult<BigNumberWithFormatted>;
  }
};
