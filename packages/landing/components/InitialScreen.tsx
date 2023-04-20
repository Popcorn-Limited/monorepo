import { useRouter } from "next/router";
import MainActionButton from "./Common/MainActionButton";
import StatusWithLabel from "./Common/StatusWithLabel";
import DesktopMenu from "./DesktopMenu";
import SliderContainer from "./SliderContainer";
import { useEffect, useState } from "react";

export default function InitialScreen() {
  const router = useRouter();
  const [arrowColor, setArrowColor] = useState('black');
  const [tvl, setTvl] = useState<string>("0");


  const formatter: Intl.NumberFormat = Intl.NumberFormat("en", {
    //@ts-ignore
    notation: "compact",
  });

  useEffect(() => {
    fetch("https://api.llama.fi/protocol/popcorn").then(
      res => res.json().then(
        res => setTvl(formatter.format(res.currentChainTvls.Ethereum + res.currentChainTvls.staking))
      ))
  }, [])

  return (
    <div className="flex-col h-full min-h-[600px] w-screen relative flex 2xl:mx-auto 2xl:max-w-[1800px]">
      <DesktopMenu />
      <div className="flex flex-row justify-end absolute right-0 top-96 smmd:top-24">
        <img alt="" className="smmd:w-[50vw] w-[60vw] smmd:max-w-[700px] smmd:max-h-[80vh] 2xl:hidden" src="/images/icons/greenPopLogoCut.svg" />
        <img alt="" className="-mr-56 w-[50vw] max-w-[950px] max-h-[80vh] hidden 2xl:block" src="/images/icons/greenPopLogo.svg" />
      </div>

      <section className="relative px-6 smmd:px-8 smmd:mb-0 items-start w-full overflow-scroll">
        <div className="flex flex-col items-start smmd:h-full smmd:w-full pb-16 smmd:pb-0 mx-auto min-w-480 lg:flex-row">
          <div className=" text-center z-20 smmd:text-left smmd:mx-0 flex flex-col justify-around h-full w-full">
            <h1 className="mb-6 leading-[60px] smmd:leading-[72px] font-normal min-h-[80px] max-w-[450px] lglaptop:max-w-[900px] smmd:max-w-[700px] text-left text-5xl smmd:text-8xl lglaptop:text-[96px] lglaptop:leading-[90px] smmd:w-1/2 mt-24 smmd:mt-[70px] ">
              Do well and do good together with Popcorn&#39;s innovative DeFi solutions
            </h1>
            <div className="w-fit flex mb-48 smmd:mb-36">
              <span onMouseLeave={() => setArrowColor('black')} onMouseEnter={() => setArrowColor('white')} className="w-full h-full">
                <MainActionButton label="Get Started" handleClick={() => router.push("https://app.pop.network/")}>
                  <div className="w-full flex flex-row items-center gap-x-4">
                    <span>Get Started</span>
                    <svg className="transition-all ease-in-out duration-500" width="41" height="8" viewBox="0 0 41 8" fill="black" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M40.3536 4.35355C40.5488 4.15829 40.5488 3.84171 40.3536 3.64645L37.1716 0.464466C36.9763 0.269204 36.6597 0.269204 36.4645 0.464466C36.2692 0.659728 36.2692 0.976311 36.4645 1.17157L39.2929 4L36.4645 6.82843C36.2692 7.02369 36.2692 7.34027 36.4645 7.53553C36.6597 7.7308 36.9763 7.7308 37.1716 7.53553L40.3536 4.35355ZM0 4.5H40V3.5H0V4.5Z"
                        fill={arrowColor}
                      />
                    </svg>
                  </div>
                </MainActionButton>
              </span>
            </div>
            <div className="flex smmd:flex-row items-start smmd:w-full smmd:justify-between flex-col gap-y-20 mb-16 smmd:mb-24 smmd:items-end">
              <StatusWithLabel
                label="TVL"
                content={<p className="text-gray-900 text-8xl mt-4">$ {tvl}</p>}
                infoIconProps={{
                  id: 'idx',
                  title: 'TVL',
                  content: <p className="text-gray-900 text-md">This is the total amount locked on Popcorns smart contracts</p>
                }}
              />
              <div className="smmd:align-end max-w-[500px] smmd:flex smmd:flex-col smmd:h-full smmd:justify-end">
                <p className="smmd:text-right text-left text-xl">Popcorn is a ReFi yield-optimizing protocol with automated asset strategies that simultaneously fund public goods</p>
              </div>
            </div>

          </div>
        </div>
      </section>
      <div className="col-span-12 block smmd:col-span-8 smmd:col-start-4 px-6 smmd:px-8 pb-6">
        <h6 className=" font-medium leading-6">Built With</h6>
        <SliderContainer slidesToShow={4}>
          <img src="/images/builtWithLogos/curve.svg" alt="" className="px-2 smmd:px-5 w-10 h-10 object-contain" />
          <img src="/images/builtWithLogos/synthetix.svg" alt="" className="px-2 smmd:px-5 w-10 h-10 object-contain" />
          <img src="/images/builtWithLogos/setLogo.svg" alt="" className="px-2 smmd:px-5 w-10 h-10 object-contain" />
          <img src="/images/builtWithLogos/yearn.svg" alt="" className="px-2 smmd:px-5 w-10 h-10 object-contain" />
          <img src="/images/builtWithLogos/uniswap.svg" alt="" className="px-2 smmd:px-5 w-10 h-10 object-contain" />
        </SliderContainer>
      </div>
    </div>
  )
}