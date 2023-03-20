import { ChainId } from "@popcorn/utils";
import NetworkFilter from "./NetworkFilter";
import HeroBgMobile from "./HeroBgMobile";
import HeroBg from "./HeroBg";

interface VaultHeroProps {
  TVL: string | JSX.Element;
  backgroundColorTailwind: string;
  deposits: String | JSX.Element;
  SUPPORTED_NETWORKS: ChainId[];
  selectNetwork: (chainId: ChainId) => void;
  stripeColor: string;
  stripeColorMobile: string;
}


export default function VaultHero({ TVL, backgroundColorTailwind, deposits, SUPPORTED_NETWORKS, selectNetwork, stripeColor, stripeColorMobile }: VaultHeroProps) {
  return (
    <section className={`${backgroundColorTailwind || 'bg-red-400'} overflow-hidden bg-opacity-[15%] flex flex-col md:flex-row justify-between px-8 pt-10 pb-16 md:pb-[14px] relative -mt-5 xl:rounded-2xl`}>
      <div className="relative z-[1]">
        <h1 className="text-3xl md:text-4xl font-normal m-0 leading-[38px] md:leading-11 mb-4">
          Sweet Vaults
        </h1>
        <p className="text-base text-primaryDark">
          Add liquidity to earn stablecoin rewards and be part at creating social impact.
        </p>
        <div className="hidden md:block mt-6">
          <NetworkFilter supportedNetworks={SUPPORTED_NETWORKS} selectNetwork={selectNetwork} />
        </div>
      </div>
      <div className="absolute bottom-0 left-32 hidden md:block">
        <HeroBg backgroundColor={stripeColor} />
      </div>
      <div className="absolute right-5 top-16 md:hidden">
        <HeroBgMobile backgroundColor={stripeColorMobile} />
      </div>
      <div>
        <div className="grid grid-cols-12 gap-4 md:gap-8 mt-8 md:mt-0">
          <div className="col-span-5 md:col-span-3" />
          <div className="col-span-5 md:col-span-3" />
          <div className="col-span-5 md:col-span-3">
            <p className="leading-6 text-base font-light md:font-normal">TVL</p>
            <div className="text-3xl font-light md:font-medium">
              {TVL}
            </div>
          </div>
          <div className="col-span-5 md:col-span-3">
            <p className="leading-6 text-base font-light md:font-normal">Deposits</p>
            <div className="text-3xl font-light md:font-medium">
              {deposits}
            </div>
          </div>
        </div>
        <div className="md:hidden">
          <NetworkFilter supportedNetworks={SUPPORTED_NETWORKS} selectNetwork={selectNetwork} />
        </div>
        <div className="hidden md:flex flex-col items-end mt-16">
        </div>
      </div>
    </section>
  )
}