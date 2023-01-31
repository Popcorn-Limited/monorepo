import { BigNumber } from "ethers";
import { useContractRead } from "wagmi";
import { formatAndRoundBigNumber } from "@popcorn/utils";
import { useNamedAccounts } from "../../utils";
import { BigNumberWithFormatted, Pop } from "../../types";

export const useTokenEmission: Pop.Hook<BigNumberWithFormatted> = ({ chainId, address }) => {
  const [metadata] = useNamedAccounts(chainId as any, (!!address && [address]) || []);
  const [pop] = useNamedAccounts(chainId.toString() as any, ["pop"]);

  const _enabled = !!address && !!chainId && ["synthetix", "convex"].includes(metadata?.apyResolver);

  return useContractRead({
    address,
    chainId: Number(chainId),
    abi: [
      metadata?.apyResolver === "synthetix"
        ? "function getRewardForDuration() view returns (uint256)"
        : "function getRewardForDuration(address token) view returns (uint256)",
    ],
    functionName: "getRewardForDuration",
    args: [metadata?.apyResolver === "synthetix" ? null : pop.address],
    cacheOnBlock: true,
    scopeKey: `getRewardForDuration:${chainId}:${address}`,
    enabled: _enabled,
    select: (data) => {
      const value = (data as BigNumber).isZero() ? BigNumber.from(0) : (data as BigNumber).div(7);
      return {
        value: value,
        formatted: formatAndRoundBigNumber(value, 18),
      };
    },
  }) as Pop.HookResult<BigNumberWithFormatted>;
};
