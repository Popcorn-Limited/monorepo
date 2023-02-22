import InputTokenWithError from "@popcorn/components/components/InputTokenWithError";
import { Metadata } from "@popcorn/components/lib/Contract";
import { constants } from "ethers";

type AssetInputProps = {
  onMaxClick;
  chainId;
  value;
  onChange;
  assetAddress;
  assetBalance;
  errorMessage;
  captionText?: string;
};

const ZERO = constants.Zero;
function AssetInput({
  captionText,
  onMaxClick,
  errorMessage,
  chainId,
  value,
  onChange,
  assetAddress,
  assetBalance,
}: AssetInputProps) {
  return (
    <Metadata address={assetAddress} chainId={chainId}>
      {(metadata) => {
        return (
          <InputTokenWithError
            captionText={captionText}
            onSelectToken={() => {}}
            onMaxClick={onMaxClick}
            chainId={chainId}
            value={value}
            onChange={onChange}
            selectedToken={
              {
                ...metadata,
                address: assetAddress,
                balance: assetBalance || ZERO,
              } as any
            }
            errorMessage={errorMessage}
            tokenList={
              [] // Working with vault asset only for now
            }
          />
        );
      }}
    </Metadata>
  );
}

export default AssetInput;
