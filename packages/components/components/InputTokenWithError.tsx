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
          className={`w-full flex px-5 py-4 items-center rounded-lg border ${errorMessage ? "border-customRed" : "border-customLightGray" }`}
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
        <div className="flex items-center ml-1 gap-2 cursor-pointer group/max" onClick={onMaxClick}>
          <div className="mb-1 text-secondaryLight group-hover/max:text-primary">
            <svg width="16" height="16" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M9.99929 19.9977C7.84068 19.9977 5.68201 20.0029 3.52339 19.996C1.82427 19.9907 0.443415 18.8903 0.0821254 17.2519C0.0186932 16.9643 0.00456488 16.661 0.00421603 16.365C-0.000609699 12.2367 -0.00281898 8.10843 0.00607664 3.98016C0.00706504 3.51172 0.0148559 3.02723 0.128987 2.57803C0.522023 1.03031 1.89381 0.00765945 3.52479 0.00312443C5.56712 -0.00257342 7.60945 0.00167092 9.65178 0.00167092C11.7668 0.00167092 13.8818 -0.00286406 15.9969 0.00300821C17.9471 0.00841535 19.521 1.27758 19.9168 3.16584C19.9743 3.44044 19.9887 3.72818 19.9879 4.00976C19.9869 4.36058 19.7042 4.61629 19.3342 4.64088C18.996 4.66338 18.6816 4.42902 18.6241 4.09645C18.5772 3.82545 18.5738 3.54474 18.5058 3.28003C18.2299 2.20575 17.2639 1.43462 16.1572 1.40311C15.5763 1.3866 14.9944 1.39741 14.413 1.39735C10.808 1.39706 7.20304 1.39642 3.59805 1.3977C2.60325 1.39805 1.84224 1.90196 1.52525 2.76269C1.04134 4.07645 1.96899 5.48556 3.36711 5.55951C3.4831 5.56562 3.5995 5.56818 3.71567 5.56818C6.79733 5.56864 9.87905 5.56713 12.9607 5.56928C14.1379 5.5701 15.3152 5.57556 16.4924 5.58486C18.4709 5.6005 19.9845 7.10212 19.9939 9.08154C20.0055 11.5527 20.0051 14.0239 19.9941 16.495C19.9853 18.4846 18.4698 19.9883 16.4752 19.9958C14.3166 20.004 12.1579 19.9977 9.99929 19.9977ZM15.5834 14.1858C16.3528 14.1848 16.9794 13.5537 16.9761 12.783C16.9727 12.0222 16.3505 11.3995 15.5898 11.3958C14.8187 11.3921 14.1877 12.0177 14.1863 12.7875C14.1849 13.5576 14.8135 14.1868 15.5834 14.1858Z" fill="currentColor" />
            </svg>
          </div>
          <p className="text-secondaryLight group-hover/max:text-primary mt-0.5">
            {`${formatAndRoundBigNumber(selectedToken?.balance || ZERO, selectedToken?.decimals || 18)}`}
          </p>
        </div>
        {getTokenUrl && (
          <button
            className="w-40 h-9 flex items-center justify-center py-2 px-6 text-base text-primary font-medium border border-warmGray rounded-lg cursor-pointer hover:bg-primary hover:text-white transition-all leading-none"
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
