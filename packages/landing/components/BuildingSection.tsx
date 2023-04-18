import { useState, useEffect } from "react";
import SliderContainer from "./SliderContainer";

export default function BuildingSection() {

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

  return (
    <>
      <section className="flex w-screen h-screen min-h-[800px] flex-col relative justify-start -z-10">
        <div style={{ background: 'linear-gradient(270deg, rgba(0, 0, 0, 5e-05) 50%, rgba(0, 0, 0, 0.25) 100%), linear-gradient(180deg, rgba(0, 0, 0, 0.25) 0.09%, rgba(0, 0, 0, 5e-05) 100%), linear-gradient(360deg, rgba(0, 0, 0, 0.7) 0.04%, rgba(0, 0, 0, 0.0001) 42.85%), url(/images/background-rectangle.png)', 'WebkitBackgroundSize': 'cover' }} className="relative top-0 left-0 flex flex-col justify-between w-screen grow pb-0 bg-cover">

          <div className="w-full grow flex-col flex justify-start items-start xl:max-w-[1800px] xl:mx-auto">
            <div id="second-slide-element" className={`transition-transform mt-[80px] smmd:w-[60vw] w-full duration-[900ms] ${isVisible ? 'smmd:translate-x-8' : 'smmd:-translate-x-full'}`}>
              <h1 className="mb-6 px-8 smmd:px-0 leading-[60px] text-white smmd:leading-[72px] font-normal min-h-[80px]text-left text-4xl smmd:text-8xl lglaptop:text-[96px] lglaptop:leading-[90px] smmd:mt-0 ">
                Building a better future through DeFi investing
              </h1>
            </div>
          </div>


          <div className="w-full grow flex-col flex justify-start items-end px-8 smmd:px-0 xl:max-w-[1800px] xl:mx-auto">
            <div className={`${isVisible ? 'smmd:-translate-x-8' : 'smmd:translate-x-full'} shrink transition-transform smmd:w-[40vw] w-full delay-[200ms] duration-[800ms] `} >
              <p className="text-white text-right smmd:text-left">
                At Popcorn Network, we&#39;re not just about financial gains, we&#39;re also about making a difference. That&#39;s why we partner and donate a percentage of our profits to Gitcoin, a platform that supports social impact organizations across the globe. By investing in our DeFi suite, you&#39;re not just earning rewards, you&#39;re also investing in change
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
        <section className="px-8 flex w-screen h-full py-10 bg-[#FFE650] rounded-t-xl z-10 -mt-2 xl:max-w-[1800px] xl:mx-auto">
          <div className="flex-col flex w-full gap-y-4">

            <div className="flex flex-col md:flex-row w-full md:h-[50%]">
              <div className="flex flex-col md:w-[40%]">
                <p className="text-black text-3xl"><b>Governed by</b></p>
                <p className="text-black text-3xl -mt-2">PopcornDAO</p>
                <p className="text-lg mt-6 mb-4 md:w-[70%] w-[90%]">Popcorn is governed by POP stakers who use their vlPOP to vote on  important issues to help evolve the protocol and the DAO.</p>
                <p className="bg-white rounded-3xl text-black px-6 py-3 w-fit font-medium cursor-pointer">Governance Forum</p>
              </div>
              <div className="w-fit hidden md:flex flex-row gap-x-3 justify-end xl:w-[60%]">
                <img src="/images/face1.svg" className="h-auto w-[19vw]" />
                <img src="/images/face2.svg" className="h-auto w-[19vw]" />
                <img src="/images/face3.svg" className="h-auto w-[19vw]" />
              </div>
            </div>

            <div className="flex flex-row w-full md:h-[50%] md:gap-x-3 gap-x-[1.4vw] relative -ml-8 md:ml-0 mt-10 md:mt-0">
              <img src="/images/face4.svg" className="w-[24vw] md:w-[19vw]" />
              <img src="/images/face5.svg" className="w-[24vw] md:w-[19vw]" />
              <img src="/images/face6.svg" className="w-[24vw] md:w-[19vw]" />
              <img src="/images/face7.svg" className="w-[24vw] md:w-[19vw]" />
              <div className="h-full w-[19vw] hidden md:flex flex-col justify-end items-end">
                <img src="/images/icons/popLogo.svg" className="w-12 h-12" />
              </div>
            </div>
            <div className="w-full md:hidden flex flex-row gap-x-3 justify-start -ml-8">
              <img src="/images/face1.svg" className="h-auto w-[24vw]" />
              <img src="/images/face2.svg" className="h-auto w-[24vw]" />
              <img src="/images/face3.svg" className="h-auto w-[24vw]" />
              <div className="h-full w-[24vw] md:hidden flex flex-col justify-end items-end">
                <img src="/images/icons/popLogo.svg" className="w-12 h-12 ml-4" />
              </div>
            </div>
          </div>
        </section>
      </section>
    </>
  )
}