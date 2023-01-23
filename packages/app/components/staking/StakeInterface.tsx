import { ChevronLeftIcon } from "@heroicons/react/solid";
import MobileCardSlider from "@popcorn/app/components/Common/MobileCardSlider";
import StatusWithLabel from "@popcorn/app/components/Common/StatusWithLabel";
import { InfoIconWithTooltip } from "@popcorn/app/components/InfoIconWithTooltip";
import SecondaryActionButton from "@popcorn/app/components/SecondaryActionButton";
import TokenIcon from "@popcorn/app/components/TokenIcon";
import TokenInputToggle from "@popcorn/app/components/TokenInputToggle";
import { ChainId, formatAndRoundBigNumber } from "@popcorn/utils";
import { BigNumber, constants } from "ethers";
import useNetworkName from "@popcorn/app/hooks/useNetworkName";
import Link from "next/link";
import { useRouter } from "next/router";
import useContractMetadata from "@popcorn/app/hooks/useContractMetadata";
import PopLockerInteraction from "@popcorn/app/components/staking/PopLockerInteraction";
import StakingInteraction, { StakingInteractionProps } from "@popcorn/app/components/staking/StakingInteraction";
import { NetworkSticker } from "@popcorn/app/components/NetworkSticker";
import { useDeployment } from "@popcorn/app/hooks/useDeployment";
import usePopLocker from "@popcorn/app/hooks/staking/usePopLocker";
import { Pop } from "@popcorn/components/lib/types";

interface StakeInterfaceProps extends StakingInteractionProps {
  stakedTokenPrice: BigNumber;
  chainId: number;
  restake?: () => void;
  isPopLocker?: boolean;
  spendableBalance?: Pop.HookResult<BigNumber>;
}

export interface StakingForm {
  amount: BigNumber;
  type: InteractionType;
  termsAccepted: boolean;
}

export enum InteractionType {
  Deposit,
  Withdraw,
}

export const defaultForm = {
  amount: constants.Zero,
  type: InteractionType.Deposit,
  termsAccepted: false,
};

export default function StakeInterface({
  stakingPool,
  user,
  form,
  stake,
  withdraw,
  approve,
  onlyView,
  chainId,
  restake,
  isPopLocker,
  stakedTokenPrice,
  account,
  spendableBalance,
}: StakeInterfaceProps): JSX.Element {
  const stakingToken = stakingPool?.stakingToken;
  const popMetadata = useContractMetadata(stakingToken?.address, chainId);
  const buyLink = chainId == ChainId.Polygon ? popMetadata?.buyLinkPolygon : popMetadata?.buyLinkEthereum;
  const [state, setState] = form;
  const router = useRouter();
  const networkName = useNetworkName();
  const { Ethereum } = ChainId;
  const { popStaking } = useDeployment(Ethereum);
  const { data: popPool } = usePopLocker(popStaking, Ethereum);

  const toggleInterface = () =>
    setState({
      ...defaultForm,
      type: state.type === InteractionType.Deposit ? InteractionType.Withdraw : InteractionType.Deposit,
    });

  return (
    <>
      <div className="-ml-2">
        <div className="flex items-center cursor-pointer" onClick={() => router.push("/staking")}>
          <ChevronLeftIcon className="w-6 h-6 text-secondaryLight" />
          <p className="text-primary">Staking</p>
        </div>
      </div>

      <div className="grid grid-cols-12 mt-10">
        <div className="col-span-12 md:col-span-5">
          <div className="relative ml-4">
            <NetworkSticker />
            <TokenIcon token={stakingToken?.address} chainId={chainId} />
          </div>
          <h1 className="text-black text-5xl md:text-6xl leading-12 mt-9">{stakingToken?.name}</h1>
          <div className="flex flex-wrap">
            <div className="block pr-8 md:pr-6 mt-6 md:mt-8">
              <StatusWithLabel
                content={
                  stakingPool?.apy.lt(constants.Zero) ? "New 🍿✨" : formatAndRoundBigNumber(stakingPool?.apy, 18) + "%"
                }
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
              <StatusWithLabel
                content={
                  stakingPool && stakedTokenPrice
                    ? `$${formatAndRoundBigNumber(
                        stakingPool?.totalStake.mul(stakedTokenPrice).div(constants.WeiPerEther),
                        18,
                      )}`
                    : "..."
                }
                label="TVL"
              />
            </div>
            <div className="block mt-6 md:mt-8 pr-8 md:pr-0 md:pl-6 md:border-l md:border-customLightGray">
              <StatusWithLabel
                content={`${
                  stakingPool ? formatAndRoundBigNumber(stakingPool.tokenEmission, stakingToken.decimals) : "0"
                } POP / day`}
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
              <TokenInputToggle
                state={[state.type !== InteractionType.Deposit, toggleInterface]}
                labels={["Stake", "Unstake"]}
              />
            </div>
            {isPopLocker ? (
              <PopLockerInteraction
                chainId={chainId}
                stakingPool={stakingPool}
                user={user}
                form={form}
                onlyView={onlyView}
                approve={approve}
                spendableBalance={spendableBalance}
                stake={stake}
                withdraw={withdraw}
                account={account}
                restake={restake}
              />
            ) : (
              <StakingInteraction
                chainId={chainId}
                stakingPool={stakingPool}
                user={user}
                form={form}
                onlyView={onlyView}
                approve={approve}
                account={account}
                stake={stake}
                withdraw={withdraw}
              />
            )}
          </div>
        </div>

        <div className="md:w-2/3 md:ml-8 order-1 md:order-2">
          <div className="w-full md:grid grid-cols-12 gap-8 hidden">
            <div className="rounded-lg border border-customLightGray p-6 pb-4 col-span-12 md:col-span-6">
              <div className="flex gap-6 md:gap-0 md:space-x-6 items-center pb-6">
                <div className="relative ml-4">
                  <NetworkSticker />
                  <TokenIcon token={stakingToken?.address} chainId={chainId} imageSize="w-12 h-12" />
                </div>
                <div>
                  <div className="flex md:mb-2">
                    <h2 className="text-primaryLight leading-5 text-base">Your Staked Balance</h2>
                    <InfoIconWithTooltip
                      classExtras="mt-0 ml-1 md:ml-2 p-0"
                      id="1"
                      title="Staked Balance"
                      content={`This is the balance of ${stakingToken?.symbol} that you have staked.`}
                    />
                  </div>
                  <p className="text-primary text-2xl leading-6">
                    {stakingPool?.userStake
                      ? formatAndRoundBigNumber(stakingPool.userStake, stakingToken.decimals)
                      : "0"}{" "}
                    {stakingToken?.symbol}
                  </p>
                </div>
              </div>
              <Link href={buyLink || "#"} passHref target={`${buyLink ? "_blank" : "_self"}`}>
                <div className="border-t border-customLightGray pt-2 px-1">
                  <SecondaryActionButton label="Get Token" />
                </div>
              </Link>
            </div>

            <div className="rounded-lg border border-customLightGray p-6 pb-4 col-span-12 md:col-span-6">
              <div className="flex gap-6 md:gap-0 md:space-x-6 items-center pb-6">
                <div className="relative ml-4">
                  <NetworkSticker />
                  <TokenIcon token={popPool?.stakingToken?.address} chainId={chainId} imageSize="w-12 h-12" />
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
                    {stakingPool?.earned ? formatAndRoundBigNumber(stakingPool.earned, stakingToken.decimals) : "0"} POP
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
                      <TokenIcon token={stakingToken?.address} chainId={chainId} />
                    </div>
                    <div className="pb-6">
                      <div className="flex">
                        <h2 className="text-primaryLight leading-5 text-base">Your Staked Balance</h2>
                        <InfoIconWithTooltip
                          classExtras="mt-0 ml-1 md:ml-2 md:mb-2 p-0"
                          id="1"
                          title="Staked Balance"
                          content={`This is the balance of ${stakingToken?.symbol} that you have staked.`}
                        />
                      </div>
                      <p className="text-primary text-2xl">
                        {stakingPool?.userStake
                          ? formatAndRoundBigNumber(stakingPool.userStake, stakingToken.decimals)
                          : "0"}{" "}
                        {stakingToken?.symbol}
                      </p>
                    </div>
                  </div>
                  <Link href={buyLink || "#"} passHref target={`${buyLink ? "_blank" : "_self"}`}>
                    <div className="border-t border-customLightGray pt-2 px-1">
                      <SecondaryActionButton label="Get Token" />
                    </div>
                  </Link>
                </div>
              </div>

              <div className="px-1">
                <div className="rounded-lg border border-customLightGray p-6 col-span-12 md:col-span-6">
                  <div className="flex gap-6 md:gap-0 md:space-x-6">
                    <div className="relative ml-4">
                      <NetworkSticker />
                      <TokenIcon token={stakingToken?.address} chainId={chainId} />
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
                        {stakingPool?.earned ? formatAndRoundBigNumber(stakingPool.earned, stakingToken.decimals) : "0"}{" "}
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

          <div className="bg-customLightYellow rounded-lg p-8 hidden md:flex flex-col justify-between mt-8">
            <h2 className=" text-6xl leading-11">{/* removed text for now - @am */}</h2>
            <div className="flex justify-end mt-28">
              <img src="/images/hands.svg" alt="" className=" h-28 w-28" />
            </div>
          </div>
        </div>
      </div>

      {/* <FooterLandScapeImage/> */}
    </>
  );
}
