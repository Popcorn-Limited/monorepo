import { AccountBatch, BatchType, Token } from "@popcorn/utils/src/types";
import PopUpModal from "@popcorn/components/components/Modal/PopUpModal";
import { setSingleActionModal } from "@popcorn/components/context/actions";
import { store } from "@popcorn/components/context/store";
import useWindowSize from "@popcorn/app/hooks/useWindowSize";
import Image from "next/image";
import { useContext, useState } from "react";
import ClaimableBatch from "@popcorn/app/components/BatchButter/ClaimableBatch";
import EmptyClaimableBatch from "@popcorn/app/components/BatchButter/EmptyClaimableBatch";
import MobileClaimableBatch from "@popcorn/app/components/BatchButter/MobileClaimableBatch";
import MobileEmptyClaimableBatches from "@popcorn/app/components/BatchButter/MobileEmptyClaimableBatches";
import ZapModal from "@popcorn/app/components/BatchButter/ZapModal";

interface ClaimableBatchesProps {
  options: Token[];
  slippage: number;
  setSlippage: (slippage: number) => void;
  batches: AccountBatch[];
  claim: Function;
  claimAndStake: Function;
  withdraw: Function;
  isThreeX?: boolean;
}

const ClaimableBatches: React.FC<ClaimableBatchesProps> = ({
  options,
  slippage,
  setSlippage,
  batches,
  claim,
  claimAndStake,
  withdraw,
  isThreeX = false,
}) => {
  const { dispatch } = useContext(store);
  const { width: windowWidth } = useWindowSize();
  const [currentBatch, setCurrentBatch] = useState<AccountBatch>({} as AccountBatch);
  const [handleClaimPopup, setHandleClaimPopup] = useState(false);

  const renderZapModal = (batch: AccountBatch, isWithdraw: boolean = false) => {
    return (
      <ZapModal
        tokenOptions={options}
        slippage={slippage}
        setSlippage={setSlippage}
        slippageOptions={[0.1, 0.5, 1]}
        closeModal={() => {
          dispatch(setSingleActionModal(false));
          setHandleClaimPopup(false);
        }}
        withdraw={withdraw}
        claim={claim}
        batchId={batch.batchId ?? "0"}
        withdrawAmount={batch.accountSuppliedTokenBalance}
        isWithdraw={isWithdraw}
      />
    );
  };

  function handleClaim(batch: AccountBatch) {
    if (batch.batchType === BatchType.Mint) {
      claim(batch.batchId);
    }
    if (batch.batchType === BatchType.Redeem) {
      if (windowWidth > 768) {
        dispatch(
          setSingleActionModal({
            image: <Image src="/images/blackCircle.svg" width={88} height={88} alt="default token icon" />,
            title: "Claim",
            children: (
              <div className="pt-6">
                <p>Choose an output token</p>
                {renderZapModal(batch)}
              </div>
            ),
            onDismiss: {
              onClick: () => dispatch(setSingleActionModal(false)),
            },
          }),
        );
      } else {
        setCurrentBatch(batch);
        setHandleClaimPopup(true);
      }
    }
  }

  function handleWithdraw(batch: AccountBatch) {
    if (batch.batchType === BatchType.Mint) {
      dispatch(
        setSingleActionModal({
          image: <Image src="/images/blackCircle.svg" width={88} height={88} alt="default token icon" />,
          title: "Choose an Output Token",
          children: <>{renderZapModal(batch, true)}</>,
          onDismiss: {
            onClick: () => dispatch(setSingleActionModal(false)),
          },
        }),
      );
    } else {
      withdraw(batch.batchId, batch.accountSuppliedTokenBalance);
    }
  }

  function handleClaimAndStake(batch: AccountBatch) {
    claimAndStake(batch.batchId);
  }

  return (
    <>
      <table className="hidden md:table min-w-full">
        <thead>
          <tr className="border-b border-customLightGray">
            <th scope="col" className="py-4 text-left font-medium text-black w-5/12">
              Your Batches
            </th>
            <th scope="col" className="px-6 py-4 text-left font-medium w-5/12"></th>
            <th scope="col" className="pl-6 pr-28 py-4 text-right font-medium w-2/12"></th>
          </tr>
        </thead>
        {batches?.length > 0 ? (
          <tbody>
            {batches?.map((batch) => (
              <ClaimableBatch
                key={batch.batchId}
                batch={batch}
                handleClaim={handleClaim}
                handleClaimAndStake={handleClaimAndStake}
                handleWithdraw={handleWithdraw}
                isThreeX={isThreeX}
              />
            ))}
          </tbody>
        ) : (
          <tbody>
            <EmptyClaimableBatch />
          </tbody>
        )}
      </table>
      <div className="md:hidden">
        <div className="py-2 border-b border-customLightGray">
          <h3 className="font-medium text-black">Your Batches</h3>
        </div>
        {batches?.length > 0 ? (
          <div>
            {batches?.map((batch) => (
              <MobileClaimableBatch
                key={batch.batchId}
                batch={batch}
                handleClaim={handleClaim}
                handleClaimAndStake={handleClaimAndStake}
                handleWithdraw={handleWithdraw}
                isThreeX={isThreeX}
              />
            ))}
          </div>
        ) : (
          <MobileEmptyClaimableBatches />
        )}
      </div>

      <div className="fixed z-100 left-0">
        <PopUpModal visible={handleClaimPopup} onClosePopUpModal={() => setHandleClaimPopup(false)}>
          <p className="text-base text-black font-normal mb-2">Select a token</p>
          {renderZapModal(currentBatch)}
        </PopUpModal>
      </div>
    </>
  );
};
export default ClaimableBatches;
