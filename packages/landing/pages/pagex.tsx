import { useState } from "react";
import DesktopMenu from "../components/DesktopMenu";
import MainActionButton from "../components/Common/MainActionButton";
import RightArrowIcon from "../components/SVGIcons/RightArrowIcon";
import StatusWithLabel from "components/Common/StatusWithLabel";
import SliderContainer from "components/SliderContainer";


function Main() {
  const [builtWithLogos, setBuiltWithLogos] = useState([
    "/images/builtWithLogos/curve.svg",
    "/images/builtWithLogos/synthetix.svg",
    "/images/builtWithLogos/setLogo.svg",
    "/images/builtWithLogos/yearn.svg",
    "/images/builtWithLogos/uniswap.svg"
  ]);

  return (
    <main>
      <DesktopMenu />
      <section className="min-h-full relative w-screen">
        <div className="flex flex-row justify-end absolute right-0 top-48 md:top-0">
          <img alt="" className="md:w-[35vw] w-[60vw]" src="/images/icons/greenPopLogo.svg" />
        </div>
        <div className="flex flex-col items-center justify-between w-10/12 pb-56 mx-auto min-w-480 lg:flex-row">
          <div className="order-2 mt-12 w-full z-20">
            <div className="mx-auto text-center md:text-left md:mx-0">
              <h1 className="mb-6 font-normal text-left text-4xl lg:text-5xl xl:text-7xl md:w-1/2">
                Do well and do good together with Popcorn’s innovative DeFi solutions
              </h1>
              <div className="w-fit flex mb-28">
                <MainActionButton label="Get Started">
                  <div className="w-full flex flex-row">
                    <span>Get Started</span>
                    <RightArrowIcon color="#FFFFFF" />
                  </div>
                </MainActionButton>
              </div>
              <div className="flex md:flex-row items-start md:w-full md:space-between flex-col gap-y-10 mb-24">
                <StatusWithLabel content={"20"} label="TVL" />
                <p className="md:text-right text-left">
                  Popcorn is a ReFi yield-optimizing protocol with automated asset strategies that simultaneously fund public goods
                </p>
              </div>
              <div className="col-span-12 md:col-span-8 md:col-start-4 pt-6">
                <h6 className="font-medium leading-6">Built With</h6>
                <SliderContainer slidesToShow={4}>
                  {builtWithLogos.map((logo) => (
                    <img key={logo} src={logo} alt="" className="px-2 md:px-5 w-10 h-10 object-contain" />
                  ))}
                </SliderContainer>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Main;