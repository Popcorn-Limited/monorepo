import type { NextPage } from "next";
import type { Pop } from "@popcorn/components/lib/types";

import Image from "next/image";

import { useNamedAccounts } from "@popcorn/components/lib/utils";
import Title from "@popcorn/components/components/content/Title";
import SweetVault from "../components/SweetVault";
import asset_bg from "../assets/sv-bg.png";

const SweetVaults: NextPage = () => {
  const sweetVaults = useNamedAccounts("1337", ["sEthSweetVault"]) as Pop.NamedAccountsMetadata[];

  return (
    <main>
      <section className="mb-20">
        <Title>Sweet Vaults</Title>
        <p className="max-w-sm">Add liquidity to earn stablecoin rewards and be part at creating social impact.</p>
      </section>

      <section className="flex flex-col gap-8">
        {sweetVaults.map((vault) => {
          return <SweetVault vault={vault} key={`vault-${vault.address}`} />;
        })}
      </section>

      <figure className="overflow-hidden rounded-xl mt-24">
        <Image src={asset_bg} alt="" placeholder="blur" />
      </figure>
    </main>
  );
};

export default SweetVaults;
