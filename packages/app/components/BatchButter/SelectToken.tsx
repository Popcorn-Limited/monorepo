import { ChevronDownIcon } from "@heroicons/react/outline";
import { ChainId } from "@popcorn/utils";
import { Token } from "@popcorn/utils/types";
import PopUpModal from "@popcorn/components/components/Modal/PopUpModal";
import SingleActionModal from "@popcorn/components/components/Modal/SingleActionModal";
import TokenIcon from "@popcorn/app/components/TokenIcon";
import Image from "next/image";
import { useState } from "react";
import { SearchToken } from "@popcorn/app/components/BatchButter/SearchToken";

export interface SelectTokenProps {
  allowSelection: boolean;
  options: Token[];
  selectedToken: Token;
  selectToken?: (token: Token) => void;
  chainId: ChainId;
}

export default function SelectToken({
  allowSelection,
  options,
  selectedToken,
  selectToken,
  chainId,
}: SelectTokenProps): JSX.Element {
  const [showSelectTokenModal, setShowSelectTokenModal] = useState(false);
  const [showPopUp, setShowPopUp] = useState<boolean>(false);

  const openPopUp = () => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    if (mediaQuery.matches) {
      setShowSelectTokenModal(true);
    } else {
      setShowPopUp(true);
    }
  };

  return (
    <>
      <div className="relative w-auto justify-end">
        <span
          className={`flex flex-row items-center justify-end ${allowSelection ? "cursor-pointer group" : ""}`}
          onClick={() => {
            allowSelection && openPopUp();
          }}
        >
          <div className="md:mr-2 relative">
            <TokenIcon token={selectedToken?.address} imageSize="w-5 h-5" chainId={chainId} />
          </div>
          <p className="font-medium text-lg leading-none hidden md:block text-black group-hover:text-primary">
            {selectedToken?.symbol}
          </p>

          {allowSelection && (
            <>
              <ChevronDownIcon
                className={`w-6 h-6 ml-2 text-secondaryLight group-hover:text-primary transform transition-all ease-in-out duration-200 ${
                  showPopUp || showSelectTokenModal ? " rotate-180" : ""
                }`}
              />
            </>
          )}
        </span>
      </div>
      <SingleActionModal
        image={<Image src="/images/blackCircle.svg" width={88} height={88} alt="default token icon" />}
        visible={showSelectTokenModal}
        title="Select a token"
        keepOpen={false}
        content={
          <div className="mt-8">
            <SearchToken
              chainId={chainId}
              options={options}
              selectToken={(token) => {
                selectToken(token);
                setShowSelectTokenModal(false);
              }}
              selectedToken={selectedToken}
            />
          </div>
        }
        onDismiss={{
          onClick: () => {
            setShowSelectTokenModal(false);
          },
        }}
      />
      <div className="fixed z-100 left-0">
        <PopUpModal
          visible={showPopUp}
          onClosePopUpModal={() => {
            setShowPopUp(false);
          }}
        >
          <p className="text-base text-black font-normal mb-2">Select a token</p>
          <SearchToken
            chainId={chainId}
            options={options}
            selectToken={(token) => {
              selectToken(token);
              setShowSelectTokenModal(false);
            }}
            selectedToken={selectedToken}
          />
        </PopUpModal>
      </div>
    </>
  );
}
