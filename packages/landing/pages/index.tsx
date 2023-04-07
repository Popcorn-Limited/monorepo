import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import Link from 'next/link';
import DesktopMenu from '../components/DesktopMenu';
import MainActionButton from "../components/Common/MainActionButton";
import StatusWithLabel from "components/Common/StatusWithLabel";
import SliderContainer from "components/SliderContainer";
import GithubIcon from "components/SVGIcons/GithubIcon";
import DiscordIcon from "components/SVGIcons/DiscordIcon";
import TwitterIcon from "components/SVGIcons/TwitterIcon";
import MediumIcon from "components/SVGIcons/MediumIcon";
import SecondaryActionButton from "components/Common/SecondaryActionButton";
import { ChevronRightIcon, ChevronLeftIcon } from "@heroicons/react/24/solid";
import HeroCards from "components/HeroCards";
import RightArrowIcon from "components/SVGIcons/RightArrowIcon";
import ProductDisplay from "components/ProductDisplay";
import CircleBunny from "components/CircleBunny";
import PointyBunny from "components/pointyBunny";
import HandsIcon from "components/HandsIcon";

const IndexPage = () => {
  const router = useRouter();

  useEffect(() => {
    if (window.location.pathname !== "/") {
      router.replace(window.location.pathname);
    }
  }, [router.pathname]);

  const [move, setMove] = useState(0);
  const [touchStart, setTouchStart] = React.useState(0);
  const [touchEnd, setTouchEnd] = React.useState(0);

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
    <div className="absolute left-0 flex flex-col">
      <div className="flex-col w-full h-full min-h-[600px] w-screen relative flex">
        <DesktopMenu />
        <div className="flex flex-row justify-end absolute right-0 top-96 smmd:top-24">
          <img alt="" className="smmd:w-[50vw] w-[60vw] smmd:max-w-[700px] smmd:max-h-[80vh]" src="/images/icons/greenPopLogo.svg" />
        </div>

        <section className="relative px-6 smmd:px-8 smmd:mb-0 items-start w-full overflow-scroll">
          <div className="flex flex-col items-start smmd:h-full smmd:w-full pb-16 smmd:pb-0 mx-auto min-w-480 lg:flex-row">
            <div className=" text-center z-20 smmd:text-left smmd:mx-0 flex flex-col justify-around h-full w-full">
              <h1 className="mb-6 leading-[60px] smmd:leading-[72px] font-normal min-h-[80px] max-w-[450px] lglaptop:max-w-[900px] smmd:max-w-[700px] text-left text-5xl smmd:text-8xl lglaptop:text-[96px] lglaptop:leading-[90px] smmd:w-1/2 mt-24 smmd:mt-0 ">
                Do well and do good together with Popcorn&#39;s innovative DeFi solutions
              </h1>
              <div className="w-fit flex mb-48 smmd:mb-36">
                <MainActionButton label="Get Started" handleClick={() => router.push("https://app.pop.network/")}>
                  <div className="w-full flex flex-row items-center gap-x-4">
                    <span>Get Started</span>
                    <svg width="41" height="8" viewBox="0 0 41 8" fill="black" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M40.3536 4.35355C40.5488 4.15829 40.5488 3.84171 40.3536 3.64645L37.1716 0.464466C36.9763 0.269204 36.6597 0.269204 36.4645 0.464466C36.2692 0.659728 36.2692 0.976311 36.4645 1.17157L39.2929 4L36.4645 6.82843C36.2692 7.02369 36.2692 7.34027 36.4645 7.53553C36.6597 7.7308 36.9763 7.7308 37.1716 7.53553L40.3536 4.35355ZM0 4.5H40V3.5H0V4.5Z"
                        fill={`#${'black'}`}
                      />
                    </svg>
                  </div>
                </MainActionButton>
              </div>
              <div className="flex smmd:flex-row items-start smmd:w-full smmd:justify-between flex-col gap-y-20 mb-16 smmd:mb-24 smmd:items-end">
                <StatusWithLabel label="TVL" content={<p className="text-gray-900 text-8xl mt-4">$20M</p>} infoIconProps={{ id: 'idx', title: 'TVL', content: <p className="text-gray-900 text-md">This is the total amount locked on Popcorns smart contracts</p> }} />
                <div className="smmd:align-end max-w-[500px] smmd:flex smmd:flex-col smmd:h-full smmd:justify-end">
                  <p className="smmd:text-right text-left text-lg">Popcorn is a ReFi yield-optimizing protocol with automated asset strategies that simultaneously fund public goods</p>
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

      <section className="w-screen mt-16 md:mt-[200px]">
        <div className=" mb-18 flex flex-col hidden md:block relative p-[32px]">
          <p id="titlex" className="text-6xl max-w-[60%] mb-10">Earn high returns on your crypto while funding public goods</p>
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
            className={`flex flex-row h-[650px] w-fit overflow-x-auto transition-transform ${move === 1 ? 'translate-x-[-524px]' : 'translate-x-0'}`}>
            <div className="w-[467px] h-full mr-[24px] shrink-0">
              <video className="w-full h-full cover rounded-3xl" id='video' controls poster='/images/Videocard.svg'>
                <source src="/videos/Popcorn_V4.1.mp4" type="video/mp4" />
              </video>
            </div>

            <div className="flex flex-col w-screen border-box">

              <div className="flex flex-col w-[338px] mb-[100px] ml-[24px]">
                <p className="text-lg">It&#39;s now easy to deposit your crypto, optimise your yield, and create positive global impact at the same time.</p>
                <div className="flex flex-row border-x-0 border-y-customLightGray border-b-2">
                  <p className="px-1 py-2 w-full mt-2 leading-7 font-bold">Create Account</p>
                  <SecondaryActionButton label="" />
                </div>
              </div>

              <div className="w-full h-full flex-row flex gap-x-6 w-screen px-[24px]">
                <HeroCards title="Deposit" color="bg-[#EBE7D4]" imgUri="/images/blackCircles.svg" description="Connect your web3 wallet, deposit your stablecoins and blue chip crypto assets into Popcorn’s DeFi products." />
                <HeroCards title="Do Well" color="bg-[#121A27]" textColor="text-white" imgUri="/images/whiteSmile.svg" description="Optimize your returns with non-custodial vault strategies and staking products." />
                <HeroCards title="Do Good" color="bg-[#FFE650]" imgUri="/images/blackSmiles.svg" description="Fund community-selected nonprofit and social impact organisations at no additional cost." />
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


      <section className="mt-44 p-8">
        <div className="flex smmd:flex-row flex-col items-start">

          <div className="flex flex-row items-center gap-x-4 mr-48 mb-12 smmd:mb-0">
            <p className="w-max">Our Products</p>
            <RightArrowIcon color="645F4B" />
          </div>

          <div className="flex flex-col grow w-[100%]">
            <ProductDisplay number="01" title="Sweet Vaults" description="Automated asset startegies that earn yield on your single asset deposits." image={(color) => <CircleBunny color={color} />} animateColor="#C391FF" textColorClassname="text-[#C391FF]" />
            <ProductDisplay number="02" title="Vaults For Good" description="Vaults that fund public goods with the yield generated from its asset strategies." image={(color) => <PointyBunny color={color} />} animateColor="#FA5A6E" textColorClassname="text-[#FA5A6E]" />
            <ProductDisplay number="03" title="POP Staking" description="Stake your POP for vlPOP to vote in PopcornDAO." image={(color) => <HandsIcon color={color} />} animateColor="#FFE650" textColorClassname="text-[#FFE650]" />
          </div>

        </div>
      </section>


      <section id="xoxop" className="w-full pt-14">
        <div className="flex flex-col md:flex-row justify-between w-11/12 pb-12 mx-auto border-b border-gray-500">
          <Link href="/" passHref>
            <img src="/images/icons/popLogo.svg" alt="Logo" className="h-10 hidden md:block"></img>
          </Link>
          <div className="space-y-6 md:hidden">
            <div className="flex flex-col space-y-3 text-base">
              <p className="text-base font-medium uppercase">Products</p>
              <Link href="https://app.pop.network/sweet-vaults" passHref>
                Sweet Vaults
              </Link>
              <Link href="https://app.pop.network/ethereum/set/3x" passHref>
                3X
              </Link>
              <Link href="https://app.pop.network/ethereum/set/butter" passHref>
                Butter
              </Link>
              <Link href="https://app.pop.network/staking" passHref>
                Staking
              </Link>
            </div>
            <div className="flex flex-col space-y-3 text-base">
              <p className="text-base font-medium uppercase">Connect</p>
              <Link href="https://twitter.com/Popcorn_DAO" passHref>
                Twitter
              </Link>
              <Link href="https://discord.gg/w9zeRTSZsq" passHref>
                Discord
              </Link>
              <Link href="https://github.com/popcorndao" passHref>
                Github
              </Link>
            </div>
            <div className="flex flex-col space-y-3 text-base">
              <p className="text-base font-medium uppercase">Bug Bounty</p>
            </div>
          </div>
          <div className="md:w-6/12 mt-8 md:mt-0">
            <p className="md:w-7/12 text-base font-normal">
              Popcorn is an audited, non-custodial DeFi wealth manager with yield-generating products that simultaneously fund nonprofit and social impact organizations.
            </p>
            <div className="flex flex-row items-center justify-between md:justify-start md:space-x-4 mt-4">
              <Link href="https://twitter.com/Popcorn_DAO" passHref>
                <TwitterIcon color={"black"} size={"24"} />
              </Link>
              <Link href="https://medium.com/popcorndao" passHref>
                <MediumIcon color={"black"} size={"24"} />
              </Link>
              <Link href="https://discord.gg/w9zeRTSZsq" passHref>
                <DiscordIcon color={"black"} size={"24"} />
              </Link>
              <Link href="https://github.com/popcorndao" passHref>
                <GithubIcon color={"black"} size={"24"} />
              </Link>
            </div>
          </div>
          <div className="hidden md:flex flex-col space-y-3 text-base">
            <p className="text-base font-medium uppercase">Products</p>
            <Link href="https://app.pop.network/sweet-vaults" passHref>
              Sweet Vaults
            </Link>
            <Link href="https://app.pop.network/ethereum/set/3x" passHref>
              3X
            </Link>
            <Link href="https://app.pop.network/ethereum/set/butter" passHref>
              Butter
            </Link>
            <Link href="https://app.pop.network/staking" passHref>
              Staking
            </Link>
          </div>
          <div className="hidden md:flex flex-col space-y-3 text-base">
            <p className="text-base font-medium uppercase">Connect</p>
            <Link href="https://twitter.com/Popcorn_DAO" passHref>
              Twitter
            </Link>
            <Link href="https://discord.gg/w9zeRTSZsq" passHref>
              Discord
            </Link>
            <Link href="https://github.com/popcorndao" passHref>
              Github
            </Link>
          </div>
          <div className="hidden md:flex flex-col space-y-3 text-base">
            <p className="text-base font-medium uppercase">Bug Bounty</p>
          </div>
        </div>
      </section>
    </div >

  );
};

export default IndexPage;
