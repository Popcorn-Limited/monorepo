import { formatEther, formatUnits } from "@ethersproject/units";
import { ChainId, formatAndRoundBigNumber, numberToBigNumber } from "@popcorn/utils";
import { SelectedToken, Token } from "@popcorn/utils/types";
import { BigNumber, constants } from "ethers";
import { escapeRegExp, inputRegex } from "@popcorn/app/helper/inputRegex";
import { useDeployment } from "@popcorn/app/hooks/useDeployment";
import { useEffect, useRef, useState } from "react";
import { CheckMarkToggleWithInfo } from "@popcorn/app/components/BatchButter/CheckMarkToggleWithInfo";
import SelectToken from "@popcorn/app/components/BatchButter/SelectToken";

import InputTokenWithError from "@popcorn/components/components/InputTokenWithError";

export enum Pages {
  "butter",
  "instantButter",
  "threeX",
  "instantThreeX",
}

export const pageToDisplayToken = (page: Pages) => {
  switch (page) {
    case Pages.butter:
    case Pages.instantButter:
      return { input: "3CRV", output: "BTR" };
    case Pages.threeX:
    case Pages.instantThreeX:
      return { input: "USDC", output: "3X" };
  }
};

export interface ButterTokenInputProps {
  options: Token[];
  selectToken?: (token: Token) => void;
  selectedToken: SelectedToken;
  depositAmount: BigNumber;
  setDepositAmount: (amount: BigNumber) => void;
  depositDisabled: { disabled: boolean; errorMessage: string };
  hasUnclaimedBalances?: boolean;
  useUnclaimedDeposits?: boolean;
  setUseUnclaimedDeposits?: (toggle: boolean) => void;
  withdrawMode: boolean;
  setWithdrawMode: (toggle: boolean) => void;
  page: Pages;
  instant: boolean;
  chainId: ChainId;
  disabled?: boolean;
}

const ButterTokenInput: React.FC<ButterTokenInputProps> = ({
  options,
  selectToken,
  selectedToken,
  depositAmount,
  setDepositAmount,
  depositDisabled,
  hasUnclaimedBalances,
  useUnclaimedDeposits,
  setUseUnclaimedDeposits,
  withdrawMode,
  setWithdrawMode,
  page,
  instant,
  chainId,
}) => {
  const addr = useDeployment(chainId);

  const [estimatedAmount, setEstimatedAmount] = useState<string>("");

  const displayAmount = depositAmount.isZero()
    ? ""
    : formatUnits(depositAmount || "0", selectedToken?.input?.decimals || 18);
  const ref = useRef(displayAmount);

  useEffect(() => {
    if (displayAmount !== ref.current) {
      ref.current = ref.current.includes(".") ? displayAmount : displayAmount.split(".")[0];
    }
  }, [ref, displayAmount]);

  const onUpdate = (nextUserInput: string) => {
    if (nextUserInput === "" || inputRegex.test(escapeRegExp(nextUserInput))) {
      setDepositAmount(numberToBigNumber(nextUserInput, selectedToken.input.decimals)), (ref.current = nextUserInput);
    }
  };

  useEffect(() => {
    if (depositAmount.eq(constants.Zero)) {
      setEstimatedAmount("");
    } else {
      calcOutputAmountsFromInput(depositAmount);
    }
  }, [depositAmount]);

  function calcOutputAmountsFromInput(value: BigNumber): void {
    setEstimatedAmount(
      formatAndRoundBigNumber(value.mul(selectedToken.input.price).div(selectedToken.output.price), 18),
    );
  }

  const useUnclaimedDepositsisDisabled = (): boolean => {
    const keys = page === Pages.threeX ? [addr.usdc, addr.threeX] : [addr.threeCrv, addr.butter];
    return selectedToken?.input?.address ? !keys.includes(selectedToken.input.address) : true;
  };

  return (
    <>
      <div className="mt-10">
        <div className="flex flex-row items-center justify-between mb-2">
          <p className="text-base font-medium text-primary">{withdrawMode ? "Redeem Amount" : "Deposit Amount"}</p>
        </div>
        <InputTokenWithError
          chainId={chainId}
          name="tokenInput"
          id="tokenInput"
          onChange={(e) => {
            onUpdate(e.currentTarget.value.replace(/,/g, "."));
          }}
          onMaxClick={() => {
            const maxAmount = useUnclaimedDeposits
              ? selectedToken?.input?.claimableBalance
              : selectedToken?.input?.balance;
            calcOutputAmountsFromInput(maxAmount);
            setDepositAmount(maxAmount);
            ref.current = Number(formatEther(maxAmount)).toFixed(3);
          }}
          errorMessage={depositDisabled?.disabled && depositDisabled?.errorMessage}
          value={ref.current}
          allowSelection={!withdrawMode}
          selectedToken={selectedToken?.input}
          tokenList={options?.filter(
            (option) =>
              !(withdrawMode ? [addr.threeCrv, addr.usdc] : [addr.butter, addr.threeX]).includes(option.address),
          )}
          onSelectToken={selectToken}
        />

        {[Pages.threeX, Pages.butter].includes(page) && hasUnclaimedBalances && !useUnclaimedDepositsisDisabled() && (
          <CheckMarkToggleWithInfo
            disabled={useUnclaimedDepositsisDisabled()}
            value={Boolean(useUnclaimedDeposits)}
            onChange={(e) => {
              setEstimatedAmount("0");
              setDepositAmount(constants.Zero);
              setUseUnclaimedDeposits(!useUnclaimedDeposits);
            }}
            infoTitle="About Unclaimed Balances"
            infoText={`When a batch is minted but the ${
              pageToDisplayToken(page).output
            } has not been claimed yet, it can be redeemed without having to claim it first. By checking “use unclaimed balances” you will be able to redeem unclaimed balances of ${
              pageToDisplayToken(page).output
            }. This process applies also for unclaimed ${pageToDisplayToken(page).input}, which can be converted to ${
              pageToDisplayToken(page).output
            } without having to claim it.`}
            label="Use only unclaimed balances"
            className="pb-4"
          />
        )}
      </div>
      <div className="relative -mt-10 -mb-10">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-customLightGray" />
        </div>
        <div className={`relative flex justify-center ${depositDisabled ? "mb-16 mt-10" : "my-16"}`}>
          <div className="w-20 bg-white">
            <div
              className="flex items-center w-14 h-14 mx-auto border border-customLightGray rounded-full cursor-pointer"
              onClick={(e) => setWithdrawMode(!withdrawMode)}
            >
              <img src="/images/icons/exchangeIconSingle.svg" alt="exchangeIcon" className="p-3 mx-auto"></img>
            </div>
          </div>
        </div>
      </div>
      <div>
        <p className="text-base font-medium text-primary">{`Estimated ${selectedToken?.output?.symbol} Amount`}</p>
        <div>
          <div className="w-full flex px-5 py-4 items-center rounded-lg border">
            <input
              className="block w-full p-0 border-0 text-primaryDark text-lg"
              value={estimatedAmount}
              inputMode="decimal"
              autoComplete="off"
              autoCorrect="off"
              // text-specific options
              type="text"
              pattern="^[0-9]*[.,]?[0-9]*$"
              placeholder={"0.0"}
              minLength={1}
              maxLength={79}
              spellCheck="false"
              readOnly
            />
            <SelectToken
              chainId={chainId}
              allowSelection={instant && withdrawMode}
              selectedToken={selectedToken?.output}
              options={options?.filter((option) => ![addr.butter, addr.threeX].includes(option.address))}
              selectToken={selectToken}
            />
          </div>
        </div>
      </div>
    </>
  );
};
export default ButterTokenInput;
