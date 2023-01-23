import SliderContainer from "@popcorn/app/components/Common/SliderContainer";
import { NetworthCard } from "@popcorn/app/components/landing/NetworthCard";
import { TVLCard } from "@popcorn/app/components/landing/TVLCard";
import { useIsConnected } from "@popcorn/app/hooks/useIsConnected";
import { ConnectWallet } from "@popcorn/components/components/ConnectWallet";

export default function Hero(): JSX.Element {
  const isConnected = useIsConnected();

  return (
    <section className="grid grid-cols-12 md:gap-8">
      <div className="col-span-12 md:col-span-3">
        <div className="grid grid-cols-12 w-full gap-4 md:gap-0">
          <TVLCard />
          <NetworthCard hidden={!isConnected} />
        </div>
        <div className="mt-6">
          <ConnectWallet hidden={isConnected} />
        </div>
      </div>

      <div className="col-span-12 md:col-span-8 md:col-start-4 pt-6">
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
