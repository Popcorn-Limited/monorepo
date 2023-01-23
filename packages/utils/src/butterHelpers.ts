import { BigNumber, constants } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { AccountBatch, HotSwapParameter, Token } from "./types";

export const isButterSupportedOnCurrentNetwork = (chainId: number) => {
  const butterSupportedChains = [1, 31337, 1337];
  return butterSupportedChains.includes(chainId);
};

export function prepareHotSwap(batches: AccountBatch[], depositAmount: BigNumber): HotSwapParameter {
  let cumulatedBatchAmounts = constants.Zero;
  const batchIds: string[] = [];
  const amounts: BigNumber[] = [];
  batches.forEach((batch) => {
    if (cumulatedBatchAmounts < depositAmount) {
      const missingAmount = depositAmount.sub(cumulatedBatchAmounts);
      const amountOfBatch = batch.accountClaimableTokenBalance.gt(missingAmount)
        ? missingAmount
        : batch.accountClaimableTokenBalance;
      cumulatedBatchAmounts = cumulatedBatchAmounts.add(amountOfBatch);
      const shareValue = batch.accountClaimableTokenBalance.mul(parseEther("1")).div(batch.accountSuppliedTokenBalance);

      batchIds.push(batch.batchId);
      amounts.push(
        amountOfBatch.eq(batch.accountClaimableTokenBalance)
          ? batch.accountSuppliedTokenBalance
          : amountOfBatch.mul(parseEther("1")).div(shareValue),
      );
    }
  });
  return { batchIds: batchIds, amounts: amounts };
}

export function getIndexForToken(token: Token) {
  switch (token.symbol) {
    case "DAI":
      return 0;
    case "USDC":
      return 1;
    case "USDT":
      return 2;
  }
}

export const getMinZapAmount = (
  depositAmount: BigNumber,
  slippage: number,
  virtualPrice: BigNumber,
  inputDecimals = 18,
  outputDecimals = 18,
): BigNumber => {
  let depositAmountInOutputDecimals: BigNumber;
  // Raise or lower the mintAmount based on the difference in decimals between inputToken/outputToken
  const difDecimals = inputDecimals - outputDecimals;
  if (difDecimals === 0) {
    depositAmountInOutputDecimals = depositAmount;
  } else if (difDecimals > 0) {
    depositAmountInOutputDecimals = depositAmount.div(BigNumber.from(10).pow(difDecimals));
  } else {
    depositAmountInOutputDecimals = depositAmount.mul(BigNumber.from(10).pow(Math.abs(difDecimals)));
  }

  const depositValue = depositAmountInOutputDecimals.mul(parseEther("1")).div(virtualPrice);
  const delta = depositValue.mul(percentageToBps(slippage)).div(10000);
  return depositValue.sub(delta);
};

/* 
getMinZapAmount Examples for better understanding of the Math

Example Butter:
USDC Amount: 1 234 000 000
Slippage %: 1
virtual Price (this is the price of 3crv): 1 022 038 085 531 744 328
Input decimals: 6
Output Decimals: 18

depositAmountInOutputDecimals:
1 234 000 000 000 000 000 000
minMintAmount:
1 195 317 490 897 999 856 879

This returns an amount of 3CRV in base 18 that is required from the Zapper

Example 3x:
DAI Amount:1 234 000 000 000 000 000 000 
 18 6
Slippage %: 1
virtual Price (assumed price of USDC): 1 000 000 000 000 000 000
Input decimals: 18
Output Decimals: 6

depositAmountInOutputDecimals:
1 234 000 000
minMintAmount:
1 221 660 000

This returns an amount of USDC in base 6 that is required from the Zapper
*/

export const percentageToBps = (input: number): number => input * 100;
