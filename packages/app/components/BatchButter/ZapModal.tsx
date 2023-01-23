import { BigNumber } from "@ethersproject/bignumber";
import { Token } from "@popcorn/utils/types";
import { InfoIconWithTooltip } from "@popcorn/app/components/InfoIconWithTooltip";
import MainActionButton from "@popcorn/app/components/MainActionButton";
import TertiaryActionButton from "@popcorn/app/components/TertiaryActionButton";
import { Dispatch, useState } from "react";
import OutputToken from "@popcorn/app/components/BatchButter/OutputToken";
import PseudoRadioButton from "@popcorn/app/components/BatchButter/PseudoRadioButton";
import { CustomSlippageInput } from "@popcorn/app/components/BatchButter/SlippageSettings";

interface ZapModalProps {
  tokenOptions: Token[];
  slippage: number;
  setSlippage: Dispatch<number>;
  slippageOptions: number[];
  closeModal: Function;
  withdraw: Function;
  claim: Function;
  batchId: string;
  withdrawAmount: BigNumber;
  isWithdraw?: boolean;
}

export default function ZapModal({
  tokenOptions,
  slippage,
  setSlippage,
  slippageOptions,
  closeModal,
  withdraw,
  claim,
  batchId,
  withdrawAmount,
  isWithdraw = false,
}: ZapModalProps): JSX.Element {
  const [selectedToken, selectToken] = useState<Token>(tokenOptions[0]);
  const [slippageValue, setSlippageValue] = useState<string>(String(slippage));

  return (
    <div className="flex flex-col mt-4">
      <OutputToken outputToken={tokenOptions} selectToken={selectToken} selectedToken={selectedToken} />
      {selectedToken !== tokenOptions[0] && (
        <div className="mt-6">
          <div>
            <div className="flex items-center mb-2">
              <p>Slippage Tolerance</p>
              <InfoIconWithTooltip
                classExtras="mt-0 ml-2"
                id="slippageTolerance"
                title="Slippage Tolerance"
                content="Your transaction will revert if the price changes unfavorably by more than this percentage"
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {slippageOptions.map((item, index) => (
                <div key={index}>
                  <PseudoRadioButton
                    label={`${item} %`}
                    activeClass="bg-customBrown text-white"
                    isActive={slippageValue === String(item)}
                    handleClick={() => {
                      setSlippage(item);
                      setSlippageValue(String(item));
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <div className="flex items-center mb-2">
              <p>Custom adjustment Slippage</p>
              <InfoIconWithTooltip
                classExtras="mt-0 ml-2"
                id="customAdjustment"
                title="Custom Adjustment"
                content="Input a custom slippage tolerance amount"
              />
            </div>
            <CustomSlippageInput value={slippageValue} setValue={setSlippageValue} setSlippage={setSlippage} />
          </div>
        </div>
      )}
      <div className="mt-6 space-y-5">
        <MainActionButton
          label={isWithdraw ? "Withdraw" : "Claim"}
          handleClick={() => {
            isWithdraw
              ? withdraw(batchId, withdrawAmount, selectedToken !== tokenOptions[0], selectedToken)
              : claim(batchId, selectedToken !== tokenOptions[0], selectedToken);
            closeModal();
          }}
        ></MainActionButton>
        <TertiaryActionButton label="Cancel" handleClick={closeModal}></TertiaryActionButton>
      </div>
    </div>
  );
}
