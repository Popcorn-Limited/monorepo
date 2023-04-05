import { useRouter } from "next/router";
import React, { useEffect } from "react";
import Link from "next/link";
import DesktopMenu from "../components/DesktopMenu";
import MainActionButton from "../components/Common/MainActionButton";
import StatusWithLabel from "components/Common/StatusWithLabel";
import SliderContainer from "components/SliderContainer";
import GithubIcon from "@popcorn/components/components/SVGIcons/GithubIcon";
import DiscordIcon from "@popcorn/components/components/SVGIcons/DiscordIcon";
import TwitterIcon from "@popcorn/components/components/SVGIcons/TwitterIcon";
import MediumIcon from "@popcorn/components/components/SVGIcons/MediumIcon";

const IndexPage = () => {
  const router = useRouter();

  useEffect(() => {
    if (window.location.pathname !== "/") {
      router.replace(window.location.pathname);
    }
  }, [router.pathname]);

  return (
    <div className="mx-auto w-screen max-w-[1300px] xl:max-w-[90%] flex flex-col items-center justify-center">
      <div className="flex-col relative w-full h-full smmd:h-screen min-h-[600px] flex">
        <DesktopMenu />
        <div className="flex flex-row justify-end absolute right-0 top-96 smmd:top-24">
          <img
            alt=""
            className="smmd:w-[50vw] w-[60vw] smmd:max-w-[700px] smmd:max-h-[80vh]"
            src="/images/icons/greenPopLogo.svg"
          />
        </div>
        <section className="relative px-6 smmd:px-8 smmd:mb-0 smmd:h-[90vh] justify-between items-start w-full">
          <div className="flex flex-col items-start smmd:h-full smmd:w-full pb-16 smmd:pb-0 mx-auto min-w-480 lg:flex-row">
            <div className=" text-center z-20 smmd:text-left smmd:mx-0 flex flex-col justify-around h-full w-full">
              <h1 className="mb-6 leading-[60px] smmd:leading-[72px] font-normal min-h-[80px] max-w-[450px] lglaptop:max-w-[900px] smmd:max-w-[700px] text-left text-5xl smmd:text-6xl lglaptop:text-[96px] lglaptop:leading-[90px] smmd:w-1/2 mt-24 smmd:mt-0 ">
                Do well and do good together with Popcorn’s innovative DeFi solutions
              </h1>
              <div className="w-fit flex mb-48 smmd:mb-0">
                <MainActionButton label="Get Started" handleClick={() => router.push("https://app.pop.network/")}>
                  <div className="w-full flex flex-row items-center gap-x-4">
                    <span>Get Started</span>
                    <svg width="41" height="8" viewBox="0 0 41 8" fill="black" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M40.3536 4.35355C40.5488 4.15829 40.5488 3.84171 40.3536 3.64645L37.1716 0.464466C36.9763 0.269204 36.6597 0.269204 36.4645 0.464466C36.2692 0.659728 36.2692 0.976311 36.4645 1.17157L39.2929 4L36.4645 6.82843C36.2692 7.02369 36.2692 7.34027 36.4645 7.53553C36.6597 7.7308 36.9763 7.7308 37.1716 7.53553L40.3536 4.35355ZM0 4.5H40V3.5H0V4.5Z"
                        fill={`#${"black"}`}
                      />
                    </svg>
                  </div>
                </MainActionButton>
              </div>
              <div className="flex my-12 smmd:flex-row items-start smmd:w-full smmd:justify-between flex-col gap-y-20 mb-16 smmd:mb-8">
                <StatusWithLabel
                  label="TVL"
                  content={<p className="text-gray-900 text-8xl mt-4">$20M</p>}
                  infoIconProps={{
                    id: "idx",
                    title: "TVL",
                    content: (
                      <p className="text-gray-900 text-md">
                        This is the total amount locked on Popcorns smart contracts
                      </p>
                    ),
                  }}
                />
                <div className="smmd:align-end max-w-[500px] smmd:flex smmd:flex-col smmd:h-full smmd:justify-end">
                  <p className="smmd:text-right text-left text-lg">
                    Popcorn is a ReFi yield-optimizing protocol with automated asset strategies that simultaneously fund
                    public goods
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <div className="col-span-12 block smmd:col-span-8 smmd:col-start-4 px-6 smmd:px-8 pb-6">
          <h6 className=" font-medium leading-6">Built With</h6>
          <SliderContainer slidesToShow={4}>
            <img src="/images/builtWithLogos/curve.svg" alt="" className="px-2 smmd:px-5 w-10 h-10 object-contain" />
            <img
              src="/images/builtWithLogos/synthetix.svg"
              alt=""
              className="px-2 smmd:px-5 w-10 h-10 object-contain"
            />
            <img src="/images/builtWithLogos/setLogo.svg" alt="" className="px-2 smmd:px-5 w-10 h-10 object-contain" />
            <img src="/images/builtWithLogos/yearn.svg" alt="" className="px-2 smmd:px-5 w-10 h-10 object-contain" />
            <img src="/images/builtWithLogos/uniswap.svg" alt="" className="px-2 smmd:px-5 w-10 h-10 object-contain" />
          </SliderContainer>
        </div>
      </div>

      <section className="w-full pt-14">
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
              Popcorn is an audited, non-custodial DeFi wealth manager with yield-generating products that
              simultaneously fund nonprofit and social impact organizations.
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
    </div>
  );
};

export default IndexPage;
