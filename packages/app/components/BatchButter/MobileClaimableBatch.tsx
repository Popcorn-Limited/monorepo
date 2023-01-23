import { BatchType } from "@popcorn/utils/src/types";
import MainActionButton from "@popcorn/app/components/MainActionButton";
import TertiaryActionButton from "@popcorn/app/components/TertiaryActionButton";
import { formatBatchInputToken, formatBatchOutputToken } from "@popcorn/app/helper/ClaimableBatchUtils";
import { BatchProps } from "@popcorn/app/components/BatchButter/ClaimableBatch";

const MobileClaimableBatch: React.FC<BatchProps> = ({
  batch,
  handleClaimAndStake,
  handleClaim,
  handleWithdraw,
  isThreeX = false,
}) => {
  const splitTokenLabel = (value: string) => {
    const split = value.split(" ");

    return {
      value: split[0],
      token: split[1],
    };
  };
  return (
    <div className="flex flex-col bg-white border-b border-gray-200 last:border-none last:rounded-b-2xl w-full py-6">
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-6">
          <p className="text-primaryLight font-normal">Deposited</p>
          <p className={`md:mt-1 text-black md:text-primary font-normal text-xl md:text-2xl leading-8`}>
            {
              splitTokenLabel(
                formatBatchInputToken(batch.accountSuppliedTokenBalance, batch.batchType === BatchType.Mint, isThreeX),
              ).value
            }
            <span className="text-xl text-tokenTextGray">
              {" "}
              {
                splitTokenLabel(
                  formatBatchInputToken(
                    batch.accountSuppliedTokenBalance,
                    batch.batchType === BatchType.Mint,
                    isThreeX,
                  ),
                ).token
              }
            </span>
          </p>
        </div>
        <div className="col-span-6">
          <p className="text-primaryLight font-normal">Claimable</p>
          <p className={`md:mt-1 text-black md:text-primary font-normal text-xl md:text-2xl leading-8`}>
            {
              splitTokenLabel(
                formatBatchOutputToken(
                  batch.accountClaimableTokenBalance,
                  batch.batchType === BatchType.Mint,
                  isThreeX,
                ),
              ).value
            }{" "}
            <span className="text-xl text-tokenTextGray">
              {
                splitTokenLabel(
                  formatBatchOutputToken(
                    batch.accountClaimableTokenBalance,
                    batch.batchType === BatchType.Mint,
                    isThreeX,
                  ),
                ).token
              }
            </span>
          </p>
        </div>
      </div>
      <div className="flex flex-col">
        {batch.claimable && batch.batchType === BatchType.Mint && (
          <div className="w-full mt-6">
            <MainActionButton handleClick={() => handleClaimAndStake(batch)} disabled={false} label="Claim & Stake" />
          </div>
        )}
        {batch.claimable && batch.batchType === BatchType.Redeem && (
          <div className="w-full mt-6">
            <TertiaryActionButton label="Claim" handleClick={() => handleClaim(batch)} />
          </div>
        )}
        {!batch.claimable && (
          <div className="w-full mt-6">
            <TertiaryActionButton label="Cancel" handleClick={() => handleWithdraw(batch)} />
          </div>
        )}

        {batch.claimable && batch.batchType === BatchType.Mint && (
          <div className="w-full mt-6">
            <TertiaryActionButton handleClick={() => handleClaim(batch)} disabled={false} label="Claim" />
          </div>
        )}
      </div>
    </div>
  );
};
export default MobileClaimableBatch;
