import RewardSummaryCard from "./RewardSummaryCard";
import { ChainId, formatAndRoundBigNumber, networkLogos } from "@popcorn/utils";
import { BigNumber, constants } from "ethers";
import { useEffect, useState } from "react";
import ContentLoader from "react-content-loader";
import Image from "next/image";
import { useNamedAccounts } from "@popcorn/greenfield-app/lib/utils";
import { useAccount, useNetwork, useSwitchNetwork } from "wagmi";
import { useEscrows } from "@popcorn/greenfield-app/lib/Escrow";
import toast from "react-hot-toast";
import { useClaimEscrow } from "@popcorn/greenfield-app/hooks";

interface VestingProps {
  chainId: ChainId;
  addClaimable: (amount: BigNumber) => void;
  isNotAvailable: boolean;
}

export default function Vesting({ chainId, addClaimable, isNotAvailable }: VestingProps): JSX.Element {
  const { address: account } = useAccount();
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  const [rewardsEscrow] = useNamedAccounts(chainId as any, ["rewardsEscrow"]);
  const { data: escrows, status } = useEscrows({ chainId, address: rewardsEscrow?.address, account });
  const [totalClaimable, setTotalClaimable] = useState(constants.Zero);
  const [totalVesting, setTotalVesting] = useState(constants.Zero);
  const escrowsIds: string[] = escrows
    ?.filter((escrow) => escrow.claimable.gt(constants.Zero))
    .map((escrow) => escrow.id);

  useEffect(() => {
    if (
      status === "success" &&
      !!escrows &&
      escrows.length > 0 &&
      (totalClaimable.eq(constants.Zero) || totalVesting.eq(constants.Zero))
    ) {
      const claimable = escrows.reduce((acc, curr) => acc.add(curr.claimable || 0), constants.Zero) || constants.Zero;
      const vesting = escrows.reduce((acc, curr) => acc.add(curr.vesting || 0), constants.Zero) || constants.Zero;
      addClaimable(claimable);
      setTotalClaimable(claimable);
      setTotalVesting(vesting);
    }
  }, [escrows, status]);

  const { write: claimVesting } = useClaimEscrow(escrowsIds, rewardsEscrow?.address, Number(chainId), {
    onSuccess: () => {
      toast.success("Claimed Vesting!", {
        position: "top-center",
      });
    },
  });

  return (
    <>
      <div className={`my-4 ${isNotAvailable || status !== "loading" ? "hidden" : ""}`}>
        <ContentLoader viewBox="0 0 450 100" backgroundColor={"#EBE7D4"} foregroundColor={"#d7d5bc"}>
          {/*eslint-disable */}
          <rect x="0" y="0" rx="8" ry="8" width="450" height="100" />
          {/*eslint-enable */}
        </ContentLoader>
      </div>
      <div className={`flex flex-col h-full ${totalClaimable.eq(constants.Zero) ? "hidden" : ""}`}>
        <div className="flex flex-row items-center mt-4">
          <div className="w-4 h-4 mr-4 relative">
            <Image src={networkLogos[chainId]} alt={ChainId[chainId]} fill />
          </div>
          <p className="text-xl mt-0.5">{ChainId[chainId]}</p>
        </div>
        <div className="flex flex-col md:flex-row gap-8 md:gap-0 md:space-x-8 w-full mb-8 mt-4">
          {totalVesting && (
            <RewardSummaryCard
              content={`${formatAndRoundBigNumber(totalVesting, 18)} POP`}
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
          {totalClaimable && (
            <RewardSummaryCard
              content={`${formatAndRoundBigNumber(totalClaimable, 18)} POP`}
              title={"Total Claimable"}
              iconUri="/images/yellowCircle.svg"
              button={true}
              handleClick={
                Number(chain.id) !== Number(chainId) ? () => switchNetwork(Number(chainId)) : () => claimVesting()
              }
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
