import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import SecondaryActionButton from "./Common/SecondaryActionButton";
import HeroCards from "./HeroCards";
import { useState } from "react";
import Link from "next/link";

export default function VideoSection() {

  const [move, setMove] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  function handleTouchStart(e) {
    setTouchStart(e.targetTouches[0].clientX);
  }

  function handleTouchMove(e) {
    setTouchEnd(e.targetTouches[0].clientX);
  }

  function handleTouchEnd() {
    if (touchStart - touchEnd > 150) {
      setMove(1);
    }

    if (touchStart - touchEnd < -150) {
      setMove(0);
    }
  }

  const [startX, setStartX] = useState(null);
  const [endX, setEndX] = useState(null);

  function handleMouseDown(event) {
    setStartX(event.clientX);
  }

  function handleMouseMove(event) {
    if (startX !== null) {
      setEndX(event.clientX);
    }
  }

  function handleMouseUp() {
    if (startX !== null && endX !== null) {
      const distance = endX - startX;
      if (distance > 50) {
        setMove(0);
      } else if (distance < -50) {
        setMove(1);
      }
    }
    setStartX(null);
    setEndX(null);
  }
  return (
    <section className="w-screen mt-16 md:mt-[200px] xl:mx-auto xl:max-w-[1800px]">
      <div className=" mb-18 flex flex-col hidden md:block relative p-[32px] overflow-x-hidden">
        <p id="titlex" className="text-[60px] leading-[65px] max-w-[70%] mb-2">Earn high returns on your crypto while funding public goods</p>
        <div className="w-full h-12 flex flex-row justify-end">

          <div onClick={() => setMove(0)} className="w-12 h-12 rounded-full border-[#645F4B] border-[1px] flex flex-col justify-center items-center mr-2 cursor-pointer">
            <ChevronLeftIcon color="#645F4B" width={20} height={20} />
          </div>
          <div onClick={() => setMove(1)} className="w-12 h-12 rounded-full border-[#645F4B] border-[1px] flex flex-col justify-center items-center cursor-pointer">
            <ChevronRightIcon color="#645F4B" width={20} height={20} />
          </div>

        </div>

        <div
          onTouchMove={handleTouchMove}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseDown={mouseDownEvent => handleMouseDown(mouseDownEvent)}
          onMouseMove={mouseMoveEvent => handleMouseMove(mouseMoveEvent)}
          onMouseUp={() => handleMouseUp()}
          className={`flex flex-row h-[550px] xl:h-fit max-h-[800px] w-fit overflow-y-hidden overflow-x-auto transition-transform ${move === 1 ? 'translate-x-[-524px] xl:translate-x-[-624px]' : 'translate-x-0'}`}>
          <div className="w-[467px] xl:w-[567px] h-full mr-[24px] shrink-0 cursor-pointer">
            <video className="w-full h-full cover rounded-3xl" id='video' controls poster='/images/Videocard.svg'>
              <source src="/videos/Popcorn_V4.1.mp4" type="video/mp4" />
            </video>
          </div>

          <div className="flex flex-col w-screen xl:w-[1800px] border-box">

            <div className="flex flex-col w-[338px] mb-[100px] ml-[24px] smmd:mb-12 xl:mb-36">
              <p className="text-lg">It&#39;s now easy to deposit your crypto, optimise your yield, and create positive global impact at the same time.</p>
              <Link
                href="https://app.pop.network/sweet-vaults"
                passHref
                className="flex flex-row border-x-0 border-y-customLightGray border-b-2"
              >
                <p className="px-1 py-2 w-full mt-2 leading-7 font-bold">Deposit Now</p>
                <SecondaryActionButton label="" />
              </Link>
            </div>

            <div className="w-full h-full flex-row flex gap-x-6 xl:w-[1800px] px-[24px]">
              <HeroCards
                title="Deposit"
                color="bg-[#EBE7D4]"
                imgUri="/images/blackCircles.svg"
                description="Connect your web3 wallet, deposit your stablecoins and blue chip crypto assets into Popcorn’s DeFi products."
              />
              <HeroCards
                title="Do Well"
                color="bg-[#121A27]"
                textColor="text-white"
                imgUri="/images/whiteSmile.svg"
                description="Optimize your returns with non-custodial vault strategies and staking products."
              />
              <HeroCards
                title="Do Good"
                color="bg-[#FFE650]"
                imgUri="/images/blackSmiles.svg"
                description="Fund community-selected nonprofit and social impact organisations at no additional cost."
              />
            </div>

          </div>
        </div>
      </div>

      {/* Mobile part */}
      <div className="flex md:hidden flex-col px-6">
        <div className="w-full h-full">
          <video className="w-full h-full cover max-h-[80vh] rounded-3xl" id='video' controls poster='/images/Videocard.svg'>
            <source src="/videos/Popcorn_V4.1.mp4" type="video/mp4" />
          </video>
        </div>
        <p className="text-4xl mt-16 mb-8">Earn high returns on your crypto while funding public goods</p>
        <p className="w-[80%]">It&#39;s now easy to deposit your crypto, optimise your yield, and create positive global impact at the same time.</p>
        <div className="flex flex-row border-x-0 border-y-customLightGray border-b-2 font-bold w-[80%] mb-16">
          <p className="px-1 py-2 w-full mt-4 leading-7">Create Account</p>
          <SecondaryActionButton label="" />
        </div>
        <div className="h-[1300px] flex flex-col gap-y-4">
          <HeroCards title="Deposit" color="bg-[#EBE7D4]" imgUri="/images/blackCircles.svg" description="Connect your web3 wallet, deposit your stablecoins and blue chip crypto assets into Popcorn’s DeFi products." />
          <HeroCards title="Do Well" color="bg-[#121A27]" textColor="text-white" imgUri="/images/whiteSmile.svg" description="Optimize your returns with non-custodial vault strategies and staking products." />
          <HeroCards title="Do Good" color="bg-[#FFE650]" imgUri="/images/blackSmiles.svg" description="Fund community-selected nonprofit and social impact organisations at no additional cost." />
        </div>
      </div>
    </section>
  )
}