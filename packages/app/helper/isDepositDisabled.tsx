import { parseEther, parseUnits } from "@ethersproject/units";
import { SelectedToken, Token } from "@popcorn/utils/src/types";
import { BigNumber, constants } from "ethers";

function isBalanceInsufficient(depositAmount: BigNumber, inputTokenBalance: BigNumber): boolean {
  return depositAmount.gt(inputTokenBalance);
}
export function isDepositDisabled(
  totalSupply: BigNumber,
  mainToken: Token,
  selectedToken: SelectedToken,
  withdrawMode: boolean,
  depositAmount: BigNumber,
  useUnclaimedDeposits?: boolean,
  useTVLLimit?: boolean,
  disabled?: boolean,
): { disabled: boolean; errorMessage: string } {
  // Check TVL-Limit
  if (disabled) return;
  const tvl = totalSupply?.mul(mainToken?.price || constants.Zero).div(parseEther("1"));
  const tvlLimit = parseEther("1000000"); // 1m
  if (useTVLLimit && !withdrawMode && depositAmount?.add(tvl).gte(tvlLimit)) {
    return { disabled: true, errorMessage: "*Exceeds TVL-Limit" };
  }

  // Check min-deposit size
  if (
    withdrawMode &&
    !depositAmount.isZero() &&
    depositAmount
      .mul(selectedToken.input.price)
      .div(parseUnits("1", 18))
      .lt(parseUnits("99.9", selectedToken.input.decimals)) // Allow for slightly less than 100$ to account for short term oracle inaccuracies and to provide a better UX
  ) {
    return { disabled: true, errorMessage: "*100$ Minimum Deposit required" };
  }

  // Check balance
  if (useUnclaimedDeposits && isBalanceInsufficient(depositAmount, selectedToken.input.claimableBalance)) {
    return { disabled: true, errorMessage: "*Insufficient balance in unclaimed deposits" };
  }
  if (!selectedToken?.input?.balance || isBalanceInsufficient(depositAmount, selectedToken.input.balance)) {
    return { disabled: true, errorMessage: "*Insufficient balance" };
  }
  return { disabled: false, errorMessage: "" };
}
