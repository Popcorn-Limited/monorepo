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
  getTokenUrl,
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
  getTokenUrl?: string
} & HTMLProps<HTMLInputElement>) {
  return (
    <>
      {captionText && <p className="text-primary">{captionText}</p>}
      <div className="mt-1 relative flex items-center w-full">
        <div
          className={`w-full flex px-5 py-4 items-center rounded-lg border ${errorMessage ? "border-customRed" : "border-customLightGray"
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
      <div className="flex justify-between items-center mt-2 w-full">
        <div className="flex items-center gap-2 cursor-pointer group" onClick={onMaxClick}>
          <div className="mb-1">
            <Image src="/images/wallet.svg" alt="wallet icon" width="13" height="13" />
          </div>
          <p className="text-secondaryLight group-hover:text-black">
            {`${formatAndRoundBigNumber(selectedToken?.balance || ZERO, selectedToken?.decimals || 18)}`}
          </p>
        </div>
        {getTokenUrl && (
          <button
            className="w-40 h-9 flex items-center justify-center py-2 px-6 text-base text-primary font-medium border border-warmGray rounded-lg cursor-pointer hover:bg-primary hover:text-white transition-all group leading-none"
            onClick={() => window.open(getTokenUrl, "_blank")}
          >
            <p className="mt-1">Get Token </p>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 ml-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </button>)
        }
      </div>
    </>
  );
}

export default InputTokenWithError;
