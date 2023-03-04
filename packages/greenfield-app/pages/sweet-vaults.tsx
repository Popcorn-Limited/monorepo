import type { NextPage } from "next";

import Image from "next/image";

import { useAllVaults } from "@popcorn/components/hooks/vaults";
import Title from "@popcorn/components/components/content/Title";
import SweetVault from "../components/SweetVault";
import asset_bg from "../assets/sv-bg.png";
import { ChainId } from "@popcorn/utils";

const SweetVaults: NextPage = () => {
  const { data: allVaults = [] } = useAllVaults(ChainId.Hardhat);

  return (
    <main>
      <section className="mb-20">
        <Title>Sweet Vaults</Title>
        <p className="max-w-sm">Add liquidity to earn stablecoin rewards and be part at creating social impact.</p>
      </section>

      <section className="flex flex-col gap-8">
        {allVaults.map((vaultAddress) => {
          return <SweetVault key={`sv-${vaultAddress}`} chainId={ChainId.Hardhat} vaultAddress={vaultAddress} />;
        })}
      </section>

      <figure className="overflow-hidden rounded-xl mt-24">
        <Image src={asset_bg} alt="" placeholder="blur" />
      </figure>
    </main>
  );
};

export default SweetVaults;
