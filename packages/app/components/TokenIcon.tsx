import { ChainId } from "@popcorn/utils";
import { useContractMetadata } from "@popcorn/app/hooks/useContractMetadata";

interface TokenIconProps {
  token: string;
  fullsize?: boolean;
  imageSize?: string;
  chainId: ChainId;
}

export default function TokenIcon({
  token: address,
  fullsize = false,
  imageSize,
  chainId,
}: TokenIconProps): JSX.Element {
  const metadata = useContractMetadata(address, chainId);
  if (metadata?.icons?.length > 1) {
    return (
      <div className="flex flex-row flex-shrink-0 flex-grow-0">
        <img src={metadata?.icons[0]} alt="token icon" className={imageSize ? imageSize : "w-6 md:w-10 h-6 md:h-10"} />
        <img
          src={metadata?.icons[1]}
          alt="token icon"
          className={`${imageSize ? imageSize : "w-6 md:w-10 h-6 md:h-10"} -ml-3`}
        />
      </div>
    );
  }
  if (metadata?.icons?.length === 1) {
    return (
      <img src={metadata?.icons[0]} alt="token icon" className={imageSize ? imageSize : "w-6 md:w-10 h-6 md:h-10"} />
    );
  }
  // Per default show POP icon
  return (
    <img src={"/images/icons/POP.svg"} alt="token icon" className={imageSize ? imageSize : "w-6 md:w-10 h-6 md:h-10"} />
  );
}
