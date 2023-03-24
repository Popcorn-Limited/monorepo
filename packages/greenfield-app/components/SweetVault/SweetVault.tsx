import { Fragment, useEffect, useState } from "react";
import { Address, useAccount, useBalance, useContractRead, useToken } from "wagmi";
import { BigNumber, constants } from "ethers";

import { BalanceOf, TotalSupply, ValueOfBalance } from "@popcorn/components/lib/Erc20";
import useVaultToken from "@popcorn/components/hooks/useVaultToken";

import { ChainId, formatAndRoundBigNumber } from "@popcorn/utils";
import Title from "@popcorn/components/components/content/Title";
import { Tvl, Value } from "@popcorn/components/lib/Contract";
import { Apy } from "@popcorn/components/lib/Staking";
import VaultMetadata from "@popcorn/components/components/Vaults/VaultMetadata";
import MarkdownRenderer from "./MarkdownRenderer";
import AnimatedChevron from "./AnimatedChevron";
import DepositWithdraw from "./DepositWithdraw";
import Accordion from "../Accordion";
import TokenIcon from "@popcorn/app/components/TokenIcon";
import { FetchTokenResult } from "wagmi/dist/actions";
import { NetworkSticker } from "@popcorn/app/components/NetworkSticker";
import { useBalanceOf, useTotalSupply } from "@popcorn/components/lib/Erc20/hooks";
import { PriceOf, usePrice } from "@popcorn/components/lib/Price";
import { TotalAssets } from "@popcorn/components/lib/Vault";
import { parseUnits } from "ethers/lib/utils.js";
import { useTotalAssets } from "@popcorn/components/lib/Vault/hooks";
import { formatNumber } from "@popcorn/utils/formatBigNumber";
import RightArrowIcon from "@popcorn/components/components/SVGIcons/RightArrowIcon";

const HUNDRED = constants.Zero.add(100);

const VAULT_APY_RESOLVER = {
  "Beefy": "beefy",
  "Yearn": "yearnAsset"
}

function AssetWithName({ vault, token, chainId, protocol }: { vault: FetchTokenResult; token: string, chainId: ChainId, protocol: string }) {
  return <div className="flex items-center gap-4">
    <div className="relative">
      <NetworkSticker selectedChainId={chainId} />
      <TokenIcon token={token} chainId={chainId} imageSize="w-8 h-8" />
    </div>
    <Title level={2} as="span" className="text-gray-900 mt-1">
      {vault?.name.slice(8, -6)}
    </Title>
    <div className="bg-red-500 bg-opacity-[15%] py-1 px-3 text-gray-800 rounded-md">{protocol}</div>
  </div>
}

function SweetVault({ vaultAddress, chainId, searchString, addToTVL, addToDeposit }:
  {
    chainId: ChainId;
    vaultAddress: string,
    searchString: string,
    addToTVL: (key: string, value: BigNumber) => void,
    addToDeposit: (key: string, value: BigNumber) => void
  }
) {
  const { address: account } = useAccount();
  const { data: vault } = useToken({ address: vaultAddress as Address, chainId })
  const { data: token } = useVaultToken(vaultAddress, chainId);
  const { data: balance } = useBalanceOf({ address: vaultAddress as Address, chainId, account });
  const { data: price } = usePrice({ address: token?.address as Address, chainId });
  const { data: totalAssets } = useTotalAssets({ address: vaultAddress as Address, chainId, account });
  const { data: totalSupply } = useTotalSupply({ address: vaultAddress as Address, chainId, account });


  useEffect(() => {
    if (totalAssets && totalSupply && balance && price) {
      const pps = Number(totalAssets?.value?.toString()) / Number(totalSupply?.value?.toString());
      const assetBal = pps * Number(balance?.value?.toString());

      addToDeposit(
        vaultAddress,
        parseUnits(String((
          (Number(price?.value?.toString()) * assetBal) /
          (10 ** (token?.decimals * 2))))
        )
      );
    }
  }, [balance, totalAssets, totalSupply, price])

  useEffect(() => {
    if (totalAssets && price) {
      addToTVL(
        vaultAddress,
        parseUnits(String(
          ((Number(price?.value?.toString()) * Number(totalAssets?.value?.toString())) /
            (10 ** (token?.decimals * 2))))
        )
      );
    }
  }, [totalAssets, price])

  return (
    <VaultMetadata chainId={chainId} vaultAddress={vaultAddress}>
      {(vaultMetadata) => {
        return (
          (searchString === "" || vault?.name.toLowerCase().includes(searchString) || vault?.symbol.toLowerCase().includes(searchString)) ?
            <Accordion
              header={
                <Fragment>
                  <nav className="flex items-center justify-between mb-8 select-none">
                    <AssetWithName vault={vault} token={token?.address} chainId={chainId} protocol={vaultMetadata?.metadata?.protocol?.name} />
                    <AnimatedChevron className="hidden md:flex" />
                  </nav>
                  <div className="flex flex-row flex-wrap items-center mt-0 md:mt-6 justify-between">
                    <div className="w-1/2 md:w-1/4 mt-6 md:mt-0">
                      <p className="text-primaryLight font-normal">Your Wallet</p>
                      <p className="text-primary text-2xl md:text-3xl leading-6 md:leading-8">
                        <Title level={2} fontWeight="font-normal" as="span" className="mr-1 text-primary">
                          <BalanceOf
                            account={account}
                            chainId={chainId}
                            address={token?.address}
                            render={(data) => <>{account ? formatAndRoundBigNumber(data?.balance?.value, token?.decimals) : "-"}</>}
                          />
                        </Title>
                        <span className="text-secondaryLight text-lg md:text-2xl flex md:inline">{token?.symbol || "ETH"}</span>
                      </p>
                    </div>
                    <div className="w-1/2 md:w-1/4 mt-6 md:mt-0">
                      <p className="text-primaryLight font-normal">Your Deposit</p>
                      <div className="text-primary text-2xl md:text-3xl leading-6 md:leading-8">
                        <Title level={2} fontWeight="font-normal" as="span" className="mr-1 text-primary">
                          {account ? formatAndRoundBigNumber(balance?.value, vault?.decimals) : "-"}
                        </Title>
                        <span className="text-secondaryLight text-lg md:text-2xl flex md:inline">{vault?.symbol}</span>
                      </div>
                    </div>
                    <div className="w-1/2 md:w-1/4 mt-6 md:mt-0">
                      <p className="font-normal text-primaryLight">vAPR</p>
                      <Title as="td" level={2} fontWeight="font-normal">
                        <Apy
                          address={vaultAddress}
                          chainId={chainId}
                          resolver={VAULT_APY_RESOLVER[vaultMetadata?.metadata?.protocol?.name]}
                          render={(apy) => {
                            return (
                              <Apy
                                address={vaultAddress}
                                render={(stakingApy) => (
                                  <section className="flex items-center gap-1 text-primary">
                                    {formatAndRoundBigNumber(
                                      HUNDRED.mul(apy?.data?.value.add(stakingApy?.data?.value || 0) || constants.Zero),
                                      18,
                                    )} %
                                  </section>
                                )}
                                chainId={chainId}
                              />
                            );
                          }}
                        />
                      </Title>
                    </div>

                    <div className="w-1/2 md:w-1/4 mt-6 md:mt-0">
                      <p className="leading-6 text-primaryLight">TVL</p>
                      <Title as="td" level={2} fontWeight="font-normal" className="text-primary">
                        $ {formatNumber((Number(price?.value?.toString()) * Number(totalAssets?.value?.toString())) / (10 ** (token?.decimals * 2)))}
                      </Title>
                    </div>

                  </div>
                </Fragment>
              }
            >
              <div className="flex flex-col md:flex-row mt-8 gap-8">
                <div className="flex flex-col w-full md:w-4/12 gap-8">
                  <section className="bg-white flex-grow rounded-lg border border-customLightGray w-full p-6">
                    <DepositWithdraw chainId={chainId} vault={vaultAddress} vaultTokenAddress={token?.address} getTokenUrl={vaultMetadata?.metadata?.getTokenUrl}/>
                  </section>
                </div>
                <div className="md:hidden flex w-full">
                  <Accordion
                    initiallyOpen={false}
                    containerClassName="w-full bg-white p-6"
                    header={
                      <Fragment>
                        <div className="w-full flex flex-row justify-between">
                          <p className="font-normal text-customBrown">Learn</p>
                          <div className="flex self-center">
                            <RightArrowIcon color="827D69" />
                          </div>
                        </div>
                      </Fragment>
                    }>
                    <section className="bg-white rounded-lg w-full md:w-8/12 mt-6">
                      <div className="flex flex-row items-center">
                        <TokenIcon token={token?.address} chainId={chainId} imageSize="w-8 h-8" />
                        <Title level={2} as="span" className="text-gray-900 mt-1.5 ml-3">
                          {vault?.name.slice(8, -6)}
                        </Title>
                      </div>
                      <div className="mt-8">
                        <MarkdownRenderer content={`# ${vaultMetadata?.metadata?.protocol?.name} \n${vaultMetadata?.metadata?.protocol?.description}`} />
                      </div>
                      <div className="mt-8">
                        <MarkdownRenderer content={`# Strategy \n${vaultMetadata?.metadata?.strategy?.description}`} />
                      </div>
                    </section>
                  </Accordion>
                </div>
                <section className="bg-white rounded-lg border border-customLightGray w-full md:w-8/12 p-6 md:p-8 hidden md:flex flex-col">
                  <div className="flex flex-row items-center">
                    <TokenIcon token={token?.address} chainId={chainId} imageSize="w-8 h-8" />
                    <Title level={2} as="span" className="text-gray-900 mt-1.5 ml-3">
                      {vault?.name.slice(8, -6)}
                    </Title>
                  </div>
                  <div className="mt-8">
                    <MarkdownRenderer content={`# ${vaultMetadata?.metadata?.protocol?.name} \n${vaultMetadata?.metadata?.protocol?.description}`} />
                  </div>
                  <div className="mt-8">
                    <MarkdownRenderer content={`# Strategy \n${vaultMetadata?.metadata?.strategy?.description}`} />
                  </div>
                </section>
              </div>
            </Accordion>
            : <></>
        );
      }}
    </VaultMetadata>
  );
}

export default SweetVault;
