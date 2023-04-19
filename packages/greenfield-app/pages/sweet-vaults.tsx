import type { NextPage } from "next";

import Image from "next/image";

import { useAllVaults } from "@popcorn/components/hooks/vaults";
import SweetVault from "../components/SweetVault";
import asset_bg from "../assets/sv-bg.png";
import { ChainId, formatAndRoundBigNumber } from "@popcorn/utils";
import NoSSR from "react-no-ssr";
import HeroSection from "@popcorn/components/components/HeroSection";
import useNetworkFilter from "hooks/useNetworkFilter";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { BigNumber, constants } from "ethers";
import { useAccount } from "wagmi";

const SUPPORTED_NETWORKS = [
  ChainId.ALL,
  ChainId.Ethereum,
  ChainId.Polygon,
  ChainId.Optimism,
  // ChainId.Fantom,
  ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === "true" ? [ChainId.Hardhat] : [])
]

interface Bal {
  [key: string]: BigNumber;
}

const SweetVaults: NextPage = () => {
  const { address: account } = useAccount()
  const [selectedNetworks, selectNetwork] = useNetworkFilter(SUPPORTED_NETWORKS);
  const [searchString, handleSearch] = useState("")
  const [tvl, setTvl] = useState<Bal>({});
  const [deposit, setDeposit] = useState<Bal>({});

  const { data: ethVaults = [] } = useAllVaults(selectedNetworks.includes(ChainId.Ethereum) ? ChainId.Ethereum : undefined);
  const { data: polyVaults = [] } = useAllVaults(selectedNetworks.includes(ChainId.Polygon) ? ChainId.Polygon : undefined);
  const { data: ftmVaults = [] } = useAllVaults(selectedNetworks.includes(ChainId.Fantom) ? ChainId.Fantom : undefined);
  const { data: opVaults = [] } = useAllVaults(selectedNetworks.includes(ChainId.Optimism) ? ChainId.Optimism : undefined);
  const allVaults = [
    ...ethVaults.map(vault => { return { address: vault, chainId: ChainId.Ethereum } }),
    ...polyVaults.map(vault => { return { address: vault, chainId: ChainId.Polygon } }),
    ...ftmVaults.map(vault => { return { address: vault, chainId: ChainId.Fantom } }),
    ...opVaults.map(vault => { return { address: vault, chainId: ChainId.Optimism } })
  ]


  const addToTvl = (key: string, value?: BigNumber) => {
    if (value?.gt(0)) {
      setTvl((balances) => ({
        ...balances,
        [key]: value,
      }));
    }
  };

  const addToDeposit = (key: string, value?: BigNumber) => {
    if (value?.gt(0)) {
      setDeposit((balances) => ({
        ...balances,
        [key]: value,
      }));
    }
  };

  return (
    <NoSSR>
      <HeroSection
        title="Sweet Vaults"
        description="Add liquidity to earn stablecoin rewards and be part at creating social impact."
        info1={{ title: 'TVL', value: `$${formatAndRoundBigNumber(Object.keys(tvl).reduce((total, key) => total.add(tvl[key]), constants.Zero), 18)}` }}
        info2={{ title: 'Deposits', value: `$${account ? formatAndRoundBigNumber(Object.keys(deposit).reduce((total, key) => total.add(deposit[key]), constants.Zero), 18) : "-"}` }}
        backgroundColorTailwind="bg-red-400"
        SUPPORTED_NETWORKS={SUPPORTED_NETWORKS}
        selectNetwork={selectNetwork}
        stripeColor="#FFA0B4"
        stripeColorMobile="white"
      />
      <section className="mt-8 mb-10">
        <div className="w-full md:w-96 flex px-5 py-1 items-center rounded-lg border border-customLightGray">
          <MagnifyingGlassIcon className="w-8 h-8 text-gray-400" />
          <input
            className="w-10/12 md:w-80 focus:outline-none border-0 text-gray-500 leading-none mt-1"
            type="text"
            placeholder="Search..."
            onChange={(e) => handleSearch(e.target.value.toLowerCase())}
            defaultValue={searchString}
          />
        </div>
      </section>
      <section className="flex flex-col gap-8">
        {allVaults.map((vault) => {
          return <SweetVault
            key={`sv-${vault.address}-${vault.chainId}`}
            chainId={vault.chainId}
            vaultAddress={vault.address}
            searchString={searchString}
            addToTVL={addToTvl}
            addToDeposit={addToDeposit}
          />;
        })}
      </section>
    </NoSSR>
  );
};

export default SweetVaults;
