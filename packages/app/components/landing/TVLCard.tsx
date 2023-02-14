import { ChainId } from "@popcorn/utils";
import TotalTVL from "@popcorn/components/lib/Contract/TotalTvl";
import { InfoIconWithTooltip } from "@popcorn/app/components/InfoIconWithTooltip";
import useSetTokenTVL from "@popcorn/app/hooks/set/useSetTokenTVL";
import useVariadicSum from "@popcorn/components/hooks/useVariadicSum";
import { useDeployment } from "@popcorn/app/hooks/useDeployment";

const { Ethereum } = ChainId;

export function TVLCard(): JSX.Element {
  const eth = useDeployment(Ethereum);
  const { data: butterTVL } = useSetTokenTVL(eth.butter, eth.butterBatch, Ethereum);
  const { data: threeXTVL } = useSetTokenTVL(eth.threeX, eth.threeXBatch, Ethereum);

  const prependedTVL = useVariadicSum(butterTVL, threeXTVL);

  return (
    <div className="col-span-5 md:col-span-12 rounded-lg border border-customLightGray p-5 md:py-7">
      <div className="flex items-center gap-2 md:gap-0 md:space-x-2 mb-1 md:mb-2">
        <p className="text-primaryLight leading-5 hidden md:block">Total Value Locked </p>
        <p className="text-primaryLight leading-5 md:hidden">TVL </p>
        <InfoIconWithTooltip
          classExtras=""
          id="hero-tvl"
          title="Total value locked (TVL)"
          content="Total value locked (TVL) is the amount of user funds deposited in popcorn products."
        />
      </div>
      <TotalTVL prependTVL={prependedTVL}>
        {({ formatted }) => <p className="text-primary text-xl md:text-4xl leading-5 md:leading-8">{formatted}</p>}
      </TotalTVL>
    </div>
  );
}
