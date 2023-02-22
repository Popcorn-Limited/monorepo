import { AccountBatch } from "@popcorn/utils/src/types";
import { useNamedAccounts } from "@popcorn/components/lib/utils";
import { usePrice } from "@popcorn/components/lib/Price";
import { BigNumberWithFormatted, Pop } from "@popcorn/components/lib/types";
import { BigNumber, constants, ethers } from "ethers";
import { useThreeXBatches } from "./useThreeXBatches";
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

export const useThreeXRedeemHoldings: Pop.Hook<BigNumberWithFormatted> = ({ chainId, address, account }) => {
  const [usdc, threeXBatch] = useNamedAccounts(chainId as any, ["usdc", "threeXBatch"]);

  const { data: threeXBatches } = useThreeXBatches({ account, chainId, address: threeXBatch?.address });
  const { data: usdcPrice } = usePrice({ address: usdc?.address, account, chainId });

  if (threeXBatches?.claimableRedeemBatches) {
    const claimableBalance = getClaimableBalance(threeXBatches?.claimableRedeemBatches);
    const holdingValue = getHoldingValue(
      (claimableBalance || constants.Zero).add(claimableBalance).mul(BigNumber.from(1e12)),
      usdcPrice?.value || constants.Zero,
    );
    return { data: { value: holdingValue, formatted: formatAndRoundBigNumber(holdingValue, 18) }, status: "success" };
  }

  return { data: { value: constants.Zero, formatted: "0" }, status: "success" };
};
