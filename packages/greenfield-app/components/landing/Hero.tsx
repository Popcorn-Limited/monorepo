import SliderContainer from "@popcorn/greenfield-app/components/SliderContainer";
import { InfoIconWithTooltip } from "@popcorn/greenfield-app/components/InfoIconWithTooltip";
import { ConnectWallet } from "@popcorn/greenfield-app/components/ConnectWallet";
import useTvl from "@popcorn/greenfield-app/lib/Contract/hooks/useTvl";
import TotalTVL from "@popcorn/greenfield-app/lib/Contract/TotalTvl";
import { useNamedAccounts } from "@popcorn/greenfield-app/lib/utils";
import { ChainId } from "@popcorn/greenfield-app/lib/utils/connectors";
import { constants } from "ethers";
import { formatUnits } from "ethers/lib/utils.js";
import { useAccount } from "wagmi";
import useNetworth from "@popcorn/greenfield-app/hooks/useNetworth";

const formatter: Intl.NumberFormat = Intl.NumberFormat("en", {
  //@ts-ignore
  notation: "compact",
});

export default function Hero(): JSX.Element {
  const { address: account } = useAccount();
  const { totalNetWorth } = useNetworth();
  const [butter, threeX] = useNamedAccounts("1", ["butter", "threeX"]);
  const { data: butterTVL } = useTvl({ chainId: ChainId.Ethereum, address: butter.address });
  const { data: threeXTVL } = useTvl({ chainId: ChainId.Ethereum, address: threeX.address });


  return (
    <section className="grid grid-cols-12 md:gap-8">
      <div className="col-span-12 md:col-span-3">
        <div className="grid grid-cols-12 w-full gap-4 md:gap-0">
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
            <TotalTVL
              prependTVL={constants.Zero.add(butterTVL?.value || constants.Zero).add(threeXTVL.value || constants.Zero)}
            >
              {({ formatted }) => (
                <p className="text-primary text-xl md:text-4xl leading-5 md:leading-8">{formatted}</p>
              )}
            </TotalTVL>
          </div>
          <div
            className={`col-span-7 md:col-span-12 rounded-lg border border-customLightGray p-5 md:py-7 md:mt-6 ${!!account ? "" : "hidden"
              }`}
          >
            <div className="flex items-center gap-2 md:gap-0 md:space-x-2 mb-1 md:mb-2">
              <p className="text-primaryLight leading-5 hidden md:block">My Net Worth</p>
              <p className="text-primaryLight leading-5 md:hidden">MNW</p>
              <InfoIconWithTooltip
                classExtras=""
                id="hero-mnw"
                title="Net Worth"
                content="This value aggregates your Popcorn-related holdings across all blockchain networks."
              />
            </div>
            <p className="text-primary text-xl md:text-4xl leading-5 md:leading-8">
              ${formatter.format(parseInt(formatUnits(totalNetWorth)))}
            </p>
          </div>
        </div>
        <div className="mt-6">
          <ConnectWallet hidden={!!account} />
        </div>
      </div>

      <div className="col-span-12 lg:col-span-9 lg:col-start-4 pt-6">
        <h6 className=" font-medium leading-6">Built With</h6>
        <SliderContainer slidesToShow={4}>
          <img src="/images/builtWithLogos/curve.svg" alt="" className="px-2 md:px-5 w-10 h-10 object-contain" />
          <img src="/images/builtWithLogos/synthetix.svg" alt="" className="px-2 md:px-5 w-10 h-10 object-contain" />
          <img src="/images/builtWithLogos/setLogo.svg" alt="" className="px-2 md:px-5 w-10 h-10 object-contain" />
          <img src="/images/builtWithLogos/yearn.svg" alt="" className="px-2 md:px-5 w-10 h-10 object-contain" />
          <img src="/images/builtWithLogos/uniswap.svg" alt="" className="px-2 md:px-5 w-10 h-10 object-contain" />
        </SliderContainer>
      </div>
    </section>
  );
}
