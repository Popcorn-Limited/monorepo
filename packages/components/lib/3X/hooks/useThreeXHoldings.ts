import { AccountBatch } from "@popcorn/utils/src/types";
import { useNamedAccounts } from "@popcorn/components/lib/utils";
import { usePrice } from "@popcorn/components/lib/Price";
import { useBalanceOf } from "@popcorn/components/lib/Erc20/hooks";
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

export const useThreeXHoldings: Pop.Hook<BigNumberWithFormatted> = ({ chainId, address, account }) => {
  const [threeX, threeXBatch] = useNamedAccounts(chainId as any, ["threeX", "threeXBatch"]);

  const { data: threeXBatches } = useThreeXBatches({ account, chainId, address: threeXBatch?.address });
  const { data: threeXPrice } = usePrice({ address: threeX?.address, account, chainId });
  const { data: threeXBalance } = useBalanceOf({ address: threeX?.address, account, chainId });

  if (threeXBatches?.claimableMintBatches) {
    const claimableBalance = getClaimableBalance(threeXBatches?.claimableMintBatches);
    const holdingValue = getHoldingValue(
      (threeXBalance?.value || constants.Zero).add(claimableBalance),
      threeXPrice?.value || constants.Zero,
    );
    return { data: { value: holdingValue, formatted: formatAndRoundBigNumber(holdingValue, 18) }, status: "success" };
  }

  return { data: { value: constants.Zero, formatted: "0" }, status: "success" };
};
