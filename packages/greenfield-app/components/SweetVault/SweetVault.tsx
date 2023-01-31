import type { Pop } from "@popcorn/components/lib/types";
import { Fragment } from "react";
import Image from "next/image";
import { useAccount } from "wagmi";

import { BalanceOf } from "@popcorn/components/lib/Erc20";
import useVaultToken from "@popcorn/components/hooks/useVaultToken";

import Title from "@popcorn/components/components/content/Title";
import { Tvl } from "@popcorn/components/lib/Contract";
import { Apy } from "@popcorn/components/lib/Staking";
import MarkdownRenderer from "./MarkdownRenderer";
import AnimatedChevron from "./AnimatedChevron";
import DepositWithdraw from "./DepositWithdraw";
import Accordion from "../Accordion";
import SecondaryActionButton from "@popcorn/components/components/SecondaryActionButton";

function SweetVault({ vault }: { vault: Pop.NamedAccountsMetadata }) {
  const { address } = useAccount();
  const AssetWithName = () => (
    <div className="flex items-center gap-4">
      <Image width={32} height={32} src={vault?.icons[0] || "/images/tokens/usdt.svg"} alt="USDT logo" />
      <Title level={2} as="span" className="text-gray-900">
        {vault.name}
      </Title>
    </div>
  );

  function handleOpenGetToken() {
    window.open(vault?.curveLink, "_blank");
  }

  const CHAIN_ID = Number(vault.chainId);
  const { data: token } = useVaultToken(vault.address, CHAIN_ID);

  return (
    <Accordion
      header={
        <Fragment>
          <nav className="flex items-center justify-between mb-8 select-none">
            <AssetWithName />
            <AnimatedChevron />
          </nav>

          <table className="w-full text-left table-fixed">
            <thead className="text-primaryLight">
              <tr>
                <th className="font-normal">Your Wallet</th>
                <th className="font-normal">Your Deposit</th>
                <th className="font-normal">vAPR</th>
                <th className="font-normal">TVL</th>
              </tr>
            </thead>
            <tbody className="text-primary">
              <tr>
                <td>
                  <Title level={2} fontWeight="font-normal" as="span" className="mr-1">
                    <BalanceOf account={address} chainId={CHAIN_ID} address={token?.address} />
                  </Title>
                  <span className="text-secondaryLight">{token?.symbol || "ETH"}</span>
                </td>
                <td>
                  <Title level={2} fontWeight="font-normal" as="span" className="mr-1">
                    <BalanceOf account={address} chainId={CHAIN_ID} address={vault.address} />
                  </Title>
                  <span className="text-secondaryLight">{vault.symbol}</span>
                </td>
                <Title as="td" level={2} fontWeight="font-normal">
                  <Apy chainId={CHAIN_ID} address={vault.address} />
                </Title>
                <Title as="td" level={2} fontWeight="font-normal">
                  <Tvl chainId={CHAIN_ID} address={vault.address} />
                </Title>
              </tr>
            </tbody>
          </table>
        </Fragment>
      }
    >
      <div className="flex mt-8 gap-8">
        <div className="flex flex-col w-4/12 gap-8">
          <section className="bg-white flex-grow rounded-lg border border-customLightGray w-full p-6">
            <DepositWithdraw
              chainId={CHAIN_ID}
              vault={vault}
              vaultTokenDecimals={token?.decimals}
              vaultTokenAddress={token?.address}
            />
          </section>
          <section className="bg-white rounded-lg border border-customLightGray w-full">
            <SecondaryActionButton handleClick={handleOpenGetToken} label="Get token" />
          </section>
        </div>
        <section className="bg-white rounded-lg border border-customLightGray w-8/12 p-8">
          <AssetWithName />
          <div className="mt-8">
            <MarkdownRenderer content={vault?.displayText.token} />
          </div>
          <div className="mt-8">
            <MarkdownRenderer content={`# Strategy \n${vault?.displayText.strategy}`} />
          </div>
        </section>
      </div>
    </Accordion>
  );
}

export default SweetVault;
