import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import AuditSection from "components/AuditSection";
import ProductsSection from "components/ProductsSection";
import VideoSection from "components/VideoSection";
import InitialScreen from "components/InitialScreen";
import Footer from "components/Footer";
import VaultCraftSection from "components/VaultCraftSection";
import SliderContainer from "components/SliderContainer";

const IndexPage = () => {
  const router = useRouter();

  const [isVisible, setIsVisible] = useState(false);

  const handleScroll = () => {
    const element = document.getElementById('second-slide-element');
    if (element) {
      const elementTop = element.getBoundingClientRect().top;
      const windowHeight = window.innerHeight;
      if (elementTop + 300 < windowHeight) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (window.location.pathname !== "/") {
      router.replace(window.location.pathname);
    }
  }, [router.pathname]);

  return (
    <div className="absolute left-0 flex flex-col">
      <InitialScreen />
      <VideoSection />
      <ProductsSection />
      <AuditSection />
      <VaultCraftSection />
      <section className="flex w-screen h-screen min-h-[800px] flex-col relative justify-start -z-10">
        <div style={{ background: 'linear-gradient(270deg, rgba(0, 0, 0, 5e-05) 50%, rgba(0, 0, 0, 0.25) 100%), linear-gradient(180deg, rgba(0, 0, 0, 0.25) 0.09%, rgba(0, 0, 0, 5e-05) 100%), linear-gradient(360deg, rgba(0, 0, 0, 0.7) 0.04%, rgba(0, 0, 0, 0.0001) 42.85%), url(/images/background-rectangle.png)' }} className="relative top-0 left-0 flex flex-col justify-between w-screen grow pb-0">

          <div className="w-full grow flex-col flex justify-start items-start">
            <div id="second-slide-element" className={`transition-transform mt-[80px] smmd:w-[60vw] w-full duration-[900ms] ${isVisible ? 'smmd:translate-x-8' : 'smmd:-translate-x-full'}`}>
              <h1 className="mb-6 px-8 smmd:px-0 leading-[60px] text-white smmd:leading-[72px] font-normal min-h-[80px]text-left text-4xl smmd:text-8xl lglaptop:text-[96px] lglaptop:leading-[90px] smmd:mt-0 ">
                Building a better future through DeFi investing
              </h1>
            </div>
          </div>


          <div className="w-full grow flex-col flex justify-start items-end px-8 smmd:px-0">
            <div className={`${isVisible ? 'smmd:-translate-x-8' : 'smmd:translate-x-full'} shrink transition-transform smmd:w-[40vw] w-full delay-[200ms] duration-[800ms] `} >
              <p className="text-white text-right smmd:text-left">
                At Popcorn Network, we're not just about financial gains, we're also about making a difference. That's why we partner and donate a percentage of our profits to Gitcoin, a platform that supports social impact organizations across the globe. By investing in our DeFi suite, you're not just earning rewards, you're also investing in change
              </p>

              <div className="flex-col flex mt-20">
                <p className="text-white text-xl mb-4">Organizations Supported</p>
                <div className="flex-row items-center w-fit px-2 gap-x-4 bg-white smmd:flex hidden">
                  <img src="/images/icons/immunifi-logo.png" className='h-full' />
                  <img src="/images/icons/blocksec-logo.png" className='h-full' />
                </div>
                <div className="col-span-12 block smmd:col-span-8 smmd:col-start-4 px-6 smmd:px-8 pb-6 smmd:hidden">
                  <SliderContainer slidesToShow={2} settingsOverride={{ arrows: false }}>
                    <img src="/images/icons/immunifi-logo.png" className='h-6 w-fit px-5' />
                    <img src="/images/icons/blocksec-logo.png" className='h-6 w-fit px-5' />
                    <img src="/images/icons/immunifi-logo.png" className='h-6 w-fit px-5' />
                  </SliderContainer>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section >
      <section className="px-8 flex w-screen h-full py-10 bg-[#FFE650] rounded-t-xl z-10 -mt-2">
        <div className="flex-col flex w-full gap-y-4">

          <div className="flex flex-row w-full h-[50%]">
            <div className="flex flex-col w-[40%]">
              <p className="text-black text-3xl"><b>Governed by</b></p>
              <p className="text-black text-3xl -mt-2">PopcornDAO</p>
              <p className="text-lg mt-6 mb-4 w-[70%]">Popcorn is governed by POP stakers who use their vlPOP to vote on  important issues to help evolve the protocol and the DAO.</p>
              <p className="bg-white rounded-3xl text-black px-6 py-3 w-fit font-medium cursor-pointer">Governance Forum</p>
            </div>
            <div className="w-fit flex flex-row gap-x-3 justify-end">
              <img src="/images/face1.svg" className="h-auto w-[19vw]" />
              <img src="/images/face2.svg" className="h-auto w-[19vw]" />
              <img src="/images/face3.svg" className="h-auto w-[19vw]" />
            </div>
          </div>

          <div className="flex flex-row w-full h-[50%] gap-x-3">
            <img src="/images/face4.svg" className="h-full w-[19vw]" />
            <img src="/images/face5.svg" className="h-full w-[19vw]" />
            <img src="/images/face6.svg" className="h-full w-[19vw]" />
            <img src="/images/face7.svg" className="h-full w-[19vw]" />
            <div className="h-full w-[19vw] flex flex-col justify-end items-end">
              <img src="/images/icons/popLogo.svg" className="w-12 h-12" />
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div >

  );
};

export default IndexPage;
