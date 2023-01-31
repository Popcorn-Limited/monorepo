import TabSelector from "components/TabSelector";
import { useEffect, useState } from "react";
import useSelectNetwork from "hooks/useNetworkFilter";
import { useChainsWithStakingRewards } from "hooks/staking/useChainsWithStaking";
import NetworkFilter from "@popcorn/components/components/NetworkFilter";
import { ChainId } from "@popcorn/utils";
import AirDropClaim from "components/rewards/AirdropClaim";
import StakingRewardsContainer from "components/rewards/StakingRewardsContainer";
import VestingContainer from "components/vesting/VestingContainer";
import { ConnectWallet } from "@popcorn/components/components/ConnectWallet";
import { useAccount } from "wagmi";
import NoSSR from "react-no-ssr";

export enum Tabs {
  Staking = "Staking Rewards",
  Airdrop = "Airdrop Redemption",
  Vesting = "Vesting Records",
}

export default function RewardsPage(): JSX.Element {
  const supportedNetworks = useChainsWithStakingRewards();
  const { address: account } = useAccount();
  const [selectedNetworks, selectNetwork] = useSelectNetwork(supportedNetworks);
  const [tabSelected, setTabSelected] = useState<Tabs>(Tabs.Staking);
  const [availableTabs, setAvailableTabs] = useState<Tabs[]>([]);
  const isSelected = (tab: Tabs) => tabSelected === tab;

  useEffect(() => {
    if (shouldAirdropVisible(selectedNetworks)) {
      setAvailableTabs([Tabs.Staking, Tabs.Airdrop, Tabs.Vesting]);
    } else {
      setAvailableTabs([Tabs.Staking, Tabs.Vesting]);
    }
  }, [selectedNetworks]);

  const shouldAirdropVisible = (chainId) => {
    if (chainId.length === 1) {
      return [ChainId.Arbitrum, ChainId.Polygon, ChainId.Hardhat, ChainId.BNB, ChainId.Localhost].includes(chainId[0]);
    }
    return false;
  };

  return (
    <>
      <NoSSR>
        <div className="grid grid-cols-12 md:gap-8 laptop:gap-14">
          <div className="col-span-12 md:col-span-4 md:pr-24">
            <h1 className="text-6xl leading-12 text-black">Rewards</h1>
            <p className="mt-4 leading-5 text-black">Claim your rewards and track your vesting records.</p>
            <ConnectWallet hidden={!!account} />
          </div>
        </div>
        {!!account && (
          <div className="grid grid-cols-12 md:gap-8 mt-16 md:mt-20">
            <div className="col-span-12 md:col-span-4">
              <div className={`mb-12`}>
                <NetworkFilter supportedNetworks={supportedNetworks} selectNetwork={selectNetwork} />
              </div>
              <div className="rounded-lg p-6 md:px-8 md:py-9 bg-customYellow flex flex-row md:flex-col justify-between md:h-104">
                <p className="text-2xl md:text-8xl leading-6 md:leading-13">
                  Connect <br />
                  Deposit <br />
                  Do well <br />
                  Do good
                </p>
                <div className="flex flex-col md:flex-row justify-end">
                  <img src="/images/smiley.svg" alt="" />
                </div>
              </div>
            </div>
            <div className="flex flex-col col-span-12 md:col-span-8 md:mb-8 mt-10 md:mt-0">
              <TabSelector activeTab={tabSelected} setActiveTab={setTabSelected} availableTabs={availableTabs} />
              <div className={`${isSelected(Tabs.Staking) ? "" : "hidden"}`}>
                <StakingRewardsContainer selectedNetworks={selectedNetworks} />
              </div>

              <div className={`mt-8 ${isSelected(Tabs.Airdrop) ? "" : "hidden"}`}>
                <AirDropClaim chainId={selectedNetworks[0]} />
              </div>

              <div className={`flex flex-col h-full mt-4 ${isSelected(Tabs.Vesting) ? "" : "hidden"}`}>
                <VestingContainer selectedNetworks={selectedNetworks} />
              </div>
            </div>
          </div>
        )}
      </NoSSR>
    </>
  );
}
