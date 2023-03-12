import { useContractRead } from "wagmi";
import { BigNumber } from "ethers/lib/ethers";
import { formatAndRoundBigNumber } from "@popcorn/utils";
import { BigNumberWithFormatted, Pop } from "../../types";

export const useTotalSupply: Pop.Hook<BigNumberWithFormatted> = ({ chainId, address }) => {
  return useContractRead({
    address,
    chainId: Number(chainId),
    abi: ["function totalSupply() external view returns (uint256)"],
    functionName: "totalSupply",
    cacheOnBlock: true,
    scopeKey: `totalSupply:${chainId}:${address}`,
    enabled: !!address && !!chainId,
    select: (data) => {
      return {
        value: (data as BigNumber) || BigNumber.from(0),
        formatted: formatAndRoundBigNumber(data as BigNumber, 18),
      };
    },
  }) as Pop.HookResult<BigNumberWithFormatted>;
};
