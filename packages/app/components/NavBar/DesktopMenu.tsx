import { Menu } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/solid";
import MainActionButton from "@popcorn/app/components/MainActionButton";
import TertiaryActionButton from "@popcorn/app/components/TertiaryActionButton";
import Link from "next/link";
import { useRouter } from "next/router";
import DropDownComponent from "@popcorn/app/components/NavBar/DropDownComponent";
import GetPopMenu from "@popcorn/app/components/NavBar/GetPopMenu";
import NavbarLink from "@popcorn/app/components/NavBar/NavbarLinks";
import { useDisconnect, useNetwork } from "wagmi";
import { useChainModal, useConnectModal } from "@rainbow-me/rainbowkit";
import { networkLogos } from "@popcorn/utils";
import { useIsConnected } from "@popcorn/app/hooks/useIsConnected";
import { useMemo, useRef } from "react";
import { useProductLinks } from "@popcorn/app/hooks/useProductLinks";

export default function DesktopMenu(): JSX.Element {
  const { openConnectModal } = useConnectModal();
  const { disconnect } = useDisconnect();
  const { openChainModal } = useChainModal();
  const router = useRouter();
  const { chain } = useNetwork();
  const isConnected = useIsConnected();
  const logo = useMemo(
    () => (isConnected && chain?.id ? networkLogos[chain.id] : networkLogos["1"]),
    [chain?.id, isConnected],
  );
  const chainName = useMemo(() => (isConnected && chain?.name ? chain.name : "Ethereum"), [chain?.id, isConnected]);
  const productLinks = useProductLinks();
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="flex flex-row items-center justify-between w-full p-8 z-30 ">
      <div className="flex flex-row items-center">
        <div>
          <Link href={`/`} passHref>
            <img src="/images/icons/popLogo.svg" alt="Logo" className="w-10 h-10" />
          </Link>
        </div>
      </div>
      <div className="flex flex-container flex-row w-fit-content gap-6 md:gap-0 md:space-x-6">
        <ul className="flex items-center flex-row gap-16 md:gap-0 md:space-x-16 mr-10">
          <li>
            <NavbarLink label="Popcorn" url="/" isActive={router.pathname === "/"} />
          </li>
          <li>
            <NavbarLink label="Portfolio" url="/portfolio" isActive={router.pathname === "/portfolio"} />
          </li>
          <li className="relative flex flex-container flex-row z-10">
            <Menu>
              <Menu.Button ref={menuButtonRef}>
                <div className="group flex flex-row items-center -mr-2">
                  <p
                    className={` text-primary leading-5 text-lg 
										hover:text-black cursor-pointer`}
                  >
                    Products
                  </p>
                  <ChevronDownIcon
                    className="fill-current text-primary group-hover:text-gray mb-0.5 w-5 h-5 ml-0.5"
                    aria-hidden="true"
                  />
                </div>
                <DropDownComponent options={productLinks} menuRef={menuButtonRef} />
              </Menu.Button>
            </Menu>
          </li>
          <li>
            <NavbarLink label="Rewards" url={`/rewards`} isActive={router.pathname.includes("/rewards")} />
          </li>
        </ul>

        <div className="relative flex flex-container flex-row z-10">
          <Menu>
            <Menu.Button>
              <div className="w-36 cursor-pointer h-full py-3 px-5 flex flex-row items-center justify-between border border-customLightGray rounded-4xl text-primary">
                <img src="/images/icons/popLogo.svg" className="w-5 h-5" />
                <p className="ml-3 leading-none">POP</p>
                <ChevronDownIcon className="w-5 h-5 ml-4 text-primary" aria-hidden="true" />
              </div>
              <GetPopMenu />
            </Menu.Button>
          </Menu>
        </div>
        <div className={`relative flex flex-container flex-row z-10 ${isConnected ? "" : "hidden"}`}>
          <div
            className={`h-full px-6 flex flex-row items-center justify-between border border-customLightGray rounded-4xl text-primary cursor-pointer`}
            onClick={openChainModal}
          >
            <img src={logo} alt={chainName} className="w-4.5 h-4 mr-4" />
            <p className="leading-none mt-0.5">{chainName}</p>
          </div>
        </div>
        <MainActionButton label="Connect Wallet" handleClick={openConnectModal} hidden={isConnected ? true : false} />
        <TertiaryActionButton label="Disconnect" handleClick={disconnect} hidden={isConnected ? false : true} />
      </div>
    </div>
  );
}
