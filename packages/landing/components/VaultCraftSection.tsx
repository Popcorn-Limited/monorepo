import { useState, useEffect } from "react";
import SecondaryActionButton from "./Common/SecondaryActionButton";
import SliderContainer from "./SliderContainer";

export default function VaultCraftSection() {

  const [isVisible, setIsVisible] = useState(false);

  const handleScroll = () => {
    const element = document.getElementById('slide-in-element');
    if (element) {
      const elementTop = element.getBoundingClientRect().top;
      const windowHeight = window.innerHeight;
      if (elementTop + 500 < windowHeight) {
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
      <div className="h-8 w-screen bg-[#C391FF] mt-44 flex-row items-center py-1">
        <SliderContainer slidesToShow={6}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map(x => (
            <div key={x} className="items-center flex flex-row relative px-2">
              <div className="bg-[#9B55FF] w-2 h-2 absolute top-0 left-0 self-center mt-1.5"></div>
              <p className="text-xs ml-2">coming soon</p>
            </div>
          ))}
        </SliderContainer>
      </div>
      <section className="flex w-screen h-full flex-col relative justify-start">
        <div style={{ background: 'linear-gradient(270deg, rgba(0, 0, 0, 5e-05) 50%, rgba(0, 0, 0, 0.25) 100%), linear-gradient(180deg, rgba(0, 0, 0, 0.5) 0.09%, rgba(0, 0, 0, 0.0001) 100%), url(/images/Rectangle.svg)', 'WebkitBackgroundSize': 'cover' }} className="relative top-0 left-0 w-screen grow smmd:pb-44 pb-0">

          <div className="w-full h-fit flex-row flex justify-between items-end xl:mx-auto xl:overflow-x-hidden xl:max-w-[1800px]">
            <div id="slide-in-element" className={`transition-transform mt-[80px] smmd:w-[60vw] xl:max-w-[1400px] w-full duration-[900ms] ${isVisible ? 'smmd:translate-x-8' : 'smmd:-translate-x-full'}`}>
              <h1 className="mb-6 px-8 smmd:px-0 leading-[60px] text-white smmd:leading-[72px] font-normal min-h-[80px] text-left text-4xl smmd:text-8xl lglaptop:text-[96px] lglaptop:leading-[90px] smmd:mt-0 ">
                Easily create tailored asset strategies for your crypto with <b>Vaultcraft</b>
              </h1>
            </div>

            <div className={`transition-transform hidden smmd:flex flex-col gap-y-2 delay-[100ms] duration-[600ms] ${isVisible ? '-translate-x-8' : 'translate-x-full'}`}>
              <p className="text-white text-base"><b>VaultCraft</b> by</p>
              <div className="flex flex-row items-center gap-x-2 justify-end">
                <img src="/images/icons/popLogoWhite.svg" className="h-5 w-5" />
                <p className="text-white">Popcorn</p>
              </div>
            </div>

          </div>


          <div className="w-full flex smmd:flex-row flex-col-reverse justify-between items-start smmd:mt-24 mt-6 xl:mx-auto xl:overflow-x-hidden xl:max-w-[1800px]">
            <div className={`${isVisible ? 'smmd:translate-x-8' : 'smmd:-translate-x-full'} transition-transform delay-[200ms] duration-[700ms] flex flex-col smmd:w-[338px] xl:w-[460px] w-[80%] self-end smmd:self-start mb-[100px] mr-8 smmd:mr-44 mt-10 smmd:mt-0`}>
              <p className="text-lg text-white">We are working in a common permissionless infrastructure and tooling for creating automated asset strategies</p>
              <div className="flex flex-row border-x-0 border-y-customLightGray border-b-2">
                <p className="px-1 py-2 w-full mt-2 leading-7 font-bold text-white">I want to know more</p>
                <SecondaryActionButton label="" customArrowColor="FFFFFF" />
              </div>
            </div>
            <div className={`${isVisible ? 'smmd:-translate-x-8' : 'smmd:translate-x-full'} bg-black transition-transform w-full smmd:w-fit delay-[200ms] duration-[800ms] grow h-[230px] rounded-xl xl:w-[1400px] xl:h-[700px] smmd:h-[450px] ml-8 smmd:ml-0`} >
              <video className="w-full h-full object-cover cover rounded-3xl" id='video' controls poster='/images/vaultVideoPreview.jpg'>
                <source src="/videos/Twitter_Video.mp4" type="video/mp4" />
              </video>
            </div>
          </div>

        </div>
      </section>
    </>
  )
}