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
    <main>
      <div className="flex-col w-full flex">
        <DesktopMenu />
        <section className="min-h-full md:h-[75vh] relative w-screen px-8 md:mb-24">
          <div className="flex flex-row justify-end absolute right-0 top-48 md:top-0 ">
            <img alt="" className="md:w-[35vw] w-[60vw] max-w-[300px] md:max-w-[700px] md:max-h-[80vh]" src="/images/icons/greenPopLogo.svg" />
          </div>
          <div className="flex flex-col items-center justify-between pb-16 md:pb-56 mx-auto min-w-480 lg:flex-row">

            <div className="order-2 mt-12 w-full z-20">
              <div className="mx-auto text-center md:text-left md:mx-0">
                <h1 className="mb-6 leading-[48px] md:leading-[72px] font-normal min-h-[80px] max-w-[450px] md:max-w-[700px] text-left text-4xl md:text-8xl md:w-1/2 ">
                  Do well and do good together with Popcorn’s innovative DeFi solutions
                </h1>
                <div className="w-fit flex mb-16 md:mb-28">
                  <MainActionButton label="Get Started" >
                    <div className="w-full flex flex-row">
                      <span>Get Started</span>
                      <RightArrowIcon color="#FFFFFF" />
                    </div>
                  </MainActionButton>
                </div>
                <div className="flex md:flex-row items-start md:w-full md:justify-between flex-col gap-y-20 mb-16 md:mb-24">
                  <StatusWithLabel label="TVL" content={<p className="text-gray-900 text-8xl mt-4">$20M</p>} infoIconProps={{ id: 'idx', title: 'TVL', content: <p className="text-gray-900 text-5xl">$20M</p> }} />
                  <p className="md:text-right text-left md:align-end text-lg max-w-[500px]">Popcorn is a ReFi yield-optimizing protocol with automated asset strategies that simultaneously fund public goods</p>
                </div>

              </div>
            </div>
          </div>
        </section>
        <div className="col-span-12 md:col-span-8 md:col-start-4 pt-6 mb-8 px-8">
          <h6 className=" font-medium leading-6">Built With</h6>
          <SliderContainer slidesToShow={4}>
            <img src="/images/builtWithLogos/curve.svg" alt="" className="px-2 md:px-5 w-10 h-10 object-contain" />
            <img src="/images/builtWithLogos/synthetix.svg" alt="" className="px-2 md:px-5 w-10 h-10 object-contain" />
            <img src="/images/builtWithLogos/setLogo.svg" alt="" className="px-2 md:px-5 w-10 h-10 object-contain" />
            <img src="/images/builtWithLogos/yearn.svg" alt="" className="px-2 md:px-5 w-10 h-10 object-contain" />
            <img src="/images/builtWithLogos/uniswap.svg" alt="" className="px-2 md:px-5 w-10 h-10 object-contain" />
          </SliderContainer>


        </div>

        {/* </section>
        <section className="w-10/12 mx-auto mb-24">
          <h2 className="mb-4 text-5xl font-bold xl:text-6xl">How it works</h2>
          <p className="text-xl text-gray-500 font-landing">
            Put your cryptoassets to work
          </p>
          <div className="flex flex-row flex-wrap justify-between w-full mt-16">
            <div className="flex-grow-0 flex-shrink-0 w-1/2 mb-12 xl:w-1/4 xl:mb-0">
              <div className="flex flex-col items-center w-11/12 shadow-2xl h-104 rounded-xl">
                <div className="flex items-center mt-12 rounded-full w-36 h-36 bg-primary">
                  <img
                    src="/images/metamaskCat.svg"
                    alt="metamaskCat"
                    className="mx-auto mb-1"
                  ></img>
                </div>
                <h3 className="py-8 text-4xl font-medium">Connect</h3>
                <p className="w-3/4 text-xl text-center text-gray-500">
                  Connect your Metamask wallet with Popcorn
                </p>
              </div>
            </div>
            <div className="flex-grow-0 flex-shrink-0 w-1/2 mb-12 xl:w-1/4 xl:mb-0">
              <div className="flex flex-col items-center w-11/12 shadow-2xl h-104 rounded-xl">
                <div className="flex items-center mt-12 rounded-full w-36 h-36 bg-primary">
                  <img
                    src="/images/vault.svg"
                    alt="vault"
                    className="mx-auto mb-2"
                  ></img>
                </div>
                <h3 className="py-8 text-4xl font-medium">Deposit</h3>
                <p className="w-3/4 text-xl text-center text-gray-500">
                  Deposit your crypto and choose a product or strategy
                </p>
              </div>
            </div>
            <div className="flex-grow-0 flex-shrink-0 w-1/2 xl:w-1/4">
              <div className="flex flex-col items-center w-11/12 shadow-2xl h-104 rounded-xl">
                <div className="flex items-center mt-12 rounded-full w-36 h-36 bg-primary">
                  <img
                    src="/images/popcornVault.svg"
                    alt="popcornVault"
                    className="mx-auto mt-2"
                  ></img>
                </div>
                <h3 className="py-8 text-4xl font-medium">Do well</h3>
                <p className="w-3/4 text-xl text-center text-gray-500">
                  Earn competitive returns on your crypto assets
                </p>
              </div>
            </div>
            <div className="flex-grow-0 flex-shrink-0 w-1/2 xl:w-1/4">
              <div className="flex flex-col items-center w-11/12 shadow-2xl h-104 rounded-xl">
                <div className="flex items-center mt-12 rounded-full w-36 h-36 bg-primary">
                  <img
                    src="/images/catMail.svg"
                    alt="catMail"
                    className="mx-auto mb-1"
                  ></img>
                </div>
                <h3 className="py-8 text-4xl font-medium">Do good</h3>
                <p className="w-3/4 text-xl text-center text-gray-500">
                  Choose which social impact organization you’d like to help
                </p>
              </div>
            </div>
          </div>
        </section>
        <section
          className="flex-grow-0 flex-shrink-0 w-full h-full bg-popcorn1-pattern xl:mb-24"
          style={{
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'auto',
            backgroundPosition: 'left top',
          }}
        >
          <div className="flex flex-row items-center justify-between w-10/12 pt-20 mx-auto">
            <div className="w-5/12">
              <h2 className="w-11/12 mb-4 text-5xl font-bold leading-snug xl:text-6xl">
                Maximize your Crypto Portfolio
              </h2>
              <p className="text-2xl text-gray-500 font-landing">
                Popcorn offers a suite of DeFi products for you to generate
                competitive returns on your crypto assets.
              </p>
              <img
                src="/images/bgPopcorn2.svg"
                alt="bgPopcorn2"
                className="mx-auto"
              ></img>
            </div>

          </div>
        </section>
        <section className="flex-grow-0 flex-shrink-0 w-full h-full py-40 bg-impact-pattern xl:py-104 impact-background">
          <div className="flex flex-row items-center justify-between w-10/12 mx-auto">
            <div className="w-7/12 2xl:w-8/12"></div>
            <div className="w-5/12 2xl:w-4/12">
              <h2 className="mb-4 text-5xl font-bold leading-snug xl:text-6xl 2xl:w-9/12">
                Create Real World Impact
              </h2>
              <p className="text-2xl text-gray-500 font-landing 2xl:w-10/12">
                Popcorn then funds social impact organizations. Choose which
                initiatives you support:
              </p>
              <ul className="mt-8 space-y-3 list-disc list-inside">
                <li className="text-2xl font-medium font-landing">
                  Environment
                </li>
                <li className="text-2xl font-medium font-landing">
                  Open Source
                </li>
                <li className="text-2xl font-medium font-landing">Education</li>
              </ul>
            </div>
          </div>
        </section>
        <section
          className="flex-grow-0 flex-shrink-0 w-full h-full mb-24 bg-popcorn3-pattern"
          style={{
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'auto',
            backgroundPosition: 'left top',
          }}
        >
          <div className="flex flex-row items-center justify-between w-10/12 pt-20 mx-auto">
            <div className="w-5/12">
              <h2 className="w-11/12 mb-4 text-5xl font-bold leading-snug xl:text-6xl">
                While Remaining Carbon Neutral
              </h2>
              <p className="text-2xl text-gray-500 font-landing">
                Popcorn calculates and neutralizes blockchain carbon emissions
                by partnering with carbon sequestration and negative emission
                projects.
              </p>
            </div>
            <div className="w-6/12">
              <img src="/images/tree.svg" alt="tree" className=""></img>
            </div>
          </div>
        </section>

        <section className="flex flex-row w-10/12 mx-auto mb-24 mt-18 xl:mt-24 ">
          <div className="relative w-1/3">
            <div className="absolute z-0 -top-18 -left-10">
              <img src="/images/ourpartnersbg.svg" style={{ zIndex: 20 }} />
            </div>
            <div className="absolute z-10">
              <h2 className="mb-4 text-5xl font-bold xl:text-6xl">
                Our Partners
              </h2>
              <p className="text-xl text-gray-500 font-landing ">
                Meet our dedicated partners.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap w-2/3 ml-10">
            <img
              src="images/investor-partners/dao.png"
              className="mx-6 mb-14"
            />
            <img
              src="images/investor-partners/olympus.png"
              className="mx-6 mb-14"
            />
            <img
              src="images/investor-partners/giveth.png"
              className="mx-6 mb-14"
            />
            <img
              src="images/investor-partners/jump.png"
              className="mx-6 mb-14"
            />
            <img
              src="images/investor-partners/newform.png"
              className="mx-6 mb-14"
            />
            <img
              src="images/investor-partners/kenetic.png"
              className="mx-6 mb-14"
            />
            <img src="images/investor-partners/bb.png" className="mx-6 mb-14" />
            <img
              src="images/investor-partners/impossible.png"
              className="mx-6 mb-14"
            />
            <img
              src="images/investor-partners/cryptofounders.png"
              className="mx-6 mb-14"
            />
            <img
              src="images/investor-partners/hestia.png"
              className="mx-6 mb-14"
            />
            <img
              src="images/investor-partners/amino.png"
              className="mx-6 mb-14"
            />
            <img
              src="images/investor-partners/cakebox.png"
              className="mx-6 mb-14"
            />
            <img
              src="images/investor-partners/lao.png"
              className="mx-6 mb-14"
            />
          </div>
        </section>

        <section className="flex flex-row w-10/12 mx-auto mt-12 mb-24 xl:mt-24">
          <div className="flex flex-wrap w-2/3">
            <a
              href="https://www.coindesk.com/tech/2021/11/18/how-daos-can-empower-advisors-and-investors/"
              target="_blank"
            >
              <img
                src="images/asseenin/coindesk.png"
                className="mx-6 opacity-50 mb-14 hover:opacity-100"
              />
            </a>
            <a
              href="https://www.investing.com/news/cryptocurrency-news/popcorn-network-integrates-with-patch-for-carbonneutral-execution-2635142"
              target="_blank"
            >
              <img
                src="images/asseenin/investing.com.png"
                className="mx-6 opacity-50 mb-14 hover:opacity-100"
              />
            </a>
            <a
              href="https://bitcoinist.com/blockchain-and-the-environment-can-they-live-in-harmony/"
              target="_blank"
            >
              <img
                src="images/asseenin/bitcoinist.png"
                className="mx-6 opacity-50 mb-14 hover:opacity-100"
              />
            </a>
            <a
              href="https://www.newsbtc.com/news/company/three-defi-platforms-changing-the-game-in-unexpected-ways/"
              target="_blank"
            >
              <img
                src="images/asseenin/newsbtc.png"
                className="mx-6 opacity-50 mb-14 hover:opacity-100"
              />
            </a>
            <a
              href="https://www.entrepreneur.com/article/394694"
              target="_blank"
            >
              <img
                src="images/asseenin/entrepreneur.png"
                className="mx-6 opacity-50 mb-14 hover:opacity-100"
              />
            </a>
            <a
              href="https://www.ibtimes.com/can-these-blockchain-solutions-replace-traditional-banking-system-3259844"
              target="_blank"
            >
              <img
                src="images/asseenin/it.png"
                className="mx-6 opacity-50 mb-14 hover:opacity-100"
              />
            </a>
            <a
              href="https://dwealth.news/2021/11/real-clear-crypto-defi-popcorn-enables-digital-assets-to-work-for-the-common-good-and-the-yield-is-like-butter/"
              target="_blank"
            >
              <img
                src="images/asseenin/dwn.png"
                className="mx-6 opacity-50 mb-14 hover:opacity-100"
              />
            </a>
            <a
              href="https://www.financemagnates.com/thought-leadership/why-is-defi-taking-over-the-banking-world/"
              target="_blank"
            >
              <img
                src="images/asseenin/magnates.png"
                className="mx-6 opacity-50 mb-14 hover:opacity-100"
              />
            </a>
            <a
              href="https://www.techtimes.com/articles/266356/20211007/popcorn-and-patch-want-to-make-crypto-carbon-neutral.htm"
              target="_blank"
            >
              <img
                src="images/asseenin/techtimes.png"
                className="mx-6 opacity-50 mb-14 hover:opacity-100"
              />
            </a>
          </div>
          <div className="relative w-1/3 ml-24">
            <div className="absolute z-10">
              <h2 className="mb-4 text-5xl font-bold xl:text-6xl">
                As Seen In
              </h2>
              <p className="text-xl text-gray-500 font-landing">
                Our media appearances
              </p>
            </div>
            <div className="absolute z-0 -top-8 right-42">
              <img src="/images/asseeninbg.svg" />
            </div>
          </div>
        </section>

        <section className="w-full bg-countdown-pattern bg-cover pt-52 pb-10">
          <div className="w-8/12 mx-auto text-center">
            <h2 className="mb-2 text-5xl font-medium leading-snug">Notify Me</h2>
            <p className="pb-4 text-2xl font-normal">
              Get early notification to be part of our journey
            </p>
            <form
              action="https://network.us1.list-manage.com/subscribe/post?u=5ce5e82d673fd2cfaf12849a5&amp;id=e85a091ed3"
              method="post"
              id="mc-embedded-subscribe-form"
              name="mc-embedded-subscribe-form"
              className="validate"
              target="_blank"
              noValidate
            >
              <div
                id="mc_embed_signup_scroll"
                className="flex flex-row items-center justify-between w-8/12 px-2 py-2 mx-auto mt-8 bg-white shadow-xl rounded-xl"
              >
                <input
                  type="email"
                  name="EMAIL"
                  className="w-10/12 p-2 mx-2 text-base text-gray-900"
                  id="mce-EMAIL"
                  placeholder="Email Address"
                  required
                />
                <div
                  style={{ position: 'absolute', left: '-5000px' }}
                  aria-hidden="true"
                >
                  <input
                    type="text"
                    name="b_5ce5e82d673fd2cfaf12849a5_e85a091ed3"
                    tabIndex={-1}
                  />
                </div>
                <div className="clear">
                  <input
                    type="submit"
                    value="Subscribe"
                    name="subscribe"
                    id="mc-embedded-subscribe"
                    className="px-4 py-2 text-base font-medium text-white bg-blue-600 cursor-pointer hover:bg-blue-500 rounded-xl"
                    readOnly
                    onClick={() =>
                      (window as unknown as any).lintrk('track', {
                        conversionId: '5594906',
                      })
                    }
                  />
                </div>
              </div>
            </form>
          </div>
        </section> */}
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
                {/* <a className="hover:text-blue-600" target="_window"> */}
                Blog
                {/* </a> */}
              </Link>
              <Link
                href="https://etherscan.io/token/0xd0cd466b34a24fcb2f87676278af2005ca8a78c4"
                passHref
              >
                {/* <a className="hover:text-blue-600" target="_window"> */}
                Popcorn (POP) Token
                {/* </a> */}
              </Link>
            </div>
            <div className="flex flex-col space-y-3 text-base">
              <p className="text-base font-medium uppercase">Connect</p>
              <Link href="https://twitter.com/Popcorn_DAO" passHref>
                {/* <a className="hover:text-blue-600" target="_window"> */}
                Twitter
                {/* </a> */}
              </Link>
              <Link href="https://discord.gg/w9zeRTSZsq" passHref>
                {/* <a className="hover:text-blue-600" target="_window"> */}
                Discord
                {/* </a> */}
              </Link>
              <Link href="https://github.com/popcorndao" passHref>
                {/* <a className="hover:text-blue-600" target="_window"> */}
                Github
                {/* </a> */}
              </Link>
            </div>
            <div className="flex flex-col space-y-3 text-base">
              <p className="text-base font-medium uppercase">Bug Bounty</p>
              {/* <Link href="https://immunefi.com/bounty/popcornnetwork" passHref>
                <a className="hover:text-blue-600">Immunefi</a>
              </Link> */}
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

    </main>
  );
};

export default IndexPage;
