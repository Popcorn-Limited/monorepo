import { BigNumber } from "ethers";
import { useAccount, useContractRead } from "wagmi";
import { formatAndRoundBigNumber } from "@popcorn/utils";
import { BigNumberWithFormatted, Pop } from "../../types";

export const useAllowance: Pop.Hook<BigNumberWithFormatted> = ({ address: target, account: spender, chainId }) => {
  const { address: account } = useAccount();
  const enabled = !!account && !!spender && !!target && !!chainId;

  return useContractRead({
    address: target,
    chainId: Number(chainId),
    abi: ["function allowance(address owner, address spender) view returns (uint256)"],
    functionName: "allowance",
    args: [account, spender],
    scopeKey: `allowance:${chainId}:${target}:${account}:${spender}`,
    enabled,
    select: (data) => {
      return {
        value: (data as BigNumber) || BigNumber.from(0),
        formatted: formatAndRoundBigNumber(data as BigNumber, 18),
      };
    },
  }) as Pop.HookResult<BigNumberWithFormatted>;
};
