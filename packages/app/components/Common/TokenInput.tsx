import { ChainId, formatAndRoundBigNumber } from "@popcorn/utils";
import { Token } from "@popcorn/utils/types";
import SelectToken from "@popcorn/app/components/BatchButter/SelectToken";
import TokenIcon from "@popcorn/app/components/TokenIcon";
import { BigNumber, constants } from "ethers";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { escapeRegExp, inputRegex } from "@popcorn/app/helper/inputRegex";
import { useEffect, useState } from "react";
import { Pop } from "@popcorn/components/lib/types";
import { Erc20 } from "@popcorn/components";

export interface TokenInputProps {
  label: string;
  token: Token;
  amount: BigNumber;
  setAmount: Function;
  balance?: BigNumber;
  readonly?: boolean;
  account?: string;
  tokenList?: Token[];
  selectToken?: (token: Token) => void;
  chainId: ChainId;
  spendableBalance?: Pop.HookResult<BigNumber>;
}

export const TokenInput: React.FC<TokenInputProps> = ({
  label,
  token,
  setAmount,
  amount,
  balance,
  readonly = false,
  tokenList = [],
  selectToken = null,
  chainId,
  spendableBalance,
  account,
}) => {
  const [displayAmount, setDisplayAmount] = useState<string>(
    amount.isZero() ? "" : formatUnits(amount, token?.decimals),
  );
  const displaySpendableBalance =
    spendableBalance?.status === "success" &&
    !!balance &&
    !balance.eq(constants.Zero) &&
    !!spendableBalance?.data &&
    !spendableBalance.data.eq(balance);

  const spendableBalanceFormatted = displaySpendableBalance
    ? formatAndRoundBigNumber(spendableBalance?.data, token.decimals)
    : "";

  useEffect(() => {
    if (amount.isZero()) {
      setDisplayAmount("");
    } else if (readonly) {
      setDisplayAmount(formatUnits(amount, token?.decimals));
    }
  }, [amount]);

  const onUpdate = (nextUserInput: string) => {
    if (inputRegex.test(escapeRegExp(nextUserInput))) {
      const newAmount = ["", "."].includes(nextUserInput) ? constants.Zero : parseUnits(nextUserInput, token?.decimals);
      setDisplayAmount(nextUserInput);
      if (!amount.eq(newAmount)) {
        setAmount(newAmount);
      }
    }
  };

  function setMaxAmount() {
    const max = displaySpendableBalance ? spendableBalance?.data : balance;
    setDisplayAmount(formatUnits(max, token?.decimals));
    setAmount(max);
  }

  return (
    <>
      {balance && (
        <label htmlFor="tokenInput" className="font-medium text-gray-700 w-full mb-2">
          <p className="font-medium text-primary">{label}</p>
        </label>
      )}
      <div className="flex items-center gap-2 md:gap-0 md:space-x-2 w-full">
        <div className="w-full">
          <div
            className={`relative flex items-center px-5 py-4 border border-customLightGray rounded-lg ${
              balance && amount?.gt(balance) ? "focus:ring-red-600 border-red-600" : "focus:ring-0"
            }`}
          >
            <input
              name="tokenInput"
              id="tokenInput"
              className={`block w-full p-0 border-0 text-primaryDark text-lg focus:ring-0`}
              onChange={(e) => {
                onUpdate(e.target.value.replace(/,/g, "."));
              }}
              value={displayAmount}
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
              readOnly={readonly}
            />
            {tokenList.length > 0 ? (
              <SelectToken
                chainId={chainId}
                allowSelection={true}
                options={tokenList}
                selectedToken={token}
                selectToken={selectToken}
              />
            ) : (
              <div className="inline-flex items-center min-w-fit">
                <div className="md:mr-2 mb-0.5">
                  <TokenIcon token={token?.address} imageSize="w-5 h-5" chainId={chainId} />
                </div>
                <p className="hidden md:block font-semibold text-gray-700">{token?.symbol}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      {balance && amount?.gt(balance) && <p className="text-red-600">*Insufficient Balance</p>}
      <div className="flex items-center justify-between mt-2 w-full">
        {balance && (
          <div className="flex items-center">
            <img
              src="/images/wallet.svg"
              alt="wallet balance of selected token"
              width="13"
              height="13"
              className="mr-2"
            />
            <p className="text-secondaryLight leading-6">
              <Erc20.BalanceOf address={token?.address} chainId={chainId} account={account as `0x${string}`} />{" "}
              {displaySpendableBalance && "(" + spendableBalanceFormatted + " unlocked)"}
            </p>
          </div>
        )}
        {!readonly && balance && (
          <div
            className="w-9 h-6 flex items-center justify-center py-3 px-6 text-base leading-6 text-primary font-medium border border-primary rounded-lg cursor-pointer hover:bg-primary hover:text-white transition-all"
            role="button"
            onClick={setMaxAmount}
          >
            MAX
          </div>
        )}
      </div>
    </>
  );
};
export default TokenInput;
