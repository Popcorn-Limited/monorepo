import { Menu } from "@headlessui/react";
import { Dialog, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import MainActionButton from "@popcorn/greenfield-app/components/MainActionButton";
import Link from "next/link";
import { useRouter } from "next/router";
import DiscordIcon from "components/SVGIcons/DiscordIcon";
import MediumIcon from "components/SVGIcons/MediumIcon";
import RedditIcon from "components/SVGIcons/RedditIcon";
import TelegramIcon from "components/SVGIcons/TelegramIcon";
import TwitterIcon from "components/SVGIcons/TwitterIcon";
import YoutubeIcon from "components/SVGIcons/YoutubeIcon";
import NavbarLink from "@popcorn/greenfield-app/components/NavBar/NavbarLinks";
import { useNetwork, useAccount } from "wagmi";
import { useChainModal, useConnectModal } from "@rainbow-me/rainbowkit";
import { networkLogos } from "@popcorn/utils";
import { useMemo, useRef, useState, Fragment, useCallback } from "react";
import { useProductLinks } from "@popcorn/greenfield-app/hooks/useProductLinks";

export default function DesktopMenu(): JSX.Element {
  const { openConnectModal } = useConnectModal();
  const { openChainModal } = useChainModal();
  const { address } = useAccount();
  const router = useRouter();
  const { chain } = useNetwork();
  const logo = useMemo(() => (address && chain?.id ? networkLogos[chain.id] : networkLogos["1"]), [chain?.id, address]);
  const chainName = useMemo(() => (address && chain?.name ? chain.name : "Ethereum"), [chain?.id, address]);

  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const [menuVisible, toggleMenu] = useState<boolean>(false);

  const products = useProductLinks();
  const productLinks = products.map(link => { return { ...link, onclick: () => toggleMenu(false) } })

  return (
    <>
      <div className="flex flex-row items-center justify-between w-full py-8 px-8 z-30 ">
        <div className="flex flex-row items-center">
          <div>
            <Link href={`/`} passHref>
              <img src="/images/icons/popLogo.svg" alt="Logo" className="w-10 h-10" />
            </Link>
          </div>
        </div>
        <div className="flex flex-container h-full flex-row w-fit-content gap-x-6">
          {address ? (
            <div className={`relative flex flex-container flex-row z-10`}>
              <div
                className={`w-fit cursor-pointer h-full py-3 px-5 flex flex-row items-center justify-between border border-customLightGray rounded-4xl text-primary`}
                onClick={openChainModal}
              >
                <img src={logo} alt={chainName} className="w-5 h-5 mr-3" />|
                <p className="ml-3 leading-none">{address?.substring(0, 5)}...</p>
                <ChevronDownIcon className="w-5 h-5 ml-3 text-primary" aria-hidden="true" />
              </div>
            </div>
          ) : (
            <MainActionButton label="Connect Wallet" handleClick={openConnectModal} hidden={address ? true : false} />
          )}
          <button
            className={`text-gray-500 w-10 transform transition duration-500 relative focus:outline-none bg-white`}
            onClick={() => toggleMenu(!menuVisible)}
          >
            <span
              aria-hidden="true"
              className={`block h-1 w-8 bg-black ease-in-out rounded-3xl ${menuVisible ? "rotate-45 translate-y-1" : "-translate-y-2"
                }`}
            ></span>
            <span
              aria-hidden="true"
              className={`block h-1 w-8 bg-black ease-in-out rounded-3xl ${menuVisible ? "opacity-0" : "opacity-100"}`}
            ></span>
            <span
              aria-hidden="true"
              className={`block h-1 w-8 bg-black ease-in-out rounded-3xl ${menuVisible ? "-rotate-45 -translate-y-1" : "translate-y-2"
                }`}
            ></span>
          </button>
        </div>
      </div>
      <Transition.Root show={menuVisible} as={Fragment}>
        <Dialog as="div" className="fixed inset-0 overflow-hidden z-50" onClose={() => toggleMenu(false)}>
          <button
            className={`text-gray-500 absolute top-8 right-8 p-6 bg-[#969696] z-50 rounded-full flex justify-center items-center w-12 h-12 `}
            onClick={() => toggleMenu(!menuVisible)}
          >
            <div className="block w-10 bg-transparent">
              <span
                aria-hidden="true"
                className={`block h-1 w-8 bg-white transform transition duration-500 ease-in-out rounded-3xl ${menuVisible ? "rotate-45 translate-y-1" : "-translate-y-2"
                  }`}
              ></span>
              <span
                aria-hidden="true"
                className={`block h-1 w-8 bg-white transform transition duration-500 ease-in-out rounded-3xl ${menuVisible ? "opacity-0" : "opacity-100"
                  }`}
              ></span>
              <span
                aria-hidden="true"
                className={`block h-1 w-8 bg-white transform transition duration-500 ease-in-out rounded-3xl ${menuVisible ? "-rotate-45 -translate-y-1" : "translate-y-2"
                  }`}
              ></span>
            </div>
          </button>
          <div className="absolute bg-primary bg-opacity-75 top-0 h-full w-full backdrop-blur transition-opacity" />
          <Dialog.Overlay className="absolute inset-0" />
          <div className="fixed inset-x-0 top-0 bottom-0 w-[320px] flex bg-transparent">
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-in-out duration-500 sm:duration-700"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in-out duration-500 sm:duration-700"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <div className="h-full w-full flex flex-col justify-between pt-12 px-8 shadow-xl bg-warmGray overflow-y-scroll">
                <div className="flex flex-col w-full">
                  <div className="mb-18">
                    <Link href={`/`} passHref>
                      <img src="/images/icons/popLogo.svg" alt="Logo" className="w-10 h-10" />
                    </Link>
                  </div>
                  <div className={`mb-4`}>
                    <NavbarLink label="My Portfolio" url="/portfolio" isActive={router.pathname === "/portfolio"} onClick={() => toggleMenu(false)} />
                  </div>
                  <li className="relative flex flex-container flex-row z-10 mb-4">
                    <Menu>
                      <Menu.Button ref={menuButtonRef}>
                        <div className="group flex flex-row items-center -mr-2 leading-none">
                          <NavbarLink label="Products" isActive={router.pathname === "/x"} />
                          <ChevronDownIcon
                            strokeWidth={"10"}
                            className="fill-current font-medium text-black mt-0.5 group-hover:text-black w-5 h-5 ml-1"
                            aria-hidden="true"
                          />
                        </div>
                        <Transition
                          as={Fragment}
                          enter="transition ease-out duration-100"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-75"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95"
                        >
                          <Menu.Items className={`md:w-40 focus:outline-none gap-y-4 mt-4 flex flex-col `}>
                            {productLinks.map((option, index, { length }) => {
                              return (
                                <Menu.Item key={option.title}>
                                  {({ active }) => (
                                    <span className={`${option.hidden ? "hidden" : ""}`}>
                                      <Link
                                        href={option.url ? option.url : "#"}
                                        passHref
                                        target={"_self"}
                                        onClick={() => toggleMenu(false)}
                                        className={`group text-left md:flex md:flex-col md:justify-center cursor-pointer last:border-0 ${active ? "text-black" : "text-primary"}`}
                                      >
                                        {option.title}
                                      </Link>
                                    </span>
                                  )}
                                </Menu.Item>
                              );
                            })}
                          </Menu.Items>
                        </Transition>
                      </Menu.Button>
                    </Menu>
                  </li>
                  <div className="">
                    <NavbarLink label="Rewards" url={`/rewards`} isActive={router?.pathname.includes("/rewards")} onClick={() => toggleMenu(false)} />
                  </div>
                </div>
                <div>
                  <p className="text-primary">
                    Popcorn is an audited, non-custodial DeFi wealth manager with yield-generating products that
                    simultaneously fund nonprofit and social impact organizations.
                  </p>
                  <div className="flex justify-between pb-12 mt-11">
                    <a href="https://twitter.com/Popcorn_DAO">
                      <TwitterIcon color={"#645F4B"} size={"24"} />
                    </a>
                    <a href="https://discord.gg/w9zeRTSZsq">
                      <DiscordIcon color={"#645F4B"} size={"24"} />
                    </a>
                    <a href="https://t.me/popcorndaochat">
                      <TelegramIcon color={"#645F4B"} size={"24"} />
                    </a>
                    <a href="https://medium.com/popcorndao">
                      <MediumIcon color={"#645F4B"} size={"24"} />
                    </a>
                    <a href="https://www.reddit.com/r/popcorndao/">
                      <RedditIcon color={"#645F4B"} size={"24"} />
                    </a>
                    <a href="https://www.youtube.com/channel/UCe8n8mGG4JR7nhFT4v9APyA">
                      <YoutubeIcon color={"#645F4B"} size={"24"} />
                    </a>
                  </div>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
}
