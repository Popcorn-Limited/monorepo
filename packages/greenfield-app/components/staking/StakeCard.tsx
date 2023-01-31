import { ChainId, formatAndRoundBigNumber, networkMap } from "@popcorn/utils";
import { constants } from "ethers";
import { useContractMetadata } from "@popcorn/app/hooks/useContractMetadata";
import Badge, { Badge as BadgeType } from "@popcorn/app/components/Common/Badge";
import MainActionButton from "@popcorn/app/components/MainActionButton";
import TokenIcon from "@popcorn/app/components/TokenIcon";
import useStakingPool from "@popcorn/app/hooks/staking/useStakingPool";
import usePopLocker from "@popcorn/app/hooks/staking/usePopLocker";
import { StakingType } from "hooks/staking/useAllStakingAddresses";
import { useRouter } from "next/router";
import ContentLoader from "react-content-loader";
import { NetworkSticker } from "@popcorn/app/components/NetworkSticker";
import { Tvl } from "@popcorn/components/lib/Contract";
import { Staking, PopLocker } from "@popcorn/components/lib";

interface StakeCardProps {
  stakingAddress: string;
  stakingType: StakingType;
  chainId: ChainId;
  badge?: BadgeType;
}

const StakeCard: React.FC<StakeCardProps> = ({ stakingAddress, stakingType, chainId, badge }) => {
  const router = useRouter();

  // Fetch either popLocker or stakingPool
  const {
    data: popLocker,
    isValidating: popLockerIsValidating,
    error: popLockerError,
  } = usePopLocker(stakingAddress, chainId);
  const {
    data: stakingPool,
    isValidating: stakingPoolIsValidating,
    error: stakingPoolError,
  } = useStakingPool(stakingAddress, chainId);

  const staking = stakingType === StakingType.PopLocker ? popLocker : stakingPool;
  const isValidating = stakingType === StakingType.PopLocker ? popLockerIsValidating : stakingPoolIsValidating;
  const error = stakingType === StakingType.PopLocker ? popLockerError : stakingPoolError;

  const metadata = useContractMetadata(staking?.stakingToken?.address, chainId);

  function onSelectPool() {
    router?.push(
      `/${networkMap[chainId]?.toLowerCase()}/staking/${
        stakingType === StakingType.PopLocker ? "pop" : stakingAddress
      }`,
    );
  }

  return (
    <span>
      <div className={`my-4 ${isValidating && !staking && !error ? "" : "hidden"}`}>
        <ContentLoader viewBox="0 0 450 60" backgroundColor={"#EBE7D4"} foregroundColor={"#d7d5bc"}>
          {/*eslint-disable */}
          <rect x="0" y="0" rx="8" ry="8" width="450" height="60" />
          {/*eslint-enable */}
        </ContentLoader>
      </div>

      <div
        className={`border-b border-b-customLightGray  border-opacity-40 cursor-pointer hover:scale-102 hover:border-opacity-60 transition duration-500 ease-in-out transform relative ${
          staking === undefined ? "hidden" : ""
        }`}
        onClick={onSelectPool}
      >
        <div className="py-8 md:p-8">
          <div className="flex flex-row items-center justify-between pl-4 md:pl-0">
            <div className="flex items-center">
              <div className="relative">
                <NetworkSticker selectedChainId={chainId} />
                <TokenIcon token={staking?.stakingToken?.address} chainId={chainId} fullsize />
              </div>
              <div className="flex flex-col md:flex-row md:items-center ml-2 md:ml-0">
                <h3 className="text-3xl md:text-4xl md:ml-2 mb-2 md:mb-0 font-normal leading-9">
                  {metadata?.name ? metadata.name : staking?.stakingToken?.name}
                </h3>
                {badge && (
                  <div className="md:pl-2">
                    <Badge badge={badge} />
                  </div>
                )}
              </div>
            </div>
            <div className="hidden smmd:block">
              <MainActionButton label="View" handleClick={onSelectPool} />
            </div>
          </div>
          <div className="flex flex-row flex-wrap items-center mt-0 md:mt-6 justify-between">
            <div className="w-1/2 md:w-1/4 mt-6 md:mt-0">
              <p className="text-primaryLight leading-6">vAPR</p>
              <p className="text-primary text-2xl md:text-3xl leading-6 md:leading-8">
                {staking?.apy.lt(constants.Zero)
                  ? "New 🍿✨"
                  : formatAndRoundBigNumber(staking?.apy, staking?.stakingToken?.decimals) + "%"}
              </p>
            </div>
            <div className="w-1/2 md:w-1/4 mt-6 md:mt-0">
              <p className="text-primaryLight leading-6">TVL</p>
              <div className="text-primary text-2xl md:text-3xl leading-6 md:leading-8">
                <Tvl chainId={chainId} address={staking?.address} />
              </div>
            </div>
            <div className="w-full md:w-1/2 mt-6 md:mt-0">
              <p className="text-primaryLight leading-6">Token Emissions</p>
              <p className="text-primary text-2xl md:text-3xl leading-6 md:leading-8">
                <span className=" text-tokenTextGray text-xl">
                  {stakingType === StakingType.PopLocker ? (
                    <PopLocker.TokenEmission chainId={chainId} address={stakingAddress} />
                  ) : (
                    <Staking.TokenEmission chainId={chainId} address={stakingAddress} />
                  )}{" "}
                  POP / day
                </span>
              </p>
            </div>
          </div>
          <div className="w-full mt-6 smmd:hidden">
            <MainActionButton label="View" handleClick={onSelectPool} />
          </div>
        </div>
      </div>
    </span>
  );
};

export default StakeCard;
