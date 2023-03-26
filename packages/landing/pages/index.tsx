import { useRouter } from "next/router";
import React, { useEffect } from "react";
import Link from 'next/link';
import DesktopMenu from '../components/DesktopMenu';
import MainActionButton from "../components/Common/MainActionButton";
import RightArrowIcon from "../components/SVGIcons/RightArrowIcon";
import StatusWithLabel from "components/Common/StatusWithLabel";
import SliderContainer from "components/SliderContainer";
import Image from "next/image";

const IndexPage = () => {
  const router = useRouter();

  useEffect(() => {
    if (window.location.pathname !== "/") {
      router.replace(window.location.pathname);
    }
  }, [router.pathname]);
  return (
    <div className="absolute left-0 flex flex-col">
      <div className="flex-col w-full h-full md:h-screen w-screen relative flex">
        <DesktopMenu />
        <div className="flex flex-row justify-end absolute right-0 top-96 md:top-24 ">
          <img alt="" className="md:w-[35vw] w-[60vw] max-w-[300px] md:max-w-[700px] md:max-h-[80vh]" src="/images/icons/greenPopLogo.svg" />
        </div>
        <section className="relative px-6 md:px-8 md:mb-0 md:h-[90vh] justify-between items-start w-full">
          <div className="flex flex-col items-start md:h-full md:w-full pb-16 md:pb-0 mx-auto min-w-480 lg:flex-row">
            <div className=" text-center z-20 md:text-left md:mx-0 flex flex-col justify-around h-full w-full">
              <h1 className="mb-6 leading-[60px] md:leading-[72px] font-normal min-h-[80px] max-w-[450px] lglaptop:max-w-[900px] md:max-w-[700px] text-left text-5xl md:text-6xl lglaptop:text-[96px] lglaptop:leading-[90px] md:w-1/2 mt-24 md:mt-0 ">
                Do well and do good together with Popcorn’s innovative DeFi solutions
              </h1>
              <div className="w-fit flex mb-48 md:mb-0">
                <MainActionButton label="Get Started" >
                  <div className="w-full flex flex-row">
                    <span>Get Started</span>
                    <RightArrowIcon color="#FFFFFF" />
                  </div>
                </MainActionButton>
              </div>
              <div className="flex md:flex-row items-start md:w-full md:justify-between flex-col gap-y-20 mb-16 md:mb-8">
                <StatusWithLabel label="TVL" content={<p className="text-gray-900 text-8xl mt-4">$20M</p>} infoIconProps={{ id: 'idx', title: 'TVL', content: <p className="text-gray-900 text-5xl">$20M</p> }} />
                <div className="md:align-end max-w-[500px]">
                  <p className="md:text-right text-left  text-lg ">Popcorn is a ReFi yield-optimizing protocol with automated asset strategies that simultaneously fund public goods</p>
                </div>
              </div>

            </div>
          </div>
        </section>
        <div className="col-span-12 block md:col-span-8 md:col-start-4 px-6 md:px-8 pb-6">
          <h6 className=" font-medium leading-6">Built With</h6>
          <SliderContainer slidesToShow={4}>
            <img src="/images/builtWithLogos/curve.svg" alt="" className="px-2 md:px-5 w-10 h-10 object-contain" />
            <img src="/images/builtWithLogos/synthetix.svg" alt="" className="px-2 md:px-5 w-10 h-10 object-contain" />
            <img src="/images/builtWithLogos/setLogo.svg" alt="" className="px-2 md:px-5 w-10 h-10 object-contain" />
            <img src="/images/builtWithLogos/yearn.svg" alt="" className="px-2 md:px-5 w-10 h-10 object-contain" />
            <img src="/images/builtWithLogos/uniswap.svg" alt="" className="px-2 md:px-5 w-10 h-10 object-contain" />
          </SliderContainer>
        </div>
      </div>


      <section className="w-full bg-secondary pt-14">
        <div className="flex flex-row justify-between w-10/12 pb-12 mx-auto border-b border-gray-500">
          <div className="w-6/12">
            <Link href="/" passHref>
              {/* <a> */}
              <img src="/images/logoFooter.png" alt="Logo" className="h-10"></img>
              {/* </a> */}
            </Link>
            <p className="w-7/12 py-4 text-base font-normal">
              Earn high yield on your cryptoassets while helping fund
              educational, environmental and open source initiatives
            </p>
            <div className="flex flex-row items-center space-x-4">
              <Link href="https://www.facebook.com/PopcornDAO" passHref>
                <img
                  src="/images/facebook.svg"
                  alt="facebook"
                  className="w-8 h-8 cursor-pointer iconblue hover:text-blue-600"
                ></img>
              </Link>
              <Link href="https://twitter.com/Popcorn_DAO" passHref>
                <img
                  src="/images/twitter.svg"
                  alt="twitter"
                  className="w-8 h-8 cursor-pointer iconblue hover:text-blue-600"
                ></img>
              </Link>
              <Link href="https://github.com/popcorndao" passHref>
                <img
                  src="/images/github.svg"
                  alt="github"
                  className="w-8 h-8 cursor-pointer iconblue hover:text-blue-600"
                ></img>
              </Link>
              <Link href="https://discord.gg/w9zeRTSZsq" passHref>
                <img
                  src="/images/discord.svg"
                  alt="discord"
                  className="w-8 h-8 cursor-pointer iconblue hover:text-blue-600"
                ></img>
              </Link>
            </div>
          </div>
          <div className="flex flex-col space-y-3 text-base">
            <p className="text-base font-medium uppercase">Site</p>
            <Link href="/" passHref>
              {/* <a className="hover:text-blue-600">Home</a> */}
              Home
            </Link>

            <Link href="https://medium.com/popcorndao" passHref>
              Blog
            </Link>
            <Link
              href="https://etherscan.io/token/0xd0cd466b34a24fcb2f87676278af2005ca8a78c4"
              passHref
            >
              Popcorn (POP) Token
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
        <p className="py-4 text-center font-medium">
          ©2021, Popcorn Ltd All Rights Reserved{' '}
          <span className="block text-xs ">
            Winterbotham Place Marlborough &amp; Queen Streets P.O. Box SP
            62556 Nassau, BS
          </span>
        </p>
      </section>
    </div>

  );
};

export default IndexPage;
