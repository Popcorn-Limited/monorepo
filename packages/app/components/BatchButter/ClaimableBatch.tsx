import { AccountBatch, BatchType } from "@popcorn/utils/src/types";
import { InfoIconWithModal } from "@popcorn/app/components/InfoIconWithModal";
import MainActionButton from "@popcorn/app/components/MainActionButton";
import TertiaryActionButton from "@popcorn/app/components/TertiaryActionButton";
import { formatBatchInputToken, formatBatchOutputToken } from "@popcorn/app/helper/ClaimableBatchUtils";
export interface BatchProps {
  batch: AccountBatch;
  handleClaimAndStake: (batch: AccountBatch) => void;
  handleClaim: (batch: AccountBatch) => void;
  handleWithdraw: (batch: AccountBatch) => void;
  isThreeX?: boolean;
}

const ClaimableBatch: React.FC<BatchProps> = ({
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
    <tr className="bg-white border-b border-gray-200 last:border-none last:rounded-b-2xl w-full">
      <td className="px-6 py-5 whitespace-nowrap">
        <p className="text-primaryLight mb-2">Deposited</p>
        <div className="flex flex-row items-center">
          <p className=" text-primary text-2xl">
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
          {!isThreeX && batch.batchType === BatchType.Mint && (
            <div className="mb-1">
              <InfoIconWithModal title="Why do I see 3CRV?">
                <p>
                  Your stablecoins have been swapped into 3CRV in order to mint BTR. For this reason you see a 3CRV
                  balance here.
                </p>
              </InfoIconWithModal>
            </div>
          )}
        </div>
      </td>
      <td className="px-6 py-5 whitespace-nowrap">
        <p className="text-primaryLight mb-2">Claimable</p>
        <p className="text-primary text-2xl">
          {
            splitTokenLabel(
              formatBatchOutputToken(batch.accountClaimableTokenBalance, batch.batchType === BatchType.Mint, isThreeX),
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
      </td>
      <td className="px-6 py-5 flex justify-end items-center h-full">
        {batch.claimable && batch.batchType === BatchType.Mint ? (
          <div className="space-x-4 flex flex-row justify-end w-80">
            <div className="">
              <MainActionButton label="Claim and Stake" handleClick={(e) => handleClaimAndStake(batch)} />
            </div>
            <div className="">
              <TertiaryActionButton label="Claim" handleClick={(e) => handleClaim(batch)} />
            </div>
          </div>
        ) : (
          <div className="">
            <TertiaryActionButton
              label={batch.claimable ? "Claim" : "Cancel"}
              handleClick={(e) => (batch.claimable ? handleClaim(batch) : handleWithdraw(batch))}
            />
          </div>
        )}
      </td>
    </tr>
  );
};
export default ClaimableBatch;
