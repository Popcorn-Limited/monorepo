import type { BigNumber } from "ethers/lib/ethers";
import { ChainId } from "@popcorn/utils";
import { formatUnits } from "ethers/lib/utils";
import useVariadicSum from "@popcorn/components/hooks/useVariadicSum";
import usePoolTVL from "@popcorn/components/hooks/usePoolTvl";
import useStakingTVL from "@popcorn/components/hooks/useStakingTVL";

const { Ethereum, Polygon, Optimism } = ChainId;

/**
 * Fetch staking and pool locked TVL from Ethereum, Polygon and Optimism.
 */
function TotalTVL({
  children,
  prependTVL,
}: {
  children: (tvl: { formatted: string; value: BigNumber }) => JSX.Element;
  /** 1e18 tvl value to be added for staking & pool tvl. Example: prepend threeX, butter balance. */
  prependTVL?: BigNumber;
}): JSX.Element {
  const { data: mainnetPoolTVL } = usePoolTVL(Ethereum);
  const { data: polygonPoolTVL } = usePoolTVL(Polygon);
  const { data: optimismPoolTVL } = usePoolTVL(Optimism);

  const { data: mainnetStakingTVL } = useStakingTVL(Ethereum);
  const { data: polygonStakingTVL } = useStakingTVL(Polygon);
  const { data: optimismStakingTVL } = useStakingTVL(Optimism);

  const tvl = useVariadicSum(
    mainnetPoolTVL,
    polygonPoolTVL,
    optimismPoolTVL,
    mainnetStakingTVL,
    polygonStakingTVL,
    optimismStakingTVL,
    prependTVL,
  );

  return children({
    formatted: numberFormatter.format(Number(formatUnits(tvl!))),
    value: tvl,
  });
}

const numberFormatter = new Intl.NumberFormat("en", {
  notation: "compact",
  style: "currency",
  currency: "USD",
});

export default TotalTVL;
