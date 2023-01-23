import { BigNumber } from "ethers";
import { useContractRead } from "wagmi";
import { formatAndRoundBigNumber } from "@popcorn/utils";
import { useNamedAccounts } from "../../utils";
import { BigNumberWithFormatted, Pop } from "../../types";

export const useBalanceOf: Pop.Hook<BigNumberWithFormatted> = ({ chainId, address, account }) => {
  const [metadata] = useNamedAccounts(chainId as any, (!!address && [address]) || []);
  const disabled = metadata?.balanceResolver == "escrowBalance";
  const enabled =
    typeof metadata?.balanceResolver !== "undefined"
      ? metadata.balanceResolver == "balanceOf" && !!account && !!address && !!chainId
      : !!account && !!address && !!chainId;

  const abi = metadata?.balanceOfAdapter?.functionAbi || ["function balanceOf(address) view returns (uint256)"];
  const functionName = metadata?.balanceOfAdapter?.functionName || "balanceOf";

  return useContractRead({
    address,
    chainId: Number(chainId),
    abi,
    functionName,
    args: (!!account && [account]) || [],
    cacheOnBlock: true,
    scopeKey: `balanceOf:${chainId}:${address}:${account}`,
    enabled: !disabled && enabled,
    select: (data) => {
      return {
        value: (data as BigNumber) || BigNumber.from(0),
        formatted: formatAndRoundBigNumber(data as BigNumber, 18),
      };
    },
  }) as Pop.HookResult<BigNumberWithFormatted>;
};
