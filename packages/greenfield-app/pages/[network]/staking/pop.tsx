import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useRouter } from "next/router";

import StatusWithLabel from "@popcorn/greenfield-app/components/StatusWithLabel";
import { InfoIconWithTooltip } from "@popcorn/greenfield-app/components/InfoIconWithTooltip";
import { NetworkSticker } from "@popcorn/greenfield-app/components/NetworkSticker";
import TokenIcon from "@popcorn/greenfield-app/components/TokenIcon";
import { Erc20, Staking } from "@popcorn/greenfield-app/lib";
import SecondaryActionButton from "@popcorn/greenfield-app/components/SecondaryActionButton";
import { Tvl } from "@popcorn/greenfield-app/lib/Contract";
import MobileCardSlider from "@popcorn/greenfield-app/components/MobileCardSlider";
import { useChainIdFromUrl } from "@popcorn/greenfield-app/hooks/useChainIdFromUrl";
import { Address, useAccount, useContractRead } from "wagmi";
import TabSelector from "components/TabSelector";
import { useEffect, useState } from "react";
import AssetInputWithAction from "components/AssetInputWithAction";
import { constants } from "ethers";
import StakingTermsAndConditions from "@popcorn/greenfield-app/components/StakingTermsAndConditions";
import { useNamedAccounts } from "@popcorn/greenfield-app/lib/utils";
import MainActionButton from "@popcorn/greenfield-app/components/MainActionButton";
import VestingRecordDropDown from "@popcorn/greenfield-app/components/staking/VestingRecordDropDown";
import { ChainId, formatAndRoundBigNumber } from "@popcorn/utils";
import { formatDate } from "@popcorn/utils/DateTime";
import { useLockedBalances } from "@popcorn/greenfield-app/lib/PopLocker/hooks";
import useRestake from "@popcorn/greenfield-app/hooks/useRestake";
import NoSSR from "react-no-ssr";
import { ValueOfBalance } from "@popcorn/greenfield-app/lib/Erc20";
import { useAllowance } from "@popcorn/greenfield-app/lib/Erc20/hooks";

const TAB_DEPOSIT = "Deposit";
const TAB_WITHDRAW = "Withdraw";
const TABS = [TAB_DEPOSIT, TAB_WITHDRAW];

export default function Index(): JSX.Element {
  const chainId = useChainIdFromUrl();
  const router = useRouter();
  const { address: account } = useAccount();
  const [activeTab, setActiveTab] = useState(TAB_DEPOSIT);
  const isDeposit = activeTab === TAB_DEPOSIT;
  const [pop, popStaking] = useNamedAccounts(chainId as any, ["pop", "popStaking"]);
  const { data: allowance } = useAllowance({ address: pop?.address, account: popStaking?.address, chainId });

  const [termsAccepted, setTermsAccepted] = useState(false);
  const { data: lockedBalances, status } = useLockedBalances({ address: popStaking?.address, chainId, account });
  const [chosenLock, setChosenLock] = useState({ amount: constants.Zero, boosted: constants.Zero, unlockTime: 0 });
  const [restake, setRestake] = useState(true);
  const { write: restakeLock } = useRestake(restake, popStaking?.address, chainId, account);

  useEffect(() => {
    if (status === "success" && lockedBalances.lockData.length > 0) {
      setChosenLock(lockedBalances.lockData[0]);
    }
  }, [lockedBalances, status]);

  return (
    <NoSSR>
      <div className="-ml-2">
        <div className="flex items-center cursor-pointer" onClick={() => router.push("/staking")}>
          <ChevronLeftIcon className="w-6 h-6 mb-1 text-secondaryLight" />
          <p className="text-primary">Staking</p>
        </div>
      </div>

      <div className="grid grid-cols-12 mt-10">
        <div className="col-span-12 md:col-span-5">
          <div className="relative ml-4">
            <NetworkSticker chainId={chainId} />
            <TokenIcon token={pop?.address} chainId={chainId} />
          </div>
          <h1 className="text-black text-5xl md:text-6xl leading-12 mt-9">{pop?.name}</h1>
          <div className="flex flex-wrap">
            <div className="block pr-8 md:pr-6 mt-6 md:mt-8">
              <StatusWithLabel
                content={<Staking.Apy chainId={chainId} address={popStaking?.address} />}
                label={
                  <>
                    <span className="lowercase">v</span>APR
                  </>
                }
                green
                infoIconProps={{
                  id: "vAPR",
                  title: "vAPR",
                  content: "This is a variable annual percentage rate. 90% of POP rewards are vested over one year.",
                }}
              />
            </div>
            <div className="block mt-6 md:mt-8 pr-8 md:pr-6 md:pl-6 md:border-l md:border-customLightGray">
              {/* Somehow the Convex Staking Contract breaks on optimism. Therefore we simply check the balanceOf pop token in the staking contract */}
              <StatusWithLabel
                content={
                  chainId === ChainId.Optimism ? (
                    <ValueOfBalance chainId={chainId} address={pop?.address} account={popStaking?.address as Address} />
                  ) : (
                    <Tvl chainId={chainId} address={popStaking?.address} />
                  )
                }
                label="TVL"
              />
            </div>
            <div className="block mt-6 laptop:mt-8 pr-8 laptop:pr-0 laptop:pl-6 laptop:border-l laptop:border-customLightGray">
              <StatusWithLabel
                content={
                  <span>
                    <Staking.TokenEmission chainId={chainId} address={popStaking?.address} /> POP / day
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
              <TabSelector className="mb-6" availableTabs={TABS} activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>
            {isDeposit ? (
              <AssetInputWithAction
                assetAddress={pop?.address}
                target={popStaking?.address}
                chainId={chainId}
                action={(balance) => {
                  return {
                    label: "Deposit",
                    abi: ["function lock(address _account, uint256 _amount, uint256 _spendRatio) external"],
                    functionName: "lock",
                    successMessage: "Deposit successful!",
                    args: [account, balance, 0],
                  };
                }}
                disabled={!termsAccepted}
                allowance={isDeposit ? allowance?.value : constants.MaxUint256}
              >
                {({ ActionableComponent }) => (
                  <div className="mt-6">
                    <StakingTermsAndConditions
                      isDisabled={!isDeposit}
                      termsAccepted={termsAccepted}
                      setTermsAccepted={() => setTermsAccepted(() => !termsAccepted)}
                      showLockTerms
                    />
                    <div className="mx-auto pb-2">
                      <ActionableComponent />
                    </div>
                  </div>
                )}
              </AssetInputWithAction>
            ) : (
              <div className="pb-4">
                <div className="w-full mb-10">
                  {/* check if lockedBalances[0] is not undefined */}
                  {lockedBalances?.lockData?.length && lockedBalances.lockData[0].unlockTime ? (
                    <VestingRecordDropDown
                      label={"Stake Records"}
                      options={lockedBalances?.lockData}
                      selectOption={setChosenLock}
                      selectedOption={chosenLock}
                    />
                  ) : (
                    <></>
                  )}
                  {chosenLock && (
                    <div className="flex flex-row flex-wrap lglaptop:justify-between -mr-2 justify-center my-10">
                      <div className="bg-gray-50 p-4 mb-2 flex-col rounded-2xl mr-2 max-w-1/2 flex-1 lglaptop:w-fit">
                        <p className="text-gray-500">AMOUNT</p>
                        <p className="text-gray-900 text-lg font-semibold">
                          {formatAndRoundBigNumber(chosenLock.amount, 18)} POP
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 mb-2 flex-col rounded-2xl mr-2 max-w-1/2 flex-1 lglaptop:w-fit">
                        <p className="text-gray-500 whitespace-nowrap">UNLOCK DATE</p>
                        <p className="text-gray-900 text-lg font-semibold">
                          {formatDate(new Date(chosenLock.unlockTime * 1000), "MMM dd")}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 mb-2 flex-col rounded-2xl mr-2 lglaptopt:mt-0 max-w-1/2 flex-1 lglaptop:w-fit">
                        <p className="text-gray-500">REMAINING</p>
                        <p className="text-gray-900 text-lg font-semibold">
                          {Math.floor((chosenLock.unlockTime * 1000 - Date.now()) / (60 * 60 * 24 * 7) / 1000)} Weeks
                        </p>
                      </div>
                    </div>
                  )}
                  <p className="mb-2 text-primary">Withdrawable Amount</p>
                  <div className="relative flex items-center">
                    <input
                      type="string"
                      name="tokenInput"
                      id="tokenInput"
                      className="shadow-sm block w-full pl-4 pr-16 py-4 text-lg border-gray-300 bg-gray-100 rounded-xl"
                      value={formatAndRoundBigNumber(lockedBalances?.unlockable, 18)}
                      disabled
                    />
                    <div className="absolute inset-y-0 right-0 flex py-1.5 pr-1.5">
                      <p className="inline-flex items-center  font-medium text-lg mx-3">POP</p>
                    </div>
                  </div>
                  <div className="flex flex-row items-center mt-4">
                    <input
                      type="checkbox"
                      checked={restake}
                      onChange={() => setRestake(!restake)}
                      className={`mr-4 rounded h-5 w-5 border-customLightGray 
                    ${restake && !lockedBalances?.unlockable.eq(constants.Zero)
                          ? "focus:ring-blue-500 text-blue-600"
                          : "focus:ring-gray-500 text-primaryDark"
                        }`}
                      disabled={lockedBalances?.unlockable.eq(constants.Zero)}
                    />
                    <p className="text-primaryDark">Restake POP</p>
                  </div>
                </div>
                <div className="pt-3">
                  <MainActionButton
                    label={`${restake ? "Restake" : "Withdraw"} POP`}
                    handleClick={restakeLock}
                    disabled={lockedBalances?.unlockable.eq(constants.Zero)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="md:w-2/3 md:ml-8 order-1 md:order-2">
          <div className="w-full md:grid grid-cols-12 gap-8 hidden">
            <div className="rounded-lg border border-customLightGray p-6 pb-4 col-span-12 md:col-span-6">
              <div className="flex gap-6 md:gap-0 md:space-x-6 items-center pb-6">
                <div className="relative ml-4">
                  <NetworkSticker chainId={chainId} />
                  <TokenIcon token={pop?.address} chainId={chainId} imageSize="w-12 h-12" />
                </div>
                <div>
                  <div className="flex md:mb-2">
                    <h2 className="text-primaryLight leading-5 text-base">Your Staked Balance</h2>
                    <InfoIconWithTooltip
                      classExtras="mt-0 ml-1 md:ml-2 p-0"
                      id="1"
                      title="Staked Balance"
                      content={`This is the balance of POP that you have staked.`}
                    />
                  </div>
                  <p className="text-primary text-2xl leading-6">
                    <Erc20.BalanceOf chainId={chainId} account={account} address={popStaking?.address} /> POP
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-customLightGray p-6 pb-4 col-span-12 md:col-span-6">
              <div className="flex gap-6 md:gap-0 md:space-x-6 items-center pb-6">
                <div className="relative ml-4">
                  <NetworkSticker chainId={chainId} />
                  <TokenIcon token={pop?.address} chainId={chainId} imageSize="w-12 h-12" />
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
                    <Staking.ClaimableBalanceOf chainId={chainId} account={account} address={popStaking?.address} /> POP
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
                      <NetworkSticker chainId={chainId} />
                      <TokenIcon token={pop?.address} chainId={chainId} />
                    </div>
                    <div className="pb-6">
                      <div className="flex">
                        <h2 className="text-primaryLight leading-5 text-base">Your Staked Balance</h2>
                        <InfoIconWithTooltip
                          classExtras="mt-0 ml-1 md:ml-2 md:mb-2 p-0"
                          id="1"
                          title="Staked Balance"
                          content={`This is the balance of POP that you have staked.`}
                        />
                      </div>
                      <p className="text-primary text-2xl">
                        <Erc20.BalanceOf chainId={chainId} account={account} address={popStaking?.address} />
                        POP
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-1">
                <div className="rounded-lg border border-customLightGray p-6 col-span-12 md:col-span-6">
                  <div className="flex gap-6 md:gap-0 md:space-x-6">
                    <div className="relative ml-4">
                      <NetworkSticker chainId={chainId} />
                      <TokenIcon token={pop?.address} chainId={chainId} />
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
                        <Staking.ClaimableBalanceOf chainId={chainId} account={account} address={popStaking?.address} />
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
    </NoSSR>
  );
}
