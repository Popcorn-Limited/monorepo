import type { NextPage } from "next";
import type { Pop } from "@popcorn/greenfield-app/lib/types";
import { useEffect, useMemo, useState } from "react";
import { BigNumber, constants } from "ethers";
import { Address, useAccount } from "wagmi";
import NoSSR from "react-no-ssr";

import { useNamedAccounts } from "@popcorn/greenfield-app/lib/utils/hooks";
import Metadata from "@popcorn/greenfield-app/lib/Contract/Metadata";
import { Erc20 } from "@popcorn/greenfield-app/lib";

import { useChainsWithStakingRewards } from "../hooks/staking/useChainsWithStaking";
import useNetworkFilter from "../hooks/useNetworkFilter";
import PortfolioClaimableBalance from "@popcorn/greenfield-app/components/Portfolio/PortfolioClaimableBalance";
import PortfolioHero from "@popcorn/greenfield-app/components/Portfolio/PortfolioHero";
import PortfolioSection from "@popcorn/greenfield-app/components/Portfolio/PortfolioSection";
import AssetRow from "@popcorn/greenfield-app/components/Portfolio/AssetRow";
import { ChainId, getItemKey, sortEntries, SortingType } from "@popcorn/greenfield-app/lib/utils";
import { useAllVaults } from "@popcorn/greenfield-app/hooks/vaults";
import SweetVaultRow from "@popcorn/greenfield-app/components/portfolio/SweetVaultRow";
import { BalanceByKey } from "@popcorn/greenfield-app/lib/utils/sortEntries";

const sumUpBalances = (balances = {}, selectedNetworks: Array<any> = []) =>
  Object.keys(balances).reduce((total, key) => {
    const asset = balances[key];
    const value = selectedNetworks.includes(asset.chainId) ? asset.value : 0;
    return total.add(value);
  }, constants.Zero);

const filterByChainId = (contracts: Array<any>, chainId, selectedNetworks) =>
  selectedNetworks.includes(chainId) ? contracts : [];

export const SECTIONS = ["Assets", "Sweet Vaults", "Claimable", "Vesting"];

const INIT_BALANCE_STATE = {
  pop: {} as BalanceByKey,
  sweetVaults: {} as BalanceByKey,
  claimable: {} as BalanceByKey,
  vesting: {} as BalanceByKey,
};

export const PortfolioPage: NextPage = () => {
  const supportedNetworks = useChainsWithStakingRewards();
  const [selectedNetworks, selectNetwork] = useNetworkFilter(supportedNetworks);
  const { address: account } = useAccount();
  const [balances, setBalances] = useState(INIT_BALANCE_STATE);
  const [selectedSections, selectSections] = useState(SECTIONS);

  const contractsEth = useNamedAccounts("1", [
    "pop",
    "popStaking",
    "threeX",
    "threeXStaking",
    "butter",
    "butterStaking",
    "xenStaking",
    "popUsdcArrakisVaultStaking",
    "rewardsEscrow",
  ]);
  const contractsPoly = useNamedAccounts("137", [
    "pop",
    "popStaking",
    "popUsdcSushiLP",
    "popUsdcArrakisVault",
    "popUsdcArrakisVaultStaking",
    "rewardsEscrow",
    "xPop",
  ]);
  const contractsBnb = useNamedAccounts("56", ["pop", "xPop", "rewardsEscrow"]);
  const contractsArbitrum = useNamedAccounts("42161", ["pop", "xPop"]);
  const contractsOp = useNamedAccounts("10", ["pop", "popUsdcArrakisVault"]);

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


  const [rewardContracts, escrowContracts] = useMemo(() => {
    const allContracts = [
      ...filterByChainId(contractsEth, 1, selectedNetworks),
      ...filterByChainId(contractsPoly, 137, selectedNetworks),
      ...filterByChainId(contractsBnb, 56, selectedNetworks),
      ...filterByChainId(contractsArbitrum, 42161, selectedNetworks),
      ...filterByChainId(contractsOp, 10, selectedNetworks),
    ]
      .map((network) => network)
      .flat(1) as Array<Pop.NamedAccountsMetadata>;

    const escrow = allContracts.filter(({ __alias }) => __alias === "rewardsEscrow");
    const rewards = allContracts.filter(({ __alias }) => __alias !== "rewardsEscrow");

    return [rewards, escrow];
    // re-trigger only when array length change to avoid shallow object false positives
  }, [account, contractsEth, contractsPoly, contractsBnb, contractsArbitrum, contractsOp, filterByChainId]);

  useEffect(() => {
    setBalances(INIT_BALANCE_STATE);
    // reset when new account
    // @ts-lint:disable-next-line
  }, [account]);

  const addToBalances = (key, type: "claimable" | "pop" | "vesting" | "sweetVaults", chainId: number, value?: BigNumber) => {
    if (value?.gt(0)) {
      setBalances((balances) => ({
        ...balances,
        [type]: {
          ...balances[type],
          [key]: { value, chainId: chainId },
        },
      }));
    }
  };

  const totalBalance = {
    pop: sumUpBalances(balances.pop, selectedNetworks),
    sweetVaults: sumUpBalances(balances.sweetVaults, selectedNetworks),
    vesting: sumUpBalances(balances.vesting, selectedNetworks),
    claimable: sumUpBalances(balances.claimable, selectedNetworks),
  };
  const rewardsBalance = totalBalance.claimable.add(totalBalance.vesting);
  const networth = totalBalance.pop.add(totalBalance.sweetVaults).add(rewardsBalance);

  return (
    <NoSSR>
      <PortfolioHero
        supportedNetworks={supportedNetworks}
        selectedNetworks={selectedNetworks}
        selectNetwork={selectNetwork}
        networth={networth}
        vestingBalance={rewardsBalance}
        account={account}
        tabs={{ available: SECTIONS, active: [selectedSections, selectSections] }}
      />
      <PortfolioSection
        selectedNetworks={selectedNetworks}
        selectedSections={selectedSections}
        networth={networth}
        balance={totalBalance.pop}
        title="Assets"
      >
        {rewardContracts
          .sort((a, b) => sortEntries(a, b, balances.pop, SortingType.BalDesc))
          .map((token) => {
            const key = getItemKey(token);
            const chainId = Number(token.chainId);
            return (
              <Metadata chainId={chainId} address={token.address} alias={token.__alias} key={key}>
                {(metadata) => (
                  <Erc20.BalanceOf
                    chainId={chainId}
                    account={account}
                    address={token.address}
                    render={({ balance, price, status }) => (
                      <AssetRow
                        name={metadata?.name}
                        token={token}
                        balance={balance}
                        chainId={chainId}
                        networth={networth}
                        price={price}
                        status={status}
                        callback={(value) => addToBalances(key, "pop", chainId, value)}
                      />
                    )}
                  />
                )}
              </Metadata>
            );
          })}
      </PortfolioSection>
      <PortfolioSection
        selectedNetworks={selectedNetworks}
        selectedSections={selectedSections}
        networth={networth}
        balance={totalBalance.sweetVaults}
        title="Sweet Vaults"
      >
        {allVaults
          .sort((a, b) => sortEntries(a, b, balances.sweetVaults, SortingType.BalDesc))
          .map((vault) => {
            const key = `${vault.chainId}:Vault:${vault.address}`
            return (
              <SweetVaultRow
                key={key}
                vaultAddress={vault.address}
                chainId={vault.chainId}
                account={account}
                callback={(value) => addToBalances(key, "sweetVaults", vault.chainId, value)}
                networth={networth}
              />
            );
          })}
      </PortfolioSection>
      <PortfolioSection
        selectedNetworks={selectedNetworks}
        selectedSections={selectedSections}
        networth={networth}
        balance={totalBalance.claimable}
        sectionKeyName={"Claimable"}
        title="Claimable"
      >
        {escrowContracts
          .sort((a, b) => sortEntries(a, b, balances.claimable, SortingType.BalDesc))
          .map((token) => {
            const key = getItemKey(token);
            return (
              <PortfolioClaimableBalance
                key={`rewards-${key}`}
                account={account}
                type="claimable"
                networth={networth}
                callback={(value) => addToBalances(key, "claimable", Number(token.chainId), value)}
                token={token}
              />
            );
          })}
      </PortfolioSection>

      <PortfolioSection
        selectedNetworks={selectedNetworks}
        selectedSections={selectedSections}
        networth={networth}
        balance={totalBalance.vesting}
        sectionKeyName={"Vesting"}
        title="Vesting"
      >
        {escrowContracts
          .sort((a, b) => sortEntries(a, b, balances.vesting, SortingType.BalDesc))
          .map((token) => {
            const key = getItemKey(token);
            return (
              <PortfolioClaimableBalance
                key={`vesting-${key}`}
                account={account}
                type="vesting"
                networth={networth}
                callback={(value) => addToBalances(key, "vesting", Number(token.chainId), value)}
                token={token}
              />
            );
          })}
      </PortfolioSection>
    </NoSSR>
  );
};

export default PortfolioPage;
