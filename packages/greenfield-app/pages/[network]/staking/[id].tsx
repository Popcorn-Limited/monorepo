import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useRouter } from "next/router";

import StatusWithLabel from "@popcorn/app/components/Common/StatusWithLabel";
import { InfoIconWithTooltip } from "@popcorn/app/components/InfoIconWithTooltip";
import { NetworkSticker } from "@popcorn/app/components/NetworkSticker";
import TokenIcon from "@popcorn/app/components/TokenIcon";
import { Erc20, Staking } from "@popcorn/components";
import SecondaryActionButton from "@popcorn/components/components/SecondaryActionButton";
import { Metadata, Tvl } from "@popcorn/components/lib/Contract";
import MobileCardSlider from "@popcorn/app/components/Common/MobileCardSlider";
import { useChainIdFromUrl } from "@popcorn/app/hooks/useChainIdFromUrl";
import { useAccount } from "wagmi";
import TabSelector from "components/TabSelector";
import { useState } from "react";
import AssetInputWithAction from "@popcorn/components/components/AssetInputWithAction";
import useTokenAllowance from "@popcorn/app/hooks/tokens/useTokenAllowance";
import { useStakingToken } from "@popcorn/components/lib/Staking/hooks";
import { constants } from "ethers";
import TermsAndConditions from "@popcorn/app/components/StakingTermsAndConditions";

const TAB_DEPOSIT = "Deposit";
const TAB_WITHDRAW = "Withdraw";
const TABS = [TAB_DEPOSIT, TAB_WITHDRAW];

export default function Index(): JSX.Element {
  const chainId = useChainIdFromUrl();
  const router = useRouter();
  const stakingAddress = router.query.id as string;
  const { data: stakingToken } = useStakingToken({ address: stakingAddress, chainId });
  const { address: account } = useAccount();
  const [activeTab, setActiveTab] = useState(TAB_DEPOSIT);
  const isDeposit = activeTab === TAB_DEPOSIT;
  const { data: allowance } = useTokenAllowance(String(stakingToken), chainId, account, stakingAddress);
  const [termsAccepted, setTermsAccepted] = useState(false);

  return (
    <Metadata address={stakingToken} chainId={chainId}>
      {(metadata) => (
        <>
          <div className="-ml-2">
            <div className="flex items-center cursor-pointer" onClick={() => router.push("/staking")}>
              <ChevronLeftIcon className="w-6 h-6 mb-1 text-secondaryLight" />
              <p className="text-primary">Staking</p>
            </div>
          </div>

          <div className="grid grid-cols-12 mt-10">
            <div className="col-span-12 md:col-span-5">
              <div className="relative ml-4">
                <NetworkSticker />
                <TokenIcon token={stakingToken} chainId={chainId} />
              </div>
              <h1 className="text-black text-5xl md:text-6xl leading-12 mt-9">{metadata.name}</h1>
              <div className="flex flex-wrap">
                <div className="block pr-8 md:pr-6 mt-6 md:mt-8">
                  <StatusWithLabel
                    content={<Staking.Apy chainId={chainId} address={stakingAddress} />}
                    label={
                      <>
                        <span className="lowercase">v</span>APR
                      </>
                    }
                    green
                    infoIconProps={{
                      id: "vAPR",
                      title: "vAPR",
                      content:
                        "This is a variable annual percentage rate. 90% of POP rewards are vested over one year.",
                    }}
                  />
                </div>
                <div className="block mt-6 md:mt-8 pr-8 md:pr-6 md:pl-6 md:border-l md:border-customLightGray">
                  <StatusWithLabel content={<Tvl chainId={chainId} address={stakingAddress} />} label="TVL" />
                </div>
                <div className="block mt-6 md:mt-8 pr-8 md:pr-0 md:pl-6 md:border-l md:border-customLightGray">
                  <StatusWithLabel
                    content={
                      <span>
                        <Staking.TokenEmission chainId={chainId} address={stakingAddress} /> POP / day
                      </span>
                    }
                    label="EMISSION RATE"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-customGreen col-span-12 md:col-span-3 md:col-end-13 h-80 p-6 hidden md:flex justify-end items-end">
              <img src="/images/stakingCard.svg" alt="" />
            </div>
          </div>
          <div className="flex flex-col md:flex-row mt-10">
            <div className="md:w-1/3 order-2 md:order-1">
              <div className="p-6 border border-customLightGray rounded-lg mb-12 mt-12 md:mt-0">
                <div className="pt-2">
                  <TabSelector
                    className="mb-6"
                    availableTabs={TABS}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                  />
                </div>
                <AssetInputWithAction
                  assetAddress={isDeposit ? stakingToken : stakingAddress}
                  target={stakingAddress}
                  chainId={chainId}
                  action={{
                    label: isDeposit ? "Deposit" : "Withdraw",
                    abi: ["function stake(uint256 amount) external", "function withdraw(uint256 amount) external"],
                    functionName: isDeposit ? "stake" : "withdraw",
                    successMessage: `${isDeposit ? "Deposit" : "Withdraw"} successful!`,
                  }}
                  allowance={isDeposit ? allowance : constants.MaxUint256}
                >
                  {({ ActionableComponent }) => (
                    <div className="mt-6">
                      {isDeposit ? (
                        <TermsAndConditions
                          isDisabled={!isDeposit}
                          termsAccepted={termsAccepted}
                          setTermsAccepted={() => setTermsAccepted(() => !termsAccepted)}
                        />
                      ) : (
                        <div className="h-36"></div>
                      )}
                      <div className="mx-auto pb-2">
                        <ActionableComponent />
                      </div>
                    </div>
                  )}
                </AssetInputWithAction>
              </div>
            </div>

            <div className="md:w-2/3 md:ml-8 order-1 md:order-2">
              <div className="w-full md:grid grid-cols-12 gap-8 hidden">
                <div className="rounded-lg border border-customLightGray p-6 pb-4 col-span-12 md:col-span-6">
                  <div className="flex gap-6 md:gap-0 md:space-x-6 items-center pb-6">
                    <div className="relative ml-4">
                      <NetworkSticker />
                      <TokenIcon token={stakingToken} chainId={chainId} imageSize="w-12 h-12" />
                    </div>
                    <div>
                      <div className="flex md:mb-2">
                        <h2 className="text-primaryLight leading-5 text-base">Your Staked Balance</h2>
                        <InfoIconWithTooltip
                          classExtras="mt-0 ml-1 md:ml-2 p-0"
                          id="1"
                          title="Staked Balance"
                          content={`This is the balance of ${metadata.symbol} that you have staked.`}
                        />
                      </div>
                      <p className="text-primary text-2xl leading-6">
                        <Erc20.BalanceOf chainId={chainId} account={account} address={stakingAddress} />
                        {` ${metadata.symbol}`}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-customLightGray p-6 pb-4 col-span-12 md:col-span-6">
                  <div className="flex gap-6 md:gap-0 md:space-x-6 items-center pb-6">
                    <div className="relative ml-4">
                      <NetworkSticker />
                      <TokenIcon token={stakingToken} chainId={chainId} imageSize="w-12 h-12" />
                    </div>
                    <div>
                      <div className="flex md:mb-2">
                        <h2 className="text-primaryLight leading-5 text-base">Your Staking Rewards</h2>
                        <InfoIconWithTooltip
                          classExtras="mt-0 ml-1 md:ml-2 p-0"
                          id="2"
                          title="Your Staking Rewards"
                          content={`Staking rewards are received for staking tokens. Rewards may be claimed under the rewards page. Whenever rewards are claimed, 10% is transferred immediately to your wallet, and the rest is streamed and claimable over the next 1 year.`}
                        />
                      </div>
                      <p className="text-primary text-2xl leading-6">
                        <Staking.ClaimableBalanceOf chainId={chainId} account={account} address={stakingAddress} /> POP
                      </p>
                    </div>
                  </div>
                  <Link href={`/rewards`} passHref target="_self">
                    <div className="border-t border-customLightGray pt-2 px-1">
                      <SecondaryActionButton label="Claim Page" />
                    </div>
                  </Link>
                </div>
              </div>

              <div className="md:hidden">
                <MobileCardSlider>
                  <div className="px-1">
                    <div className="rounded-lg border border-customLightGray p-6 col-span-12 md:col-span-6">
                      <div className="flex gap-6 md:gap-0 md:space-x-6">
                        <div className="relative ml-4">
                          <NetworkSticker />
                          <TokenIcon token={stakingToken} chainId={chainId} />
                        </div>
                        <div className="pb-6">
                          <div className="flex">
                            <h2 className="text-primaryLight leading-5 text-base">Your Staked Balance</h2>
                            <InfoIconWithTooltip
                              classExtras="mt-0 ml-1 md:ml-2 md:mb-2 p-0"
                              id="1"
                              title="Staked Balance"
                              content={`This is the balance of ${metadata.symbol} that you have staked.`}
                            />
                          </div>
                          <p className="text-primary text-2xl">
                            <Erc20.BalanceOf chainId={chainId} account={account} address={stakingAddress} />
                            {metadata.symbol}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="px-1">
                    <div className="rounded-lg border border-customLightGray p-6 col-span-12 md:col-span-6">
                      <div className="flex gap-6 md:gap-0 md:space-x-6">
                        <div className="relative ml-4">
                          <NetworkSticker />
                          <TokenIcon token={stakingToken} chainId={chainId} />
                        </div>
                        <div className="pb-6">
                          <div className="flex">
                            <h2 className="text-primaryLight leading-5 text-base">Your Staking Rewards</h2>
                            <InfoIconWithTooltip
                              classExtras="mt-0 ml-1 md:ml-2 md:mb-2 p-0"
                              id="2"
                              title="Your Staking Rewards"
                              content={`Staking rewards are received for staking tokens. Rewards may be claimed under the rewards page. Whenever rewards are claimed, 10% is transferred immediately to your wallet, and the rest is streamed and claimable over the next 1 year.`}
                            />
                          </div>
                          <p className="text-primary text-2xl">
                            <Staking.ClaimableBalanceOf chainId={chainId} account={account} address={stakingAddress} />
                            POP
                          </p>
                        </div>
                      </div>
                      <Link href={`/rewards`} passHref target="_self">
                        <div className="border-t border-customLightGray pt-2 px-1">
                          <SecondaryActionButton label="Claim Page" />
                        </div>
                      </Link>
                    </div>
                  </div>
                </MobileCardSlider>
              </div>

              <div className="bg-customLightYellow rounded-lg p-8 pb-6 hidden md:flex flex-col justify-between mt-8">
                <h2 className="text-6xl leading-11">{/* removed text for now - @am */}</h2>
                <div className="flex justify-end mt-28">
                  <img src="/images/hands.svg" alt="" className="h-28 w-28" />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </Metadata>
  );
}
