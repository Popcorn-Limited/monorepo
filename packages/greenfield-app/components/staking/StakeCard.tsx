import { ChainId, networkMap } from "@popcorn/greenfield-app/lib/utils";
import MainActionButton from "@popcorn/greenfield-app/components/MainActionButton";
import TokenIcon from "@popcorn/greenfield-app/components/TokenIcon";
import { StakingType } from "hooks/staking/useAllStakingAddresses";
import { useRouter } from "next/router";
import ContentLoader from "react-content-loader";
import { Tvl } from "@popcorn/greenfield-app/lib/Contract";
import { Staking, Contract } from "@popcorn/greenfield-app/lib";
import { ValueOfBalance } from "@popcorn/greenfield-app/lib/Erc20";
import { Address } from "wagmi";
import { NetworkSticker } from "@popcorn/greenfield-app/components/NetworkSticker";

interface StakeCardProps {
  stakingAddress: string;
  stakingType: StakingType;
  chainId: ChainId;
}

const StakeCard: React.FC<StakeCardProps> = ({ stakingAddress, stakingType, chainId }) => {
  const router = useRouter();

  function onSelectPool() {
    router?.push(
      `/${networkMap[chainId]?.toLowerCase()}/staking/${stakingType === StakingType.PopLocker ? "pop" : stakingAddress
      }`,
    );
  }

  return (
    <Staking.StakingToken address={stakingAddress} chainId={chainId}>
      {(stakingToken) => (
        <Contract.Metadata address={stakingToken} chainId={chainId}>
          {(metadata) => (
            <>
              <div className={`my-4 ${metadata ? "hidden" : ""}`}>
                <ContentLoader viewBox="0 0 450 60" backgroundColor={"#EBE7D4"} foregroundColor={"#d7d5bc"}>
                  {/*eslint-disable */}
                  <rect x="0" y="0" rx="8" ry="8" width="450" height="60" />
                  {/*eslint-enable */}
                </ContentLoader>
              </div>

              <div
                className={`border-b border-b-customLightGray border-opacity-40 cursor-pointer hover:scale-102 hover:border-opacity-60 
                transition duration-500 ease-in-out transform relative ${metadata === undefined ? "hidden" : ""}`}
                onClick={onSelectPool}
              >
                <div className="py-8 md:p-8">
                  <div className="flex flex-row items-center justify-between pl-4 md:pl-0">
                    <div className="flex items-center">
                      <div className="relative">
                        <NetworkSticker chainId={chainId} />
                        <TokenIcon token={stakingToken} chainId={chainId} fullsize />
                      </div>
                      <div className="flex flex-col md:flex-row md:items-center ml-2 md:ml-0">
                        <h3 className="text-3xl md:text-4xl md:ml-2 mb-2 md:mb-0 font-normal leading-9">
                          {metadata?.name}
                        </h3>
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
                        <Staking.Apy chainId={chainId} address={stakingAddress} />
                      </p>
                    </div>
                    <div className="w-1/2 md:w-1/4 mt-6 md:mt-0">
                      <p className="text-primaryLight leading-6">TVL</p>
                      <div className="text-primary text-2xl md:text-3xl leading-6 md:leading-8">
                        {/* Somehow the Convex Staking Contract breaks on optimism. Therefore we simply check the balanceOf pop token in the staking contract */}
                        {chainId === ChainId.Optimism ? (
                          <ValueOfBalance
                            chainId={chainId}
                            address={"0x6F0fecBC276de8fC69257065fE47C5a03d986394"}
                            account={stakingAddress as Address}
                          />
                        ) : (
                          <Tvl chainId={chainId} address={stakingAddress} />
                        )}
                      </div>
                    </div>
                    <div className="w-full md:w-1/2 mt-6 md:mt-0">
                      <p className="text-primaryLight leading-6">Token Emissions</p>
                      <p className="text-primary text-2xl md:text-3xl leading-6 md:leading-8">
                        <span className=" text-tokenTextGray text-xl">
                          <Staking.TokenEmission chainId={chainId} address={stakingAddress} /> POP / day
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="w-full mt-6 smmd:hidden">
                    <MainActionButton label="View" handleClick={onSelectPool} />
                  </div>
                </div>
              </div>
            </>
          )}
        </Contract.Metadata>
      )}
    </Staking.StakingToken>
  );
};

export default StakeCard;
