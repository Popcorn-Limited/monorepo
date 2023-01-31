import { Address, useAccount } from "wagmi";
import { BigNumber, constants } from "ethers";
import toast from "react-hot-toast";
import Image from "next/image";
import ContentLoader from "react-content-loader";

import { ChainId, formatAndRoundBigNumber, networkLogos } from "@popcorn/utils";
import { Contract, Staking } from "@popcorn/components/lib";
import { useClaim } from "@popcorn/components/lib/Staking/hooks";
import MainActionButton from "@popcorn/app/components/MainActionButton";
import TokenIcon from "@popcorn/app/components/TokenIcon";
import useClaimModal from "./useClaimModal";

interface ClaimCardProps {
  staking: Address;
  chainId: ChainId;
  addEarned: (amount: BigNumber) => void;
}

const ClaimCard: React.FC<ClaimCardProps> = ({ staking, chainId, addEarned }) => {
  const { address: account } = useAccount();
  const { openModal } = useClaimModal();

  const { write: claim } = useClaim(staking, chainId, account, {
    onSuccess: () => {
      toast.success("Rewards Claimed!", {
        position: "top-center",
      });
      openModal();
    },
  });

  return (
    <Staking.StakingToken address={staking} chainId={chainId}>
      {(stakingToken) => (
        <Contract.Metadata chainId={chainId} address={stakingToken}>
          {(metadata) => (
            <Staking.ClaimableBalanceOf
              address={staking}
              account={account}
              chainId={chainId}
              callback={addEarned}
              render={({ balance: earned, status, decimals }) => (
                <>
                  <div className={`my-4 ${status !== "loading" ? "hidden" : ""}`}>
                    <ContentLoader viewBox="0 0 450 80" backgroundColor={"#EBE7D4"} foregroundColor={"#d7d5bc"}>
                      {/*eslint-disable */}
                      <rect x="0" y="0" rx="8" ry="8" width="450" height="80" />
                      {/*eslint-enable */}
                    </ContentLoader>
                  </div>
                  <div
                    className={`hover:scale-102 transition duration-500 ease-in-out transform w-full md:h-48 border-b border-customLightGray border-opacity-40
               ${status !== "success" || earned?.eq(constants.Zero) ? "hidden" : ""}`}
                  >
                    <div className="flex flex-col md:flex-row justify-between pt-4 pb-6 md:px-8">
                      <div className="flex flex-col justify-between">
                        <div className="flex flex-row items-center pl-4 md:pl-0">
                          <div className="flex items-center relative">
                            <div className="absolute top-0 -left-4">
                              <Image
                                src={networkLogos[chainId]}
                                alt={ChainId[chainId] + " logo"}
                                height="24"
                                width="24"
                              />
                            </div>
                            <TokenIcon token={stakingToken} chainId={chainId} fullsize />
                          </div>
                          <h1
                            className={`text-2xl md:text-4xl leading-7 md:leading-12 mt-1 ml-4 text-black line-clamp-2 overflow-hidden`}
                          >
                            {metadata.name}
                          </h1>
                        </div>
                        <div className="my-6 md:my-0">
                          <p className="text-primaryLight leading-6">Rewards</p>
                          <h1 className={`text-2xl md:text-3xl leading-8 text-primary`}>
                            {formatAndRoundBigNumber(earned, decimals)}{" "}
                            <span className=" text-tokenTextGray text-xl"> POP</span>
                          </h1>
                        </div>
                      </div>
                      <div>
                        <MainActionButton handleClick={claim} label="Claim" disabled={earned?.eq(constants.Zero)} />
                      </div>
                    </div>
                  </div>
                </>
              )}
            />
          )}
        </Contract.Metadata>
      )}
    </Staking.StakingToken>
  );
};

export default ClaimCard;
