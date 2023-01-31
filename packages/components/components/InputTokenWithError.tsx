import type { HTMLProps } from "react";
import type { Token } from "@popcorn/utils/types";
import Image from "next/image";
import { constants } from "ethers";

import { formatAndRoundBigNumber } from "@popcorn/utils";
import SelectToken from "@popcorn/app/components/BatchButter/SelectToken";
import InputNumber from "./InputNumber";

const ZERO = constants.Zero;
function InputTokenWithError({
  tokenList,
  selectedToken,
  errorMessage,
  onMaxClick,
  chainId,
  allowSelection,
  onSelectToken,
  captionText,
  ...props
}: {
  errorMessage?: string;
  onMaxClick: () => void;
  onSelectToken: (token: Token) => void;
  tokenList: Token[];
  selectedToken?: Token;
  allowSelection?: boolean;
  chainId: any;
  captionText?: string;
} & HTMLProps<HTMLInputElement>) {
  return (
    <div>
      {captionText && <p className="text-primary">{captionText}</p>}
      <div className="mt-1 relative flex items-center gap-2 md:gap-0 md:space-x-2">
        <div
          className={`w-full flex px-5 py-4 items-center rounded-lg border ${
            errorMessage ? "border-customRed" : "border-customLightGray"
          }`}
        >
          <InputNumber {...props} />
          <SelectToken
            chainId={chainId}
            allowSelection={allowSelection!}
            selectedToken={selectedToken!}
            options={tokenList}
            selectToken={onSelectToken}
          />
        </div>
      </div>
      {errorMessage && <p className="text-customRed pt-2 leading-6">{errorMessage}</p>}
      <div className="flex justify-between items-center mt-2">
        <div className="flex items-center gap-2">
          <Image src="/images/wallet.svg" alt="wallet icon" width="13" height="13" />
          <p className="text-secondaryLight">
            {`${formatAndRoundBigNumber(selectedToken?.balance || ZERO, selectedToken?.decimals || 0)}`}
          </p>
        </div>
        <button
          className="w-9 h-6 flex items-center justify-center py-3 px-6 text-base leading-6 text-primary font-medium border border-primary rounded-lg cursor-pointer hover:bg-primary hover:text-white transition-all"
          onClick={onMaxClick}
        >
          MAX
        </button>
      </div>
    </div>
  );
}

export default InputTokenWithError;
