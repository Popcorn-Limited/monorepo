import type { NextPage } from "next";

import Image from "next/image";

import { useAllVaults } from "@popcorn/components/hooks/vaults";
import SweetVault from "../components/SweetVault";
import asset_bg from "../assets/sv-bg.png";
import { ChainId, formatAndRoundBigNumber } from "@popcorn/utils";
import NoSSR from "react-no-ssr";
import NetworkFilter from "@popcorn/components/components/NetworkFilter";
import VaultHero from "@popcorn/components/components/VaultHero";
import HeroBgMobile from "@popcorn/components/public/images/swHeroBgmobile.svg";
import HeroBg from "@popcorn/components/public/images/swHeroBg.svg";
import useNetworkFilter from "hooks/useNetworkFilter";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { BigNumber, constants } from "ethers";
import { useAccount } from "wagmi";

const SUPPORTED_NETWORKS = [ChainId.ALL, ChainId.Hardhat, ChainId.Fantom]

interface Bal {
  [key: string]: BigNumber;
}

const SweetVaults: NextPage = () => {
  const { address: account } = useAccount()
  const [selectedNetworks, selectNetwork] = useNetworkFilter(SUPPORTED_NETWORKS);
  const [searchString, handleSearch] = useState("")
  const [tvl, setTvl] = useState<Bal>({});
  const [deposit, setDeposit] = useState<Bal>({});

  const { data: hhVaults = [] } = useAllVaults(selectedNetworks.includes(ChainId.Hardhat) ? ChainId.Hardhat : undefined);
  const { data: ftmVaults = [] } = useAllVaults(selectedNetworks.includes(ChainId.Fantom) ? ChainId.Fantom : undefined);
  const allVaults = [
    ...hhVaults.map(vault => { return { address: vault, chainId: ChainId.Hardhat } }),
    ...ftmVaults.map(vault => { return { address: vault, chainId: ChainId.Fantom } })
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
    <main>
      <NoSSR>
        <VaultHero
          TVL={`$${formatAndRoundBigNumber(Object.keys(tvl).reduce((total, key) => total.add(tvl[key]), constants.Zero), 18)}`}
          deposits={`$${account ? formatAndRoundBigNumber(Object.keys(deposit).reduce((total, key) => total.add(deposit[key]), constants.Zero), 18) : "-"}`}
          backgroundColorTailwind="bg-red-400"
          SUPPORTED_NETWORKS={SUPPORTED_NETWORKS}
          selectNetwork={selectNetwork}
          stripeColor="#FFA0B4"
          stripeColorMobile="white"
        />
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
        <figure className="overflow-hidden rounded-xl mt-24">
          <Image src={asset_bg} alt="" placeholder="blur" />
        </figure>
      </NoSSR>
    </main>
  );
};

export default SweetVaults;
