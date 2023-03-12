import { Fragment } from "react";
import { Address, useAccount, useToken } from "wagmi";
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

const HUNDRED = constants.Zero.add(100);

const VAULT_APY_RESOLVER = {
  "Beefy": "beefy",
  "Yearn": "yearnAsset"
}

function AssetWithName({ vault, token, chainId }: { vault: FetchTokenResult; token: string, chainId: ChainId }) {
  return <div className="flex items-center gap-4">
    <div className="relative">
      <NetworkSticker selectedChainId={chainId} />
      <TokenIcon token={token} imageSize="w-8 h-8" chainId={chainId} />
    </div>
    <Title level={2} as="span" className="text-gray-900">
      {vault?.name.slice(8, -6)}
    </Title>
  </div>
}

function SweetVault({ vaultAddress, chainId, searchString }: { chainId: ChainId; vaultAddress: string, searchString: string }) {
  const { address } = useAccount();
  const { data: vault } = useToken({ address: vaultAddress as Address, chainId })
  const { data: token } = useVaultToken(vaultAddress, chainId);

  // TODO pass these from sweet-vaults and add values to hero
  function addToDeposit(value: BigNumber) {
    console.log("addToDeposit", value.toString());
  }

  function addToTVL(value: BigNumber) {
    console.log("addToTVL", value.toString());
  }

  // TODO mobile css
  // TODO add protocol badge
  // TODO add beefy apy resolver
  // TODO test deposit/withdraw flow

  return (
    <VaultMetadata chainId={chainId} vaultAddress={vaultAddress}>
      {(vaultMetadata) => {
        return (
          (searchString === "" || vault?.name.toLowerCase().includes(searchString) || vault?.symbol.toLowerCase().includes(searchString)) ?
            <Accordion
              header={
                <Fragment>
                  <nav className="flex items-center justify-between mb-8 select-none">
                    <AssetWithName vault={vault} token={token?.address} chainId={chainId} />
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
                            <BalanceOf account={address} chainId={chainId} address={token?.address} />
                          </Title>
                          <span className="text-secondaryLight">{token?.symbol || "ETH"}</span>
                        </td>
                        <td>
                          <Title level={2} fontWeight="font-normal" as="span" className="mr-1">
                            <BalanceOf
                              account={address}
                              chainId={chainId}
                              address={vaultAddress}
                              resolver={"vault"}
                              render={(data) =>
                                <Value status={data.status} balance={data.balance?.value} price={data.price?.value} callback={addToDeposit} />
                              }
                            />
                          </Title>
                          <span className="text-secondaryLight">{vault?.symbol}</span>
                        </td>
                        <Title as="td" level={2} fontWeight="font-normal">
                          <Apy
                            address={vaultAddress}
                            chainId={chainId}
                            resolver={VAULT_APY_RESOLVER[vaultMetadata?.metadata.protocol.name]}
                            render={(apy) => {
                              return (
                                <Apy
                                  address={vaultAddress}
                                  render={(stakingApy) => (
                                    <section className="flex items-center gap-1">
                                      {formatAndRoundBigNumber(
                                        HUNDRED.mul(apy?.data?.value.add(stakingApy?.data?.value || 0) || constants.Zero),
                                        18,
                                      )}
                                    </section>
                                  )}
                                  chainId={chainId}
                                />
                              );
                            }}
                          />
                        </Title>
                        <Title as="td" level={2} fontWeight="font-normal">
                          <TotalSupply chainId={chainId} address={vaultAddress} render={(data) =>
                            <Value status={data.status} balance={data.balance?.value} price={data.price?.value} callback={addToTVL} />
                          } />
                        </Title>
                      </tr>
                    </tbody>
                  </table>
                </Fragment>
              }
            >
              <div className="flex flex-col md:flex-row mt-8 gap-8">
                <div className="flex flex-col w-full md:w-4/12 gap-8">
                  <section className="bg-white flex-grow rounded-lg border border-customLightGray w-full p-6">
                    <DepositWithdraw chainId={chainId} vault={vaultAddress} vaultTokenAddress={token?.address} />
                  </section>
                </div>
                <section className="bg-white rounded-lg border border-customLightGray w-full md:w-8/12 p-8">
                  <AssetWithName vault={vault} token={token?.address} chainId={chainId} />
                  <div className="mt-8">
                    <MarkdownRenderer content={`# ${vaultMetadata?.metadata.protocol.name} \n${vaultMetadata?.metadata.protocol.description}`} />
                  </div>
                  <div className="mt-8">
                    <MarkdownRenderer content={`# Strategy \n${vaultMetadata?.metadata.strategy.description}`} />
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
