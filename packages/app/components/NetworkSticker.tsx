import { FC } from "react";
import Image from "next/image";
import { ChainId, networkLogos } from "@popcorn/utils";
import { useChainIdFromUrl } from "@popcorn/app/hooks/useChainIdFromUrl";

interface NetworkStickerProps {
  selectedChainId?: ChainId;
}

export const NetworkSticker: FC<NetworkStickerProps> = ({ selectedChainId }) => {
  const chainId = useChainIdFromUrl();
  return (
    <div className="absolute top-0 -left-2 md:-left-4">
      <div className="hidden md:block">
        <Image
          src={networkLogos[selectedChainId ?? chainId]}
          alt={ChainId[selectedChainId ?? chainId]}
          height="24"
          width="24"
        />
      </div>
      <div className="md:hidden">
        <Image
          src={networkLogos[selectedChainId ?? chainId]}
          alt={ChainId[selectedChainId ?? chainId]}
          height="12"
          width="12"
        />
      </div>
    </div>
  );
};
