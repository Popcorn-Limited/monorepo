import { Menu, Transition } from "@headlessui/react";
import { ChainId } from "@popcorn/utils";
import useWeb3 from "@popcorn/app/hooks/useWeb3";
import { useChainIdFromUrl } from "@popcorn/app/hooks/useChainIdFromUrl";
import useContractMetadata from "@popcorn/app/hooks/useContractMetadata";
import { useDeployment } from "@popcorn/app/hooks/useDeployment";
import { Fragment } from "react";
import { useAccount } from "wagmi";

interface GetPopMenuProps {}

const GetPopMenu: React.FC<GetPopMenuProps> = () => {
  const { connector } = useAccount();
  const chainId = useChainIdFromUrl();
  const { pop } = useDeployment(chainId);
  const popMetadata = useContractMetadata(pop, chainId);
  const buyLink = chainId === ChainId.Polygon ? popMetadata?.buyLinkPolygon : popMetadata?.buyLinkEthereum;
  const metaMaskConnected = connector?.name === "MetaMask";
  const popPoolExists = [ChainId.Ethereum, ChainId.Hardhat, ChainId.Localhost, ChainId.Polygon].includes(chainId);

  return (
    <Transition
      as={Fragment}
      enter="transition ease-out duration-100"
      enterFrom="transform opacity-0 scale-95"
      enterTo="transform opacity-100 scale-100"
      leave="transition ease-in duration-75"
      leaveFrom="transform opacity-100 scale-100"
      leaveTo="transform opacity-0 scale-95"
    >
      <Menu.Items className="absolute top-14 -right-5 w-44 bg-white rounded-3xl border-gray-200 border focus:outline-none">
        {popPoolExists && (
          <Menu.Item>
            {({ active }) => (
              <a
                className={`${active ? "bg-warmGray text-black font-medium" : "bg-white text-primary "} ${
                  metaMaskConnected ? "rounded-t-3xl border-b" : "rounded-3xl"
                } group text-center px-2 pt-4 pb-2 block w-full h-14 cursor-pointer  border-gray-200`}
                href={buyLink}
                target="_blank"
              >
                <p className={`text-left text-lg px-6 ${active ? "font-medium" : ""}`}>Buy POP</p>
              </a>
            )}
          </Menu.Item>
        )}
        {metaMaskConnected && (
          <Menu.Item>
            {({ active }) => (
              <div
                className={`${active ? "bg-warmGray text-black font-medium" : "bg-white text-primary "} ${
                  popPoolExists ? "rounded-b-3xl" : "rounded-3xl"
                } group px-2 pt-4 w-full h-14 cursor-pointer`}
                onClick={async () =>
                  await window.ethereum.request({
                    // @ts-ignore
                    method: "wallet_watchAsset",
                    params: {
                      // @ts-ignore
                      type: "ERC20",
                      options: {
                        address: pop,
                        symbol: "POP",
                        decimals: 18,
                        image: "https://www.popcorn.network/images/icons/circle/circle_yellow_64x64.png",
                      },
                    },
                  })
                }
              >
                <p className={`text-left text-lg px-6 ${active ? "font-medium" : ""}`}>Add to Wallet</p>
              </div>
            )}
          </Menu.Item>
        )}
      </Menu.Items>
    </Transition>
  );
};

export default GetPopMenu;
