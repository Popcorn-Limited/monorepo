import { InfoIconWithTooltip } from "@popcorn/app/components/InfoIconWithTooltip";
import { BigNumber, constants } from "ethers";
import { formatUnits, parseEther } from "ethers/lib/utils";
import { useEffect, useState } from "react";

interface BatchProgressProps {
  batchAmount: BigNumber;
  threshold: BigNumber;
}
6;
const BatchProgress: React.FC<BatchProgressProps> = ({ batchAmount, threshold }) => {
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    setProgress(100 - parseInt(formatUnits(batchAmount.mul(parseEther("100")).div(threshold))));
  }, [batchAmount]);

  return (
    <div className="bg-white border border-customLightGray rounded-lg h-full flex flex-col">
      <div className="w-full flex flex-row p-5 h-full items-center gap-6 md:gap-0 md:space-x-6">
        <div className="relative h-20 w-20 p-2 rounded-full">
          <div className="bg-customYellow w-18 h-18 rounded-full relative transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"></div>
          <p className="text-2xl font-medium leading-none text-black absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 z-30">
            {batchAmount.eq(constants.Zero)
              ? 0
              : (Number(formatUnits(batchAmount)) / 1000).toFixed(Number(formatUnits(batchAmount, 18)) > 1000 ? 0 : 1)}
            k
          </p>
          <div className="bg-white w-20 absolute top-0 left-0" style={{ height: `${progress}%` }}></div>
          <div className="h-20 w-20 p-2 rounded-full border border-customLightGray absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 z-30"></div>
        </div>
        <div className="w-full">
          <div className="flex flex-row items-center w-full pt-1">
            <p className="font-normal leading-5 text-primaryLight text-base">Batch</p>
            <InfoIconWithTooltip
              classExtras="mt-0 ml-2"
              id="3"
              title="Batch Processing"
              content="Mint and redeem deposits are currently being processed within 15 - 60 minutes. After the deposit is processed, you'll be able to claim/withdraw your tokens."
            />
          </div>
          <p className="text-primary leading-6 break-words">
            Your mint/redeem deposit will be processed with the next batch.
          </p>
        </div>
      </div>
    </div>
  );
};
export default BatchProgress;
