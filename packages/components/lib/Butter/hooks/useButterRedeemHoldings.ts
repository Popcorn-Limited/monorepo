import { AccountBatch } from "@popcorn/utils/src/types";
import { useNamedAccounts } from "@popcorn/components/lib/utils";
import { usePrice } from "@popcorn/components/lib/Price";
import { useButterBatches } from "./useButterBatches";
import { useBalanceOf } from "@popcorn/components/lib/Erc20/hooks";
import { BigNumberWithFormatted, Pop } from "@popcorn/components/lib/types";
import { BigNumber, constants, ethers } from "ethers";
import { formatAndRoundBigNumber } from "@popcorn/utils";

function getClaimableBalance(claimableBatches: AccountBatch[]): BigNumber {
  return claimableBatches.reduce(
    (acc: BigNumber, batch: AccountBatch) => acc.add(batch.accountClaimableTokenBalance),
    ethers.constants.Zero,
  );
}

function getHoldingValue(tokenAmount: BigNumber, tokenPrice: BigNumber): BigNumber {
  tokenAmount = tokenAmount?.gt(constants.Zero) ? tokenAmount : constants.Zero;
  return tokenAmount.eq(constants.Zero) || tokenPrice?.eq(constants.Zero)
    ? constants.Zero
    : tokenAmount?.mul(tokenPrice ? tokenPrice : constants.Zero).div(constants.WeiPerEther) || constants.Zero;
}

export const useButterRedeemHoldings: Pop.Hook<BigNumberWithFormatted> = ({ chainId, address, account }) => {
  const [threeCrv, butter, butterBatch] = useNamedAccounts(chainId as any, ["threeCrv", "butter", "butterBatch"]);

  const { data: butterBatches } = useButterBatches({ account, chainId, address: butterBatch?.address });
  const { data: butterPrice } = usePrice({ address: threeCrv?.address, account, chainId });
  const { data: butterBalance } = useBalanceOf({ address: butter?.address, account, chainId });

  if (butterBatches?.claimableRedeemBatches) {
    const claimableRedeemBalance = getClaimableBalance(butterBatches?.claimableRedeemBatches);
    const holdingValue = getHoldingValue(
      (butterBalance?.value || constants.Zero).add(claimableRedeemBalance),
      butterPrice?.value || constants.Zero,
    );
    return { data: { value: holdingValue, formatted: formatAndRoundBigNumber(holdingValue, 18) }, status: "success" };
  }

  return { data: { value: constants.Zero, formatted: "0" }, status: "success" };
};
