import { useContractRead } from "wagmi";
import { BigNumber } from "ethers/lib/ethers";
import { formatAndRoundBigNumber } from "@popcorn/utils";
import { BigNumberWithFormatted, Pop } from "../../types";

export const useTotalAssets: Pop.Hook<BigNumberWithFormatted> = ({ chainId, address }) => {
  return useContractRead({
    address,
    chainId: Number(chainId),
    abi: ["function totalAssets() external view returns (uint256)"],
    functionName: "totalAssets",
    scopeKey: `totalAssets:${chainId}:${address}`,
    enabled: !!address && !!chainId,
    select: (data) => {
      return {
        value: (data as BigNumber) || BigNumber.from(0),
        formatted: formatAndRoundBigNumber(data as BigNumber, 18),
      };
    },
    watch: true
  }) as Pop.HookResult<BigNumberWithFormatted>;
};
