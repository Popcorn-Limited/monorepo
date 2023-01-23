import { ChainId } from "@popcorn/utils";
import { Token } from "@popcorn/utils/types";
import { BigNumber } from "ethers";
import { useCallback } from "react";
import { useDeployment } from "@popcorn/app/hooks/useDeployment";

export function useAdjustDepositDecimals(chainId: ChainId): (depositAmount: BigNumber, token: Token) => BigNumber {
  const { usdc, usdt } = useDeployment(chainId);
  return useCallback(
    (depositAmount: BigNumber, token: Token) =>
      [usdc, usdt].includes(token.address) ? depositAmount.div(BigNumber.from(1e12)) : depositAmount,
    [usdc, usdt],
  );
}
