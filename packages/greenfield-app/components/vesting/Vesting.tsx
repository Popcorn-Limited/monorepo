import RewardSummaryCard from "@popcorn/app/components/Rewards/RewardSummaryCard";
import useClaimEscrows from "@popcorn/app/hooks/useClaimEscrows";
import { useDeployment } from "@popcorn/app/hooks/useDeployment";
import { useTransaction } from "@popcorn/app/hooks/useTransaction";
import { ChainId, formatAndRoundBigNumber, networkLogos } from "@popcorn/utils";
import { BigNumber, constants } from "ethers";
import useEscrows from "hooks/vesting/useEscrows";
import { useEffect } from "react";
import ContentLoader from "react-content-loader";
import Image from "next/image";

interface VestingProps {
  chainId: ChainId;
  addClaimable: (amount: BigNumber) => void;
  isNotAvailable: boolean;
}

export default function Vesting({ chainId, addClaimable, isNotAvailable }: VestingProps): JSX.Element {
  const { rewardsEscrow } = useDeployment(chainId);
  const claimVestedPopFromEscrows = useClaimEscrows(rewardsEscrow, chainId);
  const transaction = useTransaction(chainId);
  const { escrows, totalClaimablePop, totalVestingPop, revalidate, isValidating, error } = useEscrows(chainId);

  useEffect(() => {
    if ((totalClaimablePop && !isValidating) || error) {
      addClaimable(totalClaimablePop);
    }
  }, [totalClaimablePop, error, isValidating, addClaimable]);

  const claimAllEscrows = async () => {
    const escrowsIds = escrows.map((escrow) => escrow.id);
    const numberOfEscrows = escrowsIds ? escrowsIds.length : 0;
    if (numberOfEscrows && numberOfEscrows > 0) {
      transaction(() => claimVestedPopFromEscrows(escrowsIds), "Claiming Escrows...", "Claimed Escrows!", revalidate);
    }
  };
  return (
    <>
      <div className={`my-4 ${isNotAvailable || (!isValidating && totalClaimablePop) || error ? "hidden" : ""}`}>
        <ContentLoader viewBox="0 0 450 100" backgroundColor={"#EBE7D4"} foregroundColor={"#d7d5bc"}>
          {/*eslint-disable */}
          <rect x="0" y="0" rx="8" ry="8" width="450" height="100" />
          {/*eslint-enable */}
        </ContentLoader>
      </div>
      <div
        className={`flex flex-col h-full ${!totalClaimablePop || totalClaimablePop.eq(constants.Zero) ? "hidden" : ""}`}
      >
        <div className="flex flex-row items-center mt-4">
          <div className="w-4 h-4 mr-4 relative">
            <Image src={networkLogos[chainId]} alt={ChainId[chainId]} fill />
          </div>
          <p className="text-xl mt-0.5">{ChainId[chainId]}</p>
        </div>
        <div className="flex flex-col md:flex-row gap-8 md:gap-0 md:space-x-8 w-full mb-8 mt-4">
          {totalVestingPop && (
            <RewardSummaryCard
              content={`${formatAndRoundBigNumber(totalVestingPop, 18)} POP`}
              title={"Total Vesting"}
              iconUri="/images/lock.svg"
              infoIconProps={{
                id: "Total Vesting",
                title: "Total Vesting",
                content:
                  "Every time you claim rewards a new 'Vesting Record' below will be added. Rewards in each 'Vesting Record' unlock over time. Come back periodically to claim new rewards as they unlock.",
                classExtras: "h-5 w-5 ml-2",
              }}
            />
          )}
          {totalClaimablePop && (
            <RewardSummaryCard
              content={`${formatAndRoundBigNumber(totalClaimablePop, 18)} POP`}
              title={"Total Claimable"}
              iconUri="/images/yellowCircle.svg"
              button={true}
              handleClick={() => claimAllEscrows()}
              infoIconProps={{
                id: "Total Claimable",
                title: "Total Claimable",
                content:
                  "This describes the total amount of Rewards that you can currently claim across all 'Vesting Records'.",
                classExtras: "h-5 w-5 ml-2",
              }}
            />
          )}
        </div>
        <div className="flex flex-col border-t border-customLightGray overflow-hidden" />
      </div>
    </>
  );
}
