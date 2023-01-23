import { ChainId, formatAndRoundBigNumber, networkLogos } from "@popcorn/utils";
import { StakingPool, Token } from "@popcorn/utils/src/types";
import { constants } from "ethers";
import { useContractMetadata } from "@popcorn/app/hooks/useContractMetadata";
import Badge, { Badge as BadgeType } from "@popcorn/app/components/Common/Badge";
import MainActionButton from "@popcorn/app/components/MainActionButton";
import TokenIcon from "@popcorn/app/components/TokenIcon";
import useTokenPrices from "@popcorn/app/hooks/tokens/useTokenPrices";

interface StakeCardProps {
  stakingPool: StakingPool;
  stakedToken: Token;
  onSelectPool: (stakingContractAddress: string, stakingTokenAddress: string) => void;
  badge?: BadgeType;
  chainId: ChainId;
  networkLogo?: string;
}

const StakeCard: React.FC<StakeCardProps> = ({ stakingPool, stakedToken, onSelectPool, badge, chainId }) => {
  const tokenAddress = stakedToken?.address?.toLowerCase();
  const { data: tokenPriceData } = useTokenPrices([tokenAddress], chainId);
  const tokenPrice = tokenPriceData?.[tokenAddress];
  const metadata = useContractMetadata(tokenAddress, chainId);

  return (
    <div
      className={`border-b border-b-customLightGray cursor-pointer hover:scale-102 transition duration-500 ease-in-out transform relative ${
        stakingPool === undefined ? "hidden" : ""
      }`}
      onClick={async () => onSelectPool(stakingPool?.address, stakedToken?.address)}
    >
      <img src={networkLogos[chainId]} alt={ChainId[chainId]} className="w-4.5 h-4 mr-4" />
      <div className="py-8 md:p-8">
        <div className="flex flex-row items-center justify-between">
          <div className="flex items-center">
            <TokenIcon token={stakedToken?.address} chainId={chainId} fullsize />
            <div className="flex flex-col md:flex-row md:items-center ml-2 md:ml-0">
              <h3 className="text-3xl md:text-4xl md:ml-2 mb-2 md:mb-0 font-normal leading-9">
                {metadata?.name ? metadata.name : stakedToken?.name}
              </h3>
              {badge && (
                <div className="md:pl-2">
                  <Badge badge={badge} />
                </div>
              )}
            </div>
          </div>
          <div className="hidden smmd:block">
            <MainActionButton label="View" handleClick={async () => onSelectPool(stakingPool?.address, tokenAddress)} />
          </div>
        </div>
        <div className="flex flex-row flex-wrap items-center mt-0 md:mt-6 justify-between">
          <div className="w-1/2 md:w-1/4 mt-6 md:mt-0">
            <p className="text-primaryLight leading-6">vAPR</p>
            <p className="text-primary text-2xl md:text-3xl leading-6 md:leading-8">
              {stakingPool?.apy.lt(constants.Zero)
                ? "New 🍿✨"
                : formatAndRoundBigNumber(stakingPool?.apy, stakedToken?.decimals) + "%"}
            </p>
          </div>
          <div className="w-1/2 md:w-1/4 mt-6 md:mt-0">
            <p className="text-primaryLight leading-6">TVL</p>
            <p className="text-primary text-2xl md:text-3xl leading-6 md:leading-8">
              {tokenPrice
                ? `$ ${formatAndRoundBigNumber(
                    stakingPool?.totalStake?.mul(tokenPrice).div(constants.WeiPerEther),
                    stakedToken?.decimals,
                  )}`
                : "..."}
            </p>
          </div>
          <div className="w-full md:w-1/2 mt-6 md:mt-0">
            <p className="text-primaryLight leading-6">Token Emissions</p>
            <p className="text-primary text-2xl md:text-3xl leading-6 md:leading-8">
              {formatAndRoundBigNumber(stakingPool?.tokenEmission, stakedToken?.decimals)}{" "}
              <span className=" text-tokenTextGray text-xl"> POP / day</span>
            </p>
          </div>
        </div>
        <div className="w-full mt-6 smmd:hidden">
          <MainActionButton label="View" handleClick={async () => onSelectPool(stakingPool?.address, tokenAddress)} />
        </div>
      </div>
    </div>
  );
};

export default StakeCard;
