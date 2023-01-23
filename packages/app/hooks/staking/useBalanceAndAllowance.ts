import { isBigNumberish } from "@ethersproject/bignumber/lib/bignumber";
import { ChainId } from "@popcorn/utils";
import { BigNumber, constants } from "ethers";
import useTokenAllowance from "@popcorn/app/hooks/tokens/useTokenAllowance";
import useTokenBalance from "@popcorn/app/hooks/tokens/useTokenBalance";
import { useMemo } from "react";

export default function useBalanceAndAllowance(
  tokenAddress: string,
  account: string,
  spender: string,
  chainId: ChainId,
): { balance: BigNumber; allowance: BigNumber; revalidate: Function } {
  const {
    data: balance,
    mutate: revalidateBalance,
    isValidating: balanceIsRevalidating,
  } = useTokenBalance(tokenAddress, account, chainId);
  const {
    data: allowance,
    mutate: revalidateAllowance,
    isValidating: allowanceIsRevalidating,
  } = useTokenAllowance(tokenAddress, chainId, account, spender);

  const revalidate = () => {
    revalidateAllowance();
    revalidateBalance();
  };

  const response = useMemo(() => {
    if (isBigNumberish(balance) && isBigNumberish(allowance)) {
      return { balance, allowance, revalidate, isValidating: balanceIsRevalidating || allowanceIsRevalidating };
    }
    return {
      balance: constants.Zero,
      allowance: constants.Zero,
      revalidate,
      isValidating: balanceIsRevalidating || allowanceIsRevalidating,
    };
  }, [balance, allowance, new Date()]);

  return response;
}
