import { formatAndRoundBigNumber } from "@popcorn/utils";
import StatusWithLabel from "@popcorn/app/components/Common/StatusWithLabel";
import MainActionButton from "@popcorn/app/components/MainActionButton";
import { format } from "date-fns";
import { Escrow } from "@popcorn/app/hooks/useGetUserEscrows";

interface VestingRecordProps {
  vestingEscrow: Escrow;
  index: number;
  claim: (Escrow) => void;
}

const VestingRecordComponent: React.FC<VestingRecordProps> = ({ vestingEscrow, index, claim }) => {
  const formattedEndDate = format(vestingEscrow.end.toNumber(), "MM.dd.yyyy");

  return (
    <div
      className={`flex flex-col md:flex-row w-full 
         `}
    >
      <div className="hidden md:flex flex-row justify-between gap-2 md:gap-0 md:space-x-2 items-center w-full border-b border-customLightGray p-8">
        <StatusWithLabel label="Unlock Ends" content={formattedEndDate} />
        <StatusWithLabel
          label="Total Vesting Tokens"
          content={`${formatAndRoundBigNumber(vestingEscrow.balance, 18)} POP`}
        />
        <StatusWithLabel
          label="Claimable Tokens"
          content={`${formatAndRoundBigNumber(vestingEscrow.claimableAmount, 18)} POP`}
        />
        <div className="w-2/12">
          <MainActionButton
            handleClick={() => claim(vestingEscrow)}
            disabled={!vestingEscrow.claimableAmount.gte(0)}
            label="Claim"
          />
        </div>
      </div>
      <div className="md:hidden w-full border-b border-customLightGray py-6">
        <StatusWithLabel label="Unlock Ends" content={formattedEndDate} />
        <div className="flex flex-row justify-between gap-2 gap-y-6 md:gap-y-0 md:gap-0 md:space-x-6 flex-wrap mt-6">
          <StatusWithLabel
            label="Claimable Tokens"
            content={`${formatAndRoundBigNumber(vestingEscrow.claimableAmount, 18)} POP`}
          />
          <StatusWithLabel
            label="Total Vesting Tokens"
            content={`${formatAndRoundBigNumber(vestingEscrow.balance, 18)} POP`}
          />
        </div>
        <div className="w-full mt-6">
          <MainActionButton
            handleClick={() => claim(vestingEscrow)}
            disabled={!vestingEscrow.claimableAmount.gte(0)}
            label="Claim"
          />
        </div>
      </div>
    </div>
  );
};

export default VestingRecordComponent;
