import { useRouter } from "next/router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from 'next/link';
import DesktopMenu from '../components/DesktopMenu';
import MainActionButton from "../components/Common/MainActionButton";
import StatusWithLabel from "components/Common/StatusWithLabel";
import SliderContainer from "components/SliderContainer";
import GithubIcon from "@popcorn/components/components/SVGIcons/GithubIcon";
import DiscordIcon from "@popcorn/components/components/SVGIcons/DiscordIcon";
import TwitterIcon from "@popcorn/components/components/SVGIcons/TwitterIcon";
import MediumIcon from "@popcorn/components/components/SVGIcons/MediumIcon";
import SecondaryActionButton from "@popcorn/app/components/SecondaryActionButton";
import Slider from "react-slick";

const activeDot = "bg-white";
let inactiveDot = "bg-white bg-opacity-50";

const IndexPage = () => {
  const router = useRouter();

  useEffect(() => {
    if (window.location.pathname !== "/") {
      router.replace(window.location.pathname);
    }
  }, [router.pathname]);

  // useEffect(() => {
  //   const scrollContainer = document.querySelector('#scrollContainer');
  //   scrollContainer.addEventListener('wheel', (event) => {
  //     event.preventDefault();

  //     console.log(event)

  //     scrollContainer.scrollBy({
  //       left: event?.scrollLeft + event?.deltaY

  //     });
  //   });
  // }, []);

  const AMOUNT_TO_SHIFT = '35.7vw';

  const [locked, setLocked] = useState(Date.now());
  const myStateRef = useRef(locked);
  const setMyState = data => {
    myStateRef.current = data;
    setLocked(data);
  };

  const [scrollPos, setScrollPos] = useState(0);
  const scrollRef = useRef(scrollPos);
  const _setScrollPos = data => {
    scrollRef.current = data;
    setScrollPos(data);
  };

  const [freeze, setFreeze] = useState(false);
  const freezeRef = useRef(freeze);
  const _setFreeze = data => {
    freezeRef.current = data;
    setFreeze(data);
  };




  useEffect(() => {
    const scrollContainer = document.getElementById('scrollContainer');
    const prevSection = document.getElementById('prev');
    const dowell = document.getElementById('do-well');
    const titleElementForTrigger = document.getElementById('titlex');
    const nextSection = document.getElementById('xoxop');


    window.addEventListener('scroll', (event) => {
      event.preventDefault();
      const dateNow = Date.now();
      // let currentScrollPos = window.scrollY;
      // const scrollDown = currentScrollPos - scrollRef.current > 0;
      // _setScrollPos(currentScrollPos);

      // // console.log(dowell.getBoundingClientRect(), currentScrollPos, 'lol');
      // // console.log(event, 'event')
      // if (dateNow - myStateRef.current > 100) {
      if (dateNow - myStateRef.current > 900) {
        if (dowell.getBoundingClientRect().bottom < 50 && titleElementForTrigger.getBoundingClientRect().top > 300) {
          setMyState(dateNow);
          // document.body.style.overflow = 'hidden';
          titleElementForTrigger.scrollIntoView({ behavior: 'smooth' });
        }

        if (titleElementForTrigger.getBoundingClientRect().top < -900) {
          setMyState(dateNow);
          titleElementForTrigger.scrollIntoView({ behavior: 'smooth' });
        }
      }
      // setFreeze(false);
      // }
    }, { passive: true })

    // });



    console.log(titleElementForTrigger.getBoundingClientRect(), 'title')
    scrollContainer.addEventListener('wheel', (event) => {
      event.preventDefault();
      const dateNow = Date.now();


      if (dateNow - myStateRef.current > 30) {
        if (event.deltaY > 0) {

          if (scrollContainer.style.transform === `translateX(-${AMOUNT_TO_SHIFT})`) {
            console.log('oi')
            return nextSection.scrollIntoView({ behavior: 'smooth' });
          } else {
            setMyState(dateNow);
            scrollContainer.style.transform = `translateX(-${AMOUNT_TO_SHIFT})`;

          }

        } else if (event.deltaY < 0) {

          if (scrollContainer.style.transform === `translateX(0px)`) {
            return prevSection.scrollIntoView({ behavior: 'smooth' });

          } else {
            setMyState(dateNow);
            scrollContainer.style.transform = `translateX(0px)`;
            // setTimeout(() => { setMyState(false) }, 2000)
          }
        }
      } else {
        // setTimeout(() => { setMyState(false) }, 20000)
        setMyState(dateNow)
      }
    });
  }, [locked]);


  const [currentSlide, setCurrentSlide] = useState(0);

  const customSlider = useRef(null);

  const gotoSlide = (id) => {
    setCurrentSlide(id);
    customSlider.current.slickGoTo(id);
  };

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: false,
    easing: "easeInOut",
    pauseOnHover: false,
    beforeChange: (oldIndex: number, newIndex: number) => {
      setCurrentSlide(newIndex);
    },
  };

  const tutorialSteps: Array<{ title: string; content: string }> = [
    {
      title: "Step 1 - Begin the Minting Process",
      content:
        "First connect your wallet. Then select the token you would like to deposit from the dropdown, enter the deposit amount and click ‘Mint’. If you are depositing for the first time, you’ll need to approve the contract.",
    },
    {
      title: "Step 2 – Wait for the batch to process",
      content: `Your deposits will be held in Butters batch processing queue. Note: To minimise gas fees, deposits are processed approximately every 24 hours. You are able to withdraw your deposits during this phase.`,
    },
    {
      title: `Step 3 – Claim your minted Butter,`,
      content: `Once the batch has been processed, you will be able to claim the new minted "Butter"`,
    },
  ];




  return (
    <div className="absolute left-0 flex flex-col">
      <div className="flex-col w-full h-full smmd:h-screen min-h-[600px] w-screen relative flex smmd:mb-[100vh]">
        <DesktopMenu />
        <div className="flex flex-row justify-end absolute right-0 top-96 smmd:top-24">
          <img alt="" className="smmd:w-[50vw] w-[60vw] smmd:max-w-[700px] smmd:max-h-[80vh]" src="/images/icons/greenPopLogo.svg" />
        </div>
        <section id="prev" className="relative px-6 smmd:px-8 smmd:mb-0 smmd:h-[90vh] justify-between items-start w-full overflow-scroll">
          <div className="flex flex-col items-start smmd:h-full smmd:w-full pb-16 smmd:pb-0 mx-auto min-w-480 lg:flex-row">
            <div className=" text-center z-20 smmd:text-left smmd:mx-0 flex flex-col justify-around h-full w-full">
              <h1 id="do-well" className="mb-6 leading-[60px] smmd:leading-[72px] font-normal min-h-[80px] max-w-[450px] lglaptop:max-w-[900px] smmd:max-w-[700px] text-left text-5xl smmd:text-6xl lglaptop:text-[96px] lglaptop:leading-[90px] smmd:w-1/2 mt-24 smmd:mt-0 ">
                Do well and do good together with Popcorn’s innovative DeFi solutions
              </h1>
              <div className="w-fit flex mb-48 smmd:mb-0">
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
              <div className="flex smmd:flex-row items-start smmd:w-full smmd:justify-between flex-col gap-y-20 mb-16 smmd:mb-8">
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

      <section className="px-8">
        <div className="mt-[200px] mb-18 flex flex-col relative">
          <p id="titlex" className="text-6xl">Earn high returns on your crypto while funding public goods</p>
          <div id="scrollContainer" className="flex flex-row h-[650px] overflow-x-auto transition-transform">
            <div className="bg-black w-[467px] h-full mr-12 shrink-0">

            </div>

            <div className="flex flex-col w-screen">
              <div className="flex flex-col w-[338px] mb-[100px]">
                <p className="text-lg">It's now easy to deposit your crypto, optimise your yield, and create positive global impact at the same time.</p>
                <div className="flex flex-row border-x-0 border-y-customLightGray border-b-2">
                  <p className="px-1 py-2 w-full mt-2 leading-7">Create Account</p>
                  <SecondaryActionButton label="" />
                </div>
              </div>

              <div className="w-full h-full flex-row flex gap-x-10 w-screen">
                <div className="w-full h-full bg-black">

                </div>

                <div className="w-full h-full bg-black">

                </div>

                <div className="w-full h-full bg-black">

                </div>
              </div>

            </div>
          </div>
        </div>
      </section >


      <div className="relative">
        <Slider {...settings} ref={(slider) => (customSlider.current = slider)}>
          {tutorialSteps.map((step, index) => (
            <div className="" key={index}>
              <div className="bg-customPurple rounded-lg h-110 p-8 flex flex-col justify-between text-white">
                <h6>How It Works</h6>

                <div className="py-24">
                  <h3 className="font-medium text-2xl">{step.title}</h3>
                  <p>{step.content}</p>
                </div>

                <div className="flex justify-end pt-6 gap-5 md:gap-0 md:space-x-5">
                  {tutorialSteps.map((steps, index) => (
                    <div
                      className={`${currentSlide == index ? activeDot : inactiveDot} rounded-full h-3 w-3 transition-all`}
                      onClick={() => gotoSlide(index)}
                      key={index}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>






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
