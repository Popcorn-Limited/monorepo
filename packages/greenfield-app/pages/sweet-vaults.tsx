import type { NextPage } from "next";

import Image from "next/image";

import { useAllVaults } from "@popcorn/components/hooks/vaults";
import SweetVault from "../components/SweetVault";
import asset_bg from "../assets/sv-bg.png";
import { ChainId, formatAndRoundBigNumber } from "@popcorn/utils";
import NoSSR from "react-no-ssr";
import NetworkFilter from "@popcorn/components/components/NetworkFilter";
import { parseUnits } from "ethers/lib/utils.js";
import HeroBgMobile from "@popcorn/components/public/images/swHeroBgmobile.svg";
import HeroBg from "@popcorn/components/public/images/swHeroBg.svg";
import useNetworkFilter from "hooks/useNetworkFilter";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

const SUPPORTED_NETWORKS = [ChainId.ALL, ChainId.Hardhat]

const SweetVaults: NextPage = () => {
  const [selectedNetworks, selectNetwork] = useNetworkFilter(SUPPORTED_NETWORKS);
  const [searchString, handleSearch] = useState("")

  const { data: hhVaults = [] } = useAllVaults(selectedNetworks.includes(ChainId.Hardhat) ? ChainId.Hardhat : undefined);
  const allVaults = [...hhVaults]

  return (
    <main>
      <NoSSR>
        <section className="bg-red-400 overflow-hidden bg-opacity-[15%] flex flex-col md:flex-row justify-between px-8 pt-10 pb-16 md:pb-[14px] relative -mt-5 xl:rounded-2xl">
          <div className="relative z-[1]">
            <h1 className="text-3xl md:text-4xl font-normal m-0 leading-[38px] md:leading-11 mb-4">
              Sweet Vaults
            </h1>
            <p className="text-base text-primaryDark">
              Add liquidity to earn stablecoin rewards and be part at creating social impact.
            </p>
            <div className="hidden md:block mt-6">
              <NetworkFilter supportedNetworks={SUPPORTED_NETWORKS} selectNetwork={selectNetwork} />
            </div>
          </div>
          <div className="absolute bottom-0 left-32 hidden md:block">
            <Image src={HeroBg} alt="" width={100} height={100} className="w-full h-[300px]" />
          </div>
          <div className="absolute right-5 top-16 md:hidden">
            <Image src={HeroBgMobile} alt="" width={100} height={100} className="w-full h-[126px]" />
          </div>
          <div>
            <div className="grid grid-cols-12 gap-4 md:gap-8 mt-8 md:mt-0">
              <div className="col-span-5 md:col-span-3" />
              <div className="col-span-5 md:col-span-3" />
              <div className="col-span-5 md:col-span-3">
                <p className="leading-6 text-base font-light md:font-normal">TVL</p>
                <div className="text-3xl font-light md:font-medium">${formatAndRoundBigNumber(parseUnits("1000"), 18)}</div>
              </div>
              <div className="col-span-5 md:col-span-3">
                <p className="leading-6 text-base font-light md:font-normal">Deposits</p>
                <div className="text-3xl font-light md:font-medium">${formatAndRoundBigNumber(parseUnits("10"), 18)}</div>
              </div>
            </div>
            <div className="md:hidden">
              <NetworkFilter supportedNetworks={SUPPORTED_NETWORKS} selectNetwork={selectNetwork} />
            </div>
            <div className="hidden md:flex flex-col items-end mt-16">
            </div>
          </div>
        </section>

        <section className="mt-8 mb-10">
          <div className="w-full md:w-96 flex px-5 py-1 items-center rounded-lg border border-customLightGray">
            <MagnifyingGlassIcon className="w-8 h-8 text-gray-400" />
            <input
              className="w-10/12 md:w-80 focus:outline-none border-0 text-gray-500 leading-none mt-1"
              type="text"
              placeholder="Search..."
              onChange={(e) => handleSearch(e.target.value.toLowerCase())}
              value={searchString}
            />
          </div>
        </section>

        <section className="flex flex-col gap-8">
          {allVaults.map((vaultAddress) => {
            return <SweetVault key={`sv-${vaultAddress}`} chainId={ChainId.Hardhat} vaultAddress={vaultAddress} searchString={searchString} />;
          })}
        </section>

        <figure className="overflow-hidden rounded-xl mt-24">
          <Image src={asset_bg} alt="" placeholder="blur" />
        </figure>
      </NoSSR>
    </main>
  );
};

export default SweetVaults;
