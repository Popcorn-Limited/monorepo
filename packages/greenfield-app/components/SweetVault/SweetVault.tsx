import type { Pop } from "@popcorn/components/lib/types";
import { Fragment } from "react";
import Image from "next/image";
import { useAccount } from "wagmi";
import { constants } from "ethers";

import { BalanceOf } from "@popcorn/components/lib/Erc20";
import useVaultToken from "@popcorn/components/hooks/useVaultToken";

import { useNamedAccounts } from "@popcorn/components/lib/utils";
import { formatAndRoundBigNumber } from "@popcorn/utils";
import Title from "@popcorn/components/components/content/Title";
import { Tvl } from "@popcorn/components/lib/Contract";
import { Apy } from "@popcorn/components/lib/Staking";
import VaultMetadata from "@popcorn/components/components/Vaults/VaultMetadata";
import MarkdownRenderer from "./MarkdownRenderer";
import AnimatedChevron from "./AnimatedChevron";
import DepositWithdraw from "./DepositWithdraw";
import Accordion from "../Accordion";
import { InfoIconWithTooltip } from "@popcorn/app/components/InfoIconWithTooltip";
import SecondaryActionButton from "@popcorn/components/components/SecondaryActionButton";

const HUNDRED = constants.Zero.add(100);
function SweetVault({ vaultAddress, chainId }: { chainId: any; vaultAddress: string }) {
  const CHAIN_ID = Number(chainId);
  const [vault] = useNamedAccounts(chainId, [vaultAddress]) as any as Pop.NamedAccountsMetadata[];
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

  const { data: token } = useVaultToken(vault.address, CHAIN_ID);

  return (
    <VaultMetadata chainId={chainId} vaultAddress={vaultAddress}>
      {(registryMetadata) => {
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
                          <BalanceOf account={address} chainId={CHAIN_ID} address={registryMetadata.staking} />
                        </Title>
                        <span className="text-secondaryLight">{vault.symbol}</span>
                      </td>
                      <Title as="td" level={2} fontWeight="font-normal">
                        <Apy
                          address={vault.address}
                          chainId={CHAIN_ID}
                          render={(apy) => {
                            return (
                              <Apy
                                address={registryMetadata.staking}
                                render={(stakingApy) => (
                                  <section className="flex items-center gap-1">
                                    {formatAndRoundBigNumber(
                                      HUNDRED.mul(apy?.data?.value.add(stakingApy?.data?.value || 0) || constants.Zero),
                                      18,
                                    )}
                                    <InfoIconWithTooltip
                                      title="APR Breakdown"
                                      content={
                                        <ul className="text-sm">
                                          <li>
                                            Staking APR:{" "}
                                            {formatAndRoundBigNumber(
                                              HUNDRED.mul(stakingApy?.data?.value || constants.Zero),
                                              18,
                                            )}
                                            %
                                          </li>
                                          <li>
                                            Vault APR:{" "}
                                            {formatAndRoundBigNumber(
                                              HUNDRED.mul(apy?.data?.value || constants.Zero),
                                              18,
                                            )}
                                            %
                                          </li>
                                        </ul>
                                      }
                                    />
                                  </section>
                                )}
                                chainId={CHAIN_ID}
                              />
                            );
                          }}
                        />
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
                  <DepositWithdraw chainId={CHAIN_ID} vault={vault} vaultTokenAddress={token?.address} />
                </section>
                <section className="bg-white rounded-lg border border-customLightGray w-full">
                  <SecondaryActionButton handleClick={handleOpenGetToken} label="Get token" />
                </section>
              </div>
              <section className="bg-white rounded-lg border border-customLightGray w-8/12 p-8">
                <AssetWithName />
                <div className="mt-8">
                  <MarkdownRenderer content={vault?.displayText?.token} />
                </div>
                <div className="mt-8">
                  <MarkdownRenderer content={`# Strategy \n${vault?.displayText?.strategy}`} />
                </div>
              </section>
            </div>
          </Accordion>
        );
      }}
    </VaultMetadata>
  );
}

export default SweetVault;
