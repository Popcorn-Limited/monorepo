import { localStringOptions } from "@popcorn/utils";
import { InfoIconWithTooltip } from "@popcorn/app/components/InfoIconWithTooltip";
import { Dispatch } from "react";

interface MintRedeemToggleProps {
  redeeming: Boolean;
  setRedeeming: Dispatch<Boolean>;
  isThreeX?: Boolean;
}

const MintRedeemToggle: React.FC<MintRedeemToggleProps> = ({ redeeming, setRedeeming, isThreeX = false }) => {
  const displayInputToken = isThreeX ? "USDC" : "3CRV";
  const displayOutputToken = isThreeX ? "3X" : "BTR";

  return (
    <div className="flex flex-row">
      <div
        className={`w-1/2 flex items-center justify-center pb-2 ${
          redeeming
            ? "border-b border-secondaryLight cursor-pointer group hover:border-primary"
            : "border-b border-primary"
        }`}
        onClick={(e) => setRedeeming(false)}
      >
        <p
          className={`text-center leading-none text-base cursor-pointer ${
            redeeming ? "text-primaryLight  group-hover:text-primary" : "text-primary font-medium"
          }`}
        >
          Mint
        </p>
        <div className="hidden md:inline">
          <InfoIconWithTooltip
            classExtras="mt-0 ml-2"
            id="1"
            title="Mint"
            content={`Mint ${displayOutputToken} with ${displayInputToken} or stablecoins to earn interest on multiple stablecoins at once.
              As the value of the underlying assets increase, so does the redeemable value of
              ${displayOutputToken}. This process converts deposited funds into other stablecoins and deploys
              them to automated yield-farming contracts by Yearn to generate interest. ${
                isThreeX
                  ? `Minting incurs a ${(0.75).toLocaleString(undefined, localStringOptions)}% (75 bps) mint fee.`
                  : ""
              }`}
          />
        </div>
      </div>
      <div
        className={`w-1/2 flex items-center justify-center pb-2 ${
          redeeming
            ? "border-b border-primary"
            : "border-b border-secondaryLight cursor-pointer group hover:border-primary"
        }`}
        onClick={(e) => setRedeeming(true)}
      >
        <p
          className={`text-center leading-none text-base cursor-pointer ${
            redeeming ? "text-primary font-medium" : "text-primaryLight group-hover:text-primary"
          }`}
        >
          Redeem
        </p>
        <div className="hidden md:inline">
          <InfoIconWithTooltip
            classExtras="mt-0 ml-2"
            id="2"
            title="Redeem"
            content={`Redeem your ${displayOutputToken} to receive its value in ${displayInputToken} or stablecoins. The underlying tokens will be converted into ${displayInputToken} or your desired stablecoin. Redemptions incur a ${(isThreeX
              ? 0.75
              : 0.5
            ).toLocaleString(undefined, localStringOptions)}% (${isThreeX ? 75 : 50} bps) redemption fee.`}
          />
        </div>
      </div>
    </div>
  );
};
export default MintRedeemToggle;
