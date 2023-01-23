import { ChainId } from "@popcorn/utils";
import { BatchType, Token } from "@popcorn/utils/src/types";
import { InfoIconWithModal } from "@popcorn/app/components/InfoIconWithModal";
import SecondaryActionButton from "@popcorn/app/components/SecondaryActionButton";
import { BigNumber, constants, ethers } from "ethers";
import Link from "next/link";
import MainActionButton from "@popcorn/app/components/MainActionButton";
import ButterTokenInput, {
  ButterTokenInputProps,
  Pages,
  pageToDisplayToken,
} from "@popcorn/app/components/BatchButter/ButterTokenInput";
import { CheckMarkToggleWithInfo } from "@popcorn/app/components/BatchButter/CheckMarkToggleWithInfo";
import MintRedeemToggle from "@popcorn/app/components/BatchButter/MintRedeemToggle";
import SlippageSettings from "@popcorn/app/components/BatchButter/SlippageSettings";
import { useFeatures } from "@popcorn/components/hooks/useFeatures";

interface MintRedeemInterfaceProps extends ButterTokenInputProps {
  mainAction: (depositAmount: BigNumber, batchType: BatchType, stakeImmidiate?: boolean) => Promise<void>;
  approve: (token: Token) => Promise<void>;
  slippage: number;
  setSlippage: (slippage: number) => void;
  instant: boolean;
  setInstant?: (instant: boolean) => void;
  showSlippageAdjust: boolean;
  chainId: ChainId;
}

const MintRedeemInterface: React.FC<MintRedeemInterfaceProps> = ({
  approve,
  depositAmount,
  depositDisabled,
  mainAction,
  options,
  page,
  selectedToken,
  setDepositAmount,
  setUseUnclaimedDeposits,
  setWithdrawMode,
  slippage,
  setSlippage,
  useUnclaimedDeposits,
  instant,
  setInstant,
  withdrawMode,
  hasUnclaimedBalances,
  selectToken,
  showSlippageAdjust,
  chainId,
  disabled,
}) => {
  const { features } = useFeatures();

  function isAllowanceInsufficient() {
    return (
      !selectedToken?.input?.allowance ||
      selectedToken.input.allowance.eq(ethers.constants.Zero) ||
      depositAmount.gt(selectedToken.input.allowance)
    );
  }

  const butterModalImage = <img src="/images/Instant Butter_icon.svg" />;
  return (
    <div className="bg-white rounded-3xl p-6 border border-customLightGray">
      <MintRedeemToggle
        redeeming={withdrawMode}
        setRedeeming={setWithdrawMode}
        isThreeX={[Pages.threeX, Pages.instantThreeX].includes(page)}
      />
      <div>
        <ButterTokenInput
          depositAmount={depositAmount}
          depositDisabled={depositDisabled}
          options={options}
          page={page}
          selectedToken={selectedToken}
          setDepositAmount={setDepositAmount}
          setUseUnclaimedDeposits={setUseUnclaimedDeposits}
          setWithdrawMode={setWithdrawMode}
          useUnclaimedDeposits={useUnclaimedDeposits}
          withdrawMode={withdrawMode}
          hasUnclaimedBalances={hasUnclaimedBalances}
          selectToken={selectToken}
          instant={instant}
          chainId={chainId}
          disabled={disabled}
        />
      </div>
      {!useUnclaimedDeposits && [Pages.butter, Pages.threeX].includes(page) && features["instant3X"] && (
        <div className="mt-2">
          <CheckMarkToggleWithInfo
            label={`Use Instant ${pageToDisplayToken(page).output} (Higher Gas Fee)`}
            value={instant}
            onChange={(e) => setInstant(!instant)}
            image={butterModalImage}
            infoTitle="Instant Butter"
            infoText="Using 'Instant Butter' comes with higher gas costs. Mint/redeem Butter in one transaction without having to wait for a batch to process. Use this feature only when the gas costs are acceptable to you."
          />
        </div>
      )}
      {showSlippageAdjust && (
        <div className="w-full mt-6">
          <SlippageSettings slippage={slippage} setSlippage={setSlippage} slippageOptions={[0.1, 0.5, 1]} />
        </div>
      )}
      <hr className="mt-10 bg-customLightGray" />
      <div className="w-full text-center">
        {hasUnclaimedBalances && useUnclaimedDeposits && (
          <div className="pt-6">
            <MainActionButton
              label={withdrawMode ? "Redeem" : "Mint"}
              handleClick={() => mainAction(depositAmount, withdrawMode ? BatchType.Redeem : BatchType.Mint)}
              disabled={depositDisabled?.disabled || depositAmount.eq(constants.Zero)}
            />
          </div>
        )}
        {!(hasUnclaimedBalances && useUnclaimedDeposits) && isAllowanceInsufficient() && (
          <div className="pt-6 space-y-6">
            <MainActionButton
              label={`Allow Popcorn to use your ${selectedToken?.input?.symbol}`}
              handleClick={() => approve(selectedToken?.input)}
            />
            <MainActionButton
              label={withdrawMode ? "Redeem" : "Mint"}
              handleClick={() => mainAction(depositAmount, withdrawMode ? BatchType.Redeem : BatchType.Mint)}
              disabled={true}
            />
          </div>
        )}
        {!(hasUnclaimedBalances && useUnclaimedDeposits) && !isAllowanceInsufficient() && (
          <div className="pt-6 space-y-6">
            {instant && !withdrawMode ? (
              <>
                <span className="text-left flex flex-row items-center">
                  <p>Mint & Stake vs. Mint</p>
                  <InfoIconWithModal
                    title="Mint & Stake vs Mint"
                    children={
                      <p>
                        Choose Mint & Stake to automatically stake the token to earn POP rewards. If you select Mint you
                        will not earn POP rewards unless the token is staked in the
                        <Link href="/staking" passHref className="font-medium text-blue-600 hover:text-blue-900">
                          staking
                        </Link>
                        page.
                      </p>
                    }
                  />
                </span>
                <MainActionButton
                  label="Mint & Stake"
                  handleClick={() => {
                    mainAction(depositAmount, BatchType.Mint, true);
                  }}
                  disabled={depositDisabled?.disabled || depositAmount.eq(constants.Zero)}
                />
                <SecondaryActionButton
                  label="Mint"
                  handleClick={() => {
                    mainAction(depositAmount, BatchType.Mint, false);
                  }}
                  disabled={depositDisabled?.disabled || depositAmount.eq(constants.Zero)}
                />
              </>
            ) : (
              <MainActionButton
                label={withdrawMode ? "Redeem" : "Mint"}
                handleClick={() => {
                  if (withdrawMode) {
                    mainAction(depositAmount, BatchType.Redeem);
                  } else {
                    mainAction(depositAmount, BatchType.Mint);
                  }
                }}
                disabled={depositDisabled?.disabled || depositAmount.eq(constants.Zero)}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
export default MintRedeemInterface;
