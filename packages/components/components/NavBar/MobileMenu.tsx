import { Dialog, Transition } from "@headlessui/react";
import { ChainId, networkLogos, networkMap } from "@popcorn/utils";
import MainActionButton from "@popcorn/components/components/MainActionButton";
import PopUpModal from "@popcorn/components/components/Modal/PopUpModal";
import DiscordIcon from "@popcorn/components/components/SVGIcons/DiscordIcon";
import MediumIcon from "@popcorn/components/components/SVGIcons/MediumIcon";
import RedditIcon from "@popcorn/components/components/SVGIcons/RedditIcon";
import TelegramIcon from "@popcorn/components/components/SVGIcons/TelegramIcon";
import TwitterIcon from "@popcorn/components/components/SVGIcons/TwitterIcon";
import YoutubeIcon from "@popcorn/components/components/SVGIcons/YoutubeIcon";
import TertiaryActionButton from "@popcorn/components/components/TertiaryActionButton";
import Link from "next/link";
import { useRouter } from "next/router";
import { Fragment, useEffect, useMemo, useState } from "react";
import MobileProductsMenu from "@popcorn/components/components/NavBar/MobileProductsMenu";
import NavbarLink from "@popcorn/components/components/NavBar/NavbarLinks";
import { useChainModal, useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount, useDisconnect, useNetwork } from "wagmi";
import { useProductLinks } from "@popcorn/components/hooks/useProductLinks";
import { useFeatures } from "@popcorn/components/hooks/useFeatures";

const networkData = [
  {
    id: JSON.stringify(ChainId.Ethereum),
    value: networkMap[ChainId.Ethereum],
  },
  {
    id: JSON.stringify(ChainId.Arbitrum),
    value: networkMap[ChainId.Arbitrum],
  },
  {
    id: JSON.stringify(ChainId.BNB),
    value: networkMap[ChainId.BNB],
  },
  {
    id: JSON.stringify(ChainId.Polygon),
    value: networkMap[ChainId.Polygon],
  },
];

export const MobileMenu: React.FC = () => {
  const { openConnectModal } = useConnectModal();
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { openChainModal } = useChainModal();
  const { chain } = useNetwork();

  const [menuVisible, toggleMenu] = useState<boolean>(false);
  const [productsMenuVisible, toggleProductsMenu] = useState<boolean>(false);
  const [availableNetworks, setAvailableNetworks] = useState(networkData);
  const router = useRouter();
  const products = useProductLinks();
  const [showPopUp, setShowPopUp] = useState<boolean>(false);

  const logo = useMemo(() => (address && chain?.id ? networkLogos[chain.id] : networkLogos["1"]), [chain?.id, address]);
  const chainName = useMemo(() => (address && chain?.name ? chain.name : "Ethereum"), [chain?.id, address]);

  const {
    features: { showLocalNetwork },
  } = useFeatures();

  useEffect(() => {
    if (showLocalNetwork && availableNetworks.length <= networkData.length) {
      setAvailableNetworks([
        ...availableNetworks,
        {
          id: JSON.stringify(ChainId.Goerli),
          value: networkMap[ChainId.Goerli],
        },
        {
          id: JSON.stringify(ChainId.Localhost),
          value: networkMap[ChainId.Localhost],
        },
      ]);
    }
  }, []);

  const closePopUp = () => {
    setShowPopUp(false);
  };

  function handleCloseAll() {
    toggleMenu(false);
    toggleProductsMenu(false);
  }

  return (
    <>
      <div className="flex flex-row justify-between items-center px-6 py-6 font-khTeka">
        <div>
          <Link href={`/`} passHref>
            <img src="/images/icons/popLogo.svg" alt="Logo" className="w1010 h-10" />
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <div className={`relative w-full ${!menuVisible ? "" : "hidden"}`}>
            <div
              className={`w-full px-4 py-3 flex flex-row items-center justify-center border border-light bg-white rounded-3xl cursor-pointer relative gap-2`}
              onClick={() => setShowPopUp(true)}
            >
              <img src={logo} alt={""} className="w-3 h-3 object-contain" />
              <span
                className={`${
                  address ? "border-green-400 bg-green-400" : "bg-white border-gray-300"
                } block h-2 w-2 rounded-full border`}
              ></span>
            </div>
          </div>
          <button
            className="text-gray-500 w-10 relative focus:outline-none bg-white"
            onClick={() => toggleMenu(!menuVisible)}
          >
            <div className="block w-10">
              <span
                aria-hidden="true"
                className={`block h-1 w-10 bg-black transform transition duration-500 ease-in-out rounded-3xl ${
                  menuVisible ? "rotate-45 translate-y-1" : "-translate-y-2.5"
                }`}
              />
              <span
                aria-hidden="true"
                className={`block h-1 w-10 bg-black transform transition duration-500 ease-in-out rounded-3xl ${
                  menuVisible ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                aria-hidden="true"
                className={`block h-1 w-10 bg-black transform transition duration-500 ease-in-out rounded-3xl ${
                  menuVisible ? "-rotate-45 -translate-y-1" : "translate-y-2.5"
                }`}
              />
            </div>
          </button>
        </div>
      </div>
      <Transition.Root show={menuVisible} as={Fragment}>
        <Dialog as="div" className="fixed inset-0 overflow-hidden z-50" onClose={() => toggleMenu(false)}>
          <div className="absolute inset-0 overflow-hidden">
            <Dialog.Overlay className="absolute inset-0" />
            <div className="fixed inset-x-0 top-20 bottom-0 max-w-full flex bg-white">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <div className="w-screen">
                  <div className="h-full w-full flex flex-col justify-between pt-18 px-6 shadow-xl bg-white overflow-y-scroll">
                    <div className="flex flex-col w-full">
                      <div className="py-6">
                        <NavbarLink
                          label="Popcorn"
                          url="/"
                          isActive={router?.pathname === `/`}
                          onClick={() => toggleMenu(false)}
                        />
                      </div>
                      <div className={`py-6`}>
                        <NavbarLink
                          label="Portfolio"
                          url="/portfolio"
                          isActive={router.pathname === "/portfolio"}
                          onClick={() => toggleMenu(false)}
                        />
                      </div>
                      <div className="py-6">
                        {products.length < 2 ? (
                          <NavbarLink
                            label={products[0].title}
                            isActive={false}
                            url={products[0].url}
                            onClick={() => closePopUp()}
                          />
                        ) : (
                          <NavbarLink label="Products" isActive={false} onClick={() => toggleProductsMenu(true)} />
                        )}
                      </div>
                      <div className="py-6">
                        <NavbarLink
                          label="Rewards"
                          url={`/rewards`}
                          isActive={router?.pathname.includes("/rewards")}
                          onClick={() => toggleMenu(false)}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="grid grid-cols-12 mt-12">
                        <div className="col-span-6">
                          <p className="text-gray-900 font-medium leading-6 tracking-1">Links</p>
                          <div className="flex flex-col">
                            <Link href="/" className=" text-primary leading-6 mt-4">
                              Popcorn
                            </Link>
                            <Link
                              href="/docs/Popcorn_whitepaper_v1.pdf"
                              target="_blank"
                              className=" text-primary leading-6 mt-4"
                            >
                              Whitepaper
                            </Link>
                          </div>
                        </div>

                        <div className="col-span-6">
                          <p className="text-gray-900 font-medium leading-6 tracking-1">Bug Bounty</p>
                          <div className="flex flex-col">
                            <Link
                              href="https://immunefi.com/bounty/popcornnetwork"
                              className=" text-primary leading-6 mt-4"
                            >
                              Immunefi
                            </Link>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between pb-12 mt-11">
                        <a href="https://twitter.com/Popcorn_DAO">
                          <TwitterIcon color={"#645F4B"} size={"30"} />
                        </a>
                        <a href="https://discord.gg/w9zeRTSZsq">
                          <DiscordIcon color={"#645F4B"} size={"30"} />
                        </a>
                        <a href="https://t.me/popcorndaochat">
                          <TelegramIcon color={"#645F4B"} size={"30"} />
                        </a>
                        <a href="https://medium.com/popcorndao">
                          <MediumIcon color={"#645F4B"} size={"30"} />
                        </a>
                        <a href="https://www.reddit.com/r/popcorndao/">
                          <RedditIcon color={"#645F4B"} size={"30"} />
                        </a>
                        <a href="https://www.youtube.com/channel/UCe8n8mGG4JR7nhFT4v9APyA">
                          <YoutubeIcon color={"#645F4B"} size={"30"} />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      <PopUpModal visible={showPopUp} onClosePopUpModal={closePopUp}>
        <div>
          <p className="text-black mb-3">Connect to Wallet</p>
          <MainActionButton label="Connect Wallet" handleClick={openConnectModal} hidden={!!address} />
          <TertiaryActionButton label="Disconnect" handleClick={disconnect} hidden={!address} />
          <hr className="my-6" />
          <p className="text-black mb-3">Select Network</p>
          <div
            className={`h-12 px-6 flex flex-row items-center justify-center border border-customLightGray rounded-4xl text-primary cursor-pointer`}
            onClick={openChainModal}
          >
            <img src={logo} alt={chainName} className="w-4.5 h-4 mr-4" />
            <p className="leading-none mt-0.5">{chainName}</p>
          </div>
        </div>
      </PopUpModal>
      <Transition.Root show={productsMenuVisible} as={Fragment}>
        <Dialog as="div" className="fixed inset-0 overflow-hidden z-50" onClose={() => toggleMenu(false)}>
          <div className="absolute inset-0 overflow-hidden">
            <Dialog.Overlay className="absolute inset-0" />

            <div className="fixed inset-x-0 bottom-0 max-w-full flex bg-white">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <div className="w-screen">
                  <MobileProductsMenu onSelect={handleCloseAll} onClose={() => toggleProductsMenu(false)} />
                </div>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
};
